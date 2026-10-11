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
 * Prevents prototype pollution, NaN values, negative balances, and oversized payloads.
 */
export function sanitizeAppState(raw: unknown, defaultState: AppState): AppState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultState;
  }

  const candidate = raw as Record<string, unknown>;

  const startingBudget =
    typeof candidate.startingBudget === 'number' &&
    Number.isFinite(candidate.startingBudget) &&
    candidate.startingBudget >= 0 &&
    candidate.startingBudget <= 10000000
      ? Math.round(candidate.startingBudget * 100) / 100
      : defaultState.startingBudget;

  const candidatePeriod = candidate.period as Record<string, unknown> | undefined;
  const period =
    candidatePeriod &&
    typeof candidatePeriod.startDate === 'string' &&
    typeof candidatePeriod.endDate === 'string' &&
    !isNaN(new Date(candidatePeriod.startDate).getTime()) &&
    !isNaN(new Date(candidatePeriod.endDate).getTime())
      ? {
          startDate: candidatePeriod.startDate,
          endDate: candidatePeriod.endDate,
          totalDays:
            typeof candidatePeriod.totalDays === 'number' && candidatePeriod.totalDays > 0
              ? candidatePeriod.totalDays
              : defaultState.period.totalDays,
        }
      : defaultState.period;

  const transactions: Transaction[] = Array.isArray(candidate.transactions)
    ? candidate.transactions
        .filter(
          (t): t is Record<string, unknown> =>
            Boolean(t) &&
            typeof t === 'object' &&
            typeof t.amount === 'number' &&
            Number.isFinite(t.amount) &&
            t.amount > 0
        )
        .map((t) => ({
          id: typeof t.id === 'string' && t.id.trim() ? t.id.trim().slice(0, 50) : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          amount: Math.round((t.amount as number) * 100) / 100,
          type: t.type === 'income' ? ('income' as const) : ('expense' as const),
          category: (typeof t.category === 'string' &&
          ([...VALID_EXPENSE_CATEGORIES, ...VALID_INCOME_CATEGORIES] as string[]).includes(t.category)
            ? t.category
            : 'Other') as Transaction['category'],
          description: typeof t.description === 'string' && t.description.trim() ? t.description.trim().slice(0, 100) : 'Transaction',
          date: typeof t.date === 'string' && !isNaN(new Date(t.date).getTime()) ? t.date : new Date().toISOString().split('T')[0],
          isRecurring: Boolean(t.isRecurring),
          createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
        }))
    : defaultState.transactions;

  const savingsGoals: SavingsGoal[] = Array.isArray(candidate.savingsGoals)
    ? candidate.savingsGoals
        .filter(
          (g): g is Record<string, unknown> =>
            Boolean(g) &&
            typeof g === 'object' &&
            typeof g.name === 'string' &&
            g.name.trim().length > 0 &&
            typeof g.targetAmount === 'number' &&
            Number.isFinite(g.targetAmount) &&
            g.targetAmount > 0
        )
        .map((g) => ({
          id: typeof g.id === 'string' && g.id.trim() ? g.id.trim().slice(0, 50) : `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: (g.name as string).trim().slice(0, 50),
          targetAmount: Math.round((g.targetAmount as number) * 100) / 100,
          currentAmount: typeof g.currentAmount === 'number' && Number.isFinite(g.currentAmount) && g.currentAmount >= 0 ? Math.round(g.currentAmount * 100) / 100 : 0,
          targetDate: typeof g.targetDate === 'string' && !isNaN(new Date(g.targetDate).getTime()) ? g.targetDate : new Date().toISOString().split('T')[0],
          category: typeof g.category === 'string' ? g.category.slice(0, 30) : undefined,
          isCompleted: Boolean(g.isCompleted),
          createdAt: typeof g.createdAt === 'string' ? g.createdAt : new Date().toISOString(),
        }))
    : defaultState.savingsGoals;

  const commitments: Commitment[] = Array.isArray(candidate.commitments)
    ? candidate.commitments
        .filter(
          (c): c is Record<string, unknown> =>
            Boolean(c) &&
            typeof c === 'object' &&
            typeof c.name === 'string' &&
            c.name.trim().length > 0 &&
            typeof c.amount === 'number' &&
            Number.isFinite(c.amount) &&
            c.amount > 0
        )
        .map((c) => ({
          id: typeof c.id === 'string' && c.id.trim() ? c.id.trim().slice(0, 50) : `com-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: (c.name as string).trim().slice(0, 50),
          amount: Math.round((c.amount as number) * 100) / 100,
          dueDate: typeof c.dueDate === 'string' && !isNaN(new Date(c.dueDate).getTime()) ? c.dueDate : new Date().toISOString().split('T')[0],
          recurrence: (c.recurrence === 'weekly' || c.recurrence === 'monthly' || c.recurrence === 'one-time' ? c.recurrence : 'monthly') as Commitment['recurrence'],
          category: (typeof c.category === 'string' ? c.category : 'Bills') as Commitment['category'],
          status: (c.status === 'paid' ? 'paid' : 'upcoming') as Commitment['status'],
          notes: typeof c.notes === 'string' ? c.notes.slice(0, 100) : undefined,
        }))
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
