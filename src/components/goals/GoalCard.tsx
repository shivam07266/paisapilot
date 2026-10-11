import React, { useState } from 'react';
import { SavingsGoal } from '../../domain/types';
import { formatINR, formatDate, formatPercent } from '../../utils/formatting';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { Target, Plus, Minus, Trash2, Calendar } from 'lucide-react';

interface GoalCardProps {
  goal: SavingsGoal;
  usableBalance: number;
  onContribute: (id: string, amount: number) => void;
  onWithdraw: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  usableBalance,
  onContribute,
  onWithdraw,
  onDelete,
}) => {
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (val > usableBalance) {
      setError(`Cannot contribute more than your usable balance (${formatINR(usableBalance)}).`);
      return;
    }

    onContribute(goal.id, val);
    setAmountInput('');
    setError(null);
    setShowContributeModal(false);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (val > goal.currentAmount) {
      setError(`Cannot withdraw more than saved balance (${formatINR(goal.currentAmount)}).`);
      return;
    }

    onWithdraw(goal.id, val);
    setAmountInput('');
    setError(null);
    setShowWithdrawModal(false);
  };

  return (
    <Card className="bg-slate-900/90 border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{goal.name}</h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>Target: {formatDate(goal.targetDate)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
            title="Delete goal"
            aria-label={`Delete ${goal.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-baseline mb-1 text-xs">
            <span className="text-slate-400">Saved: <strong className="text-emerald-400">{formatINR(goal.currentAmount)}</strong></span>
            <span className="text-slate-400">Target: <strong className="text-slate-200">{formatINR(goal.targetAmount)}</strong></span>
          </div>
          <ProgressBar
            value={percent}
            color={isCompleted ? 'emerald' : 'blue'}
            label=""
            showPercent
          />
        </div>

        <div className="mt-2 text-xs flex justify-between items-center text-slate-400">
          <span>{isCompleted ? 'Target achieved! 🎉' : `Need ${formatINR(remaining)} more`}</span>
          <span className="text-[11px] font-semibold text-blue-400">{formatPercent(percent)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 text-xs"
          leftIcon={<Plus className="h-3.5 w-3.5 text-emerald-400" />}
          onClick={() => {
            setError(null);
            setAmountInput('');
            setShowContributeModal(true);
          }}
        >
          Add Funds
        </Button>

        {goal.currentAmount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-400 hover:text-slate-200"
            leftIcon={<Minus className="h-3.5 w-3.5" />}
            onClick={() => {
              setError(null);
              setAmountInput('');
              setShowWithdrawModal(true);
            }}
          >
            Withdraw
          </Button>
        )}
      </div>

      {/* Contribute Modal */}
      <Modal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        title={`Add Savings to "${goal.name}"`}
        description="Transfer funds from your usable discretionary balance into this locked goal."
      >
        <form onSubmit={handleContributeSubmit} className="space-y-4">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            Current Usable Balance Available: <strong className="text-emerald-400">{formatINR(usableBalance)}</strong>
          </div>

          <div>
            <label htmlFor="goal-contrib-amount" className="block text-xs font-medium text-slate-300 mb-1">
              Contribution Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
              <input
                id="goal-contrib-amount"
                type="number"
                min="1"
                step="any"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="e.g. 500"
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowContributeModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm">
              Confirm Contribution
            </Button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title={`Withdraw from "${goal.name}"`}
        description="Release locked savings back into your usable balance."
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal-withdraw-amount" className="block text-xs font-medium text-slate-300 mb-1">
              Withdrawal Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
              <input
                id="goal-withdraw-amount"
                type="number"
                min="1"
                step="any"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="e.g. 300"
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Withdrawal
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
