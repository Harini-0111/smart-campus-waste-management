import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { API_URL } from '../config';
import { TableSkeleton } from './SkeletonLoader';

const COLORS = {
    'Wet': '#10B981',
    'Dry': '#3B82F6',
    'Recyclable': '#F59E0B',
    'E-waste': '#8B5CF6',
    'Hazardous': '#EF4444'
};

const Analytics = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_URL}/history`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setHistory(res.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Fetch analytics error:', error);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Calculate metrics
    const totalKg = history.reduce((sum, item) => sum + Number(item.quantity_kg), 0);
    const avgKg = history.length > 0 ? (totalKg / history.length).toFixed(1) : 0;

    // Process data for charts
    const typeData = history.reduce((acc, item) => {
        const existing = acc.find(i => i.name === item.waste_type);
        if (existing) existing.value += Number(item.quantity_kg);
        else acc.push({ name: item.waste_type, value: Number(item.quantity_kg) });
        return acc;
    }, []);

    const locationData = history.reduce((acc, item) => {
        const existing = acc.find(i => i.name === item.location_name);
        if (existing) existing.value += Number(item.quantity_kg);
        else acc.push({ name: item.location_name, value: Number(item.quantity_kg) });
        return acc;
    }, []).sort((a, b) => b.value - a.value);

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-10 animate-fadeIn pb-24 max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-6">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-3 leading-none">Deep Analytics</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Historical data insights and trends</p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-2">AI-assisted • Smart insights by waste type and location</p>
                </div>
                <div className="flex gap-6">
                    <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center min-w-[160px] animate-slideUp stagger-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Managed Mass</span>
                        <span className="text-3xl font-black text-slate-900 tabular-nums">{totalKg.toFixed(1)}<span className="text-sm text-slate-400 ml-1">KG</span></span>
                    </div>
                    <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center min-w-[160px] animate-slideUp stagger-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Vector Load</span>
                        <span className="text-3xl font-black text-emerald-500 tabular-nums">{avgKg}<span className="text-sm text-slate-400 ml-1">KG</span></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Waste Type Distribution */}
                <div className="card-premium p-10 h-[500px] flex flex-col stagger-3 bg-gradient-to-br from-[#F2F7F3] via-white to-[#E8F1EF]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">AI-assisted</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Smart Insights</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-3">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></div>
                            Composition Audit
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold ml-7 mt-1">Live distribution by waste category</p>
                        <p className="text-[11px] text-slate-500 font-medium ml-7 mt-1">Understand what types dominate today so teams act fast.</p>
                    </div>
                    <div className="flex-1 mt-6">
                        {typeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        innerRadius={90}
                                        outerRadius={140}
                                        paddingAngle={10}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {typeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94A3B8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', fontWeight: '900', fontSize: '12px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1.5px', color: '#64748b', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                                    <span className="text-4xl text-slate-300">📈</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-400 mb-1">No composition data yet</p>
                                    <p className="text-xs text-slate-300 font-medium">Add waste logs to see breakdown</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Location Comparison */}
                <div className="card-premium p-10 h-[500px] flex flex-col stagger-4 bg-gradient-to-br from-[#EEF4F8] via-white to-[#E8EDF5]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">Smart Insights</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-500 rounded-full shadow-lg shadow-blue-500/20"></div>
                            Zone Efficiency Benchmark
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold ml-7 mt-1">Waste generation by location</p>
                        <p className="text-[11px] text-slate-500 font-medium ml-7 mt-1">Compare hotspots to deploy staff where it matters most.</p>
                    </div>
                    <div className="flex-1 mt-6">
                        {locationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={locationData} margin={{ top: 0, right: 30, left: 30, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94A3B8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94A3B8' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 10 }}
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                                    <span className="text-4xl text-slate-300">📍</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-400 mb-1">No location data yet</p>
                                    <p className="text-xs text-slate-300 font-medium">Add waste logs to compare zones</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
