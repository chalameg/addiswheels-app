"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getETBtoUSDRate } from '@/utils/exchangeRate';

interface ExchangeRateContextType {
  exchangeRate: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      setError(null);
      const rate = await getETBtoUSDRate();
      setExchangeRate(rate);
    } catch (err) {
      setError('Failed to fetch exchange rate');
      console.error('Error in ExchangeRateProvider:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchExchangeRate();
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ exchangeRate, loading, error, refetch }}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  const context = useContext(ExchangeRateContext);
  if (context === undefined) {
    throw new Error('useExchangeRate must be used within an ExchangeRateProvider');
  }
  return context;
} 