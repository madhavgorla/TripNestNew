import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyRate } from '../types';
import { api } from '../services/api';

interface CurrencyContextType {
  currentCurrency: string;
  currencyRates: Record<string, CurrencyRate>;
  setCurrency: (code: string) => void;
  formatPrice: (amountInUSD: number, targetCurrency?: string) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
  getSymbol: (code?: string) => string;
  rateNotice: string;
}

const DEFAULT_RATES: Record<string, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateAgainstUSD: 83.45 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rateAgainstUSD: 3.67 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateAgainstUSD: 154.2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateAgainstUSD: 1.52 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateAgainstUSD: 1.36 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateAgainstUSD: 1.34 },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    return localStorage.getItem('tripnest_currency') || 'USD';
  });
  const [currencyRates, setCurrencyRates] = useState<Record<string, CurrencyRate>>(DEFAULT_RATES);

  useEffect(() => {
    api.getCurrencyRates()
      .then((res) => {
        if (res.success && res.data) {
          setCurrencyRates(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (code: string) => {
    if (currencyRates[code]) {
      setCurrentCurrency(code);
      localStorage.setItem('tripnest_currency', code);
    }
  };

  const getSymbol = (code?: string) => {
    const cur = code ? currencyRates[code] : currencyRates[currentCurrency];
    return cur ? cur.symbol : '$';
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    const fromRate = currencyRates[fromCurrency]?.rateAgainstUSD || 1.0;
    const toRate = currencyRates[toCurrency]?.rateAgainstUSD || 1.0;
    // convert fromCurrency to USD then to toCurrency
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  };

  const formatPrice = (amount: number, currencyCode?: string): string => {
    const targetCode = currencyCode || currentCurrency;
    const symbol = getSymbol(targetCode);
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: targetCode === 'JPY' ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(amount);
    return `${symbol}${formatted}`;
  };

  const currentRate = currencyRates[currentCurrency]?.rateAgainstUSD || 1.0;
  const rateNotice = currentCurrency === 'USD' 
    ? 'Base Currency: 1 USD'
    : `1 USD ≈ ${currencyRates[currentCurrency]?.symbol}${currentRate.toFixed(2)} ${currentCurrency}`;

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencyRates,
        setCurrency,
        formatPrice,
        convertAmount,
        getSymbol,
        rateNotice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
