# PaisaPilot — Interactive Personal Finance Simulator

> *"Your money. Your decisions. Your future."*

**PaisaPilot** is a personal finance simulation web application engineered for Gen Z, students, and young professionals. Managing a ₹10,000 monthly budget over 30 days, PaisaPilot goes beyond basic expense logging by dynamically connecting income, discretionary cash, upcoming financial obligations, ring-fenced savings goals, financial risk, and an explainable financial health index.

Its signature capability is the **What-If Decision Simulator**: a financial simulation engine that lets users project the interconnected consequences of discretionary purchases and unexpected expenses *before* spending a single rupee.

---

## 🚀 Key Highlights & Architectural Features

1. **What-If Financial Decision Simulator (Zero-Risk Sandbox)**
   - Pre-loaded with realistic Gen Z decisions (Wireless Headphones: ₹2,000, Social Outing: ₹800, Course: ₹1,500, Laptop Repair: ₹2,500, Streaming: ₹499).
   - Side-by-side comparison of **Before vs. After** metrics:
     - Discretionary usable balance impact (Delta ₹)
     - Daily spending allowance impact (Delta ₹/day)
     - Financial risk rating shifts (Low, Moderate, Elevated, Critical)
     - Explainable financial health index (0–100 score shift)
     - Commitment coverage & savings goal feasibility protection
   - **Scenario A vs. Scenario B Comparison**: Compare a high-ticket purchase against a budget-conscious alternative.
   - **Simulation Isolation Guarantee**: Previewing never mutates actual financial ledgers. Committing a decision requires explicit confirmation and logs the transaction exactly once without duplicate deductions.

2. **Unified Financial Accounting Engine (`financeEngine.ts`)**
   - Strictly distinguishes between total cash, discretionary liquidity, and locked reserves:
     $$\text{Current Cash} = \text{Starting Budget} + \text{Received Income} - \text{Paid Expenses}$$
     $$\text{Usable Balance} = \text{Current Cash} - \text{Unpaid Commitments Reserved} - \text{Savings Reserved}$$
     $$\text{Daily Spending Allowance} = \frac{\text{Usable Balance}}{\max(1, \text{Days Remaining})}$$
   - **Zero double-counting**: When an upcoming commitment is paid, its unpaid reservation is cleared and the cash expense is recorded simultaneously. When funds are deposited into savings goals, they are ring-fenced from usable balance without being recorded as external expenses.

3. **Deterministic Financial Health Index (0–100)**
   - **Budget Sustainability (30%)**: Evaluates whether usable cash comfortably spans remaining cycle days.
   - **Spending Discipline (25%)**: Evaluates adherence to category budget limits.
   - **Commitment Coverage (20%)**: Verifies that cash reserves fully back upcoming unpaid bills.
   - **Emergency Cushion (15%)**: Ensures at least 15% liquid buffer is secured.
   - **Savings Feasibility (10%)**: Measures consistent contributions to savings milestones.

4. **Dynamic 30-Day Monthly Forecast**
   - Visual trajectory model tracking projected month-end balance.
   - Factors in burn rate pacing and scheduled calendar dates for upcoming bills.

5. **Local-First & Resilient Persistence**
   - Stored in browser `localStorage` (`paisapilot_state_v1`).
   - Graceful recovery: Corrupted or missing storage automatically falls back to clean state without crashing.
   - Includes **One-Click Reset to Demo Data** and **JSON Backup Export**.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (Refined dark navy theme, electric blue accents, emerald/amber/rose signals)
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Visualizations**: Recharts (Responsive category pie charts & 30-day projection line charts)
- **Testing**: Vitest + React Testing Library + JSDOM

---

## 📂 Project Structure

```text
paisapilot/
├── public/
│   └── favicon.svg                  # SVG Favicon (₹P Rupee motif)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # Responsive frame, skip link, cycle header
│   │   │   ├── Sidebar.tsx          # Desktop navigation & quick balance stats
│   │   │   └── MobileNav.tsx        # Mobile drawer & bottom bar navigation
│   │   ├── dashboard/
│   │   │   ├── BalanceCard.tsx      # Discretionary liquidity & cash breakdown
│   │   │   ├── DailyAllowanceCard.tsx# Daily spending pacing & burn rate
│   │   │   ├── HealthScoreCard.tsx  # Radial 0-100 score & 5-factor explanation
│   │   │   └── SpendingChart.tsx    # Category donut & accessible breakdown
│   │   ├── transactions/
│   │   │   ├── TransactionForm.tsx  # Validated input modal (Income & Expense)
│   │   │   └── TransactionList.tsx  # Searchable & filterable ledger with deletion
│   │   ├── simulator/
│   │   │   ├── SimulatorForm.tsx    # Presets & custom scenario builder
│   │   │   ├── ScenarioResults.tsx  # Before vs. after delta analysis & confirmation
│   │   │   └── ScenarioComparison.tsx# Side-by-side Option A vs. Option B
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx         # Goal card with add/withdraw modal
│   │   │   └── GoalFormModal.tsx    # Create new savings target
│   │   ├── commitments/
│   │   │   ├── CommitmentList.tsx   # Upcoming & settled obligations with Pay Now
│   │   │   └── CommitmentFormModal.tsx # Add bill / recurring commitment
│   │   └── ui/
│   │       ├── Button.tsx           # Accessible button with loading & variants
│   │       ├── Card.tsx             # Dark navy container surfaces
│   │       ├── Modal.tsx            # Accessible dialog with escape key & focus trap
│   │       ├── ProgressBar.tsx      # Semantic progressbar with ARIA attributes
│   │       ├── Badge.tsx            # Status & category pills
│   │       └── EmptyState.tsx       # Friendly fallback states
│   ├── pages/
│   │   ├── DashboardPage.tsx        # Financial cockpit overview
│   │   ├── SimulatorPage.tsx        # Dedicated What-If decision sandbox
│   │   ├── TransactionsPage.tsx     # Full ledger and cash flow records
│   │   ├── BudgetPage.tsx           # Category spending envelopes & alerts
│   │   ├── GoalsPage.tsx            # Savings milestones & ring-fencing
│   │   ├── CommitmentsPage.tsx      # Obligations & subscription manager
│   │   └── InsightsPage.tsx         # 30-day forecast & risk intelligence
│   ├── context/
│   │   └── FinanceContext.tsx       # Global finance provider & state dispatchers
│   ├── domain/
│   │   ├── types.ts                 # Strict TypeScript domain types
│   │   └── financeEngine.ts         # Pure mathematical financial engine
│   ├── utils/
│   │   ├── formatting.ts            # Indian Rupee (INR) and date formatters
│   │   ├── validation.ts            # Input sanitization and bounds checking
│   │   └── forecast.ts              # Time-series 30-day forecast generator
│   ├── data/
│   │   └── demoData.ts              # Pre-populated ₹10,000 Gen Z sample budget
│   ├── test/
│   │   ├── setup.ts                 # Vitest test setup
│   │   ├── financeEngine.test.ts    # Financial calculations & formulas
│   │   ├── simulator.test.ts        # Isolation & delta computations
│   │   ├── validation.test.ts       # Input safety & LocalStorage recovery
│   │   └── components.test.tsx      # Component interactions & accessibility
│   ├── App.tsx                      # Router and provider tree
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Tailwind CSS v4 design system
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

---

## 💻 Installation & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Run Automated Test Suite
```bash
npm test
```
Executes all 18 unit, engine, and component interaction tests via Vitest.

### 5. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready static bundle in `./dist`.

---

## ♿ Accessibility & Design Details

- **Semantic Landmark HTML**: Correct `<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, and `<dialog>`.
- **Keyboard Navigation**: Dedicated `"Skip to main content"` shortcut for keyboard users; ESC key listener for modals; focus rings on interactive elements.
- **Color Contrast & Indicators**: Risk levels, budget alerts, and progress states combine color coding with explicit text and icons to ensure WCAG AA compliance.
- **Indian Rupee Formatting**: Displays standard Indian currency notations (`₹10,000`, `₹1,250.50`).
