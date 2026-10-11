import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (inrAmount: number, usdAmount?: number) => string;
  usdRate: number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// Approx conversion rate for now (1 USD = 83 INR)
const USD_RATE = 83;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('INR');

  useEffect(() => {
    // Check saved preference first
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('currency');
    } catch {
      // Continue with timezone-based defaults when storage is unavailable.
    }
    if (saved === 'INR' || saved === 'USD') {
      setCurrency(saved);
      return;
    }

    // Auto-detect based on timezone (Asia/Kolkata or Indian timezones -> INR, foreign -> USD)
    try {
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      const isIndia = tz.includes('kolkata') || tz.includes('calcutta') || new Date().getTimezoneOffset() === -330;
      if (!isIndia) {
        setCurrency('USD');
      } else {
        setCurrency('INR');
      }
    } catch {
      setCurrency('INR');
    }
  }, []);

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
    try {
      localStorage.setItem('currency', c);
    } catch {
      // Currency selection still applies for the current session.
    }
  };

  const formatPrice = (inrAmount: number, usdAmount?: number) => {
    if (currency === 'USD') {
      let finalUsd: number;
      if (typeof usdAmount === 'number') {
        finalUsd = usdAmount;
      } else if (inrAmount === 9500) {
        // Standard saree single price is $200 in USD
        finalUsd = 200;
      } else if (inrAmount > 0 && inrAmount % 9500 === 0) {
        // Multiples of saree (e.g. quantity * 9500)
        finalUsd = (inrAmount / 9500) * 200;
      } else if (inrAmount === 3500) {
        // Underskirt single price is $50 in USD
        finalUsd = 50;
      } else if (inrAmount > 0 && inrAmount % 3500 === 0) {
        finalUsd = (inrAmount / 3500) * 50;
      } else {
        finalUsd = Math.round(inrAmount / USD_RATE);
      }

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(finalUsd);
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(inrAmount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, usdRate: USD_RATE }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}
