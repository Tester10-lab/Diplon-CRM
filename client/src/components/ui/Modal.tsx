import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0B0E14]/85 backdrop-blur-xl cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidths[maxWidth]} max-h-[88vh] flex flex-col bg-[#111621] border border-white/10 text-slate-100 rounded-3xl shadow-2xl p-5 sm:p-6 z-10 overflow-hidden backdrop-blur-2xl`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-4 border-b border-white/10 pb-3.5 shrink-0">
              <div>
                {title && <h3 className="text-base font-black text-white tracking-tight">{title}</h3>}
                {description && <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>}
              </div>
              <Button variant="icon" size="sm" onClick={onClose} title="Close (Esc)">
                <X className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
              </Button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
