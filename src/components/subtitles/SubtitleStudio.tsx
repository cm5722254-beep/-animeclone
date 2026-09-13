import React, { useState } from 'react';
import {
  Subtitles,
  Download,
  Film,
  Search,
  Mic,
  Play,
  Pause,
  Loader2,
  Volume2,
  CheckCircle,
  Copy,
  Sparkles,
  User,
  Heart,
  MessageSquare,
  VolumeX,
} from 'lucide-react';
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
  const ms = Math.floor((seconds % 1) * 1000);
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

// Spoken Khmer emotion ending particles
const KHMER_SPOKEN_PARTICLES = ['ណា', 'ណ៎', 'ហ្មង', 'តើ', 'អញ្ចឹង', 'វើយ', 'ហាស', 'ចា៎', 'ចុះ'];

export const SubtitleStudio: React.FC<SubtitleProps> = ({
  segments,
  characters = [],
  onUpdateSegment,
  onOpenExportModal,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<'all' | 'm' | 'f' | 'think' | 'ready'>('all');
  const [synthesizingIdx, setSynthesizingIdx] = useState<number | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Helper to extract tag if text already starts with one
  const getTagFromText = (text: string): { tag: string | null; cleanText: string } => {
    const match = text.match(/^(\[(M|F|M_THINK|F_THINK)\])\s*(.*)/i);
    if (match) {
      return { tag: match[1].toUpperCase(), cleanText: match[3] };
    }
    return { tag: null, cleanText: text };
  };

  // Set or toggle cinema audio tag on a segment
  const handleApplyTag = (idx: number, currentText: string, tag: '[M]' | '[F]' | '[M_THINK]' | '[F_THINK]') => {
    const { cleanText, tag: existingTag } = getTagFromText(currentText);
    const newText = existingTag === tag ? cleanText : `${tag} ${cleanText}`.trim();
    
    // Also auto-update gender if tag changes
    const newGender = tag.includes('F') ? 'female' : 'male';
    onUpdateSegment(idx, {
      khmer_translation: newText,
      gender: newGender,
    });
    onShowToast(`បានកំណត់ស្លាក ${tag} សម្រាប់ឃ្លាទី ${idx + 1}`, 'info');
  };

  // Append natural spoken particle
  const handleAppendParticle = (idx: number, currentText: string, particle: string) => {
    const trimmed = (currentText || '').trim();
    const updated = trimmed ? `${trimmed} ${particle}` : particle;
    onUpdateSegment(idx, { khmer_translation: updated });
  };

  // Build standard SRT string
  const generateSrtContent = (): string => {
    let srt = '';
    segments.forEach((s, i) => {
      let lineText = s.khmer_translation || s.chinese_text || '';
      // Ensure it has tag if missing
      const { tag } = getTagFromText(lineText);
      if (!tag) {
        const defaultTag = s.gender === 'female' ? '[F]' : '[M]';
        lineText = `${defaultTag} ${lineText}`;
      }

      srt += `${i + 1}\n${formatTimecode(s.start_time)} --> ${formatTimecode(s.end_time)}\n${lineText}\n\n`;
    });
    return srt.trim() + '\n';
  };

  const handleExportSrt = () => {
    if (!segments || segments.length === 0) {
      onShowToast('មិនទាន់មានទិន្នន័យអក្សររត់ឡើយ!', 'error');
      return;
    }

    const srt = generateSrtContent();
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'movie_khmer_subtitles.srt';
    a.click();
    onShowToast('✅ បានទាញយកឯកសារ Subtitle (.SRT) ជោគជ័យ!', 'success');
  };

  const handleCopySrt = () => {
    if (!segments || segments.length === 0) {
      onShowToast('មិនទាន់មានទិន្នន័យអក្សររត់ឡើយ!', 'error');
      return;
    }

    const srt = generateSrtContent();
    navigator.clipboard.writeText(srt).then(() => {
      onShowToast('📋 បានចម្លងកូដ SRT ទាំងអស់ចូលក្តារឃ្លីប (Clipboard) រួចរាល់!', 'success');
    }).catch(() => {
      onShowToast('មិនអាចចម្លងបានទេ សូមសាកល្បងម្ដងទៀត!', 'error');
    });
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
    const { cleanText } = getTagFromText(seg.khmer_translation || seg.chinese_text || '');
    if (!cleanText.trim()) {
      onShowToast('មិនមានអត្ថបទសម្រាប់បង្កើតសំឡេងឡើយ!', 'error');
      return;
    }

    setSynthesizingIdx(index);
    try {
      const res = await api.generateLine({
        text: cleanText,
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
        onShowToast(`🎉 បានបង្កើតសំឡេងសម្រាប់ឃ្លាទី ${index + 1} ជោគជ័យ!`, 'success');
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
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(url);
      setAudioElement(audio);
      setPlayingAudioUrl(url);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingAudioUrl(null);
    } catch (e) {
      setPlayingAudioUrl(null);
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setPlayingAudioUrl(null);
    }
  };

  // Filter segments
  const filtered = segments.filter((s) => {
    const text = (s.khmer_translation || '').toLowerCase();
    const orig = (s.chinese_text || '').toLowerCase();
    const speaker = (s.speaker_name || '').toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase()) || orig.includes(search.toLowerCase()) || speaker.includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (tagFilter === 'm') {
      return text.includes('[m]') || s.gender === 'male';
    }
    if (tagFilter === 'f') {
      return text.includes('[f]') || s.gender === 'female';
    }
    if (tagFilter === 'think') {
      return text.includes('_think');
    }
    if (tagFilter === 'ready') {
      return !!s.audioUrl || s.status === 'ready';
    }

    return true;
  });

  return (
    <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col gap-4 select-none bg-[#05070c]">
      {/* ── Top Header Toolbar ── */}
      <div className="glass-card p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <Subtitles className="w-5 h-5 animate-float" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-ui">
                ផ្ទាំងកាត់តអក្សររត់ និងបកប្រែខ្សែភាពយន្តអាជីព
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                PRO SRT STUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              បែងចែកស្លាកសំឡេង <span className="text-sky-300 font-semibold">[M]</span>, <span className="text-rose-300 font-semibold">[F]</span>, <span className="text-purple-300 font-semibold">[THINK]</span> ភាសានិយាយរលូន និងទាញយកកូដ SRT ភ្លាមៗ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopySrt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="ចម្លងកូដ SRT ទាំងអស់"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>ចម្លង SRT</span>
          </button>

          <button
            onClick={handleExportSrt}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-[0_0_16px_rgba(56,189,248,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ទាញយក .SRT</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-[0_0_16px_rgba(52,211,153,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
            <span>បង្កប់ក្នុងវីដេអូ</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកអក្សររត់, អត្ថបទដើម, ឬឈ្មោះតួអង្គ..."
            className="w-full bg-[#0a0e1a] border border-white/[0.08] focus:border-sky-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_16px_rgba(56,189,248,0.15)]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
            >
              សម្អាត
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0a0e1a] p-1 rounded-xl border border-white/[0.06] overflow-x-auto max-w-full">
          {[
            { id: 'all', label: `ទាំងអស់ (${segments.length})` },
            { id: 'm', label: '👑 [M] ប្រុស' },
            { id: 'f', label: '🌸 [F] ស្រី' },
            { id: 'think', label: '💭 គិតក្នុងចិត្ត' },
            { id: 'ready', label: '✓ មានសំឡេង' },
          ].map((tab) => {
            const isSelected = tagFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTagFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Subtitle Data Table ── */}
      <div className="flex-1 overflow-y-auto bg-[#0a0e1a] border border-white/[0.08] rounded-2xl shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0e1424] border-b border-white/[0.08] sticky top-0 z-10 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3 w-28">ពេលវេលា (Timecode)</th>
              <th className="py-3 px-3 w-48">សំឡេងតួអង្គ (Voice)</th>
              <th className="py-3 px-3 w-56">អត្ថបទដើម (Original)</th>
              <th className="py-3 px-3">អក្សររត់ & ភាសានិយាយខ្មែរ (Khmer Dialogue)</th>
              <th className="py-3 px-3 w-24 text-center">Audio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length > 0 ? (
              filtered.map((seg, idx) => {
                const isSynthesizing = synthesizingIdx === idx;
                const hasAudio = !!seg.audioUrl;
                const isPlayingThis = playingAudioUrl === seg.audioUrl;
                const text = seg.khmer_translation || '';
                const { tag } = getTagFromText(text);

                return (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Timecode */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-sky-400 font-bold">{formatTimecode(seg.start_time).split(',')[0]}</div>
                      <div className="text-slate-400 text-[10px]">→ {formatTimecode(seg.end_time).split(',')[0]}</div>
                    </td>

                    {/* Character Voice Picker */}
                    <td className="py-3 px-3">
                      <select
                        value={seg.voiceId || (seg.gender === 'female' ? 'voxcpm:vp_character_1_female.mp3' : 'voxcpm:vp_character_20_female.mp3')}
                        onChange={(e) => handleVoiceChange(idx, e.target.value)}
                        className="w-full bg-[#070a12] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 font-medium"
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

                    {/* Original Source Text */}
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11.5px] leading-relaxed">
                      {seg.chinese_text || '—'}
                    </td>

                    {/* Khmer Dialogue with Tags & Quick Particles */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-2">
                        {/* Tag Bar + Quick Particles */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Tag selector chips */}
                          <button
                            type="button"
                            onClick={() => handleApplyTag(idx, text, '[M]')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              tag === '[M]' ? 'badge-tag-m' : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20'
                            }`}
                          >
                            [M] ប្រុស
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyTag(idx, text, '[F]')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              tag === '[F]' ? 'badge-tag-f' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            }`}
                          >
                            [F] ស្រី
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyTag(idx, text, '[M_THINK]')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              tag === '[M_THINK]' ? 'badge-tag-m-think' : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                            }`}
                          >
                            [M_THINK]
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyTag(idx, text, '[F_THINK]')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              tag === '[F_THINK]' ? 'badge-tag-f-think' : 'bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20'
                            }`}
                          >
                            [F_THINK]
                          </button>

                          <div className="w-[1px] h-3.5 bg-white/[0.1] mx-0.5" />

                          {/* Quick Spoken Particles */}
                          <div className="hidden sm:flex items-center gap-1">
                            {KHMER_SPOKEN_PARTICLES.slice(0, 5).map((particle) => (
                              <button
                                key={particle}
                                type="button"
                                onClick={() => handleAppendParticle(idx, text, particle)}
                                className="action-chip text-[9.5px] py-0 px-1.5"
                                title={`ចុចដើម្បីបន្ថែម "${particle}" នៅចុងឃ្លា`}
                              >
                                +{particle}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Input Field */}
                        <div className="relative">
                          <input
                            type="text"
                            value={seg.khmer_translation || ''}
                            onChange={(e) => onUpdateSegment(idx, { khmer_translation: e.target.value })}
                            placeholder="បញ្ចូលអត្ថបទសន្ទនាភាសាខ្មែរ..."
                            className="w-full bg-[#070a12] border border-white/[0.1] focus:border-sky-400 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 outline-none text-xs transition-all font-medium"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Audio Generate & Playback */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleGenerateLineSpeech(idx, seg)}
                          disabled={isSynthesizing}
                          className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${
                            hasAudio
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                              : 'bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-400/30'
                          }`}
                          title="បង្កើតសំឡេងខ្មែរសម្រាប់ឃ្លានេះ"
                        >
                          {isSynthesizing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </button>

                        {hasAudio && (
                          <button
                            onClick={() => {
                              if (isPlayingThis) {
                                stopAudio();
                              } else if (seg.audioUrl) {
                                playAudio(seg.audioUrl);
                              }
                            }}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isPlayingThis
                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 animate-pulse'
                                : 'bg-white/[0.08] hover:bg-white/[0.15] text-amber-300'
                            }`}
                            title={isPlayingThis ? 'ផ្អាកសំឡេង' : 'ស្ដាប់សំឡេង'}
                          >
                            {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Subtitles className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">មិនទាន់មានទិន្នន័យអក្សររត់ឡើយ</p>
                    <p className="text-xs text-slate-500">សូមស្កេនវីដេអូ ឬបន្ថែមឃ្លាសន្ទនាជាមុនសិន។</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
