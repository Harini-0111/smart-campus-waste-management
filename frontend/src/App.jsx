import { useState } from 'react';
import WasteForm from './components/WasteForm';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import UserDashboard from './components/UserDashboard';
import Analytics from './components/Analytics';
import History from './components/History';
import Login from './components/Login';
import Logo from './components/Logo';
import AdminTaskManager from './components/AdminTaskManager';
import PageTransition from './components/PageTransition';
import {
  LayoutGrid, SquarePlus, ChartBar, History as HistoryIcon,
  LogOut, Activity
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './components/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { isAuthenticated, role, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEntryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const isAdmin = role === 'admin' || role === 'block_admin';
  const roleLabel =
    role === 'admin'
      ? 'Super Admin'
      : role === 'block_admin'
        ? 'Block Admin'
        : role === 'staff'
          ? 'Field Staff'
          : 'Student';

  const badgeLabel =
    role === 'admin'
      ? 'SA'
      : role === 'block_admin'
        ? 'BA'
        : role === 'staff'
          ? 'FS'
          : 'ST';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased selection:bg-emerald-500/30">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-3xl border-b border-slate-200/50">
        <div className="max-w-[1700px] mx-auto px-8 h-24 flex items-center justify-between">

          <div className="flex items-center gap-12">
            <div
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="bg-slate-950 p-2.5 rounded-2xl shadow-xl shadow-slate-900/20 group-hover:rotate-12 transition-all duration-500">
                <Logo size={28} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight text-slate-950 leading-none">
                  Eco<span className="text-emerald-600">Campus</span>
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {roleLabel} Console
                  </span>
                </div>
              </div>
            </div>

            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/40">
              <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutGrid} label="Insights" />
              {isAdmin && <NavButton active={activeTab === 'entry'} onClick={() => setActiveTab('entry')} icon={SquarePlus} label="Log Waste" />}
              {isAdmin && <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={Activity} label="Directives" />}
              <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={HistoryIcon} label="Audit Log" />
              {isAdmin && <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={ChartBar} label="Intelligence" />}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-slate-200">
              <div className="text-right">
                <p className="text-xs font-black text-slate-950 tracking-tight leading-none mb-1">
                  {user?.username}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Secure ID Verified
                </p>
              </div>
              <div
                onClick={logout}
                className="h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-[10px] font-black shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors"
              >
                {badgeLabel}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <PageTransition activeKey={role === 'staff' ? 'staff' : activeTab}>
          {role === 'staff' ? (
            <StaffDashboard />
          ) : (
            <>
              {activeTab === 'dashboard' &&
                (isAdmin ? (
                  <AdminDashboard
                    refreshTrigger={refreshTrigger}
                    onViewHistory={() => setActiveTab('history')}
                  />
                ) : (
                  <UserDashboard onOpenHistory={() => setActiveTab('history')} />
                ))}

              {activeTab === 'entry' && <WasteForm onEntryAdded={handleEntryAdded} />}
              {activeTab === 'tasks' && <AdminTaskManager />}
              {activeTab === 'history' && <History />}
              {activeTab === 'analytics' && <Analytics />}
            </>
          )}
        </PageTransition>
      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
    <Icon size={18} />
    {label}
  </button>
);

function App() {
  return (
    <NotificationProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </NotificationProvider>
  );
}

export default App;
