import { ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';

// --- UI COMPONENTS ---
export const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white border border-slate-200 rounded-3xl ${className}`}>
        {children}
    </div>
);

export const Header = ({ title, subtitle, onBack }) => (
    <div className="flex items-center justify-between mb-8 pt-4 px-1">
        <div className="flex items-center">
            {onBack && (
                <button onClick={onBack} className="mr-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all active:scale-90 border border-slate-200">
                    <ChevronLeft size={22} />
                </button>
            )}
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{title}</h1>
                {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{subtitle}</p>}
            </div>
        </div>
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white transform rotate-3 shadow-lg shadow-blue-200">
            <ShieldCheck size={24} />
        </div>
    </div>
);

export const MenuCard = ({ icon: Icon, title, desc, color, onClick, variant = "row" }) => {
    if (variant === "col") {
        return (
            <button
                onClick={onClick}
                className="w-full relative group bg-white border border-slate-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-[0.98] hover:bg-slate-50 hover:shadow-lg h-full"
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${color} bg-slate-100`}>
                    <Icon size={28} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{title}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-2">{desc}</p>
            </button>
        );
    }
    return (
        <button
            onClick={onClick}
            className="w-full relative group bg-white border border-slate-200 rounded-3xl p-5 flex items-center transition-all duration-300 transform active:scale-[0.98] hover:bg-slate-50 hover:shadow-md"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-all duration-300 group-hover:scale-110 ${color} bg-slate-100`}>
                <Icon size={28} strokeWidth={2} />
            </div>
            <div className="text-left flex-1">
                <h3 className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{desc}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all bg-slate-100">
                <ChevronRight size={18} />
            </div>
        </button>
    );
};
