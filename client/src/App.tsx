import React, { useState, lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { PageSkeleton } from './components/feedback/Skeleton';
import { useAuthStore } from './store/authStore';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Auto-reload browser if dynamic module fetch failed due to new deployment bundle hashes
    if (
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.message?.includes('Loading chunk')
    ) {
      const reloadKey = 'chunk_reload_attempts';
      const attempts = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
      if (attempts < 2) {
        sessionStorage.setItem(reloadKey, String(attempts + 1));
        window.location.reload();
      }
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-100">Application Error</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const { user, logout } = useAuthStore();
  const [authTick, setAuthTick] = useState(0);
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Derive authentication from the authStore user directly
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <LoginPage onLoginSuccess={() => setAuthTick(t => t + 1)} />
        </Suspense>
      </ErrorBoundary>
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
    <ErrorBoundary>
      <AppLayout currentPath={currentPath} onNavigate={setCurrentPath} onLogout={() => { logout(); setAuthTick(t => t + 1); }}>
        <Suspense fallback={<PageSkeleton />}>
          {renderPage()}
        </Suspense>
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
