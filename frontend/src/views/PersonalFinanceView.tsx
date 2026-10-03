import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import {
  Wallet,
  PieChart,
  Edit2,
  Check,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const PersonalFinanceView: React.FC = () => {
  const {
    categories,
    updateBudgetCategory,
    currency,
    monthlyStats,
    transactions,
    userProfile,
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const handleStartEdit = (id: string, currentAllocated: number) => {
    setEditingId(id);
    setEditAmount(String(currentAllocated));
  };

  const handleSaveEdit = (id: string) => {
    const num = parseFloat(editAmount);
    if (!isNaN(num) && num >= 0) {
      updateBudgetCategory(id, num);
    }
    setEditingId(null);
  };

  // 50/30/20 rule calculation
  // Needs: Rent & Housing, Utilities, Transportation, Health, Education
  // Wants: Food (partly), Entertainment, Shopping, Miscellaneous
  // Savings: Investments & Savings, Surplus
  const totalIncome = monthlyStats.income || userProfile.monthlyIncome || 50000;

  const needsCategories = ['Rent & Housing', 'Utilities', 'Transportation', 'Health & Fitness', 'Education'];
  const wantsCategories = ['Food & Dining', 'Entertainment', 'Shopping', 'Miscellaneous'];

  const needsSpent = categories
    .filter((c) => needsCategories.includes(c.name))
    .reduce((sum, c) => sum + c.spent, 0);

  const wantsSpent = categories
    .filter((c) => wantsCategories.includes(c.name))
    .reduce((sum, c) => sum + c.spent, 0);

  const savingsSpent = monthlyStats.investments + monthlyStats.netSavings;

  const needsTarget = Math.round(totalIncome * 0.5);
  const wantsTarget = Math.round(totalIncome * 0.3);
  const savingsTarget = Math.round(totalIncome * 0.2);

  const needsPercent = Math.round((needsSpent / totalIncome) * 100);
  const wantsPercent = Math.round((wantsSpent / totalIncome) * 100);
  const savingsPercent = Math.round((savingsSpent / totalIncome) * 100);

  // Recurring transactions
  const recurringBills = transactions.filter((t) => t.isRecurring);
  const totalRecurring = recurringBills.reduce((sum, t) => sum + t.amount, 0);

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Finova Budget Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Personal Finance & Budgets
          </h1>
          <p className="text-xs text-zinc-400">
            Set intelligent category spending caps, adhere to the 50/30/20 rule, and prevent overspending.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#111318] border border-[#1f2937] rounded-xl p-3">
          <div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">Total Budget Allocated</div>
            <div className="text-sm font-extrabold text-zinc-100">
              {formatCurrency(totalAllocated, currency)}
            </div>
          </div>
          <div className="w-px h-8 bg-[#1f2937]" />
          <div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">Total Spent</div>
            <div className={`text-sm font-extrabold ${totalSpent > totalAllocated ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatCurrency(totalSpent, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* 50 / 30 / 20 Framework Card */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              50 / 30 / 20 Financial Framework
            </h3>
            <p className="text-xs text-zinc-400">
              Standard benchmark of healthy personal budgeting based on your {formatCurrency(totalIncome, currency)} monthly income
            </p>
          </div>
          <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
            {savingsPercent >= 20 ? '✅ Healthy Savings Ratio' : '⚠️ Low Savings Ratio'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Needs (50%) */}
          <div className="p-4 rounded-xl bg-[#161922] border border-[#1f2937] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">Needs & Essentials (50%)</span>
              <span className={`text-xs font-bold ${needsPercent > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {needsPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#101217] rounded-full overflow-hidden">
              <div
                className={`h-full ${needsPercent > 50 ? 'bg-rose-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, needsPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Spent: {formatCurrency(needsSpent, currency)}</span>
              <span>Target: {formatCurrency(needsTarget, currency)}</span>
            </div>
            <p className="text-[10px] text-zinc-400">Rent, utilities, transit, medicine, essential food</p>
          </div>

          {/* Wants (30%) */}
          <div className="p-4 rounded-xl bg-[#161922] border border-[#1f2937] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">Wants & Discretionary (30%)</span>
              <span className={`text-xs font-bold ${wantsPercent > 30 ? 'text-amber-400' : 'text-amber-500'}`}>
                {wantsPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#101217] rounded-full overflow-hidden">
              <div
                className={`h-full ${wantsPercent > 30 ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, wantsPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Spent: {formatCurrency(wantsSpent, currency)}</span>
              <span>Target: {formatCurrency(wantsTarget, currency)}</span>
            </div>
            <p className="text-[10px] text-zinc-400">Dine-out, subscriptions, leisure, shopping</p>
          </div>

          {/* Savings & Investments (20%) */}
          <div className="p-4 rounded-xl bg-[#161922] border border-[#1f2937] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">Savings & SIPs (20%+)</span>
              <span className="text-xs font-bold text-emerald-400">{savingsPercent}%</span>
            </div>
            <div className="w-full h-2 bg-[#101217] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${Math.min(100, savingsPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Saved/Invested: {formatCurrency(savingsSpent, currency)}</span>
              <span>Target: {formatCurrency(savingsTarget, currency)}</span>
            </div>
            <p className="text-[10px] text-zinc-400">Equity index SIPs, emergency fund, gold</p>
          </div>
        </div>
      </div>

      {/* Category Budgets Management Grid */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              Category Budget Limits & Tracking
            </h3>
            <p className="text-xs text-zinc-400">
              Click on any limit to edit your monthly spending threshold
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const isOver = cat.spent > cat.allocated;
            const remaining = cat.allocated - cat.spent;
            const percentage = Math.round((cat.spent / (cat.allocated || 1)) * 100);
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-[#161922] border border-[#1f2937] hover:border-zinc-700 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-bold text-zinc-100">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-20 bg-[#0a0b0d] text-zinc-100 text-xs px-2 py-1 rounded border border-amber-500 font-bold focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(cat.id, cat.allocated)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-amber-300 text-xs px-2 py-0.5 rounded hover:bg-[#1f2937] transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-zinc-200">
                          Limit: {formatCurrency(cat.allocated, currency)}
                        </span>
                        <Edit2 className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-[#101217] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : percentage >= cat.warningThreshold
                          ? 'bg-amber-500'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">
                      Spent: <strong className="text-zinc-200">{formatCurrency(cat.spent, currency)}</strong> ({percentage}%)
                    </span>
                    <span className={isOver ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                      {isOver ? `Over by ${formatCurrency(Math.abs(remaining), currency)}` : `Left: ${formatCurrency(remaining, currency)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Bills & Subscriptions Manager */}
      <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Recurring Subscriptions & Monthly Bills
            </h3>
            <p className="text-xs text-zinc-400">
              Automated expenses and essential recurring payments ({recurringBills.length} active)
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400">Monthly Commitment:</span>
            <div className="text-sm font-extrabold text-cyan-400">
              {formatCurrency(totalRecurring, currency)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recurringBills.map((bill) => (
            <div
              key={bill.id}
              className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-zinc-100">{bill.title}</div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                  <span className="bg-[#101217] px-1.5 py-0.2 rounded border border-[#1f2937]">{bill.category}</span>
                  <span>•</span>
                  <span>{bill.paymentMethod}</span>
                </div>
              </div>
              <div className="text-xs font-extrabold text-zinc-100">
                {formatCurrency(bill.amount, currency)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
