import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Calendar, MapPin, Trash2, Clock, Search, History as HistoryIcon } from 'lucide-react';
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

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-10 animate-fadeIn pb-24 max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-4">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-3 leading-none">Green Ledger</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Verified Historical Operations Registry</p>
                </div>
                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Filter transactions..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-slate-600 shadow-sm placeholder:text-slate-300 placeholder:font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm overflow-hidden overflow-x-auto ring-1 ring-slate-900/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Temporal Marker</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Zone Identifier</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Classification</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Magnitude</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.length > 0 ? filtered.map((item, i) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-white group-hover:text-emerald-500 group-hover:shadow-xl group-hover:shadow-emerald-500/10 transition-all duration-500">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 tracking-tight">{new Date(item.collected_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1.5 opacity-60">
                                                <Clock size={12} /> {new Date(item.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-400 transition-colors"></div>
                                        <span className="font-black text-slate-900 tracking-tight">{item.location_name}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest
                                        ${item.waste_type === 'Wet' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            item.waste_type === 'Dry' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                item.waste_type === 'Hazardous' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                        {item.waste_type}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <span className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">{item.quantity_kg}<span className="text-[10px] text-slate-400 ml-1.5 uppercase opacity-50">kg</span></span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-10 py-32 text-center opacity-40">
                                    <div className="flex flex-col items-center">
                                        <HistoryIcon size={64} className="mb-6 text-slate-200" />
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Zero Ledger Artifacts Detected</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
