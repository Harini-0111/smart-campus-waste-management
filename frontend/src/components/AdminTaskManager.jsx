import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { ClipboardList, UserCheck, AlertTriangle, CheckCircle2, Clock, Send, Activity } from 'lucide-react';
import { ListSkeleton } from './SkeletonLoader';

const AdminTaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, staffRes] = await Promise.all([
                    axios.get(`${API_URL}/tasks`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${API_URL}/users/staff`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);
                setTasks(tasksRes.data);
                setStaff(staffRes.data);
            } catch (err) {
                console.error('Fetch tasks/staff error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async (wasteLogId, staffId) => {
        try {
            await axios.post(`${API_URL}/tasks`, {
                waste_log_id: wasteLogId,
                assigned_to: staffId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Refresh
            const res = await axios.get(`${API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTasks(res.data);
            setAssigning(null);
        } catch (err) {
            console.error('Assign error:', err);
        }
    };

    if (loading) return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <ListSkeleton items={4} />
        </div>
    );

    return (
        <div className="space-y-10 animate-fadeIn max-w-6xl mx-auto pb-24">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <span className="badge-emerald mb-3">Field Management</span>
                    <h2 className="text-6xl font-black text-slate-950 tracking-tighter leading-none text-gradient">
                        Directive Console
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.4em] mt-3">Operational Tasking & Field Deployment Hub</p>
                </div>
                <div className="bg-slate-950 p-6 rounded-[2rem] text-white shadow-2xl animate-float">
                    <ClipboardList size={32} />
                </div>
            </div>

            <div className="grid gap-8">
                {tasks.map((task) => (
                    <div key={task.id} className="premium-card p-10 flex flex-col md:flex-row gap-10 items-start md:items-center justify-between border-l-8 border-l-slate-950 hover:border-slate-300 shadow-xl shadow-slate-200/50">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${task.severity === 'Critical' ? 'bg-red-50 border-red-100 text-red-600' :
                                    task.severity === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                                        'bg-blue-50 border-blue-100 text-blue-600'
                                    }`}>
                                    {task.severity || 'Normal'} Priority
                                </span>
                                <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">{task.waste_type} Waste Stream</span>
                            </div>

                            <div>
                                <h3 className="text-3xl font-black text-slate-950 tracking-tighter mb-2">{task.location_name}</h3>
                                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">{task.description || 'Baseline hygiene directive with no specific anomalies reported.'}</p>
                            </div>

                            <div className="flex gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest items-center">
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg"><Clock size={14} className="text-slate-950" /> {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg"><Activity size={14} className="text-slate-950" /> Status: <span className="text-slate-950">{task.status}</span></span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-6 min-w-[240px] relative">
                            {task.assigned_to ? (
                                <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 w-full shadow-inner">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-950 border border-slate-100">
                                        <UserCheck size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Assigned To</span>
                                        <span className="text-sm font-black text-slate-950 uppercase tracking-tight">{task.assigned_to_name}</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAssigning(task.id)}
                                    className="btn-primary w-full py-6 bg-slate-950 text-white hover:bg-emerald-600 flex items-center justify-center gap-4 group"
                                >
                                    DEPLOY STAFF
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            )}

                            {assigning === task.id && (
                                <div className="absolute top-0 right-0 p-8 bg-white rounded-[2.5rem] shadow-2xl z-20 w-80 border-2 border-slate-950 animate-slideUp">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Select Field Personnel</p>
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {staff.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => handleAssign(task.waste_log_id, s.id)}
                                                className="w-full text-left p-4 rounded-2xl hover:bg-slate-950 transition-all border border-slate-100 hover:border-slate-950 group"
                                            >
                                                <span className="text-xs font-black text-slate-600 group-hover:text-white uppercase tracking-widest">{s.username}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setAssigning(null)} className="w-full mt-6 p-2 text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-[0.3em] transition-colors">Cancel Operation</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="premium-card border-4 border-dashed border-slate-100 rounded-[3rem] p-32 text-center animate-fadeIn flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 animate-float">
                            <CheckCircle2 size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-950 tracking-tighter">System Static</h3>
                        <p className="text-slate-400 mt-4 font-bold max-w-md mx-auto text-sm uppercase tracking-[0.3em]">All zones verified clean. Zero pending directives detected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTaskManager;
