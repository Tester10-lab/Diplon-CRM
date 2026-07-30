import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/feedback/EmptyState';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Executive Analytics & Reports" />
      <EmptyState
        title="Reports Under Construction"
        description="The custom reporting engine is currently being developed for the next release."
      />
    </div>
  );
};
