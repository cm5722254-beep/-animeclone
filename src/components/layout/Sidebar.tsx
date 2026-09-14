import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Film,
  Users,
  Mic2,
  Languages,
  Subtitles,
  SlidersHorizontal,
  Image,
  Share2,
  History,
  Link2,
  Cpu,
  HardDrive,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { TabId, User } from '../../types';
import { getSubscriptionInfo } from '../../utils/subscription';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewProject: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenSystemStatus: () => void;
  isSystemOnline?: boolean;
  user?: User | null;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  badge?: string;
  badgeVariant?: 'sky' | 'indigo' | 'emerald' | 'amber';
  title?: string;
}

const SidebarNavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active,
  onClick,
  isCollapsed,
  badge,
  badgeVariant = 'sky',
  title,
}) => (
  <button
    onClick={onClick}
    title={isCollapsed ? title || label : undefined}
    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all group relative ${
      active
        ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400 rounded-l-none'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
    } ${isCollapsed ? 'justify-center px-0' : ''}`}
  >
    <span className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
      {icon}
    </span>
    {!isCollapsed && (
      <>
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
              badgeVariant === 'emerald'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                : badgeVariant === 'amber'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                : 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
            }`}
          >
            {badge}
          </span>
        )}
      </>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onNewProject,
  onOpenExport,
  onOpenSettings,
  onOpenSystemStatus,
  isSystemOnline = true,
  user,
}) => {
  return (
    <aside
      className={`bg-[#080a0f] border-r border-white/[0.08] flex flex-col justify-between select-none transition-all duration-200 z-20 flex-shrink-0 ${
        isCollapsed ? 'w-[52px]' : 'w-[210px]'
      }`}
    >
      {/* ── Nav Sections ── */}
      <div className="py-2.5 px-2 flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-3">
        {/* WORKSPACE */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
              WORKSPACE
            </div>
          )}

          <SidebarNavItem
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            active={activeTab === 'tab-dashboard'}
            onClick={() => onSelectTab('tab-dashboard')}
            isCollapsed={isCollapsed}
            title="Project Dashboard"
          />

          <SidebarNavItem
            icon={<Film className="w-4 h-4 text-sky-400" />}
            label="Dubbing Studio"
            active={activeTab === 'tab-dubbing' || activeTab === 'tab-workflow'}
            onClick={() => onSelectTab('tab-dubbing')}
            isCollapsed={isCollapsed}
            badge="PRO"
            badgeVariant="sky"
            title="AI Dubbing Studio Workstation"
          />
        </div>

        {/* PRODUCTION */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
              PRODUCTION
            </div>
          )}

          <SidebarNavItem
            icon={<Users className="w-4 h-4" />}
            label="AI Voices & Cast"
            active={activeTab === 'tab-character'}
            onClick={() => onSelectTab('tab-character')}
            isCollapsed={isCollapsed}
            title="Character Voice Casting & Library"
          />

          <SidebarNavItem
            icon={<Languages className="w-4 h-4" />}
            label="Translation"
            active={activeTab === 'tab-translator'}
            onClick={() => onSelectTab('tab-translator')}
            isCollapsed={isCollapsed}
            title="AI Script Translation"
          />

          <SidebarNavItem
            icon={<Subtitles className="w-4 h-4" />}
            label="Subtitles"
            active={activeTab === 'tab-subtitles'}
            onClick={() => onSelectTab('tab-subtitles')}
            isCollapsed={isCollapsed}
            title="Subtitle Editor & SRT"
          />

          <SidebarNavItem
            icon={<SlidersHorizontal className="w-4 h-4" />}
            label="Audio Mixer"
            active={activeTab === 'tab-mixer'}
            onClick={() => onSelectTab('tab-mixer')}
            isCollapsed={isCollapsed}
            title="Audio Mixer Console"
          />

          <SidebarNavItem
            icon={<Image className="w-4 h-4" />}
            label="Thumbnail Studio"
            active={activeTab === 'tab-thumbnail'}
            onClick={() => onSelectTab('tab-thumbnail')}
            isCollapsed={isCollapsed}
            title="AI Video Thumbnail Generator"
          />
        </div>

        {/* DELIVERY */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
              DELIVERY
            </div>
          )}

          <SidebarNavItem
            icon={<Share2 className="w-4 h-4 text-sky-400" />}
            label="Export Video"
            onClick={onOpenExport}
            isCollapsed={isCollapsed}
            title="Render & Export Video"
          />

          <SidebarNavItem
            icon={<History className="w-4 h-4" />}
            label="Render History"
            active={false}
            onClick={() => onSelectTab('tab-dashboard')}
            isCollapsed={isCollapsed}
            title="View Completed Renders"
          />
        </div>

        {/* SYSTEM */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
              SYSTEM
            </div>
          )}

          <SidebarNavItem
            icon={<Cpu className="w-4 h-4" />}
            label="API & AI"
            onClick={onOpenSettings}
            isCollapsed={isCollapsed}
            title="AI Model & Key Settings"
          />

          <SidebarNavItem
            icon={<HardDrive className="w-4 h-4" />}
            label="Storage"
            onClick={onOpenSettings}
            isCollapsed={isCollapsed}
            title="Storage & Disk Management"
          />

          <SidebarNavItem
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            onClick={onOpenSettings}
            isCollapsed={isCollapsed}
            title="Studio Preferences"
          />
        </div>
      </div>

      {/* ── Sidebar Footer ── */}
      <div className="p-2 border-t border-white/[0.08] flex flex-col gap-2">
        {/* User Plan Info (if expanded) */}
        {!isCollapsed && user && (() => {
          const subInfo = getSubscriptionInfo(user);
          return (
            <div
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-sky-500/30 cursor-pointer transition-all"
              title={`${subInfo.title} | ${subInfo.expiryText}`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-semibold">PLAN</span>
                <span className="text-sky-300 font-bold font-mono">{subInfo.badge}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-200 truncate mt-0.5">{subInfo.title}</div>
            </div>
          );
        })()}

        {/* Compact System Status Button */}
        {!isCollapsed ? (
          <button
            onClick={onOpenSystemStatus}
            className="w-full p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-sky-500/30 flex items-center justify-between text-left transition-all"
            title="Click to view full System Status"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isSystemOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{
                  boxShadow: isSystemOnline ? '0 0 8px #34d399' : '0 0 8px #fbbf24',
                }}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold text-slate-200">System Status</span>
                <span className="text-[9px] text-slate-400">
                  {isSystemOnline ? 'All Systems Online' : 'Check Services'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ) : (
          <button
            onClick={onOpenSystemStatus}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
            title="System Status"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSystemOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{
                boxShadow: isSystemOnline ? '0 0 8px #34d399' : '0 0 8px #fbbf24',
              }}
            />
          </button>
        )}

        {/* Collapse / Expand Toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-white/[0.04] transition-all"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
