import React from 'react';
import { useGuides } from '../shared/hooks/operations/useOperations';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { GuideData } from '../types/erp';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';

export const GuidesPage: React.FC = () => {
  const { data: guides, isLoading, error, refetch } = useGuides();

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const columns: Column<GuideData>[] = [
    {
      key: 'name',
      header: 'Guide Name',
      accessor: g => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{g.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">ID: {g._id}</div>
        </div>
      )
    },
    {
      key: 'languages',
      header: 'Spoken Languages',
      accessor: g => (
        <div className="flex flex-wrap gap-1">
          {g.languages.map((l, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {l}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'certifications',
      header: 'Certifications',
      accessor: g => (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          {g.certifications.join(', ')}
        </div>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      accessor: g => <span className="font-bold text-amber-500">{g.rating} ★</span>
    },
    {
      key: 'status',
      header: 'Status & Availability',
      accessor: g => (
        <div className="flex items-center gap-2">
          <Badge variant={g.status === 'Active' ? 'success' : 'neutral'} dot>{g.status}</Badge>
          <Badge variant={g.availability ? 'info' : 'warning'}>{g.availability ? 'Available' : 'Assigned'}</Badge>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <DataTable
        title="Tour Guides Roster & Certifications"
        description="Manage licensed tour guides, high-altitude rescue certifications, spoken languages, ratings, and assignments"
        data={guides as any}
        columns={columns}
        searchPlaceholder="Search guides by name, language, certification..."
      />
    </div>
  );
};
