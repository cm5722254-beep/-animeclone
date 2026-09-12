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
  Box,
  Minus,
  Plus,
  Edit3
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
  const [activeTab, setActiveTab] = useState<'video' | 'effect3d' | 'text3d' | 'watermark' | 'styletext' | 'subtitles' | 'audio'>('text3d');
  const [filterSearch, setFilterSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [audioSearch, setAudioSearch] = useState('');
  const [effect3dSearch, setEffect3dSearch] = useState('');
  const [text3dSearch, setText3dSearch] = useState('');
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

  // Filtered 3D Effects
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

  // Filtered 3D Text / Typography (100+ presets)
  const text3dPresets = EFFECT_3D_PRESETS.filter(p => p.category === '3D Titles & Typography');
  const filteredText3d = text3dPresets.filter((item) =>
    !text3dSearch ||
    item.label.toLowerCase().includes(text3dSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(text3dSearch.toLowerCase())
  );

  // Color palette for 3D text cards based on preset name keywords
  const getTextCardColors = (id: string): { bg: string; border: string; badge: string; preview: string } => {
    if (id.includes('gold') || id.includes('imperial') || id.includes('harvest')) return { bg: 'rgba(120,80,0,0.3)', border: '#f59e0b', badge: 'bg-amber-500', preview: 'linear-gradient(135deg,#fef08a,#f59e0b,#92400e)' };
    if (id.includes('fire') || id.includes('lava') || id.includes('volcano') || id.includes('dragon_fire') || id.includes('inferno') || id.includes('magma') || id.includes('phoenix') || id.includes('red_phoenix') || id.includes('burning')) return { bg: 'rgba(120,20,0,0.3)', border: '#ef4444', badge: 'bg-red-600', preview: 'linear-gradient(135deg,#fca5a5,#ef4444,#7f1d1d)' };
    if (id.includes('cyber') || id.includes('neon_cyan') || id.includes('hologram') || id.includes('plasma') || id.includes('electric') || id.includes('matrix') || id.includes('circuit')) return { bg: 'rgba(0,80,120,0.3)', border: '#06b6d4', badge: 'bg-cyan-500', preview: 'linear-gradient(135deg,#67e8f9,#06b6d4,#0e7490)' };
    if (id.includes('neon_pink') || id.includes('tokyo') || id.includes('vaporwave') || id.includes('candy') || id.includes('rose_gold') || id.includes('velvet_red') || id.includes('red_carpet') || id.includes('crimson') || id.includes('blood')) return { bg: 'rgba(120,0,80,0.3)', border: '#ec4899', badge: 'bg-pink-500', preview: 'linear-gradient(135deg,#f9a8d4,#ec4899,#831843)' };
    if (id.includes('jade') || id.includes('emerald') || id.includes('forest') || id.includes('bamboo') || id.includes('matrix_green') || id.includes('acid') || id.includes('potion') || id.includes('sunflower') || id.includes('neon_yellow')) return { bg: 'rgba(0,80,40,0.3)', border: '#10b981', badge: 'bg-emerald-500', preview: 'linear-gradient(135deg,#6ee7b7,#10b981,#064e3b)' };
    if (id.includes('silver') || id.includes('chrome') || id.includes('mecha') || id.includes('titanium') || id.includes('platinum') || id.includes('marble') || id.includes('carbon') || id.includes('warrior_iron') || id.includes('samurai') || id.includes('blade') || id.includes('obsidian')) return { bg: 'rgba(50,60,70,0.4)', border: '#94a3b8', badge: 'bg-slate-400', preview: 'linear-gradient(135deg,#f1f5f9,#94a3b8,#1e293b)' };
    if (id.includes('cosmic') || id.includes('nebula') || id.includes('space') || id.includes('galaxy') || id.includes('void') || id.includes('deep_space') || id.includes('aurora') || id.includes('midnight_galaxy') || id.includes('starlight')) return { bg: 'rgba(40,0,80,0.3)', border: '#a855f7', badge: 'bg-purple-500', preview: 'linear-gradient(135deg,#d8b4fe,#a855f7,#581c87)' };
    if (id.includes('ice') || id.includes('glacier') || id.includes('frost') || id.includes('frozen') || id.includes('arctic') || id.includes('snow') || id.includes('divine_frost')) return { bg: 'rgba(0,60,100,0.3)', border: '#38bdf8', badge: 'bg-sky-400', preview: 'linear-gradient(135deg,#bae6fd,#38bdf8,#075985)' };
    if (id.includes('sakura') || id.includes('cherry') || id.includes('romantic') || id.includes('pastel') || id.includes('peach') || id.includes('lotus') || id.includes('angel') || id.includes('koi') || id.includes('moonstone')) return { bg: 'rgba(120,40,80,0.2)', border: '#f472b6', badge: 'bg-pink-400', preview: 'linear-gradient(135deg,#fce7f3,#f472b6,#be185d)' };
    if (id.includes('khmer') || id.includes('ancient') || id.includes('pagoda') || id.includes('dragon_khmer') || id.includes('buddhist') || id.includes('scroll') || id.includes('pirate') || id.includes('wuxia') || id.includes('ink')) return { bg: 'rgba(80,40,0,0.3)', border: '#d97706', badge: 'bg-amber-600', preview: 'linear-gradient(135deg,#fde68a,#d97706,#451a03)' };
    if (id.includes('ocean') || id.includes('sapphire') || id.includes('turquoise') || id.includes('underwater') || id.includes('coral') || id.includes('lapis')) return { bg: 'rgba(0,40,100,0.3)', border: '#3b82f6', badge: 'bg-blue-500', preview: 'linear-gradient(135deg,#93c5fd,#3b82f6,#1e3a8a)' };
    if (id.includes('sunset') || id.includes('neon_orange') || id.includes('solar') || id.includes('tiger') || id.includes('copper')) return { bg: 'rgba(120,60,0,0.3)', border: '#f97316', badge: 'bg-orange-500', preview: 'linear-gradient(135deg,#fed7aa,#f97316,#7c2d12)' };
    if (id.includes('venom') || id.includes('midnight_black') || id.includes('vampire') || id.includes('gothic') || id.includes('blood_moon') || id.includes('sand_dune') || id.includes('volcanic_ash')) return { bg: 'rgba(10,10,20,0.6)', border: '#475569', badge: 'bg-slate-600', preview: 'linear-gradient(135deg,#64748b,#1e293b,#020617)' };
    if (id.includes('steampunk') || id.includes('brass') || id.includes('castle') || id.includes('stone') || id.includes('granite')) return { bg: 'rgba(60,40,10,0.4)', border: '#a16207', badge: 'bg-yellow-700', preview: 'linear-gradient(135deg,#fde68a,#a16207,#78350f)' };
    if (id.includes('rainbow') || id.includes('hologram_rainbow') || id.includes('peacock') || id.includes('prism')) return { bg: 'rgba(80,0,120,0.3)', border: '#c084fc', badge: 'bg-fuchsia-400', preview: 'linear-gradient(135deg,#f0abfc,#c084fc,#7e22ce)' };
    // default
    return { bg: 'rgba(30,40,60,0.4)', border: '#fbbf24', badge: 'bg-amber-400', preview: 'linear-gradient(135deg,#fef3c7,#fbbf24,#92400e)' };
  };

  return (
    <div className="bg-[#0b101d] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
      {/* Tab Selector & Reset Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
        <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-xl border border-white/[0.06] overflow-x-auto max-w-[320px] sm:max-w-none">
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
            onClick={() => setActiveTab('text3d')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'text3d'
                ? 'bg-gradient-to-r from-rose-500 via-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30'
                : 'text-fuchsia-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>អក្ស3D ({text3dPresets.length}+)</span>
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

        {/* ======================= TAB: អក្ស3D 100+ ======================= */}
        {activeTab === 'text3d' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-fuchsia-900/40 via-purple-900/40 to-rose-900/40 border border-fuchsia-500/30 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-fuchsia-300 to-purple-300">
                      អក្ស 3D — {text3dPresets.length}+ Effect Typography
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 mt-0.5">Gold · Neon · Fire · Ice · Dragon · Khmer · Cosmic · Wuxia · Cyberpunk · Romance · Horror...</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-fuchsia-400 font-bold">{filteredText3d.length} results</div>
                  <div className="text-[9px] text-slate-500">of {text3dPresets.length} total</div>
                </div>
              </div>
              {/* Active Preset */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.06]">
                <span className="text-slate-400">Effect 3D Text បច្ចុប្បន្ន:</span>
                <span className="font-bold font-mono text-fuchsia-300 truncate max-w-[200px]">
                  {EFFECT_3D_PRESETS.find(p => p.id === effects.effect3dPreset && p.category === '3D Titles & Typography')?.label || 'ជ្រើសរើស Effect ខាងក្រោម'}
                </span>
              </div>
            </div>

            {/* Quick Popular Picks */}
            <div className="bg-[#070b14] p-2.5 rounded-xl border border-white/[0.06]">
              <div className="text-[10.5px] font-bold text-fuchsia-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-fuchsia-400" />
                <span>ពេញនិយម (Popular Picks):</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: '3d_text_gold3d', label: '👑 Imperial Gold' },
                  { id: '3d_text_cyberpunk', label: '⚡ Cyberpunk' },
                  { id: '3d_text_lava_dragon', label: '🔥 Dragon Lava' },
                  { id: '3d_text_khmer_royal', label: '🇰🇭 Khmer Royal' },
                  { id: '3d_text_diamond_prism', label: '💎 Diamond' },
                  { id: '3d_text_cosmic_nebula', label: '🪐 Nebula' },
                  { id: '3d_text_glacier_ice', label: '🧊 Glacier Ice' },
                  { id: '3d_text_sakura_bloom', label: '🌸 Sakura' },
                  { id: '3d_text_rose_gold', label: '🌹 Rose Gold' },
                  { id: '3d_text_burning_phoenix', label: '🦅 Phoenix' },
                  { id: '3d_text_aurora_borealis', label: '🌌 Aurora' },
                  { id: '3d_text_hologram_rainbow', label: '🌈 Rainbow' },
                ].map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      const preset = EFFECT_3D_PRESETS.find(p => p.id === q.id);
                      onChangeEffects({
                        ...effects,
                        effect3dEnabled: true,
                        effect3dPreset: q.id,
                        styleText: {
                          ...(effects.styleText || { enabled: true, title: 'ចំណងជើងរឿង', subtitle: 'AI Dubbing', badge: 'ភាគ ០១', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                          enabled: true,
                          stylePreset: preset?.titleStylePreset || 'gold3d',
                        }
                      });
                      onShowToast(`🎉 Effect 3D Text: ${q.label}`, 'success');
                    }}
                    className={`px-2 py-1 rounded text-[10.5px] font-semibold whitespace-nowrap transition-all border ${
                      effects.effect3dPreset === q.id && effects.effect3dEnabled
                        ? 'bg-fuchsia-500/30 border-fuchsia-400 text-fuchsia-200'
                        : 'bg-[#0b101d] border-white/[0.06] text-slate-400 hover:text-white hover:border-fuchsia-400/40'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Edit & Scaling Controls for 3D Text */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-sky-500/30 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300">
                    កែសម្រួល & ពង្រីកបង្រួមអក្សរ 3D
                  </span>
                </span>
                <span className="text-[10px] text-sky-400/80 bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20 font-mono font-bold">
                  {effects.styleText?.fontSize || 28}px
                </span>
              </div>

              {/* Title, Subtitle, Badge Inputs */}
              <div className="space-y-1.5">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-slate-400">ចំណងជើងធំ (Main Title)</label>
                  <input
                    type="text"
                    value={effects.styleText?.title || ''}
                    onChange={(e) => {
                      onChangeEffects({
                        ...effects,
                        styleText: {
                          ...(effects.styleText || { enabled: true, title: '', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                          title: e.target.value,
                          enabled: true,
                        }
                      });
                    }}
                    placeholder="បញ្ចូលចំណងជើងរឿង..."
                    className="w-full bg-[#0b101d] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold outline-none focus:border-sky-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-slate-400">ចំណងជើងរង (Subtitle)</label>
                    <input
                      type="text"
                      value={effects.styleText?.subtitle || ''}
                      onChange={(e) => {
                        onChangeEffects({
                          ...effects,
                          styleText: {
                            ...(effects.styleText || { enabled: true, title: '', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                            subtitle: e.target.value,
                            enabled: true,
                          }
                        });
                      }}
                      placeholder="ចំណងជើងរង..."
                      className="w-full bg-[#0b101d] border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-slate-400">ស្លាកភាគ (Badge)</label>
                    <input
                      type="text"
                      value={effects.styleText?.badge || ''}
                      onChange={(e) => {
                        onChangeEffects({
                          ...effects,
                          styleText: {
                            ...(effects.styleText || { enabled: true, title: '', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                            badge: e.target.value,
                            enabled: true,
                          }
                        });
                      }}
                      placeholder="ភាគ ០១..."
                      className="w-full bg-[#0b101d] border border-white/10 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono font-bold outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Font Size Scale Slider with Quick - / + buttons */}
              <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                <div className="flex justify-between items-center text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3 text-sky-400" />
                    <span>ពង្រីក-បង្រួម (Font Size)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(14, (effects.styleText?.fontSize || 28) - 2);
                        onChangeEffects({
                          ...effects,
                          styleText: { ...(effects.styleText || { enabled: true, title: 'ចំណងជើង', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }), fontSize: next }
                        });
                      }}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                      title="បង្រួម (-2px)"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sky-400 min-w-[32px] text-center">
                      {effects.styleText?.fontSize || 28}px
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(90, (effects.styleText?.fontSize || 28) + 2);
                        onChangeEffects({
                          ...effects,
                          styleText: { ...(effects.styleText || { enabled: true, title: 'ចំណងជើង', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }), fontSize: next }
                        });
                      }}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                      title="ពង្រីក (+2px)"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="14"
                  max="90"
                  value={effects.styleText?.fontSize || 28}
                  onChange={(e) => {
                    onChangeEffects({
                      ...effects,
                      styleText: {
                        ...(effects.styleText || { enabled: true, title: 'ចំណងជើង', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                        fontSize: parseInt(e.target.value, 10),
                        enabled: true,
                      }
                    });
                  }}
                  className="w-full h-1.5 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {/* Position X & Y and Rotation Sliders */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-400 mb-0.5">
                    <span>ទីតាំង X (Left/Right)</span>
                    <span className="font-mono text-sky-400">{effects.styleText?.posX ?? 10}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={effects.styleText?.posX ?? 10}
                    onChange={(e) => {
                      onChangeEffects({
                        ...effects,
                        styleText: {
                          ...(effects.styleText || { enabled: true, title: 'ចំណងជើង', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                          position: 'free',
                          posX: parseInt(e.target.value, 10),
                          enabled: true,
                        }
                      });
                    }}
                    className="w-full h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-400 mb-0.5">
                    <span>ទីតាំង Y (Top/Bottom)</span>
                    <span className="font-mono text-sky-400">{effects.styleText?.posY ?? 82}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={effects.styleText?.posY ?? 82}
                    onChange={(e) => {
                      onChangeEffects({
                        ...effects,
                        styleText: {
                          ...(effects.styleText || { enabled: true, title: 'ចំណងជើង', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                          position: 'free',
                          posY: parseInt(e.target.value, 10),
                          enabled: true,
                        }
                      });
                    }}
                    className="w-full h-1 accent-sky-400 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Banner Card & Toggle Button */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    const cur = effects.styleText?.showBanner ?? true;
                    onChangeEffects({
                      ...effects,
                      styleText: {
                        ...(effects.styleText || { enabled: true, title: 'ចំណងជើង', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                        showBanner: !cur,
                        enabled: true,
                      }
                    });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    effects.styleText?.showBanner ?? true
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-white/[0.06] text-slate-400 border-white/[0.08]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{effects.styleText?.showBanner ?? true ? 'ផ្ទាំង Card: ON' : 'ផ្ទាំង Card: OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const cur = effects.styleText?.enabled ?? false;
                    onChangeEffects({
                      ...effects,
                      styleText: {
                        ...(effects.styleText || { enabled: true, title: 'ចំណងជើង', subtitle: '', badge: '', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                        enabled: !cur,
                      }
                    });
                    onShowToast(!cur ? '🎉 បានបើកអក្សរ 3D' : 'បានបិទអក្សរ 3D', !cur ? 'success' : 'info');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                    effects.styleText?.enabled
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-white/[0.06] text-slate-400 border-white/[0.08]'
                  }`}
                >
                  {effects.styleText?.enabled ? 'អក្សរ 3D: បង្ហាញ' : 'អក្សរ 3D: លាក់'}
                </button>
              </div>
            </div>

            {/* Intensity Sliders */}
            <div className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06] grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Text 3D Intensity</span>
                  <span className="font-mono text-fuchsia-400">{effects.effect3dIntensity ?? 80}%</span>
                </div>
                <input type="range" min="20" max="150" value={effects.effect3dIntensity ?? 80}
                  onChange={(e) => onChangeEffects({ ...effects, effect3dIntensity: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-fuchsia-400 bg-slate-800 rounded cursor-pointer" />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Text 3D Depth</span>
                  <span className="font-mono text-rose-400">{effects.effect3dDepth ?? 75}%</span>
                </div>
                <input type="range" min="20" max="150" value={effects.effect3dDepth ?? 75}
                  onChange={(e) => onChangeEffects({ ...effects, effect3dDepth: parseInt(e.target.value, 10) })}
                  className="w-full h-1 accent-rose-400 bg-slate-800 rounded cursor-pointer" />
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="ស្វែងរក Effect 3D Text (Gold, Fire, Neon, Ice, Dragon, Khmer, Sakura, Galaxy...)"
                value={text3dSearch}
                onChange={(e) => setText3dSearch(e.target.value)}
                className="w-full bg-[#070b14] border border-white/[0.08] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-fuchsia-400 transition-colors"
              />
            </div>

            {/* 100+ 3D Text Effects Grid — Color Preview Cards */}
            <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto p-1 bg-[#070b14] rounded-xl border border-white/[0.06]">
              {filteredText3d.length === 0 && (
                <div className="col-span-2 text-center text-slate-500 text-xs py-8">មិនមានលទ្ធផល — Try different keywords</div>
              )}
              {filteredText3d.map((item) => {
                const isSelected = effects.effect3dPreset === item.id && effects.effect3dEnabled;
                const colors = getTextCardColors(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeEffects({
                        ...effects,
                        effect3dEnabled: true,
                        effect3dPreset: item.id,
                        styleText: {
                          ...(effects.styleText || { enabled: true, title: 'ចំណងជើងរឿង', subtitle: 'AI Dubbing', badge: 'ភាគ ០១', stylePreset: 'gold3d', position: 'bottom-left', fontSize: 28, fontFamily: 'Koulen', showBanner: true }),
                          enabled: true,
                          stylePreset: item.titleStylePreset || 'gold3d',
                        }
                      });
                      onShowToast(`🎉 Effect 3D Text: ${item.label}`, 'success');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      isSelected
                        ? 'shadow-lg scale-[1.02]'
                        : 'hover:scale-[1.01] hover:shadow-md'
                    }`}
                    style={{
                      background: isSelected ? colors.bg.replace('0.3', '0.5') : colors.bg,
                      borderColor: isSelected ? colors.border : 'rgba(255,255,255,0.06)',
                      boxShadow: isSelected ? `0 0 12px ${colors.border}40` : undefined
                    }}
                  >
                    {/* Preview bar */}
                    <div className="h-1.5 rounded-full w-full opacity-90" style={{ background: colors.preview }} />
                    <div className="flex items-start justify-between gap-1">
                      <div className="text-[11px] font-bold truncate leading-snug" style={{ color: isSelected ? colors.border : '#e2e8f0' }}>
                        {item.label}
                      </div>
                      {isSelected && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white shrink-0 ${colors.badge}`}>ON</span>
                      )}
                    </div>
                    <div className="text-[9.5px] text-slate-400 line-clamp-1 leading-relaxed">{item.description}</div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-slate-500 truncate">3D Typography</span>
                      <span className="font-mono font-bold" style={{ color: colors.border }}>3D TEXT</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB: 3D EFFECTS & SPATIAL ENGINE ======================= */}
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

            {/* 3D Text Style Presets — Full 100+ palette from library */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>ស្ទាយ 3D Text ({text3dPresets.length}+ ជម្រើស)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('text3d')}
                  className="text-[10px] text-fuchsia-400 hover:text-fuchsia-300 font-semibold underline underline-offset-2 transition-colors"
                >
                  មើលទាំងអស់ →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 bg-[#070b14] rounded-xl border border-white/[0.06]">
                {text3dPresets.slice(0, 30).map((item) => {
                  const isSelected = currentStyleText.stylePreset === (item.titleStylePreset || '');
                  const colors = getTextCardColors(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        updateStyleText({ stylePreset: (item.titleStylePreset || 'gold3d') as any });
                        onChangeEffects({ ...effects, effect3dEnabled: true, effect3dPreset: item.id });
                      }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected ? 'shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                      style={{
                        background: isSelected ? colors.bg.replace('0.3', '0.5') : 'rgba(11,16,29,0.9)',
                        borderColor: isSelected ? colors.border : 'rgba(255,255,255,0.06)',
                        boxShadow: isSelected ? `0 0 10px ${colors.border}40` : undefined
                      }}
                    >
                      <div className="h-1 rounded-full mb-1" style={{ background: colors.preview }} />
                      <div className="text-[11px] font-bold truncate" style={{ color: isSelected ? colors.border : '#e2e8f0' }}>{item.label}</div>
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
