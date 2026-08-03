import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, Column } from '../components/tables/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { usePackages } from '../shared/hooks/packages/usePackages';
import { useAuthStore } from '../store/authStore';
import { TourPackage } from '../types';
import { CustomPriceRequest } from '../types/erp';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { Compass, Plus, Sparkles, Tag, Clock, Calendar, DollarSign, Send, CheckCircle2, XCircle, MessageSquare, Edit3, Save } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'EV Van',
  'Deluxe Bus',
  'AC Bus',
  'Jeep',
  'Bolero',
  '1 Day Hike',
  'Trek',
  'Short Tour / Overland'
];

const INITIAL_CUSTOM_REQUESTS: CustomPriceRequest[] = [
  {
    id: 'CPR-901',
    agencyCompanyId: 'cmp_himalayan_02',
    agencyName: 'Himalayan Treks & B2B Agency',
    packageName: 'Upper Mustang Jeep Safari',
    pax: 16,
    travelDate: '2026-08-10',
    requestedPrice: 48000,
    quotedPrice: 50000,
    status: 'QUOTED',
    adminNotes: 'Admin quoted NPR 50,000 per jeep for 16 pax group.',
    createdAt: '2026-07-28 11:30'
  },
  {
    id: 'CPR-902',
    agencyCompanyId: 'cmp_everest_03',
    agencyName: 'Everest Global B2B',
    packageName: 'Sailung–Kalinchowk Tour Package',
    pax: 7,
    travelDate: '2026-08-02',
    requestedPrice: 5000,
    status: 'PENDING',
    createdAt: '2026-07-28 09:15'
  }
];

export const PackagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: packages, isLoading, error, refetch, createPackage } = usePackages();
  const isAgency = user.role === 'AGENCY';

  const [activeSubTab, setActiveSubTab] = useState<'PACKAGES' | 'CUSTOM_PRICE_REQUESTS'>('PACKAGES');
  const [customRequests, setCustomRequests] = useState<CustomPriceRequest[]>(INITIAL_CUSTOM_REQUESTS);

  // New Package Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Jeep');
  const [durationDays, setDurationDays] = useState<number>(2);
  const [basePricing, setBasePricing] = useState<number>(5500);
  const [description, setDescription] = useState('');

  // Edit Package Modal
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Jeep');
  const [editDurationDays, setEditDurationDays] = useState<number>(2);
  const [editBasePricing, setEditBasePricing] = useState<number>(5500);
  const [editDescription, setEditDescription] = useState('');

  // Custom Price Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqPackage, setReqPackage] = useState('Upper Mustang');
  const [reqPax, setReqPax] = useState<number>(7);
  const [reqDate, setReqDate] = useState('2026-08-10');
  const [reqPrice, setReqPrice] = useState<number>(17000);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const handleCreatePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createPackage({
        name: name.trim(),
        category,
        durationDays,
        basePricing,
        description: description.trim() || 'Standard tour package'
      });
      setIsModalOpen(false);
      showToast(`✅ Created package "${name}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditModal = (pkg: TourPackage) => {
    setEditingPackage(pkg);
    setEditName(pkg.name);
    setEditCategory(pkg.category || 'Jeep');
    setEditDurationDays(pkg.durationDays || 2);
    setEditBasePricing(pkg.basePricing || 5500);
    setEditDescription(pkg.description || '');
  };

  const handleSaveEditPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage || !editName.trim()) return;

    // Update in local storage
    const STORAGE_KEY = 'diplon_packages_catalog_v5';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const currentList: TourPackage[] = saved ? JSON.parse(saved) : packages;
      const updatedList = currentList.map(p => {
        if (p._id === editingPackage._id) {
          return {
            ...p,
            name: editName.trim(),
            category: editCategory,
            durationDays: editDurationDays,
            basePricing: editBasePricing,
            description: editDescription.trim()
          };
        }
        return p;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      refetch();
      setEditingPackage(null);
      showToast(`✨ Package "${editName}" updated successfully!`);
    } catch (err) {
      console.error('Failed to save edited package:', err);
    }
  };

  const handleCreatePriceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: CustomPriceRequest = {
      id: `CPR-${Math.floor(100 + Math.random() * 900)}`,
      agencyCompanyId: user.companyId,
      agencyName: user.companyName,
      packageName: reqPackage,
      pax: reqPax,
      travelDate: reqDate,
      requestedPrice: reqPrice,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setCustomRequests(prev => [newReq, ...prev]);
    setIsRequestModalOpen(false);
    showToast(`✨ Custom price request submitted for Admin review!`);
  };

  const handleAdminApproveRequest = (id: string, quotedPrice: number) => {
    setCustomRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED', quotedPrice } : r));
    showToast(`✅ Custom price request approved at NPR ${quotedPrice.toLocaleString()}`);
  };

  const handleAdminRejectRequest = (id: string) => {
    setCustomRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    showToast(`❌ Custom price request rejected.`);
  };

  const columns: Column<TourPackage>[] = [
    {
      key: 'name',
      header: 'PACKAGE NAME & DESCRIPTION',
      accessor: p => (
        <div className="space-y-1">
          <div className="font-extrabold text-white text-sm flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{p.name}</span>
          </div>
          {p.description && (
            <div className="text-xs text-slate-300 font-medium line-clamp-1">{p.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      header: 'CATEGORY',
      accessor: p => (
        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shadow-sm">
          <Tag className="w-3 h-3 text-indigo-400" />
          {p.category || 'Jeep'}
        </span>
      )
    },
    {
      key: 'durationDays',
      header: 'DURATION',
      accessor: p => (
        <span className="text-xs text-amber-300 flex items-center gap-1 font-bold font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          {p.durationDays ? `${p.durationDays - 1}N/${p.durationDays}D` : '1N/2D'}
        </span>
      )
    },
    {
      key: 'basePricing',
      header: 'STANDARD BASE PRICE',
      accessor: p => (
        <div className="font-extrabold font-mono text-sm text-emerald-400">
          NPR {p.basePricing ? p.basePricing.toLocaleString() : '5,500'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      accessor: p => (
        <Button
          size="sm"
          variant="secondary"
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5"
          onClick={() => handleOpenEditModal(p)}
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span>Edit</span>
        </Button>
      )
    }
  ];

  const requestColumns: Column<CustomPriceRequest>[] = [
    {
      key: 'id',
      header: 'Request Ref',
      accessor: r => (
        <div>
          <div className="font-extrabold font-mono text-amber-400">{r.id}</div>
          <div className="text-[10px] text-slate-400">{r.createdAt}</div>
        </div>
      )
    },
    {
      key: 'agencyName',
      header: 'Agency Partner',
      accessor: r => <span className="font-bold text-white text-xs">{r.agencyName}</span>
    },
    {
      key: 'packageName',
      header: 'Package & Group',
      accessor: r => (
        <div>
          <div className="font-bold text-indigo-300 text-xs">{r.packageName}</div>
          <div className="text-[11px] text-slate-400 font-mono">👥 {r.pax} Pax • Date: {r.travelDate}</div>
        </div>
      )
    },
    {
      key: 'requestedPrice',
      header: 'Requested Price',
      accessor: r => (
        <div className="font-mono text-xs font-bold text-white">
          NPR {r.requestedPrice.toLocaleString()}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: r => (
        <Badge
          variant={
            r.status === 'APPROVED' ? 'success' : r.status === 'PENDING' ? 'warning' : r.status === 'QUOTED' ? 'info' : 'danger'
          }
          dot
        >
          {r.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Admin Approval Actions',
      accessor: r => (
        !isAgency && r.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              onClick={() => handleAdminApproveRequest(r.id, r.requestedPrice)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/30"
              onClick={() => handleAdminRejectRequest(r.id)}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </Button>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-400">{r.status}</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-amber-300">
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            Tour Package Catalog & Custom Price Requests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse base pricing per person, edit packages, or request custom group pricing for high-pax tour departures
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setActiveSubTab('PACKAGES')}
              className={`px-3.5 py-1.5 rounded-lg font-extrabold transition-all ${
                activeSubTab === 'PACKAGES' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 Tour Catalog
            </button>
            <button
              onClick={() => setActiveSubTab('CUSTOM_PRICE_REQUESTS')}
              className={`px-3.5 py-1.5 rounded-lg font-extrabold transition-all ${
                activeSubTab === 'CUSTOM_PRICE_REQUESTS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              💰 Custom Price Requests ({customRequests.length})
            </button>
          </div>

          {isAgency ? (
            <Button
              variant="primary"
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>+ Request Custom Price</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Tour Package</span>
            </Button>
          )}
        </div>
      </div>

      {activeSubTab === 'PACKAGES' ? (
        <DataTable
          title="Packages Master Directory (Editable)"
          description="Catalog of standard tour packages and base pricing per person — click Edit on any row to update"
          data={packages as any}
          columns={columns}
          searchPlaceholder="Search tour packages by name, category, rate..."
        />
      ) : (
        <DataTable
          title="Agency Custom Price Request Stream"
          description="Agencies can request custom price quotes for large groups or custom itineraries"
          data={customRequests as any}
          columns={requestColumns}
          searchPlaceholder="Search custom price requests..."
        />
      )}

      {/* Add Package Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Tour Package"
        description="Add a new tour package to the master catalog"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePackageSubmit} className="space-y-4">
          <Input
            label="Package Name"
            icon={<Compass className="w-4 h-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Upper Mustang"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Input
              label="Duration (Days)"
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <Input
            label="Base Price Per Person (NPR)"
            type="number"
            value={basePricing}
            onChange={(e) => setBasePricing(parseFloat(e.target.value) || 0)}
            required
          />

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Description / Itinerary Summary
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 4N/5D Trans-Himalayan Jeep Safari to Lo Manthang & Mustang."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Save Package
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Package Modal */}
      <Modal
        isOpen={!!editingPackage}
        onClose={() => setEditingPackage(null)}
        title={`Edit Tour Package: ${editingPackage?.name}`}
        description="Update package name, category, duration, rate, and itinerary description."
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditPackage} className="space-y-4">
          <Input
            label="Package Name"
            icon={<Compass className="w-4 h-4" />}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. Upper Mustang"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Input
              label="Duration (Total Days)"
              type="number"
              value={editDurationDays}
              onChange={(e) => setEditDurationDays(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <Input
            label="Base Price Per Person (NPR)"
            type="number"
            value={editBasePricing}
            onChange={(e) => setEditBasePricing(parseFloat(e.target.value) || 0)}
            required
          />

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Description / Itinerary Summary
            </label>
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="e.g. 4N/5D Trans-Himalayan Jeep Safari to Lo Manthang & Mustang."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditingPackage(null)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              <span>Update Package</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Custom Price Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Custom Package Pricing"
        description="Submit custom price quote request to Admin for high-pax or custom tours."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePriceRequest} className="space-y-4">
          <Input
            label="Tour Package Name"
            value={reqPackage}
            onChange={e => setReqPackage(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Passenger Count (Pax)"
              type="number"
              value={reqPax}
              onChange={e => setReqPax(Number(e.target.value))}
              required
            />
            <Input
              label="Travel Date"
              value={reqDate}
              onChange={e => setReqDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Requested Custom Price (NPR)"
            type="number"
            value={reqPrice}
            onChange={e => setReqPrice(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
