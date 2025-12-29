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
        },
        te: {
            title: 'ఈకోక్యాంపస్',
            subtitle: 'స్మార్ట్ వ్యర్థ బుద్ధిమత్త',
            accessId: 'యాక్సెస్ ఐడి',
            securePin: 'సురక్షిత పిన్',
            enterDashboard: 'డ్యాష్‌బోర్డ్ ప్రవేశించండి',
            adminAccess: 'నిర్వాహక ప్రవేశం',
            studentAccess: 'విద్యార్థి ప్రవేశం',
            demoCredentials: 'డెమో సంపర్కాలు',
            welcomeBack: 'తిరిగి స్వాగతం',
            newUser: 'కొత్త వినియోగదారు?',
            createAccount: 'ఖాతా సృష్టించండి',
            email: 'ఇమెయిల్ చిరునామా',
            selectRole: 'పాత్ర ఎంచుకోండి',
            alreadyHave: 'ఇప్పటికే ఖాతా ఉందా?',
            backToLogin: 'లాగిన్‌కి తిరిగి వెళ్లండి',
            registerNow: 'ఇప్పుడు నమోదు చేయండి',
            developedFor: '2025 స్మార్ట్ క్యాంపస్ హ్యాకాథాన్ కోసం అభివృద్ధి చేయబడింది'
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setRegisterSuccess('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, {
                username: registerData.username,
                password: registerData.password,
                role: registerData.role,
                location_id: registerData.location_id || null
            });
            setRegisterSuccess('Account created. Signing you in...');
            await login(registerData.username, registerData.password);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please check details.');
        } finally {
            setLoading(false);
        }
    };

    const quickFillDemo = (user) => {
        setUsername(user.username);
        setPassword(user.password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#4A7C7E] to-[#669B65] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Premium Background Glow */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#F4D035]/5 rounded-full blur-[150px] -mr-72 -mt-72 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#44B0E0]/5 rounded-full blur-[140px] -ml-48 -mb-48 animate-pulse" style={{animationDelay: '1s'}}></div>

            {/* Language Toggle */}
            <div className="absolute top-8 right-8 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full p-1.5 border border-white/20 shadow-lg">
                {['en', 'hi', 'te'].map((lang, i) => (
                    <button
                        key={i}
                        onClick={() => setLanguage(lang)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                            language === lang 
                                ? 'bg-[#F4D035] text-[#001F3F] shadow-xl shadow-[#F4D035]/40' 
                                : 'text-white/70 hover:text-white'
                        }`}
                    >
                        {lang === 'en' ? 'EN' : lang === 'hi' ? 'HI' : 'TE'}
                    </button>
                ))}
                <span className="hidden sm:inline text-[10px] font-bold text-white/70 ml-2 pr-2">Switch language for easier staff usage</span>
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Premium Logo Section */}
                <div className="text-center mb-16 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[#F4D035] to-[#44B0E0] rounded-[40px] shadow-2xl shadow-[#F4D035]/40 mb-10 transform hover:scale-105 transition-transform duration-500 border-4 border-white/20 backdrop-blur-sm">
                        <img src="/ecocampus-logo.svg" alt="EcoCampus" className="w-28 h-28 drop-shadow-2xl" />
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter mb-3 drop-shadow-xl" style={{textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'}}>{t.title}</h1>
                    <div className="h-2 w-32 bg-gradient-to-r from-[#F4D035] to-[#44B0E0] mx-auto rounded-full mb-6 shadow-lg shadow-[#F4D035]/30"></div>
                    <p className="text-white/90 font-bold uppercase tracking-[0.3em] text-[12px] drop-shadow-md">{t.subtitle}</p>
                </div>

                {/* Premium Card Section with subtle eco illustrations */}
                <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/20 p-12 animate-slideUp relative overflow-hidden">
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
                                        <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-[#F4D035] transition-colors" size={22} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/20 text-white p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-[#F4D035]/30 focus:border-[#F4D035]/50 outline-none transition-all placeholder:text-white/30 font-semibold"
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
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-[#F4D035] transition-colors" size={22} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-white/5 border border-white/20 text-white p-4 pl-14 pr-14 rounded-2xl focus:ring-4 focus:ring-[#F4D035]/30 focus:border-[#F4D035]/50 outline-none transition-all placeholder:text-white/30 font-semibold"
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
                                <div className="p-4 bg-red-500/20 border border-red-400/40 text-red-200 text-[11px] font-black uppercase tracking-widest rounded-xl text-center backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 bg-gradient-to-r from-[#F4D035] to-[#44B0E0] hover:from-[#FFE84D] hover:to-[#5BC8FF] text-[#001F3F] font-black rounded-2xl transition-all shadow-2xl shadow-[#F4D035]/50 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group uppercase tracking-wider text-sm font-bold"
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
                                            className="w-full bg-white/5 border border-white/20 text-white p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-[#F4D035]/30 focus:border-[#F4D035]/50 outline-none transition-all placeholder:text-white/30 font-semibold"
                                            placeholder="Username"
                                            value={registerData.username}
                                            onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">{t.email}</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/5 border border-white/20 text-white p-4 rounded-2xl focus:ring-4 focus:ring-[#F4D035]/30 focus:border-[#F4D035]/50 outline-none transition-all placeholder:text-white/30 font-semibold"
                                        placeholder="you@campus.edu"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">{t.securePin}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-[#F4D035] transition-colors" size={22} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-white/5 border border-white/20 text-white p-4 pl-14 pr-14 rounded-2xl focus:ring-4 focus:ring-[#F4D035]/30 focus:border-[#F4D035]/50 outline-none transition-all placeholder:text-white/30 font-semibold"
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

                                <div className="relative group space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">{t.selectRole}</label>
                                        <select
                                            value={registerData.role}
                                            onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                                            className="w-full bg-white/5 border border-white/20 text-white p-4 rounded-2xl focus:ring-4 focus:ring-[#F4D035]/30 focus:border-[#F4D035]/50 outline-none transition-all font-semibold appearance-none cursor-pointer"
                                        >
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <p className="mt-2 text-[10px] text-white/60 font-bold ml-1">Assign the correct role for dashboard access</p>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-[11px] font-black text-white/70 uppercase tracking-widest mb-3 ml-1">Department / Block</label>
                                        <select
                                            value={registerData.location_id}
                                            onChange={(e) => setRegisterData({...registerData, location_id: e.target.value})}
                                            className="w-full bg-white/5 border border-white/20 text-white p-4 rounded-2xl focus:ring-4 focus:ring-[#F4D035]/30 focus:border-[#F4D035]/50 outline-none transition-all font-semibold appearance-none cursor-pointer"
                                        >
                                            <option value="">Select department / block...</option>
                                            {locations.map((loc) => (
                                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-[10px] text-white/60 font-bold ml-1">Links your account to the correct campus zone</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/20 border border-red-400/40 text-red-200 text-[11px] font-black uppercase tracking-widest rounded-xl text-center backdrop-blur-sm">
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

                {/* Demo Credentials - Premium Cards */}
                {!isRegister && (
                    <div className="mt-12 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <p className="text-[11px] font-black text-white/60 uppercase tracking-widest text-center mb-5 drop-shadow-md">{t.demoCredentials}</p>
                        <div className="grid grid-cols-1 gap-4">
                            {demoUsers.map((user, i) => (
                                <button
                                    key={i}
                                    onClick={() => quickFillDemo(user)}
                                    className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-5 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`text-3xl bg-gradient-to-br ${user.color} p-4 rounded-2xl text-white font-black shadow-lg`}>{user.icon}</div>
                                        <div className="flex-1 text-left">
                                            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:text-[#F4D035] transition-colors mb-1">{user.role}</p>
                                            <p className="text-sm font-bold text-white drop-shadow-sm">{user.username} / {user.password}</p>
                                        </div>
                                        <ArrowRight size={18} className="text-white/50 group-hover:text-[#F4D035] transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-16 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] relative z-10 hover:text-white/60 transition-colors cursor-default drop-shadow-md">
                {t.developedFor}
            </p>
        </div>
    );
};

export default Login;
