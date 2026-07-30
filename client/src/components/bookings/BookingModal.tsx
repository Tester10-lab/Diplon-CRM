import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PackageSelect } from './PackageSelect';
import { TourPackage, Booking } from '../../types';
import { usePackages } from '../../shared/hooks/packages/usePackages';
import { pushNotification } from '../../store/notificationStore';
import { Sparkles, Calendar, User, Phone, MapPin, Users, DollarSign, Bed, Copy, Check, Car, ShieldCheck } from 'lucide-react';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBooking: (booking: Partial<Booking>) => Promise<void> | void;
  initialPackageName?: string;
  initialDepartureDate?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSaveBooking,
  initialPackageName,
  initialDepartureDate
}) => {
  const { data: packages, createPackage } = usePackages();

  // Form State
  const [packageName, setPackageName] = useState(initialPackageName || '');
  const [customerName, setCustomerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [departureDate, setDepartureDate] = useState(initialDepartureDate || '2026-08-01');
  const [pickupPoint, setPickupPoint] = useState('');
  const [seatsReserved, setSeatsReserved] = useState<number>(1);
  const [ratePerPerson, setRatePerPerson] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentCollectionNote, setPaymentCollectionNote] = useState('');
  const [groupType, setGroupType] = useState<'private' | 'sharing'>('private');
  const [roomDetails, setRoomDetails] = useState('');
  const [status, setStatus] = useState<'CONFIRMED' | 'PENDING' | 'WAITLISTED'>('CONFIRMED');

  // UI Helper States
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFillMessage, setAutoFillMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialPackageName) setPackageName(initialPackageName);
      if (initialDepartureDate) setDepartureDate(initialDepartureDate);
    }
  }, [initialPackageName, initialDepartureDate, isOpen]);

  // Auto calculate total and remaining when seats or rate change
  useEffect(() => {
    if (seatsReserved > 0 && ratePerPerson > 0) {
      const calcTotal = seatsReserved * ratePerPerson;
      setTotalAmount(calcTotal);
    }
  }, [seatsReserved, ratePerPerson]);

  const remainingAmount = Math.max(0, totalAmount - advanceAmount);

  const handlePackageChange = (selectedName: string, pkg?: TourPackage) => {
    setPackageName(selectedName);
    if (pkg && pkg.basePricing > 0) {
      setRatePerPerson(pkg.basePricing);
    }
  };

  const handleCreatePackage = async (name: string) => {
    const created = await createPackage({
      name,
      basePricing: ratePerPerson || 5000,
      category: 'Custom Tour',
      durationDays: 2
    });
    return created;
  };

  const handleParseText = () => {
    if (!rawText.trim()) return;

    let extractedCount = 0;
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    const pkgLine = lines.find(l => 
      !l.toLowerCase().includes('booking confirmation') && 
      (l.toLowerCase().includes('package') || l.toLowerCase().includes('tour') || l.includes('–') || l.includes('-'))
    );
    if (pkgLine) {
      const cleanedPkg = pkgLine.replace(/^booking confirmation details:\s*/i, '').trim();
      setPackageName(cleanedPkg);
      extractedCount++;
    }

    const dateMatch = rawText.match(/(?:travel\s*date|date)\s*:?\s*([^\n\r,]+)/i);
    if (dateMatch) {
      setDepartureDate(dateMatch[1].trim());
      extractedCount++;
    }

    const nameMatch = rawText.match(/(?:full\s*name|name)\s*:?\s*([^\n\r,]+)/i);
    if (nameMatch) {
      setCustomerName(nameMatch[1].trim());
      extractedCount++;
    }

    const phoneMatch = rawText.match(/(?:contact\s*number|phone|mobile|nepali\s*contact)\s*:?\s*([^\n\r,]+)/i) || rawText.match(/(?:98|97)\d{8}/);
    if (phoneMatch) {
      const cleanedPhone = (phoneMatch[1] || phoneMatch[0]).replace(/[^\d+]/g, '');
      setContactPhone(cleanedPhone);
      extractedCount++;
    }

    const pickupMatch = rawText.match(/(?:pickup\s*point|pickup)\s*:?\s*([^\n\r,]+)/i);
    if (pickupMatch) {
      setPickupPoint(pickupMatch[1].trim());
      extractedCount++;
    }

    const rateMatch = rawText.match(/(\d+)\s*(?:per\s*person|per\s*pax|pax\s*rate)/i) || rawText.match(/(?:rate|price)\s*:?\s*(\d+)/i);
    if (rateMatch) {
      const rateVal = parseInt(rateMatch[1], 10);
      if (!isNaN(rateVal)) {
        setRatePerPerson(rateVal);
        extractedCount++;
      }
    }

    const totalMatch = rawText.match(/(\d+)\s*total/i) || rawText.match(/total\s*:?\s*(\d+)/i);
    if (totalMatch) {
      const totVal = parseInt(totalMatch[1], 10);
      if (!isNaN(totVal)) {
        setTotalAmount(totVal);
        extractedCount++;
      }
    }

    const advanceMatch = rawText.match(/advance\s*:?\s*(\d+)/i) || rawText.match(/advance\s*(\d+)/i);
    if (advanceMatch) {
      const advVal = parseInt(advanceMatch[1], 10);
      if (!isNaN(advVal)) {
        setAdvanceAmount(advVal);
        extractedCount++;
      }
    }

    const collectMatch = rawText.match(/([^\n\r]*(?:collect[^\n\r]*|remaining[^\n\r]*))/i);
    if (collectMatch) {
      setPaymentCollectionNote(collectMatch[1].trim());
      extractedCount++;
    }

    const paxMatch = rawText.match(/(\d+)\s*(?:person|pax|people|traveler)/i);
    if (paxMatch) {
      const paxVal = parseInt(paxMatch[1], 10);
      if (!isNaN(paxVal)) {
        setSeatsReserved(paxVal);
        extractedCount++;
      }
    }

    if (rawText.toLowerCase().includes('private')) {
      setGroupType('private');
    } else if (rawText.toLowerCase().includes('sharing')) {
      setGroupType('sharing');
    }

    const roomMatch = rawText.match(/(?:rooms?|accommodation)\s*:?\s*([^\n\r]+)/i) || rawText.match(/(\d+\s*room[^\n\r]*)/i);
    if (roomMatch) {
      setRoomDetails(roomMatch[1].trim());
      extractedCount++;
    }

    setAutoFillMessage(`✨ Extracted ${extractedCount} fields successfully!`);
    setTimeout(() => setAutoFillMessage(null), 4000);
  };

  const generateFormattedConfirmation = () => {
    return `Booking confirmation details: 
${packageName} 
Travel date: ${departureDate}
Full name: ${customerName}
Nepali contact number: ${contactPhone}
Pickup point: ${pickupPoint}
${ratePerPerson.toLocaleString()} per person
${totalAmount.toLocaleString()} total
advance ${advanceAmount.toLocaleString()}
${paymentCollectionNote || `${remainingAmount.toLocaleString()}/- Rs Collect (remaining)`}
${seatsReserved} Person 
${groupType === 'private' ? 'Private' : 'Sharing'} tour
Rooms: ${roomDetails}`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateFormattedConfirmation());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSaveBooking({
        packageName,
        customerName,
        contactPhone,
        departureDate,
        pickupPoint,
        seatsReserved,
        ratePerPerson,
        totalAmount,
        paidAmount: advanceAmount,
        advanceAmount,
        remainingAmount,
        paymentCollectionNote,
        groupType,
        roomDetails,
        status
      });

      // Push real-time notification to Notification Center
      pushNotification({
        title: 'New Booking Confirmation',
        message: `Booking confirmed for ${customerName} (${packageName} on ${departureDate})`,
        category: 'PAYMENTS',
        severity: 'success'
      });

      onClose();
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Customer / Booking Confirmation"
      description="Add a customer or group to this tour departure with auto-calculated total, pickup point & room allocation."
      maxWidth="2xl"
    >
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">

        {/* Quick Auto-Fill Text Parser Expandable Banner */}
        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 rounded-2xl p-4 text-white shadow-lg border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/30 backdrop-blur-md text-amber-300 border border-indigo-400/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-wide uppercase text-indigo-200">Smart Quick Auto-Fill</h4>
                <p className="text-xs text-slate-300">Paste WhatsApp/Viber booking text to instantly fill all fields</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAutoFill(!showAutoFill)}
              className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {showAutoFill ? 'Hide Parser' : 'Paste Text'}
            </Button>
          </div>

          {showAutoFill && (
            <div className="mt-3.5 pt-3 border-t border-indigo-500/30 space-y-2.5 animate-fade-in">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Paste booking details here...\n\nExample:\nBooking confirmation details:\nSailung–Kalinchowk Tour Package\nTravel date: 2th aug\nFull name: Nirvik Sapkota\nNepali contact number: 9841876047\nPickup point: Ratna Rajya School\n5500 per person\n38500 total\nadvance 5000\n33,500/- Rs Collect on scorpio(remaining)\n7 Person\nprivate or sharing\nRooms 2 room for 7 people`}
                rows={5}
                className="w-full text-xs font-mono bg-slate-950/80 text-emerald-300 p-3 rounded-xl border border-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 placeholder-slate-500"
              />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleParseText}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Extract & Populate Form
                </Button>
                {autoFillMessage && (
                  <span className="text-xs text-emerald-400 font-semibold animate-bounce">{autoFillMessage}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Package Autoselect */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Tour Package (Select or Type New Package)</span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">Autoselect / Type-to-Create</span>
            </label>
            <PackageSelect
              packages={packages}
              value={packageName}
              onChange={handlePackageChange}
              onCreatePackage={handleCreatePackage}
              placeholder="Start typing tour package (e.g. Sailung–Kalinchowk Tour Package)..."
            />
          </div>

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Full Name"
              icon={<User className="w-4 h-4" />}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Nirvik Sapkota"
              required
            />
            <Input
              label="Nepali Contact Number"
              icon={<Phone className="w-4 h-4" />}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. 9841876047"
              required
            />
          </div>

          {/* Travel Date & Pickup Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Travel Date"
              icon={<Calendar className="w-4 h-4" />}
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              placeholder="e.g. 2nd Aug / 2026-08-02"
              required
            />
            <Input
              label="Pickup Point"
              icon={<MapPin className="w-4 h-4" />}
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              placeholder="e.g. Ratna Rajya School"
              required
            />
          </div>

          {/* Pax & Rate per Person */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="No. of Persons (Pax)"
              type="number"
              min={1}
              icon={<Users className="w-4 h-4" />}
              value={seatsReserved}
              onChange={(e) => setSeatsReserved(parseInt(e.target.value, 10) || 1)}
              required
            />
            <Input
              label="Rate Per Person (NPR)"
              type="number"
              currencyPrefix="NPR"
              value={ratePerPerson}
              onChange={(e) => setRatePerPerson(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Total Amount (NPR)"
              type="number"
              currencyPrefix="NPR"
              value={totalAmount}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              helperText="Auto-calculated (Pax × Rate)"
              required
            />
          </div>

          {/* Advance & Remaining Amount + Note */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Input
              label="Advance Amount Paid"
              type="number"
              currencyPrefix="NPR"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Remaining Balance
              </label>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-sm">
                NPR {remainingAmount.toLocaleString()}
              </div>
            </div>
            <div className="md:col-span-3">
              <Input
                label="Payment Collection Note / Driver Collect"
                icon={<Car className="w-4 h-4" />}
                value={paymentCollectionNote}
                onChange={(e) => setPaymentCollectionNote(e.target.value)}
                placeholder="e.g. 33,500/- Rs Collect on scorpio(remaining)"
              />
            </div>
          </div>

          {/* Group Type & Room Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Tour Group Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGroupType('private')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    groupType === 'private'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Private Tour
                </button>
                <button
                  type="button"
                  onClick={() => setGroupType('sharing')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    groupType === 'sharing'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Sharing Tour
                </button>
              </div>
            </div>

            <Input
              label="Room Allocation / Requirements"
              icon={<Bed className="w-4 h-4" />}
              value={roomDetails}
              onChange={(e) => setRoomDetails(e.target.value)}
              placeholder="e.g. 2 room for 7 people"
            />
          </div>

          {/* Status Selection */}
          <div className="w-full">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Booking Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="CONFIRMED">CONFIRMED (Confirmed Seat Allocation)</option>
              <option value="PENDING">PENDING (Awaiting Advance Payment)</option>
              <option value="WAITLISTED">WAITLISTED (High Demand Queue)</option>
            </select>
          </div>

          {/* Live Formatted Summary Card */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Live Confirmation Summary Card
              </h5>
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 px-2.5 py-1 rounded-lg border border-indigo-700/50 transition-all font-medium"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied to Clipboard!' : 'Copy Confirmation'}
              </button>
            </div>

            <div className="font-mono text-xs text-slate-300 space-y-1 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              <div className="text-white font-bold">{packageName}</div>
              <div>Travel date: <span className="text-amber-300">{departureDate}</span></div>
              <div>Full name: <span className="text-white">{customerName}</span></div>
              <div>Nepali contact number: <span className="text-emerald-400">{contactPhone}</span></div>
              <div>Pickup point: {pickupPoint}</div>
              <div>NPR {ratePerPerson.toLocaleString()} per person</div>
              <div>NPR {totalAmount.toLocaleString()} total</div>
              <div>Advance NPR {advanceAmount.toLocaleString()}</div>
              <div className="text-amber-400 font-semibold">{paymentCollectionNote || `NPR ${remainingAmount.toLocaleString()} Collect (remaining)`}</div>
              <div>{seatsReserved} Person ({groupType})</div>
              <div>Rooms: {roomDetails}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? 'Saving...' : 'Add Customer to Tour'}
            </Button>
          </div>

        </form>
      </div>
    </Modal>
  );
};
