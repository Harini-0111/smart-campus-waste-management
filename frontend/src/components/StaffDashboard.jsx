import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { CheckCircle2, Clock, Trash2, ShieldCheck, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { ListSkeleton } from './SkeletonLoader';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [completionImage, setCompletionImage] = useState(null);

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

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCompletionImage(res.data.imageUrl);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleComplete = async (taskId) => {
        if (!completionImage) return alert('Photo proof is required for verification.');

        try {
            await axios.patch(`${API_URL}/tasks/${taskId}/status`,
                { status: 'Completed', completion_image_url: completionImage },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setCompleting(null);
            setCompletionImage(null);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
            <ListSkeleton items={3} />
        </div>
    );

    return (
        <div className="space-y-12 animate-fadeIn pb-24 max-w-5xl mx-auto px-4">
            <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-16 text-white shadow-2xl group animate-slideUp">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 -mr-32 -mt-32 rounded-full blur-[120px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div>
                        <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-lg mb-6 border border-emerald-500/20">Operational Sector</span>
                        <h2 className="text-7xl font-black mb-4 tracking-[-0.05em] leading-none">Field Directives</h2>
                        <p className="text-slate-400 font-medium max-w-lg text-lg">Maintain campus hygiene standards. Execute assignments with cryptographic visual verification.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center min-w-[160px]">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pending</span>
                        <span className="text-6xl font-black text-emerald-400 tabular-nums">{tasks.filter(t => t.status !== 'Completed').length}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-8">
                {tasks.length > 0 ? tasks.map((task, i) => (
                    <div key={task.id} className="premium-card p-10 flex flex-col gap-10 transition-all hover:border-slate-300 border-l-8 border-l-emerald-500 shadow-xl shadow-slate-200/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex gap-8 items-start">
                                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white text-2xl font-black shadow-2xl transform -rotate-3 transition-transform group-hover:rotate-0
                                    ${task.waste_type === 'Wet' ? 'bg-emerald-500' :
                                        task.waste_type === 'Dry' ? 'bg-blue-500' :
                                            task.waste_type === 'Electronic' ? 'bg-slate-950' : 'bg-orange-500'}`}>
                                    {task.waste_type[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol #{task.id}</span>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            task.status === 'Assigned' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-950 tracking-tighter mb-2">{task.location_name}</h3>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                        <span>{task.waste_type} Payload</span>
                                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                        <span className="text-slate-600">~{task.quantity_kg}KG</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                {task.status === 'Assigned' && !completing && (
                                    <button
                                        onClick={() => setCompleting(task.id)}
                                        className="btn-primary w-full md:w-auto px-10 py-5 bg-slate-950 text-white hover:bg-emerald-500 flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 size={18} /> INITIALIZE CLEANUP
                                    </button>
                                )}
                                {task.status === 'Completed' && (
                                    <div className="px-10 py-5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border border-emerald-100">
                                        <ShieldCheck size={20} /> MISSION RESOLVED
                                    </div>
                                )}
                            </div>
                        </div>

                        {completing === task.id && (
                            <div className="bg-slate-50/50 rounded-[2.5rem] p-12 border-2 border-dashed border-slate-200 animate-slideUp space-y-10">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Camera size={18} className="text-emerald-500" /> Resolution Audit
                                    </h4>
                                    <button onClick={() => setCompleting(null)} className="text-[10px] font-black text-slate-400 hover:text-slate-950 uppercase tracking-widest transition-colors">Cancel Operation</button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium italic">"Provide high-resolution visual evidence of the sanitized zone to finalize the operational cycle."</p>
                                        <input
                                            type="file"
                                            id={`upload-${task.id}`}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <label
                                            htmlFor={`upload-${task.id}`}
                                            className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-emerald-500/50 hover:bg-emerald-50 transition-all cursor-pointer group"
                                        >
                                            {uploading ? <Loader2 className="animate-spin text-emerald-500" /> : (
                                                <>
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={32} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">Transmit Visual Asset</span>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <div className="flex flex-col justify-end gap-8">
                                        {completionImage && (
                                            <div className="relative rounded-[2rem] overflow-hidden aspect-video border-4 border-white shadow-2xl animate-fadeIn">
                                                <img src={completionImage} alt="Verified proof" className="w-full h-full object-cover" />
                                                <div className="absolute top-4 right-4 animate-float">
                                                    <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg border-2 border-white/20">
                                                        <ShieldCheck size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleComplete(task.id)}
                                            disabled={!completionImage || uploading}
                                            className="btn-primary w-full py-6 bg-slate-950 text-white hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-slate-950 flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle2 size={20} /> SUBMIT RESOLUTION & LOG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-32 premium-card rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 animate-float">
                            <Trash2 size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-4">Operational Stasis</h3>
                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Zero Pending Field Directives Available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;

