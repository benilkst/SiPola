import { useState } from 'react';
import { Shield, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ACCOUNTS } from '../data/config';

const LoginScreen = ({ setUser, setCurrentScreen }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isSupabaseConfigured()) {
            // Supabase Auth
            const email = `${username.toLowerCase().replace(/\s+/g, '')}@sipola.local`;
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                setError('Login gagal. Periksa username dan password.');
                setLoading(false);
                return;
            }

            // Session will be handled by App.jsx onAuthStateChange
        } else {
            // Demo mode - use local accounts
            setTimeout(() => {
                const acc = ACCOUNTS.find(
                    a => a.username.toLowerCase() === username.toLowerCase() && a.password === password
                );
                if (acc) {
                    setUser({ name: acc.name, role: acc.role });
                    setCurrentScreen('home');
                } else {
                    setError('Login gagal. Periksa username dan password.');
                }
                setLoading(false);
            }, 500);
        }
    };

    const handleViewerMode = async () => {
        setLoading(true);
        if (isSupabaseConfigured()) {
            // Sign in as viewer
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'viewer@sipola.local',
                password: 'viewer123'
            });
            if (error) {
                setUser({ name: 'Viewer', role: 'Viewer' });
                setCurrentScreen('home');
            }
        } else {
            setUser({ name: 'Viewer', role: 'Viewer' });
            setCurrentScreen('home');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
                <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Logo */}
            <div className="relative z-10 mb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30">
                    <Shield size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">SiPola</h1>
                <p className="text-slate-400 text-sm mt-1">Sistem Pengamanan Lapas</p>
                {!isSupabaseConfigured() && (
                    <p className="text-amber-400 text-xs mt-2 bg-amber-400/10 px-3 py-1 rounded-full inline-block">
                        Demo Mode
                    </p>
                )}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="relative z-10 w-full max-w-sm space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Username Input / Dropdown */}
                {!isSupabaseConfigured() ? (
                    <div className="relative">
                        <select
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-slate-800">Pilih Petugas...</option>
                            {ACCOUNTS.map(acc => (
                                <option key={acc.username} value={acc.username} className="bg-slate-800">
                                    {acc.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                )}

                {/* Password Input */}
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading || !username || !password}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        'MASUK SISTEM'
                    )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-slate-500 text-xs uppercase tracking-wider">atau</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Viewer Mode */}
                <button
                    type="button"
                    onClick={handleViewerMode}
                    disabled={loading}
                    className="w-full bg-white/5 text-slate-300 font-medium py-3 rounded-2xl hover:bg-white/10 transition border border-white/10"
                >
                    MODE MONITORING (VIEWER)
                </button>
            </form>

            {/* Footer */}
            <p className="absolute bottom-6 text-slate-600 text-xs">
                © 2026 Lapas Narkotika Yogyakarta
            </p>
        </div>
    );
};

export default LoginScreen;
