import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { SuperAdminDashboard } from '../components/dashboards/SuperAdminDashboard';
import { SalesDashboard } from '../components/dashboards/SalesDashboard';
import { OperationsDashboard } from '../components/dashboards/OperationsDashboard';
import { FinanceDashboard } from '../components/dashboards/FinanceDashboard';
import { LayoutDashboard, Compass, Layers } from 'lucide-react';

export const DashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'OPERATIONS' | 'AUTO'>(
    user.role === 'OPERATIONS' ? 'OPERATIONS' : 'EXECUTIVE'
  );

  const renderDashboardContent = () => {
    if (activeTab === 'EXECUTIVE') {
      return <SuperAdminDashboard onNavigate={onNavigate} />;
    }
    if (activeTab === 'OPERATIONS') {
      return <OperationsDashboard onNavigate={onNavigate} />;
    }

    switch (user.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard onNavigate={onNavigate} />;
      case 'SALES':
        return <SalesDashboard onNavigate={onNavigate} />;
      case 'OPERATIONS':
        return <OperationsDashboard onNavigate={onNavigate} />;
      case 'FINANCE':
        return <FinanceDashboard onNavigate={onNavigate} />;
      default:
        return <SuperAdminDashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* Top View Selector Tab */}
      <div className="flex items-center justify-between bg-[#161D2B] p-2 rounded-2xl border border-[#232D42]">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#B9F000] px-3">
          <Layers className="w-4 h-4 text-[#B9F000]" />
          <span>Dashboard View Center</span>
        </div>

        <div className="p-1 rounded-xl bg-[#0B0F17] border border-[#232D42] flex items-center text-xs">
          <button
            onClick={() => setActiveTab('EXECUTIVE')}
            className={`px-4 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'EXECUTIVE'
                ? 'bg-[#B9F000] text-slate-950 shadow-lg shadow-[#B9F000]/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            ⚡ Executive ERP Dashboard
          </button>
          <button
            onClick={() => setActiveTab('OPERATIONS')}
            className={`px-4 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'OPERATIONS'
                ? 'bg-[#B9F000] text-slate-950 shadow-lg shadow-[#B9F000]/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            🚌 Operations Overview
          </button>
        </div>
      </div>

      {/* Render Selected Dashboard */}
      {renderDashboardContent()}
    </div>
  );
};
