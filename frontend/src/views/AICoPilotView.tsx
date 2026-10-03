import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { FinovaLogo } from '../components/FinovaLogo';
import {
  Sparkles,
  Bot,
  Send,
  User,
  Loader2,
  Trash2,
  Zap,
  ShieldCheck,
  Target,
  Wallet,
  Cpu,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AICoPilotView: React.FC = () => {
  const {
    chatMessages,
    setChatMessages,
    userProfile,
    monthlyStats,
    categories,
    goals,
    riskProfile,
    currency,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.7' | 'chatgpt-4o'>('gemini-3.7');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const QUICK_PROMPTS = [
    'Can I afford a ₹60,000 laptop purchase this month?',
    'How should I deploy ₹20,000 monthly according to my risk profile?',
    'Audit my category budgets and find where I am overspending.',
    'How can I reach my ₹10 Lakh corpus milestone 1 year faster with SIPs?',
    'Explain the tax efficiency of ELSS vs PPF vs Equity Index Funds for my bracket.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...chatMessages, userMessage];
    setChatMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          modelMode: selectedModel,
          userContext: {
            userName: userProfile.name,
            monthlyIncome: monthlyStats.income,
            totalExpenses: monthlyStats.expenses,
            currency: userProfile.currency,
            riskProfile: riskProfile.category,
            riskScore: riskProfile.score,
            topCategories: categories.map((c) => ({
              name: c.name,
              spent: c.spent,
              allocated: c.allocated,
            })),
            goals: goals.map((g) => ({
              title: g.title,
              target: g.targetAmount,
              current: g.currentAmount,
              targetDate: g.targetDate,
            })),
          },
        }),
      });

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content:
          data.reply ||
          "I've reviewed your financial snapshot. Let me know if you need specific budgeting or SIP allocation calculations!",
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed || selectedModel,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat error', err);
      const fallbackMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content:
          `I'm currently running in standalone advisory mode. Based on your live profile:\n\n` +
          `• **Monthly Income**: ₹${(monthlyStats.income || 65000).toLocaleString('en-IN')}\n` +
          `• **Monthly Surplus**: ₹${monthlyStats.netSavings.toLocaleString('en-IN')}\n` +
          `• **Risk Style**: ${riskProfile.category} (Score: ${riskProfile.score}/100)\n\n` +
          `**Action Plan**: Allocate 60% of your surplus into Nifty 50/Flexi-cap SIPs and 40% into high-yield emergency reserves.`,
        timestamp: new Date().toISOString(),
        modelUsed: selectedModel,
      };
      setChatMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'msg_welcome_reset',
        role: 'assistant',
        content: `Chat session refreshed! How can ${selectedModel === 'chatgpt-4o' ? 'ChatGPT-4o Financial Specialist' : 'Finova Gemini 3.7'} assist your wealth plan today?`,
        timestamp: new Date().toISOString(),
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] bg-[#111318] border border-[#1f2937] rounded-3xl overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#1f2937] bg-[#141824] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 p-1 rounded-2xl bg-[#161922] border border-[#1f2937] shadow-md shadow-emerald-500/10">
            <FinovaLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">Finova AI & ChatGPT Co-Pilot</h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                Live Synced
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Personalized financial advice for <strong className="text-zinc-200">{userProfile.name}</strong>
            </p>
          </div>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-[#111318] border border-[#1f2937] p-1 rounded-xl gap-1">
            <button
              onClick={() => setSelectedModel('gemini-3.7')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedModel === 'gemini-3.7'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Gemini 3.7</span>
            </button>
            <button
              onClick={() => setSelectedModel('chatgpt-4o')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedModel === 'chatgpt-4o'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>ChatGPT-4o</span>
            </button>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-[#1f2937] transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-[#0d0f14]">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="shrink-0 mt-0.5 shadow-sm">
                  {msg.modelUsed === 'chatgpt-4o' ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                  ) : (
                    <FinovaLogo size={32} />
                  )}
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-zinc-950 font-semibold rounded-tr-none shadow-md shadow-amber-500/10'
                    : 'bg-[#161922] border border-[#1f2937] text-zinc-200 rounded-tl-none space-y-2'
                }`}
              >
                {!isUser ? (
                  <div className="prose prose-invert prose-xs max-w-none space-y-2">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.modelUsed && (
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 pt-2 border-t border-[#1f2937]">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Powered by {msg.modelUsed === 'chatgpt-4o' ? 'ChatGPT-4o Specialist' : 'Gemini 3.7 Pro'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 border border-amber-400/60">
                  {userProfile.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-900/60 flex items-center justify-center text-amber-300 font-bold text-xs">
                      {userProfile.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#161922] border border-[#1f2937] rounded-2xl rounded-tl-none p-4 text-xs text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{selectedModel === 'chatgpt-4o' ? 'ChatGPT-4o' : 'Gemini 3.7'} is calculating financial roadmap...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 border-t border-[#1f2937] bg-[#111318] flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
        <span className="text-[11px] font-bold text-zinc-400 shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Prompts:
        </span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#161922] hover:bg-amber-500/15 hover:text-amber-300 hover:border-amber-500/30 text-zinc-300 border border-[#1f2937] transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-[#141824] border-t border-[#1f2937]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${selectedModel === 'chatgpt-4o' ? 'ChatGPT-4o' : 'Gemini'} about budgets, SIP targets, tax savings or market strategy...`}
            className="flex-1 bg-[#111318] border border-[#1f2937] rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
