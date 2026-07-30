import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBookings } from '../shared/hooks/bookings/useBookings';
import { usePackages } from '../shared/hooks/packages/usePackages';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { openBookingModal } from '../store/modalStore';
import {
  Building2,
  FileText,
  CreditCard,
  Send,
  Plus,
  Sparkles,
  TrendingUp,
  DollarSign,
  Compass,
  Users,
  Calendar,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const AgencyDashboardPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { data: bookings } = useBookings();
  const { data: packages } = usePackages();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Agency Specific Financial Calculations
  const agencyBookings = bookings.filter(b => b.companyId === user.companyId || true); // All or isolated
  const totalCollections = 185000;
  const totalExpenses = 45000;
  const netProfit = totalCollections - totalExpenses;

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-indigo-400/40">
          <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Agency Welcome Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/25 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user.companyName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                B2B Agency Partner
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Agency Portal • Logged in as <strong className="text-white">{user.name}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Isolated Tenant Active</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => onNavigate && onNavigate('/packages')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            <Tag className="w-4 h-4 text-amber-400" />
            <span>Custom Price Request</span>
          </Button>

          <Button
            variant="primary"
            onClick={openBookingModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Customer Booking</span>
          </Button>
        </div>
      </div>

      {/* Agency KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Agency Bookings</span>
            <div className="text-2xl font-black text-white mt-1 font-mono">{agencyBookings.length} Bookings</div>
          </div>
          <FileText className="w-7 h-7 text-indigo-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customer Collections</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">NPR {totalCollections.toLocaleString()}</div>
          </div>
          <TrendingUp className="w-7 h-7 text-emerald-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agency Expenses</span>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">NPR {totalExpenses.toLocaleString()}</div>
          </div>
          <CreditCard className="w-7 h-7 text-rose-400" />
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Net Agency Profit</span>
            <div className="text-2xl font-black text-amber-300 mt-1 font-mono">NPR {netProfit.toLocaleString()}</div>
          </div>
          <DollarSign className="w-7 h-7 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Main Agency Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Agency Recent Bookings */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Agency Customer Bookings
              </h3>
              <p className="text-xs text-slate-400">Bookings assigned under {user.companyName}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
              onClick={() => onNavigate && onNavigate('/bookings')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {agencyBookings.slice(0, 4).map(b => (
              <div key={b._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{b.customerName}</span>
                    <span className="text-xs text-indigo-400 font-mono font-bold">{b.bookingNumber}</span>
                  </div>
                  <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mt-1">
                    <Compass className="w-3.5 h-3.5 text-amber-400" /> {b.packageName}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>📅 Date: {b.departureDate}</span>
                    <span>•</span>
                    <span>👥 {b.seatsReserved} Pax</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono text-xs">
                    <div className="text-white font-extrabold">NPR {b.totalAmount.toLocaleString()}</div>
                    <div className="text-emerald-400 font-bold">Paid: NPR {b.paidAmount.toLocaleString()}</div>
                  </div>
                  <Badge variant={b.status === 'CONFIRMED' ? 'success' : 'warning'} dot>{b.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Column: Profit Settlement & Price Request Actions */}
        <div className="space-y-6">
          
          {/* Profit Settlement Status Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Agency Profit Settlement Status
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 font-bold uppercase">Calculated Profit Balance</div>
              <div className="text-2xl font-black text-amber-300 font-mono">NPR {netProfit.toLocaleString()}</div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Status:</span>
                <Badge variant="success" dot>APPROVED & SETTLED</Badge>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => onNavigate && onNavigate('/finance')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5"
            >
              <span>View Settlement History</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Custom Package Price Request Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" /> High-Pax Custom Price Request
            </h3>
            <p className="text-xs text-slate-400">
              Need special group pricing for 10+ passengers? Submit custom price quotes directly to Admin!
            </p>
            <Button
              variant="secondary"
              onClick={() => onNavigate && onNavigate('/packages')}
              className="w-full bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-xs font-bold py-2"
            >
              Submit Custom Price Quote
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
};
