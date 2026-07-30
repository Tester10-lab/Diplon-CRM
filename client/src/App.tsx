import React, { useState, lazy, Suspense } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { PageSkeleton } from './components/feedback/Skeleton';
import { useAuthStore } from './store/authStore';

// Feature Modules Lazy Imports
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AgencyDashboardPage = lazy(() => import('./pages/AgencyDashboardPage').then(m => ({ default: m.AgencyDashboardPage })));
const DriverDashboardPage = lazy(() => import('./pages/DriverDashboardPage').then(m => ({ default: m.DriverDashboardPage })));
const CustomersPage = lazy(() => import('./pages/CustomersPage').then(m => ({ default: m.CustomersPage })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then(m => ({ default: m.BookingsPage })));
const InquiryPage = lazy(() => import('./pages/InquiryPage').then(m => ({ default: m.InquiryPage })));
const OperationsPage = lazy(() => import('./pages/OperationsPage').then(m => ({ default: m.OperationsPage })));
const FleetPage = lazy(() => import('./pages/FleetPage').then(m => ({ default: m.FleetPage })));
const DriversPage = lazy(() => import('./pages/DriversPage').then(m => ({ default: m.DriversPage })));
const GuidesPage = lazy(() => import('./pages/GuidesPage').then(m => ({ default: m.GuidesPage })));
const TimelinePage = lazy(() => import('./pages/TimelinePage').then(m => ({ default: m.TimelinePage })));
const FinancePage = lazy(() => import('./pages/FinancePage').then(m => ({ default: m.FinancePage })));
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const PartnersPage = lazy(() => import('./features/partners/PartnersPage').then(m => ({ default: m.PartnersPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PackagesPage = lazy(() => import('./pages/PackagesPage').then(m => ({ default: m.PackagesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })));
const DocsPage = lazy(() => import('./pages/DocsPage').then(m => ({ default: m.DocsPage })));

export function App() {
  const { user } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>('/');

  if (!isAuthenticated || !user) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      </Suspense>
    );
  }

  const isDriver = user.role === 'DRIVER';
  const isAgency = user.role === 'AGENCY';

  const renderDashboard = () => {
    if (isDriver) return <DriverDashboardPage onNavigate={setCurrentPath} />;
    if (isAgency) return <AgencyDashboardPage onNavigate={setCurrentPath} />;
    return <DashboardPage onNavigate={setCurrentPath} />;
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return renderDashboard();
      case '/inquiries':
        return <InquiryPage />;
      case '/customers':
        return <CustomersPage />;
      case '/bookings':
        return <BookingsPage />;
      case '/operations':
        return <OperationsPage />;
      case '/fleet':
        return <FleetPage />;
      case '/drivers':
        return <DriversPage />;
      case '/guides':
        return <GuidesPage />;
      case '/timeline':
        return <TimelinePage />;
      case '/finance':
        return <FinancePage />;
      case '/calendar':
        return <CalendarPage onNavigate={setCurrentPath} />;
      case '/partners':
        return <PartnersPage />;
      case '/packages':
        return <PackagesPage />;
      case '/reports':
        return <ReportsPage />;
      case '/users':
        return <UsersPage />;
      case '/help':
        return <HelpPage />;
      case '/docs':
        return <DocsPage />;
      case '/settings':
        return <SettingsPage />;
      default:
        return renderDashboard();
    }
  };

  return (
    <AppLayout currentPath={currentPath} onNavigate={setCurrentPath} onLogout={() => setIsAuthenticated(false)}>
      <Suspense fallback={<PageSkeleton />}>
        {renderPage()}
      </Suspense>
    </AppLayout>
  );
}

export default App;
