import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CurrencyCode, ExpenseBreakdownTargets } from '../types';
import { formatCurrency } from '../utils/formatters';
import { FinovaLogo } from '../components/FinovaLogo';
import {
  Settings,
  User,
  DollarSign,
  Shield,
  RotateCcw,
  CheckCircle2,
  Save,
  Download,
  AlertTriangle,
  Globe,
  Shuffle,
  Sparkles,
  Wallet,
  Home,
  HeartPulse,
  Utensils,
  Zap,
  Car,
  GraduationCap,
  Film,
  TrendingUp,
  Target,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    setUserProfile,
    currency,
    setCurrency,
    resetToDemoData,
    setActiveTab,
    updateAppLogo,
  } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [monthlyIncome, setMonthlyIncome] = useState(String(userProfile.monthlyIncome));
  const [monthlySipTarget, setMonthlySipTarget] = useState(String(userProfile.monthlySipTarget || 18000));
  const [monthlyBudgetCap, setMonthlyBudgetCap] = useState(String(userProfile.monthlyBudgetCap || 38000));
  const [occupation, setOccupation] = useState(userProfile.occupation);
  const [avatarUrl, setAvatarUrl] = useState(
    userProfile.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mamtaz'
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(userProfile.currency || 'INR');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Financial breakdown targets
  const eb = userProfile.expenseBreakdown || {
    rentAndHousing: 18000,
    medicalsAndHealthcare: 3000,
    groceriesAndFood: 12000,
    utilitiesAndBills: 3500,
    transportAndFuel: 4500,
    educationAndLearning: 4000,
    entertainmentAndLeisure: 3500,
    insuranceAndEmergency: 3500,
    miscellaneous: 2000,
  };

  const [rent, setRent] = useState(String(eb.rentAndHousing));
  const [medicals, setMedicals] = useState(String(eb.medicalsAndHealthcare));
  const [groceries, setGroceries] = useState(String(eb.groceriesAndFood));
  const [utilities, setUtilities] = useState(String(eb.utilitiesAndBills));
  const [transport, setTransport] = useState(String(eb.transportAndFuel));
  const [education, setEducation] = useState(String(eb.educationAndLearning));
  const [entertainment, setEntertainment] = useState(String(eb.entertainmentAndLeisure));
  const [insurance, setInsurance] = useState(String(eb.insuranceAndEmergency));
  const [misc, setMisc] = useState(String(eb.miscellaneous));

  const calculatedTotal =
    (parseFloat(rent) || 0) +
    (parseFloat(medicals) || 0) +
    (parseFloat(groceries) || 0) +
    (parseFloat(utilities) || 0) +
    (parseFloat(transport) || 0) +
    (parseFloat(education) || 0) +
    (parseFloat(entertainment) || 0) +
    (parseFloat(insurance) || 0) +
    (parseFloat(misc) || 0);

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const styles = ['bottts', 'adventurer', 'lorelei', 'fun-emoji', 'notionists', 'avataaars'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const newUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=141824,1f2937,0f172a`;
    setAvatarUrl(newUrl);
    setUserProfile((prev) => ({ ...prev, avatarUrl: newUrl }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const incomeNum = parseFloat(monthlyIncome) || 65000;
    const sipNum = parseFloat(monthlySipTarget) || 18000;
    const budgetNum = parseFloat(monthlyBudgetCap) || calculatedTotal || 38000;

    const breakdownData: ExpenseBreakdownTargets = {
      rentAndHousing: parseFloat(rent) || 0,
      medicalsAndHealthcare: parseFloat(medicals) || 0,
      groceriesAndFood: parseFloat(groceries) || 0,
      utilitiesAndBills: parseFloat(utilities) || 0,
      transportAndFuel: parseFloat(transport) || 0,
      educationAndLearning: parseFloat(education) || 0,
      entertainmentAndLeisure: parseFloat(entertainment) || 0,
      insuranceAndEmergency: parseFloat(insurance) || 0,
      miscellaneous: parseFloat(misc) || 0,
    };

    setUserProfile((prev) => ({
      ...prev,
      name,
      email,
      monthlyIncome: incomeNum,
      monthlySipTarget: sipNum,
      monthlyBudgetCap: budgetNum,
      occupation,
      avatarUrl,
      currency: selectedCurrency,
      expenseBreakdown: breakdownData,
    }));
    setCurrency(selectedCurrency);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Configuration
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs text-zinc-400">
          Manage your personal identity, online web avatars, default currency, and application state.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile settings successfully saved and updated across all modules!</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar & Online Web Store Quick Card */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100">Avatar & Web Store Icon</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Web Avatar Store →</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/80 bg-[#161922] p-0.5 shadow-md"
            />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <span className="text-xs text-zinc-300 font-bold">Online Avatar Active</span>
              <p className="text-[11px] text-zinc-400">
                You can randomize a fresh online avatar or launch the comprehensive Web Avatar & Icon Store.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>🎲 Roll Web Avatar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="px-3 py-1.5 rounded-xl bg-[#1f2937] hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Browse 20+ Web Avatars
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Official Finova Brand Logo Card */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Official Finova Brand Logo</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Official Identity
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <FinovaLogo size={64} className="shadow-xl shadow-emerald-500/15 rounded-2xl" />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs text-zinc-200 font-bold">Finova Official Vector Emblem</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Leaf & ₹ Coin</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                The authentic trademark emblem of Finova featuring the aerodynamic ribbon 'F', growth leaf, and glowing Indian Rupee medallion.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateAppLogo('/finova-logo.svg')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Set as App Logo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Identity Card */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1f2937]">
            <User className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-zinc-100">Personal Identity & Career</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Occupation / Professional Domain
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer, University Student, Consultant"
                className="w-full bg-[#161922] text-zinc-100 placeholder:text-zinc-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Baseline Monthly Inflow ({selectedCurrency})
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Financial Targets & Expense Breakdown Card */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Financial Targets & Expense Breakdown</h3>
                <p className="text-[11px] text-zinc-400">Manage monthly limits for rents, medicals, groceries, utilities & SIP targets</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Total Budget: {formatCurrency(calculatedTotal, selectedCurrency)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Monthly SIP / Investment Target ({selectedCurrency})</span>
              </label>
              <input
                type="number"
                value={monthlySipTarget}
                onChange={(e) => setMonthlySipTarget(e.target.value)}
                className="w-full bg-[#161922] text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Monthly Budget Cap ({selectedCurrency})</span>
              </label>
              <input
                type="number"
                value={monthlyBudgetCap}
                onChange={(e) => setMonthlyBudgetCap(e.target.value)}
                className="w-full bg-[#161922] text-cyan-400 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Category-Level Monthly Targets</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Rent & Housing */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Rent & Housing / EMI</span>
                </label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>

              {/* Medicals & Healthcare */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  <span>Medicals & Healthcare</span>
                </label>
                <input
                  type="number"
                  value={medicals}
                  onChange={(e) => setMedicals(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                />
              </div>

              {/* Groceries & Food */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span>Groceries & Dining</span>
                </label>
                <input
                  type="number"
                  value={groceries}
                  onChange={(e) => setGroceries(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                />
              </div>

              {/* Utilities & WiFi Bills */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Utilities & WiFi Bills</span>
                </label>
                <input
                  type="number"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-yellow-500 font-bold"
                />
              </div>

              {/* Transport & Fuel */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-400" />
                  <span>Transport & Fuel</span>
                </label>
                <input
                  type="number"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                />
              </div>

              {/* Education & Upskilling */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Education & Courses</span>
                </label>
                <input
                  type="number"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              {/* Entertainment & OTT */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-pink-400" />
                  <span>Entertainment & OTT</span>
                </label>
                <input
                  type="number"
                  value={entertainment}
                  onChange={(e) => setEntertainment(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                />
              </div>

              {/* Emergency / Insurance */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span>Emergency / Insurance</span>
                </label>
                <input
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold"
                />
              </div>

              {/* Miscellaneous */}
              <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Miscellaneous Discretionary</span>
                </label>
                <input
                  type="number"
                  value={misc}
                  onChange={(e) => setMisc(e.target.value)}
                  className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-zinc-500 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Localization Card */}
        <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1f2937]">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">Default Display Currency</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { code: 'INR', label: 'INR (₹)', desc: 'Indian Rupee' },
              { code: 'USD', label: 'USD ($)', desc: 'US Dollar' },
              { code: 'EUR', label: 'EUR (€)', desc: 'Euro' },
              { code: 'GBP', label: 'GBP (£)', desc: 'British Pound' },
            ].map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelectedCurrency(c.code as CurrencyCode)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedCurrency === c.code
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-sm'
                    : 'bg-[#161922] border-[#1f2937] text-zinc-300 hover:bg-[#1f2937] hover:text-zinc-100'
                }`}
              >
                <div className={`font-extrabold text-sm mb-0.5 ${selectedCurrency === c.code ? 'text-amber-400' : 'text-zinc-100'}`}>{c.label}</div>
                <div className="text-[10px] text-zinc-400">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Data */}
      <div className="bg-[#111318] border border-rose-900/30 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-sm font-bold">Data Management & Reset</h3>
        </div>
        <p className="text-xs text-zinc-400">
          Reset all transaction logs, custom budget limits, and risk profiles back to initial sample state.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all data to default demo state?')) {
                resetToDemoData();
                alert('App state reset to initial demo state.');
              }
            }}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
