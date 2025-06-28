import { useState, useEffect } from 'react';
import { getETBtoUSDRate } from '@/utils/exchangeRate';

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        setLoading(true);
        setError(null);
        const rate = await getETBtoUSDRate();
        setExchangeRate(rate);
      } catch (err) {
        setError('Failed to fetch exchange rate');
        console.error('Error in useExchangeRate:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchExchangeRate();
  }, []);

  return { exchangeRate, loading, error };
} 