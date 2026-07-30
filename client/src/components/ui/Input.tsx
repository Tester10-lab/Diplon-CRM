import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  currencyPrefix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  currencyPrefix,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {label && (
        <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {currencyPrefix && (
          <span className="absolute left-3.5 text-xs font-bold text-slate-400 select-none">
            {currencyPrefix}
          </span>
        )}
        {icon && !currencyPrefix && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={twMerge(
            'w-full bg-[#0B0E14] text-white placeholder-slate-400 border border-white/10 rounded-2xl px-4 py-2.5 text-xs transition-all duration-200 focus:outline-none focus:border-[#C8FF2D] focus:ring-2 focus:ring-[#C8FF2D]/25 shadow-inner',
            (icon || currencyPrefix) && 'pl-10',
            error && 'border-[#EF4444] focus:ring-[#EF4444]/25',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <motion.span initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-bold text-[#EF4444]">
          {error}
        </motion.span>
      ) : helperText ? (
        <span className="text-[11px] text-slate-400 font-medium">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
