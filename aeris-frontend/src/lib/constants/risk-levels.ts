export const RISK_COLORS = {
  low: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-500/40',
    badge: 'bg-[#DCFCE7] text-[#15803D]',
  },
  moderate: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/60',
    border: 'border-amber-500/40',
    badge: 'bg-[#FEF3C7] text-[#D97706]',
  },
  high: {
    text: 'text-red-400',
    bg: 'bg-red-950/60',
    border: 'border-red-500/40',
    badge: 'bg-[#FEE2E2] text-[#DC2626]',
  },
  very_high: {
    text: 'text-red-500',
    bg: 'bg-red-950/90',
    border: 'border-red-600',
    badge: 'bg-[#FEE2E2] text-[#DC2626]',
  },
  critical: {
    text: 'text-red-500',
    bg: 'bg-red-950/90',
    border: 'border-red-600',
    badge: 'bg-[#DC2626] text-white',
  },
} as const;
