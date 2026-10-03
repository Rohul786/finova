# Finova — Backend API Service

Express & TypeScript API backend powering Finova with Gemini AI integration, real-time OTP verification, and transactional email services.

## 🚀 Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
And provide your configuration:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=optional_resend_api_key_for_emails
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on **http://localhost:5000**.

### 4. Endpoints
- `GET /api/health` — Health check
- `POST /api/gemini/advisor` — Financial co-pilot analysis
- `POST /api/gemini/analyze-budget` — Budget health and categorization audit
- `POST /api/gemini/parse-expense` — Natural language expense transaction parser
- `POST /api/gemini/plan-portfolio` — AI portfolio allocator and wealth compounding
- `POST /api/auth/forgot-password` — Generate & dispatch 6-digit OTP email
- `POST /api/auth/verify-otp` — Verify OTP & generate password reset token
- `POST /api/auth/reset-password` — Complete password update
