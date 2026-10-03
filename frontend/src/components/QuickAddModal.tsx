import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TransactionType,
  PaymentMethod,
  ExpenseCategory,
} from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  X,
  Sparkles,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Loader2,
  Tag,
  QrCode,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Zap,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  IndianRupee,
} from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Rent & Housing',
  'Education',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Health & Fitness',
  'Investments & Savings',
  'Salary',
  'Freelance',
  'Gifts & Rewards',
  'Miscellaneous',
];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400', badge: 'GPay' },
  { id: 'phonepe', name: 'PhonePe', iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400', badge: 'PhonePe' },
  { id: 'paytm', name: 'Paytm', iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400', badge: 'Paytm' },
  { id: 'bhim', name: 'BHIM UPI', iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', badge: 'BHIM' },
  { id: 'cred', name: 'CRED UPI', iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400', badge: 'CRED' },
];

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', badge: 'HDFC Bank' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', badge: 'SBI' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', badge: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', badge: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra', code: 'KOTAK', badge: 'Kotak' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB', badge: 'PNB' },
  { id: 'bob', name: 'Bank of Baroda', code: 'BOB', badge: 'BOB' },
  { id: 'other', name: 'Other Bank', code: 'NET', badge: 'Other Bank' },
];

const SAVED_CARDS = [
  { id: 'card_1', name: 'HDFC Millennia Credit Card', number: '•••• 4892', type: 'Credit Card' as PaymentMethod, network: 'Visa' },
  { id: 'card_2', name: 'SBI Global Debit Card', number: '•••• 3019', type: 'Debit Card' as PaymentMethod, network: 'RuPay' },
  { id: 'card_3', name: 'ICICI Amazon Pay Credit Card', number: '•••• 7120', type: 'Credit Card' as PaymentMethod, network: 'Mastercard' },
];

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, addTransaction, currency, userProfile } = useApp();

  const [aiPrompt, setAiPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // Specific Payment Method Details
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [showQrCode, setShowQrCode] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Cards state
  const [cardType, setCardType] = useState<'Credit Card' | 'Debit Card'>('Credit Card');
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>('card_1');
  const [cardNumber, setCardNumber] = useState('4532 8920 1829 4892');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');
  const [cardHolder, setCardHolder] = useState(() => userProfile.name || 'Investor');

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // PayPal state
  const [paypalEmail, setPaypalEmail] = useState(() => userProfile.email || 'investor@finova.com');

  // Payment Processing Simulation state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    referenceId: string;
    provider: string;
    amount: number;
    title: string;
  } | null>(null);

  if (!isQuickAddOpen) return null;

  const handleAiSmartParse = async () => {
    if (!aiPrompt.trim()) return;
    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch('/api/gemini/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiPrompt }),
      });
      const data = await res.json();

      if (data.title) setTitle(data.title);
      if (data.amount) setAmount(String(data.amount));
      if (data.type) setType(data.type as TransactionType);
      if (data.category && CATEGORIES.includes(data.category)) {
        setCategory(data.category as ExpenseCategory);
      }
      if (data.paymentMethod) {
        const pm = data.paymentMethod as PaymentMethod;
        setPaymentMethod(pm);
        if (pm === 'Credit Card') setCardType('Credit Card');
        if (pm === 'Debit Card') setCardType('Debit Card');
      }
      if (data.notes) setNotes(data.notes);
    } catch (err: any) {
      setParseError('Failed to parse with AI. Please fill in details below.');
    } finally {
      setIsParsing(false);
    }
  };

  const getPresetAmounts = () => {
    if (currency === 'INR') {
      return [100, 500, 1000, 2000, 5000, 10000];
    }
    return [10, 25, 50, 100, 250, 500];
  };

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const generatePaymentReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    switch (paymentMethod) {
      case 'UPI':
        return `UPI/${new Date().getFullYear()}/${timestamp}/${rand}`;
      case 'Credit Card':
      case 'Debit Card':
        return `CARD_AUTH_${timestamp}_${rand}`;
      case 'Net Banking':
        return `NETBNK_${selectedBank.toUpperCase()}_${timestamp}`;
      case 'PayPal':
        return `PP-TXN-${timestamp}${rand}`;
      default:
        return `FINOVA-TXN-${timestamp}`;
    }
  };

  const getProviderName = () => {
    switch (paymentMethod) {
      case 'UPI': {
        const found = UPI_APPS.find((a) => a.id === selectedUpiApp);
        return found ? found.name : 'UPI Gateway';
      }
      case 'Credit Card':
        return 'Credit Card (Visa / Mastercard)';
      case 'Debit Card':
        return 'Debit Card (RuPay / Visa)';
      case 'Net Banking': {
        const found = POPULAR_BANKS.find((b) => b.id === selectedBank);
        return found ? `${found.name} Net Banking` : 'Net Banking';
      }
      case 'PayPal':
        return 'PayPal Wallet';
      case 'Cash':
        return 'Physical Cash / Wallet';
      default:
        return paymentMethod;
    }
  };

  const executeTransactionSave = (refId?: string) => {
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const provider = getProviderName();
    const referenceId = refId || generatePaymentReference();

    addTransaction({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      paymentMethod,
      paymentProvider: provider,
      referenceId,
      date,
      notes: notes.trim() ? `${notes.trim()} (Ref: ${referenceId})` : `Paid via ${provider} (Ref: ${referenceId})`,
      tags: tags.length ? tags : [paymentMethod.toLowerCase().replace(/\s+/g, '-')],
      isRecurring,
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setAiPrompt('');
    setNotes('');
    setTagsInput('');
    setIsQuickAddOpen(false);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    setIsProcessingPayment(true);
    const provider = getProviderName();
    const refId = generatePaymentReference();

    // Step 1: Gateway connect
    setProcessingStep(`Connecting to secure ${provider} gateway...`);
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Cryptographic Authorization
    setProcessingStep(`Authorizing ${formatCurrency(numAmount, currency)} ${type === 'income' ? 'deposit' : 'payment'} with 256-bit encryption...`);
    await new Promise((r) => setTimeout(r, 700));

    // Step 3: Success
    setProcessingStep(`Payment Confirmed! Reference: ${refId}`);
    setPaymentSuccessData({
      referenceId: refId,
      provider,
      amount: numAmount,
      title: title.trim(),
    });

    await new Promise((r) => setTimeout(r, 800));

    executeTransactionSave(refId);
    setIsProcessingPayment(false);
    setPaymentSuccessData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        id="modal-quick-add"
        className="bg-[#111318] border border-[#1f2937] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937] bg-[#0e1014] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Add Transaction & Payments</h3>
              <p className="text-xs text-zinc-400">Deposit money or execute payments via UPI, Cards, Net Banking & PayPal</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1f2937] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing State Overlay */}
        {isProcessingPayment && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-zinc-100">Processing Payment Gateway</h4>
              <p className="text-xs text-emerald-400 font-medium">{processingStep}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-[#161922] px-3 py-1.5 rounded-full border border-[#1f2937]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finova Cryptographic Payment Hub</span>
            </div>
          </div>
        )}

        {!isProcessingPayment && (
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            {/* Action Intent Selector: Make Payment vs Put/Deposit Money vs Invest */}
            <div className="grid grid-cols-3 gap-2 bg-[#161922] p-1.5 rounded-xl border border-[#1f2937]">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('Food & Dining');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Pay / Expense</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Salary');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Put / Deposit Money</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('investment');
                  setCategory('Investments & Savings');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'investment'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Invest Capital</span>
              </button>
            </div>

            {/* AI Quick Parse Box */}
            <div className="bg-[#161922] border border-amber-500/30 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Smart Parser</span>
                </div>
                <span className="text-[10px] text-zinc-400">Natural language text</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAiSmartParse();
                    }
                  }}
                  placeholder='e.g. "Dinner 1250 on GPay" or "Received $150 on PayPal" or "Rent 18000 via HDFC NetBanking"'
                  className="flex-1 bg-[#101217] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAiSmartParse}
                  disabled={isParsing || !aiPrompt.trim()}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  {isParsing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Auto-Fill</span>
                </button>
              </div>
              {parseError && (
                <p className="text-[11px] text-amber-400 mt-1.5">{parseError}</p>
              )}
            </div>

            <form onSubmit={handleSimulatePayment} className="space-y-4">
              {/* Title & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {type === 'income' ? 'Source / Deposit Title *' : 'Merchant / Payment For *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      type === 'income'
                        ? 'e.g. Bank Deposit, Freelance Client, Salary'
                        : 'e.g. Swiggy, Amazon, Electricity Bill, Landlord'
                    }
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* Quick Amount Preset Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-zinc-400 font-medium">Quick Amount Presets</span>
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getPresetAmounts().map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddPreset(val)}
                      className="px-2.5 py-1 rounded-lg bg-[#161922] hover:bg-[#1f2937] border border-[#1f2937] text-[11px] font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                    >
                      +{currency === 'INR' ? `₹${val.toLocaleString('en-IN')}` : `$${val}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYMENT & MONEY CHANNEL SELECTOR */}
              <div className="bg-[#141720] border border-[#1f2937] rounded-xl p-3.5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#1f2937]/70">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-200">
                      {type === 'income' ? 'Deposit / Transfer Channel' : 'Payment Method & Gateway'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Gateway Enabled
                  </span>
                </div>

                {/* Main Payment Method Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 1. UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Fast</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-zinc-100">UPI Apps</div>
                      <div className="text-[10px] text-zinc-400">GPay, PhonePe, QR</div>
                    </div>
                  </button>

                  {/* 2. Cards */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod(cardType);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card'
                        ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-sm'
                        : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">Cards</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-zinc-100">Credit / Debit</div>
                      <div className="text-[10px] text-zinc-400">Visa, RuPay, Master</div>
                    </div>
                  </button>

                  {/* 3. Net Banking */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Net Banking')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'Net Banking'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">Bank</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-zinc-100">Net Banking</div>
                      <div className="text-[10px] text-zinc-400">HDFC, SBI, ICICI</div>
                    </div>
                  </button>

                  {/* 4. PayPal */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PayPal')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'PayPal'
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                        : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-400">🅿️</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Global</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-zinc-100">PayPal</div>
                      <div className="text-[10px] text-zinc-400">USD, EUR & Wallet</div>
                    </div>
                  </button>
                </div>

                {/* Method Specific Interactive Drawer */}
                {/* 1. UPI APPS VIEW */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-[#101217] rounded-xl p-3.5 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-300">Select UPI App or VPA:</span>
                      <button
                        type="button"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{showQrCode ? 'Hide QR' : 'Show Dynamic QR'}</span>
                      </button>
                    </div>

                    {/* UPI App Icons Grid */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {UPI_APPS.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`py-2 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            selectedUpiApp === app.id
                              ? `${app.iconBg} font-bold shadow-xs scale-102`
                              : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span className="text-[10px] truncate max-w-full">{app.badge}</span>
                        </button>
                      ))}
                    </div>

                    {/* Dynamic QR Code Modal View */}
                    {showQrCode && (
                      <div className="bg-[#161922] p-3 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shrink-0 shadow-md">
                          <svg className="w-24 h-24" viewBox="0 0 100 100">
                            {/* SVG QR Code Representation */}
                            <rect width="100" height="100" fill="white" />
                            <rect x="5" y="5" width="30" height="30" fill="black" />
                            <rect x="10" y="10" width="20" height="20" fill="white" />
                            <rect x="15" y="15" width="10" height="10" fill="black" />

                            <rect x="65" y="5" width="30" height="30" fill="black" />
                            <rect x="70" y="10" width="20" height="20" fill="white" />
                            <rect x="75" y="15" width="10" height="10" fill="black" />

                            <rect x="5" y="65" width="30" height="30" fill="black" />
                            <rect x="10" y="70" width="20" height="20" fill="white" />
                            <rect x="15" y="75" width="10" height="10" fill="black" />

                            {/* Data dots */}
                            <rect x="42" y="10" width="6" height="6" fill="black" />
                            <rect x="52" y="15" width="6" height="6" fill="black" />
                            <rect x="42" y="25" width="6" height="6" fill="black" />
                            <rect x="45" y="45" width="10" height="10" fill="#10B981" />
                            <rect x="15" y="45" width="6" height="6" fill="black" />
                            <rect x="25" y="52" width="6" height="6" fill="black" />
                            <rect x="65" y="45" width="6" height="6" fill="black" />
                            <rect x="75" y="55" width="6" height="6" fill="black" />
                            <rect x="45" y="65" width="6" height="6" fill="black" />
                            <rect x="55" y="75" width="6" height="6" fill="black" />
                            <rect x="70" y="70" width="6" height="6" fill="black" />
                            <rect x="80" y="80" width="6" height="6" fill="black" />
                          </svg>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                          <div className="text-xs font-bold text-zinc-100">Scan & Pay {formatCurrency(parseFloat(amount) || 0, currency)}</div>
                          <div className="text-[11px] text-emerald-400 font-mono">finova.pay@okhdfcbank</div>
                          <p className="text-[10px] text-zinc-400">Supported on GPay, PhonePe, Paytm, CRED & any BHIM UPI scanner</p>
                        </div>
                      </div>
                    )}

                    {/* VPA / UPI ID Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. mobile@upi or username@okhdfcbank"
                        className="flex-1 bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(upiId);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="px-3 py-2 bg-[#161922] hover:bg-[#1f2937] border border-[#1f2937] text-zinc-300 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. CARDS VIEW */}
                {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                  <div className="bg-[#101217] rounded-xl p-3.5 border border-blue-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Toggle Credit vs Debit */}
                      <div className="flex items-center gap-1 bg-[#161922] p-0.5 rounded-lg border border-[#1f2937]">
                        <button
                          type="button"
                          onClick={() => {
                            setCardType('Credit Card');
                            setPaymentMethod('Credit Card');
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            cardType === 'Credit Card'
                              ? 'bg-blue-500 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCardType('Debit Card');
                            setPaymentMethod('Debit Card');
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            cardType === 'Debit Card'
                              ? 'bg-blue-500 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Debit Card
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <span className="px-1.5 py-0.5 bg-[#161922] rounded border border-[#1f2937] font-semibold text-zinc-300">Visa</span>
                        <span className="px-1.5 py-0.5 bg-[#161922] rounded border border-[#1f2937] font-semibold text-zinc-300">RuPay</span>
                        <span className="px-1.5 py-0.5 bg-[#161922] rounded border border-[#1f2937] font-semibold text-zinc-300">Mastercard</span>
                      </div>
                    </div>

                    {/* Saved Cards Fast Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {SAVED_CARDS.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setSelectedSavedCard(card.id);
                            setCardNumber(`•••• •••• •••• ${card.number.slice(-4)}`);
                            setCardType(card.type as 'Credit Card' | 'Debit Card');
                            setPaymentMethod(card.type);
                          }}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            selectedSavedCard === card.id
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-200 shadow-xs'
                              : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="text-[10px] font-bold truncate text-zinc-200">{card.name}</div>
                          <div className="text-[9px] font-mono text-zinc-400">{card.number} • {card.network}</div>
                        </button>
                      ))}
                    </div>

                    {/* Card input fields */}
                    <div className="space-y-2">
                      <div>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="Card Number (4532 •••• •••• ••••)"
                          className="w-full bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Cardholder Name"
                          className="bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono"
                        />
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV (•••)"
                          className="bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. NET BANKING VIEW */}
                {paymentMethod === 'Net Banking' && (
                  <div className="bg-[#101217] rounded-xl p-3.5 border border-amber-500/20 space-y-3">
                    <span className="text-[11px] font-bold text-zinc-300">Select Bank Gateway:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            selectedBank === b.id
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-xs'
                              : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="text-xs font-bold text-zinc-100">{b.code}</div>
                          <div className="text-[9px] text-zinc-400 truncate">{b.badge}</div>
                        </button>
                      ))}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 bg-[#161922] p-2 rounded-lg border border-[#1f2937]">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Direct 2FA Verified Bank Portal connection active.</span>
                    </div>
                  </div>
                )}

                {/* 4. PAYPAL VIEW */}
                {paymentMethod === 'PayPal' && (
                  <div className="bg-[#101217] rounded-xl p-3.5 border border-cyan-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-300">PayPal Express Checkout & Wallet:</span>
                      <span className="text-[10px] text-zinc-400">Zero foreign transaction markup</span>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] text-zinc-400">Connected PayPal ID / Email</label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-[#161922] text-zinc-200 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-[#161922] p-2.5 rounded-lg border border-[#1f2937]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>PayPal One-Touch Active</span>
                      </div>
                      <span className="text-cyan-400 font-bold">1-Click Authorized</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category, Date, Tags, Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#111318] text-zinc-200">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tags & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g. food, weekend, hostel, paypal"
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Notes / Bill Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add bill invoice, merchant note..."
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3 py-2 rounded-lg border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Recurring monthly toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-[#161922] border-[#1f2937] focus:ring-emerald-500"
                />
                <span className="text-xs text-zinc-300">
                  Mark as recurring monthly subscription / scheduled transfer
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => executeTransactionSave()}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-[#161922] hover:bg-[#1f2937] border border-[#1f2937] rounded-xl transition-colors cursor-pointer"
                >
                  Quick Log Ledger (No Gateway)
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="px-3.5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      type === 'income'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25'
                        : type === 'investment'
                        ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/25'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-zinc-950" />
                    <span>
                      {type === 'income'
                        ? `Deposit ${amount ? formatCurrency(parseFloat(amount) || 0, currency) : ''} via ${paymentMethod}`
                        : `Pay ${amount ? formatCurrency(parseFloat(amount) || 0, currency) : ''} via ${paymentMethod}`}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
