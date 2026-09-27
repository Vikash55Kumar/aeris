import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'red' | 'amber' | 'emerald' | 'blue' | 'slate';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'slate', children, ...props }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight',
        variant === 'red' && 'bg-[#FEE2E2] text-[#DC2626]',
        variant === 'amber' && 'bg-[#FEF3C7] text-[#D97706]',
        variant === 'emerald' && 'bg-[#DCFCE7] text-[#15803D]',
        variant === 'blue' && 'bg-[#E0F2FE] text-[#0369A1]',
        variant === 'slate' && 'bg-slate-800 text-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
