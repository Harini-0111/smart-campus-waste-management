import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, Calendar, Filter } from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/v1/history');
            setData(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Process data for charts
    const locationData = data.reduce((acc, curr) => {
        const loc = curr.location_name || 'Unknown';
        acc[loc] = (acc[loc] || 0) + Number(curr.quantity_kg);
        return acc;
    }, {});

    const chartDataLoc = Object.keys(locationData).map(k => ({ name: k, value: locationData[k] }));

    // Mock Trend Data (since we only have recent data, we'll simulate a week)
    const mockTrendData = [
        { name: 'Mon', Wet: 40, Dry: 24, Recyclable: 10 },
        { name: 'Tue', Wet: 35, Dry: 28, Recyclable: 12 },
        { name: 'Wed', Wet: 42, Dry: 22, Recyclable: 15 },
        { name: 'Thu', Wet: 38, Dry: 30, Recyclable: 8 },
        { name: 'Fri', Wet: 50, Dry: 35, Recyclable: 18 },
        { name: 'Sat', Wet: 20, Dry: 15, Recyclable: 5 },
        { name: 'Sun', Wet: 25, Dry: 18, Recyclable: 6 },
    ];

    if (loading) return <div className="p-10 text-center text-slate-400">Loading Analytics...</div>;

    return (
        <div className="space-y-8 animate-fadeIn pb-12">

            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Advanced Analytics</h2>
                    <p className="text-slate-500 text-sm">Deep dive into waste generation patterns</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        <Calendar size={16} /> Last 7 Days
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            {/* Main Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-6">Weekly Generation Trend</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockTrendData}>
                            <defs>
                                <linearGradient id="colorWet" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDry" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Area type="monotone" dataKey="Wet" stroke="#10B981" fillOpacity={1} fill="url(#colorWet)" />
                            <Area type="monotone" dataKey="Dry" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDry)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Location Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-6">Waste by Location</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataLoc} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Metrics (Mock) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-6">Segregation Efficiency</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Hostel Block A', val: 92, color: 'bg-emerald-500' },
                            { label: 'Canteen', val: 65, color: 'bg-yellow-500' },
                            { label: 'Academic Block', val: 88, color: 'bg-blue-500' },
                            { label: 'Admin Office', val: 78, color: 'bg-purple-500' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-slate-700">{item.label}</span>
                                    <span className="text-slate-500 font-mono">{item.val}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
                        💡 <strong>Insight:</strong> Canteen segregation has dropped by 12% this week. Recommended staff training session.
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Analytics;
