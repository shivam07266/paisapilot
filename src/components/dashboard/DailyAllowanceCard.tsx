import React, { memo } from 'react';
import { Card } from '../ui/Card';
import { formatINR } from '../../utils/formatting';
import { FinanceSummary } from '../../domain/types';
import { Flame, Clock, TrendingDown } from 'lucide-react';

export interface DailyAllowanceCardProps {
  summary: FinanceSummary;
}

/**
 * Displays dynamic daily spending allowance, remaining cycle days,
 * historical burn rate, and projected end-of-month balance.
 */
export const DailyAllowanceCard: React.FC<DailyAllowanceCardProps> = memo(({ summary }) => {
  const isAllowanceTight = summary.dailySpendingAllowance < 100 && summary.daysRemaining > 5;
  const isAllowanceZero = summary.dailySpendingAllowance <= 0;

  return (
    <Card className="bg-slate-900/90 border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">Daily Spending Pacing</h2>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              isAllowanceZero
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : isAllowanceTight
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isAllowanceZero ? 'Spending Freeze' : isAllowanceTight ? 'Strict Budget' : 'Sustainable'}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold tracking-tight ${
              isAllowanceZero ? 'text-rose-400' : isAllowanceTight ? 'text-amber-400' : 'text-blue-400'
            }`}
          >
            {formatINR(summary.dailySpendingAllowance)}
          </span>
          <span className="text-sm text-slate-400 font-medium">/ day</span>
        </div>

        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          {isAllowanceZero
            ? 'Usable balance is depleted. Avoid any discretionary spending to protect commitments.'
            : `You can safely spend up to ${formatINR(summary.dailySpendingAllowance)} each day across the next ${summary.daysRemaining} days without running out.`}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <Clock className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
          <div>
            <div className="text-[10px] text-slate-400">Days Left</div>
            <div className="font-semibold text-slate-200">{summary.daysRemaining} days</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <TrendingDown className="h-4 w-4 text-rose-400 shrink-0" aria-hidden="true" />
          <div>
            <div className="text-[10px] text-slate-400">Past Burn Rate</div>
            <div className="font-semibold text-slate-200">~{formatINR(summary.burnRatePerDay)}/day</div>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        <span>
          End-of-month projected balance:{' '}
          <strong className="text-slate-200">{formatINR(summary.projectedEndBalance)}</strong>
        </span>
      </div>
    </Card>
  );
});

DailyAllowanceCard.displayName = 'DailyAllowanceCard';
