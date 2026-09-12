import React, { useRef } from 'react';
import { Scan, Magnet, ZoomIn, ZoomOut, CheckCheck, RefreshCw } from 'lucide-react';
import { TimelineSegment } from '../../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: TimelineSegment[];
  selectedSegmentIndex: number;
  onSelectSegment: (index: number) => void;
  onSeek: (time: number) => void;
  onScan: () => void;
  isScanning?: boolean;
  onAssemble: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
}

function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(m)}:${pad(s)}`;
}

export const MultiTrackTimeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  segments,
  selectedSegmentIndex,
  onSelectSegment,
  onSeek,
  onScan,
  isScanning = false,
  onAssemble,
  zoom,
  onZoomChange,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const totalDur = duration > 0 ? duration : 60;

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * totalDur);
  };

  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDur) * 100));

  return (
    <div className="h-64 bg-[#080c14] border-t border-white/[0.08] flex flex-col overflow-hidden select-none">
      {/* Timeline Toolbar */}
      <div className="h-9 px-3.5 bg-[#0b0f19] border-b border-white/[0.08] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-ui">
            TIMELINE TRACKS
          </span>
          <button
            onClick={onScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-[11px] transition-colors border border-sky-500/30 disabled:opacity-50"
            title="ស្កេន និងស្រង់ឃ្លាសន្ទនាទាំងអស់ពីរឿងដោយ AI"
          >
            {isScanning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            ) : (
              <Scan className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>{isScanning ? 'កំពុងស្កេន AI...' : 'ស្កេនឃ្លាសន្ទនា (Scan)'}</span>
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded bg-sky-500/10 text-sky-400 text-[11px] border border-sky-500/20"
            title="Snap to clips"
          >
            <Magnet className="w-3 h-3" />
            <span>Snap: ON</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ZoomOut className="w-3.5 h-3.5" />
            <input
              type="range"
              min="60"
              max="240"
              value={zoom}
              onChange={(e) => onZoomChange(parseInt(e.target.value, 10))}
              className="w-20 h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
            />
            <ZoomIn className="w-3.5 h-3.5" />
          </div>

          <button
            onClick={onAssemble}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors shadow-sm"
            title="ប្រមូលផ្តុំកាត់តសំឡេងខ្មែរទាំងអស់ចូលវីដេអូ"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Assemble Video</span>
          </button>
        </div>
      </div>

      {/* Tracks Scroll Stage */}
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden relative">
        {/* Left Track Headers */}
        <div className="w-36 shrink-0 bg-[#090d16] border-r border-white/[0.08] sticky left-0 z-20 flex flex-col">
          <div className="h-6 bg-[#080c14] border-b border-white/[0.08]" />

          {/* V1 Header */}
          <div className="h-10 px-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">
                V1
              </span>
              <span className="text-xs font-medium text-slate-200 truncate max-w-[65px]">Video</span>
            </div>
            <button className="text-[9px] font-bold text-slate-400 hover:text-white px-1">L</button>
          </div>

          {/* A1 Header */}
          <div className="h-10 px-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                A1
              </span>
              <span className="text-xs font-medium text-slate-200 truncate max-w-[65px]">Khmer Voice</span>
            </div>
            <div className="flex gap-1 text-[9px] font-bold text-slate-400">
              <button className="hover:text-white">M</button>
              <button className="hover:text-white">S</button>
            </div>
          </div>

          {/* A2 Header */}
          <div className="h-10 px-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                A2
              </span>
              <span className="text-xs font-medium text-slate-200 truncate max-w-[65px]">Original</span>
            </div>
            <button className="text-[9px] font-bold text-slate-400 hover:text-white">M</button>
          </div>

          {/* A3 Header */}
          <div className="h-10 px-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                A3
              </span>
              <span className="text-xs font-medium text-slate-200 truncate max-w-[65px]">BGM / FX</span>
            </div>
            <button className="text-[9px] font-bold text-slate-400 hover:text-white">M</button>
          </div>

          {/* S1 Header */}
          <div className="h-10 px-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono">
                S1
              </span>
              <span className="text-xs font-medium text-slate-200 truncate max-w-[65px]">Subtitles</span>
            </div>
            <button className="text-[9px] font-bold text-slate-400 hover:text-white">H</button>
          </div>
        </div>

        {/* Right Canvas */}
        <div
          className="flex-1 flex flex-col relative bg-[#0e1422]"
          style={{ minWidth: `${1200 * (zoom / 100)}px` }}
        >
          {/* Time Ruler */}
          <div
            ref={rulerRef}
            onClick={handleRulerClick}
            className="h-6 bg-[#080c14] border-b border-white/[0.08] relative cursor-pointer"
          >
            {Array.from({ length: 13 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-white/[0.08] pl-1 text-[9px] font-mono text-slate-400 pointer-events-none"
                style={{ left: `${(i / 12) * 100}%` }}
              >
                {formatTimecode((i / 12) * totalDur)}
              </div>
            ))}
          </div>

          {/* Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-sky-400 shadow-[0_0_8px_#38bdf8] pointer-events-none z-30 transition-all duration-75"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="w-3.5 h-4 bg-sky-400 -translate-x-[6px] [clip-path:polygon(0%_0%,100%_0%,100%_70%,50%_100%,0%_70%)]" />
          </div>

          {/* Track Lanes */}
          {/* V1 Lane */}
          <div className="h-10 border-b border-white/[0.06] relative bg-[#0e1422]">
            <div className="absolute top-1 bottom-1 left-0 w-[95%] bg-gradient-to-r from-sky-600/70 to-sky-500/80 border border-sky-400/50 rounded px-2.5 flex items-center text-xs text-white font-medium shadow-sm">
              Movie Video Track
            </div>
          </div>

          {/* A1 Lane: Dialogue clips */}
          <div className="h-10 border-b border-white/[0.06] relative bg-[#0a0f1a]">
            {segments.map((seg, idx) => {
              const start = seg.start_time || 0;
              const end = seg.end_time || start + 2.5;
              const leftPct = (start / totalDur) * 100;
              const widthPct = Math.max(3, ((end - start) / totalDur) * 100);
              const isFemale = seg.gender === 'female' || (seg.speaker_role && seg.speaker_role.includes('female'));
              const isSelected = selectedSegmentIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectSegment(idx);
                    onSeek(start);
                  }}
                  className={`absolute top-1 bottom-1 rounded px-2 flex items-center text-[11px] font-medium text-white shadow cursor-pointer truncate transition-all ${
                    isFemale
                      ? 'bg-gradient-to-r from-pink-600/80 to-rose-500/80 border border-rose-400/50'
                      : 'bg-gradient-to-r from-indigo-600/80 to-sky-500/80 border border-indigo-400/50'
                  } ${isSelected ? 'ring-2 ring-white brightness-125 z-10' : 'hover:brightness-110'}`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  title={`${seg.speaker_name || 'តួអង្គ'}: ${seg.khmer_translation || ''}`}
                >
                  <span className="truncate">{seg.speaker_name || 'តួ'}: {seg.khmer_translation || seg.chinese_text || ''}</span>
                </div>
              );
            })}
          </div>

          {/* A2 Lane: Waveform */}
          <div className="h-10 border-b border-white/[0.06] relative bg-[#0e1422]">
            <div className="absolute top-1 bottom-1 left-0 w-[95%] bg-emerald-500/15 border border-emerald-500/30 rounded px-2.5 flex items-center text-xs text-emerald-400 font-medium">
              Original Audio Waveform
            </div>
          </div>

          {/* A3 Lane: BGM */}
          <div className="h-10 border-b border-white/[0.06] relative bg-[#0a0f1a]">
            <div className="absolute top-1 bottom-1 left-0 w-[95%] bg-amber-500/15 border border-amber-500/30 rounded px-2.5 flex items-center text-xs text-amber-400 font-medium">
              Preserved Background Music & SFX
            </div>
          </div>

          {/* S1 Lane: Subtitles */}
          <div className="h-10 border-b border-white/[0.06] relative bg-[#0e1422]">
            {segments.map((seg, idx) => {
              const start = seg.start_time || 0;
              const end = seg.end_time || start + 2.5;
              const leftPct = (start / totalDur) * 100;
              const widthPct = Math.max(3, ((end - start) / totalDur) * 100);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectSegment(idx);
                    onSeek(start);
                  }}
                  className="absolute top-1 bottom-1 bg-purple-500/20 border border-purple-400/40 rounded px-2 flex items-center text-[10px] text-purple-200 cursor-pointer hover:brightness-110 truncate"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                >
                  Sub #{idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
