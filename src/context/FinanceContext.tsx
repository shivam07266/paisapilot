import React, { useMemo, useCallback } from 'react';
import {
  Commitment,
  ExpenseCategory,
  SavingsGoal,
  Transaction,
} from '../domain/types';
import { usePersistentState } from '../hooks/usePersistentState';
import {
  calculateDaysRemaining,
  calculateFinanceSummary,
  calculateHealthScore,
  calculateRiskAssessment,
} from '../domain/financeEngine';
import { FinanceContext } from './FinanceContextInstance';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, setState, resetToDemo, exportData, importData } = usePersistentState();

  const daysRemaining = useMemo(() => {
    return calculateDaysRemaining(state.period.endDate);
  }, [state.period.endDate]);

  const summary = useMemo(() => {
    return calculateFinanceSummary(
      state.startingBudget,
      state.transactions,
      state.commitments,
      state.savingsGoals,
      daysRemaining
    );
  }, [state.startingBudget, state.transactions, state.commitments, state.savingsGoals, daysRemaining]);

  const health = useMemo(() => {
    return calculateHealthScore(summary, state.categoryBudgets, state.transactions);
  }, [summary, state.categoryBudgets, state.transactions]);

  const risk = useMemo(() => {
    return calculateRiskAssessment(summary);
  }, [summary]);

  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  }, [setState]);

  const editTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)),
    }));
  }, [setState]);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  }, [setState]);

  const addSavingsGoal = useCallback((goalData: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, newGoal],
    }));
  }, [setState]);

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, [setState]);

  const deleteSavingsGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
    }));
  }, [setState]);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
      ),
    }));
  }, [setState]);

  const withdrawFromGoal = useCallback((id: string, amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g
      ),
    }));
  }, [setState]);

  const addCommitment = useCallback((comData: Omit<Commitment, 'id'>) => {
    const newCom: Commitment = {
      ...comData,
      id: `com-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setState((prev) => ({
      ...prev,
      commitments: [...prev.commitments, newCom],
    }));
  }, [setState]);

  const updateCommitment = useCallback((id: string, updates: Partial<Commitment>) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, [setState]);

  const deleteCommitment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c) => c.id !== id),
    }));
  }, [setState]);

  /**
   * Paying a commitment:
   * 1. Marks the commitment status as 'paid'.
   * 2. Adds an actual transaction for the amount with category and description.
   * This cleanly shifts the amount from unpaidCommitmentsReserved into paidExpenses
   * without double counting or leaving orphaned obligations!
   */
  const payCommitment = useCallback((id: string) => {
    setState((prev) => {
      const commitment = prev.commitments.find((c) => c.id === id);
      if (!commitment || commitment.status === 'paid') return prev;

      const newTx: Transaction = {
        id: `tx-com-${commitment.id}-${Date.now()}`,
        type: 'expense',
        category: commitment.category,
        amount: commitment.amount,
        date: new Date().toISOString().split('T')[0],
        description: `Payment: ${commitment.name}`,
        createdAt: new Date().toISOString(),
      };

      const updatedCommitments = prev.commitments.map((c) =>
        c.id === id ? { ...c, status: 'paid' as const } : c
      );

      return {
        ...prev,
        commitments: updatedCommitments,
        transactions: [newTx, ...prev.transactions],
      };
    });
  }, [setState]);

  const updateCategoryBudget = useCallback((category: ExpenseCategory, limit: number) => {
    setState((prev) => {
      const exists = prev.categoryBudgets.some((b) => b.category === category);
      const updated = exists
        ? prev.categoryBudgets.map((b) => (b.category === category ? { ...b, allocatedLimit: limit } : b))
        : [...prev.categoryBudgets, { category, allocatedLimit: limit }];
      return {
        ...prev,
        categoryBudgets: updated,
      };
    });
  }, [setState]);

  const updateStartingBudget = useCallback((budget: number) => {
    if (budget < 0 || isNaN(budget)) return;
    setState((prev) => ({
      ...prev,
      startingBudget: budget,
    }));
  }, [setState]);

  const value = useMemo(
    () => ({
      state,
      summary,
      risk,
      health,
      daysRemaining,
      addTransaction,
      editTransaction,
      deleteTransaction,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      contributeToGoal,
      withdrawFromGoal,
      addCommitment,
      updateCommitment,
      deleteCommitment,
      payCommitment,
      updateCategoryBudget,
      updateStartingBudget,
      resetToDemo,
      exportData,
      importData,
    }),
    [
      state,
      summary,
      risk,
      health,
      daysRemaining,
      addTransaction,
      editTransaction,
      deleteTransaction,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      contributeToGoal,
      withdrawFromGoal,
      addCommitment,
      updateCommitment,
      deleteCommitment,
      payCommitment,
      updateCategoryBudget,
      updateStartingBudget,
      resetToDemo,
      exportData,
      importData,
    ]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
