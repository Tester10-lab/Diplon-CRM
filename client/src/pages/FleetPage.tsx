import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
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
import { Car, Plus, Download, Copy, Search, UserCheck, Send, LayoutGrid, Table, ShieldAlert, X, Calendar, Filter, Bus, Lock, Users, Bed, Layers, Sparkles, Phone, Trash2, CheckCircle2 } from 'lucide-react';

interface SearchableDriverSelectProps {
  currentDriver: string;
  driverOptions: string[];
  onSelectDriver: (driverName: string) => void;
  disabled?: boolean;
}

const SearchableDriverSelect: React.FC<SearchableDriverSelectProps> = ({
  currentDriver,
  driverOptions,
  onSelectDriver,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return driverOptions;
    const q = search.toLowerCase();
    return driverOptions.filter(d => d.toLowerCase().includes(q));
  }, [driverOptions, search]);

  if (disabled) {
    return (
      <span className="text-[10px] font-extrabold text-[#C8FF2D] bg-[#C8FF2D]/10 px-2.5 py-1 rounded-lg border border-[#C8FF2D]/20">
        Assigned
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-950 text-xs border border-slate-700 hover:border-amber-400 rounded-xl px-3 py-1.5 text-slate-200 flex items-center justify-between gap-2 min-w-[150px] transition-all shadow-sm group"
      >
        <span className="truncate font-bold text-amber-300 group-hover:text-amber-200">
          {currentDriver || 'Unassigned Driver'}
        </span>
        <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2.5 space-y-2 animate-fade-in backdrop-blur-xl">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search driver name or phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-2 font-medium">No driver matching "{search}".</div>
            ) : (
              filteredOptions.map(drv => (
                <button
                  key={drv}
                  type="button"
                  onClick={() => {
                    onSelectDriver(drv);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    currentDriver === drv
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{drv}</span>
                  {currentDriver === drv && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FleetPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAgency = user?.role === 'AGENCY';

  const { data: vehicles, isLoading, error } = useFleet();
  const { data: driverList } = useDrivers();
  const { data: departures } = useDepartures();
  const { data: bookings } = useBookings();

  const cleanDriverName = (driverName: string) => {
    if (!driverName) return 'Unassigned';
    if (isAgency) {
      return driverName.replace(/\s*\(\d+\)/g, '').replace(/\s*\+?\d[\d\s-]{8,}/g, '').trim();
    }
    return driverName;
  };

  const isOwnAgencyGuest = (guestAgencyName?: string) => {
    if (!isAgency) return true;
    if (!user || !user.companyName) return true;
    if (!guestAgencyName) return true;
    const gAgency = guestAgencyName.toLowerCase().trim();
    const uCompany = user.companyName.toLowerCase().trim();
    return gAgency.includes(uCompany) || uCompany.includes(gAgency);
  };

  const [activeTab, setActiveTab] = useState<'SCORPIO_ROSTER' | 'FLEET_CATALOG'>('SCORPIO_ROSTER');
  const [viewStyle, setViewStyle] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Vehicle Assignments State
  const [scorpioData, setScorpioData] = useState<ScorpioAssignment[]>(getScorpioAssignments());
  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Vehicle Presets
  const vehiclePresets = [
    { type: 'Scorpio 4WD Jeep', capacity: 7 },
    { type: '28-Seater Sofa Bus', capacity: 28 },
    { type: 'Toyota Coaster Bus', capacity: 22 },
    { type: 'Toyota HiAce Super GL', capacity: 14 },
    { type: 'Prado 4WD Jeep', capacity: 5 },
    { type: 'Sedan / Car', capacity: 4 }
  ];

  // Form State for + Assign Vehicle
  const [formTour, setFormTour] = useState('Halesi Tour Package (1N/2D)');
  const [formDate, setFormDate] = useState('2026-08-01');
  const [formSN, setFormSN] = useState<number>(1);
  const [formDriver, setFormDriver] = useState('');
  const [formVehicleType, setFormVehicleType] = useState('Scorpio 4WD Jeep');
  const [formVehicleCapacity, setFormVehicleCapacity] = useState<number>(7);
  const [formPax, setFormPax] = useState<number>(7);
  const [formRooms, setFormRooms] = useState('2');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formContactNumber, setFormContactNumber] = useState('');
  const [formIsPrivate, setFormIsPrivate] = useState<boolean>(false);

  // Guest Searchable Type-and-Select State
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [filterOnlySelectedTourGuests, setFilterOnlySelectedTourGuests] = useState<boolean>(true);

  // Filter Booked Guests for Selection
  const filteredBookedGuests = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) return [];
    
    let list = bookings;
    if (filterOnlySelectedTourGuests && formTour) {
      const tourLower = formTour.toLowerCase();
      const tourSpecific = bookings.filter(b => 
        b.packageName && (
          b.packageName.toLowerCase().includes(tourLower) ||
          tourLower.includes(b.packageName.toLowerCase()) ||
          (tourLower.includes('halesi') && b.packageName.toLowerCase().includes('halesi')) ||
          (tourLower.includes('jiri') && b.packageName.toLowerCase().includes('jiri')) ||
          (tourLower.includes('mustang') && b.packageName.toLowerCase().includes('mustang'))
        )
      );

      if (tourSpecific.length > 0) {
        list = tourSpecific;
      }
    }

    if (!guestSearchQuery.trim()) return list;
    const q = guestSearchQuery.toLowerCase();
    return list.filter(b => 
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.contactPhone && b.contactPhone.includes(q)) ||
      ((b as any).customerPhone && (b as any).customerPhone.includes(q)) ||
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
      'Halesi Tour Package (1N/2D)',
      'Jiri Tour (1N/2D)',
      'Upper Mustang Package (4N/5D)',
      'Muktinath Tour (2N/3D)',
      'Pokhara & Ghandruk Tour',
      ...(departures || []).map(d => d.packageName)
    ])
  );

  const driverOptions = Array.from(
    new Set([
      'Unassigned Driver',
      ...(driverList || []).map(d => d.phone ? `${d.name} (${d.phone})` : d.name),
      'Srijan Maharjan (9801234567)',
      'Suman Dai (9851090895)'
    ])
  );

  const getDriverPhoneNumber = (driverName: string): string => {
    if (!driverName || driverName === 'Unassigned Driver') return '';
    const phoneMatch = driverName.match(/\b(9\d{9})\b/);
    if (phoneMatch) return phoneMatch[0];

    const found = (driverList || []).find(
      d => d.name && driverName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (found && found.phone) {
      const cleaned = found.phone.replace(/\D/g, '');
      if (cleaned.length >= 9) return cleaned;
    }
    return '';
  };

  // Filtered Vehicle List
  const tourList = Array.from(new Set(scorpioData.map(s => s.tour)));
  const filteredVehicles = scorpioData.filter(s => {
    const matchesTour = selectedTourFilter === 'ALL' || s.tour.toLowerCase() === selectedTourFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      s.driver.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.number.toLowerCase().includes(query) ||
      s.tour.toLowerCase().includes(query) ||
      (s.vehicleType && s.vehicleType.toLowerCase().includes(query));
    return matchesTour && matchesSearch;
  });

  // Group Vehicle rows by SN (Vehicle Unit #)
  const jeepsMap = new Map<number, ScorpioAssignment[]>();
  filteredVehicles.forEach(item => {
    if (!jeepsMap.has(item.sn)) jeepsMap.set(item.sn, []);
    jeepsMap.get(item.sn)!.push(item);
  });

  const jeepsList = Array.from(jeepsMap.entries()).sort((a, b) => a[0] - b[0]);

  const totalAssignedVehicles = jeepsMap.size;
  const totalPaxCount = filteredVehicles.reduce((sum, s) => sum + (s.pax || 0), 0);

  // Check if current formSN is already a Private Tour Vehicle with an existing group
  const existingJeepGroups = scorpioData.filter(s => s.sn === formSN);
  const isJeepPrivateBlocked = existingJeepGroups.some(g => g.isPrivate) && existingJeepGroups.length >= 1;

  // Handle Preset Vehicle Type Selection
  const handleSelectVehicleType = (type: string) => {
    setFormVehicleType(type);
    const preset = vehiclePresets.find(v => v.type === type);
    if (preset) {
      setFormVehicleCapacity(preset.capacity);
    }
  };

  // Handle Driver Selection / Typing & Auto-Link S.N.
  const handleSelectDriver = (driverName: string) => {
    setFormDriver(driverName);
    
    const existingDriverAssignment = scorpioData.find(
      s => s.driver.toLowerCase().trim() === driverName.toLowerCase().trim()
    );

    if (existingDriverAssignment) {
      setFormSN(existingDriverAssignment.sn);
      if (existingDriverAssignment.tour) setFormTour(existingDriverAssignment.tour);
      if (existingDriverAssignment.date) setFormDate(existingDriverAssignment.date);
      if (existingDriverAssignment.vehicleType) setFormVehicleType(existingDriverAssignment.vehicleType);
      if (existingDriverAssignment.vehicleCapacity) setFormVehicleCapacity(existingDriverAssignment.vehicleCapacity);
      showToast(`⚡ Driver "${driverName}" linked to Vehicle Unit #${existingDriverAssignment.sn}!`);
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

  const handleCreateVehicleAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isJeepPrivateBlocked) return;
    if (!formDriver.trim() && !formCustomerName.trim()) return;

    const newAssignment: ScorpioAssignment = {
      id: `veh_${Date.now()}`,
      tour: formTour,
      date: formDate,
      sn: formSN,
      driver: formDriver || 'Unassigned Driver',
      pax: formPax,
      rooms: formRooms,
      name: formCustomerName || 'Guest Group',
      number: formContactNumber || '-',
      isPrivate: formIsPrivate,
      vehicleType: formVehicleType,
      vehicleCapacity: formVehicleCapacity
    };

    const updated = [...scorpioData, newAssignment];
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    setIsAddModalOpen(false);
    showToast(`✅ Vehicle Unit #${formSN} (${formVehicleType} - Driver ${formDriver || 'Assigned'}) saved!`);
  };

  const handleDriverChangeBySN = (sn: number, newDriver: string) => {
    const updated = scorpioData.map(item => item.sn === sn ? { ...item, driver: newDriver } : item);
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    showToast(`✅ Assigned driver for Vehicle #${sn} to "${newDriver}"`);
  };

  const handleDeleteVehicleUnit = (sn: number) => {
    if (window.confirm(`Are you sure you want to delete Vehicle Unit #${sn}?`)) {
      const updated = scorpioData.filter(item => item.sn !== sn);
      setScorpioData(updated);
      saveScorpioAssignments(updated);
      showToast(`🗑️ Vehicle Unit #${sn} deleted!`);
    }
  };

  const handleDeleteGuestAssignment = (id: string, name: string) => {
    const updated = scorpioData.filter(item => item.id !== id);
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    showToast(`🗑️ Removed guest assignment for ${name}`);
  };

  const handleToggleJeepPrivate = (sn: number) => {
    const updated = scorpioData.map(item => item.sn === sn ? { ...item, isPrivate: !item.isPrivate } : item);
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    showToast(`🔒 Vehicle #${sn} Private Tour status updated!`);
  };

  const handleExportCSV = () => {
    const headers = ['Tour', 'Date', 'S.N.', 'Vehicle Type', 'Capacity', 'Driver', 'Pax', 'Rooms', 'Customer Name', 'Contact Number', 'Is Private'];
    const rows = filteredVehicles.map(s => [
      `"${s.tour}"`,
      `"${s.date || '2026-08-01'}"`,
      s.sn,
      `"${s.vehicleType || 'Scorpio 4WD'}"`,
      s.vehicleCapacity || 7,
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
    link.setAttribute('download', `Vehicle_Fleet_Assignment_Roster_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`📥 Exported Vehicle Assignment Roster to CSV!`);
  };

  const handleCopyWhatsAppRoster = () => {
    const text = `🚌 VEHICLE DISPATCH ROSTER (${selectedTourFilter})
------------------------------------------------
` + filteredVehicles.map(s => 
      `Vehicle #${s.sn} (${s.vehicleType || 'Vehicle'}) ${s.isPrivate ? '[PRIVATE]' : ''} | Date: ${s.date || '2026-08-01'} | Driver: ${s.driver} | Pax: ${s.pax} | Rooms: ${s.rooms} | Guest: ${s.name} (${s.number})`
    ).join('\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    showToast('📋 WhatsApp Vehicle Roster copied to clipboard!');
  };

  const handleSendDriverDispatchSMS = (sn: number, items: ScorpioAssignment[]) => {
    const mainDriver = items[0]?.driver || 'Driver';
    const tourName = items[0]?.tour || 'Tour';
    const travelDate = items[0]?.date || '2026-08-01';
    const vehType = items[0]?.vehicleType || 'Vehicle';
    const isPrivate = items.some(it => it.isPrivate);
    const text = `🚕 DISPATCH ORDER FOR VEHICLE #${sn} [${vehType}] (${mainDriver}) ${isPrivate ? '[PRIVATE TOUR]' : ''}
Tour: ${tourName}
Travel Date: ${travelDate}
------------------------------------
` + items.map((it, i) => `${i + 1}. Guest: ${it.name} | Pax: ${it.pax} | Rooms: ${it.rooms} | Phone: ${it.number}`).join('\n') + `
------------------------------------
Please report to Kathmandu Departure Spot by 06:00 AM!`;

    navigator.clipboard.writeText(text);

    let rawPhone = getDriverPhoneNumber(mainDriver);
    if (!rawPhone) {
      const inputPhone = prompt(`Enter WhatsApp Phone Number for Driver "${mainDriver}":`);
      if (inputPhone) {
        rawPhone = inputPhone.replace(/\D/g, '');
      }
    }

    if (rawPhone) {
      const formattedPhone = rawPhone.startsWith('977') ? rawPhone : `977${rawPhone.replace(/^0+/, '')}`;
      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      showToast(`💬 Opening WhatsApp for Driver (${mainDriver})!`);
    } else {
      showToast(`📱 Dispatch order copied for Vehicle #${sn}!`);
    }
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
            <Bus className="w-6 h-6 text-amber-400" />
            Vehicle Fleet & Driver Assignment Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tour package guest filter, departure date scheduling, vehicle type/capacity & driver auto-link
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
            <Bus className="w-3.5 h-3.5" />
            🚍 Vehicle Assignment Command
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
                  placeholder="Search vehicle, driver..."
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

              {!isAgency ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + Assign Vehicle
                </Button>
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Agency Read-Only View</span>
                </div>
              )}
            </div>
          </div>

          {/* Metric Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicles Assigned</span>
                <div className="text-xl font-black text-amber-400 mt-1 font-mono">{totalAssignedVehicles} Vehicles</div>
              </div>
              <Bus className="w-5 h-5 text-amber-400" />
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
                  {filteredVehicles.length} Groups Assigned
                </div>
              </div>
              <Bed className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* VIEW STYLE 1: Visual Vehicle Cards Deck */}
          {viewStyle === 'CARDS' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jeepsList.map(([sn, items]) => {
                const totalJeepPax = items.reduce((sum, it) => sum + (it.pax || 0), 0);
                const capacity = items[0]?.vehicleCapacity || 7;
                const vehType = items[0]?.vehicleType || 'Scorpio 4WD Jeep';
                const occupancyPercent = Math.min(100, Math.round((totalJeepPax / capacity) * 100));
                const mainDriver = items[0]?.driver || 'Unassigned';
                const tourName = items[0]?.tour || 'Halesi Tour Package';
                const travelDate = items[0]?.date || '2026-08-01';
                const isPrivateJeep = items.some(it => it.isPrivate);

                return (
                  <div
                    key={sn}
                    className={`p-5 rounded-3xl bg-slate-900/90 border ${
                      isPrivateJeep ? 'border-amber-500/70 shadow-amber-500/10' : 'border-slate-800 hover:border-indigo-500/40'
                    } transition-all duration-200 shadow-xl space-y-4 relative overflow-hidden group`}
                  >
                    {/* Top Vehicle Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 font-mono text-sm">
                          #{sn}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm flex items-center gap-2">
                            <span>{vehType} #{sn}</span>
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
                          disabled={isAgency}
                          className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isPrivateJeep
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          } ${isAgency ? 'cursor-not-allowed opacity-80' : ''}`}
                          title="Toggle Private Tour Group Protection"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp Dispatch Button (Hidden for Agency) */}
                        {!isAgency && (
                          <button
                            onClick={() => handleSendDriverDispatchSMS(sn, items)}
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all text-xs font-bold flex items-center gap-1"
                            title="Open WhatsApp Driver Dispatch Message"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {/* Delete Vehicle Unit Button (Hidden for Agency) */}
                        {!isAgency && (
                          <button
                            onClick={() => handleDeleteVehicleUnit(sn)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all text-xs font-bold"
                            title={`Delete Vehicle Unit #${sn}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Driver Re-Assignment Selector */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Assigned Driver</span>
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      </label>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-indigo-300 truncate">
                          {cleanDriverName(mainDriver)}
                        </span>

                        <SearchableDriverSelect
                          currentDriver={mainDriver}
                          driverOptions={driverOptions}
                          onSelectDriver={(drvName) => handleDriverChangeBySN(sn, drvName)}
                          disabled={isAgency}
                        />
                      </div>
                    </div>

                    {/* Passenger Occupancy Gauge Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">{vehType} Capacity</span>
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
                    </div>

                    {/* Guest Breakdown List inside this Vehicle Unit */}
                    <div className="space-y-2 pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Guest Bookings Assigned ({items.length} Group)
                      </span>
                      {items.map(guest => {
                        const isMine = isOwnAgencyGuest((guest as any).agencyName);
                        return (
                          <div key={guest.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                                {isMine ? guest.name : '🔒 Partner Agency Group'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 font-mono">
                                  {guest.pax} Pax
                                </span>
                                {!isAgency && (
                                  <button
                                    onClick={() => handleDeleteGuestAssignment(guest.id, guest.name)}
                                    className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                                    title={`Delete ${guest.name} assignment`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" /> {isMine ? guest.number : 'Protected Number'}
                              </span>
                              <span className="flex items-center gap-1 text-slate-300 font-medium">
                                <Bed className="w-3 h-3 text-emerald-400" /> {guest.rooms}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW STYLE 2: Excel Roster Table View */
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="p-3.5 pl-5">Unit S.N.</th>
                      <th className="p-3.5">Vehicle Type</th>
                      <th className="p-3.5">Tour Package</th>
                      <th className="p-3.5">Travel Date</th>
                      <th className="p-3.5">Assigned Driver</th>
                      <th className="p-3.5">Pax</th>
                      <th className="p-3.5">Capacity</th>
                      <th className="p-3.5">Rooms</th>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Contact Number</th>
                      <th className="p-3.5">Private Status</th>
                      <th className="p-3.5 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredVehicles.map(item => {
                      const isMine = isOwnAgencyGuest((item as any).agencyName);
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-all font-medium">
                          <td className="p-3.5 pl-5 font-black text-amber-400 font-mono">#{item.sn}</td>
                          <td className="p-3.5 font-bold text-slate-200">{item.vehicleType || 'Scorpio 4WD'}</td>
                          <td className="p-3.5 font-bold text-white">{item.tour}</td>
                          <td className="p-3.5 font-mono text-indigo-300">{item.date || '2026-08-01'}</td>
                          <td className="p-3.5 font-bold text-indigo-400">
                            <SearchableDriverSelect
                              currentDriver={item.driver}
                              driverOptions={driverOptions}
                              onSelectDriver={(drvName) => handleDriverChangeBySN(item.sn, drvName)}
                              disabled={isAgency}
                            />
                          </td>
                          <td className="p-3.5 font-mono font-bold text-amber-300">{item.pax} Pax</td>
                          <td className="p-3.5 font-mono text-slate-400">{item.vehicleCapacity || 7} Seats</td>
                          <td className="p-3.5 font-mono text-emerald-400">{item.rooms}</td>
                          <td className="p-3.5 font-bold text-slate-100">{isMine ? item.name : '🔒 Partner Agency Group'}</td>
                          <td className="p-3.5 font-mono text-slate-400">{isMine ? item.number : 'Protected'}</td>
                        <td className="p-3.5">
                          {item.isPrivate ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              🔒 PRIVATE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                              👥 SHARING
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right flex items-center justify-end gap-1.5">
                          {!isAgency ? (
                            <>
                              <button
                                onClick={() => handleSendDriverDispatchSMS(item.sn, [item])}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-[11px] flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                Dispatch
                              </button>
                              <button
                                onClick={() => handleDeleteGuestAssignment(item.id, item.name)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold text-[11px]"
                                title="Delete assignment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-mono">Read-Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Dialog: + Assign Vehicle & Driver */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Assign Vehicle & Driver"
            description="Select tour package, vehicle type, seating capacity, filter guest pipeline, and assign typable driver."
            maxWidth="lg"
          >
            <form onSubmit={handleCreateVehicleAssignment} className="space-y-4">
              
              {/* Tour Package Selection & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Select Tour Package
                  </label>
                  <select
                    value={formTour}
                    onChange={(e) => setFormTour(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {tourOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Departure Travel Date"
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  required
                />
              </div>

              {/* Vehicle Type & Seating Capacity Selection */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={formVehicleType}
                    onChange={(e) => handleSelectVehicleType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {vehiclePresets.map(v => (
                      <option key={v.type} value={v.type}>{v.type} ({v.capacity} Seats)</option>
                    ))}
                    <option value="Custom Vehicle">Custom / Other Vehicle</option>
                  </select>
                </div>

                <Input
                  label="Vehicle Capacity (Seats)"
                  type="number"
                  value={formVehicleCapacity}
                  onChange={e => setFormVehicleCapacity(Number(e.target.value))}
                  placeholder="e.g. 28"
                  required
                />
              </div>

              {/* Searchable Driver Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Assigned Driver Name</span>
                    <span className="text-[10px] text-amber-400 font-normal">Click to search</span>
                  </label>
                  <SearchableDriverSelect
                    currentDriver={formDriver}
                    driverOptions={driverOptions}
                    onSelectDriver={(drvName) => handleSelectDriver(drvName)}
                  />
                </div>

                <Input
                  label="Vehicle S.N. #"
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
                          key={b._id || (b as any).id}
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
                              📞 {b.contactPhone || (b as any).customerPhone || 'No Phone'}
                            </div>
                          </div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                            {b.seatsReserved || (b as any).pax || 1} Pax
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
                  <div className="text-[11px] text-slate-400">If enabled, no other customer groups can be added to Vehicle #{formSN}</div>
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

              {/* Warning Banner if current Vehicle S.N. is already Private */}
              {isJeepPrivateBlocked && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold animate-fade-in">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                  <span>🔒 Vehicle #{formSN} is reserved for a Private Tour group. Additional guest groups cannot be added to this vehicle!</span>
                </div>
              )}

              {/* Guest / Group Lead Name & Contact Number */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Guest / Group Lead Name"
                  value={formCustomerName}
                  onChange={e => setFormCustomerName(e.target.value)}
                  placeholder="e.g. Chandra man Maharjan"
                  required
                />
                <Input
                  label="Contact Number"
                  value={formContactNumber}
                  onChange={e => setFormContactNumber(e.target.value)}
                  placeholder="e.g. 9802100125"
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
                  Save Vehicle Assignment
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
