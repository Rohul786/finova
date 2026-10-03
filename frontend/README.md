# Finova — Frontend Client

Modern React 19 Single Page Application built with Vite, TypeScript, Tailwind CSS v4, Lucide Icons, and Motion.

## 🚀 Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
If your backend is running on a port other than `5000`, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
And set:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```
The app will run on **http://localhost:3000** and automatically forward all `/api` requests to the Finova Backend.

### 4. Build for Production
```bash
npm run build
```
Outputs static bundle to `dist/`.
