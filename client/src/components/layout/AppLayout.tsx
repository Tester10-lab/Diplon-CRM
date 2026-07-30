import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useAuthStore } from '../../store/authStore';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath, onNavigate }) => {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex antialiased selection:bg-[#C8FF2D] selection:text-[#0B0E14]">
      {/* Floating Glass Sidebar Navigation */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} onLogout={logout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0E14]">
        {/* Glass Header Topbar */}
        <Topbar />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Notification Slide-over Center */}
      <NotificationCenter />
    </div>
  );
};
