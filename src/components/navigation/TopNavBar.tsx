import React from 'react';
import { Save, Settings, Globe, Sparkles } from 'lucide-react';

interface TopNavBarProps {
  projectName?: string;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  onSettingsClick?: () => void;
  onTranscribeClick?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  projectName = 'Khmer dub',
  language = 'Khmer (Cambodia)',
  onLanguageChange,
  onSettingsClick,
  onTranscribeClick,
}) => {
  return (
    <div className="h-14 bg-[#0d1219] border-b border-sky-500/10 flex items-center justify-between px-4 shadow-lg">
      {/* Left: Project Name & Language */}
      <div className="flex items-center gap-4">
        {/* Project Name */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            DIALOGUE
          </span>
          <h1 className="text-lg font-bold text-white">
            {projectName}
          </h1>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer">
          <Globe className="w-4 h-4 text-sky-400" />
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="bg-transparent text-sm text-slate-300 outline-none cursor-pointer"
          >
            <option value="Khmer (Cambodia)">Khmer (Cambodia)</option>
            <option value="Chinese (Simplified)">Chinese (Simplified)</option>
            <option value="English">English</option>
            <option value="Thai">Thai</option>
          </select>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Save Button */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium transition-all"
          title="Save Project"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium transition-all"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* Transcribe Button (Primary) */}
        <button
          onClick={onTranscribeClick}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold text-sm transition-all shadow-lg shadow-sky-600/30 active:scale-95"
          title="Transcribe Audio"
        >
          <Sparkles className="w-4 h-4" />
          <span>Transcribe</span>
        </button>
      </div>
    </div>
  );
};
