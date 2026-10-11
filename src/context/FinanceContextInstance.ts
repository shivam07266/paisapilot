import { createContext } from 'react';
import {
  AppState,
  Commitment,
  ExpenseCategory,
  FinanceSummary,
  HealthScoreBreakdown,
  RiskAssessment,
  SavingsGoal,
  Transaction,
} from '../domain/types';

export interface FinanceContextType {
  state: AppState;
  summary: FinanceSummary;
  risk: RiskAssessment;
  health: HealthScoreBreakdown;
  daysRemaining: number;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;
  addCommitment: (commitment: Omit<Commitment, 'id'>) => void;
  updateCommitment: (id: string, updates: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  payCommitment: (id: string) => void;
  updateCategoryBudget: (category: ExpenseCategory, limit: number) => void;
  updateStartingBudget: (budget: number) => void;
  resetToDemo: () => void;
  exportData: () => void;
  importData: (json: string) => boolean;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);
