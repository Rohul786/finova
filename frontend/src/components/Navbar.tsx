import React from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCIES, formatCompactCurrency } from '../utils/formatters';
import { FinovaLogo } from './FinovaLogo';
import {
  Plus,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onToggleMobileNav?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onToggleMobileNav,
  isSidebarOpen = false,
}) => {
  const toggle = onToggleSidebar || onToggleMobileNav || (() => {});
  const {
    userProfile,
    currency,
    setCurrency,
    setIsQuickAddOpen,
    monthlyStats,
    setActiveTab,
    riskProfile,
    logout,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#111318]/95 backdrop-blur-md border-b border-[#1f2937] text-zinc-100 px-4 lg:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-sidebar-toggle"
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1f2937] transition-colors"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {userProfile.appLogoUrl ? (
              <img
                src={userProfile.appLogoUrl}
                alt="Finova Logo"
                className="w-9 h-9 rounded-xl object-cover border border-[#1f2937] shadow-lg group-hover:scale-105 transition-transform"
              />
            ) : (
              <FinovaLogo size={36} className="group-hover:scale-105 transition-transform" />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-zinc-100">
                  FINOVA
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
                Track. Plan. Invest. Grow.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Financial Summary Pill (Desktop) */}
        <div className="hidden md:flex items-center gap-4 bg-[#161922] border border-[#1f2937] rounded-full px-4 py-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Monthly Surplus:</span>
            <span className="font-semibold text-emerald-400">
              {formatCompactCurrency(monthlyStats.netSavings, currency)}
            </span>
          </div>
          <div className="w-px h-3.5 bg-[#1f2937]" />
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Savings Rate:</span>
            <span className="font-semibold text-amber-300">
              {monthlyStats.savingsRate}%
            </span>
          </div>
          <div className="w-px h-3.5 bg-[#1f2937]" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-300 font-medium">{riskProfile.category}</span>
          </div>
        </div>

        {/* Right: Actions (Currency selector, Quick Add, AI Co-Pilot, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <select
            id="select-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-[#161922] text-zinc-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#111318] text-zinc-200">
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>

          {/* Quick Add Button */}
          <button
            id="btn-quick-add-tx"
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>

          {/* Finova AI Assistant Co-Pilot Trigger */}
          <button
            id="btn-nav-ai-advisor"
            onClick={() => setActiveTab('ai_copilot')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181b22] hover:bg-[#202530] text-amber-300 text-xs font-semibold border border-amber-500/30 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">AI Advisor</span>
          </button>

          {/* Investor Profile Button */}
          <button
            onClick={() => setActiveTab('login')}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#181c26] border border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer group"
            title={`Investor Profile: ${userProfile.name} (Click to edit or switch profile)`}
          >
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-400/60"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                {userProfile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 hidden xl:inline max-w-[100px] truncate">
              {userProfile.name?.split(' ')[0] || 'Profile'}
            </span>
          </button>

          {/* Log Out Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-[#181c26] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-[#1f2937] hover:border-rose-500/30 transition-all cursor-pointer"
            title="Log Out & Lock App"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
