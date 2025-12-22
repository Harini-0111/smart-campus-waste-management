import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, Download, ArrowDownUp } from 'lucide-react';

const History = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/v1/history');
            setLogs(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.waste_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-slate-400">Loading History...</div>;

    return (
        <div className="space-y-6 animate-slideUp pb-12">

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800">Collection Audits</h2>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Filter size={18} />
                    </button>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-400">#{log.id}</td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {new Date(log.collected_at).toLocaleDateString()}
                                            <span className="text-slate-400 ml-2 text-xs">
                                                {new Date(log.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{log.location_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${log.waste_type === 'Wet' ? 'bg-emerald-100 text-emerald-800' :
                                                    log.waste_type === 'Dry' ? 'bg-blue-100 text-blue-800' :
                                                        log.waste_type === 'E-waste' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-amber-100 text-amber-800'}`}>
                                                {log.waste_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                                            {log.quantity_kg} <span className="text-slate-400 font-normal text-xs">kg</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block w-20 py-1 bg-green-50 text-green-600 text-xs rounded border border-green-100 text-center">
                                                Verified
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No records found matching your search.
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
