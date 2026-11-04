import {
  calculateInternationalTotal,
  parseShippingRates,
  normalizeInternationalCountry,
} from '../../shared/international-checkout.mjs';

export const SHOPIFY_ADMIN_API_VERSION = '2026-10';
export const DEFAULT_SHOPIFY_DOMAIN = '1fieuf-bz.myshopify.com';
export const DEFAULT_PUBLIC_SITE_URL = 'https://brown-buti.vercel.app';

const ALLOWED_ORIGINS = new Set([
  'https://brown-buti.vercel.app',
  'https://brown-buti-preview.vercel.app',
  'https://mochamogra.com',
  'https://www.mochamogra.com',
  'http://localhost:5173',
]);

export function isAllowedOrigin(request) {
  const origin = request.headers.get('origin');
  return !origin || ALLOWED_ORIGINS.has(origin);
}

export function jsonResponse(request, body, status = 200) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export function optionsResponse(request) {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: {
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '600',
    },
  });
}

export function getInternationalConfig(env = process.env) {
  const mode = env.RAZORPAY_MODE === 'live' ? 'live' : 'test';
  const razorpayKeyId = env.RAZORPAY_KEY_ID?.trim() || '';
  const razorpayKeySecret = env.RAZORPAY_KEY_SECRET?.trim() || '';
  const shippingRates = parseShippingRates(env.INTERNATIONAL_SHIPPING_RATES_USD);
  const expectedPrefix = mode === 'live' ? 'rzp_live_' : 'rzp_test_';
  const enabled = env.RAZORPAY_INTERNATIONAL_ENABLED === 'true';

  return {
    mode,
    enabled,
    razorpayKeyId,
    razorpayKeySecret,
    shippingRates,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET?.trim() || '',
    supabaseUrl: env.SUPABASE_URL?.trim().replace(/\/$/, '') || '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '',
    shopifyDomain: env.SHOPIFY_ADMIN_STORE_DOMAIN?.trim() || DEFAULT_SHOPIFY_DOMAIN,
    shopifyAdminAccessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim() || '',
    publicSiteUrl: env.PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || DEFAULT_PUBLIC_SITE_URL,
    keyModeValid: razorpayKeyId.startsWith(expectedPrefix),
    persistenceConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

export function isInternationalConfigReady(config, { requireWebhook = false, requireShopify = false } = {}) {
  return config.enabled &&
    config.keyModeValid &&
    Boolean(config.razorpayKeySecret) &&
    Boolean(config.shippingRates) &&
    config.persistenceConfigured &&
    (!requireWebhook || Boolean(config.webhookSecret)) &&
    (!requireShopify || Boolean(config.shopifyAdminAccessToken));
}

export function validateCheckoutAddress(input) {
  const value = input && typeof input === 'object' ? input : {};
  const countryCode = normalizeInternationalCountry(value.countryCode);
  const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : '';
  const fullName = typeof value.name === 'string' ? value.name.trim().replace(/\s+/g, ' ') : '';
  const address1 = typeof value.address1 === 'string' ? value.address1.trim() : '';
  const address2 = typeof value.address2 === 'string' ? value.address2.trim() : '';
  const city = typeof value.city === 'string' ? value.city.trim() : '';
  const provinceCode = typeof value.provinceCode === 'string' ? value.provinceCode.trim().slice(0, 40) : '';
  const postalCode = typeof value.postalCode === 'string' ? value.postalCode.trim() : '';
  const phone = typeof value.phone === 'string' ? value.phone.trim() : '';

  if (!countryCode || countryCode === 'IN') throw new Error('International checkout requires a non-India delivery country.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  if (fullName.length < 2 || fullName.length > 120) throw new Error('Enter the recipient name.');
  if (address1.length < 3 || address1.length > 200) throw new Error('Enter the delivery address.');
  if (city.length < 2 || city.length > 100) throw new Error('Enter the delivery city.');
  if (postalCode.length < 2 || postalCode.length > 20) throw new Error('Enter the postal or ZIP code.');
  if (phone.length > 40) throw new Error('Enter a valid phone number.');

  const [firstName, ...lastNameParts] = fullName.split(' ');
  const lastName = lastNameParts.join(' ') || firstName;
  return {
    countryCode,
    email,
    name: fullName,
    firstName,
    lastName,
    address1,
    ...(address2 ? { address2 } : {}),
    city,
    ...(provinceCode ? { provinceCode } : {}),
    postalCode,
    ...(phone ? { phone } : {}),
  };
}

export function calculateRequest(body, config) {
  const shippingAddress = validateCheckoutAddress(body?.shippingAddress);
  const calculation = calculateInternationalTotal(body?.items, shippingAddress.countryCode, config.shippingRates);
  return { shippingAddress, calculation };
}

export async function supabaseRequest(config, path, { method = 'GET', body, headers = {} } = {}) {
  if (!config.persistenceConfigured) throw new Error('Order storage is not configured.');
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const text = await response.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  if (!response.ok) throw new Error(`Order storage request failed (${response.status}).`);
  return parsed;
}

export async function createRazorpayPaymentLink(config, { referenceId, shippingAddress, calculation }) {
  const auth = Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: calculation.amountMinor,
      currency: 'USD',
      accept_partial: false,
      reference_id: referenceId,
      description: `Brown Buti international order ${referenceId}`,
      customer: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        ...(shippingAddress.phone ? { contact: shippingAddress.phone } : {}),
      },
      notify: { sms: false, email: true },
      reminder_enable: false,
      callback_url: `${config.publicSiteUrl}/international-payment/complete`,
      callback_method: 'get',
      notes: {
        checkout_reference: referenceId,
        destination_country: shippingAddress.countryCode,
      },
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.short_url || !data?.id) {
    throw new Error('Razorpay could not create the secure international payment link.');
  }
  return data;
}

export function shopifyAdminUrl(config) {
  const domain = config.shopifyDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  if (!/^[a-z0-9.-]+$/i.test(domain)) throw new Error('Shopify Admin store domain is invalid.');
  return `https://${domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`;
}

export async function createShopifyInternationalOrder(config, order) {
  const query = `mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      userErrors { field message }
      order { id name displayFinancialStatus }
    }
  }`;
  const money = (amount) => ({
    shopMoney: { amount: amount.toFixed(2), currencyCode: 'USD' },
    presentmentMoney: { amount: amount.toFixed(2), currencyCode: 'USD' },
  });
  const address = order.shipping_address;
  const orderInput = {
    currency: 'USD',
    presentmentCurrency: 'USD',
    email: order.email,
    ...(address.phone ? { phone: address.phone } : {}),
    customer: { toUpsert: { email: order.email, firstName: address.firstName, lastName: address.lastName } },
    shippingAddress: {
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      ...(address.address2 ? { address2: address.address2 } : {}),
      city: address.city,
      ...(address.provinceCode ? { provinceCode: address.provinceCode } : {}),
      countryCode: address.countryCode,
      zip: address.postalCode,
      ...(address.phone ? { phone: address.phone } : {}),
    },
    billingAddress: {
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      ...(address.address2 ? { address2: address.address2 } : {}),
      city: address.city,
      ...(address.provinceCode ? { provinceCode: address.provinceCode } : {}),
      countryCode: address.countryCode,
      zip: address.postalCode,
    },
    lineItems: order.items.map((item) => ({
      variantId: `gid://shopify/ProductVariant/${item.variantId}`,
      quantity: item.quantity,
      title: item.name,
      ...(item.size ? { variantTitle: item.size } : {}),
      priceSet: money(item.unitPriceUsd),
      requiresShipping: true,
    })),
    shippingLines: [{
      title: `International shipping (${address.countryCode})`,
      code: 'international',
      source: 'Brown Buti international checkout',
      priceSet: money(order.shipping_usd),
    }],
    financialStatus: 'PAID',
    transactions: [{
      kind: 'SALE',
      status: 'SUCCESS',
      gateway: 'Razorpay',
      amountSet: money(order.total_usd),
      test: config.mode !== 'live',
      receiptJson: JSON.stringify({
        paymentLinkId: order.razorpay_payment_link_id,
        paymentId: order.razorpay_payment_id,
        referenceId: order.reference_id,
      }),
    }],
    tags: ['international-usd', 'razorpay', config.mode === 'live' ? 'live' : 'test'],
    note: `Paid through Razorpay USD Payment Link. Reference: ${order.reference_id}.`,
    sourceName: 'brown-buti-international',
    sourceIdentifier: order.reference_id,
    test: config.mode !== 'live',
  };

  const response = await fetch(shopifyAdminUrl(config), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.shopifyAdminAccessToken,
    },
    body: JSON.stringify({ query, variables: { order: orderInput } }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json().catch(() => null);
  const payload = data?.data?.orderCreate;
  const userError = payload?.userErrors?.[0]?.message;
  if (!response.ok || data?.errors?.length || userError || !payload?.order?.id) {
    throw new Error(userError || 'Shopify could not create the paid international order.');
  }
  return payload.order;
}
