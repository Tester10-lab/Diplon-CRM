import React, { useState } from 'react';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { openBookingModal } from '../store/modalStore';
import { HelpCircle, Plus, Phone, MessageSquare, Calendar, Users, DollarSign, Sparkles, CheckCircle2, Copy, Send, ArrowRight, UserPlus, Compass, Clock, Check, Filter } from 'lucide-react';

export interface TourInquiry {
  id: string;
  customerName: string;
  contactPhone: string;
  packageName: string;
  travelDate: string;
  pax: number;
  estimatedBudget: number;
  source: 'WhatsApp' | 'Website Form' | 'Phone Call' | 'Viber' | 'B2B Referral';
  status: 'NEW' | 'FOLLOW_UP' | 'QUOTED' | 'CONVERTED' | 'CANCELLED';
  notes: string;
  createdAt: string;
}

const INITIAL_INQUIRIES: TourInquiry[] = [
  {
    id: 'INQ-1001',
    customerName: 'Chandra man Maharjan',
    contactPhone: '9802100125 / 9843500017',
    packageName: 'Halesi Tour Package (1N/2D)',
    travelDate: '2026-08-01',
    pax: 25,
    estimatedBudget: 87500,
    source: 'WhatsApp',
    status: 'CONVERTED',
    notes: '28-seater sofa bus booked. 85,000 Rs to collect on bus, 2,500 advance paid.',
    createdAt: '2026-07-31 10:15'
  },
  {
    id: 'INQ-1002',
    customerName: 'Tarak Panja',
    contactPhone: '9841142416',
    packageName: 'Jiri Tour (1N/2D)',
    travelDate: '2026-08-01',
    pax: 6,
    estimatedBudget: 33000,
    source: 'Phone Call',
    status: 'CONVERTED',
    notes: '6 Pax private tour, 2 rooms normal sharing. 34,000 Rs collect on vehicle.',
    createdAt: '2026-07-31 09:30'
  },
  {
    id: 'INQ-1003',
    customerName: 'Bishnu Prasad Kafle',
    contactPhone: '9855045297',
    packageName: 'Upper Mustang Package (4N/5D)',
    travelDate: '2026-10-28',
    pax: 7,
    estimatedBudget: 115500,
    source: 'Website Form',
    status: 'CONVERTED',
    notes: '7 Pax private tour (Bharatpur to Bharatpur). 1,21,000 Rs collect on vehicle.',
    createdAt: '2026-07-31 11:00'
  },
  {
    id: 'INQ-1004',
    customerName: 'Abhijit Ghosh',
    contactPhone: '+91 94334 68100',
    packageName: 'Muktinath Tour (2N/3D)',
    travelDate: '2026-10-25',
    pax: 2,
    estimatedBudget: 44000,
    source: 'B2B Referral',
    status: 'CONVERTED',
    notes: 'Lalitpur Holidays referral. 2 Pax private tour. 34,400 Rs collect on vehicle.',
    createdAt: '2026-07-31 14:20'
  }
];

export const InquiryPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<TourInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('diplon_tour_inquiries');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INQUIRIES;
  });

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPackage, setFormPackage] = useState('Sailung–Kalinchowk Tour Package');
  const [formDate, setFormDate] = useState('2026-08-02');
  const [formPax, setFormPax] = useState<number>(2);
  const [formBudget, setFormBudget] = useState<number>(11000);
  const [formSource, setFormSource] = useState<'WhatsApp' | 'Website Form' | 'Phone Call' | 'Viber' | 'B2B Referral'>('WhatsApp');
  const [formNotes, setFormNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const newInquiry: TourInquiry = {
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formName,
      contactPhone: formPhone,
      packageName: formPackage,
      travelDate: formDate,
      pax: formPax,
      estimatedBudget: formBudget,
      source: formSource,
      status: 'NEW',
      notes: formNotes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    localStorage.setItem('diplon_tour_inquiries', JSON.stringify(updated));
    setIsAddModalOpen(false);
    showToast(`✨ New tour inquiry created for ${formName}!`);

    // Reset Form
    setFormName('');
    setFormPhone('');
    setFormNotes('');
  };

  const handleConvertToBooking = (inquiry: TourInquiry) => {
    // Update status to CONVERTED
    const updated = inquiries.map(i => i.id === inquiry.id ? { ...i, status: 'CONVERTED' as const } : i);
    setInquiries(updated);
    localStorage.setItem('diplon_tour_inquiries', JSON.stringify(updated));

    // Open booking modal
    openBookingModal();
    showToast(`⚡ Inquiry ${inquiry.id} converted to Booking pipeline!`);
  };

  const handleSendWhatsAppQuote = (inquiry: TourInquiry) => {
    const text = `🇳🇵 DIPLON TOURS & TRAVEL QUOTATION
Hi ${inquiry.customerName},

Thank you for inquiring about ${inquiry.packageName}!
📅 Travel Date: ${inquiry.travelDate}
👥 Group Size: ${inquiry.pax} Persons
💰 Estimated Budget: NPR ${inquiry.estimatedBudget.toLocaleString()}

Included:
✅ Scorpio Jeep / Deluxe Bus Transport
✅ Standard Room Allocation & Meals
✅ Licensed Tour Guide

Please reply YES to confirm your booking!`;

    navigator.clipboard.writeText(text);
    showToast(`📱 Quotation for ${inquiry.customerName} copied to clipboard for WhatsApp!`);
  };

  const filteredInquiries = inquiries.filter(i => {
    if (statusFilter === 'ALL') return true;
    return i.status === statusFilter;
  });

  const newLeadsCount = inquiries.filter(i => i.status === 'NEW').length;
  const convertedCount = inquiries.filter(i => i.status === 'CONVERTED').length;
  const totalBudget = inquiries.reduce((sum, i) => sum + (i.estimatedBudget || 0), 0);

  const columns: Column<TourInquiry>[] = [
    {
      key: 'id',
      header: 'Inquiry Ref',
      accessor: i => (
        <div>
          <div className="font-extrabold font-mono text-indigo-400">{i.id}</div>
          <div className="text-[10px] text-slate-400">{i.createdAt}</div>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Customer Lead',
      accessor: i => (
        <div>
          <div className="font-bold text-white text-sm">{i.customerName}</div>
          <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-500" />
            {i.contactPhone}
          </div>
        </div>
      )
    },
    {
      key: 'packageName',
      header: 'Interested Package',
      accessor: i => (
        <div>
          <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{i.packageName}</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
            <span>📅 {i.travelDate}</span>
            <span>•</span>
            <span className="font-bold text-slate-300">👥 {i.pax} Pax</span>
          </div>
        </div>
      )
    },
    {
      key: 'estimatedBudget',
      header: 'Budget Quote',
      accessor: i => (
        <div className="font-mono font-bold text-white text-xs">
          NPR {i.estimatedBudget.toLocaleString()}
        </div>
      )
    },
    {
      key: 'source',
      header: 'Lead Source',
      accessor: i => (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
          {i.source}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Inquiry Status',
      accessor: i => (
        <Badge
          variant={
            i.status === 'CONVERTED'
              ? 'success'
              : i.status === 'NEW'
              ? 'danger'
              : i.status === 'QUOTED'
              ? 'info'
              : 'warning'
          }
          dot
        >
          {i.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Quick Action',
      accessor: i => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border-emerald-500/30"
            onClick={() => handleSendWhatsAppQuote(i)}
            title="Copy WhatsApp Quote"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Quote</span>
          </Button>

          {i.status !== 'CONVERTED' && (
            <Button
              size="sm"
              variant="primary"
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              onClick={() => handleConvertToBooking(i)}
            >
              <span>Convert</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            Tour Inquiries & Lead Management Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track incoming WhatsApp, phone & web tour inquiries, send instant quotations & convert leads to bookings
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record New Tour Inquiry</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New Incoming Leads</span>
            <div className="text-xl font-black text-rose-400 mt-1 font-mono">{newLeadsCount} Unanswered Leads</div>
          </div>
          <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Converted to Bookings</span>
            <div className="text-xl font-black text-emerald-400 mt-1 font-mono">{convertedCount} Bookings</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pipeline Value</span>
            <div className="text-xl font-black text-amber-400 mt-1 font-mono">NPR {totalBudget.toLocaleString()}</div>
          </div>
          <DollarSign className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Pipeline Status Filters */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Filter Pipeline:</span>
        {['ALL', 'NEW', 'FOLLOW_UP', 'QUOTED', 'CONVERTED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {st === 'ALL' ? `All Inquiries (${inquiries.length})` : st}
          </button>
        ))}
      </div>

      {/* Main Inquiries Table */}
      <DataTable
        title="Active Tour Inquiry Stream"
        description="Click Quote to copy WhatsApp quotation or Convert to create a confirmed booking"
        data={filteredInquiries as any}
        columns={columns}
        searchPlaceholder="Search by customer lead name, phone number, tour package..."
      />

      {/* Record New Inquiry Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Tour Inquiry"
        description="Enter customer lead details from WhatsApp, phone call, or website inquiry."
        maxWidth="md"
      >
        <form onSubmit={handleCreateInquiry} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Full Name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Nirvik Sapkota"
              required
            />
            <Input
              label="Contact Phone Number"
              value={formPhone}
              onChange={e => setFormPhone(e.target.value)}
              placeholder="e.g. 9841876047"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Interested Tour Package
              </label>
              <select
                value={formPackage}
                onChange={e => setFormPackage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="Sailung–Kalinchowk Tour Package">Sailung–Kalinchowk Tour Package</option>
                <option value="Upper Mustang Jeep Safari">Upper Mustang Jeep Safari</option>
                <option value="Langtang Valley Trek">Langtang Valley Trek</option>
                <option value="Pokhara Sunrise & Peace Pagoda Tour">Pokhara Sunrise & Peace Pagoda Tour</option>
                <option value="Muktinath Darshan">Muktinath Darshan</option>
              </select>
            </div>

            <Input
              label="Preferred Travel Date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              placeholder="e.g. 2026-08-02"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Pax (Group Size)"
              type="number"
              value={formPax}
              onChange={e => setFormPax(Number(e.target.value))}
              required
            />
            <Input
              label="Estimated Budget (NPR)"
              type="number"
              value={formBudget}
              onChange={e => setFormBudget(Number(e.target.value))}
              required
            />
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Inquiry Source
              </label>
              <select
                value={formSource}
                onChange={e => setFormSource(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Website Form">Website Form</option>
                <option value="Viber">Viber</option>
                <option value="B2B Referral">B2B Referral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Inquiry Notes / Customer Requirements
            </label>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="e.g. Requested Scorpio private vehicle, 2 rooms for 7 pax. Advance 5,000 paid."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Save Inquiry
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
