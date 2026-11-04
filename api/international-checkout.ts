import {
  createRazorpayPaymentLink,
  calculateRequest,
  getInternationalConfig,
  isAllowedOrigin,
  isInternationalConfigReady,
  jsonResponse,
  optionsResponse,
  supabaseRequest,
} from './_shared/international-server.mjs';
import { makeReferenceId } from '../shared/international-checkout.mjs';

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return optionsResponse(request);
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Method not allowed.' }, 405);
  if (!isAllowedOrigin(request)) return jsonResponse(request, { error: 'Origin not allowed.' }, 403);

  const config = getInternationalConfig();
  if (!isInternationalConfigReady(config)) {
    return jsonResponse(request, {
      error: 'International USD checkout is not enabled yet. Shopify INR checkout remains available.',
      code: 'INTERNATIONAL_CHECKOUT_NOT_CONFIGURED',
    }, 503);
  }

  try {
    const bodyText = await request.text();
    if (bodyText.length > 100_000) return jsonResponse(request, { error: 'Checkout request is too large.' }, 413);
    const body = JSON.parse(bodyText);
    const { shippingAddress, calculation } = calculateRequest(body, config);
    const referenceId = makeReferenceId();

    const pendingOrder = {
      reference_id: referenceId,
      status: 'payment_link_created',
      currency: 'USD',
      amount_minor: calculation.amountMinor,
      total_usd: calculation.totalUsd,
      shipping_usd: calculation.shippingUsd,
      country_code: shippingAddress.countryCode,
      email: shippingAddress.email,
      items: calculation.items,
      shipping_address: shippingAddress,
      created_at: new Date().toISOString(),
    };

    await supabaseRequest(config, 'international_orders', {
      method: 'POST',
      body: pendingOrder,
      headers: { Prefer: 'return=minimal' },
    });

    try {
      const paymentLink = await createRazorpayPaymentLink(config, { referenceId, shippingAddress, calculation });
      await supabaseRequest(config, `international_orders?reference_id=eq.${encodeURIComponent(referenceId)}`, {
        method: 'PATCH',
        body: {
          razorpay_payment_link_id: paymentLink.id,
          payment_url: paymentLink.short_url,
        },
        headers: { Prefer: 'return=minimal' },
      });

      return jsonResponse(request, {
        paymentUrl: paymentLink.short_url,
        referenceId,
        currency: 'USD',
        amount: calculation.totalUsd,
        shipping: calculation.shippingUsd,
        mode: config.mode,
      });
    } catch (error) {
      await supabaseRequest(config, `international_orders?reference_id=eq.${encodeURIComponent(referenceId)}`, {
        method: 'PATCH',
        body: { status: 'payment_link_failed', last_error: error instanceof Error ? error.message : 'Payment link failed.' },
        headers: { Prefer: 'return=minimal' },
      }).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'International checkout could not be started.';
    return jsonResponse(request, { error: message }, 400);
  }
}
