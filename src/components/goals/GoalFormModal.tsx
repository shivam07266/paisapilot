import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { validateSavingsGoalInput } from '../../utils/validation';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }) => void;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSavingsGoalInput({
      name,
      targetAmount,
      currentAmount: initialSaved ? initialSaved : 0,
      targetDate,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: initialSaved ? parseFloat(initialSaved) : 0,
      targetDate,
    });

    // Reset
    setName('');
    setTargetAmount('');
    setInitialSaved('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Savings Goal"
      description="Lock away funds for future milestones or emergency buffers."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-goal-name" className="block text-xs font-medium text-slate-300 mb-1">
            Goal Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="new-goal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Goa Trip, New Phone, Emergency Fund"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'goal-name-error' : undefined}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-rose-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.name && (
            <p id="goal-name-error" role="alert" className="text-xs text-rose-400 mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="new-goal-target" className="block text-xs font-medium text-slate-300 mb-1">
              Target Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
              <input
                id="new-goal-target"
                type="number"
                min="1"
                step="any"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="5000"
                aria-invalid={Boolean(errors.targetAmount)}
                aria-describedby={errors.targetAmount ? 'goal-target-error' : undefined}
                className={`w-full pl-7 pr-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                  errors.targetAmount ? 'border-rose-500' : 'border-slate-800'
                }`}
                required
              />
            </div>
            {errors.targetAmount && (
              <p id="goal-target-error" role="alert" className="text-xs text-rose-400 mt-1">
                {errors.targetAmount}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="new-goal-current" className="block text-xs font-medium text-slate-300 mb-1">
              Initial Deposit (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
              <input
                id="new-goal-current"
                type="number"
                min="0"
                step="any"
                value={initialSaved}
                onChange={(e) => setInitialSaved(e.target.value)}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="new-goal-date" className="block text-xs font-medium text-slate-300 mb-1">
            Target Completion Date <span className="text-rose-400">*</span>
          </label>
          <input
            id="new-goal-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            aria-invalid={Boolean(errors.targetDate)}
            aria-describedby={errors.targetDate ? 'goal-date-error' : undefined}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 ${
              errors.targetDate ? 'border-rose-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.targetDate && (
            <p id="goal-date-error" role="alert" className="text-xs text-rose-400 mt-1">
              {errors.targetDate}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
