import { useState, useRef } from 'react';
import { Save, Camera, History, X, Trash2, Eye } from 'lucide-react';
import { Header, GlassCard } from '../components/UI';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ActivityScreen = ({ user, setCurrentScreen, setActivityLog, activityLog }) => {
    const [desc, setDesc] = useState('');
    const [name, setName] = useState('');
    const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    const [imagePreviews, setImagePreviews] = useState([]);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const [viewImage, setViewImage] = useState(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const date = new Date();
                    const timestampText = date.toLocaleString('id-ID');
                    const fontSize = Math.max(24, Math.floor(img.height * 0.03));
                    ctx.font = `bold ${fontSize}px sans-serif`;
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    const x = canvas.width - (fontSize * 0.5);
                    const y = canvas.height - (fontSize * 0.5);
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = fontSize / 6;
                    ctx.strokeText(timestampText, x, y);
                    ctx.fillStyle = 'white';
                    ctx.fillText(timestampText, x, y);
                    setImagePreviews(prev => [...prev, canvas.toDataURL('image/jpeg', 0.8)]);
                };
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (images) => {
        if (!isSupabaseConfigured() || images.length === 0) return images;

        const uploadedUrls = [];
        for (const base64Image of images) {
            const base64Data = base64Image.split(',')[1];
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

            const { data, error } = await supabase.storage
                .from('activity-images')
                .upload(fileName, Buffer.from(base64Data, 'base64'), {
                    contentType: 'image/jpeg'
                });

            if (!error && data) {
                const { data: urlData } = supabase.storage
                    .from('activity-images')
                    .getPublicUrl(fileName);
                uploadedUrls.push(urlData.publicUrl);
            } else {
                // Fallback to base64 if upload fails
                uploadedUrls.push(base64Image);
            }
        }
        return uploadedUrls;
    };

    const save = async (e) => {
        e.preventDefault();
        if (!desc) return alert("Isi uraian kegiatan!");
        if (!name) return alert("Isi nama yang bersangkutan!");

        setSaving(true);
        const todayISO = new Date().toISOString().split('T')[0];

        // Upload images if Supabase is configured
        let imageUrls = imagePreviews;
        if (isSupabaseConfigured() && imagePreviews.length > 0) {
            try {
                imageUrls = await uploadImages(imagePreviews);
            } catch (err) {
                console.error('Image upload error:', err);
            }
        }

        const newActivity = {
            id: Date.now(),
            time,
            name,
            desc,
            user: user.name,
            images: imageUrls,
            dateISO: todayISO
        };

        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('activities').insert({
                user_id: user.id,
                user_name: user.name,
                time,
                subject_name: name,
                description: desc,
                images: imageUrls,
                date: todayISO
            });

            if (error) {
                alert('Gagal menyimpan: ' + error.message);
                setSaving(false);
                return;
            }
        }

        setActivityLog(p => [newActivity, ...p]);
        setDesc('');
        setName('');
        setImagePreviews([]);
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <div className="bg-white p-6 pt-8 border-b border-slate-100 sticky top-0 z-20">
                <Header title="Pos Antara" subtitle="Catatan Kegiatan" onBack={() => setCurrentScreen('home')} />
            </div>
            {viewImage && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 rounded-full p-2 transition-all"><X size={28} /></button>
                    <img src={viewImage} alt="Full View" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain animate-scale-up" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
            <div className="p-6 flex-1 overflow-y-auto">
                <GlassCard className="p-5 mb-8">
                    <form onSubmit={save}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Waktu</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-400" /></div>
                            <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Subjek</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-700 focus:ring-2 focus:ring-orange-400" placeholder="Petugas/Tamu/WBP" /></div>
                        </div>
                        <div className="mb-4"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Uraian Kegiatan</label><textarea rows="3" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-700 focus:ring-2 focus:ring-orange-400" placeholder="Jelaskan aktivitas..."></textarea></div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dokumentasi Foto</label>
                            <input type="file" accept="image/*" multiple capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                            <button type="button" onClick={() => fileInputRef.current.click()} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition flex flex-col items-center justify-center bg-slate-50 mb-3"><Camera className="mb-2" size={24} /><span>Ambil / Upload Foto</span></button>
                            {imagePreviews.length > 0 && (<div className="grid grid-cols-2 gap-3">{imagePreviews.map((img, idx) => (<div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group h-32"><img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" /><button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition"><Trash2 size={14} /></button></div>))}</div>)}
                        </div>
                        <button disabled={saving} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition flex items-center justify-center disabled:opacity-50">
                            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={20} className="mr-2" /> Simpan Laporan</>}
                        </button>
                    </form>
                </GlassCard>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center text-sm uppercase tracking-wider"><History size={18} className="mr-2 text-slate-400" /> Riwayat Hari Ini</h3>
                <div className="space-y-4 pb-20">
                    {activityLog.length === 0 ? <p className="text-center text-slate-400 text-sm italic py-4">Belum ada kegiatan tercatat.</p> : activityLog.map(l => (
                        <div key={l.id} className="flex relative pl-6 pb-6 last:pb-0 border-l-2 border-slate-200 ml-3">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-4 border-white"></div>
                            <div className="w-full">
                                <div className="flex justify-between items-start mb-1">
                                    <div><span className="text-xs font-bold text-slate-400 mr-2">{l.time}</span><span className="text-sm font-bold text-slate-800">{l.name}</span></div>
                                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">Oleh: {l.user}</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{l.desc}</p>
                                    {l.images && l.images.length > 0 && (<div className="mt-3 grid grid-cols-2 gap-2">{l.images.map((img, i) => (<button key={i} onClick={() => setViewImage(img)} className="rounded-xl overflow-hidden border border-slate-100 h-24 relative group"><img src={img} alt="Bukti" className="w-full h-full object-cover transition-transform group-hover:scale-105" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center"><Eye className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={20} /></div></button>))}</div>)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityScreen;
