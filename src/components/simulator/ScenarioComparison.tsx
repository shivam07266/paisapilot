import React, { useState } from 'react';
import { AppState, SimulationScenario } from '../../domain/types';
import { simulateScenario } from '../../domain/financeEngine';
import { formatINR } from '../../utils/formatting';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

interface ScenarioComparisonProps {
  state: AppState;
  scenarioA: SimulationScenario;
  onApplyScenario: (scenario: SimulationScenario) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  state,
  scenarioA,
  onApplyScenario,
}) => {
  const [altName, setAltName] = useState('Budget-friendly Alternative');
  const [altAmount, setAltAmount] = useState<number>(Math.round(scenarioA.amount * 0.6));

  const scenarioB: SimulationScenario = {
    id: 'sim-alt-b',
    name: altName,
    category: scenarioA.category,
    amount: Math.max(1, altAmount),
    proposedDate: scenarioA.proposedDate,
  };

  const resultA = simulateScenario(state, scenarioA);
  const resultB = simulateScenario(state, scenarioB);

  const savingsDiff = scenarioA.amount - scenarioB.amount;
  const dailyAllowanceDiff =
    resultB.simulatedSummary.dailySpendingAllowance - resultA.simulatedSummary.dailySpendingAllowance;

  return (
    <Card className="bg-slate-900/90 border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Compare Alternative Decision (A vs B)</h3>
        </div>
        <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          Potential Savings: {formatINR(Math.max(0, savingsDiff))}
        </span>
      </div>

      {/* Alternative Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
        <div>
          <label htmlFor="cmp-alt-name" className="block text-xs text-slate-400 mb-1">
            Option B Description
          </label>
          <input
            id="cmp-alt-name"
            type="text"
            value={altName}
            onChange={(e) => setAltName(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
          />
        </div>
        <div>
          <label htmlFor="cmp-alt-amount" className="block text-xs text-slate-400 mb-1">
            Option B Amount (₹)
          </label>
          <input
            id="cmp-alt-amount"
            type="number"
            value={altAmount}
            onChange={(e) => setAltAmount(Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
          />
        </div>
      </div>

      {/* Side by Side Comparison Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Option A (Original)</span>
              <div className="text-sm font-bold text-white">{scenarioA.name}</div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-rose-400">₹{scenarioA.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Usable Balance:</span>
              <span className="font-semibold text-slate-200">{formatINR(resultA.simulatedSummary.usableBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Allowance:</span>
              <span className="font-semibold text-slate-200">{formatINR(resultA.simulatedSummary.dailySpendingAllowance)}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Assessment:</span>
              <span className="font-semibold uppercase text-slate-300">{resultA.simulatedRisk.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Health Index:</span>
              <span className="font-semibold text-slate-200">{resultA.simulatedHealth.overallScore}/100</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-2"
            onClick={() => onApplyScenario(scenarioA)}
          >
            Choose Option A
          </Button>
        </div>

        {/* Scenario B Card */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/50 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-blue-900/50">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400">Option B (Alternative)</span>
              <div className="text-sm font-bold text-white">{scenarioB.name}</div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-400">₹{scenarioB.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Usable Balance:</span>
              <span className="font-semibold text-emerald-400">{formatINR(resultB.simulatedSummary.usableBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Allowance:</span>
              <span className="font-semibold text-emerald-400">{formatINR(resultB.simulatedSummary.dailySpendingAllowance)}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Assessment:</span>
              <span className="font-semibold uppercase text-emerald-400">{resultB.simulatedRisk.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Health Index:</span>
              <span className="font-semibold text-emerald-400">{resultB.simulatedHealth.overallScore}/100</span>
            </div>
          </div>

          <Button
            variant="emerald"
            size="sm"
            className="w-full mt-2"
            onClick={() => onApplyScenario(scenarioB)}
          >
            Choose Option B (Save {formatINR(Math.max(0, savingsDiff))})
          </Button>
        </div>
      </div>

      {savingsDiff > 0 && (
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            Choosing Option B preserves <strong>{formatINR(savingsDiff)}</strong> in cash, boosting your daily spending allowance by <strong>+{formatINR(dailyAllowanceDiff)}/day</strong>!
          </span>
        </div>
      )}
    </Card>
  );
};
