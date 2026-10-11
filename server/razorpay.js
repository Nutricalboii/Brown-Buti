import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';
import { PRODUCT_PRICES_INR } from '../shared/product-prices.mjs';
import { enforceRateLimit } from '../supabase/functions/_shared/rate-limit.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const MAX_LINE_ITEMS = 40;
const MAX_QUANTITY = 99;
const RATE_LIMIT_MAX = 20;

function json(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

async function readJson(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
    throw Object.assign(new Error('Content-Type must be application/json'), { status: 415 });
  }
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw Object.assign(new Error('Request too large'), { status: 413 });
  }

  if (!request.body) throw Object.assign(new Error('Invalid request body'), { status: 400 });
  const reader = request.body.getReader();
  const chunks = [];
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > MAX_BODY_BYTES) {
      await reader.cancel();
      throw Object.assign(new Error('Request too large'), { status: 413 });
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let body;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw Object.assign(new Error('Invalid request body'), { status: 400 });
  }
  return body;
}

async function requestGuard(request, { env, scope, rateLimiter } = {}) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return json(403, { error: 'Cross-origin request denied.' });
      }
    } catch {
      return json(403, { error: 'Invalid request origin.' });
    }
  }

  let result;
  try {
    result = rateLimiter
      ? await rateLimiter(request, { scope, limit: RATE_LIMIT_MAX, window: '1 m' })
      : await enforceRateLimit(request, {
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
        prefix: `mnm:${scope}`,
        limit: RATE_LIMIT_MAX,
        window: '1 m',
        trustedIpHeaders: ['x-forwarded-for', 'x-real-ip'],
      });
  } catch {
    result = { configured: true, success: false, error: true };
  }

  if (!result?.configured || result.error) {
    return json(503, { error: 'Payment security checks are temporarily unavailable.' });
  }
  if (!result.success) {
    const retryAfter = Number.isFinite(result.reset)
      ? Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
      : 60;
    return json(429, { error: 'Too many payment requests. Please wait and try again.' }, {
      'Retry-After': String(retryAfter),
    });
  }

  return null;
}

function getRazorpay(env, createRazorpay) {
  const key_id = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID;
  const key_secret = env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return createRazorpay({ key_id, key_secret });
}

function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINE_ITEMS) {
    return { error: 'Your cart could not be validated. Please refresh and try again.' };
  }

  let subtotal = 0;
  let totalQuantity = 0;
  const verifiedItems = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      return { error: 'Your cart contains an invalid item.' };
    }
    const productId = String(item.productId ?? '');
    const unitPrice = PRODUCT_PRICES_INR[productId];
    const quantity = item.quantity;
    if (typeof unitPrice !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { error: 'Your cart contains an invalid item or quantity.' };
    }
    subtotal += unitPrice * quantity;
    totalQuantity += quantity;
    verifiedItems.push({ productId, quantity, unitPrice });
    if (!Number.isSafeInteger(subtotal) || totalQuantity > MAX_QUANTITY) {
      return { error: 'Your cart exceeds the order limit.' };
    }
  }

  const shipping = subtotal >= 5000 ? 0 : 500;
  return { amount: (subtotal + shipping) * 100, verifiedItems };
}

export async function createOrderHandler(request, options = {}) {
  if (request.method !== 'POST') return json(405, { error: 'Method Not Allowed' });
  const env = options.env || process.env;
  const denied = await requestGuard(request, {
    env,
    scope: 'payment:create-order',
    rateLimiter: options.rateLimiter,
  });
  if (denied) return denied;

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    const status = error.status || 400;
    return json(status, { error: status === 413 || status === 415 ? error.message : 'Invalid request body.' });
  }

  // Amount, currency, and receipt are intentionally server-owned.
  if (Object.keys(body).some((key) => key !== 'items')) {
    return json(400, { error: 'Only cart items may be submitted.' });
  }
  const cart = priceCart(body.items);
  if (cart.error) return json(400, { error: cart.error });

  if (env.RAZORPAY_CHECKOUT_ENABLED !== 'true') {
    return json(503, { error: 'Razorpay checkout is disabled until order fulfillment is configured.' });
  }
  const createRazorpay = options.createRazorpay || ((credentials) => new Razorpay(credentials));
  const razorpay = getRazorpay(env, createRazorpay);
  if (!razorpay) return json(503, { error: 'Razorpay checkout is temporarily unavailable.' });

  try {
    const order = await razorpay.orders.create({
      amount: cart.amount,
      currency: 'INR',
      receipt: `mnm_${randomUUID()}`,
      notes: { items: JSON.stringify(cart.verifiedItems) },
    });

    if (order.amount !== cart.amount || order.currency !== 'INR' || typeof order.id !== 'string') {
      return json(502, { error: 'Payment provider returned an invalid order.' });
    }
    return json(200, { order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Razorpay order creation failed:', error?.error?.code || 'provider_error');
    return json(502, { error: 'Unable to create a payment order. Please try again.' });
  }
}

export async function verifyPaymentHandler(request, options = {}) {
  if (request.method !== 'POST') return json(405, { error: 'Method Not Allowed' });
  const env = options.env || process.env;
  const denied = await requestGuard(request, {
    env,
    scope: 'payment:verify-payment',
    rateLimiter: options.rateLimiter,
  });
  if (denied) return denied;

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    const status = error.status || 400;
    return json(status, { error: status === 413 || status === 415 ? error.message : 'Invalid request body.' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (
    typeof razorpay_order_id !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(razorpay_order_id) ||
    typeof razorpay_payment_id !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(razorpay_payment_id) ||
    typeof razorpay_signature !== 'string' || !/^[a-f0-9]{64}$/i.test(razorpay_signature)
  ) {
    return json(400, { success: false, error: 'Invalid payment verification details.' });
  }

  const createRazorpay = options.createRazorpay || ((credentials) => new Razorpay(credentials));
  const razorpay = getRazorpay(env, createRazorpay);
  if (!razorpay) return json(503, { success: false, error: 'Payment verification is temporarily unavailable.' });

  const expectedSignature = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();
  const suppliedSignature = Buffer.from(razorpay_signature, 'hex');
  if (expectedSignature.length !== suppliedSignature.length || !timingSafeEqual(expectedSignature, suppliedSignature)) {
    return json(400, { success: false, error: 'Payment could not be verified.' });
  }

  try {
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);
    const paymentIsCaptured = payment.status === 'captured' && payment.captured === true && Number(payment.amount_refunded || 0) === 0;
    const amountsMatch = Number.isSafeInteger(order.amount) && order.amount > 0 && payment.amount === order.amount;
    const paymentMatchesOrder = order.id === razorpay_order_id && payment.id === razorpay_payment_id && payment.order_id === order.id;

    if (
      !paymentIsCaptured || !amountsMatch || !paymentMatchesOrder ||
      order.currency !== 'INR' || payment.currency !== 'INR'
    ) {
      return json(400, { success: false, error: 'Payment is not captured for this order.' });
    }

    return json(200, {
      success: true,
      message: 'Payment verified successfully.',
      order_id: order.id,
      payment_id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error('Razorpay payment lookup failed:', error?.error?.code || 'provider_error');
    return json(502, { success: false, error: 'Unable to verify payment right now.' });
  }
}
