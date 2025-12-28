import { useState } from 'react';
import WasteForm from './components/WasteForm';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import UserDashboard from './components/UserDashboard';
import Analytics from './components/Analytics';
import History from './components/History';
import Login from './components/Login';
import PageTransition from './components/PageTransition';
import { LayoutGrid, PlusSquare, BarChart2, History as HistoryIcon, LogOut, Search, Activity } from 'lucide-react';
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
  const roleLabel = role === 'admin' ? 'Super Admin' : (role === 'block_admin' ? 'Block Admin' : (role === 'staff' ? 'Cleaning Staff' : 'Student'));
  const badgeLabel = role === 'admin' ? 'SA' : (role === 'block_admin' ? 'BA' : (role === 'staff' ? 'CS' : 'ST'));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-emerald-500 rounded-2xl p-2.5 shadow-xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                <LayoutGrid className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter text-slate-800 leading-none">EcoCampus</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">{roleLabel} Panel</span>
              </div>
            </div>

            {isAdmin && (
              <nav className="hidden lg:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutGrid} label="Insights" />
                <NavButton active={activeTab === 'entry'} onClick={() => setActiveTab('entry')} icon={PlusSquare} label="Log Waste" />
                <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={Activity} label="Directives" />
                <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={HistoryIcon} label="Historical" />
                <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart2} label="Deep Analytics" />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-200">
              <div className="text-right flex flex-col">
                <span className="text-xs font-black text-slate-800 tracking-tight">{user?.username}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Account</span>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black border border-slate-300 shadow-inner">
                {badgeLabel}
              </div>
            </div>

            <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group relative">
              <LogOut size={22} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
        ${active ? 'bg-white text-slate-900 shadow-md transform -translate-y-0.5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 opacity-70 hover:opacity-100'}`}
  >
    <Icon size={16} className={active ? 'text-emerald-500' : 'text-slate-400'} />
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

// Debug version if nothing renders
if (!document.getElementById('root')) {
  console.error('Root element not found');
}

export default App;
