import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Film,
  RotateCcw,
  Sparkles,
  Volume2,
  Search,
  Check,
  Palette,
  Layers,
  Wand2,
  Zap,
  Shield,
  ShieldCheck,
  Move,
  Eye,
  EyeOff,
  Tv,
  Radio,
  Image as ImageIcon,
  Box
} from 'lucide-react';
import { VideoEffects, SubtitleStyle, WatermarkConfig, VideoStyleTextConfig } from '../../types';
import { LUT_PRESETS, SUBTITLE_PRESETS, AUDIO_EFFECT_PRESETS, EFFECT_3D_PRESETS } from './effectsLibrary';

interface VideoEffectsPanelProps {
  effects: VideoEffects;
  onChangeEffects: (effects: VideoEffects) => void;
  subtitleStyle: SubtitleStyle;
  onChangeSubtitleStyle: (style: SubtitleStyle) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VideoEffectsPanel: React.FC<VideoEffectsPanelProps> = ({
  effects,
  onChangeEffects,
  subtitleStyle,
  onChangeSubtitleStyle,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'effect3d' | 'watermark' | 'styletext' | 'subtitles' | 'audio'>('effect3d');
  const [filterSearch, setFilterSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [audioSearch, setAudioSearch] = useState('');
  const [effect3dSearch, setEffect3dSearch] = useState('');
  const [selectedLutCategory, setSelectedLutCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selected3dCategory, setSelected3dCategory] = useState<string>('All');

  const aspectRatios = [
    { id: '16:9', label: '16:9 Landscape', desc: 'YouTube / TV' },
    { id: '9:16', label: '9:16 Vertical', desc: 'TikTok / Shorts / Reels' },
    { id: '1:1', label: '1:1 Square', desc: 'Facebook / IG' },
    { id: '4:3', label: '4:3 Classic', desc: 'Traditional Frame' },
  ];

  const resetVideoEffects = () => {
    onChangeEffects({
      ...effects,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sepia: 0,
      blur: 0,
      aspectRatio: '16:9',
      lutPreset: 'none',
      letterbox: false,
      vignette: false,
      filmGrain: false,
      vhsGlitch: false,
      glowBloom: false,
    });
    onShowToast('បានកំណត់ Video Effects ឡើងវិញ', 'info');
  };

  const reset3DEffects = () => {
    onChangeEffects({
      ...effects,
      effect3dEnabled: false,
      effect3dPreset: 'none',
      effect3dIntensity: 80,
      effect3dDepth: 75,
    });
    onShowToast('បានកំណត់ Effect 3D ឡើងវិញ', 'info');
  };

  const resetSubtitleStyle = () => {
    onChangeSubtitleStyle({
      fontSize: 20,
      fontFamily: 'Kantumruy Pro',
      textColor: '#fef08a',
      strokeColor: '#000000',
      strokeWidth: 2,
      backgroundColor: 'rgba(0,0,0,0.75)',
      position: 'bottom',
      animation: 'none',
    });
    onShowToast('បានកំណត់ Subtitle Style ឡើងវិញ', 'info');
  };

  // Watermark Helpers
  const currentWatermark: WatermarkConfig = effects.watermark || {
    enabled: true,
    text: '© សម្រាយរឿង HD - អាទិទេព DABBER PRO',
    position: 'top-right',
    opacity: 85,
    fontSize: 13,
    fontFamily: 'Outfit',
    textColor: '#ffffff',
    showBadge: true,
  };

  const updateWatermark = (patch: Partial<WatermarkConfig>) => {
    onChangeEffects({
      ...effects,
      watermark: {
        ...currentWatermark,
        ...patch,
      },
    });
  };

  // Style Text Helpers
  const currentStyleText: VideoStyleTextConfig = effects.styleText || {
    enabled: false,
    title: 'សង្គ្រាមអាទិទេព',
    subtitle: 'បញ្ចូលសំឡេងខ្មែរដោយ AI Dubbing',
    badge: 'ភាគ ០១ - ចប់',
    stylePreset: 'gold3d',
    position: 'bottom-left',
    fontSize: 26,
    fontFamily: 'Koulen',
    showBanner: true,
  };

  const updateStyleText = (patch: Partial<VideoStyleTextConfig>) => {
    onChangeEffects({
      ...effects,
      styleText: {
        ...currentStyleText,
        ...patch,
      },
    });
  };

  // Filtered LUTs
  const lutCategories = ['All', 'Cinematic', 'Anime & Drama', 'Vintage & Film', 'Atmospheric & Sci-Fi'];
  const filteredLuts = LUT_PRESETS.filter((lut) => {
    const matchesCat = selectedLutCategory === 'All' || lut.category === selectedLutCategory;
    const matchesQuery =
      !filterSearch ||
      lut.label.toLowerCase().includes(filterSearch.toLowerCase()) ||
      lut.description.toLowerCase().includes(filterSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filtered Subtitles
  const subCategories = ['All', 'Donghua & Theatrical', 'Modern & Streaming', 'Anime & Neon', 'Creative & Aesthetic'];
  const filteredSubs = SUBTITLE_PRESETS.filter((sub) => {
    const matchesCat = selectedSubCategory === 'All' || sub.category === selectedSubCategory;
    const matchesQuery =
      !subSearch ||
      sub.label.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.description.toLowerCase().includes(subSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filtered Audio
  const filteredAudios = AUDIO_EFFECT_PRESETS.filter((aud) => {
    return (
      !audioSearch ||
      aud.label.toLowerCase().includes(audioSearch.toLowerCase()) ||
      aud.description.toLowerCase().includes(audioSearch.toLowerCase())
    );
  });

  // Filtered 3D Effects (118 Presets)
  const categories3D = [
    'All',
    '3D Spatial & Transforms',
    '3D Particles & Atmosphere',
    '3D Titles & Typography',
    '3D Dynamic Motion & Camera'
  ];
  const filtered3dEffects = EFFECT_3D_PRESETS.filter((item) => {
    const matchesCat = selected3dCategory === 'All' || item.category === selected3dCategory;
    const matchesQuery =
      !effect3dSearch ||
      item.label.toLowerCase().includes(effect3dSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(effect3dSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-[#0b101d] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
      {/* Tab Selector & Reset Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
        <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-xl border border-white/[0.06] overflow-x-auto max-w-[280px] sm:max-w-none">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>LUTs & FX</span>
          </button>

          <button
            onClick={() => setActiveTab('effect3d')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'effect3d'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold shadow-md shadow-rose-500/25'
                : 'text-amber-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Effect 3D ({EFFECT_3D_PRESETS.length}+)</span>
          </button>

          <button
            onClick={() => setActiveTab('watermark')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'watermark'
                ? 'bg-amber-500 text-black font-bold shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Watermark</span>
          </button>

          <button
            onClick={() => setActiveTab('styletext')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'styletext'
                ? 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>អក្សរ Style</span>
          </button>

          <button
            onClick={() => setActiveTab('subtitles')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'subtitles'
                ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Subtitles</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'audio'
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'video') resetVideoEffects();
            else if (activeTab === 'effect3d') reset3DEffects();
            else resetSubtitleStyle();
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors shrink-0"
          title="កំណត់ឡើងវិញ"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {/* ======================= TAB 1: VIDEO EFFECTS & 40+ LUTS ======================= */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            {/* Cinematic Special Effects Switches */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] space-y-2.5">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Effect ភាពយន្តពិសេស (Cinematic FX)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeEffects({ ...effects, letterbox: !effects.letterbox })}
                  className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    effects.letterbox
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-[#0b101d] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Tv className="w-3.5 h-3.5 text-sky-400" />
                    <span>Cinema Letterbox</span>
                  </div>
                  <span className="text-[10px] font-mono">{effects.letterbox ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeEffects({ ...effects, vignette: !effects.vignette })}
                  className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    effects.vignette
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-[#0b101d] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">●</span>
                    <span>Vignette ស្រមោល</span>
                  </div>
                  <span className="text-[10px] font-mono">{effects.vignette ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeEffects({ ...effects, filmGrain: !effects.filmGrain })}
                  className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    effects.filmGrain
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-[#0b101d] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>35mm Film Grain</span>
                  </div>
                  <span className="text-[10px] font-mono">{effects.filmGrain ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeEffects({ ...effects, vhsGlitch: !effects.vhsGlitch })}
                  className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    effects.vhsGlitch
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                      : 'bg-[#0b101d] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>VHS Scanlines</span>
                  </div>
                  <span className="text-[10px] font-mono">{effects.vhsGlitch ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-sky-400" />
                Aspect Ratio (ទម្រង់វីដេអូ)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => onChangeEffects({ ...effects, aspectRatio: ar.id as any })}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      effects.aspectRatio === ar.id
                        ? 'bg-sky-500/20 border-sky-500/60 text-white'
                        : 'bg-[#070b14] border-white/[0.06] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{ar.label}</div>
                    <div className="text-[10px] text-slate-500">{ar.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 40+ Color Grading LUTs Library */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Color Grading LUTs ({LUT_PRESETS.length} ស្ទាយពណ៌ភាពយន្ត)</span>
                </label>
                <span className="text-[10.5px] text-sky-400 font-mono">
                  សកម្ម: {LUT_PRESETS.find((p) => p.id === effects.lutPreset)?.label.split(' ')[1] || 'Default'}
                </span>
              </div>

              {/* Search & Categories */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="ស្វែងរក Filter (ឧទាហរណ៍៖ Hollywood, Anime, Retro, Cyberpunk...)"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-sky-400"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {lutCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedLutCategory(cat)}
                      className={`px-2 py-1 rounded text-[10.5px] whitespace-nowrap transition-all ${
                        selectedLutCategory === cat
                          ? 'bg-sky-500 text-white font-semibold'
                          : 'bg-[#070b14] text-slate-400 hover:text-slate-200 border border-white/[0.04]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of 40+ LUT Badges */}
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 bg-[#070b14] rounded-xl border border-white/[0.06]">
                {filteredLuts.map((lut) => {
                  const isSelected = effects.lutPreset === lut.id;
                  return (
                    <button
                      key={lut.id}
                      onClick={() => {
                        onChangeEffects({ ...effects, lutPreset: lut.id });
                        onShowToast(`បានជ្រើសរើស Effect: ${lut.label}`, 'success');
                      }}
                      className={`p-2 rounded-lg border text-left flex items-start justify-between gap-1 transition-all ${
                        isSelected
                          ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm'
                          : 'bg-[#0b101d] border-white/[0.06] text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="text-[11px] font-bold truncate">{lut.label}</div>
                        <div className="text-[9.5px] text-slate-400 line-clamp-1">{lut.description}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine Tuning Sliders */}
            <div className="space-y-3 bg-[#070b14] p-3 rounded-xl border border-white/[0.06]">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>កែសម្រួលលម្អិត (Manual Color Tuning)</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>ពន្លឺ (Brightness)</span>
                  <span className="font-mono text-sky-400">{effects.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={effects.brightness}
                  onChange={(e) => onChangeEffects({ ...effects, brightness: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>កម្រិតពណ៌ខុសគ្នា (Contrast)</span>
                  <span className="font-mono text-sky-400">{effects.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={effects.contrast}
                  onChange={(e) => onChangeEffects({ ...effects, contrast: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>ដង់ស៊ីតេពណ៌ (Saturation)</span>
                  <span className="font-mono text-sky-400">{effects.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={effects.saturation}
                  onChange={(e) => onChangeEffects({ ...effects, saturation: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>ស្រមោលព្រិល (Blur)</span>
                  <span className="font-mono text-sky-400">{effects.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={effects.blur}
                  onChange={(e) => onChangeEffects({ ...effects, blur: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: 110+ 3D EFFECTS & SPATIAL ENGINE ======================= */}
        {activeTab === 'effect3d' && (
          <div className="space-y-4">
            {/* Master Toggle & Active Preset Info */}
            <div className="bg-[#070b14] p-3.5 rounded-xl border border-amber-500/20 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 font-extrabold">
                      Effect 3D លើវីដេអូ ({EFFECT_3D_PRESETS.length}+ Presets គ្រប់បែប)
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 mt-0.5">
                    Spatial Transforms, 3D Particles, 3D Typography & Dynamic Camera
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !effects.effect3dEnabled;
                    onChangeEffects({
                      ...effects,
                      effect3dEnabled: next,
                      effect3dPreset: next ? (effects.effect3dPreset || '3d_isometric_studio') : effects.effect3dPreset
                    });
                    onShowToast(next ? '🎉 បានបើកដំណើរការ Effect 3D' : 'បានបិទ Effect 3D', next ? 'success' : 'info');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    effects.effect3dEnabled
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  {effects.effect3dEnabled ? '3D: ON' : '3D: OFF'}
                </button>
              </div>

              {/* Active Indicator Badge */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.06]">
                <span className="text-slate-400">Effect 3D សកម្មបច្ចុប្បន្ន:</span>
                <span className="font-bold font-mono text-amber-300 truncate max-w-[200px]">
                  {EFFECT_3D_PRESETS.find((p) => p.id === effects.effect3dPreset)?.label || 'គ្មាន (Default)'}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Starter Buttons */}
            <div className="bg-[#070b14] p-2.5 rounded-xl border border-white/[0.06] space-y-1.5">
              <div className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ជ្រើសរើសរហ័ស (Popular 3D Styles):</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: '3d_isometric_studio', label: '📐 Isometric' },
                  { id: '3d_starfield_warp', label: '✨ Starfield' },
                  { id: '3d_cyber_grid_floor', label: '🌐 Cyber Grid' },
                  { id: '3d_anaglyph_stereo', label: '🕶️ Anaglyph' },
                  { id: '3d_text_gold3d', label: '🌟 Gold 3D' },
                  { id: '3d_motion_breathe', label: '🫁 Breathe 3D' },
                  { id: '3d_motion_vertigo_dolly', label: '🌀 Vertigo' }
                ].map((quick) => (
                  <button
                    key={quick.id}
                    type="button"
                    onClick={() => {
                      onChangeEffects({
                        ...effects,
                        effect3dEnabled: true,
                        effect3dPreset: quick.id
                      });
                      onShowToast(`បានជ្រើសរើស Effect 3D: ${quick.label}`, 'success');
                    }}
                    className={`px-2 py-1 rounded text-[10.5px] font-semibold whitespace-nowrap transition-all border ${
                      effects.effect3dPreset === quick.id && effects.effect3dEnabled
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                        : 'bg-[#0b101d] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: 3D Intensity & Depth */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>កម្លាំងប្រសិទ្ធភាព (3D Intensity)</span>
                  <span className="font-mono text-amber-400">{effects.effect3dIntensity ?? 80}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={effects.effect3dIntensity ?? 80}
                  onChange={(e) =>
                    onChangeEffects({
                      ...effects,
                      effect3dIntensity: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-1 accent-amber-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>ជម្រៅ 3 វិមាត្រ (Spatial Perspective Depth)</span>
                  <span className="font-mono text-rose-400">{effects.effect3dDepth ?? 75}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={effects.effect3dDepth ?? 75}
                  onChange={(e) =>
                    onChangeEffects({
                      ...effects,
                      effect3dDepth: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-1 accent-rose-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="ស្វែងរក Effect 3D (Isometric, IMAX, Starfield, Cyber Grid, Anaglyph, Gold, Vertigo...)"
                  value={effect3dSearch}
                  onChange={(e) => setEffect3dSearch(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {categories3D.map((cat) => {
                  const count =
                    cat === 'All'
                      ? EFFECT_3D_PRESETS.length
                      : EFFECT_3D_PRESETS.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelected3dCategory(cat)}
                      className={`px-2 py-1 rounded text-[10.5px] whitespace-nowrap transition-all flex items-center gap-1 ${
                        selected3dCategory === cat
                          ? 'bg-amber-500 text-black font-bold shadow-sm'
                          : 'bg-[#070b14] text-slate-400 hover:text-slate-200 border border-white/[0.04]'
                      }`}
                    >
                      <span>{cat.replace('3D ', '')}</span>
                      <span className="opacity-75 font-mono text-[9px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid of 118 3D Effects */}
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 bg-[#070b14] rounded-xl border border-white/[0.06]">
              {filtered3dEffects.map((item) => {
                const isSelected = effects.effect3dPreset === item.id && effects.effect3dEnabled;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const patch: Partial<VideoEffects> = {
                        effect3dEnabled: true,
                        effect3dPreset: item.id
                      };
                      // Also activate corresponding 3D Title if this is a typography preset
                      if (item.titleStylePreset) {
                        patch.styleText = {
                          ...(effects.styleText || {
                            enabled: true,
                            title: 'សង្គ្រាមអាទិទេព',
                            subtitle: 'បញ្ចូលសំឡេងខ្មែរដោយ AI Dubbing',
                            badge: 'ភាគ ០១ - ចប់',
                            stylePreset: 'gold3d',
                            position: 'bottom-left',
                            fontSize: 26,
                            fontFamily: 'Koulen',
                            showBanner: true,
                          }),
                          enabled: true,
                          stylePreset: item.titleStylePreset,
                        };
                      }
                      onChangeEffects({ ...effects, ...patch });
                      onShowToast(`🎉 បានជ្រើសរើស Effect 3D: ${item.label}`, 'success');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between gap-1 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500/25 via-rose-500/20 to-purple-600/25 border-amber-400 text-white shadow-md'
                        : 'bg-[#0b101d] border-white/[0.06] text-slate-300 hover:border-amber-400/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="text-[11.5px] font-bold truncate leading-snug">{item.label}</div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                    </div>
                    <div className="text-[9.5px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] mt-0.5 text-[9px] text-slate-500">
                      <span className="truncate">{item.category.replace('3D ', '')}</span>
                      <span className="text-amber-400/90 font-mono font-bold">3D FX</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 2: WATERMARK & COPYRIGHT ======================= */}
        {activeTab === 'watermark' && (
          <div className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>បើក Watermark ការពារកម្មសិទ្ធិ (Copyright Protection)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  បង្ហាញឡូហ្គោ ឬអក្សរកម្មសិទ្ធិបញ្ញាលើផ្ទៃវីដេអូ ដើម្បីការពារការលួចចម្លង
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateWatermark({ enabled: !currentWatermark.enabled })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentWatermark.enabled
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {currentWatermark.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Watermark Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">អក្សរ Watermark / ឈ្មោះឆានែល</label>
              <input
                type="text"
                value={currentWatermark.text}
                onChange={(e) => updateWatermark({ text: e.target.value })}
                placeholder="ឧទាហរណ៍៖ © សម្រាយរឿង HD - អាទិទេព DABBER PRO"
                className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-amber-400 font-medium"
              />
            </div>

            {/* 5-Point Position Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Move className="w-3.5 h-3.5 text-amber-400" />
                <span>ទីតាំង Watermark លើអេក្រង់</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#070b14] p-2 rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => updateWatermark({ position: 'top-left' })}
                  className={`p-1.5 rounded text-[11px] font-semibold border ${
                    currentWatermark.position === 'top-left'
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  ↖ លើ ឆ្វេង
                </button>
                <button
                  type="button"
                  onClick={() => updateWatermark({ position: 'center' })}
                  className={`p-1.5 rounded text-[11px] font-semibold border ${
                    currentWatermark.position === 'center'
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  ⏺ កណ្តាល
                </button>
                <button
                  type="button"
                  onClick={() => updateWatermark({ position: 'top-right' })}
                  className={`p-1.5 rounded text-[11px] font-semibold border ${
                    currentWatermark.position === 'top-right'
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  ↗ លើ ស្តាំ (Default)
                </button>
                <button
                  type="button"
                  onClick={() => updateWatermark({ position: 'bottom-left' })}
                  className={`p-1.5 rounded text-[11px] font-semibold border ${
                    currentWatermark.position === 'bottom-left'
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  ↙ ក្រោម ឆ្វេង
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => updateWatermark({ position: 'bottom-right' })}
                  className={`p-1.5 rounded text-[11px] font-semibold border ${
                    currentWatermark.position === 'bottom-right'
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  ↘ ក្រោម ស្តាំ
                </button>
              </div>
            </div>

            {/* Opacity & Font Size Sliders */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>កម្រិតថ្លា (Opacity)</span>
                  <span className="font-mono text-amber-400">{currentWatermark.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={currentWatermark.opacity}
                  onChange={(e) => updateWatermark({ opacity: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-amber-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>ទំហំអក្សរ (Font Size)</span>
                  <span className="font-mono text-amber-400">{currentWatermark.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={currentWatermark.fontSize}
                  onChange={(e) => updateWatermark({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-amber-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Badge Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300">បង្ហាញស្លាកកញ្ចក់ការពារ (Badge Pill)</span>
                <input
                  type="checkbox"
                  checked={currentWatermark.showBadge}
                  onChange={(e) => updateWatermark({ showBadge: e.target.checked })}
                  className="accent-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: STYLED TEXT & 3D TITLE ======================= */}
        {activeTab === 'styletext' && (
          <div className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>បើក អក្សរ Style លើ Video (3D Theatrical Banner)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  បង្ហាញចំណងជើងរឿង អក្សរ 3D និងស្លាកភាគលើវីដេអូផ្ទាល់
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateStyleText({ enabled: !currentStyleText.enabled })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentStyleText.enabled
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {currentStyleText.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* 1-Click Sync from Thumbnail Poster Cover */}
            <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between gap-3 shadow-md">
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>ចម្លង Style ពី Poster Cover (1-Click Sync)</span>
                </div>
                <div className="text-[10.5px] text-slate-300 mt-0.5 leading-snug">
                  យកអក្សរមាស 3D, ចំណងជើង និងស្លាកភាគពីផ្ទាំង Thumbnail មកដាក់លើវីដេអូផ្ទាល់
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  let synced = false;
                  try {
                    const raw = localStorage.getItem('dabber_thumbnail_autosave');
                    if (raw) {
                      const tpl = JSON.parse(raw);
                      updateStyleText({
                        enabled: true,
                        title: tpl.title || 'ពិភពស្ដេចអមតៈ',
                        subtitle: tpl.subtitle || 'បច្ចេកវិទ្យាកំពូលសម័យអនាគត',
                        badge: tpl.badge || 'ភាគ ០១ - ចប់',
                        stylePreset: tpl.effectStyle || 'gold3d',
                        fontFamily: tpl.fontFamily || 'Koulen',
                        fontSize: Math.min(48, Math.max(22, Math.round((tpl.fontSize || 58) * 0.6))),
                        position: 'free',
                        posX: tpl.posX ?? 10,
                        posY: tpl.posY ?? 82,
                        textAlign: tpl.textAlign || 'left',
                        rotationAngle: tpl.rotationAngle || 0,
                        showBanner: tpl.bgBanner !== 'none',
                        depth3D: tpl.depth3D ?? 6,
                        glowIntensity: tpl.glowIntensity ?? 16,
                        strokeWidth: tpl.strokeWidth ?? 5,
                      });
                      synced = true;
                    }
                  } catch (_) {}
                  if (!synced) {
                    updateStyleText({
                      enabled: true,
                      title: 'ពិភពស្ដេចអមតៈ',
                      subtitle: 'បច្ចេកវិទ្យាកំពូលសម័យអនាគត',
                      badge: 'ភាគ ០១ - ចប់',
                      stylePreset: 'gold3d',
                      fontFamily: 'Koulen',
                      fontSize: 32,
                      position: 'free',
                      posX: 10,
                      posY: 82,
                      textAlign: 'left',
                      rotationAngle: 0,
                      showBanner: true,
                      depth3D: 6,
                      glowIntensity: 18,
                      strokeWidth: 5,
                    });
                  }
                  onShowToast('🎉 បានចម្លង Style & ទីតាំងពី Thumbnail Poster ដាក់លើវីដេអូបានជោគជ័យ 100%!', 'success');
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all whitespace-nowrap"
              >
                យក Style ដូច Poster
              </button>
            </div>

            {/* Inputs: Title, Subtitle, Badge */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300">ចំណងជើងធំ (Main Title)</label>
                <input
                  type="text"
                  value={currentStyleText.title}
                  onChange={(e) => updateStyleText({ title: e.target.value })}
                  placeholder="ឧទាហរណ៍៖ សង្គ្រាមអាទិទេព"
                  className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-white px-3 py-1.5 rounded-lg outline-none focus:border-rose-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">អក្សររៀបរាប់ក្រោម (Subtitle Tagline)</label>
                <input
                  type="text"
                  value={currentStyleText.subtitle}
                  onChange={(e) => updateStyleText({ subtitle: e.target.value })}
                  placeholder="ឧទាហរណ៍៖ បញ្ចូលសំឡេងខ្មែរដោយ AI Dubbing"
                  className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-slate-300 px-3 py-1.5 rounded-lg outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">ស្លាកភាគ (Episode Badge)</label>
                <input
                  type="text"
                  value={currentStyleText.badge}
                  onChange={(e) => updateStyleText({ badge: e.target.value })}
                  placeholder="ឧទាហរណ៍៖ ភាគ ០១ - ចប់"
                  className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-rose-300 px-3 py-1.5 rounded-lg outline-none focus:border-rose-400 font-mono font-bold"
                />
              </div>
            </div>

            {/* 12+ 3D Style Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">ស្ទាយអក្សរ 3D ភាពយន្ត (3D Movie Title Presets)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gold3d', label: '👑 ទឹកមាស 3D (Gold Cinema)', desc: 'ពណ៌មាសរលោង 3D Bevel' },
                  { id: 'cyberpunk', label: '⚡ Cyber Neon (Cyan/Pink)', desc: 'ពន្លឺ Neon ពណ៌ខៀវផ្កាឈូក' },
                  { id: 'fire', label: '🔥 ភ្លើងកក្រើក (Inferno Dragon)', desc: 'ភ្លើងក្រហមទឹកក្រូច' },
                  { id: 'neon', label: '💎 Cyan Glow Neon', desc: 'ពន្លឺ Neon ខៀវស្រាល' },
                  { id: 'sapphire', label: '🌊 Sapphire Blue', desc: 'ពណ៌ទឹកប៊ិចរលោង' },
                  { id: 'crimson_shadow', label: '🩸 ភ័យរន្ធត់ (Blood Horror)', desc: 'ក្រហមឈាម ខ្មោចព្រាយ' },
                  { id: 'jade_celestial', label: '🌿 ត្បូងមរកត (Emerald Jade)', desc: 'បៃតងរស្មី ទេវកថា' },
                  { id: 'silver_blade', label: '⚔️ ផ្លែដាវប្រាក់ (Silver Blade)', desc: 'ចាំងពន្លឺមុតស្រួច Wuxia' },
                  { id: 'diamond_prism', label: '💎 ត្បូងពេជ្រ (Diamond Prism)', desc: 'ចាំងពន្លឺ 3D គ្រីស្តាល់' },
                  { id: 'cinema', label: '⚪ Monolith 3D (Hollywood White)', desc: 'សសុទ្ធ Hollywood 3D' },
                  { id: 'glass', label: '🧊 Glass Frosted', desc: 'កញ្ចក់ថ្លា Minimal' },
                  { id: 'anime', label: '✨ Shonen Anime Glow', desc: 'ពន្លឺ Anime ទេពកោសល្យ' },
                ].map((st) => {
                  const isSelected = currentStyleText.stylePreset === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateStyleText({ stylePreset: st.id as any })}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : 'bg-[#070b14] border-white/[0.06] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{st.label}</div>
                      <div className="text-[9.5px] text-slate-500 truncate">{st.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9-Point Alignment Grid */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">ទីតាំងរហ័ស 9 ចំណុច (9-Point Position)</span>
                <span className="text-[10px] text-amber-400 font-mono">ចុចដើម្បីដាក់ទីតាំង</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'top-left', label: '↖️ លើឆ្វេង', x: 10, y: 15, align: 'left' as const },
                  { id: 'top', label: '⬆️ លើកណ្តាល', x: 50, y: 15, align: 'center' as const },
                  { id: 'top-right', label: '↗️ លើស្តាំ', x: 90, y: 15, align: 'right' as const },
                  { id: 'mid-left', label: '⬅️ កណ្តាលឆ្វេង', x: 10, y: 50, align: 'left' as const },
                  { id: 'center', label: '⏺️ ចំកណ្តាល', x: 50, y: 50, align: 'center' as const },
                  { id: 'mid-right', label: '➡️ កណ្តាលស្តាំ', x: 90, y: 50, align: 'right' as const },
                  { id: 'bottom-left', label: '↙️ ក្រោមឆ្វេង (Cinema)', x: 10, y: 82, align: 'left' as const },
                  { id: 'bottom-center', label: '⬇️ ក្រោមកណ្តាល', x: 50, y: 82, align: 'center' as const },
                  { id: 'bottom-right', label: '↘️ ក្រោមស្តាំ', x: 90, y: 82, align: 'right' as const },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() =>
                      updateStyleText({
                        position: 'free',
                        posX: btn.x,
                        posY: btn.y,
                        textAlign: btn.align,
                      })
                    }
                    className="py-1.5 px-1 text-[10.5px] rounded-lg bg-white/[0.04] hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-white/[0.05] transition-all font-medium text-center"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Free Positioning Sliders (ដូច Thumbnail 100%) */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">កូអរដោនេរំកិលអក្សរ (Custom X & Y)</span>
                <span className="text-[11px] font-mono text-amber-400">
                  X: {currentStyleText.posX ?? 10}% | Y: {currentStyleText.posY ?? 82}%
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>↔️ ទីតាំងផ្តេក (Horizontal X)</span>
                  <span className="font-mono text-amber-400 font-bold">{currentStyleText.posX ?? 10}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="98"
                  value={currentStyleText.posX ?? 10}
                  onChange={(e) => updateStyleText({ position: 'free', posX: Number(e.target.value) })}
                  className="w-full h-1.5 accent-amber-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>↕️ ទីតាំងបញ្ឈរ (Vertical Y)</span>
                  <span className="font-mono text-amber-400 font-bold">{currentStyleText.posY ?? 82}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={currentStyleText.posY ?? 82}
                  onChange={(e) => updateStyleText({ position: 'free', posY: Number(e.target.value) })}
                  className="w-full h-1.5 accent-amber-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">តម្រឹមអក្សរ (Alignment)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'left', label: 'ឆ្វេង' },
                    { id: 'center', label: 'កណ្តាល' },
                    { id: 'right', label: 'ស្តាំ' },
                  ].map((al) => (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => updateStyleText({ textAlign: al.id as any })}
                      className={`py-1 rounded-lg text-xs font-semibold border transition-all ${
                        (currentStyleText.textAlign || 'left') === al.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      {al.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>ទំហំអក្សរ (Font Size)</span>
                  <span className="font-mono text-amber-400 font-bold">{currentStyleText.fontSize || 28}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="60"
                  value={currentStyleText.fontSize || 28}
                  onChange={(e) => updateStyleText({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 accent-amber-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Rotation Angle */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>មុំផ្អៀង / បង្វិល (Rotation Angle)</span>
                  <span className="font-mono text-sky-400 font-bold">{currentStyleText.rotationAngle || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={currentStyleText.rotationAngle || 0}
                  onChange={(e) => updateStyleText({ rotationAngle: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-xs text-slate-300">បង្ហាញប្រអប់កញ្ចក់ខាងក្រោយ (Glass Banner)</span>
                <input
                  type="checkbox"
                  checked={currentStyleText.showBanner}
                  onChange={(e) => updateStyleText({ showBanner: e.target.checked })}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: SUBTITLES PRESETS ======================= */}
        {activeTab === 'subtitles' && (
          <div className="space-y-4">
            {/* Search & Categories */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="ស្វែងរក Subtitle Style (Netflix, Anime, Golden, Comic...)"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {subCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSubCategory(cat)}
                    className={`px-2 py-1 rounded text-[10.5px] whitespace-nowrap transition-all ${
                      selectedSubCategory === cat
                        ? 'bg-purple-500 text-white font-semibold'
                        : 'bg-[#070b14] text-slate-400 hover:text-slate-200 border border-white/[0.04]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Subtitle Presets */}
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-[#070b14] rounded-xl border border-white/[0.06]">
              {filteredSubs.map((sub) => {
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onChangeSubtitleStyle({
                        fontSize: sub.fontSize,
                        fontFamily: sub.fontFamily,
                        textColor: sub.textColor,
                        strokeColor: sub.strokeColor,
                        strokeWidth: sub.strokeWidth,
                        backgroundColor: sub.backgroundColor,
                        position: subtitleStyle.position || 'bottom',
                        animation: sub.animation || 'none',
                      });
                      onShowToast(`បានជ្រើសរើស Subtitle: ${sub.label}`, 'success');
                    }}
                    className="p-2.5 rounded-lg border border-white/[0.06] bg-[#0b101d] text-left hover:border-purple-400/50 hover:bg-purple-500/10 transition-all group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-purple-300 truncate">
                      {sub.label}
                    </div>
                    <div
                      className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{
                        backgroundColor: sub.backgroundColor,
                        color: sub.textColor,
                        fontFamily: sub.fontFamily,
                        border: sub.strokeWidth > 0 ? `1px solid ${sub.strokeColor}` : 'none',
                      }}
                    >
                      អក្សរគំរូ Sample
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Manual Subtitle Adjustments */}
            <div className="space-y-3 bg-[#070b14] p-3 rounded-xl border border-white/[0.06]">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-purple-400" />
                <span>កែសម្រួល Subtitle ដោយដៃ</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>ទំហំអក្សរ (Font Size)</span>
                  <span className="font-mono text-purple-400">{subtitleStyle.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="36"
                  value={subtitleStyle.fontSize}
                  onChange={(e) => onChangeSubtitleStyle({ ...subtitleStyle, fontSize: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-purple-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>កម្រាស់គែមខ្មៅ (Stroke Width)</span>
                  <span className="font-mono text-purple-400">{subtitleStyle.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={subtitleStyle.strokeWidth}
                  onChange={(e) => onChangeSubtitleStyle({ ...subtitleStyle, strokeWidth: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-purple-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 5: AUDIO EFFECTS ======================= */}
        {activeTab === 'audio' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="ស្វែងរក Audio FX (Cinema Reverb, Bass Boost, Anime, Walkie...)"
                value={audioSearch}
                onChange={(e) => setAudioSearch(e.target.value)}
                className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {filteredAudios.map((aud) => (
                <button
                  key={aud.id}
                  onClick={() => onShowToast(`បានជ្រើសរើសសំឡេង Effect: ${aud.label}`, 'success')}
                  className="p-2.5 rounded-lg border border-white/[0.06] bg-[#070b14] text-left hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="text-[11px] font-bold text-white group-hover:text-emerald-300">
                    {aud.label}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{aud.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
