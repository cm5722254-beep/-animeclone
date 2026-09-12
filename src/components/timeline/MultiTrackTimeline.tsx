import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Scan,
  Magnet,
  ZoomIn,
  ZoomOut,
  CheckCheck,
  RefreshCw,
  Scissors,
  Trash2,
  Copy,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MoveHorizontal,
  Plus,
  Radio,
  Eye,
  EyeOff,
  LayoutList,
  Sparkles,
} from 'lucide-react';
import { TimelineSegment } from '../../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: TimelineSegment[];
  onChangeSegments?: (segments: TimelineSegment[]) => void;
  selectedSegmentIndex: number;
  onSelectSegment: (index: number) => void;
  onSeek: (time: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onScan: () => void;
  isScanning?: boolean;
  onAssemble: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}.${ms}`;
  return `${pad(m)}:${pad(s)}.${ms}`;
}

export const MultiTrackTimeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  segments,
  onChangeSegments,
  selectedSegmentIndex,
  onSelectSegment,
  onSeek,
  isPlaying = false,
  onTogglePlay,
  onScan,
  isScanning = false,
  onAssemble,
  zoom,
  onZoomChange,
  onShowToast,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Editor states
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    type: 'move' | 'trim-start' | 'trim-end';
    index: number;
    initialMouseX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  // Track mute / hide states
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({
    V1: false,
    A1: false,
    A2: false,
    A3: false,
    S1: false,
  });

  const totalDur = duration > 0 ? duration : 60;
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDur) * 100));

  // Compute time from mouse event on timeline canvas
  const getTimeFromEvent = useCallback(
    (clientX: number) => {
      if (!canvasRef.current) return 0;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      return ratio * totalDur;
    },
    [totalDur]
  );

  // Ruler & Playhead Scrubbing Handlers
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsScrubbing(true);
    const t = getTimeFromEvent(e.clientX);
    onSeek(t);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const t = getTimeFromEvent(e.clientX);
      onSeek(t);
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, getTimeFromEvent, onSeek]);

  // Audio Clip Dragging & Trimming
  useEffect(() => {
    if (!dragInfo || !canvasRef.current || !onChangeSegments) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragInfo.initialMouseX;
      const deltaTime = (deltaX / rect.width) * totalDur;

      const updated = [...segments];
      const target = { ...updated[dragInfo.index] };
      const clipLen = dragInfo.initialEnd - dragInfo.initialStart;

      if (dragInfo.type === 'move') {
        let newStart = Math.max(0, dragInfo.initialStart + deltaTime);

        // Snap to Playhead or other clips
        if (snapEnabled) {
          const snapThresholdSec = 0.35 * (100 / zoom);
          if (Math.abs(newStart - currentTime) < snapThresholdSec) {
            newStart = currentTime;
          } else {
            // Check snap against other segments
            for (let i = 0; i < updated.length; i++) {
              if (i === dragInfo.index) continue;
              const s = updated[i];
              if (Math.abs(newStart - s.end_time) < snapThresholdSec) {
                newStart = s.end_time;
                break;
              }
              if (Math.abs(newStart + clipLen - s.start_time) < snapThresholdSec) {
                newStart = s.start_time - clipLen;
                break;
              }
            }
          }
        }

        const newEnd = Math.min(totalDur, newStart + clipLen);
        target.start_time = Number(newStart.toFixed(2));
        target.end_time = Number(newEnd.toFixed(2));
      } else if (dragInfo.type === 'trim-start') {
        let newStart = Math.max(0, Math.min(dragInfo.initialEnd - 0.3, dragInfo.initialStart + deltaTime));
        if (snapEnabled && Math.abs(newStart - currentTime) < 0.25) {
          newStart = currentTime;
        }
        target.start_time = Number(newStart.toFixed(2));
      } else if (dragInfo.type === 'trim-end') {
        let newEnd = Math.max(dragInfo.initialStart + 0.3, Math.min(totalDur, dragInfo.initialEnd + deltaTime));
        if (snapEnabled && Math.abs(newEnd - currentTime) < 0.25) {
          newEnd = currentTime;
        }
        target.end_time = Number(newEnd.toFixed(2));
      }

      updated[dragInfo.index] = target;
      onChangeSegments(updated);
    };

    const handleMouseUp = () => {
      setDragInfo(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragInfo, totalDur, segments, snapEnabled, currentTime, onChangeSegments, zoom]);

  // Clip Actions: Split at playhead
  const handleSplitClip = () => {
    if (!onChangeSegments || segments.length === 0) return;
    const activeSegIdx =
      selectedSegmentIndex >= 0 &&
      selectedSegmentIndex < segments.length &&
      currentTime > segments[selectedSegmentIndex].start_time + 0.3 &&
      currentTime < segments[selectedSegmentIndex].end_time - 0.3
        ? selectedSegmentIndex
        : segments.findIndex((s) => currentTime > s.start_time + 0.3 && currentTime < s.end_time - 0.3);

    if (activeSegIdx === -1) {
      onShowToast?.('⚠️ ដាក់ Playhead ចំកណ្ដាលឃ្លាសំឡេងដើម្បីកាត់ (Split)', 'info');
      return;
    }

    const seg = segments[activeSegIdx];
    const cutTime = Number(currentTime.toFixed(2));

    const seg1: TimelineSegment = {
      ...seg,
      end_time: cutTime,
    };

    const seg2: TimelineSegment = {
      ...seg,
      line_index: seg.line_index + 1,
      start_time: cutTime,
      end_time: seg.end_time,
      audioUrl: undefined, // Fresh segment for new voice / cut
    };

    const updated = [
      ...segments.slice(0, activeSegIdx),
      seg1,
      seg2,
      ...segments.slice(activeSegIdx + 1),
    ];

    onChangeSegments(updated);
    onSelectSegment(activeSegIdx + 1);
    onShowToast?.(`✂️ បានកាត់ឃ្លាសំឡេងត្រង់ ${cutTime}s ជាពីរជោគជ័យ!`, 'success');
  };

  // Clip Actions: Delete clip
  const handleDeleteClip = () => {
    if (!onChangeSegments || segments.length === 0) return;
    if (selectedSegmentIndex < 0 || selectedSegmentIndex >= segments.length) {
      onShowToast?.('សូមជ្រើសរើសឃ្លាសំឡេងដែលចង់លុប', 'info');
      return;
    }

    const updated = segments.filter((_, idx) => idx !== selectedSegmentIndex);
    onChangeSegments(updated);
    onSelectSegment(Math.max(0, selectedSegmentIndex - 1));
    onShowToast?.('🗑️ បានលុបឃ្លាសំឡេងចេញពី Timeline រួចរាល់!', 'success');
  };

  // Clip Actions: Duplicate clip
  const handleDuplicateClip = () => {
    if (!onChangeSegments || segments.length === 0) return;
    if (selectedSegmentIndex < 0 || selectedSegmentIndex >= segments.length) return;

    const seg = segments[selectedSegmentIndex];
    const dur = seg.end_time - seg.start_time;
    const newStart = Number((seg.end_time + 0.2).toFixed(2));
    const newEnd = Number((newStart + dur).toFixed(2));

    const newSeg: TimelineSegment = {
      ...seg,
      start_time: Math.min(totalDur - dur, newStart),
      end_time: Math.min(totalDur, newEnd),
    };

    const updated = [
      ...segments.slice(0, selectedSegmentIndex + 1),
      newSeg,
      ...segments.slice(selectedSegmentIndex + 1),
    ];

    onChangeSegments(updated);
    onSelectSegment(selectedSegmentIndex + 1);
    onShowToast?.('📋 បានចម្លង (Duplicate) ឃ្លាសំឡេងជោគជ័យ!', 'success');
  };

  // Auto-organize & de-overlap all dialogue clips seamlessly
  const handleAutoDeoverlap = () => {
    if (!onChangeSegments || segments.length === 0) return;
    
    // 1. Sort segments chronologically
    const sorted = [...segments].sort((a, b) => (a.start_time || 0) - (b.start_time || 0));
    
    // 2. Adjust overlapping segments so each clip starts cleanly with safety gap
    let adjustedCount = 0;
    const cleaned: TimelineSegment[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const current = { ...sorted[i] };
      const curStart = Math.max(0, current.start_time || 0);
      const curDur = Math.max(0.6, (current.end_time || curStart + 2.0) - curStart);

      if (cleaned.length > 0) {
        const prev = cleaned[cleaned.length - 1];
        // If current segment collides or overlaps with previous clip (or gap < 0.25s)
        if (curStart < prev.end_time + 0.2) {
          adjustedCount++;
          // Shift current clip to start cleanly after the previous one with a 0.25s natural pause
          const newStart = Number((prev.end_time + 0.25).toFixed(2));
          current.start_time = newStart;
          current.end_time = Number((newStart + curDur).toFixed(2));
        } else {
          current.start_time = Number(curStart.toFixed(2));
          current.end_time = Number((curStart + curDur).toFixed(2));
        }
      } else {
        current.start_time = Number(curStart.toFixed(2));
        current.end_time = Number((curStart + curDur).toFixed(2));
      }

      cleaned.push(current);
    }

    onChangeSegments(cleaned);
    onShowToast?.(
      adjustedCount > 0
        ? `✨ បានរៀបចំឃ្លាសំឡេង ${cleaned.length} ឃ្លា និងដោះស្រាយឃ្លាជាន់គ្នា ${adjustedCount} ឃ្លាដោយជោគជ័យ!`
        : `✨ ឃ្លាសំឡេងទាំងអស់មានរបៀបរៀបរយត្រឹមត្រូវ គ្មានការជាន់គ្នាឡើយ!`,
      'success'
    );
  };

  const toggleTrackMute = (trackId: string) => {
    setMutedTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  return (
    <div className="h-68 bg-[#07090e] border-t border-white/[0.08] flex flex-col overflow-hidden select-none">
      {/* Pro NLE Timeline Toolbar */}
      <div className="h-10 px-3 bg-[#0a0e17] border-b border-white/[0.08] flex items-center justify-between text-xs">
        {/* Left Controls: Transport & Pro Editing Tools matching Image 3 */}
        <div className="flex items-center gap-2">
          {/* Split (Cut) Button */}
          <button
            onClick={handleSplitClip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Split Clip at Playhead"
          >
            <Scissors className="w-3.5 h-3.5 text-sky-400" />
            <span>Split</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDeleteClip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 border border-white/[0.08] hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-medium transition-all"
            title="Delete Selected Clip"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Magnet / Snap Button */}
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              snapEnabled
                ? 'bg-sky-500/20 border-sky-400/50 text-sky-300 shadow-sm'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
            }`}
            title="Toggle Magnet Snap"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Snap</span>
          </button>

          {/* Markers / Auto-Arrange */}
          <button
            onClick={handleAutoDeoverlap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs font-medium transition-all"
            title="Auto-Arrange & Align Dialogue Clips"
          >
            <LayoutList className="w-3.5 h-3.5 text-indigo-400" />
            <span>Markers</span>
          </button>
        </div>

        {/* Right Controls: AI Scan, Zoom Slider, and Assemble Video */}
        <div className="flex items-center gap-3">
          {/* Zoom Slider with Icons */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <ZoomOut
              className="w-3.5 h-3.5 cursor-pointer hover:text-white"
              onClick={() => onZoomChange(Math.max(60, zoom - 20))}
            />
            <input
              type="range"
              min="60"
              max="260"
              value={zoom}
              onChange={(e) => onZoomChange(parseInt(e.target.value, 10))}
              className="w-24 h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
            />
            <ZoomIn
              className="w-3.5 h-3.5 cursor-pointer hover:text-white"
              onClick={() => onZoomChange(Math.min(260, zoom + 20))}
            />
          </div>

          {/* Assemble Video Action Button */}
          <button
            onClick={onAssemble}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/30 active:scale-95"
            title="Assemble Video"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Assemble Video</span>
          </button>
        </div>
      </div>

      {/* Multi-Track Stage */}
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden relative">
        {/* Left Track Headers (Sticky) */}
        <div className="w-40 shrink-0 bg-[#080c14] border-r border-white/[0.08] sticky left-0 z-30 flex flex-col shadow-xl">
          <div className="h-7 bg-[#060910] border-b border-white/[0.08] flex items-center px-2.5 justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              TRACKS
            </span>
            <span className="text-[9px] text-slate-500">M / S</span>
          </div>

          {/* V1 Header */}
          <div className="h-11 px-2.5 border-b border-white/[0.06] flex items-center justify-between bg-[#080c14]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">
                V1
              </span>
              <span className="text-xs font-medium text-slate-200 truncate">Video Track</span>
            </div>
            <button
              onClick={() => toggleTrackMute('V1')}
              className={`p-1 rounded text-[10px] ${
                mutedTracks['V1'] ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-white'
              }`}
              title="បិទ/បើក មើលរូបភាពវីដេអូ"
            >
              {mutedTracks['V1'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>

          {/* A1 Header (Khmer Voice) */}
          <div className="h-11 px-2.5 border-b border-white/[0.06] flex items-center justify-between bg-[#090e1a]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                A1
              </span>
              <span className="text-xs font-semibold text-indigo-300 truncate">Khmer Voice</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleTrackMute('A1')}
                className={`p-1 rounded text-[10px] ${
                  mutedTracks['A1'] ? 'text-rose-400 bg-rose-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title="Mute សំឡេងខ្មែរ"
              >
                {mutedTracks['A1'] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* A2 Header (Original Audio) */}
          <div className="h-11 px-2.5 border-b border-white/[0.06] flex items-center justify-between bg-[#080c14]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                A2
              </span>
              <span className="text-xs font-medium text-slate-300 truncate">Original Vox</span>
            </div>
            <button
              onClick={() => toggleTrackMute('A2')}
              className={`p-1 rounded text-[10px] ${
                mutedTracks['A2'] ? 'text-rose-400 bg-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mutedTracks['A2'] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>

          {/* A3 Header (BGM & FX) */}
          <div className="h-11 px-2.5 border-b border-white/[0.06] flex items-center justify-between bg-[#090e1a]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                A3
              </span>
              <span className="text-xs font-medium text-slate-300 truncate">BGM / FX</span>
            </div>
            <button
              onClick={() => toggleTrackMute('A3')}
              className={`p-1 rounded text-[10px] ${
                mutedTracks['A3'] ? 'text-rose-400 bg-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mutedTracks['A3'] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>

          {/* S1 Header (Subtitles) */}
          <div className="h-11 px-2.5 border-b border-white/[0.06] flex items-center justify-between bg-[#080c14]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono">
                S1
              </span>
              <span className="text-xs font-medium text-slate-300 truncate">Subtitles</span>
            </div>
            <button
              onClick={() => toggleTrackMute('S1')}
              className={`p-1 rounded text-[10px] ${
                mutedTracks['S1'] ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mutedTracks['S1'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Right Canvas: Scrubbable Ruler & Draggable Tracks */}
        <div
          ref={canvasRef}
          className="flex-1 flex flex-col relative bg-[#0b0f19]"
          style={{ minWidth: `${1400 * (zoom / 100)}px` }}
        >
          {/* Draggable & Scrubbable Time Ruler */}
          <div
            ref={rulerRef}
            onMouseDown={handleRulerMouseDown}
            className="h-7 bg-[#070a12] border-b border-white/[0.08] relative cursor-ew-resize select-none overflow-hidden hover:bg-[#0a0f1c] transition-colors"
            title="ចុច ឬអូសកណ្តុរលើបន្ទាត់ពេលវេលានេះដើម្បីរំកិលវីដេអូភ្លាមៗ (Interactive Ruler Scrubbing)"
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-white/[0.08] pl-1 text-[9px] font-mono text-slate-400 pointer-events-none flex flex-col justify-between py-0.5"
                style={{ left: `${(i / 24) * 100}%` }}
              >
                <span>{formatTimecode((i / 24) * totalDur)}</span>
                <div className="h-1.5 w-[1px] bg-white/20" />
              </div>
            ))}
          </div>

          {/* Interactive Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-sky-400 shadow-[0_0_12px_#38bdf8] pointer-events-none z-40 transition-none"
            style={{ left: `${playheadPercent}%` }}
          >
            {/* Playhead Handle Header */}
            <div className="w-4 h-5 bg-sky-400 -translate-x-[7px] [clip-path:polygon(0%_0%,100%_0%,100%_65%,50%_100%,0%_65%)] shadow-lg" />
          </div>

          {/* ================= TRACK LANES ================= */}

          {/* V1 Lane: Movie Video Track */}
          <div className="h-11 border-b border-white/[0.06] relative bg-[#0c111e]/60 flex items-center px-1">
            <div className="absolute top-1 bottom-1 left-0 w-[96%] bg-gradient-to-r from-sky-900/60 via-sky-800/40 to-sky-700/50 border border-sky-500/40 rounded-md px-3 flex items-center justify-between text-xs text-sky-200 font-medium shadow-sm">
              <span className="truncate">🎬 វីដេអូដើម (Master Movie Track - Full HD)</span>
              <span className="text-[10px] font-mono text-sky-400/80">{formatTimecode(totalDur)}</span>
            </div>
          </div>

          {/* A1 Lane: Khmer Voice Dialogue Clips (DRAGGABLE & RESIZABLE) */}
          <div className="h-11 border-b border-white/[0.06] relative bg-[#090e1a]/80">
            {segments.map((seg, idx) => {
              const start = seg.start_time || 0;
              const end = Math.max(start + 0.3, seg.end_time || start + 2.5);
              const leftPct = (start / totalDur) * 100;
              const widthPct = Math.max(1.5, ((end - start) / totalDur) * 100);
              const isFemale = seg.gender === 'female' || (seg.speaker_role && seg.speaker_role.includes('female'));
              const isSelected = selectedSegmentIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSegment(idx);
                    onSeek(start);
                  }}
                  onMouseDown={(e) => {
                    // Only start move if not clicking edge trim handle
                    const target = e.target as HTMLElement;
                    if (target.dataset.trimHandle) return;
                    e.stopPropagation();
                    onSelectSegment(idx);
                    setDragInfo({
                      type: 'move',
                      index: idx,
                      initialMouseX: e.clientX,
                      initialStart: start,
                      initialEnd: end,
                    });
                  }}
                  className={`group absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[11px] font-medium text-white shadow cursor-grab active:cursor-grabbing truncate transition-all select-none ${
                    isFemale
                      ? 'bg-gradient-to-r from-pink-600/90 to-rose-500/90 border border-pink-400/60'
                      : 'bg-gradient-to-r from-indigo-600/90 to-sky-500/90 border border-indigo-400/60'
                  } ${
                    isSelected
                      ? 'ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.4)] brightness-125 z-20'
                      : 'hover:brightness-115 z-10'
                  }`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  title={`${seg.speaker_name || 'តួអង្គ'}: "${seg.khmer_translation || seg.chinese_text || ''}" (${start}s - ${end}s)`}
                >
                  {/* Left Trim Handle */}
                  <div
                    data-trim-handle="start"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectSegment(idx);
                      setDragInfo({
                        type: 'trim-start',
                        index: idx,
                        initialMouseX: e.clientX,
                        initialStart: start,
                        initialEnd: end,
                      });
                    }}
                    className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/40 hover:bg-white cursor-w-resize rounded-l-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    title="ទាញដើម្បីកាត់បន្ថយ ឬបន្ថែមពេលវេលាចាប់ផ្តើម (Trim In)"
                  >
                    <div className="w-[1.5px] h-3 bg-white/70" />
                  </div>

                  {/* Clip Label & Dialogue Text */}
                  <div className="flex items-center gap-1.5 truncate pointer-events-none px-1">
                    <span className="font-bold text-[10px] px-1 rounded bg-black/30 text-white shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="truncate font-medium text-white">
                      {seg.khmer_translation || seg.chinese_text || 'សំឡេង'}
                    </span>
                  </div>

                  {/* Right Trim Handle */}
                  <div
                    data-trim-handle="end"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelectSegment(idx);
                      setDragInfo({
                        type: 'trim-end',
                        index: idx,
                        initialMouseX: e.clientX,
                        initialStart: start,
                        initialEnd: end,
                      });
                    }}
                    className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/40 hover:bg-white cursor-e-resize rounded-r-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    title="ទាញដើម្បីកាត់បន្ថយ ឬបន្ថែមពេលវេលាបញ្ចប់ (Trim Out)"
                  >
                    <div className="w-[1.5px] h-3 bg-white/70" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* A2 Lane: Original Audio Waveform */}
          <div className="h-11 border-b border-white/[0.06] relative bg-[#0c111e]/60 flex items-center px-1">
            <div className="absolute top-1 bottom-1 left-0 w-[96%] bg-emerald-500/10 border border-emerald-500/25 rounded-md px-3 flex items-center justify-between text-xs text-emerald-400 font-medium">
              <span className="truncate">🎙️ រលកសំឡេងដើម (Original Vocal Stem)</span>
              <span className="text-[10px] font-mono text-emerald-500/70">48kHz • Stereo</span>
            </div>
          </div>

          {/* A3 Lane: Preserved BGM & Sound Effects */}
          <div className="h-11 border-b border-white/[0.06] relative bg-[#090e1a]/80 flex items-center px-1">
            <div className="absolute top-1 bottom-1 left-0 w-[96%] bg-amber-500/10 border border-amber-500/25 rounded-md px-3 flex items-center justify-between text-xs text-amber-400 font-medium">
              <span className="truncate">🎵 តន្ត្រីផ្ទៃក្រោយ និងសំឡេង Effects (BGM & Foley Preserved)</span>
              <span className="text-[10px] font-mono text-amber-500/70">Demucs v4 AI Stem</span>
            </div>
          </div>

          {/* S1 Lane: Subtitles Track */}
          <div className="h-11 border-b border-white/[0.06] relative bg-[#0c111e]/60">
            {segments.map((seg, idx) => {
              const start = seg.start_time || 0;
              const end = Math.max(start + 0.3, seg.end_time || start + 2.5);
              const leftPct = (start / totalDur) * 100;
              const widthPct = Math.max(1.5, ((end - start) / totalDur) * 100);
              const isSelected = selectedSegmentIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectSegment(idx);
                    onSeek(start);
                  }}
                  className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-medium cursor-pointer truncate transition-all ${
                    isSelected
                      ? 'bg-purple-600/70 border border-purple-300 text-white ring-1 ring-purple-300 z-10'
                      : 'bg-purple-500/20 border border-purple-400/30 text-purple-300 hover:bg-purple-500/30'
                  }`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  title={`Subtitle #${idx + 1}: ${seg.khmer_translation || seg.chinese_text || ''}`}
                >
                  <span className="truncate">
                    CC #{idx + 1}: {seg.khmer_translation || seg.chinese_text || ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
