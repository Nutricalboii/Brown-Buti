/** @typedef {'INR' | 'USD'} StoreCurrency */

export const INTERNATIONAL_PRICE_USD = 200;
export const INTERNATIONAL_PRICE_INR = 19_024;

/** @param {unknown} value @returns {string | null} */
export function normalizeCountryCode(value) {
  if (typeof value !== 'string') return null;
  const countryCode = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(countryCode) ? countryCode : null;
}

/** India stays in INR; every other detected country uses the international USD display. @param {string | null} countryCode @returns {StoreCurrency | null} */
export function currencyForCountry(countryCode) {
  if (!countryCode) return null;
  if (countryCode === 'IN') return 'INR';
  return 'USD';
}

/** Convert an INR amount using a reference rate expressed as INR per USD. @param {number} amountInr @param {number} inrPerUsd @returns {number | null} */
export function convertInrToUsd(amountInr, inrPerUsd) {
  if (!Number.isFinite(amountInr) || amountInr < 0 || !Number.isFinite(inrPerUsd) || inrPerUsd <= 0) return null;
  return amountInr / inrPerUsd;
}

/** @param {string | null} countryCode @param {number} subtotalInr */
export function getShippingDisplay(countryCode, subtotalInr) {
  if (countryCode === 'IN') {
    if (subtotalInr >= 3_000) {
      return {
        amount: 'FREE',
        detail: 'For India delivery addresses, shipping is free above ₹2,999 and ₹99 on orders of ₹2,999 or less. This estimate uses your detected country; selecting another destination at Shopify checkout changes the available rate.',
      };
    }

    return {
      amount: '₹99',
      detail: 'For India delivery addresses, shipping is ₹99 per order and complimentary above ₹2,999. This estimate uses your detected country; selecting another destination at Shopify checkout changes the available rate.',
    };
  }

  if (countryCode) {
    return {
      amount: 'At checkout',
      detail: 'International shipping options and charges are shown at Shopify checkout for the selected delivery country. Customs duties, import taxes, or other destination charges may also apply.',
    };
  }

  return {
    amount: 'At checkout',
    detail: 'Shipping options and the final charge are confirmed at Shopify checkout from the delivery address.',
  };
}
