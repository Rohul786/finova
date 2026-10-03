import { Transaction, BudgetCategory, FinancialGoal, RiskProfile } from '../types';

export interface SIPProjectionPoint {
  year: number;
  investedCapital: number;
  totalCorpus: number;
  wealthGained: number;
  inflationAdjustedCorpus: number;
}

export function calculateSIPProjections(
  monthlyInvestment: number,
  expectedReturnRate: number, // e.g. 12%
  tenureYears: number,
  stepUpRate: number = 0, // annual increase %
  inflationRate: number = 6 // inflation %
): {
  dataPoints: SIPProjectionPoint[];
  totalInvested: number;
  finalCorpus: number;
  wealthGained: number;
  finalRealValue: number;
} {
  const dataPoints: SIPProjectionPoint[] = [];
  let currentMonthly = monthlyInvestment;
  let totalInvested = 0;
  let currentCorpus = 0;
  const monthlyRate = expectedReturnRate / 100 / 12;

  for (let year = 1; year <= tenureYears; year++) {
    for (let month = 1; month <= 12; month++) {
      currentCorpus = (currentCorpus + currentMonthly) * (1 + monthlyRate);
      totalInvested += currentMonthly;
    }

    const inflationFactor = Math.pow(1 + inflationRate / 100, year);
    const inflationAdjusted = currentCorpus / inflationFactor;

    dataPoints.push({
      year,
      investedCapital: Math.round(totalInvested),
      totalCorpus: Math.round(currentCorpus),
      wealthGained: Math.round(currentCorpus - totalInvested),
      inflationAdjustedCorpus: Math.round(inflationAdjusted),
    });

    if (stepUpRate > 0) {
      currentMonthly = currentMonthly * (1 + stepUpRate / 100);
    }
  }

  const finalPoint = dataPoints[dataPoints.length - 1] || {
    investedCapital: 0,
    totalCorpus: 0,
    wealthGained: 0,
    inflationAdjustedCorpus: 0,
  };

  return {
    dataPoints,
    totalInvested: finalPoint.investedCapital,
    finalCorpus: finalPoint.totalCorpus,
    wealthGained: finalPoint.wealthGained,
    finalRealValue: finalPoint.inflationAdjustedCorpus,
  };
}

export function calculateMonthlyRequiredForGoal(
  targetAmount: number,
  currentAmount: number,
  targetDate: string,
  expectedAnnualReturn: number = 7
): {
  monthlyNeeded: number;
  monthsRemaining: number;
  isOverdue: boolean;
} {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const monthsRemaining = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.4375)));
  const isOverdue = diffTime < 0;

  const remainingPrincipal = Math.max(0, targetAmount - currentAmount);
  if (remainingPrincipal <= 0) {
    return { monthlyNeeded: 0, monthsRemaining, isOverdue };
  }

  if (expectedAnnualReturn <= 0 || monthsRemaining <= 1) {
    return {
      monthlyNeeded: Math.round(remainingPrincipal / monthsRemaining),
      monthsRemaining,
      isOverdue,
    };
  }

  const monthlyRate = expectedAnnualReturn / 100 / 12;
  // Future Value of monthly annuity formula: FV = P * [((1 + r)^n - 1) / r]
  // Solve for P: P = FV * r / [ (1 + r)^n - 1 ]
  const compoundFactor = Math.pow(1 + monthlyRate, monthsRemaining) - 1;
  const monthlyNeeded = Math.round((remainingPrincipal * monthlyRate) / compoundFactor);

  return {
    monthlyNeeded: Math.max(0, monthlyNeeded),
    monthsRemaining,
    isOverdue,
  };
}

export function calculateFinancialHealthScore(
  monthlyIncome: number,
  monthlyExpenses: number,
  goals: FinancialGoal[],
  categories: BudgetCategory[]
): {
  score: number;
  grade: string;
  ratingText: string;
  breakdown: {
    savingsRateScore: number;
    budgetDisciplineScore: number;
    goalProgressScore: number;
    cashflowScore: number;
  };
} {
  if (monthlyIncome <= 0) {
    return {
      score: 50,
      grade: 'C',
      ratingText: 'Income Not Specified',
      breakdown: {
        savingsRateScore: 50,
        budgetDisciplineScore: 50,
        goalProgressScore: 50,
        cashflowScore: 50,
      },
    };
  }

  // 1. Savings Rate (Target >= 30%)
  const savings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = (savings / monthlyIncome) * 100;
  const savingsRateScore = Math.min(100, Math.round((savingsRate / 35) * 100));

  // 2. Budget Discipline (How many categories under budget)
  let underBudgetCount = 0;
  categories.forEach((cat) => {
    if (cat.spent <= cat.allocated) underBudgetCount++;
  });
  const budgetDisciplineScore =
    categories.length > 0 ? Math.round((underBudgetCount / categories.length) * 100) : 80;

  // 3. Goal Progress
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalProgressScore =
    totalGoalTarget > 0 ? Math.min(100, Math.round((totalGoalCurrent / totalGoalTarget) * 100)) : 70;

  // 4. Cashflow Cushion (Expense < 75% of income)
  const expenseRatio = (monthlyExpenses / monthlyIncome) * 100;
  const cashflowScore = Math.max(0, Math.min(100, Math.round(100 - (expenseRatio - 40) * 1.5)));

  const overall = Math.round(
    savingsRateScore * 0.35 +
      budgetDisciplineScore * 0.25 +
      goalProgressScore * 0.2 +
      cashflowScore * 0.2
  );

  let grade = 'B';
  let ratingText = 'Good Financial Pulse';
  if (overall >= 85) {
    grade = 'A+';
    ratingText = 'Exceptional Financial Health';
  } else if (overall >= 75) {
    grade = 'A';
    ratingText = 'Strong Financial Discipline';
  } else if (overall >= 60) {
    grade = 'B';
    ratingText = 'Healthy with Room to Optimize';
  } else if (overall >= 45) {
    grade = 'C';
    ratingText = 'Requires Budget Rebalancing';
  } else {
    grade = 'D';
    ratingText = 'High Financial Vulnerability';
  }

  return {
    score: overall,
    grade,
    ratingText,
    breakdown: {
      savingsRateScore,
      budgetDisciplineScore,
      goalProgressScore,
      cashflowScore,
    },
  };
}
