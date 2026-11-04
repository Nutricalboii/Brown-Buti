import { shopifySizeVariantIds } from './shopify-product-variant.mjs';

export const INTERNATIONAL_PRICE_USD = 200;
export const MAX_INTERNATIONAL_QUANTITY = 20;

// This is the server-side catalogue used to validate checkout requests. Prices
// are never accepted from the browser. Keep the variant IDs in sync with the
// Shopify catalogue when a product variant changes.
export const INTERNATIONAL_PRODUCT_CATALOG = Object.freeze({
  '1': { name: 'JALPARIÉ', variantId: '48991392628985' },
  '2': { name: 'ROSÉ MOGRA', variantId: '48991405605113' },
  '3': { name: 'RIWAAYAT', variantId: '48996869701881' },
  '4': { name: 'SUNDOWNER SILK', variantId: '48996873732345' },
  '5': { name: 'RUBY DOE', variantId: '48991348293881' },
  '6': { name: 'BUTTER MOGRA', variantId: '48991334367481' },
  '7': { name: 'SAPPHIRE MOGRA', variantId: '48988074541305' },
  '8': { name: 'CHANDINI', variants: shopifySizeVariantIds.chandini },
  'pistachio': { name: 'PISTACHIO', variantId: '67365851070713' },
  'strawberry-latte': { name: 'STRAWBERRY LATTE', variantId: '67365889736953' },
  'chandi': { name: 'CHANDI — SILVER', variants: shopifySizeVariantIds.chandi },
  'tamara': { name: 'TAMARA — COPPER', variants: shopifySizeVariantIds.tamara },
});

const COUNTRY_CODE = /^[A-Z]{2}$/;

export function normalizeInternationalCountry(value) {
  if (typeof value !== 'string') return null;
  const countryCode = value.trim().toUpperCase();
  return COUNTRY_CODE.test(countryCode) ? countryCode : null;
}

export function parseShippingRates(rawValue) {
  if (typeof rawValue !== 'string' || rawValue.trim() === '') return null;
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const rates = {};
    for (const [key, value] of Object.entries(parsed)) {
      const country = key.toUpperCase();
      if (country !== 'DEFAULT' && !COUNTRY_CODE.test(country)) return null;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10_000) return null;
      rates[country] = Math.round(value * 100) / 100;
    }
    return typeof rates.DEFAULT === 'number' ? rates : null;
  } catch {
    return null;
  }
}

export function getShippingRateUsd(countryCode, rates) {
  const normalized = normalizeInternationalCountry(countryCode);
  if (!normalized || normalized === 'IN' || !rates) return null;
  return rates[normalized] ?? rates.DEFAULT;
}

export function resolveInternationalItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new Error('Your cart is empty or contains too many line items.');
  }

  let quantityTotal = 0;
  const resolved = items.map((item) => {
    const productId = typeof item?.productId === 'string' || typeof item?.productId === 'number'
      ? String(item.productId)
      : '';
    const product = INTERNATIONAL_PRODUCT_CATALOG[productId];
    const quantity = Number(item?.quantity);
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error('One or more cart items are not available for international checkout.');
    }

    let variantId = product.variantId;
    let size;
    if (product.variants) {
      size = typeof item?.size === 'string' ? item.size : '';
      variantId = product.variants[size];
      if (!variantId) throw new Error(`Choose an available size for ${product.name}.`);
    }

    quantityTotal += quantity;
    if (quantityTotal > MAX_INTERNATIONAL_QUANTITY) {
      throw new Error(`International checkout is limited to ${MAX_INTERNATIONAL_QUANTITY} garments per order.`);
    }

    return {
      productId,
      name: product.name,
      size: size || null,
      variantId,
      quantity,
      unitPriceUsd: INTERNATIONAL_PRICE_USD,
    };
  });

  return {
    items: resolved,
    itemCount: quantityTotal,
    merchandiseUsd: INTERNATIONAL_PRICE_USD * quantityTotal,
  };
}

export function calculateInternationalTotal(items, countryCode, rates) {
  const normalizedCountry = normalizeInternationalCountry(countryCode);
  if (!normalizedCountry || normalizedCountry === 'IN') {
    throw new Error('International checkout requires a non-India delivery country.');
  }
  const resolved = resolveInternationalItems(items);
  const shippingUsd = getShippingRateUsd(normalizedCountry, rates);
  if (shippingUsd === null) throw new Error('International shipping is not configured for this destination yet.');
  return {
    ...resolved,
    countryCode: normalizedCountry,
    shippingUsd,
    totalUsd: resolved.merchandiseUsd + shippingUsd,
    amountMinor: Math.round((resolved.merchandiseUsd + shippingUsd) * 100),
  };
}

export function makeReferenceId(now = Date.now(), randomPart = Math.random().toString(36).slice(2, 8)) {
  return `bb-${now.toString(36)}-${randomPart}`.slice(0, 40);
}
