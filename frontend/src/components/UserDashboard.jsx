import { useState } from 'react';
import WasteForm from './WasteForm';
import { LayoutGrid, Leaf, Award, ArrowRight, History, Recycle } from 'lucide-react';
import axios from 'axios';

const UserDashboard = () => {
    const [view, setView] = useState('home'); // 'home' | 'log'

    const handleEntryAdded = () => {
        setView('home');
        // Ideally show a success toast here
    };

    return (
        <div className="space-y-6 pb-20 animate-fadeIn">
            {view === 'home' ? (
                <>
                    {/* Welcome Section */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
                        <h2 className="text-2xl font-bold mb-2">Welcome back, Student! 👋</h2>
                        <p className="opacity-90 max-w-lg text-emerald-50">Ready to make the campus greener? Log your waste disposal and earn points for your hostel block.</p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-2 border border-white/20">
                                <Award className="text-amber-300" size={20} />
                                <span className="font-bold">1,240 pts</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-2 border border-white/20">
                                <Recycle className="text-emerald-300" size={20} />
                                <span className="font-bold">45.2 kg Recycled</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setView('log')}
                            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all text-left flex items-start gap-4"
                        >
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Leaf size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700">Log Waste</h3>
                                <p className="text-sm text-slate-500 mt-1">Upload stats for recycling or disposal</p>
                            </div>
                            <ArrowRight className="ml-auto text-slate-300 group-hover:text-emerald-500" />
                        </button>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 text-slate-500 rounded-lg">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">My History</h3>
                                    <p className="text-sm text-slate-500 mt-1">View past submissions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Cards */}
                    <h3 className="font-bold text-slate-800 text-lg mt-4">Your Impact</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                            <p className="text-3xl font-bold text-emerald-600">12</p>
                            <p className="text-xs text-slate-500 font-medium uppercase mt-1">Trees Saved</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                            <p className="text-3xl font-bold text-blue-600">8.4</p>
                            <p className="text-xs text-slate-500 font-medium uppercase mt-1">KG CO2 Offset</p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="animate-slideUp">
                    <button
                        onClick={() => setView('home')}
                        className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                        Start Over
                    </button>
                    <WasteForm onEntryAdded={handleEntryAdded} />
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
