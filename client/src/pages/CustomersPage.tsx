import React from 'react';
import { useCustomers } from '../shared/hooks/customers/useCustomers';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { CustomerData } from '../types/erp';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { Mail, Phone } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { data: customers, isLoading, error, refetch } = useCustomers();

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const columns: Column<CustomerData>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      searchValue: c => `${c.firstName} ${c.lastName}`,
      accessor: c => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#B9F000]/20 text-[#B9F000] font-black flex items-center justify-center border border-[#B9F000]/40">
            {c.firstName[0]}
          </div>
          <div>
            <div className="font-bold text-white">{c.firstName} {c.lastName}</div>
            <div className="text-[11px] text-slate-400 font-mono">ID: {c._id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact Info',
      accessor: c => (
        <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 text-xs"><Mail className="w-3.5 h-3.5 text-slate-400" />{c.email}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><Phone className="w-3.5 h-3.5 text-slate-400" />{c.phone}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: c => <Badge variant={c.status === 'ACTIVE' ? 'success' : 'info'} dot>{c.status}</Badge>
    },
    {
      key: 'totalBookings',
      header: 'Bookings',
      accessor: c => <span className="font-semibold">{c.totalBookings} Bookings</span>
    },
    {
      key: 'totalSpent',
      header: 'Total Value',
      accessor: c => <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400">NPR {c.totalSpent.toLocaleString()}</span>
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <DataTable
        title="Customer Directory & CRM Accounts"
        description="Manage customer profiles, lead statuses, traveler links, and lifetime booking value"
        data={customers as any}
        columns={columns}
        searchPlaceholder="Search customers by name, email, phone..."
      />
    </div>
  );
};
