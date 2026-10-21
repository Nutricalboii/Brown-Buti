import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveShopifyVariantId, shopifySizeVariantIds } from './shopify-product-variant.mjs';

const chandi = {
  name: 'Chandi — Silver',
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shopifyVariantIds: shopifySizeVariantIds.chandi,
};

const tamara = {
  name: 'Tamara — Copper',
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shopifyVariantIds: shopifySizeVariantIds.tamara,
};

test('uses the exact Shopify variant for every Chandi and Tamara size', () => {
  for (const [product, expectedIds] of [
    [chandi, ['67365796544761', '67365796577529', '67365796610297', '67365796643065', '67365796675833', '67365796708601']],
    [tamara, ['67365833998585', '67365834031353', '67365834064121', '67365834096889', '67365834129657', '67365834162425']],
  ]) {
    product.sizes.forEach((size, index) => {
      assert.equal(resolveShopifyVariantId(product, size), expectedIds[index]);
    });
  }
});

test('requires a valid selected size when product-specific variants exist', () => {
  assert.throws(() => resolveShopifyVariantId(chandi), /Choose a size/);
  assert.throws(() => resolveShopifyVariantId(chandi, '3XL'), /Choose a size/);
});

test('blocks checkout for multi-size products without Shopify size variants', () => {
  assert.throws(
    () => resolveShopifyVariantId({ name: 'Chandini', sizes: ['S', 'M', 'L'], shopifyVariantId: '1234567890' }, 'M'),
    /not configured/,
  );
});

test('preserves the existing one-size product variant behavior', () => {
  assert.equal(resolveShopifyVariantId({ id: 7, sizes: ['One Size'], shopifyVariantId: '48988074541305' }, 'One Size'), '48988074541305');
});
