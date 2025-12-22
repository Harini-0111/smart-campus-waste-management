import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    TrendingUp, TrendingDown, AlertTriangle, Leaf, Clock, ArrowRight,
    BarChart3, Activity, CheckCircle2, MoreHorizontal, Image as ImageIcon
} from 'lucide-react';

const AdminDashboard = ({ refreshTrigger, onViewHistory }) => {
    const [data, setData] = useState({ total_today: 0, by_type: [], by_location: [], recent: [] });
    const [loading, setLoading] = useState(true);

    // Simulated metrics
    const segregationScore = 94;
    const yesterdayTotal = 120.5;
    const growth = data.total_today > 0 ? ((data.total_today - yesterdayTotal) / yesterdayTotal * 100) : 0;
    const growthIsPositive = growth >= 0;

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/v1/dashboard');
            setTimeout(() => {
                setData(res.data);
                setLoading(false);
            }, 600);
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

    if (loading) return <DashboardSkeleton />;

    // Sort locations by highest waste
    const sortedLocations = [...(data.by_location || [])].sort((a, b) => b.value - a.value);
    const maxLocValue = sortedLocations[0]?.value || 1;

    return (
        <div className="space-y-6 pb-12 animate-fadeIn text-slate-800">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Waste Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Generated</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{Number(data.total_today).toFixed(1)} <span className="text-base font-semibold text-slate-400">kg</span></h3>
                        </div>
                        <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-semibold">
                        <span className={`flex items-center gap-1 ${growthIsPositive ? 'text-red-500' : 'text-emerald-600'}`}>
                            {growthIsPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(growth).toFixed(1)}%
                        </span>
                        <span className="text-slate-400 ml-2">vs yesterday</span>
                    </div>
                </div>

                {/* Segregation Score */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Segregation Quality</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{segregationScore}%</h3>
                        </div>
                        <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-lg shadow-sm">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full shadow-lg shadow-blue-500/30" style={{ width: `${segregationScore}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Top Performer: <strong>Science Block</strong></p>
                </div>

                {/* Dominant Type */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Category</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight truncate">
                                {data.by_type.length > 0 ? data.by_type.sort((a, b) => b.value - a.value)[0]?.name : '-'}
                            </h3>
                        </div>
                        <div className="p-2.5 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-lg shadow-sm">
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
                    <p className="text-xs text-slate-400 mt-2 font-medium">Distribution by category</p>
                </div>

                {/* Active Alerts */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-red-50/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Alerts</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">0</h3>
                        </div>
                        <div className="p-2.5 bg-red-50 text-red-500 rounded-lg shadow-sm">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg w-fit border border-emerald-100">
                        <Leaf size={12} className="mr-1.5" /> Optimal Operations
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart Section (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Waste Composition Analysis</h3>
                        <div className="flex gap-2">
                            <button onClick={onViewHistory} className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">View Data</button>
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            {data.by_type.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.by_type} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: '#F8FAFC' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                                            {data.by_type.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94A3B8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    No data recorded today
                                </div>
                            )}
                        </div>

                        {/* Visual Location Breakdown (REAL DATA) */}
                        <div className="w-full sm:w-56 pl-0 sm:pl-6 sm:border-l border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">By Collection Point</h4>
                            <div className="space-y-5">
                                {sortedLocations.length > 0 ? sortedLocations.map((loc, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="font-semibold text-slate-700 truncate max-w-[100px]" title={loc.name}>{loc.name}</span>
                                            <span className="text-slate-500 font-mono">{Number(loc.value).toFixed(1)}kg</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: `${(loc.value / maxLocValue) * 100}%`, opacity: 0.2 + ((loc.value / maxLocValue)) }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-400 text-center py-4">No location data</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Feed (1 col) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-bold text-slate-800">Live Feed</h3>
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200">
                        {data.recent.length > 0 ? (
                            data.recent.map((log, i) => (
                                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                                    <div className="relative flex-shrink-0">
                                        {log.image_url ? (
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                                <img src={log.image_url} alt="Waste" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm
                                        ${log.waste_type === 'Wet' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                                                    log.waste_type === 'Dry' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                                                        log.waste_type === 'E-waste' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'}`}>
                                                {log.waste_type[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-slate-900 truncate pr-2">{log.location_name}</p>
                                            <span className="block font-bold text-slate-900 text-sm whitespace-nowrap">{log.quantity_kg}<span className="text-[10px] text-slate-400 font-medium ml-0.5">KG</span></span>
                                        </div>
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                            <Clock size={10} />
                                            {new Date(log.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                                            <span className={`font-semibold ${log.waste_type === 'Wet' ? 'text-emerald-600' :
                                                log.waste_type === 'Dry' ? 'text-blue-600' : 'text-slate-600'
                                                }`}>{log.waste_type}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-sm space-y-2">
                                <div className="p-3 bg-slate-50 rounded-full">
                                    <ImageIcon size={20} className="text-slate-300" />
                                </div>
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button onClick={onViewHistory} className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 mx-auto transition-colors uppercase tracking-wide">
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
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-xl border border-slate-200"></div>)}
        </div>
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-96 bg-slate-100 rounded-xl border border-slate-200"></div>
            <div className="h-96 bg-slate-100 rounded-xl border border-slate-200"></div>
        </div>
    </div>
);

export default AdminDashboard;
