import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Camera,
  Subtitles,
  Download,
  Check,
  Shield,
  ShieldCheck,
  Sparkles,
  Tv,
  Box,
  Edit3,
  Move,
  Plus,
  Minus,
  RotateCw,
  X,
  Layers,
} from 'lucide-react';
import { VideoEffects, SubtitleStyle } from '../../types';
import { LUT_PRESETS, EFFECT_3D_PRESETS } from '../effects/effectsLibrary';

interface VideoPreviewProps {
  src: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  playbackRate: number;
  currentSubtitle?: string;
  showSubtitles?: boolean;
  onToggleSubtitles?: () => void;
  videoEffects?: VideoEffects;
  onChangeEffects?: (effects: VideoEffects) => void;
  subtitleStyle?: SubtitleStyle;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (dur: number) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  onStep: (delta: number) => void;
  onOpenThumbnailStudio?: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  onToggleStyleText?: () => void;
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
  showSubtitles = true,
  onToggleSubtitles,
  videoEffects,
  onChangeEffects,
  subtitleStyle,
  videoRef: externalVideoRef,
  onTimeUpdate,
  onDurationChange,
  onTogglePlay,
  onToggleMute,
  onRateChange,
  onStep,
  onOpenThumbnailStudio,
  onShowToast,
  onToggleStyleText,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || localVideoRef;
  const frameRef = useRef<HTMLDivElement>(null);
  const [capturedFeedback, setCapturedFeedback] = useState(false);

  // Interactive 3D Text Dragging, Scaling, and Editing State
  const [isDraggingTitle, setIsDraggingTitle] = useState(false);
  const [isResizingTitle, setIsResizingTitle] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineSubtitle, setInlineSubtitle] = useState('');
  const [inlineBadge, setInlineBadge] = useState('');

  const dragStartPos = useRef({ x: 0, y: 0, startPosX: 10, startPosY: 82 });
  const resizeStartPos = useRef({ x: 0, y: 0, startFontSize: 28 });

  // Sync inline edit state when styleText changes
  useEffect(() => {
    if (videoEffects?.styleText) {
      setInlineTitle(videoEffects.styleText.title || '');
      setInlineSubtitle(videoEffects.styleText.subtitle || '');
      setInlineBadge(videoEffects.styleText.badge || '');
    }
  }, [videoEffects?.styleText?.title, videoEffects?.styleText?.subtitle, videoEffects?.styleText?.badge]);

  // Global mousemove and mouseup listener for drag & resize
  useEffect(() => {
    if (!isDraggingTitle && !isResizingTitle) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!frameRef.current || !videoEffects?.styleText || !onChangeEffects) return;
      const rect = frameRef.current.getBoundingClientRect();
      const st = videoEffects.styleText;

      if (isDraggingTitle) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        const dxPercent = (dx / rect.width) * 100;
        const dyPercent = (dy / rect.height) * 100;

        const newX = Math.max(2, Math.min(98, Math.round(dragStartPos.current.startPosX + dxPercent)));
        const newY = Math.max(2, Math.min(98, Math.round(dragStartPos.current.startPosY + dyPercent)));

        onChangeEffects({
          ...videoEffects,
          styleText: {
            ...st,
            position: 'free',
            posX: newX,
            posY: newY,
          },
        });
      } else if (isResizingTitle) {
        const dx = e.clientX - resizeStartPos.current.x;
        const deltaSize = Math.round(dx * 0.25);
        const newSize = Math.max(14, Math.min(96, resizeStartPos.current.startFontSize + deltaSize));

        onChangeEffects({
          ...videoEffects,
          styleText: {
            ...st,
            fontSize: newSize,
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTitle(false);
      setIsResizingTitle(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTitle, isResizingTitle, videoEffects, onChangeEffects]);

  const handleScaleDelta = (delta: number) => {
    if (!videoEffects?.styleText || !onChangeEffects) return;
    const st = videoEffects.styleText;
    const nextSize = Math.max(14, Math.min(96, (st.fontSize || 28) + delta));
    onChangeEffects({
      ...videoEffects,
      styleText: { ...st, fontSize: nextSize },
    });
    onShowToast?.(`ទំហំអក្សរ 3D: ${nextSize}px`, 'info');
  };

  const handleRotateDelta = (delta: number) => {
    if (!videoEffects?.styleText || !onChangeEffects) return;
    const st = videoEffects.styleText;
    const nextAngle = (((st.rotationAngle || 0) + delta + 180) % 360) - 180;
    onChangeEffects({
      ...videoEffects,
      styleText: { ...st, rotationAngle: nextAngle },
    });
    onShowToast?.(`មុំបង្វិល: ${nextAngle}°`, 'info');
  };

  const handleToggleBanner = () => {
    if (!videoEffects?.styleText || !onChangeEffects) return;
    const st = videoEffects.styleText;
    onChangeEffects({
      ...videoEffects,
      styleText: { ...st, showBanner: !st.showBanner },
    });
  };

  const handleSaveInlineEdit = () => {
    if (!videoEffects?.styleText || !onChangeEffects) return;
    onChangeEffects({
      ...videoEffects,
      styleText: {
        ...videoEffects.styleText,
        title: inlineTitle,
        subtitle: inlineSubtitle,
        badge: inlineBadge,
      },
    });
    setIsEditingInline(false);
    onShowToast?.('🎉 បានរក្សាទុកការកែសម្រួលអក្សរ 3D', 'success');
  };

  const handleMouseDownTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const st = videoEffects?.styleText;
    if (!st) return;
    setIsDraggingTitle(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: st.posX ?? 10,
      startPosY: st.posY ?? 82,
    };
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const st = videoEffects?.styleText;
    if (!st) return;
    setIsResizingTitle(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      startFontSize: st.fontSize || 28,
    };
  };

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

  // 1-Click Direct Frame Capture & Instant Download
  const handleInstantSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || v.videoWidth === 0) {
      onShowToast?.('⚠️ មិនអាចថតរូបបានទេ សូមរង់ចាំវីដេអូ Load សិន', 'error');
      return;
    }

    try {
      const c = document.createElement('canvas');
      c.width = v.videoWidth || 1920;
      c.height = v.videoHeight || 1080;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);

        // Burn Letterbox if enabled
        if (videoEffects?.letterbox) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, c.width, c.height * 0.1);
          ctx.fillRect(0, c.height * 0.9, c.width, c.height * 0.1);
        }

        // Burn Vignette if enabled
        if (videoEffects?.vignette) {
          const vig = ctx.createRadialGradient(
            c.width / 2,
            c.height / 2,
            c.width * 0.25,
            c.width / 2,
            c.height / 2,
            c.width * 0.7
          );
          vig.addColorStop(0, 'rgba(0,0,0,0)');
          vig.addColorStop(1, 'rgba(0,0,0,0.85)');
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, c.width, c.height);
        }

        // Burn Watermark if enabled
        if (videoEffects?.watermark?.enabled && videoEffects.watermark.text) {
          ctx.save();
          const wm = videoEffects.watermark;
          const fontSize = Math.round((wm.fontSize || 14) * (c.width / 1280));
          ctx.font = `bold ${fontSize}px "Outfit", "Kantumruy Pro", sans-serif`;
          ctx.globalAlpha = (wm.opacity || 85) / 100;
          ctx.fillStyle = wm.textColor || '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 6;

          const padding = 32;
          let wmX = c.width - padding;
          let wmY = padding + fontSize;
          ctx.textAlign = 'right';

          if (wm.position === 'top-left') {
            wmX = padding;
            ctx.textAlign = 'left';
          } else if (wm.position === 'bottom-right') {
            wmY = c.height - padding;
          } else if (wm.position === 'bottom-left') {
            wmX = padding;
            wmY = c.height - padding;
            ctx.textAlign = 'left';
          } else if (wm.position === 'center') {
            wmX = c.width / 2;
            wmY = c.height / 2;
            ctx.textAlign = 'center';
          }

          ctx.fillText(wm.text, wmX, wmY);
          ctx.restore();
        }

        // Burn Style Title if enabled (Full positioning & 3D styling matches UI)
        if (videoEffects?.styleText?.enabled && videoEffects.styleText.title) {
          ctx.save();
          const st = videoEffects.styleText;
          const scale = c.width / 1280;
          const titleSize = Math.round((st.fontSize || 28) * scale);
          const subSize = Math.round((st.subtitleFontSize || 14) * scale);
          const isFree = st.position === 'free' || (st.posX !== undefined && st.posY !== undefined);
          const align = st.textAlign || (st.position === 'top' || st.position === 'center' || st.position === 'bottom-center' ? 'center' : st.position === 'bottom-right' ? 'right' : 'left');

          let posX = isFree ? (c.width * (st.posX ?? 10)) / 100 : 48;
          let posY = isFree ? (c.height * (st.posY ?? 82)) / 100 : c.height - 48;

          ctx.translate(posX, posY);
          if (st.rotationAngle) {
            ctx.rotate((st.rotationAngle * Math.PI) / 180);
          }

          ctx.textAlign = align;
          ctx.font = `bold ${titleSize}px "${st.fontFamily || 'Koulen'}", "Kantumruy Pro", sans-serif`;

          // 3D Depth Extrusion
          const depth = Math.round(5 * scale);
          ctx.fillStyle = '#0a0d14';
          for (let d = depth; d >= 1; d--) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = d;
            ctx.shadowOffsetY = d;
            ctx.fillText(st.title, d, d);
          }

          // Outer Glow
          ctx.shadowColor = st.stylePreset === 'fire' ? '#ea580c' : st.stylePreset === 'neon' ? '#06b6d4' : '#eab308';
          ctx.shadowBlur = Math.round(14 * scale);
          ctx.fillStyle = st.stylePreset === 'neon' ? '#67e8f9' : st.stylePreset === 'fire' ? '#fed7aa' : '#fef08a';
          ctx.fillText(st.title, 0, 0);

          // Subtitle
          if (st.subtitle) {
            ctx.font = `500 ${subSize}px "Kantumruy Pro", sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(st.subtitle, 0, subSize + 6);
          }

          ctx.restore();
        }

        const dataUrl = c.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.download = `thumbnail_capture_${Math.round(currentTime)}s.jpg`;
        link.href = dataUrl;
        link.click();

        setCapturedFeedback(true);
        setTimeout(() => setCapturedFeedback(false), 2000);
        onShowToast?.('📸 បានថត និងទាញយករូបភាព Thumbnail Full HD (រួមទាំង Watermark & Style) ភ្លាមៗ!', 'success');
      }
    } catch (err: any) {
      onShowToast?.(`កំហុសថតរូប: ${err.message}`, 'error');
    }
  };

  // Compute CSS filter from effects + 40+ LUT library + 3D filter
  const matchedLut = LUT_PRESETS.find((p) => p.id === videoEffects?.lutPreset);
  const lutFilter = matchedLut && matchedLut.cssFilter !== 'none' ? matchedLut.cssFilter : '';

  // 3D Effects Engine Resolver
  const active3dPreset = videoEffects?.effect3dEnabled
    ? EFFECT_3D_PRESETS.find((p) => p.id === videoEffects?.effect3dPreset)
    : null;

  const transform3dStyle = active3dPreset?.transform3d || '';
  const filter3dStyle = active3dPreset?.filter3d || '';
  const perspective3d = active3dPreset?.perspective ? `${active3dPreset.perspective}px` : '900px';
  const motion3dClass = active3dPreset?.motionClass || '';

  const filterString = videoEffects
    ? [
        `brightness(${videoEffects.brightness}%)`,
        `contrast(${videoEffects.contrast}%)`,
        `saturate(${videoEffects.saturation}%)`,
        `sepia(${videoEffects.sepia}%)`,
        videoEffects.blur > 0 ? `blur(${videoEffects.blur}px)` : '',
        lutFilter,
        filter3dStyle,
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
        className={`relative ${aspectClass} max-h-[calc(100%-48px)] bg-black rounded-lg shadow-2xl flex items-center justify-center overflow-hidden border border-white/[0.06] transition-all group`}
      >
        {/* 3D Spatial Wrapper */}
        <div
          className={`w-full h-full relative flex items-center justify-center transition-all duration-300 ${motion3dClass}`}
          style={{
            perspective: videoEffects?.effect3dEnabled ? perspective3d : undefined,
            transform: videoEffects?.effect3dEnabled && transform3dStyle ? transform3dStyle : undefined,
            transformStyle: videoEffects?.effect3dEnabled ? 'preserve-3d' : undefined,
          }}
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

          {/* 3D Dynamic Spatial Overlays */}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'cyber_grid' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-cyber-grid" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'starfield' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-starfield" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'embers' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-embers" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'god_rays' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-god-rays" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'sakura_depth' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-sakura-depth" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'snow_depth' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-snow-depth" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'matrix_cube' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-matrix-cube" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'anaglyph' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-anaglyph" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'hologram_rings' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-hologram-rings" />
          )}
          {videoEffects?.effect3dEnabled && active3dPreset?.overlayType === 'lens_flare' && (
            <div className="absolute inset-0 pointer-events-none z-10 overlay-lens-flare" />
          )}
        </div>

        {/* 3D Active Indicator Floating Pill */}
        {videoEffects?.effect3dEnabled && active3dPreset && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[11px] font-bold shadow-xl animate-in fade-in">
            <Box className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>3D: {active3dPreset.label.split(' ')[1] || active3dPreset.label}</span>
          </div>
        )}

        {/* 1. Cinematic Letterbox Bars (Cinema Scope 2.35:1) */}
        {videoEffects?.letterbox && (
          <>
            <div className="absolute top-0 left-0 right-0 h-[10%] bg-black z-10 pointer-events-none transition-all shadow-md" />
            <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black z-10 pointer-events-none transition-all shadow-md" />
          </>
        )}

        {/* 2. Cinematic Vignette (Radial Shadow) */}
        {videoEffects?.vignette && (
          <div className="absolute inset-0 pointer-events-none z-10 [background:radial-gradient(circle,transparent_52%,rgba(0,0,0,0.85)_100%)]" />
        )}

        {/* 3. 35mm Film Grain Texture */}
        {videoEffects?.filmGrain && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 2px 2px',
            }}
          />
        )}

        {/* 4. VHS Retro Scanlines */}
        {videoEffects?.vhsGlitch && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: 'repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.5) 3px)',
            }}
          />
        )}

        {/* 5. Anime Dream Bloom */}
        {videoEffects?.glowBloom && (
          <div className="absolute inset-0 pointer-events-none z-10 bg-amber-400/10 mix-blend-screen backdrop-blur-[0.5px]" />
        )}

        {/* 6. Watermark & Copyright Protection Overlay */}
        {videoEffects?.watermark?.enabled && videoEffects.watermark.text && (
          <div
            className={`absolute z-20 pointer-events-none flex items-center gap-1.5 select-none transition-all ${
              videoEffects.watermark.position === 'top-left'
                ? 'top-4 left-4'
                : videoEffects.watermark.position === 'top-right'
                ? 'top-14 right-4'
                : videoEffects.watermark.position === 'bottom-left'
                ? 'bottom-10 left-4'
                : videoEffects.watermark.position === 'bottom-right'
                ? 'bottom-10 right-4'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
            style={{ opacity: (videoEffects.watermark.opacity || 85) / 100 }}
          >
            {videoEffects.watermark.showBadge ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 shadow-lg text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span
                  className="font-semibold tracking-wide"
                  style={{
                    fontSize: `${videoEffects.watermark.fontSize || 13}px`,
                    fontFamily: videoEffects.watermark.fontFamily || 'Outfit',
                    color: videoEffects.watermark.textColor || '#ffffff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {videoEffects.watermark.text}
                </span>
              </div>
            ) : (
              <span
                className="font-semibold tracking-wide drop-shadow-md"
                style={{
                  fontSize: `${videoEffects.watermark.fontSize || 13}px`,
                  fontFamily: videoEffects.watermark.fontFamily || 'Outfit',
                  color: videoEffects.watermark.textColor || '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                {videoEffects.watermark.text}
              </span>
            )}
          </div>
        )}

        {/* 7. Styled 3D Video Title / Theatrical Banner (Interactive Drag, Scale, Edit) */}
        {videoEffects?.styleText?.enabled && videoEffects.styleText.title && (() => {
          const st = videoEffects.styleText;
          const isFree = st.position === 'free' || (st.posX !== undefined && st.posY !== undefined);
          const align = st.textAlign || (st.position === 'top' || st.position === 'center' || st.position === 'bottom-center' ? 'center' : st.position === 'bottom-right' ? 'right' : 'left');

          return (
            <div
              className="absolute z-20 select-none flex flex-col group/styletext pointer-events-auto"
              style={
                isFree
                  ? {
                      left: `${st.posX ?? 10}%`,
                      top: `${st.posY ?? 82}%`,
                      transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, -50%) rotate(${st.rotationAngle || 0}deg)`,
                      alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                      textAlign: align,
                    }
                  : st.position === 'top'
                  ? { top: '1.5rem', left: '1.5rem', right: '1.5rem', alignItems: 'center', textAlign: 'center' }
                  : st.position === 'center'
                  ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', alignItems: 'center', textAlign: 'center' }
                  : st.position === 'bottom-center'
                  ? { bottom: '2rem', left: '1.5rem', right: '1.5rem', alignItems: 'center', textAlign: 'center' }
                  : st.position === 'bottom-right'
                  ? { bottom: '2rem', right: '1.5rem', alignItems: 'flex-end', textAlign: 'right' }
                  : { bottom: '2rem', left: '1.5rem', alignItems: 'flex-start', textAlign: 'left' }
              }
            >
              <div
                onMouseDown={handleMouseDownTitle}
                onDoubleClick={() => setIsEditingInline(true)}
                className={`relative max-w-[90%] transition-all cursor-grab active:cursor-grabbing rounded-2xl ${
                  st.showBanner
                    ? 'px-4 py-2.5 bg-black/75 backdrop-blur-md border border-white/20 shadow-2xl group-hover/styletext:border-sky-400/90 group-hover/styletext:shadow-[0_0_25px_rgba(56,189,248,0.4)]'
                    : 'p-1 group-hover/styletext:ring-2 group-hover/styletext:ring-sky-400/80 group-hover/styletext:rounded-xl'
                }`}
                style={{
                  alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                title="ចុចទាញដើម្បីផ្លាស់ទី (Drag to move) • Double-click ដើម្បីកែអក្សរ"
              >
                {/* Floating Quick Action Toolbar */}
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute -top-11 left-0 flex items-center gap-1.5 p-1 rounded-xl bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl opacity-0 group-hover/styletext:opacity-100 transition-opacity z-30 pointer-events-auto"
                >
                  <button
                    type="button"
                    onClick={() => setIsEditingInline(true)}
                    className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10.5px] font-bold flex items-center gap-1 transition-colors"
                    title="កែសម្រួលអក្សរ (Edit Title/Subtitle/Badge)"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>កែអក្សរ</span>
                  </button>
                  <div className="h-3 w-[1px] bg-white/20" />
                  <button
                    type="button"
                    onClick={() => handleScaleDelta(3)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="ពង្រីក (Scale Up +3px)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScaleDelta(-3)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="បង្រួម (Scale Down -3px)"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-3 w-[1px] bg-white/20" />
                  <button
                    type="button"
                    onClick={() => handleRotateDelta(5)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 transition-colors"
                    title="បង្វិល (Rotate +5°)"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleBanner}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${st.showBanner ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-slate-400'}`}
                    title="បិទ/បើក ផ្ទៃ Background Card"
                  >
                    Card
                  </button>
                </div>

                {/* Resize Handle (Bottom-Right corner) */}
                <div
                  onMouseDown={handleMouseDownResize}
                  className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg flex items-center justify-center cursor-nwse-resize hover:scale-125 transition-transform z-30 opacity-0 group-hover/styletext:opacity-100"
                  title="ទាញពង្រីក-បង្រួម (Drag to scale font size)"
                >
                  <Move className="w-3 h-3 rotate-45" />
                </div>

                {st.badge && (
                  <span className="inline-block px-2.5 py-0.5 mb-1.5 rounded-md bg-gradient-to-r from-rose-600 to-amber-600 text-white font-mono font-bold text-[10.5px] shadow-md border border-white/20">
                    {st.badge}
                  </span>
                )}
                <h2
                  className={`font-bold tracking-wide leading-tight ${(() => {
                    const p = st.stylePreset;
                    if (p === 'gold3d' || p === '3d_text_gold3d') return 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)]';
                    if (p === 'cyberpunk' || p === '3d_text_cyberpunk') return 'text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-pink-400 to-purple-400 drop-shadow-[0_0_14px_#38bdf8]';
                    if (p === 'silver_blade' || p === '3d_text_silver_blade') return 'text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_4px_10px_rgba(148,163,184,0.8)]';
                    if (p === 'fire' || p === '3d_text_lava_dragon') return 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-500 to-red-600 drop-shadow-[0_4px_14px_rgba(234,88,12,0.9)]';
                    if (p === 'neon' || p === '3d_text_plasma_shock') return 'text-cyan-300 drop-shadow-[0_0_16px_#06b6d4]';
                    if (p === 'diamond_prism' || p === '3d_text_diamond_prism') return 'text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-blue-200 drop-shadow-[0_0_12px_#bae6fd]';
                    if (p === 'jade_celestial' || p === '3d_text_jade_celestial') return 'text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-300 to-emerald-700 drop-shadow-[0_4px_10px_rgba(5,150,105,0.8)]';
                    if (p === 'mecha_chrome' || p === '3d_text_mecha_chrome') return 'text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-300 to-zinc-600 drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]';
                    if (p === 'crimson_shadow' || p === '3d_text_crimson_shadow') return 'text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-red-500 to-red-900 drop-shadow-[0_4px_12px_rgba(185,28,28,0.9)]';
                    if (p === 'glacier_ice' || p === '3d_text_glacier_ice') return 'text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-300 to-blue-600 drop-shadow-[0_0_14px_#0284c7]';
                    if (p === 'synthwave_80s' || p === '3d_text_synthwave_80s') return 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 drop-shadow-[0_0_12px_#e879f9]';
                    if (p === 'khmer_royal' || p === '3d_text_khmer_royal') return 'text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-400 to-amber-700 drop-shadow-[0_4px_10px_rgba(180,83,9,0.9)]';
                    if (p === 'sapphire' || p === '3d_text_ocean_wave') return 'text-transparent bg-clip-text bg-gradient-to-b from-blue-100 via-sky-400 to-blue-700 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]';
                    if (p === 'glass' || p === '3d_text_glass_frost') return 'text-white/95 backdrop-blur-md drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]';
                    if (p === 'anime') return 'text-amber-300 drop-shadow-[0_0_14px_rgba(245,158,11,0.9)]';
                    if (p === 'cinema' || p === '3d_text_hollywood_bold') return 'text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]';
                    return 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]';
                  })()}`}
                  style={{
                    fontSize: `${st.fontSize || 28}px`,
                    fontFamily: st.fontFamily || 'Koulen',
                    textShadow:
                      st.stylePreset === 'gold3d'
                        ? '0 3px 6px rgba(0,0,0,0.9), 0 0 12px rgba(245,158,11,0.6)'
                        : st.stylePreset === 'fire'
                        ? '0 3px 6px rgba(0,0,0,0.9), 0 0 16px #ea580c'
                        : st.stylePreset === 'neon'
                        ? '0 0 16px #06b6d4, 0 0 30px #0ea5e9'
                        : '0 3px 8px rgba(0,0,0,0.95)',
                  }}
                >
                  {st.title}
                </h2>
                {st.subtitle && (
                  <p className="text-slate-100 text-xs mt-1 drop-shadow-md">
                    {st.subtitle}
                  </p>
                )}
              </div>

              {/* Inline Quick Edit Dialog */}
              {isEditingInline && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute z-50 top-full mt-3 left-0 w-80 bg-[#0e1322]/95 backdrop-blur-xl border border-sky-500/40 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                      <span>កែប្រែអក្សរ 3D (Edit 3D Title)</span>
                    </span>
                    <button
                      onClick={() => setIsEditingInline(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-300">ចំណងជើងធំ (Main Title)</label>
                    <input
                      type="text"
                      value={inlineTitle}
                      onChange={(e) => setInlineTitle(e.target.value)}
                      placeholder="ឧ. សង្គ្រាម អាទិទេព..."
                      className="w-full bg-[#07090e] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-bold outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-300">ចំណងជើងរង (Subtitle)</label>
                    <input
                      type="text"
                      value={inlineSubtitle}
                      onChange={(e) => setInlineSubtitle(e.target.value)}
                      placeholder="ឧ. បញ្ចូលសំឡេងខ្មែរដោយ AI Dubbing..."
                      className="w-full bg-[#07090e] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-300">ស្លាកភាគ (Badge)</label>
                    <input
                      type="text"
                      value={inlineBadge}
                      onChange={(e) => setInlineBadge(e.target.value)}
                      placeholder="ឧ. ភាគ ០១ - ចប់..."
                      className="w-full bg-[#07090e] border border-white/10 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveInlineEdit}
                      className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>រក្សាទុក (Save)</span>
                    </button>
                    <button
                      onClick={() => setIsEditingInline(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                    >
                      បោះបង់
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Top Floating Cinematic Badges */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 select-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-slate-200 text-[11px] font-medium shadow-md">
            Cinematic Mode
          </div>
          <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-slate-400 font-mono text-[10.5px]">
            16:9
          </div>
        </div>

        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 select-none">
          {onToggleSubtitles && (
            <button
              onClick={onToggleSubtitles}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md border transition-all ${
                showSubtitles
                  ? 'bg-sky-500/20 border-sky-400/50 text-sky-300 shadow-md'
                  : 'bg-black/60 border-white/[0.1] text-slate-400 hover:text-white'
              }`}
              title="Toggle Subtitles"
            >
              CC ON
            </button>
          )}
          <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-slate-300 font-mono text-[10.5px]">
            HD
          </div>
          <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-sky-400 font-mono text-[10.5px] font-semibold">
            1080p
          </div>
        </div>

        {/* Dynamic Subtitle Overlay (Clean Cinema Typography) */}
        {showSubtitles && currentSubtitle && (
          <div className={`absolute ${subtitlePositionClass} left-[5%] right-[5%] text-center pointer-events-none z-20 animate-in fade-in duration-100`}>
            <div className="inline-flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/[0.15] shadow-2xl max-w-[85%] mx-auto">
              <p className="text-slate-300 text-xs font-medium tracking-wide">
                我一定会变得更强
              </p>
              <p
                className="font-khmer font-bold text-amber-300 text-base leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                {currentSubtitle}
              </p>
            </div>
          </div>
        )}

        {/* Bottom subtle progress line */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onTimeUpdate(pos * (duration || 60));
          }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.15] hover:h-2 cursor-pointer transition-all z-20 group"
        >
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_0_8px_#38bdf8]"
            style={{ width: `${Math.min(100, Math.max(0, (currentTime / (duration || 60)) * 100))}%` }}
          />
        </div>
      </div>

      {/* Professional Bottom Transport Bar */}
      <div className="w-full max-w-2xl bg-[#0a0e17] border border-white/[0.08] rounded-xl px-4 py-2 mt-2.5 flex items-center justify-between text-xs select-none shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onStep(-10)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Skip backward 10s"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 text-black flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-sky-500/30"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => onStep(10)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Skip forward 10s"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Monospace Timecode */}
          <div className="font-mono text-xs font-semibold px-2 py-1 text-slate-300">
            <span className="text-sky-400">{formatTimecode(currentTime)}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-slate-400">{formatTimecode(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <select
            value={playbackRate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
            className="bg-[#111827] border border-white/[0.08] text-slate-300 text-xs rounded-lg px-2 py-1 font-mono cursor-pointer outline-none focus:border-sky-400"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>

          {/* Mute / Volume */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Fullscreen (F)"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
