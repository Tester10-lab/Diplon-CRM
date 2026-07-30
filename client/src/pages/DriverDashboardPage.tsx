import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { DriverTripSettlement } from '../types/erp';
import { Car, Compass, Calendar, Users, Phone, DollarSign, Send, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, Clock, MapPin, Fuel, Utensils, Hotel, AlertCircle, ArrowRight } from 'lucide-react';

const DRIVER_PASSENGERS = [
  { id: '1', name: 'Chandra man Maharjan', phone: '9802100125 / 9843500017', pax: 25, pickup: 'Shangri-la Hotel (06:00 AM)', rooms: '28-Seater Sofa Bus (25 Pax)', advancePaid: 2500, dueOnArrival: 85000 },
  { id: '2', name: 'Tarak Panja', phone: '9841142416', pax: 6, pickup: 'New Road Angan Sweets (06:30 AM)', rooms: '6 Pax Private (2 rooms)', advancePaid: 0, dueOnArrival: 34000 }
];

export const DriverDashboardPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();

  // Trip Duration & Itemized Expenses Breakdown
  const [tripDurationDays, setTripDurationDays] = useState<number>(2);
  const [lunchPerDay, setLunchPerDay] = useState<number>(1500);
  const [hotelPerNight, setHotelPerNight] = useState<number>(2500);
  const [vehicleRentPerDay, setVehicleRentPerDay] = useState<number>(6250);
  const [tripCollections, setTripCollections] = useState<number>(38500);

  // Auto-calculated itemized expenses based on trip duration
  const totalLunch = lunchPerDay * tripDurationDays;
  const totalHotel = hotelPerNight * Math.max(1, tripDurationDays - 1);
  const totalVehicleRent = vehicleRentPerDay * tripDurationDays;
  const totalTripExpenses = totalLunch + totalHotel + totalVehicleRent;

  // Net Balance = Collections - Expenses
  const netBalance = tripCollections - totalTripExpenses;

  const [settlementRequests, setSettlementRequests] = useState<DriverTripSettlement[]>([
    {
      id: 'DTRIP-701',
      driverId: user.userId,
      driverName: user.name,
      tourName: 'Sailung–Kalinchowk Tour Package',
      travelDate: '2026-08-02',
      totalCollected: 38500,
      totalExpenses: 18000,
      netBalance: 20500,
      requestType: 'CASH_SUBMISSION',
      requestedAmount: 20500,
      status: 'PENDING',
      notes: 'Submitting cash collected on tour (38,500) after deducting 2 days expenses (Lunch: 3,000, Hotel: 2,500, Vehicle Rent: 12,500).',
      createdAt: '2026-07-28 13:00'
    }
  ]);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqNotes, setReqNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const pendingUnclearedSettlement = settlementRequests.find(s => s.status === 'PENDING');
  const isUnclearedCash = netBalance > 0 && !!pendingUnclearedSettlement;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDriverSubmitSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const isProfit = netBalance >= 0;
    const newReq: DriverTripSettlement = {
      id: `DTRIP-${Math.floor(100 + Math.random() * 900)}`,
      driverId: user.userId,
      driverName: user.name,
      tourName: 'Sailung–Kalinchowk Tour Package',
      travelDate: '2026-08-02',
      totalCollected: tripCollections,
      totalExpenses: totalTripExpenses,
      netBalance: netBalance,
      requestType: isProfit ? 'CASH_SUBMISSION' : 'REIMBURSEMENT_PAYMENT',
      requestedAmount: Math.abs(netBalance),
      status: 'PENDING',
      notes: reqNotes || `Duration: ${tripDurationDays} Days. Itemized: Lunch (NPR ${totalLunch.toLocaleString()}), Hotel (NPR ${totalHotel.toLocaleString()}), Vehicle Rent (NPR ${totalVehicleRent.toLocaleString()}).`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSettlementRequests(prev => [newReq, ...prev]);
    setIsRequestModalOpen(false);
    showToast(`✨ Driver Trip Settlement submitted to Admin for approval!`);
  };

  const handleClearSettlement = (id: string) => {
    setSettlementRequests(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
    showToast(`🟢 Driver cash settlement cleared & marked as APPROVED by Admin!`);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-amber-300">
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 🚨 UNCLEARED CASH PAYMENT REMINDER BANNER (RED UNTIL CLEARED) */}
      {isUnclearedCash ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/60 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-600/40">
              <AlertTriangle className="w-7 h-7 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-sm">
                  🔴 UNCLEARED CASH PAYMENT REMINDER
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  Ref: {pendingUnclearedSettlement.id}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-1">
                Driver Cash Deposit Due: <span className="text-amber-300 font-mono text-lg">NPR {netBalance.toLocaleString()}</span>
              </h2>
              <p className="text-xs text-rose-200 mt-0.5">
                On-tour cash collected ({tripCollections.toLocaleString()}) minus trip expenses ({totalTripExpenses.toLocaleString()}) is pending Admin clearance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              onClick={() => handleClearSettlement(pendingUnclearedSettlement.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Clear & Approve Cash (Admin)</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>🟢 All Driver Cash Accounts & Trip Settlements Cleared!</span>
        </div>
      )}

      {/* Driver Welcome Hero Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-lg shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                SCORPIO S.N. #{user.driverSn || 4}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Assigned Scorpio: <strong className="text-amber-300">{user.assignedVehicleReg || 'Ba 21 Ch 4501'}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Status: Active Duty</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Calculate Trip P&L</span>
          </Button>
        </div>
      </div>

      {/* Driver Financial Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cash Collected on Tour</span>
            <div className="text-xl font-black text-emerald-400 mt-1 font-mono">+ NPR {tripCollections.toLocaleString()}</div>
          </div>
          <DollarSign className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Itemized Trip Expenses</span>
            <div className="text-xl font-black text-rose-400 mt-1 font-mono">- NPR {totalTripExpenses.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Duration: {tripDurationDays} Days</div>
          </div>
          <Fuel className="w-6 h-6 text-rose-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expense Breakdown</span>
            <div className="text-[11px] text-slate-300 font-mono space-y-0.5 mt-1">
              <div>🍱 Lunch: NPR {totalLunch.toLocaleString()}</div>
              <div>🏨 Hotel: NPR {totalHotel.toLocaleString()}</div>
              <div>🚘 Rent: NPR {totalVehicleRent.toLocaleString()}</div>
            </div>
          </div>
          <Utensils className="w-5 h-5 text-amber-400" />
        </div>

        <div className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between transition-all ${
          isUnclearedCash
            ? 'bg-rose-950/80 border-rose-500/80'
            : 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500/40'
        }`}>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isUnclearedCash ? 'text-rose-300' : 'text-emerald-300'}`}>
              Net Driver Balance
            </span>
            <div className={`text-2xl font-black mt-1 font-mono ${isUnclearedCash ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
              NPR {netBalance.toLocaleString()}
            </div>
            <div className="text-[10px] font-extrabold mt-0.5">
              {isUnclearedCash ? (
                <span className="text-rose-400 uppercase">🔴 UNCLEARED CASH DUE</span>
              ) : (
                <span className="text-emerald-400 uppercase">🟢 CLEARED & SETTLED</span>
              )}
            </div>
          </div>
          <ShieldCheck className={`w-7 h-7 ${isUnclearedCash ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
        </div>
      </div>

      {/* Active Assigned Tour & Passenger Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Assigned Tour Details */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" /> Active Tour Departure
            </h3>
            <Badge variant="success" dot>Dispatched</Badge>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold uppercase">Tour Package</div>
              <div className="text-sm font-extrabold text-amber-300">Sailung–Kalinchowk Tour Package</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold uppercase">Trip Duration</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {tripDurationDays} Days (2nd Aug – 4th Aug 2026)
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold uppercase">Assigned Scorpio Jeep</div>
              <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-400" /> Ba 21 Ch 4501 (Scorpio S.N. #4)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Passengers Roster */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Assigned Passenger Roster
            </h3>
            <span className="text-xs font-bold text-slate-400 font-mono">7 Passengers Assigned</span>
          </div>

          <div className="space-y-3">
            {DRIVER_PASSENGERS.map(p => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{p.name}</span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      👥 {p.pax} Pax
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Pickup: <strong className="text-slate-200">{p.pickup}</strong></span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    🏨 Room Note: <span className="text-indigo-300 font-semibold">{p.rooms}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono text-xs">
                    <div className="text-emerald-400 font-bold">Paid: NPR {p.advancePaid.toLocaleString()}</div>
                    <div className="text-rose-400 font-bold">Due: NPR {p.dueOnArrival.toLocaleString()}</div>
                  </div>

                  <a
                    href={`https://wa.me/977${p.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1 text-xs font-bold border border-emerald-500/30"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Passenger
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Driver Trip Settlement History Stream */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-400" /> Driver Trip Settlement & Cash Audit History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Tour Package</th>
                <th className="p-3">Cash Collected</th>
                <th className="p-3">Itemized Expenses (Lunch, Hotel, Rent)</th>
                <th className="p-3">Net Balance</th>
                <th className="p-3">Cash Payment Status</th>
                <th className="p-3">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {settlementRequests.map(s => (
                <tr key={s.id} className={`transition-all ${s.status === 'PENDING' ? 'bg-rose-950/20' : 'hover:bg-slate-800/40'}`}>
                  <td className="p-3 font-bold text-amber-400">{s.id}</td>
                  <td className="p-3 font-sans text-white font-semibold">{s.tourName}</td>
                  <td className="p-3 text-emerald-400 font-bold">+ NPR {s.totalCollected.toLocaleString()}</td>
                  <td className="p-3 text-rose-400 font-bold">- NPR {s.totalExpenses.toLocaleString()}</td>
                  <td className="p-3 text-amber-300 font-bold">NPR {s.netBalance.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                      s.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}>
                      {s.status === 'APPROVED' ? '🟢 CLEARED & PAID' : '🔴 UNCLEARED CASH DUE'}
                    </span>
                  </td>
                  <td className="p-3">
                    {s.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1"
                        onClick={() => handleClearSettlement(s.id)}
                      >
                        Clear Cash
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Driver Settlement Calculation Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Driver Trip Expense & Cash Settlement Calculator"
        description="Calculate trip expenses based on trip duration (Days) and submit net balance to Admin."
        maxWidth="lg"
      >
        <form onSubmit={handleDriverSubmitSettlement} className="space-y-5">
          
          {/* Trip Duration & Collection Input */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <Input
              label="Trip Duration (Days)"
              type="number"
              min={1}
              value={tripDurationDays}
              onChange={e => setTripDurationDays(Math.max(1, Number(e.target.value)))}
              required
            />
            <Input
              label="On-Tour Cash Collected (NPR)"
              type="number"
              value={tripCollections}
              onChange={e => setTripCollections(Number(e.target.value))}
              required
            />
          </div>

          {/* Itemized Expense Rates per Duration */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4" /> Itemized Expenses According to Trip Duration ({tripDurationDays} Days)
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Input
                  label="Lunch / Food Daily (NPR)"
                  type="number"
                  value={lunchPerDay}
                  onChange={e => setLunchPerDay(Number(e.target.value))}
                />
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Subtotal: <strong className="text-rose-400">NPR {totalLunch.toLocaleString()}</strong> ({tripDurationDays}d)
                </div>
              </div>

              <div>
                <Input
                  label="Hotel Stay / Night (NPR)"
                  type="number"
                  value={hotelPerNight}
                  onChange={e => setHotelPerNight(Number(e.target.value))}
                />
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Subtotal: <strong className="text-rose-400">NPR {totalHotel.toLocaleString()}</strong> ({Math.max(1, tripDurationDays - 1)}n)
                </div>
              </div>

              <div>
                <Input
                  label="Vehicle Rent / Fuel / Day (NPR)"
                  type="number"
                  value={vehicleRentPerDay}
                  onChange={e => setVehicleRentPerDay(Number(e.target.value))}
                />
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Subtotal: <strong className="text-rose-400">NPR {totalVehicleRent.toLocaleString()}</strong> ({tripDurationDays}d)
                </div>
              </div>
            </div>
          </div>

          {/* Net Calculation Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-slate-400">Total Cash Collected:</span>
              <span className="text-emerald-400">+ NPR {tripCollections.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-slate-400">Total Trip Expenses (Lunch + Hotel + Rent):</span>
              <span className="text-rose-400">- NPR {totalTripExpenses.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300 uppercase">Calculated Net Settlement Balance</div>
                <div className="text-[10px] text-slate-400">
                  {netBalance >= 0 ? '💰 Driver gives surplus cash to Admin' : '⚠️ Admin reimburses driver for expenses'}
                </div>
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                NPR {netBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Driver Settlement Notes & Bill Remarks
            </label>
            <textarea
              value={reqNotes}
              onChange={e => setReqNotes(e.target.value)}
              placeholder="e.g. Attached fuel receipts NPR 12,500, hotel bill NPR 2,500, lunch receipts NPR 3,000."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              Submit P&L Settlement to Admin
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
