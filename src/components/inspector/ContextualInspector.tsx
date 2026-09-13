import React, { useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  X,
  Mic2,
  Sparkles,
  Play,
  Sliders,
  ChevronDown,
  ChevronRight,
  Subtitles,
  Film,
  Users,
  Clock,
  Loader2,
} from 'lucide-react';
import { ProjectFile, TimelineSegment, CharacterVoice, VideoEffects } from '../../types';

interface ContextualInspectorProps {
  uploadedFile: ProjectFile | null;
  isUploadingFile?: boolean;
  uploadProgress?: number;
  uploadInfo?: { loadedMb: string; totalMb: string } | null;
  onUploadFile: (file: File) => void;
  onRemoveFile: () => void;
  voiceMode: string;
  onVoiceModeChange: (m: string) => void;
  dubbingScope?: string;
  onDubbingScopeChange?: (scope: string) => void;
  geminiModel: string;
  onGeminiModelChange: (m: string) => void;
  isDubbing: boolean;
  dubbingProgress: number;
  dubbingMessage: string;
  dubbingOutputVideo: string | null;
  dubbingOutputAudio: string | null;
  onStartDubbing: () => void;
  onPreviewVoice: (filename: string) => void;
  segments?: TimelineSegment[];
  selectedSegmentIndex?: number;
  onSelectSegment?: (index: number) => void;
  characters?: CharacterVoice[];
  activeCharacterVoice?: string;
  onSelectCharacterVoice?: (voiceId: string) => void;
  onOpenCharacterCast?: () => void;
  videoEffects?: VideoEffects;
  onChangeEffects?: (effects: VideoEffects) => void;
}

export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  uploadedFile,
  isUploadingFile = false,
  uploadProgress = 0,
  uploadInfo,
  onUploadFile,
  onRemoveFile,
  voiceMode,
  onVoiceModeChange,
  dubbingScope = '120',
  onDubbingScopeChange,
  geminiModel,
  onGeminiModelChange,
  isDubbing,
  dubbingProgress,
  dubbingMessage,
  dubbingOutputVideo,
  dubbingOutputAudio,
  onStartDubbing,
  onPreviewVoice,
  segments = [],
  selectedSegmentIndex = 0,
  onSelectSegment,
  characters = [],
  activeCharacterVoice,
  onSelectCharacterVoice,
  onOpenCharacterCast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accordion section states (only keeping useful functional ones)
  const [openSections, setOpenSections] = React.useState({
    characterVoice: true,
    subtitle: true,
    projectSettings: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedSegment = segments[selectedSegmentIndex] || null;

  // Active character info
  const selectedCharName = selectedSegment?.speaker_name || selectedSegment?.speaker_id || 'Xiao Yan';
  const selectedVoiceId = activeCharacterVoice || selectedSegment?.voiceId || 'hang_phleung_char_2_male.mp3';

  // Map of voiceId -> characterName across all segments
  const voiceOwnerMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of segments) {
      const charName = s.speaker_name || s.speaker_id || 'តួអង្គ';
      if (s.voiceId) {
        const clean = s.voiceId.replace('voxcpm:', '');
        map[clean] = charName;
        map[s.voiceId] = charName;
      }
    }
    return map;
  }, [segments]);

  const cleanSelectedVoiceId = selectedVoiceId.replace('voxcpm:', '');
  const currentOwner = voiceOwnerMap[cleanSelectedVoiceId] || voiceOwnerMap[selectedVoiceId];
  const isConflict = currentOwner && currentOwner !== selectedCharName;

  return (
    <aside className="w-80 bg-[#0a0e17] border-l border-white/[0.08] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="h-11 px-3.5 border-b border-white/[0.08] bg-[#070a12] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Inspector & Voice Studio</span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">
          1:1 Multi-Cast
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {/* 1. CHARACTER & 1:1 VOICE ASSIGNMENT */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
          <button
            onClick={() => toggleSection('characterVoice')}
            className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-sky-400" />
              <span>សំឡេងតួអង្គ (Character Voice 1:1)</span>
            </div>
            {openSections.characterVoice ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.characterVoice && (
            <div className="p-3.5 pt-0 flex flex-col gap-3 border-t border-white/[0.04]">
              {/* Active Character Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-sky-600 to-purple-600 border border-sky-400/30 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
                    <span>{selectedCharName.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-100 text-xs truncate">
                      {selectedCharName}
                    </span>
                    <span className="text-[10px] text-sky-400 font-medium">
                      តួអង្គក្នុងឃ្លា #{selectedSegment ? selectedSegment.line_index + 1 : 1}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onPreviewVoice(selectedVoiceId)}
                  className="p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0 transition-colors"
                  title="ចុចចាក់ស្តាប់សំឡេងគំរូ"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* 1:1 Exclusive Voice Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-300">
                    ជ្រើសរើសសំឡេងប្រចាំតួ (1:1 Voice)
                  </label>
                  {onOpenCharacterCast && (
                    <button
                      type="button"
                      onClick={onOpenCharacterCast}
                      className="text-[10.5px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Users className="w-3 h-3" />
                      <span>តារាងគ្រប់តួ</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedVoiceId}
                    onChange={(e) => onSelectCharacterVoice?.(e.target.value)}
                    className="flex-1 bg-[#07090e] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-400 cursor-pointer truncate"
                  >
                    <option value={`movie_clone:${selectedSegment?.speaker_id || selectedCharName}`} className="text-amber-400 font-semibold">
                      🎯 ជម្រើសទី ១: Clone សំឡេងផ្ទាល់ពីរឿងដើម ({selectedCharName})
                    </option>
                    <option value={selectedSegment?.gender === 'female' || selectedCharName.includes('ស្រី') ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural'} className="text-emerald-400 font-semibold">
                      🎙️ ជម្រើសទី ៣: សំឡេងខ្មែរធម្មជាតិ ({selectedSegment?.gender === 'female' || selectedCharName.includes('ស្រី') ? 'ស្រី (Sreymom)' : 'ប្រុស (Piseth)'})
                    </option>
                    {characters && characters.length > 0 ? (
                      <>
                        <optgroup label="🌸 ជម្រើសទី ២: សំឡេងតួស្រី (Female Voice Library)">
                          {characters
                            .filter((c) => c.gender === 'female')
                            .map((c) => {
                              const clean = c.id.replace('voxcpm:', '');
                              const owner = voiceOwnerMap[clean] || voiceOwnerMap[c.filename] || voiceOwnerMap[c.id];
                              const isUsedByOther = owner && owner !== selectedCharName;
                              return (
                                <option key={c.id} value={c.id}>
                                  {c.label} {isUsedByOther ? `(⚠️ ជាប់ប្រើ: ${owner})` : '✓ ទំនេរ'}
                                </option>
                              );
                            })}
                        </optgroup>
                        <optgroup label="🎙️ ជម្រើសទី ២: សំឡេងតួប្រុស (Male Voice Library)">
                          {characters
                            .filter((c) => c.gender === 'male')
                            .map((c) => {
                              const clean = c.id.replace('voxcpm:', '');
                              const owner = voiceOwnerMap[clean] || voiceOwnerMap[c.filename] || voiceOwnerMap[c.id];
                              const isUsedByOther = owner && owner !== selectedCharName;
                              return (
                                <option key={c.id} value={c.id}>
                                  {c.label} {isUsedByOther ? `(⚠️ ជាប់ប្រើ: ${owner})` : '✓ ទំនេរ'}
                                </option>
                              );
                            })}
                        </optgroup>
                      </>
                    ) : (
                      <>
                        <option value="hang_phleung_char_6_female.mp3">🌸 Khmer Female 01 (តួឯកស្រី)</option>
                        <option value="hang_phleung_char_2_male.mp3">🎙️ Khmer Male 01 (តួឯកប្រុស)</option>
                      </>
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => onPreviewVoice(selectedVoiceId)}
                    className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sky-400 border border-white/[0.1] shrink-0 transition-colors"
                    title="ចុចចាក់ស្តាប់សំឡេងគំរូ (Audition Voice)"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {isConflict && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10.5px] text-amber-300 flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>សំឡេងនេះកំពុងជាប់ប្រើដោយ <strong>{currentOwner}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. SUBTITLE & TRANSLATION VIEWER */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
          <button
            onClick={() => toggleSection('subtitle')}
            className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-purple-400" />
              <span>ឃ្លាសន្ទនាបច្ចុប្បន្ន (Dialogue Line)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>{segments.length} ឃ្លា</span>
              {openSections.subtitle ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {openSections.subtitle && (
            <div className="p-3.5 pt-0 flex flex-col gap-2.5 border-t border-white/[0.04]">
              {selectedSegment ? (
                <>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-sky-400 font-semibold">ឃ្លា #{selectedSegment.line_index + 1}</span>
                    <span>{selectedSegment.start_time.toFixed(1)}s - {selectedSegment.end_time.toFixed(1)}s</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] text-slate-400">អត្ថបទដើម (Chinese/Source)</label>
                    <div className="p-2 rounded-lg bg-[#07090e] border border-white/[0.06] text-slate-300 font-medium select-text">
                      {selectedSegment.chinese_text || 'គ្មានអត្ថបទដើម'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] text-sky-400 font-medium">អត្ថបទបកប្រែជាភាសាខ្មែរ (Khmer Dubbed)</label>
                    <div className="p-2.5 rounded-lg bg-[#07090e] border border-sky-500/30 text-sky-200 font-medium leading-relaxed font-khmer select-text">
                      {selectedSegment.khmer_translation || 'កំពុងរង់ចាំការបកប្រែ...'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs">
                  សូមជ្រើសរើសឃ្លាសន្ទនានៅលើ Timeline
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. PROJECT & DUBBING CONTROLS */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
          <button
            onClick={() => toggleSection('projectSettings')}
            className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-400" />
              <span>ការកំណត់បញ្ចូលសំឡេង (Dubbing Settings)</span>
            </div>
            {openSections.projectSettings ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openSections.projectSettings && (
            <div className="p-3.5 pt-0 flex flex-col gap-3 border-t border-white/[0.04]">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onUploadFile(e.target.files[0]);
                  }
                }}
              />

              {/* Uploaded File status */}
              {uploadedFile ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#07090e] border border-white/[0.06]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileVideo className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate text-slate-200 text-xs">{uploadedFile.filename}</span>
                  </div>
                  <button
                    onClick={onRemoveFile}
                    className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                    title="ដោះវីដេអូចេញ (Remove Video)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-sky-500/30 hover:border-sky-400 rounded-xl p-3.5 text-center cursor-pointer bg-sky-500/[0.02] hover:bg-sky-500/[0.05] transition-all"
                >
                  <UploadCloud className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                  <div className="font-semibold text-white text-xs">បញ្ចូលវីដេអូ (Upload Video)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">MP4, MKV, MOV, WebM</div>
                </div>
              )}

              {/* Uploading progress if any */}
              {isUploadingFile && (
                <div className="space-y-1 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs">
                  <div className="flex justify-between font-mono text-[10.5px] text-sky-300">
                    <span>កំពុង Upload វីដេអូ...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {uploadInfo && (
                    <div className="text-[10px] text-slate-400 font-mono text-right">
                      {uploadInfo.loadedMb}MB / {uploadInfo.totalMb}MB
                    </div>
                  )}
                </div>
              )}

              {/* Voice Mode */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">🎭 របៀបសំឡេង (Voice Mode)</label>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    {(voiceMode === 'movie_clone_all' || voiceMode === 'movie-live-clone') && '🎯 ជម្រើសទី ១'}
                    {(voiceMode === 'voice_actor_clone' || voiceMode === 'voxcpm-voice-actor') && '🎭 ជម្រើសទី ២'}
                    {(voiceMode === 'khmer_natural' || voiceMode === 'pure_khmer') && '🎙️ ជម្រើសទី ៣'}
                  </span>
                </div>
                <select
                  value={voiceMode}
                  onChange={(e) => onVoiceModeChange(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/[0.12] text-slate-100 text-xs rounded-lg px-2.5 py-2 cursor-pointer focus:border-sky-400 outline-none font-medium"
                >
                  <option value="movie_clone_all">🎯 ជម្រើសទី ១: Clone សំឡេងផ្ទាល់ពីរឿងដើមទាំងអស់ (Movie Clone 100%)</option>
                  <option value="voice_actor_clone">🎭 ជម្រើសទី ២: Clone សំឡេង Voice Actor ពី Library (៣៨+ សំឡេងខ្មែរ)</option>
                  <option value="khmer_natural">🎙️ ជម្រើសទី ៣: សំឡេងខ្មែរធម្មជាតិ (Khmer Natural Theatrical Neural)</option>
                </select>

                {/* Voice Mode Explanation Card */}
                <div className="text-[10.5px] p-2.5 rounded-lg bg-black/40 border border-white/[0.08] text-slate-300 leading-relaxed shadow-inner">
                  {(voiceMode === 'movie_clone_all' || voiceMode === 'movie-live-clone') && (
                    <div className="flex items-start gap-1.5 text-amber-300">
                      <span className="shrink-0 text-sm">🎯</span>
                      <span><b>ជម្រើសទី ១ (Movie Clone):</b> ស្រង់សំឡេងតួអង្គពិតប្រាកដពីរឿងដើមផ្ទាល់ មក Clone និយាយខ្មែរ ១០០% មិនលាយសំឡេងក្រៅឡើយ (១ តួអង្គ = ១ សំឡេងរឿងដើម)។</span>
                    </div>
                  )}
                  {(voiceMode === 'voice_actor_clone' || voiceMode === 'voxcpm-voice-actor') && (
                    <div className="flex items-start gap-1.5 text-sky-300">
                      <span className="shrink-0 text-sm">🎭</span>
                      <span><b>ជម្រើសទី ២ (Voice Actor):</b> ប្រើសំឡេង Voice Actor ខ្មែរ ៣៨+ តួអង្គក្នុង Library (ស្រីដាច់ដោយឡែក ប្រុសដាច់ដោយឡែក ១ តួអង្គ = ១ សំឡេង មិនច្រឡំភេទ)។</span>
                    </div>
                  )}
                  {(voiceMode === 'khmer_natural' || voiceMode === 'pure_khmer') && (
                    <div className="flex items-start gap-1.5 text-emerald-300">
                      <span className="shrink-0 text-sm">🎙️</span>
                      <span><b>ជម្រើសទី ៣ (Khmer Natural):</b> សំឡេងខ្មែរធម្មជាតិសុទ្ធសាធ (Edge-TTS Neural) ច្បាស់ ពិរោះ ស្រទន់ និងដាច់ដោយឡែកតាមតួអង្គនីមួយៗ (មិនលាយ Clone)។</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scope Selection: 4 Buttons (2mn, 5mn, 7mn, 1 full movie) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>រយៈពេល Generate វីដេអូ</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    {dubbingScope === '120' && '⚡ ២ នាទី (120s)'}
                    {dubbingScope === '300' && '🎬 ៥ នាទី (300s)'}
                    {dubbingScope === '420' && '⏱️ ៧ នាទី (420s)'}
                    {dubbingScope === 'full' && '🌟 ១ រឿងពេញ'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '120', label: '២ នាទី', sublabel: 'តេស្តរហ័ស (120s)', icon: '⚡' },
                    { id: '300', label: '៥ នាទី', sublabel: 'កម្រិតមធ្យម (300s)', icon: '🎬' },
                    { id: '420', label: '៧ នាទី', sublabel: 'ឈុតវែង (420s)', icon: '⏱️' },
                    { id: 'full', label: '១រឿងពេញ', sublabel: 'ពេញលេញ (Full)', icon: '🌟' },
                  ].map((item) => {
                    const isSelected = dubbingScope === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onDubbingScopeChange?.(item.id)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500/25 via-sky-500/15 to-indigo-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                            : 'bg-[#07090e] border-white/[0.08] text-slate-300 hover:border-white/[0.2] hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <span>{item.icon}</span>
                            <span className={isSelected ? 'text-amber-300' : 'text-slate-200'}>
                              {item.label}
                            </span>
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400 animate-pulse" />
                          )}
                        </div>
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-200/90 font-medium' : 'text-slate-500'}`}>
                          {item.sublabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gemini Model */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-400">ម៉ូដែល AI Gemini</label>
                <select
                  value={geminiModel}
                  onChange={(e) => onGeminiModelChange(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-sky-300 outline-none cursor-pointer"
                >
                  <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (លឿន & ឆ្លាត)</option>
                  <option value="gemini-3.1-flash-lite">🚀 Gemini 3.1 Flash-Lite</option>
                  <option value="gemini-3.7-flash">🧠 Gemini 3.7 Flash</option>
                </select>
              </div>

              {/* Master Start Dubbing Action inside Inspector */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onStartDubbing();
                  }}
                  disabled={isDubbing || !uploadedFile}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isDubbing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-sky-200" />
                  )}
                  <span>{isDubbing ? `កំពុងបញ្ចូលសំឡេង AI (${dubbingProgress}%)...` : 'ដំណើរការបញ្ចូលសំឡេង AI'}</span>
                </button>

                {isDubbing && (
                  <div className="space-y-1.5 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs">
                    <div className="flex justify-between font-mono text-[10.5px] text-sky-300">
                      <span>{dubbingMessage || 'កំពុងដំណើរការ...'}</span>
                      <span>{dubbingProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
                        style={{ width: `${dubbingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
