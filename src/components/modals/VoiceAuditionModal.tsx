import React, { useState } from 'react';
import { X, Play, Volume2 } from 'lucide-react';
import { api } from '../../services/api';
import { CharacterVoice } from '../../types';

interface AuditionModalProps {
  isOpen: boolean;
  character: CharacterVoice | null;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VoiceAuditionModal: React.FC<AuditionModalProps> = ({
  isOpen,
  character,
  onClose,
  onShowToast,
}) => {
  const [text, setText] = useState('បងមិនអាចបោះបង់អូនចោលក្នុងគ្រាដ៏គ្រោះថ្នាក់នេះបានទេ!');
  const [emotion, setEmotion] = useState('dramatic');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !character) return null;

  const handleAudition = async () => {
    setIsLoading(true);
    onShowToast('កំពុងសំយោគសំឡេងសាកល្បង...', 'info');

    try {
      const res = await api.characterSpeak({
        voiceId: character.id,
        text,
        emotion,
        gender: character.gender,
      });
      if (res.success && res.audioUrl) {
        setAudioUrl(res.audioUrl);
        onShowToast('សំយោគសំឡេងជោគជ័យ!', 'success');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-ui">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>សាកល្បងឱ្យតួអង្គនិយាយ (Audition)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 text-xs">
          {/* Character Header */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex items-center gap-3">
            <span className="text-xl">🎙️</span>
            <div>
              <div className="font-bold text-white text-xs">{character.label}</div>
              <div className="text-[10px] text-slate-400">{character.role_key} • {character.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">អក្សរខ្មែរដែលចង់ឱ្យតួអង្គនិយាយ៖</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="bg-[#07090e] border border-white/[0.08] rounded-lg p-2.5 text-slate-200 outline-none focus:border-sky-400 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">ទឹកដមអារម្មណ៍សម្ដែង (Emotional Delivery)</label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-400"
            >
              <option value="dramatic">🎭 មនោសញ្ចេតនាភាពយន្ត (Dramatic / Theatrical)</option>
              <option value="deep_sorrow">😭 កម្សត់ / ស្រក់ទឹកភ្នែក (Deep Sorrow)</option>
              <option value="fierce_battle">😡 ខឹងសម្បារ / ច្បាំង (Fierce Anger)</option>
              <option value="sweet_romance">💖 ស្នេហាផ្អែមល្ហែម (Sweet Romance)</option>
              <option value="heroic_command">🛡️ អង់អាចក្លាហាន / បញ្ជាទ័ព (Heroic Command)</option>
              <option value="neutral">😐 ធម្មតា (Neutral)</option>
            </select>
          </div>

          {audioUrl && (
            <div className="bg-black/30 border border-white/[0.08] rounded-lg p-2.5">
              <audio src={audioUrl} controls className="w-full h-8" />
            </div>
          )}
        </div>

        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#0b0f19] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs transition-colors"
          >
            បិទ
          </button>
          <button
            onClick={handleAudition}
            disabled={isLoading || !text.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black font-semibold text-xs transition-colors shadow-md shadow-sky-500/20"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{isLoading ? 'កំពុងដំណើរការ...' : 'សំយោគសំឡេង'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
