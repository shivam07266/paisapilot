import { describe, it, expect } from 'vitest';
import { simulateScenario } from '../domain/financeEngine';
import { AppState, SimulationScenario } from '../domain/types';

describe('What-If Simulator', () => {
  const initialAppState: AppState = {
    startingBudget: 10000,
    period: {
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      totalDays: 30,
    },
    transactions: [
      {
        id: 't1',
        type: 'expense',
        category: 'Food',
        amount: 2000,
        date: '2026-10-05',
        description: 'Monthly groceries',
        createdAt: '2026-10-05',
      },
    ],
    savingsGoals: [
      {
        id: 'g1',
        name: 'Buffer',
        targetAmount: 3000,
        currentAmount: 1000,
        targetDate: '2026-10-31',
        createdAt: '2026-10-01',
      },
    ],
    commitments: [
      {
        id: 'c1',
        name: 'Internet',
        amount: 1000,
        dueDate: '2026-10-25',
        recurrence: 'monthly',
        category: 'Bills',
        status: 'upcoming',
      },
    ],
    categoryBudgets: [],
  };

  it('8. ensures simulation preview is strictly isolated and does not mutate actual state', () => {
    const scenario: SimulationScenario = {
      id: 'sim-headphone',
      name: 'Headphones',
      category: 'Shopping',
      amount: 2000,
      proposedDate: '2026-10-15',
    };

    // Deep clone copy for immutability comparison
    const stateBeforeJson = JSON.stringify(initialAppState);

    const result = simulateScenario(initialAppState, scenario);

    // Verify simulation results were computed
    expect(result.scenario.name).toBe('Headphones');
    expect(result.simulatedSummary.currentCash).toBe(result.baselineSummary.currentCash - 2000);
    expect(result.usableBalanceDelta).toBe(-2000);

    // State object itself must not be mutated
    expect(JSON.stringify(initialAppState)).toBe(stateBeforeJson);
    expect(initialAppState.transactions.length).toBe(1);
  });

  it('9. computes accurate deltas matching problem statement specifications', () => {
    // Suppose cash: 4000, commitments: 1000, savings: 500, days: 20 -> usable: 2500, allowance: 125
    // Purchase: 2000 -> projected cash: 2000, usable: 500, allowance: 25
    const customState: AppState = {
      startingBudget: 4000,
      period: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        totalDays: 30,
      },
      transactions: [],
      savingsGoals: [
        {
          id: 'g1',
          name: 'Savings',
          targetAmount: 1000,
          currentAmount: 500,
          targetDate: '2026-10-31',
          createdAt: '2026-10-01',
        },
      ],
      commitments: [
        {
          id: 'c1',
          name: 'Bills',
          amount: 1000,
          dueDate: '2026-10-25',
          recurrence: 'monthly',
          category: 'Bills',
          status: 'upcoming',
        },
      ],
      categoryBudgets: [],
    };

    const scenario: SimulationScenario = {
      id: 'sim-test',
      name: 'Shopping Spree',
      category: 'Shopping',
      amount: 2000,
      proposedDate: '2026-10-15',
    };

    const result = simulateScenario(customState, scenario);

    expect(result.simulatedSummary.currentCash).toBe(2000);
    expect(result.simulatedSummary.usableBalance).toBe(500);
    expect(result.usableBalanceDelta).toBe(-2000);
  });

  it('10. flags critical impact verdict when purchase causes a budget deficit', () => {
    const scenarioExcessive: SimulationScenario = {
      id: 'sim-huge',
      name: 'Super High Expense',
      category: 'Shopping',
      amount: 15000, // exceeds available cash
      proposedDate: '2026-10-15',
    };

    const result = simulateScenario(initialAppState, scenarioExcessive);

    expect(result.impactVerdict).toBe('danger');
    expect(result.simulatedSummary.usableBalance).toBeLessThan(0);
    expect(result.actionableAlternatives.length).toBeGreaterThan(0);
  });

  it('11. preserves month-end locked savings when within budget and reduces endBalance on deficit', () => {
    const withinBudgetScenario: SimulationScenario = {
      id: 'sim-sub',
      name: 'Cloud GPU Subscription',
      category: 'Subscriptions',
      amount: 600,
      proposedDate: '2026-10-15',
      isRecurring: true,
    };

    const safeResult = simulateScenario(initialAppState, withinBudgetScenario);
    expect(safeResult.simulatedSummary.currentCash).toBe(safeResult.baselineSummary.currentCash - 600);
    expect(safeResult.usableBalanceDelta).toBe(-600);
    expect(safeResult.dailyAllowanceDelta).toBeLessThan(0);

    const deficitScenario: SimulationScenario = {
      id: 'sim-deficit',
      name: 'Luxury Watch',
      category: 'Shopping',
      amount: 9500,
      proposedDate: '2026-10-15',
    };

    const deficitResult = simulateScenario(initialAppState, deficitScenario);
    expect(deficitResult.endBalanceDelta).toBeLessThan(0);
  });
});
