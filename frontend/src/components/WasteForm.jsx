import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, AlertCircle, ChevronDown, Package, Camera, X } from 'lucide-react';

const WasteForm = ({ onEntryAdded }) => {
    const [formData, setFormData] = useState({
        location_id: '',
        waste_type: 'Dry',
        quantity_kg: '',
        image_url: ''
    });
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3001/api/v1/locations')
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

    // Simulator for Image Upload
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, we'd upload 'file'. 
            // For this polished demo, we'll show a local preview immediately, 
            // but send a High-Quality Stock URL to the backend so it looks great on the dashboard.
            const localPreview = URL.createObjectURL(file);
            setPreview(localPreview);

            const selectedType = wasteTypes.find(t => t.id === formData.waste_type) || wasteTypes[0];
            setFormData({ ...formData, image_url: selectedType.mockImg });
        }
    };

    const removeImage = () => {
        setPreview(null);
        setFormData({ ...formData, image_url: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.location_id) return;

        setLoading(true);
        try {
            await axios.post('http://localhost:3001/api/v1/waste', formData);
            setSuccess(true);
            setFormData({ location_id: '', waste_type: 'Dry', quantity_kg: '', image_url: '' });
            setPreview(null);
            if (onEntryAdded) onEntryAdded();
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto animate-slideUp">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg text-slate-900">Log Collection</h2>
                        <p className="text-xs text-slate-500">Enter waste details below</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-emerald-600">
                        <Package size={20} />
                    </div>
                </div>

                {success && (
                    <div className="px-8 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3 animate-fadeIn">
                        <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 className="text-emerald-600" size={16} /></div>
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Successfully Recorded</p>
                            <p className="text-xs text-emerald-600 leading-none mt-0.5">The dashboard stats have been updated.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Source Location <span className="text-red-500">*</span></label>
                        <div className="relative group">
                            <select
                                required
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all text-slate-800 font-medium hover:bg-white"
                                value={formData.location_id}
                                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                            >
                                <option value="">Select a location...</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={16} />
                        </div>
                    </div>

                    {/* Waste Type */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Waste Category <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-3">
                            {wasteTypes.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, waste_type: type.id })}
                                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 hover:shadow-md ${formData.waste_type === type.id
                                            ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${type.color} shadow-sm`} />
                                    <div>
                                        <h3 className={`text-sm font-bold ${formData.waste_type === type.id ? 'text-slate-900' : 'text-slate-700'}`}>{type.label}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quantity & Image Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Net Weight <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    min="0.1"
                                    placeholder="0.00"
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300 hover:bg-white"
                                    value={formData.quantity_kg}
                                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                                />
                                <span className="absolute right-4 top-3.5 text-slate-400 text-xs font-bold">KG</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Photo Proof</label>
                            {!preview ? (
                                <div className="relative w-full">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-100 transition-colors">
                                        <Camera size={18} />
                                        <span className="text-xs font-semibold">Upload</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group w-full h-[46px] rounded-xl overflow-hidden border border-slate-200">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={removeImage} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Submitting Report...' : <>Submit Report <Send size={18} /></>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default WasteForm;
