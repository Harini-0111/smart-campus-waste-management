import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    TrendingUp, TrendingDown, AlertTriangle, Leaf, Clock, ArrowRight,
    BarChart3, Activity, CheckCircle2, MoreHorizontal, Image as ImageIcon
} from 'lucide-react';
import { API_URL } from '../config';
import { DashboardSkeleton } from './SkeletonLoader';
import { useNotification } from './NotificationSystem';

const AdminDashboard = ({ refreshTrigger, onViewHistory }) => {
    const { notify } = useNotification();
    const [data, setData] = useState({ total_today: 0, by_type: [], by_location: [], recent: [] });
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulated metrics
    const segregationScore = 94;
    const yesterdayTotal = 120.5;
    const growth = data.total_today > 0 ? ((data.total_today - yesterdayTotal) / yesterdayTotal * 100) : 0;
    const growthIsPositive = growth >= 0;

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            const [dashboardRes, predictionRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard`, { headers }),
                axios.get(`${API_URL}/analytics/prediction`, { headers })
            ]);

            setData(dashboardRes.data);
            setPredictions(predictionRes.data);

            // Critical Alerts Logic
            const hasHazardous = dashboardRes.data.recent.some(r => r.waste_type === 'Hazardous');
            if (hasHazardous) {
                notify("Critical: Hazardous Waste Detected in Recent Logs", "critical");
            }
            if (predictionRes.data.risk.level === 'critical') {
                notify("System Alert: High Overflow Probability in Hostel Zone", "critical");
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Waste Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded w-fit mb-2">Total Generated</p>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{Number(data.total_today).toFixed(1)} <span className="text-lg font-bold text-slate-400">kg</span></h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                            <Activity size={24} />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-3">Live Waste Tracking — real-time campus reports</p>
                </div>

                {/* Segregation Score */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded w-fit mb-2">Efficiency</p>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{segregationScore}%</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-50">
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${segregationScore}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-3">Segregation quality based on category accuracy</p>
                </div>

                {/* ML Forecast Card with Tooltip */}
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-indigo-50/40 to-white relative overflow-hidden group" title="AI-estimated waste for tomorrow based on historical data">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -mr-12 -mt-12 rounded-full transform group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded w-fit mb-2 flex items-center gap-1">
                                <Activity size={12} /> Predictive Load
                            </p>
                            <h3 className="text-4xl font-black text-indigo-900 tracking-tight">
                                {predictions ? `${predictions.prediction.prediction}` : '--'} <span className="text-lg font-bold text-indigo-300">kg</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg animate-pulse-slow">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-400 mt-3 uppercase tracking-tighter">AI Predictions — smart estimation of daily waste load</p>
                </div>

                {/* Risk Card */}
                <div className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 group ${predictions?.risk.level === 'critical' || predictions?.risk.level === 'high'
                    ? 'bg-red-50 border-red-100 hover:shadow-red-100'
                    : 'bg-emerald-50 border-emerald-100 hover:shadow-emerald-100'
                    }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded w-fit mb-2 ${predictions?.risk.level === 'critical' || predictions?.risk.level === 'high' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>Overflow Risk</p>
                            <h3 className={`text-3xl font-black tracking-tight ${predictions?.risk.level === 'critical' || predictions?.risk.level === 'high' ? 'text-red-900' : 'text-emerald-900'
                                }`}>
                                {predictions ? predictions.risk.level.toUpperCase() : 'ANALYZING...'}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl shadow-sm ${predictions?.risk.level === 'critical' || predictions?.risk.level === 'high' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-3">AI-assisted risk assessment for potential overflow</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Analytics Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">Waste Composition</h3>
                            <p className="text-xs text-slate-400 font-medium">Real-time breakdown by category</p>
                        </div>
                        <button onClick={onViewHistory} className="text-xs font-bold px-5 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-slate-200">
                            <div className="flex flex-col items-center">
                                <span>Full Database</span>
                                <span className="text-[8px] text-slate-400 font-medium mt-0.5">View all records</span>
                            </div>
                        </button>
                    </div>

                    <div className="h-[350px] w-full flex flex-col md:flex-row gap-10">
                        <div className="flex-1">
                            {data.by_type.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.by_type} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 13, fill: '#475569', fontWeight: 700 }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc', radius: 4 }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                                            {data.by_type.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94A3B8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 gap-3 p-6">
                                    <BarChart3 size={40} className="opacity-30" />
                                    <div className="text-center">
                                        <p className="font-bold mb-1">No Data Available</p>
                                        <p className="text-xs text-slate-400 font-medium">Start logging waste to see composition</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location Rankings */}
                        <div className="w-full md:w-64 pl-0 md:pl-8 md:border-l border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Hot-Spot Rankings</h4>
                            <div className="space-y-6">
                                {sortedLocations.length > 0 ? sortedLocations.slice(0, 4).map((loc, i) => (
                                    <div key={i} className="group cursor-default">
                                        <div className="flex justify-between text-xs mb-2 items-end">
                                            <span className="font-bold text-slate-700 group-hover:text-slate-900 text-sm">{loc.name}</span>
                                            <span className="text-slate-500 font-black tabular-nums">{Number(loc.value).toFixed(1)}kg</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner">
                                            <div className="bg-slate-800 h-full rounded-full transition-all duration-700 group-hover:bg-indigo-600" style={{ width: `${(loc.value / maxLocValue) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 px-4">
                                        <p className="text-xs text-slate-400 font-semibold mb-1">No location data yet</p>
                                        <p className="text-[10px] text-slate-300 font-medium">Log waste to see hotspots</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Feed with Tooltip */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-0 flex flex-col h-[522px] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50" title="Real-time waste entries as they happen">
                        <div>
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">Live Intelligence</h3>
                            <p className="text-[9px] text-slate-400 font-semibold mt-1">Real-time waste entries</p>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold">LIVE</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                        {data.recent.length > 0 ? (
                            data.recent.map((log, i) => (
                                <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group cursor-pointer">
                                    <div className="relative flex-shrink-0">
                                        {log.image_url ? (
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all transform group-hover:scale-105">
                                                <img src={log.image_url} alt="Waste" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-inner transform rotate-3 group-hover:rotate-0 transition-transform
                                        ${log.waste_type === 'Wet' ? 'bg-gradient-to-br from-emerald-400 to-emerald-700' :
                                                    log.waste_type === 'Dry' ? 'bg-gradient-to-br from-blue-400 to-blue-700' :
                                                        log.waste_type === 'E-waste' ? 'bg-gradient-to-br from-purple-400 to-purple-700' : 'bg-gradient-to-br from-amber-400 to-orange-600'}`}>
                                                {log.waste_type[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-black text-slate-800 truncate mb-1">{log.location_name}</p>
                                            <span className="font-black text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded-lg">{log.quantity_kg}<span className="text-[9px] text-slate-400 font-bold ml-1">KG</span></span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold uppercase tracking-tighter">
                                                <Clock size={10} />
                                                {new Date(log.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${log.waste_type === 'Wet' ? 'text-emerald-600 bg-emerald-50' :
                                                log.waste_type === 'Dry' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-50'
                                                }`}>{log.waste_type}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 p-8">
                                <ImageIcon size={56} className="opacity-20 stroke-[1.5]" />
                                <div className="text-center">
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">No Activity Yet</p>
                                    <p className="text-xs text-slate-400 font-medium">Waste entries will appear here in real-time</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={onViewHistory} className="m-4 p-4 text-xs font-black text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest border border-slate-100 flex items-center justify-center gap-2 group">
                        Historical Audits <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
