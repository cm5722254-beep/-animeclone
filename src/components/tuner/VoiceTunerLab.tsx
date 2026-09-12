import React, { useState } from 'react';
import { Activity, Play, Gauge, Music, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';

interface TunerProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VoiceTunerLab: React.FC<TunerProps> = ({ onShowToast }) => {
  const [voiceId, setVoiceId] = useState('movie-live-clone');
  const [text, setText] = useState('ទោះបីជាមេឃដួលរលំ ក៏បងមិនព្រមចាកចេញពីអូនដែរ!');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTune = async () => {
    setIsLoading(true);
    onShowToast('កំពុងសំយោគ & សារ៉េទឹកដម...', 'info');

    try {
      const res = await api.characterSpeak({
        voiceId,
        text,
        emotion: 'dramatic',
      });
      if (res.success && res.audioUrl) {
        setAudioUrl(res.audioUrl);
        onShowToast('សារ៉េទឹកដមរួចរាល់!', 'success');
        const audio = new Audio(res.audioUrl);
        audio.play();
      }
    } catch (e: any) {
      onShowToast(`កំហុស: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 select-none">
      <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4">
        <h3 className="text-base font-bold text-white font-ui flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>ឧបករណ៍សារ៉េទឹកដមសំឡេង & ល្បឿននិយាយ (Voice Audition & Tuning Lab)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          សារ៉េល្បឿននិយាយ (0.75x - 1.45x) ឱ្យស្របតាមមាត់តួសម្តែង និងសារ៉េ Pitch កម្រិតសំឡេង
        </p>
      </div>

      <div className="max-w-xl bg-[#111827] border border-white/[0.08] rounded-xl p-6 flex flex-col gap-5">
        {/* Character Voice */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">ជ្រើសរើសសំឡេងតួអង្គ</label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-400"
          >
            <option value="movie-live-clone">🎯 Clone ពីរឿងដើម</option>
            <option value="voxcpm-voice-actor">🎬 ១៣ សំឡេងរឿង</option>
          </select>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>ឃ្លាសាកល្បងនិយាយ</span>
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-400"
          />
        </div>

        {/* Speed Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>ល្បឿននិយាយ</span>
            </span>
            <span className="font-mono text-sky-400">{speed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.45"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded accent-sky-400 cursor-pointer"
          />
        </div>

        {/* Pitch Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-indigo-400" />
              <span>កម្រិតទឹកដមសំឡេង (Pitch)</span>
            </span>
            <span className="font-mono text-indigo-400">{pitch} កម្រិត</span>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            step="1"
            value={pitch}
            onChange={(e) => setPitch(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-slate-800 rounded accent-indigo-400 cursor-pointer"
          />
        </div>

        <button
          onClick={handleTune}
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-sky-500/20 active:scale-95"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{isLoading ? 'កំពុងដំណើរការ...' : '▶️ ដំណើរការសំយោគ & សារ៉េទឹកដម'}</span>
        </button>

        {audioUrl && (
          <div className="bg-black/40 border border-white/[0.08] rounded-lg p-3 flex flex-col gap-2">
            <span className="text-xs font-semibold text-sky-400">សំឡេងដែលបានសារ៉េទឹកដមរួចរាល់:</span>
            <audio src={audioUrl} controls className="w-full h-8" />
          </div>
        )}
      </div>
    </div>
  );
};
