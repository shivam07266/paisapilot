import React, { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { generateMonthlyForecast } from '../utils/forecast';
import { formatINR } from '../utils/formatting';
import { Card } from '../components/ui/Card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Info,
  Calendar,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { state, summary, risk, health } = useFinance();

  const forecastData = useMemo(() => {
    return generateMonthlyForecast(state);
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Financial Forecast & Risk Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Dynamic 30-day balance projections, scenario stress tests, and behavioral risk signals.
        </p>
      </div>

      {/* 30-Day Monthly Balance Trajectory Line Chart */}
      <Card className="bg-slate-900/90 border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">30-Day Cash Trajectory Forecast</h3>
          </div>
          <span className="text-xs text-slate-400">
            Projected End-of-Period: <strong className="text-emerald-400 font-bold">{formatINR(summary.projectedEndBalance)}</strong>
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(val: any) => [formatINR(Number(val) || 0), 'Projected Balance']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label="Zero Balance" />
              <Line
                type="monotone"
                dataKey="baselineBalance"
                name="Projected Balance"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#60a5fa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p>
            <strong>Forecast Assumptions:</strong> Pacing assumes you stay within your calculated daily allowance of{' '}
            <strong className="text-slate-200">{formatINR(summary.dailySpendingAllowance)}/day</strong> and all upcoming bills
            are settled on their exact scheduled due dates.
          </p>
        </div>
      </Card>

      {/* Risk and Health Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Analysis Card */}
        <Card className="bg-slate-900/90 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Active Risk Assessment</h3>
            </div>
            <span
              className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                risk.level === 'critical'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : risk.level === 'elevated'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {risk.level} Risk
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Identified Signals</span>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
              {risk.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Recommended Interventions</span>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
              {risk.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-blue-950/20 border border-blue-900/30 text-blue-300">
                  <Lightbulb className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Health Score Factors Card */}
        <Card className="bg-slate-900/90 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Health Score Architecture</h3>
            </div>
            <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-full">
              {health.overallScore} / 100
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(health.factors).map(([key, f]) => (
              <div key={key} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-200">{f.label}</span>
                  <span className="font-bold text-blue-400">
                    {f.score} / {f.max}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(f.score / f.max) * 100}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{f.explanation}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-500">
            Calculated using normalized heuristic weighting across budget sustainability, spending discipline, obligation coverage, emergency cushion, and goal feasibility.
          </div>
        </Card>
      </div>
    </div>
  );
};
