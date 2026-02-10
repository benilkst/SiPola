import { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, History, AlertCircle, CheckCircle, XCircle, AlertTriangle, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ScanScreen = ({ user, setCurrentScreen, qrDatabase, setScanHistory, scanHistory }) => {
    const [scanning, setScanning] = useState(false);
    const [tempScan, setTempScan] = useState(null);
    const [result, setResult] = useState(null);
    const [condition, setCondition] = useState('Aman');
    const [description, setDescription] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [saving, setSaving] = useState(false);
    const scannerRef = useRef(null);

    const CONDITIONS = [
        { value: 'Aman', color: 'bg-green-500', icon: CheckCircle },
        { value: 'Rawan', color: 'bg-yellow-500', icon: AlertTriangle },
        { value: 'Waspada', color: 'bg-orange-500', icon: AlertCircle },
        { value: 'Bahaya', color: 'bg-red-500', icon: XCircle }
    ];

    useEffect(() => {
        startCam();
        return () => stopCam();
    }, []);

    const startCam = async () => {
        if (!window.Html5Qrcode) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
            script.async = true;
            script.onload = () => initScanner();
            document.body.appendChild(script);
        } else {
            initScanner();
        }
    };

    const initScanner = async () => {
        try {
            scannerRef.current = new window.Html5Qrcode("reader");
            await scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                handleScan,
                () => { }
            );
            setScanning(true);
        } catch (err) {
            console.error("Camera error:", err);
        }
    };

    const stopCam = async () => {
        if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
            setScanning(false);
        }
    };

    const handleScan = (txt) => {
        stopCam();
        const point = qrDatabase.find(q => q.id === txt);
        if (point) {
            setTempScan({ id: txt, location: point.location, dbId: point.dbId });
        } else {
            setResult({ success: false, message: 'QR tidak dikenali' });
            setTimeout(() => { setResult(null); startCam(); }, 2000);
        }
    };

    const handleSaveScan = async () => {
        if (!tempScan) return;
        setSaving(true);

        const newRecord = {
            id: Date.now(),
            location: tempScan.location,
            status: condition,
            notes: description,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('scan_records').insert({
                user_id: user?.id,
                user_name: user?.name || 'Unknown',
                location_id: tempScan.dbId,
                location_name: tempScan.location,
                status: condition,
                notes: description || null
            });

            if (error) {
                alert('Gagal menyimpan: ' + error.message);
                setSaving(false);
                return;
            }
        }

        setScanHistory(p => [newRecord, ...p]);
        setResult({ success: true, message: `${tempScan.location} - ${condition}` });
        setTempScan(null);
        setCondition('Aman');
        setDescription('');
        setSaving(false);

        setTimeout(() => { setResult(null); startCam(); }, 2000);
    };

    const cancelScan = () => {
        setTempScan(null);
        setCondition('Aman');
        setDescription('');
        startCam();
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => { stopCam(); setCurrentScreen('home'); }} className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold">Kontrol Keliling</h1>
                <button onClick={() => setShowHistory(!showHistory)} className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                    <History size={20} />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 flex items-center justify-center bg-slate-900">
                <div id="reader" className="relative w-full bg-slate-900 overflow-hidden" style={{ maxWidth: '100vw', aspectRatio: '1/1' }}></div>
            </div>

            <style>{`
                #reader video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #reader {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                #reader > div {
                    width: 100% !important;
                }
            `}</style>

            {/* Scan Overlay */}
            {!tempScan && !result && scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                    </div>
                </div>
            )}

            {/* Input Form */}
            {tempScan && (
                <div className="absolute inset-x-0 bottom-0 bg-white text-slate-800 rounded-t-3xl p-6 animate-fade-in-up">
                    <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4"></div>
                    <h3 className="font-bold text-lg mb-1">{tempScan.location}</h3>
                    <p className="text-slate-400 text-xs mb-4 font-mono">{tempScan.id}</p>

                    <div className="mb-4">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Kondisi</label>
                        <div className="grid grid-cols-4 gap-2">
                            {CONDITIONS.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => setCondition(c.value)}
                                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${condition === c.value ? `${c.color} text-white scale-105` : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {c.value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Catatan (Opsional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            placeholder="Tambahkan catatan..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={cancelScan} className="py-3 bg-slate-100 text-slate-500 font-bold rounded-xl">Batal</button>
                        <button onClick={handleSaveScan} disabled={saving} className="py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center disabled:opacity-50">
                            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send size={16} className="mr-2" /> Kirim</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Result Toast */}
            {result && (
                <div className={`absolute inset-x-6 bottom-6 p-4 rounded-2xl flex items-center ${result.success ? 'bg-green-500' : 'bg-red-500'} animate-scale-up`}>
                    {result.success ? <CheckCircle size={24} className="mr-3" /> : <XCircle size={24} className="mr-3" />}
                    <span className="font-bold">{result.message}</span>
                </div>
            )}

            {/* History Panel */}
            {showHistory && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur z-40 flex flex-col">
                    <div className="p-4 flex justify-between items-center border-b border-white/10">
                        <h2 className="font-bold">Riwayat Scan</h2>
                        <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-full">
                            <XCircle size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {scanHistory.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">Belum ada scan.</p>
                        ) : scanHistory.map(s => (
                            <div key={s.id} className="bg-white/5 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{s.location || s.loc}</p>
                                        <p className="text-xs text-slate-400">{s.time}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${s.status === 'Aman' ? 'bg-green-500' : s.status === 'Rawan' ? 'bg-yellow-500' : s.status === 'Waspada' ? 'bg-orange-500' : 'bg-red-500'}`}>
                                        {s.status}
                                    </span>
                                </div>
                                {(s.notes || s.desc) && (
                                    <p className="mt-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                                        {s.notes || s.desc}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanScreen;
