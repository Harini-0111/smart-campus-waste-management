import { useState } from 'react';
import { UserCircle, ArrowRight, Lock, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [language, setLanguage] = useState('en');
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', role: 'student' });

    const translations = {
        en: {
            title: 'EcoCampus',
            subtitle: 'Smart Waste Intelligence',
            accessId: 'Access ID',
            securePin: 'Secure PIN',
            enterDashboard: 'Enter Dashboard',
            adminAccess: 'Admin Access',
            studentAccess: 'Student Access',
            demoCredentials: 'Demo Credentials',
            welcomeBack: 'Welcome Back',
            newUser: 'New User?',
            createAccount: 'Create Account',
            email: 'Email Address',
            selectRole: 'Select Role',
            alreadyHave: 'Already have account?',
            backToLogin: 'Back to Login',
            registerNow: 'Register Now',
            developedFor: 'Developed for Smart Campus Hackathon 2025'
        },
        hi: {
            title: 'ईकोकैंपस',
            subtitle: 'स्मार्ट कचरा खुफिया',
            accessId: 'एक्सेस आईडी',
            securePin: 'सुरक्षित पिन',
            enterDashboard: 'डैशबोर्ड दर्ज करें',
            adminAccess: 'प्रशासक पहुंच',
            studentAccess: 'छात्र पहुंच',
            demoCredentials: 'डेमो क्रेडेंशियल',
            welcomeBack: 'वापस स्वागत है',
            newUser: 'नया उपयोगकर्ता?',
            createAccount: 'खाता बनाएँ',
            email: 'ईमेल पता',
            selectRole: 'भूमिका चुनें',
            alreadyHave: 'पहले से खाता है?',
            backToLogin: 'लॉगिन पर वापस जाएं',
            registerNow: 'अभी पंजीकरण करें',
            developedFor: '2025 स्मार्ट कैंपस हैकाथॉन के लिए विकसित'
        }
    };

    const t = translations[language];

    const demoUsers = [
        { role: 'admin', username: 'admin', password: 'password123', color: 'from-red-500 to-pink-500', icon: '👑' },
        { role: 'student', username: 'student1', password: 'password123', color: 'from-blue-500 to-cyan-500', icon: '🎓' },
        { role: 'staff', username: 'staff1', password: 'password123', color: 'from-amber-500 to-orange-500', icon: '🧹' }
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(username, password);
        if (!result.success) {
            setError(result.error);
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => {
            setError('Registration coming soon! Use demo credentials for now.');
            setLoading(false);
        }, 1000);
    };

    const quickFillDemo = (user) => {
        setUsername(user.username);
        setPassword(user.password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px] -mr-64 -mt-64 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-40 -mb-40"></div>

            {/* Language Toggle */}
            <div className="absolute top-8 right-8 z-50 flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${language === 'en' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('hi')}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${language === 'hi' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                    HI
                </button>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl shadow-2xl shadow-emerald-500/30 mb-8 transform hover:scale-110 transition-transform duration-500">
                        <img src="/ecocampus-logo.svg" alt="EcoCampus" className="w-16 h-16" />
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">{t.title}</h1>
                    <div className="h-1.5 w-20 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto rounded-full mb-4 shadow-lg shadow-emerald-500/30"></div>
                    <p className="text-slate-300 font-bold uppercase tracking-[0.2em] text-[11px]">{t.subtitle}</p>
                </div>

                {/* Card Section */}
                <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 p-10 animate-slideUp">
                    {!isRegister ? (
                        // LOGIN FORM
                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="text-center mb-8">
                                <p className="text-slate-300 font-bold text-lg">{t.welcomeBack}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t.accessId}</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t.securePin}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 pl-12 pr-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
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
                                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group uppercase tracking-wider text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {t.enterDashboard}
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-4 border-t border-slate-700/50">
                                <p className="text-slate-400 text-sm">{t.newUser} <button type="button" onClick={() => setIsRegister(true)} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">{t.createAccount}</button></p>
                            </div>
                        </form>
                    ) : (
                        // REGISTER FORM
                        <form onSubmit={handleRegister} className="space-y-8">
                            <div className="text-center mb-8">
                                <p className="text-slate-300 font-bold text-lg">{t.createAccount}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t.accessId}</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="Username"
                                            value={registerData.username}
                                            onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t.email}</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                        placeholder="you@campus.edu"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t.securePin}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 pl-12 pr-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="••••••••"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">{t.selectRole}</label>
                                    <select
                                        value={registerData.role}
                                        onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white p-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="student">Student</option>
                                        <option value="staff">Cleaning Staff</option>
                                    </select>
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
                                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group uppercase tracking-wider text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {t.registerNow}
                                        <UserPlus size={18} />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-4 border-t border-slate-700/50">
                                <p className="text-slate-400 text-sm"><button type="button" onClick={() => setIsRegister(false)} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">{t.backToLogin}</button></p>
                            </div>
                        </form>
                    )}
                </div>

                {/* Demo Credentials Cards */}
                {!isRegister && (
                    <div className="mt-10 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">{t.demoCredentials}</p>
                        <div className="grid grid-cols-1 gap-3">
                            {demoUsers.map((user, i) => (
                                <button
                                    key={i}
                                    onClick={() => quickFillDemo(user)}
                                    className="group bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/70 hover:to-slate-600/70 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all transform hover:scale-102 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`text-2xl bg-gradient-to-br ${user.color} p-3 rounded-xl text-white font-black`}>{user.icon}</div>
                                        <div className="flex-1 text-left">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-400 transition-colors mb-1">{user.role}</p>
                                            <p className="text-xs font-bold text-slate-200">{user.username} / {user.password}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] relative z-10 hover:text-emerald-500 transition-colors cursor-default">
                {t.developedFor}
            </p>
        </div>
    );
};

export default Login;
