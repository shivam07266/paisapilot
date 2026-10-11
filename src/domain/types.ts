export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Education'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Subscriptions'
  | 'Health'
  | 'Other';

export type IncomeCategory =
  | 'Allowance'
  | 'Stipend'
  | 'Freelance'
  | 'Gift'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  isRecurring?: boolean;
  notes?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  color?: string;
  createdAt: string;
}

export type CommitmentRecurrence = 'one-time' | 'monthly' | 'weekly';
export type CommitmentStatus = 'upcoming' | 'paid' | 'overdue';

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  recurrence: CommitmentRecurrence;
  category: ExpenseCategory;
  status: CommitmentStatus;
  autoDeduct?: boolean;
  notes?: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  allocatedLimit: number;
}

export interface BudgetPeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
}

export interface FinanceSummary {
  startingBudget: number;
  receivedIncome: number;
  paidExpenses: number;
  currentCash: number;
  unpaidCommitmentsReserved: number;
  savingsReserved: number;
  usableBalance: number;
  daysRemaining: number;
  dailySpendingAllowance: number;
  projectedEndBalance: number;
  burnRatePerDay: number;
}

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'critical';

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0 - 100 risk score (lower is safer)
  reasons: string[];
  recommendations: string[];
  daysOfRunway: number;
}

export type HealthStatus = 'Healthy' | 'Stable' | 'Caution' | 'At Risk';

export interface HealthScoreBreakdown {
  overallScore: number; // 0 - 100
  status: HealthStatus;
  factors: {
    budgetSustainability: { score: number; max: 30; label: string; explanation: string };
    spendingDiscipline: { score: number; max: 25; label: string; explanation: string };
    commitmentCoverage: { score: number; max: 20; label: string; explanation: string };
    emergencyReserve: { score: number; max: 15; label: string; explanation: string };
    savingsFeasibility: { score: number; max: 10; label: string; explanation: string };
  };
  keyTakeaway: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  proposedDate: string;
  isRecurring?: boolean;
  notes?: string;
}

export interface SimulationResult {
  scenario: SimulationScenario;
  baselineSummary: FinanceSummary;
  simulatedSummary: FinanceSummary;
  baselineRisk: RiskAssessment;
  simulatedRisk: RiskAssessment;
  baselineHealth: HealthScoreBreakdown;
  simulatedHealth: HealthScoreBreakdown;
  dailyAllowanceDelta: number;
  usableBalanceDelta: number;
  endBalanceDelta: number;
  impactVerdict: 'safe' | 'caution' | 'danger';
  adviceMessage: string;
  actionableAlternatives: string[];
}

export interface AppState {
  startingBudget: number;
  period: BudgetPeriod;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  commitments: Commitment[];
  categoryBudgets: CategoryBudget[];
}
