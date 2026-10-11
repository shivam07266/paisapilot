import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { FinanceSummary } from '../domain/types';

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
});
