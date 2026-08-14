import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="flex items-center justify-between bg-neutral-950 p-2 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-extrabold text-white px-3">
          <Layers className="w-4 h-4 text-white" />
          <span>Dashboard View Center</span>
        </div>

        <div className="p-1 rounded-xl bg-black border border-white/10 flex items-center gap-1 text-xs relative">
          <button
            onClick={() => setActiveTab('EXECUTIVE')}
            className={`relative px-4 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 z-10 ${
              activeTab === 'EXECUTIVE' ? 'text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeTab === 'EXECUTIVE' && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white rounded-lg shadow-md shadow-white/10 z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive ERP Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('OPERATIONS')}
            className={`relative px-4 py-2 rounded-lg font-extrabold transition-all flex items-center gap-2 z-10 ${
              activeTab === 'OPERATIONS' ? 'text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {activeTab === 'OPERATIONS' && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white rounded-lg shadow-md shadow-white/10 z-[-1]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Compass className="w-4 h-4" />
            <span>Operations Overview</span>
          </button>
        </div>
      </div>

      {/* Render Selected Dashboard View with Entry Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderDashboardContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
