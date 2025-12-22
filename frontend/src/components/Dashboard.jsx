import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    TrendingUp, AlertTriangle, Leaf, Clock, ArrowRight,
    BarChart3, Activity, CheckCircle2
} from 'lucide-react';

const Dashboard = ({ refreshTrigger, onViewHistory }) => {
    const [data, setData] = useState({ total_today: 0, by_type: [], recent: [] });
    const [loading, setLoading] = useState(true);

    // Simulated metrics
    const segregationScore = 92;
    const yesterdayTotal = 145.5;
    const growth = data.total_today > 0 ? ((data.total_today - yesterdayTotal) / yesterdayTotal * 100).toFixed(1) : 0;

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/v1/dashboard');
            setTimeout(() => {
                setData(res.data);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [refreshTrigger]);

    const COLORS = {
        Wet: '#10B981', // Emerald
        Dry: '#3B82F6', // Blue
        Recyclable: '#F59E0B', // Amber
        'E-waste': '#8B5CF6', // Purple
        Hazardous: '#EF4444' // Red
    };

    const MOCK_LOCATION_DATA = [
        { name: 'Canteen', val: 45 },
        { name: 'Hostel A', val: 32 },
        { name: 'Library', val: 14 },
        { name: 'Academic', val: 28 },
    ];

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-6 pb-12 animate-fadeIn text-slate-800">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Waste Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Generated</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{Number(data.total_today).toFixed(1)} <span className="text-base font-medium text-slate-400">kg</span></h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium">
                        <span className={`flex items-center gap-1 ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <TrendingUp size={14} /> {Math.abs(growth)}%
                        </span>
                        <span className="text-slate-400 ml-2">vs yesterday</span>
                    </div>
                </div>

                {/* Segregation Score */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Segregation Quality</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{segregationScore}%</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${segregationScore}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Excellent compliance rate</p>
                </div>

                {/* Dominant Type */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Category</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2 truncate">
                                {data.by_type.length > 0 ? data.by_type.sort((a, b) => b.value - a.value)[0]?.name : '-'}
                            </h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        {data.by_type.slice(0, 3).map((t, i) => (
                            <div key={i} className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: COLORS[t.name] || '#CBD5E1' }}></div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Distribution across categories</p>
                </div>

                {/* Active Alerts */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-red-50/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Alerts</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">0</h3>
                        </div>
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                        <Leaf size={12} className="mr-1" /> System Nominal
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart Section (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">Waste Composition Analysis</h3>
                        <div className="flex gap-2">
                            <button onClick={onViewHistory} className="text-xs font-medium px-3 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">View Details</button>
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex">
                        <div className="flex-1">
                            {data.by_type.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.by_type} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: '#F1F5F9' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                            {data.by_type.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94A3B8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data recorded today</div>
                            )}
                        </div>

                        {/* Visual Location Breakdown */}
                        <div className="w-48 pl-6 border-l border-slate-100 hidden sm:block">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">By Location</h4>
                            <div className="space-y-4">
                                {MOCK_LOCATION_DATA.map((loc, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium text-slate-600">{loc.name}</span>
                                            <span className="text-slate-400">{loc.val}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: `${loc.val}%`, opacity: 0.2 + (loc.val / 100) }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Feed (1 col) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Live Feed</h3>
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0">
                        {data.recent.length > 0 ? (
                            data.recent.map((log, i) => (
                                <div key={log.id} className={`p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0`}>
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold
                                    ${log.waste_type === 'Wet' ? 'bg-emerald-500' :
                                                log.waste_type === 'Dry' ? 'bg-blue-500' :
                                                    log.waste_type === 'E-waste' ? 'bg-purple-500' : 'bg-amber-500'}`}>
                                            {log.waste_type[0]}
                                        </div>
                                        {i === 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                        </span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{log.location_name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            {new Date(log.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                                            <span className="font-medium">{log.waste_type}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-slate-900 text-sm">{log.quantity_kg}</span>
                                        <span className="text-[10px] text-slate-400 uppercase">kg</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No recent activity</div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button onClick={onViewHistory} className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center justify-center gap-1 mx-auto transition-colors">
                            View Full History <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Polished Loading State
const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-96 bg-slate-200 rounded-xl"></div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
    </div>
);

export default Dashboard;
