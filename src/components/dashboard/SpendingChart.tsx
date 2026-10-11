import React, { useMemo, memo } from 'react';
import { Card } from '../ui/Card';
import { Transaction } from '../../domain/types';
import { formatINR, formatPercent, getCategoryColor } from '../../utils/formatting';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as ChartIcon } from 'lucide-react';

export interface SpendingChartProps {
  transactions: Transaction[];
}

/**
 * Renders the category spending breakdown using a responsive Recharts donut chart,
 * visual progress list, and a screen-reader accessible data summary table.
 */
export const SpendingChart: React.FC<SpendingChartProps> = memo(({ transactions }) => {
  const categoryData = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.type === 'expense');
    const totalSpent = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, number>();
    for (const t of expenseTxs) {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }

    const items = Array.from(map.entries()).map(([category, amount]) => {
      const color = getCategoryColor(category);
      return {
        name: category,
        value: amount,
        percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        color: color.bar,
      };
    });

    items.sort((a, b) => b.value - a.value);
    return { items, totalSpent };
  }, [transactions]);

  if (categoryData.totalSpent === 0) {
    return (
      <Card className="bg-slate-900/90 border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <ChartIcon className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-200">Spending by Category</h2>
        </div>
        <div className="p-8 text-center text-xs text-slate-400">
          No expenses recorded yet in this budget cycle.
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/90 border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-200">Spending by Category</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total: <strong className="text-slate-100 font-semibold">{formatINR(categoryData.totalSpent)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Recharts Donut */}
        <div className="md:col-span-5 h-48 min-h-[12rem] w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.items}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.items.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | string | readonly (number | string)[] | undefined) => [
                  formatINR(Number(value) || 0),
                  'Spent',
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                itemStyle={{ color: '#93c5fd' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Accessible Categorized List with Bars */}
        <div className="md:col-span-7 space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {categoryData.items.map((item) => (
            <div key={item.name} className="text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                  {item.name}
                </span>
                <span className="text-slate-300 font-semibold">
                  {formatINR(item.value)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">({formatPercent(item.percent)})</span>
                </span>
              </div>
              <div
                className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(item.percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.name} share of total spending`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Screen Reader Accessible Table Summary */}
        <table className="sr-only">
          <caption>Spending Breakdown by Category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Amount</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.items.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{formatINR(item.value)}</td>
                <td>{formatPercent(item.percent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
});

SpendingChart.displayName = 'SpendingChart';
