import React, { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { CommitmentList } from '../components/commitments/CommitmentList';
import { CommitmentFormModal } from '../components/commitments/CommitmentFormModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatINR } from '../utils/formatting';
import { CalendarClock, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const CommitmentsPage: React.FC = () => {
  const { state, summary, addCommitment, payCommitment, deleteCommitment } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  const { upcomingTotal, paidTotal } = useMemo(() => {
    return {
      upcomingTotal: state.commitments
        .filter((c) => c.status !== 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
      paidTotal: state.commitments
        .filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
    };
  }, [state.commitments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Financial Commitments & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            PaisaPilot locks upcoming obligations from your usable balance so bills are never neglected.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          Add Commitment
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>Reserved for Upcoming Obligations</span>
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">{formatINR(upcomingTotal)}</div>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Settled Commitments this Period</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{formatINR(paidTotal)}</div>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarClock className="h-4 w-4 text-blue-400" />
            <span>Current Real Cash Cushion</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{formatINR(summary.currentCash)}</div>
        </Card>
      </div>

      {/* Commitments List Component */}
      <CommitmentList
        commitments={state.commitments}
        onPayCommitment={payCommitment}
        onDeleteCommitment={deleteCommitment}
      />

      {/* Add Commitment Modal */}
      <CommitmentFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addCommitment}
      />
    </div>
  );
};
