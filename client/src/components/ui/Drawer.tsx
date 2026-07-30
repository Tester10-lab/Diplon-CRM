import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'w-96',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen ${width} bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl p-6 flex flex-col space-y-6 animate-fade-in`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-extrabold text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
