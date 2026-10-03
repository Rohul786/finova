import React from 'react';
import { MAJOR_MARKET_INDICES, STOCKS_DATA } from '../data/stockMarketData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getMarketQuoteUrl } from '../utils/marketLinks';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

interface StockTickerTapeProps {
  onSelectStock?: (symbol: string) => void;
}

export const StockTickerTape: React.FC<StockTickerTapeProps> = ({ onSelectStock }) => {
  // Combine indices and popular stocks for ticker
  const tickerItems = [
    ...MAJOR_MARKET_INDICES.map((idx) => ({
      id: idx.id,
      symbol: idx.symbol,
      name: idx.name,
      price: idx.value,
      changePercent: idx.changePercent,
      isIndex: true,
      exchange: 'NSE',
    })),
    ...STOCKS_DATA.map((stk) => ({
      id: stk.id,
      symbol: stk.symbol,
      name: stk.name,
      price: stk.priceINR,
      changePercent: stk.changePercent,
      isIndex: false,
      exchange: stk.exchange,
    })),
  ];

  return (
    <div className="w-full bg-[#0c0e12] border border-[#1f2937] rounded-xl overflow-hidden shadow-md">
      <div className="flex items-center">
        {/* Left Live Badge */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#141720] border-r border-[#1f2937] shrink-0 text-xs font-bold text-amber-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="hidden sm:inline">LIVE NSE/BSE</span>
          <span className="sm:hidden">LIVE</span>
        </div>

        {/* Scrolling or Flex Ticker Row */}
        <div className="flex items-center gap-4 overflow-x-auto py-2 px-3 no-scrollbar scroll-smooth whitespace-nowrap text-xs">
          {tickerItems.map((item) => {
            const isPositive = item.changePercent >= 0;
            const quoteUrl = getMarketQuoteUrl(item.symbol, item.exchange);

            return (
              <div
                key={item.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#111318]/70 hover:bg-[#161922] border border-transparent hover:border-[#1f2937] transition-colors shrink-0 group"
              >
                <button
                  onClick={() => onSelectStock && onSelectStock(item.symbol)}
                  className="flex items-center gap-2 text-left cursor-pointer"
                  title={`View details for ${item.name}`}
                >
                  <span className="font-extrabold text-zinc-200 group-hover:text-amber-400 transition-colors">
                    {item.symbol}
                  </span>
                  <span className="font-semibold text-zinc-300">
                    {item.isIndex
                      ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(item.price)
                      : formatCurrency(item.price, 'INR')}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.2 rounded ${
                      isPositive
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {formatPercentage(item.changePercent)}
                  </span>
                </button>

                {/* External quote open icon */}
                <a
                  href={quoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={`Open ${item.symbol} quote on Google Finance in new tab`}
                  className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-[#1f2937] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
