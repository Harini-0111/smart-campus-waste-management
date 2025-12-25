import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, CircleCheck, ChevronDown, Package, Camera, X, Loader2 } from 'lucide-react';
import { API_URL } from '../config';
import { useNotification } from './NotificationSystem';

/* ---------- SMART CLASSIFICATION LOGIC ---------- */
function classifyWaste(text) {
    const lower = text.toLowerCase();

    if (lower.includes("plastic") || lower.includes("bottle") || lower.includes("wrapper")) return "Recyclable";
    if (lower.includes("food") || lower.includes("organic") || lower.includes("waste")) return "Wet";
    if (lower.includes("battery") || lower.includes("chemical") || lower.includes("sharp")) return "Hazardous";
    if (lower.includes("circuit") || lower.includes("electronic")) return "E-waste";

    return "Dry";
}
/* ------------------------------------------------ */

const WasteForm = ({ onEntryAdded }) => {
    const { notify } = useNotification();
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({
        location_id: '',
        waste_type: 'Dry',
        quantity_kg: '',
        image_url: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/locations`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
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
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
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

            // 🔥 AUTO CLASSIFICATION HERE
            const autoWasteType = classifyWaste(formData.description);

            await axios.post(`${API_URL}/waste`, {
                ...formData,
                waste_type: autoWasteType,
                image_url: finalImageUrl
            }, { headers });

            notify(`Waste auto-classified as ${autoWasteType}`, "success");

            setFormData({
                location_id: '',
                waste_type: 'Dry',
                quantity_kg: '',
                image_url: '',
                description: ''
            });

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
                        <h2 className="font-black text-4xl text-slate-950 tracking-tighter">
                            Log Waste Discovery
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                            Operational Telemetry Data Input
                        </p>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-[2rem] text-emerald-400 shadow-2xl animate-float">
                        <Package size={32} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-10">

                    {/* Location Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ChevronDown size={14} /> Deployment Sector
                        </label>
                        <select
                            required
                            className="input-field appearance-none cursor-pointer"
                            value={formData.location_id}
                            onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                        >
                            <option value="">Select Location Node...</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity Input */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Estimated Mass (KG)
                        </label>
                        <input
                            type="number"
                            required
                            placeholder="e.g. 15.5"
                            className="input-field"
                            value={formData.quantity_kg}
                            onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Camera size={14} /> Visual Audit (Optional)
                        </label>

                        {!preview ? (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all hover:border-emerald-500/30 group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="text-slate-300 group-hover:text-emerald-500 transition-colors mb-4" size={40} />
                                    <p className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Capture or Upload Asset</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                            </label>
                        ) : (
                            <div className="relative rounded-[2rem] overflow-hidden group">
                                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-4 left-4 p-4 bg-emerald-600/90 backdrop-blur-md rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <CircleCheck size={14} /> Image Encoded
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description & Auto-Classification */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Discovery Details
                            </label>
                            <span className="text-[9px] font-black text-intel-500 bg-intel-50 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                ✨ AI Auto-Sort Active
                            </span>
                        </div>
                        <textarea
                            placeholder="Describe the waste (e.g. 5 plastic bottles found near hostel entrance)"
                            className="input-field min-h-[140px] resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Pro-tip: Be specific about materials (plastic, food, electronic) for precise AI classification.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-8 text-lg flex items-center justify-center gap-4 group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                TRANSMIT TO HUB
                                <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default WasteForm;
