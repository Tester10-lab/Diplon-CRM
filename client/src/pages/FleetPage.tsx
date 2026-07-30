import React, { useState, useMemo } from 'react';
import { useFleet, useDrivers, useDepartures } from '../shared/hooks/operations/useOperations';
import { useBookings } from '../shared/hooks/bookings/useBookings';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { getScorpioAssignments, saveScorpioAssignments, ScorpioAssignment } from '../features/fleet/scorpioStore';
import { Car, Plus, Download, Copy, Check, Search, CheckCircle2, ShieldCheck, UserCheck, Phone, Bed, Users, Sparkles, Layers, LayoutGrid, Table, Send, UserPlus, AlertCircle, Lock, ShieldAlert, X, Calendar, Filter } from 'lucide-react';

export const FleetPage: React.FC = () => {
  const { data: vehicles, isLoading, error } = useFleet();
  const { data: driverList } = useDrivers();
  const { data: departures } = useDepartures();
  const { data: bookings } = useBookings();

  const [activeTab, setActiveTab] = useState<'SCORPIO_ROSTER' | 'FLEET_CATALOG'>('SCORPIO_ROSTER');
  const [viewStyle, setViewStyle] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Scorpio Assignments State
  const [scorpioData, setScorpioData] = useState<ScorpioAssignment[]>(getScorpioAssignments());
  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State for + Assign Scorpio
  const [formTour, setFormTour] = useState('Sailung–Kalinchowk Tour Package');
  const [formDate, setFormDate] = useState('2026-08-02');
  const [formSN, setFormSN] = useState<number>(14);
  const [formDriver, setFormDriver] = useState('');
  const [formPax, setFormPax] = useState<number>(7);
  const [formRooms, setFormRooms] = useState('2');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formContactNumber, setFormContactNumber] = useState('');
  const [formIsPrivate, setFormIsPrivate] = useState<boolean>(false);

  // Guest Searchable Type-and-Select State
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [filterOnlySelectedTourGuests, setFilterOnlySelectedTourGuests] = useState<boolean>(true);

  // ALL HOOKS MUST BE DECLARED TOP-LEVEL BEFORE CONDITIONAL RETURNS
  const filteredBookedGuests = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) return [];
    
    // 1. Filter by selected tour package if toggle is ON
    let list = bookings;
    if (filterOnlySelectedTourGuests && formTour) {
      const tourLower = formTour.toLowerCase();
      const tourSpecific = bookings.filter(b => 
        b.packageName && (
          b.packageName.toLowerCase().includes(tourLower) ||
          tourLower.includes(b.packageName.toLowerCase()) ||
          (tourLower.includes('sailung') && b.packageName.toLowerCase().includes('sailung')) ||
          (tourLower.includes('mustang') && b.packageName.toLowerCase().includes('mustang'))
        )
      );

      // If matches exist for this tour, show them; otherwise fallback to full list
      if (tourSpecific.length > 0) {
        list = tourSpecific;
      }
    }

    // 2. Filter by search query text
    if (!guestSearchQuery.trim()) return list;
    const q = guestSearchQuery.toLowerCase();
    return list.filter(b => 
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.contactPhone && b.contactPhone.includes(q)) ||
      (b.customerPhone && b.customerPhone.includes(q)) ||
      (b.packageName && b.packageName.toLowerCase().includes(q))
    );
  }, [bookings, formTour, filterOnlySelectedTourGuests, guestSearchQuery]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => {}} />;

  // Dynamic Lists for Dropdowns
  const tourOptions = Array.from(
    new Set([
      'Sailung–Kalinchowk Tour Package',
      'Upper Mustang',
      'Langtang Valley Trek',
      'Pokhara Sunrise & Peace Pagoda Tour',
      'Muktinath Darshan',
      ...(departures || []).map(d => d.packageName)
    ])
  );

  const defaultDrivers = [
    'Pradip Bhai',
    'Surendra Bhai',
    'Aakash Bhujel',
    'Suman Dai (9851090895)',
    'Shankar Bhai',
    'Manish Bhai',
    'Ramesh Dai (Dekohali)',
    'Rojit Dai',
    'muktinath tour',
    'Rajan Saju /',
    'Sabin Dai'
  ];
  const driverOptions = Array.from(new Set([...defaultDrivers, ...(driverList || []).map(d => d.name)]));

  // Filtered Scorpio List
  const tourList = Array.from(new Set(scorpioData.map(s => s.tour)));
  const filteredScorpio = scorpioData.filter(s => {
    const matchesTour = selectedTourFilter === 'ALL' || s.tour.toLowerCase() === selectedTourFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      s.driver.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.number.toLowerCase().includes(query) ||
      s.tour.toLowerCase().includes(query);
    return matchesTour && matchesSearch;
  });

  // Group Scorpio rows by SN (Vehicle #)
  const jeepsMap = new Map<number, ScorpioAssignment[]>();
  filteredScorpio.forEach(item => {
    if (!jeepsMap.has(item.sn)) jeepsMap.set(item.sn, []);
    jeepsMap.get(item.sn)!.push(item);
  });

  const jeepsList = Array.from(jeepsMap.entries()).sort((a, b) => a[0] - b[0]);

  const totalScorpioJeeps = jeepsMap.size;
  const totalPaxCount = filteredScorpio.reduce((sum, s) => sum + (s.pax || 0), 0);

  // Check if current formSN is already a Private Tour Jeep with an existing group
  const existingJeepGroups = scorpioData.filter(s => s.sn === formSN);
  const isJeepPrivateBlocked = existingJeepGroups.some(g => g.isPrivate) && existingJeepGroups.length >= 1;

  // Handle Driver Change & Auto-Calculate Scorpio S.N. Number
  const handleSelectDriver = (driverName: string) => {
    setFormDriver(driverName);
    
    const existingDriverAssignment = scorpioData.find(
      s => s.driver.toLowerCase().trim() === driverName.toLowerCase().trim()
    );

    if (existingDriverAssignment) {
      setFormSN(existingDriverAssignment.sn);
      if (existingDriverAssignment.tour) setFormTour(existingDriverAssignment.tour);
      if (existingDriverAssignment.date) setFormDate(existingDriverAssignment.date);
      showToast(`⚡ Driver ${driverName} automatically linked to Scorpio Jeep #${existingDriverAssignment.sn}!`);
    } else {
      const maxSN = scorpioData.length > 0 ? Math.max(...scorpioData.map(s => s.sn)) : 0;
      setFormSN(maxSN + 1);
    }
  };

  // Handle Guest Selection from Search Dropdown
  const handleSelectGuest = (booking: any) => {
    setFormCustomerName(booking.customerName);
    setFormContactNumber(booking.contactPhone || booking.customerPhone || '');
    setFormPax(booking.seatsReserved || booking.pax || 7);
    if (booking.roomDetails) setFormRooms(booking.roomDetails);
    if (booking.packageName) setFormTour(booking.packageName);
    if (booking.departureDate) setFormDate(booking.departureDate);
    if (booking.groupType === 'private') setFormIsPrivate(true);
    setGuestSearchQuery(`${booking.customerName} (${booking.contactPhone || 'No Phone'})`);
    setIsGuestDropdownOpen(false);
    showToast(`✨ Selected guest ${booking.customerName}`);
  };

  const handleCreateScorpio = (e: React.FormEvent) => {
    e.preventDefault();
    if (isJeepPrivateBlocked) return;
    if (!formDriver.trim() && !formCustomerName.trim()) return;

    const newAssignment: ScorpioAssignment = {
      id: `scp_${Date.now()}`,
      tour: formTour,
      date: formDate,
      sn: formSN,
      driver: formDriver || 'Unassigned Driver',
      pax: formPax,
      rooms: formRooms,
      name: formCustomerName || 'Guest Group',
      number: formContactNumber || '-',
      isPrivate: formIsPrivate
    };

    const updated = [...scorpioData, newAssignment];
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    setIsAddModalOpen(false);
    showToast(`✅ Scorpio Jeep #${formSN} (${formDriver}) assigned for ${formTour}!`);
  };

  const handleDriverChange = (id: string, newDriver: string) => {
    const updated = scorpioData.map(item => item.id === id ? { ...item, driver: newDriver } : item);
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    showToast(`✅ Updated driver to ${newDriver}`);
  };

  const handleToggleJeepPrivate = (sn: number) => {
    const updated = scorpioData.map(item => item.sn === sn ? { ...item, isPrivate: !item.isPrivate } : item);
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    showToast(`🔒 Scorpio Jeep #${sn} Private Tour status updated!`);
  };

  const handleExportCSV = () => {
    const headers = ['Tour', 'Date', 'S.N.', 'Driver', 'Pax', 'Rooms', 'Customer Name', 'Contact Number', 'Is Private'];
    const rows = filteredScorpio.map(s => [
      `"${s.tour}"`,
      `"${s.date || '2026-08-02'}"`,
      s.sn,
      `"${s.driver}"`,
      s.pax,
      `"${s.rooms}"`,
      `"${s.name}"`,
      `"${s.number}"`,
      s.isPrivate ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Scorpio_Jeep_Assignment_Roster_2025.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`📥 Exported Scorpio Assignment Roster to CSV!`);
  };

  const handleCopyWhatsAppRoster = () => {
    const text = `🚌 SCORPIO JEEP DISPATCH ROSTER (${selectedTourFilter})
------------------------------------------------
` + filteredScorpio.map(s => 
      `Jeep #${s.sn}${s.isPrivate ? ' [PRIVATE]' : ''} | Date: ${s.date || '2026-08-02'} | Driver: ${s.driver} | Pax: ${s.pax} | Rooms: ${s.rooms} | Guest: ${s.name} (${s.number})`
    ).join('\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    showToast('📋 WhatsApp Scorpio Roster copied to clipboard!');
  };

  const handleSendDriverDispatchSMS = (sn: number, items: ScorpioAssignment[]) => {
    const mainDriver = items[0]?.driver || 'Driver';
    const tourName = items[0]?.tour || 'Tour';
    const travelDate = items[0]?.date || '2026-08-02';
    const isPrivate = items.some(it => it.isPrivate);
    const text = `🚕 DISPATCH ORDER FOR SCORPIO #${sn} (${mainDriver}) ${isPrivate ? '[PRIVATE TOUR]' : ''}
Tour: ${tourName}
Travel Date: ${travelDate}
------------------------------------
` + items.map((it, i) => `${i + 1}. Guest: ${it.name} | Pax: ${it.pax} | Rooms: ${it.rooms} | Phone: ${it.number}`).join('\n') + `
------------------------------------
Please report to Kathmandu Departure Spot by 06:00 AM!`;

    navigator.clipboard.writeText(text);
    showToast(`📱 Driver Dispatch Order for Jeep #${sn} (${mainDriver}) copied for WhatsApp!`);
  };

  // Fleet Catalog Columns
  const vehicleColumns: Column<VehicleData>[] = [
    {
      key: 'name',
      header: 'Vehicle Model & Name',
      accessor: v => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{v.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">ID: {v._id}</div>
        </div>
      )
    },
    {
      key: 'registrationNumber',
      header: 'Registration No.',
      accessor: v => <span className="font-extrabold font-mono text-indigo-600 dark:text-indigo-400">{v.registrationNumber}</span>
    },
    {
      key: 'seatingCapacity',
      header: 'Seating Capacity',
      accessor: v => <span className="font-semibold">{v.seatingCapacity} Passenger Seats</span>
    },
    {
      key: 'status',
      header: 'Status & Availability',
      accessor: v => (
        <div className="flex items-center gap-2">
          <Badge variant={v.status === 'Active' ? 'success' : 'neutral'} dot>{v.status}</Badge>
          <Badge variant={v.availability ? 'info' : 'warning'}>{v.availability ? 'Available' : 'Assigned'}</Badge>
        </div>
      )
    },
    {
      key: 'bluebookExpiry',
      header: 'Document Expiries',
      accessor: v => (
        <div className="text-[11px] space-y-0.5 text-slate-500">
          <div>Bluebook: <span className="font-semibold text-slate-700 dark:text-slate-300">{v.bluebookExpiry}</span></div>
          <div>Insurance: <span className="font-semibold text-slate-700 dark:text-slate-300">{v.insuranceExpiry}</span></div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-amber-300">
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Controls & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-400" />
            Scorpio Fleet & Driver Assignment Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tour package guest filter, departure date scheduling & driver jeep S.N. auto-link
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center text-xs">
          <button
            onClick={() => setActiveTab('SCORPIO_ROSTER')}
            className={`px-4 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'SCORPIO_ROSTER'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            🚙 Scorpio Assignment Command
          </button>
          <button
            onClick={() => setActiveTab('FLEET_CATALOG')}
            className={`px-4 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'FLEET_CATALOG'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            🚌 Vehicle Catalog
          </button>
        </div>
      </div>

      {activeTab === 'SCORPIO_ROSTER' ? (
        <div className="space-y-6">
          
          {/* Action & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            
            {/* Tour Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Tour:</span>
              <button
                onClick={() => setSelectedTourFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTourFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All Tours ({scorpioData.length})
              </button>
              {tourList.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTourFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTourFilter === t
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* View Layout Switcher (CARDS vs TABLE) + Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Card / Table Toggle */}
              <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center text-xs">
                <button
                  onClick={() => setViewStyle('CARDS')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    viewStyle === 'CARDS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Visual Cards Deck
                </button>
                <button
                  onClick={() => setViewStyle('TABLE')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    viewStyle === 'TABLE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  Excel Roster Table
                </button>
              </div>

              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search driver, guest..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5 text-amber-400" />}
                onClick={handleCopyWhatsAppRoster}
              >
                {isCopied ? 'Copied!' : 'Copy Roster'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5 text-emerald-400" />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                + Assign Scorpio
              </Button>
            </div>
          </div>

          {/* Metric Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scorpio Jeeps Assigned</span>
                <div className="text-xl font-black text-amber-400 mt-1 font-mono">{totalScorpioJeeps} Scorpios</div>
              </div>
              <Car className="w-5 h-5 text-amber-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Passengers (Pax)</span>
                <div className="text-xl font-black text-white mt-1 font-mono">{totalPaxCount} Pax</div>
              </div>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Room Allocations</span>
                <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                  {filteredScorpio.length} Groups Assigned
                </div>
              </div>
              <Bed className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* VIEW STYLE 1: Visual Scorpio Vehicle Cards Deck */}
          {viewStyle === 'CARDS' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jeepsList.map(([sn, items]) => {
                const totalJeepPax = items.reduce((sum, it) => sum + (it.pax || 0), 0);
                const capacity = 7;
                const occupancyPercent = Math.min(100, Math.round((totalJeepPax / capacity) * 100));
                const mainDriver = items[0]?.driver || 'Unassigned';
                const tourName = items[0]?.tour || 'Upper Mustang';
                const travelDate = items[0]?.date || '2026-08-02';
                const isPrivateJeep = items.some(it => it.isPrivate);

                return (
                  <div
                    key={sn}
                    className={`p-5 rounded-3xl bg-slate-900/90 border ${
                      isPrivateJeep ? 'border-amber-500/70 shadow-amber-500/10' : 'border-slate-800 hover:border-indigo-500/40'
                    } transition-all duration-200 shadow-xl space-y-4 relative overflow-hidden group`}
                  >
                    {/* Top Jeep Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 font-mono text-sm">
                          #{sn}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm flex items-center gap-2">
                            <span>Scorpio Jeep #{sn}</span>
                            {isPrivateJeep && (
                              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> PRIVATE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                            <span>{tourName}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-indigo-300 font-mono flex items-center gap-0.5">
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              {travelDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Private Toggle Button */}
                        <button
                          onClick={() => handleToggleJeepPrivate(sn)}
                          className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isPrivateJeep
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                          title="Toggle Private Tour Group Protection"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp Dispatch Button */}
                        <button
                          onClick={() => handleSendDriverDispatchSMS(sn, items)}
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all text-xs font-bold flex items-center gap-1"
                          title="Copy Driver WhatsApp Dispatch Message"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                      </div>
                    </div>

                    {/* Driver Re-Assignment Selector */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Assigned Driver</span>
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      </label>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-indigo-300 truncate">{mainDriver}</span>
                        <select
                          value={mainDriver}
                          onChange={(e) => handleDriverChange(items[0]?.id, e.target.value)}
                          className="bg-slate-900 text-xs border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                        >
                          <option value={mainDriver}>{mainDriver}</option>
                          {driverOptions.map(drv => (
                            <option key={drv} value={drv}>{drv}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Passenger Occupancy Gauge Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Occupancy ({totalJeepPax} Pax)</span>
                        <span className={`font-mono font-bold ${totalJeepPax > capacity ? 'text-rose-400' : totalJeepPax === capacity ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {totalJeepPax} / {capacity} Seats ({occupancyPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            totalJeepPax > capacity ? 'bg-rose-500' : totalJeepPax === capacity ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                      {isPrivateJeep && (
                        <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 pt-0.5">
                          <Lock className="w-3 h-3 text-amber-400" /> Private Group Reserved — No additional groups allowed
                        </div>
                      )}
                    </div>

                    {/* Assigned Guests & Rooms List */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Assigned Guests & Rooms</span>
                      <div className="space-y-2">
                        {items.map(it => (
                          <div key={it.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{it.name}</span>
                                {it.pax > 0 && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">{it.pax} Pax</span>}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                {it.number}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                                🛏 {it.rooms} Rooms
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW STYLE 2: Detailed Excel Roster Table */
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-300 font-extrabold uppercase tracking-wider">
                      <th className="p-3 border-r border-slate-800/80 text-center w-36">tour</th>
                      <th className="p-3 border-r border-slate-800/80 text-center w-28">date</th>
                      <th className="p-3 border-r border-slate-800/80 text-center w-16">S.N.</th>
                      <th className="p-3 border-r border-slate-800/80">driver</th>
                      <th className="p-3 border-r border-slate-800/80 text-center w-20">Pax</th>
                      <th className="p-3 border-r border-slate-800/80 text-center w-24">Rooms</th>
                      <th className="p-3 border-r border-slate-800/80">name</th>
                      <th className="p-3">number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredScorpio.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors border-b border-slate-800/40">
                        <td className="p-3 font-extrabold text-amber-400 border-r border-slate-800/60 text-center uppercase tracking-tight">
                          <div className="flex items-center justify-center gap-1">
                            {row.isPrivate && <Lock className="w-3 h-3 text-amber-400" />}
                            <span>{row.tour}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center border-r border-slate-800/60 font-mono text-slate-300 font-semibold">{row.date || '2026-08-02'}</td>
                        <td className="p-3 font-mono font-black text-white text-center border-r border-slate-800/60 text-sm">{row.sn}</td>
                        <td className="p-3 font-bold text-slate-100 border-r border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{row.driver}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-extrabold text-emerald-400 text-center border-r border-slate-800/60 text-sm">{row.pax > 0 ? row.pax : '-'}</td>
                        <td className="p-3 text-center border-r border-slate-800/60 font-semibold text-slate-300">
                          {row.rooms !== '-' ? <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">{row.rooms}</span> : '-'}
                        </td>
                        <td className="p-3 font-bold text-white border-r border-slate-800/60">{row.name}</td>
                        <td className="p-3 font-mono text-slate-300 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{row.number}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Scorpio Assignment Modal with Departure Date at Top & Tour Specific Guest Filter */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Assign Scorpio Jeep & Driver"
            description="Select tour package, set travel date, filter guest pipeline for that tour, and assign driver & rooms."
            maxWidth="md"
          >
            <form onSubmit={handleCreateScorpio} className="space-y-4">
              
              {/* TOP ROW: Scheduled Tour Name & Departure Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Scheduled Tour Name
                  </label>
                  <select
                    value={formTour}
                    onChange={e => setFormTour(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    required
                  >
                    {tourOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Departure / Travel Date"
                  icon={<Calendar className="w-4 h-4" />}
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  placeholder="e.g. 2026-08-02 / 2nd Aug"
                  required
                />
              </div>

              {/* Driver Select (Auto Updates Scorpio S.N. #) & Scorpio S.N. # */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Assigned Driver
                  </label>
                  <select
                    value={formDriver}
                    onChange={e => handleSelectDriver(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    required
                  >
                    <option value="">-- Select Driver --</option>
                    {driverOptions.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Scorpio S.N. #"
                  type="number"
                  value={formSN}
                  onChange={e => setFormSN(Number(e.target.value))}
                  helperText="Auto-linked by Driver"
                  required
                />
              </div>

              {/* Searchable Type & Filter Guest Input (Package Specific Filter) */}
              <div className="space-y-1.5 bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-500/30 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    Type & Search Guest Bookings
                  </label>
                  
                  {/* Toggle: Filter only selected tour guests */}
                  <button
                    type="button"
                    onClick={() => setFilterOnlySelectedTourGuests(!filterOnlySelectedTourGuests)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1 ${
                      filterOnlySelectedTourGuests
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    {filterOnlySelectedTourGuests ? `Filter: ${formTour.split(' ')[0]} Only` : 'Show All Guests'}
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={guestSearchQuery}
                    onFocus={() => setIsGuestDropdownOpen(true)}
                    onChange={e => {
                      setGuestSearchQuery(e.target.value);
                      setIsGuestDropdownOpen(true);
                    }}
                    placeholder={`Type guest name for ${formTour.split(' ')[0]}...`}
                    className="w-full bg-slate-900 text-amber-300 font-bold border border-indigo-500/40 rounded-xl pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {guestSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setGuestSearchQuery('');
                        setIsGuestDropdownOpen(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Overlay with Matching Package Guests */}
                {isGuestDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-800 animate-fade-in">
                    {filteredBookedGuests.length > 0 ? (
                      filteredBookedGuests.map(b => (
                        <div
                          key={b._id || b.id}
                          onClick={() => handleSelectGuest(b)}
                          className="p-2.5 hover:bg-indigo-600/30 cursor-pointer text-xs transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{b.customerName}</span>
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                                {b.packageName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              📞 {b.contactPhone || b.customerPhone || 'No Phone'}
                            </div>
                          </div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                            {b.seatsReserved || b.pax || 1} Pax
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-400 text-center">
                        No guest bookings found matching "{formTour}". Click "Show All Guests" above or type manually below.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Private Tour Group Toggle Button */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Private Tour Group Only
                  </div>
                  <div className="text-[11px] text-slate-400">If enabled, no other customer groups can be added to Jeep #{formSN}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsPrivate(!formIsPrivate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                    formIsPrivate
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {formIsPrivate ? '🔒 Private ON' : '👥 Sharing Tour'}
                </button>
              </div>

              {/* Warning Banner if current Jeep S.N. is already Private */}
              {isJeepPrivateBlocked && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold animate-fade-in">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                  <span>🔒 Scorpio Jeep #{formSN} is reserved for a Private Tour group. Additional guest groups cannot be added to this vehicle!</span>
                </div>
              )}

              {/* Guest / Group Lead Name & Contact Number */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Guest / Group Lead Name"
                  value={formCustomerName}
                  onChange={e => setFormCustomerName(e.target.value)}
                  placeholder="e.g. Narayan Shrestha"
                  required
                />
                <Input
                  label="Contact Number"
                  value={formContactNumber}
                  onChange={e => setFormContactNumber(e.target.value)}
                  placeholder="e.g. 9841273144"
                  required
                />
              </div>

              {/* Passenger Count & Rooms Allocation */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Passenger Count (Pax)"
                  type="number"
                  value={formPax}
                  onChange={e => setFormPax(Number(e.target.value))}
                  required
                />
                <Input
                  label="Rooms Allocation"
                  value={formRooms}
                  onChange={e => setFormRooms(e.target.value)}
                  placeholder="e.g. 2 rooms / 4-5"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isJeepPrivateBlocked}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Assignment
                </Button>
              </div>
            </form>
          </Modal>

        </div>
      ) : (
        <DataTable
          title="Vehicle Fleet & Transport Catalog"
          description="Manage vehicle profiles, registration numbers, seating capacities, and bluebook/insurance expiries"
          data={vehicles as any}
          columns={vehicleColumns}
          searchPlaceholder="Search vehicles by name, registration..."
        />
      )}

    </div>
  );
};
