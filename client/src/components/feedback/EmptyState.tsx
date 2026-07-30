import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are currently no items in this category or matching your search filter.',
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} icon={<Plus className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
