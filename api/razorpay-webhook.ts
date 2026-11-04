import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  buildInternationalOrderClaimPath,
  buildInternationalOrderLeasePath,
  createShopifyInternationalOrder,
  findShopifyInternationalOrder,
  getInternationalConfig,
  isInternationalConfigReady,
  jsonResponse,
  supabaseRequest,
} from './_shared/international-server.mjs';

function signaturesMatch(rawBody: string, signature: string, secret: string) {
  if (!signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(signature, 'utf8');
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

interface RazorpayEvent {
  event?: string;
  payload?: {
    payment_link?: { entity?: { id?: string; reference_id?: string; currency?: string; amount?: number } };
    payment?: { entity?: { id?: string } };
  };
}

function paymentLinkEntity(event: RazorpayEvent) {
  return event?.payload?.payment_link?.entity || null;
}

async function handler(request: Request) {
  if (request.method !== 'POST') return new Response('Method not allowed.', { status: 405, headers: { Allow: 'POST' } });
  const config = getInternationalConfig();
  if (!isInternationalConfigReady(config, { requireWebhook: true, requireShopify: true })) {
    return new Response('Webhook is not configured.', { status: 503 });
  }

  const rawBody = await request.text();
  if (rawBody.length > 1_000_000) return new Response('Payload too large.', { status: 413 });
  if (!signaturesMatch(rawBody, request.headers.get('x-razorpay-signature') || '', config.webhookSecret)) {
    return new Response('Invalid signature.', { status: 401 });
  }

  let event: RazorpayEvent;
  try { event = JSON.parse(rawBody); } catch { return new Response('Invalid JSON.', { status: 400 }); }
  if (event?.event !== 'payment_link.paid') return new Response('Ignored.', { status: 200 });

  const paymentLink = paymentLinkEntity(event);
  const referenceId = typeof paymentLink?.reference_id === 'string' ? paymentLink.reference_id : '';
  const paymentLinkId = typeof paymentLink?.id === 'string' ? paymentLink.id : '';
  if (!referenceId || !/^bb-[a-z0-9-]{4,40}$/i.test(referenceId) || !paymentLinkId) {
    return new Response('Missing payment reference.', { status: 400 });
  }

  const now = new Date();
  const leaseUntil = new Date(now.getTime() + 3 * 60 * 1000).toISOString();
  try {
    const records = await supabaseRequest(config, `international_orders?reference_id=eq.${encodeURIComponent(referenceId)}&limit=1`);
    const order = Array.isArray(records) ? records[0] : null;
    if (!order) return new Response('Order not found.', { status: 404 });
    if (order.razorpay_payment_link_id && order.razorpay_payment_link_id !== paymentLinkId) return new Response('Payment link mismatch.', { status: 409 });
    if (paymentLink.currency !== 'USD' || Number(paymentLink.amount) !== Number(order.amount_minor)) return new Response('Payment amount mismatch.', { status: 409 });
    if (order.status === 'shopify_synced' && order.shopify_order_id) return new Response('Already synced.', { status: 200 });

    // This conditional update is the single-writer claim. Concurrent webhook
    // deliveries cannot both create a Shopify order for the same reference.
    const claimed = await supabaseRequest(config, buildInternationalOrderClaimPath(referenceId, now.toISOString()), {
      method: 'PATCH',
      body: { status: 'syncing', sync_lease_until: leaseUntil, last_error: null },
      headers: { Prefer: 'return=representation' },
    });
    if (!Array.isArray(claimed) || claimed.length !== 1) {
      const latestRecords = await supabaseRequest(config, `international_orders?reference_id=eq.${encodeURIComponent(referenceId)}&limit=1`);
      const latest = Array.isArray(latestRecords) ? latestRecords[0] : null;
      if (latest?.status === 'shopify_synced' && latest.shopify_order_id) return new Response('Already synced.', { status: 200 });
      // Keep a retry in Razorpay's queue in case the active worker dies.
      return new Response('Order sync is already in progress; retry later.', { status: 503 });
    }

    const paymentId = event?.payload?.payment?.entity?.id || null;
    // If Shopify accepted a prior attempt but Supabase did not record it, find
    // that order by sourceIdentifier and repair the link instead of duplicating it.
    const existingShopifyOrder = await findShopifyInternationalOrder(config, referenceId);
    if (existingShopifyOrder && existingShopifyOrder.displayFinancialStatus !== 'PAID') {
      throw new Error('The existing Shopify order is not marked paid; manual reconciliation is required.');
    }
    const shopifyOrder = existingShopifyOrder || await createShopifyInternationalOrder(config, {
      ...order,
      reference_id: referenceId,
      razorpay_payment_link_id: paymentLinkId,
      razorpay_payment_id: paymentId,
    });

    const synced = await supabaseRequest(config, buildInternationalOrderLeasePath(referenceId, leaseUntil), {
      method: 'PATCH',
      body: {
        status: 'shopify_synced',
        razorpay_payment_link_id: paymentLinkId,
        razorpay_payment_id: paymentId,
        shopify_order_id: shopifyOrder.id,
        paid_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        sync_lease_until: null,
        last_error: null,
      },
      headers: { Prefer: 'return=representation' },
    });
    if (!Array.isArray(synced) || synced.length !== 1) {
      return new Response('Order sync lease expired; retrying reconciliation.', { status: 503 });
    }
    return jsonResponse(request, { received: true, shopifyOrderId: shopifyOrder.id });
  } catch (error) {
    await supabaseRequest(config, buildInternationalOrderLeasePath(referenceId, leaseUntil), {
      method: 'PATCH',
      body: {
        status: 'sync_failed',
        sync_lease_until: null,
        last_error: error instanceof Error ? error.message : 'Shopify sync failed.',
      },
      headers: { Prefer: 'return=minimal' },
    }).catch(() => undefined);
    // 503 makes Razorpay retry after a transient Shopify/Supabase failure.
    return new Response('Order sync is pending retry.', { status: 503 });
  }
}

export default { fetch: handler };
