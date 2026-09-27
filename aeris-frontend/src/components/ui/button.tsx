import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer select-none',
          size === 'sm' && 'px-2.5 py-1 text-xs',
          size === 'md' && 'px-3.5 py-2 text-xs',
          size === 'lg' && 'px-5 py-2.5 text-sm',
          variant === 'primary' && 'bg-[#1E60D5] hover:bg-blue-600 text-white shadow-md',
          variant === 'secondary' && 'bg-[#121E33] hover:bg-[#182844] text-white border border-[#1E3150]',
          variant === 'outline' && 'border border-slate-700 hover:border-slate-500 text-slate-200',
          variant === 'ghost' && 'text-slate-400 hover:text-white hover:bg-slate-800/60',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
