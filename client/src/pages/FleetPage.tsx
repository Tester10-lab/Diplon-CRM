import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFleet, useDrivers, useDepartures } from '../shared/hooks/operations/useOperations';
import { useBookings } from '../shared/hooks/bookings/useBookings';
import { usePackages } from '../shared/hooks/packages/usePackages';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { getScorpioAssignments, saveScorpioAssignments, ScorpioAssignment } from '../features/fleet/scorpioStore';
import { Car, Plus, Download, Copy, Search, UserCheck, Send, LayoutGrid, Table, ShieldAlert, X, Calendar, Filter, Bus, Lock, Users, Bed, Layers, Sparkles, Phone, Trash2, CheckCircle2, CheckSquare, Square, ListPlus, ClipboardPaste, UserPlus, Check } from 'lucide-react';

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
      <span className="text-[10px] font-extrabold text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
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
  const { data: packages } = usePackages();

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

  // Vehicle Presets with Scorpio, EV Van, Bus as standard options
  const vehiclePresets = [
    { type: 'Scorpio', capacity: 7 },
    { type: 'EV Van', capacity: 11 },
    { type: 'Bus', capacity: 28 },
    { type: 'Scorpio 4WD Jeep', capacity: 7 },
    { type: '28-Seater Sofa Bus', capacity: 28 },
    { type: 'Toyota Coaster Bus', capacity: 22 },
    { type: 'Toyota HiAce Super GL', capacity: 14 },
    { type: 'Prado 4WD Jeep', capacity: 5 },
    { type: 'Sedan / Car', capacity: 4 }
  ];

  // Dynamic Lists for Dropdowns - includes all active tenant tour packages
  const tourOptions = useMemo(() => {
    const options = new Set<string>();
    
    // 1. All active packages from package catalog (scoped by tenant)
    if (packages && Array.isArray(packages)) {
      packages.forEach(p => {
        if (p.name && p.name.trim()) options.add(p.name.trim());
      });
    }

    // 2. Scheduled tour departures
    if (departures && Array.isArray(departures)) {
      departures.forEach(d => {
        if (d.packageName && d.packageName.trim()) options.add(d.packageName.trim());
      });
    }

    // 3. Guest bookings
    if (bookings && Array.isArray(bookings)) {
      bookings.forEach(b => {
        if (b.packageName && b.packageName.trim()) options.add(b.packageName.trim());
      });
    }

    // 4. Existing fleet roster assignments
    if (scorpioData && Array.isArray(scorpioData)) {
      scorpioData.forEach(s => {
        if (s.tour && s.tour.trim()) options.add(s.tour.trim());
      });
    }

    // 5. Fallback defaults if empty
    if (options.size === 0) {
      [
        'Halesi Tour Package (1N/2D)',
        'Jiri Tour (1N/2D)',
        'Upper Mustang Package (4N/5D)',
        'Muktinath Tour (2N/3D)',
        'Pokhara & Ghandruk Tour'
      ].forEach(opt => options.add(opt));
    }

    return Array.from(options);
  }, [packages, departures, bookings, scorpioData]);

  // Form State for + Assign Vehicle
  const [formTour, setFormTour] = useState<string>('');
  const [formDate, setFormDate] = useState('2026-08-01');
  const [formSN, setFormSN] = useState<number>(1);
  const [formDriver, setFormDriver] = useState('');
  const [formVehicleType, setFormVehicleType] = useState('Scorpio');
  const [formVehicleCapacity, setFormVehicleCapacity] = useState<number>(7);
  const [formPax, setFormPax] = useState<number>(7);
  const [formRooms, setFormRooms] = useState('2');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formContactNumber, setFormContactNumber] = useState('');
  const [formIsPrivate, setFormIsPrivate] = useState<boolean>(false);

  // Synchronize initial formTour when tourOptions load
  useEffect(() => {
    if (!formTour && tourOptions.length > 0) {
      setFormTour(tourOptions[0]);
    }
  }, [tourOptions, formTour]);

  // Modal Tab Mode: 'BULK_BOOKINGS' | 'BATCH_ROWS' | 'SINGLE'
  const [assignTab, setAssignTab] = useState<'BULK_BOOKINGS' | 'BATCH_ROWS' | 'SINGLE'>('BULK_BOOKINGS');

  // Selected Booking IDs for Bulk CRM Assignment
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  // Manual Batch Rows for Walk-ins
  const [batchGuestRows, setBatchGuestRows] = useState<Array<{ id: string; name: string; phone: string; pax: number; rooms: string }>>([
    { id: 'row_1', name: '', phone: '', pax: 2, rooms: '1 room' },
    { id: 'row_2', name: '', phone: '', pax: 2, rooms: '1 room' }
  ]);

  // Batch Paste Textarea
  const [batchPasteText, setBatchPasteText] = useState<string>('');

  // Guest Searchable Type-and-Select State
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [filterOnlySelectedTourGuests, setFilterOnlySelectedTourGuests] = useState<boolean>(true);

  // Filter Booked Guests for Selection
  const filteredBookedGuests = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) return [];
    
    let list = bookings;
    if (filterOnlySelectedTourGuests && formTour) {
      const tourLower = formTour.toLowerCase().trim();
      const tourWords = tourLower.split(/\s+/).filter(w => w.length > 2 && !['tour', 'package', '1n/2d', '2n/3d', '4n/5d', '3n/4d'].includes(w));
      
      const tourSpecific = bookings.filter(b => {
        if (!b.packageName) return false;
        const bLower = b.packageName.toLowerCase().trim();
        return (
          bLower.includes(tourLower) ||
          tourLower.includes(bLower) ||
          tourWords.some(word => bLower.includes(word))
        );
      });

      if (tourSpecific.length > 0) {
        list = tourSpecific;
      }
    }

    if (!guestSearchQuery.trim()) return list;
    const q = guestSearchQuery.toLowerCase().trim();
    return list.filter(b => 
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.contactPhone && b.contactPhone.includes(q)) ||
      ((b as any).customerPhone && (b as any).customerPhone.includes(q)) ||
      (b.packageName && b.packageName.toLowerCase().includes(q))
    );
  }, [bookings, formTour, filterOnlySelectedTourGuests, guestSearchQuery]);

  // Total Pax of currently selected bookings in Bulk Select tab
  const selectedBulkPax = useMemo(() => {
    return filteredBookedGuests
      .filter(b => selectedBookingIds.includes((b._id || (b as any).id) as string))
      .reduce((sum, b) => sum + Number(b.seatsReserved || (b as any).pax || (b as any).travelersCount || 1), 0);
  }, [filteredBookedGuests, selectedBookingIds]);

  const currentUnitAssignedPax = useMemo(() => {
    return scorpioData.filter(s => s.sn === formSN).reduce((sum, s) => sum + (s.pax || 0), 0);
  }, [scorpioData, formSN]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => {}} />;

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

  // Toggle individual booking in bulk list
  const toggleSelectBooking = (id: string) => {
    setSelectedBookingIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select All / Deselect All Matching Bookings
  const handleSelectAllBookings = () => {
    const allIds = filteredBookedGuests.map(b => (b._id || (b as any).id) as string);
    if (selectedBookingIds.length === allIds.length && allIds.length > 0) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(allIds);
    }
  };

  // Auto-Fill up to Vehicle Capacity
  const handleAutoFillCapacity = () => {
    const remainingSeats = Math.max(0, formVehicleCapacity - currentUnitAssignedPax);
    
    let accumulatedPax = 0;
    const toSelect: string[] = [];

    for (const b of filteredBookedGuests) {
      const bId = (b._id || (b as any).id) as string;
      const bookingPax = Number(b.seatsReserved || (b as any).pax || (b as any).travelersCount || 1);
      if (accumulatedPax + bookingPax <= remainingSeats || toSelect.length === 0) {
        toSelect.push(bId);
        accumulatedPax += bookingPax;
      }
    }

    setSelectedBookingIds(toSelect);
    showToast(`⚡ Auto-selected ${toSelect.length} bookings (${accumulatedPax} Pax) to fill vehicle capacity!`);
  };

  // Batch Row Management
  const handleAddBatchRow = () => {
    setBatchGuestRows(prev => [
      ...prev,
      { id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, name: '', phone: '', pax: 2, rooms: '1 room' }
    ]);
  };

  const handleRemoveBatchRow = (id: string) => {
    setBatchGuestRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateBatchRow = (id: string, field: 'name' | 'phone' | 'pax' | 'rooms', value: any) => {
    setBatchGuestRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Quick Action: Open Modal pre-filled to add a guest directly to an existing vehicle unit
  const handleOpenAddGuestToVehicle = (sn: number, items: ScorpioAssignment[]) => {
    const mainItem = items[0];
    const totalJeepPax = items.reduce((sum, it) => sum + (it.pax || 0), 0);
    const capacity = mainItem?.vehicleCapacity || 7;
    const remainingSeats = Math.max(1, capacity - totalJeepPax);
    const currentTour = mainItem?.tour || formTour || (tourOptions[0] || 'Tour Package');

    setFormSN(sn);
    setFormTour(currentTour);
    setFormDate(mainItem?.date || formDate || '2026-08-14');
    setFormVehicleType(mainItem?.vehicleType || formVehicleType || 'Bus');
    setFormVehicleCapacity(capacity);
    setFormDriver(mainItem?.driver || '');
    setFormPax(remainingSeats);
    setFormRooms('1 room');
    setFormCustomerName('');
    setFormContactNumber('');
    setFormIsPrivate(false);
    setGuestSearchQuery('');
    setIsGuestDropdownOpen(false);

    // Auto-select all bookings for this tour package
    const matchingBookings = (bookings || []).filter(b => {
      if (!b.packageName) return false;
      const bLower = b.packageName.toLowerCase().trim();
      const tLower = currentTour.toLowerCase().trim();
      return bLower.includes(tLower) || tLower.includes(bLower);
    });

    const matchingIds = matchingBookings.map(b => (b._id || (b as any).id) as string);
    setSelectedBookingIds(matchingIds);
    setAssignTab(matchingIds.length > 0 ? 'BULK_BOOKINGS' : 'SINGLE');
    setIsAddModalOpen(true);
  };

  // Quick Action: Open Modal for a fresh new vehicle unit
  const handleOpenNewVehicleModal = () => {
    const maxSN = scorpioData.length > 0 ? Math.max(...scorpioData.map(s => s.sn)) : 0;
    const initialTour = tourOptions[0] || 'Tour Package';
    setFormSN(maxSN + 1);
    setFormTour(initialTour);
    setFormDate(new Date().toISOString().split('T')[0] || '2026-08-14');
    setFormDriver('');
    setFormVehicleType('Bus');
    setFormVehicleCapacity(28);
    setFormCustomerName('');
    setFormContactNumber('');
    setFormPax(2);
    setFormRooms('1 room');
    setFormIsPrivate(false);
    setGuestSearchQuery('');
    setIsGuestDropdownOpen(false);

    // Pre-select all bookings for the initial tour package
    const matchingBookings = (bookings || []).filter(b => {
      if (!b.packageName) return false;
      const bLower = b.packageName.toLowerCase().trim();
      const tLower = initialTour.toLowerCase().trim();
      return bLower.includes(tLower) || tLower.includes(bLower);
    });
    const matchingIds = matchingBookings.map(b => (b._id || (b as any).id) as string);
    setSelectedBookingIds(matchingIds);
    setAssignTab(matchingIds.length > 0 ? 'BULK_BOOKINGS' : 'SINGLE');
    setIsAddModalOpen(true);
  };

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

  // Handle Guest Selection from Search Dropdown (for Single tab)
  const handleSelectGuest = (booking: any) => {
    setFormCustomerName(booking.customerName);
    setFormContactNumber(booking.contactPhone || booking.customerPhone || '');
    setFormPax(booking.seatsReserved || booking.pax || 2);
    if (booking.roomDetails) setFormRooms(booking.roomDetails);
    if (booking.packageName) setFormTour(booking.packageName);
    if (booking.departureDate) setFormDate(booking.departureDate);
    if (booking.groupType === 'private') setFormIsPrivate(true);
    setGuestSearchQuery(`${booking.customerName} (${booking.contactPhone || 'No Phone'})`);
    setIsGuestDropdownOpen(false);
    showToast(`✨ Selected guest ${booking.customerName}`);
  };

  // Bulk Save Bookings Handler
  const handleSaveBulkBookings = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingIds.length === 0) {
      showToast('⚠️ Please select at least one guest booking from the list.');
      return;
    }

    const selectedBookings = filteredBookedGuests.filter(b => 
      selectedBookingIds.includes((b._id || (b as any).id) as string)
    );

    const newAssignments: ScorpioAssignment[] = selectedBookings.map((b, idx) => ({
      id: `veh_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      tour: formTour || b.packageName || 'Tour Package',
      date: formDate || b.departureDate || '2026-08-14',
      sn: formSN || 1,
      driver: formDriver || 'Unassigned Driver',
      pax: Number(b.seatsReserved || (b as any).pax || (b as any).travelersCount || 1),
      rooms: b.roomDetails || `${Math.ceil(Number(b.seatsReserved || 1) / 2)} room`,
      name: b.customerName || 'Guest Group',
      number: b.contactPhone || (b as any).customerPhone || '-',
      isPrivate: formIsPrivate,
      vehicleType: formVehicleType || 'Vehicle',
      vehicleCapacity: Number(formVehicleCapacity) || 7
    }));

    let updated = [...scorpioData];
    if (formIsPrivate === false) {
      updated = updated.map(item => item.sn === formSN ? { ...item, isPrivate: false } : item);
    }
    updated.push(...newAssignments);

    setScorpioData(updated);
    saveScorpioAssignments(updated);
    setIsAddModalOpen(false);
    const totalAddedPax = newAssignments.reduce((s, a) => s + a.pax, 0);
    showToast(`🎉 Added all ${newAssignments.length} guest groups (${totalAddedPax} Pax) to Vehicle #${formSN} at once!`);
  };

  // Batch Save Manual Rows
  const handleSaveBatchRows = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = batchGuestRows.filter(r => r.name.trim().length > 0);
    if (validRows.length === 0) {
      showToast('⚠️ Please enter at least one guest name in the rows.');
      return;
    }

    const newAssignments: ScorpioAssignment[] = validRows.map((r, idx) => ({
      id: `veh_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      tour: formTour || tourOptions[0] || 'Tour Package',
      date: formDate || '2026-08-14',
      sn: formSN || 1,
      driver: formDriver || 'Unassigned Driver',
      pax: Number(r.pax) || 1,
      rooms: r.rooms || '1 room',
      name: r.name.trim(),
      number: r.phone.trim() || '-',
      isPrivate: formIsPrivate,
      vehicleType: formVehicleType || 'Vehicle',
      vehicleCapacity: Number(formVehicleCapacity) || 7
    }));

    let updated = [...scorpioData];
    if (formIsPrivate === false) {
      updated = updated.map(item => item.sn === formSN ? { ...item, isPrivate: false } : item);
    }
    updated.push(...newAssignments);

    setScorpioData(updated);
    saveScorpioAssignments(updated);
    setIsAddModalOpen(false);
    const totalAddedPax = newAssignments.reduce((s, a) => s + a.pax, 0);
    showToast(`🎉 Added all ${newAssignments.length} guests (${totalAddedPax} Pax) to Vehicle #${formSN} at once!`);
  };

  // Batch Save Paste Text
  const handleSaveBatchPaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchPasteText.trim()) {
      showToast('⚠️ Please paste guest details (Name, Phone, Pax, Rooms).');
      return;
    }

    const lines = batchPasteText.split('\n').filter(l => l.trim().length > 0);
    const newAssignments: ScorpioAssignment[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,;\t]+/).map(p => p.trim());
      const name = parts[0] || `Guest ${idx + 1}`;
      const number = parts[1] || '-';
      const pax = Number(parts[2]) || 2;
      const rooms = parts[3] || '1 room';

      newAssignments.push({
        id: `veh_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        tour: formTour || tourOptions[0] || 'Tour Package',
        date: formDate || '2026-08-14',
        sn: formSN || 1,
        driver: formDriver || 'Unassigned Driver',
        pax: pax,
        rooms: rooms,
        name: name,
        number: number,
        isPrivate: formIsPrivate,
        vehicleType: formVehicleType || 'Vehicle',
        vehicleCapacity: Number(formVehicleCapacity) || 7
      });
    });

    if (newAssignments.length === 0) {
      showToast('⚠️ No valid guest rows found.');
      return;
    }

    let updated = [...scorpioData];
    if (formIsPrivate === false) {
      updated = updated.map(item => item.sn === formSN ? { ...item, isPrivate: false } : item);
    }
    updated.push(...newAssignments);

    setScorpioData(updated);
    saveScorpioAssignments(updated);
    setIsAddModalOpen(false);
    setBatchPasteText('');
    const totalAddedPax = newAssignments.reduce((s, a) => s + a.pax, 0);
    showToast(`🎉 Parsed & added ${newAssignments.length} guests (${totalAddedPax} Pax) to Vehicle #${formSN} at once!`);
  };

  // Single Guest Save Handler
  const handleCreateVehicleAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const guestName = formCustomerName.trim() || guestSearchQuery.trim();
    if (!guestName && !formDriver.trim()) {
      showToast('⚠️ Please enter a Guest Name or assign a Driver.');
      return;
    }

    const newAssignment: ScorpioAssignment = {
      id: `veh_${Date.now()}`,
      tour: formTour || tourOptions[0] || 'Tour Package',
      date: formDate || '2026-08-14',
      sn: formSN || 1,
      driver: formDriver || 'Unassigned Driver',
      pax: Number(formPax) || 1,
      rooms: formRooms || '1 room',
      name: guestName || 'Guest Group',
      number: formContactNumber.trim() || '-',
      isPrivate: formIsPrivate,
      vehicleType: formVehicleType || 'Vehicle',
      vehicleCapacity: Number(formVehicleCapacity) || 7
    };

    let updated = [...scorpioData];
    if (formIsPrivate === false) {
      updated = updated.map(item => item.sn === formSN ? { ...item, isPrivate: false } : item);
    }
    updated.push(newAssignment);
    setScorpioData(updated);
    saveScorpioAssignments(updated);
    setIsAddModalOpen(false);
    showToast(`✅ Guest "${newAssignment.name}" (${newAssignment.pax} Pax) added to Vehicle #${formSN}!`);
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
                  className="bg-white text-black hover:bg-neutral-200 font-bold shadow-md shadow-white/10"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenNewVehicleModal}
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
                const tourName = items[0]?.tour || 'Tour Package';
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
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Guest Bookings Assigned ({items.length} Group{items.length !== 1 ? 's' : ''})
                        </span>
                        {!isAgency && (
                          <button
                            type="button"
                            onClick={() => handleOpenAddGuestToVehicle(sn, items)}
                            className="px-2.5 py-1 rounded-xl bg-white text-black hover:bg-neutral-200 font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                            title={`Add a new guest group to Vehicle Unit #${sn}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Guest</span>
                          </button>
                        )}
                      </div>
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
                                onClick={() => handleOpenAddGuestToVehicle(item.sn, [item])}
                                className="p-1.5 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold text-[11px] flex items-center gap-1"
                                title="Add guest to this vehicle unit"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Guest</span>
                              </button>
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

          {/* Modal Dialog: + Assign Vehicle & Driver (Supports Bulk Select & Batch Add) */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Assign Vehicle & Guests"
            description="Assign multiple customer bookings at once, add batches of guests, or assign individual groups."
            maxWidth="xl"
          >
            <div className="space-y-4">
              
              {/* Tour Package Selection & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Select Tour Package
                  </label>
                  <select
                    value={formTour}
                    onChange={(e) => setFormTour(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-white"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-white"
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

              {/* Searchable Driver & Target Vehicle Unit Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Assigned Driver Name</span>
                    <span className="text-[10px] text-white/70 font-normal">Click to search</span>
                  </label>
                  <SearchableDriverSelect
                    currentDriver={formDriver}
                    driverOptions={driverOptions}
                    onSelectDriver={(drvName) => handleSelectDriver(drvName)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>Target Vehicle Unit</span>
                    <span className="text-[10px] text-white font-mono font-bold">
                      Unit #{formSN} ({currentUnitAssignedPax} Pax assigned)
                    </span>
                  </label>
                  <select
                    value={formSN}
                    onChange={(e) => {
                      const chosenSN = Number(e.target.value);
                      setFormSN(chosenSN);
                      const found = scorpioData.find(s => s.sn === chosenSN);
                      if (found) {
                        if (found.tour) setFormTour(found.tour);
                        if (found.date) setFormDate(found.date);
                        if (found.vehicleType) setFormVehicleType(found.vehicleType);
                        if (found.vehicleCapacity) setFormVehicleCapacity(found.vehicleCapacity);
                        if (found.driver) setFormDriver(found.driver);
                        setFormIsPrivate(found.isPrivate || false);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    {jeepsList.map(([snNum, groupItems]) => {
                      const vType = groupItems[0]?.vehicleType || 'Vehicle';
                      const paxTotal = groupItems.reduce((acc, it) => acc + (it.pax || 0), 0);
                      const cap = groupItems[0]?.vehicleCapacity || 7;
                      return (
                        <option key={snNum} value={snNum}>
                          Unit #{snNum}: {vType} ({paxTotal}/{cap} Pax - {groupItems[0]?.tour || 'Tour'})
                        </option>
                      );
                    })}
                    <option value={(scorpioData.length > 0 ? Math.max(...scorpioData.map(s => s.sn)) : 0) + 1}>
                      + Create New Vehicle Unit #{(scorpioData.length > 0 ? Math.max(...scorpioData.map(s => s.sn)) : 0) + 1}
                    </option>
                  </select>
                </div>
              </div>

              {/* Private Tour Group Toggle Button */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-white" />
                    Private Tour Group Only
                  </div>
                  <div className="text-[11px] text-slate-400">If enabled, Vehicle #{formSN} is reserved exclusively for one private booking</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsPrivate(!formIsPrivate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                    formIsPrivate
                      ? 'bg-white text-black border-white shadow-md shadow-white/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {formIsPrivate ? '🔒 Private ON' : '👥 Sharing Tour'}
                </button>
              </div>

              {/* Informative Banner if existing Vehicle S.N. has Private enabled */}
              {isJeepPrivateBlocked && !formIsPrivate && (
                <div className="bg-white/10 border border-white/20 p-3 rounded-xl flex items-center justify-between gap-2.5 text-white text-xs font-semibold animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-white shrink-0" />
                    <span>Vehicle #{formSN} was previously marked Private. Adding guests will convert it to a Sharing vehicle.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = scorpioData.map(s => s.sn === formSN ? { ...s, isPrivate: false } : s);
                      setScorpioData(updated);
                      saveScorpioAssignments(updated);
                      showToast(`🔓 Vehicle #${formSN} converted to Sharing Tour mode!`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 font-extrabold text-[10px] shrink-0"
                  >
                    Convert & Allow
                  </button>
                </div>
              )}

              {/* Mode Tabs: Bulk Select CRM vs Multi-Row Batch vs Single Guest */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAssignTab('BULK_BOOKINGS')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    assignTab === 'BULK_BOOKINGS'
                      ? 'bg-white text-black shadow-md shadow-white/10'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Bulk Select All Bookings ({filteredBookedGuests.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignTab('BATCH_ROWS')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    assignTab === 'BATCH_ROWS'
                      ? 'bg-white text-black shadow-md shadow-white/10'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Multi-Row Quick Add</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignTab('SINGLE')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    assignTab === 'SINGLE'
                      ? 'bg-white text-black shadow-md shadow-white/10'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Single Guest Form</span>
                </button>
              </div>

              {/* TAB 1: BULK SELECT CRM BOOKINGS */}
              {assignTab === 'BULK_BOOKINGS' && (
                <form onSubmit={handleSaveBulkBookings} className="space-y-3">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={guestSearchQuery}
                        onChange={e => setGuestSearchQuery(e.target.value)}
                        placeholder={`Filter bookings for ${formTour || 'selected package'}...`}
                        className="w-full bg-slate-950 text-white font-bold border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllBookings}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>
                          {selectedBookingIds.length === filteredBookedGuests.length && filteredBookedGuests.length > 0
                            ? 'Deselect All'
                            : 'Select All Bookings'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAutoFillCapacity}
                        className="px-2.5 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                        title="Select bookings up to vehicle capacity"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Fill Capacity</span>
                      </button>
                    </div>
                  </div>

                  {/* Checklist Table of Bookings */}
                  <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800/80">
                    {filteredBookedGuests.length > 0 ? (
                      filteredBookedGuests.map(b => {
                        const bId = (b._id || (b as any).id) as string;
                        const isSelected = selectedBookingIds.includes(bId);
                        const bPax = Number(b.seatsReserved || (b as any).pax || (b as any).travelersCount || 1);
                        const isAlreadyAssigned = scorpioData.some(s => s.name.toLowerCase().trim() === b.customerName.toLowerCase().trim());

                        return (
                          <div
                            key={bId}
                            onClick={() => toggleSelectBooking(bId)}
                            className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                              isSelected ? 'bg-white/10 hover:bg-white/15' : 'hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-white text-black border-white' : 'border-slate-700 bg-slate-900'
                              }`}>
                                {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                              </div>

                              <div>
                                <div className="font-extrabold text-white text-xs flex items-center gap-2">
                                  <span>{b.customerName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    📞 {b.contactPhone || (b as any).customerPhone || 'No Phone'}
                                  </span>
                                  {isAlreadyAssigned && (
                                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                                      Assigned
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{b.packageName}</span>
                                  <span>•</span>
                                  <span>{b.roomDetails || '1 room'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-white text-black font-mono">
                                {bPax} Pax
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No bookings found for "{formTour}". Switch to "Multi-Row Quick Add" above to add walk-in guests.
                      </div>
                    )}
                  </div>

                  {/* Projected Capacity Gauge */}
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">
                        Selected: <span className="text-white font-mono">{selectedBookingIds.length} Bookings ({selectedBulkPax} Pax)</span>
                      </span>
                      <span className="text-slate-300 font-mono font-bold">
                        Projected Load: {currentUnitAssignedPax + selectedBulkPax} / {formVehicleCapacity} Seats ({Math.min(100, Math.round(((currentUnitAssignedPax + selectedBulkPax) / formVehicleCapacity) * 100))}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          currentUnitAssignedPax + selectedBulkPax > formVehicleCapacity
                            ? 'bg-rose-500'
                            : currentUnitAssignedPax + selectedBulkPax === formVehicleCapacity
                            ? 'bg-white'
                            : 'bg-white'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round(((currentUnitAssignedPax + selectedBulkPax) / formVehicleCapacity) * 100))}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={selectedBookingIds.length === 0}
                      className="bg-white hover:bg-neutral-200 text-black font-extrabold shadow-lg shadow-white/10 cursor-pointer disabled:opacity-40"
                    >
                      ✓ Put All Selected ({selectedBookingIds.length} Groups • {selectedBulkPax} Pax) in Vehicle #{formSN}
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB 2: MULTI-ROW BATCH ADD / PASTE */}
              {assignTab === 'BATCH_ROWS' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Enter Multiple Guests Simultaneously
                      </label>
                      <button
                        type="button"
                        onClick={handleAddBatchRow}
                        className="px-2.5 py-1 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Row</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {batchGuestRows.map((row, idx) => (
                        <div key={row.id} className="grid grid-cols-12 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 items-center">
                          <span className="col-span-1 text-[11px] font-bold text-slate-500 text-center font-mono">
                            #{idx + 1}
                          </span>
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={row.name}
                              onChange={e => handleUpdateBatchRow(row.id, 'name', e.target.value)}
                              placeholder="Guest Name (e.g. Sujata Bhujel)"
                              className="w-full bg-slate-950 text-white font-bold border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={row.phone}
                              onChange={e => handleUpdateBatchRow(row.id, 'phone', e.target.value)}
                              placeholder="Phone (e.g. 9845940693)"
                              className="w-full bg-slate-950 text-white font-mono border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={row.pax}
                              onChange={e => handleUpdateBatchRow(row.id, 'pax', Number(e.target.value))}
                              placeholder="Pax"
                              className="w-full bg-slate-950 text-white font-mono font-bold border border-slate-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-white text-center"
                            />
                          </div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              value={row.rooms}
                              onChange={e => handleUpdateBatchRow(row.id, 'rooms', e.target.value)}
                              placeholder="Rooms"
                              className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-white text-center"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            {batchGuestRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBatchRow(row.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional Quick Paste Box */}
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <ClipboardPaste className="w-3.5 h-3.5 text-white" />
                        Or Quick Paste Multiple Guests (CSV / Text)
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={batchPasteText}
                      onChange={e => setBatchPasteText(e.target.value)}
                      placeholder="Paste lines: Name, Phone, Pax, Rooms (e.g. Sujata Bhujel, 9845940693, 2, 1 room)"
                      className="w-full bg-slate-950 text-white font-mono border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                    />
                    {batchPasteText.trim() && (
                      <button
                        type="button"
                        onClick={handleSaveBatchPaste}
                        className="px-3 py-1.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-all"
                      >
                        Parse & Add All Pasted Guests to Vehicle #{formSN}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleSaveBatchRows}
                      className="bg-white hover:bg-neutral-200 text-black font-bold shadow-lg shadow-white/10 cursor-pointer"
                    >
                      ✓ Save All Rows to Vehicle #{formSN} at Once
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: SINGLE GUEST FORM */}
              {assignTab === 'SINGLE' && (
                <form onSubmit={handleCreateVehicleAssignment} className="space-y-4">
                  {/* Searchable Type & Filter Guest Input (Package Specific Filter) */}
                  <div className="space-y-1.5 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Search or Pick a CRM Booking
                      </label>
                      <button
                        type="button"
                        onClick={() => setFilterOnlySelectedTourGuests(!filterOnlySelectedTourGuests)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1 ${
                          filterOnlySelectedTourGuests
                            ? 'bg-white text-black border-white'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        {filterOnlySelectedTourGuests 
                          ? `Filter: ${formTour ? (formTour.length > 20 ? formTour.slice(0, 20) + '...' : formTour) : 'Selected Tour'} Only` 
                          : 'Show All Guests'}
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
                        placeholder={`Type guest name for ${formTour || 'selected tour'}...`}
                        className="w-full bg-slate-950 text-white font-bold border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-white"
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

                    {isGuestDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-800 animate-fade-in">
                        {filteredBookedGuests.length > 0 ? (
                          filteredBookedGuests.map(b => (
                            <div
                              key={b._id || (b as any).id}
                              onClick={() => handleSelectGuest(b)}
                              className="p-2.5 hover:bg-slate-800 cursor-pointer text-xs transition-all flex items-center justify-between"
                            >
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{b.customerName}</span>
                                  <span className="text-[9px] bg-white/10 text-white px-1.5 py-0.2 rounded font-mono">
                                    {b.packageName}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  📞 {b.contactPhone || (b as any).customerPhone || 'No Phone'}
                                </div>
                              </div>
                              <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded font-mono font-bold">
                                {b.seatsReserved || (b as any).pax || 1} Pax
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            No guest bookings found matching "{formTour}". Type manually below.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Guest / Group Lead Name & Contact Number */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Guest / Group Lead Name"
                      value={formCustomerName}
                      onChange={e => setFormCustomerName(e.target.value)}
                      placeholder="e.g. Sujata Bhujel or Group Name"
                      required
                    />
                    <Input
                      label="Contact Number"
                      value={formContactNumber}
                      onChange={e => setFormContactNumber(e.target.value)}
                      placeholder="e.g. 9845940693"
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
                      className="bg-white hover:bg-neutral-200 text-black font-bold shadow-lg shadow-white/10 cursor-pointer"
                    >
                      Save Vehicle & Guest Assignment
                    </Button>
                  </div>
                </form>
              )}

            </div>
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
