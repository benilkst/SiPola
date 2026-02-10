import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_QR_DATA, generateDummyData, ACCOUNTS } from './data/config';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import ApelScreen from './screens/ApelScreen';
import ActivityScreen from './screens/ActivityScreen';
import GeneratorScreen from './screens/GeneratorScreen';
import ProfileScreen from './screens/ProfileScreen';

const DUMMY_DATA = generateDummyData();

// Helper: load from localStorage with fallback
const loadLocal = (key, fallback) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch { return fallback; }
};

const App = () => {
    // Auth state - restore from localStorage
    const [user, setUser] = useState(() => loadLocal('sipola_user', null));
    const [loading, setLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState(() => {
        const u = loadLocal('sipola_user', null);
        return u ? (loadLocal('sipola_screen', 'home')) : 'login';
    });

    // Data state - restore from localStorage with dummy fallback
    const [qrDatabase, setQrDatabase] = useState(() => loadLocal('sipola_qr', INITIAL_QR_DATA));
    const [scanHistory, setScanHistory] = useState(() => loadLocal('sipola_scans', DUMMY_DATA.scans));
    const [apelHistory, setApelHistory] = useState(() => loadLocal('sipola_apel', DUMMY_DATA.apelData));
    const [activityLog, setActivityLog] = useState(() => loadLocal('sipola_activities', DUMMY_DATA.activities));
    const [apelInputs, setApelInputs] = useState({});
    const [selectedShift, setSelectedShift] = useState('Pagi');

    // Persist ALL data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sipola_qr', JSON.stringify(qrDatabase));
    }, [qrDatabase]);

    useEffect(() => {
        localStorage.setItem('sipola_scans', JSON.stringify(scanHistory));
    }, [scanHistory]);

    useEffect(() => {
        localStorage.setItem('sipola_apel', JSON.stringify(apelHistory));
    }, [apelHistory]);

    useEffect(() => {
        localStorage.setItem('sipola_activities', JSON.stringify(activityLog));
    }, [activityLog]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('sipola_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('sipola_user');
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem('sipola_screen', currentScreen);
    }, [currentScreen]);

    // Initialize - just mark loading as done (data already loaded from localStorage)
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (isSupabaseConfigured()) {
                    // Check for existing Supabase session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        try {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', session.user.id)
                                .single();

                            if (profile) {
                                setUser({ id: session.user.id, name: profile.name, role: profile.role });
                                setCurrentScreen('home');
                            }
                        } catch (e) {
                            console.warn('Profile fetch failed:', e);
                        }
                    }

                    // Listen for auth changes
                    supabase.auth.onAuthStateChange(async (event, session) => {
                        if (event === 'SIGNED_IN' && session?.user) {
                            try {
                                const { data: profile } = await supabase
                                    .from('profiles')
                                    .select('*')
                                    .eq('id', session.user.id)
                                    .single();
                                if (profile) {
                                    setUser({ id: session.user.id, name: profile.name, role: profile.role });
                                    setCurrentScreen('home');
                                }
                            } catch (e) {
                                console.warn('Profile fetch on sign in failed:', e);
                            }
                        } else if (event === 'SIGNED_OUT') {
                            setUser(null);
                            setCurrentScreen('login');
                        }
                    });
                }
            } catch (error) {
                console.error('Init auth error:', error);
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Try to fetch from Supabase when user logs in (optional sync)
    useEffect(() => {
        if (user && isSupabaseConfigured()) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!isSupabaseConfigured()) return;

        try {
            const { data: locations } = await supabase
                .from('qr_locations')
                .select('*')
                .order('id');
            if (locations?.length > 0) setQrDatabase(locations.map(l => ({ id: l.qr_code, location: l.location_name, dbId: l.id })));
        } catch (e) {
            console.warn('Failed to fetch QR locations:', e);
        }

        try {
            const { data: apel } = await supabase
                .from('apel_records')
                .select('*')
                .order('created_at', { ascending: false });
            if (apel?.length > 0) setApelHistory(apel.map(a => ({
                id: a.id,
                pic: a.user_name,
                shift: a.shift,
                total: a.total,
                time: a.time,
                dateISO: a.date
            })));
        } catch (e) {
            console.warn('Failed to fetch apel records:', e);
        }

        try {
            const { data: activities } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false });
            if (activities?.length > 0) setActivityLog(activities.map(a => ({
                id: a.id,
                time: a.time,
                name: a.subject_name,
                desc: a.description,
                user: a.user_name,
                images: a.images || [],
                dateISO: a.date
            })));
        } catch (e) {
            console.warn('Failed to fetch activities:', e);
        }

        try {
            const { data: scans } = await supabase
                .from('scan_records')
                .select('*')
                .order('created_at', { ascending: false });
            if (scans?.length > 0) setScanHistory(scans.map(s => ({
                id: s.id,
                location: s.location_name,
                status: s.status,
                notes: s.notes,
                time: new Date(s.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (e) {
            console.warn('Failed to fetch scan records:', e);
        }
    };

    // Logout handler
    const handleLogout = async () => {
        if (isSupabaseConfigured()) {
            try { await supabase.auth.signOut(); } catch (e) { console.warn(e); }
        }
        localStorage.removeItem('sipola_user');
        localStorage.removeItem('sipola_screen');
        setUser(null);
        setCurrentScreen('login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Memuat...</p>
                </div>
            </div>
        );
    }

    switch (currentScreen) {
        case 'login':
            return <LoginScreen setUser={setUser} setCurrentScreen={setCurrentScreen} />;
        case 'home':
            return <HomeScreen user={user} setCurrentScreen={setCurrentScreen} apelHistory={apelHistory} activityLog={activityLog} />;
        case 'scan':
            return <ScanScreen user={user} setCurrentScreen={setCurrentScreen} qrDatabase={qrDatabase} setScanHistory={setScanHistory} scanHistory={scanHistory} />;
        case 'apel':
            return <ApelScreen user={user} setCurrentScreen={setCurrentScreen} apelHistory={apelHistory} setApelHistory={setApelHistory} apelInputs={apelInputs} setApelInputs={setApelInputs} selectedShift={selectedShift} setSelectedShift={setSelectedShift} />;
        case 'activity':
            return <ActivityScreen user={user} setCurrentScreen={setCurrentScreen} activityLog={activityLog} setActivityLog={setActivityLog} />;
        case 'generator':
            return <GeneratorScreen user={user} setCurrentScreen={setCurrentScreen} qrDatabase={qrDatabase} setQrDatabase={setQrDatabase} />;
        case 'profile':
            return <ProfileScreen user={user} setUser={setUser} setCurrentScreen={setCurrentScreen} onLogout={handleLogout} />;
        default:
            return <LoginScreen setUser={setUser} setCurrentScreen={setCurrentScreen} />;
    }
};

export default App;
