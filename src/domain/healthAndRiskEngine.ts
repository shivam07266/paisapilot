import {
  FinanceSummary,
  HealthScoreBreakdown,
  RiskAssessment,
  RiskLevel,
  Transaction,
} from './types';

/**
 * Calculates Explainable Financial Health Score (0 - 100).
 *
 * Factor Weights:
 * - Budget Sustainability: 30%
 * - Spending Discipline: 25%
 * - Commitment Coverage: 20%
 * - Emergency Reserve: 15%
 * - Savings Feasibility: 10%
 *
 * @param summary - Computed financial summary for the active cycle
 * @param categoryBudgets - Configured category spending envelopes
 * @param transactions - Recorded income and expense ledger entries
 * @returns Explainable 5-factor health breakdown and status classification
 */
export function calculateHealthScore(
  summary: FinanceSummary,
  categoryBudgets: { category: string; allocatedLimit: number }[],
  transactions: Transaction[]
): HealthScoreBreakdown {
  const { currentCash, usableBalance, unpaidCommitmentsReserved, startingBudget, paidExpenses, daysRemaining } = summary;

  // 1. Budget Sustainability (30 points)
  let budgetScore = 0;
  let budgetExpl = '';
  if (usableBalance >= startingBudget * 0.25) {
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
  let emergencyScore = 0;
  let emergencyExpl = '';
  const recommendedEmergency = Math.max(500, startingBudget * 0.15);
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
  const savingsScore = summary.savingsReserved > 0 ? 10 : 0;
  const savingsExpl =
    summary.savingsReserved > 0
      ? 'Active progress towards personal savings targets.'
      : 'No active savings contributions recorded yet.';

  let totalScore = Math.min(
    100,
    Math.max(0, budgetScore + disciplineScore + commitmentScore + emergencyScore + savingsScore)
  );

  // If there is an active cash deficit for obligations, cap total score to At Risk
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
 * Deterministic Financial Risk Assessment based on liquidity, commitment coverage, and runway.
 *
 * @param summary - Computed financial summary for the active cycle
 * @returns RiskAssessment with level, score (0-100), reasons, recommendations, and runway days
 */
export function calculateRiskAssessment(summary: FinanceSummary): RiskAssessment {
  const { currentCash, usableBalance, unpaidCommitmentsReserved, dailySpendingAllowance, daysRemaining } = summary;
  const reasons: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 15; // baseline low risk

  // 1. Cash cannot cover upcoming commitments
  if (currentCash < unpaidCommitmentsReserved) {
    riskScore += 45;
    reasons.push(
      `Cash deficit: You need ₹${unpaidCommitmentsReserved.toLocaleString('en-IN')} for commitments, but only have ₹${currentCash.toLocaleString('en-IN')}.`
    );
    recommendations.push('Defer or renegotiate upcoming commitments to prevent overdraft.');
  }

  // 2. Usable balance is negative
  if (usableBalance < 0) {
    riskScore += 35;
    reasons.push(
      `Discretionary deficit: Usable balance is in the negative by ₹${Math.abs(usableBalance).toLocaleString('en-IN')}.`
    );
    recommendations.push('Freeze all non-essential shopping and entertainment expenses.');
  } else if (usableBalance < 500 && daysRemaining > 5) {
    riskScore += 20;
    reasons.push(
      `Tight runway: Only ₹${usableBalance.toLocaleString('en-IN')} usable balance remaining for ${daysRemaining} days.`
    );
    recommendations.push(`Keep daily spending under ₹${dailySpendingAllowance.toLocaleString('en-IN')}.`);
  }

  // 3. Projected end balance negative
  if (summary.projectedEndBalance < 0) {
    riskScore += 25;
    reasons.push('Current burn rate will cause a month-end shortfall.');
    recommendations.push('Reduce discretionary spending by at least 25% starting today.');
  }

  // Calculate days of runway
  const daysOfRunway =
    dailySpendingAllowance > 0
      ? Math.min(daysRemaining, Math.floor(usableBalance / Math.max(1, dailySpendingAllowance)))
      : usableBalance > 0
      ? daysRemaining
      : 0;

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
