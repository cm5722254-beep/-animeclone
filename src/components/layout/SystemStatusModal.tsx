import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, CloudLightning, Radio, Brain, HardDrive, Film, RefreshCw } from 'lucide-react';
import { VoxcpmStatus, StudioConfig } from '../../types';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  voxStatus: VoxcpmStatus | null;
  config: StudioConfig | null;
  diskStats: { formattedSize: string; count: number } | null;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenVoxModal: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({
  isOpen,
  onClose,
  voxStatus,
  config,
  diskStats,
  onRefresh,
  onOpenSettings,
  onOpenVoxModal,
}) => {
  if (!isOpen) return null;

  const isVoxOnline = voxStatus?.online ?? false;
  const isElevenlabsActive = config?.hasElevenlabs ?? false;
  const isGeminiActive = config?.hasGemini ?? false;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#0e131f] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#090d16]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <h3 className="text-sm font-bold text-white font-ui">
              SYSTEM STATUS — ស្ថានភាពប្រព័ន្ធ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-6 flex flex-col gap-3 text-xs">
          {/* Cloud GPU */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <CloudLightning className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">VoxCPM2 Cloud GPU</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                  {config?.voxcpmUrl || 'No URL configured'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                  isVoxOnline
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isVoxOnline ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                <span>{isVoxOnline ? 'Connected' : 'Standby / Busy'}</span>
              </span>
            </div>
          </div>

          {/* ElevenLabs AI */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">ElevenLabs AI (Cloud)</div>
                <div className="text-[10px] text-slate-400">Ultra-Realistic Voice Cloning</div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                isElevenlabsActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
              }`}
            >
              {isElevenlabsActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span>{isElevenlabsActive ? 'Ready' : 'No Key'}</span>
            </span>
          </div>

          {/* Gemini AI */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">Gemini AI Model</div>
                <div className="text-[10px] text-slate-400">{config?.geminiModel || 'gemini-3.5-flash'}</div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                isGeminiActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
              }`}
            >
              {isGeminiActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span>{isGeminiActive ? 'Online' : 'Not Configured'}</span>
            </span>
          </div>

          {/* Storage & Cache */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">Storage & Disk Cache</div>
                <div className="text-[10px] text-slate-400">{diskStats?.count || 0} output media items</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              {diskStats?.formattedSize || '0 MB'}
            </span>
          </div>

          {/* Video & Audio Renderer */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">FFmpeg Video & Audio Engine</div>
                <div className="text-[10px] text-slate-400">Hardware & CPU Native Pipeline</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Ready</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#090d16] flex items-center justify-between">
          <button
            onClick={() => {
              onRefresh();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>តេស្តឡើងវិញ</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenVoxModal();
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 text-xs font-semibold transition-colors"
            >
              GPU Link
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold transition-all"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
