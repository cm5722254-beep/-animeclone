import React from 'react';
import { 
  Video, 
  Music, 
  Type, 
  Subtitles, 
  Mic, 
  Languages, 
  Sparkles, 
  Stars, 
  Wand2,
  Download,
  FileVideo,
  Settings
} from 'lucide-react';

interface StudioSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ 
  activeTab = 'video', 
  onTabChange 
}) => {
  const navItems = [
    { id: 'video', icon: Video, label: 'Video Editor', category: 'CREATE' },
    { id: 'audio', icon: Music, label: 'Audio Editor', category: 'CREATE' },
    { id: 'text', icon: Type, label: 'Text', category: 'CREATE' },
    { id: 'subtitle', icon: Subtitles, label: 'Subtitle', category: 'CREATE' },
    { id: 'music', icon: Music, label: 'Add Music', category: 'ENHANCE' },
    { id: 'watermark', icon: Sparkles, label: 'Watermark', category: 'ENHANCE' },
    { id: 'ai-voice', icon: Mic, label: 'AI Voice', category: 'AI TOOLS' },
    { id: 'translate', icon: Languages, label: 'Translate', category: 'AI TOOLS' },
    { id: 'animate', icon: Wand2, label: 'Animate', category: 'EFFECTS' },
    { id: 'effects', icon: Stars, label: 'Effects', category: 'EFFECTS' },
  ];

  const exportItems = [
    { id: 'export-project', icon: FileVideo, label: 'Export Project' },
    { id: 'export-video', icon: Download, label: 'Export Video' },
  ];

  let currentCategory: string | null = null;

  return (
    <div className="sidebar-root w-16 hover:w-48 transition-all duration-200 group">
      {/* Main Navigation */}
      <div className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const showCategory = item.category !== currentCategory;
            if (showCategory) {
              currentCategory = item.category;
            }

            return (
              <React.Fragment key={item.id}>
                {showCategory && (
                  <div className="nav-category mt-3 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.category}
                  </div>
                )}
                <button
                  onClick={() => onTabChange?.(item.id)}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  title={item.label}
                >
                  <Icon className="nav-icon w-4 h-4 flex-shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-white/[0.06]" />

        {/* Export Section */}
        <div className="space-y-1">
          <div className="nav-category opacity-0 group-hover:opacity-100 transition-opacity">
            EXPORT
          </div>
          {exportItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                title={item.label}
              >
                <Icon className="nav-icon w-4 h-4 flex-shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={() => onTabChange?.('settings')}
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          title="Settings"
        >
          <Settings className="nav-icon w-4 h-4 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs whitespace-nowrap overflow-hidden">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
};
