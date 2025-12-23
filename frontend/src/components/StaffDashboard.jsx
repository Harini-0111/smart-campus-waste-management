import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { CheckCircle2, Clock, Trash2, ShieldCheck } from 'lucide-react';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTasks(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/tasks/${taskId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading assigned tasks...</div>;

    return (
        <div className="space-y-10 animate-fadeIn pb-24 max-w-5xl mx-auto px-4">
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200/50 group animate-slideUp">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 -mr-20 -mt-20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full mb-4">Operations Center</span>
                    <h2 className="text-4xl font-black mb-3 tracking-tighter">Field Directives 🧹</h2>
                    <p className="text-slate-400 font-medium max-w-md">Orchestrate campus hygiene. Execute assigned collection protocols with precision.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {tasks.length > 0 ? tasks.map((task, i) => (
                    <div key={task.id} className={`card-premium p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 stagger-${(i % 4) + 1}`}>
                        <div className="flex gap-6 items-start">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-inner transform rotate-2
                                ${task.waste_type === 'Wet' ? 'bg-gradient-to-br from-emerald-400 to-emerald-700' :
                                    task.waste_type === 'Dry' ? 'bg-gradient-to-br from-blue-400 to-blue-700' :
                                        task.waste_type === 'E-waste' ? 'bg-gradient-to-br from-purple-400 to-purple-700' : 'bg-gradient-to-br from-amber-400 to-orange-600'}`}>
                                {task.waste_type[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol #{task.id}</span>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${task.status === 'Cleaned' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        task.status === 'Assigned' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse-soft' : 'bg-slate-50 text-slate-500'
                                        }`}>
                                        {task.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{task.location_name}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">
                                    {task.waste_type} Collection • {task.quantity_kg}kg • Reported {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {task.status === 'Assigned' && (
                                <button
                                    onClick={() => updateStatus(task.id, 'Cleaned')}
                                    className="flex-1 md:flex-none px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
                                >
                                    <CheckCircle2 size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" /> Confirm Cleanup
                                </button>
                            )}
                            {task.status === 'Cleaned' && (
                                <div className="px-6 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-emerald-100 shadow-sm">
                                    <ShieldCheck size={18} /> Cycle Completed
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
                        <Trash2 size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Zero Pending Directives</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
