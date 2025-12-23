import { useState } from 'react';
import { UserCircle, ArrowRight, Lock, Loader2, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-10 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-3xl shadow-2xl shadow-emerald-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <LayoutGrid size={40} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">EcoCampus</h1>
                    <div className="h-1.5 w-16 bg-emerald-500 mx-auto rounded-full mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Smart Waste Intelligence</p>
                </div>

                {/* Card Section */}
                <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 p-10 animate-slideUp">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Access ID</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Secure PIN</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    ENTER DASHBOARD
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Credentials */}
                <div className="mt-10 grid grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Admin Access</p>
                        <p className="text-xs font-bold text-slate-300">admin / password123</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Student Access</p>
                        <p className="text-xs font-bold text-slate-300">student1 / password123</p>
                    </div>
                </div>
            </div>

            <p className="mt-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] relative z-10 transition-colors hover:text-emerald-500 cursor-default">
                Developed for Smart Campus Hackathon 2025
            </p>
        </div>
    );
};

export default Login;
