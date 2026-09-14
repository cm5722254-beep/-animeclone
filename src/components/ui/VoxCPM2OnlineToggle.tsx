import React, { useState } from 'react';
import { CloudLightning, Laptop, Globe, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { VoxcpmStatus } from '../../types';

interface VoxCPM2OnlineToggleProps {
  engineMode: string;                           // 'local' | 'cloud' | 'local_gpu'
  voxStatus?: VoxcpmStatus | null;
  onSwitchEngine: (mode: string) => void;       // called with 'cloud' | 'local'
  onOpenVoxModal?: () => void;                  // opens URL config modal
  compact?: boolean;                            // smaller version for header
  variant?: 'compact' | 'prominent' | 'card';   // layout variant
  title?: string;
  showDetails?: boolean;
}

export const VoxCPM2OnlineToggle: React.FC<VoxCPM2OnlineToggleProps> = ({
  engineMode,
  voxStatus,
  onSwitchEngine,
  onOpenVoxModal,
  compact = false,
  variant,
  title = 'RUN VOXCPM2: CLONE VOICE CHARACTER',
  showDetails = true,
}) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const isOnline = engineMode === 'cloud';
  const isConnected = Boolean(voxStatus && (voxStatus.online || voxStatus.configured));
  const activeVariant = variant || (compact ? 'compact' : 'card');

  const handleToggle = async (targetMode?: 'cloud' | 'local') => {
    if (isSwitching) return;
    setIsSwitching(true);

    const newMode = targetMode !== undefined ? targetMode : (isOnline ? 'local' : 'cloud');
    onSwitchEngine(newMode);

    // When switching TO online, if not configured or has modal handler, trigger modal
    if (newMode === 'cloud' && onOpenVoxModal && (!voxStatus || !voxStatus.configured)) {
      setTimeout(() => onOpenVoxModal(), 200);
    }

    setTimeout(() => setIsSwitching(false), 500);
  };

  /* ─────────────────────────────────────────────────────────────
     1. COMPACT VARIANT (for Header navigation bar)
  ───────────────────────────────────────────────────────────── */
  if (activeVariant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 p-1 px-2 rounded-xl bg-black/50 border border-white/[0.1] shadow-inner">
        {/* Status Dot */}
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isOnline
              ? isConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400 animate-pulse'
              : 'bg-indigo-400'
          }`}
          title={isOnline ? (isConnected ? 'Cloud GPU Online' : 'Connecting Cloud…') : 'Computer Local CPU'}
        />

        {/* ON / OFF Toggle Button */}
        <button
          id="voxcpm2-online-toggle-compact"
          onClick={() => handleToggle()}
          disabled={isSwitching}
          title={
            isOnline
              ? 'RUN VOXCPM2: ON (Online Cloud GPU) — Click to switch OFF → COMPUTER (Local)'
              : 'RUN VOXCPM2: OFF (Computer Local) — Click to switch ON → ONLINE (Cloud GPU)'
          }
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-300 disabled:opacity-70 active:scale-95 select-none ${
            isOnline
              ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
              : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80'
          }`}
        >
          {isSwitching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
          ) : isOnline ? (
            <CloudLightning className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-indigo-400" />
          )}

          {/* Mode Name */}
          <span className="tracking-wide hidden md:inline">
            {isOnline ? 'VOXCPM2: ONLINE' : 'VOXCPM2: COMPUTER'}
          </span>

          {/* ON / OFF Badge */}
          <span
            className={`text-[9.5px] font-extrabold px-1.5 py-0.2 rounded transition-colors ${
              isOnline
                ? 'bg-sky-400/30 text-sky-300 border border-sky-400/50'
                : 'bg-slate-700 text-slate-400 border border-slate-600'
            }`}
          >
            {isOnline ? 'ON' : 'OFF'}
          </span>

          {/* Pill Switch */}
          <div
            className={`w-7 h-3.5 rounded-full p-0.5 transition-all duration-300 flex items-center flex-shrink-0 ${
              isOnline ? 'bg-sky-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
          </div>
        </button>

        {/* Cloud Config Modal Button */}
        {onOpenVoxModal && (
          <button
            id="voxcpm2-config-btn-compact"
            onClick={onOpenVoxModal}
            title="Configure VoxCPM2 Server URL (Colab / Kaggle)"
            className="p-1 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-white/[0.08] transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     2. CARD VARIANT (for Step 2, Step 4, Character Cast Drawer, Inspector)
  ───────────────────────────────────────────────────────────── */
  return (
    <div
      id="voxcpm2-online-option-card"
      className={`p-4 rounded-2xl border transition-all duration-300 select-none ${
        isOnline
          ? 'bg-gradient-to-br from-[#0c1527] via-[#091122] to-[#0b162c] border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.12)]'
          : 'bg-[#0a0e1a] border-white/[0.1]'
      }`}
    >
      {/* Top Header: Title + Master ON/OFF Switch */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isOnline
                ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
            }`}
          >
            {isOnline ? <CloudLightning className="w-4 h-4 animate-pulse" /> : <Laptop className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-white uppercase tracking-wider">{title}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isOnline
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/35'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/35'
                }`}
              >
                {isOnline ? '⚡ ONLINE (CLOUD GPU)' : '💻 COMPUTER (LOCAL)'}
              </span>
            </div>
            {showDetails && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isOnline
                  ? 'ក្លូនសំឡេងតួអង្គដោយ Cloud GPU (Kaggle/Colab) — ល្បឿនលឿនគុណភាពខ្ពស់ 48kHz'
                  : 'ក្លូនសំឡេងតួអង្គលើកុំព្យូទ័រនេះផ្ទាល់ (Local Machine Port 8000) — Offline 100%'}
              </p>
            )}
          </div>
        </div>

        {/* Master ON/OFF Button Switch */}
        <div className="flex items-center gap-2">
          <button
            id="voxcpm2-master-toggle-btn"
            onClick={() => handleToggle()}
            disabled={isSwitching}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 border shadow-sm ${
              isOnline
                ? 'bg-sky-500 text-white border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSwitching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'
                }`}
              />
            )}
            <span>{isOnline ? 'ONLINE: ON' : 'ONLINE: OFF'}</span>

            {/* Pill */}
            <div
              className={`w-8 h-4 rounded-full p-0.5 transition-all flex items-center flex-shrink-0 ${
                isOnline ? 'bg-white/30 justify-end' : 'bg-slate-900 justify-start'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
            </div>
          </button>

          {onOpenVoxModal && (
            <button
              onClick={onOpenVoxModal}
              title="កំណត់ Server Link (Colab / Kaggle)"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-sky-300 border border-white/[0.08] transition-colors"
            >
              <Globe className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2 Selectable Option Buttons: ONLINE vs COMPUTER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {/* Option 1: RUN VOXCPM2 MODE ONLINE */}
        <button
          type="button"
          id="btn-option-voxcpm-online"
          onClick={() => handleToggle('cloud')}
          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
            isOnline
              ? 'bg-sky-500/15 border-sky-400/70 shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/50'
              : 'bg-black/30 border-white/[0.08] text-slate-400 hover:border-sky-400/40 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-bold text-xs flex items-center gap-1.5 ${
                isOnline ? 'text-sky-200' : 'text-slate-300'
              }`}
            >
              <CloudLightning className={`w-4 h-4 ${isOnline ? 'text-sky-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="tracking-wide">ជម្រើសទី ១: RUN ONLINE (Cloud GPU)</span>
            </span>

            {isOnline ? (
              <span className="flex items-center gap-1 text-[10.5px] font-black px-2.5 py-0.5 rounded-full bg-sky-500 text-white shadow-md shadow-sky-500/40 border border-sky-300">
                <CheckCircle2 className="w-3 h-3" />
                <span>ON (ACTIVE)</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                OFF (ចុចដើម្បីបើក)
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            ដំណើរការក្លូនសំឡេងតួអង្គលើ Cloud GPU (Kaggle / Colab) ល្បឿនលឿន (2-3s) កម្រិតច្បាស់ Neural 48kHz។
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-mono text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              <span>CLONE VOICE: ONLINE MODE</span>
            </span>
            <span className={`px-2 py-0.5 rounded font-bold ${isOnline ? 'bg-sky-500/30 text-sky-200' : 'bg-white/[0.05] text-slate-500'}`}>
              {isOnline ? 'កំពុងដំណើរការ ON' : 'ចុចជ្រើសរើស'}
            </span>
          </div>
        </button>

        {/* Option 2: RUN VOXCPM2 MODE COMPUTER */}
        <button
          type="button"
          id="btn-option-voxcpm-computer"
          onClick={() => handleToggle('local')}
          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
            !isOnline
              ? 'bg-indigo-500/15 border-indigo-400/70 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/50'
              : 'bg-black/30 border-white/[0.08] text-slate-400 hover:border-indigo-400/40 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`font-bold text-xs flex items-center gap-1.5 ${
                !isOnline ? 'text-indigo-200' : 'text-slate-300'
              }`}
            >
              <Laptop className={`w-4 h-4 ${!isOnline ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="tracking-wide">ជម្រើសទី ២: RUN COMPUTER (Local Machine)</span>
            </span>

            {!isOnline ? (
              <span className="flex items-center gap-1 text-[10.5px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-500/40 border border-indigo-300">
                <CheckCircle2 className="w-3 h-3" />
                <span>ON (ACTIVE)</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                OFF (ចុចដើម្បីបើក)
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            ដំណើរការក្លូនសំឡេងលើម៉ាស៊ីនកុំព្យូទ័រនេះផ្ទាល់ 100% Offline មិនចាំបាច់មានអ៊ីនធឺណិត (Port 8000)។
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-mono text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>CLONE VOICE: COMPUTER MODE</span>
            </span>
            <span className={`px-2 py-0.5 rounded font-bold ${!isOnline ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.05] text-slate-500'}`}>
              {!isOnline ? 'កំពុងដំណើរការ ON' : 'ចុចជ្រើសរើស'}
            </span>
          </div>
        </button>
      </div>

      {/* Live Status Banner */}
      {voxStatus && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                voxStatus.online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-slate-300">
              {voxStatus.online
                ? `Active Status: ${voxStatus.message || 'Connected OK'}`
                : isOnline
                ? 'Cloud Status: មិនទាន់ភ្ជាប់ (សូមចុច 🌐 កំណត់ URL)'
                : 'Computer Status: Local Standby'}
            </span>
          </div>

          {isOnline && onOpenVoxModal && (
            <button
              onClick={onOpenVoxModal}
              className="text-sky-400 hover:text-sky-300 underline font-medium"
            >
              {voxStatus.url ? 'ប្តូរ Link' : 'កំណត់ Link Colab'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
