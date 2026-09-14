import React, { useState } from 'react';
import {
  Film,
  Save,
  RotateCcw,
  RotateCw,
  Play,
  Share2,
  Settings,
  User as UserIcon,
  Loader2,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { User, VoxcpmStatus } from '../../types';
import { VoxCPM2OnlineToggle } from '../ui/VoxCPM2OnlineToggle';

interface HeaderProps {
  activeProjectTitle: string;
  isSaving: boolean;
  user: User | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onSaveProject?: () => void;
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
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  videoCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeProjectTitle,
  isSaving,
  user,
  onLogout,
  onOpenSettings,
  onOpenExport,
  onSaveProject,
  onUndo,
  onRedo,
  onPreview,
  onOpenAuthModal,
  onOpenAdmin,
  engineMode = 'local',
  onSwitchEngine,
  voxStatus,
  onOpenVoxModal,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Extract clean project and episode names
  const rawTitle = activeProjectTitle || 'Perfect World EP145.mp4';
  const cleanName = rawTitle.replace(/\.(mp4|mkv|mov|avi|webm)$/i, '');
  const epMatch = cleanName.match(/(EP\s*\d+|ភាគ\s*\d+|Episode\s*\d+|\b\d+\b)/i);
  const epLabel = epMatch ? epMatch[0].toUpperCase() : 'EP 145';
  const displayTitle = cleanName.replace(epLabel, '').trim() || cleanName;

  const isCloud = engineMode === 'cloud';

  return (
    <header className="h-12 bg-[#090b10] border-b border-white/[0.08] flex items-center justify-between px-3.5 select-none text-slate-100 flex-shrink-0 z-30">
      {/* ── Left: Professional Branding ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 border border-sky-400/30">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] tracking-wide text-white font-ui">
              CHEATZ DABBER
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 tracking-wider">
              v3 PRO
            </span>
          </div>
        </div>
      </div>

      {/* ── Center: Project Context & VoxCPM2 Online/Local Switch ── */}
      <div className="hidden sm:flex items-center gap-2.5">
        <div className="flex items-center gap-2.5 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Project:</span>
            <span className="font-semibold text-slate-200 max-w-[180px] truncate" title={displayTitle}>
              {displayTitle}
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
            {epLabel}
          </span>

          <div className="h-3 w-px bg-white/10" />

          <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span>CN</span>
            <span className="text-amber-400/60">→</span>
            <span>KH</span>
          </div>
        </div>

        {/* ── VoxCPM2 ON/OFF Engine Switch: Online Cloud GPU vs Local Computer ── */}
        <VoxCPM2OnlineToggle
          engineMode={engineMode}
          voxStatus={voxStatus}
          onSwitchEngine={(m) => onSwitchEngine?.(m)}
          onOpenVoxModal={onOpenVoxModal}
          compact
        />
      </div>

      {/* ── Right: Standard Workstation Actions ── */}
      <div className="flex items-center gap-1.5">
        {/* Save Status Button */}
        <button
          onClick={onSaveProject}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors disabled:opacity-60"
          title="Save Project (Ctrl+S)"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span className="hidden md:inline text-[11px]">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline text-[11px]">Save</span>
            </>
          )}
        </button>

        {/* Undo */}
        <button
          onClick={onUndo}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Preview Play/Pause Toggle */}
        <button
          onClick={onPreview}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Play / Pause Preview (Space)"
        >
          <Play className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        {/* Primary Export Action */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-black shadow-lg shadow-sky-500/20 transition-all active:scale-95"
          title="Export Dubbed Video"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Studio Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile / Auth */}
        <div className="relative ml-0.5">
          {user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-[10px] font-bold text-sky-400">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-sky-400 hover:bg-sky-500/10 border border-sky-500/30 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* User Menu Dropdown */}
          {showUserMenu && user && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-[#0e1118] border border-white/10 shadow-2xl p-1 z-50 text-xs"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-2.5 py-2 border-b border-white/[0.06]">
                <div className="font-semibold text-white truncate">{user.username}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                  Role: <span className="text-sky-400">{user.role}</span>
                </div>
              </div>

              {user.role === 'admin' && onOpenAdmin && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin User Manager</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Preferences</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors mt-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
