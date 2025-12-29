import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { CheckCircle2, Clock, Trash2, ShieldCheck, AlertTriangle, Package, MapPin, Calendar, User } from 'lucide-react';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${API_URL}/tasks/my-tasks`, {
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
        // Poll every 30 seconds for new assignments
        const interval = setInterval(fetchTasks, 30000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-500/20 text-red-400';
            case 'High': return 'bg-orange-500/20 text-orange-400';
            case 'Normal': return 'bg-blue-500/20 text-blue-400';
            case 'Low': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const pendingTasks = tasks.filter(t => t.status !== 'Completed');
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    if (loading) return <div className="p-10 text-center">Loading assigned tasks...</div>;

    return (
        <div className="space-y-10 animate-fadeIn pb-24 max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">Operations Center</span>
                        <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-900">Field Directives</h2>
                        <p className="text-slate-600 font-medium">Execute assigned collection protocols with precision.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200">
                            <div className="text-3xl font-black text-slate-900">{pendingTasks.length}</div>
                            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Active Tasks</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200">
                            <div className="text-3xl font-black text-slate-900">{completedTasks.length}</div>
                            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Completed</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200">
                            <div className="text-3xl font-black text-slate-900">{tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length}</div>
                            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Urgent</div>
                        </div>
                    </div>
            </div>

            {/* Pending Tasks */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800">Active Assignments</h3>
                    {pendingTasks.length > 0 && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-600 font-black text-xs rounded-full">{pendingTasks.length} pending</span>
                    )}
                </div>

                {pendingTasks.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                        <CheckCircle2 className="mx-auto mb-4 text-green-500" size={48} />
                        <p className="text-slate-600 font-bold">All caught up! No pending tasks.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingTasks.map((task) => (
                            <div key={task.id} className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-800 mb-1">{task.waste_type} Collection</h4>
                                        <p className="text-sm text-slate-600 font-semibold flex items-center gap-2">
                                            <Package size={16} />
                                            {task.quantity_kg} kg
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin size={16} className="text-emerald-600" />
                                        <span className="font-semibold">{task.department_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User size={16} className="text-blue-600" />
                                        <span className="font-semibold">Reported by {task.student_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar size={16} className="text-purple-600" />
                                        <span className="font-semibold">{new Date(task.assigned_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {task.location_description && (
                                    <p className="text-sm text-slate-600 mb-4 font-medium">📍 {task.location_description}</p>
                                )}

                                {task.description && (
                                    <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">💬 {task.description}</p>
                                )}

                                <div className="flex gap-2 mt-4">
                                    {task.status === 'Assigned' && (
                                        <button
                                            onClick={() => updateStatus(task.id, 'In Progress')}
                                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                        >
                                            Start Task
                                        </button>
                                    )}
                                    {task.status === 'In Progress' && (
                                        <button
                                            onClick={() => updateStatus(task.id, 'Completed')}
                                            className="flex-1 px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-800">Completed Tasks</h3>
                    <div className="grid gap-4">
                        {completedTasks.slice(0, 5).map((task) => (
                            <div key={task.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 opacity-75">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-700">{task.waste_type} - {task.quantity_kg} kg</h4>
                                        <p className="text-xs text-slate-600">{task.department_name}</p>
                                    </div>
                                    <CheckCircle2 className="text-green-600" size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
