import React, { useState, useMemo } from 'react';
import { Transaction } from '../../domain/types';
import { formatINR, formatDate, getCategoryColor } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { Search, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'ALL' && tx.type !== selectedType) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        const matchesAmount = tx.amount.toString().includes(q);
        if (!matchesDesc && !matchesCat && !matchesAmount) return false;
      }

      return true;
    });
  }, [transactions, selectedType, selectedCategory, search]);

  const confirmDelete = () => {
    if (txToDelete) {
      onDelete(txToDelete.id);
      setTxToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description, category, or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="expense">Expenses (-)</option>
            <option value="income">Income (+)</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Records */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-6 w-6" />}
          title="No transactions found"
          description={
            transactions.length === 0
              ? 'Start by recording your first expense or income.'
              : 'Try adjusting your search keywords or active filters.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const catColor = getCategoryColor(tx.category);
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {isExpense ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100 truncate">{tx.description}</span>
                      {tx.isRecurring && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-medium border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                        {tx.category}
                      </span>
                      <span className="text-slate-400 text-[11px]">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatINR(tx.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      title="Edit transaction"
                      aria-label={`Edit ${tx.description}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxToDelete(tx)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                      title="Delete transaction"
                      aria-label={`Delete ${tx.description}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <div>
              <strong>Description:</strong> {txToDelete?.description}
            </div>
            <div className="mt-1">
              <strong>Amount:</strong> {txToDelete ? formatINR(txToDelete.amount) : ''}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/40">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>This will immediately restore or deduct the amount from your balances.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setTxToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
