import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'indigo' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    // Pure High-Contrast White
    primary: 'bg-white hover:bg-neutral-200 text-black font-black shadow-lg shadow-white/10 border border-white',
    // Solid Neutral Light
    indigo: 'bg-neutral-100 hover:bg-white text-black font-extrabold shadow-md border border-white',
    // Dark Charcoal Secondary
    secondary: 'bg-neutral-900 hover:bg-neutral-800 text-white border border-white/15 backdrop-blur-md',
    danger: 'bg-neutral-900 hover:bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm',
    success: 'bg-neutral-900 hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm',
    outline: 'border border-white/20 hover:border-white text-white hover:bg-white/10 backdrop-blur-sm',
    ghost: 'hover:bg-white/10 text-neutral-300 hover:text-white',
    icon: 'p-2.5 rounded-2xl text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-5 py-3 gap-2.5'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
};
