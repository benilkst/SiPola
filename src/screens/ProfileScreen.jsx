import { User, CheckCircle, Edit3, LogOut } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ProfileScreen = ({ user, setUser, setCurrentScreen, onLogout }) => {
    const handleLogout = async () => {
        if (onLogout) {
            await onLogout();
        } else {
            if (isSupabaseConfigured()) {
                await supabase.auth.signOut();
            } else {
                localStorage.removeItem('sipola_user');
                localStorage.removeItem('sipola_screen');
            }
            setUser(null);
            setCurrentScreen('login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 flex flex-col items-center pt-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/50 to-transparent z-0"></div>
            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center mb-6 relative border-4 border-white shadow-lg">
                    <User size={64} className="text-slate-300" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center text-white">
                        <CheckCircle size={16} strokeWidth={4} />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">{user?.name || 'User'}</h2>
                <p className="text-slate-500 font-bold bg-white px-6 py-2 rounded-full text-sm mb-4 border border-slate-100 uppercase tracking-wide shadow-sm">{user?.role || 'Role'}</p>

                {isSupabaseConfigured() && (
                    <p className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full mb-8 border border-green-100">
                        ● Terhubung ke Database
                    </p>
                )}
                {!isSupabaseConfigured() && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-8 border border-amber-100">
                        ● Mode Demo (Offline)
                    </p>
                )}

                <div className="w-full max-w-xs space-y-4">
                    <button className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 flex items-center justify-center transition active:scale-95 shadow-sm">
                        <Edit3 size={18} className="mr-2 text-slate-400" /> Edit Profil
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition flex items-center justify-center active:scale-95 border border-red-100"
                    >
                        <LogOut size={18} className="mr-2" /> Keluar Aplikasi
                    </button>
                </div>
                <button onClick={() => setCurrentScreen('home')} className="mt-8 text-slate-400 hover:text-slate-600 font-bold text-sm uppercase tracking-widest">
                    Kembali
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;
