import React, { useState } from 'react';
import { SimulationResult } from '../../domain/types';
import { formatINR } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Check,
  Clock,
  Info,
} from 'lucide-react';

interface ScenarioResultsProps {
  result: SimulationResult;
  onApplyDecision: () => void;
  onReset: () => void;
}

export const ScenarioResults: React.FC<ScenarioResultsProps> = React.memo(({
  result,
  onApplyDecision,
  onReset,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const {
    scenario,
    baselineSummary,
    simulatedSummary,
    baselineRisk,
    simulatedRisk,
    baselineHealth,
    simulatedHealth,
    dailyAllowanceDelta,
    usableBalanceDelta,
    endBalanceDelta,
    impactVerdict,
    adviceMessage,
    actionableAlternatives,
  } = result;

  // Deterministic Decision Runway & Pacing Metrics
  const runwayDaysConsumed =
    baselineSummary.dailySpendingAllowance > 0
      ? (scenario.amount / baselineSummary.dailySpendingAllowance).toFixed(1)
      : '∞';
  const reducedAmount = Math.round(scenario.amount * 0.7);
  const savedByReducing = scenario.amount - reducedAmount;
  const twoWeekDailySaveRate = Math.ceil(scenario.amount / 14);

  const handleConfirmApply = () => {
    setIsApplied(true);
    setShowConfirmModal(false);
    onApplyDecision();
  };

  const getVerdictBadge = () => {
    if (impactVerdict === 'danger') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          Financial Danger Detected
        </span>
      );
    }
    if (impactVerdict === 'caution') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Budget Strained (Caution)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        Financially Safe Purchase
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Simulation Header Banner */}
      <Card
        className={`border-l-4 ${
          impactVerdict === 'danger'
            ? 'border-l-rose-500 bg-rose-950/20 border-rose-900/40'
            : impactVerdict === 'caution'
            ? 'border-l-amber-500 bg-amber-950/20 border-amber-900/40'
            : 'border-l-emerald-500 bg-emerald-950/20 border-emerald-900/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">Simulation Outcome</h2>
            <span className="text-xs font-medium text-slate-300">
              "{scenario.name}" (₹{scenario.amount.toLocaleString('en-IN')})
            </span>
          </div>
          {getVerdictBadge()}
        </div>

        <p className="text-sm font-medium text-slate-200 mt-3 leading-relaxed">{adviceMessage}</p>

        {/* Actionable Alternatives if in Caution or Danger */}
        {actionableAlternatives.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended Alternatives & Action Plan:</span>
            </div>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
              {actionableAlternatives.map((alt) => (
                <li key={alt}>{alt}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Side-by-Side Comparison Metrics (5 Key Dimensions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Usable Balance */}
        <Card className="bg-slate-900/90 border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Usable Balance</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Before</div>
              <div className="text-base font-bold text-slate-200">{formatINR(baselineSummary.usableBalance)}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">After</div>
              <div
                className={`text-base font-bold ${
                  simulatedSummary.usableBalance < 0 ? 'text-rose-400' : 'text-blue-400'
                }`}
              >
                {formatINR(simulatedSummary.usableBalance)}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-rose-400 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            <span>Delta: {formatINR(usableBalanceDelta)}</span>
          </div>
        </Card>

        {/* Metric 2: Daily Allowance */}
        <Card className="bg-slate-900/90 border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Daily Safe Spend</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Before</div>
              <div className="text-base font-bold text-slate-200">{formatINR(baselineSummary.dailySpendingAllowance)}/d</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">After</div>
              <div
                className={`text-base font-bold ${
                  simulatedSummary.dailySpendingAllowance <= 0 ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {formatINR(simulatedSummary.dailySpendingAllowance)}/d
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-rose-400 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            <span>Cut by {formatINR(Math.abs(dailyAllowanceDelta))}/day</span>
          </div>
        </Card>

        {/* Metric 3: Projected Month-End Balance */}
        <Card className="bg-slate-900/90 border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Projected Month-End</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Before</div>
              <div className="text-base font-bold text-slate-200">{formatINR(baselineSummary.projectedEndBalance)}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">After</div>
              <div
                className={`text-base font-bold ${
                  simulatedSummary.projectedEndBalance < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {formatINR(simulatedSummary.projectedEndBalance)}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-rose-400 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            <span>Delta: {formatINR(endBalanceDelta)}</span>
          </div>
        </Card>

        {/* Metric 4: Risk Level */}
        <Card className="bg-slate-900/90 border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Financial Risk</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Before</div>
              <div className="text-sm font-bold uppercase text-slate-200">{baselineRisk.level}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">After</div>
              <div
                className={`text-sm font-bold uppercase ${
                  simulatedRisk.level === 'critical'
                    ? 'text-rose-400'
                    : simulatedRisk.level === 'elevated'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {simulatedRisk.level}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            {simulatedRisk.reasons[0] || 'Safe liquidity'}
          </div>
        </Card>

        {/* Metric 5: Health Score */}
        <Card className="bg-slate-900/90 border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Health Score</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Before</div>
              <div className="text-base font-bold text-slate-200">{baselineHealth.overallScore}/100</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">After</div>
              <div
                className={`text-base font-bold ${
                  simulatedHealth.overallScore < 50 ? 'text-rose-400' : 'text-blue-400'
                }`}
              >
                {simulatedHealth.overallScore}/100
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-400">
            Score shift: <strong className="text-rose-400">{simulatedHealth.overallScore - baselineHealth.overallScore} pts</strong>
          </div>
        </Card>
      </div>

      {/* Decision Clarity Matrix: Spend Now vs. Reduce vs. Delay */}
      <Card className="bg-slate-900/90 border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-300">
              Decision Clarity & Trade-off Pathways
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Runway Cost: <strong className="text-amber-400">{runwayDaysConsumed} days</strong> of safe daily allowance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-white mb-1">1. Spend Now ({formatINR(scenario.amount)})</div>
            <p className="text-slate-400 leading-relaxed">
              Leaves <strong className="text-slate-200">{formatINR(simulatedSummary.usableBalance)}</strong> usable cash and adjusts safe daily spend to{' '}
              <strong className="text-slate-200">{formatINR(simulatedSummary.dailySpendingAllowance)}/day</strong> over the remaining{' '}
              {baselineSummary.daysRemaining} days.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-emerald-400 mb-1">2. Trim 30% ({formatINR(reducedAmount)})</div>
            <p className="text-slate-400 leading-relaxed">
              Opting for a {formatINR(reducedAmount)} alternative retains{' '}
              <strong className="text-emerald-400">+{formatINR(savedByReducing)}</strong> in buffer and protects your month-end cash trajectory.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-blue-400 mb-1">3. Delay & Pace (14-Day Micro-Save)</div>
            <p className="text-slate-400 leading-relaxed">
              Setting aside <strong className="text-blue-400">{formatINR(twoWeekDailySaveRate)}/day</strong> for 2 weeks funds "{scenario.name}" without shocking today's liquidity.
            </p>
          </div>
        </div>
      </Card>

      {/* Commitments & Savings Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commitment Coverage */}
        <Card className="bg-slate-900/90 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Unpaid Commitments Coverage</span>
            <span className="text-xs text-slate-400">
              Need: {formatINR(simulatedSummary.unpaidCommitmentsReserved)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            {simulatedSummary.currentCash >= simulatedSummary.unpaidCommitmentsReserved ? (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  Protected: Cash of {formatINR(simulatedSummary.currentCash)} fully covers upcoming bills.
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                <span className="text-xs text-rose-300 font-medium">
                  Threatened! Current cash is short by {formatINR(simulatedSummary.unpaidCommitmentsReserved - simulatedSummary.currentCash)}.
                </span>
              </>
            )}
          </div>
        </Card>

        {/* Savings Goals Feasibility */}
        <Card className="bg-slate-900/90 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Savings Target Feasibility</span>
            <span className="text-xs text-slate-400">
              Locked: {formatINR(simulatedSummary.savingsReserved)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            {simulatedSummary.usableBalance >= 0 ? (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  Savings intact: You don't need to raid your savings goals to fund this purchase.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-300 font-medium">
                  At Risk: Negative usable balance may force dipping into your reserved savings.
                </span>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Simulation Assumptions Note */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          <strong>Simulation & Forecast Assumptions:</strong> What-if modeling clones your active ledger in memory, deducts{' '}
          <strong className="text-slate-200">{formatINR(scenario.amount)}</strong> under{' '}
          <strong className="text-slate-200">{scenario.category}</strong>, and recalculates
          all 5 health factors while keeping unpaid bills ({formatINR(baselineSummary.unpaidCommitmentsReserved)}) and locked savings ({formatINR(baselineSummary.savingsReserved)}) ring-fenced.
        </p>
      </div>

      {/* Simulator Execution Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <HelpCircle className="h-4 w-4 text-blue-400 shrink-0" />
          <span>
            This preview is strictly in-memory. Your actual finances are 100% untouched until you click "Apply to Actual Finances".
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="secondary" size="sm" onClick={onReset} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
            Reset Preview
          </Button>

          <Button
            variant={impactVerdict === 'danger' ? 'danger' : 'emerald'}
            size="sm"
            disabled={isApplied}
            onClick={() => setShowConfirmModal(true)}
            leftIcon={isApplied ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          >
            {isApplied ? 'Decision Applied!' : 'Apply to Actual Finances'}
          </Button>
        </div>
      </div>

      {/* Explicit Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Purchase Decision"
        description="Are you sure you want to commit this simulated expense into your actual finances?"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Item Name:</span>
              <span className="font-semibold text-white">{scenario.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-semibold text-slate-200">{scenario.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount to Deduct:</span>
              <span className="font-bold text-rose-400">₹{scenario.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-300">
              <span>New Usable Balance:</span>
              <span className="font-bold text-blue-400">{formatINR(simulatedSummary.usableBalance)}</span>
            </div>
          </div>

          {impactVerdict === 'danger' && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 flex items-start gap-2 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                Warning: This decision will cause a financial deficit. Make sure you have emergency funds ready.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              variant={impactVerdict === 'danger' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirmApply}
            >
              Yes, Deduct and Record Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

ScenarioResults.displayName = 'ScenarioResults';
