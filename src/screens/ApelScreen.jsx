import { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { Header } from '../components/UI';
import { BLOCK_CONFIG } from '../data/config';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ApelScreen = ({ user, setCurrentScreen, apelHistory, setApelHistory, apelInputs, setApelInputs, selectedShift, setSelectedShift }) => {
    const [viewMode, setViewMode] = useState('input');
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const blocks = Object.keys(BLOCK_CONFIG);
    const handleInput = (key, val) => { setApelInputs(p => ({ ...p, [key]: parseInt(val) || 0 })); };
    const total = Object.values(apelInputs).reduce((a, b) => a + b, 0);

    const save = async () => {
        setSaving(true);
        const todayISO = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const newRecord = {
            id: Date.now(),
            pic: user.name,
            shift: selectedShift,
            total,
            time,
            dateISO: todayISO
        };

        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('apel_records').insert({
                user_id: user.id,
                user_name: user.name,
                shift: selectedShift,
                total,
                date: todayISO,
                time
            });

            if (error) {
                alert('Gagal menyimpan data: ' + error.message);
                setSaving(false);
                return;
            }
        }

        setApelHistory(p => [newRecord, ...p]);
        setShowConfirm(false);
        setApelInputs({});
        setViewMode('history');
        setSaving(false);
    };

    const getBlockTotal = (block) => {
        let sum = 0;
        for (let i = 1; i <= BLOCK_CONFIG[block].floors; i++) {
            sum += apelInputs[`${block}-L${i}`] || 0;
        }
        return sum;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <div className="bg-white p-6 pb-4 pt-8 border-b border-slate-100 z-20">
                <Header title="Apel Hunian" subtitle="Laporan WBP" onBack={() => setCurrentScreen('home')} />
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {['input', 'history'].map(m => (
                        <button key={m} onClick={() => setViewMode(m)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide rounded-xl transition-all ${viewMode === m ? 'bg-white text-blue-600 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>{m === 'input' ? 'Input Data' : 'Riwayat'}</button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-48">
                {viewMode === 'input' ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl">
                            <span className="text-blue-700 font-semibold text-sm">Shift</span>
                            <div className="flex gap-1">
                                {['Pagi', 'Siang', 'Malam'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedShift(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedShift === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {blocks.map(block => (
                            <div key={block} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                        <span className="font-semibold text-slate-700 text-sm">{block}</span>
                                        {block === 'Cempaka' && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold uppercase rounded">Selker</span>}
                                    </div>
                                    <span className="text-xs font-bold text-blue-600">{getBlockTotal(block) || '-'}</span>
                                </div>
                                <div className="flex divide-x divide-slate-100">
                                    {[...Array(BLOCK_CONFIG[block].floors)].map((_, i) => (
                                        <div key={i} className="flex-1 p-3 text-center">
                                            <label className="text-[10px] font-medium text-slate-400 uppercase block mb-1">Lt {i + 1}</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                className="w-full text-center text-lg font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                                placeholder="0"
                                                value={apelInputs[`${block}-L${i + 1}`] || ''}
                                                onChange={e => handleInput(`${block}-L${i + 1}`, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {apelHistory.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-10 italic">Belum ada riwayat.</p>
                        ) : apelHistory.map(log => (
                            <div key={log.id} className="bg-white rounded-xl border border-slate-100 p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{log.pic}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{log.time} • {log.shift}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-blue-600">{log.total}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">WBP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {viewMode === 'input' && (
                <div className="fixed bottom-0 left-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-sm text-slate-500">Total</span>
                        <span className="text-xl font-black text-slate-800">{total} <span className="text-sm font-medium text-slate-400">WBP</span></span>
                    </div>
                    <button onClick={() => setShowConfirm(true)} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition active:scale-[0.98] flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" /> Simpan
                    </button>
                </div>
            )}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xs rounded-2xl p-5 animate-scale-up">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-slate-900 mb-1">Konfirmasi</h3>
                        <p className="text-center text-slate-500 text-xs mb-4">Simpan data apel WBP?</p>
                        <div className="bg-slate-50 py-3 rounded-xl mb-4 text-center">
                            <p className="text-3xl font-black text-slate-800">{total}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Total WBP</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setShowConfirm(false)} disabled={saving} className="py-2.5 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50">Batal</button>
                            <button onClick={save} disabled={saving} className="py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApelScreen;
