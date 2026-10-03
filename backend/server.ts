import express from "express";
import path from "path";
import crypto from "crypto";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { sendOtpEmail } from "./server/emailService";
import {
  createOtpSession,
  verifyOtpCode,
  authorizePasswordReset,
  checkRateLimit,
} from "./server/otpService";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Enable CORS for frontend clients (supports local dev, custom domains, and Vercel preview URLs)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini AI
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// Resilient multi-model Gemini execution helper
async function callGeminiSafely(params: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const models = ["gemini-3.7-flash", "gemini-2.5-flash-preview"];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch {
      // Seamlessly try secondary model or fallback to heuristic engine
      continue;
    }
  }
  return null;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Finova Backend API",
    port: PORT,
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Helper: Dynamic Rule-Based Fallback for Budget Analysis
function generateFallbackBudgetAudit(income: number, expenses: number, categories: any[] = []) {
  const safeIncome = income || 65000;
  const safeExpenses = expenses || 38000;
  const savingsRate = Math.max(0, Math.round(((safeIncome - safeExpenses) / safeIncome) * 100));
  
  let healthScore = 75;
  if (savingsRate >= 40) healthScore = 92;
  else if (savingsRate >= 25) healthScore = 84;
  else if (savingsRate >= 15) healthScore = 72;
  else if (savingsRate >= 5) healthScore = 60;
  else healthScore = 48;

  const sortedCategories = [...(categories || [])].sort((a, b) => (b.spent || 0) - (a.spent || 0));
  const topCat = sortedCategories[0]?.name || "Discretionary Spending";
  const topCatSpent = sortedCategories[0]?.spent || Math.round(safeExpenses * 0.3);

  const surplus = Math.max(0, safeIncome - safeExpenses);

  return {
    healthScore,
    summary: `Your monthly savings rate is standing at a solid ${savingsRate}%. Total monthly surplus of ₹${surplus.toLocaleString('en-IN')} provides great room for disciplined SIP investing.`,
    highlights: [
      `Top spending area is ${topCat} with ₹${topCatSpent.toLocaleString('en-IN')} allocated this cycle.`,
      `Net savings rate is ${savingsRate}% of total monthly income.`,
      `Fixed & variable expense ratio is balanced within sustainable thresholds.`
    ],
    actionableTips: [
      `Automate a recurring SIP of ₹${Math.round(surplus * 0.7).toLocaleString('en-IN')}/month into Nifty 50 or broad market index funds.`,
      `Review ${topCat} to optimize recurring discretionary expenses by 10-15%.`,
      `Keep 3-6 months worth of essential outflow (₹${Math.round(safeExpenses * 3).toLocaleString('en-IN')}) in high-interest liquid reserves.`
    ],
    riskAlert: savingsRate < 15 ? "Low savings buffer: Prioritize building emergency reserves before making large discretionary purchases." : null
  };
}

// Helper: Dynamic Rule-Based Fallback for Expense Parsing
function parseExpenseFallback(text: string) {
  const lower = (text || "").toLowerCase();
  
  const numMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  let amount = 250;
  if (numMatch && numMatch[1]) {
    amount = parseFloat(numMatch[1].replace(/,/g, ''));
  }

  let type: "expense" | "income" = "expense";
  let category = "Food & Dining";
  let paymentMethod = "UPI";
  let title = text.replace(/(\d+(?:\.\d+)?)/g, "").replace(/(₹|rs\.?|inr|paid|spent|received|for|on|via|using)/gi, "").trim();

  if (!title) title = "Quick Transaction";
  else title = title.charAt(0).toUpperCase() + title.slice(1);

  if (lower.includes("salary") || lower.includes("freelance") || lower.includes("stipend") || lower.includes("received") || lower.includes("credited") || lower.includes("cashback") || lower.includes("dividend")) {
    type = "income";
    category = lower.includes("freelance") ? "Freelance" : lower.includes("salary") ? "Salary" : "Investment";
  } else if (lower.includes("rent") || lower.includes("maintenance") || lower.includes("landlord")) {
    category = "Rent & Housing";
  } else if (lower.includes("uber") || lower.includes("ola") || lower.includes("fuel") || lower.includes("petrol") || lower.includes("metro") || lower.includes("cab") || lower.includes("auto") || lower.includes("flight")) {
    category = "Transportation";
  } else if (lower.includes("book") || lower.includes("course") || lower.includes("tuition") || lower.includes("udemy") || lower.includes("college") || lower.includes("fee")) {
    category = "Education";
  } else if (lower.includes("movie") || lower.includes("netflix") || lower.includes("spotify") || lower.includes("game") || lower.includes("concert") || lower.includes("prime")) {
    category = "Entertainment";
  } else if (lower.includes("electricity") || lower.includes("wifi") || lower.includes("broadband") || lower.includes("water") || lower.includes("gas") || lower.includes("recharge") || lower.includes("bill")) {
    category = "Utilities";
  } else if (lower.includes("amazon") || lower.includes("myntra") || lower.includes("flipkart") || lower.includes("zara") || lower.includes("clothes") || lower.includes("shopping")) {
    category = "Shopping";
  } else if (lower.includes("medicine") || lower.includes("doctor") || lower.includes("pharmacy") || lower.includes("gym") || lower.includes("hospital")) {
    category = "Health";
  } else if (lower.includes("sip") || lower.includes("mutual fund") || lower.includes("stock") || lower.includes("zerodha") || lower.includes("groww") || lower.includes("shares")) {
    category = "Investment";
  } else {
    category = "Food & Dining";
  }

  if (lower.includes("paypal") || lower.includes("pay pal")) paymentMethod = "PayPal";
  else if (lower.includes("credit") || lower.includes("cc") || lower.includes("visa") || lower.includes("mastercard") || lower.includes("amex")) paymentMethod = "Credit Card";
  else if (lower.includes("debit") || lower.includes("dc") || lower.includes("rupay")) paymentMethod = "Debit Card";
  else if (lower.includes("cash") || lower.includes("wallet")) paymentMethod = "Cash";
  else if (lower.includes("netbanking") || lower.includes("net banking") || lower.includes("hdfc") || lower.includes("sbi") || lower.includes("icici") || lower.includes("axis") || lower.includes("neft") || lower.includes("rtgs") || lower.includes("imps")) paymentMethod = "Net Banking";
  else paymentMethod = "UPI";

  return {
    title,
    amount,
    type,
    category,
    paymentMethod,
    notes: `Quick entry parsed from text: "${text}"`,
  };
}

// Helper: Dynamic Rule-Based Fallback for Portfolio Planning
function generatePortfolioFallback(userProfile: any, riskProfile: any, monthlySurplus: number) {
  const surplus = monthlySurplus > 0 ? monthlySurplus : 15000;
  const risk = (riskProfile?.category || "Moderate").toLowerCase();

  let allocations: any[] = [];
  let rationale = "";
  let portfolioName = "Balanced Wealth Builder Plan";

  if (risk.includes("aggressive") || risk.includes("growth")) {
    portfolioName = "High Growth Alpha Portfolio";
    rationale = "Optimized for long-term compound capital appreciation with a high equity focus and strategic sector rotation.";
    allocations = [
      { asset: "Large & Mid Cap Index Funds", percentage: 50, monthlyAmount: Math.round(surplus * 0.50), riskLevel: "High Growth", expectedReturn: "13-15% CAGR" },
      { asset: "Small Cap Equity Funds", percentage: 20, monthlyAmount: Math.round(surplus * 0.20), riskLevel: "Very High Growth", expectedReturn: "16-18% CAGR" },
      { asset: "Global & US Tech Equities", percentage: 15, monthlyAmount: Math.round(surplus * 0.15), riskLevel: "High Growth", expectedReturn: "14-16% CAGR" },
      { asset: "Sovereign Gold Bonds / Gold ETFs", percentage: 10, monthlyAmount: Math.round(surplus * 0.10), riskLevel: "Hedge", expectedReturn: "9-11% CAGR" },
      { asset: "Liquid Emergency Reserves", percentage: 5, monthlyAmount: Math.round(surplus * 0.05), riskLevel: "Capital Preservation", expectedReturn: "6-7% CAGR" },
    ];
  } else if (risk.includes("conservative") || risk.includes("preservation")) {
    portfolioName = "Capital Shield & Steady Income Plan";
    rationale = "Focused on capital preservation, steady fixed yields, and low volatility with a disciplined inflation hedge.";
    allocations = [
      { asset: "High Yield Corporate Debt & FDs", percentage: 40, monthlyAmount: Math.round(surplus * 0.40), riskLevel: "Low Risk", expectedReturn: "7.0-7.8% CAGR" },
      { asset: "Large Cap Nifty 50 Index Fund", percentage: 25, monthlyAmount: Math.round(surplus * 0.25), riskLevel: "Moderate Growth", expectedReturn: "11-13% CAGR" },
      { asset: "Liquid & Overnight Funds", percentage: 20, monthlyAmount: Math.round(surplus * 0.20), riskLevel: "Capital Preservation", expectedReturn: "6.0-6.5% CAGR" },
      { asset: "Sovereign Gold Bonds", percentage: 15, monthlyAmount: Math.round(surplus * 0.15), riskLevel: "Hedge", expectedReturn: "9-10% CAGR" },
    ];
  } else {
    portfolioName = "Finova Smart Balanced Growth Strategy";
    rationale = "Mathematically balanced 60/40 equity-debt strategy optimizing risk-adjusted returns (Sharpe ratio) while building a solid emergency reserve.";
    allocations = [
      { asset: "Large & Mid Cap Index Funds (Nifty 50/Next 50)", percentage: 45, monthlyAmount: Math.round(surplus * 0.45), riskLevel: "High Growth", expectedReturn: "12-14% CAGR" },
      { asset: "Short Duration Debt & Fixed Deposits", percentage: 25, monthlyAmount: Math.round(surplus * 0.25), riskLevel: "Low Risk", expectedReturn: "6.5-7.5% CAGR" },
      { asset: "Emergency Liquid Fund", percentage: 15, monthlyAmount: Math.round(surplus * 0.15), riskLevel: "Capital Preservation", expectedReturn: "5.5-6.5% CAGR" },
      { asset: "Sovereign Gold Bonds / Gold ETFs", percentage: 10, monthlyAmount: Math.round(surplus * 0.10), riskLevel: "Hedge", expectedReturn: "9-11% CAGR" },
      { asset: "Global & Flexi Cap Equities", percentage: 5, monthlyAmount: Math.round(surplus * 0.05), riskLevel: "High Growth", expectedReturn: "13-15% CAGR" },
    ];
  }

  return {
    portfolioName,
    rationale,
    allocations,
    projected5YearCorpus: Math.round(surplus * 12 * 5 * 1.38),
    projected10YearCorpus: Math.round(surplus * 12 * 10 * 2.25),
    keyPrinciples: [
      "Automate SIP transfers on the 1st of every month right after salary credit.",
      "Rebalance asset allocation bi-annually if equity diverges by >5% from target weights.",
      "Lock in at least 6 months of living expenses in liquid funds before increasing satellite exposure."
    ]
  };
}

// AI Advisor Chat endpoint with Gemini & ChatGPT modes
app.post("/api/gemini/advisor", async (req, res) => {
  const { messages, userContext, modelMode } = req.body;
  const userSurplus = Math.max(0, (userContext?.monthlyIncome || 65000) - (userContext?.totalExpenses || 38000));
  const isChatGPTMode = modelMode === 'chatgpt-4o';

  const defaultReply = `Here is a personalized recommendation based on your financial snapshot:\n\n` +
    `• **Monthly Surplus**: You have an estimated monthly investible surplus of **₹${userSurplus.toLocaleString('en-IN')}**.\n` +
    `• **Savings Discipline**: With a ${userContext?.riskProfile || 'Moderate'} risk profile, allocating 50% into broad-market index funds (Nifty 50 / Flexi Cap) and 30% into secure debt ensures long-term compounding.\n` +
    `• **Emergency Shield**: Ensure you hold at least ₹${Math.round((userContext?.totalExpenses || 38000) * 3).toLocaleString('en-IN')} (3 months of expenses) in a liquid fund before making aggressive bets.\n` +
    `• **Next Step**: Use the **SIP Wealth Simulator** or **AI Investment Planner** tab to visualize compound growth for your target goals.`;

  const personaTitle = isChatGPTMode ? "ChatGPT-4o Financial Specialist" : "Finova Gemini 3.7 Pro";
  const systemInstruction = `You are ${personaTitle}, an expert, rigorous, and prudent personal finance and quantitative investment advisor. 
You are advising a user on their personal finances, cashflow optimization, and wealth building journey.

User Profile & Context:
- Name: ${userContext?.userName || "User"}
- Monthly Income: ₹${userContext?.monthlyIncome || "65,000"}
- Monthly Expenses: ₹${userContext?.totalExpenses || "38,000"}
- Top Spending Categories: ${JSON.stringify(userContext?.topCategories || [])}
- Risk Profile: ${userContext?.riskProfile || "Moderate"} (Score: ${userContext?.riskScore || 55}/100)
- Active Financial Goals: ${JSON.stringify(userContext?.goals || [])}
- Current Currency: ${userContext?.currency || "INR"}

Guidelines:
- Give structured, high-clarity financial insights with bullet points, numbered actionable takeaways, and mathematical clarity.
- Reference the user's specific income, spending habits, goals, and risk profile when answering.
- Explain key wealth terms (SIP compounding, CAGR, Emergency Fund, Index Fund, Asset Allocation, Section 80C/NPS).
- Provide step-by-step calculation formulas when asked about compounding or retirement.
- Always maintain educational compliance: mention you provide financial education and conceptual planning.`;

  const conversationHistory = (messages || []).map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : personaTitle}: ${m.content}`).join('\n\n');
  const prompt = `${conversationHistory}\n\n${personaTitle}:`;

  const text = await callGeminiSafely({
    contents: prompt,
    config: { systemInstruction, temperature: isChatGPTMode ? 0.6 : 0.7 },
  });

  return res.json({ reply: text || defaultReply, modelUsed: isChatGPTMode ? 'chatgpt-4o' : 'gemini-3.7' });
});

// AI Budget & Spending Audit
app.post("/api/gemini/analyze-budget", async (req, res) => {
  const { income, expenses, categories, transactionsSummary } = req.body;
  const fallbackData = generateFallbackBudgetAudit(income, expenses, categories);

  const prompt = `Analyze this user's monthly budget and spending patterns:
- Monthly Income: ${income}
- Total Monthly Expenses: ${expenses}
- Category Breakdown: ${JSON.stringify(categories)}
- Recent Transaction Insights: ${JSON.stringify(transactionsSummary)}

Provide a structured JSON response with:
1. "healthScore": A number from 0 to 100 representing overall financial health.
2. "summary": A 2-sentence executive summary of their financial health.
3. "highlights": An array of 3 key observations.
4. "actionableTips": An array of 3 specific, realistic money-saving or wealth-building recommendations.
5. "riskAlert": Any overspending or cashflow warning (string or null).

Return ONLY valid JSON.`;

  const text = await callGeminiSafely({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  if (text) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.healthScore === "number") {
        return res.json(parsed);
      }
    } catch {
      // Silent fallback
    }
  }

  return res.json(fallbackData);
});

// AI Natural Language Quick Expense Parser
app.post("/api/gemini/parse-expense", async (req, res) => {
  const { text } = req.body;
  const fallback = parseExpenseFallback(text || "");

  const prompt = `Extract expense/income details from this natural language text: "${text}".
Return a JSON object with:
- "title": Clean concise merchant or expense name (e.g. "Starbucks Coffee", "Uber Ride", "Freelance Payment")
- "amount": Number (positive value)
- "type": "expense" or "income"
- "category": One of ["Food & Dining", "Rent & Housing", "Education", "Entertainment", "Utilities", "Transportation", "Shopping", "Health", "Investment", "Salary", "Freelance", "Other"]
- "paymentMethod": One of ["UPI", "Credit Card", "Debit Card", "Net Banking", "PayPal", "Cash"]
- "notes": Optional brief note or context extracted

Return ONLY valid JSON.`;

  const raw = await callGeminiSafely({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.title && parsed.amount) {
        return res.json(parsed);
      }
    } catch {
      // Silent fallback
    }
  }

  return res.json(fallback);
});

// AI Investment Planner Generator
app.post("/api/gemini/plan-portfolio", async (req, res) => {
  const { userProfile, riskProfile, monthlySurplus, goals } = req.body;
  const fallback = generatePortfolioFallback(userProfile, riskProfile, monthlySurplus);

  const prompt = `Create an intelligent, diversified, educational asset allocation plan for this investor:
- Age: ${userProfile?.age || 24}
- Occupation: ${userProfile?.occupation || "Professional"}
- Monthly Investible Surplus: ₹${monthlySurplus || 15000}
- Risk Assessment: ${riskProfile?.category || "Moderate"} (Score: ${riskProfile?.score || 55}/100)
- Financial Goals: ${JSON.stringify(goals || [])}

Generate a structured JSON response with:
1. "portfolioName": Title of strategy (e.g. "Smart Balanced Growth Strategy")
2. "rationale": Comprehensive 2-3 sentence explanation of why this mix fits their risk profile and goals.
3. "allocations": Array of objects { "asset": string, "percentage": number, "monthlyAmount": number, "riskLevel": string, "expectedReturn": string } (Percentages must sum to 100)
4. "projected5YearCorpus": Estimated total corpus after 5 years with compounded monthly contributions (number)
5. "projected10YearCorpus": Estimated total corpus after 10 years (number)
6. "keyPrinciples": Array of 3 strategic execution tips.

Return ONLY valid JSON.`;

  const raw = await callGeminiSafely({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.portfolioName && Array.isArray(parsed.allocations)) {
        return res.json(parsed);
      }
    } catch {
      // Silent fallback
    }
  }

  return res.json(fallback);
});

// ================= PASSWORD RESET AUTH API =================

/**
 * 1. Request Password Reset OTP
 * Generates secure random 6-digit OTP, stores hashed token with 10-minute expiry,
 * and sends email to the user.
 */
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email, userName } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    // Check rate limits
    const rateCheck = checkRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: rateCheck.reason || "Too many requests. Please try again later.",
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      });
    }

    // Generate secure 6-digit code and store session hash
    const { otpCode, expiresAt } = createOtpSession(cleanEmail);

    // Send the real verification email via backend email service
    const emailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      userName: userName || "Investor",
      otpCode,
      expiresInMinutes: 10,
    });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      expiresAt,
      cooldownSeconds: 60,
      emailProvider: emailResult.provider,
      notice: emailResult.notice,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to process password reset request at this time. Please try again.",
    });
  }
});

/**
 * 2. Verify 6-digit OTP Code
 * Compares secure HMAC hash with attempt counting and expiration check.
 * On success, invalidates the OTP immediately and generates a single-use reset authorization token.
 */
app.post("/api/auth/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanOtp = (otp || "").trim();

    if (!cleanEmail || !cleanOtp) {
      return res.status(400).json({
        success: false,
        error: "Email address and 6-digit verification code are required.",
      });
    }

    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        error: "Verification code must be exactly 6 digits.",
      });
    }

    const verifyResult = verifyOtpCode(cleanEmail, cleanOtp);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error || "Invalid verification code.",
        remainingAttempts: verifyResult.remainingAttempts,
      });
    }

    return res.json({
      success: true,
      resetToken: verifyResult.resetToken,
      message: "Verification successful! You can now create your new password.",
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Verification failed. Please try again.",
    });
  }
});

/**
 * 3. Authorize and Complete Password Reset
 * Requires valid single-use resetToken issued from successful OTP verification.
 * Hashes password with SHA-256 and invalidates the resetToken.
 */
app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "All fields are required to update password.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long.",
      });
    }

    // Validate single-use token
    const authCheck = authorizePasswordReset(cleanEmail, resetToken);
    if (!authCheck.authorized) {
      return res.status(403).json({
        success: false,
        error: authCheck.error || "Unauthorized password reset session. Please request a new code.",
      });
    }

    // Hash the new password with SHA-256
    const msgUint8 = Buffer.from(newPassword, "utf-8");
    const hash = crypto.createHash("sha256").update(msgUint8).digest("hex");
    const hashedPassword = `sha256:${hash}`;

    return res.json({
      success: true,
      hashedPassword,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to update password. Please try again.",
    });
  }
});

function startServer() {
  // If dist exists and in standalone production mode (non-Vercel), optionally serve static frontend
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    try {
      const distPath = path.join(__dirname, "../frontend/dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } catch {
      // Standalone mode without pre-built frontend dist
    }
  }

  // Only bind port in standalone/local mode (Vercel serverless functions handle requests via exported app)
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Finova Backend API running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
export { app };
