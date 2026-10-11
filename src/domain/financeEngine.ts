import {
  Commitment,
  FinanceSummary,
  SavingsGoal,
  Transaction,
} from './types';

export { calculateHealthScore, calculateRiskAssessment } from './healthAndRiskEngine';
export { simulateScenario } from './simulationEngine';

/**
 * Calculates remaining days in the budget period safely.
 * Normalizes dates to UTC midnight to prevent timezone drift.
 *
 * @param endDateStr - ISO date string representing the end of the 30-day cycle
 * @param referenceDateStr - Optional ISO date string for deterministic testing
 * @returns Non-negative integer days remaining
 */
export function calculateDaysRemaining(endDateStr: string, referenceDateStr?: string): number {
  if (!endDateStr) return 0;
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const end = new Date(endDateStr);

  // Normalize to midnight UTC to avoid timezone drift
  const nowMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const endMidnight = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const diffMs = endMidnight - nowMidnight;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Single source of truth for financial accounting metrics.
 *
 * Explicit Accounting Model & Invariants:
 * 1. Current Cash = Starting Budget + Received Income - Paid Expenses.
 * 2. Reserved Savings are physically held inside Current Cash, but ring-fenced
 *    from discretionary spending.
 * 3. Unpaid Commitments are upcoming obligations in this cycle that must be paid,
 *    so they are reserved from Current Cash until marked paid.
 * 4. Usable Balance = Current Cash - Unpaid Commitments Reserved - Reserved Savings.
 * 5. Daily Spending Allowance = max(0, Usable Balance) / max(1, Days Remaining).
 *
 * @param startingBudget - Base monthly budget allocation in INR
 * @param transactions - Recorded income and expense ledger entries
 * @param commitments - Upcoming and settled financial obligations
 * @param savingsGoals - Active savings targets and ring-fenced contributions
 * @param daysRemaining - Remaining days in the current budget period
 * @returns Reconciled FinanceSummary with 2-decimal paise precision
 */
export function calculateFinanceSummary(
  startingBudget: number,
  transactions: Transaction[],
  commitments: Commitment[],
  savingsGoals: SavingsGoal[],
  daysRemaining: number
): FinanceSummary {
  const safeStartingBudget = Math.max(0, isNaN(startingBudget) ? 0 : startingBudget);

  // Calculate received income and paid expenses from actual transactions
  let receivedIncome = 0;
  let paidExpenses = 0;

  for (const tx of transactions) {
    if (typeof tx.amount !== 'number' || isNaN(tx.amount)) continue;
    if (tx.type === 'income') {
      receivedIncome += tx.amount;
    } else if (tx.type === 'expense') {
      paidExpenses += tx.amount;
    }
  }

  // Current Cash = Starting Budget + Received Income - Paid Expenses
  const currentCash = safeStartingBudget + receivedIncome - paidExpenses;

  // Unpaid commitments reserved: upcoming commitments not yet settled
  const unpaidCommitmentsReserved = commitments
    .filter((c) => c.status !== 'paid')
    .reduce((sum, c) => sum + (typeof c.amount === 'number' && !isNaN(c.amount) ? c.amount : 0), 0);

  // Savings reserved: total accumulated funds across all active savings goals
  const savingsReserved = savingsGoals.reduce(
    (sum, g) => sum + (typeof g.currentAmount === 'number' && !isNaN(g.currentAmount) ? Math.max(0, g.currentAmount) : 0),
    0
  );

  // Usable balance for discretionary spending
  const usableBalance = currentCash - unpaidCommitmentsReserved - savingsReserved;

  // Safe days remaining (avoid division by 0)
  const safeDaysRemaining = Math.max(0, daysRemaining);
  const effectiveDays = safeDaysRemaining === 0 ? 1 : safeDaysRemaining;

  // Daily spending allowance (clamped to 0 if usableBalance is negative)
  const dailySpendingAllowance =
    usableBalance > 0 ? Math.round((usableBalance / effectiveDays) * 100) / 100 : 0;

  // Calculate historical burn rate (expenses per elapsed day)
  const elapsedDays = Math.max(1, 30 - safeDaysRemaining);
  const burnRatePerDay = paidExpenses > 0 ? Math.round((paidExpenses / elapsedDays) * 100) / 100 : 0;

  // Projected end-of-period balance assuming spending continues at current daily allowance
  const projectedRemainingExpense = dailySpendingAllowance * safeDaysRemaining;
  const projectedEndBalance = currentCash - unpaidCommitmentsReserved - projectedRemainingExpense;

  return {
    startingBudget: safeStartingBudget,
    receivedIncome: Math.round(receivedIncome * 100) / 100,
    paidExpenses: Math.round(paidExpenses * 100) / 100,
    currentCash: Math.round(currentCash * 100) / 100,
    unpaidCommitmentsReserved: Math.round(unpaidCommitmentsReserved * 100) / 100,
    savingsReserved: Math.round(savingsReserved * 100) / 100,
    usableBalance: Math.round(usableBalance * 100) / 100,
    daysRemaining: safeDaysRemaining,
    dailySpendingAllowance,
    projectedEndBalance: Math.round(projectedEndBalance * 100) / 100,
    burnRatePerDay,
  };
}
