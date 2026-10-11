import React, { useState } from 'react';
import { Commitment } from '../../domain/types';
import { formatINR, formatDate, getCategoryColor } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { CalendarClock, CheckCircle, Trash2, AlertCircle, Clock } from 'lucide-react';

interface CommitmentListProps {
  commitments: Commitment[];
  onPayCommitment: (id: string) => void;
  onDeleteCommitment: (id: string) => void;
}

export const CommitmentList: React.FC<CommitmentListProps> = ({
  commitments,
  onPayCommitment,
  onDeleteCommitment,
}) => {
  const [payTarget, setPayTarget] = useState<Commitment | null>(null);

  const upcoming = commitments.filter((c) => c.status !== 'paid');
  const paid = commitments.filter((c) => c.status === 'paid');

  const handleConfirmPay = () => {
    if (payTarget) {
      onPayCommitment(payTarget.id);
      setPayTarget(null);
    }
  };

  if (commitments.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="h-6 w-6" />}
        title="No commitments recorded"
        description="Add bills, rent, subscriptions, or upcoming payments to reserve funds."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Upcoming & Unpaid Obligations ({upcoming.length})
          </h3>
          <span className="text-xs text-amber-400 font-semibold">
            Reserved: {formatINR(upcoming.reduce((s, c) => s + c.amount, 0))}
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
            All commitments in this cycle have been settled!
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((c) => {
              const catColor = getCategoryColor(c.category);
              return (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{c.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold bg-slate-800 text-slate-300">
                          {c.recurrence}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-medium border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                          {c.category}
                        </span>
                        <span className="text-slate-400 text-[11px]">Due: {formatDate(c.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm font-extrabold text-amber-400">{formatINR(c.amount)}</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => setPayTarget(c)}
                        leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                      >
                        Pay Now
                      </Button>
                      <button
                        type="button"
                        onClick={() => onDeleteCommitment(c.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete commitment"
                        aria-label={`Delete ${c.name}`}
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
      </div>

      {/* Paid Section */}
      {paid.length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-3">
            Settled Commitments ({paid.length})
          </h3>
          <div className="space-y-2 opacity-75">
            {paid.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-slate-300">{c.name}</span>
                  <span className="text-[10px] text-slate-400">({c.recurrence})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-300">{formatINR(c.amount)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      <Modal
        isOpen={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title="Confirm Commitment Payment"
        description="Mark this obligation as paid and record it as an expense."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Commitment:</span>
              <span className="font-semibold text-white">{payTarget?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="font-bold text-emerald-400">{payTarget ? formatINR(payTarget.amount) : ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-950/20 p-2.5 rounded-lg border border-blue-900/40">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              This will automatically release the reservation and record a real transaction in your activity log.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setPayTarget(null)}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" onClick={handleConfirmPay}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
