import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { calculateSIPProjections } from '../utils/calculations';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  Sliders,
  DollarSign,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const WhatIfView: React.FC = () => {
  const { monthlyStats, currency, userProfile } = useApp();

  // Baseline
  const baseIncome = monthlyStats.income || userProfile.monthlyIncome || 65000;
  const baseExpenses = monthlyStats.expenses || 40000;
  const baseSurplus = Math.max(0, baseIncome - baseExpenses);
  const baseReturn = 12; // 12% CAGR
  const timeHorizon = 7; // 7 years

  // Scenario Adjustments
  const [expenseCutPercent, setExpenseCutPercent] = useState<number>(20); // 20% cut in discretionary
  const [extraMonthlySIP, setExtraMonthlySIP] = useState<number>(5000); // +5000 extra SIP
  const [salaryRaisePercent, setSalaryRaisePercent] = useState<number>(10); // +10% salary raise
  const [returnChange, setReturnChange] = useState<number>(1.5); // +1.5% alpha

  // Calculate Scenario
  const newIncome = Math.round(baseIncome * (1 + salaryRaisePercent / 100));
  const expenseSavings = Math.round((baseExpenses * 0.4) * (expenseCutPercent / 100)); // assume 40% is discretionary
  const newExpenses = baseExpenses - expenseSavings;
  const scenarioSurplus = Math.max(0, newIncome - newExpenses) + extraMonthlySIP;
  const scenarioReturn = baseReturn + returnChange;

  // Baseline SIP calculation
  const baselineSim = calculateSIPProjections(baseSurplus, baseReturn, timeHorizon, 0, 6);
  // Scenario SIP calculation
  const scenarioSim = calculateSIPProjections(scenarioSurplus, scenarioReturn, timeHorizon, 5, 6);

  const extraWealthGenerated = Math.max(0, scenarioSim.finalCorpus - baselineSim.finalCorpus);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Decision Sandbox
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            What-If Scenario Analysis
          </h1>
          <p className="text-xs text-zinc-400">
            Model how lifestyle adjustments, spending cuts, salary raises, and extra investments multiply your future net worth.
          </p>
        </div>

        {/* Wealth Delta Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 to-[#111318] border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">
              {timeHorizon}-Year Additional Wealth
            </div>
            <div className="text-base font-black text-emerald-400">
              +{formatCurrency(extraWealthGenerated, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Card */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-100">Status Quo (Current Path)</h3>
            </div>
            <span className="text-[11px] text-zinc-400">Current Habits</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]/60">
              <span className="text-zinc-400 text-[10px] block">Monthly Inflow:</span>
              <strong className="text-zinc-200">{formatCurrency(baseIncome, currency)}</strong>
            </div>
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]/60">
              <span className="text-zinc-400 text-[10px] block">Monthly Outflow:</span>
              <strong className="text-zinc-200">{formatCurrency(baseExpenses, currency)}</strong>
            </div>
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]/60">
              <span className="text-zinc-400 text-[10px] block">Monthly Investment:</span>
              <strong className="text-amber-400">{formatCurrency(baseSurplus, currency)}</strong>
            </div>
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]/60">
              <span className="text-zinc-400 text-[10px] block">Expected Return:</span>
              <strong className="text-amber-400">{baseReturn}% CAGR</strong>
            </div>
          </div>

          <div className="p-3.5 bg-[#161922] border border-[#1f2937] rounded-xl space-y-1">
            <div className="text-[11px] text-zinc-400">7-Year Projected Maturity Corpus</div>
            <div className="text-xl font-extrabold text-zinc-100">
              {formatCurrency(baselineSim.finalCorpus, currency)}
            </div>
            <div className="text-[10px] text-zinc-400">
              Total Capital Invested: {formatCurrency(baselineSim.totalInvested, currency)}
            </div>
          </div>
        </div>

        {/* Scenario Card */}
        <div className="bg-gradient-to-br from-[#161922] via-[#111318] to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Optimized Scenario Strategy</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              High Compounding
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]">
              <span className="text-zinc-400 text-[10px] block">New Monthly Income:</span>
              <strong className="text-emerald-400">{formatCurrency(newIncome, currency)}</strong>
            </div>
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]">
              <span className="text-zinc-400 text-[10px] block">Optimized Outflow:</span>
              <strong className="text-emerald-400">{formatCurrency(newExpenses, currency)}</strong>
            </div>
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]">
              <span className="text-zinc-400 text-[10px] block">Boosted Monthly SIP:</span>
              <strong className="text-amber-400">{formatCurrency(scenarioSurplus, currency)}</strong>
            </div>
            <div className="bg-[#161922] p-3 rounded-xl border border-[#1f2937]">
              <span className="text-zinc-400 text-[10px] block">Optimized Return:</span>
              <strong className="text-amber-400">{scenarioReturn}% CAGR</strong>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
            <div className="text-[11px] text-emerald-300">7-Year Projected Maturity Corpus</div>
            <div className="text-xl font-black text-emerald-300">
              {formatCurrency(scenarioSim.finalCorpus, currency)}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-between">
              <span>Gain vs Status Quo:</span>
              <span>+{formatCurrency(extraWealthGenerated, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Levers / Sandbox Controls */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1f2937]">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-zinc-100">Adjust Scenario Variables</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Discretionary Expense Reduction */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300">Cut Discretionary Spend</span>
              <span className="font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {expenseCutPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={expenseCutPercent}
              onChange={(e) => setExpenseCutPercent(Number(e.target.value))}
              className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[10px] text-zinc-400">
              Saves ~{formatCurrency(expenseSavings, currency)}/month on dining & shopping.
            </p>
          </div>

          {/* Extra Monthly Investment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300">Extra Monthly Top-Up</span>
              <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                +{formatCurrency(extraMonthlySIP, currency)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={extraMonthlySIP}
              onChange={(e) => setExtraMonthlySIP(Number(e.target.value))}
              className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[10px] text-zinc-400">
              Redirect spare freelance or bonus money.
            </p>
          </div>

          {/* Salary / Career Increment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300">Expected Career Raise</span>
              <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                +{salaryRaisePercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={salaryRaisePercent}
              onChange={(e) => setSalaryRaisePercent(Number(e.target.value))}
              className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[10px] text-zinc-400">
              Appraisal or career promotion increment.
            </p>
          </div>

          {/* Portfolio Alpha / Optimization */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300">Portfolio Alpha / Yield</span>
              <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                +{returnChange}% CAGR
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="5"
              step="0.5"
              value={returnChange}
              onChange={(e) => setReturnChange(Number(e.target.value))}
              className="w-full h-2 bg-[#161922] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[10px] text-zinc-400">
              Index fund discipline vs high-cost active funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
