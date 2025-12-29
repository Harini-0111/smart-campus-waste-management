import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { CheckCircle2, UserPlus, Search, AlertCircle, Clock, RefreshCcw, Bell } from 'lucide-react';
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
                axios.get(`${API_URL}/tasks/unassigned`, { headers }),
                axios.get(`${API_URL}/users/staff`, { headers })
            ]);

            setReports(reportsRes.data || []);
            setStaff(staffRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin task data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 20000);
        return () => clearInterval(interval);
    }, []);

    const handleAssign = async (logId, staffId) => {
        try {
            setAssigning(logId);
            await axios.post(`${API_URL}/tasks/assign`,
                { waste_log_id: logId, staff_id: staffId, priority: 'Normal' },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            notify("Deployment Directive dispatched", "success");
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
            <div className="flex justify-between items-center mb-4 gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Operational Directives</h2>
                        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Bell size={14} /> {reports.length} new
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Assign pending collection reports to available staff</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchData} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-slate-300">
                        <RefreshCcw size={14} /> Refresh
                    </button>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <UserPlus size={16} /> {staff.length} Staff
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-md overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waste Type</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {reports.length > 0 ? reports.map((report, i) => (
                            <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-800 tracking-tight">{report.department_name || report.location_description || 'Department'}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Reported by {report.student_name || 'student'}</span>
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
                                        <Clock size={12} /> {report.reported_at ? new Date(report.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
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
