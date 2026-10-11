import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { DailyAllowanceCard } from '../components/dashboard/DailyAllowanceCard';
import { HealthScoreCard } from '../components/dashboard/HealthScoreCard';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatINR, formatDate, getCategoryColor } from '../utils/formatting';
import {
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Target,
  CalendarClock,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { state, summary, health, risk, addTransaction, payCommitment } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  const recentTransactions = state.transactions.slice(0, 5);
  const upcomingCommitments = state.commitments.filter((c) => c.status !== 'paid').slice(0, 3);
  const activeGoals = state.savingsGoals.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Financial Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            PaisaPilot monitors your liquidity, future obligations, and daily spending velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link to="/simulator" className="flex-1 sm:flex-initial">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
              leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            >
              Simulate Purchase
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            className="flex-1 sm:flex-initial"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Main Core Financial Cards (Row 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <BalanceCard summary={summary} />
        </div>
        <div className="lg:col-span-4">
          <DailyAllowanceCard summary={summary} />
        </div>
      </div>

      {/* Health Score & Spending Visualizations (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <HealthScoreCard health={health} risk={risk} />
        </div>
        <div className="lg:col-span-7">
          <SpendingChart transactions={state.transactions} />
        </div>
      </div>

      {/* Connected Financial Features Summary (Row 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Recent Transactions Widget */}
        <Card className="bg-slate-900/90 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                Recent Activity
              </h3>
              <Link
                to="/transactions"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {recentTransactions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No transactions recorded yet.</div>
              ) : (
                recentTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`p-1.5 rounded-md ${
                            isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {isExpense ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{tx.description}</p>
                          <p className="text-[10px] text-slate-500">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <span className={`font-bold ml-2 shrink-0 ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isExpense ? '-' : '+'}
                        {formatINR(tx.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Upcoming Commitments Widget */}
        <Card className="bg-slate-900/90 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-amber-400" />
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                  Upcoming Commitments
                </h3>
              </div>
              <Link
                to="/commitments"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <span>Manage</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {upcomingCommitments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No unpaid commitments pending!</div>
              ) : (
                upcomingCommitments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200 truncate">{c.name}</p>
                      <p className="text-[10px] text-amber-400/90">Due: {formatDate(c.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-amber-400">{formatINR(c.amount)}</span>
                      <button
                        type="button"
                        onClick={() => payCommitment(c.id)}
                        className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium cursor-pointer"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Savings Goals Widget */}
        <Card className="bg-slate-900/90 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-blue-400" />
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                  Savings Targets
                </h3>
              </div>
              <Link
                to="/goals"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <span>Explore</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {activeGoals.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No savings targets created yet.</div>
              ) : (
                activeGoals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-200">{g.name}</span>
                        <span className="font-bold text-emerald-400">{formatINR(g.currentAmount)}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Target: {formatINR(g.targetAmount)}</span>
                        <span>{pct}% saved</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record New Transaction"
        description="Add an actual income or expense to adjust your cash balances."
      >
        <TransactionForm
          onSubmit={(data) => {
            addTransaction(data);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};
