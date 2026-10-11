import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { ExpenseCategory } from '../domain/types';
import { VALID_EXPENSE_CATEGORIES } from '../utils/validation';
import { formatINR, getCategoryColor } from '../utils/formatting';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AlertTriangle, Edit3 } from 'lucide-react';

export const BudgetPage: React.FC = () => {
  const { state, updateCategoryBudget } = useFinance();
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [limitInput, setLimitInput] = useState('');

  // Calculate spent per category
  const categoryStats = VALID_EXPENSE_CATEGORIES.map((cat) => {
    const budgetObj = state.categoryBudgets.find((b) => b.category === cat);
    const limit = budgetObj ? budgetObj.allocatedLimit : 1000;

    const spent = state.transactions
      .filter((t) => t.type === 'expense' && t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const remaining = limit - spent;

    return {
      category: cat,
      limit,
      spent,
      percent,
      remaining,
      color: getCategoryColor(cat),
    };
  });

  const totalAllocated = categoryStats.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = categoryStats.reduce((sum, c) => sum + c.spent, 0);

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const num = parseFloat(limitInput);
    if (!isNaN(num) && num >= 0) {
      updateCategoryBudget(editingCategory, num);
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Category Spending Limits
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Set envelopes for each spending category to control burn rate and avoid overspending.
          </p>
        </div>

        <div className="text-right flex flex-wrap gap-3 items-center">
          <div>
            <span className="text-xs text-slate-400">Total Spent: </span>
            <strong className="text-sm font-bold text-rose-400">{formatINR(totalSpent)}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Limits: </span>
            <strong className="text-sm font-bold text-white">{formatINR(totalAllocated)}</strong>
          </div>
        </div>
      </div>

      {/* Grid of Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((item) => {
          const isBreached = item.percent > 100;
          const isWarning = item.percent >= 80 && !isBreached;

          return (
            <Card
              key={item.category}
              className={`bg-slate-900/90 border-slate-800 flex flex-col justify-between transition-all ${
                isBreached ? 'border-rose-900/50 bg-rose-950/10' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color.bar }}
                    />
                    <h3 className="text-sm font-bold text-white">{item.category}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(item.category);
                      setLimitInput(String(item.limit));
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit category limit"
                    aria-label={`Edit limit for ${item.category}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-baseline mb-1 text-xs">
                    <span className="text-slate-400">
                      Spent: <strong className={isBreached ? 'text-rose-400' : 'text-slate-200'}>{formatINR(item.spent)}</strong>
                    </span>
                    <span className="text-slate-400">
                      Limit: <strong className="text-slate-300">{formatINR(item.limit)}</strong>
                    </span>
                  </div>

                  <ProgressBar
                    value={item.percent}
                    color={isBreached ? 'rose' : isWarning ? 'amber' : 'blue'}
                    showPercent
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  {isBreached ? (
                    <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Exceeded by {formatINR(Math.abs(item.remaining))}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      {formatINR(item.remaining)} remaining
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isBreached
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isBreached ? 'Over Budget' : isWarning ? 'Near Limit' : 'Within Budget'}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Limit Modal */}
      <Modal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title={`Set Budget Limit: ${editingCategory}`}
        description="Configure your target maximum monthly expenditure for this category."
      >
        <form onSubmit={handleSaveLimit} className="space-y-4">
          <div>
            <label htmlFor="budget-limit-val" className="block text-xs font-medium text-slate-300 mb-1">
              Monthly Limit Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
              <input
                id="budget-limit-val"
                type="number"
                min="0"
                step="any"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Limit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
