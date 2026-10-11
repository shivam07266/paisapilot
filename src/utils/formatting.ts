/**
 * Formats a number into Indian Rupee format (INR).
 * Example: 10000 -> ₹10,000; 1250.5 -> ₹1,250.50
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format date in friendly Indian format: DD MMM YYYY or DD MMM
 */
export function formatDate(dateString: string, includeYear: boolean = true): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: includeYear ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats a percentage value (e.g. 75.4 -> 75%)
 */
export function formatPercent(value: number, decimals: number = 0): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get category color and styling
 */
export function getCategoryColor(category: string): { bg: string; text: string; border: string; bar: string } {
  switch (category) {
    case 'Food':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', bar: '#f59e0b' };
    case 'Transport':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', bar: '#3b82f6' };
    case 'Education':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', bar: '#6366f1' };
    case 'Shopping':
      return { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', bar: '#ec4899' };
    case 'Entertainment':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', bar: '#a855f7' };
    case 'Bills':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', bar: '#f43f5e' };
    case 'Subscriptions':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: '#06b6d4' };
    case 'Health':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: '#10b981' };
    case 'Allowance':
    case 'Stipend':
    case 'Freelance':
    case 'Gift':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: '#10b981' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', bar: '#64748b' };
  }
}
