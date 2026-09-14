import React, { useState } from 'react';
import { 
  Smile, Frown, Heart, Zap, Volume2, Mic, 
  TrendingUp, TrendingDown, Wind, Droplet, Flame, Sparkles 
} from 'lucide-react';

export type VoiceEmotion = 
  | 'neutral'    // ធម្មតា
  | 'happy'      // អរ រីករាយ
  | 'sad'        // ក្រៀមក្រំ យំ
  | 'angry'      // ខឹង ស្រែក
  | 'excited'    // រំភើប
  | 'scared'     // ភ័យ
  | 'whisper'    // និយាយស្រាល
  | 'shout'      // ស្រែកខ្លាំង
  | 'laugh'      // សើច
  | 'cry';       // យំ

export interface EmotionalVoiceConfig {
  emotion: VoiceEmotion;
  intensity: number;      // 0-100 (កម្រិតអារម្មណ៍)
  volume: number;         // 0-100 (កម្រិតសំឡេង)
  speed: number;          // 0.5-2.0 (ល្បឿននិយាយ)
  pitch: number;          // -12 to +12 (សំឡេងខ្ពស់/ទាប)
  breathiness: number;    // 0-100 (សំឡេងដង្ហើម)
  raspiness: number;      // 0-100 (សំឡេងរម៉ាត់)
  vibrato: number;        // 0-100 (ញ័រសំឡេង)
}

const EMOTION_PRESETS: Record<VoiceEmotion, Partial<EmotionalVoiceConfig>> = {
  neutral: { intensity: 50, volume: 70, speed: 1.0, pitch: 0, breathiness: 20, raspiness: 10 },
  happy: { intensity: 80, volume: 80, speed: 1.1, pitch: 2, breathiness: 15, raspiness: 5, vibrato: 30 },
  sad: { intensity: 60, volume: 50, speed: 0.85, pitch: -2, breathiness: 40, raspiness: 20, vibrato: 10 },
  angry: { intensity: 95, volume: 90, speed: 1.2, pitch: 1, breathiness: 10, raspiness: 60, vibrato: 5 },
  excited: { intensity: 90, volume: 85, speed: 1.3, pitch: 4, breathiness: 25, raspiness: 15, vibrato: 40 },
  scared: { intensity: 70, volume: 60, speed: 1.1, pitch: 3, breathiness: 50, raspiness: 30, vibrato: 60 },
  whisper: { intensity: 30, volume: 30, speed: 0.9, pitch: -1, breathiness: 80, raspiness: 5, vibrato: 5 },
  shout: { intensity: 100, volume: 100, speed: 1.0, pitch: 5, breathiness: 5, raspiness: 70, vibrato: 20 },
  laugh: { intensity: 85, volume: 75, speed: 1.2, pitch: 3, breathiness: 30, raspiness: 25, vibrato: 50 },
  cry: { intensity: 75, volume: 55, speed: 0.8, pitch: -3, breathiness: 60, raspiness: 40, vibrato: 70 },
};

interface EmotionalVoiceEngineProps {
  onConfigChange: (config: EmotionalVoiceConfig) => void;
  currentEmotion?: VoiceEmotion;
}

export const EmotionalVoiceEngine: React.FC<EmotionalVoiceEngineProps> = ({
  onConfigChange,
  currentEmotion = 'neutral',
}) => {
  const [config, setConfig] = useState<EmotionalVoiceConfig>({
    emotion: currentEmotion,
    intensity: 50,
    volume: 70,
    speed: 1.0,
    pitch: 0,
    breathiness: 20,
    raspiness: 10,
    vibrato: 20,
  });

  const handleEmotionChange = (emotion: VoiceEmotion) => {
    const preset = EMOTION_PRESETS[emotion];
    const newConfig = { ...config, emotion, ...preset };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleParameterChange = (param: keyof EmotionalVoiceConfig, value: number) => {
    const newConfig = { ...config, [param]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Emotion Selector */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          ជ្រើសរើសអារម្មណ៍សំឡេង (Voice Emotion)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {(Object.keys(EMOTION_PRESETS) as VoiceEmotion[]).map((emotion) => {
            const isActive = config.emotion === emotion;
            const EmotionIcon = getEmotionIcon(emotion);
            const emotionLabel = getEmotionLabel(emotion);
            
            return (
              <button
                key={emotion}
                onClick={() => handleEmotionChange(emotion)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 scale-105'
                    : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:bg-white/[0.05] hover:border-sky-500/30'
                }`}
              >
                <EmotionIcon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="text-[10px] font-semibold text-center leading-tight">
                  {emotionLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-indigo-400" />
          ការកែសម្រួលលម្អិត (Advanced Controls)
        </h3>

        {/* Intensity */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              កម្រិតអារម្មណ៍ (Intensity)
            </span>
            <span className="text-sky-400 font-mono">{config.intensity}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.intensity}
            onChange={(e) => handleParameterChange('intensity', Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        {/* Volume */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-green-400" />
              កម្រិតសំឡេង (Volume)
            </span>
            <span className="text-sky-400 font-mono">{config.volume}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.volume}
            onChange={(e) => handleParameterChange('volume', Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>

        {/* Speed */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              ល្បឿននិយាយ (Speed)
            </span>
            <span className="text-sky-400 font-mono">{config.speed.toFixed(2)}x</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={config.speed}
            onChange={(e) => handleParameterChange('speed', Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>

        {/* Pitch */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {config.pitch >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
              )}
              កម្ពស់សំឡេង (Pitch)
            </span>
            <span className="text-sky-400 font-mono">
              {config.pitch > 0 ? '+' : ''}{config.pitch}
            </span>
          </label>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={config.pitch}
            onChange={(e) => handleParameterChange('pitch', Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Breathiness */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              សំឡេងដង្ហើម (Breathiness)
            </span>
            <span className="text-sky-400 font-mono">{config.breathiness}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.breathiness}
            onChange={(e) => handleParameterChange('breathiness', Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Raspiness */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-red-400" />
              សំឡេងរ៉ាម៉ាត់ (Raspiness)
            </span>
            <span className="text-sky-400 font-mono">{config.raspiness}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.raspiness}
            onChange={(e) => handleParameterChange('raspiness', Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>

        {/* Vibrato */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              ញ័រសំឡេង (Vibrato)
            </span>
            <span className="text-sky-400 font-mono">{config.vibrato}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.vibrato}
            onChange={(e) => handleParameterChange('vibrato', Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/30 rounded-lg p-4">
        <p className="text-xs text-sky-300 leading-relaxed">
          <strong>💡 គន្លឹះ:</strong> អារម្មណ៍សំឡេងនីមួយៗត្រូវបានកំណត់ជាស្រេចសម្រាប់សា situation ផ្សេងៗគ្នា។ 
          អ្នកអាចកែសម្រួលលម្អិតបន្ថែមតាម Advanced Controls ខាងលើ។
        </p>
      </div>
    </div>
  );
};

// Helper functions
function getEmotionIcon(emotion: VoiceEmotion) {
  const icons = {
    neutral: Mic,
    happy: Smile,
    sad: Frown,
    angry: Flame,
    excited: Sparkles,
    scared: Droplet,
    whisper: Wind,
    shout: Volume2,
    laugh: Heart,
    cry: Droplet,
  };
  return icons[emotion] || Mic;
}

function getEmotionLabel(emotion: VoiceEmotion): string {
  const labels: Record<VoiceEmotion, string> = {
    neutral: '😐 ធម្មតា',
    happy: '😊 អរ រីករាយ',
    sad: '😢 ក្រៀមក្រំ',
    angry: '😠 ខឹង ស្រែក',
    excited: '🤩 រំភើប',
    scared: '😨 ភ័យ',
    whisper: '🤫 ស្រាល',
    shout: '📢 ស្រែកខ្លាំង',
    laugh: '😂 សើច',
    cry: '😭 យំ',
  };
  return labels[emotion];
}
