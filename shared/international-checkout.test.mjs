import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInternationalTotal,
  parseShippingRates,
  resolveInternationalItems,
} from './international-checkout.mjs';

const rates = parseShippingRates('{"US":35,"GB":40,"DEFAULT":50}');

test('calculates fixed USD merchandise plus destination shipping', () => {
  const result = calculateInternationalTotal(
    [{ productId: 7, quantity: 2 }],
    'US',
    rates,
  );
  assert.equal(result.merchandiseUsd, 400);
  assert.equal(result.shippingUsd, 35);
  assert.equal(result.totalUsd, 435);
  assert.equal(result.amountMinor, 43500);
  assert.equal(result.items[0].variantId, '48988074541305');
});

test('uses DEFAULT for a supported country without a dedicated rate', () => {
  const result = calculateInternationalTotal([{ productId: 'chandi', size: 'M', quantity: 1 }], 'JP', rates);
  assert.equal(result.shippingUsd, 50);
  assert.equal(result.items[0].variantId, '67365796610297');
});

test('rejects India so it stays on the Shopify INR checkout', () => {
  assert.throws(
    () => calculateInternationalTotal([{ productId: 7, quantity: 1 }], 'IN', rates),
    /non-India delivery country/,
  );
});

test('rejects client-supplied or unknown products', () => {
  assert.throws(() => resolveInternationalItems([{ productId: 'unknown', quantity: 1 }]), /not available/);
  assert.throws(() => resolveInternationalItems([{ productId: 7, quantity: 0 }]), /not available/);
});

test('requires a safe DEFAULT shipping rate', () => {
  assert.equal(parseShippingRates('{"US":35}'), null);
  assert.equal(parseShippingRates('{"DEFAULT":-1}'), null);
});
