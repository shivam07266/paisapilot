import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';

// Lazy-load secondary views for Core Web Vitals & bundle splitting
const SimulatorPage = lazy(() => import('./pages/SimulatorPage').then((m) => ({ default: m.SimulatorPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const BudgetPage = lazy(() => import('./pages/BudgetPage').then((m) => ({ default: m.BudgetPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const CommitmentsPage = lazy(() => import('./pages/CommitmentsPage').then((m) => ({ default: m.CommitmentsPage })));
const InsightsPage = lazy(() => import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage })));

const RouteLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center" role="status" aria-live="polite">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    <span className="sr-only">Loading view...</span>
    <p className="mt-3 text-xs text-slate-400 font-medium">Loading cockpit view...</p>
  </div>
);

export function App() {
  return (
    <FinanceProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route
              path="simulator"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SimulatorPage />
                </Suspense>
              }
            />
            <Route
              path="transactions"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <TransactionsPage />
                </Suspense>
              }
            />
            <Route
              path="budget"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <BudgetPage />
                </Suspense>
              }
            />
            <Route
              path="goals"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GoalsPage />
                </Suspense>
              }
            />
            <Route
              path="commitments"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <CommitmentsPage />
                </Suspense>
              }
            />
            <Route
              path="insights"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <InsightsPage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  );
}

export default App;
