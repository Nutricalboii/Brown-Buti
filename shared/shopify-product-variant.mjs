export const shopifySizeVariantIds = {
  chandi: {
    XS: '67365796544761',
    S: '67365796577529',
    M: '67365796610297',
    L: '67365796643065',
    XL: '67365796675833',
    XXL: '67365796708601',
  },
  tamara: {
    XS: '67365833998585',
    S: '67365834031353',
    M: '67365834064121',
    L: '67365834096889',
    XL: '67365834129657',
    XXL: '67365834162425',
  },
};

export function resolveShopifyVariantId(product, size) {
  if (product?.shopifyVariantIds) {
    const variantId = typeof size === 'string' ? product.shopifyVariantIds[size] : undefined;
    if (variantId) return variantId;
    throw new Error(`Choose a size with an active Shopify variant for ${product.name || 'this product'} before checkout.`);
  }

  if (product?.sizes?.length > 1) {
    throw new Error(`Size-specific Shopify variants are not configured for ${product.name || 'this product'} yet. Please contact us before ordering.`);
  }

  return product?.shopifyVariantId || product?.id;
}
