import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'lime' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className
}) => {
  const variants = {
    primary: 'bg-white text-black font-extrabold border-white',
    lime: 'bg-white/15 text-white border-white/30',
    success: 'bg-white/10 text-white border-white/25',
    warning: 'bg-neutral-800 text-neutral-200 border-white/20',
    danger: 'bg-neutral-900 text-neutral-300 border-white/15',
    info: 'bg-white/10 text-white border-white/20',
    neutral: 'bg-white/5 text-neutral-300 border-white/15'
  };

  const dotColors = {
    primary: 'bg-black',
    lime: 'bg-white',
    success: 'bg-white',
    warning: 'bg-neutral-300',
    danger: 'bg-neutral-400',
    info: 'bg-white',
    neutral: 'bg-neutral-400'
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={twMerge(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border backdrop-blur-md select-none tracking-tight',
        variants[variant],
        className
      )}
    >
      {dot && <span className={twMerge('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {children}
    </motion.span>
  );
};
