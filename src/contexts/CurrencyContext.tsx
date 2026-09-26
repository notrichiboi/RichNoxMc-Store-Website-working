'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrencies } from '../lib/firestore/content';
import type { Currency } from '@/lib/types';
import { DEFAULT_CURRENCIES } from '../lib/utils';

interface CurrencyContextType {
  currencies: Currency[];
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  loading: boolean;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(DEFAULT_CURRENCIES[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const fetched = await getCurrencies();
        if (fetched.length > 0) {
          setCurrencies(fetched);
        }
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    try {
      const storedCode = localStorage.getItem('nightmaremc_currency');
      if (storedCode && currencies.length > 0) {
        const match = currencies.find(c => c.code === storedCode);
        if (match) {
          setSelectedCurrencyState(match);
        } else {
          setSelectedCurrencyState(currencies[0] || DEFAULT_CURRENCIES[0]);
        }
      } else if (currencies.length > 0) {
        setSelectedCurrencyState(currencies[0] || DEFAULT_CURRENCIES[0]);
      }
    } catch {}
  }, [currencies]);

  const setSelectedCurrency = (currency: Currency) => {
    if (!currency) return;
    setSelectedCurrencyState(currency);
    try {
      localStorage.setItem('nightmaremc_currency', currency.code);
    } catch {}
  };

  const safeCurrencies = currencies.length > 0 ? currencies : DEFAULT_CURRENCIES;
  const safeSelectedCurrency = selectedCurrency || safeCurrencies[0] || DEFAULT_CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{ currencies: safeCurrencies, selectedCurrency: safeSelectedCurrency, setSelectedCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

const FALLBACK_CURRENCY: CurrencyContextType = {
  currencies: DEFAULT_CURRENCIES,
  selectedCurrency: DEFAULT_CURRENCIES[0],
  setSelectedCurrency: () => {},
  loading: false,
};

export function useCurrencyContext() {
  return useContext(CurrencyContext) ?? FALLBACK_CURRENCY;
}
