import { useState } from 'react';
import { PlusCircle, MapPin, Printer } from 'lucide-react';
import { Header, GlassCard } from '../components/UI';
import { handlePrintSingle, handlePrintAll } from '../utils/print';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const GeneratorScreen = ({ user, setCurrentScreen, qrDatabase, setQrDatabase }) => {
    if (user.role !== 'Super Admin') {
        setTimeout(() => setCurrentScreen('home'), 0);
        return null;
    }

    const [loc, setLoc] = useState('');
    const [saving, setSaving] = useState(false);

    const add = async (e) => {
        e.preventDefault();
        if (!loc) return;

        setSaving(true);
        const qrCode = `QR_${loc.toUpperCase().replace(/\s+/g, '_')}_${Date.now()}`;

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from('qr_locations').insert({
                location_name: loc,
                qr_code: qrCode
            }).select().single();

            if (error) {
                alert('Gagal menambahkan: ' + error.message);
                setSaving(false);
                return;
            }

            setQrDatabase(p => [...p, { id: qrCode, location: loc, dbId: data.id }]);
        } else {
            setQrDatabase(p => [...p, { id: qrCode, location: loc }]);
        }

        setLoc('');
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <div className="bg-white p-6 pt-8 border-b border-slate-100 sticky top-0 z-20">
                <Header title="Admin QR" subtitle="Manajemen Titik" onBack={() => setCurrentScreen('home')} />
            </div>
            <div className="p-6 flex-1 flex flex-col relative pb-32">
                <GlassCard className="p-5 mb-6">
                    <form onSubmit={add} className="flex gap-3">
                        <input
                            value={loc}
                            onChange={e => setLoc(e.target.value)}
                            placeholder="Nama Lokasi Baru..."
                            className="flex-1 bg-slate-50 border-none rounded-xl px-4 focus:ring-2 focus:ring-purple-500 text-slate-700 font-medium"
                        />
                        <button disabled={saving || !loc} className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 active:scale-90 transition disabled:opacity-50">
                            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <PlusCircle />}
                        </button>
                    </form>
                </GlassCard>
                <div className="space-y-3">
                    {qrDatabase.length === 0 ? (
                        <p className="text-center text-slate-400 py-10 italic">Belum ada titik QR.</p>
                    ) : qrDatabase.map((q, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-slate-50 transition">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-3 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition">
                                    <MapPin size={18} />
                                </div>
                                <span className="font-bold text-slate-700">{q.location}</span>
                            </div>
                            <button onClick={() => handlePrintSingle(q)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition">
                                <Printer size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-30">
                <button onClick={() => handlePrintAll(qrDatabase)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95 flex items-center justify-center">
                    <Printer className="mr-3 w-6 h-6" /> Cetak Semua Titik
                </button>
            </div>
        </div>
    );
};

export default GeneratorScreen;
