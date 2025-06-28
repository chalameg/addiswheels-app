import React from 'react';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertETBtoUSD, formatUSD, formatETB } from '@/utils/exchangeRate';

interface PriceDisplayProps {
  etbPrice: number;
  showUSD?: boolean;
  showETB?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function PriceDisplay({ 
  etbPrice, 
  showUSD = true, 
  showETB = true, 
  className = "",
  size = 'medium'
}: PriceDisplayProps) {
  const { exchangeRate, loading, error } = useExchangeRate();

  const sizeClasses = {
    small: {
      etb: 'text-sm font-medium',
      usd: 'text-xs'
    },
    medium: {
      etb: 'text-base font-semibold',
      usd: 'text-sm'
    },
    large: {
      etb: 'text-2xl font-bold',
      usd: 'text-base'
    }
  };

  // Always show ETB price immediately
  const etbDisplay = (
    <div className={`${sizeClasses[size].etb} text-gray-900`}>
      {formatETB(etbPrice)}
    </div>
  );

  // Show USD conversion only when exchange rate is available and not loading
  const usdDisplay = showUSD && exchangeRate && !loading && !error ? (
    <div className={`${sizeClasses[size].usd} text-gray-500`}>
      {formatUSD(convertETBtoUSD(etbPrice, exchangeRate))}
    </div>
  ) : null;

  return (
    <div className={`${className}`}>
      {showETB && etbDisplay}
      {usdDisplay}
    </div>
  );
} 