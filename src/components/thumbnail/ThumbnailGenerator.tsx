import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Camera,
  Download,
  Sparkles,
  Sliders,
  Type,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Flame,
  Palette,
  Layers,
  RotateCw,
  Box,
  Eye,
  Crosshair,
  RefreshCw,
} from 'lucide-react';
import { ThumbnailConfig, ProjectFile } from '../../types';

interface ThumbnailGeneratorProps {
  currentProject: ProjectFile | null;
  videoRef?: React.RefObject<HTMLVideoElement>;
  initialCapturedImage?: string | null;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({
  currentProject,
  videoRef,
  initialCapturedImage,
  onShowToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialCapturedImage || null);
  const [isScanningFrame, setIsScanningFrame] = useState(false);
  const [seekSecond, setSeekSecond] = useState<number>(2.0);

  // Settings tab: 'position' | 'effects' | 'content' | 'style'
  const [activeTab, setActiveTab] = useState<'position' | 'effects' | 'content' | 'style'>('position');

  // Dragging state on Canvas
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'title' | 'badge'>('title');

  const [config, setConfig] = useState<ThumbnailConfig>({
    title: 'សង្គ្រាមអាទិទេព',
    subtitle: 'ដំណើរផ្សងព្រេងក្នុងពិភពមហិទ្ធិឫទ្ធិ',
    badge: 'ភាគ ០១ - ចប់',
    watermark: 'CHEATH DABBER PRO v3',
    gradientStyle: 'gold',
    vignette: true,
    fontSize: 58,
    subtitleFontSize: 24,
    aspectRatio: '16:9',

    // Free Positioning (% of canvas)
    posX: 10,
    posY: 82,
    textAlign: 'left',
    badgePosX: 4,
    badgePosY: 5,

    // Visual Effects
    fontFamily: 'Koulen',
    effectStyle: 'gold3d',
    depth3D: 6,
    glowIntensity: 14,
    glowColor: '#eab308',
    strokeWidth: 6,
    strokeColor: '#000000',
    rotationAngle: 0,
    bgBanner: 'none',
  });

  // Sync initialCapturedImage
  useEffect(() => {
    if (initialCapturedImage) {
      setCapturedImage(initialCapturedImage);
    }
  }, [initialCapturedImage]);

  // Capture frame from active studio video OR project URL directly
  const handleCaptureFromVideo = async (targetSecond?: number) => {
    setIsScanningFrame(true);

    // 1. Try from live videoRef if available
    if (videoRef?.current && videoRef.current.videoWidth > 0 && typeof targetSecond !== 'number') {
      try {
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth || 1280;
        tempCanvas.height = video.videoHeight || 720;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
          setCapturedImage(dataUrl);
          setIsScanningFrame(false);
          onShowToast('បានចាប់យករូបភាពពីវីដេអូ Studio ជោគជ័យ!', 'success');
          return;
        }
      } catch (err) {
        console.warn('Direct video capture error, falling back to URL:', err);
      }
    }

    // 2. Fallback: Load directly from video project URL
    const videoUrl =
      currentProject?.url ||
      (currentProject?.filename ? `/media/uploads/${currentProject.filename}` : null);

    if (!videoUrl) {
      setIsScanningFrame(false);
      onShowToast('សូមបញ្ចូល ឬ Upload វីដេអូក្នុង Studio ជាមុនសិន!', 'error');
      return;
    }

    try {
      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = videoUrl;
      tempVideo.muted = true;
      tempVideo.preload = 'auto';

      const sec = typeof targetSecond === 'number' ? targetSecond : seekSecond;

      await new Promise<void>((resolve, reject) => {
        const onLoaded = () => {
          tempVideo.currentTime = Math.min(sec, tempVideo.duration > sec ? sec : Math.max(0.5, tempVideo.duration / 2));
        };
        tempVideo.onloadedmetadata = onLoaded;
        tempVideo.onseeked = () => resolve();
        tempVideo.onerror = () => reject(new Error('មិនអាចផ្ទុកវីដេអូបានឡើយ'));
        setTimeout(() => resolve(), 3500); // 3.5s timeout safety
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tempVideo.videoWidth || 1280;
      tempCanvas.height = tempVideo.videoHeight || 720;
      const ctx = tempCanvas.getContext('2d');
      if (ctx && tempVideo.videoWidth > 0) {
        ctx.drawImage(tempVideo, 0, 0, tempCanvas.width, tempCanvas.height);
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        onShowToast(`បានស្កេនចាប់យករូបប្លង់វីដេអូត្រង់វិនាទីទី ${sec.toFixed(1)}s ជោគជ័យ!`, 'success');
      } else {
        throw new Error('រូបភាពទទេ');
      }
    } catch (e: any) {
      onShowToast(`បរាជ័យក្នុងការស្កេនរូប: ${e.message}`, 'error');
    } finally {
      setIsScanningFrame(false);
    }
  };

  // Auto-load frame on mount if project is present and capturedImage is null
  useEffect(() => {
    if (!capturedImage && currentProject) {
      handleCaptureFromVideo(2.0);
    }
  }, [currentProject]);

  // Upload custom background image
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result as string);
        onShowToast('បានបញ្ចូលរូបភាពផ្ទៃខាងក្រោយជោគជ័យ!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Canvas Mouse Drag Events for Free Text Positioning
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updatePositionFromMouseEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    updatePositionFromMouseEvent(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositionFromMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xPercent = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));

    if (dragTarget === 'title') {
      setConfig((prev) => ({
        ...prev,
        posX: Math.round(xPercent),
        posY: Math.round(yPercent),
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        badgePosX: Math.round(xPercent),
        badgePosY: Math.round(yPercent),
      }));
    }
  };

  // 9-Point Alignment Grid Presets
  const applyAlignmentPreset = (preset: string) => {
    switch (preset) {
      case 'top-left':
        setConfig((p) => ({ ...p, posX: 8, posY: 20, textAlign: 'left' }));
        break;
      case 'top-center':
        setConfig((p) => ({ ...p, posX: 50, posY: 20, textAlign: 'center' }));
        break;
      case 'top-right':
        setConfig((p) => ({ ...p, posX: 92, posY: 20, textAlign: 'right' }));
        break;
      case 'mid-left':
        setConfig((p) => ({ ...p, posX: 8, posY: 50, textAlign: 'left' }));
        break;
      case 'center':
        setConfig((p) => ({ ...p, posX: 50, posY: 50, textAlign: 'center' }));
        break;
      case 'mid-right':
        setConfig((p) => ({ ...p, posX: 92, posY: 50, textAlign: 'right' }));
        break;
      case 'bot-left':
        setConfig((p) => ({ ...p, posX: 8, posY: 82, textAlign: 'left' }));
        break;
      case 'bot-center':
        setConfig((p) => ({ ...p, posX: 50, posY: 82, textAlign: 'center' }));
        break;
      case 'bot-right':
        setConfig((p) => ({ ...p, posX: 92, posY: 82, textAlign: 'right' }));
        break;
    }
  };

  // Effect Presets
  const applyEffectPreset = (effectKey: string) => {
    switch (effectKey) {
      case 'gold3d':
        setConfig((p) => ({
          ...p,
          effectStyle: 'gold3d',
          gradientStyle: 'gold',
          depth3D: 6,
          glowIntensity: 14,
          glowColor: '#eab308',
          strokeWidth: 6,
          strokeColor: '#000000',
        }));
        break;
      case 'fire':
        setConfig((p) => ({
          ...p,
          effectStyle: 'fire',
          gradientStyle: 'fire',
          depth3D: 7,
          glowIntensity: 18,
          glowColor: '#ea580c',
          strokeWidth: 6,
          strokeColor: '#2b0b00',
        }));
        break;
      case 'neon':
        setConfig((p) => ({
          ...p,
          effectStyle: 'neon',
          gradientStyle: 'cyberpunk',
          depth3D: 0,
          glowIntensity: 22,
          glowColor: '#06b6d4',
          strokeWidth: 5,
          strokeColor: '#030712',
        }));
        break;
      case 'sapphire':
        setConfig((p) => ({
          ...p,
          effectStyle: 'sapphire',
          gradientStyle: 'sapphire',
          depth3D: 6,
          glowIntensity: 15,
          glowColor: '#2563eb',
          strokeWidth: 6,
          strokeColor: '#091328',
        }));
        break;
      case 'horror':
        setConfig((p) => ({
          ...p,
          effectStyle: 'horror',
          gradientStyle: 'crimson',
          depth3D: 8,
          glowIntensity: 12,
          glowColor: '#991b1b',
          strokeWidth: 7,
          strokeColor: '#000000',
        }));
        break;
      case 'emerald':
        setConfig((p) => ({
          ...p,
          effectStyle: 'emerald',
          gradientStyle: 'emerald',
          depth3D: 5,
          glowIntensity: 14,
          glowColor: '#16a34a',
          strokeWidth: 5,
          strokeColor: '#052e16',
        }));
        break;
      case 'royal':
        setConfig((p) => ({
          ...p,
          effectStyle: 'royal',
          gradientStyle: 'purple',
          depth3D: 6,
          glowIntensity: 16,
          glowColor: '#9333ea',
          strokeWidth: 6,
          strokeColor: '#1a052e',
        }));
        break;
      case 'white3d':
        setConfig((p) => ({
          ...p,
          effectStyle: 'white3d',
          gradientStyle: 'white3d',
          depth3D: 9,
          glowIntensity: 8,
          glowColor: '#ffffff',
          strokeWidth: 7,
          strokeColor: '#000000',
        }));
        break;
      case 'rainbow':
        setConfig((p) => ({
          ...p,
          effectStyle: 'rainbow',
          gradientStyle: 'rainbow',
          depth3D: 4,
          glowIntensity: 16,
          glowColor: '#a855f7',
          strokeWidth: 5,
          strokeColor: '#000000',
        }));
        break;
      case 'glass':
        setConfig((p) => ({
          ...p,
          effectStyle: 'glass',
          gradientStyle: 'glass',
          depth3D: 2,
          glowIntensity: 10,
          glowColor: 'rgba(255,255,255,0.7)',
          strokeWidth: 2,
          strokeColor: 'rgba(255,255,255,0.3)',
          bgBanner: 'glass',
        }));
        break;
    }
  };

  // Render Thumbnail to HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = config.aspectRatio === '16:9' ? 1280 : 720;
    const height = config.aspectRatio === '16:9' ? 720 : 1280;
    canvas.width = width;
    canvas.height = height;

    const renderCanvas = (imgElement?: HTMLImageElement) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Image or Default Studio Gradient
      if (imgElement) {
        ctx.drawImage(imgElement, 0, 0, width, height);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0a0f1d');
        bgGrad.addColorStop(0.5, '#161938');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Cinematic Vignette & Gradient Overlays
      if (config.vignette) {
        // Bottom dramatic gradient for text readability
        const bottomGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
        bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        bottomGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.7)');
        bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, height * 0.45, width, height * 0.55);

        // Top gradient for badge and watermark
        const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.3);
        topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, height * 0.3);
      }

      // 3. Top Badges & Watermarks
      if (config.badge) {
        ctx.save();
        const badgeText = config.badge;
        ctx.font = 'bold 20px "Outfit", "Koulen", "Kantumruy Pro", sans-serif';
        const textMetrics = ctx.measureText(badgeText);
        const badgeWidth = textMetrics.width + 28;
        const badgeHeight = 38;

        const badgeX = (width * (config.badgePosX ?? 4)) / 100;
        const badgeY = (height * (config.badgePosY ?? 5)) / 100;

        // Badge Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        // Badge Background (Red Banner with golden border)
        const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY + badgeHeight);
        badgeGrad.addColorStop(0, '#dc2626');
        badgeGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = badgeGrad;

        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
        } else {
          ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
        }
        ctx.fill();

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Badge Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, badgeX + 14, badgeY + 26);
        ctx.restore();
      }

      // Watermark
      if (config.watermark) {
        ctx.save();
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(config.watermark, width - 30, 48);
        ctx.restore();
      }

      // 4. Main Title & Subtitle with Full Transform & Free Positioning
      if (config.title) {
        ctx.save();

        const titleActualX = (width * config.posX) / 100;
        const titleActualY = (height * config.posY) / 100;

        // Apply Transform (Translation + Rotation)
        ctx.translate(titleActualX, titleActualY);
        if (config.rotationAngle !== 0) {
          ctx.rotate((config.rotationAngle * Math.PI) / 180);
        }

        const fontFam = config.fontFamily || 'Koulen';
        ctx.font = `bold ${config.fontSize}px "${fontFam}", "Kantumruy Pro", sans-serif`;
        ctx.textAlign = config.textAlign || 'left';

        // Measure text for background banner if enabled
        const titleMetrics = ctx.measureText(config.title);
        const subFontSize = config.subtitleFontSize || Math.round(config.fontSize * 0.42);

        // Optional Background Banner / Glass Box
        if (config.bgBanner && config.bgBanner !== 'none') {
          ctx.save();
          const paddingX = 24;
          const paddingY = 16;
          const boxWidth = titleMetrics.width + paddingX * 2;
          const boxHeight = config.fontSize + (config.subtitle ? subFontSize + 28 : 20);

          let boxLeft = -paddingX;
          if (config.textAlign === 'center') boxLeft = -titleMetrics.width / 2 - paddingX;
          else if (config.textAlign === 'right') boxLeft = -titleMetrics.width - paddingX;

          const boxTop = -config.fontSize - 6;

          if (config.bgBanner === 'glass') {
            ctx.fillStyle = 'rgba(8, 12, 22, 0.72)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.5;
          } else if (config.bgBanner === 'ribbon') {
            ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 2;
          } else if (config.bgBanner === 'gradient') {
            const bannerGrad = ctx.createLinearGradient(boxLeft, boxTop, boxLeft + boxWidth, boxTop + boxHeight);
            bannerGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
            bannerGrad.addColorStop(1, 'rgba(30, 27, 75, 0.8)');
            ctx.fillStyle = bannerGrad;
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
            ctx.lineWidth = 2;
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
          }

          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(boxLeft, boxTop, boxWidth, boxHeight, 14);
          } else {
            ctx.rect(boxLeft, boxTop, boxWidth, boxHeight);
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Build Title Gradient Fill
        let titleGrad: CanvasGradient | string;
        const gradTop = -config.fontSize;
        const gradBottom = 4;
        const grad = ctx.createLinearGradient(0, gradTop, 0, gradBottom);

        switch (config.gradientStyle) {
          case 'gold':
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, '#fef08a');
            grad.addColorStop(0.6, '#eab308');
            grad.addColorStop(1, '#854d0e');
            titleGrad = grad;
            break;
          case 'fire':
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.25, '#fef08a');
            grad.addColorStop(0.65, '#f97316');
            grad.addColorStop(1, '#b91c1c');
            titleGrad = grad;
            break;
          case 'cyberpunk':
            grad.addColorStop(0, '#e0f2fe');
            grad.addColorStop(0.3, '#38bdf8');
            grad.addColorStop(0.7, '#ec4899');
            grad.addColorStop(1, '#a855f7');
            titleGrad = grad;
            break;
          case 'sapphire':
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.25, '#93c5fd');
            grad.addColorStop(0.65, '#3b82f6');
            grad.addColorStop(1, '#1e3a8a');
            titleGrad = grad;
            break;
          case 'crimson':
            grad.addColorStop(0, '#fee2e2');
            grad.addColorStop(0.3, '#f87171');
            grad.addColorStop(0.7, '#dc2626');
            grad.addColorStop(1, '#7f1d1d');
            titleGrad = grad;
            break;
          case 'emerald':
            grad.addColorStop(0, '#f0fdf4');
            grad.addColorStop(0.3, '#86efac');
            grad.addColorStop(0.7, '#22c55e');
            grad.addColorStop(1, '#14532d');
            titleGrad = grad;
            break;
          case 'purple':
            grad.addColorStop(0, '#faf5ff');
            grad.addColorStop(0.3, '#d8b4fe');
            grad.addColorStop(0.7, '#a855f7');
            grad.addColorStop(1, '#581c87');
            titleGrad = grad;
            break;
          case 'white3d':
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, '#f8fafc');
            grad.addColorStop(1, '#cbd5e1');
            titleGrad = grad;
            break;
          case 'rainbow':
            grad.addColorStop(0, '#f43f5e');
            grad.addColorStop(0.25, '#facc15');
            grad.addColorStop(0.5, '#10b981');
            grad.addColorStop(0.75, '#06b6d4');
            grad.addColorStop(1, '#a855f7');
            titleGrad = grad;
            break;
          case 'glass':
            titleGrad = 'rgba(255, 255, 255, 0.95)';
            break;
          default:
            titleGrad = '#facc15';
        }

        // 1. Draw 3D Depth Extrusions (Layered Drop Shadow)
        if (config.depth3D > 0) {
          ctx.save();
          ctx.fillStyle = '#05070c';
          for (let d = config.depth3D; d > 0; d--) {
            ctx.fillText(config.title, d * 1.4, d * 1.5);
          }
          ctx.restore();
        }

        // 2. Draw Outer Glow (Bloom)
        if (config.glowIntensity > 0) {
          ctx.save();
          ctx.shadowColor = config.glowColor || '#eab308';
          ctx.shadowBlur = config.glowIntensity;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = titleGrad;
          ctx.fillText(config.title, 0, 0);
          ctx.restore();
        }

        // 3. Draw Heavy Stroke (Black / Custom outline)
        if (config.strokeWidth > 0) {
          ctx.save();
          ctx.strokeStyle = config.strokeColor || '#000000';
          ctx.lineWidth = config.strokeWidth;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(config.title, 0, 0);
          ctx.restore();
        }

        // 4. Draw Crisp Main Title Fill
        ctx.fillStyle = titleGrad;
        ctx.fillText(config.title, 0, 0);

        // 5. Draw Subtitle / Tagline right under the title
        if (config.subtitle) {
          ctx.save();
          const subY = subFontSize + 14;
          ctx.font = `600 ${subFontSize}px "Kantumruy Pro", sans-serif`;
          ctx.textAlign = config.textAlign || 'left';

          // Subtitle Shadow & Stroke
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.lineWidth = 4;
          ctx.strokeText(config.subtitle, 0, subY);

          // Soft golden-white or clean silver gradient
          const subGrad = ctx.createLinearGradient(0, subY - subFontSize, 0, subY);
          subGrad.addColorStop(0, '#ffffff');
          subGrad.addColorStop(1, '#cbd5e1');
          ctx.fillStyle = subGrad;
          ctx.fillText(config.subtitle, 0, subY);
          ctx.restore();
        }

        ctx.restore();
      }
    };

    if (capturedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => renderCanvas(img);
      img.src = capturedImage;
    } else {
      renderCanvas();
    }
  }, [config, capturedImage]);

  // 1-Click Export to PNG
  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `thumbnail_${config.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('បាន Export Thumbnail HD ដោយជោគជ័យ!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6 bg-[#07090e]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-ui flex items-center gap-2">
              Thumbnail Movie Generator
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Pro Cinema Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              រចនា Poster និង Thumbnail ភាពយន្ត — អូសទាញអក្សរដាក់ទីតាំងសេរី និង Effects 3D / Glow ជាច្រើន
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleCaptureFromVideo()}
            disabled={isScanningFrame}
            className="px-4 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            title="ស្កេន និងចាប់យករូបភាពពីវីដេអូដែលបាន Upload ក្នុង Studio"
          >
            {isScanningFrame ? <RefreshCw className="w-4 h-4 animate-spin text-sky-400" /> : <Camera className="w-4 h-4" />}
            <span>{isScanningFrame ? 'កំពុងស្កេនរូប...' : 'ចាប់យករូបពីវីដេអូ (Frame Grab)'}</span>
          </button>
          <label className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95">
            <ImageIcon className="w-4 h-4" />
            <span>ផ្ទុករូបភាព (Upload)</span>
            <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
          </label>
          <button
            onClick={handleDownloadThumbnail}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download HD</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Interactive Live Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#0d121f] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden shadow-2xl">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">
                {config.aspectRatio === '16:9' ? '1280 × 720 (16:9)' : '720 × 1280 (9:16)'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <Move className="w-3 h-3" /> អូសលើរូបភាពដើម្បីផ្លាស់ប្តូរទីតាំង
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Canvas
              </span>
            </div>
          </div>

          {/* Canvas Wrapper with Drag Interaction */}
          <div
            className={`w-full flex items-center justify-center max-h-[520px] overflow-hidden rounded-xl shadow-2xl border ${
              isDragging ? 'border-amber-400 ring-2 ring-amber-500/40' : 'border-white/[0.1]'
            } bg-black relative group select-none`}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="max-w-full max-h-[480px] object-contain rounded-lg cursor-grab active:cursor-grabbing"
              title="ចុចហើយអូស (Click & Drag) ដើម្បីប្តូរទីតាំងអក្សរតាមចិត្ត!"
            />

            {/* Target Selector Floating Pill */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur border border-white/[0.15] px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">កំពុងអូស៖</span>
              <button
                type="button"
                onClick={() => setDragTarget('title')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  dragTarget === 'title' ? 'bg-amber-500 text-black' : 'text-slate-300 hover:text-white'
                }`}
              >
                ចំណងជើង (Title)
              </button>
              <button
                type="button"
                onClick={() => setDragTarget('badge')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  dragTarget === 'badge' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ស្លាកភាគ (Badge)
              </button>
            </div>
          </div>

          {/* Quick Position Status Info */}
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-3 px-2">
            <span>
              កូអរដោនេអក្សរ៖ <strong className="text-amber-400 font-mono">X: {config.posX}%</strong> |{' '}
              <strong className="text-amber-400 font-mono">Y: {config.posY}%</strong>
            </span>
            <span>
              មុំបង្វិល៖ <strong className="text-sky-400 font-mono">{config.rotationAngle}°</strong>
            </span>
          </div>
        </div>

        {/* Right: Comprehensive Studio Controls */}
        <div className="lg:col-span-5 bg-[#0d121f] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[660px]">
          {/* Tabs for Organization */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#07090e] rounded-xl border border-white/[0.08]">
            {[
              { id: 'position', label: 'ទីតាំងអក្សរ', icon: Move },
              { id: 'effects', label: 'Effects 3D', icon: Sparkles },
              { id: 'content', label: 'ខ្លឹមសារ & ពុម្ព', icon: Type },
              { id: 'style', label: 'ផ្ទៃ & ទម្រង់', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[10px] truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: POSITIONING (ដាក់កន្លែងណាក៏បាន) */}
          {activeTab === 'position' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-amber-400" />
                  ទីតាំងអក្សរ (Free Position & Alignment)
                </span>
                <span className="text-[10px] text-amber-300 font-mono">អូសលើរូប ឬចុច Preset</span>
              </div>

              {/* 9-Point Alignment Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  គំរូទីតាំងរហ័ស 9 ចំណុច (9-Point Presets)
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#070b14] rounded-xl border border-white/[0.06]">
                  {[
                    { id: 'top-left', label: '↖️ លើឆ្វេង' },
                    { id: 'top-center', label: '⬆️ លើកណ្តាល' },
                    { id: 'top-right', label: '↗️ លើស្តាំ' },
                    { id: 'mid-left', label: '⬅️ កណ្តាលឆ្វេង' },
                    { id: 'center', label: '⏺️ ចំកណ្តាល' },
                    { id: 'mid-right', label: '➡️ កណ្តាលស្តាំ' },
                    { id: 'bot-left', label: '↙️ ក្រោមឆ្វេង (Cinema)' },
                    { id: 'bot-center', label: '⬇️ ក្រោមកណ្តាល' },
                    { id: 'bot-right', label: '↘️ ក្រោមស្តាំ' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => applyAlignmentPreset(btn.id)}
                      className="py-2 px-1 text-[11px] rounded-lg bg-white/[0.04] hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-white/[0.05] transition-all font-medium text-center"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Precise Position Sliders */}
              <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.06] space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>↔️ ទីតាំងផ្តេក (Horizontal X)</span>
                    <span className="text-amber-400 font-mono font-bold">{config.posX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.posX}
                    onChange={(e) => setConfig({ ...config, posX: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>↕️ ទីតាំងបញ្ឈរ (Vertical Y)</span>
                    <span className="text-amber-400 font-mono font-bold">{config.posY}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={config.posY}
                    onChange={(e) => setConfig({ ...config, posY: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1">ទម្រង់តម្រឹមអក្សរ (Text Alignment)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', label: 'ឆ្វេង', icon: AlignLeft },
                      { id: 'center', label: 'កណ្តាល', icon: AlignCenter },
                      { id: 'right', label: 'ស្តាំ', icon: AlignRight },
                    ].map((al) => {
                      const Icon = al.icon;
                      return (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => setConfig({ ...config, textAlign: al.id as any })}
                          className={`py-1.5 px-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                            config.textAlign === al.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{al.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rotation Angle */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                      មុំផ្អៀង / បង្វិល (Rotation Angle)
                    </span>
                    <span className="text-sky-400 font-mono font-bold">{config.rotationAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={config.rotationAngle}
                    onChange={(e) => setConfig({ ...config, rotationAngle: Number(e.target.value) })}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                    <span>-30° (ផ្អៀងឆ្វេង)</span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, rotationAngle: 0 })}
                      className="text-slate-400 hover:text-white"
                    >
                      ០° (ត្រង់)
                    </button>
                    <span>+30° (ផ្អៀងស្តាំ)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RICH EFFECTS (Effects ជាច្រើនសម្រាប់ប្រើប្រាស់) */}
          {activeTab === 'effects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  ស្ទីល Effect ភាពយន្ត (Cinematic Effects)
                </span>
                <span className="text-[10px] text-slate-400">១០ ជម្រើស Effect ពិសេស</span>
              </div>

              {/* 10 Effect Presets */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gold3d', label: '✨ ទឹកមាស 3D (Gold VIP)', desc: 'ភ្លឺចែងចាំង បែបអភិជន' },
                  { id: 'fire', label: '🔥 ភ្លើងកក្រើក (Inferno Blaze)', desc: 'ឆាបឆេះ បែបសកម្មភាព' },
                  { id: 'neon', label: '⚡ Cyber Neon (Cyan/Pink)', desc: 'ពន្លឺភ្លើង Neon រាត្រី' },
                  { id: 'sapphire', label: '💎 ត្បូងកណ្តៀង (Sapphire)', desc: 'ខៀវគ្រីស្តាល់ ត្រជាក់ភ្នែក' },
                  { id: 'horror', label: '🩸 ភ័យរន្ធត់ (Blood Horror)', desc: 'ក្រហមឈាម ខ្មោចព្រាយ' },
                  { id: 'emerald', label: '🌿 ត្បូងមរកត (Emerald Jade)', desc: 'បៃតងរស្មី ទេវកថា' },
                  { id: 'royal', label: '👑 ស្វាយរាជវង្ស (Celestial)', desc: 'ស្វាយអំណាច បែបមន្តអាគម' },
                  { id: 'white3d', label: '⚪ ភាពយន្តអក្សរស (Monolith 3D)', desc: 'សសុទ្ធ ស្រមោលក្រាស់ 3D' },
                  { id: 'rainbow', label: '🌈 ឥន្ទធនូ Prism (Holo)', desc: 'ចម្រុះពណ៌ ឥន្ទធនូភ្លឺ' },
                  { id: 'glass', label: '🪞 កញ្ចក់ថ្លា (Glass Studio)', desc: 'បែបថ្លាទំនើប Glassmorphism' },
                ].map((eff) => (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => applyEffectPreset(eff.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.effectStyle === eff.id
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                        : 'bg-[#070b14] border-white/[0.06] text-slate-300 hover:border-white/[0.2]'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{eff.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{eff.desc}</p>
                  </button>
                ))}
              </div>

              {/* Advanced Effect Sliders */}
              <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.06] space-y-3.5">
                {/* 3D Depth */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      កម្រាស់ស្រមោលអក្សរ 3D (3D Depth)
                    </span>
                    <span className="text-amber-400 font-mono font-bold">{config.depth3D}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    value={config.depth3D}
                    onChange={(e) => setConfig({ ...config, depth3D: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Glow Intensity */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      ពន្លឺចាំងចែងជុំវិញ (Outer Glow / Bloom)
                    </span>
                    <span className="text-sky-400 font-mono font-bold">{config.glowIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={config.glowIntensity}
                    onChange={(e) => setConfig({ ...config, glowIntensity: Number(e.target.value) })}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Stroke Outline */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Box className="w-3.5 h-3.5 text-rose-400" />
                      កម្រាស់ស៊ុមអក្សរ (Stroke Outline)
                    </span>
                    <span className="text-rose-400 font-mono font-bold">{config.strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    value={config.strokeWidth}
                    onChange={(e) => setConfig({ ...config, strokeWidth: Number(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Background Banner Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ប្រអប់ទ្រនាប់អក្សរ (Background Ribbon / Box)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'none', label: 'គ្មាន' },
                      { id: 'glass', label: 'កញ្ចក់ថ្លា' },
                      { id: 'ribbon', label: 'បន្ទះភាពយន្ត' },
                      { id: 'gradient', label: 'Gradient' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setConfig({ ...config, bgBanner: bg.id as any })}
                        className={`py-1.5 px-1 rounded-lg border text-[11px] font-medium transition-all ${
                          config.bgBanner === bg.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT & FONTS (ខ្លឹមសារ & ពុម្ពអក្សរ) */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-400" />
                  ខ្លឹមសារ និងពុម្ពអក្សរខ្មែរ (Content & Fonts)
                </span>
              </div>

              {/* Khmer Font Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ពុម្ពអក្សរខ្មែរចំណងជើង (Khmer Headline Font)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Koulen', label: 'កូឡែន (Koulen Movie)', desc: 'អក្សរឆ្លាក់ចំណងជើងរឿង' },
                    { id: 'Moul', label: 'អក្សរមូល (Moul Classic)', desc: 'បុរាណបែប Donghua ទេវកថា' },
                    { id: 'Bayon', label: 'បាយ័ន (Bayon Bold)', desc: 'ម៉ូតរឹងមាំ បែបសកម្មភាព' },
                    { id: 'Kantumruy Pro', label: 'កន្ទុំរុយ (Modern Clean)', desc: 'ទំនើប ស្រឡះភ្នែក HD' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setConfig({ ...config, fontFamily: f.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        config.fontFamily === f.id
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-[#070b14] border-white/[0.06] text-slate-300 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold font-khmer">{f.label}</p>
                      <p className="text-[10px] text-slate-500">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ចំណងជើងធំ (Main Title)
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="ឧទាហរណ៍៖ សង្គ្រាមអាទិទេព"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-khmer font-bold"
                />
              </div>

              {/* Subtitle / Tagline Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ចំណងជើងរង (Subtitle / Tagline)
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="ដំណើរផ្សងព្រេងក្នុងពិភពមហិទ្ធិឫទ្ធិ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-khmer"
                />
              </div>

              {/* Episode Badge */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ស្លាកភាគ (Episode Badge)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.badge}
                    onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                    placeholder="ភាគ ០១"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#070b14] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-bold"
                  />
                  <div className="flex gap-1">
                    {['ភាគ ០១', 'Full HD', 'សម្រាយរឿង', 'វគ្គបញ្ចប់'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setConfig({ ...config, badge: preset })}
                        className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[10px] text-slate-300 border border-white/[0.06]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Size Sliders */}
              <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>ទំហំអក្សរចំណងជើងធំ</span>
                    <span className="text-amber-400 font-mono font-bold">{config.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="96"
                    value={config.fontSize}
                    onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>ទំហំអក្សរចំណងជើងរង</span>
                    <span className="text-slate-300 font-mono font-bold">
                      {config.subtitleFontSize || 24}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="42"
                    value={config.subtitleFontSize || 24}
                    onChange={(e) => setConfig({ ...config, subtitleFontSize: Number(e.target.value) })}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STYLE & BACKGROUND (ផ្ទៃខាងក្រោយ & ទម្រង់) */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  ទម្រង់រូបភាព & ផ្ទៃខាងក្រោយ
                </span>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ទម្រង់រូបភាព (Aspect Ratio)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '16:9', label: '16:9 YouTube', desc: 'Cover ទេសភាព 1280x720' },
                    { id: '9:16', label: '9:16 TikTok / Reels', desc: 'Cover បញ្ឈរ 720x1280' },
                  ].map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setConfig({ ...config, aspectRatio: ar.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        config.aspectRatio === ar.id
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-[#070b14] border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{ar.label}</p>
                      <p className="text-[10px] text-slate-500">{ar.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vignette Shadow Toggle */}
              <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Vignette Shadow (ស្រមោលងងឹតគែម)</p>
                  <p className="text-[10px] text-slate-400">ជួយឱ្យអក្សរលេចធ្លោ និងមានទឹកដៃបែបភាពយន្ត</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, vignette: !config.vignette })}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                    config.vignette ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.vignette ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Watermark Branding Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Watermark ស្ទូឌីយោ (Watermark / Brand)
                </label>
                <input
                  type="text"
                  value={config.watermark}
                  onChange={(e) => setConfig({ ...config, watermark: e.target.value })}
                  placeholder="CHEATH DABBER PRO v3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                />
              </div>

              {/* Reset to Default */}
              <button
                type="button"
                onClick={() => {
                  setConfig({
                    title: 'សង្គ្រាមអាទិទេព',
                    subtitle: 'ដំណើរផ្សងព្រេងក្នុងពិភពមហិទ្ធិឫទ្ធិ',
                    badge: 'ភាគ ០១ - ចប់',
                    watermark: 'CHEATH DABBER PRO v3',
                    gradientStyle: 'gold',
                    vignette: true,
                    fontSize: 58,
                    subtitleFontSize: 24,
                    aspectRatio: '16:9',
                    posX: 10,
                    posY: 82,
                    textAlign: 'left',
                    badgePosX: 4,
                    badgePosY: 5,
                    fontFamily: 'Koulen',
                    effectStyle: 'gold3d',
                    depth3D: 6,
                    glowIntensity: 14,
                    glowColor: '#eab308',
                    strokeWidth: 6,
                    strokeColor: '#000000',
                    rotationAngle: 0,
                    bgBanner: 'none',
                  });
                  onShowToast('បានកំណត់ឡើងវិញនូវទម្រង់ដើម!', 'info');
                }}
                className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>កំណត់ទម្រង់លំនាំដើមឡើងវិញ (Reset Defaults)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
