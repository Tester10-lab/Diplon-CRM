import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useAuthStore } from '../../store/authStore';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath, onNavigate, onLogout }) => {
  const { logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex antialiased selection:bg-[#C8FF2D] selection:text-[#0B0E14]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          onNavigate(path);
          setIsMobileOpen(false);
        }}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0E14] pb-20 md:pb-0">
        {/* Header Topbar */}
        <Topbar
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          isMobileOpen={isMobileOpen}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter />
    </div>
  );
};
