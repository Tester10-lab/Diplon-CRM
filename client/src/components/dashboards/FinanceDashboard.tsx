import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DollarSign, CreditCard, Building2, TrendingUp, AlertCircle, Plus, Wallet, ArrowUpRight } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

export const FinanceDashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const displayName = user?.name ? user.name.split(' (')[0] : 'Finance Manager';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-900/40 via-teal-900/20 to-slate-900 border border-emerald-500/20">
        <div>
          <h2 className="text-lg font-extrabold text-white">Welcome back, {displayName}</h2>
          <p className="text-xs text-slate-300 mt-1">Cash collections, supplier payables, invoice ledgers, operational expenses & net profit</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onNavigate('/finance')} icon={<Plus className="w-4 h-4" />}>Record Payment</Button>
          <Button size="sm" variant="secondary" onClick={() => onNavigate('/finance')}>Create Invoice</Button>
          <Button size="sm" variant="secondary" onClick={() => onNavigate('/finance')}>Record Expense</Button>
        </div>
      </div>

      {/* Finance Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Today's Collection</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono font-tabular-nums">NPR 240,000</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">Cash & Bank Transfer</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Outstanding Invoices</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><CreditCard className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono font-tabular-nums">NPR 450,000</div>
            <div className="text-xs text-amber-400 font-semibold mt-1">5 Receivables Due</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Supplier Payables Due</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><Building2 className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono font-tabular-nums">NPR 180,000</div>
            <div className="text-xs text-slate-400 mt-1">Yak & Yeti Hotel & Airlines</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Company Net Cash Balance</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Wallet className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#C8FF2D] font-mono font-tabular-nums">NPR 1,850,000</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">Liquid Treasury</div>
          </div>
        </Card>
      </div>

      {/* Finance Activity & Pending Invoices */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Financial Receipts & Approvals</h3>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/finance')}>Open Finance Hub</Button>
        </div>
        <div className="space-y-2">
          {[
            { ref: 'RCP-1092', desc: 'Customer Payment from Sita Karki', amount: 'NPR 100,000', mode: 'eSewa', status: 'COMPLETED' },
            { ref: 'PAY-4012', desc: 'Supplier Bill - Yak & Yeti Hotel', amount: 'NPR 80,000', mode: 'Bank Transfer', status: 'PAID' },
            { ref: 'EXP-8891', desc: 'Fuel Reimbursement - Bus BA-2-PA-1234', amount: 'NPR 15,000', mode: 'Cash', status: 'APPROVED' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{item.desc}</div>
                <div className="text-slate-400 font-mono text-[11px] mt-0.5">{item.ref} • {item.mode}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{item.amount}</span>
                <Badge variant="success">{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
