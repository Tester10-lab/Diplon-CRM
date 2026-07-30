import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`} />
);

export const CardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <Skeleton className="h-7 w-36" />
    <Skeleton className="h-3 w-28" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full space-y-3">
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-3 w-96" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <TableSkeleton />
  </div>
);
