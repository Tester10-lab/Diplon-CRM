import React from 'react';
import { Button } from '../ui/Button';

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface QuickActionsWidgetProps {
  title: string;
  subtitle: string;
  actions: ActionItem[];
  gradientClass?: string;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  title,
  subtitle,
  actions,
  gradientClass = 'from-indigo-900/40 via-purple-900/20 to-slate-900 border-indigo-500/20'
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r ${gradientClass} border`}>
      <div>
        <h2 className="text-lg font-extrabold text-white">{title}</h2>
        <p className="text-xs text-slate-300 mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((act, i) => (
          <Button
            key={i}
            size="sm"
            variant={act.variant || (i === 0 ? 'primary' : 'secondary')}
            onClick={act.onClick}
            icon={act.icon}
          >
            {act.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
