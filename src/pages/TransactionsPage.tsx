import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Transaction } from '../domain/types';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatINR } from '../utils/formatting';
import { Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { state, summary, addTransaction, editTransaction, deleteTransaction } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleEditSubmit = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      editTransaction(editingTx.id, data);
      setEditingTx(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Transactions & Cash Flow
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Log all income and expenses to maintain an accurate financial ledger.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Add Transaction
        </Button>
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            <span>Total Income Received</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">+{formatINR(summary.receivedIncome)}</div>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            <span>Total Expenses Paid</span>
          </div>
          <div className="text-xl font-bold text-rose-400 mt-1">-{formatINR(summary.paidExpenses)}</div>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="text-xs text-slate-400">Net Transaction Balance</div>
          <div
            className={`text-xl font-bold mt-1 ${
              summary.receivedIncome - summary.paidExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatINR(summary.receivedIncome - summary.paidExpenses)}
          </div>
        </Card>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={state.transactions}
        onEdit={(tx) => setEditingTx(tx)}
        onDelete={deleteTransaction}
      />

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
        description="Record income received or an expense paid."
      >
        <TransactionForm
          onSubmit={(data) => {
            addTransaction(data);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingTx)}
        onClose={() => setEditingTx(null)}
        title="Edit Transaction"
        description="Update transaction details."
      >
        {editingTx && (
          <TransactionForm
            initialData={editingTx}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingTx(null)}
          />
        )}
      </Modal>
    </div>
  );
};
