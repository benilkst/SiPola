import { useState } from 'react';
import { User, QrCode, Users, ClipboardList, PlusCircle, CalendarDays, Sunrise, Sun, Moon, X, Eye } from 'lucide-react';
import { MenuCard } from '../components/UI';

const HomeScreen = ({ user, setCurrentScreen, apelHistory, activityLog }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewImage, setViewImage] = useState(null);

    const getApelData = (shift) => {
        const found = apelHistory.find(item => item.dateISO === selectedDate && item.shift === shift);
        return found ? found.total : '-';
    };

    const getFilteredActivities = () => {
        return activityLog.filter(item => item.dateISO === selectedDate).sort((a, b) => b.id.toString().localeCompare(a.id.toString()));
    };

    const activities = getFilteredActivities();

    if (!user) return null;
    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-10">
            {/* Image Viewer Overlay */}
            {viewImage && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 rounded-full p-2 transition-all z-50"><X size={28} /></button>
                    <img src={viewImage} alt="Full View" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
            <div className="h-64 bg-slate-900 rounded-b-[3.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[60px] opacity-30"></div>
                <div className="absolute top-10 -right-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[60px] opacity-30"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            </div>

            <div className="px-6 -mt-44 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-1">Status: Aktif</p>
                        <h2 className="text-3xl font-black text-white leading-tight">{user.name}</h2>
                        <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wide">{user.role}</span>
                        </div>
                    </div>
                    <button onClick={() => setCurrentScreen('profile')} className="w-14 h-14 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-lg">
                        <User size={24} />
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 mb-6">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
                            Monitoring Harian
                        </h3>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg p-1.5 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-5">
                        <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 text-center">
                            <div className="flex justify-center text-orange-500 mb-1"><Sunrise size={18} /></div>
                            <p className="text-[10px] font-bold text-orange-400 uppercase">Pagi</p>
                            <p className="text-xl font-black text-slate-800">{getApelData('Pagi')}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
                            <div className="flex justify-center text-blue-500 mb-1"><Sun size={18} /></div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase">Siang</p>
                            <p className="text-xl font-black text-slate-800">{getApelData('Siang')}</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 text-center">
                            <div className="flex justify-center text-indigo-500 mb-1"><Moon size={18} /></div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase">Malam</p>
                            <p className="text-xl font-black text-slate-800">{getApelData('Malam')}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-1">Timeline Kegiatan</h4>
                        <div className="space-y-0 h-96 overflow-y-auto pr-1 scrollbar-hide">
                            {activities.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-10 italic bg-slate-50 rounded-xl">Tidak ada kegiatan pada tanggal ini.</p>
                            ) : (
                                activities.map((act, idx) => (
                                    <div key={idx} className="flex gap-4 pb-6 relative last:pb-0 group">
                                        <div className="w-12 text-right pt-0.5 flex-shrink-0">
                                            <span className="text-xs font-bold text-slate-500">{act.time}</span>
                                        </div>
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10 relative">
                                                {idx === 0 && selectedDate === new Date().toISOString().split('T')[0] && (
                                                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                                                )}
                                            </div>
                                            {idx !== activities.length - 1 && (
                                                <div className="absolute top-3 w-0.5 h-full bg-slate-100 group-hover:bg-slate-200 transition-colors"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all mb-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{act.user}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{act.desc}</p>
                                            {(act.images?.length > 0 || act.image) && (
                                                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                                    {(act.images || [act.image]).map((img, i) => (
                                                        <button key={i} onClick={() => setViewImage(img)} className="rounded-lg overflow-hidden border border-slate-200 shadow-sm w-16 h-16 flex-shrink-0 relative group">
                                                            <img src={img} alt="Bukti" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                <Eye className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={14} />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {user.role !== 'Viewer' && (
                    <div className="grid grid-cols-3 gap-3">
                        <MenuCard
                            icon={QrCode}
                            title="Kontrol"
                            desc="Keliling"
                            color="text-blue-600"
                            onClick={() => setCurrentScreen('scan')}
                            variant="col"
                        />
                        <MenuCard
                            icon={Users}
                            title="Apel"
                            desc="Hunian"
                            color="text-emerald-600"
                            onClick={() => setCurrentScreen('apel')}
                            variant="col"
                        />
                        <MenuCard
                            icon={ClipboardList}
                            title="Kegiatan"
                            desc="Pos"
                            color="text-orange-600"
                            onClick={() => setCurrentScreen('activity')}
                            variant="col"
                        />
                    </div>
                )}

                {user.role === 'Super Admin' && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <MenuCard
                            icon={PlusCircle}
                            title="Manajemen Titik (Admin)"
                            desc="Kelola QR Code"
                            color="text-purple-600"
                            onClick={() => setCurrentScreen('generator')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;
