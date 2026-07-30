import React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatWidgetProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon,
  badge
}) => {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{value}</div>
        {change ? (
          <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${
            changeType === 'positive' ? 'text-emerald-500' : changeType === 'negative' ? 'text-rose-500' : 'text-slate-400'
          }`}>
            {changeType === 'positive' ? <ArrowUpRight className="w-3.5 h-3.5" /> : changeType === 'negative' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
            <span>{change}</span>
          </div>
        ) : subtitle ? (
          <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
        ) : null}
      </div>
    </Card>
  );
};
