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
    primary: 'bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/30',
    lime: 'bg-[#C8FF2D]/15 text-[#C8FF2D] border-[#C8FF2D]/35',
    success: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30',
    warning: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
    danger: 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30',
    info: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
    neutral: 'bg-white/5 text-slate-300 border-white/10'
  };

  const dotColors = {
    primary: 'bg-[#818CF8]',
    lime: 'bg-[#C8FF2D]',
    success: 'bg-[#34D399]',
    warning: 'bg-[#FBBF24]',
    danger: 'bg-[#F87171]',
    info: 'bg-[#38BDF8]',
    neutral: 'bg-slate-400'
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
