import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  createShopifyInternationalOrder,
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
  if (!referenceId || !/^bb-[a-z0-9-]{4,40}$/i.test(referenceId)) return new Response('Missing reference.', { status: 400 });

  try {
    const records = await supabaseRequest(config, `international_orders?reference_id=eq.${encodeURIComponent(referenceId)}&limit=1`);
    const order = Array.isArray(records) ? records[0] : null;
    if (!order) return new Response('Order not found.', { status: 404 });
    if (order.status === 'shopify_synced' && order.shopify_order_id) return new Response('Already synced.', { status: 200 });
    if (order.razorpay_payment_link_id && order.razorpay_payment_link_id !== paymentLink.id) return new Response('Payment link mismatch.', { status: 409 });
    if (paymentLink.currency !== 'USD' || Number(paymentLink.amount) !== Number(order.amount_minor)) return new Response('Payment amount mismatch.', { status: 409 });

    const paymentId = event?.payload?.payment?.entity?.id || null;
    const shopifyOrder = await createShopifyInternationalOrder(config, {
      ...order,
      razorpay_payment_link_id: paymentLink.id,
      razorpay_payment_id: paymentId,
    });

    await supabaseRequest(config, `international_orders?reference_id=eq.${encodeURIComponent(referenceId)}`, {
      method: 'PATCH',
      body: {
        status: 'shopify_synced',
        razorpay_payment_link_id: paymentLink.id,
        razorpay_payment_id: paymentId,
        shopify_order_id: shopifyOrder.id,
        paid_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        last_error: null,
      },
      headers: { Prefer: 'return=minimal' },
    });
    return jsonResponse(request, { received: true, shopifyOrderId: shopifyOrder.id });
  } catch (error) {
    await supabaseRequest(config, `international_orders?reference_id=eq.${encodeURIComponent(referenceId)}`, {
      method: 'PATCH',
      body: { status: 'sync_failed', last_error: error instanceof Error ? error.message : 'Shopify sync failed.' },
      headers: { Prefer: 'return=minimal' },
    }).catch(() => undefined);
    // 503 makes Razorpay retry after a transient Shopify/Supabase failure.
    return new Response('Order sync is pending retry.', { status: 503 });
  }
}

export default { fetch: handler };
