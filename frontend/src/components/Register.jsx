import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Mail, User, Lock, Phone, Building, Hash, Shield, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';
import Logo from './Logo';

const Register = ({ onSwitchToLogin }) => {
    const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        registration_number: '',
        role: 'student',
        department_id: '',
        phone: ''
    });
    const [otp, setOtp] = useState('');
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        // Fetch departments for dropdown
        fetch(`${API_URL}/departments`)
            .then(res => res.json())
            .then(data => setDepartments(data))
            .catch(err => console.error('Failed to load departments:', err));
    }, []);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!formData.email || !formData.full_name) {
            setError('Email and full name are required');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    full_name: formData.full_name
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setOtpSent(true);
            setStep(2);
            setLoading(false);

        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            // First verify OTP
            const verifyResponse = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp
                }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
                throw new Error(verifyData.error || 'OTP verification failed');
            }

            // Then register user
            const registerResponse = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name,
                    registration_number: formData.registration_number,
                    role: formData.role,
                    department_id: formData.department_id || null,
                    phone: formData.phone
                }),
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                throw new Error(registerData.error || 'Registration failed');
            }

            // Store token and user data
            localStorage.setItem('token', registerData.token);
            localStorage.setItem('user', JSON.stringify(registerData.user));

            // Reload page to trigger auth state change
            window.location.reload();

        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.03)_0%,transparent_50%)]"></div>
            <div className="absolute top-[-20%] right-[-15%] w-[70%] h-[70%] bg-emerald-100/30 rounded-full blur-[140px] animate-blob"></div>
            <div className="absolute bottom-[-20%] left-[-15%] w-[70%] h-[70%] bg-slate-200/50 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="flex justify-center mb-6">
                        <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-emerald-500/10 transition-all hover:scale-110 duration-700 animate-float">
                            <Logo size={64} />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-950 tracking-[-0.04em] mb-3 leading-none">
                        {step === 1 ? 'Join EcoCampus' : 'Verify Email'}
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">
                        {step === 1 ? 'Create Your Sustainability Account' : 'Enter the OTP sent to your email'}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            1
                        </div>
                        <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            2
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="glass-panel p-10 rounded-[3rem] animate-glow-reveal">
                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-8">
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[
                                    { value: 'student', label: 'Student', icon: '👨‍🎓', desc: 'Report waste issues' },
                                    { value: 'staff', label: 'Staff', icon: '🛠️', desc: 'Handle assigned tasks' },
                                    { value: 'admin', label: 'Admin', icon: '👨‍💼', desc: 'Manage department' }
                                ].map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role.value })}
                                        className={`p-6 rounded-2xl border-2 transition-all text-center ${formData.role === role.value
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="text-3xl mb-3">{role.icon}</div>
                                        <div className="text-sm font-black uppercase tracking-widest mb-1">{role.label}</div>
                                        <div className="text-xs text-slate-500">{role.desc}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <input
                                            type="text"
                                            name="full_name"
                                            required
                                            className="input-field pl-12 py-4"
                                            placeholder="Enter your full name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            className="input-field pl-12 py-4"
                                            placeholder="Choose a username"
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="input-field pl-12 py-4"
                                            placeholder="your.email@domain.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Registration Number */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Registration Number</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <input
                                            type="text"
                                            name="registration_number"
                                            required
                                            className="input-field pl-12 py-4"
                                            placeholder="REG2024001"
                                            value={formData.registration_number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Department */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Department</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <select
                                            name="department_id"
                                            className="input-field pl-12 py-4"
                                            value={formData.department_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name} ({dept.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="input-field pl-12 py-4"
                                            placeholder="9876543210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="input-field pl-12 py-4"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative group focus-glow rounded-2xl">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-all duration-500" size={20} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            className="input-field pl-12 py-4"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
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
                                disabled={loading}
                                className="btn-primary w-full py-6 group relative overflow-hidden rounded-[2rem]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? <Loader2 className="animate-spin text-white" size={20} /> : (
                                        <>
                                            <Shield size={20} />
                                            <span className="text-xs font-black uppercase tracking-[0.3em]">Send Verification Code</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="text-center pt-4">
                                <button
                                    type="button"
                                    onClick={onSwitchToLogin}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest transition-colors"
                                >
                                    Already have an account? Sign In
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* OTP Verification Step */
                        <form onSubmit={handleVerifyAndRegister} className="space-y-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail className="text-emerald-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 mb-3">Check Your Email</h3>
                                <p className="text-slate-500 text-sm">
                                    We've sent a 6-digit verification code to<br />
                                    <span className="font-bold text-slate-700">{formData.email}</span>
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
                                            <CheckCircle size={20} />
                                            <span className="text-xs font-black uppercase tracking-[0.3em]">Verify & Create Account</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="text-center pt-4 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest transition-colors block w-full"
                                >
                                    ← Back to Registration Form
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
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
        </div>
    );
};

export default Register;