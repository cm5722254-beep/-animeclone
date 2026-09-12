import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Film,
  Video,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  CheckCircle,
  Bookmark,
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Plus,
  FileDown,
  FileUp,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';
import { ThumbnailConfig, ProjectFile, UserThumbnailTemplate } from '../../types';

interface ThumbnailGeneratorProps {
  currentProject: ProjectFile | null;
  videoUrl?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  initialCapturedImage?: string | null;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(m)}:${pad(s)}.${ms}`;
}

const DEFAULT_CONFIG: ThumbnailConfig = {
  title: 'យានអវកាស',
  subtitle: 'ដំណើរផ្សងព្រេងក្នុងពិភពមហិទ្ធិឫទ្ធិ',
  badge: 'ភាគ ២២',
  watermark: 'អាទិទេព DABBER PRO v3',
  gradientStyle: 'gold',
  vignette: true,
  fontSize: 58,
  subtitleFontSize: 24,
  aspectRatio: '16:9',

  // Free Positioning (% of canvas)
  posX: 68,
  posY: 74,
  textAlign: 'center',
  badgePosX: 4,
  badgePosY: 5,

  // Visual Effects
  fontFamily: 'Koulen',
  effectStyle: 'gold3d',
  depth3D: 6,
  glowIntensity: 22,
  glowColor: '#eab308',
  strokeWidth: 6,
  strokeColor: '#000000',
  rotationAngle: 0,
  bgBanner: 'none',
};

const BUILTIN_TEMPLATES: UserThumbnailTemplate[] = [
  {
    id: 'preset-gold-vip',
    name: '👑 មាស 3D VIP (Cinema Gold)',
    createdAt: 1700000000000,
    isBuiltin: true,
    previewGradient: 'from-amber-400 via-yellow-500 to-amber-700',
    config: {
      title: 'យានអវកាស',
      subtitle: 'ដំណើរផ្សងព្រេងក្នុងពិភពមហិទ្ធិឫទ្ធិ',
      badge: 'ភាគ ២២',
      watermark: 'អាទិទេព DABBER PRO v3',
      gradientStyle: 'gold',
      vignette: true,
      fontSize: 58,
      subtitleFontSize: 24,
      aspectRatio: '16:9',
      posX: 68,
      posY: 74,
      textAlign: 'center',
      badgePosX: 4,
      badgePosY: 5,
      fontFamily: 'Koulen',
      effectStyle: 'gold3d',
      depth3D: 6,
      glowIntensity: 22,
      glowColor: '#eab308',
      strokeWidth: 6,
      strokeColor: '#000000',
      rotationAngle: 0,
      bgBanner: 'none',
    },
  },
  {
    id: 'preset-cyberpunk-neon',
    name: '⚡ Cyberpunk Neon (Cyan & Pink)',
    createdAt: 1700000001000,
    isBuiltin: true,
    previewGradient: 'from-cyan-400 via-sky-500 to-pink-500',
    config: {
      title: 'មហាសង្រ្គាម 2099',
      subtitle: 'បច្ចេកវិទ្យាកំពូលសម័យអនាគត',
      badge: 'ភាគ ០១ - ចប់',
      watermark: 'អាទិទេព DABBER PRO v3',
      gradientStyle: 'cyberpunk',
      vignette: true,
      fontSize: 60,
      subtitleFontSize: 22,
      aspectRatio: '16:9',
      posX: 12,
      posY: 80,
      textAlign: 'left',
      badgePosX: 4,
      badgePosY: 5,
      fontFamily: 'Koulen',
      effectStyle: 'neon',
      depth3D: 4,
      glowIntensity: 28,
      glowColor: '#06b6d4',
      strokeWidth: 5,
      strokeColor: '#0f172a',
      rotationAngle: -1,
      bgBanner: 'ribbon',
    },
  },
  {
    id: 'preset-inferno-fire',
    name: '🔥 អគ្គិភ័យភ្លើង (Inferno Blaze)',
    createdAt: 1700000002000,
    isBuiltin: true,
    previewGradient: 'from-orange-500 via-amber-500 to-red-600',
    config: {
      title: 'កំពូលអ្នកប្រយុទ្ធ',
      subtitle: 'វាយប្រហារកក្រើកផែនដី',
      badge: 'ភាគពិសេស',
      watermark: 'អាទិទេព DABBER PRO v3',
      gradientStyle: 'fire',
      vignette: true,
      fontSize: 62,
      subtitleFontSize: 24,
      aspectRatio: '16:9',
      posX: 50,
      posY: 82,
      textAlign: 'center',
      badgePosX: 80,
      badgePosY: 5,
      fontFamily: 'Bayon',
      effectStyle: 'fire',
      depth3D: 8,
      glowIntensity: 24,
      glowColor: '#f97316',
      strokeWidth: 7,
      strokeColor: '#431407',
      rotationAngle: 0,
      bgBanner: 'none',
    },
  },
  {
    id: 'preset-blood-horror',
    name: '🩸 ភ័យរន្ធត់ (Blood Horror Dark)',
    createdAt: 1700000003000,
    isBuiltin: true,
    previewGradient: 'from-red-600 via-rose-700 to-black',
    config: {
      title: 'ព្រលឹងខ្មោចព្រៃ',
      subtitle: 'រឿងរ៉ាវអាថ៌កំបាំងយប់ជ្រៅ',
      badge: '18+ HORROR',
      watermark: 'អាទិទេព DABBER PRO v3',
      gradientStyle: 'crimson',
      vignette: true,
      fontSize: 56,
      subtitleFontSize: 22,
      aspectRatio: '16:9',
      posX: 10,
      posY: 82,
      textAlign: 'left',
      badgePosX: 4,
      badgePosY: 5,
      fontFamily: 'Moul',
      effectStyle: 'horror',
      depth3D: 6,
      glowIntensity: 20,
      glowColor: '#dc2626',
      strokeWidth: 6,
      strokeColor: '#000000',
      rotationAngle: 0,
      bgBanner: 'gradient',
    },
  },
  {
    id: 'preset-emerald-jade',
    name: '💎 ត្បូងមរកត (Emerald Fantasy)',
    createdAt: 1700000004000,
    isBuiltin: true,
    previewGradient: 'from-emerald-400 via-teal-500 to-green-700',
    config: {
      title: 'អាណាចក្រទេវតា',
      subtitle: 'អាថ៌កំបាំងកោះសួគ៌ា',
      badge: 'ភាគ ០៥',
      watermark: 'អាទិទេព DABBER PRO v3',
      gradientStyle: 'emerald',
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
      effectStyle: 'emerald',
      depth3D: 5,
      glowIntensity: 20,
      glowColor: '#10b981',
      strokeWidth: 5,
      strokeColor: '#064e3b',
      rotationAngle: 0,
      bgBanner: 'glass',
    },
  },
];

const getInitialTemplates = (): UserThumbnailTemplate[] => {
  try {
    const raw = localStorage.getItem('dabber_thumbnail_saved_templates');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading saved templates', e);
  }
  return BUILTIN_TEMPLATES;
};

const getInitialConfig = (): ThumbnailConfig => {
  try {
    const raw = localStorage.getItem('dabber_thumbnail_autosave');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Error reading autosaved config', e);
  }
  return DEFAULT_CONFIG;
};

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({
  currentProject,
  videoUrl,
  videoRef,
  initialCapturedImage,
  onShowToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);

  // Live Video & Playback States
  const [isLiveVideoMode, setIsLiveVideoMode] = useState<boolean>(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(2.0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);

  // Static Background Image & Cache
  const [capturedImage, setCapturedImage] = useState<string | null>(initialCapturedImage || null);
  const [cachedImageObj, setCachedImageObj] = useState<HTMLImageElement | null>(null);
  const [isScanningFrame, setIsScanningFrame] = useState(false);

  // Settings tab: 'position' | 'effects' | 'content' | 'style' | 'templates'
  const [activeTab, setActiveTab] = useState<'position' | 'effects' | 'content' | 'style' | 'templates'>('position');

  // Dragging state on Canvas
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'title' | 'badge'>('title');

  // Auto-saved & User Presets
  const [config, setConfig] = useState<ThumbnailConfig>(getInitialConfig);
  const [savedTemplates, setSavedTemplates] = useState<UserThumbnailTemplate[]>(getInitialTemplates);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [hasAutoSaved, setHasAutoSaved] = useState(false);

  const activeVideoSrc =
    videoUrl ||
    currentProject?.url ||
    (currentProject?.filename ? `/media/uploads/${currentProject.filename}` : '') ||
    (videoRef?.current?.src || '');

  // Pre-cache static image when capturedImage changes
  useEffect(() => {
    if (capturedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setCachedImageObj(img);
      img.src = capturedImage;
    } else {
      setCachedImageObj(null);
    }
  }, [capturedImage]);

  // Sync initialCapturedImage
  useEffect(() => {
    if (initialCapturedImage) {
      setCapturedImage(initialCapturedImage);
    }
  }, [initialCapturedImage]);

  // Auto-save configuration to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem('dabber_thumbnail_autosave', JSON.stringify(config));
      setHasAutoSaved(true);
      const timer = setTimeout(() => setHasAutoSaved(false), 2500);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('Failed to auto-save thumbnail config', e);
    }
  }, [config]);

  const handleSaveNewTemplate = (customName?: string) => {
    const rawName = (customName || templateNameInput || '').trim();
    const finalName = rawName || `គំរូ ${config.title || 'ភាពយន្ត'} (${new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })})`;
    const newTemplate: UserThumbnailTemplate = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: finalName,
      createdAt: Date.now(),
      isBuiltin: false,
      previewGradient:
        config.effectStyle === 'gold3d'
          ? 'from-amber-400 via-yellow-500 to-amber-700'
          : config.effectStyle === 'neon'
          ? 'from-cyan-400 via-sky-500 to-pink-500'
          : config.effectStyle === 'fire'
          ? 'from-orange-500 via-amber-500 to-red-600'
          : config.effectStyle === 'horror'
          ? 'from-red-600 via-rose-700 to-black'
          : config.effectStyle === 'emerald'
          ? 'from-emerald-400 via-teal-500 to-green-700'
          : 'from-amber-500 to-rose-600',
      config: { ...config },
    };
    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('dabber_thumbnail_saved_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save templates', e);
    }
    setTemplateNameInput('');
    setIsSaveModalOpen(false);
    onShowToast(`🎉 បានរក្សាទុកជាគំរូ "${finalName}" ដោយជោគជ័យ!`, 'success');
  };

  const handleApplyTemplate = (tpl: UserThumbnailTemplate, mode: 'all' | 'style_only') => {
    if (mode === 'all') {
      setConfig({ ...tpl.config });
      onShowToast(`✨ បានអនុវត្តគំរូ "${tpl.name}" ទាំងស្រុង!`, 'success');
    } else {
      // Keep user's current title, subtitle and badge (for new episode), update styling & positions
      setConfig((prev) => ({
        ...tpl.config,
        title: prev.title,
        subtitle: prev.subtitle,
        badge: prev.badge,
        watermark: prev.watermark || tpl.config.watermark,
      }));
      onShowToast(`🎨 បានអនុវត្ត Style ពី "${tpl.name}" (រក្សាអក្សរ និងភាគដដែល)!`, 'success');
    }
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('dabber_thumbnail_saved_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete template', e);
    }
    onShowToast(`🗑️ បានលុបគំរូ "${name}" រួចរាល់!`, 'info');
  };

  const handleExportTemplates = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedTemplates, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `dabber_thumbnail_templates_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast('📥 បានទាញយក File គំរូ (Backup Templates) ដោយជោគជ័យ!', 'success');
    } catch (e) {
      onShowToast('❌ បរាជ័យក្នុងការ Export គំរូ!', 'error');
    }
  };

  const handleImportTemplates = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const combined = [...parsed, ...savedTemplates.filter((t) => !parsed.some((p: any) => p.id === t.id))];
          setSavedTemplates(combined);
          localStorage.setItem('dabber_thumbnail_saved_templates', JSON.stringify(combined));
          onShowToast(`📤 បានបញ្ចូលគំរូ ${parsed.length} ថ្មីដោយជោគជ័យ!`, 'success');
        } else {
          onShowToast('⚠️ ទម្រង់ File មិនត្រឹមត្រូវ!', 'error');
        }
      } catch (err) {
        onShowToast('❌ បរាជ័យក្នុងការអាន File JSON!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load video metadata and default seek
  useEffect(() => {
    const v = internalVideoRef.current;
    if (!v || !activeVideoSrc) return;
    v.src = activeVideoSrc;
    v.load();
  }, [activeVideoSrc]);

  // Video Playback Toggle
  const togglePlay = () => {
    const v = internalVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play()
        .then(() => {
          setIsVideoPlaying(true);
          setIsLiveVideoMode(true);
        })
        .catch(() => {});
    } else {
      v.pause();
      setIsVideoPlaying(false);
    }
  };

  const seekVideo = (time: number) => {
    const v = internalVideoRef.current;
    if (!v) return;
    v.currentTime = time;
    setVideoCurrentTime(time);
    if (!isVideoPlaying) {
      requestAnimationFrame(() => renderScene());
    }
  };

  const stepVideo = (delta: number) => {
    const v = internalVideoRef.current;
    if (!v) return;
    const dur = videoDuration || 60;
    const newTime = Math.max(0, Math.min(dur, v.currentTime + delta));
    seekVideo(newTime);
  };

  // Capture frame from active studio video OR project URL directly
  const handleCaptureFromVideo = async (targetSecond?: number) => {
    setIsScanningFrame(true);

    const v = internalVideoRef.current || videoRef?.current;
    if (v && v.videoWidth > 0) {
      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = v.videoWidth || 1280;
        tempCanvas.height = v.videoHeight || 720;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(v, 0, 0, tempCanvas.width, tempCanvas.height);
          const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
          setCapturedImage(dataUrl);
          setIsScanningFrame(false);
          onShowToast(`📸 បានចាប់យករូបភាពពីវីដេអូត្រង់ ${v.currentTime.toFixed(1)}s ជោគជ័យ!`, 'success');
          return;
        }
      } catch (err) {
        console.warn('Direct video capture error, falling back:', err);
      }
    }

    if (!activeVideoSrc) {
      setIsScanningFrame(false);
      onShowToast('សូមបញ្ចូល ឬ Upload វីដេអូក្នុង Studio ជាមុនសិន!', 'error');
      return;
    }

    try {
      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = activeVideoSrc;
      tempVideo.muted = true;
      tempVideo.preload = 'auto';

      const sec = typeof targetSecond === 'number' ? targetSecond : videoCurrentTime;

      await new Promise<void>((resolve, reject) => {
        const onLoaded = () => {
          tempVideo.currentTime = Math.min(sec, tempVideo.duration > sec ? sec : Math.max(0.5, tempVideo.duration / 2));
        };
        tempVideo.onloadedmetadata = onLoaded;
        tempVideo.onseeked = () => resolve();
        tempVideo.onerror = () => reject(new Error('មិនអាចផ្ទុកវីដេអូបានឡើយ'));
        setTimeout(() => resolve(), 3500);
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tempVideo.videoWidth || 1280;
      tempCanvas.height = tempVideo.videoHeight || 720;
      const ctx = tempCanvas.getContext('2d');
      if (ctx && tempVideo.videoWidth > 0) {
        ctx.drawImage(tempVideo, 0, 0, tempCanvas.width, tempCanvas.height);
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        onShowToast(`បានស្កេនចាប់យករូបប្លង់វីដេអូត្រង់ ${sec.toFixed(1)}s ជោគជ័យ!`, 'success');
      }
    } catch (e: any) {
      onShowToast(`បរាជ័យក្នុងការស្កេនរូប: ${e.message}`, 'error');
    } finally {
      setIsScanningFrame(false);
    }
  };

  // Upload custom background image
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result as string);
        setIsLiveVideoMode(false);
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

  // Full 3D Scene Drawing Routine onto HTML5 Canvas
  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, mediaSource?: CanvasImageSource) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background: Live Video Frame OR Captured Image OR Cinema Gradient
      if (mediaSource) {
        ctx.drawImage(mediaSource, 0, 0, width, height);
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
        const bottomGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
        bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        bottomGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.7)');
        bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, height * 0.45, width, height * 0.55);

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

        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

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

        ctx.translate(titleActualX, titleActualY);
        if (config.rotationAngle !== 0) {
          ctx.rotate((config.rotationAngle * Math.PI) / 180);
        }

        const fontFam = config.fontFamily || 'Koulen';
        ctx.font = `bold ${config.fontSize}px "${fontFam}", "Kantumruy Pro", sans-serif`;
        ctx.textAlign = config.textAlign || 'left';

        const titleMetrics = ctx.measureText(config.title);
        const subFontSize = config.subtitleFontSize || Math.round(config.fontSize * 0.42);

        // Optional Background Banner
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

        // Title Gradient Fill
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

        // Layer A: 3D Depth Extrusions
        const depth = config.depth3D || 0;
        if (depth > 0) {
          ctx.save();
          ctx.fillStyle = '#0a0d14';
          for (let d = depth; d >= 1; d--) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = d;
            ctx.shadowOffsetY = d;
            ctx.fillText(config.title, d, d);
          }
          ctx.restore();
        }

        // Layer B: Outer Glow / Bloom
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

        // Layer C: Heavy Outer Stroke
        if (config.strokeWidth > 0) {
          ctx.save();
          ctx.strokeStyle = config.strokeColor || '#000000';
          ctx.lineWidth = config.strokeWidth * 2;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(config.title, 0, 0);
          ctx.restore();
        }

        // Layer D: Front Gradient Fill
        ctx.save();
        ctx.fillStyle = titleGrad;
        ctx.fillText(config.title, 0, 0);
        ctx.restore();

        // 5. Subtitle Tagline
        if (config.subtitle) {
          ctx.save();
          const subY = subFontSize + 14;
          ctx.font = `600 ${subFontSize}px "Kantumruy Pro", sans-serif`;
          ctx.textAlign = config.textAlign || 'left';

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.lineJoin = 'round';
          ctx.strokeText(config.subtitle, 0, subY);

          const subGrad = ctx.createLinearGradient(0, subY - subFontSize, 0, subY);
          subGrad.addColorStop(0, '#ffffff');
          subGrad.addColorStop(1, '#cbd5e1');
          ctx.fillStyle = subGrad;
          ctx.fillText(config.subtitle, 0, subY);
          ctx.restore();
        }

        ctx.restore();
      }
    },
    [config]
  );

  // High performance Render Dispatcher
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = config.aspectRatio === '16:9' ? 1280 : 720;
    const height = config.aspectRatio === '16:9' ? 720 : 1280;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const v = internalVideoRef.current;
    if (isLiveVideoMode && v && v.readyState >= 2) {
      drawScene(ctx, width, height, v);
    } else if (cachedImageObj) {
      drawScene(ctx, width, height, cachedImageObj);
    } else {
      drawScene(ctx, width, height);
    }
  }, [config, isLiveVideoMode, cachedImageObj, drawScene]);

  // Live Video Animation Frame Loop during active playback
  useEffect(() => {
    if (!isVideoPlaying || !isLiveVideoMode) return;
    let animId: number;
    const loop = () => {
      const v = internalVideoRef.current;
      if (v) {
        setVideoCurrentTime(v.currentTime);
        renderScene();
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isVideoPlaying, isLiveVideoMode, renderScene]);

  // Static/Scrub Trigger
  useEffect(() => {
    if (!isVideoPlaying) {
      renderScene();
    }
  }, [renderScene, isVideoPlaying, videoCurrentTime]);

  // 1-Click Export to PNG
  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `thumbnail_${config.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('🎉 បានទាញយក Thumbnail HD រចនារួចរាល់ដោយជោគជ័យ!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6 bg-[#07090e]">
      {/* Hidden Master Video Element for Live Rendering */}
      <video
        ref={internalVideoRef}
        crossOrigin="anonymous"
        playsInline
        muted={isVideoMuted}
        className="hidden"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          const dur = v.duration || 0;
          setVideoDuration(dur);
          if (v.currentTime === 0) {
            v.currentTime = Math.min(2.0, dur > 4 ? 2.0 : dur / 2);
          }
          requestAnimationFrame(() => renderScene());
        }}
        onSeeked={() => {
          renderScene();
        }}
        onEnded={() => {
          setIsVideoPlaying(false);
        }}
      />

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
              រចនា Poster និង Thumbnail ភាពយន្ត — Design ផ្ទាល់លើវីដេអូកំពុងដើរ អូសទាញអក្សរ និង Effects 3D
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasAutoSaved && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl animate-fade-in shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Saved</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-500/10"
            title="រក្សាទុកការ Design បច្ចុប្បន្ន (ពុម្ព, 3D, ពណ៌, ទីតាំង) ទុកប្រើលើកក្រោយ"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>💾 រក្សាទុកជា Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
              activeTab === 'templates'
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border-white/[0.1]'
            }`}
            title="មើលគំរូដែលបានរក្សាទុកទាំងអស់"
          >
            <FolderOpen className="w-4 h-4" />
            <span>គំរូរបស់ខ្ញុំ ({savedTemplates.length})</span>
          </button>

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

      {/* Quick Preset Strip (Bar គំរូរហ័ស) */}
      <div className="w-full bg-[#0a0f1d] border border-white/[0.08] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto shadow-inner">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 whitespace-nowrap">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            គំរូរហ័ស (Quick Presets):
          </span>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {savedTemplates.slice(0, 5).map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-slate-300 transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tpl, 'style_only')}
                  className="px-2.5 py-1 hover:text-amber-300 flex items-center gap-1.5 font-medium whitespace-nowrap"
                  title={`អនុវត្ត Style ពី "${tpl.name}" ដោយរក្សាអក្សរ និងភាគបច្ចុប្បន្ន`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${tpl.previewGradient || 'from-amber-400 to-rose-500'} shadow-sm`} />
                  <span className="truncate max-w-[130px]">{tpl.name}</span>
                  <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">Style</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tpl, 'all')}
                  className="px-2 py-1 bg-white/[0.04] hover:bg-amber-500 hover:text-black text-slate-400 border-l border-white/[0.08] text-[10px] font-semibold transition-colors"
                  title="យកទាំងអស់ (អក្សរ + ទីតាំង + Style)"
                >
                  All
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ រក្សាទុក Design នេះ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>មើលទាំងអស់ ({savedTemplates.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Interactive Live Canvas + Video Scrubber */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#0d121f] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden shadow-2xl">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">
                {config.aspectRatio === '16:9' ? '1280 × 720 (16:9)' : '720 × 1280 (9:16)'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <Move className="w-3 h-3" /> អូសលើរូបភាពដើម្បីផ្លាស់ប្តូរទីតាំងអក្សរផ្ទាល់
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold text-xs flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                {isLiveVideoMode ? (isVideoPlaying ? '🎬 Live Video Playing' : '🎬 Live Video Ready') : '🖼️ Static Image'}
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
              title="ចុចហើយអូស (Click & Drag) ដើម្បីប្តូរទីតាំងអក្សរតាមចិត្តលើវីដេអូ!"
            />

            {/* Target Selector Floating Pill */}
            <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur border border-white/[0.15] px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs z-20">
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

          {/* Cinema Live Video Scrubber & Playback Controls */}
          <div className="w-full bg-[#090d16] border border-white/[0.08] rounded-xl p-3 mt-3 flex flex-col gap-2.5">
            {/* Top Bar: Mode Switcher & Timecode */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLiveVideoMode(true);
                    onShowToast('🎬 បានបើករបៀប Live Video: Design ដើរលើវីដេអូផ្ទាល់!', 'info');
                    renderScene();
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    isLiveVideoMode
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                      : 'bg-white/[0.05] text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>ដើរលើវីដេអូផ្ទាល់ (Live Video)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLiveVideoMode(false);
                    onShowToast('🖼️ បានប្តូរទៅរបៀបរូបថត Snapshot', 'info');
                    renderScene();
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    !isLiveVideoMode
                      ? 'bg-sky-500 text-black shadow-md'
                      : 'bg-white/[0.05] text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>រូបថត (Snapshot)</span>
                </button>
              </div>

              {/* Timecode Badge */}
              <div className="font-mono text-[11px] font-bold text-amber-400 bg-black/60 px-2.5 py-0.5 rounded border border-white/[0.1]">
                {formatTimecode(videoCurrentTime)} / {formatTimecode(videoDuration || 60)}
              </div>
            </div>

            {/* Video Scrubber Slider */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={videoDuration > 0 ? videoDuration : 60}
                step={0.1}
                value={videoCurrentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  seekVideo(val);
                }}
                className="flex-1 h-1.5 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
                title="អូសដើម្បីរំកិលប្លង់វីដេអូភ្លាមៗ"
              />
            </div>

            {/* Bottom Transport Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isVideoPlaying
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isVideoPlaying ? 'ផ្អាក (Pause)' : 'ចាក់វីដេអូ (Play)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => stepVideo(-1)}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]"
                  title="ថយក្រោយ 1 វិនាទី"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => stepVideo(1)}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]"
                  title="ទៅមុខ 1 វិនាទី"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const v = internalVideoRef.current;
                    if (v) {
                      v.muted = !isVideoMuted;
                      setIsVideoMuted(!isVideoMuted);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]"
                  title={isVideoMuted ? 'បើកសំឡេង' : 'បិទសំឡេង (Mute)'}
                >
                  {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] text-slate-500">ប្លង់រហ័ស៖</span>
                <button
                  type="button"
                  onClick={() => seekVideo(videoDuration ? videoDuration * 0.1 : 5)}
                  className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300"
                >
                  ដើមរឿង
                </button>
                <button
                  type="button"
                  onClick={() => seekVideo(videoDuration ? videoDuration * 0.5 : 30)}
                  className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300"
                >
                  កណ្តាលរឿង
                </button>
                <button
                  type="button"
                  onClick={() => seekVideo(videoDuration ? videoDuration * 0.85 : 50)}
                  className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300"
                >
                  ចុងរឿង
                </button>
              </div>
            </div>
          </div>

          {/* Quick Position Status Info */}
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
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
          <div className="grid grid-cols-5 gap-1 p-1 bg-[#07090e] rounded-xl border border-white/[0.08]">
            {[
              { id: 'position', label: 'ទីតាំង', icon: Move },
              { id: 'effects', label: 'Effects 3D', icon: Sparkles },
              { id: 'content', label: 'ខ្លឹមសារ', icon: Type },
              { id: 'style', label: 'ផ្ទៃ', icon: Palette },
              { id: 'templates', label: 'គំរូ', icon: Bookmark, count: savedTemplates.length },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-lg text-xs font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-black shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[10px] truncate">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`absolute top-0.5 right-0.5 text-[8px] px-1 rounded-full font-mono ${
                        activeTab === tab.id ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
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
                  placeholder="អាទិទេព DABBER PRO v3"
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
                    watermark: 'អាទិទេព DABBER PRO v3',
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

          {/* TAB 5: SAVED TEMPLATES & PRESETS (គំរូដែលបានរក្សាទុក) */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  គ្រប់គ្រងគំរូ & Presets (Saved Templates)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Auto-Save បើកជានិច្ច
                </span>
              </div>

              {/* Box 1: Save Current Design Card */}
              <div className="p-3.5 bg-[#070b14] rounded-xl border border-amber-500/20 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> រក្សាទុកការ Design បច្ចុប្បន្នជាគំរូ
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Font: {config.fontFamily} | Style: {config.effectStyle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={templateNameInput}
                    onChange={(e) => setTemplateNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNewTemplate();
                    }}
                    placeholder={`ឧ. គំរូ ${config.title || 'យានអវកាស'} (ភាគ ${config.badge || '២២'})`}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveNewTemplate()}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-500/20 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>រក្សាទុក</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  💡 ពេលរក្សាទុកហើយ អ្នកអាចចុច <strong className="text-amber-300">«យកតែ Style»</strong> លើភាគបន្ទាប់បានភ្លាមៗ ដោយមិនបាច់រៀបចំ Effects ម្តងទៀតទេ!
                </p>
              </div>

              {/* Box 2: Saved Templates List */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-300 px-0.5">
                  <span className="font-semibold">បញ្ជីគំរូទាំងអស់ ({savedTemplates.length})</span>
                  <span className="text-[10px] text-slate-500">ចុច Style ឬ All ដើម្បីប្រើ</span>
                </div>

                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {savedTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-3 rounded-xl bg-[#070a12] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-3.5 h-3.5 rounded-full shrink-0 bg-gradient-to-r ${
                              tpl.previewGradient || 'from-amber-400 to-rose-500'
                            } shadow-sm`}
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{tpl.name}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                              <span className="text-amber-400">{tpl.config.fontFamily}</span>
                              <span>•</span>
                              <span className="capitalize text-sky-400">{tpl.config.effectStyle}</span>
                              <span>•</span>
                              <span>3D: {tpl.config.depth3D}px</span>
                              <span>•</span>
                              <span>Glow: {tpl.config.glowIntensity}px</span>
                            </div>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="លុបគំរូនេះចោល"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tpl, 'style_only')}
                          className="py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                          title="រក្សាទុកអក្សរ និងភាគបច្ចុប្បន្ន តែយកពុម្ព, ពណ៌, 3D, Glow, និងទីតាំងពីគំរូនេះ"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>⚡ យកតែ Style (រក្សាអក្សរ)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tpl, 'all')}
                          className="py-1.5 px-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-all active:scale-95"
                          title="យកទាំងអក្សរ ភាគ និង Style ទាំងអស់ពីគំរូនេះ"
                        >
                          <Check className="w-3 h-3" />
                          <span>✨ យកទាំងអស់ (Apply All)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Backup & Share (JSON Import/Export) */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleExportTemplates}
                  className="flex-1 py-2 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-all"
                  title="ទាញយក file Backup គំរូទាំងអស់របស់អ្នក"
                >
                  <FileDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>Backup គំរូ (JSON)</span>
                </button>

                <label className="flex-1 py-2 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>បញ្ចូលគំរូ (Import)</span>
                  <input type="file" accept=".json" onChange={handleImportTemplates} className="hidden" />
                </label>
              </div>

              {/* Reset Default */}
              <button
                type="button"
                onClick={() => {
                  setConfig(DEFAULT_CONFIG);
                  onShowToast('បានកំណត់ឡើងវិញនូវទម្រង់ដើម!', 'info');
                }}
                className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>កំណត់ទម្រង់លំនាំដើមឡើងវិញ (Reset Defaults)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Save Template Modal Dialog */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0d121f] border border-amber-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">រក្សាទុកជាគំរូ Template ថ្មី</h3>
                  <p className="text-[11px] text-slate-400">រក្សាទុកការរៀបចំ 3D, ពណ៌ និងពុម្ពអក្សរសម្រាប់ប្រើលើកក្រោយ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Config Snapshot Preview */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-amber-400">ព័ត៌មានលម្អិតនៃគំរូ៖</span>
              <div className="text-slate-300 font-medium">ចំណងជើង៖ <strong className="text-white">"{config.title}"</strong> ({config.badge})</div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 font-mono mt-1">
                <div>ពុម្ព៖ <span className="text-amber-300">{config.fontFamily}</span></div>
                <div>ស្ទាយ៖ <span className="text-sky-300">{config.effectStyle}</span></div>
                <div>3D Depth៖ <span className="text-emerald-300">{config.depth3D}px</span></div>
                <div>Glow Bloom៖ <span className="text-rose-300">{config.glowIntensity}px</span></div>
                <div>ទីតាំង៖ <span className="text-white">X:{config.posX}% | Y:{config.posY}%</span></div>
                <div>មុំបង្វិល៖ <span className="text-white">{config.rotationAngle}°</span></div>
              </div>
            </div>

            {/* Template Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ឈ្មោះគំរូ (Template Name)
              </label>
              <input
                type="text"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNewTemplate();
                }}
                placeholder={`ឧ. គំរូ ${config.title || 'យានអវកាស'} (Gold 3D VIP)`}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.15] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => handleSaveNewTemplate()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>រក្សាទុក (Save)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
