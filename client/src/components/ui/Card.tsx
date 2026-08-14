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
        glass ? 'glass-card' : 'bg-[#0d0d0f] border-white/10 text-white shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
