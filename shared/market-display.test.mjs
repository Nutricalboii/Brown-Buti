import test from 'node:test';
import assert from 'node:assert/strict';
import { convertInrToUsd, currencyForCountry, getShippingDisplay, normalizeCountryCode } from './market-display.mjs';

test('normalizes only two-letter country codes', () => {
  assert.equal(normalizeCountryCode(' us '), 'US');
  assert.equal(normalizeCountryCode('IN'), 'IN');
  assert.equal(normalizeCountryCode('USA'), null);
  assert.equal(normalizeCountryCode(null), null);
});

test('uses INR for India and USD for every other detected country', () => {
  assert.equal(currencyForCountry('IN'), 'INR');
  assert.equal(currencyForCountry('US'), 'USD');
  assert.equal(currencyForCountry('GB'), 'USD');
  assert.equal(currencyForCountry('JP'), 'USD');
  assert.equal(currencyForCountry('DE'), 'USD');
  assert.equal(currencyForCountry(null), null);
});

test('converts every INR price from the supplied daily USD/INR rate', () => {
  assert.equal(convertInrToUsd(9_500, 95.12), 9_500 / 95.12);
  assert.equal(convertInrToUsd(2_100, 95.12), 2_100 / 95.12);
  assert.equal(convertInrToUsd(9_500, 0), null);
  assert.equal(convertInrToUsd(Number.NaN, 95.12), null);
});

test('shows the India ₹99 rate below the free-shipping threshold', () => {
  assert.equal(getShippingDisplay('IN', 2_999).amount, '₹99');
  assert.match(getShippingDisplay('IN', 2_999).detail, /selecting another destination at Shopify checkout changes the available rate/i);
});

test('shows free shipping at ₹3,000 and above and explains why', () => {
  const shipping = getShippingDisplay('IN', 9_500);
  assert.equal(shipping.amount, 'FREE');
  assert.match(shipping.detail, /above ₹2,999/);
  assert.equal(getShippingDisplay('IN', 3_000).amount, 'FREE');
});

test('defers international and unknown shipping amounts to Shopify checkout', () => {
  assert.equal(getShippingDisplay('US', 9_500).amount, 'At checkout');
  assert.match(getShippingDisplay('US', 9_500).detail, /selected delivery country/);
  assert.equal(getShippingDisplay(null, 9_500).amount, 'At checkout');
});
