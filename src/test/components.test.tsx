import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { GoalCard } from '../components/goals/GoalCard';
import { TransactionList } from '../components/transactions/TransactionList';
import { FinanceSummary, Transaction } from '../domain/types';

describe('UI and Component interactions', () => {
  it('renders Button component with accessible states and handles clicks', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Test Button
      </Button>
    );

    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders accessible ProgressBar with correct ARIA attributes', () => {
    render(<ProgressBar value={65} max={100} label="Category Budget" showPercent />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '65');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('renders Modal dialog with escape key support and trap accessibility', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Dialog" description="Details">
        <p>Modal body content</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();

    // Close on Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders EmptyState with accessible illustration and action button', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Transactions"
        description="Please record an expense."
        action={<Button onClick={handleAction}>Add First</Button>}
      />
    );

    expect(screen.getByText('No Transactions')).toBeInTheDocument();
    const actionBtn = screen.getByRole('button', { name: /add first/i });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders BalanceCard accurately with Indian Rupee formatting', () => {
    const mockSummary: FinanceSummary = {
      startingBudget: 10000,
      receivedIncome: 1500,
      paidExpenses: 3000,
      currentCash: 8500,
      unpaidCommitmentsReserved: 1000,
      savingsReserved: 1500,
      usableBalance: 6000,
      daysRemaining: 18,
      dailySpendingAllowance: 333.33,
      projectedEndBalance: 2500,
      burnRatePerDay: 250,
    };

    render(<BalanceCard summary={mockSummary} />);

    // Usable balance: ₹6,000
    expect(screen.getByText('Usable Balance')).toBeInTheDocument();
    expect(screen.getByText('Current Total Cash')).toBeInTheDocument();
    expect(screen.getByText('₹8,500')).toBeInTheDocument();
  });

  it('renders GoalCard with progress and enforces usable balance limit on contribute', () => {
    const handleContribute = vi.fn();
    const handleWithdraw = vi.fn();
    const handleDelete = vi.fn();

    const mockGoal = {
      id: 'g-camera',
      name: 'DSLR Camera',
      targetAmount: 5000,
      currentAmount: 2000,
      targetDate: '2026-11-30',
      createdAt: '2026-10-01',
    };

    render(
      <GoalCard
        goal={mockGoal}
        usableBalance={1500}
        onContribute={handleContribute}
        onWithdraw={handleWithdraw}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText('DSLR Camera')).toBeInTheDocument();
    expect(screen.getAllByText('40%').length).toBeGreaterThanOrEqual(1); // 2000 / 5000

    // Click contribute
    const contributeBtn = screen.getByRole('button', { name: /add funds/i });
    fireEvent.click(contributeBtn);

    // Enter amount greater than usableBalance (1500)
    const input = screen.getByPlaceholderText(/e\.g\. 500/i);
    fireEvent.change(input, { target: { value: '2000' } });

    // Try submit
    const submitBtn = screen.getByRole('button', { name: /confirm contribution/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/cannot contribute more than your usable balance/i)).toBeInTheDocument();
    expect(handleContribute).not.toHaveBeenCalled();

    // Now enter valid amount within usable balance
    fireEvent.change(input, { target: { value: '500' } });
    fireEvent.click(submitBtn);

    expect(handleContribute).toHaveBeenCalledWith('g-camera', 500);
  });

  it('renders TransactionList, filters by query, and confirms deletion', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    const sampleTransactions: Transaction[] = [
      {
        id: 'tx-1',
        type: 'expense',
        category: 'Food',
        amount: 250,
        date: '2026-10-10',
        description: 'College Cafeteria',
      },
      {
        id: 'tx-2',
        type: 'expense',
        category: 'Transport',
        amount: 120,
        date: '2026-10-11',
        description: 'Metro ticket',
      },
      {
        id: 'tx-3',
        type: 'income',
        category: 'Freelance',
        amount: 1500,
        date: '2026-10-12',
        description: 'Graphic design gig',
      },
    ];

    render(
      <TransactionList
        transactions={sampleTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText('College Cafeteria')).toBeInTheDocument();
    expect(screen.getByText('Metro ticket')).toBeInTheDocument();
    expect(screen.getByText('Graphic design gig')).toBeInTheDocument();

    // Filter by search
    const searchInput = screen.getByPlaceholderText(/search by description/i);
    fireEvent.change(searchInput, { target: { value: 'Metro' } });

    expect(screen.queryByText('College Cafeteria')).not.toBeInTheDocument();
    expect(screen.getByText('Metro ticket')).toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('College Cafeteria')).toBeInTheDocument();

    // Delete item
    const deleteButtons = screen.getAllByTitle('Delete transaction');
    fireEvent.click(deleteButtons[0]);

    // Confirm modal opens
    expect(screen.getByText('Delete Transaction')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
    fireEvent.click(confirmBtn);

    expect(handleDelete).toHaveBeenCalledWith('tx-1');
  });
});

