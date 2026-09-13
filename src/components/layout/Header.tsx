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
  Save,
  Loader2,
  Zap,
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
  engineMode = 'cloud',
  onSwitchEngine,
  voxStatus,
  onOpenVoxModal,
  onOpenAdmin,
  onOpenDownloader,
  onOpenThumbnailStudio,
}) => {
  const rawTitle = activeProjectTitle || 'Perfect World EP145.mp4';
  const cleanName = rawTitle.replace(/\.(mp4|mkv|mov|avi|webm)$/i, '');
  const epMatch = cleanName.match(/(EP\s*\d+|ភាគ\s*\d+|Episode\s*\d+|\b\d+\b)/i);
  const epLabel = epMatch ? epMatch[0].toUpperCase() : 'EP 145';
  const displayTitle = cleanName.replace(epLabel, '').trim() || cleanName;

  return (
    <header className="header-root h-[52px] px-3.5 flex items-center justify-between select-none">
      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-2.5">
        {/* Logo mark */}
        <div className="brand-logo">
          <Sparkles className="w-3.5 h-3.5 text-white relative z-10" />
        </div>

        {/* Brand text */}
        <div className="flex flex-col leading-none gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[13px] tracking-wide text-white">
              CHEATZ DABBER
            </span>
            <span
              className="text-[10px] font-black"
              style={{
                background: 'linear-gradient(135deg, #fcd34d, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PRO v3
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 font-normal tracking-wide">
            AI Dubbing Studio
          </span>
        </div>
      </div>

      {/* ── Center: Project info + tools ── */}
      <div className="hidden md:flex items-center gap-2">
        {/* Active project capsule */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
          style={{
            background: 'rgba(10,14,28,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Film className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-100 max-w-[130px] truncate" title={rawTitle}>
            {displayTitle || 'Perfect World'}
          </span>
          <span
            className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md badge-sky"
          >
            {epLabel}
          </span>
        </div>

        {/* Language badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs"
          style={{
            background: 'rgba(10,14,28,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <span className="font-semibold text-slate-200 font-mono text-[11px]">CN → KH</span>
          <span
            className="status-dot online"
            style={{ width: '6px', height: '6px' }}
          />
        </div>

        {/* Engine switcher */}
        <div
          className="hidden xl:flex items-center gap-0.5 p-0.5 rounded-xl"
          style={{
            background: 'rgba(7,9,15,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={() => onSwitchEngine?.('cloud')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              engineMode === 'cloud'
                ? 'bg-sky-500/18 text-sky-300 border border-sky-500/28'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="VoxCPM2 Cloud GPU"
          >
            <CloudLightning className={`w-3 h-3 ${engineMode === 'cloud' ? 'text-sky-400' : ''}`} />
            <span>Cloud GPU</span>
            <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'cloud' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </button>

          <button
            onClick={() => onSwitchEngine?.('local')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              engineMode === 'local'
                ? 'bg-emerald-500/18 text-emerald-300 border border-emerald-500/28'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="VoxCPM2 Local Port 8000"
          >
            <Laptop className={`w-3 h-3 ${engineMode === 'local' ? 'text-emerald-400' : ''}`} />
            <span>Port 8000</span>
            <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'local' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </button>

          {onOpenVoxModal && (
            <button
              onClick={onOpenVoxModal}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors ${
                voxStatus?.online ? 'text-emerald-300' : 'text-rose-300'
              }`}
              style={{
                background: voxStatus?.online ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
              }}
              title="VoxCPM2 Server Status"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  voxStatus?.online ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
                style={voxStatus?.online ? { boxShadow: '0 0 6px #34d399' } : undefined}
              />
              <span>{voxStatus?.online ? 'GPU' : 'Offline'}</span>
            </button>
          )}
        </div>

        {/* Quick tools */}
        <div className="flex items-center gap-1.5">
          {onOpenDownloader && (
            <button
              onClick={onOpenDownloader}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'rgba(248,113,113,0.09)',
                border: '1px solid rgba(248,113,113,0.22)',
                color: '#fca5a5',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.17)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.09)'; }}
              title="ទាញយកវីដេអូ YouTube, TikTok, Facebook"
            >
              <Download className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
              <span className="hidden lg:inline">Download</span>
            </button>
          )}

          {onOpenThumbnailStudio && (
            <button
              onClick={onOpenThumbnailStudio}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'rgba(251,191,36,0.09)',
                border: '1px solid rgba(251,191,36,0.22)',
                color: '#fcd34d',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(251,191,36,0.17)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(251,191,36,0.09)'; }}
              title="Thumbnail Studio 3D"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Thumbnail</span>
            </button>
          )}

          <a
            href="/mobile"
            className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all"
            style={{
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.17)',
              color: '#7dd3fc',
            }}
            title="Android App"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </a>

          {user?.role === 'admin' && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all"
              style={{
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.22)',
                color: '#6ee7b7',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.08)'; }}
              title="Admin Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Right: Master Controls ── */}
      <div className="flex items-center gap-1.5">
        {/* Undo/Redo */}
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{
            background: 'rgba(10,14,28,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={onUndo}
            className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={onSaveProject}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            background: 'rgba(10,14,28,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(52,211,153,0.36)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
          title="រក្សាទុកគម្រោង (Ctrl+S)"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <Save className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>រក្សាទុក</span>
          <span className="hidden xl:inline text-[9px] text-emerald-400/65 font-mono">✓ Auto</span>
        </button>

        {/* Preview */}
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
          }}
          title="Preview"
        >
          <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
          <span>Preview</span>
        </button>

        {/* Export CTA */}
        <button
          onClick={onOpenExport}
          className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs"
        >
          <UploadCloud className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Export</span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl text-slate-500 hover:text-white transition-all"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
          }}
          title="Studio Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile / Auth */}
        {user ? (() => {
          const subInfo = getSubscriptionInfo(user);
          return (
            <div className="flex items-center gap-1.5">
              {/* User pill */}
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all group"
                style={{
                  background: 'rgba(10,14,28,0.85)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.35)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }}
                title={`${subInfo.title} | ${subInfo.expiryText}`}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.4)',
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col items-start leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs max-w-[80px] truncate text-slate-200">
                      {user.username}
                    </span>
                    <span
                      className={`badge ${
                        subInfo.color === 'emerald' ? 'badge-success' :
                        subInfo.color === 'amber' ? 'badge-warning' : 'badge-indigo'
                      }`}
                      style={{ fontSize: '9px', padding: '1px 5px' }}
                    >
                      {subInfo.badge}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 group-hover:text-amber-300 transition-colors truncate max-w-[110px]">
                    {subInfo.expiryText}
                  </span>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{
                  background: 'rgba(248,113,113,0.09)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  color: '#fca5a5',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.09)'; }}
                title="ចាកចេញ (Logout)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>ចាកចេញ</span>
              </button>
            </div>
          );
        })() : (
          <button
            onClick={onOpenAuthModal}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
          >
            <UserIcon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">ចូលប្រើ</span>
          </button>
        )}
      </div>
    </header>
  );
};
