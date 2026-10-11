import React from 'react';
import { Card } from '../ui/Card';
import { formatINR } from '../../utils/formatting';
import { FinanceSummary } from '../../domain/types';
import { Wallet, ShieldAlert, PiggyBank, ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';

interface BalanceCardProps {
  summary: FinanceSummary;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ summary }) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border-slate-800">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Discretionary Liquidity</span>
            <div className="group relative cursor-pointer" title="Usable Balance = Current Cash - Unpaid Commitments - Reserved Savings">
              <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                summary.usableBalance < 0
                  ? 'text-rose-400'
                  : summary.usableBalance < 1000
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {formatINR(summary.usableBalance)}
            </span>
            <span className="text-xs text-slate-400 font-medium">Usable Balance</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Available to spend freely after commitments & savings are locked.
          </p>
        </div>

        {/* Current Real Cash Counter */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">Current Total Cash</div>
            <div className="text-lg font-bold text-emerald-400">{formatINR(summary.currentCash)}</div>
          </div>
        </div>
      </div>

      {/* Accounting Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
        {/* Starting Budget */}
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <div className="text-[11px] text-slate-400">Starting Budget</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5">{formatINR(summary.startingBudget)}</div>
        </div>

        {/* Received Income */}
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            <span>Extra Income</span>
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-0.5">+{formatINR(summary.receivedIncome)}</div>
        </div>

        {/* Actual Expenses */}
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[11px] text-rose-400">
            <ArrowDownRight className="h-3 w-3" />
            <span>Spent to Date</span>
          </div>
          <div className="text-sm font-semibold text-rose-400 mt-0.5">-{formatINR(summary.paidExpenses)}</div>
        </div>

        {/* Locked / Reserved Obligations */}
        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <div className="flex items-center gap-1 text-[11px] text-amber-400">
            <ShieldAlert className="h-3 w-3" />
            <span>Bills & Savings</span>
          </div>
          <div className="text-sm font-semibold text-amber-400 mt-0.5">
            -{formatINR(summary.unpaidCommitmentsReserved + summary.savingsReserved)}
          </div>
        </div>
      </div>

      {/* Sub-breakdown badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/40">
        <span className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3 text-amber-400" />
          Unpaid Bills Reserved: <strong className="text-slate-300 font-semibold">{formatINR(summary.unpaidCommitmentsReserved)}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <PiggyBank className="h-3 w-3 text-blue-400" />
          Locked In Savings: <strong className="text-slate-300 font-semibold">{formatINR(summary.savingsReserved)}</strong>
        </span>
      </div>
    </Card>
  );
};
