import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Users, FileQuestion, FileText, CheckCircle2, TrendingUp, Plus, Calendar, Clock } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { openBookingModal } from '../../store/modalStore';

export const SalesDashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const displayName = user?.name ? user.name.split(' (')[0] : 'Sales Rep';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-900 border border-blue-500/20">
        <div>
          <h2 className="text-lg font-extrabold text-white">Welcome back, {displayName}</h2>
          <p className="text-xs text-slate-300 mt-1">Lead acquisition, inquiry conversion, quotations, and booking pipeline</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onNavigate('/customers')} icon={<Plus className="w-4 h-4" />}>New Inquiry</Button>
          <Button size="sm" variant="secondary" onClick={openBookingModal}>New Quotation</Button>
          <Button size="sm" variant="secondary" onClick={openBookingModal}>+ Create Tour Booking</Button>
        </div>
      </div>

      {/* Sales Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Today's Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Users className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">14 Leads</div>
            <div className="text-xs text-blue-500 font-semibold mt-1">+5 new from Web form</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Pending Quotations</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><FileQuestion className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">8 Quotations</div>
            <div className="text-xs text-amber-500 font-semibold mt-1">NPR 1.8M pending approval</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Confirmed Bookings</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">26 Bookings</div>
            <div className="text-xs text-emerald-500 font-semibold mt-1">NPR 4.5M closed revenue</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">68.5%</div>
            <div className="text-xs text-emerald-500 font-semibold mt-1">+4.2% higher conversion</div>
          </div>
        </Card>
      </div>

      {/* Follow-ups & Pipeline List */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Actionable Lead Follow-Ups Today</h3>
          <Badge variant="warning" dot>3 Overdue</Badge>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Sita Karki', package: 'Everest Base Camp Trek', status: 'Quotation Sent', time: '10:30 AM' },
            { name: 'John Doe', package: 'Annapurna Circuit Trek', status: 'Inquiry Pending', time: '02:00 PM' },
            { name: 'Michael Chang', package: 'Langtang Valley Trek', status: 'Payment Reminder', time: '04:15 PM' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  {item.name[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                  <div className="text-slate-400">{item.package}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="info">{item.status}</Badge>
                <span className="text-slate-400 flex items-center gap-1 font-mono"><Clock className="w-3 h-3" />{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
