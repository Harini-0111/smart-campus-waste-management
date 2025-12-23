import { useState } from 'react';
import { ArrowRight, Lock, Loader2, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

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

        try {
            const result = await login(username, password);
            if (!result.success) {
                // Granular Error States
                if (result.error.includes('401')) {
                    setError('INVALID CREDENTIALS: Access Denied.');
                } else if (result.error.includes('403')) {
                    setError('ACCOUNT RESTRICTED: Contact Administrator.');
                } else if (result.error.includes('RoleMismatch')) {
                    setError('ROLE MISMATCH: Unauthorized Segment.');
                } else {
                    setError(result.error || 'GATEWAY ERROR: Verification Aborted.');
                }
                setLoading(false);
            }
        } catch (err) {
            setError('NETWORK ANOMALY: Connection Unstable.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Parallax Background Layers */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.03)_0%,transparent_50%)]"></div>
            <div className="absolute top-[-20%] right-[-15%] w-[70%] h-[70%] bg-emerald-100/30 rounded-full blur-[140px] animate-blob"></div>
            <div className="absolute bottom-[-20%] left-[-15%] w-[70%] h-[70%] bg-slate-200/50 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>
            <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-100/20 rounded-full blur-[100px] animate-pulse-slow"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-16 animate-fadeIn">
                    <div className="flex justify-center mb-8">
                        <div className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-emerald-500/10 transition-all hover:scale-110 duration-700 animate-float glow-on-hover">
                            <Logo size={84} />
                        </div>
                    </div>
                    <h1 className="text-7xl font-black text-slate-950 tracking-[-0.06em] mb-4 leading-none text-gradient">EcoCampus</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse-slow opacity-80">Autonomous Sustainability Network</p>
                </div>

                {/* Login Card with Glow Reveal */}
                <div className="glass-panel p-12 rounded-[3.5rem] animate-glow-reveal scale-100 hover:scale-[1.02] transition-all duration-700 group/card">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-8">
                            <div className="relative group focus-glow rounded-2xl">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Access Handle</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={24} />
                                    <input
                                        type="text"
                                        required
                                        autoComplete="username"
                                        className="input-field pl-16 py-6 border-slate-200/50 bg-white/50 backdrop-blur-sm focus:bg-white"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="relative group focus-glow rounded-2xl">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Security Hash</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={24} />
                                    <input
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        className="input-field pl-16 py-6 border-slate-200/50 bg-white/50 backdrop-blur-sm focus:bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-6 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-r-2xl animate-shake flex items-center gap-4 shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-7 group relative overflow-hidden rounded-[2rem]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
                            <div className="relative z-10 flex items-center justify-center gap-6">
                                {loading ? <Loader2 className="animate-spin text-white" size={24} /> : (
                                    <>
                                        <span className="text-[13px] font-black uppercase tracking-[0.4em]">Initialize Session</span>
                                        <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform duration-500" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>
            </div>

            {/* Production Footer */}
            <div className="mt-24 text-center animate-fadeIn opacity-30 hover:opacity-100 transition-opacity duration-1000" style={{ animationDelay: '1.2s' }}>
                <div className="flex gap-12 justify-center items-center mb-8">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Autonomous</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Decentralized</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sustainable</div>
                </div>
                <div className="flex gap-8 justify-center items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                    <div className="px-5 py-2 glass-panel rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border-slate-200">Production Node v1.0.0_STABLE</div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
            </div>
        </div>
    );
};


export default Login;

