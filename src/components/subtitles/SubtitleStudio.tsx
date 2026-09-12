import React, { useState } from 'react';
import { Subtitles, Download, Film, Search, Mic, Play, Loader2, Volume2, CheckCircle } from 'lucide-react';
import { TimelineSegment, CharacterVoice } from '../../types';
import { api } from '../../services/api';

interface SubtitleProps {
  segments: TimelineSegment[];
  characters?: CharacterVoice[];
  onUpdateSegment: (index: number, updated: Partial<TimelineSegment>) => void;
  onOpenExportModal: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const SubtitleStudio: React.FC<SubtitleProps> = ({
  segments,
  characters = [],
  onUpdateSegment,
  onOpenExportModal,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [synthesizingIdx, setSynthesizingIdx] = useState<number | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);

  const handleExportSrt = () => {
    if (!segments || segments.length === 0) {
      onShowToast('មិនទាន់មានទិន្នន័យអក្សររត់ឡើយ!', 'error');
      return;
    }

    let srt = '';
    segments.forEach((s, i) => {
      srt += `${i + 1}\n${formatTimecode(s.start_time)},000 --> ${formatTimecode(s.end_time)},000\n${
        s.khmer_translation || s.chinese_text || ''
      }\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'subtitles_khmer.srt';
    a.click();
    onShowToast('បានទាញយកឯកសារ SRT ជោគជ័យ!', 'success');
  };

  const handleVoiceChange = (index: number, voiceId: string) => {
    const matchedChar = characters.find((c) => c.id === voiceId || c.filename === voiceId);
    const newName = matchedChar ? matchedChar.label : voiceId;
    const newGender = matchedChar ? matchedChar.gender : 'male';
    const newRole = matchedChar?.role_key || 'male_lead';

    onUpdateSegment(index, {
      voiceId: voiceId,
      speaker_name: newName,
      gender: newGender,
      speaker_role: newRole,
    });
    onShowToast(`បានកំណត់សំឡេង "${newName}" សម្រាប់ឃ្លាទី ${index + 1}`, 'info');
  };

  const handleGenerateLineSpeech = async (index: number, seg: TimelineSegment) => {
    const textToSpeak = seg.khmer_translation || seg.chinese_text || '';
    if (!textToSpeak.trim()) {
      onShowToast('មិនមានអត្ថបទសម្រាប់បង្កើតសំឡេងឡើយ!', 'error');
      return;
    }

    setSynthesizingIdx(index);
    try {
      const res = await api.generateLine({
        text: textToSpeak,
        lineIndex: index,
        gender: seg.gender || 'male',
        voiceId: seg.voiceId || (seg.gender === 'female' ? 'voxcpm:vp_character_1_female.mp3' : 'voxcpm:vp_character_20_female.mp3'),
        speakerId: seg.speaker_role || 'male_lead',
        emotion: 'dramatic',
      });

      if (res.audioUrl) {
        onUpdateSegment(index, {
          audioUrl: res.audioUrl,
          status: 'ready',
        });
        onShowToast(`បានបង្កើតសំឡេងសម្រាប់ឃ្លាទី ${index + 1} ជោគជ័យ!`, 'success');
        // Auto play preview
        playAudio(res.audioUrl);
      }
    } catch (err: any) {
      onShowToast(`បរាជ័យក្នុងការបង្កើតសំឡេង: ${err.message}`, 'error');
    } finally {
      setSynthesizingIdx(null);
    }
  };

  const playAudio = (url: string) => {
    try {
      const audio = new Audio(url);
      setPlayingAudioUrl(url);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingAudioUrl(null);
    } catch (e) {
      setPlayingAudioUrl(null);
    }
  };

  const filtered = segments.filter(
    (s) =>
      (s.khmer_translation || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.chinese_text || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.speaker_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col gap-4 select-none">
      {/* Top Toolbar */}
      <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-ui flex items-center gap-2">
            <Subtitles className="w-5 h-5 text-sky-400" />
            ផ្ទាំងកាត់តអក្សររត់ & ប្តូរសំឡេងតួអង្គតាមឃ្លា (Voice & Subtitle Studio)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ជ្រើសរើសសំឡេងតួអង្គតាមឃ្លានីមួយៗ, កែប្រែពេលវេលា, បង្កើតសំឡេងសាកល្បង និងទាញយក SRT
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportSrt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>ទាញយក SRT</span>
          </button>
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors shadow-md shadow-sky-500/20"
          >
            <Film className="w-3.5 h-3.5" />
            <span>បង្កប់អក្សររត់ក្នុងវីដេអូ</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ស្វែងរកអក្សររត់ ឬតួអង្គ..."
          className="w-full bg-[#0b0f19] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-400 outline-none"
        />
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-y-auto bg-[#111827] border border-white/[0.08] rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0b0f19] border-b border-white/[0.08] sticky top-0 z-10 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-3 w-20">Start</th>
              <th className="py-2.5 px-3 w-20">End</th>
              <th className="py-2.5 px-3 w-56">សំឡេងតួអង្គ (Actor Voice)</th>
              <th className="py-2.5 px-3 w-64">អត្ថបទដើម</th>
              <th className="py-2.5 px-3">អក្សររត់ខ្មែរ (Khmer Subtitle)</th>
              <th className="py-2.5 px-3 w-28 text-center">Audio / Dub</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length > 0 ? (
              filtered.map((seg, idx) => {
                const isSelected = seg.voiceId || '';
                const isSynthesizing = synthesizingIdx === idx;
                const hasAudio = !!seg.audioUrl;

                return (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-sky-400">
                      {formatTimecode(seg.start_time)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {formatTimecode(seg.end_time)}
                    </td>
                    {/* Per-Segment Voice Selector */}
                    <td className="py-2.5 px-3">
                      <select
                        value={seg.voiceId || (seg.gender === 'female' ? 'voxcpm:vp_character_1_female.mp3' : 'voxcpm:vp_character_20_female.mp3')}
                        onChange={(e) => handleVoiceChange(idx, e.target.value)}
                        className="w-full bg-[#07090e] border border-white/[0.1] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 font-medium"
                      >
                        {characters.length > 0 ? (
                          characters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label} ({c.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="voxcpm:vp_character_20_female.mp3">👑 តួឯកប្រុស (Male Lead)</option>
                            <option value="voxcpm:vp_character_1_female.mp3">🌸 តួឯកស្រី (Female Lead)</option>
                            <option value="voxcpm:vp_character_19_male.mp3">📿 ព្រឹទ្ធាចារ្យ (Elder)</option>
                            <option value="voxcpm:vp_character_6_female.mp3">⚡ តួស្រីកាច (Fierce)</option>
                            <option value="voxcpm:vp_character_7_male.mp3">⚔️ តួប្រុសកាច (Fierce)</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {seg.chinese_text || '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={seg.khmer_translation || ''}
                        onChange={(e) => onUpdateSegment(idx, { khmer_translation: e.target.value })}
                        className="w-full bg-[#07090e] border border-white/[0.08] rounded px-2 py-1.5 text-slate-200 focus:border-sky-400 outline-none text-xs"
                      />
                    </td>
                    {/* Audio Synthesis & Audition */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleGenerateLineSpeech(idx, seg)}
                          disabled={isSynthesizing}
                          className={`p-1.5 rounded text-xs transition-all ${
                            hasAudio
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                              : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20'
                          }`}
                          title="បង្កើតសំឡេងខ្មែរសម្រាប់ឃ្លានេះ"
                        >
                          {isSynthesizing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mic className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {hasAudio && (
                          <button
                            onClick={() => seg.audioUrl && playAudio(seg.audioUrl)}
                            className="p-1.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-amber-300 transition-colors"
                            title="ស្ដាប់សំឡេងដែលបានបង្កើត"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  មិនទាន់មានទិន្នន័យអក្សររត់ឡើយ។ សូមស្កេនវីដេអូជាមុនសិន។
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
