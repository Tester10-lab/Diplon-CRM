import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  currencyPrefix?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  currencyPrefix,
  rightElement,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {label && (
        <label className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {currencyPrefix && (
          <span className="absolute left-3.5 text-xs font-bold text-neutral-400 select-none">
            {currencyPrefix}
          </span>
        )}
        {icon && !currencyPrefix && (
          <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={twMerge(
            'w-full bg-[#0a0a0c] text-white placeholder-neutral-500 border border-white/15 rounded-2xl px-4 py-2.5 text-xs transition-all duration-200 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 shadow-inner',
            (icon || currencyPrefix) && 'pl-10',
            rightElement && 'pr-11',
            error && 'border-rose-500/60 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <motion.span initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-bold text-rose-400">
          {error}
        </motion.span>
      ) : helperText ? (
        <span className="text-[11px] text-neutral-400 font-medium">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
