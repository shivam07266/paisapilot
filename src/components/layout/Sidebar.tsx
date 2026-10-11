import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  ArrowLeftRight,
  PieChart,
  Target,
  CalendarClock,
  TrendingUp,
  RotateCcw,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatINR } from '../../utils/formatting';

interface SidebarProps {
  onResetDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onResetDemo }) => {
  const { summary, exportData } = useFinance();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/simulator', label: 'What-If Simulator', icon: Sparkles, badge: 'Core' },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/budget', label: 'Category Budgets', icon: PieChart },
    { to: '/goals', label: 'Savings Goals', icon: Target },
    { to: '/commitments', label: 'Commitments', icon: CalendarClock },
    { to: '/insights', label: 'Health & Forecast', icon: TrendingUp },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800/80 shrink-0 min-h-screen text-slate-300 select-none"
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <span className="font-extrabold text-lg tracking-tight">₹P</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              PaisaPilot
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Your money. Your decisions.</p>
          </div>
        </div>

        {/* Quick Cash Snapshot */}
        <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Current Cash</span>
            <span className="font-semibold text-emerald-400">{formatINR(summary.currentCash)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1.5">
            <span className="text-slate-400">Usable Balance</span>
            <span className="font-semibold text-blue-400">{formatINR(summary.usableBalance)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-400 pt-1.5 border-t border-slate-800/60">
            <span>Daily Allowance</span>
            <span className="font-medium text-slate-200">{formatINR(summary.dailySpendingAllowance)}/day</span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-1.5 bg-slate-950/60">
        <button
          type="button"
          onClick={exportData}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-slate-400" />
          <span>Export Data Backup (JSON)</span>
        </button>
        <button
          type="button"
          onClick={onResetDemo}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Demo Data</span>
        </button>
        <div className="pt-2 px-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>100% Local-first & Private</span>
        </div>
      </div>
    </aside>
  );
};
