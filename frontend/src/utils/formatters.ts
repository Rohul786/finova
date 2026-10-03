export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', rate: 0.0094 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)', rate: 0.016 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)', rate: 0.018 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', rate: 1.8 },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)', rate: 0.044 },
];

export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const symbol = currency.symbol;

  if (currencyCode === 'INR') {
    // Indian numbering format (Lakhs and Crores for readability if high)
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    // Standard Indian localized formatting
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(abs);
    
    return `${sign}${symbol}${formatted}`;
  }

  return `${amount < 0 ? '-' : ''}${symbol}${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))}`;
}

export function formatCompactCurrency(amount: number, currencyCode: string = 'INR'): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const symbol = currency.symbol;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (currencyCode === 'INR') {
    if (abs >= 10000000) {
      return `${sign}${symbol}${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${symbol}${(abs / 100000).toFixed(1)} L`;
    }
    if (abs >= 1000) {
      return `${sign}${symbol}${(abs / 1000).toFixed(1)} k`;
    }
    return `${sign}${symbol}${abs}`;
  }

  if (abs >= 1000000) {
    return `${sign}${symbol}${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${symbol}${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}${symbol}${abs}`;
}

export function formatPercentage(val: number): string {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
