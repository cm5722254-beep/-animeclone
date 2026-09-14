import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Mic2,
  Subtitles,
  Volume2,
  Film,
  FileVideo,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  Loader2,
  Users,
  Settings2,
  Layers,
  Wand2,
  Languages,
} from 'lucide-react';
import { ProjectFile, TimelineSegment, CharacterVoice, VideoEffects, SubtitleStyle } from '../../types';
import { VoxCPM2OnlineToggle } from '../ui/VoxCPM2OnlineToggle';

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
  onChangeSegments?: (segments: TimelineSegment[]) => void;
  selectedSegmentIndex?: number;
  onSelectSegment?: (index: number) => void;
  characters?: CharacterVoice[];
  activeCharacterVoice?: string;
  onSelectCharacterVoice?: (voiceId: string) => void;
  onOpenCharacterCast?: () => void;
  videoEffects?: VideoEffects;
  onChangeEffects?: (effects: VideoEffects) => void;
  subtitleStyle?: SubtitleStyle;
  onChangeSubtitleStyle?: (style: SubtitleStyle) => void;
  onGenerateLineAudio?: (idx: number) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  engineMode?: string;
  onSwitchEngine?: (mode: string) => void;
  voxStatus?: any;
  onOpenVoxModal?: () => void;
}

type InspectorTab = 'workflow' | 'voice' | 'subtitle' | 'audio' | 'project' | 'video';

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
  onChangeSegments,
  selectedSegmentIndex = 0,
  onSelectSegment,
  characters = [],
  activeCharacterVoice,
  onSelectCharacterVoice,
  onOpenCharacterCast,
  videoEffects,
  onChangeEffects,
  subtitleStyle,
  onChangeSubtitleStyle,
  onGenerateLineAudio,
  onShowToast,
  engineMode = 'local',
  onSwitchEngine,
  voxStatus,
  onOpenVoxModal,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('workflow');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-switch to voice/subtitle tab when segment selection changes
  const prevIndexRef = useRef(selectedSegmentIndex);
  useEffect(() => {
    if (prevIndexRef.current !== selectedSegmentIndex && segments.length > 0) {
      prevIndexRef.current = selectedSegmentIndex;
      // switch to voice or subtitle tab contextually if on workflow
      if (activeTab === 'workflow') {
        setActiveTab('voice');
      }
    }
  }, [selectedSegmentIndex, segments.length]);

  const selectedSegment = segments[selectedSegmentIndex] || null;
  const selectedCharName = selectedSegment?.speaker_name || selectedSegment?.speaker_id || 'Xiao Yan';
  const selectedVoiceId = activeCharacterVoice || selectedSegment?.voiceId || 'hang_phleung_char_2_male.mp3';

  // Voice map to detect collisions
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

  // Emotions
  const emotionsList = [
    { id: 'calm', label: 'Calm / ធម្មតា', icon: '😊' },
    { id: 'angry', label: 'Angry / ខឹង', icon: '😡' },
    { id: 'happy', label: 'Happy / រីករាយ', icon: '😄' },
    { id: 'sad', label: 'Sad / កំសត់', icon: '😢' },
    { id: 'whisper', label: 'Whisper / ខ្សឹប', icon: '🤫' },
    { id: 'shout', label: 'Shout / ស្រែក', icon: '📢' },
  ];

  return (
    <aside className="w-[340px] bg-[#090b10] border-l border-white/[0.08] flex flex-col overflow-hidden select-none flex-shrink-0 z-10">
      {/* ── Top Header & Tab Navigation ── */}
      <div className="border-b border-white/[0.08] bg-[#07090e] p-2 flex flex-col gap-1.5 flex-shrink-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>INSPECTOR</span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {activeTab.toUpperCase()}
          </span>
        </div>

        {/* Tab Switcher Pills */}
        <div className="grid grid-cols-6 gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.06] text-[10.5px]">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-1 rounded font-medium transition-all text-center truncate ${
              activeTab === 'workflow'
                ? 'bg-sky-500 text-black font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="AI Dubbing Pipeline"
          >
            AI Dub
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-1 rounded font-medium transition-all text-center truncate ${
              activeTab === 'voice'
                ? 'bg-sky-500 text-black font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Character Voice Casting"
          >
            Voice
          </button>
          <button
            onClick={() => setActiveTab('subtitle')}
            className={`py-1 rounded font-medium transition-all text-center truncate ${
              activeTab === 'subtitle'
                ? 'bg-sky-500 text-black font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Subtitle Segment"
          >
            Sub
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-1 rounded font-medium transition-all text-center truncate ${
              activeTab === 'audio'
                ? 'bg-sky-500 text-black font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Audio Levels & Mixer"
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`py-1 rounded font-medium transition-all text-center truncate ${
              activeTab === 'video'
                ? 'bg-sky-500 text-black font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Video Effects & Transforms"
          >
            Video
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`py-1 rounded font-medium transition-all text-center truncate ${
              activeTab === 'project'
                ? 'bg-sky-500 text-black font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Project Properties"
          >
            Info
          </button>
        </div>
      </div>

      {/* ── Scrollable Tab Body ── */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {/* ================================================================ */}
        {/* TAB 1: AI DUBBING WORKFLOW PIPELINE                              */}
        {/* ================================================================ */}
        {activeTab === 'workflow' && (
          <div className="flex flex-col gap-3">
            {/* Dubbing Engine Selection */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-300">AI Voice Cloning Mode</span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'voice_actor_clone', label: '🎭 Voice Actor Library (Khmer Cast)', desc: '100+ Studio Voice Actors' },
                  { id: 'movie_clone_all', label: '🎯 Movie Live Clone 1:1', desc: 'Clones Chinese movie vocal timbre' },
                  { id: 'khmer_natural', label: '🎙️ Natural Khmer Neural TTS', desc: 'Standard Theatrical Khmer' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onVoiceModeChange(m.id)}
                    className={`p-2 rounded-lg text-left transition-all border ${
                      voiceMode === m.id
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                        : 'bg-black/30 border-white/[0.06] text-slate-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{m.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope & Gemini Model */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">Dubbing Scope</span>
                <select
                  value={dubbingScope}
                  onChange={(e) => onDubbingScopeChange?.(e.target.value)}
                  className="bg-[#07090e] border border-white/[0.1] rounded px-2 py-1 text-xs text-sky-400 font-semibold cursor-pointer"
                >
                  <option value="30">30 seconds (Quick Test)</option>
                  <option value="60">60 seconds (1 minute)</option>
                  <option value="120">120 seconds (2 minutes)</option>
                  <option value="180">180 seconds (3 minutes)</option>
                  <option value="full">Full Video / Movie</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">Gemini AI Model</span>
                <select
                  value={geminiModel}
                  onChange={(e) => onGeminiModelChange(e.target.value)}
                  className="bg-[#07090e] border border-white/[0.1] rounded px-2 py-1 text-xs text-slate-200 cursor-pointer"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Ultra Fast)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Drama)</option>
                </select>
              </div>
            </div>

            {/* Step-by-Step AI Workflow Status */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-300">AI Dubbing Pipeline</span>
              <div className="space-y-1.5">
                {[
                  { step: 1, name: 'Video Analyzed & Loaded', done: !!uploadedFile },
                  { step: 2, name: 'Dialogue & Characters Detected', done: segments.length > 0 },
                  { step: 3, name: 'Khmer Script Translated', done: segments.some((s) => !!s.khmer_translation) },
                  { step: 4, name: 'Voice Cast Assigned (1:1)', done: segments.some((s) => !!s.voiceId) },
                  { step: 5, name: 'AI Voice Dubbing Generation', done: !!dubbingOutputAudio || segments.some((s) => !!s.audioUrl) },
                  { step: 6, name: 'Audio Mixing & Assembly', done: !!dubbingOutputVideo },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      s.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/[0.05] text-slate-600'
                    }`}>
                      {s.done ? '✓' : s.step}
                    </span>
                    <span className={s.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dubbing Progress Bar & Main Button */}
            {isDubbing && (
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-300">Generating Dub...</span>
                  <span className="font-mono font-bold text-sky-400">{dubbingProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${dubbingProgress}%` }}
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 truncate">{dubbingMessage}</p>
              </div>
            )}

            <button
              onClick={onStartDubbing}
              disabled={isDubbing || !uploadedFile}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isDubbing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Dubbing Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start AI Dubbing</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: VOICE & CHARACTER CASTING                                 */}
        {/* ================================================================ */}
        {activeTab === 'voice' && (
          <div className="flex flex-col gap-3">
            {/* VoxCPM2 Engine Option Button */}
            <VoxCPM2OnlineToggle
              engineMode={engineMode}
              voxStatus={voxStatus}
              onSwitchEngine={(m) => onSwitchEngine?.(m)}
              onOpenVoxModal={onOpenVoxModal}
              variant="card"
              title="VOXCPM2: CLONE CHARACTER VOICE"
              showDetails={false}
            />

            {/* Active Character Profile */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    {selectedCharName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{selectedCharName}</div>
                    <div className="text-[10px] text-sky-400">
                      Line #{selectedSegment ? selectedSegment.line_index + 1 : 1}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onPreviewVoice(selectedVoiceId)}
                  className="p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                  title="Audition Voice"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Assigned Voice Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400">ASSIGNED VOICE</label>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => onSelectCharacterVoice?.(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-400 cursor-pointer truncate"
                >
                  <option value={`movie_clone:${selectedSegment?.speaker_id || selectedCharName}`}>
                    🎯 Clone Live Voice from Movie ({selectedCharName})
                  </option>
                  <option value={selectedSegment?.gender === 'female' ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural'}>
                    🎙️ Natural Khmer Neural ({selectedSegment?.gender === 'female' ? 'Female Sreymom' : 'Male Piseth'})
                  </option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.gender === 'female' ? '🌸' : '🎙️'} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {isConflict && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[10.5px] text-amber-300">
                  ⚠️ This voice is also used by <strong>{currentOwner}</strong>
                </div>
              )}
            </div>

            {/* Emotion & Expression Tuning */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5">
              <span className="text-[11px] font-bold text-slate-300">Emotion & Expressiveness</span>
              <div className="grid grid-cols-3 gap-1.5">
                {emotionsList.map((em) => (
                  <button
                    key={em.id}
                    onClick={() => {
                      if (selectedSegment && onChangeSegments) {
                        const copy = [...segments];
                        copy[selectedSegmentIndex] = { ...copy[selectedSegmentIndex], emotion: em.id };
                        onChangeSegments(copy);
                        onShowToast?.(`Emotion set to ${em.label}`, 'info');
                      }
                    }}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      (selectedSegment?.emotion || 'calm') === em.id
                        ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-semibold'
                        : 'bg-black/30 border-white/[0.06] text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="text-sm">{em.icon}</div>
                    <div className="text-[9.5px] mt-0.5 truncate">{em.id}</div>
                  </button>
                ))}
              </div>

              {/* Speed Slider */}
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Voice Speed</span>
                  <span className="font-mono text-sky-400">{selectedSegment?.speed || 1.0}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={selectedSegment?.speed || 1.0}
                  onChange={(e) => {
                    if (selectedSegment && onChangeSegments) {
                      const copy = [...segments];
                      copy[selectedSegmentIndex] = { ...copy[selectedSegmentIndex], speed: parseFloat(e.target.value) };
                      onChangeSegments(copy);
                    }
                  }}
                  className="accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Pitch Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Voice Pitch</span>
                  <span className="font-mono text-sky-400">{selectedSegment?.pitch || 0}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="1"
                  value={selectedSegment?.pitch || 0}
                  onChange={(e) => {
                    if (selectedSegment && onChangeSegments) {
                      const copy = [...segments];
                      copy[selectedSegmentIndex] = { ...copy[selectedSegmentIndex], pitch: parseInt(e.target.value) };
                      onChangeSegments(copy);
                    }
                  }}
                  className="accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Generate Single Line Audio Button */}
            {onGenerateLineAudio && selectedSegment && (
              <button
                onClick={() => onGenerateLineAudio(selectedSegmentIndex)}
                className="w-full py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>Generate Voice for Line #{selectedSegmentIndex + 1}</span>
              </button>
            )}

            {onOpenCharacterCast && (
              <button
                onClick={onOpenCharacterCast}
                className="w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Open Full Character Casting Drawer</span>
              </button>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: SUBTITLE SEGMENT EDITOR                                   */}
        {/* ================================================================ */}
        {activeTab === 'subtitle' && (
          <div className="flex flex-col gap-3">
            {selectedSegment ? (
              <>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      Segment #{selectedSegment.line_index + 1}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {selectedSegment.start_time?.toFixed(1)}s - {selectedSegment.end_time?.toFixed(1)}s
                    </span>
                  </div>

                  {/* Chinese Source Text */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400">SOURCE (CHINESE)</label>
                    <textarea
                      rows={2}
                      value={selectedSegment.chinese_text || ''}
                      onChange={(e) => {
                        if (onChangeSegments) {
                          const copy = [...segments];
                          copy[selectedSegmentIndex] = { ...copy[selectedSegmentIndex], chinese_text: e.target.value };
                          onChangeSegments(copy);
                        }
                      }}
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-sky-400 resize-none font-mono"
                    />
                  </div>

                  {/* Khmer Translated Text */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-sky-400">KHMER TRANSLATION</label>
                    <textarea
                      rows={3}
                      value={selectedSegment.khmer_translation || ''}
                      onChange={(e) => {
                        if (onChangeSegments) {
                          const copy = [...segments];
                          copy[selectedSegmentIndex] = { ...copy[selectedSegmentIndex], khmer_translation: e.target.value };
                          onChangeSegments(copy);
                        }
                      }}
                      className="w-full bg-[#07090e] border border-sky-500/30 rounded-lg p-2 text-xs text-white outline-none focus:border-sky-400 resize-none font-khmer font-medium"
                    />
                  </div>
                </div>

                {/* Subtitle Styling Settings */}
                {subtitleStyle && onChangeSubtitleStyle && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5">
                    <span className="text-[11px] font-bold text-slate-300">Subtitle Style</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Font Size</label>
                        <input
                          type="number"
                          min="14"
                          max="36"
                          value={subtitleStyle.fontSize}
                          onChange={(e) => onChangeSubtitleStyle({ ...subtitleStyle, fontSize: parseInt(e.target.value) || 20 })}
                          className="w-full bg-[#07090e] border border-white/[0.1] rounded px-2 py-1 text-xs text-white mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Position</label>
                        <select
                          value={subtitleStyle.position}
                          onChange={(e) => onChangeSubtitleStyle({ ...subtitleStyle, position: e.target.value as any })}
                          className="w-full bg-[#07090e] border border-white/[0.1] rounded px-2 py-1 text-xs text-white mt-0.5"
                        >
                          <option value="bottom">Bottom</option>
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-slate-500">
                No segment selected. Click a segment on the timeline to edit.
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: AUDIO MIXER CONTROLS                                      */}
        {/* ================================================================ */}
        {activeTab === 'audio' && (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-300">Audio Channels & Mixing</span>

              {/* Master Volume */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Khmer Dub Vocal Level</span>
                  <span className="font-mono text-sky-400">100%</span>
                </div>
                <input type="range" min="0" max="150" defaultValue="100" className="accent-sky-400 cursor-pointer" />
              </div>

              {/* BGM Level */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Background Music (BGM)</span>
                  <span className="font-mono text-sky-400">75%</span>
                </div>
                <input type="range" min="0" max="150" defaultValue="75" className="accent-sky-400 cursor-pointer" />
              </div>

              {/* Original Vocal Suppression */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                <div>
                  <div className="font-semibold text-xs text-slate-200">Mute Original Vocals</div>
                  <div className="text-[10px] text-slate-500">Auto-suppress Chinese speech</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-sky-400 w-4 h-4 cursor-pointer" />
              </div>

              {/* Auto Ducking */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                <div>
                  <div className="font-semibold text-xs text-slate-200">Smart BGM Ducking</div>
                  <div className="text-[10px] text-slate-500">Lower music during dialogue</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-sky-400 w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 5: VIDEO FX & TRANSFORMS                                     */}
        {/* ================================================================ */}
        {activeTab === 'video' && (
          <div className="flex flex-col gap-3">
            {videoEffects && onChangeEffects ? (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3">
                <span className="text-[11px] font-bold text-slate-300">Color & Cinematic Grade</span>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Brightness</span>
                    <span className="font-mono text-sky-400">{videoEffects.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={videoEffects.brightness}
                    onChange={(e) => onChangeEffects({ ...videoEffects, brightness: parseInt(e.target.value) })}
                    className="accent-sky-400 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Contrast</span>
                    <span className="font-mono text-sky-400">{videoEffects.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={videoEffects.contrast}
                    onChange={(e) => onChangeEffects({ ...videoEffects, contrast: parseInt(e.target.value) })}
                    className="accent-sky-400 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Saturation</span>
                    <span className="font-mono text-sky-400">{videoEffects.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={videoEffects.saturation}
                    onChange={(e) => onChangeEffects({ ...videoEffects, saturation: parseInt(e.target.value) })}
                    className="accent-sky-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                  <span className="text-xs text-slate-200">Cinematic Vignette</span>
                  <input
                    type="checkbox"
                    checked={videoEffects.vignette || false}
                    onChange={(e) => onChangeEffects({ ...videoEffects, vignette: e.target.checked })}
                    className="accent-sky-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                  <span className="text-xs text-slate-200">Letterbox (2.35:1)</span>
                  <input
                    type="checkbox"
                    checked={videoEffects.letterbox || false}
                    onChange={(e) => onChangeEffects({ ...videoEffects, letterbox: e.target.checked })}
                    className="accent-sky-400 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-4">No video effects configured.</div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 6: PROJECT & METADATA INFO                                   */}
        {/* ================================================================ */}
        {activeTab === 'project' && (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-300">Project Details</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">File Name</span>
                  <span className="text-slate-200 font-mono truncate max-w-[180px]">
                    {uploadedFile?.originalName || uploadedFile?.filename || 'No video loaded'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Resolution</span>
                  <span className="text-slate-200 font-mono">1920 × 1080 (16:9)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Source Language</span>
                  <span className="text-slate-200">Chinese (Simplified)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Target Language</span>
                  <span className="text-sky-300 font-semibold">Khmer (Cambodia)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Total Dialogue Lines</span>
                  <span className="text-slate-200 font-mono">{segments.length} lines</span>
                </div>
              </div>
            </div>

            {/* Video File Replace / Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadFile(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-medium text-xs border border-white/[0.08] transition-colors"
            >
              {uploadedFile ? 'Replace Project Video...' : 'Upload Video File...'}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
