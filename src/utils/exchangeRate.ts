interface ExchangeRateResponse {
  usdCurrentBlackPrice: number;
  dailyPercentage: number;
  openingPrice: number;
  closingPrice: number;
  range: {
    max: string;
    min: string;
  };
  allLastprice: {
    USD: number;
    EUR: number;
    CHF: number;
    [key: string]: number;
  };
}

let cachedRate: number | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getETBtoUSDRate(): Promise<number> {
  const now = Date.now();
  
  // Return cached rate if it's still valid
  if (cachedRate && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRate;
  }

  try {
    const response = await fetch('https://www.ethioblackmarket.com/api/latest-prices');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ExchangeRateResponse = await response.json();
    
    // Cache the rate and timestamp
    cachedRate = data.usdCurrentBlackPrice;
    lastFetchTime = now;
    
    return cachedRate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Return cached rate if available, otherwise return a fallback rate
    if (cachedRate) {
      return cachedRate;
    }
    
    // Fallback to a reasonable rate if no cached data
    return 161.5;
  }
}

export function convertETBtoUSD(etbAmount: number, exchangeRate: number): number {
  return etbAmount / exchangeRate;
}

export function formatUSD(usdAmount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(usdAmount);
}

export function formatETB(etbAmount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(etbAmount);
} 