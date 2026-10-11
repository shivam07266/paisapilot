import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'auto';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = false,
  color = 'auto',
  height = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  // Dynamic color selection based on percentage if 'auto'
  let barColorClass = 'bg-blue-500';
  if (color === 'emerald') barColorClass = 'bg-emerald-500';
  else if (color === 'amber') barColorClass = 'bg-amber-500';
  else if (color === 'rose') barColorClass = 'bg-rose-500';
  else if (color === 'purple') barColorClass = 'bg-purple-500';
  else if (color === 'auto') {
    if (percentage > 90) barColorClass = 'bg-rose-500';
    else if (percentage > 75) barColorClass = 'bg-amber-500';
    else barColorClass = 'bg-emerald-500';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1 text-xs text-slate-300">
          {label && <span className="font-medium">{label}</span>}
          {showPercent && <span className="font-semibold text-slate-400">{percentage}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-slate-800 rounded-full overflow-hidden ${heightClasses[height]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${heightClasses[height]} rounded-full transition-all duration-300 ease-out ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
