import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { SimulationResult, SimulationScenario } from '../domain/types';
import { simulateScenario } from '../domain/financeEngine';
import { SimulatorForm } from '../components/simulator/SimulatorForm';
import { ScenarioResults } from '../components/simulator/ScenarioResults';
import { ScenarioComparison } from '../components/simulator/ScenarioComparison';
import { Card } from '../components/ui/Card';
import { Sparkles, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const { state, addTransaction } = useFinance();

  // Active scenario being simulated
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(() => ({
    id: 'default-sim',
    name: 'Wireless Headphones',
    category: 'Shopping',
    amount: 2000,
    proposedDate: new Date().toISOString().split('T')[0],
  }));

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(() => {
    return simulateScenario(state, {
      id: 'default-sim',
      name: 'Wireless Headphones',
      category: 'Shopping',
      amount: 2000,
      proposedDate: new Date().toISOString().split('T')[0],
    });
  });

  const [showComparison, setShowComparison] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSimulate = (scenario: SimulationScenario) => {
    setActiveScenario(scenario);
    const result = simulateScenario(state, scenario);
    setSimulationResult(result);
    setNotification(null);
  };

  const handleReset = () => {
    setActiveScenario(null);
    setSimulationResult(null);
    setShowComparison(false);
    setNotification('Simulator reset. Actual finances were not affected.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApplyDecision = (scenarioToApply?: SimulationScenario) => {
    const target = scenarioToApply || activeScenario;
    if (!target) return;

    addTransaction({
      type: 'expense',
      category: target.category,
      amount: target.amount,
      date: target.proposedDate || new Date().toISOString().split('T')[0],
      description: target.name,
      isRecurring: target.isRecurring,
      notes: 'Applied from PaisaPilot What-If Simulator',
    });

    setNotification(`Successfully committed "${target.name}" for ₹${target.amount.toLocaleString('en-IN')} into actual finances!`);
    setActiveScenario(null);
    setSimulationResult(null);
    setShowComparison(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              What-If Financial Simulator
            </h1>
            <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Zero Risk Sandbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Evaluate prospective purchases and surprise expenses before spending a single rupee.
          </p>
        </div>

        {activeScenario && (
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showComparison
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>{showComparison ? 'Hide Alternative Option' : 'Compare with Cheaper Alternative'}</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Simulator Form & Presets */}
      <SimulatorForm
        onSimulate={handleSimulate}
        onReset={handleReset}
        activeScenario={activeScenario}
      />

      {/* Alternative Scenario Comparison (Option A vs Option B) */}
      {showComparison && activeScenario && (
        <ScenarioComparison
          state={state}
          scenarioA={activeScenario}
          onApplyScenario={handleApplyDecision}
        />
      )}

      {/* Detailed Simulation Outcome */}
      {simulationResult ? (
        <ScenarioResults
          result={simulationResult}
          onApplyDecision={() => handleApplyDecision()}
          onReset={handleReset}
        />
      ) : (
        <Card className="bg-slate-900/50 border-slate-800/80 p-8 text-center">
          <div className="p-3 mx-auto w-fit rounded-full bg-blue-500/10 text-blue-400 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">Simulator is Ready</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Select a preset above or enter a custom amount to see how your daily allowance, savings goals, and risk profile would respond.
          </p>
        </Card>
      )}
    </div>
  );
};
