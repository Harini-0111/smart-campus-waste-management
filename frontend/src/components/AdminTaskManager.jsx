import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { CheckCircle2, UserPlus, Search, AlertCircle, Clock } from 'lucide-react';
import { TableSkeleton } from './SkeletonLoader';
import { useNotification } from './NotificationSystem';

const AdminTaskManager = () => {
    const { notify } = useNotification();
    const [reports, setReports] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null);

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            const [reportsRes, staffRes] = await Promise.all([
                axios.get(`${API_URL}/waste`, { headers }), // Fetching for assignment
                axios.get(`${API_URL}/users/staff`, { headers }) // Endpoint needs to be verified/added
            ]);

            // Filter only unassigned/Reported waste logs
            setReports(reportsRes.data.filter(r => r.status === 'Reported' || !r.status));
            setStaff(staffRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin task data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (logId, staffId) => {
        try {
            setAssigning(logId);
            await axios.post(`${API_URL}/tasks`,
                { waste_log_id: logId, assigned_to: staffId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            notify("Deployment Directive Dispatched Successfully", "success");
            fetchData();
            setAssigning(null);
        } catch (error) {
            console.error('Error assigning task:', error);
            setAssigning(null);
        }
    };

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Operational Directives</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Assign pending collection reports to available staff</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <UserPlus size={16} /> {staff.length} Active Staff
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waste Type</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Captured At</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {reports.length > 0 ? reports.map((report, i) => (
                            <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-800 tracking-tight">{report.location_name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Block Area</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter
                                        ${report.waste_type === 'Wet' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            report.waste_type === 'Dry' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                        {report.waste_type}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="font-black text-slate-900 text-sm tabular-nums">{report.quantity_kg}<span className="text-[10px] text-slate-400 ml-1">KG</span></span>
                                </td>
                                <td className="px-8 py-6 text-slate-500 font-bold text-xs">
                                    <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                                        <Clock size={12} /> {new Date(report.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <select
                                        disabled={assigning === report.id}
                                        onChange={(e) => handleAssign(report.id, e.target.value)}
                                        className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                                        value=""
                                    >
                                        <option value="" disabled>Deploy Staff</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.username}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center opacity-30">
                                        <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">All Nodes Verified Clean</p>
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

export default AdminTaskManager;
