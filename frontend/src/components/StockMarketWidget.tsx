import React, { useState, useMemo } from 'react';
import { StockItem } from '../types';
import { STOCKS_DATA, MAJOR_MARKET_INDICES, MARKET_NEWS } from '../data/stockMarketData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getMarketQuoteUrl, getTradingViewUrl } from '../utils/marketLinks';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  Search,
  ArrowUpRight,
  ChevronRight,
  Flame,
  Newspaper,
  Compass,
  Zap,
  ExternalLink,
  LineChart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StockDetailModal } from './StockDetailModal';

export const StockMarketWidget: React.FC = () => {
  const { currency, setActiveTab } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStockModal, setActiveStockModal] = useState<StockItem | null>(null);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return STOCKS_DATA.filter((stk) => {
      const matchCat =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'indian'
          ? stk.category === 'indian'
          : selectedCategory === 'global'
          ? stk.category === 'global'
          : stk.category === 'commodities';

      const matchSearch =
        stk.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stk.sector.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Top gainers
  const topGainers = useMemo(() => {
    return [...STOCKS_DATA].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  }, []);

  return (
    <div className="space-y-6">
      {/* Major Market Indices Quick Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider">
              Major Market Benchmarks
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Click any index to open live chart</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MAJOR_MARKET_INDICES.map((idx) => {
            const isPos = idx.changePercent >= 0;
            const quoteUrl = getMarketQuoteUrl(idx.symbol, 'NSE');
            const tvUrl = getTradingViewUrl(idx.symbol, 'NSE');

            return (
              <div
                key={idx.id}
                className="bg-[#111318] border border-[#1f2937] hover:border-amber-500/50 p-3 rounded-xl flex flex-col justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-zinc-300 group-hover:text-amber-400 transition-colors">
                    {idx.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={quoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Google Finance"
                      className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-[#1f2937] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={tvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in TradingView Chart"
                      className="p-1 rounded text-zinc-500 hover:text-cyan-400 hover:bg-[#1f2937] transition-colors"
                    >
                      <LineChart className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-black text-zinc-100">
                    {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(idx.value)}
                  </div>
                  <div
                    className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {formatPercentage(idx.changePercent)} ({isPos ? '+' : ''}
                    {idx.change.toFixed(1)})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Gainers Quick Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider">
              Top Market Gainers Today
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Real-time Movement in INR</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topGainers.map((gainer) => {
            const isPositive = gainer.changePercent >= 0;
            const quoteUrl = getMarketQuoteUrl(gainer.symbol, gainer.exchange);

            return (
              <div
                key={gainer.id}
                onClick={() => setActiveStockModal(gainer)}
                className="bg-[#111318] border border-[#1f2937] hover:border-amber-500/50 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs group-hover:scale-105 transition-transform">
                    {gainer.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {gainer.symbol}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {gainer.exchange}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-[110px]">
                      {gainer.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-zinc-100">
                      {formatCurrency(gainer.priceINR, currency)}
                    </div>
                    <div
                      className={`text-[11px] font-bold flex items-center justify-end gap-0.5 mt-0.5 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {formatPercentage(gainer.changePercent)}
                    </div>
                  </div>

                  <a
                    href={quoteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Open in Google Finance"
                    className="p-1.5 rounded-lg bg-[#181c26] text-zinc-400 hover:text-amber-400 hover:bg-[#202634] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Stock Markets Explorer Card */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Live Stock Markets & Watchlist
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                NSE/BSE Open
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live Indian bluechips, US technology giants, and commodities priced in INR
            </p>
          </div>

          {/* Search bar & Category filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stock or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161922] border border-[#1f2937] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-52"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-[#161922] border border-[#1f2937] p-1 rounded-xl gap-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'indian', label: 'NSE Bluechips' },
                { id: 'global', label: 'US Tech (INR)' },
                { id: 'commodities', label: 'Commodities' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stocks Table / Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2937] text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                <th className="pb-3 pl-2">Asset / Company</th>
                <th className="pb-3 text-right">Current Price (INR)</th>
                <th className="pb-3 text-right">24h Movement</th>
                <th className="pb-3 text-center hidden md:table-cell">7D Trend</th>
                <th className="pb-3 text-right hidden lg:table-cell">Market Cap</th>
                <th className="pb-3 text-right hidden sm:table-cell">AI Rating</th>
                <th className="pb-3 text-center pr-2">External Link / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/60">
              {filteredStocks.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                const quoteUrl = getMarketQuoteUrl(stock.symbol, stock.exchange);
                const tvUrl = getTradingViewUrl(stock.symbol, stock.exchange);

                // Sparkline generator
                const min = Math.min(...stock.sparkline);
                const max = Math.max(...stock.sparkline);
                const range = max - min || 1;
                const sparkPoints = stock.sparkline
                  .map((val, idx) => {
                    const x = (idx / (stock.sparkline.length - 1)) * 60;
                    const y = 20 - ((val - min) / range) * 16;
                    return `${x},${y}`;
                  })
                  .join(' ');

                return (
                  <tr
                    key={stock.id}
                    onClick={() => setActiveStockModal(stock)}
                    className="hover:bg-[#161922] cursor-pointer transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#1a1e28] border border-[#1f2937] flex items-center justify-center font-bold text-[11px] text-amber-400 group-hover:border-amber-500/40 transition-colors shrink-0">
                          {stock.symbol.slice(0, 3)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                              {stock.symbol}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-bold">
                              {stock.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 text-right font-extrabold text-zinc-100">
                      {formatCurrency(stock.priceINR, currency)}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3.5 text-right">
                      <div
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold text-[11px] ${
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
                        {formatPercentage(stock.changePercent)}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                        {isPositive ? '+' : ''}
                        {formatCurrency(stock.changeINR, currency)}
                      </div>
                    </td>

                    {/* Sparkline */}
                    <td className="py-3.5 text-center hidden md:table-cell">
                      <div className="inline-block w-[60px] h-[22px]">
                        <svg viewBox="0 0 60 22" className="w-full h-full overflow-visible">
                          <polyline
                            fill="none"
                            stroke={isPositive ? '#10b981' : '#f43f5e'}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={sparkPoints}
                          />
                        </svg>
                      </div>
                    </td>

                    {/* Market Cap */}
                    <td className="py-3.5 text-right font-medium text-zinc-300 hidden lg:table-cell">
                      {stock.marketCapINR}
                    </td>

                    {/* AI Sentiment */}
                    <td className="py-3.5 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        {stock.aiSentiment}
                      </span>
                    </td>

                    {/* Action & Direct Links */}
                    <td className="py-3.5 text-center pr-2">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={quoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in Google Finance"
                          className="p-1.5 rounded-lg bg-[#161922] hover:bg-amber-500 hover:text-zinc-950 text-zinc-400 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={tvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in TradingView Chart"
                          className="p-1.5 rounded-lg bg-[#161922] hover:bg-cyan-500 hover:text-zinc-950 text-zinc-400 transition-colors"
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setActiveStockModal(stock)}
                          className="p-1.5 rounded-lg bg-[#161922] hover:bg-[#202738] text-amber-400 transition-colors cursor-pointer"
                          title="View In-App Analysis"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Intelligence & News Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Market Insights News Feed */}
        <div className="lg:col-span-2 bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-zinc-100">
                Market Intelligence & News Pulse
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400">Live Indian & Global Wire</span>
          </div>

          <div className="space-y-3">
            {MARKET_NEWS.map((news) => (
              <div
                key={news.id}
                className="p-3.5 rounded-xl bg-[#161922] border border-[#1f2937] hover:border-zinc-700 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/20 text-[10px]">
                      {news.tag}
                    </span>
                    <span className="text-zinc-400 font-medium">{news.source}</span>
                  </div>
                  <span className="text-zinc-400">{news.timeAgo}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 leading-snug">{news.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{news.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Market Health & SIP Planner Bridge */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-zinc-100">India Market Breadth</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">Advance / Decline</div>
                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5">1,480 Adv : 640 Dec</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">Market Sentiment</div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5">68 (Greed / Bullish)</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">India VIX</div>
                  <div className="text-sm font-extrabold text-zinc-100 mt-0.5">12.45</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400 font-bold uppercase">Volatility Level</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">Low / Stable</div>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-1">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Smart SIP Compounding</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                Nifty 50 and Indian bluechip equity allocations have generated ~13.8% CAGR over the last 15 years.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('simulator')}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Simulate Stock SIP Returns</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stock Detail Modal */}
      {activeStockModal && (
        <StockDetailModal
          stock={activeStockModal}
          onClose={() => setActiveStockModal(null)}
        />
      )}
    </div>
  );
};
