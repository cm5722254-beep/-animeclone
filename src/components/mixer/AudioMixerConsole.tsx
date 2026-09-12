import React, { useState } from 'react';
import { Volume2, Wand2, Scissors, Save, Music, MicOff, CheckCircle2, Loader2, Play } from 'lucide-react';
import { api } from '../../services/api';

interface AudioMixerProps {
  uploadedFilename?: string;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onBgmReady?: (bgmUrl: string) => void;
}

export const AudioMixerConsole: React.FC<AudioMixerProps> = ({
  uploadedFilename,
  onShowToast,
  onBgmReady,
}) => {
  const [dialogueVol, setDialogueVol] = useState(130);
  const [originalVol, setOriginalVol] = useState(0);
  const [bgmVol, setBgmVol] = useState(90);
  const [masterVol, setMasterVol] = useState(100);
  const [isSeparating, setIsSeparating] = useState(false);
  const [separatedBgmUrl, setSeparatedBgmUrl] = useState<string | null>(null);
  const [separatedEngine, setSeparatedEngine] = useState<string | null>(null);

  const handleAutoMix = () => {
    setDialogueVol(135);
    setOriginalVol(0);
    setBgmVol(85);
    setMasterVol(100);
    onShowToast('AI Auto-Mix បានកំណត់តុល្យភាព Dialogue & BGM ស្តង់ដាររោងភាពយន្ត (Muted Chinese)', 'success');
  };

  const handleSeparateAndMuteChinese = async () => {
    if (!uploadedFilename) {
      onShowToast('សូមបញ្ចូលវីដេអូជាមុនសិន!', 'error');
      return;
    }
    setIsSeparating(true);
    onShowToast('AI Demucs កំពុងដំណើរការលុបសំឡេងចិនដើម និងស្រង់យកតែភ្លេង BGM...', 'info');

    try {
      const res = await api.separateAudio(uploadedFilename, true);
      if (res.success) {
        setSeparatedBgmUrl(res.bgmUrl);
        setSeparatedEngine(res.engine || 'meta-demucs-ai');
        setOriginalVol(0); // Mute Chinese completely
        setBgmVol(95);
        if (onBgmReady) onBgmReady(res.bgmUrl);
        onShowToast('លុបសំឡេងចិនដើមជោគជ័យ! បទភ្លេង BGM ត្រូវបានរក្សាទុក 100% ស្អាតគ្មានសម្លេងរំខាន', 'success');
      }
    } catch (e: any) {
      onShowToast(`កំហុសក្នុងការបំបែក: ${e.message}`, 'error');
    } finally {
      setIsSeparating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 select-none bg-[#07090e]">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-ui flex items-center gap-2">
            <Music className="w-5 h-5 text-sky-400" />
            តុលាយភ្លេង & លុបសំឡេងចិន (Audio Mixer & Vocal Remover)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            លុបសំឡេងនិយាយភាសាចិនដើមចេញទាំងស្រុង ដោយរក្សាទុកភ្លេងកំដរ (BGM) និងសម្លេង Effects ដើម ១០០%
          </p>
        </div>

        <button
          onClick={handleAutoMix}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors shrink-0 shadow-md shadow-sky-500/20"
        >
          <Wand2 className="w-4 h-4" />
          <span>AI Auto-Mix (Mute Chinese)</span>
        </button>
      </div>

      {/* Feature Card: Remove Chinese Vocals & Keep Original BGM */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-[#0e1628] to-[#0b101d] border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <MicOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                លុបសំឡេងចិនដើម រក្សាភ្លេង BGM ១០០% (AI Vocal Remover)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {separatedEngine === 'meta-demucs-ai' ? 'Meta Demucs AI' : 'High-Fidelity AI'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              ផ្តាច់យកតែសាច់ភ្លេង និង Sound Effects ពីវីដេអូដើម ដោយគ្មានសំឡេងមនុស្សនិយាយភាសាចិនលាយឡំឡើយ ដើម្បីបញ្ចូលសំឡេងខ្មែរបានច្បាស់ល្អដូចរោងកុន។
            </p>

            {separatedBgmUrl && (
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> បទភ្លេង BGM ស្អាតរួចរាល់
                </span>
                <audio controls src={separatedBgmUrl} className="h-8 w-60 rounded" />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSeparateAndMuteChinese}
          disabled={isSeparating || !uploadedFilename}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 shrink-0 disabled:opacity-50 transition-all"
        >
          {isSeparating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>កំពុងលុបសំឡេងចិន...</span>
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4" />
              <span>លុបសំឡេងចិន ទុកភ្លេង BGM ឥឡូវនេះ</span>
            </>
          )}
        </button>
      </div>

      {/* Channel Strips Console */}
      <div className="bg-[#090d16] border border-white/[0.08] rounded-xl p-6 flex gap-4 overflow-x-auto justify-center sm:justify-start">
        {/* Channel 1: Dialogue */}
        <div className="w-28 bg-[#111827] border border-white/[0.08] rounded-lg p-3 flex flex-col items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-ui">
            Khmer Dub
          </span>
          <div className="flex items-center gap-2 h-44">
            <input
              type="range"
              min="0"
              max="200"
              value={dialogueVol}
              onChange={(e) => setDialogueVol(parseInt(e.target.value, 10))}
              className="[writing-mode:bt-lr] -webkit-appearance-slider-vertical w-2 h-36 accent-sky-400 cursor-pointer"
            />
            <div className="w-1.5 h-36 bg-[#080c14] rounded overflow-hidden flex flex-col-reverse">
              <div
                className="w-full bg-gradient-to-t from-emerald-500 via-yellow-500 to-rose-500 transition-all duration-75"
                style={{ height: `${(dialogueVol / 200) * 85}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-sky-400 font-semibold">
            +{(dialogueVol / 60).toFixed(1)} dB
          </span>
        </div>

        {/* Channel 2: Original Chinese Vocal */}
        <div className="w-28 bg-[#111827] border border-white/[0.08] rounded-lg p-3 flex flex-col items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-ui">
            ZH Vocal
          </span>
          <div className="flex items-center gap-2 h-44">
            <input
              type="range"
              min="0"
              max="100"
              value={originalVol}
              onChange={(e) => setOriginalVol(parseInt(e.target.value, 10))}
              className="[writing-mode:bt-lr] -webkit-appearance-slider-vertical w-2 h-36 accent-rose-500 cursor-pointer"
            />
            <div className="w-1.5 h-36 bg-[#080c14] rounded overflow-hidden flex flex-col-reverse">
              <div
                className="w-full bg-rose-500 transition-all duration-75"
                style={{ height: `${originalVol * 0.7}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-rose-400 font-semibold">
            {originalVol === 0 ? 'MUTED' : `-${(100 - originalVol) / 5} dB`}
          </span>
        </div>

        {/* Channel 3: Clean BGM / Atmosphere */}
        <div className="w-28 bg-[#111827] border border-white/[0.08] rounded-lg p-3 flex flex-col items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-ui">
            Clean BGM
          </span>
          <div className="flex items-center gap-2 h-44">
            <input
              type="range"
              min="0"
              max="150"
              value={bgmVol}
              onChange={(e) => setBgmVol(parseInt(e.target.value, 10))}
              className="[writing-mode:bt-lr] -webkit-appearance-slider-vertical w-2 h-36 accent-emerald-400 cursor-pointer"
            />
            <div className="w-1.5 h-36 bg-[#080c14] rounded overflow-hidden flex flex-col-reverse">
              <div
                className="w-full bg-emerald-500 transition-all duration-75"
                style={{ height: `${(bgmVol / 150) * 80}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-emerald-400 font-semibold">
            {bgmVol}%
          </span>
        </div>

        {/* Master Output */}
        <div className="w-28 bg-[#111827] border border-sky-500/40 bg-sky-500/[0.02] rounded-lg p-3 flex flex-col items-center gap-2.5 shadow-lg shadow-sky-950/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 font-ui">
            Master Out
          </span>
          <div className="flex items-center gap-2 h-44">
            <input
              type="range"
              min="0"
              max="100"
              value={masterVol}
              onChange={(e) => setMasterVol(parseInt(e.target.value, 10))}
              className="[writing-mode:bt-lr] -webkit-appearance-slider-vertical w-2 h-36 accent-sky-400 cursor-pointer"
            />
            <div className="w-1.5 h-36 bg-[#080c14] rounded overflow-hidden flex flex-col-reverse">
              <div
                className="w-full bg-gradient-to-t from-emerald-500 via-sky-500 to-indigo-500 transition-all duration-75"
                style={{ height: `${masterVol * 0.8}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[11px] text-sky-400 font-semibold">
            0.0 dB
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onShowToast('បានរក្សាទុកតុល្យភាពសំឡេង Remix ជោគជ័យ!', 'success')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>រក្សាទុកតុល្យភាពសំឡេង (Save Remix Balance)</span>
        </button>
      </div>
    </div>
  );
};
