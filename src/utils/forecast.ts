import { AppState, SimulationScenario } from '../domain/types';

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
 */
export function generateMonthlyForecast(
  state: AppState,
  scenario?: SimulationScenario | null
): ForecastDataPoint[] {
  const points: ForecastDataPoint[] = [];

  const startDate = new Date(state.period.startDate);
  const totalDays = state.period.totalDays || 30;
  const today = new Date();

  // Calculate current cash and daily burn
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const tx of state.transactions) {
    if (tx.type === 'income') totalIncome += tx.amount;
    else if (tx.type === 'expense') totalExpenses += tx.amount;
  }
  const startingCash = state.startingBudget + totalIncome - totalExpenses;

  // Unpaid commitments mapped by due date
  const commitmentMap = new Map<string, number>();
  for (const c of state.commitments) {
    if (c.status !== 'paid') {
      const prev = commitmentMap.get(c.dueDate) || 0;
      commitmentMap.set(c.dueDate, prev + c.amount);
    }
  }

  // Calculate average daily burn rate
  const unpaidTotal = state.commitments
    .filter((c) => c.status !== 'paid')
    .reduce((sum, c) => sum + c.amount, 0);
  const savingsTotal = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const usableBalance = Math.max(0, startingCash - unpaidTotal - savingsTotal);

  // Remaining days from today
  const end = new Date(state.period.endDate);
  const diffTime = end.getTime() - today.getTime();
  const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const dailyPacing = usableBalance / daysLeft;

  let runningBaseline = startingCash;
  let runningSimulated = scenario ? startingCash - scenario.amount : startingCash;

  for (let i = 0; i <= totalDays; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];

    const commitmentDue = commitmentMap.get(dateStr) || 0;

    // Day label
    const dayLabel = `Day ${i + 1}`;

    const isToday = curDate.toDateString() === today.toDateString();

    // For future days after today, apply daily pacing and commitments
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
