import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildInternationalOrderClaimPath,
  buildInternationalOrderLeasePath,
  findShopifyInternationalOrder,
  getInternationalConfig,
  isAllowedOrigin,
} from '../api/_shared/international-server.mjs';

const referenceId = 'bb-mock1234-a1b2c3';

test('webhook claim filter only claims new, failed, or expired sync attempts', () => {
  const now = '2026-11-04T06:00:00.000Z';
  const path = buildInternationalOrderClaimPath(referenceId, now);
  const params = new URLSearchParams(path.split('?')[1]);

  assert.equal(params.get('reference_id'), `eq.${referenceId}`);
  assert.equal(params.get('select'), 'reference_id');
  assert.equal(
    params.get('or'),
    `(status.in.(payment_link_created,sync_failed),and(status.eq.syncing,sync_lease_until.lt.${now}))`,
  );
});

test('webhook completion update is scoped to the current unexpired lease', () => {
  const leaseUntil = '2026-11-04T06:03:00.000Z';
  const path = buildInternationalOrderLeasePath(referenceId, leaseUntil);
  const params = new URLSearchParams(path.split('?')[1]);

  assert.equal(params.get('reference_id'), `eq.${referenceId}`);
  assert.equal(params.get('status'), 'eq.syncing');
  assert.equal(params.get('sync_lease_until'), `eq.${leaseUntil}`);
});

test('Vercel preview allows only its exact deployment and branch origins', () => {
  const branchHost = 'brown-buti-git-codex-setup.vercel.app';
  const branchRequest = new Request(`https://${branchHost}/api/international-checkout`, {
    headers: { origin: `https://${branchHost}` },
  });
  const otherPreviewRequest = new Request('https://unrelated-project.vercel.app/api/international-checkout', {
    headers: { origin: 'https://unrelated-project.vercel.app' },
  });

  assert.equal(isAllowedOrigin(branchRequest, { VERCEL_BRANCH_URL: branchHost }), true);
  assert.equal(isAllowedOrigin(otherPreviewRequest, { VERCEL_BRANCH_URL: branchHost }), false);
});

test('Vercel preview payment callbacks return to that preview, not production', () => {
  const branchHost = 'brown-buti-git-codex-setup.vercel.app';
  const config = getInternationalConfig({ VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: branchHost });

  assert.equal(config.publicSiteUrl, `https://${branchHost}`);
});

test('Shopify order recovery searches by the unique third-party source identifier', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({
      data: {
        orders: {
          edges: [{ node: {
            id: 'gid://shopify/Order/123',
            name: '#1001',
            displayFinancialStatus: 'PAID',
            sourceIdentifier: referenceId,
          } }],
        },
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  try {
    const result = await findShopifyInternationalOrder({
      shopifyDomain: 'example.myshopify.com',
      shopifyAdminAccessToken: 'test-token',
    }, referenceId);

    assert.equal(result.id, 'gid://shopify/Order/123');
    assert.equal(requestBody.variables.search, `source_identifier:${referenceId}`);
    assert.match(requestBody.query, /orders\(first: 2, query: \$search\)/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Shopify recovery rejects ambiguous references and invalid identifiers', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    data: {
      orders: {
        edges: [1, 2].map((id) => ({ node: {
          id: `gid://shopify/Order/${id}`,
          displayFinancialStatus: 'PAID',
          sourceIdentifier: referenceId,
        } })),
      },
    },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  try {
    await assert.rejects(
      findShopifyInternationalOrder({ shopifyDomain: 'example.myshopify.com', shopifyAdminAccessToken: 'test' }, referenceId),
      /Multiple Shopify orders/,
    );
    await assert.rejects(
      findShopifyInternationalOrder({ shopifyDomain: 'example.myshopify.com', shopifyAdminAccessToken: 'test' }, 'bad-reference'),
      /reference is invalid/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
