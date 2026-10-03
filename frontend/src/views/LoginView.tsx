import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, CurrencyCode, ExpenseBreakdownTargets, RegisteredAccount } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import {
  getRegisteredAccounts,
  saveRegisteredAccount,
  findAccountByEmail,
  findAccountByPhone,
  verifyAccountIdentity,
  authenticateAccount,
  updateAccountPassword,
  hashPassword,
} from '../utils/accountManager';
import { motion, AnimatePresence } from 'motion/react';
import { FinovaLogo } from '../components/FinovaLogo';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Wallet,
  Target,
  ShieldCheck,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  TrendingUp,
  Globe,
  Shuffle,
  Link as LinkIcon,
  Crown,
  KeyRound,
  ShieldAlert,
  Sliders,
  Camera,
  Trash2,
  RefreshCw,
  Clock,
  Send,
  Layers,
  Sparkle,
  Check,
  HelpCircle,
  LogIn,
  UserPlus,
  ChevronRight,
  Fingerprint,
  AlertCircle,
  Compass,
  Home,
  HeartPulse,
  Utensils,
  Lightbulb,
  Car,
  GraduationCap,
  Film,
  PieChart,
  DollarSign,
  Shield,
  Activity,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface WebStoreItem {
  id: string;
  name: string;
  category: 'dicebear_bots' | 'dicebear_people' | 'dicebear_emoji' | 'fintech_3d' | 'studio';
  url: string;
  badge?: string;
}

const WEB_STORE_AVATARS: WebStoreItem[] = [
  // Official Finova Brand Logo
  {
    id: 'finova_official_brand_logo',
    name: 'Finova Official Logo (Green Leaf + ₹ Coin)',
    category: 'studio',
    url: '/finova-logo.svg',
    badge: 'Official Logo',
  },
  // DiceBear Cyber Bots
  {
    id: 'bot_1',
    name: 'Finova Alpha Bot',
    category: 'dicebear_bots',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FinovaAlpha&backgroundColor=141824',
    badge: 'Popular',
  },
  {
    id: 'bot_2',
    name: 'Cyber Trader X',
    category: 'dicebear_bots',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberTraderX&backgroundColor=1f2937',
  },
  {
    id: 'bot_3',
    name: 'Quantum Hedge AI',
    category: 'dicebear_bots',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumHedge&backgroundColor=0f172a',
    badge: 'AI',
  },
  {
    id: 'bot_4',
    name: 'Neon Matrix Bot',
    category: 'dicebear_bots',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonMatrix&backgroundColor=18181b',
  },

  // DiceBear Adventurer & Lorelei People
  {
    id: 'ppl_1',
    name: 'Mamtaz Pro Investor',
    category: 'dicebear_people',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mamtaz&backgroundColor=b6e3f4,c0aede,d1d4f9',
    badge: 'Recommended',
  },
  {
    id: 'ppl_2',
    name: 'Sophia Tech Founder',
    category: 'dicebear_people',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia&backgroundColor=ffd5dc,ffdfbf',
  },
  {
    id: 'ppl_3',
    name: 'Felix Quant Analyst',
    category: 'dicebear_people',
    url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0',
  },
  {
    id: 'ppl_4',
    name: 'Aneka Wealth Architect',
    category: 'dicebear_people',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
  },
  {
    id: 'ppl_5',
    name: 'Oliver Fintech Strategist',
    category: 'dicebear_people',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Oliver&backgroundColor=d1d4f9',
  },
  {
    id: 'ppl_6',
    name: 'Vikram Global Trader',
    category: 'dicebear_people',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram&backgroundColor=b6e3f4',
  },

  // DiceBear 3D Emoji / Expressive
  {
    id: 'emo_1',
    name: 'Bull Market Spark',
    category: 'dicebear_emoji',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=BullMarket&backgroundColor=14532d',
    badge: 'Bullish',
  },
  {
    id: 'emo_2',
    name: 'Golden Profits 3D',
    category: 'dicebear_emoji',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=GoldenProfits&backgroundColor=78350f',
  },
  {
    id: 'emo_3',
    name: 'Zen Wealth Master',
    category: 'dicebear_emoji',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ZenInvestor&backgroundColor=1e1b4b',
  },
  {
    id: 'emo_4',
    name: 'Diamond Hands 3D',
    category: 'dicebear_emoji',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=DiamondHands&backgroundColor=0e7490',
  },

  // FinTech 3D Luxury Icons
  {
    id: 'lux_1',
    name: 'Emerald Bull 3D',
    category: 'fintech_3d',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    badge: 'Luxury',
  },
  {
    id: 'lux_2',
    name: 'Golden Crown Shield',
    category: 'fintech_3d',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'lux_3',
    name: 'Prism Tech Sphere',
    category: 'fintech_3d',
    url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'lux_4',
    name: 'Cosmic Cyber Cube',
    category: 'fintech_3d',
    url: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=300&auto=format&fit=crop&q=80',
  },
];

export const LoginView: React.FC = () => {
  const { userProfile, login, logout, updateUserProfile, updateAppLogo, setActiveTab } = useApp();

  // Screen Mode: 'select' (Choice Gate) | 'existing_user' (Sign In) | 'new_user' (Register) | 'forgot_password'
  const [authScreen, setAuthScreen] = useState<'select' | 'existing_user' | 'new_user' | 'forgot_password'>('select');

  // Accounts Database from centralized storage
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => {
    return getRegisteredAccounts();
  });

  useEffect(() => {
    try {
      localStorage.setItem('finova_registered_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  // Existing User Login State (starts completely blank so every visitor enters their own credentials)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [existingEmail, setExistingEmail] = useState('');
  const [existingPhone, setExistingPhone] = useState('');
  const [existingPassword, setExistingPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // New User Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regOccupation, setRegOccupation] = useState('');
  const [regAge, setRegAge] = useState<number>(24);
  const [regCity, setRegCity] = useState('');
  const [regMonthlyIncome, setRegMonthlyIncome] = useState<number>(65000);
  const [regMonthlyBudget, setRegMonthlyBudget] = useState<number>(38000);
  const [regMonthlySip, setRegMonthlySip] = useState<number>(18000);
  const [regCurrency, setRegCurrency] = useState<CurrencyCode>('INR');
  const [regRiskTolerance, setRegRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');

  // Financial Targets - Detailed Breakdown Fields (rents, medicals, groceries, utilities, etc.)
  const [regRent, setRegRent] = useState<number>(18000);
  const [regMedicals, setRegMedicals] = useState<number>(3000);
  const [regGroceries, setRegGroceries] = useState<number>(12000);
  const [regUtilities, setRegUtilities] = useState<number>(3500);
  const [regTransport, setRegTransport] = useState<number>(4500);
  const [regEducation, setRegEducation] = useState<number>(4000);
  const [regEntertainment, setRegEntertainment] = useState<number>(3500);
  const [regEmergencyFund, setRegEmergencyFund] = useState<number>(3500);
  const [regMisc, setRegMisc] = useState<number>(2000);
  const [autoSyncBudget, setAutoSyncBudget] = useState<boolean>(true);

  // Calculate live sum of expenses
  const calculatedTotalExpenses =
    Number(regRent || 0) +
    Number(regMedicals || 0) +
    Number(regGroceries || 0) +
    Number(regUtilities || 0) +
    Number(regTransport || 0) +
    Number(regEducation || 0) +
    Number(regEntertainment || 0) +
    Number(regEmergencyFund || 0) +
    Number(regMisc || 0);

  // Keep budget cap synced if enabled
  useEffect(() => {
    if (autoSyncBudget) {
      setRegMonthlyBudget(calculatedTotalExpenses);
    }
  }, [calculatedTotalExpenses, autoSyncBudget]);

  const [regAvatarUrl, setRegAvatarUrl] = useState<string>(
    'https://api.dicebear.com/7.x/adventurer/svg?seed=FinovaUser&backgroundColor=b6e3f4,c0aede,d1d4f9'
  );
  const [regAppLogoUrl, setRegAppLogoUrl] = useState<string>('/finova-logo.svg');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  // Avatar Management State
  const [avatarTab, setAvatarTab] = useState<'store' | 'upload' | 'url'>('store');
  const [storeCategory, setStoreCategory] = useState<
    'all' | 'dicebear_bots' | 'dicebear_people' | 'dicebear_emoji' | 'fintech_3d' | 'studio'
  >('all');
  const [customWebUrl, setCustomWebUrl] = useState('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedTarget, setSelectedTarget] = useState<'both' | 'avatar' | 'logo'>('both');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState<string | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotExpiresAt, setForgotExpiresAt] = useState<number | null>(null);
  const [forgotRemainingSeconds, setForgotRemainingSeconds] = useState<number>(600);
  const [forgotCooldownSeconds, setForgotCooldownSeconds] = useState<number>(0);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  // Live countdown timer for OTP expiration (e.g. 10 minutes)
  useEffect(() => {
    if (!forgotExpiresAt || forgotStep !== 2) return;
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((forgotExpiresAt - Date.now()) / 1000));
      setForgotRemainingSeconds(remaining);
      if (remaining <= 0) {
        setForgotError('Verification code has expired. Please request a new code.');
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [forgotExpiresAt, forgotStep]);

  // Cooldown timer for "Resend Code" button (60s)
  useEffect(() => {
    if (forgotCooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setForgotCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotCooldownSeconds]);

  const liveRegEmailIdentity = regEmail.trim()
    ? verifyAccountIdentity(regEmail.trim())
    : null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Photo File Upload
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setUploadedImagePreview(result);
      if (selectedTarget === 'avatar' || selectedTarget === 'both') {
        setRegAvatarUrl(result);
      }
      if (selectedTarget === 'logo' || selectedTarget === 'both') {
        setRegAppLogoUrl(result);
        updateAppLogo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Avatar Selection from Web Store
  const handleSelectWebAvatar = (item: WebStoreItem) => {
    if (selectedTarget === 'avatar' || selectedTarget === 'both') {
      setRegAvatarUrl(item.url);
    }
    if (selectedTarget === 'logo' || selectedTarget === 'both') {
      setRegAppLogoUrl(item.url);
      updateAppLogo(item.url);
    }
  };

  // Generate random DiceBear Avatar from web
  const handleRandomizeWebAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const styles = ['bottts', 'adventurer', 'lorelei', 'fun-emoji', 'notionists', 'avataaars'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const newUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=141824,1f2937,0f172a`;

    if (selectedTarget === 'avatar' || selectedTarget === 'both') {
      setRegAvatarUrl(newUrl);
    }
    if (selectedTarget === 'logo' || selectedTarget === 'both') {
      setRegAppLogoUrl(newUrl);
      updateAppLogo(newUrl);
    }
  };

  // Custom Web Image URL Apply
  const handleApplyWebUrl = () => {
    if (!customWebUrl.trim()) return;
    try {
      new URL(customWebUrl);
      if (selectedTarget === 'avatar' || selectedTarget === 'both') {
        setRegAvatarUrl(customWebUrl.trim());
      }
      if (selectedTarget === 'logo' || selectedTarget === 'both') {
        setRegAppLogoUrl(customWebUrl.trim());
        updateAppLogo(customWebUrl.trim());
      }
      setUrlStatus('success');
      setTimeout(() => setUrlStatus('idle'), 2500);
    } catch {
      setUrlStatus('error');
      setTimeout(() => setUrlStatus('idle'), 3000);
    }
  };

  // ================= EXISTING USER LOGIN =================
  const handleExistingUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const identifier = loginMethod === 'email' ? existingEmail.trim().toLowerCase() : existingPhone.trim();

    if (!identifier) {
      setAuthError(loginMethod === 'email' ? 'Please enter your registered email address.' : 'Please enter your registered phone number.');
      return;
    }

    if (!existingPassword.trim()) {
      setAuthError('Please enter your account password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const authResult = await authenticateAccount(identifier, existingPassword);

      if (!authResult.success) {
        setIsLoggingIn(false);
        if (authResult.code === 'NOT_FOUND') {
          setAuthError('Account not found. Please register first.');
        } else if (authResult.code === 'INVALID_PASSWORD') {
          setAuthError('Incorrect password. Please verify your credentials and try again.');
        } else {
          setAuthError(authResult.message || 'Authentication failed. Please check your credentials.');
        }
        return;
      }

      const matchedAccount = authResult.account;
      if (!matchedAccount) {
        setIsLoggingIn(false);
        setAuthError('Account not found. Please register first.');
        return;
      }

      const profileToLogin: Partial<UserProfile> = {
        ...matchedAccount.profile,
        name: matchedAccount.name,
        email: matchedAccount.email,
        phone: matchedAccount.phone,
        isLoggedIn: true,
      };

      login(profileToLogin);
      setIsLoggingIn(false);
    } catch (err) {
      console.error(err);
      setIsLoggingIn(false);
      setAuthError('An unexpected authentication error occurred. Please try again.');
    }
  };

  // ================= NEW USER REGISTRATION =================
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Please provide your full legal or preferred name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please provide a valid email address.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Please provide a valid phone number.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!regAgreeTerms) {
      setRegError('Please accept the Finova Terms & Security Policy.');
      return;
    }

    // Check if account already exists with this email
    const existingAcc = findAccountByEmail(regEmail);
    if (existingAcc) {
      setRegError(
        `An account with email "${regEmail.trim()}" already exists. Please sign in instead.`
      );
      return;
    }

    setIsLoggingIn(true);

    try {
      const hashedPassword = await hashPassword(regPassword);

      const expenseBreakdownData: ExpenseBreakdownTargets = {
        rentAndHousing: Number(regRent || 0),
        medicalsAndHealthcare: Number(regMedicals || 0),
        groceriesAndFood: Number(regGroceries || 0),
        utilitiesAndBills: Number(regUtilities || 0),
        transportAndFuel: Number(regTransport || 0),
        educationAndLearning: Number(regEducation || 0),
        entertainmentAndLeisure: Number(regEntertainment || 0),
        insuranceAndEmergency: Number(regEmergencyFund || 0),
        miscellaneous: Number(regMisc || 0),
      };

      const newProfile: Partial<UserProfile> = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        occupation: regOccupation.trim() || 'FinTech Investor',
        age: regAge || 24,
        city: regCity.trim() || 'Bengaluru, India',
        monthlyIncome: regMonthlyIncome || 65000,
        monthlyBudgetCap: regMonthlyBudget || calculatedTotalExpenses || 38000,
        monthlySipTarget: regMonthlySip || 18000,
        currency: regCurrency,
        riskTolerance: regRiskTolerance,
        avatarUrl: regAvatarUrl,
        appLogoUrl: regAppLogoUrl,
        expenseBreakdown: expenseBreakdownData,
        isLoggedIn: true,
      };

      const newAccount: RegisteredAccount = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: hashedPassword,
        profile: newProfile,
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = saveRegisteredAccount(newAccount);
      setAccounts(updatedAccounts);

      if (regAppLogoUrl) {
        updateAppLogo(regAppLogoUrl);
      }

      login(newProfile);
      setIsLoggingIn(false);
    } catch (err) {
      console.error(err);
      setIsLoggingIn(false);
      setRegError('Registration encountered an error. Please try again.');
    }
  };

  // ================= FORGOT PASSWORD =================
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotNotice(null);

    const cleanEmail = forgotIdentifier.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }

    // Check whether the email belongs to a registered account
    const matchedAcc = findAccountByEmail(cleanEmail);
    if (!matchedAcc) {
      setForgotError('No registered account found with this email. Please verify your address or register.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, userName: matchedAcc.name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setForgotError(data.error || 'Failed to send verification code. Please try again.');
        setForgotLoading(false);
        return;
      }

      setForgotExpiresAt(data.expiresAt || Date.now() + 10 * 60 * 1000);
      setForgotCooldownSeconds(data.cooldownSeconds || 60);
      setForgotNotice(data.notice || null);
      setForgotOtp('');
      setForgotStep(2);
    } catch (err) {
      console.error(err);
      setForgotError('Network error while requesting verification code. Please check your connection and try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (forgotCooldownSeconds > 0 || forgotLoading) return;
    setForgotError(null);
    setForgotNotice(null);

    const cleanEmail = forgotIdentifier.trim().toLowerCase();
    const matchedAcc = findAccountByEmail(cleanEmail);

    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, userName: matchedAcc?.name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setForgotError(data.error || 'Unable to resend verification code right now.');
        setForgotLoading(false);
        return;
      }

      setForgotExpiresAt(data.expiresAt || Date.now() + 10 * 60 * 1000);
      setForgotCooldownSeconds(data.cooldownSeconds || 60);
      setForgotNotice(data.notice || null);
      setForgotOtp('');
    } catch (err) {
      console.error(err);
      setForgotError('Failed to resend verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const cleanOtp = forgotOtp.trim();

    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      setForgotError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setForgotLoading(true);
    try {
      const cleanEmail = forgotIdentifier.trim().toLowerCase();
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setForgotError(data.error || 'Invalid verification code. Please try again.');
        setForgotLoading(false);
        return;
      }

      setForgotResetToken(data.resetToken);
      setForgotStep(3);
    } catch (err) {
      console.error(err);
      setForgotError('Failed to verify code due to a network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!forgotResetToken) {
      setForgotError('Reset session is invalid. Please request a new verification code.');
      setForgotStep(1);
      return;
    }

    setForgotLoading(true);
    try {
      const cleanEmail = forgotIdentifier.trim().toLowerCase();
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          resetToken: forgotResetToken,
          newPassword: forgotNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setForgotError(data.error || 'Failed to update password. Please request a new verification code.');
        setForgotLoading(false);
        return;
      }

      // Update stored account password
      const newHashed = data.hashedPassword || await hashPassword(forgotNewPassword);
      updateAccountPassword(cleanEmail, newHashed);
      setAccounts(getRegisteredAccounts());

      setExistingPassword('');
      setForgotSuccessMessage('Password reset successfully. You can now log in with your new password.');
      setForgotStep(4);
    } catch (err) {
      console.error(err);
      setForgotError('Failed to update password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const filteredStoreAvatars =
    storeCategory === 'all'
      ? WEB_STORE_AVATARS
      : WEB_STORE_AVATARS.filter((item) => item.category === storeCategory);

  // 50/30/20 Rule Live Analysis for Registration / Target setup
  const needsSum =
    Number(regRent || 0) +
    Number(regMedicals || 0) +
    Number(regGroceries || 0) +
    Number(regUtilities || 0) +
    Number(regTransport || 0) +
    Number(regEmergencyFund || 0);

  const wantsSum =
    Number(regEducation || 0) +
    Number(regEntertainment || 0) +
    Number(regMisc || 0);

  const savingsSum = Number(regMonthlySip || 0);

  const incomeBasis = Number(regMonthlyIncome || 1);
  const needsPct = Math.round((needsSum / incomeBasis) * 100);
  const wantsPct = Math.round((wantsSum / incomeBasis) * 100);
  const savingsPct = Math.round((savingsSum / incomeBasis) * 100);
  const surplusRemaining = incomeBasis - (calculatedTotalExpenses + savingsSum);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-center relative overflow-hidden">
      {/* Dynamic Background Animated Particles and Neon Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-amber-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -60, 0],
            y: [0, -40, 0],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]"
        />
      </div>

      {/* Floating Animated Badges for Cool Factor */}
      <div className="hidden lg:block">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-4 bg-[#141824]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl px-3.5 py-2 shadow-xl shadow-amber-500/10 flex items-center gap-2.5 z-20 pointer-events-none"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">NIFTY 50</div>
            <div className="text-xs font-black text-zinc-100">+1.42% Bullish ↗</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -1, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-16 right-6 bg-[#141824]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-3.5 py-2 shadow-xl shadow-cyan-500/10 flex items-center gap-2.5 z-20 pointer-events-none"
        >
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Budget Engine</div>
            <div className="text-xs font-black text-zinc-100">50/30/20 Rule Active ✦</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-10 left-8 bg-[#141824]/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl px-3.5 py-2 shadow-xl shadow-emerald-500/10 flex items-center gap-2.5 z-20 pointer-events-none"
        >
          <div className="shrink-0">
            <FinovaLogo size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Finova Vault</div>
            <div className="text-xs font-black text-zinc-100">256-Bit Encrypted 🛡️</div>
          </div>
        </motion.div>
      </div>

      {/* Top Ambient Glow Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gradient-to-r from-[#141824]/95 via-[#111318]/95 to-[#141824]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            {/* App Logo Display */}
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.94 }}
              className="relative group cursor-pointer"
              onClick={() => setAuthScreen('new_user')}
            >
              {regAppLogoUrl ? (
                <img
                  src={regAppLogoUrl}
                  alt="Finova Logo"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/20 bg-[#161922]"
                />
              ) : (
                <FinovaLogo size={64} className="shadow-xl shadow-emerald-500/25 border border-emerald-400/40 rounded-2xl" />
              )}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-zinc-950 rounded-full shadow-md"
              >
                <Crown className="w-3 h-3" />
              </motion.span>
            </motion.div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <FinovaLogo size={14} withBackground={false} />
                  Finova Security Gateway
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                  Finova
                </span>
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* SCREEN 1: FIRST CHOICE GATE (Existing User OR New User) */}
      {/* ======================================================== */}
      <AnimatePresence mode="wait">
        {authScreen === 'select' && (
          <motion.div
            key="screen-select"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6 max-w-3xl mx-auto w-full"
          >
            <div className="text-center space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Finova Multi-User Workspace
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
                Welcome to Finova
              </h2>
              <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                Sign in to your private financial portfolio or register a new isolated account.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Existing User Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setExistingEmail('');
                  setExistingPhone('');
                  setExistingPassword('');
                  setAuthError(null);
                  setAuthScreen('existing_user');
                }}
                className="bg-gradient-to-b from-[#161a24] to-[#10121a] border-2 border-[#1f2937] hover:border-amber-500/60 rounded-3xl p-6 sm:p-7 cursor-pointer transition-all shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all shadow-md">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Already Registered
                    </span>
                    <h3 className="text-lg font-black text-zinc-100 group-hover:text-amber-300 transition-colors mt-2">
                      Existing Investor / User
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Log in using your registered <strong className="text-zinc-200">Email Address</strong> or <strong className="text-zinc-200">Phone Number</strong> along with your password.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1f2937] flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <span>Sign In to Account</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 group-hover:bg-amber-500 group-hover:text-zinc-950 flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* Option 2: New User Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setRegError(null);
                  setAuthScreen('new_user');
                }}
                className="bg-gradient-to-b from-[#161a24] to-[#10121a] border-2 border-[#1f2937] hover:border-cyan-500/60 rounded-3xl p-6 sm:p-7 cursor-pointer transition-all shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all shadow-md">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      New to Finova
                    </span>
                    <h3 className="text-lg font-black text-zinc-100 group-hover:text-cyan-300 transition-colors mt-2">
                      New User Registration
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      First time here? Register your profile, configure all financial targets (<strong className="text-zinc-200">Rent, Medicals, Food, Utilities</strong>), and pick web avatars.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1f2937] flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                  <span>Start Free Registration</span>
                  <div className="w-8 h-8 rounded-full bg-cyan-500/15 group-hover:bg-cyan-500 group-hover:text-zinc-950 flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: EXISTING USER LOGIN (Email/Phone + Password)  */}
        {/* ======================================================== */}
        {authScreen === 'existing_user' && (
          <motion.div
            key="screen-existing"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 25 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-md mx-auto w-full space-y-6"
          >
            {/* Back Button */}
            <motion.button
              whileHover={{ x: -3 }}
              type="button"
              onClick={() => {
                setAuthError(null);
                setAuthScreen('select');
              }}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Option Selection</span>
            </motion.button>

            {/* Login Card */}
            <div className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center space-y-1 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-md">
                  <LogIn className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-100">Existing User Sign In</h2>
                <p className="text-xs text-zinc-400">
                  Enter your credentials to unlock your private Finova workspace.
                </p>
              </div>

              {/* Login Method Toggle: Email vs Phone */}
              <div className="grid grid-cols-2 p-1 bg-[#161922] rounded-2xl border border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setAuthError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    loginMethod === 'email'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    setAuthError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    loginMethod === 'phone'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Number</span>
                </button>
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs space-y-3 shadow-lg"
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-semibold text-rose-200 leading-snug">{authError}</span>
                  </div>
                  {(authError.toLowerCase().includes('not found') || authError.toLowerCase().includes('register')) && (
                    <div className="pt-2 border-t border-rose-500/25 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-300">Don't have an account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setRegEmail(existingEmail);
                          setRegPhone(existingPhone);
                          setRegError(null);
                          setAuthScreen('new_user');
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-zinc-950 font-black rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register Now →</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              <form onSubmit={handleExistingUserLogin} className="space-y-4" autoComplete="off">
                {/* Email or Phone Input */}
                {loginMethod === 'email' ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Registered Email Address</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        value={existingEmail}
                        onChange={(e) => setExistingEmail(e.target.value)}
                        placeholder="Enter your registered email (e.g. name@example.com)"
                        className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-600 font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Registered Phone Number</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        autoComplete="off"
                        value={existingPhone}
                        onChange={(e) => setExistingPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-600 font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Security Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotIdentifier(loginMethod === 'email' ? existingEmail : existingPhone);
                        setForgotStep(1);
                        setForgotError(null);
                        setAuthScreen('forgot_password');
                      }}
                      className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={existingPassword}
                      onChange={(e) => setExistingPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-3 pr-10 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#1f2937] bg-[#161922] text-amber-500 focus:ring-amber-500/20"
                    />
                    <span>Remember this session</span>
                  </label>
                </div>

                {/* Sign In Button with tactile motion */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-zinc-950" />
                      <span>Sign In & Unlock OS →</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Bottom Switch to Register */}
              <div className="text-center pt-2 border-t border-[#1f2937] text-xs text-zinc-400">
                <span>Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setRegEmail(existingEmail);
                    setRegError(null);
                    setAuthScreen('new_user');
                  }}
                  className="font-bold text-cyan-400 hover:underline cursor-pointer ml-1"
                >
                  Register as New User →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: FORGOT PASSWORD RECOVERY WORKFLOW               */}
        {/* ======================================================== */}
        {authScreen === 'forgot_password' && (
          <motion.div
            key="screen-forgot"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-md mx-auto w-full space-y-6"
          >
            {/* Back to Login */}
            <motion.button
              whileHover={{ x: -3 }}
              type="button"
              onClick={() => {
                setForgotError(null);
                setForgotNotice(null);
                setAuthScreen('existing_user');
              }}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </motion.button>

            <div className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center space-y-1 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-md">
                  {forgotStep === 4 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <KeyRound className="w-6 h-6" />
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-100">
                  {forgotStep === 1 && 'Forgot Password'}
                  {forgotStep === 2 && 'Verify Verification Code'}
                  {forgotStep === 3 && 'Create New Password'}
                  {forgotStep === 4 && 'Reset Completed'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {forgotStep === 1 && 'Enter your registered email to receive a secure 6-digit verification code.'}
                  {forgotStep === 2 && 'We sent a verification code to your email.'}
                  {forgotStep === 3 && 'Enter and confirm your new secure account password.'}
                  {forgotStep === 4 && 'Your password has been updated securely.'}
                </p>
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      forgotStep === s
                        ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50'
                        : forgotStep > s
                        ? 'w-4 bg-emerald-400'
                        : 'w-4 bg-[#1f2937]'
                    }`}
                  />
                ))}
              </div>

              {/* Error Notification */}
              {forgotError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2.5 shadow-lg"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-rose-200 leading-snug">{forgotError}</span>
                </motion.div>
              )}

              {/* Informational Notice */}
              {forgotNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{forgotNotice}</span>
                </motion.div>
              )}

              {/* STEP 1: Enter Registered Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Enter your registered email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full bg-[#161922] text-zinc-100 text-xs pl-10 pr-3.5 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500/50 transition-all placeholder:text-zinc-600 font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      A unique 6-digit one-time code will be dispatched to your inbox.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Dispatching Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-zinc-950" />
                        <span>Send Verification Code →</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* STEP 2: Verify 6-digit OTP Screen */}
              {forgotStep === 2 && (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                  {/* Recipient Email Chip */}
                  <div className="p-3 rounded-2xl bg-[#161922] border border-[#272b3b] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Sent to</p>
                        <p className="text-xs font-semibold text-zinc-200 truncate">{forgotIdentifier}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-[11px] font-bold text-amber-400 hover:underline shrink-0 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* OTP Code Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-zinc-300">
                        6-Digit Verification Code
                      </label>

                      {/* Expiration Countdown Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                          forgotRemainingSeconds <= 60
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse'
                            : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {forgotRemainingSeconds > 0
                            ? `Expires in ${Math.floor(forgotRemainingSeconds / 60)
                                .toString()
                                .padStart(2, '0')}:${(forgotRemainingSeconds % 60)
                                .toString()
                                .padStart(2, '0')}`
                            : 'Expired'}
                        </span>
                      </div>
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      autoFocus
                      value={forgotOtp}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setForgotOtp(clean);
                      }}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.6em] text-2xl font-mono font-black bg-[#161922] text-amber-400 px-3.5 py-3.5 rounded-2xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-inner"
                    />
                  </div>

                  {/* Verify Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={forgotLoading || forgotOtp.trim().length !== 6 || forgotRemainingSeconds <= 0}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Verifying Security Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-zinc-950" />
                        <span>Verify Code & Continue →</span>
                      </>
                    )}
                  </motion.button>

                  {/* Resend Code Option */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#1f2937] text-xs">
                    <span className="text-zinc-400 text-[11px]">Didn't receive the email?</span>
                    <button
                      type="button"
                      disabled={forgotCooldownSeconds > 0 || forgotLoading}
                      onClick={handleResendOtp}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 disabled:text-zinc-500 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${forgotLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {forgotCooldownSeconds > 0
                          ? `Resend Code (${forgotCooldownSeconds}s)`
                          : 'Resend Verification Code'}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Create New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleForgotResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-[#161922] text-zinc-100 text-xs pl-10 pr-10 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-[#161922] text-zinc-100 text-xs pl-10 pr-10 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Match Status */}
                  {forgotNewPassword && forgotConfirmPassword && (
                    <div className="text-[11px] font-semibold">
                      {forgotNewPassword === forgotConfirmPassword ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={forgotLoading || forgotNewPassword.length < 6 || forgotNewPassword !== forgotConfirmPassword}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-zinc-950" />
                        <span>Save New Password & Complete</span>
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* STEP 4: Success Screen */}
              {forgotStep === 4 && (
                <div className="text-center space-y-5 py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-zinc-100">Password Reset Completed</h3>
                    <p className="text-xs text-emerald-400 font-medium leading-relaxed px-2">
                      Password reset successfully. You can now log in with your new password.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setExistingEmail(forgotIdentifier);
                      setExistingPassword('');
                      setAuthError(null);
                      setAuthScreen('existing_user');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Log In Now with New Password →</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 4: NEW USER REGISTRATION WORKFLOW                 */}
        {/* ======================================================== */}
        {authScreen === 'new_user' && (
          <motion.div
            key="screen-new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ x: -3 }}
                type="button"
                onClick={() => {
                  setRegError(null);
                  setAuthScreen('select');
                }}
                className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Option Selection</span>
              </motion.button>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Already registered?</span>
                <button
                  type="button"
                  onClick={() => setAuthScreen('existing_user')}
                  className="font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Log In →
                </button>
              </div>
            </div>

            {/* Registration Wizard Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {regError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Registration Header Banner */}
              <div className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img
                      src={regAvatarUrl}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/80 bg-[#161922] shadow-lg shadow-cyan-500/20"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 bg-cyan-500 text-zinc-950 rounded-full shadow-md">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      Step 1 of 1 • Complete Investor Setup
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-100 mt-1">
                      Create Your Finova Investor Account
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Configure your profile credentials, detailed financial targets (rents, medicals, groceries, etc.), and choose web avatars or photos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleRandomizeWebAvatar}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>🎲 Roll Avatar</span>
                  </motion.button>
                </div>
              </div>

              {/* Multi-Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Credentials & Financial Targets (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card 1: Account Credentials */}
                  <div className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#1f2937]">
                      <User className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-zinc-100">1. Account Credentials & Personal Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Full Legal / Preferred Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Mamtaz Tuni"
                          className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-medium text-zinc-300">
                            Email Address *
                          </label>
                          {liveRegEmailIdentity && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                liveRegEmailIdentity.exists
                                  ? 'text-rose-400 bg-rose-500/10'
                                  : 'text-emerald-400 bg-emerald-500/10'
                              }`}
                            >
                              {liveRegEmailIdentity.exists ? '⚠ Already Registered' : '✓ Available'}
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. friend@gmail.com"
                          className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                        />
                        {regEmail.trim() && liveRegEmailIdentity?.exists && (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-center justify-between">
                            <span>Account already exists for this email.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setExistingEmail(regEmail);
                                setAuthError(null);
                                setAuthScreen('existing_user');
                              }}
                              className="font-bold underline text-amber-400 hover:text-amber-300 cursor-pointer"
                            >
                              Sign In Instead →
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Create Password (Min. 6 chars) *
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 pr-9 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Occupation / Career Domain
                        </label>
                        <input
                          type="text"
                          value={regOccupation}
                          onChange={(e) => setRegOccupation(e.target.value)}
                          placeholder="e.g. Software Engineer, Doctor, Trader"
                          className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          City / Region
                        </label>
                        <input
                          type="text"
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Mumbai, London"
                          className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Granular Financial Targets & Expense Breakdown */}
                  <div className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <div>
                          <h3 className="text-sm font-bold text-zinc-100">2. Financial Targets & Expense Breakdown</h3>
                          <p className="text-[11px] text-zinc-400">Specify details like rents, medicals, groceries, utilities & SIP targets</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Monthly Budget
                      </span>
                    </div>

                    {/* Primary Inflow & SIP Targets */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#161922] border border-[#1f2937]">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Monthly Inflow ({regCurrency}) *</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={regMonthlyIncome}
                          onChange={(e) => setRegMonthlyIncome(Number(e.target.value))}
                          className="w-full bg-[#111318] text-emerald-400 text-sm font-black px-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                          <span>Monthly SIP Target ({regCurrency}) *</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={regMonthlySip}
                          onChange={(e) => setRegMonthlySip(Number(e.target.value))}
                          className="w-full bg-[#111318] text-amber-400 text-sm font-black px-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Total Monthly Budget Cap</span>
                        </label>
                        <input
                          type="number"
                          value={regMonthlyBudget}
                          onChange={(e) => {
                            setAutoSyncBudget(false);
                            setRegMonthlyBudget(Number(e.target.value));
                          }}
                          className="w-full bg-[#111318] text-cyan-400 text-sm font-black px-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Detailed Expense Category Targets: Rents, Medicals, Groceries, Utilities, etc. */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>Granular Category Monthly Targets</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoSyncBudget}
                            onChange={(e) => setAutoSyncBudget(e.target.checked)}
                            className="rounded border-[#1f2937] bg-[#161922] text-amber-500 focus:ring-amber-500/20"
                          />
                          <span>Auto-sum to Budget Cap (Sum: {formatCurrency(calculatedTotalExpenses, regCurrency)})</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Rent & Housing */}
                        <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                          <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                            <Home className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Rent & Housing / EMI</span>
                          </label>
                          <input
                            type="number"
                            value={regRent}
                            onChange={(e) => setRegRent(Number(e.target.value))}
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
                            value={regMedicals}
                            onChange={(e) => setRegMedicals(Number(e.target.value))}
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
                            value={regGroceries}
                            onChange={(e) => setRegGroceries(Number(e.target.value))}
                            className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                          />
                        </div>

                        {/* Utilities & Bills */}
                        <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                          <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Utilities & WiFi Bills</span>
                          </label>
                          <input
                            type="number"
                            value={regUtilities}
                            onChange={(e) => setRegUtilities(Number(e.target.value))}
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
                            value={regTransport}
                            onChange={(e) => setRegTransport(Number(e.target.value))}
                            className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                          />
                        </div>

                        {/* Education & Learning */}
                        <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                          <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Education & Upskilling</span>
                          </label>
                          <input
                            type="number"
                            value={regEducation}
                            onChange={(e) => setRegEducation(Number(e.target.value))}
                            className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                          />
                        </div>

                        {/* Entertainment & Leisure */}
                        <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                          <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                            <Film className="w-3.5 h-3.5 text-pink-400" />
                            <span>Entertainment & OTT</span>
                          </label>
                          <input
                            type="number"
                            value={regEntertainment}
                            onChange={(e) => setRegEntertainment(Number(e.target.value))}
                            className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                          />
                        </div>

                        {/* Emergency / Insurance Buffer */}
                        <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                          <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-teal-400" />
                            <span>Emergency / Insurance</span>
                          </label>
                          <input
                            type="number"
                            value={regEmergencyFund}
                            onChange={(e) => setRegEmergencyFund(Number(e.target.value))}
                            className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold"
                          />
                        </div>

                        {/* Miscellaneous */}
                        <div className="p-3 rounded-xl bg-[#161922] border border-[#1f2937] space-y-1">
                          <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Miscellaneous / Other</span>
                          </label>
                          <input
                            type="number"
                            value={regMisc}
                            onChange={(e) => setRegMisc(Number(e.target.value))}
                            className="w-full bg-[#111318] text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-zinc-500 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 50/30/20 Rule Live Analysis Visualizer */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141824] to-[#111318] border border-amber-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-zinc-200">
                            Live 50/30/20 Budget Optimization
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          Surplus: {formatCurrency(surplusRemaining, regCurrency)}
                        </span>
                      </div>

                      {/* Animated Proportional Bar */}
                      <div className="w-full h-3 rounded-full bg-[#161922] overflow-hidden flex">
                        <motion.div
                          animate={{ width: `${Math.min(100, Math.max(0, needsPct))}%` }}
                          transition={{ duration: 0.4 }}
                          className="h-full bg-indigo-500"
                          title={`Needs: ${needsPct}%`}
                        />
                        <motion.div
                          animate={{ width: `${Math.min(100, Math.max(0, wantsPct))}%` }}
                          transition={{ duration: 0.4 }}
                          className="h-full bg-pink-500"
                          title={`Wants: ${wantsPct}%`}
                        />
                        <motion.div
                          animate={{ width: `${Math.min(100, Math.max(0, savingsPct))}%` }}
                          transition={{ duration: 0.4 }}
                          className="h-full bg-amber-400"
                          title={`Savings/SIP: ${savingsPct}%`}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                          <div className="font-bold">Needs ({needsPct}%)</div>
                          <div className="text-zinc-400">{formatCurrency(needsSum, regCurrency)}</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300">
                          <div className="font-bold">Wants ({wantsPct}%)</div>
                          <div className="text-zinc-400">{formatCurrency(wantsSum, regCurrency)}</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          <div className="font-bold">SIP / Savings ({savingsPct}%)</div>
                          <div className="text-zinc-400">{formatCurrency(savingsSum, regCurrency)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Tolerance Selection */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-2">
                        Investor Risk Profile Tolerance
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 'Conservative', label: 'Conservative (Low Risk)', desc: 'Focus on Capital Preservation' },
                          { val: 'Moderate', label: 'Moderate (Balanced)', desc: 'Equities & Debt Blend' },
                          { val: 'Aggressive', label: 'Aggressive (Growth)', desc: 'High Alpha Stock Compounding' },
                        ].map((r) => (
                          <button
                            key={r.val}
                            type="button"
                            onClick={() => setRegRiskTolerance(r.val as any)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              regRiskTolerance === r.val
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-sm'
                                : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <div className="font-bold text-xs">{r.label}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{r.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Avatar & Custom Image Management (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-zinc-100">3. Avatar & Profile Icon</h3>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Live Preview
                      </span>
                    </div>

                    {/* Active Selection Target: Profile vs App Logo vs Both */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                        Apply Chosen Image To:
                      </label>
                      <div className="grid grid-cols-3 p-1 bg-[#161922] rounded-xl border border-[#1f2937]">
                        {[
                          { id: 'both', label: 'Both (Synced)' },
                          { id: 'avatar', label: 'Profile Only' },
                          { id: 'logo', label: 'Logo Only' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTarget(t.id as any)}
                            className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              selectedTarget === t.id
                                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode Navigation: Web Store vs Custom File Upload vs Web URL */}
                    <div className="grid grid-cols-3 p-1 bg-[#161922] rounded-xl border border-[#1f2937]">
                      <button
                        type="button"
                        onClick={() => setAvatarTab('store')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          avatarTab === 'store'
                            ? 'bg-[#1f2937] text-amber-400 border border-amber-500/30'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Web Avatars</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarTab('upload')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          avatarTab === 'upload'
                            ? 'bg-[#1f2937] text-cyan-400 border border-cyan-500/30'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarTab('url')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          avatarTab === 'url'
                            ? 'bg-[#1f2937] text-emerald-400 border border-emerald-500/30'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Web URL</span>
                      </button>
                    </div>

                    {/* TAB 1: WEB STORE AVATARS */}
                    {avatarTab === 'store' && (
                      <div className="space-y-3">
                        {/* Categories */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                          {[
                            { id: 'all', label: 'All (20+)' },
                            { id: 'dicebear_bots', label: '🤖 Cyber Bots' },
                            { id: 'dicebear_people', label: '👤 Illustrators' },
                            { id: 'dicebear_emoji', label: '✨ 3D Emoji' },
                            { id: 'fintech_3d', label: '💎 3D Luxury' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setStoreCategory(cat.id as any)}
                              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                storeCategory === cat.id
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-[#161922] text-zinc-400 hover:text-zinc-200 border border-[#1f2937]'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                          {filteredStoreAvatars.map((item) => {
                            const isSelected = regAvatarUrl === item.url;
                            return (
                              <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelectWebAvatar(item)}
                                className={`p-1.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center relative bg-[#161922] ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/40'
                                    : 'border-[#1f2937] hover:border-zinc-500'
                                }`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-11 h-11 rounded-lg object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-amber-400 text-zinc-950 rounded-full p-0.5">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB 2: CUSTOM PHOTO FILE UPLOAD */}
                    {avatarTab === 'upload' && (
                      <div className="space-y-3">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                          }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            isDragOver
                              ? 'border-cyan-400 bg-cyan-500/10'
                              : 'border-[#1f2937] bg-[#161922] hover:border-cyan-500/50'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-zinc-200">
                            Click to upload or Drag & Drop photo
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            PNG, JPG, SVG, WebP up to 10MB
                          </span>
                        </div>

                        {uploadedImagePreview && (
                          <div className="p-2 rounded-xl bg-[#161922] border border-cyan-500/30 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={uploadedImagePreview}
                                alt="Custom Upload"
                                className="w-8 h-8 rounded-lg object-cover border border-cyan-400"
                              />
                              <span className="text-xs text-zinc-300 font-medium">Custom photo ready</span>
                            </div>
                            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md">
                              Applied
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: CUSTOM WEB IMAGE URL */}
                    {avatarTab === 'url' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Direct Web Image Link (SVG, PNG, JPG)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={customWebUrl}
                              onChange={(e) => setCustomWebUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <button
                              type="button"
                              onClick={handleApplyWebUrl}
                              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                            >
                              Apply
                            </button>
                          </div>
                        </div>

                        {urlStatus === 'success' && (
                          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Web URL successfully applied!</span>
                          </div>
                        )}
                        {urlStatus === 'error' && (
                          <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Invalid image URL. Please verify format.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Terms Agreement */}
                    <div className="pt-2 border-t border-[#1f2937]">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-400">
                        <input
                          type="checkbox"
                          checked={regAgreeTerms}
                          onChange={(e) => setRegAgreeTerms(e.target.checked)}
                          className="rounded border-[#1f2937] bg-[#161922] text-cyan-500 focus:ring-cyan-500/20"
                        />
                        <span>I accept Finova Privacy Policy and 256-bit encrypted data storage terms.</span>
                      </label>
                    </div>

                    {/* Complete Registration Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoggingIn ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>Setting up your Investor Portfolio...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-zinc-950" />
                          <span>Complete Registration & Launch OS →</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
