import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface ChartDataPoint {
  month: string;
  revenue: number;
  profit: number;
}

export interface RevenueChartWidgetProps {
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
}

export const RevenueChartWidget: React.FC<RevenueChartWidgetProps> = ({
  title = 'Revenue & Profit Trajectory',
  subtitle = 'Consolidated monthly gross revenue vs net profit',
  data
}) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <Badge variant="primary" dot>Live Sync</Badge>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `NPR ${(v/1000000).toFixed(1)}M`} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" name="Net Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
