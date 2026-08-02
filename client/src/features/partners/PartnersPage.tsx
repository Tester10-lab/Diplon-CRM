import React, { useState, useEffect } from 'react';
import { getB2BRecords, saveB2BRecords, B2BRecord } from './b2bLedgerStore';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Building2, Plus, Download, Search, DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle2, FileSpreadsheet, Calculator } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

export const PartnersPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAgency = user?.role === 'AGENCY';

  const [rawRecords, setRawRecords] = useState<B2BRecord[]>(getB2BRecords());
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Agency Multi-Tenant Filter
  const records = rawRecords.filter(r => {
    if (!isAgency || !user) return true;
    const uCompany = (user.companyName || user.name || '').toLowerCase().trim();
    const rCompany = (r.companyName || '').toLowerCase().trim();
    return rCompany.includes(uCompany) || uCompany.includes(rCompany);
  });

  // Form State for + Add B2B Record
  const [formCompany, setFormCompany] = useState('');
  const [formDate, setFormDate] = useState('29th Sep 2025');
  const [formPkg, setFormPkg] = useState('Upper Mustang');
  const [formDuration, setFormDuration] = useState('4N/5D');
  const [formCustomer, setFormCustomer] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPax, setFormPax] = useState<number>(3);
  const [formRatePerPax, setFormRatePerPax] = useState<number>(15500);
  const [formBuying, setFormBuying] = useState<number>(46500);
  const [formCollection, setFormCollection] = useState<number>(44500);
  const [formVehicle, setFormVehicle] = useState('Scorpio');
  const [formPickup, setFormPickup] = useState('');
  const [formPaymentStatus, setFormPaymentStatus] = useState('Balance on Pickup');
  const [formNotes, setFormNotes] = useState('');

  // Auto-calculate Buying Price whenever Rate per Pax or Pax changes
  useEffect(() => {
    const computedBuying = (formRatePerPax || 0) * (formPax || 0);
    setFormBuying(computedBuying);
    setFormNotes(`Buying calc: ${formRatePerPax}*${formPax}=${computedBuying} | Collection line: ${formCollection}/- Rs collect on ${formVehicle}`);
  }, [formRatePerPax, formPax, formCollection, formVehicle]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const companyList = Array.from(new Set(records.map(r => r.companyName)));

  const filteredRecords = records.filter(r => {
    const matchesCompany = selectedCompany === 'ALL' || r.companyName === selectedCompany;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      r.customerName.toLowerCase().includes(query) ||
      r.packageName.toLowerCase().includes(query) ||
      r.contactNumber.toLowerCase().includes(query) ||
      r.pickupLocation.toLowerCase().includes(query) ||
      r.notes.toLowerCase().includes(query);
    return matchesCompany && matchesSearch;
  });

  const totalBuying = filteredRecords.reduce((sum, r) => sum + (r.buyingPrice || 0), 0);
  const totalCollection = filteredRecords.reduce((sum, r) => sum + (r.collectionAmount || 0), 0);
  const totalProfit = filteredRecords.reduce((sum, r) => sum + (r.profit || 0), 0);
  const totalPax = filteredRecords.reduce((sum, r) => sum + (r.pax || 0), 0);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer.trim()) return;

    const computedBuying = (formRatePerPax || 0) * (formPax || 0);
    const computedProfit = computedBuying - formCollection;

    const newRec: B2BRecord = {
      id: `b2b_${Date.now()}`,
      companyName: formCompany,
      travelDate: formDate,
      packageName: formPkg,
      tourDuration: formDuration,
      customerName: formCustomer,
      contactNumber: formContact,
      pax: formPax,
      ratePerPax: formRatePerPax,
      vehicleType: formVehicle,
      pickupLocation: formPickup,
      buyingPrice: computedBuying,
      collectionAmount: formCollection,
      profit: computedProfit,
      paymentStatus: formPaymentStatus,
      tourStatus: 'Confirmed',
      notes: formNotes || `Buying calc: ${formRatePerPax}*${formPax}=${computedBuying} | Collection line: ${formCollection}/- Rs collect on ${formVehicle}`
    };

    const updated = [newRec, ...rawRecords];
    setRawRecords(updated);
    saveB2BRecords(updated);
    setIsAddOpen(false);
    showToast(`✅ Added B2B record for ${formCustomer} (${formCompany})!`);
  };

  const handleExportCSV = () => {
    const headers = [
      'Travel Date',
      'Package Name',
      'Tour Duration',
      'Customer Name',
      'Contact Number',
      'No. of Persons',
      'Rate Per Pax',
      'Vehicle Type',
      'Pickup Location',
      'Buying Price (Rate*Pax)',
      'Collection',
      'Profit',
      'Payment Status',
      'Tour Status',
      'Notes'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.travelDate}"`,
      `"${r.packageName}"`,
      `"${r.tourDuration}"`,
      `"${r.customerName}"`,
      `"${r.contactNumber}"`,
      r.pax,
      r.ratePerPax || 0,
      `"${r.vehicleType}"`,
      `"${r.pickupLocation}"`,
      r.buyingPrice,
      r.collectionAmount,
      r.profit,
      `"${r.paymentStatus}"`,
      `"${r.tourStatus}"`,
      `"${r.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `B2B_Company_Ledger_${selectedCompany}_2025.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`📥 Exported ${filteredRecords.length} B2B records to CSV!`);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-emerald-400/40">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
              B2B Company Ledger & Operations
            </h1>
            <Badge variant="primary">Company Breakdown</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Arranged B2B company booking ledgers with auto-calculated Rate × Pax, buying price, collection line, and profit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4 text-emerald-400" />}
            onClick={handleExportCSV}
          >
            Export Excel / CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddOpen(true)}
          >
            + Add B2B Booking
          </Button>
        </div>
      </div>

      {/* Company Selector Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCompany('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedCompany === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            All Companies ({records.length})
          </button>

          {companyList.map(comp => (
            <button
              key={comp}
              onClick={() => setSelectedCompany(comp)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCompany === comp
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              {comp} ({records.filter(r => r.companyName === comp).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search customer, package, location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings / Pax</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {filteredRecords.length} Bookings <span className="text-xs text-indigo-400 font-mono">({totalPax} Pax)</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Buying Price</span>
            <div className="text-xl font-extrabold text-slate-200 mt-1 font-mono">
              NPR {totalBuying.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Collection</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
              NPR {totalCollection.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Profit Ledger</span>
            <div className={`text-xl font-extrabold mt-1 font-mono ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? `+ NPR ${totalProfit.toLocaleString()}` : `- NPR ${Math.abs(totalProfit).toLocaleString()}`}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${totalProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {totalProfit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          </div>
        </div>

      </div>

      {/* Spreadsheet Data Table Matching Screenshot */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] min-w-[1300px]">
            
            {/* Header Row Matching Excel Blue Header */}
            <thead>
              <tr className="bg-indigo-950/90 border-b border-indigo-900/80 text-slate-200 font-extrabold uppercase tracking-wider">
                <th className="p-3 border-r border-indigo-900/60">B2B Agency</th>
                <th className="p-3 border-r border-indigo-900/60">Travel Date</th>
                <th className="p-3 border-r border-indigo-900/60">Package Name</th>
                <th className="p-3 border-r border-indigo-900/60">Tour Duration</th>
                <th className="p-3 border-r border-indigo-900/60">Customer Name</th>
                <th className="p-3 border-r border-indigo-900/60">Contact Number</th>
                <th className="p-3 border-r border-indigo-900/60 text-center">No. of Persons</th>
                <th className="p-3 border-r border-indigo-900/60 text-right">Rate / Pax</th>
                <th className="p-3 border-r border-indigo-900/60">Vehicle Type</th>
                <th className="p-3 border-r border-indigo-900/60">Pickup Location</th>
                <th className="p-3 border-r border-indigo-900/60 text-right">Buying Price (Rate×Pax)</th>
                <th className="p-3 border-r border-indigo-900/60 text-right">Collection</th>
                <th className="p-3 border-r border-indigo-900/60 text-right">Profit</th>
                <th className="p-3 border-r border-indigo-900/60">Payment Status</th>
                <th className="p-3 border-r border-indigo-900/60">Tour Status</th>
                <th className="p-3">Notes & Buying Calc</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={16} className="p-8 text-center text-slate-500 font-semibold">
                    No B2B records found matching query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    className="hover:bg-slate-800/40 transition-colors border-b border-slate-800/40"
                  >
                    <td className="p-3 border-r border-slate-800/40 font-bold text-amber-300 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{r.companyName}</span>
                      </span>
                    </td>

                    <td className="p-3 font-semibold text-slate-200 whitespace-nowrap border-r border-slate-800/40">
                      {r.travelDate}
                    </td>

                    <td className="p-3 font-bold text-white whitespace-nowrap border-r border-slate-800/40">
                      {r.packageName}
                    </td>

                    <td className="p-3 text-slate-400 whitespace-nowrap border-r border-slate-800/40 font-mono">
                      {r.tourDuration}
                    </td>

                    <td className="p-3 font-bold text-indigo-300 border-r border-slate-800/40">
                      {r.customerName}
                    </td>

                    <td className="p-3 text-slate-300 font-mono border-r border-slate-800/40 whitespace-nowrap">
                      {r.contactNumber}
                    </td>

                    <td className="p-3 font-extrabold text-amber-400 text-center border-r border-slate-800/40 font-mono">
                      {r.pax}
                    </td>

                    {/* Rate Per Pax */}
                    <td className="p-3 font-mono font-bold text-slate-300 text-right border-r border-slate-800/40 whitespace-nowrap">
                      {r.ratePerPax ? `NPR ${r.ratePerPax.toLocaleString()}` : '-'}
                    </td>

                    <td className="p-3 text-slate-200 border-r border-slate-800/40 font-semibold">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {r.vehicleType}
                      </span>
                    </td>

                    <td className="p-3 text-slate-300 border-r border-slate-800/40 max-w-xs truncate">
                      {r.pickupLocation}
                    </td>

                    {/* Buying Price (Rate * Pax) */}
                    <td className="p-3 font-mono font-extrabold text-white text-right border-r border-slate-800/40 whitespace-nowrap">
                      {r.buyingPrice ? `NPR ${r.buyingPrice.toLocaleString()}` : '0'}
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-400 text-right border-r border-slate-800/40 whitespace-nowrap">
                      {r.collectionAmount ? `NPR ${r.collectionAmount.toLocaleString()}` : '0'}
                    </td>

                    <td className="p-3 font-mono font-black text-right border-r border-slate-800/40 whitespace-nowrap">
                      {r.profit >= 0 ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          +{r.profit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          -{Math.abs(r.profit).toLocaleString()}
                        </span>
                      )}
                    </td>

                    <td className="p-3 border-r border-slate-800/40 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {r.paymentStatus}
                      </span>
                    </td>

                    <td className="p-3 border-r border-slate-800/40 whitespace-nowrap">
                      <Badge variant="success" dot>{r.tourStatus}</Badge>
                    </td>

                    <td className="p-3 text-slate-400 text-[10px] max-w-md truncate font-mono">
                      {r.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add B2B Record Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add B2B Company Booking Record"
        description="Insert new B2B agency booking entry with per-person rate & auto-calculated buying price."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="B2B Company Name"
              value={formCompany}
              onChange={e => setFormCompany(e.target.value)}
              placeholder="e.g. B2B Partner Agency"
              required
            />
            <Input label="Travel Date" value={formDate} onChange={e => setFormDate(e.target.value)} placeholder="e.g. 29th Sep 2025" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Package Name" value={formPkg} onChange={e => setFormPkg(e.target.value)} required />
            <Input label="Tour Duration" value={formDuration} onChange={e => setFormDuration(e.target.value)} placeholder="e.g. 4N/5D" required />
            <Input label="Vehicle Type" value={formVehicle} onChange={e => setFormVehicle(e.target.value)} placeholder="Scorpio / EV Jeep" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Customer Name" value={formCustomer} onChange={e => setFormCustomer(e.target.value)} placeholder="Full Name" required />
            <Input label="Contact Number" value={formContact} onChange={e => setFormContact(e.target.value)} placeholder="Phone" required />
            <Input label="No. of Persons (Pax)" type="number" value={formPax} onChange={e => setFormPax(Number(e.target.value))} required />
          </div>

          <Input label="Pickup Location" value={formPickup} onChange={e => setFormPickup(e.target.value)} placeholder="e.g. Gongabu / Kalanki" required />

          {/* Rate Per Pax & Auto-Calculated Buying Price Box (User Screenshot Requested) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Calculator className="w-4 h-4" />
              <span>Buying Price & Collection Auto-Calculator</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Rate Per Person (NPR)"
                type="number"
                value={formRatePerPax}
                onChange={e => setFormRatePerPax(Number(e.target.value))}
                placeholder="15500"
                required
              />

              <Input
                label="Buying Price (Auto: Rate × Pax)"
                type="number"
                value={formBuying}
                onChange={e => setFormBuying(Number(e.target.value))}
                required
              />

              <Input
                label="Collection Amount (NPR)"
                type="number"
                value={formCollection}
                onChange={e => setFormCollection(Number(e.target.value))}
                required
              />
            </div>

            {/* Formula Live Preview Banner */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-bold font-mono">
              <div className="text-slate-300">
                Formula: <span className="text-indigo-400">NPR {formRatePerPax?.toLocaleString()} × {formPax} Pax = NPR {formBuying?.toLocaleString()}</span>
              </div>
              <div className={formBuying - formCollection >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                Calculated Profit: {formBuying - formCollection >= 0 ? `+ NPR ${(formBuying - formCollection).toLocaleString()}` : `- NPR ${Math.abs(formBuying - formCollection).toLocaleString()}`}
              </div>
            </div>
          </div>

          <Input
            label="Notes & Buying Calc Formula"
            value={formNotes}
            onChange={e => setFormNotes(e.target.value)}
            placeholder="e.g. Buying calc: 15500*3=46500 | Collection line: 44500/- Rs collect on Scorpio"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 text-white font-bold">Save B2B Entry</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
