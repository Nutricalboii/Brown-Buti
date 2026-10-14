import assert from 'node:assert/strict';
import test from 'node:test';
import { createShopifyCartPermalink } from './shopify-cart-permalink.mjs';

test('builds a Shopify-hosted cart permalink from product variants', () => {
  const checkout = createShopifyCartPermalink('1fieuf-bz.myshopify.com', [
    { variantId: '48988074541305', quantity: 1 },
    { variantId: 'gid://shopify/ProductVariant/48991334367481', quantity: 2 },
  ]);

  assert.equal(
    checkout,
    'https://1fieuf-bz.myshopify.com/cart/48988074541305:1,48991334367481:2',
  );
});

test('rejects empty carts, invalid variants, and invalid quantities', () => {
  assert.throws(() => createShopifyCartPermalink('1fieuf-bz.myshopify.com', []), /cart is empty/);
  assert.throws(() => createShopifyCartPermalink('1fieuf-bz.myshopify.com', [{ variantId: 'abc', quantity: 1 }]), /not configured/);
  assert.throws(() => createShopifyCartPermalink('1fieuf-bz.myshopify.com', [{ variantId: '48988074541305', quantity: 0 }]), /not configured/);
});

test('refuses to create a checkout link on a non-Shopify domain', () => {
  assert.throws(
    () => createShopifyCartPermalink('attacker.example', [{ variantId: '48988074541305', quantity: 1 }]),
    /unavailable/,
  );
});
