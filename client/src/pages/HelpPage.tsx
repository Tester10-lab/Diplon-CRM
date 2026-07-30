import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/feedback/EmptyState';

export const HelpPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Help Center" />
      <EmptyState
        title="Help Center"
        description="For support, please contact your system administrator or support@diplon.com."
      />
    </div>
  );
};
