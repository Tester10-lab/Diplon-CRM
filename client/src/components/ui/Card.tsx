import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glass = true, ...props }) => {
  return (
    <div
      className={twMerge(
        'rounded-2xl p-5 border transition-all duration-200',
        glass ? 'glass-card' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
