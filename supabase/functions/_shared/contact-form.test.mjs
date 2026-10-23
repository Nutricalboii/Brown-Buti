import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactFormHandler } from './contact-form.mjs';

const origin = 'https://brown-buti.example';
const validSubmission = {
  name: 'Asha Sharma',
  email: 'asha@example.com',
  subject: 'Product Enquiry',
  message: 'I would like to know more about this saree.',
};

function request(body = validSubmission, options = {}) {
  return new Request('https://edge.example/contact-form', {
    method: options.method || 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.method === 'OPTIONS' ? undefined : JSON.stringify(body),
  });
}

function setup(overrides = {}) {
  const sent = [];
  const handler = createContactFormHandler({
    allowedOrigins: new Set([origin]),
    configured: true,
    rateLimit: async () => ({ configured: true, success: true }),
    sendEmail: async (message) => sent.push(message),
    ...overrides,
  });
  return { handler, sent };
}

test('sends a valid message and uses the customer email only as reply-to', async () => {
  const { handler, sent } = setup();
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].replyTo, validSubmission.email);
});

test('escapes user content before composing HTML email', async () => {
  const { handler, sent } = setup();
  await handler(request({ ...validSubmission, message: '<script>alert(1)</script> enough text' }));
  assert.match(sent[0].html, /&lt;script&gt;/);
  assert.doesNotMatch(sent[0].html, /<script>/);
});

test('rejects unapproved origins and invalid form input', async () => {
  const { handler, sent } = setup();
  const badOrigin = await handler(new Request('https://edge.example/contact-form', {
    method: 'POST',
    headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
    body: JSON.stringify(validSubmission),
  }));
  const badInput = await handler(request({ ...validSubmission, subject: 'Injected subject' }));
  assert.equal(badOrigin.status, 403);
  assert.equal(badInput.status, 400);
  assert.equal(sent.length, 0);
});

test('does not implicitly allow localhost origins in production', async () => {
  const { handler, sent } = setup();
  const response = await handler(new Request('https://edge.example/contact-form', {
    method: 'POST',
    headers: { Origin: 'http://localhost:5173', 'Content-Type': 'application/json' },
    body: JSON.stringify(validSubmission),
  }));
  assert.equal(response.status, 403);
  assert.equal(sent.length, 0);
});

test('honeypot is accepted without email delivery or rate-limit use', async () => {
  let rateLimitCalls = 0;
  const { handler, sent } = setup({
    rateLimit: async () => { rateLimitCalls += 1; return { configured: true, success: true }; },
  });
  const response = await handler(request({ ...validSubmission, website: 'bot-filled' }));
  assert.equal(response.status, 200);
  assert.equal(rateLimitCalls, 0);
  assert.equal(sent.length, 0);
});

test('fails closed when provider configuration is missing or rate limit is unavailable', async () => {
  const missingConfig = setup({ configured: false });
  const unavailableLimit = setup({ rateLimit: async () => ({ configured: false, success: false }) });
  assert.equal((await missingConfig.handler(request())).status, 503);
  assert.equal((await unavailableLimit.handler(request())).status, 503);
});

test('supports preflight and rejects unsupported methods', async () => {
  const { handler } = setup();
  const preflight = await handler(request(undefined, { method: 'OPTIONS' }));
  const get = await handler(new Request('https://edge.example/contact-form', { headers: { Origin: origin } }));
  assert.equal(preflight.status, 204);
  assert.equal(get.status, 405);
});
