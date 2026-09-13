import React, { useEffect, useState } from 'react';
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

const TOAST_DURATION = 3800;

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION);
    const interval = setInterval(() => {
      setProgress(p => Math.max(0, p - (100 / (TOAST_DURATION / 50))));
    }, 50);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [toast.id, onDismiss]);

  const styles = {
    success: {
      bg: 'rgba(5,18,10,0.97)',
      border: 'rgba(52,211,153,0.32)',
      text: '#a7f3d0',
      iconColor: '#34d399',
      progressColor: '#34d399',
      glow: '0 0 20px rgba(52,211,153,0.12)',
    },
    error: {
      bg: 'rgba(20,5,8,0.97)',
      border: 'rgba(248,113,113,0.32)',
      text: '#fecaca',
      iconColor: '#f87171',
      progressColor: '#f87171',
      glow: '0 0 20px rgba(248,113,113,0.12)',
    },
    warning: {
      bg: 'rgba(20,14,3,0.97)',
      border: 'rgba(251,191,36,0.32)',
      text: '#fde68a',
      iconColor: '#fbbf24',
      progressColor: '#fbbf24',
      glow: '0 0 20px rgba(251,191,36,0.12)',
    },
    info: {
      bg: 'rgba(5,10,22,0.97)',
      border: 'rgba(56,189,248,0.28)',
      text: '#bae6fd',
      iconColor: '#38bdf8',
      progressColor: '#38bdf8',
      glow: '0 0 20px rgba(56,189,248,0.1)',
    },
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[toast.type];

  return (
    <div
      className="pointer-events-auto flex flex-col rounded-xl overflow-hidden animate-fade-up"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.6), ${styles.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <Icon
            className="w-4 h-4 shrink-0"
            style={{ color: styles.iconColor }}
          />
          <span
            className="text-xs font-medium leading-relaxed truncate"
            style={{ color: styles.text }}
          >
            {toast.message}
          </span>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors shrink-0"
          title="បិទ"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.04)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: styles.progressColor,
            boxShadow: `0 0 6px ${styles.progressColor}`,
            transition: 'width 50ms linear',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const visibleToasts = toasts.slice(-3);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {visibleToasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
