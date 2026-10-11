import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinance } from '../../hooks/useFinance';
import { formatDate } from '../../utils/formatting';
import { Calendar, AlertTriangle } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { state, daysRemaining, resetToDemo } = useFinance();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = () => {
    resetToDemo();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* Skip to Content for keyboard screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <Sidebar onResetDemo={() => setShowResetConfirm(true)} />

      {/* Mobile Top & Drawer */}
      <MobileNav onResetDemo={() => setShowResetConfirm(true)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Top Header Bar */}
        <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <span>
                Cycle: {formatDate(state.period.startDate, false)} – {formatDate(state.period.endDate)}
              </span>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                daysRemaining <= 5
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : daysRemaining <= 10
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-xs text-slate-400 font-medium">
              Monthly Budget: <strong className="text-white ml-1">₹{state.startingBudget.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full outline-none">
          <Outlet />
        </main>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset to Demo State?"
        description="This will restore the default ₹10,000 budget and sample transactions."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>
              All custom transactions, savings goals, and commitments you added will be replaced with the initial demo data.
            </span>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset}>
              Yes, Reset Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
