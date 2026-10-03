# Finova — Intelligent Wealth & Stock Market OS

Finova is structured into clean, decoupled **Frontend** and **Backend** directories.

```
finova---intelligent-wealth-&-stock-market-os/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS SPA
└── backend/              # Node.js + Express + TypeScript + Gemini AI API
```

---

## 🚀 Quick Start

### Option 1: Run via Root Workspaces (Recommended)

1. **Install all dependencies** (for both frontend & backend):
   ```bash
   npm install
   ```

2. **Configure your Backend `.env`**:
   Copy `backend/.env.example` to `backend/.env` and insert your Gemini API Key:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start Backend**:
   ```bash
   npm run dev:backend
   ```
   *Runs Express on http://localhost:5000*

4. **In a separate terminal, start Frontend**:
   ```bash
   npm run dev:frontend
   ```
   *Runs Vite on http://localhost:3000 (proxies `/api` to port 5000 automatically)*

---

### Option 2: Run Separately from Each Directory

#### Running Frontend:
```bash
cd frontend
npm install
npm run dev
```

#### Running Backend:
```bash
cd backend
npm install
npm run dev
```
