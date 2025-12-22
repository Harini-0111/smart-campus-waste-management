import { useState } from 'react';
import WasteForm from './components/WasteForm';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import History from './components/History';
import { LayoutGrid, PlusSquare, BarChart2, Bell, Search, History as HistoryIcon, UserCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEntryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">

      {/* SaaS Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-emerald-600 rounded-lg p-1.5 shadow-lg shadow-emerald-200">
                <LayoutGrid className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">EcoCampus</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavButton
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                icon={LayoutGrid}
                label="Dashboard"
              />
              <NavButton
                active={activeTab === 'entry'}
                onClick={() => setActiveTab('entry')}
                icon={PlusSquare}
                label="Log Waste"
              />
              <NavButton
                active={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                icon={HistoryIcon}
                label="Logs"
              />
              <NavButton
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
                icon={BarChart2}
                label="Analytics"
              />
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-md px-3 py-1.5 text-sm text-slate-500 border border-transparent focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <Search size={14} className="mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none w-24 focus:w-40 transition-all placeholder:text-slate-400" />
            </div>
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-emerald-500 transition-all">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slideUp">

        {activeTab === 'dashboard' && <Dashboard refreshTrigger={refreshTrigger} onViewHistory={() => setActiveTab('history')} />}
        {activeTab === 'entry' && <WasteForm onEntryAdded={handleEntryAdded} />}
        {activeTab === 'history' && <History />}
        {activeTab === 'analytics' && <Analytics />}

      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
        ${active
        ? 'bg-slate-100 text-slate-900'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
  >
    <Icon size={16} className={active ? 'text-emerald-600' : 'text-slate-400'} />
    {label}
  </button>
);

export default App;
