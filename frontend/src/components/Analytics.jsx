import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { API_URL } from '../config';
import { Activity, Zap, TrendingUp, Users, MapPin, Gauge } from 'lucide-react';
import { DashboardSkeleton, ChartSkeleton } from './SkeletonLoader';

const COLORS = {
    'Wet': '#10B981',
    'Dry': '#3B82F6',
    'Recyclable': '#F59E0B',
    'Electronic': '#8B5CF6',
    'Hazardous': '#EF4444'
};

const Analytics = () => {
    const [history, setHistory] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [hotspots, setHotspots] = useState([]);
    const [efficiency, setEfficiency] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const [h, p, hs, e] = await Promise.all([
                    axios.get(`${API_URL}/history`, config),
                    axios.get(`${API_URL}/analytics/prediction`, config),
                    axios.get(`${API_URL}/analytics/hotspots`, config),
                    axios.get(`${API_URL}/analytics/efficiency`, config)
                ]);

                setHistory(h.data || []);
                setPrediction(p.data.prediction);
                setHotspots(hs.data || []);
                setEfficiency(e.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Fetch intelligence error:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalKg = history.reduce((sum, item) => sum + Number(item.quantity_kg), 0);

    const typeData = history.reduce((acc, item) => {
        const name = item.waste_type === 'E-waste' ? 'Electronic' : item.waste_type;
        const existing = acc.find(i => i.name === name);
        if (existing) existing.value += Number(item.quantity_kg);
        else acc.push({ name, value: Number(item.quantity_kg) });
        return acc;
    }, []);

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <DashboardSkeleton />
        </div>
    );

    return (
        <div className="space-y-12 animate-fadeIn pb-24 max-w-7xl mx-auto px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="badge-emerald">System Intelligence</span>
                        {prediction && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-blue-100 flex items-center gap-2">
                                <TrendingUp size={12} /> Forecast: {prediction.trend}
                            </span>
                        )}
                    </div>
                    <h2 className="text-7xl font-black text-slate-950 tracking-[-0.05em] leading-none mb-6 text-gradient">Deep Analytics</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Verifiable Campus Sustainability Metrics</p>
                </div>

                <div className="flex gap-8 w-full md:w-auto">
                    <div className="flex-1 premium-card p-8 flex flex-col min-w-[200px] border-l-4 border-l-emerald-500">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" /> Managed Mass
                        </span>
                        <span className="text-5xl font-black text-slate-950 tabular-nums tracking-tighter">{totalKg.toFixed(1)}<span className="text-sm text-slate-300 ml-2">KG</span></span>
                    </div>
                    {prediction && (
                        <div className="flex-1 premium-card p-8 flex flex-col min-w-[200px] border-l-4 border-l-blue-500">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap size={14} className="text-blue-500" /> NexDay Forecast
                            </span>
                            <span className="text-5xl font-black text-slate-950 tabular-nums tracking-tighter">{prediction.prediction}<span className="text-sm text-slate-300 ml-2">KG</span></span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Composition Pie */}
                <div className="premium-card p-12 lg:col-span-1 min-h-[550px] flex flex-col">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="font-black text-slate-950 text-xl tracking-tighter uppercase flex items-center gap-4">
                            <div className="w-2.5 h-8 bg-emerald-500 rounded-full"></div>
                            Composition Audit
                        </h3>
                    </div>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', color: '#64748b', paddingTop: '40px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hotspot Table/Chart */}
                <div className="premium-card p-12 lg:col-span-2 min-h-[550px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-400/5 -mr-16 -mt-16 rounded-full blur-[100px]"></div>
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <h3 className="font-black text-slate-950 text-xl tracking-tighter uppercase flex items-center gap-4">
                            <div className="w-2.5 h-8 bg-orange-500 rounded-full"></div>
                            Heat Index Map
                        </h3>
                        <MapPin size={24} className="text-slate-200" />
                    </div>

                    <div className="flex-1 space-y-8 relative z-10">
                        {hotspots.slice(0, 5).map((spot, i) => (
                            <div key={i} className="flex items-center gap-8 group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 border border-slate-100 transition-all group-hover:bg-slate-950 group-hover:text-white group-hover:scale-110">
                                    0{i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none group-hover:text-slate-950 transition-colors">Zone Identifier: {spot.location_id}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-orange-500 uppercase tabular-nums">INDEX: {spot.heat_index}</span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-950 transition-all duration-1000 group-hover:bg-orange-500"
                                            style={{ width: `${Math.min(100, spot.heat_index * 2)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Staff Efficiency Line Chart */}
                <div className="premium-card p-12 lg:col-span-3 min-h-[450px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/5 -ml-32 -mt-32 rounded-full blur-[120px]"></div>
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <h3 className="font-black text-slate-950 text-xl tracking-tighter uppercase flex items-center gap-4">
                            <div className="w-2.5 h-8 bg-blue-500 rounded-full"></div>
                            Efficiency Benchmark
                        </h3>
                        <Gauge size={24} className="text-slate-200" />
                    </div>

                    <div className="flex-1 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={efficiency} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="staff_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8', letterSpacing: '2px' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '900', fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 12 }}
                                    contentStyle={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                                />
                                <Bar dataKey="completion_rate" name="Completion Rate %" fill="#0f172a" radius={[12, 12, 0, 0]} barSize={50} />
                                <Bar dataKey="avg_response_time" name="Avg Response (Hrs)" fill="#10b981" radius={[12, 12, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

