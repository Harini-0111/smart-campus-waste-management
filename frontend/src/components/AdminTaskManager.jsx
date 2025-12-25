import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { ClipboardList, UserCheck, AlertTriangle, CheckCircle2, Clock, Send, Activity, Plus } from 'lucide-react';
import { ListSkeleton } from './SkeletonLoader';

const AdminTaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [unassignedWaste, setUnassignedWaste] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null);
    const [showAddWorker, setShowAddWorker] = useState(false);
    const [newWorker, setNewWorker] = useState({ username: '', password: '', full_name: '', email: '' });
    const [view, setView] = useState('tasks'); // 'tasks' | 'unassigned'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, staffRes, unassignedRes] = await Promise.all([
                    axios.get(`${API_URL}/tasks`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${API_URL}/users/staff`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${API_URL}/unassigned-waste`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);
                setTasks(tasksRes.data);
                setStaff(staffRes.data);
                setUnassignedWaste(unassignedRes.data);
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
            // Refresh data
            const [tasksRes, unassignedRes] = await Promise.all([
                axios.get(`${API_URL}/tasks`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`${API_URL}/unassigned-waste`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
            ]);
            setTasks(tasksRes.data);
            setUnassignedWaste(unassignedRes.data);
            setAssigning(null);
        } catch (err) {
            console.error('Assign error:', err);
        }
    };

    const handleCreateWorker = async () => {
        try {
            await axios.post(`${API_URL}/users/staff`, newWorker, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            // Refresh staff list
            const staffRes = await axios.get(`${API_URL}/users/staff`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setStaff(staffRes.data);
            setShowAddWorker(false);
            setNewWorker({ username: '', password: '', full_name: '', email: '' });
        } catch (err) {
            console.error('Create worker error:', err);
            alert(err.response?.data?.error || 'Failed to create worker');
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
                <div className="flex gap-4">
                    <button
                        onClick={() => setView('tasks')}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'tasks'
                            ? 'bg-slate-950 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Active Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setView('unassigned')}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'unassigned'
                            ? 'bg-slate-950 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Unassigned ({unassignedWaste.length})
                    </button>
                    <button
                        onClick={() => setShowAddWorker(true)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-emerald-500 text-white hover:bg-emerald-600`}
                    >
                        ADD WORKER
                    </button>
                </div>
            </div>

            <div className="grid gap-8">
                {view === 'tasks' ? (
                    tasks.map((task) => (
                        <TaskCard key={task.id} task={task} staff={staff} assigning={assigning} setAssigning={setAssigning} handleAssign={handleAssign} />
                    ))
                ) : (
                    unassignedWaste.map((waste) => (
                        <UnassignedWasteCard key={waste.id} waste={waste} staff={staff} assigning={assigning} setAssigning={setAssigning} handleAssign={handleAssign} />
                    ))
                )}

                {((view === 'tasks' && tasks.length === 0) || (view === 'unassigned' && unassignedWaste.length === 0)) && (
                    <div className="premium-card border-4 border-dashed border-slate-100 rounded-[3rem] p-32 text-center animate-fadeIn flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 animate-float">
                            <CheckCircle2 size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-950 tracking-tighter">System Static</h3>
                        <p className="text-slate-400 mt-4 font-bold max-w-md mx-auto text-sm uppercase tracking-[0.3em]">
                            {view === 'tasks' ? 'All zones verified clean. Zero pending directives detected.' : 'No unassigned waste reports found.'}
                        </p>
                    </div>
                )}
            </div>
            {showAddWorker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-xl z-60 shadow-2xl">
                        <h3 className="text-2xl font-black mb-4">Create Field Worker</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input className="input-field" placeholder="Username" value={newWorker.username} onChange={e => setNewWorker({ ...newWorker, username: e.target.value })} />
                            <input className="input-field" placeholder="Password" type="password" value={newWorker.password} onChange={e => setNewWorker({ ...newWorker, password: e.target.value })} />
                            <input className="input-field" placeholder="Full name" value={newWorker.full_name} onChange={e => setNewWorker({ ...newWorker, full_name: e.target.value })} />
                            <input className="input-field" placeholder="Email (optional)" value={newWorker.email} onChange={e => setNewWorker({ ...newWorker, email: e.target.value })} />
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={() => setShowAddWorker(false)} className="px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest">Cancel</button>
                            <button onClick={handleCreateWorker} className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TaskCard = ({ task, staff, assigning, setAssigning, handleAssign }) => (
    <div className="premium-card p-10 flex flex-col md:flex-row gap-10 items-start md:items-center justify-between border-l-8 border-l-slate-950 hover:border-slate-300 shadow-xl shadow-slate-200/50">
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

        <TaskAssignment task={task} staff={staff} assigning={assigning} setAssigning={setAssigning} handleAssign={handleAssign} />
    </div>
);

const UnassignedWasteCard = ({ waste, staff, assigning, setAssigning, handleAssign }) => (
    <div className="premium-card p-10 flex flex-col md:flex-row gap-10 items-start md:items-center justify-between border-l-8 border-l-orange-500 hover:border-slate-300 shadow-xl shadow-slate-200/50">
        <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border bg-orange-50 border-orange-100 text-orange-600">
                    Unassigned Report
                </span>
                <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">{waste.waste_type} Waste Stream</span>
            </div>

            <div>
                <h3 className="text-3xl font-black text-slate-950 tracking-tighter mb-2">{waste.location_name}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">{waste.description || 'Waste collection report awaiting task assignment.'}</p>
                <p className="text-slate-400 text-sm mt-2">Quantity: {waste.quantity_kg} kg</p>
            </div>

            <div className="flex gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest items-center">
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg"><Clock size={14} className="text-slate-950" /> {new Date(waste.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>

        <div className="flex flex-col items-end gap-6 min-w-[240px] relative">
            <button
                onClick={() => setAssigning(waste.id)}
                className="btn-primary w-full py-6 bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center gap-4 group"
            >
                CREATE TASK
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            </button>

            {assigning === waste.id && (
                <div className="absolute top-0 right-0 p-8 bg-white rounded-[2.5rem] shadow-2xl z-20 w-80 border-2 border-orange-600 animate-slideUp">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Select Field Personnel</p>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {staff.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleAssign(waste.id, s.id)}
                                className="w-full text-left p-4 rounded-2xl hover:bg-orange-600 transition-all border border-slate-100 hover:border-orange-600 group"
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
);

const TaskAssignment = ({ task, staff, assigning, setAssigning, handleAssign }) => (
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
);

export default AdminTaskManager;
