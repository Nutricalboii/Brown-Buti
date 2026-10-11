import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createOrderHandler, verifyPaymentHandler } from './razorpay.js';
import createOrderApi from '../api/create-order.js';
import verifyPaymentApi from '../api/verify-payment.js';
import { enforceRateLimit } from '../supabase/functions/_shared/rate-limit.mjs';

const secret = 'test-only-throwaway-secret';
const env = {
  RAZORPAY_KEY_ID: 'rzp_test_key_id',
  RAZORPAY_KEY_SECRET: secret,
  RAZORPAY_CHECKOUT_ENABLED: 'true',
};
let nextClient = 0;
const requestCounts = new Map();

async function testRateLimiter(request, { scope, limit }) {
  const key = `${scope}:${request.headers.get('x-forwarded-for')}`;
  const count = (requestCounts.get(key) || 0) + 1;
  requestCounts.set(key, count);
  return { configured: true, success: count <= limit, reset: Date.now() + 60_000 };
}

function testOptions(overrides = {}) {
  return { env, rateLimiter: testRateLimiter, ...overrides };
}

function makeRequest(path, body, ip = `198.51.100.${++nextClient}`) {
  return new Request(`https://store.example${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://store.example',
      'X-Forwarded-For': ip,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function fakeClient({ order, payment, onCreate } = {}) {
  return {
    orders: {
      create: async (payload) => {
        onCreate?.(payload);
        return { id: 'order_test_123456', amount: payload.amount, currency: payload.currency };
      },
      fetch: async () => order || {
        id: 'order_test_123456', amount: 260000, currency: 'INR', status: 'paid',
      },
    },
    payments: {
      fetch: async () => payment || {
        id: 'pay_test_123456', order_id: 'order_test_123456', amount: 260000,
        currency: 'INR', status: 'captured', captured: true,
      },
    },
  };
}

function paymentBody(overrides = {}) {
  const razorpay_order_id = 'order_test_123456';
  const razorpay_payment_id = 'pay_test_123456';
  const razorpay_signature = createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  return { razorpay_order_id, razorpay_payment_id, razorpay_signature, ...overrides };
}

test('create-order ignores no client pricing and computes prices from the server catalog', async () => {
  let capturedOrder;
  const response = await createOrderHandler(
    makeRequest('/api/create-order', { items: [{ productId: 'chandi', quantity: 1 }] }),
    testOptions({ createRazorpay: () => fakeClient({ onCreate: (payload) => { capturedOrder = payload; } }) }),
  );

  assert.equal(response.status, 200);
  assert.equal(capturedOrder.amount, 260000); // ₹2,100 blouse plus ₹500 shipping, in paise.
  assert.equal(capturedOrder.currency, 'INR');
  assert.match(capturedOrder.receipt, /^mnm_[0-9a-f-]{36}$/i);
  assert.equal(JSON.parse(capturedOrder.notes.items)[0].unitPrice, 2100);
});

test('create-order rejects client-supplied amount or currency', async () => {
  const response = await createOrderHandler(
    makeRequest('/api/create-order', { amount: 100, currency: 'INR', items: [{ productId: 7, quantity: 1 }] }),
    testOptions({ createRazorpay: () => assert.fail('provider must not be called for tampered input') }),
  );
  assert.equal(response.status, 400);
});

test('create-order enforces product and quantity allowlists', async () => {
  for (const item of [{ productId: 'unknown', quantity: 1 }, { productId: 'chandi', quantity: 0 }]) {
    const response = await createOrderHandler(
      makeRequest('/api/create-order', { items: [item] }),
      testOptions({ createRazorpay: () => assert.fail('provider must not be called for invalid cart') }),
    );
    assert.equal(response.status, 400);
  }
});

test('create-order stays disabled until order fulfillment is explicitly configured', async () => {
  const response = await createOrderHandler(
    makeRequest('/api/create-order', { items: [{ productId: 7, quantity: 1 }] }),
    testOptions({ env: { ...env, RAZORPAY_CHECKOUT_ENABLED: 'false' }, createRazorpay: () => assert.fail('provider must not be called') }),
  );
  assert.equal(response.status, 503);
});

test('verify-payment requires a valid signature and a captured matching provider payment', async () => {
  const response = await verifyPaymentHandler(
    makeRequest('/api/verify-payment', paymentBody()),
    testOptions({ createRazorpay: () => fakeClient() }),
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.amount, 260000);
  assert.equal(body.currency, 'INR');
});

test('verify-payment rejects an invalid signature without contacting Razorpay', async () => {
  const response = await verifyPaymentHandler(
    makeRequest('/api/verify-payment', paymentBody({ razorpay_signature: '0'.repeat(64) })),
    testOptions({ createRazorpay: () => ({ orders: { fetch: () => assert.fail() }, payments: { fetch: () => assert.fail() } }) }),
  );
  assert.equal(response.status, 400);
});

test('verify-payment rejects a payment with a different order or uncaptured status', async () => {
  for (const payment of [
    { id: 'pay_test_123456', order_id: 'order_other_123456', amount: 260000, currency: 'INR', status: 'captured' },
    { id: 'pay_test_123456', order_id: 'order_test_123456', amount: 260000, currency: 'INR', status: 'authorized' },
    { id: 'pay_test_123456', order_id: 'order_test_123456', amount: 260000, currency: 'INR', status: 'refunded', captured: true },
    { id: 'pay_test_123456', order_id: 'order_test_123456', amount: 260000, currency: 'INR', status: 'captured', captured: true, amount_refunded: 50000 },
  ]) {
    const response = await verifyPaymentHandler(
      makeRequest('/api/verify-payment', paymentBody()),
      testOptions({ createRazorpay: () => fakeClient({ payment }) }),
    );
    assert.equal(response.status, 400);
  }
});

test('payment endpoints reject cross-origin requests and oversized bodies', async () => {
  const crossOrigin = new Request('https://store.example/api/create-order', {
    method: 'POST',
    headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ productId: 7, quantity: 1 }] }),
  });
  assert.equal((await createOrderHandler(crossOrigin, testOptions())).status, 403);

  const oversized = await createOrderHandler(
    makeRequest('/api/create-order', `{"items":[],"padding":"${'x'.repeat(17 * 1024)}"}`),
    testOptions(),
  );
  assert.equal(oversized.status, 413);
});

test('create-order requires JSON and rate limits repeated requests', async () => {
  const wrongContentType = new Request('https://store.example/api/create-order', {
    method: 'POST',
    headers: { Origin: 'https://store.example', 'X-Forwarded-For': '203.0.113.41' },
    body: '{}',
  });
  assert.equal((await createOrderHandler(wrongContentType, testOptions())).status, 415);

  const ip = '203.0.113.42';
  const disabledEnv = { ...env, RAZORPAY_CHECKOUT_ENABLED: 'false' };
  for (let i = 0; i < 20; i += 1) {
    const response = await createOrderHandler(
      makeRequest('/api/create-order', { items: [{ productId: 7, quantity: 1 }] }, ip),
      testOptions({ env: disabledEnv }),
    );
    assert.equal(response.status, 503);
  }
  const limited = await createOrderHandler(
    makeRequest('/api/create-order', { items: [{ productId: 7, quantity: 1 }] }, ip),
    testOptions({ env: disabledEnv }),
  );
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
});

test('payment endpoints reject unsupported methods', async () => {
  const request = new Request('https://store.example/api/create-order', { method: 'GET' });
  assert.equal((await createOrderHandler(request, testOptions())).status, 405);
});

test('payment endpoints fail closed if shared rate limiting is missing or unavailable', async () => {
  const request = makeRequest('/api/create-order', { items: [{ productId: 'chandi', quantity: 1 }] });
  const unconfigured = await createOrderHandler(request, { env });
  assert.equal(unconfigured.status, 503);
  const verifyUnconfigured = await verifyPaymentHandler(
    makeRequest('/api/verify-payment', paymentBody()),
    { env },
  );
  assert.equal(verifyUnconfigured.status, 503);

  const unavailable = await createOrderHandler(request, testOptions({
    rateLimiter: async () => { throw new Error('test-only failure'); },
  }));
  assert.equal(unavailable.status, 503);
});

test('shared rate limiter reports missing configuration without making a network request', async () => {
  const result = await enforceRateLimit(makeRequest('/api/create-order', {}), {
    prefix: 'mnm:test',
    limit: 1,
  });
  assert.equal(result.configured, false);
  assert.equal(result.success, false);
});

test('shared rate limiter rejects non-Upstash URLs and sends only keyed IP identifiers', async () => {
  const request = makeRequest('/api/create-order', {}, '203.0.113.81');
  const invalidUrl = await enforceRateLimit(request, {
    url: 'https://attacker.example',
    token: 'test-only-token',
    prefix: 'mnm:test',
    limit: 3,
  });
  assert.equal(invalidUrl.error, true);

  let identifier;
  class TestRedis {
    constructor(config) { this.config = config; }
  }
  class TestRatelimit {
    static slidingWindow(limit, window) { return { limit, window }; }
    constructor(config) { this.config = config; }
    async limit(value) {
      identifier = value;
      return { success: true, reset: Date.now() + 60_000 };
    }
  }
  const valid = await enforceRateLimit(request, {
    url: 'https://mnm-test.upstash.io',
    token: 'test-only-token',
    prefix: 'mnm:test-hmac',
    limit: 3,
    RedisClient: TestRedis,
    RatelimitClient: TestRatelimit,
  });
  assert.equal(valid.success, true);
  assert.match(identifier, /^ip:[a-f0-9]{64}$/);
  assert.equal(identifier.includes('203.0.113.81'), false);
});

test('deployed API entrypoints expose the shared payment handlers', async () => {
  const createResponse = await createOrderApi.fetch(
    new Request('https://store.example/api/create-order', { method: 'GET' }),
  );
  const verifyResponse = await verifyPaymentApi.fetch(
    new Request('https://store.example/api/verify-payment', { method: 'GET' }),
  );
  assert.equal(createResponse.status, 405);
  assert.equal(verifyResponse.status, 405);
});
