import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskCategoryName, RiskProfile, AssetAllocationItem } from '../types';
import {
  Compass,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart2,
} from 'lucide-react';

interface Question {
  id: string;
  title: string;
  category: 'horizon' | 'tolerance' | 'buffer';
  options: {
    label: string;
    points: number;
    description: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1_horizon',
    title: '1. What is your primary investment time horizon?',
    category: 'horizon',
    options: [
      { label: 'Less than 1-2 years', points: 1, description: 'Short term — need money soon for immediate expenses.' },
      { label: '2 to 4 years', points: 2, description: 'Medium term — saving for a car, gadget, or near-term tuition.' },
      { label: '5 to 7 years', points: 3, description: 'Longer term — building initial wealth and career foundation.' },
      { label: '7 to 10+ years', points: 4, description: 'Multi-year long horizon — compounding wealth and retirement.' },
    ],
  },
  {
    id: 'q2_reaction',
    title: '2. If your portfolio drops 20% in a market correction, what would you do?',
    category: 'tolerance',
    options: [
      { label: 'Panic sell everything immediately', points: 1, description: 'Cannot tolerate seeing paper losses.' },
      { label: 'Sell some assets to cut further risk', points: 2, description: 'Move capital into safety and fixed deposits.' },
      { label: 'Stay calm, hold, and wait for recovery', points: 3, description: 'Understand market cycles and hold steady.' },
      { label: 'Aggressively buy more at discount', points: 4, description: 'View market dips as a major buying opportunity.' },
    ],
  },
  {
    id: 'q3_emergency',
    title: '3. What size emergency fund do you have stored in liquid cash?',
    category: 'buffer',
    options: [
      { label: 'Less than 1 month of living expenses', points: 1, description: 'Living paycheck to paycheck.' },
      { label: '1 to 2 months of expenses', points: 2, description: 'Modest cushion for unexpected expenses.' },
      { label: '3 to 6 months of expenses', points: 3, description: 'Solid safety buffer in savings / liquid funds.' },
      { label: 'More than 6 months of expenses', points: 4, description: 'Fully secure financial fortress.' },
    ],
  },
  {
    id: 'q4_objective',
    title: '4. What is your primary investment objective?',
    category: 'tolerance',
    options: [
      { label: 'Capital preservation (Avoid any loss)', points: 1, description: 'Safety first, return is secondary.' },
      { label: 'Stable income with low volatility', points: 2, description: 'Beating inflation with minimal drawdowns.' },
      { label: 'Balanced wealth creation', points: 3, description: 'Mix of equity upside with debt stabilization.' },
      { label: 'Maximum long-term compounding growth', points: 4, description: 'Willing to take volatility for exponential gains.' },
    ],
  },
  {
    id: 'q5_volatility',
    title: '5. How comfortable are you with daily portfolio value fluctuations?',
    category: 'tolerance',
    options: [
      { label: 'Extremely anxious — prefer guaranteed returns', points: 1, description: 'Fixed deposit / savings mindset.' },
      { label: 'Slightly uneasy — okay with minimal swings', points: 2, description: 'Prefer debt funds and conservative hybrids.' },
      { label: 'Comfortable — understand equities fluctuate', points: 3, description: 'Focus on 3-5 year trajectory.' },
      { label: 'Thriving on volatility — focus purely on compounding', points: 4, description: 'High risk appetite.' },
    ],
  },
  {
    id: 'q6_dependents',
    title: '6. What is your current financial stability and dependent profile?',
    category: 'buffer',
    options: [
      { label: 'Multiple financial dependents & high debt obligations', points: 1, description: 'High financial fragility.' },
      { label: 'Moderate family responsibilities & education loans', points: 2, description: 'Balanced monthly commitments.' },
      { label: 'Stable young professional with minimal debt', points: 3, description: 'High flexibility to save & invest.' },
      { label: 'Strong career trajectory, no dependents, high surplus', points: 4, description: 'Maximum risk-bearing capacity.' },
    ],
  },
];

export const RiskAssessmentView: React.FC = () => {
  const { riskProfile, setRiskProfile, setActiveTab, monthlyStats } = useApp();

  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    return riskProfile.answers || {
      q1_horizon: 4,
      q2_reaction: 3,
      q3_emergency: 4,
      q4_objective: 3,
      q5_volatility: 4,
      q6_dependents: 4,
    };
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelectOption = (questionId: string, points: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: points,
    }));
  };

  const calculateResults = (): {
    score: number;
    category: RiskCategoryName;
    horizonScore: number;
    toleranceScore: number;
    bufferScore: number;
    explanation: string;
    recommendedAllocations: AssetAllocationItem[];
  } => {
    let totalPoints = 0;
    let horizonPoints = 0;
    let tolerancePoints = 0;
    let bufferPoints = 0;

    QUESTIONS.forEach((q) => {
      const pt = answers[q.id] || 2;
      totalPoints += pt;
      if (q.category === 'horizon') horizonPoints += pt;
      if (q.category === 'tolerance') tolerancePoints += pt;
      if (q.category === 'buffer') bufferPoints += pt;
    });

    const maxPoints = QUESTIONS.length * 4;
    const score = Math.round((totalPoints / maxPoints) * 100);

    const horizonScore = Math.round((horizonPoints / 4) * 100);
    const toleranceScore = Math.round((tolerancePoints / 12) * 100);
    const bufferScore = Math.round((bufferPoints / 8) * 100);

    let category: RiskCategoryName = 'Moderate';
    let explanation = '';
    let recommendedAllocations: AssetAllocationItem[] = [];

    const surplus = monthlyStats.netSavings || 15000;

    if (score >= 80) {
      category = 'Aggressive';
      explanation =
        'You have an exceptional risk appetite, long compounding timeline, and strong cashflow buffer. You can endure short-term market turbulence in exchange for maximized long-term equity growth.';
      recommendedAllocations = [
        { asset: 'Broad Market Equity Index Funds', percentage: 55, monthlyAmount: Math.round(surplus * 0.55), riskLevel: 'High', expectedReturn: '13-15% CAGR', color: '#4F46E5' },
        { asset: 'Mid & Small Cap Alpha Funds', percentage: 25, monthlyAmount: Math.round(surplus * 0.25), riskLevel: 'Very High', expectedReturn: '15-18% CAGR', color: '#06B6D4' },
        { asset: 'Global / US Tech Index ETFs', percentage: 10, monthlyAmount: Math.round(surplus * 0.10), riskLevel: 'High', expectedReturn: '14-16% CAGR', color: '#8B5CF6' },
        { asset: 'Short Duration Debt / Arbitrage', percentage: 5, monthlyAmount: Math.round(surplus * 0.05), riskLevel: 'Low', expectedReturn: '6.5-7.5% CAGR', color: '#10B981' },
        { asset: 'Gold ETF / SGB', percentage: 5, monthlyAmount: Math.round(surplus * 0.05), riskLevel: 'Hedge', expectedReturn: '9-11% CAGR', color: '#F59E0B' },
      ];
    } else if (score >= 65) {
      category = 'Growth';
      explanation =
        'You have a healthy 5-7+ year horizon and solid financial discipline. A Growth allocation maximizes compounding through equity index funds while keeping a defensive cushion.';
      recommendedAllocations = [
        { asset: 'Nifty 50 & Large Cap Index Funds', percentage: 50, monthlyAmount: Math.round(surplus * 0.50), riskLevel: 'Moderate-High', expectedReturn: '12-14% CAGR', color: '#4F46E5' },
        { asset: 'Mid & Flexi Cap Equities', percentage: 20, monthlyAmount: Math.round(surplus * 0.20), riskLevel: 'High', expectedReturn: '14-16% CAGR', color: '#06B6D4' },
        { asset: 'Short Duration Debt & Arbitrage', percentage: 15, monthlyAmount: Math.round(surplus * 0.15), riskLevel: 'Low', expectedReturn: '6.5-7.5% CAGR', color: '#10B981' },
        { asset: 'Sovereign Gold Bonds / Gold ETFs', percentage: 10, monthlyAmount: Math.round(surplus * 0.10), riskLevel: 'Hedge', expectedReturn: '9-11% CAGR', color: '#F59E0B' },
        { asset: 'Global Equities (Nasdaq/S&P)', percentage: 5, monthlyAmount: Math.round(surplus * 0.05), riskLevel: 'Global Diversification', expectedReturn: '13-15% CAGR', color: '#8B5CF6' },
      ];
    } else if (score >= 45) {
      category = 'Moderate';
      explanation =
        'You prefer a balanced equilibrium between steady wealth appreciation and capital protection. A balanced multi-asset portfolio protects during drawdowns.';
      recommendedAllocations = [
        { asset: 'Large Cap / Nifty 50 Index Funds', percentage: 40, monthlyAmount: Math.round(surplus * 0.40), riskLevel: 'Moderate', expectedReturn: '11-13% CAGR', color: '#4F46E5' },
        { asset: 'Corporate Bond & Short Duration Debt', percentage: 30, monthlyAmount: Math.round(surplus * 0.30), riskLevel: 'Low', expectedReturn: '7-8% CAGR', color: '#10B981' },
        { asset: 'Emergency Liquid Funds', percentage: 15, monthlyAmount: Math.round(surplus * 0.15), riskLevel: 'Capital Protection', expectedReturn: '6-6.5% CAGR', color: '#06B6D4' },
        { asset: 'Sovereign Gold Bonds / Gold ETFs', percentage: 15, monthlyAmount: Math.round(surplus * 0.15), riskLevel: 'Hedge', expectedReturn: '9-10% CAGR', color: '#F59E0B' },
      ];
    } else if (score >= 30) {
      category = 'Moderate Conservative';
      explanation =
        'Capital preservation is a high priority. Most assets are parked in fixed-income debt instruments, with a small equity slice to beat inflation.';
      recommendedAllocations = [
        { asset: 'Short Term Debt & Banking Funds', percentage: 50, monthlyAmount: Math.round(surplus * 0.50), riskLevel: 'Low', expectedReturn: '7-7.5% CAGR', color: '#10B981' },
        { asset: 'Large Cap Index Funds', percentage: 25, monthlyAmount: Math.round(surplus * 0.25), riskLevel: 'Moderate', expectedReturn: '11-12% CAGR', color: '#4F46E5' },
        { asset: 'Liquid High-Interest Cash Buffer', percentage: 15, monthlyAmount: Math.round(surplus * 0.15), riskLevel: 'Safe', expectedReturn: '5.5-6.5% CAGR', color: '#06B6D4' },
        { asset: 'Gold ETF', percentage: 10, monthlyAmount: Math.round(surplus * 0.10), riskLevel: 'Hedge', expectedReturn: '8-10% CAGR', color: '#F59E0B' },
      ];
    } else {
      category = 'Conservative';
      explanation =
        'You have zero tolerance for market loss and require immediate capital accessibility. The portfolio focuses heavily on fixed deposits, liquid funds, and capital preservation.';
      recommendedAllocations = [
        { asset: 'Liquid & Overnight Funds', percentage: 50, monthlyAmount: Math.round(surplus * 0.50), riskLevel: 'Extremely Safe', expectedReturn: '6-6.5% CAGR', color: '#10B981' },
        { asset: 'Fixed Deposits & Govt Securities', percentage: 35, monthlyAmount: Math.round(surplus * 0.35), riskLevel: 'Safe', expectedReturn: '7-7.2% CAGR', color: '#06B6D4' },
        { asset: 'Gold ETF', percentage: 10, monthlyAmount: Math.round(surplus * 0.10), riskLevel: 'Hedge', expectedReturn: '8-9% CAGR', color: '#F59E0B' },
        { asset: 'Large Cap Bluechip Equities', percentage: 5, monthlyAmount: Math.round(surplus * 0.05), riskLevel: 'Conservative Growth', expectedReturn: '10-12% CAGR', color: '#4F46E5' },
      ];
    }

    return {
      score,
      category,
      horizonScore,
      toleranceScore,
      bufferScore,
      explanation,
      recommendedAllocations,
    };
  };

  const handleSaveAssessment = () => {
    const results = calculateResults();
    const updatedProfile: RiskProfile = {
      score: results.score,
      category: results.category,
      answers,
      horizonScore: results.horizonScore,
      toleranceScore: results.toleranceScore,
      financialBufferScore: results.bufferScore,
      explanation: results.explanation,
      recommendedAllocations: results.recommendedAllocations,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setRiskProfile(updatedProfile);
    setHasSubmitted(true);
  };

  const results = calculateResults();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Psychometric Risk Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Investor Risk Profile Assessment
          </h1>
          <p className="text-xs text-zinc-400">
            Understand your true risk tolerance, time horizon, and psychological comfort with market volatility.
          </p>
        </div>

        {/* Current Risk Badge */}
        <div className="flex items-center gap-3 bg-[#111318] border border-[#1f2937] rounded-xl p-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Current Risk Category</div>
            <div className="text-sm font-extrabold text-zinc-100">
              {riskProfile.category} ({riskProfile.score}/100)
            </div>
          </div>
        </div>
      </div>

      {/* Result Card Preview / Live Gauge */}
      <div className="bg-gradient-to-br from-[#161922] via-[#111318] to-[#111318] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">
                Calculated Classification:
              </span>
              <span className="text-sm font-extrabold text-amber-400 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                {results.category} Investor
              </span>
            </div>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              {results.explanation}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-[#161922] p-4 rounded-xl border border-[#1f2937]">
            <div className="text-center">
              <div className="text-3xl font-black text-zinc-100">{results.score}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Risk Score</div>
            </div>
            <div className="w-px h-10 bg-[#1f2937]" />
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4 text-zinc-300">
                <span>Horizon:</span>
                <strong className="text-amber-400">{results.horizonScore}%</strong>
              </div>
              <div className="flex justify-between gap-4 text-zinc-300">
                <span>Tolerance:</span>
                <strong className="text-amber-300">{results.toleranceScore}%</strong>
              </div>
              <div className="flex justify-between gap-4 text-zinc-300">
                <span>Buffer:</span>
                <strong className="text-emerald-400">{results.bufferScore}%</strong>
              </div>
            </div>
          </div>
        </div>

        {hasSubmitted && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Risk profile updated successfully and synchronized with AI Investment Planner!</span>
            </div>
            <button
              onClick={() => setActiveTab('ai_planner')}
              className="font-bold underline hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>View Recommended Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Guided Questionnaire List */}
      <div className="space-y-4">
        {QUESTIONS.map((question) => {
          const currentSelection = answers[question.id] || 2;

          return (
            <div
              key={question.id}
              className="bg-[#111318] border border-[#1f2937] rounded-2xl p-5 shadow-sm space-y-3"
            >
              <h3 className="text-sm font-bold text-zinc-100">{question.title}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {question.options.map((opt) => {
                  const isSelected = currentSelection === opt.points;

                  return (
                    <button
                      key={opt.points}
                      type="button"
                      onClick={() => handleSelectOption(question.id, opt.points)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-zinc-100 shadow-md shadow-amber-500/10 font-medium'
                          : 'bg-[#161922] border-[#1f2937] text-zinc-300 hover:bg-[#1f2937] hover:text-zinc-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{opt.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500 text-zinc-950'
                              : 'border-zinc-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400">{opt.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Action Footer */}
      <div className="flex items-center justify-between p-4 bg-[#111318] border border-[#1f2937] rounded-2xl">
        <div className="text-xs text-zinc-400">
          Ready to apply this assessment to your financial planning?
        </div>
        <button
          onClick={handleSaveAssessment}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Save & Apply Risk Profile</span>
        </button>
      </div>
    </div>
  );
};
