import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, AlertCircle, ChevronDown, Package, Camera, X, Loader2 } from 'lucide-react';
import { API_URL } from '../config';
import { useNotification } from './NotificationSystem';

const WasteForm = ({ onEntryAdded }) => {
    const { notify } = useNotification();
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({ location_id: '', waste_type: 'Dry', quantity_kg: '', image_url: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/locations`)
            .then(res => setLocations(res.data))
            .catch(err => console.error("Failed to load locations", err));
    }, []);

    const wasteTypes = [
        { id: 'Dry', label: 'Dry Waste', desc: 'Synthetics & Paper', color: 'bg-blue-500' },
        { id: 'Wet', label: 'Wet Waste', desc: 'Organic & Food', color: 'bg-emerald-500' },
        { id: 'Recyclable', label: 'Recyclable', desc: 'Glass & Metals', color: 'bg-amber-500' },
        { id: 'Hazardous', label: 'Hazardous', desc: 'Chemical & Sharp', color: 'bg-red-500' },
        { id: 'E-waste', label: 'Electronic', desc: 'Circuits & Batteries', color: 'bg-purple-500' }
    ];

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setPreview(null);
        setFile(null);
        setFormData({ ...formData, image_url: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.location_id) return notify("Sector selection required", "error");

        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            let finalImageUrl = formData.image_url;

            if (file) {
                const uploadData = new FormData();
                uploadData.append('image', file);
                const uploadRes = await axios.post(`${API_URL}/upload`, uploadData, {
                    headers: { ...headers, 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.imageUrl;
            }

            await axios.post(`${API_URL}/waste`, { ...formData, image_url: finalImageUrl }, {
                headers
            });

            notify("Log Committed to Blockchain History", "success");
            setFormData({ location_id: '', waste_type: 'Dry', quantity_kg: '', image_url: '', description: '' });
            setPreview(null);
            setFile(null);
            if (onEntryAdded) onEntryAdded();
        } catch (error) {
            console.error('Submission error:', error);
            notify("Data Sync Error. Transmission Interrupted.", "critical");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-slideUp pb-12">
            <div className="premium-card overflow-hidden shadow-2xl shadow-slate-200/60 transition-all hover:border-slate-300">
                <div className="px-12 py-10 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                        <span className="badge-emerald mb-3">Field Reporting</span>
                        <h2 className="font-black text-4xl text-slate-950 tracking-tighter">Log Waste Discovery</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Operational Telemetry Data Input</p>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-[2rem] text-emerald-400 shadow-2xl animate-float">
                        <Package size={32} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-12">
                    <div className="grid gap-12">
                        {/* Location */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deployment Sector</label>
                            <div className="relative group">
                                <select
                                    required
                                    className="input-field pl-8 pr-14 py-6 text-lg"
                                    value={formData.location_id}
                                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                                >
                                    <option value="" className="text-slate-400">Identify campus zone...</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id} className="text-slate-900 font-bold">{loc.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-slate-950 transition-colors" size={24} />
                            </div>
                        </div>

                        {/* Waste Type Grid */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Composition Classification</label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {wasteTypes.map(type => (
                                    <div
                                        key={type.id}
                                        onClick={() => setFormData({ ...formData, waste_type: type.id })}
                                        className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 group relative overflow-hidden ${formData.waste_type === type.id
                                            ? 'border-slate-950 bg-slate-950 ring-8 ring-slate-100'
                                            : 'border-slate-100 hover:border-slate-200 bg-white'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${type.color} shadow-lg`} />
                                        <div>
                                            <h3 className={`text-[12px] font-black tracking-widest uppercase ${formData.waste_type === type.id ? 'text-white' : 'text-slate-900'}`}>{type.label}</h3>
                                            <p className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${formData.waste_type === type.id ? 'text-slate-400' : 'text-slate-400'}`}>{type.desc}</p>
                                        </div>
                                        {formData.waste_type === type.id && (
                                            <div className="absolute top-4 right-4 text-emerald-400 animate-fadeIn">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Quantity */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Calibrated Mass</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        min="0.1"
                                        className="input-field pl-8 pr-16 py-6 text-2xl tabular-nums font-black"
                                        placeholder="0.0"
                                        value={formData.quantity_kg}
                                        onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 text-[12px] font-black uppercase tracking-widest">KG</span>
                                </div>
                            </div>

                            {/* Image Capture */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Visual Evidence</label>
                                {!preview ? (
                                    <div className="relative h-[76px]">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full h-full bg-slate-100 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center gap-4 text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-all group">
                                            <Camera size={24} className="group-hover:scale-110 group-hover:text-slate-950 transition-all" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Capture Asset</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group h-[76px] rounded-[2rem] overflow-hidden border-2 border-slate-950 shadow-2xl animate-fadeIn">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={removeImage} className="absolute inset-0 bg-slate-950/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-[4px]">
                                            <X size={28} className="animate-shake" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Direct Observations</label>
                            <textarea
                                placeholder="Detail environmental conditions or priority level..."
                                className="input-field px-8 py-6 text-lg min-h-[140px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-8 bg-slate-950 text-white hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-slate-950 flex items-center justify-center gap-6 group overflow-hidden"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-6 text-[12px] font-black uppercase tracking-[0.4em]">
                            {loading ? <Loader2 className="animate-spin" size={24} /> : <>TRANSMIT RECORD <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" /></>}
                        </div>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WasteForm;

