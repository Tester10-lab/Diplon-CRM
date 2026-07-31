import React, { useState } from 'react';
import { useInvoices } from '../shared/hooks/finance/useFinance';
import { useAuthStore } from '../store/authStore';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { InvoiceData, AgencySettlement } from '../types/erp';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { CreditCard, DollarSign, Download, Plus, Sparkles, TrendingUp, TrendingDown, Send, CheckCircle2, XCircle, ShieldCheck, Lock, FileText, ArrowRight } from 'lucide-react';

export interface FinanceRecord {
  id: string;
  type: 'COLLECTION' | 'EXPENSE';
  title: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

const FINANCE_STORAGE_KEY = 'diplon_finance_ledger_v7';

const INITIAL_FINANCE_RECORDS: FinanceRecord[] = [
  { id: 'FIN-101', type: 'COLLECTION', title: '[Hike on Trek Travel] Halesi Tour Advance - Chandra man Maharjan', category: 'Customer Booking', amount: 2500, date: '2026-07-31', notes: '85,000/- Rs Collect on 28-seater sofa bus' },
  { id: 'FIN-102', type: 'COLLECTION', title: '[Hike on Trek Travel] Jiri Tour Booking - Tarak Panja', category: 'Customer Booking', amount: 0, date: '2026-07-31', notes: '34,000 Rs collect on Scorpio' },
  { id: 'FIN-103', type: 'COLLECTION', title: '[Hike on Trek Travel] Upper Mustang Booking - Bishnu Prasad Kafle', category: 'Customer Booking', amount: 0, date: '2026-07-31', notes: '1,21,000 Rs collect on Scorpio' },
  { id: 'FIN-104', type: 'COLLECTION', title: '[Hike on Trek Travel] Muktinath Advance - Abhijit Ghosh', category: 'Customer Booking', amount: 9600, date: '2026-07-31', notes: '34,400 Rs collect on Scorpio (Advance 9,600 paid)' }
];

function getStoredFinanceRecords(): FinanceRecord[] {
  try {
    localStorage.removeItem('diplon_finance_ledger');
    localStorage.removeItem('diplon_finance_ledger_v3');
    localStorage.removeItem('diplon_finance_ledger_v4');
    localStorage.removeItem('diplon_finance_ledger_v5');
    localStorage.removeItem('diplon_finance_ledger_v6');
    const saved = localStorage.getItem(FINANCE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse finance records:', e);
  }
  localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(INITIAL_FINANCE_RECORDS));
  return INITIAL_FINANCE_RECORDS;
}

const INITIAL_SETTLEMENTS: AgencySettlement[] = [
  {
    id: 'SETTLE-801',
    agencyCompanyId: 'cmp_hikeontrek_01',
    agencyName: 'Hike on Trek Travel',
    totalCollections: 280000,
    agreedCommissionMargin: 15,
    netSettlementAmount: 238000,
    payoutStatus: 'APPROVED',
    notes: 'B2B settlement for 4 confirmed tour packages (Halesi 25 Pax, Jiri 6 Pax, Upper Mustang 7 Pax, Muktinath 2 Pax).',
    requestedAt: '2026-07-31 10:00',
    settledAt: '2026-07-31 10:15'
  }
];

export const FinancePage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: invoices, isLoading, error, refetch } = useInvoices();
  const isAgency = user.role === 'AGENCY';

  const [activeTab, setActiveTab] = useState<'LEDGER' | 'SETTLEMENTS'>('LEDGER');
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(getStoredFinanceRecords());
  const [settlements, setSettlements] = useState<AgencySettlement[]>(INITIAL_SETTLEMENTS);

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Record Form State
  const [recType, setRecType] = useState<'COLLECTION' | 'EXPENSE'>('COLLECTION');
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState('Customer Booking');
  const [recAmount, setRecAmount] = useState<number>(5000);
  const [recNotes, setRecNotes] = useState('');

  // Settlement Request Form State
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleNotes, setSettleNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  // Financial Calculations
  const totalCollections = financeRecords.filter(r => r.type === 'COLLECTION').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = financeRecords.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0);
  const netProfitLoss = totalCollections - totalExpenses;

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim() || recAmount <= 0) return;

    const newRecord: FinanceRecord = {
      id: `FIN-${Math.floor(100 + Math.random() * 900)}`,
      type: recType,
      title: recTitle,
      category: recCategory,
      amount: recAmount,
      date: new Date().toISOString().substring(0, 10),
      notes: recNotes
    };

    setFinanceRecords(prev => [newRecord, ...prev]);
    setIsRecordModalOpen(false);
    showToast(`✅ Recorded ${recType.toLowerCase()} of NPR ${recAmount.toLocaleString()}`);

    setRecTitle('');
  };

  const handleRequestSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const reqAmount = settleAmount || netProfitLoss;
    if (reqAmount <= 0) return;

    const newSettlement: AgencySettlement = {
      id: `SETTL-${Math.floor(100 + Math.random() * 900)}`,
      agencyCompanyId: user.companyId,
      agencyName: user.companyName,
      requestedAmount: reqAmount,
      totalCollections,
      totalExpenses,
      status: 'PENDING',
      notes: settleNotes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSettlements(prev => [newSettlement, ...prev]);
    setIsSettlementModalOpen(false);
    showToast(`✨ Settlement request of NPR ${reqAmount.toLocaleString()} submitted to Admin!`);
  };

  const handleAdminApproveSettlement = (id: string) => {
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED', settledAt: new Date().toISOString().substring(0, 10) } : s));
    showToast(`✅ Settlement request approved and marked as settled!`);
  };

  const handleAdminRejectSettlement = (id: string) => {
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED' } : s));
    showToast(`❌ Settlement request rejected.`);
  };

  const handleDownloadStatement = () => {
    const headers = ['Record ID', 'Type', 'Title', 'Category', 'Amount (NPR)', 'Date'];
    const rows = financeRecords.map(r => [
      `"${r.id}"`,
      `"${r.type}"`,
      `"${r.title}"`,
      `"${r.category}"`,
      r.amount,
      `"${r.date}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Financial_Statement_${user.companyName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`📥 Financial Statement downloaded!`);
  };

  const recordColumns: Column<FinanceRecord>[] = [
    {
      key: 'id',
      header: 'Ref ID',
      accessor: r => (
        <div>
          <div className="font-extrabold font-mono text-indigo-400">{r.id}</div>
          <div className="text-[10px] text-slate-400">{r.date}</div>
        </div>
      )
    },
    {
      key: 'title',
      header: 'Description & Category',
      accessor: r => (
        <div>
          <div className="font-bold text-white text-xs">{r.title}</div>
          <div className="text-[11px] text-slate-400">{r.category}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Flow Type',
      accessor: r => (
        <Badge variant={r.type === 'COLLECTION' ? 'success' : 'danger'} dot>
          {r.type}
        </Badge>
      )
    },
    {
      key: 'amount',
      header: 'Amount (NPR)',
      accessor: r => (
        <div className={`font-extrabold font-mono text-sm ${r.type === 'COLLECTION' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {r.type === 'COLLECTION' ? '+' : '-'} NPR {r.amount.toLocaleString()}
        </div>
      )
    }
  ];

  const settlementColumns: Column<AgencySettlement>[] = [
    {
      key: 'id',
      header: 'Settlement Ref',
      accessor: s => (
        <div>
          <div className="font-extrabold font-mono text-amber-400">{s.id}</div>
          <div className="text-[10px] text-slate-400">{s.createdAt}</div>
        </div>
      )
    },
    {
      key: 'agencyName',
      header: 'Agency Partner',
      accessor: s => <span className="font-bold text-white text-xs">{s.agencyName}</span>
    },
    {
      key: 'requestedAmount',
      header: 'Requested Profit Settlement',
      accessor: s => (
        <div className="font-extrabold font-mono text-emerald-400 text-sm">
          NPR {s.requestedAmount.toLocaleString()}
        </div>
      )
    },
    {
      key: 'totalCollections',
      header: 'Collections / Expenses',
      accessor: s => (
        <div className="text-[11px] font-mono text-slate-300">
          <div>Coll: <span className="text-emerald-400">NPR {s.totalCollections.toLocaleString()}</span></div>
          <div>Exp: <span className="text-rose-400">NPR {s.totalExpenses.toLocaleString()}</span></div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Settlement Status',
      accessor: s => (
        <Badge
          variant={
            s.status === 'APPROVED' || s.status === 'PAID'
              ? 'success'
              : s.status === 'PENDING'
              ? 'warning'
              : 'danger'
          }
          dot
        >
          {s.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Admin Actions',
      accessor: s => (
        !isAgency && s.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              onClick={() => handleAdminApproveSettlement(s.id)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Payment</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/30"
              onClick={() => handleAdminRejectSettlement(s.id)}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </Button>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-400">
            {s.status === 'APPROVED' ? '🔒 Approved & Locked' : s.status}
          </span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-indigo-400/40">
          <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            {isAgency ? 'Agency Finance & Profit Settlement Hub' : 'Enterprise Finance & Settlement Command'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Collections, operational expenses, automated Profit/Loss calculations & Admin payment requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={handleDownloadStatement}
          >
            Download Statement
          </Button>

          {isAgency ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
              icon={<Send className="w-4 h-4" />}
              onClick={() => {
                setSettleAmount(netProfitLoss);
                setIsSettlementModalOpen(true);
              }}
            >
              Request Settlement
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsRecordModalOpen(true)}
            >
              + Record Flow
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards Banner: Collections, Expenses, Profit/Loss */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customer Collections</span>
            <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
              + NPR {totalCollections.toLocaleString()}
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Operational Expenses</span>
            <div className="text-xl font-black text-rose-400 mt-1 font-mono">
              - NPR {totalExpenses.toLocaleString()}
            </div>
          </div>
          <TrendingDown className="w-6 h-6 text-rose-400" />
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Auto Calculated Net Profit</span>
            <div className="text-2xl font-black text-amber-300 mt-1 font-mono">
              NPR {netProfitLoss.toLocaleString()}
            </div>
          </div>
          <DollarSign className="w-7 h-7 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="p-1 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'LEDGER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          💳 Collections & Expenses Ledger ({financeRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('SETTLEMENTS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'SETTLEMENTS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          💰 Payment Settlement History ({settlements.length})
        </button>
      </div>

      {activeTab === 'LEDGER' ? (
        <DataTable
          title="Collections & Expenses Statement"
          description="Detailed breakdown of incoming customer collections and outgoing operational costs"
          data={financeRecords as any}
          columns={recordColumns}
          searchPlaceholder="Search finance records..."
        />
      ) : (
        <DataTable
          title="Agency Profit Settlement Requests & Approvals"
          description="Track submitted payment requests, admin approval status, and settlement history"
          data={settlements as any}
          columns={settlementColumns}
          searchPlaceholder="Search settlements..."
        />
      )}

      {/* Record Flow Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Financial Flow"
        description="Add a new customer collection or operational expense record."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Flow Type
              </label>
              <select
                value={recType}
                onChange={e => setRecType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold"
              >
                <option value="COLLECTION">COLLECTION (Customer Payment)</option>
                <option value="EXPENSE">EXPENSE (Transport / Hotel / Guide)</option>
              </select>
            </div>

            <Input
              label="Amount (NPR)"
              type="number"
              value={recAmount}
              onChange={e => setRecAmount(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Record Title / Description"
            value={recTitle}
            onChange={e => setRecTitle(e.target.value)}
            placeholder="e.g. Sailung Tour Booking Payment"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsRecordModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Settlement Request Modal */}
      <Modal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        title="Request Profit Settlement Payment"
        description="Submit calculated profit settlement request to Admin for review & payout."
        maxWidth="md"
      >
        <form onSubmit={handleRequestSettlement} className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase">Calculated Profit Balance</div>
            <div className="text-2xl font-black text-amber-300 font-mono">NPR {netProfitLoss.toLocaleString()}</div>
          </div>

          <Input
            label="Requested Settlement Amount (NPR)"
            type="number"
            value={settleAmount}
            onChange={e => setSettleAmount(Number(e.target.value))}
            required
          />

          <Input
            label="Settlement Notes / Bank Details"
            value={settleNotes}
            onChange={e => setSettleNotes(e.target.value)}
            placeholder="e.g. Please transfer to Nabil Bank Account #100200300"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsSettlementModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              Submit Settlement Request
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
