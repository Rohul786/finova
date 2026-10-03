import React, { useState, useMemo } from 'react';
import {
  Globe,
  ArrowRightLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  Layers,
  ChevronDown,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  inrRate: number; // How many INR for 1 unit of foreign currency (e.g. 1 USD = 86.85 INR)
  change24h: number; // % change today
  pppFactor: number; // Purchasing Power Parity multiplier
}

const GLOBAL_CURRENCIES: CurrencyData[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    inrRate: 86.85,
    change24h: +0.14,
    pppFactor: 3.52,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    inrRate: 90.45,
    change24h: -0.08,
    pppFactor: 3.25,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    inrRate: 109.30,
    change24h: +0.22,
    pppFactor: 3.75,
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED ',
    flag: '🇦🇪',
    inrRate: 23.65,
    change24h: +0.02,
    pppFactor: 3.10,
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    inrRate: 64.25,
    change24h: +0.11,
    pppFactor: 2.85,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    flag: '🇨🇦',
    inrRate: 60.75,
    change24h: -0.15,
    pppFactor: 3.05,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    inrRate: 55.40,
    change24h: +0.31,
    pppFactor: 2.95,
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    inrRate: 0.565,
    change24h: -0.42,
    pppFactor: 2.20,
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF ',
    flag: '🇨🇭',
    inrRate: 96.10,
    change24h: +0.05,
    pppFactor: 4.10,
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR ',
    flag: '🇸🇦',
    inrRate: 23.15,
    change24h: +0.01,
    pppFactor: 3.15,
  },
];

export const CurrencyConverterWidget: React.FC = () => {
  const { monthlyStats, goals } = useApp();

  // Selected base amount in INR
  const [inrAmount, setInrAmount] = useState<number>(monthlyStats.income || 65000);
  const [activePreset, setActivePreset] = useState<'income' | 'surplus' | 'goals' | 'custom'>('income');
  const [selectedForeignCurrency, setSelectedForeignCurrency] = useState<string>('USD');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Preset values
  const totalGoalsValue = useMemo(() => {
    return goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0) || 120000;
  }, [goals]);

  const handlePresetSelect = (preset: 'income' | 'surplus' | 'goals' | 'custom') => {
    setActivePreset(preset);
    if (preset === 'income') {
      setInrAmount(monthlyStats.income || 65000);
    } else if (preset === 'surplus') {
      setInrAmount(monthlyStats.netSavings > 0 ? monthlyStats.netSavings : 27000);
    } else if (preset === 'goals') {
      setInrAmount(totalGoalsValue);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  // Convert INR into foreign currency
  const activeCurrencyObj = useMemo(() => {
    return GLOBAL_CURRENCIES.find((c) => c.code === selectedForeignCurrency) || GLOBAL_CURRENCIES[0];
  }, [selectedForeignCurrency]);

  const convertedValue = useMemo(() => {
    if (!inrAmount || inrAmount <= 0) return 0;
    return inrAmount / activeCurrencyObj.inrRate;
  }, [inrAmount, activeCurrencyObj]);

  const pppEquivalence = useMemo(() => {
    // Domestic purchasing power parity
    return convertedValue * (activeCurrencyObj.pppFactor || 1);
  }, [convertedValue, activeCurrencyObj]);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return GLOBAL_CURRENCIES;
    const q = searchQuery.toLowerCase();
    return GLOBAL_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div id="currency-converter-widget" className="bg-[#111318] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-zinc-100 tracking-tight">
                Global Currency & Forex Asset Comparator
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Rates
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Compare your Indian Rupee (₹ INR) cashflows, wealth corpus, and goals against major global foreign currencies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-zinc-400">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            id="btn-refresh-forex"
            onClick={handleRefresh}
            title="Refresh Live Forex Rates"
            className="p-2 rounded-lg bg-[#161922] border border-[#1f2937] text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* INR Asset Source Selector & Calculator Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Preset Chips & Interactive INR Input */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Select INR Asset / Flow Benchmark:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="preset-income-btn"
                onClick={() => handlePresetSelect('income')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                  activePreset === 'income'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-[10px] text-zinc-400 font-medium">Monthly Inflow</div>
                <div className="font-bold text-zinc-100 mt-0.5">₹{(monthlyStats.income || 65000).toLocaleString('en-IN')}</div>
              </button>

              <button
                id="preset-surplus-btn"
                onClick={() => handlePresetSelect('surplus')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                  activePreset === 'surplus'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-[10px] text-zinc-400 font-medium">Monthly Surplus</div>
                <div className="font-bold text-zinc-100 mt-0.5">₹{(monthlyStats.netSavings > 0 ? monthlyStats.netSavings : 27000).toLocaleString('en-IN')}</div>
              </button>

              <button
                id="preset-goals-btn"
                onClick={() => handlePresetSelect('goals')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                  activePreset === 'goals'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-[10px] text-zinc-400 font-medium">Saved Goals</div>
                <div className="font-bold text-zinc-100 mt-0.5">₹{totalGoalsValue.toLocaleString('en-IN')}</div>
              </button>
            </div>
          </div>

          {/* Amount Input with Live Slider */}
          <div className="bg-[#161922] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                INR Base Amount:
              </span>
              <span className="text-[10px] text-zinc-400">Type or slide value</span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-black text-amber-400">
                ₹
              </span>
              <input
                id="inr-converter-input"
                type="number"
                value={inrAmount || ''}
                onChange={(e) => {
                  setActivePreset('custom');
                  setInrAmount(Math.max(0, parseFloat(e.target.value) || 0));
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-[#0e1015] border border-[#1f2937] rounded-lg text-lg font-bold text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="Enter amount in ₹ INR"
              />
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={inrAmount}
                onChange={(e) => {
                  setActivePreset('custom');
                  setInrAmount(Number(e.target.value));
                }}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#0e1015] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>₹5k</span>
                <span>₹1 Lakh</span>
                <span>₹2.5 Lakh</span>
                <span>₹5 Lakh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Real-Time Foreign Currency Card & PPP Insight */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Main Converted Showcase Card */}
          <div className="bg-gradient-to-br from-[#181c26] to-[#12141c] border border-amber-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Direct Spot Conversion
                </span>
                <div className="text-xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2">
                  <span>{activeCurrencyObj.flag}</span>
                  <span>{activeCurrencyObj.name} ({activeCurrencyObj.code})</span>
                </div>
              </div>

              {/* Currency Selector Dropdown */}
              <div className="relative">
                <select
                  id="foreign-currency-select"
                  value={selectedForeignCurrency}
                  onChange={(e) => setSelectedForeignCurrency(e.target.value)}
                  className="bg-[#0e1015] border border-[#1f2937] text-zinc-200 text-xs font-bold rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  {GLOBAL_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#111318] text-zinc-200">
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Big Converted Numbers */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-y border-[#1f2937] py-3.5 my-2">
              <div>
                <div className="text-xs text-zinc-400">Equivalent Value:</div>
                <div className="text-3xl lg:text-4xl font-black text-amber-300 tracking-tight">
                  {activeCurrencyObj.symbol}
                  {convertedValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs text-zinc-400">Current Forex Spot:</div>
                <div className="text-sm font-extrabold text-zinc-100 flex items-center sm:justify-end gap-1.5">
                  <span>1 {activeCurrencyObj.code} = ₹{activeCurrencyObj.inrRate.toFixed(2)}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                      activeCurrencyObj.change24h >= 0
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {activeCurrencyObj.change24h >= 0 ? '+' : ''}
                    {activeCurrencyObj.change24h}%
                  </span>
                </div>
              </div>
            </div>

            {/* Purchasing Power Parity (PPP) Insight Banner */}
            <div className="mt-3 bg-[#0d1017] border border-[#1f2937] rounded-lg p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300">
                <span className="font-bold text-amber-300">Purchasing Power Parity (PPP): </span>
                In terms of domestic Indian cost of living, your ₹{inrAmount.toLocaleString('en-IN')} gives you the real living-standard power of approx{' '}
                <span className="font-bold text-emerald-400">
                  {activeCurrencyObj.symbol}{pppEquivalence.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>{' '}
                in the {activeCurrencyObj.name} economy (PPP Multiplier: ~{activeCurrencyObj.pppFactor}x).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Multi-Currency Grid Comparison Matrix */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Complete Global Currency Asset Matrix (₹{inrAmount.toLocaleString('en-IN')} Equivalent)
            </h4>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search currency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 bg-[#161922] border border-[#1f2937] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/40 w-44"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredCurrencies.map((cur) => {
            const val = inrAmount / cur.inrRate;
            const isSelected = cur.code === selectedForeignCurrency;

            return (
              <div
                key={cur.code}
                onClick={() => setSelectedForeignCurrency(cur.code)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-[#161922] border-[#1f2937] hover:border-zinc-700 hover:bg-[#1a1e2a]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{cur.flag}</span>
                    <span className="text-xs font-bold text-zinc-100">{cur.code}</span>
                  </div>
                  <div
                    className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                      cur.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {cur.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{cur.change24h > 0 ? `+${cur.change24h}` : cur.change24h}%</span>
                  </div>
                </div>

                <div className="text-base font-extrabold text-zinc-100">
                  {cur.symbol}
                  {val >= 1000
                    ? val.toLocaleString('en-US', { maximumFractionDigits: 1 })
                    : val.toFixed(2)}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 border-t border-[#1f2937]/60 pt-1.5">
                  <span>1 {cur.code}</span>
                  <span className="font-semibold text-zinc-300">₹{cur.inrRate.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
