/**
 * CHEATZ DABBER PRO v3 - Professional AI Dubbing Studio
 * Main Application Shell
 * 
 * This component implements the complete v3 UI redesign while preserving
 * all existing functionality from the current application.
 */

import React, { useState } from 'react';
import {
  Film, Play, Save, RotateCcw, RotateCw, Settings,
  Upload, Download, Zap, Users, Languages, Subtitles,
  Volume2, Mic2, FileVideo, BarChart3, Package, Database,
  ChevronRight, ChevronLeft, Search, Bell, HelpCircle
} from 'lucide-react';

interface ProStudioProps {
  // All existing props from DubbingStudio will be passed through
  children?: React.ReactNode;
}

export const ProStudio: React.FC<ProStudioProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dubbing');

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between px-4 flex-shrink-0">
        {/* Left: Branding & Project */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[var(--accent)]" />
            <span className="font-bold text-sm">CHEATZ DABBER</span>
            <span className="text-xs text-[var(--accent)] font-semibold">PRO v3</span>
          </div>
          <div className="h-4 w-px bg-[var(--border-default)]" />
          <div className="text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)]">Project:</span> Perfect World EP145
          </div>
          <div className="text-xs px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded">
            CN → KH
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors" title="Save">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors" title="Undo">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors" title="Redo">
            <RotateCw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[var(--border-default)] mx-1" />
          <button className="px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Export
          </button>
          <button className="p-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-56'}`}>
          {/* Sidebar Header */}
          <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            {!isSidebarCollapsed && <span className="text-xs font-semibold text-[var(--text-secondary)]">WORKSPACE</span>}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-[var(--bg-hover)] rounded transition-colors ml-auto"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Sidebar Items */}
          <nav className="flex-1 overflow-y-auto py-2">
            {[
              { id: 'dubbing', icon: Mic2, label: 'Dubbing Studio' },
              { id: 'voices', icon: Users, label: 'AI Voices' },
              { id: 'characters', icon: Users, label: 'Characters' },
              { id: 'translation', icon: Languages, label: 'Translation' },
              { id: 'subtitles', icon: Subtitles, label: 'Subtitles' },
              { id: 'audio', icon: Volume2, label: 'Audio Mixer' },
              { id: 'export', icon: Download, label: 'Export' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                  activeSection === item.id
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[var(--border-subtle)]">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded transition-colors">
              <Settings className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="text-sm">Settings</span>}
            </button>
          </div>
        </div>

        {/* Video Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Preview Area */}
          <div className="flex-1 flex items-center justify-center bg-black/30 p-6">
            <div className="w-full max-w-5xl aspect-video bg-[var(--bg-elevated)] rounded-lg overflow-hidden shadow-2xl border border-[var(--border-default)] flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
                <p className="text-[var(--text-secondary)]">Upload a video to start dubbing</p>
                <button className="mt-4 px-6 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors">
                  Upload Video
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-56 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] p-4">
            <div className="space-y-2">
              {['V1 Video', 'A1 Khmer Voice', 'A2 Original Vox', 'A3 BGM / FX', 'S1 Subtitles'].map((track, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-32 text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <FileVideo className="w-3 h-3" />
                    {track}
                  </div>
                  <div className="flex-1 h-10 bg-[var(--bg-elevated)] rounded border border-[var(--border-default)]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inspector Panel */}
        <div className="w-80 bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
              Inspector
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-secondary)] mb-2">Project</div>
                <div className="text-sm">Perfect World</div>
              </div>
              <div className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-secondary)] mb-2">Resolution</div>
                <div className="text-sm">1920 × 1080</div>
              </div>
              <div className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
                <div className="text-xs text-[var(--text-secondary)] mb-2">Duration</div>
                <div className="text-sm">00:21:45</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
