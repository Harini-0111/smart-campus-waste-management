import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    TrendingUp, TrendingDown, AlertTriangle, Leaf, Clock, ArrowRight,
    BarChart3, Activity, CheckCircle2, MoreHorizontal, Image as ImageIcon, ShieldAlert
} from 'lucide-react';
import { API_URL } from '../config';
import { DashboardSkeleton } from './SkeletonLoader';
import { useNotification } from './NotificationSystem';

const AdminDashboard = ({ refreshTrigger, onViewHistory }) => {
    const { notify } = useNotification();
    const [data, setData] = useState({ total_today: 0, by_type: [], by_location: [], recent: [] });
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            const [dashboardRes, predictionRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard`, { headers }),
                axios.get(`${API_URL}/analytics/prediction`, { headers })
            ]);

            setData(dashboardRes.data);
            setPredictions(predictionRes.data);

            const hasHazardous = dashboardRes.data.recent.some(r => r.waste_type === 'Hazardous');
            if (hasHazardous) {
                notify("Critical: Hazardous Waste Breach Detected", "critical");
            }

            setLoading(false);
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
        Wet: '#10B981',
        Dry: '#3B82F6',
        Recyclable: '#F59E0B',
        'E-waste': '#8B5CF6',
        Hazardous: '#EF4444'
    };

    if (loading) return <DashboardSkeleton />;

    const sortedLocations = [...(data.by_location || [])].sort((a, b) => b.value - a.value);
    const maxLocValue = sortedLocations[0]?.value || 1;

    return (
        <div className="space-y-12 pb-16 animate-fadeIn">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="premium-card p-8 border-l-4 border-l-emerald-500 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Daily Managed Mass</p>
                            <h3 className="text-4xl font-black text-slate-950 tracking-tighter">{Number(data.total_today).toFixed(1)} <span className="text-sm font-bold text-slate-300">KG</span></h3>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm transition-transform group-hover:scale-110">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="premium-card p-8 border-l-4 border-l-blue-500 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset Utilization</p>
                            <h3 className="text-4xl font-black text-slate-950 tracking-tighter">88.5<span className="text-sm font-bold text-slate-300">%</span></h3>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm transition-transform group-hover:scale-110">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                <div className="premium-card p-8 border-l-4 border-l-indigo-500 bg-gradient-to-br from-white to-indigo-50/30 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <TrendingUp size={12} /> Predictive Load
                            </p>
                            <h3 className="text-4xl font-black text-slate-950 tracking-tighter">
                                {predictions ? predictions.prediction.prediction : '--'} <span className="text-sm font-bold text-slate-300">KG</span>
                            </h3>
                        </div>
                        <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-transform group-hover:scale-110">
                            <Leaf size={24} />
                        </div>
                    </div>
                </div>

                <div className="premium-card p-8 border-l-4 border-l-slate-950 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Overflow Risk</p>
                            <h3 className="text-4xl font-black text-slate-950 tracking-tighter uppercase whitespace-nowrap">
                                OPTIMAL
                            </h3>
                        </div>
                        <div className="p-4 bg-slate-950 text-white rounded-2xl shadow-xl shadow-slate-950/20 transition-transform group-hover:scale-110">
                            <ShieldAlert size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Analytics Chart */}
                <div className="lg:col-span-2 premium-card p-12">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h3 className="font-black text-slate-950 text-3xl tracking-tighter">Composition Audit</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Real-time Telemetry</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="badge-emerald lowercase tracking-normal">Active Stream</span>
                        </div>
                    </div>

                    <div className="h-[420px] w-full flex flex-col md:flex-row gap-16">
                        <div className="flex-1">
                            {data.by_type.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.by_type} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                                            contentStyle={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#0f172a' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                                            {data.by_type.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} fillOpacity={0.9} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    Buffering telemetry stream...
                                </div>
                            )}
                        </div>

                        {/* Location Rankings */}
                        <div className="w-full md:w-80 pl-0 md:pl-16 md:border-l border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10">Zone Load Rankings</h4>
                            <div className="space-y-10">
                                {sortedLocations.length > 0 ? sortedLocations.slice(0, 5).map((loc, i) => (
                                    <div key={i} className="group cursor-default">
                                        <div className="flex justify-between mb-3 items-end">
                                            <span className="font-black text-slate-800 text-xs uppercase tracking-tight group-hover:text-slate-950 transition-colors">{loc.name}</span>
                                            <span className="text-slate-400 font-bold text-[11px] tabular-nums">{Number(loc.value).toFixed(1)} <span className="text-[9px] opacity-60">KG</span></span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-slate-950 h-full rounded-full transition-all duration-1000 group-hover:bg-emerald-500" style={{ width: `${(loc.value / maxLocValue) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-slate-300 text-center py-6 font-black uppercase tracking-widest italic leading-loose">Awaiting operational<br />datasets</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="premium-card p-0 flex flex-col h-[650px] overflow-hidden">
                    <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="font-black text-slate-950 text-xl tracking-tighter uppercase">Live Intelligence</h3>
                        <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest">LIVE DATA</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                        {data.recent.length > 0 ? (
                            data.recent.map((log, i) => (
                                <div key={log.id} className="p-8 flex items-start gap-6 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group cursor-pointer relative">
                                    <div className="absolute inset-y-0 left-0 w-1.5 bg-slate-950 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl transform rotate-2 group-hover:rotate-0 transition-transform
                                        ${log.waste_type === 'Wet' ? 'bg-emerald-500 shadow-emerald-500/10' :
                                                log.waste_type === 'Dry' ? 'bg-blue-500 shadow-blue-500/10' :
                                                    log.waste_type === 'E-waste' ? 'bg-slate-950 shadow-slate-950/10' : 'bg-red-500 shadow-red-500/10'}`}>
                                            {log.waste_type[0]}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-black text-slate-950 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{log.location_name}</p>
                                            <span className="font-black text-slate-950 text-[12px] tabular-nums bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/50">{log.quantity_kg}<span className="text-[9px] text-slate-400 ml-1.5">KG</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                                                <Clock size={12} className="opacity-50" />
                                                {new Date(log.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-200">UID:{log.id}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-8">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center">
                                    <ImageIcon size={40} className="opacity-10 animate-pulse" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Awaiting Signal</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8">
                        <button onClick={onViewHistory} className="w-full py-5 text-[10px] font-black text-white bg-slate-950 hover:bg-slate-900 rounded-2xl transition-all shadow-xl shadow-slate-900/10 uppercase tracking-[0.25em] flex items-center justify-center gap-3 group">
                            AUDIT DATABASE <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

