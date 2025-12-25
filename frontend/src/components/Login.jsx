import { useState } from 'react';
import { ArrowRight, Lock, Loader2, UserCircle, Shield, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import Logo from './Logo';
import Register from './Register';

const Login = () => {
    const { login } = useAuth();
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP Verification
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/send-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setUserEmail(data.email);
            setStep(2);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Network error. Please try again.');
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/verify-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'OTP verification failed');
            }

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Reload page to trigger auth state change
            window.location.reload();

        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/send-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend OTP');
            }

            setLoading(false);
            alert('OTP resent successfully!');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
            setLoading(false);
        }
    };

    if (showRegister) {
        return <Register onSwitchToLogin={() => setShowRegister(false)} />;
    }

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
                    <p className="text-slate-400 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse-slow opacity-80">
                        {step === 1 ? 'Smart Waste Management System' : 'Two-Factor Authentication'}
                    </p>
                </div>

                {/* Sample Credentials Info - Only show on step 1 */}
                {step === 1 && (
                    <div className="glass-panel p-6 rounded-[2rem] mb-8 animate-fadeIn">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 text-center">Demo Credentials</h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Student:</span>
                                <span className="text-slate-700 font-black">john_doe / password123</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Admin:</span>
                                <span className="text-slate-700 font-black">admin_cse / password123</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Staff:</span>
                                <span className="text-slate-700 font-black">staff_ram / password123</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Card with Glow Reveal */}
                <div className="glass-panel p-12 rounded-[3.5rem] animate-glow-reveal scale-100 hover:scale-[1.02] transition-all duration-700 group/card">
                    {step === 1 ? (
                        /* Step 1: Username & Password */
                        <form onSubmit={handleCredentialsSubmit} className="space-y-10">
                            <div className="space-y-8">
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Username or Email</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={24} />
                                        <input
                                            type="text"
                                            required
                                            autoComplete="username"
                                            className="input-field pl-16 py-6 border-slate-200/50 bg-white/50 backdrop-blur-sm focus:bg-white"
                                            placeholder="Username or Email"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Password</label>
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
                                            <span className="text-[13px] font-black uppercase tracking-[0.4em]">Continue</span>
                                            <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform duration-500" />
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="text-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRegister(true)}
                                    className="text-slate-400 hover:text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
                                >
                                    Don't have an account? Register Here
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Step 2: OTP Verification */
                        <form onSubmit={handleOTPSubmit} className="space-y-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail className="text-emerald-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 mb-3">Check Your Email</h3>
                                <p className="text-slate-500 text-sm">
                                    We've sent a 6-digit verification code to<br />
                                    <span className="font-bold text-slate-700">{userEmail}</span>
                                </p>
                            </div>

                            <div className="relative group focus-glow rounded-2xl">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2 text-center">Enter Verification Code</label>
                                <div className="relative">
                                    <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={24} />
                                    <input
                                        type="text"
                                        maxLength="6"
                                        required
                                        className="input-field pl-16 py-6 text-center text-2xl font-black tracking-[0.5em] border-slate-200/50 bg-white/50 backdrop-blur-sm focus:bg-white"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-600 text-xs font-black uppercase tracking-widest rounded-r-2xl animate-shake flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="btn-primary w-full py-6 group relative overflow-hidden rounded-[2rem]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? <Loader2 className="animate-spin text-white" size={20} /> : (
                                        <>
                                            <Shield size={20} />
                                            <span className="text-xs font-black uppercase tracking-[0.3em]">Verify & Sign In</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="text-center pt-4 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setOtp(''); setError(''); }}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest transition-colors block w-full"
                                >
                                    ← Back to Login
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-emerald-600 hover:text-emerald-700 text-xs font-black uppercase tracking-widest transition-colors"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Production Footer */}
            <div className="mt-24 text-center animate-fadeIn opacity-30 hover:opacity-100 transition-opacity duration-1000" style={{ animationDelay: '1.2s' }}>
                <div className="flex gap-12 justify-center items-center mb-8">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sustainable</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Efficient</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Smart</div>
                </div>
                <div className="flex gap-8 justify-center items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                    <div className="px-5 py-2 glass-panel rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border-slate-200">EcoCampus v2.0.0</div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;

