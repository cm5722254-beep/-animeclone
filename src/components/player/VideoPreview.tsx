import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Camera, Sparkles } from 'lucide-react';
import { VideoEffects, SubtitleStyle } from '../../types';

interface VideoPreviewProps {
  src: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  playbackRate: number;
  currentSubtitle?: string;
  videoEffects?: VideoEffects;
  subtitleStyle?: SubtitleStyle;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (dur: number) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  onStep: (delta: number) => void;
  onOpenThumbnailStudio?: () => void;
}

function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  src,
  currentTime,
  duration,
  isPlaying,
  isMuted,
  playbackRate,
  currentSubtitle,
  videoEffects,
  subtitleStyle,
  videoRef: externalVideoRef,
  onTimeUpdate,
  onDurationChange,
  onTogglePlay,
  onToggleMute,
  onRateChange,
  onStep,
  onOpenThumbnailStudio,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || localVideoRef;
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying && v.paused) {
      v.play().catch(() => {});
    } else if (!isPlaying && !v.paused) {
      v.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (Math.abs(v.currentTime - currentTime) > 0.3) {
      v.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
  }, [playbackRate]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      frameRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Compute CSS filter from effects
  const filterString = videoEffects
    ? [
        `brightness(${videoEffects.brightness}%)`,
        `contrast(${videoEffects.contrast}%)`,
        `saturate(${videoEffects.saturation}%)`,
        `sepia(${videoEffects.sepia}%)`,
        videoEffects.blur > 0 ? `blur(${videoEffects.blur}px)` : '',
        videoEffects.lutPreset === 'teal_orange' ? 'hue-rotate(15deg) contrast(110%)' : '',
        videoEffects.lutPreset === 'warm_film' ? 'sepia(25%) saturate(120%)' : '',
        videoEffects.lutPreset === 'moody_noir' ? 'grayscale(80%) contrast(140%)' : '',
        videoEffects.lutPreset === 'vibrant_anime' ? 'saturate(150%) contrast(115%)' : '',
      ]
        .filter(Boolean)
        .join(' ')
    : 'none';

  const aspectClass =
    videoEffects?.aspectRatio === '9:16'
      ? 'aspect-[9/16] max-w-[340px]'
      : videoEffects?.aspectRatio === '1:1'
      ? 'aspect-square max-w-[460px]'
      : videoEffects?.aspectRatio === '4:3'
      ? 'aspect-[4/3] max-w-[620px]'
      : 'aspect-video w-full';

  const subtitlePositionClass =
    subtitleStyle?.position === 'top'
      ? 'top-6'
      : subtitleStyle?.position === 'center'
      ? 'top-1/2 -translate-y-1/2'
      : 'bottom-6';

  return (
    <div className="flex-1 bg-[#05070c] flex flex-col items-center justify-center p-3 relative overflow-hidden">
      {/* Screen Frame */}
      <div
        ref={frameRef}
        className={`relative ${aspectClass} max-h-[calc(100%-48px)] bg-black rounded-lg shadow-2xl flex items-center justify-center overflow-hidden border border-white/[0.06] transition-all`}
      >
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          style={{ filter: filterString }}
          onTimeUpdate={() => {
            if (videoRef.current) onTimeUpdate(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) onDurationChange(videoRef.current.duration);
          }}
          className="w-full h-full object-contain transition-all duration-150"
        />

        {/* Dynamic Subtitle Overlay */}
        {currentSubtitle && (
          <div className={`absolute ${subtitlePositionClass} left-[5%] right-[5%] text-center pointer-events-none z-10 animate-in fade-in duration-100`}>
            <p
              className="inline-block px-3 py-1 rounded shadow-xl leading-relaxed"
              style={{
                fontSize: subtitleStyle ? `${subtitleStyle.fontSize}px` : '18px',
                fontFamily: subtitleStyle ? subtitleStyle.fontFamily : 'Kantumruy Pro',
                color: subtitleStyle ? subtitleStyle.textColor : '#fef08a',
                backgroundColor: subtitleStyle ? subtitleStyle.backgroundColor : 'rgba(0,0,0,0.75)',
                textShadow:
                  subtitleStyle && subtitleStyle.strokeWidth > 0
                    ? `0 0 ${subtitleStyle.strokeWidth * 2}px ${subtitleStyle.strokeColor}`
                    : '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {currentSubtitle}
            </p>
          </div>
        )}
      </div>

      {/* Floating Translucent Transport Bar */}
      <div className="w-full max-w-2xl bg-[#0b0f19]/90 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 py-1.5 mt-2 flex items-center justify-between text-xs select-none shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStep(-1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="ថយក្រោយ 1 វិនាទី (Left Arrow)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-sky-400 text-black flex items-center justify-center hover:bg-sky-300 transition-transform active:scale-95 shadow-md shadow-sky-400/30"
            title="ចាក់ / ផ្អាក (Spacebar)"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
          </button>

          <button
            onClick={() => onStep(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="ទៅមុខ 1 វិនាទី (Right Arrow)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Timecode */}
          <div className="flex items-center gap-1 font-mono text-[11px] font-semibold bg-[#07090e] border border-white/[0.08] px-2 py-1 rounded-lg text-sky-400">
            <span>{formatTimecode(currentTime)}</span>
            <span className="text-slate-400">/ {formatTimecode(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Capture Thumbnail */}
          {onOpenThumbnailStudio && (
            <button
              onClick={onOpenThumbnailStudio}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors"
              title="បើក Thumbnail Generator ជាមួយរូបភាពបច្ចុប្បន្ន"
            >
              <Camera className="w-3 h-3" />
              <span>Thumbnail</span>
            </button>
          )}

          {/* Rate */}
          <select
            value={playbackRate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
            className="bg-[#07090e] border border-white/[0.08] text-slate-300 text-[11px] rounded-lg px-2 py-1 font-mono cursor-pointer"
          >
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>

          {/* Mute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="បិទ/បើកសំឡេង (M)"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="ពេញអេក្រង់ (F)"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
