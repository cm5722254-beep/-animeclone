import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  // Automatically dismiss toasts after 3.2 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const latestToast = toasts[toasts.length - 1];
    const timer = setTimeout(() => {
      onDismiss(latestToast.id);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  // Cap at maximum 3 visible toasts to prevent vertical clutter/spamming
  const visibleToasts = toasts.slice(-3);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl shadow-2xl border backdrop-blur-md text-xs font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#081f14]/95 border-emerald-500/40 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-[#260c12]/95 border-rose-500/40 text-rose-200'
              : toast.type === 'warning'
              ? 'bg-[#2a1b05]/95 border-amber-500/40 text-amber-200'
              : 'bg-[#0b101b]/95 border-sky-500/30 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span className="truncate leading-relaxed">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            title="បិទ"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
