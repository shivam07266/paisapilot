import {
  AppState,
  Commitment,
  FinanceSummary,
  HealthScoreBreakdown,
  RiskAssessment,
  RiskLevel,
  SavingsGoal,
  SimulationResult,
  SimulationScenario,
  Transaction,
} from './types';

/**
 * Calculates remaining days in the budget period safely.
 * Returns at least 0.
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
 * Explicit Assumptions:
 * 1. Current Cash is startingBudget + receivedIncome - paidExpenses.
 * 2. Reserved Savings are physically kept inside Current Cash, but are locked
 *    and unavailable for discretionary spending.
 * 3. Unpaid Commitments are upcoming obligations in this cycle that must be paid,
 *    so they are reserved from Current Cash.
 * 4. Usable Balance = Current Cash - Unpaid Commitments Reserved - Reserved Savings.
 * 5. Daily Spending Allowance = Usable Balance / max(1, daysRemaining).
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

  // Unpaid commitments reserved: upcoming or overdue commitments that haven't been paid yet
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

  // Daily spending allowance (if usableBalance is negative, daily allowance is 0)
  const dailySpendingAllowance = usableBalance > 0
    ? Math.round((usableBalance / effectiveDays) * 100) / 100
    : 0;

  // Calculate historical burn rate (expenses per elapsed day or average)
  const elapsedDays = Math.max(1, 30 - safeDaysRemaining);
  const burnRatePerDay = paidExpenses > 0 ? Math.round((paidExpenses / elapsedDays) * 100) / 100 : 0;

  // Projected end-of-period balance
  // Assumes spending continues at current daily allowance or average burn
  // End cash = currentCash - unpaidCommitments - (burn rate * remaining days)
  const projectedRemainingExpense = (dailySpendingAllowance) * safeDaysRemaining;
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

/**
 * Calculates Explainable Financial Health Score (0 - 100).
 *
 * Factor Weights:
 * - Budget Sustainability: 30%
 * - Spending Discipline: 25%
 * - Commitment Coverage: 20%
 * - Emergency Reserve: 15%
 * - Savings Feasibility: 10%
 */
export function calculateHealthScore(
  summary: FinanceSummary,
  categoryBudgets: { category: string; allocatedLimit: number }[],
  transactions: Transaction[]
): HealthScoreBreakdown {
  const { currentCash, usableBalance, unpaidCommitmentsReserved, startingBudget, paidExpenses, daysRemaining } = summary;

  // 1. Budget Sustainability (30 points)
  // Evaluates whether usable balance is positive and sufficient for remaining days
  let budgetScore = 0;
  let budgetExpl = '';
  if (usableBalance >= (startingBudget * 0.25)) {
    budgetScore = 30;
    budgetExpl = 'Excellent: Usable balance comfortably covers remaining days.';
  } else if (usableBalance > 0) {
    const ratio = usableBalance / Math.max(1, startingBudget * 0.25);
    budgetScore = Math.round(ratio * 30);
    budgetExpl = 'Moderate: Balance is positive but buffer is tightening.';
  } else {
    budgetScore = 0;
    budgetExpl = 'Critical: Usable balance is depleted or negative.';
  }

  // 2. Spending Discipline (25 points)
  // Evaluates spending against total budget and category limits
  let disciplineScore = 25;
  let disciplineExpl = 'All categories within planned limits.';
  if (categoryBudgets.length > 0) {
    let breachedCategories = 0;
    for (const b of categoryBudgets) {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      if (b.allocatedLimit > 0 && spent > b.allocatedLimit) {
        breachedCategories++;
      }
    }
    if (breachedCategories > 0) {
      disciplineScore = Math.max(5, 25 - breachedCategories * 7);
      disciplineExpl = `${breachedCategories} budget categories exceeded spending limit.`;
    }
  } else if (paidExpenses > startingBudget * 0.9 && daysRemaining > 10) {
    disciplineScore = 10;
    disciplineExpl = 'Over 90% of budget spent with more than 10 days remaining.';
  }

  // 3. Commitment Coverage (20 points)
  // Can current cash cover all unpaid obligations?
  let commitmentScore = 0;
  let commitmentExpl = '';
  if (unpaidCommitmentsReserved === 0) {
    commitmentScore = 20;
    commitmentExpl = 'Zero outstanding commitments; full payment safety.';
  } else if (currentCash >= unpaidCommitmentsReserved * 1.5) {
    commitmentScore = 20;
    commitmentExpl = `Current cash (₹${currentCash.toLocaleString('en-IN')}) covers all upcoming obligations with 1.5x buffer.`;
  } else if (currentCash >= unpaidCommitmentsReserved) {
    const ratio = (currentCash - unpaidCommitmentsReserved) / (unpaidCommitmentsReserved * 0.5);
    commitmentScore = Math.round(12 + Math.min(8, ratio * 8));
    commitmentExpl = 'Cash covers commitments, but safety margin is narrow.';
  } else {
    commitmentScore = Math.max(0, Math.round((currentCash / Math.max(1, unpaidCommitmentsReserved)) * 10));
    commitmentExpl = 'Warning: Insufficient cash to cover all upcoming commitments!';
  }

  // 4. Emergency Reserve Cushion (15 points)
  // Evaluates whether user has at least 10-15% of starting budget or reserve funds
  let emergencyScore = 0;
  let emergencyExpl = '';
  const recommendedEmergency = Math.max(500, startingBudget * 0.15);
  // Emergency cushion must be free cash above commitments
  const freeCashForEmergency = Math.max(0, currentCash - unpaidCommitmentsReserved);
  if (summary.savingsReserved >= recommendedEmergency || freeCashForEmergency >= recommendedEmergency * 2) {
    emergencyScore = 15;
    emergencyExpl = 'Target emergency cushion of 15% is secured.';
  } else if (summary.savingsReserved > 0) {
    emergencyScore = Math.round((summary.savingsReserved / recommendedEmergency) * 15);
    emergencyExpl = 'Partial emergency savings active; keep adding contributions.';
  } else {
    emergencyScore = 0;
    emergencyExpl = 'No dedicated emergency reserve identified.';
  }

  // 5. Savings Feasibility (10 points)
  let savingsScore = summary.savingsReserved > 0 ? 10 : 0;
  let savingsExpl = summary.savingsReserved > 0
    ? 'Active progress towards personal savings targets.'
    : 'No active savings contributions recorded yet.';

  let totalScore = Math.min(100, Math.max(0, budgetScore + disciplineScore + commitmentScore + emergencyScore + savingsScore));

  // If there is an active cash deficit for obligations, cap total score to at risk
  if (currentCash < unpaidCommitmentsReserved || usableBalance < 0) {
    totalScore = Math.min(38, totalScore);
  }

  let status: 'Healthy' | 'Stable' | 'Caution' | 'At Risk' = 'Healthy';
  let keyTakeaway = 'Your finances are well-balanced and resilient.';

  if (totalScore >= 80) {
    status = 'Healthy';
    keyTakeaway = 'Superb financial pacing. You are on track to end the period with healthy surplus.';
  } else if (totalScore >= 60) {
    status = 'Stable';
    keyTakeaway = 'Finances are in good standing. Keep daily spending within your calculated allowance.';
  } else if (totalScore >= 40) {
    status = 'Caution';
    keyTakeaway = 'Discretionary spending is close to limits. Pause non-essential purchases.';
  } else {
    status = 'At Risk';
    keyTakeaway = 'Budget deficit detected or commitments at risk. Prioritize essential obligations immediately.';
  }

  return {
    overallScore: totalScore,
    status,
    factors: {
      budgetSustainability: { score: budgetScore, max: 30, label: 'Budget Sustainability', explanation: budgetExpl },
      spendingDiscipline: { score: disciplineScore, max: 25, label: 'Spending Discipline', explanation: disciplineExpl },
      commitmentCoverage: { score: commitmentScore, max: 20, label: 'Commitment Coverage', explanation: commitmentExpl },
      emergencyReserve: { score: emergencyScore, max: 15, label: 'Emergency Cushion', explanation: emergencyExpl },
      savingsFeasibility: { score: savingsScore, max: 10, label: 'Savings Feasibility', explanation: savingsExpl },
    },
    keyTakeaway,
  };
}

/**
 * Deterministic Financial Risk Assessment.
 */
export function calculateRiskAssessment(summary: FinanceSummary): RiskAssessment {
  const { currentCash, usableBalance, unpaidCommitmentsReserved, dailySpendingAllowance, daysRemaining } = summary;
  const reasons: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 15; // baseline low risk

  // 1. Cash can't cover upcoming commitments
  if (currentCash < unpaidCommitmentsReserved) {
    riskScore += 45;
    reasons.push(`Cash deficit: You need ₹${unpaidCommitmentsReserved.toLocaleString('en-IN')} for commitments, but only have ₹${currentCash.toLocaleString('en-IN')}.`);
    recommendations.push('Defer or renegotiate upcoming commitments to prevent overdraft.');
  }

  // 2. Usable balance is negative
  if (usableBalance < 0) {
    riskScore += 35;
    reasons.push(`Discretionary deficit: Usable balance is in the negative by ₹${Math.abs(usableBalance).toLocaleString('en-IN')}.`);
    recommendations.push('Freeze all non-essential shopping and entertainment expenses.');
  } else if (usableBalance < 500 && daysRemaining > 5) {
    riskScore += 20;
    reasons.push(`Tight runway: Only ₹${usableBalance.toLocaleString('en-IN')} usable balance remaining for ${daysRemaining} days.`);
    recommendations.push(`Keep daily spending under ₹${dailySpendingAllowance.toLocaleString('en-IN')}.`);
  }

  // 3. Projected end balance negative
  if (summary.projectedEndBalance < 0) {
    riskScore += 25;
    reasons.push('Current burn rate will cause a month-end shortfall.');
    recommendations.push('Reduce discretionary spending by at least 25% starting today.');
  }

  // Calculate days of runway
  const daysOfRunway = dailySpendingAllowance > 0
    ? Math.min(daysRemaining, Math.floor(usableBalance / Math.max(1, dailySpendingAllowance)))
    : (usableBalance > 0 ? daysRemaining : 0);

  const clampedRiskScore = Math.min(100, Math.max(0, riskScore));

  let level: RiskLevel = 'low';
  if (clampedRiskScore >= 75 || usableBalance < 0 || currentCash < unpaidCommitmentsReserved) {
    level = 'critical';
  } else if (clampedRiskScore >= 50) {
    level = 'elevated';
  } else if (clampedRiskScore >= 30) {
    level = 'moderate';
  } else {
    level = 'low';
  }

  if (reasons.length === 0) {
    reasons.push('Comfortable liquidity to cover upcoming commitments and daily needs.');
    recommendations.push('Continue maintaining your daily allowance target.');
  }

  return {
    level,
    score: clampedRiskScore,
    reasons,
    recommendations,
    daysOfRunway,
  };
}

/**
 * What-If Simulation Engine:
 * Simulates a proposed expense completely in-memory without mutating actual state.
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

  // Synthetic simulated transaction
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

  const dailyAllowanceDelta = simulatedSummary.dailySpendingAllowance - baselineSummary.dailySpendingAllowance;
  const usableBalanceDelta = simulatedSummary.usableBalance - baselineSummary.usableBalance;
  const endBalanceDelta = simulatedSummary.projectedEndBalance - baselineSummary.projectedEndBalance;

  // Decision Verdict
  let impactVerdict: 'safe' | 'caution' | 'danger' = 'safe';
  let adviceMessage = '';
  const alternatives: string[] = [];

  if (simulatedSummary.usableBalance < 0 || simulatedSummary.currentCash < simulatedSummary.unpaidCommitmentsReserved) {
    impactVerdict = 'danger';
    adviceMessage = `Simulating this ₹${scenario.amount.toLocaleString('en-IN')} expense pushes your usable balance into a deficit (₹${simulatedSummary.usableBalance.toLocaleString('en-IN')}) and risks unpaid commitments.`;
    alternatives.push(`Look for a lower-cost option under ₹${Math.max(0, Math.floor(baselineSummary.usableBalance * 0.5)).toLocaleString('en-IN')}.`);
    alternatives.push(`Postpone this purchase until the next budget cycle (${daysRemaining} days away).`);
    alternatives.push('Wait until additional income is received before purchasing.');
  } else if (simulatedSummary.dailySpendingAllowance < 75 && baselineSummary.dailySpendingAllowance >= 75) {
    impactVerdict = 'caution';
    adviceMessage = `This purchase reduces your daily spending allowance from ₹${baselineSummary.dailySpendingAllowance.toLocaleString('en-IN')} down to ₹${simulatedSummary.dailySpendingAllowance.toLocaleString('en-IN')}/day.`;
    alternatives.push(`Split the expense or opt for an alternative around ₹${Math.floor(scenario.amount * 0.6).toLocaleString('en-IN')}.`);
    alternatives.push(`Trim ₹${Math.ceil((scenario.amount) / Math.max(1, daysRemaining)).toLocaleString('en-IN')} per day from your food & entertainment allowance.`);
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
