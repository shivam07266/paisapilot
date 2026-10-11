import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  ArrowLeftRight,
  PieChart,
  Target,
  CalendarClock,
  TrendingUp,
  Menu,
  X,
  RotateCcw,
  Download,
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';

interface MobileNavProps {
  onResetDemo: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onResetDemo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { exportData } = useFinance();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/simulator', label: 'Simulator', icon: Sparkles },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/budget', label: 'Budget', icon: PieChart },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/commitments', label: 'Commitments', icon: CalendarClock },
    { to: '/insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            ₹P
          </div>
          <span className="font-bold text-white text-base tracking-tight">PaisaPilot</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-[53px] z-50 bg-slate-950/95 backdrop-blur-md p-4 flex flex-col justify-between overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                exportData();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-slate-900 text-slate-200 border border-slate-800"
            >
              <Download className="h-4 w-4" />
              <span>Export JSON Backup</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onResetDemo();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-rose-950/30 text-rose-300 border border-rose-900/40"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar for quick access */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex justify-around items-center"
        aria-label="Mobile Bottom Bar"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/simulator"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Sparkles className="h-5 w-5 mb-0.5 text-blue-400" />
          <span>Simulate</span>
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ArrowLeftRight className="h-5 w-5 mb-0.5" />
          <span>Activity</span>
        </NavLink>
        <NavLink
          to="/goals"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Target className="h-5 w-5 mb-0.5" />
          <span>Goals</span>
        </NavLink>
      </nav>
    </>
  );
};
