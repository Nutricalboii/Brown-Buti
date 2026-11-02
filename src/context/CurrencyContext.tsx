import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INTERNATIONAL_PRICE_USD, currencyForCountry, normalizeCountryCode, type StoreCurrency } from '../../shared/market-display.mjs';

export type Currency = StoreCurrency;

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  countryCode: string | null;
  formatPrice: (inrAmount: number, itemCount?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [savedCurrency] = useState<Currency | null>(() => {
    try {
      const saved = localStorage.getItem('currency');
      return saved === 'INR' || saved === 'USD' ? saved : null;
    } catch {
      return null;
    }
  });
  const [currency, setCurrencyState] = useState<Currency>(savedCurrency ?? 'INR');
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const hasManualCurrency = useRef(savedCurrency !== null);

  useEffect(() => {
    let active = true;

    fetch('/api/market', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Market lookup unavailable');
        return response.json() as Promise<{ countryCode?: unknown }>;
      })
      .then((market) => {
        if (!active) return;
        const detectedCountry = normalizeCountryCode(market.countryCode);
        setCountryCode(detectedCountry);
        if (!hasManualCurrency.current) {
          const detectedCurrency = currencyForCountry(detectedCountry);
          if (detectedCurrency) setCurrencyState(detectedCurrency);
        }
      })
      .catch(() => {
        // Keep the INR store-default display when IP detection is unavailable.
      });

    return () => { active = false; };
  }, [savedCurrency]);

  const handleSetCurrency = (c: Currency) => {
    hasManualCurrency.current = true;
    setCurrencyState(c);
    try {
      localStorage.setItem('currency', c);
    } catch {
      // Currency selection still applies for the current session.
    }
  };

  const formatPrice = (inrAmount: number, itemCount = 1) => {
    if (currency === 'USD') {
      const safeItemCount = Number.isInteger(itemCount) && itemCount > 0 ? itemCount : 1;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(INTERNATIONAL_PRICE_USD * safeItemCount);
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(inrAmount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, countryCode, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}
