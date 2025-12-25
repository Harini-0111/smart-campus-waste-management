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
import { LayoutGrid, SquarePlus, ChartBar, History as HistoryIcon, LogOut, Activity } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './components/NotificationSystem';

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

  // Determine if user has admin privileges (Super Admin or Block Admin)
  const isAdmin = role === 'admin' || role === 'block_admin';
  const roleLabel = role === 'admin' ? 'Super Admin' : (role === 'block_admin' ? 'Block Admin' : (role === 'staff' ? 'Field Staff' : 'Student'));
  const badgeLabel = role === 'admin' ? 'SA' : (role === 'block_admin' ? 'BA' : (role === 'staff' ? 'FS' : 'ST'));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased selection:bg-emerald-500/30">

      {/* Production Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

          <div className="flex items-center gap-16">
            <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-white p-3 rounded-[1.25rem] border border-slate-100 shadow-xl shadow-slate-200/50 group-hover:rotate-6 transition-transform">
                <Logo size={32} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-3xl tracking-[-0.04em] text-slate-950 leading-none">EcoCampus</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em] mt-1.5">{roleLabel} Unit</span>
              </div>
            </div>

            {isAdmin && (
              <nav className="hidden lg:flex items-center gap-1">
                <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutGrid} label="Insights" />
                <NavButton active={activeTab === 'entry'} onClick={() => setActiveTab('entry')} icon={SquarePlus} label="Report" />
                <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={Activity} label="Directives" />
                <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={HistoryIcon} label="Audit Log" />
                <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={ChartBar} label="Intelligence" />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-5 pr-8 border-r border-slate-200">
              <div className="text-right flex flex-col">
                <span className="text-sm font-black text-slate-950 tracking-tight">{user?.username}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Global Secure Identity</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-950 font-black border border-slate-100 shadow-xl shadow-slate-200/30 relative group overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                <span className="relative z-10 text-xs tracking-tighter">{badgeLabel}</span>
              </div>
            </div>

            <button onClick={logout} className="p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group border border-transparent hover:border-red-100">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <PageTransition activeKey={role === 'staff' ? 'staff' : (!isAdmin ? 'user' : activeTab)}>
          {role === 'staff' ? (
            <StaffDashboard />
          ) : !isAdmin ? (
            <UserDashboard />
          ) : (
            <>
              {activeTab === 'dashboard' && <AdminDashboard refreshTrigger={refreshTrigger} onViewHistory={() => setActiveTab('history')} />}
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
  <button
    onClick={onClick}
    className={`nav-link ${active ? 'nav-link-active' : ''}`}
  >
    <Icon size={18} />
    {label}
  </button>
);

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
