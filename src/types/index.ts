export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  tier: 'premium' | 'free';
  premium_expires_at?: string | null;
  created_at?: string;
}

export interface CharacterVoice {
  id: string;
  filename: string;
  label: string;
  role_key?: string;
  gender: 'male' | 'female';
  words?: string;
  is_curated?: boolean;
  exists?: boolean;
  previewUrl?: string | null;
  sizeBytes?: number;
}

export interface TimelineSegment {
  line_index: number;
  start_time: number;
  end_time: number;
  speaker_id?: string;
  speaker_name?: string;
  speaker_role?: string;
  gender?: 'male' | 'female';
  voiceId?: string;
  chinese_text?: string;
  khmer_translation?: string;
  audioUrl?: string | null;
  movieVoiceSample?: string | null;
  status?: string;
}

export interface ProjectFile {
  filename: string;
  originalName?: string;
  size: number;
  type: 'video' | 'audio';
  created?: number;
  url: string;
}

export interface StudioConfig {
  hasElevenlabs: boolean;
  hasGemini: boolean;
  geminiModel: string;
  hasVoxcpmUrl: boolean;
  voxcpmUrl: string;
  cloudUrl: string;
  mode: string;
  port: number;
}

export interface VoxcpmStatus {
  online: boolean;
  configured: boolean;
  mode?: string;
  isLocal?: boolean;
  url?: string;
  device?: string;
  gpuName?: string;
  message?: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  opacity: number; // 10 to 100
  fontSize: number; // 10 to 32
  fontFamily: string; // 'Outfit' | 'Kantumruy Pro' | 'Koulen' | 'Moul'
  textColor: string;
  showBadge: boolean;
  logoUrl?: string;
}

export interface VideoStyleTextConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  badge: string;
  stylePreset: string; // supports 35+ 3D title presets
  position: 'top' | 'center' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'free';
  posX?: number; // 0 to 100 percentage (free positioning like Thumbnail)
  posY?: number; // 0 to 100 percentage (free positioning like Thumbnail)
  textAlign?: 'left' | 'center' | 'right';
  rotationAngle?: number; // -30 to 30 deg
  fontSize: number;
  subtitleFontSize?: number;
  fontFamily: string;
  showBanner: boolean;
  depth3D?: number; // 0 to 16px 3D extrusion
  glowIntensity?: number; // 0 to 30px glow/bloom
  strokeWidth?: number; // 0 to 14px outer stroke
}

export interface Effect3DPreset {
  id: string;
  label: string;
  category: '3D Spatial & Transforms' | '3D Particles & Atmosphere' | '3D Titles & Typography' | '3D Dynamic Motion & Camera';
  description: string;
  icon?: string;
  transform3d?: string;
  filter3d?: string;
  perspective?: number; // default e.g. 900
  overlayType?: 'none' | 'cyber_grid' | 'starfield' | 'embers' | 'god_rays' | 'matrix_cube' | 'anaglyph' | 'lens_flare' | 'sakura_depth' | 'snow_depth' | 'portal_ring' | 'hologram_rings';
  motionClass?: string;
  titleStylePreset?: string;
}

export interface VideoEffects {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  sepia: number;      // 0 to 100 (default 0)
  blur: number;       // 0 to 10 (default 0)
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  lutPreset: string;
  // Cinematic Overlays & Effects
  letterbox?: boolean; // Cinema Scope black bars 2.35:1
  vignette?: boolean;  // Darkened edges
  filmGrain?: boolean; // Authentic 35mm grain
  vhsGlitch?: boolean; // CRT scanlines
  glowBloom?: boolean; // Anime dream bloom
  colorTint?: 'none' | 'cyberpunk' | 'golden' | 'horror' | 'emerald';
  // Watermark & Copyright
  watermark?: WatermarkConfig;
  // Styled Video Title / Lower-Third
  styleText?: VideoStyleTextConfig;
  // 3D Effects Engine (100+ Presets)
  effect3dEnabled?: boolean;
  effect3dPreset?: string;
  effect3dIntensity?: number; // 0 to 100
  effect3dDepth?: number;     // 0 to 100
}

export interface SubtitleStyle {
  fontSize: number; // 14 to 32
  fontFamily: string; // 'Kantumruy Pro' | 'Battambang' | 'Moul' | 'Outfit'
  textColor: string; // '#ffffff' | '#facc15' | '#38bdf8' etc.
  strokeColor: string; // '#000000'
  strokeWidth: number; // 0 to 4
  backgroundColor: string; // 'transparent' | 'rgba(0,0,0,0.6)'
  position: 'bottom' | 'center' | 'top';
  animation: 'none' | 'pop' | 'karaoke';
}

export interface ThumbnailConfig {
  title: string;
  subtitle: string;
  badge: string;
  watermark: string;
  gradientStyle: string; // 'gold' | 'crimson' | 'cyberpunk' | 'emerald' | 'sapphire' | 'fire' | 'purple' | 'white3d' | 'rainbow'
  vignette: boolean;
  fontSize: number;
  subtitleFontSize?: number;
  aspectRatio: '16:9' | '9:16';

  // Free positioning & alignment
  posX: number; // 0 to 100 percentage
  posY: number; // 0 to 100 percentage
  textAlign: 'left' | 'center' | 'right';
  badgePosX?: number; // 0 to 100 percentage
  badgePosY?: number; // 0 to 100 percentage

  // Visual Effects
  fontFamily: string; // 'Kantumruy Pro' | 'Koulen' | 'Moul' | 'Bayon' | 'Outfit'
  effectStyle: 'gold3d' | 'neon' | 'fire' | 'sapphire' | 'horror' | 'emerald' | 'royal' | 'white3d' | 'rainbow' | 'glass';
  depth3D: number; // 0 to 20
  glowIntensity: number; // 0 to 30
  glowColor?: string;
  strokeWidth: number; // 0 to 20
  strokeColor: string;
  rotationAngle: number; // -45 to +45 deg
  bgBanner: 'none' | 'glass' | 'ribbon' | 'gradient' | 'box';
}

export interface UserThumbnailTemplate {
  id: string;
  name: string;
  createdAt: number;
  config: ThumbnailConfig;
  previewGradient?: string;
  isBuiltin?: boolean;
}

export interface VideoDownloadResult {
  success: boolean;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  duration?: number;
  thumbnail?: string;
  message?: string;
}

export type TabId =
  | 'tab-dashboard'
  | 'tab-dubbing'
  | 'tab-manual'
  | 'tab-character'
  | 'tab-translator'
  | 'tab-mixer'
  | 'tab-subtitles'
  | 'tab-tuner'
  | 'tab-thumbnail';
