import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCircle, ArrowRight, Lock, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [language, setLanguage] = useState('en');
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', role: 'student', location_id: '' });
    const [otp, setOtp] = useState('');
    const [otpStatus, setOtpStatus] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [locations, setLocations] = useState([]);
    const [registerSuccess, setRegisterSuccess] = useState('');

    const translations = {
        en: {
            title: 'EcoCampus',
            subtitle: 'Smart Waste Intelligence',
            accessId: 'Access ID',
            securePin: 'Secure PIN',
            enterDashboard: 'Enter Dashboard',
            adminAccess: 'Admin Access',
            studentAccess: 'Student Access',
            quickAccess: 'Quick Access',
            welcomeBack: 'Welcome Back',
            newUser: 'New User?',
            createAccount: 'Create Account',
            email: 'Email Address',
            selectRole: 'Select Role',
            alreadyHave: 'Already have account?',
            backToLogin: 'Back to Login',
            registerNow: 'Register Now'
        },
        hi: {
            title: 'ईकोकैंपस',
            subtitle: 'स्मार्ट कचरा खुफिया',
            accessId: 'एक्सेस आईडी',
            securePin: 'सुरक्षित पिन',
            enterDashboard: 'डैशबोर्ड दर्ज करें',
            adminAccess: 'प्रशासक पहुंच',
            studentAccess: 'छात्र पहुंच',
            quickAccess: 'क्विक एक्सेस',
            welcomeBack: 'वापस स्वागत है',
            newUser: 'नया उपयोगकर्ता?',
            createAccount: 'खाता बनाएँ',
            email: 'ईमेल पता',
            selectRole: 'भूमिका चुनें',
            alreadyHave: 'पहले से खाता है?',
            backToLogin: 'लॉगिन पर वापस जाएं',
            registerNow: 'अभी पंजीकरण करें'
        },
        te: {
            title: 'ఈకోక్యాంపస్',
            subtitle: 'స్మార్ట్ వ్యర్థ బుద్ధిమత్త',
            accessId: 'యాక్సెస్ ఐడి',
            securePin: 'సురక్షిత పిన్',
            enterDashboard: 'డ్యాష్‌బోర్డ్ ప్రవేశించండి',
            adminAccess: 'నిర్వాహక ప్రవేశం',
            studentAccess: 'విద్యార్థి ప్రవేశం',
            quickAccess: 'త్వరిత ప్రాప్యత',
            welcomeBack: 'తిరిగి స్వాగతం',
            newUser: 'కొత్త వినియోగదారు?',
            createAccount: 'ఖాతా సృష్టించండి',
            email: 'ఇమెయిల్ చిరునామా',
            selectRole: 'పాత్ర ఎంచుకోండి',
            alreadyHave: 'ఇప్పటికే ఖాతా ఉందా?',
            backToLogin: 'లాగిన్‌కి తిరిగి వెళ్లండి',
            registerNow: 'ఇప్పుడు నమోదు చేయండి'
        }
    };

    const t = translations[language];

    const demoUsers = [
        { role: 'admin', username: 'admin', password: 'password123', color: 'from-red-500 to-pink-500', icon: '👑' },
        { role: 'student', username: 'student1', password: 'password123', color: 'from-blue-500 to-cyan-500', icon: '🎓' },
        { role: 'staff', username: 'staff1', password: 'password123', color: 'from-amber-500 to-orange-600', icon: '🧹' }
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

    useEffect(() => {
        axios.get(`${API_URL}/locations`).then(res => setLocations(res.data || [])).catch(() => {});
    }, []);

    const handleSendOtp = async () => {
        setError('');
        setOtpStatus('');
        setOtpVerified(false);
        setOtpSending(true);
        try {
            await axios.post(`${API_URL}/auth/register/send-otp`, {
                email: registerData.email,
                username: registerData.username
            });
            setOtpStatus('OTP sent to your email. Please check inbox/spam.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Check email.');
        } finally {
            setOtpSending(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setRegisterSuccess('');
        setOtpStatus('');
        setLoading(true);
        try {
            if (!otp) {
                setError('Enter the OTP sent to your email.');
                setLoading(false);
                return;
            }

            await axios.post(`${API_URL}/auth/register/complete`, {
                username: registerData.username,
                email: registerData.email,
                password: registerData.password,
                role: registerData.role,
                location_id: registerData.location_id || null,
                otp
            });

            setOtpVerified(true);
            setRegisterSuccess('Email verified. Account created. Signing you in...');
            await login(registerData.username, registerData.password);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please check details and OTP.');
        } finally {
            setLoading(false);
        }
    };

    const quickFillDemo = (user) => {
        setUsername(user.username);
        setPassword(user.password);
    };

    const bgStyle = {
        backgroundImage: `linear-gradient(135deg, rgba(7,17,14,0.92), rgba(10,30,24,0.88)), url('https://cdn.pixabay.com/photo/2017/09/08/18/59/recycle-2729345_1280.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    };

    const roles = [
        { id: 'student', label: 'Student', desc: 'Learner / reporter', icon: '🎓', accent: 'from-emerald-500 to-teal-400' },
        { id: 'staff', label: 'Staff', desc: 'Ops & field', icon: '🧹', accent: 'from-amber-500 to-orange-500' },
        { id: 'admin', label: 'Admin', desc: 'Control center', icon: '👑', accent: 'from-indigo-500 to-purple-500' }
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-100" style={bgStyle}>
            {/* Premium Background Glow */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#F4D035]/5 rounded-full blur-[150px] -mr-72 -mt-72 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#44B0E0]/5 rounded-full blur-[140px] -ml-48 -mb-48 animate-pulse" style={{animationDelay: '1s'}}></div>

            {/* Language Toggle */}
            <div className="absolute top-8 right-8 z-50 flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-full p-1.5 border border-emerald-500/20 shadow-lg">
                {['en', 'hi', 'te'].map((lang, i) => (
                    <button
                        key={i}
                        onClick={() => setLanguage(lang)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                            language === lang 
                                ? 'bg-emerald-400 text-[#0A1613] shadow-lg shadow-emerald-500/30' 
                                : 'text-slate-200/80 hover:text-white'
                        }`}
                    >
                        {lang === 'en' ? 'EN' : lang === 'hi' ? 'HI' : 'TE'}
                    </button>
                ))}
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Premium Logo Section */}
                <div className="text-center mb-16 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-[40px] shadow-2xl shadow-emerald-500/30 mb-10 transform hover:scale-105 transition-transform duration-500 border-4 border-emerald-300/30 backdrop-blur-sm">
                        <img src="/ecocampus-logo.svg" alt="EcoCampus" className="w-28 h-28 drop-shadow-2xl" />
                    </div>
                    <h1 className="text-7xl font-black text-emerald-50 tracking-tighter mb-3 drop-shadow-xl" style={{textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'}}>{t.title}</h1>
                    <div className="h-2 w-32 bg-gradient-to-r from-emerald-400 to-teal-300 mx-auto rounded-full mb-6 shadow-lg shadow-emerald-500/30"></div>
                    <p className="text-slate-100 font-bold uppercase tracking-[0.3em] text-[12px] drop-shadow-md">{t.subtitle}</p>
                </div>

                {/* Premium Card Section with subtle eco illustrations */}
                <div className="bg-[#10201B]/85 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-emerald-500/10 p-12 animate-slideUp relative overflow-hidden">
                    {/* Decorative leaf illustrations */}
                    <svg aria-hidden="true" className="absolute -left-6 -top-6 w-24 h-24 opacity-10" viewBox="0 0 100 100">
                        <path d="M50 5 C20 20, 10 50, 25 75 C40 95, 70 85, 85 65 C95 50, 90 25, 70 15 Z" fill="#669B65" />
                    </svg>
                    <svg aria-hidden="true" className="absolute -right-8 -bottom-8 w-28 h-28 opacity-10" viewBox="0 0 100 100">
                        <path d="M55 10 C35 25, 30 55, 45 80 C60 95, 80 85, 90 60 C95 45, 85 25, 70 15 Z" fill="#4A7C7E" />
                    </svg>
                    {!isRegister ? (
                        // LOGIN FORM
                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="text-center mb-10">
                                <p className="text-white font-bold text-2xl drop-shadow-md">{t.welcomeBack}</p>
                            </div>

                            <div className="space-y-7">
                                <div className="relative group">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">{t.accessId}</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200/70 group-focus-within:text-emerald-300 transition-colors" size={22} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-emerald-50/5 border border-emerald-200/30 text-emerald-50 p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-300/60 outline-none transition-all placeholder:text-emerald-100/40 font-semibold"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                        <p className="mt-2 text-[10px] text-white/60 font-bold ml-1">Use your assigned campus ID</p>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">{t.securePin}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200/70 group-focus-within:text-emerald-300 transition-colors" size={22} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-emerald-50/5 border border-emerald-200/30 text-emerald-50 p-4 pl-14 pr-14 rounded-2xl focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-300/60 outline-none transition-all placeholder:text-emerald-100/40 font-semibold"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                        <p className="mt-2 text-[10px] text-white/60 font-bold ml-1">Minimum 8 characters for security</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/15 border border-red-400/30 text-red-100 text-[11px] font-black uppercase tracking-widest rounded-xl text-center backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 hover:from-emerald-400 hover:to-teal-200 text-[#0A1613] font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/40 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group uppercase tracking-wider text-sm font-bold"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {t.enterDashboard}
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-6 border-t border-white/20">
                                <p className="text-white/70 text-sm">{t.newUser} <button type="button" onClick={() => setIsRegister(true)} className="text-[#F4D035] font-bold hover:text-[#FFE84D] transition-colors">{t.createAccount}</button></p>
                            </div>
                        </form>
                    ) : (
                        // REGISTER FORM
                        <form onSubmit={handleRegister} className="space-y-8">
                            <div className="text-center mb-10">
                                <p className="text-white font-bold text-2xl drop-shadow-md">{t.createAccount}</p>
                            </div>

                            <div className="space-y-7">
                                <div className="relative group">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">{t.accessId}</label>
                                    <div className="relative">
                                        <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-[#F4D035] transition-colors" size={22} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-emerald-50/5 border border-emerald-200/30 text-emerald-50 p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-300/60 outline-none transition-all placeholder:text-emerald-100/40 font-semibold"
                                            placeholder="Username"
                                            value={registerData.username}
                                            onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="relative group space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest ml-1">{t.email}</label>
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={otpSending || !registerData.email || !registerData.username}
                                            className="px-3 py-2 text-[11px] font-black rounded-xl bg-emerald-400 text-[#0A1613] hover:bg-emerald-300 transition-all disabled:opacity-50"
                                        >
                                            {otpSending ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-emerald-50/5 border border-emerald-200/30 text-emerald-50 p-4 rounded-2xl focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-300/60 outline-none transition-all placeholder:text-emerald-100/40 font-semibold"
                                        placeholder="you@campus.edu"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                    />
                                    {otpStatus && <p className="text-[11px] text-emerald-200 font-semibold ml-1">{otpStatus}</p>}
                                </div>

                                <div className="relative group">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">{t.securePin}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-[#F4D035] transition-colors" size={22} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-emerald-50/5 border border-emerald-200/30 text-emerald-50 p-4 pl-14 pr-14 rounded-2xl focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-300/60 outline-none transition-all placeholder:text-emerald-100/40 font-semibold"
                                            placeholder="••••••••"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest ml-1">{t.selectRole}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {roles.map((role) => (
                                            <button
                                                type="button"
                                                key={role.id}
                                                onClick={() => setRegisterData({ ...registerData, role: role.id })}
                                                className={`p-4 rounded-2xl border text-left bg-white/5 backdrop-blur-sm transition-all hover:border-emerald-300/60 hover:-translate-y-1 ${registerData.role === role.id ? 'border-emerald-300/80 ring-2 ring-emerald-400/30' : 'border-white/10'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${role.accent} flex items-center justify-center text-xl mb-3 shadow-lg`}>{role.icon}</div>
                                                <p className="text-white font-bold text-lg">{role.label}</p>
                                                <p className="text-white/60 text-xs">{role.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-white/70 font-bold ml-1">All roles visible by default. Pick one to unlock the right dashboard.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest ml-1">Department / Block</label>
                                        <span className="text-[10px] text-white/60">Tap to select</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                                        {locations.map((loc) => (
                                            <button
                                                type="button"
                                                key={loc.id}
                                                onClick={() => setRegisterData({ ...registerData, location_id: loc.id })}
                                                className={`w-full text-left p-4 rounded-2xl border bg-white/5 backdrop-blur-sm transition-all hover:border-emerald-300/60 hover:-translate-y-0.5 ${registerData.location_id === String(loc.id) ? 'border-emerald-300/80 ring-2 ring-emerald-400/30 text-emerald-50' : 'border-white/10 text-white/80'}`}
                                            >
                                                <p className="font-bold text-white">{loc.name}</p>
                                                {loc.type && <p className="text-[11px] text-white/60 uppercase tracking-widest">{loc.type}</p>}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-1 text-[10px] text-white/70 font-bold ml-1">Visible campus blocks—no hidden dropdowns.</p>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">One-Time Passcode</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        required
                                        className="w-full bg-emerald-50/5 border border-emerald-200/30 text-emerald-50 p-4 rounded-2xl focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-300/60 outline-none transition-all placeholder:text-emerald-100/40 font-semibold"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    {otpVerified && <p className="mt-2 text-[11px] text-emerald-200 font-semibold ml-1">OTP verified and account ready.</p>}
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/15 border border-red-400/30 text-red-100 text-[11px] font-black uppercase tracking-widest rounded-xl text-center backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            {registerSuccess && (
                                <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 text-emerald-50 text-[11px] font-black uppercase tracking-widest rounded-xl text-center backdrop-blur-sm">
                                    {registerSuccess}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 bg-gradient-to-r from-[#F4D035] to-[#44B0E0] hover:from-[#FFE84D] hover:to-[#5BC8FF] text-[#001F3F] font-black rounded-2xl transition-all shadow-2xl shadow-[#F4D035]/50 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group uppercase tracking-wider text-sm font-bold"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {t.registerNow}
                                        <UserPlus size={20} />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-6 border-t border-white/20">
                                <p className="text-white/70 text-sm"><button type="button" onClick={() => setIsRegister(false)} className="text-[#F4D035] font-bold hover:text-[#FFE84D] transition-colors">{t.backToLogin}</button></p>
                            </div>
                        </form>
                    )}
                </div>

                {/* Quick Access Cards (no demo wording) */}
                {!isRegister && (
                    <div className="mt-12 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <p className="text-sm font-black text-emerald-50 uppercase tracking-[0.3em] text-center mb-5 drop-shadow-md">{t.quickAccess}</p>
                        <div className="grid grid-cols-1 gap-4">
                            {demoUsers.map((user, i) => (
                                <button
                                    key={i}
                                    onClick={() => quickFillDemo(user)}
                                    className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-emerald-200/30 hover:border-emerald-200/60 rounded-2xl p-6 transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer shadow-2xl shadow-emerald-500/10"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`text-4xl bg-gradient-to-br ${user.color} p-5 rounded-2xl text-white font-black shadow-lg shadow-black/20 animate-pulse`}>{user.icon}</div>
                                        <div className="flex-1 text-left">
                                            <p className="text-[11px] font-black text-emerald-100 uppercase tracking-widest group-hover:text-emerald-300 transition-colors mb-1">{user.role}</p>
                                            <p className="text-lg font-black text-white drop-shadow-sm tracking-tight">{user.username} / {user.password}</p>
                                        </div>
                                        <ArrowRight size={20} className="text-emerald-200 group-hover:text-emerald-100 transition-colors transform group-hover:translate-x-2" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
