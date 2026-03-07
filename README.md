# SupplyChain NG — Nigerian Market Intelligence Platform

A full-stack web application concept for tracking simulated commodity and tech hardware prices across Nigerian states. Built as a portfolio project to demonstrate a real-world data platform architecture with role-based access control, interactive charts, and a verified journalism workflow.

> **Note:** This is a simulation. All prices and market data are algorithmically generated to mimic realistic Nigerian market conditions. No live data feeds are connected — see [Connecting Real Data Sources](#connecting-real-data-sources) for how this would work in production.

---

## Features

- **Live Price Dashboard** — Simulated price averages across 22 commodities in 10 states with 24h delta indicators
- **60-Day Trend Charts** — Area charts showing min/max/avg price bands over time
- **State Comparison** — Horizontal bar charts comparing prices across Nigerian states
- **Category Filtering** — Tech Hardware, Fuel & Energy, Grains & Staples, Protein & Livestock, Construction, Cooking Essentials
- **News & Reports Hub** — Verified market intelligence feed
- **Role-Based Access Control** — Separate editor and admin workflows
- **Automated Price Ingestor** — Cron job that simulates daily price updates

---

## Roles & Permissions

| Feature | Public | Editor | Admin |
|---|---|---|---|
| View dashboard & prices | ✅ | ✅ | ✅ |
| Read verified reports | ✅ | ✅ | ✅ |
| Write & submit reports | — | ✅ | ✅ |
| Edit own pending reports | — | ✅ | ✅ |
| Delete own pending reports | — | ✅ | ✅ |
| Approve / reject reports | — | ❌ | ✅ |
| Delete any report | — | ❌ | ✅ |
| Admin Panel | — | ❌ | ✅ |

**Editors** can write, edit, and delete their own reports — but only while they are still pending review. Once a report is verified or rejected by an admin, it is locked.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL 14+ |
| Backend | Node.js 18+ + Express 4 |
| ORM | Sequelize 6 |
| Frontend | React 18 + Vite 5 |
| Charts | Recharts 2 |
| State Management | TanStack React Query 5 |
| Auth | bcryptjs + jsonwebtoken |
| Scheduler | node-cron |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 9+

### 1. Enter the folder

```bash
cd supply-chain-ng
```

### 2. Create the database

```bash
psql -U postgres
CREATE DATABASE supplychain_ng;
\q
```

### 3. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/supplychain_ng
JWT_SECRET=your_long_random_secret_string_here
PORT=5000
```

### 4. Install dependencies

From the project root:

```bash
npm run install:all
```

### 5. Seed the database

```bash
cd server
npm run seed
```

This generates:
- 2 users (admin + editor)
- 6 categories, 22 items, 10 state locations
- ~13,000 simulated price log entries (60 days of history)
- 7 sample news reports

**Login credentials:**
- Admin: `admin@supplychain.ng` / `Admin@1234`
- Editor: `editor@supplychain.ng` / `Editor@1234`

### 6. Start development servers

From the project root:

```bash
npm run dev
```

- Backend API: http://localhost:5000
- Frontend: http://localhost:5173

---

## Project Structure

```
supply-chain-ng/
├── package.json                 ← Root scripts (concurrently runs both servers)
│
├── server/                      ← Express + Sequelize backend
│   ├── server.js                ← Entry point
│   ├── .env.example             ← Environment variable template
│   ├── config/
│   │   ├── database.js          ← Sequelize connection
│   │   └── seed.js              ← Database seeder with simulated data
│   ├── models/
│   │   └── index.js             ← Sequelize models (User, Item, PriceLog, Report...)
│   ├── routes/
│   │   ├── auth.js              ← Login endpoint + JWT issuance
│   │   ├── prices.js            ← Price summary, history, state comparison
│   │   ├── items.js             ← Items, categories, locations
│   │   └── reports.js           ← Report CRUD with role-based permissions
│   ├── middleware/
│   │   └── auth.js              ← JWT verify + adminOnly guard
│   └── services/
│       └── ingestor.js          ← Cron job: simulates daily price updates
│
└── client/                      ← React + Vite frontend
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx              ← Routes with role-based protection
        ├── index.css            ← Design system (dark theme, CSS variables)
        ├── components/
        │   ├── Sidebar.jsx      ← Role-aware navigation
        │   ├── PriceTrendChart.jsx
        │   ├── StateComparisonChart.jsx
        │   ├── NewsCard.jsx
        │   └── LoadingStates.jsx
        ├── pages/
        │   ├── Dashboard.jsx    ← Market overview with KPIs
        │   ├── MarketPrices.jsx ← Full price table + trend/state charts
        │   ├── NewsFeed.jsx     ← Public verified reports feed
        │   ├── EditorReports.jsx ← Editor: write, edit, delete own reports
        │   ├── AdminPanel.jsx   ← Admin: approve/reject all reports
        │   └── Login.jsx
        ├── hooks/
        │   ├── useAuth.jsx      ← Auth context + localStorage persistence
        │   └── useData.js       ← React Query data hooks
        └── utils/
            ├── api.js           ← Axios client with auth header injection
            └── format.js        ← Naira formatting, date helpers
```

---

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login → JWT token | — |
| POST | `/api/auth/register` | Register new user | — |
| GET | `/api/prices/summary` | All items with 24h delta | — |
| GET | `/api/prices/:itemId` | 60-day price history | — |
| GET | `/api/prices/market/state-comparison/:itemId` | Prices by state | — |
| GET | `/api/items` | All tracked items | — |
| GET | `/api/items/categories` | All categories | — |
| GET | `/api/items/locations` | All state locations | — |
| GET | `/api/reports` | Verified reports (public) | — |
| GET | `/api/reports/mine` | Logged-in user's own reports | JWT |
| GET | `/api/reports/all` | All reports (any status) | JWT Admin |
| POST | `/api/reports` | Submit a new report | JWT |
| PUT | `/api/reports/:id` | Edit own pending report | JWT |
| PUT | `/api/reports/:id/verify` | Approve or reject a report | JWT Admin |
| DELETE | `/api/reports/:id` | Delete report | JWT (own pending) / Admin |

---

## Connecting Real Data Sources

This project uses a simulated market engine (`server/services/ingestor.js`). In a production deployment, the `generateMarketPrice()` function would be replaced with real API integrations:

| Data Type | Suggested Source |
|---|---|
| Fuel prices (PMS/AGO) | PPPRA daily price bulletins |
| Foreign exchange rates | CBN official rates API |
| Commodity prices | NBS agricultural market data |
| Tech hardware prices | Scraping Jumia / Konga product listings |
| LPG/cooking gas | DPR price monitoring |

The cron schedule (`0 0 * * *` — midnight WAT daily) and the ingestor architecture are already in place; only the data-fetching logic needs to be swapped out.

---

## Deployment

### Frontend (Vercel / Netlify)

```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Backend (Railway / Render / Fly.io)

Set environment variables on your hosting provider:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Random secret (min 32 chars)
- `NODE_ENV=production`

---

