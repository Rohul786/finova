export function getMarketQuoteUrl(symbol: string, exchange: string = 'NSE'): string {
  const sym = symbol.toUpperCase().trim();
  const ex = exchange.toUpperCase().trim();

  // Index specials
  if (sym === 'NIFTY' || sym === 'NIFTY50' || sym === 'NIFTY 50') {
    return 'https://www.google.com/finance/quote/NIFTY_50:INDEXNSE';
  }
  if (sym === 'SENSEX' || sym === 'BSE SENSEX') {
    return 'https://www.google.com/finance/quote/SENSEX:INDEXBOM';
  }
  if (sym === 'BANKNIFTY' || sym === 'BANK NIFTY') {
    return 'https://www.google.com/finance/quote/NIFTY_BANK:INDEXNSE';
  }
  if (sym === 'NIFTYIT' || sym === 'NIFTY IT') {
    return 'https://www.google.com/finance/quote/NIFTY_IT:INDEXNSE';
  }
  if (sym === 'GOLD' || sym === 'GOLD24K') {
    return 'https://www.google.com/finance/quote/GC=F';
  }
  if (sym === 'SILVER' || sym === 'SILVER1KG') {
    return 'https://www.google.com/finance/quote/SI=F';
  }

  // Stock exchanges
  if (ex === 'NSE') {
    return `https://www.google.com/finance/quote/${sym}:NSE`;
  }
  if (ex === 'BSE') {
    return `https://www.google.com/finance/quote/${sym}:BOM`;
  }
  if (ex === 'NASDAQ') {
    return `https://www.google.com/finance/quote/${sym}:NASDAQ`;
  }
  if (ex === 'NYSE') {
    return `https://www.google.com/finance/quote/${sym}:NYSE`;
  }
  if (ex === 'MCX') {
    return `https://www.mcxindia.com`;
  }

  return `https://www.google.com/finance/quote/${sym}:NSE`;
}

export function getTradingViewUrl(symbol: string, exchange: string = 'NSE'): string {
  const sym = symbol.toUpperCase().trim();
  const ex = exchange.toUpperCase().trim();

  if (sym === 'NIFTY' || sym === 'NIFTY50') return 'https://www.tradingview.com/symbols/NSE-NIFTY/';
  if (sym === 'SENSEX') return 'https://www.tradingview.com/symbols/BSE-SENSEX/';
  if (sym === 'BANKNIFTY') return 'https://www.tradingview.com/symbols/NSE-BANKNIFTY/';
  if (sym === 'NIFTYIT') return 'https://www.tradingview.com/symbols/NSE-CNXIT/';

  if (ex === 'NASDAQ') return `https://www.tradingview.com/symbols/NASDAQ-${sym}/`;
  if (ex === 'NYSE') return `https://www.tradingview.com/symbols/NYSE-${sym}/`;
  if (ex === 'BSE') return `https://www.tradingview.com/symbols/BSE-${sym}/`;

  return `https://www.tradingview.com/symbols/NSE-${sym}/`;
}

export function getNSEIndiaUrl(symbol: string): string {
  return `https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(symbol)}`;
}
