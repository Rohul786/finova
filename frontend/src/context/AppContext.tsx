import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  BudgetCategory,
  FinancialGoal,
  RiskProfile,
  UserProfile,
  ChatMessage,
  KycData,
} from '../types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_RISK_PROFILE,
} from '../data/initialData';
import {
  loadUserWorkspaceData,
  saveUserWorkspaceData,
  findAccountByEmail,
} from '../utils/accountManager';
import confetti from 'canvas-confetti';

interface AppContextType {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateAppLogo: (logoUrl: string) => void;
  login: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  completeKyc: (kycData: KycData) => void;
  resetKyc: () => void;
  categories: BudgetCategory[];
  setCategories: React.Dispatch<React.SetStateAction<BudgetCategory[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  goals: FinancialGoal[];
  setGoals: React.Dispatch<React.SetStateAction<FinancialGoal[]>>;
  riskProfile: RiskProfile;
  setRiskProfile: React.Dispatch<React.SetStateAction<RiskProfile>>;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  // Helper Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  addFundsToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  updateBudgetCategory: (id: string, allocated: number) => void;
  resetToDemoData: () => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  monthlyStats: {
    income: number;
    expenses: number;
    investments: number;
    netSavings: number;
    savingsRate: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finova_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USER_PROFILE;
  });

  const [categories, setCategories] = useState<BudgetCategory[]>(() => {
    if (userProfile.email && userProfile.isLoggedIn) {
      const userWorkspace = loadUserWorkspaceData(userProfile.email);
      return userWorkspace.categories;
    }
    const saved = localStorage.getItem('finova_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (userProfile.email && userProfile.isLoggedIn) {
      const userWorkspace = loadUserWorkspaceData(userProfile.email);
      return userWorkspace.transactions;
    }
    const saved = localStorage.getItem('finova_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    if (userProfile.email && userProfile.isLoggedIn) {
      const userWorkspace = loadUserWorkspaceData(userProfile.email);
      return userWorkspace.goals;
    }
    const saved = localStorage.getItem('finova_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [riskProfile, setRiskProfile] = useState<RiskProfile>(() => {
    if (userProfile.email && userProfile.isLoggedIn) {
      const userWorkspace = loadUserWorkspaceData(userProfile.email);
      return userWorkspace.riskProfile;
    }
    const saved = localStorage.getItem('finova_risk_profile');
    return saved ? JSON.parse(saved) : INITIAL_RISK_PROFILE;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `👋 Hello ${userProfile.name}! I'm **Finova AI & ChatGPT Financial Co-Pilot**. 

I can help you:
• Analyze your budgets and identify savings leaks.
• Calculate how to achieve your goals faster.
• Build an optimal SIP asset allocation based on your **${riskProfile.category}** risk profile.
• Compare live market movements and simulate long-term compound wealth.

Select an AI Model (Gemini 3.7 Pro or ChatGPT-4o) and ask me anything!`,
        timestamp: new Date().toISOString(),
        modelUsed: 'gemini-3.7',
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);

  // Sync to local storage and user-scoped partition
  useEffect(() => {
    localStorage.setItem('finova_user_profile', JSON.stringify(userProfile));
    if (userProfile.email && userProfile.isLoggedIn) {
      saveUserWorkspaceData(userProfile.email, { profile: userProfile });
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('finova_categories', JSON.stringify(categories));
    if (userProfile.email && userProfile.isLoggedIn) {
      saveUserWorkspaceData(userProfile.email, { categories });
    }
  }, [categories, userProfile.email, userProfile.isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('finova_transactions', JSON.stringify(transactions));
    if (userProfile.email && userProfile.isLoggedIn) {
      saveUserWorkspaceData(userProfile.email, { transactions });
    }
  }, [transactions, userProfile.email, userProfile.isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('finova_goals', JSON.stringify(goals));
    if (userProfile.email && userProfile.isLoggedIn) {
      saveUserWorkspaceData(userProfile.email, { goals });
    }
  }, [goals, userProfile.email, userProfile.isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('finova_risk_profile', JSON.stringify(riskProfile));
    if (userProfile.email && userProfile.isLoggedIn) {
      saveUserWorkspaceData(userProfile.email, { riskProfile });
    }
  }, [riskProfile, userProfile.email, userProfile.isLoggedIn]);

  // Recalculate spent for categories based on active transactions of current month
  useEffect(() => {
    const categorySpentMap: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense' || tx.type === 'investment') {
        categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
      }
    });

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        spent: categorySpentMap[cat.name] || 0,
      }))
    );
  }, [transactions]);

  const currency = userProfile.currency || 'INR';
  const setCurrency = (curr: string) => {
    setUserProfile((prev) => ({ ...prev, currency: curr as any }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates };
      // If income changed, update salary transaction
      if (updates.monthlyIncome && updates.monthlyIncome !== prev.monthlyIncome) {
        setTransactions((txs) => {
          const hasSalaryTx = txs.some((t) => t.category === 'Salary');
          if (hasSalaryTx) {
            return txs.map((t) => (t.category === 'Salary' ? { ...t, amount: updates.monthlyIncome! } : t));
          } else {
            return [
              {
                id: `tx_salary_${Date.now()}`,
                title: 'Monthly Salary Credit',
                amount: updates.monthlyIncome!,
                type: 'income',
                category: 'Salary',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'Net Banking',
                notes: 'Primary monthly inflow',
                tags: ['salary', 'income'],
              },
              ...txs,
            ];
          }
        });
      }

      // If detailed expenseBreakdown is provided, sync corresponding category allocations
      if (updates.expenseBreakdown) {
        const eb = updates.expenseBreakdown;
        setCategories((prevCats) =>
          prevCats.map((cat) => {
            if (cat.name === 'Rent & Housing' && eb.rentAndHousing !== undefined) {
              return { ...cat, allocated: eb.rentAndHousing };
            }
            if (cat.name === 'Health & Fitness' && eb.medicalsAndHealthcare !== undefined) {
              return { ...cat, allocated: eb.medicalsAndHealthcare };
            }
            if (cat.name === 'Food & Dining' && eb.groceriesAndFood !== undefined) {
              return { ...cat, allocated: eb.groceriesAndFood };
            }
            if (cat.name === 'Utilities' && eb.utilitiesAndBills !== undefined) {
              return { ...cat, allocated: eb.utilitiesAndBills };
            }
            if (cat.name === 'Transportation' && eb.transportAndFuel !== undefined) {
              return { ...cat, allocated: eb.transportAndFuel };
            }
            if (cat.name === 'Education' && eb.educationAndLearning !== undefined) {
              return { ...cat, allocated: eb.educationAndLearning };
            }
            if (cat.name === 'Entertainment' && eb.entertainmentAndLeisure !== undefined) {
              return { ...cat, allocated: eb.entertainmentAndLeisure };
            }
            if (cat.name === 'Miscellaneous' && eb.miscellaneous !== undefined) {
              return { ...cat, allocated: eb.miscellaneous };
            }
            return cat;
          })
        );
      }

      return next;
    });
  };

  const updateAppLogo = (logoUrl: string) => {
    setUserProfile((prev) => ({ ...prev, appLogoUrl: logoUrl }));
  };

  const login = (profileUpdates: Partial<UserProfile>) => {
    const userEmail = profileUpdates.email?.trim().toLowerCase();
    
    if (userEmail) {
      const workspace = loadUserWorkspaceData(userEmail);
      const matchedAccount = findAccountByEmail(userEmail);

      const mergedProfile: UserProfile = {
        ...INITIAL_USER_PROFILE,
        ...(matchedAccount?.profile || {}),
        ...workspace.profile,
        ...profileUpdates,
        email: userEmail,
        isLoggedIn: true,
      };

      setUserProfile(mergedProfile);
      setCategories(workspace.categories);
      setTransactions(workspace.transactions);
      setGoals(workspace.goals);
      setRiskProfile(workspace.riskProfile);
    } else {
      updateUserProfile({ ...profileUpdates, isLoggedIn: true });
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch (e) {
      console.error(e);
    }
    setActiveTab('dashboard');
  };

  const logout = () => {
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    setActiveTab('login');
  };

  const completeKyc = (kycData: KycData) => {
    setUserProfile((prev) => ({
      ...prev,
      isVerified: true,
      kycStatus: 'verified',
      kycData,
      avatarUrl: kycData.selfieUrl || prev.avatarUrl,
    }));
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.4 },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const resetKyc = () => {
    setUserProfile((prev) => ({
      ...prev,
      isVerified: false,
      kycStatus: 'not_started',
      kycData: undefined,
    }));
  };

  // Helper Calculations
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const investments = transactions
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  const monthlyStats = {
    income: income || userProfile.monthlyIncome,
    expenses,
    investments,
    netSavings,
    savingsRate,
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, ...updates };
          if (updated.currentAmount >= updated.targetAmount && !g.completed) {
            updated.completed = true;
            try {
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch (e) {
              console.error(e);
            }
          }
          return updated;
        }
        return g;
      })
    );
  };

  const addFundsToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newAmount = g.currentAmount + amount;
          const isCompleted = newAmount >= g.targetAmount;
          if (isCompleted && !g.completed) {
            try {
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
              });
            } catch (e) {
              console.error(e);
            }
          }
          return {
            ...g,
            currentAmount: newAmount,
            completed: isCompleted,
          };
        }
        return g;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateBudgetCategory = (id: string, allocated: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, allocated: Math.max(0, allocated) } : c))
    );
  };

  const resetToDemoData = () => {
    setUserProfile(INITIAL_USER_PROFILE);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setGoals(INITIAL_GOALS);
    setRiskProfile(INITIAL_RISK_PROFILE);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        updateUserProfile,
        updateAppLogo,
        login,
        logout,
        completeKyc,
        resetKyc,
        categories,
        setCategories,
        transactions,
        setTransactions,
        goals,
        setGoals,
        riskProfile,
        setRiskProfile,
        chatMessages,
        setChatMessages,
        activeTab,
        setActiveTab,
        currency,
        setCurrency,
        addTransaction,
        deleteTransaction,
        addGoal,
        updateGoal,
        addFundsToGoal,
        deleteGoal,
        updateBudgetCategory,
        resetToDemoData,
        isQuickAddOpen,
        setIsQuickAddOpen,
        monthlyStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
