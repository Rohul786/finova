export type TransactionType = 'income' | 'expense' | 'investment';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'PayPal'
  | 'Cash'
  | 'Crypto';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Rent & Housing'
  | 'Education'
  | 'Entertainment'
  | 'Utilities'
  | 'Transportation'
  | 'Shopping'
  | 'Health & Fitness'
  | 'Investments & Savings'
  | 'Salary'
  | 'Freelance'
  | 'Gifts & Rewards'
  | 'Miscellaneous';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string; // ISO format YYYY-MM-DD
  paymentMethod: PaymentMethod;
  paymentProvider?: string; // e.g. 'Google Pay', 'PhonePe', 'HDFC Bank', 'PayPal', 'Visa'
  referenceId?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
}

export interface BudgetCategory {
  id: string;
  name: ExpenseCategory;
  iconName: string;
  allocated: number;
  spent: number;
  color: string;
  warningThreshold: number; // percentage, e.g., 80
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  completed?: boolean;
  notes?: string;
}

export type RiskCategoryName =
  | 'Conservative'
  | 'Moderate Conservative'
  | 'Moderate'
  | 'Growth'
  | 'Aggressive';

export interface AssetAllocationItem {
  asset: string;
  percentage: number;
  monthlyAmount: number;
  riskLevel: string;
  expectedReturn: string;
  description?: string;
  color?: string;
}

export interface RiskProfile {
  score: number; // 0 to 100
  category: RiskCategoryName;
  answers: Record<string, number>;
  horizonScore: number;
  toleranceScore: number;
  financialBufferScore: number;
  explanation: string;
  recommendedAllocations: AssetAllocationItem[];
  lastUpdated: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface ExpenseBreakdownTargets {
  rentAndHousing: number;
  medicalsAndHealthcare: number;
  groceriesAndFood: number;
  utilitiesAndBills: number;
  transportAndFuel: number;
  educationAndLearning: number;
  entertainmentAndLeisure: number;
  insuranceAndEmergency: number;
  miscellaneous: number;
}

export interface KycData {
  documentType: 'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Driving License' | 'Voter ID';
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  address?: string;
  selfieUrl: string;
  selfieTimestamp?: string;
  mobileNumber: string;
  mobileVerified: boolean;
  mobileVerifiedAt?: string;
  emailAddress: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  kycId: string;
  verifiedAt: string;
  securityHash?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  occupation: string;
  city?: string;
  phone?: string;
  monthlyIncome: number;
  monthlyBudgetCap?: number;
  monthlySipTarget?: number;
  currency: CurrencyCode;
  emergencyFundMonths: number;
  targetSavingsRate: number; // e.g. 30%
  avatarUrl?: string;
  appLogoUrl?: string;
  riskTolerance?: 'Conservative' | 'Moderate' | 'Aggressive';
  expenseBreakdown?: ExpenseBreakdownTargets;
  isLoggedIn?: boolean;
  isVerified?: boolean;
  kycStatus?: 'not_started' | 'in_progress' | 'verified';
  kycData?: KycData;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  expenseCutPercent: number;
  extraMonthlyInvestment: number;
  expectedReturn: number;
  salaryIncrementPercent: number;
  timeHorizonYears: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: 'gemini-3.7' | 'chatgpt-4o' | 'copilot';
}

export type StockMarketCategory = 'indian' | 'global' | 'indices' | 'commodities';

export interface StockPricePoint {
  time: string;
  price: number;
}

export interface StockItem {
  id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'MCX';
  category: StockMarketCategory;
  sector: string;
  priceINR: number;
  changeINR: number;
  changePercent: number;
  dayHighINR: number;
  dayLowINR: number;
  week52HighINR: number;
  week52LowINR: number;
  peRatio?: number;
  marketCapINR: string; // e.g. "₹20.2 L Cr"
  volume: string; // e.g. "4.8M"
  sparkline: number[];
  history1D: StockPricePoint[];
  history1W: StockPricePoint[];
  history1M: StockPricePoint[];
  history1Y: StockPricePoint[];
  history5Y: StockPricePoint[];
  aiSentiment: 'Bullish' | 'Strong Buy' | 'Neutral' | 'Bearish';
  aiSentimentScore: number; // 0 to 100
  aiInsight: string;
  externalUrl?: string;
}

export interface StockMarketIndex {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  status: 'Open' | 'Closed';
  externalUrl?: string;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  tag: 'Earnings' | 'Policy' | 'AI & Tech' | 'Commodity' | 'Economy';
  impact: 'positive' | 'neutral' | 'caution';
  summary: string;
  relatedSymbol?: string;
}

export interface RegisteredAccount {
  name: string;
  email: string;
  phone: string;
  password: string;
  profile: Partial<UserProfile>;
  createdAt: string;
}
