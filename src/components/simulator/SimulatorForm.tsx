import React, { useState } from 'react';
import { ExpenseCategory, SimulationScenario } from '../../domain/types';
import { VALID_EXPENSE_CATEGORIES, validateAmount } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Sparkles, Headphones, Users, Tv, BookOpen, Wrench, RefreshCw } from 'lucide-react';

interface PresetScenario {
  name: string;
  category: ExpenseCategory;
  amount: number;
  icon: React.ReactNode;
  isRecurring?: boolean;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'Wireless Headphones',
    category: 'Shopping',
    amount: 2000,
    icon: <Headphones className="h-4 w-4 text-pink-400" />,
  },
  {
    name: 'Weekend Social Outing',
    category: 'Entertainment',
    amount: 800,
    icon: <Users className="h-4 w-4 text-purple-400" />,
  },
  {
    name: 'Monthly Streaming Bundle',
    category: 'Subscriptions',
    amount: 499,
    icon: <Tv className="h-4 w-4 text-cyan-400" />,
    isRecurring: true,
  },
  {
    name: 'Tech Certification Course',
    category: 'Education',
    amount: 1500,
    icon: <BookOpen className="h-4 w-4 text-indigo-400" />,
  },
  {
    name: 'Urgent Laptop Screen Repair',
    category: 'Bills',
    amount: 2500,
    icon: <Wrench className="h-4 w-4 text-amber-400" />,
  },
];

interface SimulatorFormProps {
  onSimulate: (scenario: SimulationScenario) => void;
  onReset: () => void;
  activeScenario?: SimulationScenario | null;
}

export const SimulatorForm: React.FC<SimulatorFormProps> = ({
  onSimulate,
  onReset,
  activeScenario,
}) => {
  const [name, setName] = useState(activeScenario?.name || 'Weekend Gadget Purchase');
  const [category, setCategory] = useState<ExpenseCategory>(activeScenario?.category || 'Shopping');
  const [amount, setAmount] = useState<string>(activeScenario ? String(activeScenario.amount) : '2000');
  const [date, setDate] = useState<string>(
    () => activeScenario?.proposedDate || new Date().toISOString().split('T')[0]
  );
  const [isRecurring, setIsRecurring] = useState<boolean>(activeScenario?.isRecurring || false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: PresetScenario) => {
    setName(preset.name);
    setCategory(preset.category);
    setAmount(String(preset.amount));
    setIsRecurring(Boolean(preset.isRecurring));
    setError(null);

    onSimulate({
      id: `sim-${preset.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: preset.name,
      category: preset.category,
      amount: preset.amount,
      proposedDate: date,
      isRecurring: preset.isRecurring,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountCheck = validateAmount(amount);
    if (!amountCheck.isValid) {
      setError(amountCheck.error || 'Please enter a valid amount.');
      return;
    }

    if (!name.trim()) {
      setError('Scenario name is required.');
      return;
    }

    setError(null);
    onSimulate({
      id: `sim-${Date.now()}`,
      name: name.trim(),
      category,
      amount: amountCheck.value,
      proposedDate: date,
      isRecurring,
    });
  };

  return (
    <div className="space-y-5">
      {/* Quick Gen Z Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Decision Presets
          </label>
          <span className="text-[11px] text-slate-400">Click to preview instantly</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="flex flex-col items-start p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-left transition-all group cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="p-1 rounded-md bg-slate-800 group-hover:bg-slate-700 transition-colors">
                  {preset.icon}
                </span>
                <span className="text-xs font-bold text-white">₹{preset.amount.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-300 leading-tight truncate w-full">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario Form */}
      <form onSubmit={handleFormSubmit} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Custom Expense Simulator</h3>
          </div>
          {activeScenario && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Simulator</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label htmlFor="sim-name" className="block text-xs font-medium text-slate-300 mb-1">
              Purchase / Expense Name
            </label>
            <input
              id="sim-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Festival ticket"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="sim-amount" className="block text-xs font-medium text-slate-300 mb-1">
              Simulated Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">₹</span>
              <input
                id="sim-amount"
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2000"
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="sim-category" className="block text-xs font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              id="sim-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {VALID_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sim-date" className="block text-xs font-medium text-slate-300 mb-1">
              Proposed Date
            </label>
            <input
              id="sim-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <input
              id="sim-recurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="sim-recurring" className="text-xs text-slate-300 select-none cursor-pointer">
              Simulate as recurring monthly obligation
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
              Run Simulation
            </Button>
          </div>
        </div>

        {error && <p className="text-xs text-rose-400 pt-1">{error}</p>}
      </form>
    </div>
  );
};
