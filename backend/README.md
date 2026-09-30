# BuildAI — Tier 2 (Application & Logic Server)

This is the Application & Business Logic Tier for the BuildAI 3-tier architecture.

## Architecture

- **Tier 1 (Presentation)**: React + Vite + TypeScript (Frontend in root `src/`)
- **Tier 2 (Application / Logic)**: Node.js + Express + TypeScript (`server/`)
- **Tier 3 (Data Persistence)**: SQLite / PostgreSQL with Prisma ORM (`server/prisma/`)

---

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Initialize Database (Tier 3)
```bash
npx prisma db push
```

### 3. Start the Server in Development Mode
```bash
npm run dev
```

The server starts on `http://localhost:5000`.

---

## API Endpoints

### Health Check
- `GET /api/health` — Checks server status and uptime

### Projects CRUD
- `GET /api/projects` — Fetch all projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get single project with calculation
- `PUT /api/projects/:id` — Update project parameters
- `DELETE /api/projects/:id` — Delete project

### Civil Engineering Engine
- `POST /api/engineering/calculate` — Calculate built-up area, material allowances (cement, steel, aggregates), and cost estimates
- `GET /api/engineering/rates` — Base rate benchmarks and standard structural assumptions
