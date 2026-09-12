import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  X,
  Mic2,
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Bot,
  Subtitles,
  Film,
  Music,
  Edit3,
  CheckCircle2,
  Settings2,
  Layers,
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
  maleLeadVoice?: string;
  onMaleLeadChange?: (v: string) => void;
  femaleLeadVoice?: string;
  onFemaleLeadChange?: (v: string) => void;
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
  maleLeadVoice,
  onMaleLeadChange,
  femaleLeadVoice,
  onFemaleLeadChange,
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
  videoEffects,
  onChangeEffects,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'inspector' | 'ai-assistant'>('inspector');

  // Accordion section states
  const [openSections, setOpenSections] = useState({
    voice: true,
    subtitle: false,
    audio: false,
    video: false,
  });

  // Voice controls state
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(100);
  const [emotion, setEmotion] = useState('Calm');

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedSegment = segments[selectedSegmentIndex] || null;

  // Active character info
  const selectedCharName = selectedSegment?.speaker_name || 'Xiao Yan';
  const selectedVoiceId = activeCharacterVoice || selectedSegment?.voiceId || 'hang_phleung_char_2_male.mp3';

  return (
    <aside className="w-80 bg-[#0a0e17] border-l border-white/[0.08] flex flex-col overflow-hidden select-none">
      {/* Header Tabs: Inspector | AI Assistant */}
      <div className="h-11 px-3 border-b border-white/[0.08] bg-[#070a12] flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#111827] p-0.5 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'inspector'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'ai-assistant'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
        </div>

        <div className="text-[10px] font-mono text-slate-400">v3 PRO</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs">
        {activeTab === 'inspector' ? (
          <>
            {/* 1. VOICE SECTION (Accordion) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
              <button
                onClick={() => toggleSection('voice')}
                className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-sky-400" />
                  <span>Voice</span>
                </div>
                {openSections.voice ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openSections.voice && (
                <div className="p-3.5 pt-0 flex flex-col gap-3 border-t border-white/[0.04]">
                  {/* Active Character Card */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-sky-600 to-purple-600 border border-sky-400/30 flex items-center justify-center font-bold text-white text-sm shadow-md overflow-hidden">
                        <span>{selectedCharName.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-xs">
                          {selectedCharName}
                        </span>
                        <span className="text-[10px] text-slate-400">Character Lead</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onPreviewVoice(selectedVoiceId)}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
                      title="Audition Voice"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-sky-400" />
                    </button>
                  </div>

                  {/* Voice Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-400">Voice</label>
                    <select
                      value={selectedVoiceId}
                      onChange={(e) => onSelectCharacterVoice?.(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-400 cursor-pointer"
                    >
                      <option value="hang_phleung_char_2_male.mp3">🎙️ Khmer Male 01 (តួឯកប្រុស - Hero)</option>
                      <option value="hang_phleung_char_6_female.mp3">🎙️ Khmer Female 01 (តួឯកស្រី - Gentle)</option>
                      <option value="hang_phleung_char_19_male.mp3">🎙️ Khmer Male 02 (ព្រឹទ្ធាចារ្យ - Elder)</option>
                      <option value="hang_phleung_char_1_female.mp3">🎙️ Khmer Female 02 (នារីក្លាហាន - Bold)</option>
                      <option value="elevenlabs_cloud">🌟 ElevenLabs AI Voice Clone</option>
                    </select>
                  </div>

                  {/* Emotion Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-400">Emotion</label>
                    <select
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-400 cursor-pointer"
                    >
                      <option value="Calm">Calm (ធម្មតា / ស្ងប់ស្ងាត់)</option>
                      <option value="Heroic">Heroic (អង់អាច / ក្លាហាន)</option>
                      <option value="Angry">Angry (ខឹងសម្បារ / គំរាម)</option>
                      <option value="Gentle">Gentle (ទន់ភ្លន់ / ស្នេហា)</option>
                      <option value="Dramatic">Dramatic (រំជួលចិត្ត / តឹងតែង)</option>
                    </select>
                  </div>

                  {/* Speed Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Speed</span>
                      <span className="font-mono text-sky-400">{speed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Pitch Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Pitch</span>
                      <span className="font-mono text-sky-400">{pitch > 0 ? `+${pitch}` : pitch}</span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="6"
                      step="1"
                      value={pitch}
                      onChange={(e) => setPitch(parseInt(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Volume Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Volume</span>
                      <span className="font-mono text-sky-400">{volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onPreviewVoice(selectedVoiceId)}
                      className="flex-1 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 text-sky-400" />
                      <span>Preview Voice</span>
                    </button>
                    <button
                      onClick={onStartDubbing}
                      disabled={isDubbing || !uploadedFile}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30 transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Voice</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. SUBTITLE SECTION (Accordion) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
              <button
                onClick={() => toggleSection('subtitle')}
                className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Subtitles className="w-4 h-4 text-purple-400" />
                  <span>Subtitle</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>{segments.length} lines</span>
                  {openSections.subtitle ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {openSections.subtitle && selectedSegment && (
                <div className="p-3.5 pt-0 flex flex-col gap-2.5 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Line #{selectedSegment.line_index + 1}</span>
                    <span>{selectedSegment.start_time.toFixed(1)}s - {selectedSegment.end_time.toFixed(1)}s</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] text-slate-400">Chinese Dialogue (Source)</label>
                    <div className="p-2 rounded-lg bg-[#07090e] border border-white/[0.06] text-slate-300 font-medium">
                      {selectedSegment.chinese_text || 'No source text'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10.5px] text-slate-400">Khmer Dubbed Dialogue</label>
                    <div className="p-2 rounded-lg bg-[#07090e] border border-sky-500/30 text-sky-200 font-medium leading-relaxed font-khmer">
                      {selectedSegment.khmer_translation || 'កំពុងបកប្រែ...'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. AUDIO SECTION (Accordion) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
              <button
                onClick={() => toggleSection('audio')}
                className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Audio</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>Track: AI Voice</span>
                  {openSections.audio ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {openSections.audio && (
                <div className="p-3.5 pt-0 flex flex-col gap-2.5 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Khmer Vocal Gain</span>
                    <span className="font-mono text-sky-400">+2.2 dB</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Original BGM Level</span>
                    <span className="font-mono text-amber-400">-3.0 dB</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Audio Ducking</span>
                    <span className="text-emerald-400 font-medium">Smart Auto</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. VIDEO SECTION (Accordion) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
              <button
                onClick={() => toggleSection('video')}
                className="w-full p-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-emerald-400" />
                  <span>Video</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>1080p 16:9</span>
                  {openSections.video ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {openSections.video && (
                <div className="p-3.5 pt-0 flex flex-col gap-3 border-t border-white/[0.04]">
                  {/* Upload video file input */}
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

                  {uploadedFile ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#07090e] border border-white/[0.06]">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileVideo className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="truncate text-slate-200 text-xs">{uploadedFile.filename}</span>
                      </div>
                      <button
                        onClick={onRemoveFile}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Remove Video"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-sky-500/30 hover:border-sky-400 rounded-xl p-4 text-center cursor-pointer bg-sky-500/[0.02] hover:bg-sky-500/[0.05] transition-all"
                    >
                      <UploadCloud className="w-6 h-6 text-sky-400 mx-auto mb-1.5" />
                      <div className="font-semibold text-white text-xs">Upload Video</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">MP4, MKV, MOV, WebM</div>
                    </div>
                  )}

                  {/* Voice Mode */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-300">🎭 របៀបសំឡេង (Voice Mode)</label>
                    <select
                      value={voiceMode}
                      onChange={(e) => onVoiceModeChange(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/[0.08] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:border-sky-400 outline-none"
                    >
                      <option value="voxcpm-voice-actor">🎭 Auto Distinct Cast (៣៨+ សំឡេងតួអង្គ)</option>
                      <option value="elevenlabs">🎙️ ElevenLabs AI Clone (Cloud Ultra-Realistic - មិនបាច់ប្រើ GPU/Colab)</option>
                      <option value="movie-live-clone">🎯 Movie Live Clone (កាត់សំឡេងពីរឿងដើម)</option>
                      <option value="lead-only">👑 ប្រើតែសំឡេងតួឯកប្រុស & តួស្រី</option>
                    </select>
                  </div>

                  {/* Male Lead Voice */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-300">👑 សំឡេងតួឯកប្រុស</span>
                      <button
                        onClick={() => onPreviewVoice(maleLeadVoice || 'hang_phleung_char_2_male.mp3')}
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[10.5px]"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>ស្ដាប់</span>
                      </button>
                    </div>
                    <select
                      value={maleLeadVoice || 'hang_phleung_char_2_male.mp3'}
                      onChange={(e) => onMaleLeadChange?.(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/[0.08] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:border-sky-400 outline-none"
                    >
                      <option value="hang_phleung_char_2_male.mp3">👑 តួឯកប្រុស ទី១ (ហង្សភ្លើង - សង្ហា)</option>
                      <option value="char_male_lead_star7.mp3">👑 តួប្រុស ផ្កាយ៧ (ម៉ឺងម៉ាត់)</option>
                      <option value="char_male_tactics.mp3">👑 តួប្រុស យុទ្ធសាស្ត្រ (ច្បាស់)</option>
                      <option value="hang_phleung_char_7_male.mp3">👑 តួឯកប្រុស ទី២ (ស៊ីងជឺ)</option>
                      <option value="main_lead_male.mp3">👑 តួឯកប្រុស ទី៣ (រោងកុនច្បាស់)</option>
                    </select>
                  </div>

                  {/* Female Lead Voice */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-300">🌸 សំឡេងតួឯកស្រី</span>
                      <button
                        onClick={() => onPreviewVoice(femaleLeadVoice || 'hang_phleung_char_6_female.mp3')}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[10.5px]"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>ស្ដាប់</span>
                      </button>
                    </div>
                    <select
                      value={femaleLeadVoice || 'hang_phleung_char_6_female.mp3'}
                      onChange={(e) => onFemaleLeadChange?.(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/[0.08] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:border-sky-400 outline-none"
                    >
                      <option value="hang_phleung_char_6_female.mp3">🌸 តួឯកស្រី ទី១ (ហង្សភ្លើង - ស្រទន់)</option>
                      <option value="char_female_lead_palace.mp3">🌸 តួឯកស្រី ដំណាក់រាជវាំង</option>
                      <option value="hang_phleung_char_10_female.mp3">🌸 តួឯកស្រី ទី២ (រស់រវើក)</option>
                      <option value="main_lead_female.mp3">🌸 តួឯកស្រី ទី៣ (រោងកុន)</option>
                    </select>
                  </div>

                  {/* Scope dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-400">ជម្រើសតេស្ត GENERATE (Test Scope)</label>
                    <select
                      value={dubbingScope}
                      onChange={(e) => onDubbingScopeChange?.(e.target.value)}
                      className="w-full bg-[#07090e] border border-amber-500/30 text-amber-200 text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:border-amber-400 outline-none font-medium"
                    >
                      <option value="120">⚡ តេស្តរហ័ស ២ នាទី (Test 2 Minutes - 120s)</option>
                      <option value="300">🎬 តេស្តកម្រិតមធ្យម ៥ នាទី (Test 5 Minutes - 300s)</option>
                      <option value="600">⏱️ តេស្តកម្រិតវែង ១០ នាទី (Test 10 Minutes - 600s)</option>
                      <option value="full">🌟 ពេញមួយរឿងទាំងមូល (Full Movie / Episode)</option>
                    </select>
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
                      onClick={onStartDubbing}
                      disabled={isDubbing || !uploadedFile}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 active:scale-95 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-sky-200" />
                      <span>{isDubbing ? 'កំពុងបញ្ចូលសំឡេង AI...' : 'ដំណើរការបញ្ចូលសំឡេង AI'}</span>
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
          </>
        ) : (
          /* AI ASSISTANT TAB */
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
              <div className="font-semibold flex items-center gap-1.5 text-indigo-300 mb-1">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Dubbing Director</span>
              </div>
              I can analyze character emotions, tune dialogue pacing, and improve Khmer theatrical phrasing.
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-medium text-slate-300">Director Quick Actions</label>
              <button
                onClick={onStartDubbing}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs text-left flex items-center justify-between"
              >
                <span>Auto-balance dialogue volume</span>
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              </button>
              <button
                onClick={onStartDubbing}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs text-left flex items-center justify-between"
              >
                <span>Refine theatrical phrasing</span>
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
