import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { calculateSIPProjections } from '../utils/calculations';
import {
  TrendingUp,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const { monthlyStats, currency } = useApp();

  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip');
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(() => {
    return monthlyStats.netSavings > 0 ? monthlyStats.netSavings : 15000;
  });
  const [lumpsumAmount, setLumpsumAmount] = useState<number>(100000);
  const [expectedReturn, setExpectedReturn] = useState<number>(13);
  const [tenureYears, setTenureYears] = useState<number>(10);
  const [stepUpRate, setStepUpRate] = useState<number>(5); // 5% annual step-up
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% inflation

  const activeMonthly = mode === 'sip' ? monthlyDeposit : 0;
  const initialCapital = mode === 'lumpsum' ? lumpsumAmount : 0;

  const {
    dataPoints,
    totalInvested,
    finalCorpus,
    wealthGained,
    finalRealValue,
  } = calculateSIPProjections(
    activeMonthly,
    expectedReturn,
    tenureYears,
    stepUpRate,
    inflationRate
  );

  // If lumpsum only, compute lumpsum compound value
  const actualInvested = mode === 'lumpsum' ? lumpsumAmount : totalInvested;
  const actualFinalCorpus =
    mode === 'lumpsum'
      ? Math.round(lumpsumAmount * Math.pow(1 + expectedReturn / 100, tenureYears))
      : finalCorpus;
  const actualWealthGained = Math.max(0, actualFinalCorpus - actualInvested);
  const actualInflationAdjusted =
    mode === 'lumpsum'
      ? Math.round(actualFinalCorpus / Math.pow(1 + inflationRate / 100, tenureYears))
      : finalRealValue;

  const gainRatio = actualInvested > 0 ? (actualWealthGained / actualInvested).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Future Compounding Simulator
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Investment & Wealth Simulator
          </h1>
          <p className="text-xs text-zinc-400">
            Simulate future wealth generation across equities, SIPs, annual step-ups, and inflation adjustments.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#111318] border border-[#1f2937] p-1 rounded-xl">
          <button
            onClick={() => setMode('sip')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'sip'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Monthly SIP
          </button>
          <button
            onClick={() => setMode('lumpsum')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'lumpsum'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            One-Time Lumpsum
          </button>
        </div>
      </div>

      {/* 3 Large Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invested */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Total Capital Invested</span>
          <div className="text-xl lg:text-3xl font-extrabold text-zinc-100">
            {formatCurrency(actualInvested, currency)}
          </div>
          <div className="text-xs text-zinc-400">
            {mode === 'sip' ? `Over ${tenureYears} years (${tenureYears * 12} installments)` : 'Principal deposit'}
          </div>
        </div>

        {/* Wealth Gained */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Estimated Wealth Gained</span>
          <div className="text-xl lg:text-3xl font-extrabold text-emerald-400">
            +{formatCurrency(actualWealthGained, currency)}
          </div>
          <div className="text-xs text-emerald-400 font-medium">
            {gainRatio}x Return Multiplier on capital
          </div>
        </div>

        {/* Final Corpus */}
        <div className="bg-gradient-to-br from-[#161922] via-[#111318] to-[#111318] border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-xs font-bold text-amber-400">Total Maturity Value</span>
          <div className="text-xl lg:text-3xl font-black text-amber-400">
            {formatCurrency(actualFinalCorpus, currency)}
          </div>
          <div className="text-xs text-zinc-300">
            Inflation-Adjusted Purchasing Power: <strong className="text-zinc-100">{formatCurrency(actualInflationAdjusted, currency)}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1f2937]">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-zinc-100">Simulation Parameters</h3>
          </div>

          {/* Monthly or Lumpsum Amount */}
          {mode === 'sip' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Monthly SIP Contribution</span>
                <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {formatCurrency(monthlyDeposit, currency)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>{formatCompactCurrency(1000, currency)}</span>
                <span>{formatCompactCurrency(100000, currency)}</span>
                <span>{formatCompactCurrency(200000, currency)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Initial Lumpsum Capital</span>
                <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {formatCurrency(lumpsumAmount, currency)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="5000000"
                step="25000"
                value={lumpsumAmount}
                onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>{formatCompactCurrency(10000, currency)}</span>
                <span>{formatCompactCurrency(2500000, currency)}</span>
                <span>{formatCompactCurrency(5000000, currency)}</span>
              </div>
            </div>
          )}

          {/* Expected Return Rate (CAGR) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300">Expected Annual Return (CAGR)</span>
              <span className="font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {expectedReturn}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="25"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>4% (Debt/FD)</span>
              <span>12-14% (Index Funds)</span>
              <span>25% (High Alpha)</span>
            </div>
          </div>

          {/* Time Horizon (Years) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300">Investment Horizon (Tenure)</span>
              <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                {tenureYears} Years
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Annual Step-Up % (SIP mode) */}
          {mode === 'sip' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Annual SIP Step-Up Rate</span>
                <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {stepUpRate}% yearly
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={stepUpRate}
                onChange={(e) => setStepUpRate(Number(e.target.value))}
                className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[10px] text-zinc-400">
                Increasing your SIP with annual salary increments supercharges compounding.
              </p>
            </div>
          )}

          {/* Inflation Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300">Inflation Rate (Real Value Discount)</span>
              <span className="font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                {inflationRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Visual Year-by-Year Growth Table & Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Year-by-Year Wealth Trajectory
              </h3>
              <p className="text-xs text-zinc-400">
                Witness the power of compounding as wealth gained overtakes invested capital
              </p>
            </div>
          </div>

          {/* Visual Milestone Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {dataPoints
              .filter((_, idx) => (idx + 1) === 3 || (idx + 1) === 5 || (idx + 1) === 10 || (idx + 1) === tenureYears)
              .slice(0, 3)
              .map((pt) => (
                <div
                  key={pt.year}
                  className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] text-center"
                >
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Year {pt.year}</div>
                  <div className="text-sm font-extrabold text-zinc-100 mt-0.5">
                    {formatCompactCurrency(pt.totalCorpus, currency)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    +{formatCompactCurrency(pt.wealthGained, currency)} gain
                  </div>
                </div>
              ))}
          </div>

          {/* Trajectory Table */}
          <div className="overflow-x-auto max-h-[320px] custom-scrollbar border border-[#1f2937] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[#161922] border-b border-[#1f2937] text-[11px] font-bold text-zinc-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Invested</th>
                  <th className="py-2.5 px-3">Wealth Gained</th>
                  <th className="py-2.5 px-3 text-right">Maturity Corpus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/70">
                {dataPoints.map((pt) => (
                  <tr key={pt.year} className="hover:bg-[#161922]/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-zinc-300">
                      Year {pt.year}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300">
                      {formatCurrency(pt.investedCapital, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                      +{formatCurrency(pt.wealthGained, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                      {formatCurrency(pt.totalCorpus, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
