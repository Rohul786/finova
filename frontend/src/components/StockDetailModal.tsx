import React, { useState } from 'react';
import { StockItem } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getMarketQuoteUrl, getTradingViewUrl, getNSEIndiaUrl } from '../utils/marketLinks';
import { FinovaLogo } from './FinovaLogo';
import {
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ExternalLink,
  Plus,
  Globe,
  LineChart,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
}

type Timeframe = '1D' | '1W' | '1M' | '1Y' | '5Y';

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const { currency, setIsQuickAddOpen, setActiveTab } = useApp();
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');

  if (!stock) return null;

  const isPositive = stock.changePercent >= 0;

  // Get active history series based on timeframe
  const historySeries =
    timeframe === '1D'
      ? stock.history1D
      : timeframe === '1W'
      ? stock.history1W
      : timeframe === '1M'
      ? stock.history1M
      : timeframe === '1Y'
      ? stock.history1Y
      : stock.history5Y;

  const prices = historySeries.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Generate SVG path for interactive area chart
  const svgWidth = 500;
  const svgHeight = 160;
  const padding = 20;

  const points = historySeries.map((pt, idx) => {
    const x = padding + (idx / (historySeries.length - 1 || 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((pt.price - minPrice) / priceRange) * (svgHeight - padding * 2);
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${svgWidth - padding},${svgHeight} L ${padding},${svgHeight} Z`;

  // Calculate 52-week position percentage
  const week52Range = stock.week52HighINR - stock.week52LowINR || 1;
  const week52Position = Math.min(
    100,
    Math.max(0, ((stock.priceINR - stock.week52LowINR) / week52Range) * 100)
  );

  const googleFinanceUrl = stock.externalUrl || getMarketQuoteUrl(stock.symbol, stock.exchange);
  const tradingViewUrl = getTradingViewUrl(stock.symbol, stock.exchange);
  const isIndianStock = stock.exchange === 'NSE' || stock.exchange === 'BSE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111318] border border-[#1f2937] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1f2937] flex items-center justify-between bg-[#141720]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm">
              {stock.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-100">{stock.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {stock.exchange}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {stock.sector}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">Symbol: {stock.symbol}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1f2937] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Price & Change Banner */}
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="text-3xl font-black text-zinc-100 tracking-tight">
                {formatCurrency(stock.priceINR, currency)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                    isPositive
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {formatPercentage(stock.changePercent)} ({isPositive ? '+' : ''}
                  {formatCurrency(stock.changeINR, currency)})
                </span>
                <span className="text-xs text-zinc-400 font-medium">Today&apos;s Movement</span>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center bg-[#161922] border border-[#1f2937] rounded-xl p-1 gap-1">
              {(['1D', '1W', '1M', '1Y', '5Y'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-amber-500 text-zinc-950 shadow-sm font-extrabold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="bg-[#0e1015] border border-[#1f2937] rounded-xl p-4 relative">
            <div className="flex justify-between text-[11px] text-zinc-500 mb-2">
              <span>High: {formatCurrency(maxPrice, currency)}</span>
              <span>Low: {formatCurrency(minPrice, currency)}</span>
            </div>

            <div className="w-full h-40">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area under curve */}
                <path d={areaPath} fill="url(#stockAreaGrad)" />

                {/* Curve Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Point markers */}
                {historySeries.map((pt, idx) => {
                  const x =
                    padding +
                    (idx / (historySeries.length - 1 || 1)) * (svgWidth - padding * 2);
                  const y =
                    svgHeight -
                    padding -
                    ((pt.price - minPrice) / priceRange) * (svgHeight - padding * 2);
                  return (
                    <g key={idx} className="group">
                      <circle
                        cx={x}
                        cy={y}
                        r="3.5"
                        className="fill-amber-400 stroke-[#111318] stroke-2"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Time labels under chart */}
            <div className="flex justify-between text-[10px] text-zinc-400 mt-2 font-medium">
              {historySeries.map((pt, idx) => (
                <span key={idx}>{pt.time}</span>
              ))}
            </div>
          </div>

          {/* Direct External Market Links Strip */}
          <div className="bg-[#141824] border border-[#1f2937] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                Live External Market Pages:
              </span>
              <span className="text-[10px] text-zinc-400">Opens in new tab</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={googleFinanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1f2c] hover:bg-[#232a3b] text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all group"
              >
                <span>Google Finance</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={tradingViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1f2c] hover:bg-[#232a3b] text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all group"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>TradingView Chart</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {isIndianStock && (
                <a
                  href={getNSEIndiaUrl(stock.symbol)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1f2c] hover:bg-[#232a3b] text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all group"
                >
                  <span>NSE Official</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>

          {/* Key Fundamentals & 52-Week Range */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#161922] border border-[#1f2937] p-3 rounded-xl">
              <div className="text-[11px] text-zinc-400 uppercase font-bold">Market Cap</div>
              <div className="text-sm font-extrabold text-zinc-100 mt-0.5">{stock.marketCapINR}</div>
            </div>

            <div className="bg-[#161922] border border-[#1f2937] p-3 rounded-xl">
              <div className="text-[11px] text-zinc-400 uppercase font-bold">Day Range</div>
              <div className="text-xs font-bold text-zinc-200 mt-0.5">
                {formatCurrency(stock.dayLowINR, currency)} - {formatCurrency(stock.dayHighINR, currency)}
              </div>
            </div>

            <div className="bg-[#161922] border border-[#1f2937] p-3 rounded-xl">
              <div className="text-[11px] text-zinc-400 uppercase font-bold">P/E Ratio</div>
              <div className="text-sm font-extrabold text-zinc-100 mt-0.5">
                {stock.peRatio ? `${stock.peRatio}x` : 'N/A'}
              </div>
            </div>

            <div className="bg-[#161922] border border-[#1f2937] p-3 rounded-xl">
              <div className="text-[11px] text-zinc-400 uppercase font-bold">Volume</div>
              <div className="text-sm font-extrabold text-amber-300 mt-0.5">{stock.volume}</div>
            </div>
          </div>

          {/* 52-Week Range Bar */}
          <div className="bg-[#161922] border border-[#1f2937] p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-bold uppercase text-[10px]">52-Week Range</span>
              <span className="text-zinc-200 font-semibold">
                {week52Position.toFixed(0)}% of 52W High
              </span>
            </div>
            <div className="w-full h-2 bg-[#0e1015] rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${week52Position}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
              <span>Low: {formatCurrency(stock.week52LowINR, currency)}</span>
              <span>High: {formatCurrency(stock.week52HighINR, currency)}</span>
            </div>
          </div>

          {/* AI Sentiment & Insights */}
          <div className="bg-[#141824] border border-amber-500/30 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FinovaLogo size={22} />
                <span className="text-xs font-bold text-zinc-100">Finova AI Analyst Summary</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-extrabold text-amber-300">
                <span>{stock.aiSentiment}</span>
                <span>({stock.aiSentimentScore}/100)</span>
              </div>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{stock.aiInsight}</p>
          </div>
        </div>

        {/* Modal Footer / Action CTA */}
        <div className="p-4 border-t border-[#1f2937] bg-[#141720] flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 hidden sm:block">
            Simulate monthly SIP or log a purchase in your portfolio ledger.
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                setActiveTab('simulator');
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#1f2937] hover:bg-[#283548] text-zinc-200 text-xs font-bold transition-all cursor-pointer"
            >
              SIP Wealth Simulator
            </button>
            <button
              onClick={() => {
                onClose();
                setIsQuickAddOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Portfolio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
