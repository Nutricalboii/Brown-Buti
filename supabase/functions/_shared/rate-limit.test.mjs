import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceRateLimit } from './rate-limit.mjs';

function makeClients(identifiers) {
  class RedisClient {
    constructor() {}
  }

  class RatelimitClient {
    constructor() {}
    static slidingWindow() { return {}; }
    async limit(identifier) {
      identifiers.push(identifier);
      return { success: true, reset: Date.now() + 60_000 };
    }
  }

  return { RedisClient, RatelimitClient };
}

function config(clients) {
  return {
    url: 'https://brown-buti.upstash.io',
    token: 'unit-test-token',
    prefix: 'brown-buti:test',
    limit: 3,
    trustedIpHeaders: ['cf-connecting-ip'],
    ...clients,
  };
}

test('rate limit identifiers are keyed hashes, not raw client addresses', async () => {
  const identifiers = [];
  const clients = makeClients(identifiers);
  const result = await enforceRateLimit(
    new Request('https://edge.example/submit', { headers: { 'cf-connecting-ip': '203.0.113.7' } }),
    config(clients),
  );

  assert.equal(result.success, true);
  assert.match(identifiers[0], /^ip:[a-f0-9]{64}$/);
  assert.doesNotMatch(identifiers[0], /203\.0\.113\.7/);
});

test('fails closed instead of grouping requests when no trusted client IP is available', async () => {
  const identifiers = [];
  const clients = makeClients(identifiers);
  const result = await enforceRateLimit(
    new Request('https://edge.example/submit'),
    config(clients),
  );

  assert.deepEqual(result, { configured: true, success: false, error: true });
  assert.equal(identifiers.length, 0);
});
