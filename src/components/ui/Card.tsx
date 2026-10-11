import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'highlight' | 'danger' | 'success';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-900/90 border-slate-800/80 shadow-md shadow-black/20',
    surface: 'bg-slate-900/50 border-slate-800/50',
    highlight: 'bg-blue-950/20 border-blue-800/40 shadow-blue-950/10 shadow-md',
    danger: 'bg-rose-950/20 border-rose-900/40',
    success: 'bg-emerald-950/20 border-emerald-900/40',
  };

  return (
    <div
      className={`rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
