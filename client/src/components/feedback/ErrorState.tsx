import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected network error occurred while connecting to the ERP backend.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
      <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} icon={<RefreshCw className="w-4 h-4" />}>
          Retry Request
        </Button>
      )}
    </div>
  );
};
