import { useState } from 'react';
import { UserCircle, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [role, setRole] = useState(null); // 'user' | 'admin'
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (pin === '1234') {
            onLogin('admin');
        } else {
            setError('Invalid PIN');
            setPin('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">

                {/* Header */}
                <div className="bg-emerald-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">EcoCampus</h1>
                    <p className="text-emerald-100 text-sm">Smart Waste Management System</p>
                </div>

                <div className="p-8">
                    {!role ? (
                        <div className="space-y-4">
                            <p className="text-center text-slate-600 mb-6 font-medium">Select your role to continue</p>

                            <button
                                onClick={() => onLogin('user')}
                                className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-4 group"
                            >
                                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <UserCircle size={24} />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="font-bold text-slate-800">Student / Staff</h3>
                                    <p className="text-xs text-slate-500">Log waste & view impact</p>
                                </div>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500" />
                            </button>

                            <button
                                onClick={() => setRole('admin')}
                                className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-slate-800 hover:bg-slate-50 transition-all flex items-center gap-4 group"
                            >
                                <div className="bg-slate-100 p-3 rounded-full text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="font-bold text-slate-800">Admin Access</h3>
                                    <p className="text-xs text-slate-500">Analytics & Management</p>
                                </div>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-800" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAdminLogin} className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-6">
                                <div className="inline-flex p-3 bg-slate-100 rounded-full text-slate-600 mb-3">
                                    <Lock size={24} />
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">Admin Verification</h3>
                                <p className="text-sm text-slate-500">Enter security PIN to access</p>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="password"
                                    placeholder="Enter PIN (1234)"
                                    className="w-full text-center text-2xl tracking-widest p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all"
                                    maxLength={4}
                                    autoFocus
                                    value={pin}
                                    onChange={(e) => { setError(''); setPin(e.target.value) }}
                                />
                                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setRole(null); setError(''); }}
                                    className="px-4 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
                    <p className="text-xs text-slate-400">© 2025 EcoCampus System</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
