import React from 'react';
import {
  Sparkles,
  Undo2,
  Redo2,
  Play,
  UploadCloud,
  Download,
  Settings,
  User as UserIcon,
  Film,
  CheckCircle2,
  LogOut,
  HelpCircle,
  CloudLightning,
  Laptop,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { User, VoxcpmStatus } from '../../types';
import { getSubscriptionInfo } from '../../utils/subscription';

interface HeaderProps {
  activeProjectTitle: string;
  isSaving: boolean;
  user: User | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPreview?: () => void;
  onOpenAuthModal?: () => void;
  engineMode?: string;
  onSwitchEngine?: (mode: string) => void;
  voxStatus?: VoxcpmStatus | null;
  onOpenVoxModal?: () => void;
  onOpenAdmin?: () => void;
  onOpenDownloader?: () => void;
  onOpenThumbnailStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProjectTitle,
  isSaving,
  user,
  onLogout,
  onOpenSettings,
  onOpenExport,
  onUndo,
  onRedo,
  onPreview,
  onOpenAuthModal,
  engineMode = 'cloud',
  onSwitchEngine,
  voxStatus,
  onOpenVoxModal,
  onOpenAdmin,
  onOpenDownloader,
  onOpenThumbnailStudio,
}) => {
  // Extract project name and episode tag if available
  const rawTitle = activeProjectTitle || 'Perfect World EP145.mp4';
  const cleanName = rawTitle.replace(/\.(mp4|mkv|mov|avi|webm)$/i, '');
  const epMatch = cleanName.match(/(EP\s*\d+|ភាគ\s*\d+|Episode\s*\d+|\b\d+\b)/i);
  const epLabel = epMatch ? epMatch[0].toUpperCase() : 'EP 145';
  const displayTitle = cleanName.replace(epLabel, '').trim() || cleanName;

  return (
    <header className="h-[54px] bg-[#0a0e17] border-b border-white/[0.08] px-4 flex items-center justify-between z-40 select-none">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-sky-400/30">
            <Sparkles className="w-4 h-4 text-sky-200" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white font-ui">
                CHEATZ DABBER PRO
              </span>
              <span className="text-[10px] font-bold text-amber-400 font-mono">v3</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              Professional AI Dubbing Studio
            </span>
          </div>
        </div>
      </div>

      {/* Center: Active Project Capsule & Quick Tools */}
      <div className="hidden md:flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] border border-white/[0.08] rounded-xl text-xs shadow-inner">
          <Film className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-100 max-w-[140px] truncate" title={rawTitle}>
            {displayTitle || 'Perfect World'}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
            {epLabel}
          </span>
        </div>

        {/* Translation Language Capsule */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#111827] border border-white/[0.08] rounded-xl text-xs">
          <span className="font-medium text-slate-200 font-mono">CN → KH</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
        </div>

        {/* Engine Switcher & GPU Beacon */}
        <div className="hidden xl:flex items-center bg-[#111827] border border-white/[0.08] rounded-xl p-0.5 gap-0.5 text-xs">
          <button
            onClick={() => onSwitchEngine?.('cloud')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
              engineMode === 'cloud'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="VoxCPM2 Cloud GPU (Colab / Kaggle)"
          >
            <CloudLightning className="w-3 h-3 text-sky-400" />
            <span>Cloud GPU</span>
            <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'cloud' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </button>

          <button
            onClick={() => onSwitchEngine?.('local')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
              engineMode === 'local'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="VoxCPM2 Local Computer Port 8000"
          >
            <Laptop className="w-3 h-3 text-emerald-400" />
            <span>Port 8000</span>
            <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'local' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </button>

          {onOpenVoxModal && (
            <button
              onClick={onOpenVoxModal}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors ${
                voxStatus?.online
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-rose-500/10 text-rose-300'
              }`}
              title="ចុចដើម្បីកំណត់ Link VoxCPM2 Server"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${voxStatus?.online ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-400'}`} />
              <span>{voxStatus?.online ? 'GPU' : 'Offline'}</span>
            </button>
          )}
        </div>

        {/* Quick Production Tools (Download Link, Thumbnail, Android, Admin) */}
        <div className="flex items-center gap-1.5">
          {onOpenDownloader && (
            <button
              onClick={onOpenDownloader}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="ទាញយកវីដេអូពី YouTube, TikTok ឬ Facebook"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden lg:inline">Download Link</span>
            </button>
          )}

          {onOpenThumbnailStudio && (
            <button
              onClick={onOpenThumbnailStudio}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="បើកកម្មវិធីបង្កើត Thumbnail ភាពយន្ត 3D"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Thumbnail</span>
            </button>
          )}

          <a
            href="/mobile"
            className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-300 text-xs font-medium transition-all"
            title="បើក App Android"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </a>

          {user?.role === 'admin' && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-all"
              title="Admin Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Master Actions & Controls */}
      <div className="flex items-center gap-2">
        {/* Undo & Redo */}
        <div className="flex items-center bg-[#111827] border border-white/[0.08] rounded-lg p-0.5">
          <button
            onClick={onUndo}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preview Button */}
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 text-xs font-semibold transition-all active:scale-95"
          title="Fullscreen Preview Mode"
        >
          <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
          <span>Preview</span>
        </button>

        {/* Primary Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-sky-600/30 active:scale-95 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Export</span>
        </button>

        <div className="h-4 w-[1px] bg-white/[0.1] mx-0.5" />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
          title="Studio Settings (API, AI Models & Storage)"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile / Avatar & Logout Button */}
        {user ? (() => {
          const subInfo = getSubscriptionInfo(user);
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-white/[0.1] hover:border-sky-500/40 text-slate-200 text-xs font-medium transition-all group"
                title={`${subInfo.title} | ${subInfo.expiryText} (ចុចដើម្បីមើលការកំណត់)`}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 via-sky-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col items-start leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs max-w-[85px] truncate text-slate-200">
                      {user.username}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono border ${
                        subInfo.color === 'emerald'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : subInfo.color === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      }`}
                    >
                      {subInfo.badge}
                    </span>
                  </div>

                  <span className="text-[9.5px] text-slate-400 group-hover:text-amber-300 transition-colors truncate max-w-[140px]">
                    {subInfo.expiryText}
                  </span>
                </div>
              </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="ចាកចេញពីគណនី (Log Out)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>ចាកចេញ</span>
            </button>
          </div>
        );
      })() : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-semibold border border-sky-500/30 shadow-sm transition-all active:scale-95"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>ចូលប្រើ (Login)</span>
          </button>
        )}
      </div>
    </header>
  );
};
