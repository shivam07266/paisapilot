import React, { useState } from 'react';
import { Transaction, ExpenseCategory, IncomeCategory } from '../../domain/types';
import { Button } from '../ui/Button';
import { VALID_EXPENSE_CATEGORIES, VALID_INCOME_CATEGORIES, validateTransactionInput } from '../../utils/validation';

interface TransactionFormProps {
  initialData?: Transaction | null;
  onSubmit: (data: {
    type: 'income' | 'expense';
    category: ExpenseCategory | IncomeCategory;
    amount: number;
    date: string;
    description: string;
    isRecurring?: boolean;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [category, setCategory] = useState<string>(initialData?.category || 'Food');
  const [amount, setAmount] = useState<string>(initialData ? String(initialData.amount) : '');
  const [date, setDate] = useState<string>(() => initialData?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [isRecurring, setIsRecurring] = useState<boolean>(initialData?.isRecurring || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    if (newType === 'income' && !VALID_INCOME_CATEGORIES.includes(category as IncomeCategory)) {
      setCategory('Allowance');
    } else if (newType === 'expense' && !VALID_EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
      setCategory('Food');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTransactionInput({
      type,
      category,
      amount,
      date,
      description,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      type,
      category: category as ExpenseCategory | IncomeCategory,
      amount: parseFloat(amount),
      date,
      description: description.trim(),
      isRecurring,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transaction Type Radio Selector */}
      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-xs font-medium text-slate-300 mb-1.5">Transaction Type</legend>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={type === 'expense'}
            onClick={() => handleTypeChange('expense')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            aria-pressed={type === 'income'}
            onClick={() => handleTypeChange('income')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Income (+)
          </button>
        </div>
      </fieldset>

      {/* Amount Input */}
      <div>
        <label htmlFor="tx-amount" className="block text-xs font-medium text-slate-300 mb-1">
          Amount (INR ₹) <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-semibold">₹</span>
          <input
            id="tx-amount"
            type="number"
            step="any"
            min="1"
            placeholder="e.g. 250"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'tx-amount-error' : undefined}
            className={`w-full pl-8 pr-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? 'border-rose-500' : 'border-slate-800'
            }`}
            required
          />
        </div>
        {errors.amount && (
          <p id="tx-amount-error" role="alert" className="text-[11px] text-rose-400 mt-1">
            {errors.amount}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="tx-desc" className="block text-xs font-medium text-slate-300 mb-1">
          Description <span className="text-rose-400">*</span>
        </label>
        <input
          id="tx-desc"
          type="text"
          placeholder="e.g. Lunch with project team"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'tx-desc-error' : undefined}
          className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-rose-500' : 'border-slate-800'
          }`}
          required
        />
        {errors.description && (
          <p id="tx-desc-error" role="alert" className="text-[11px] text-rose-400 mt-1">
            {errors.description}
          </p>
        )}
      </div>

      {/* Category & Date Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="tx-category" className="block text-xs font-medium text-slate-300 mb-1">
            Category
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {type === 'expense'
              ? VALID_EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              : VALID_INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-date" className="block text-xs font-medium text-slate-300 mb-1">
            Date
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'tx-date-error' : undefined}
            className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-rose-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.date && (
            <p id="tx-date-error" role="alert" className="text-[11px] text-rose-400 mt-1">
              {errors.date}
            </p>
          )}
        </div>
      </div>

      {/* Recurring Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <input
          id="tx-recurring"
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="tx-recurring" className="text-xs text-slate-300 select-none cursor-pointer">
          Recurring expense (e.g. subscription or recurring fee)
        </label>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm">
          {initialData ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};
