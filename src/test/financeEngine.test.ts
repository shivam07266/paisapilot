import { describe, it, expect } from 'vitest';
import {
  calculateFinanceSummary,
  calculateDaysRemaining,
  calculateHealthScore,
  calculateRiskAssessment,
} from '../domain/financeEngine';
import { Commitment, SavingsGoal, Transaction } from '../domain/types';

describe('financeEngine', () => {
  const baseCommitments: Commitment[] = [
    {
      id: 'c1',
      name: 'Wi-Fi Bill',
      amount: 1000,
      dueDate: '2026-10-25',
      recurrence: 'monthly',
      category: 'Bills',
      status: 'upcoming',
    },
  ];

  const baseSavingsGoals: SavingsGoal[] = [
    {
      id: 'g1',
      name: 'Emergency Buffer',
      targetAmount: 2000,
      currentAmount: 500,
      targetDate: '2026-11-01',
      createdAt: '2026-10-01',
    },
  ];

  // Test 1: Current cash calculation
  it('1. calculates current cash correctly (startingBudget + receivedIncome - paidExpenses)', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        type: 'income',
        category: 'Freelance',
        amount: 2500,
        date: '2026-10-05',
        description: 'Design gig',
        createdAt: '2026-10-05',
      },
      {
        id: 't2',
        type: 'expense',
        category: 'Food',
        amount: 1200,
        date: '2026-10-06',
        description: 'Groceries',
        createdAt: '2026-10-06',
      },
    ];

    const summary = calculateFinanceSummary(10000, transactions, [], [], 20);

    // 10,000 + 2,500 - 1,200 = 11,300
    expect(summary.startingBudget).toBe(10000);
    expect(summary.receivedIncome).toBe(2500);
    expect(summary.paidExpenses).toBe(1200);
    expect(summary.currentCash).toBe(11300);
  });

  // Test 2: Usable balance calculation
  it('2. calculates usable balance (currentCash - unpaidCommitments - savingsReserved)', () => {
    // Current cash = 4,000, commitments = 1,000, savings = 500
    // Usable balance = 4,000 - 1,000 - 500 = 2,500
    const summary = calculateFinanceSummary(4000, [], baseCommitments, baseSavingsGoals, 20);

    expect(summary.currentCash).toBe(4000);
    expect(summary.unpaidCommitmentsReserved).toBe(1000);
    expect(summary.savingsReserved).toBe(500);
    expect(summary.usableBalance).toBe(2500);
  });

  // Test 3: Daily allowance calculation
  it('3. calculates dynamic daily allowance (usableBalance / max(1, daysRemaining))', () => {
    // Usable balance: 2500, Days remaining: 20 -> 125
    const summary = calculateFinanceSummary(4000, [], baseCommitments, baseSavingsGoals, 20);
    expect(summary.dailySpendingAllowance).toBe(125);

    // Edge case: zero days remaining (should not divide by zero)
    const summaryZeroDays = calculateFinanceSummary(4000, [], baseCommitments, baseSavingsGoals, 0);
    expect(summaryZeroDays.dailySpendingAllowance).toBe(2500);

    // Edge case: negative usable balance (should clamp daily allowance to 0)
    const summaryDeficit = calculateFinanceSummary(1000, [], baseCommitments, baseSavingsGoals, 10);
    // 1000 - 1000 - 500 = -500
    expect(summaryDeficit.usableBalance).toBe(-500);
    expect(summaryDeficit.dailySpendingAllowance).toBe(0);
  });

  // Test 4: Commitment reservation and payment
  it('4. releases commitment reservation when marked paid without double-counting', () => {
    // Before payment: 1 upcoming commitment of 1,000
    const summaryBefore = calculateFinanceSummary(5000, [], baseCommitments, [], 15);
    expect(summaryBefore.currentCash).toBe(5000);
    expect(summaryBefore.unpaidCommitmentsReserved).toBe(1000);
    expect(summaryBefore.usableBalance).toBe(4000);

    // After payment: commitment status is paid, and an expense transaction is logged
    const paidCommitments: Commitment[] = [
      { ...baseCommitments[0], status: 'paid' },
    ];
    const paidTransactions: Transaction[] = [
      {
        id: 't-paid-c1',
        type: 'expense',
        category: 'Bills',
        amount: 1000,
        date: '2026-10-10',
        description: 'Paid Wi-Fi Bill',
        createdAt: '2026-10-10',
      },
    ];

    const summaryAfter = calculateFinanceSummary(5000, paidTransactions, paidCommitments, [], 15);
    // Current cash reduces by 1000 to 4000
    expect(summaryAfter.currentCash).toBe(4000);
    // Unpaid reservation is 0
    expect(summaryAfter.unpaidCommitmentsReserved).toBe(0);
    // Usable balance remains 4000! Seamless transition without double deduction
    expect(summaryAfter.usableBalance).toBe(4000);
  });

  // Test 5: Savings goal progress & ring-fencing
  it('5. ring-fences savings goal contributions without marking them as external expenses', () => {
    const goalsWithContribution: SavingsGoal[] = [
      {
        id: 'g1',
        name: 'Emergency',
        targetAmount: 5000,
        currentAmount: 1500,
        targetDate: '2026-11-01',
        createdAt: '2026-10-01',
      },
    ];

    const summary = calculateFinanceSummary(10000, [], [], goalsWithContribution, 20);
    // Cash is still 10,000 (money hasn't left the user's account)
    expect(summary.currentCash).toBe(10000);
    // But usable balance is reduced to 8,500
    expect(summary.savingsReserved).toBe(1500);
    expect(summary.usableBalance).toBe(8500);
  });

  // Test 6: Risk and health score boundaries
  it('6. risk assessment and health score boundaries evaluate deterministically', () => {
    // Healthy state
    const healthySummary = calculateFinanceSummary(10000, [], [], [], 20);
    const healthResult = calculateHealthScore(healthySummary, [], []);
    const riskResult = calculateRiskAssessment(healthySummary);

    expect(healthResult.overallScore).toBeGreaterThanOrEqual(80);
    expect(healthResult.status).toBe('Healthy');
    expect(riskResult.level).toBe('low');

    // Deficit / Critical state: Usable balance negative
    const deficitSummary = calculateFinanceSummary(200, [], baseCommitments, [], 10);
    // cash: 200, commitments: 1000 -> cash cannot cover commitments!
    const criticalRisk = calculateRiskAssessment(deficitSummary);
    const criticalHealth = calculateHealthScore(deficitSummary, [], []);

    expect(criticalRisk.level).toBe('critical');
    expect(criticalHealth.status).toBe('At Risk');
  });

  // Test 7: calculateDaysRemaining handles edge cases
  it('7. calculateDaysRemaining handles valid and zero boundary dates safely', () => {
    const days = calculateDaysRemaining('2026-10-31', '2026-10-21');
    expect(days).toBe(10);

    const pastDays = calculateDaysRemaining('2026-10-10', '2026-10-21');
    expect(pastDays).toBe(0); // clamped to 0
  });

  // Test 8: Explainable health score breakdown
  it('8. calculates explainable health score breakdown factors with transparent point weights', () => {
    const summary = calculateFinanceSummary(10000, [], baseCommitments, baseSavingsGoals, 15);
    const healthResult = calculateHealthScore(summary, [], []);

    expect(healthResult.factors.budgetSustainability.max).toBe(30);
    expect(healthResult.factors.spendingDiscipline.max).toBe(25);
    expect(healthResult.factors.commitmentCoverage.max).toBe(20);
    expect(healthResult.factors.emergencyReserve.max).toBe(15);
    expect(healthResult.factors.savingsFeasibility.max).toBe(10);
    expect(healthResult.overallScore).toBeGreaterThanOrEqual(0);
    expect(healthResult.overallScore).toBeLessThanOrEqual(100);
  });

  // Test 9: Burn rate and projected end balance
  it('9. computes burn rate and projected end balance across remaining cycle', () => {
    const transactions: Transaction[] = [
      {
        id: 't-food',
        type: 'expense',
        category: 'Food',
        amount: 3000,
        date: '2026-10-10',
        description: 'Groceries and dining',
      },
    ];

    // Starting budget: 10,000, expense: 3,000 -> cash = 7,000
    // Remaining days = 20 -> elapsed days = 10 -> burnRate = 3000 / 10 = 300/day
    const summary = calculateFinanceSummary(10000, transactions, [], [], 20);

    expect(summary.currentCash).toBe(7000);
    expect(summary.burnRatePerDay).toBe(300);
    expect(summary.dailySpendingAllowance).toBe(350); // 7000 / 20 = 350
  });
});
