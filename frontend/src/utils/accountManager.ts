import { RegisteredAccount, BudgetCategory, Transaction, FinancialGoal, RiskProfile, UserProfile } from '../types';
import {
  DEFAULT_REGISTERED_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_RISK_PROFILE,
} from '../data/initialData';

const ACCOUNTS_STORAGE_KEY = 'finova_registered_accounts';

export interface UserScopedData {
  profile: Partial<UserProfile>;
  categories: BudgetCategory[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  riskProfile: RiskProfile;
}

export interface AuthResult {
  success: boolean;
  code: 'SUCCESS' | 'NOT_FOUND' | 'INVALID_PASSWORD' | 'EMPTY_INPUT';
  message: string;
  account?: RegisteredAccount;
}

/**
 * Computes a secure SHA-256 hash for stored passwords
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${hashHex}`;
    }
  } catch (e) {
    console.error('Crypto error:', e);
  }
  // Safe deterministic fallback
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash:${Math.abs(hash).toString(16)}`;
}

/**
 * Verifies a candidate password against stored hash or credential
 */
export async function verifyPassword(password: string, storedHashOrPassword: string): Promise<boolean> {
  if (!storedHashOrPassword || !password) return false;
  if (storedHashOrPassword.startsWith('sha256:') || storedHashOrPassword.startsWith('hash:')) {
    const computed = await hashPassword(password);
    return computed === storedHashOrPassword;
  }
  return storedHashOrPassword === password;
}

/**
 * Retrieves all registered accounts from localStorage.
 */
export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading registered accounts:', e);
  }
  return DEFAULT_REGISTERED_ACCOUNTS;
}

/**
 * Saves a registered account to persistent local storage.
 */
export function saveRegisteredAccount(account: RegisteredAccount): RegisteredAccount[] {
  const current = getRegisteredAccounts();
  const normalizedEmail = account.email.trim().toLowerCase();
  const updated = [
    { ...account, email: normalizedEmail },
    ...current.filter((acc) => acc.email.trim().toLowerCase() !== normalizedEmail),
  ];
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving account:', e);
  }
  return updated;
}

/**
 * Finds an account by email (case-insensitive)
 */
export function findAccountByEmail(email: string): RegisteredAccount | undefined {
  if (!email || !email.trim()) return undefined;
  const normalized = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  return accounts.find((acc) => acc.email.trim().toLowerCase() === normalized);
}

/**
 * Finds an account by phone number (digits match)
 */
export function findAccountByPhone(phone: string): RegisteredAccount | undefined {
  if (!phone || !phone.trim()) return undefined;
  const cleanInput = phone.replace(/\D/g, '');
  if (!cleanInput) return undefined;
  const accounts = getRegisteredAccounts();
  return accounts.find((acc) => {
    const cleanAccPhone = acc.phone.replace(/\D/g, '');
    return (
      cleanAccPhone === cleanInput ||
      cleanAccPhone.endsWith(cleanInput) ||
      cleanInput.endsWith(cleanAccPhone)
    );
  });
}

/**
 * Checks existence of an account by email or phone
 */
export function verifyAccountIdentity(identifier: string): {
  exists: boolean;
  account?: RegisteredAccount;
  isEmail: boolean;
} {
  const clean = identifier.trim();
  if (!clean) return { exists: false, isEmail: false };

  const isEmail = clean.includes('@');
  const account = isEmail ? findAccountByEmail(clean) : findAccountByPhone(clean);

  return {
    exists: !!account,
    account,
    isEmail,
  };
}

/**
 * Updates an account's password securely
 */
export function updateAccountPassword(email: string, hashedPasswordOrPassword: string): boolean {
  if (!email || !email.trim()) return false;
  const normalized = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  let found = false;

  const updated = accounts.map((acc) => {
    if (acc.email.trim().toLowerCase() === normalized) {
      found = true;
      return { ...acc, password: hashedPasswordOrPassword };
    }
    return acc;
  });

  if (found) {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating password:', e);
    }
  }
  return found;
}

/**
 * Authenticates user credentials against the registered accounts database
 */
export async function authenticateAccount(identifier: string, password: string): Promise<AuthResult> {
  const clean = identifier.trim();
  if (!clean || !password.trim()) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      message: 'Please enter both your registered email/phone and password.',
    };
  }

  const isEmail = clean.includes('@');
  const account = isEmail ? findAccountByEmail(clean) : findAccountByPhone(clean);

  if (!account) {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: 'Account not found. Please register first.',
    };
  }

  const isValid = await verifyPassword(password, account.password);
  if (!isValid) {
    return {
      success: false,
      code: 'INVALID_PASSWORD',
      message: 'Incorrect password. Please verify your credentials and try again.',
      account,
    };
  }

  return {
    success: true,
    code: 'SUCCESS',
    message: 'Authentication successful.',
    account,
  };
}

/**
 * User-Scoped Data Storage Keys
 */
function getStorageKey(email: string, key: string): string {
  const safeId = email.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `finova_user_${safeId}_${key}`;
}

/**
 * Loads isolated workspace data for a specific user email
 */
export function loadUserWorkspaceData(email: string): UserScopedData {
  const normalized = email.trim().toLowerCase();
  const matchedAcc = findAccountByEmail(normalized);

  try {
    const savedCategories = localStorage.getItem(getStorageKey(normalized, 'categories'));
    const savedTransactions = localStorage.getItem(getStorageKey(normalized, 'transactions'));
    const savedGoals = localStorage.getItem(getStorageKey(normalized, 'goals'));
    const savedRiskProfile = localStorage.getItem(getStorageKey(normalized, 'risk_profile'));

    return {
      profile: matchedAcc?.profile || { email: normalized, name: normalized.split('@')[0], isLoggedIn: true },
      categories: savedCategories ? JSON.parse(savedCategories) : INITIAL_CATEGORIES,
      transactions: savedTransactions ? JSON.parse(savedTransactions) : INITIAL_TRANSACTIONS,
      goals: savedGoals ? JSON.parse(savedGoals) : INITIAL_GOALS,
      riskProfile: savedRiskProfile ? JSON.parse(savedRiskProfile) : INITIAL_RISK_PROFILE,
    };
  } catch (e) {
    console.error('Error loading user workspace data:', e);
    return {
      profile: matchedAcc?.profile || { email: normalized, name: normalized.split('@')[0], isLoggedIn: true },
      categories: INITIAL_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      goals: INITIAL_GOALS,
      riskProfile: INITIAL_RISK_PROFILE,
    };
  }
}

/**
 * Persists isolated workspace data for a specific user email
 */
export function saveUserWorkspaceData(email: string, data: Partial<UserScopedData>): void {
  if (!email || !email.trim()) return;
  const normalized = email.trim().toLowerCase();

  try {
    if (data.categories) {
      localStorage.setItem(getStorageKey(normalized, 'categories'), JSON.stringify(data.categories));
    }
    if (data.transactions) {
      localStorage.setItem(getStorageKey(normalized, 'transactions'), JSON.stringify(data.transactions));
    }
    if (data.goals) {
      localStorage.setItem(getStorageKey(normalized, 'goals'), JSON.stringify(data.goals));
    }
    if (data.riskProfile) {
      localStorage.setItem(getStorageKey(normalized, 'risk_profile'), JSON.stringify(data.riskProfile));
    }
  } catch (e) {
    console.error('Error saving user workspace data:', e);
  }
}
