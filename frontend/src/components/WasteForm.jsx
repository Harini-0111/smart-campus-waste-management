import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, AlertCircle, ChevronDown, Package, Camera, X } from 'lucide-react';
import { API_URL } from '../config';
import { useNotification } from './NotificationSystem';

const WasteForm = ({ onEntryAdded }) => {
    const { notify } = useNotification();
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({ location_id: '', waste_type: 'Dry', quantity_kg: '', image_url: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [suggestedType, setSuggestedType] = useState(null);

    // Keyword-based waste type detection
    const wasteKeywords = {
        'Wet': ['food', 'scrap', 'organic', 'vegetable', 'fruit', 'leftover', 'peel', 'kitchen', 'compost'],
        'Dry': ['paper', 'cardboard', 'wrapper', 'tissue', 'napkin', 'box', 'bag', 'document'],
        'Recyclable': ['plastic', 'bottle', 'can', 'glass', 'metal', 'aluminum', 'container', 'packaging'],
        'E-waste': ['battery', 'wire', 'cable', 'electronic', 'charger', 'phone', 'computer', 'device']
    };

    const detectWasteType = (text) => {
        const lowerText = text.toLowerCase();
        for (const [type, keywords] of Object.entries(wasteKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return type;
            }
        }
        return null;
    };

    useEffect(() => {
        axios.get(`${API_URL}/locations`)
            .then(res => setLocations(res.data))
            .catch(err => console.error("Failed to load locations", err));
    }, []);

    const wasteTypes = [
        {
            id: 'Dry', label: 'Dry Waste', desc: 'Paper, cardboard, wrappers', color: 'bg-blue-500',
            mockImg: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&q=80&w=300'
        },
        {
            id: 'Wet', label: 'Wet Waste', desc: 'Food scrap, organic matter', color: 'bg-emerald-500',
            mockImg: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=300'
        },
        {
            id: 'Recyclable', label: 'Recyclable', desc: 'Plastic bottles, cans, glass', color: 'bg-amber-500',
            mockImg: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=300'
        },
        {
            id: 'E-waste', label: 'E-waste', desc: 'Batteries, wires, electronics', color: 'bg-purple-500',
            mockImg: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=300'
        }
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

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setFormData({ ...formData, description: newDescription });
        
        // Auto-suggest waste type based on keywords
        if (newDescription.length > 3) {
            const detected = detectWasteType(newDescription);
            if (detected && detected !== formData.waste_type) {
                setSuggestedType(detected);
            } else {
                setSuggestedType(null);
            }
        } else {
            setSuggestedType(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.location_id) return;

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

            notify("Collection Protocol Successfully Recorded", "success");
            setFormData({ location_id: '', waste_type: 'Dry', quantity_kg: '', image_url: '', description: '' });
            setPreview(null);
            setFile(null);
            setSuggestedType(null);
            if (onEntryAdded) onEntryAdded();
        } catch (error) {
            console.error('Error submitting form:', error);
            notify("Submission Failed. Check telemetry logs.", "critical");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-slideUp">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="font-black text-2xl text-slate-900 tracking-tight">Log Directive</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Entry Gateway</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-emerald-500">
                        <Package size={24} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    {/* Location */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vector Node <span className="text-red-500">*</span></label>
                        <div className="relative group">
                            <select
                                required
                                className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none appearance-none transition-all text-slate-800 font-bold hover:bg-white"
                                value={formData.location_id}
                                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                            >
                                <option value="">Select deployment sector...</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-5 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={18} />
                        </div>
                    </div>

                    {/* Waste Type */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waste Classification <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-4">
                            {wasteTypes.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, waste_type: type.id })}
                                    className={`cursor-pointer p-5 rounded-2xl border transition-all flex items-center gap-4 hover:shadow-xl ${formData.waste_type === type.id
                                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                                        : 'border-slate-100 hover:border-slate-200 bg-white'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full ${type.color} shadow-lg`} />
                                    <div>
                                        <h3 className={`text-sm font-black tracking-tight ${formData.waste_type === type.id ? 'text-slate-900' : 'text-slate-500'}`}>{type.label}</h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-1">{type.desc.split(',')[0]}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quantity & Image Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mass Magnitude <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    min="0.1"
                                    placeholder="0.00"
                                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-900 font-black tabular-nums text-lg placeholder:text-slate-200 hover:bg-white"
                                    value={formData.quantity_kg}
                                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                                />
                                <span className="absolute right-6 top-5 text-slate-400 text-[10px] font-black uppercase">KG</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium ml-1">Enter weight in kilograms</p>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Telemetry</label>
                            {!preview ? (
                                <div className="relative w-full h-[60px]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all group">
                                        <Camera size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Capture</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group w-full h-[60px] rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={removeImage} className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-[2px]">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description with Smart Detection */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observational Notes</label>
                        <div className="relative">
                            <textarea
                                placeholder="e.g., plastic bottles from cafeteria, food scraps from hostel..."  
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-800 font-bold placeholder:text-slate-300 placeholder:font-medium hover:bg-white resize-none"
                                rows="3"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                            ></textarea>
                            {suggestedType && (
                                <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between animate-slideUp">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-indigo-600">💡 Detected: {suggestedType} waste</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, waste_type: suggestedType });
                                            setSuggestedType(null);
                                        }}
                                        className="text-[10px] font-bold px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-wider"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] shadow-2xl shadow-slate-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:transform-none"
                        >
                            {loading ? 'Initializing Stream...' : <>Commit Log <Send size={18} /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WasteForm;
