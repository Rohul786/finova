import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCompactCurrency, formatDate } from '../utils/formatters';
import { calculateMonthlyRequiredForGoal } from '../utils/calculations';
import { FinancialGoal } from '../types';
import {
  Target,
  Plus,
  ShieldCheck,
  Laptop,
  GraduationCap,
  Compass,
  TrendingUp,
  HeartPulse,
  Home,
  Car,
  Sparkles,
  CheckCircle2,
  Calendar,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';

const GOAL_ICONS: Record<string, any> = {
  ShieldCheck,
  Laptop,
  GraduationCap,
  Compass,
  TrendingUp,
  HeartPulse,
  Home,
  Car,
  Target,
};

export const GoalsView: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    addFundsToGoal,
    deleteGoal,
    currency,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Tech & Career');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newCurrentAmount, setNewCurrentAmount] = useState('0');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newIcon, setNewIcon] = useState('Target');
  const [newNotes, setNewNotes] = useState('');

  // Fund addition modal/input state
  const [fundGoalId, setFundGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState<string>('');

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalMonthlyCommitted = goals.reduce((sum, g) => sum + (g.completed ? 0 : g.monthlyContribution), 0);
  const completedCount = goals.filter((g) => g.completed).length;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTargetAmount);
    const current = parseFloat(newCurrentAmount) || 0;
    if (!newTitle.trim() || isNaN(target) || target <= 0 || !newTargetDate) return;

    const { monthlyNeeded } = calculateMonthlyRequiredForGoal(target, current, newTargetDate);

    addGoal({
      title: newTitle.trim(),
      category: newCategory,
      targetAmount: target,
      currentAmount: current,
      targetDate: newTargetDate,
      monthlyContribution: monthlyNeeded || Math.round(target / 12),
      priority: newPriority,
      icon: newIcon,
      notes: newNotes.trim() || undefined,
      completed: current >= target,
    });

    // Reset
    setNewTitle('');
    setNewTargetAmount('');
    setNewCurrentAmount('0');
    setNewTargetDate('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleAddFundsSubmit = (goalId: string) => {
    const num = parseFloat(fundAmount);
    if (!isNaN(num) && num > 0) {
      addFundsToGoal(goalId, num);
    }
    setFundGoalId(null);
    setFundAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Smart Goal Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Financial Goals & Milestones
          </h1>
          <p className="text-xs text-zinc-400">
            Set ambitious targets, calculate exact monthly compounding requirements, and celebrate milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goal Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4">
          <div className="text-xs font-semibold text-zinc-400 mb-1">Total Goals Corpus Target</div>
          <div className="text-xl lg:text-2xl font-extrabold text-zinc-100">
            {formatCurrency(totalTarget, currency)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {goals.length} targets configured ({completedCount} achieved)
          </div>
        </div>

        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4">
          <div className="text-xs font-semibold text-zinc-400 mb-1">Total Accumulated Capital</div>
          <div className="text-xl lg:text-2xl font-extrabold text-emerald-400">
            {formatCurrency(totalSaved, currency)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Overall progress:{' '}
            <strong className="text-emerald-400">
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </strong>
          </div>
        </div>

        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4">
          <div className="text-xs font-semibold text-zinc-400 mb-1">Required Monthly Savings</div>
          <div className="text-xl lg:text-2xl font-extrabold text-amber-400">
            {formatCurrency(totalMonthlyCommitted, currency)}
            <span className="text-xs text-zinc-400 font-normal"> / mo</span>
          </div>
          <div className="text-xs text-amber-300/80 mt-1">
            Needed across all active goals
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const { monthlyNeeded, monthsRemaining, isOverdue } = calculateMonthlyRequiredForGoal(
            goal.targetAmount,
            goal.currentAmount,
            goal.targetDate
          );
          const IconComp = GOAL_ICONS[goal.icon] || Target;

          return (
            <div
              key={goal.id}
              className={`p-5 rounded-2xl bg-[#111318] border transition-all relative overflow-hidden flex flex-col justify-between ${
                goal.completed
                  ? 'border-emerald-500/40 bg-gradient-to-br from-[#111318] via-[#111318] to-emerald-950/20'
                  : 'border-[#1f2937] hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Top Badge & Priority */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        goal.completed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {goal.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        goal.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : goal.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-[#161922] text-zinc-400 border border-[#1f2937]'
                      }`}
                    >
                      {goal.priority} priority
                    </span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Notes */}
                <h3 className="text-base font-bold text-zinc-100 mb-1">{goal.title}</h3>
                {goal.notes && (
                  <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{goal.notes}</p>
                )}

                {/* Progress Bar & Amount */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-300">
                      Saved: <strong className="text-zinc-100">{formatCurrency(goal.currentAmount, currency)}</strong>
                    </span>
                    <span className="text-zinc-400">
                      Target: <strong className="text-zinc-200">{formatCurrency(goal.targetAmount, currency)}</strong>
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#101217] overflow-hidden border border-[#1f2937]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-300'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{percent}% completed</span>
                    <span>
                      {goal.completed
                        ? '🎉 Goal Achieved!'
                        : `${formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), currency)} remaining`}
                    </span>
                  </div>
                </div>

                {/* Timeline & Monthly Calculation */}
                {!goal.completed && (
                  <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] flex items-center justify-between text-xs my-2">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{monthsRemaining} months left ({formatDate(goal.targetDate)})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Required Monthly SIP:</span>
                      <span className="font-extrabold text-emerald-400">
                        {formatCurrency(monthlyNeeded, currency)}/mo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fund Action */}
              <div className="pt-3 mt-1 border-t border-[#1f2937]">
                {fundGoalId === goal.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="Enter amount to add..."
                      className="flex-1 bg-[#101217] text-zinc-100 text-xs px-3 py-1.5 rounded-lg border border-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddFundsSubmit(goal.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setFundGoalId(null)}
                      className="px-2 py-1.5 text-zinc-400 hover:text-zinc-100 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setFundGoalId(goal.id);
                        setFundAmount(String(goal.monthlyContribution || 5000));
                      }}
                      className="flex-1 py-2 bg-[#161922] hover:bg-[#1f2937] text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#1f2937] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add Funds</span>
                    </button>

                    <button
                      onClick={() => addFundsToGoal(goal.id, goal.monthlyContribution || 5000)}
                      className="py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      title="Quick Deposit Monthly SIP"
                    >
                      +{formatCompactCurrency(goal.monthlyContribution || 5000, currency)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#111318] border border-[#1f2937] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-zinc-100">Create Financial Goal</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Higher Education Semester Fund, First Car"
                  className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Target Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    placeholder="100000"
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Current Savings ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCurrentAmount}
                    onChange={(e) => setNewCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Safety">Safety & Emergency</option>
                    <option value="Tech & Career">Tech & Career</option>
                    <option value="Education">Education & Tuition</option>
                    <option value="Travel">Travel & Experience</option>
                    <option value="Wealth">Long-Term Wealth</option>
                    <option value="Vehicle">Vehicle / House</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Icon Theme
                  </label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Target">Target Goal</option>
                    <option value="ShieldCheck">Safety Shield</option>
                    <option value="Laptop">Laptop / Tech</option>
                    <option value="GraduationCap">Graduation</option>
                    <option value="Compass">Compass / Travel</option>
                    <option value="TrendingUp">Wealth Compounding</option>
                    <option value="Car">Car / Transport</option>
                    <option value="Home">Home / Real Estate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Parked in arbitrage fund or high-interest deposit..."
                  className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-[#161922] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
