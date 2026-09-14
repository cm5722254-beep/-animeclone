import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Clapperboard,
  PlusCircle,
  Mic2,
  Volume2,
  Users2,
  Languages,
  Subtitles,
  SlidersHorizontal,
  Share2,
  History,
  Cpu,
  HardDrive,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Sparkles,
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
  badgeVariant?: 'sky' | 'indigo' | 'success' | 'warning' | 'danger';
  title?: string;
}

const SidebarNavItem: React.FC<NavItemProps> = ({
  icon, label, active, onClick, isCollapsed, badge, badgeVariant = 'sky', title,
}) => (
  <button
    onClick={onClick}
    title={title || label}
    className={`nav-item ${active ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`}
  >
    <span className="nav-icon w-4 h-4 shrink-0">{icon}</span>
    {!isCollapsed && (
      <>
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span className={`badge badge-${badgeVariant} text-[9px] py-0`}>{badge}</span>
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
      className={`sidebar-root flex flex-col justify-between select-none transition-all duration-200 ${
        isCollapsed ? 'w-[54px]' : 'w-[210px]'
      }`}
    >
      {/* ── Nav Sections ── */}
      <div className="py-2.5 px-1.5 flex-1 overflow-y-auto flex flex-col gap-3">

        {/* Dashboard */}
        <SidebarNavItem
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          active={activeTab === 'tab-dashboard'}
          onClick={() => onSelectTab('tab-dashboard')}
          isCollapsed={isCollapsed}
        />

        {/* WORKSPACE */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && <div className="nav-category">Workspace</div>}

          <SidebarNavItem
            icon={<FolderKanban className="w-4 h-4" />}
            label="Projects"
            onClick={() => onSelectTab('tab-dashboard')}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
            label="Dubbing Studio"
            active={activeTab === 'tab-workflow'}
            onClick={() => onSelectTab('tab-workflow')}
            isCollapsed={isCollapsed}
            badge="AI"
            badgeVariant="sky"
          />

          <SidebarNavItem
            icon={<Clapperboard className="w-4 h-4" />}
            label="Studio Mode (Advanced)"
            active={activeTab === 'tab-dubbing'}
            onClick={() => onSelectTab('tab-dubbing')}
            isCollapsed={isCollapsed}
          />

          <button
            onClick={onNewProject}
            title="+ New Project"
            className={`nav-item group ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            {!isCollapsed && (
              <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                + New Project
              </span>
            )}
          </button>
        </div>

        {/* PRODUCTION */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && <div className="nav-category">Production</div>}

          <SidebarNavItem
            icon={<Mic2 className="w-4 h-4" />}
            label="Timeline"
            active={activeTab === 'tab-dubbing'}
            onClick={() => onSelectTab('tab-dubbing')}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<Volume2 className="w-4 h-4" />}
            label="AI Voices"
            active={activeTab === 'tab-character'}
            onClick={() => onSelectTab('tab-character')}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<Users2 className="w-4 h-4" />}
            label="Characters"
            onClick={() => onSelectTab('tab-character')}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<Languages className="w-4 h-4" />}
            label="Translation"
            active={activeTab === 'tab-translator'}
            onClick={() => onSelectTab('tab-translator')}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<Subtitles className="w-4 h-4" />}
            label="Subtitles"
            active={activeTab === 'tab-subtitles'}
            onClick={() => onSelectTab('tab-subtitles')}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<SlidersHorizontal className="w-4 h-4" />}
            label="Audio Mixer"
            active={activeTab === 'tab-mixer'}
            onClick={() => onSelectTab('tab-mixer')}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* DELIVERY */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && <div className="nav-category">Delivery</div>}

          <SidebarNavItem
            icon={<Share2 className="w-4 h-4 text-sky-400" />}
            label="Export"
            onClick={onOpenExport}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<History className="w-4 h-4" />}
            label="Render History"
            onClick={() => onSelectTab('tab-dashboard')}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* SYSTEM */}
        <div className="flex flex-col gap-0.5">
          {!isCollapsed && <div className="nav-category">System</div>}

          <SidebarNavItem
            icon={<Cpu className="w-4 h-4" />}
            label="API & AI"
            onClick={onOpenSettings}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<HardDrive className="w-4 h-4" />}
            label="Storage"
            onClick={onOpenSettings}
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            onClick={onOpenSettings}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>

      {/* ── Bottom Panel ── */}
      <div className="p-1.5 border-t border-white/[0.06] flex flex-col gap-1.5">

        {/* Subscription info (expanded only) */}
        {!isCollapsed && user && (() => {
          const subInfo = getSubscriptionInfo(user);
          return (
            <div
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl cursor-pointer transition-all group"
              style={{
                background: 'rgba(10,14,28,0.9)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
              }}
              title={`${subInfo.title} | ${subInfo.expiryText} (ចុចដើម្បីមើលលម្អិត)`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide">PLAN</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold font-mono border ${
                    subInfo.color === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      : subInfo.color === 'amber'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                  }`}
                >
                  {subInfo.badge}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-sky-300 transition-colors">
                {subInfo.title}
              </div>
              <div className="text-[9.5px] text-amber-400/75 font-medium truncate mt-0.5">
                {subInfo.expiryText}
              </div>
            </div>
          );
        })()}

        {/* System Status */}
        {!isCollapsed ? (
          <button
            onClick={onOpenSystemStatus}
            className="w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all group"
            style={{
              background: 'rgba(10,14,28,0.9)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.22)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
            }}
            title="Click to view System Status"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isSystemOnline
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
                style={{
                  boxShadow: isSystemOnline
                    ? '0 0 0 2px rgba(52,211,153,0.15), 0 0 8px #34d399'
                    : '0 0 8px #fbbf24',
                  animation: isSystemOnline ? 'statusPulse 2.5s ease-in-out infinite' : undefined,
                }}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold text-slate-200">System Status</span>
                <span className="text-[9px] text-slate-500 group-hover:text-sky-400 transition-colors">
                  {isSystemOnline ? 'All Systems Online' : 'Check Engine'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition-all group-hover:translate-x-0.5" />
          </button>
        ) : (
          <button
            onClick={onOpenSystemStatus}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/[0.04] text-slate-400 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
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

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-1.5 text-slate-600 hover:text-slate-300 rounded-lg hover:bg-white/[0.04] transition-all"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
