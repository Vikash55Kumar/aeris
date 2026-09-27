import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'alert' | 'highlight' | 'dark';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl p-4 transition-all shadow-md',
          variant === 'default' && 'bg-[#0B1424] border border-[#16253B]',
          variant === 'dark' && 'bg-[#070D18] border border-[#141F32]',
          variant === 'alert' && 'bg-[#240E14] border border-[#481620]',
          variant === 'highlight' && 'bg-[#281A0E] border border-[#4A3216]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
