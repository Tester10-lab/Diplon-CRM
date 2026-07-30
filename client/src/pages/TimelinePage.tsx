import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Clock, ShieldAlert, FileText, UserCheck, DollarSign, AlertTriangle } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const timelineEvents = [
    {
      id: '1',
      kind: 'ALERT',
      title: 'Weather Alert Issued for Lukla Sector',
      details: 'High wind warnings reported near Lukla airport. Departure DEP-8841 flight delayed by 2 hours.',
      author: 'ops.a@diplon.com',
      time: '10 mins ago',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />
    },
    {
      id: '2',
      kind: 'AUDIT',
      title: 'Traveler Boarding Completed',
      details: 'Traveler Ram Shrestha scanned and boarded onto Bus BA-2-PA-1234 (Manifest DEP-8841).',
      author: 'ops.a@diplon.com',
      time: '45 mins ago',
      icon: <UserCheck className="w-4 h-4 text-emerald-500" />
    },
    {
      id: '3',
      kind: 'AUDIT',
      title: 'Driver & Vehicle Assigned to Departure',
      details: 'Assigned Babu Driver & Tourist Bus BA-2-PA-1234 to Everest Base Camp Trek (DEP-8841).',
      author: 'manager.a@diplon.com',
      time: '2 hours ago',
      icon: <ShieldAlert className="w-4 h-4 text-indigo-500" />
    },
    {
      id: '4',
      kind: 'FINANCE',
      title: 'Customer Payment Allocated',
      details: 'NPR 100,000 received via eSewa allocated to Invoice INV-10924.',
      author: 'finance.a@diplon.com',
      time: '4 hours ago',
      icon: <DollarSign className="w-4 h-4 text-emerald-500" />
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Unified Operations & Audit Timeline</h2>
          <p className="text-xs text-slate-400 mt-1">Chronological aggregate feed of system audit logs, dispatch events, financial transactions, and user alerts</p>
        </div>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 pl-6">
          {timelineEvents.map(event => (
            <div key={event.id} className="relative group">
              <div className="absolute -left-[31px] top-0 p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                {event.icon}
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{event.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />{event.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{event.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                  <span>Author: {event.author}</span>
                  <Badge variant={event.kind === 'ALERT' ? 'danger' : 'info'} dot>{event.kind}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
