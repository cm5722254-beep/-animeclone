import React, { useState } from 'react';
import {
  X,
  Users,
  Sparkles,
  Volume2,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Mic2,
  Film,
  RefreshCw,
} from 'lucide-react';
import { TimelineSegment, CharacterVoice } from '../../types';

interface CharacterCastDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  segments: TimelineSegment[];
  characters: CharacterVoice[];
  onChangeVoiceForCharacter: (characterKey: string, newVoiceId: string) => void;
  onAutoCastUniqueVoices: () => void;
  onPreviewVoice: (voiceIdOrFilename: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CharacterCastDrawer: React.FC<CharacterCastDrawerProps> = ({
  isOpen,
  onClose,
  segments,
  characters,
  onChangeVoiceForCharacter,
  onAutoCastUniqueVoices,
  onPreviewVoice,
  onShowToast,
}) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElem, setAudioElem] = useState<HTMLAudioElement | null>(null);

  // Group segments by unique character
  const uniqueCharacters = React.useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        name: string;
        speaker_id: string;
        speaker_role?: string;
        gender: 'male' | 'female';
        lineCount: number;
        currentVoiceId: string;
        currentVoiceLabel?: string;
        movieVoiceSample?: string | null;
      }
    >();

    for (const s of segments) {
      const key = s.speaker_name || s.speaker_id || 'តួអង្គ';
      const isFem =
        s.gender === 'female' ||
        (s.speaker_role && s.speaker_role.includes('female')) ||
        key.includes('ស្រី') ||
        key.toLowerCase().includes('female');

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: s.speaker_name || s.speaker_id || 'តួអង្គ',
          speaker_id: s.speaker_id || key,
          speaker_role: s.speaker_role || (isFem ? 'female_lead' : 'male_lead'),
          gender: isFem ? 'female' : 'male',
          lineCount: 1,
          currentVoiceId: s.voiceId || s.voiceFilename || '',
          currentVoiceLabel: s.voiceLabel,
          movieVoiceSample: s.movieVoiceSample || null,
        });
      } else {
        const existing = map.get(key)!;
        existing.lineCount += 1;
        if (!existing.currentVoiceId && (s.voiceId || s.voiceFilename)) {
          existing.currentVoiceId = s.voiceId || s.voiceFilename || '';
          existing.currentVoiceLabel = s.voiceLabel;
        }
        if (!existing.movieVoiceSample && s.movieVoiceSample) {
          existing.movieVoiceSample = s.movieVoiceSample;
        }
      }
    }
    return Array.from(map.values());
  }, [segments]);

  // Map of voiceId -> characterName
  const voiceOwnerMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of uniqueCharacters) {
      if (c.currentVoiceId) {
        const clean = c.currentVoiceId.replace('voxcpm:', '');
        map[clean] = c.name;
        map[c.currentVoiceId] = c.name;
      }
    }
    return map;
  }, [uniqueCharacters]);

  // Check how many duplicate voices exist
  const collisions = React.useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const c of uniqueCharacters) {
      if (c.currentVoiceId) {
        const clean = c.currentVoiceId.replace('voxcpm:', '');
        if (seen.has(clean)) {
          dupes.add(clean);
        } else {
          seen.add(clean);
        }
      }
    }
    return dupes;
  }, [uniqueCharacters]);

  const handlePlayPreview = (voiceIdOrUrl: string) => {
    if (!voiceIdOrUrl) return;

    if (audioElem) {
      audioElem.pause();
    }

    if (playingAudio === voiceIdOrUrl) {
      setPlayingAudio(null);
      return;
    }

    const clean = voiceIdOrUrl.replace('voxcpm:', '');
    const url = clean.startsWith('http') || clean.startsWith('/')
      ? clean
      : `/media/samples/${clean}`;

    const a = new Audio(url);
    a.onended = () => setPlayingAudio(null);
    a.onerror = () => {
      setPlayingAudio(null);
      onShowToast('មិនអាចចាក់សំឡេងគំរូបានទេ', 'error');
    };
    a.play().then(() => {
      setAudioElem(a);
      setPlayingAudio(voiceIdOrUrl);
    }).catch(() => {
      setPlayingAudio(null);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-[#0c101c] border border-white/[0.12] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.08] bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 border border-sky-400/30">
              <Users className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-ui">
                  តារាងម្ចាស់សំឡេងតួអង្គ (1 Character = 1 Voice Casting)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold">
                  {uniqueCharacters.length} តួអង្គក្នុងរឿង
                </span>
              </div>
              <p className="text-xs text-slate-400">
                សំឡេងទាំងអស់អាចប្រើបានតែ ១ តួអង្គ = ១ សំឡេង ម្ចាស់រៀងៗខ្លួន មិនឱ្យជាន់គ្នាឡើយ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        <div className="px-6 py-3 border-b border-white/[0.08] bg-[#111625] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {collisions.size > 0 ? (
              <div className="flex items-center gap-2 text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>មាន {collisions.size} សំឡេងកំពុងជាន់គ្នា! សូមចុចចាត់ចែងដើម្បីឱ្យដាច់ដោយឡែក។</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>តួអង្គទាំងអស់មានសំឡេងម្ចាស់ផ្តាច់មុខ ១ លើ ១ រួចរាល់ គ្មានជាន់គ្នា ១០០%</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onAutoCastUniqueVoices();
              onShowToast('បានចាត់ចែងសំឡេង ១ តួអង្គ = ១ សំឡេងដោយស្វ័យប្រវត្តិកំពុងរៀបចំ!', 'success');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ ចាត់ចែងសំឡេង 1:1 ដោយស្វ័យប្រវត្តិ</span>
          </button>
        </div>

        {/* Character List Grid */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {uniqueCharacters.map((char, index) => {
            const cleanVoiceId = char.currentVoiceId.replace('voxcpm:', '');
            const isCollision = collisions.has(cleanVoiceId);
            const matchedVoice = characters.find(
              (c) => c.id === char.currentVoiceId || c.filename === cleanVoiceId
            );
            const isPlaying = playingAudio === char.currentVoiceId;

            return (
              <div
                key={char.key}
                className={`p-4 rounded-xl border transition-all ${
                  isCollision
                    ? 'bg-amber-500/[0.04] border-amber-500/30'
                    : 'bg-[#111827]/70 border-white/[0.08] hover:border-sky-500/30'
                } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
              >
                {/* Left: Character Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-600 flex items-center justify-center text-white font-bold text-base shadow-md border border-white/[0.15]">
                      {char.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow ${
                        char.gender === 'female' ? 'bg-pink-500' : 'bg-sky-500'
                      }`}
                    >
                      {char.gender === 'female' ? '♀' : '♂'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm truncate">
                        {char.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          char.gender === 'female'
                            ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                            : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        }`}
                      >
                        {char.gender === 'female' ? 'តួស្រី' : 'តួប្រុស'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300">
                        {char.lineCount} ឃ្លា
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        តួនាទី៖ <span className="text-slate-200">{char.speaker_role || 'តួអង្គ'}</span>
                      </span>

                      {char.movieVoiceSample && (
                        <button
                          onClick={() => handlePlayPreview(char.movieVoiceSample!)}
                          className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md hover:bg-sky-500/20 transition-colors"
                          title="ចាក់ស្តាប់សំឡេងដើមដែលកាត់ចេញពីរឿង"
                        >
                          <Film className="w-3 h-3" />
                          <span>ស្តាប់សំឡេងដើមក្នុងរឿង</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Assigned Voice & Controls */}
                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-between md:justify-end">
                  {/* Play / Preview Voice */}
                  <button
                    onClick={() => handlePlayPreview(char.currentVoiceId)}
                    className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all ${
                      isPlaying
                        ? 'bg-sky-500 text-black border-sky-400 animate-pulse shadow-md shadow-sky-500/30'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-sky-300 border-white/[0.1]'
                    }`}
                    title="ចុចចាក់ស្តាប់សំឡេងគំរូ (Preview Voice)"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span className="text-[11px]">ផ្អាក</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current text-sky-400" />
                        <span className="text-[11px]">ស្តាប់មើល</span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Selector for 1:1 Voice */}
                  <div className="flex-1 md:w-72">
                    <select
                      value={char.currentVoiceId}
                      onChange={(e) => onChangeVoiceForCharacter(char.key, e.target.value)}
                      className={`w-full bg-[#07090e] border rounded-xl px-3 py-2 text-xs font-medium outline-none transition-colors cursor-pointer ${
                        isCollision
                          ? 'border-amber-500 text-amber-300'
                          : 'border-white/[0.12] text-slate-100 focus:border-sky-400'
                      }`}
                    >
                      <option value="">-- ជ្រើសរើសសំឡេងតួអង្គ --</option>
                      <option value={`movie_clone:${char.speaker_id}`} className="text-amber-400 font-semibold">
                        🎯 ជម្រើសទី ១: Clone សំឡេងផ្ទាល់ពីរឿងដើម ({char.name})
                      </option>
                      <option value={char.gender === 'female' ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural'} className="text-emerald-400 font-semibold">
                        🎙️ ជម្រើសទី ៣: សំឡេងខ្មែរធម្មជាតិ ({char.gender === 'female' ? 'ស្រី - Sreymom' : 'ប្រុស - Piseth'})
                      </option>

                      {char.gender === 'female' ? (
                        <>
                          <optgroup label="🌸 ជម្រើសទី ២: សំឡេងតួស្រី (Female Voice Library - ៣៨+ តួ)">
                            {characters
                              .filter((c) => c.gender === 'female')
                              .map((c) => {
                                const owner = voiceOwnerMap[c.filename] || voiceOwnerMap[c.id];
                                const isOwnedByOther = owner && owner !== char.name;
                                return (
                                  <option
                                    key={c.id}
                                    value={c.id}
                                    disabled={Boolean(isOwnedByOther)}
                                    className={isOwnedByOther ? 'text-slate-500' : ''}
                                  >
                                    {c.label} {isOwnedByOther ? `(⚠️ ជាប់ប្រើដោយ: ${owner})` : '✓ ទំនេរ'}
                                  </option>
                                );
                              })}
                          </optgroup>
                        </>
                      ) : (
                        <>
                          <optgroup label="🎙️ ជម្រើសទី ២: សំឡេងតួប្រុស (Male Voice Library - ៣៨+ តួ)">
                            {characters
                              .filter((c) => c.gender === 'male')
                              .map((c) => {
                                const owner = voiceOwnerMap[c.filename] || voiceOwnerMap[c.id];
                                const isOwnedByOther = owner && owner !== char.name;
                                return (
                                  <option
                                    key={c.id}
                                    value={c.id}
                                    disabled={Boolean(isOwnedByOther)}
                                    className={isOwnedByOther ? 'text-slate-500' : ''}
                                  >
                                    {c.label} {isOwnedByOther ? `(⚠️ ជាប់ប្រើដោយ: ${owner})` : '✓ ទំនេរ'}
                                  </option>
                                );
                              })}
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#070a12] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            រាល់ការផ្លាស់ប្តូរ នឹងត្រូវអនុវត្តលើគ្រប់បន្ទាត់សន្ទនារបស់តួអង្គនោះលើ Timeline ដោយស្វ័យប្រវត្តិ។
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-md shadow-sky-500/20 transition-all active:scale-95"
          >
            រួចរាល់ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
