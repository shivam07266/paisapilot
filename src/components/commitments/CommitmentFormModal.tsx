import React, { useState } from 'react';
import { ExpenseCategory, CommitmentRecurrence } from '../../domain/types';
import { VALID_EXPENSE_CATEGORIES, validateCommitmentInput } from '../../utils/validation';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface CommitmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    amount: number;
    dueDate: string;
    recurrence: CommitmentRecurrence;
    category: ExpenseCategory;
    status: 'upcoming';
    notes?: string;
  }) => void;
}

export const CommitmentFormModal: React.FC<CommitmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [recurrence, setRecurrence] = useState<CommitmentRecurrence>('monthly');
  const [category, setCategory] = useState<ExpenseCategory>('Bills');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCommitmentInput({
      name,
      amount,
      dueDate,
      category,
      recurrence,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      name: name.trim(),
      amount: parseFloat(amount),
      dueDate,
      recurrence,
      category,
      status: 'upcoming',
      notes: notes.trim() || undefined,
    });

    // Reset
    setName('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Upcoming Commitment"
      description="Reserve funds for future mandatory expenses before you spend."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="com-name" className="block text-xs font-medium text-slate-300 mb-1">
            Commitment / Bill Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="com-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wi-Fi bill, Gym pass, College fee"
            className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-rose-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="com-amount" className="block text-xs font-medium text-slate-300 mb-1">
              Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
              <input
                id="com-amount"
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="799"
                className={`w-full pl-7 pr-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-rose-500' : 'border-slate-800'
                }`}
                required
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="com-date" className="block text-xs font-medium text-slate-300 mb-1">
              Due Date <span className="text-rose-400">*</span>
            </label>
            <input
              id="com-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                errors.dueDate ? 'border-rose-500' : 'border-slate-800'
              }`}
              required
            />
            {errors.dueDate && <p className="text-xs text-rose-400 mt-1">{errors.dueDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="com-recurrence" className="block text-xs font-medium text-slate-300 mb-1">
              Recurrence
            </label>
            <select
              id="com-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as CommitmentRecurrence)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="one-time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label htmlFor="com-category" className="block text-xs font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              id="com-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
            >
              {VALID_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="com-notes" className="block text-xs font-medium text-slate-300 mb-1">
            Notes (Optional)
          </label>
          <input
            id="com-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Split with roommate"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Commitment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
