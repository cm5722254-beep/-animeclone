import React from 'react';
import {
  LayoutGrid,
  Film,
  Sliders,
  Mic2,
  Languages,
  Volume2,
  Subtitles,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import { TabId } from '../../types';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const workspaceItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'tab-dashboard', label: 'ផ្ទាំងគ្រប់គ្រង (Dashboard)', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'tab-dubbing', label: 'ស្ទូឌីយោបញ្ជូលសំឡេង', icon: <Film className="w-4 h-4" /> },
    { id: 'tab-manual', label: 'បន្ទប់កាត់ត Timeline', icon: <Sliders className="w-4 h-4" /> },
  ];

  const productionItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'tab-character', label: 'តួអង្គ & សំឡេងខ្មែរ', icon: <Mic2 className="w-4 h-4" /> },
    { id: 'tab-translator', label: 'បកប្រែពាក្យពេចន៍', icon: <Languages className="w-4 h-4" /> },
    { id: 'tab-mixer', label: 'លាយភ្លេង Mixer', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'tab-subtitles', label: 'អក្សររត់ក្រោមរឿង', icon: <Subtitles className="w-4 h-4" /> },
    { id: 'tab-thumbnail', label: 'Thumbnail ភាពយន្ត', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'tab-tuner', label: 'សារ៉េទឹកដមសំឡេង', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`bg-[#090d15] border-r border-white/[0.08] flex flex-col justify-between overflow-y-auto transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="py-2.5 px-2">
        {/* Workspace */}
        <div className="mb-3">
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Workspace
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {workspaceItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-all relative ${
                  activeTab === item.id
                    ? 'bg-sky-500/15 text-sky-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                {activeTab === item.id && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-sky-400 rounded-r" />
                )}
                {item.icon}
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Production */}
        <div>
          {!isCollapsed && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Production
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {productionItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-all relative ${
                  activeTab === item.id
                    ? 'bg-sky-500/15 text-sky-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                {activeTab === item.id && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-sky-400 rounded-r" />
                )}
                {item.icon}
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-white/[0.08]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] text-xs transition-all"
          title={isCollapsed ? 'ពង្រីក' : 'បង្រួម'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          {!isCollapsed && <span>បង្រួម Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
