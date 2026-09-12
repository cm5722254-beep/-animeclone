import React from 'react';
import {
  Sparkles,
  CloudLightning,
  Laptop,
  Radio,
  Download,
  Settings,
  User as UserIcon,
  LogOut,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { User, VoxcpmStatus } from '../../types';

interface HeaderProps {
  activeProjectTitle: string;
  isSaving: boolean;
  engineMode: string;
  onSwitchEngine: (mode: string) => void;
  voxStatus: VoxcpmStatus | null;
  onOpenVoxModal: () => void;
  user: User | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenAdmin: () => void;
  onOpenDownloader: () => void;
  onOpenThumbnailStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProjectTitle,
  isSaving,
  engineMode,
  onSwitchEngine,
  voxStatus,
  onOpenVoxModal,
  user,
  onLogout,
  onOpenSettings,
  onOpenExport,
  onOpenAdmin,
  onOpenDownloader,
  onOpenThumbnailStudio,
}) => {
  return (
    <header className="h-[52px] bg-[#0b0f19] border-b border-white/[0.08] px-4 flex items-center justify-between z-40 select-none">
      {/* Left: Brand & Active Project */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-wide text-white font-ui">អាទិទេព DABBER</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              v3 PRO
            </span>
          </div>
        </div>

        {/* Project Capsule */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isSaving
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'
                : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
            }`}
          />
          <span className="font-medium text-slate-200 max-w-[200px] truncate">
            {activeProjectTitle || 'គម្រោងថ្មី (Untitled Project)'}
          </span>
          <span className="text-[10px] text-slate-400">• រួចរាល់</span>
        </div>
      </div>

      {/* Center: Engine Switcher & GPU Beacon */}
      <div className="hidden md:flex items-center gap-2.5">
        <div className="flex items-center bg-[#07090e] border border-white/[0.08] rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => onSwitchEngine('cloud')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              engineMode === 'cloud'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="VoxCPM2 Cloud GPU (Google Colab / Kaggle)"
          >
            <CloudLightning className="w-3 h-3" />
            <span>Cloud GPU</span>
            <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'cloud' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </button>

          <button
            onClick={() => onSwitchEngine('local')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              engineMode === 'local'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="VoxCPM2 Local Computer Port 8000"
          >
            <Laptop className="w-3 h-3" />
            <span>Port 8000</span>
            <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'local' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </button>

          <button
            onClick={() => onSwitchEngine('elevenlabs')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              engineMode === 'elevenlabs'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="ElevenLabs Zero-GPU Cloud Voice Cloning (Ultra-Realistic)"
          >
            <Radio className="w-3 h-3 text-purple-400" />
            <span>ElevenLabs AI</span>
            <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'elevenlabs' ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]' : 'bg-slate-500'}`} />
          </button>

          <button
            onClick={() => onSwitchEngine('pure_khmer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              engineMode === 'pure_khmer'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Khmer Offline Neural 100% Fast"
          >
            <Sparkles className="w-3 h-3" />
            <span>Offline Neural</span>
          </button>
        </div>

        {/* Engine / GPU Beacon */}
        <button
          onClick={onOpenVoxModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] transition-colors ${
            engineMode === 'elevenlabs'
              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
              : voxStatus?.online
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          }`}
          title="ចុចដើម្បីកំណត់ Settings / Server URL"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              engineMode === 'elevenlabs'
                ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
                : voxStatus?.online ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-400 shadow-[0_0_6px_#f87171]'
            }`}
          />
          <span>{engineMode === 'elevenlabs' ? '🎙️ ElevenLabs Cloud' : voxStatus?.online ? '⚡ GPU Online' : '⚠️ GPU Offline'}</span>
        </button>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-2">
        {user?.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
            title="Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Users</span>
          </button>
        )}

        <a
          href="/mobile"
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 transition-all"
          title="បើក App Android"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Android</span>
        </a>

        {/* Video Downloader Quick Action */}
        <button
          onClick={onOpenDownloader}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all"
          title="ទាញយកវីដេអូពី YouTube, TikTok ឬ Facebook"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline font-semibold">Download Link</span>
        </button>

        {/* Thumbnail Studio Action */}
        <button
          onClick={onOpenThumbnailStudio}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
          title="បើកកម្មវិធីបង្កើត Thumbnail ភាពយន្ត"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline font-semibold">Thumbnail</span>
        </button>

        {/* User Capsule */}
        {user && (
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-xs">
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
              <UserIcon className="w-3 h-3" />
            </div>
            <span className="font-medium text-slate-200 max-w-[90px] truncate">{user.username}</span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                user.tier === 'premium' || user.role === 'admin'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
              }`}
            >
              {user.tier || 'FREE'}
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Export Action */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-sky-600/30 hover:brightness-110 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="ការកំណត់ API & ប្រព័ន្ធ"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
