import { AppState, Commitment, SavingsGoal, Transaction } from '../domain/types';

export function createInitialDemoState(): AppState {
  const today = new Date();
  
  // Period: 30-day budget window (starts 10 days ago, ends 20 days from now)
  const startDateObj = new Date(today);
  startDateObj.setDate(today.getDate() - 10);
  const startDate = startDateObj.toISOString().split('T')[0];

  const endDateObj = new Date(today);
  endDateObj.setDate(today.getDate() + 20);
  const endDate = endDateObj.toISOString().split('T')[0];

  // Helper for generating relative dates
  const getRelativeDate = (offsetDays: number): string => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const initialTransactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'expense',
      category: 'Food',
      amount: 450,
      date: getRelativeDate(-8),
      description: 'Campus cafeteria & lunch with friends',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      type: 'expense',
      category: 'Transport',
      amount: 600,
      date: getRelativeDate(-7),
      description: 'Monthly Metro Smart Card recharge',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-3',
      type: 'expense',
      category: 'Subscriptions',
      amount: 199,
      date: getRelativeDate(-6),
      description: 'Spotify Student Premium plan',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-4',
      type: 'expense',
      category: 'Education',
      amount: 850,
      date: getRelativeDate(-5),
      description: 'Full-stack Web Dev course book & notes',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-5',
      type: 'income',
      category: 'Freelance',
      amount: 1500,
      date: getRelativeDate(-4),
      description: 'Frontend bug fixes for small client',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-6',
      type: 'expense',
      category: 'Food',
      amount: 320,
      date: getRelativeDate(-3),
      description: 'Evening tea & snacks with study group',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-7',
      type: 'expense',
      category: 'Shopping',
      amount: 950,
      date: getRelativeDate(-2),
      description: 'Casual sneakers clearance sale',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-8',
      type: 'expense',
      category: 'Entertainment',
      amount: 400,
      date: getRelativeDate(-1),
      description: 'Weekend movie ticket with friend',
      createdAt: new Date().toISOString(),
    },
  ];

  const initialSavingsGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      name: 'Emergency Buffer',
      targetAmount: 2500,
      currentAmount: 1000,
      targetDate: getRelativeDate(25),
      color: '#10b981',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-2',
      name: 'Noise Cancelling Earbuds',
      targetAmount: 3000,
      currentAmount: 800,
      targetDate: getRelativeDate(45),
      color: '#3b82f6',
      createdAt: new Date().toISOString(),
    },
  ];

  const initialCommitments: Commitment[] = [
    {
      id: 'com-1',
      name: 'High-speed Fiber Broadband Bill',
      amount: 799,
      dueDate: getRelativeDate(5),
      recurrence: 'monthly',
      category: 'Bills',
      status: 'upcoming',
      notes: 'Due by 15th of the month',
    },
    {
      id: 'com-2',
      name: 'Campus Gym Membership Fee',
      amount: 600,
      dueDate: getRelativeDate(12),
      recurrence: 'monthly',
      category: 'Health',
      status: 'upcoming',
      notes: 'Monthly renewal',
    },
  ];

  const initialCategoryBudgets = [
    { category: 'Food' as const, allocatedLimit: 2500 },
    { category: 'Transport' as const, allocatedLimit: 1200 },
    { category: 'Education' as const, allocatedLimit: 1500 },
    { category: 'Shopping' as const, allocatedLimit: 1500 },
    { category: 'Entertainment' as const, allocatedLimit: 1000 },
    { category: 'Bills' as const, allocatedLimit: 1500 },
    { category: 'Subscriptions' as const, allocatedLimit: 500 },
    { category: 'Health' as const, allocatedLimit: 800 },
    { category: 'Other' as const, allocatedLimit: 500 },
  ];

  return {
    startingBudget: 10000,
    period: {
      startDate,
      endDate,
      totalDays: 30,
    },
    transactions: initialTransactions,
    savingsGoals: initialSavingsGoals,
    commitments: initialCommitments,
    categoryBudgets: initialCategoryBudgets,
  };
}
