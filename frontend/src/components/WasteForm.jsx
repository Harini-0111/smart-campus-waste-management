import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, AlertCircle, ChevronDown, Package } from 'lucide-react';

const WasteForm = ({ onEntryAdded }) => {
    const [formData, setFormData] = useState({
        location_id: '',
        waste_type: 'Dry',
        quantity_kg: ''
    });
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3001/api/v1/locations')
            .then(res => setLocations(res.data))
            .catch(err => console.error("Failed to load locations", err));
    }, []);

    const wasteTypes = [
        { id: 'Dry', label: 'Dry Waste', desc: 'Paper, cardboard, wrappers', color: 'bg-blue-500' },
        { id: 'Wet', label: 'Wet Waste', desc: 'Food scrap, organic matter', color: 'bg-emerald-500' },
        { id: 'Recyclable', label: 'Recyclable', desc: 'Plastic bottles, cans, glass', color: 'bg-amber-500' },
        { id: 'E-waste', label: 'E-waste', desc: 'Batteries, wires, electronics', color: 'bg-purple-500' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.location_id) return;

        setLoading(true);
        try {
            await axios.post('http://localhost:3001/api/v1/waste', formData);
            setSuccess(true);
            setFormData({ ...formData, quantity_kg: '' });
            if (onEntryAdded) onEntryAdded();
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">Log Collection Details</h2>
                    <Package className="text-slate-300" />
                </div>

                {success && (
                    <div className="px-8 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3 animate-fadeIn">
                        <CheckCircle2 className="text-emerald-600" size={20} />
                        <div>
                            <p className="text-sm font-semibold text-emerald-800">Successfully Recorded</p>
                            <p className="text-xs text-emerald-600">The dashboard stats have been updated.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Location */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">Source Location <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                required
                                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all text-slate-800"
                                value={formData.location_id}
                                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                            >
                                <option value="">Select a location...</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Waste Type */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">Waste Category <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {wasteTypes.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, waste_type: type.id })}
                                    className={`cursor-pointer p-4 rounded-lg border transition-all flex items-start gap-4 hover:shadow-sm ${formData.waste_type === type.id
                                        ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                >
                                    <div className={`mt-1 w-3 h-3 rounded-full ${type.color} flex-shrink-0`} />
                                    <div>
                                        <h3 className={`text-sm font-semibold ${formData.waste_type === type.id ? 'text-slate-900' : 'text-slate-700'}`}>{type.label}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{type.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">Net Quantity <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    min="0.1"
                                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-300"
                                    placeholder="0.00"
                                    value={formData.quantity_kg}
                                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                                />
                                <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">kg</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <AlertCircle size={14} /> Verification required for quantities above 50kg.
                        </p>
                    </div>

                    {/* Action */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            onClick={() => setFormData({ location_id: '', waste_type: 'Dry', quantity_kg: '' })}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : <>Submit Report <Send size={16} /></>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default WasteForm;
