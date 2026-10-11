import {
  AppState,
  SimulationResult,
  SimulationScenario,
  Transaction,
} from './types';
import { calculateDaysRemaining, calculateFinanceSummary } from './financeEngine';
import { calculateHealthScore, calculateRiskAssessment } from './healthAndRiskEngine';

/**
 * What-If Simulation Engine:
 * Simulates a proposed expense completely in-memory without mutating actual state.
 *
 * Evaluates:
 * - Baseline vs. Simulated financial position
 * - Usable balance delta and daily spending allowance delta
 * - Projected month-end balance delta
 * - Risk and explainable financial health shifts
 * - Actionable alternatives when caution or danger thresholds are triggered
 *
 * @param state - Current immutable application financial state
 * @param scenario - Proposed hypothetical purchase scenario
 * @returns Full side-by-side SimulationResult
 */
export function simulateScenario(
  state: AppState,
  scenario: SimulationScenario
): SimulationResult {
  const daysRemaining = calculateDaysRemaining(state.period.endDate);

  // Baseline calculations
  const baselineSummary = calculateFinanceSummary(
    state.startingBudget,
    state.transactions,
    state.commitments,
    state.savingsGoals,
    daysRemaining
  );
  const baselineHealth = calculateHealthScore(baselineSummary, state.categoryBudgets, state.transactions);
  const baselineRisk = calculateRiskAssessment(baselineSummary);

  // Synthetic simulated transaction (strictly isolated in memory)
  const simulatedTransaction: Transaction = {
    id: `sim-${scenario.id}`,
    type: 'expense',
    category: scenario.category,
    amount: Math.max(0, scenario.amount),
    date: scenario.proposedDate,
    description: `[Simulation] ${scenario.name}`,
    isRecurring: scenario.isRecurring,
    createdAt: new Date().toISOString(),
  };

  const simulatedTransactions = [...state.transactions, simulatedTransaction];

  // Simulated metrics
  const simulatedSummary = calculateFinanceSummary(
    state.startingBudget,
    simulatedTransactions,
    state.commitments,
    state.savingsGoals,
    daysRemaining
  );
  const simulatedHealth = calculateHealthScore(simulatedSummary, state.categoryBudgets, simulatedTransactions);
  const simulatedRisk = calculateRiskAssessment(simulatedSummary);

  const dailyAllowanceDelta =
    Math.round((simulatedSummary.dailySpendingAllowance - baselineSummary.dailySpendingAllowance) * 100) / 100;
  const usableBalanceDelta =
    Math.round((simulatedSummary.usableBalance - baselineSummary.usableBalance) * 100) / 100;
  const endBalanceDelta =
    Math.round((simulatedSummary.projectedEndBalance - baselineSummary.projectedEndBalance) * 100) / 100;

  // Decision Verdict
  let impactVerdict: 'safe' | 'caution' | 'danger' = 'safe';
  let adviceMessage = '';
  const alternatives: string[] = [];

  if (simulatedSummary.usableBalance < 0 || simulatedSummary.currentCash < simulatedSummary.unpaidCommitmentsReserved) {
    impactVerdict = 'danger';
    adviceMessage = `Simulating this ₹${scenario.amount.toLocaleString('en-IN')} expense pushes your usable balance into a deficit (₹${simulatedSummary.usableBalance.toLocaleString('en-IN')}) and risks unpaid commitments.`;
    alternatives.push(
      `Look for a lower-cost option under ₹${Math.max(0, Math.floor(baselineSummary.usableBalance * 0.5)).toLocaleString('en-IN')}.`
    );
    alternatives.push(`Postpone this purchase until the next budget cycle (${daysRemaining} days away).`);
    alternatives.push('Wait until additional income is received before purchasing.');
  } else if (simulatedSummary.dailySpendingAllowance < 75 && baselineSummary.dailySpendingAllowance >= 75) {
    impactVerdict = 'caution';
    adviceMessage = `This purchase reduces your daily spending allowance from ₹${baselineSummary.dailySpendingAllowance.toLocaleString('en-IN')} down to ₹${simulatedSummary.dailySpendingAllowance.toLocaleString('en-IN')}/day.`;
    alternatives.push(
      `Split the expense or opt for an alternative around ₹${Math.floor(scenario.amount * 0.6).toLocaleString('en-IN')}.`
    );
    alternatives.push(
      `Trim ₹${Math.ceil(scenario.amount / Math.max(1, daysRemaining)).toLocaleString('en-IN')} per day from your food & entertainment allowance.`
    );
  } else {
    impactVerdict = 'safe';
    adviceMessage = `This purchase is comfortably within your discretionary budget. Your daily allowance will adjust from ₹${baselineSummary.dailySpendingAllowance.toLocaleString('en-IN')} to ₹${simulatedSummary.dailySpendingAllowance.toLocaleString('en-IN')}/day.`;
    alternatives.push('Safe to proceed without threatening commitments or savings.');
  }

  return {
    scenario,
    baselineSummary,
    simulatedSummary,
    baselineRisk,
    simulatedRisk,
    baselineHealth,
    simulatedHealth,
    dailyAllowanceDelta,
    usableBalanceDelta,
    endBalanceDelta,
    impactVerdict,
    adviceMessage,
    actionableAlternatives: alternatives,
  };
}
