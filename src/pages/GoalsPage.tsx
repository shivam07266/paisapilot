import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalFormModal } from '../components/goals/GoalFormModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { formatINR } from '../utils/formatting';
import { Target, Plus, PiggyBank, Sparkles } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { state, summary, addSavingsGoal, contributeToGoal, withdrawFromGoal, deleteSavingsGoal } =
    useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  const { totalTarget, totalSaved } = useMemo(() => {
    return {
      totalTarget: state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalSaved: state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0),
    };
  }, [state.savingsGoals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Savings Goals & Emergency Buffers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Lock savings away from discretionary spending to protect your long-term plans.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Create Goal
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <PiggyBank className="h-4 w-4 text-emerald-400" />
            <span>Total Locked in Savings</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{formatINR(totalSaved)}</div>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Target className="h-4 w-4 text-blue-400" />
            <span>Aggregate Target Goals</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{formatINR(totalTarget)}</div>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Usable Discretionary Balance</span>
          </div>
          <div className="text-xl font-bold text-blue-400 mt-1">{formatINR(summary.usableBalance)}</div>
        </Card>
      </div>

      {/* Goal Cards Grid */}
      {state.savingsGoals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6" />}
          title="No savings goals yet"
          description="Create your first goal to start ring-fencing funds for gadgets, travel, or an emergency buffer."
          action={
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              Create First Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.savingsGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              usableBalance={summary.usableBalance}
              onContribute={contributeToGoal}
              onWithdraw={withdrawFromGoal}
              onDelete={deleteSavingsGoal}
            />
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      <GoalFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addSavingsGoal}
      />
    </div>
  );
};
