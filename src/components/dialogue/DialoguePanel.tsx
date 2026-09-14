import React from 'react';
import { Play, MoreVertical, ChevronDown } from 'lucide-react';
import { TimelineSegment } from '../../types';

interface DialoguePanelProps {
  segments: TimelineSegment[];
  selectedIndex: number;
  onSelectSegment: (index: number) => void;
  onPlaySegment?: (index: number) => void;
  onVoiceChange?: (index: number, voiceId: string) => void;
  voices?: Array<{ id: string; label: string; gender: 'male' | 'female' }>;
}

// Speaker color mapping (matching DubberBang reference)
const getSpeakerColor = (speakerIndex: number) => {
  const colors = [
    { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', badge: 'bg-emerald-500' }, // Speaker 1 - Green
    { bg: 'bg-sky-500/20', border: 'border-sky-500/50', text: 'text-sky-400', badge: 'bg-sky-500' },             // Speaker 2 - Blue
    { bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-400', badge: 'bg-pink-500' },         // Speaker 3 - Pink
    { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', badge: 'bg-orange-500' }, // Speaker 4 - Orange
    { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', badge: 'bg-yellow-500' }, // Speaker 5 - Yellow
    { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', badge: 'bg-purple-500' }, // Speaker 6 - Purple
    { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', badge: 'bg-cyan-500' },         // Speaker 7 - Cyan
    { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400', badge: 'bg-rose-500' },         // Speaker 8 - Rose
  ];
  return colors[speakerIndex % colors.length];
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${secs.padStart(4, '0')}`;
}

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  segments,
  selectedIndex,
  onSelectSegment,
  onPlaySegment,
  onVoiceChange,
  voices = [],
}) => {
  return (
    <div className="w-[480px] bg-[#0a0e17] border-l border-sky-500/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 px-4 border-b border-white/[0.08] bg-[#0d1219] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-300">DIALOGUE</span>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              {segments.length} lines
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all">
            Add Pause
          </button>
          <button className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all">
            Edit
          </button>
          <button className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all">
            Detect
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="h-10 px-4 border-b border-white/[0.08] bg-[#0d1219] flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="w-8 flex-shrink-0">#</div>
        <div className="w-24 flex-shrink-0">START</div>
        <div className="w-24 flex-shrink-0">END</div>
        <div className="w-24 flex-shrink-0">SPEAKER</div>
        <div className="flex-1">TEXT</div>
        <div className="w-32 flex-shrink-0 text-center">VOICE</div>
        <div className="w-16 flex-shrink-0 text-center">ACTIONS</div>
      </div>

      {/* Dialogue Rows */}
      <div className="flex-1 overflow-y-auto">
        {segments.map((seg, idx) => {
          const isSelected = selectedIndex === idx;
          const speakerNum = parseInt(seg.speaker_id?.replace(/\D/g, '') || '1') - 1;
          const colorScheme = getSpeakerColor(speakerNum);
          const startTime = seg.start_time || 0;
          const endTime = seg.end_time || startTime + 2;

          return (
            <div
              key={idx}
              onClick={() => onSelectSegment(idx)}
              className={`px-4 py-3 border-b border-white/[0.04] flex items-center gap-3 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-sky-500/10 border-l-2 border-l-sky-400'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              {/* Checkbox + Index */}
              <div className="w-8 flex-shrink-0 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Start Time */}
              <div className="w-24 flex-shrink-0">
                <span className="text-xs font-mono text-slate-400">
                  {formatTime(startTime)}
                </span>
              </div>

              {/* End Time */}
              <div className="w-24 flex-shrink-0">
                <span className="text-xs font-mono text-slate-400">
                  {formatTime(endTime)}
                </span>
              </div>

              {/* Speaker Badge */}
              <div className="w-24 flex-shrink-0">
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${colorScheme.bg} ${colorScheme.border}`}
                >
                  <div className={`w-2 h-2 rounded-full ${colorScheme.badge}`} />
                  <span className={`text-xs font-bold ${colorScheme.text}`}>
                    Speaker {speakerNum + 1}
                  </span>
                </div>
              </div>

              {/* Dialogue Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">
                  {seg.khmer_translation || seg.chinese_text || 'No text'}
                </p>
              </div>

              {/* Voice Dropdown */}
              <div className="w-32 flex-shrink-0">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Voice selection logic
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-medium transition-all w-full"
                  >
                    <span className="text-sky-400">🎤</span>
                    <span className="flex-1 text-left truncate">Male 1</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Play Button */}
              <div className="w-8 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySegment?.(idx);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-sky-500/20 border border-white/[0.08] hover:border-sky-500/40 text-slate-400 hover:text-sky-400 transition-all"
                  title="Play segment"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* More Actions */}
              <div className="w-8 flex-shrink-0">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                  title="More actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="h-14 px-4 border-t border-white/[0.08] bg-[#0d1219] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all">
            🔄 Rebuild
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all">
            ↻ Redo
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all">
            📋 Subtitle
          </button>
          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-lg shadow-sky-600/30 active:scale-95">
            🎬 Generate Video
          </button>
        </div>
      </div>
    </div>
  );
};
