import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import {
  Bot,
  Sparkles,
  PieChart,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Info,
  CheckCircle2,
  DollarSign,
  Layers,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const AIInvestmentPlannerView: React.FC = () => {
  const {
    riskProfile,
    monthlyStats,
    currency,
    userProfile,
    goals,
    setActiveTab,
  } = useApp();

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customAiPlan, setCustomAiPlan] = useState<{
    portfolioName: string;
    rationale: string;
    allocations: Array<{
      asset: string;
      percentage: number;
      monthlyAmount: number;
      riskLevel: string;
      expectedReturn: string;
    }>;
    projected5YearCorpus: number;
    projected10YearCorpus: number;
    keyPrinciples: string[];
  } | null>(null);

  const monthlyInvestible = monthlyStats.netSavings > 0 ? monthlyStats.netSavings : 15000;

  const currentAllocations = customAiPlan?.allocations || riskProfile.recommendedAllocations;

  const handleGenerateCustomPlan = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/plan-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          riskProfile,
          monthlySurplus: monthlyInvestible,
          goals: goals.map((g) => ({ title: g.title, targetAmount: g.targetAmount, targetDate: g.targetDate })),
        }),
      });
      const data = await res.json();
      if (data.portfolioName) {
        setCustomAiPlan(data);
      }
    } catch (err) {
      console.error('Error generating AI portfolio', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              AI Asset Allocation Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            AI Investment Planner
          </h1>
          <p className="text-xs text-zinc-400">
            Intelligent, risk-tailored multi-asset allocation powered by mathematical optimization & Gemini AI.
          </p>
        </div>

        <button
          onClick={handleGenerateCustomPlan}
          disabled={isGeneratingAi}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isGeneratingAi ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
          ) : (
            <Sparkles className="w-4 h-4 text-zinc-950 animate-pulse" />
          )}
          <span>{isGeneratingAi ? 'Synthesizing Strategy...' : 'Generate Gemini AI Strategy'}</span>
        </button>
      </div>

      {/* Rationale & Risk Anchor Banner */}
      <div className="bg-gradient-to-br from-[#161922] via-[#111318] to-[#111318] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-bold text-zinc-400">Strategy Profile:</span>
              <span className="text-sm font-black text-amber-400">
                {customAiPlan ? customAiPlan.portfolioName : `${riskProfile.category} Growth Blueprint`}
              </span>
            </div>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              {customAiPlan ? customAiPlan.rationale : riskProfile.explanation}
            </p>
          </div>

          <div className="bg-[#161922] p-3.5 rounded-xl border border-[#1f2937] shrink-0 text-right">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Monthly Investible Surplus</div>
            <div className="text-lg font-black text-emerald-400">
              {formatCurrency(monthlyInvestible, currency)}
              <span className="text-xs font-normal text-zinc-400">/mo</span>
            </div>
          </div>
        </div>

        {/* Visual Allocation Horizontal Multi-Segment Bar */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-zinc-300 flex justify-between">
            <span>Asset Allocation Distribution</span>
            <span className="text-amber-400">100% Total Deployed</span>
          </div>

          <div className="w-full h-4 rounded-xl overflow-hidden flex bg-[#101217] p-0.5 border border-[#1f2937]">
            {currentAllocations.map((item, idx) => {
              const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EAB308', '#8B5CF6', '#EC4899'];
              const color = (item as any).color || colors[idx % colors.length];
              return (
                <div
                  key={idx}
                  style={{ width: `${item.percentage}%`, backgroundColor: color }}
                  className="h-full first:rounded-l-lg last:rounded-r-lg transition-all relative group"
                  title={`${item.asset}: ${item.percentage}%`}
                />
              );
            })}
          </div>

          {/* Allocation Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
            {currentAllocations.map((item, idx) => {
              const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EAB308', '#8B5CF6', '#EC4899'];
              const color = (item as any).color || colors[idx % colors.length];
              return (
                <div key={idx} className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium truncate max-w-[160px]">{item.asset}</span>
                  <strong className="text-zinc-100">({item.percentage}%)</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Asset Breakdown Table */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#1f2937] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              Monthly SIP Deployment Breakdown
            </h3>
            <p className="text-xs text-zinc-400">
              Exact monthly allocation calculated for your investible surplus of {formatCurrency(monthlyInvestible, currency)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f2937] bg-[#161922] text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4">Asset Class</th>
                <th className="py-3.5 px-4">Allocation %</th>
                <th className="py-3.5 px-4">Monthly Investment</th>
                <th className="py-3.5 px-4">Risk Rating</th>
                <th className="py-3.5 px-4 text-right">Expected CAGR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/70 text-xs">
              {currentAllocations.map((item, idx) => {
                const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EAB308', '#8B5CF6', '#EC4899'];
                const color = (item as any).color || colors[idx % colors.length];
                const monthlyAmt = Math.round((monthlyInvestible * item.percentage) / 100);

                return (
                  <tr key={idx} className="hover:bg-[#161922]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-bold text-zinc-100">{item.asset}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-zinc-100 bg-[#161922] border border-[#1f2937] px-2 py-0.5 rounded">
                        {item.percentage}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-400">
                        {formatCurrency(monthlyAmt, currency)}
                      </span>
                      <span className="text-zinc-400 text-[10px]"> / mo</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-zinc-300 bg-[#161922] border border-[#1f2937] px-2 py-0.5 rounded text-[11px]">
                        {item.riskLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-amber-300">
                      {item.expectedReturn}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Execution Principles & Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Principles */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Core Execution Principles
          </h3>
          <div className="space-y-2.5">
            {(customAiPlan?.keyPrinciples || [
              'Automate monthly SIPs on salary day (1st-5th of each month) to eliminate timing bias.',
              'Rebalance portfolio once every 6-12 months if equity allocation deviates by >5%.',
              'Never withdraw equity funds during short-term market corrections or drawdowns.',
              'Ensure 6 months of essential living expenses remain in high-yield liquid funds.',
            ]).map((principle, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161922] border border-[#1f2937] text-xs text-zinc-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{principle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Long-term Wealth Potential */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Compounded Wealth Potential
          </h3>
          <p className="text-xs text-zinc-400">
            Estimated future corpus if you consistently deploy {formatCurrency(monthlyInvestible, currency)} monthly:
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#1f2937] text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-400">5-Year Est. Corpus</div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {formatCurrency(
                  customAiPlan?.projected5YearCorpus || Math.round(monthlyInvestible * 12 * 5 * 1.35),
                  currency
                )}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">~13.5% Weighted CAGR</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161922] border border-[#1f2937] text-center">
              <div className="text-[10px] uppercase font-bold text-zinc-400">10-Year Est. Corpus</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                {formatCurrency(
                  customAiPlan?.projected10YearCorpus || Math.round(monthlyInvestible * 12 * 10 * 2.15),
                  currency
                )}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Compounding Multiplier</div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('simulator')}
            className="w-full mt-2 py-2 bg-[#161922] hover:bg-[#1f2937] text-zinc-200 hover:text-white text-xs font-bold rounded-xl border border-[#1f2937] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Interactive Wealth Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SEBI / SEC Educational Disclaimer */}
      <div className="p-4 rounded-xl bg-[#111318] border border-[#1f2937] flex items-start gap-3 text-xs text-zinc-400">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-300 block mb-0.5">Educational Disclosure:</strong>
          Finova is an educational personal finance modeling application. Asset category allocations and CAGR projections are simulated for conceptual learning and do not constitute regulated investment advisory (SEBI/SEC). Past performance does not guarantee future market returns.
        </div>
      </div>
    </div>
  );
};
