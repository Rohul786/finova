import React from 'react';
import { useApp } from '../context/AppContext';
import { FinovaLogo } from './FinovaLogo';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  Compass,
  Bot,
  TrendingUp,
  GitCompare,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  isOpenMobile?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
  { id: 'authenticate', label: 'KYC & Authenticate', icon: ShieldCheck, badge: 'KYC' },
  { id: 'personal_finance', label: 'Budgets & Limits', icon: Wallet, badge: '50/30/20' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, badge: '' },
  { id: 'goals', label: 'Financial Goals', icon: Target, badge: '' },
  { id: 'risk_assessment', label: 'Risk Assessment', icon: Compass, badge: 'Profile' },
  { id: 'ai_planner', label: 'AI Investment Planner', icon: Bot, badge: 'Smart' },
  { id: 'simulator', label: 'Wealth Simulator', icon: TrendingUp, badge: 'SIP Calc' },
  { id: 'what_if', label: 'What-If Analysis', icon: GitCompare, badge: 'Sandbox' },
  { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3, badge: '' },
  { id: 'ai_copilot', label: 'AI Financial Advisor', icon: Sparkles, badge: 'Gemini + GPT' },
  { id: 'settings', label: 'Settings & Exports', icon: Settings, badge: '' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isOpenMobile,
  onClose,
  onCloseMobile,
}) => {
  const isDrawerOpen = isOpen ?? isOpenMobile ?? false;
  const handleClose = onClose || onCloseMobile || (() => {});
  const { activeTab, setActiveTab, userProfile, riskProfile, logout } = useApp();

  const handleSelect = (id: string) => {
    setActiveTab(id);
    handleClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isDrawerOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 h-full lg:h-[calc(100vh-57px)] w-64 bg-[#111318] border-r border-[#1f2937] flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside mobile drawer */}
        <div className="p-4 border-b border-[#1f2937] lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {userProfile.appLogoUrl ? (
              <img
                src={userProfile.appLogoUrl}
                alt="Finova Logo"
                className="w-8 h-8 rounded-xl object-cover"
              />
            ) : (
              <FinovaLogo size={32} />
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-zinc-100 tracking-tight">FINOVA</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Navigation Menu
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeText =
              item.id === 'authenticate'
                ? userProfile.isVerified
                  ? 'Verified ✓'
                  : 'KYC Required'
                : item.badge;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-zinc-300 hover:bg-[#181b22] hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {badgeText && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      isActive
                        ? 'bg-black/20 text-zinc-950'
                        : item.id === 'authenticate' && userProfile.isVerified
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                        : item.id === 'authenticate'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : badgeText.includes('Gemini') || badgeText === 'Smart'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-[#181b22] text-zinc-400'
                    }`}
                  >
                    {badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile card & KYC Status Trigger */}
        <div className="p-3 border-t border-[#1f2937] bg-[#0e1014] space-y-2">
          <div className="p-2.5 rounded-xl bg-[#161922] hover:bg-[#1e2330] border border-[#1f2937] hover:border-amber-500/40 flex items-center justify-between gap-2.5 transition-colors group">
            <div
              onClick={() => handleSelect('authenticate')}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
              title="Click to view KYC Authentication & Verified Badge details"
            >
              <div className="relative shrink-0">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-full object-cover border border-amber-400/60 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center font-bold text-zinc-950 text-xs shadow-xs shrink-0">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {userProfile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-zinc-950 flex items-center justify-center text-zinc-950 text-[9px] font-black">
                    ✓
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-zinc-100 group-hover:text-amber-300 transition-colors truncate">
                    {userProfile.name}
                  </span>
                  {userProfile.isVerified && (
                    <span className="text-emerald-400 text-[11px] font-bold" title="Verified Investor">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      userProfile.isVerified ? 'bg-emerald-400' : 'bg-amber-400'
                    } inline-block`}
                  />
                  <span className="truncate">
                    {userProfile.isVerified ? 'Verified Profile' : 'KYC Pending'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="px-1 text-[10px] text-zinc-500 leading-tight">
            Educational AI planner. Not SEBI/SEC financial advisory.
          </div>
        </div>
      </aside>
    </>
  );
};
