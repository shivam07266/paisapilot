import React, { useState, memo } from 'react';
import { Card } from '../ui/Card';
import { HealthScoreBreakdown, RiskAssessment } from '../../domain/types';
import { ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';

export interface HealthScoreCardProps {
  health: HealthScoreBreakdown;
  risk: RiskAssessment;
}

/**
 * Displays the deterministic 0-100 Financial Health Index, risk classification badge,
 * and an expandable 5-factor explanation breakdown.
 */
export const HealthScoreCard: React.FC<HealthScoreCardProps> = memo(({ health, risk }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Stable':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Caution':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low':
        return { label: 'Low Risk', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'moderate':
        return { label: 'Moderate Risk', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'elevated':
        return { label: 'Elevated Risk', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: 'Critical Risk', classes: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    }
  };

  const riskBadge = getRiskBadge(risk.level);

  return (
    <Card className="bg-slate-900/90 border-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">Financial Health Index</h2>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(health.status)}`}>
            {health.status}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${riskBadge.classes}`}>
            {riskBadge.label}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {/* Score Ring / Radial representation */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-16 h-16 transform -rotate-90"
            viewBox="0 0 36 36"
            role="img"
            aria-label={`Financial Health Score: ${health.overallScore} out of 100 (${health.status})`}
          >
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={
                health.overallScore >= 80
                  ? 'text-emerald-400'
                  : health.overallScore >= 60
                  ? 'text-blue-400'
                  : health.overallScore >= 40
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }
              strokeDasharray={`${health.overallScore}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center" aria-hidden="true">
            <span className="text-lg font-extrabold text-white leading-none">{health.overallScore}</span>
            <span className="text-[9px] text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
            <span>{health.keyTakeaway}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {risk.reasons[0] || 'Liquid reserves securely support planned needs.'}
          </p>
        </div>
      </div>

      {/* Toggle Factor Breakdown */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-medium cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-expanded={showBreakdown}
          aria-controls="health-score-breakdown"
        >
          <span>Explain My Score Breakdown (5 Factors)</span>
          {showBreakdown ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
        </button>

        {showBreakdown && (
          <div
            id="health-score-breakdown"
            className="mt-3 space-y-2 pt-2 border-t border-slate-800/60 text-xs animate-in fade-in duration-200"
          >
            {Object.entries(health.factors).map(([key, factor]) => (
              <div key={key} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-300">{factor.label}</span>
                  <span className="text-[11px] font-bold text-blue-400">
                    {factor.score} / {factor.max} pts
                  </span>
                </div>
                <div
                  className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={factor.score}
                  aria-valuemin={0}
                  aria-valuemax={factor.max}
                  aria-label={factor.label}
                >
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(factor.score / factor.max) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{factor.explanation}</p>
              </div>
            ))}

            <div className="mt-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/40 flex items-start gap-1.5 text-[10px] text-slate-400">
              <AlertCircle className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Calculated deterministically based on budget pacing, obligations & emergency buffer. Not a credit score or certified financial advice.
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

HealthScoreCard.displayName = 'HealthScoreCard';
