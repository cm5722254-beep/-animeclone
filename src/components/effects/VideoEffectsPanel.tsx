import React from 'react';
import { Sliders, Sparkles, Type, Film, RotateCcw, Eye } from 'lucide-react';
import { VideoEffects, SubtitleStyle } from '../../types';

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
  const [activeTab, setActiveTab] = React.useState<'video' | 'subtitles'>('video');

  const lutPresets = [
    { id: 'none', label: 'ធម្មតា (Default)' },
    { id: 'teal_orange', label: '🎬 Teal & Orange' },
    { id: 'warm_film', label: '🌅 Warm Cinema' },
    { id: 'moody_noir', label: '🎞️ Moody Noir' },
    { id: 'vibrant_anime', label: '✨ Vibrant Anime' },
  ];

  const aspectRatios = [
    { id: '16:9', label: '16:9 Landscape', desc: 'YouTube & TV' },
    { id: '9:16', label: '9:16 Vertical', desc: 'TikTok, Reels, Shorts' },
    { id: '1:1', label: '1:1 Square', desc: 'Facebook & Instagram' },
    { id: '4:3', label: '4:3 Classic', desc: 'Traditional Frame' },
  ];

  const resetVideoEffects = () => {
    onChangeEffects({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sepia: 0,
      blur: 0,
      aspectRatio: '16:9',
      lutPreset: 'none',
    });
    onShowToast('បានកំណត់ Video Effects ឡើងវិញ', 'info');
  };

  const resetSubtitleStyle = () => {
    onChangeSubtitleStyle({
      fontSize: 20,
      fontFamily: 'Kantumruy Pro',
      textColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      backgroundColor: 'rgba(0,0,0,0.6)',
      position: 'bottom',
      animation: 'none',
    });
    onShowToast('បានកំណត់ Subtitle Style ឡើងវិញ', 'info');
  };

  return (
    <div className="bg-[#0b101d] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-4">
      {/* Tab Selector */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'video'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Video Effects & Filters
          </button>
          <button
            onClick={() => setActiveTab('subtitles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'subtitles'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Subtitle Styling
          </button>
        </div>

        <button
          onClick={activeTab === 'video' ? resetVideoEffects : resetSubtitleStyle}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          title="កំណត់ឡើងវិញ"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {activeTab === 'video' ? (
        <div className="space-y-4">
          {/* Aspect Ratio Presets */}
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
                  <p className="text-xs font-bold">{ar.label}</p>
                  <p className="text-[10px] text-slate-500">{ar.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cinematic LUT Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Cinematic Filter Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {lutPresets.map((lut) => (
                <button
                  key={lut.id}
                  onClick={() => onChangeEffects({ ...effects, lutPreset: lut.id as any })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    effects.lutPreset === lut.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                      : 'bg-[#070b14] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lut.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fine Tuning Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#070b14] p-3 rounded-xl border border-white/[0.06]">
            {/* Brightness */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Brightness (ពន្លឺ)</span>
                <span className="text-sky-400 font-mono font-medium">{effects.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={effects.brightness}
                onChange={(e) => onChangeEffects({ ...effects, brightness: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Contrast (ភាពដិតពណ៌)</span>
                <span className="text-sky-400 font-mono font-medium">{effects.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={effects.contrast}
                onChange={(e) => onChangeEffects({ ...effects, contrast: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Saturation (កម្រិតពណ៌)</span>
                <span className="text-sky-400 font-mono font-medium">{effects.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={effects.saturation}
                onChange={(e) => onChangeEffects({ ...effects, saturation: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Sepia */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Sepia / Vintage (បែបបុរាណ)</span>
                <span className="text-amber-400 font-mono font-medium">{effects.sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effects.sepia}
                onChange={(e) => onChangeEffects({ ...effects, sepia: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Subtitle Font & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Font Family (ពុម្ពអក្សរខ្មែរ)
              </label>
              <select
                value={subtitleStyle.fontFamily}
                onChange={(e) => onChangeSubtitleStyle({ ...subtitleStyle, fontFamily: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#070b14] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Kantumruy Pro">Kantumruy Pro (ទំនើប ច្បាស់ល្អ)</option>
                <option value="Battambang">Battambang (ស្តង់ដារ)</option>
                <option value="Moul">Moul (ក្បាច់ ចំណងជើងធំ)</option>
                <option value="Outfit">Outfit (ឡាតាំង)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Font Size (ទំហំអក្សរ)</span>
                <span className="text-sky-400 font-mono font-medium">{subtitleStyle.fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="36"
                value={subtitleStyle.fontSize}
                onChange={(e) => onChangeSubtitleStyle({ ...subtitleStyle, fontSize: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg mt-2"
              />
            </div>
          </div>

          {/* Subtitle Colors & Stroke */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#070b14] p-3 rounded-xl border border-white/[0.06]">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ពណ៌អក្សរ (Text Color)
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { color: '#ffffff', label: 'White' },
                  { color: '#facc15', label: 'Yellow' },
                  { color: '#38bdf8', label: 'Cyan' },
                  { color: '#4ade80', label: 'Green' },
                  { color: '#fb923c', label: 'Orange' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => onChangeSubtitleStyle({ ...subtitleStyle, textColor: c.color })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      subtitleStyle.textColor === c.color ? 'border-white scale-110 shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ទ្រនាប់ក្រោយ (Background)
              </label>
              <select
                value={subtitleStyle.backgroundColor}
                onChange={(e) => onChangeSubtitleStyle({ ...subtitleStyle, backgroundColor: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#0c1222] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="transparent">គ្មានទ្រនាប់ (Transparent)</option>
                <option value="rgba(0,0,0,0.5)">ខ្មៅព្រាល 50% (Subtle)</option>
                <option value="rgba(0,0,0,0.85)">ខ្មៅដិត 85% (High Contrast)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ទីតាំងលើកញ្ចក់ (Position)
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['bottom', 'center', 'top'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => onChangeSubtitleStyle({ ...subtitleStyle, position: pos })}
                    className={`py-1.5 rounded text-[11px] font-semibold capitalize border transition-all ${
                      subtitleStyle.position === pos
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-[#0c1222] border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle Live Preview Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/[0.08] text-center relative overflow-hidden">
            <div className="text-[10px] text-slate-500 absolute top-2 left-2 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Live Subtitle Preview
            </div>
            <div
              className="inline-block px-3 py-1 rounded mt-3"
              style={{
                fontSize: `${subtitleStyle.fontSize}px`,
                fontFamily: subtitleStyle.fontFamily,
                color: subtitleStyle.textColor,
                backgroundColor: subtitleStyle.backgroundColor,
                textShadow: subtitleStyle.strokeWidth > 0 ? `0 0 ${subtitleStyle.strokeWidth * 2}px ${subtitleStyle.strokeColor}` : 'none',
              }}
            >
              នេះជាគំរូអក្សររត់ Subtitle ភាសាខ្មែរក្នុងស្ទូឌីយោ!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
