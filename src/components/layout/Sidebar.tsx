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
} from 'lucide-react';
import { TabId } from '../../types';

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
}

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
}) => {
  return (
    <aside
      className={`bg-[#0a0e17] border-r border-white/[0.08] flex flex-col justify-between transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top Section */}
      <div className="py-3 px-2 flex-1 overflow-y-auto flex flex-col gap-4">
        {/* Main Dashboard item */}
        <button
          onClick={() => onSelectTab('tab-dashboard')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'tab-dashboard'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Dashboard"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0 text-sky-400" />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        {/* Category: WORKSPACE */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="text-[10px] font-bold tracking-wider text-slate-500 px-3 uppercase">
              Workspace
            </div>
          )}

          <button
            onClick={() => onSelectTab('tab-dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            } text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]`}
            title="Projects"
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Projects</span>}
          </button>

          <button
            onClick={() => onSelectTab('tab-dubbing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'tab-dubbing'
                ? 'bg-gradient-to-r from-sky-600/30 to-indigo-600/30 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Studio"
          >
            <Clapperboard className="w-4 h-4 shrink-0 text-sky-400" />
            {!isCollapsed && <span>Studio</span>}
          </button>

          <button
            onClick={onNewProject}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-sky-300 hover:bg-white/[0.04] transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="+ New Project"
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span>+ New Project</span>}
          </button>
        </div>

        {/* Category: PRODUCTION */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="text-[10px] font-bold tracking-wider text-slate-500 px-3 uppercase">
              Production
            </div>
          )}

          <button
            onClick={() => onSelectTab('tab-dubbing')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'tab-dubbing'
                ? 'text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Dubbing"
          >
            <Mic2 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Dubbing</span>}
          </button>

          <button
            onClick={() => onSelectTab('tab-character')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'tab-character'
                ? 'bg-sky-500/15 text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="AI Voices"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>AI Voices</span>}
          </button>

          <button
            onClick={() => onSelectTab('tab-character')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Characters"
          >
            <Users2 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Characters</span>}
          </button>

          <button
            onClick={() => onSelectTab('tab-translator')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'tab-translator'
                ? 'bg-sky-500/15 text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Translation"
          >
            <Languages className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Translation</span>}
          </button>

          <button
            onClick={() => onSelectTab('tab-subtitles')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'tab-subtitles'
                ? 'bg-sky-500/15 text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Subtitles"
          >
            <Subtitles className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Subtitles</span>}
          </button>

          <button
            onClick={() => onSelectTab('tab-mixer')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'tab-mixer'
                ? 'bg-sky-500/15 text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Audio Mixer"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Audio Mixer</span>}
          </button>
        </div>

        {/* Category: DELIVERY */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="text-[10px] font-bold tracking-wider text-slate-500 px-3 uppercase">
              Delivery
            </div>
          )}

          <button
            onClick={onOpenExport}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Export"
          >
            <Share2 className="w-4 h-4 shrink-0 text-sky-400" />
            {!isCollapsed && <span>Export</span>}
          </button>

          <button
            onClick={() => onSelectTab('tab-dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Render History"
          >
            <History className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Render History</span>}
          </button>
        </div>

        {/* Category: SYSTEM */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <div className="text-[10px] font-bold tracking-wider text-slate-500 px-3 uppercase">
              System
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="API & AI"
          >
            <Cpu className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>API & AI</span>}
          </button>

          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Storage"
          >
            <HardDrive className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Storage</span>}
          </button>

          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Bottom: System Status Card & Collapse Toggle */}
      <div className="p-2 border-t border-white/[0.08] flex flex-col gap-2">
        {!isCollapsed ? (
          <button
            onClick={onOpenSystemStatus}
            className="w-full p-2.5 rounded-xl bg-[#111827] border border-white/[0.08] hover:border-sky-500/30 flex items-center justify-between text-left transition-all group"
            title="Click to view System Status"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSystemOnline
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                }`}
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-200">
                  System Status
                </span>
                <span className="text-[9px] text-slate-500 group-hover:text-sky-400 transition-colors">
                  {isSystemOnline ? 'All Systems Online' : 'Check Engine Status'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
          </button>
        ) : (
          <button
            onClick={onOpenSystemStatus}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-[#111827] hover:bg-white/[0.06] text-slate-400 transition-colors"
            title="System Status"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSystemOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
              }`}
            />
          </button>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/[0.04] transition-colors"
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
