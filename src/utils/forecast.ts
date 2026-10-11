import { AppState, SimulationScenario } from '../domain/types';
import { calculateDaysRemaining, calculateFinanceSummary } from '../domain/financeEngine';

/**
 * Represents a single day's projected cash position in the 30-day cycle.
 */
export interface ForecastDataPoint {
  dayIndex: number;
  date: string;
  dayLabel: string;
  baselineBalance: number;
  simulatedBalance?: number;
  commitmentDue: number;
  isToday?: boolean;
}

/**
 * Generates day-by-day financial balance forecast across the 30-day budget period.
 * Reuses the centralized calculateFinanceSummary engine to prevent formula duplication.
 *
 * @param state - Active application financial state
 * @param scenario - Optional hypothetical purchase scenario for side-by-side trajectory comparison
 * @returns Array of daily forecast trajectory points
 */
export function generateMonthlyForecast(
  state: AppState,
  scenario?: SimulationScenario | null
): ForecastDataPoint[] {
  const points: ForecastDataPoint[] = [];

  const startDate = new Date(state.period.startDate);
  const totalDays = state.period.totalDays || 30;
  const today = new Date();

  const daysRemaining = calculateDaysRemaining(state.period.endDate);
  const summary = calculateFinanceSummary(
    state.startingBudget,
    state.transactions,
    state.commitments,
    state.savingsGoals,
    daysRemaining
  );

  // Unpaid commitments mapped by scheduled due date
  const commitmentMap = new Map<string, number>();
  for (const c of state.commitments) {
    if (c.status !== 'paid') {
      const prev = commitmentMap.get(c.dueDate) || 0;
      commitmentMap.set(c.dueDate, prev + c.amount);
    }
  }

  const dailyPacing = summary.dailySpendingAllowance;
  let runningBaseline = summary.currentCash;
  let runningSimulated = scenario ? summary.currentCash - scenario.amount : summary.currentCash;

  for (let i = 0; i <= totalDays; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];

    const commitmentDue = commitmentMap.get(dateStr) || 0;
    const dayLabel = `Day ${i + 1}`;
    const isToday = curDate.toDateString() === today.toDateString();

    // For future days after today, apply daily pacing and scheduled commitments
    if (curDate >= today && i > 0) {
      runningBaseline = Math.max(0, runningBaseline - dailyPacing - commitmentDue);
      if (scenario) {
        runningSimulated = Math.max(0, runningSimulated - dailyPacing - commitmentDue);
      }
    }

    points.push({
      dayIndex: i + 1,
      date: dateStr,
      dayLabel,
      baselineBalance: Math.round(runningBaseline),
      simulatedBalance: scenario ? Math.round(runningSimulated) : undefined,
      commitmentDue,
      isToday,
    });
  }

  return points;
}
