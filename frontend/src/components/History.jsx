import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Calendar, MapPin, Trash2, Clock, Search, History as HistoryIcon, Database } from 'lucide-react';
import { TableSkeleton } from './SkeletonLoader';

const History = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_URL}/history`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setLogs(res.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Fetch history error:', error);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filtered = logs.filter(item =>
        item.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.waste_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <TableSkeleton />
        </div>
    );

    return (
        <div className="space-y-12 animate-fadeIn pb-24 max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-6">
                <div>
                    <span className="badge-emerald mb-3">Historical Audit</span>
                    <h2 className="text-7xl font-black text-slate-950 tracking-[-0.05em] leading-none mb-4 text-gradient">Green Ledger</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Verified Historical Operations Registry</p>
                </div>
                <div className="relative group w-full md:w-[500px]">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-950 transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Query audit trail..."
                        className="input-field pl-16 pr-8 py-6 text-sm tracking-wide shadow-2xl shadow-slate-200/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="premium-card overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-12 py-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Marker</th>
                                <th className="px-12 py-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zone Identifier</th>
                                <th className="px-12 py-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification</th>
                                <th className="px-12 py-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Magnitude</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((item, i) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-8">
                                            <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500 border border-slate-100">
                                                <Calendar size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-950 tracking-tight text-lg mb-1">{new Date(item.collected_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                                                    <Clock size={12} /> {new Date(item.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-all shadow-lg"></div>
                                            <span className="font-black text-slate-800 tracking-tight uppercase text-xs">{item.location_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border transition-colors
                                            ${item.waste_type === 'Wet' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                item.waste_type === 'Dry' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    item.waste_type === 'Hazardous' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                            {item.waste_type}
                                        </span>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        <span className="text-4xl font-black text-slate-950 tabular-nums tracking-tighter">{item.quantity_kg}<span className="text-xs text-slate-300 ml-3 font-bold uppercase tracking-widest">kg</span></span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-12 py-40 text-center">
                                        <div className="flex flex-col items-center gap-8">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center shadow-inner animate-float">
                                                <Database size={40} className="text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">No Historical Records Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;

