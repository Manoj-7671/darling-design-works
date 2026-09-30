# BuildAI — Presentation Layer (Tier 1 Frontend)

This folder contains the complete user interface, 3D interactive viewer, 2D blueprint layout, and civil engineering design studio.

## Technologies
- **React 18**
- **Vite**
- **TypeScript**
- **Tailwind CSS & Radix UI**
- **Lucide Icons**
- **Pure CSS 3D Engine** (`FloorPlan3D.tsx`)

---

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend Dev Server
```bash
npm run dev
```

Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

---

## Backend Connection
The frontend connects to the Tier 2 API Server via `src/services/api.ts` (defaults to `http://localhost:5000/api`).
To change the backend endpoint, set the `VITE_API_URL` environment variable:
```env
VITE_API_URL=http://localhost:5000/api
```
