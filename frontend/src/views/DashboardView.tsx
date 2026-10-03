import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency, formatDate } from '../utils/formatters';
import { calculateFinancialHealthScore } from '../utils/calculations';
import { StockTickerTape } from '../components/StockTickerTape';
import { StockMarketWidget } from '../components/StockMarketWidget';
import { CurrencyConverterWidget } from '../components/CurrencyConverterWidget';
import { FinovaLogo } from '../components/FinovaLogo';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Target,
  ShieldCheck,
  Sparkles,
  Plus,
  Compass,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  PieChart,
  Bot,
  Zap,
  Activity,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    userProfile,
    currency,
    monthlyStats,
    categories,
    transactions,
    goals,
    riskProfile,
    setActiveTab,
    setIsQuickAddOpen,
    addFundsToGoal,
  } = useApp();

  const [aiInsights, setAiInsights] = useState<{
    healthScore: number;
    summary: string;
    highlights: string[];
    actionableTips: string[];
  } | null>(null);

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const health = calculateFinancialHealthScore(
    monthlyStats.income,
    monthlyStats.expenses,
    goals,
    categories
  );

  // Fetch AI Budget Analysis on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchAiAudit() {
      setIsLoadingAi(true);
      try {
        const res = await fetch('/api/gemini/analyze-budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            income: monthlyStats.income,
            expenses: monthlyStats.expenses,
            categories: categories.map((c) => ({ name: c.name, spent: c.spent, allocated: c.allocated })),
            transactionsSummary: transactions.slice(0, 5).map((t) => ({
              title: t.title,
              amount: t.amount,
              category: t.category,
            })),
          }),
        });
        const data = await res.json();
        if (isMounted && data.summary) {
          setAiInsights(data);
        }
      } catch (err) {
        console.error('Failed to fetch AI insights', err);
      } finally {
        if (isMounted) setIsLoadingAi(false);
      }
    }

    fetchAiAudit();
    return () => {
      isMounted = false;
    };
  }, [monthlyStats.income, monthlyStats.expenses]);

  const recentTransactions = transactions.slice(0, 5);
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 3);
  const topSpentCategories = [...categories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Live Market Ticker Tape Banner */}
      <StockTickerTape />

      {/* Top Banner / Hero Card with Official Finova Brand Badge */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111318] border border-[#1f2937] p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="shrink-0 p-1 rounded-2xl bg-[#161922] border border-[#1f2937] shadow-lg shadow-emerald-500/10">
              <FinovaLogo size={52} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Finova Dashboard
                </span>
                <span className="text-xs text-zinc-400">
                  • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2">
                <span>Welcome back, {userProfile.name}</span>
                <span className="text-xl">👋</span>
              </h1>
            </div>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-3 bg-[#161922] border border-[#1f2937] rounded-2xl p-3.5 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-lg shadow-md">
              {health.grade}
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-zinc-400">
                Health Score
              </div>
              <div className="text-base font-extrabold text-zinc-100">
                {health.score}
                <span className="text-xs text-zinc-400 font-normal"> / 100</span>
              </div>
              <div className="text-[11px] font-semibold text-amber-400">
                {health.ratingText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Income */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-extrabold text-zinc-100">
            {formatCurrency(monthlyStats.income, currency)}
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>Take-home salary & freelance</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Outflow</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-extrabold text-zinc-100">
            {formatCurrency(monthlyStats.expenses, currency)}
          </div>
          <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
            <span>
              {Math.round((monthlyStats.expenses / (monthlyStats.income || 1)) * 100)}% of income
            </span>
          </div>
        </div>

        {/* Monthly Investments */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Investments & SIPs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-extrabold text-zinc-100">
            {formatCurrency(monthlyStats.investments, currency)}
          </div>
          <div className="text-xs text-amber-400 mt-1 flex items-center gap-1 font-medium">
            <span>{riskProfile.category} allocation</span>
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Monthly Surplus</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-extrabold text-amber-300">
            {formatCurrency(monthlyStats.netSavings, currency)}
          </div>
          <div className="text-xs text-zinc-300 mt-1 font-medium flex items-center justify-between">
            <span>Savings Rate:</span>
            <span className="font-bold text-amber-400">{monthlyStats.savingsRate}%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2937] text-zinc-200 text-xs font-semibold border border-[#1f2937] transition-all active:scale-95 cursor-pointer"
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Manage Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('risk_assessment')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2937] text-zinc-200 text-xs font-semibold border border-[#1f2937] transition-all active:scale-95 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Risk Assessment</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_planner')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2937] text-zinc-200 text-xs font-semibold border border-[#1f2937] transition-all active:scale-95 cursor-pointer"
        >
          <Bot className="w-4 h-4 text-amber-400" />
          <span>AI Investment Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2937] text-zinc-200 text-xs font-semibold border border-[#1f2937] transition-all active:scale-95 cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Wealth Simulator</span>
        </button>
      </div>

      {/* Main Grid: Budget Gauges & AI Insights Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Budgets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-400" />
                  Smart Budget Meters
                </h3>
                <p className="text-xs text-zinc-400">
                  Current monthly spending vs allocated budget caps
                </p>
              </div>
              <button
                onClick={() => setActiveTab('personal_finance')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Budgets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {topSpentCategories.map((cat) => {
                const percent = Math.min(100, Math.round((cat.spent / (cat.allocated || 1)) * 100));
                const isOverBudget = cat.spent > cat.allocated;
                const isWarning = percent >= cat.warningThreshold && !isOverBudget;

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-zinc-200">{cat.name}</span>
                        {isOverBudget && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                            Over Limit!
                          </span>
                        )}
                        {isWarning && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                            Near Limit
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-300 font-medium">
                        <span className="font-bold text-zinc-100">
                          {formatCurrency(cat.spent, currency)}
                        </span>
                        <span className="text-zinc-400"> / {formatCurrency(cat.allocated, currency)}</span>
                        <span className="text-zinc-400 text-[11px] ml-1.5 font-bold">
                          ({percent}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#161922] border border-[#1f2937] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-amber-400'
                        }`}
                        style={{
                          width: `${Math.min(100, (cat.spent / (cat.allocated || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Goals Progress Cards */}
          <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Active Financial Goals
                </h3>
                <p className="text-xs text-zinc-400">
                  Target milestones and required monthly savings
                </p>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Goals</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeGoals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-xl bg-[#161922] border border-[#1f2937] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {goal.category}
                        </span>
                        <span className="text-xs font-bold text-zinc-100">{percent}%</span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200 line-clamp-1 mb-2">
                        {goal.title}
                      </h4>
                      <div className="w-full h-1.5 bg-[#101217] rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-zinc-400 flex justify-between">
                        <span>{formatCompactCurrency(goal.currentAmount, currency)}</span>
                        <span className="font-semibold text-zinc-200">
                          {formatCompactCurrency(goal.targetAmount, currency)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => addFundsToGoal(goal.id, goal.monthlyContribution || 1000)}
                      className="mt-3 w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add {formatCompactCurrency(goal.monthlyContribution || 1000, currency)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Finova AI Insights & Audit */}
        <div className="space-y-6">
          <div className="bg-[#13161f] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <FinovaLogo size={32} />
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>Finova AI Insights</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-amber-400">Smart Gemini Financial Co-Pilot</p>
                </div>
              </div>
            </div>

            {isLoadingAi ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-zinc-400">Analyzing your financial flow...</p>
              </div>
            ) : aiInsights ? (
              <div className="space-y-3.5 text-xs text-zinc-200">
                <p className="font-medium text-amber-100 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40">
                  {aiInsights.summary}
                </p>

                <div className="space-y-2">
                  <div className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Key Actionable Tips:
                  </div>
                  {aiInsights.actionableTips?.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-[#161922] p-2 rounded-lg border border-[#1f2937]"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-zinc-300">{tip}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('ai_copilot')}
                  className="w-full mt-2 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <FinovaLogo size={18} withBackground={false} />
                  <span>Ask Finova AI Advisor</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-zinc-300">
                <p>
                  Your current monthly savings rate is <strong>{monthlyStats.savingsRate}%</strong>.
                  You have a healthy surplus of {formatCurrency(monthlyStats.netSavings, currency)} to
                  deploy into your {riskProfile.category} investment plan.
                </p>
                <button
                  onClick={() => setActiveTab('ai_copilot')}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FinovaLogo size={18} withBackground={false} />
                  <span>Start Finova AI Consultation</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-100">Recent Transactions</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                View Ledger
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isInv = tx.type === 'investment';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#161922] border border-[#1f2937] hover:bg-[#1a1e29] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isInv
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : isInv ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-zinc-200 truncate">
                          {tx.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                          <span>{tx.category}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-bold shrink-0 ml-2 ${
                        isIncome
                          ? 'text-emerald-400'
                          : isInv
                          ? 'text-amber-300'
                          : 'text-zinc-200'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global Currency Conversion & Asset Comparator */}
      <CurrencyConverterWidget />

      {/* Stock Markets & Live Watchlist Section */}
      <StockMarketWidget />
    </div>
  );
};
