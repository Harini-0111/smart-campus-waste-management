import { useState } from 'react';
import WasteForm from './WasteForm';
import { LayoutGrid, Leaf, Award, ArrowRight, History, Recycle } from 'lucide-react';
import axios from 'axios';

const UserDashboard = () => {
    const [view, setView] = useState('home'); // 'home' | 'log'

    const handleEntryAdded = () => {
        setView('home');
    };

    return (
        <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-24 px-4">
            {view === 'home' ? (
                <div className="space-y-12">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-slate-200/50 group animate-slideUp">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 -mr-20 -mt-20 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 -ml-10 -mb-10 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="text-center md:text-left flex-1">
                                <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">Environment Vanguard</span>
                                <h2 className="text-5xl font-black mb-6 tracking-tighter leading-[1.1]">Sustainable <br /><span className="text-emerald-500">Campus Flow.</span></h2>
                                <p className="text-slate-400 text-lg opacity-90 max-w-md font-medium leading-relaxed">
                                    Your digital interface for a cleaner campus. Log. Track. Inspire.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 w-full md:w-80">
                                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl flex items-center gap-5 hover:bg-white/10 transition-all stagger-1">
                                    <div className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Impact Points</p>
                                        <h4 className="text-3xl font-black tabular-nums">1,542</h4>
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl flex items-center gap-5 hover:bg-white/10 transition-all stagger-2">
                                    <div className="p-3.5 bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/20">
                                        <Recycle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Eco Level</p>
                                        <h4 className="text-3xl font-black tabular-nums">IV</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button
                            onClick={() => setView('log')}
                            className="group relative bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 text-left overflow-hidden stagger-1"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm shadow-emerald-100">
                                    <Leaf size={32} />
                                </div>
                                <h3 className="font-black text-3xl text-slate-900 tracking-tight mb-3">Report Collection</h3>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">Help us orchestrate a cleaner campus. Log waste collection in seconds.</p>
                                <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[10px]">
                                    Initialize Reporting <ArrowRight size={16} className="group-hover:translate-x-3 transition-transform" />
                                </div>
                            </div>
                        </button>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col stagger-2">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                                <History size={32} />
                            </div>
                            <h3 className="font-black text-3xl text-slate-900 tracking-tight mb-3">Personal Ledger</h3>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-sm">Audit your historical contributions and climate ROI.</p>
                            <div className="mt-auto pt-8 flex gap-2">
                                <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">System Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* Impact Stats */}
                    <div>
                        <div className="flex items-end gap-3 mb-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Environmental Intelligence</h3>
                            <span className="h-px flex-1 bg-slate-200 mb-3 rounded-full opacity-50"></span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Trees Protected', val: '12', icon: '🌳', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'Carbon Offset', val: '8.4kg', icon: '☁️', color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'Energy Conserved', val: '42kWh', icon: '⚡', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                { label: 'Water Purified', val: '150L', icon: '💧', color: 'text-sky-500', bg: 'bg-sky-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-2xl transition-all text-center group flex flex-col items-center stagger-3">
                                    <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner transform group-hover:-translate-y-1 transition-transform`}>{stat.icon}</div>
                                    <p className={`text-4xl font-black ${stat.color} mb-2 tracking-tighter tabular-nums`}>{stat.val}</p>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-slideUp max-w-2xl mx-auto">
                    <button
                        onClick={() => setView('home')}
                        className="mb-10 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <ArrowRight size={16} className="rotate-180" /> Operational Context
                    </button>
                    <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-2xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -mr-16 -mt-16 rounded-full"></div>
                        <WasteForm onEntryAdded={handleEntryAdded} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
