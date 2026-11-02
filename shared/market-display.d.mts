export type StoreCurrency = 'INR' | 'USD';

export const INTERNATIONAL_PRICE_USD: 200;
export const INTERNATIONAL_PRICE_INR: 19024;

export interface ShippingDisplay {
  amount: string;
  detail: string;
}

export function normalizeCountryCode(value: unknown): string | null;
export function currencyForCountry(countryCode: string | null): StoreCurrency | null;
export function convertInrToUsd(amountInr: number, inrPerUsd: number): number | null;
export function getShippingDisplay(countryCode: string | null, subtotalInr: number): ShippingDisplay;
