import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/feedback/EmptyState';

export const DocsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Documentation" />
      <EmptyState
        title="Documentation"
        description="The API and user documentation is currently being developed for the next release."
      />
    </div>
  );
};
