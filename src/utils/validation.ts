import { AppState, Commitment, ExpenseCategory, IncomeCategory, SavingsGoal, Transaction } from '../domain/types';

export const VALID_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Entertainment',
  'Bills',
  'Subscriptions',
  'Health',
  'Other',
];

export const VALID_INCOME_CATEGORIES: IncomeCategory[] = [
  'Allowance',
  'Stipend',
  'Freelance',
  'Gift',
  'Other',
];

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateAmount(amount: unknown): { isValid: boolean; error?: string; value: number } {
  if (amount === undefined || amount === null || amount === '') {
    return { isValid: false, error: 'Amount is required', value: 0 };
  }

  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));

  if (isNaN(num)) {
    return { isValid: false, error: 'Amount must be a valid number', value: 0 };
  }

  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than ₹0', value: 0 };
  }

  if (num > 10000000) {
    return { isValid: false, error: 'Amount exceeds maximum allowed limit', value: 0 };
  }

  return { isValid: true, value: Math.round(num * 100) / 100 };
}

export function validateDate(dateStr: string): { isValid: boolean; error?: string } {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, error: 'Date is required' };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  return { isValid: true };
}

export function validateTransactionInput(data: {
  amount: unknown;
  description: string;
  category: string;
  date: string;
  type: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const amountCheck = validateAmount(data.amount);
  if (!amountCheck.isValid) {
    errors.amount = amountCheck.error || 'Invalid amount';
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length > 100) {
    errors.description = 'Description must be 100 characters or less';
  }

  const dateCheck = validateDate(data.date);
  if (!dateCheck.isValid) {
    errors.date = dateCheck.error || 'Invalid date';
  }

  if (data.type !== 'income' && data.type !== 'expense') {
    errors.type = 'Type must be either income or expense';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSavingsGoalInput(data: {
  name: string;
  targetAmount: unknown;
  currentAmount?: unknown;
  targetDate: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Goal name is required';
  }

  const targetAmountCheck = validateAmount(data.targetAmount);
  if (!targetAmountCheck.isValid) {
    errors.targetAmount = targetAmountCheck.error || 'Invalid target amount';
  }

  if (data.currentAmount !== undefined && data.currentAmount !== '') {
    const cur = typeof data.currentAmount === 'number' ? data.currentAmount : parseFloat(String(data.currentAmount));
    if (isNaN(cur) || cur < 0) {
      errors.currentAmount = 'Current savings cannot be negative';
    }
  }

  const dateCheck = validateDate(data.targetDate);
  if (!dateCheck.isValid) {
    errors.targetDate = dateCheck.error || 'Invalid target date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCommitmentInput(data: {
  name: string;
  amount: unknown;
  dueDate: string;
  category: string;
  recurrence: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Commitment name is required';
  }

  const amountCheck = validateAmount(data.amount);
  if (!amountCheck.isValid) {
    errors.amount = amountCheck.error || 'Invalid amount';
  }

  const dateCheck = validateDate(data.dueDate);
  if (!dateCheck.isValid) {
    errors.dueDate = dateCheck.error || 'Invalid due date';
  }

  if (!['one-time', 'monthly', 'weekly'].includes(data.recurrence)) {
    errors.recurrence = 'Invalid recurrence frequency';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates state imported from JSON or LocalStorage, sanitizing safely.
 */
export function sanitizeAppState(raw: unknown, defaultState: AppState): AppState {
  if (!raw || typeof raw !== 'object') {
    return defaultState;
  }

  const candidate = raw as Partial<AppState>;

  const startingBudget = typeof candidate.startingBudget === 'number' && candidate.startingBudget >= 0
    ? candidate.startingBudget
    : defaultState.startingBudget;

  const period = candidate.period && typeof candidate.period.startDate === 'string' && typeof candidate.period.endDate === 'string'
    ? candidate.period
    : defaultState.period;

  const transactions: Transaction[] = Array.isArray(candidate.transactions)
    ? candidate.transactions.filter(
        (t): t is Transaction =>
          Boolean(t) &&
          typeof t.id === 'string' &&
          typeof t.amount === 'number' &&
          !isNaN(t.amount) &&
          (t.type === 'income' || t.type === 'expense') &&
          typeof t.description === 'string'
      )
    : defaultState.transactions;

  const savingsGoals: SavingsGoal[] = Array.isArray(candidate.savingsGoals)
    ? candidate.savingsGoals.filter(
        (g): g is SavingsGoal =>
          Boolean(g) &&
          typeof g.id === 'string' &&
          typeof g.name === 'string' &&
          typeof g.targetAmount === 'number' &&
          typeof g.currentAmount === 'number'
      )
    : defaultState.savingsGoals;

  const commitments: Commitment[] = Array.isArray(candidate.commitments)
    ? candidate.commitments.filter(
        (c): c is Commitment =>
          Boolean(c) &&
          typeof c.id === 'string' &&
          typeof c.name === 'string' &&
          typeof c.amount === 'number'
      )
    : defaultState.commitments;

  const categoryBudgets = Array.isArray(candidate.categoryBudgets)
    ? candidate.categoryBudgets
    : defaultState.categoryBudgets;

  return {
    startingBudget,
    period,
    transactions,
    savingsGoals,
    commitments,
    categoryBudgets,
  };
}
