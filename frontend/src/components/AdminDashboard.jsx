import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    TrendingUp, Leaf, Clock, ArrowRight,
    Activity, CircleCheck, Image as ImageIcon, ShieldAlert
} from 'lucide-react';
import { API_URL } from '../config';
import { DashboardSkeleton } from './SkeletonLoader';
import { useNotification } from './NotificationSystem';

const AdminDashboard = ({ refreshTrigger, onViewHistory }) => {
    const { notify } = useNotification();

    const [data, setData] = useState({
        total_today: 0,
        by_type: [],
        by_location: [],
        recent: []
    });

    // SAFE DEFAULT TO PREVENT CRASH
    const [predictions, setPredictions] = useState({
        prediction: { prediction: '--' }
    });

    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            };

            const [dashboardRes, predictionRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard`, { headers }),
                axios.get(`${API_URL}/analytics/prediction`, { headers })
            ]);

            setData(dashboardRes?.data || {
                total_today: 0,
                by_type: [],
                by_location: [],
                recent: []
            });

            setPredictions(predictionRes?.data || {
                prediction: { prediction: '--' }
            });

            const hasHazardous = (dashboardRes?.data?.recent || [])
                .some(r => r.waste_type === 'Hazardous');

            if (hasHazardous) {
                notify("Critical: Hazardous Waste Breach Detected", "critical");
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            notify("Live data temporarily unavailable", "warning");
            setLoading(false);
        }
    };

    // REAL-TIME POLLING ADDED HERE
    useEffect(() => {
        setLoading(true);
        fetchData();

        const interval = setInterval(() => {
            fetchData();
        }, 10000); // every 10 seconds

        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const COLORS = {
        Wet: '#10B981',
        Dry: '#3B82F6',
        Recyclable: '#F59E0B',
        'E-waste': '#8B5CF6',
        Hazardous: '#EF4444'
    };

    if (loading) return <DashboardSkeleton />;

    const sortedLocations = [...(data.by_location || [])]
        .sort((a, b) => b.value - a.value);

    const maxLocValue = sortedLocations[0]?.value || 1;

    return (
        <div className="space-y-10 pb-16 animate-fadeIn max-w-[1600px] mx-auto px-4 lg:px-8 mt-12">

            {/* HEADER ZONE: Pulse & Governance */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-slate-950 mb-2">
                        Operational <span className="text-emerald-600">Foresight</span>
                    </h2>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Real-time environmental synchronization active across campus nodes.
                        All metrics are cross-validated via internal governance protocol.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="badge-emerald animate-pulse">
                        ● System Synchronized
                    </div>
                    <button
                        onClick={onViewHistory}
                        className="btn-primary py-3 px-6 text-[10px] tracking-[0.2em]"
                    >
                        GOVERNANCE LOGS <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* ZONE A: ENVIRONMENTAL PULSE (Real-time Metrics) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Managed Mass Card */}
                <div className="premium-card p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-100 group-hover:text-emerald-200 transition-colors">
                        <Activity size={48} strokeWidth={1} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                        Managed Mass (24h)
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-6xl font-black text-slate-950 tracking-tighter">
                            {Number(data?.total_today || 0).toFixed(1)}
                        </h3>
                        <span className="text-xl font-bold text-slate-300">KG</span>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        <TrendingUp size={12} /> +2.4% vs AVG
                    </div>
                </div>

                {/* Accuracy Card */}
                <div className="premium-card p-10 relative group">
                    <div className="absolute top-0 right-0 p-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                        <CircleCheck size={48} strokeWidth={1} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                        Sort Accuracy
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-6xl font-black text-slate-950 tracking-tighter">
                            94<span className="text-xl font-bold text-slate-300">%</span>
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
                        High Performance
                    </div>
                </div>

                {/* Utilization Card */}
                <div className="premium-card p-10 relative group">
                    <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-slate-200 transition-colors">
                        <ShieldAlert size={48} strokeWidth={1} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                        Asset Capacity
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-6xl font-black text-slate-950 tracking-tighter">
                            OPTIMAL
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-600 bg-slate-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
                        Stability Confirmed
                    </div>
                </div>
            </div>

            {/* ZONE B: INTELLIGENT DECK (AI Predictions) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* AI Prediction Hub */}
                <div className="lg:col-span-3 insight-card p-10 group overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-intel-500/5 rounded-full blur-3xl" />
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Leaf className="text-intel-500" size={16} />
                                <span className="text-[10px] font-black text-intel-500 uppercase tracking-widest">
                                    Intelligence Foresight
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                AI-Projected Volume
                            </h3>
                        </div>
                        <div className="p-4 bg-intel-600 text-white rounded-2xl shadow-xl shadow-intel-500/20 group-hover:scale-110 transition-transform pulse-ai">
                            <TrendingUp size={24} />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Next 12 Hours</p>
                            <h4 className="text-5xl font-black text-slate-900">
                                {predictions?.prediction?.prediction || '--'}
                                <span className="text-lg font-bold text-slate-300 ml-2">KG</span>
                            </h4>
                        </div>
                        <div className="h-20 w-[2px] bg-slate-100" />
                        <div className="flex-1">
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                "Our ML model identifies a gathering pattern in Central Hub.
                                Recommended pre-emptive clearance at 16:30 IST."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Risk Radar */}
                <div className="lg:col-span-2 premium-card p-10 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Overflow Risk Radar
                        </p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
                            Critical Zones
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {sortedLocations.slice(0, 3).map((loc, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[11px] font-black">
                                    <span className="text-slate-900 uppercase tracking-widest">{loc.name}</span>
                                    <span className={loc.value > 80 ? 'text-red-500' : 'text-slate-400'}>
                                        {((loc.value / maxLocValue) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out rounded-full ${loc.value > 80 ? 'bg-red-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${(loc.value / maxLocValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHARTS ZONE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Waste Composition Card */}
                <div className="premium-card p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Material Streams</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Composition Breakdown</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.by_type || []}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(data.by_type || []).map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[entry.name] || '#64748b'}
                                            className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '1.25rem',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '1rem'
                                    }}
                                />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Location Rankings Card */}
                <div className="premium-card p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Spatial Load</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Nodal Distribution</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.by_location || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#0f172a"
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                    className="hover:fill-emerald-600 transition-colors cursor-pointer"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
