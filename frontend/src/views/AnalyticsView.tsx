import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Layers,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { categories, transactions, monthlyStats, currency } = useApp();

  // Category expense breakdown
  const expenseCategories = categories
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const totalExpense = monthlyStats.expenses || 1;

  // Payment method distribution
  const paymentMethodMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      paymentMethodMap[t.paymentMethod] = (paymentMethodMap[t.paymentMethod] || 0) + t.amount;
    });

  const paymentMethods = Object.entries(paymentMethodMap).map(([method, amount]) => ({
    method,
    amount,
    percentage: Math.round((amount / totalExpense) * 100),
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Financial Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Analytics & Spending Visualizer
          </h1>
          <p className="text-xs text-zinc-400">
            Deep-dive visual analysis into your cashflow, category expenditures, and payment channels.
          </p>
        </div>
      </div>

      {/* Cashflow Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4">
          <span className="text-xs font-semibold text-zinc-400">Monthly Burn Rate</span>
          <div className="text-xl font-extrabold text-zinc-100 mt-1">
            {formatCurrency(Math.round(monthlyStats.expenses / 30), currency)}
            <span className="text-xs text-zinc-400 font-normal"> / day</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">Avg daily outflow</div>
        </div>

        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4">
          <span className="text-xs font-semibold text-zinc-400">Savings Rate Realized</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {monthlyStats.savingsRate}%
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            Target: 30%+ benchmark
          </div>
        </div>

        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4">
          <span className="text-xs font-semibold text-zinc-400">Investible Ratio</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">
            {Math.round((monthlyStats.investments / (monthlyStats.income || 1)) * 100)}%
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Of total income allocated to assets
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expense Bars */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              Category Expenditure Distribution
            </h3>
            <span className="text-xs text-zinc-400">{expenseCategories.length} Active Categories</span>
          </div>

          <div className="space-y-3.5">
            {expenseCategories.map((cat) => {
              const percentOfTotal = Math.round((cat.spent / totalExpense) * 100);
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-zinc-200">{cat.name}</span>
                    </div>
                    <div className="text-zinc-300 font-medium">
                      <strong className="text-zinc-100">{formatCurrency(cat.spent, currency)}</strong>
                      <span className="text-zinc-400 ml-1.5 font-bold">({percentOfTotal}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#161922] overflow-hidden border border-[#1f2937]/50">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentOfTotal}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Channels & Distribution */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Payment Methods Breakdown
            </h3>
            <span className="text-xs text-zinc-400">UPI, Cards, Net Banking & PayPal</span>
          </div>

          <div className="space-y-3.5">
            {paymentMethods.map((pm, idx) => {
              const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EAB308', '#EC4899', '#8B5CF6'];
              const color = colors[idx % colors.length];

              return (
                <div key={pm.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-zinc-200">{pm.method}</span>
                    </div>
                    <div className="text-zinc-300 font-medium">
                      <strong className="text-zinc-100">{formatCurrency(pm.amount, currency)}</strong>
                      <span className="text-zinc-400 ml-1.5 font-bold">({pm.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#161922] overflow-hidden border border-[#1f2937]/50">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pm.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
