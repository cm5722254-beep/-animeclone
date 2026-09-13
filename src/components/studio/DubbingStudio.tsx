import React, { useState } from 'react';
import { VideoPreview } from '../player/VideoPreview';
import { ContextualInspector } from '../inspector/ContextualInspector';
import { MultiTrackTimeline } from '../timeline/MultiTrackTimeline';
import { AiDubbingWorkflow } from './AiDubbingWorkflow';
import { VideoEffectsPanel } from '../effects/VideoEffectsPanel';
import { CharacterCastDrawer } from './CharacterCastDrawer';
import { ProjectFile, TimelineSegment, VideoEffects, SubtitleStyle, CharacterVoice } from '../../types';
import { Sliders, X, Film, Mic2, Languages, Volume2, Subtitles, Share2, Sparkles, Video, Users } from 'lucide-react';

interface DubbingStudioProps {
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
  segments: TimelineSegment[];
  onChangeSegments?: (segments: TimelineSegment[]) => void;
  selectedSegmentIndex: number;
  onSelectSegment: (index: number) => void;
  onScanTimeline: () => void;
  isScanningTimeline?: boolean;
  onAssemble: () => void;
  videoEffects: VideoEffects;
  onChangeEffects: (effects: VideoEffects) => void;
  subtitleStyle: SubtitleStyle;
  onChangeSubtitleStyle: (style: SubtitleStyle) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  onOpenThumbnailStudio: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  characters?: CharacterVoice[];
  onOpenTab?: (tabId: any) => void;
  onOpenExport?: () => void;
}

export const DubbingStudio: React.FC<DubbingStudioProps> = ({
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
  segments,
  onChangeSegments,
  selectedSegmentIndex,
  onSelectSegment,
  onScanTimeline,
  isScanningTimeline = false,
  onAssemble,
  videoEffects,
  onChangeEffects,
  subtitleStyle,
  onChangeSubtitleStyle,
  videoRef,
  onOpenThumbnailStudio,
  onShowToast,
  characters = [],
  onOpenTab,
  onOpenExport,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [zoom, setZoom] = useState(100);
  const [showEffectsDrawer, setShowEffectsDrawer] = useState(false);
  const [showCharacterCastDrawer, setShowCharacterCastDrawer] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subTab, setSubTab] = useState<'media' | 'dubbing' | 'translation' | 'voices' | 'subtitles' | 'audio' | 'export'>('dubbing');

  // Video source: prioritize dubbed result, then uploaded media
  const activeVideoSrc = dubbingOutputVideo || uploadedFile?.url || '';

  // Current active subtitle
  const activeSegment = segments.find(
    (s) => currentTime >= s.start_time && currentTime <= s.end_time
  );
  const currentSubtitle = activeSegment?.khmer_translation || activeSegment?.chinese_text;

  // Compute unique characters count
  const uniqueCharsCount = React.useMemo(() => {
    const sids = new Set(segments.map((s) => s.speaker_name || s.speaker_id || 'តួអង្គ'));
    return sids.size;
  }, [segments]);

  // Handler to change voice for a character across all segments
  const handleChangeVoiceForCharacter = (charKey: string, newVoiceId: string) => {
    if (!onChangeSegments) return;
    const clean = newVoiceId.replace('voxcpm:', '');
    const matched = characters.find((c) => c.id === newVoiceId || c.filename === clean);
    const updated = segments.map((s) => {
      const k = s.speaker_name || s.speaker_id || 'តួអង្គ';
      if (k === charKey || s.speaker_id === charKey || s.speaker_name === charKey) {
        return {
          ...s,
          voiceId: newVoiceId,
          voiceFilename: clean,
          voiceLabel: matched ? matched.label : clean,
          gender: matched ? matched.gender : s.gender,
        };
      }
      return s;
    });
    onChangeSegments(updated);
    onShowToast(`បានកំណត់សំឡេងថ្មីសម្រាប់តួអង្គ "${charKey}"!`, 'success');
  };

  // Handler to auto-cast 1:1 unique voices to all characters
  // Handler to auto-cast 1:1 unique voices to all characters based on active voiceMode
  const handleAutoCastUniqueVoices = () => {
    if (!onChangeSegments) return;
    const uniqueKeys = Array.from(new Set(segments.map((s) => s.speaker_name || s.speaker_id || 'តួអង្គ')));
    const malePool = characters.filter((c) => c.gender === 'male');
    const femalePool = characters.filter((c) => c.gender === 'female');
    const used = new Set<string>();

    const mapping: Record<string, { voiceId: string; filename: string; label: string; gender: 'male' | 'female' }> = {};

    uniqueKeys.forEach((k) => {
      const seg = segments.find((s) => (s.speaker_name || s.speaker_id || 'តួអង្គ') === k);
      const isFem =
        seg?.gender === 'female' ||
        seg?.speaker_role?.includes('female') ||
        k.includes('ស្រី') ||
        k.toLowerCase().includes('female');
      const gen: 'male' | 'female' = isFem ? 'female' : 'male';

      // 🎯 Option 1: Movie Live Clone 100%
      if (voiceMode === 'movie_clone_all' || voiceMode === 'movie-live-clone') {
        mapping[k] = {
          voiceId: `movie_clone:${seg?.speaker_id || k}`,
          filename: seg?.movieVoiceSample ? seg.movieVoiceSample.split('/').pop()! : (isFem ? 'main_lead_female.mp3' : 'main_lead_male.mp3'),
          label: `🎯 ជម្រើសទី ១: Clone សំឡេងផ្ទាល់ពីរឿង (${k})`,
          gender: gen,
        };
      }
      // 🎙️ Option 3: Khmer Natural Theatrical
      else if (voiceMode === 'khmer_natural' || voiceMode === 'pure_khmer') {
        mapping[k] = {
          voiceId: isFem ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural',
          filename: isFem ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural',
          label: `🎙️ ជម្រើសទី ៣: សំឡេងខ្មែរធម្មជាតិ (${k})`,
          gender: gen,
        };
      }
      // 🎭 Option 2: Voice Actor Library (Strictly Zero Gender Crossover)
      else {
        const pool = isFem ? femalePool : malePool;
        let chosen = pool.find((c) => !used.has(c.filename));
        // If pool exhausted: recycle WITHIN SAME GENDER pool (NEVER pick from opposite gender!)
        if (!chosen && pool.length > 0) {
          chosen = pool[used.size % pool.length];
        }

        if (chosen) {
          used.add(chosen.filename);
          mapping[k] = {
            voiceId: chosen.id || `voxcpm:${chosen.filename}`,
            filename: chosen.filename,
            label: chosen.label,
            gender: gen,
          };
        } else {
          mapping[k] = {
            voiceId: isFem ? 'hang_phleung_char_6_female.mp3' : 'hang_phleung_char_2_male.mp3',
            filename: isFem ? 'hang_phleung_char_6_female.mp3' : 'hang_phleung_char_2_male.mp3',
            label: isFem ? '🌸 Khmer Female 01' : '🎙️ Khmer Male 01',
            gender: gen,
          };
        }
      }
    });

    const updated = segments.map((s) => {
      const k = s.speaker_name || s.speaker_id || 'តួអង្គ';
      const m = mapping[k];
      if (m) {
        return {
          ...s,
          gender: m.gender,
          voiceId: m.voiceId,
          voiceFilename: m.filename,
          voiceLabel: m.label,
        };
      }
      return s;
    });

    onChangeSegments(updated);
    onShowToast(`បានចាត់ចែងសំឡេង ១ តួអង្គ = ១ សំឡេងដោយស្វ័យប្រវត្តិ (គ្មានជាន់គ្នា)!`, 'success');
  };

  // Sub-navigation pills
  const subNavItems = [
    { id: 'media', label: 'Media', icon: <Video className="w-3.5 h-3.5" />, action: () => setSubTab('media') },
    { id: 'dubbing', label: 'Dubbing', icon: <Film className="w-3.5 h-3.5" />, action: () => setSubTab('dubbing') },
    { id: 'translation', label: 'Translation', icon: <Languages className="w-3.5 h-3.5" />, action: () => onOpenTab?.('tab-translator') },
    {
      id: 'voices',
      label: `Voices (${uniqueCharsCount})`,
      icon: <Users className="w-3.5 h-3.5 text-sky-400" />,
      action: () => setShowCharacterCastDrawer(true),
    },
    { id: 'subtitles', label: 'Subtitles', icon: <Subtitles className="w-3.5 h-3.5" />, action: () => onOpenTab?.('tab-subtitles') },
    { id: 'audio', label: 'Audio', icon: <Volume2 className="w-3.5 h-3.5" />, action: () => onOpenTab?.('tab-mixer') },
    { id: 'export', label: 'Export', icon: <Share2 className="w-3.5 h-3.5" />, action: () => onOpenExport?.() },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#07090e]">
      {/* Sub-Navigation Tabs matching Image 3 */}
      <div className="h-11 px-4 border-b border-white/[0.08] bg-[#0a0e17] flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          {subNavItems.map((item) => {
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600/40 to-indigo-600/40 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Video Effects & 3D Title Trigger */}
        <button
          onClick={() => setShowEffectsDrawer(!showEffectsDrawer)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            showEffectsDrawer
              ? 'bg-sky-500/20 border-sky-400 text-sky-200'
              : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
          }`}
          title="Video Effects & 3D Typography"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>Effects & 3D Text</span>
        </button>
      </div>

      {/* Upper Half: 3-Column Studio Layout (Video Canvas + Workflow Stepper + Contextual Inspector) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden border-b border-white/[0.08] relative">
        {/* Left Column: 16:9 Video Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden bg-black/40">
          <VideoPreview
            src={activeVideoSrc}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isMuted={isMuted}
            playbackRate={playbackRate}
            currentSubtitle={currentSubtitle}
            showSubtitles={showSubtitles}
            onToggleSubtitles={() => setShowSubtitles((prev) => !prev)}
            videoEffects={videoEffects}
            onChangeEffects={onChangeEffects}
            subtitleStyle={subtitleStyle}
            videoRef={videoRef}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onToggleMute={() => setIsMuted(!isMuted)}
            onRateChange={setPlaybackRate}
            onStep={(delta) => setCurrentTime(Math.max(0, Math.min(duration, currentTime + delta)))}
            onOpenThumbnailStudio={onOpenThumbnailStudio}
            onShowToast={onShowToast}
          />

          {/* Slide-over Effects Panel */}
          {showEffectsDrawer && (
            <div className="absolute top-3 right-3 z-30 w-96 max-h-[90%] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-white/[0.1] bg-[#0c101c]">
              <div className="relative">
                <button
                  onClick={() => setShowEffectsDrawer(false)}
                  className="absolute top-4 right-4 z-40 p-1.5 rounded-lg text-slate-400 hover:text-white bg-black/50 hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
                <VideoEffectsPanel
                  effects={videoEffects}
                  onChangeEffects={onChangeEffects}
                  subtitleStyle={subtitleStyle}
                  onChangeSubtitleStyle={onChangeSubtitleStyle}
                  onShowToast={onShowToast}
                />
              </div>
            </div>
          )}
        </div>

        {/* Middle Column: AI Dubbing Workflow Stepper (Matching Image 3) */}
        <AiDubbingWorkflow
          hasVideo={Boolean(uploadedFile)}
          characterCount={characters.length || 5}
          hasTranslation={segments.some((s) => Boolean(s.khmer_translation))}
          hasVoiceCasting={segments.some((s) => Boolean(s.voiceId))}
          isDubbing={isDubbing}
          dubbingProgress={dubbingProgress}
          hasDubbedOutput={Boolean(dubbingOutputVideo || dubbingOutputAudio)}
          dubbingScope={dubbingScope}
          onDubbingScopeChange={onDubbingScopeChange}
          onStartDubbing={onStartDubbing}
          onScanTimeline={onScanTimeline}
        />

        {/* Right Column: Contextual Inspector */}
        <ContextualInspector
          uploadedFile={uploadedFile}
          isUploadingFile={isUploadingFile}
          uploadProgress={uploadProgress}
          uploadInfo={uploadInfo}
          onUploadFile={onUploadFile}
          onRemoveFile={onRemoveFile}
          voiceMode={voiceMode}
          onVoiceModeChange={onVoiceModeChange}
          dubbingScope={dubbingScope}
          onDubbingScopeChange={onDubbingScopeChange}
          geminiModel={geminiModel}
          onGeminiModelChange={onGeminiModelChange}
          isDubbing={isDubbing}
          dubbingProgress={dubbingProgress}
          dubbingMessage={dubbingMessage}
          dubbingOutputVideo={dubbingOutputVideo}
          dubbingOutputAudio={dubbingOutputAudio}
          onStartDubbing={onStartDubbing}
          onPreviewVoice={onPreviewVoice}
          segments={segments}
          selectedSegmentIndex={selectedSegmentIndex}
          onSelectSegment={onSelectSegment}
          characters={characters}
          onSelectCharacterVoice={(vId) => {
            const curSeg = segments[selectedSegmentIndex];
            if (curSeg) {
              handleChangeVoiceForCharacter(curSeg.speaker_name || curSeg.speaker_id || 'តួអង្គ', vId);
            }
          }}
          onOpenCharacterCast={() => setShowCharacterCastDrawer(true)}
          videoEffects={videoEffects}
          onChangeEffects={onChangeEffects}
        />
      </div>

      {/* Lower Half: Multi-Track Timeline */}
      <MultiTrackTimeline
        duration={duration}
        currentTime={currentTime}
        segments={segments}
        onChangeSegments={onChangeSegments}
        selectedSegmentIndex={selectedSegmentIndex}
        onSelectSegment={onSelectSegment}
        onSeek={setCurrentTime}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onScan={onScanTimeline}
        isScanning={isScanningTimeline}
        onAssemble={onAssemble}
        zoom={zoom}
        onZoomChange={setZoom}
        onShowToast={onShowToast}
      />

      {/* 1:1 Unique Character Voice Casting Drawer / Modal */}
      <CharacterCastDrawer
        isOpen={showCharacterCastDrawer}
        onClose={() => setShowCharacterCastDrawer(false)}
        segments={segments}
        characters={characters}
        onChangeVoiceForCharacter={handleChangeVoiceForCharacter}
        onAutoCastUniqueVoices={handleAutoCastUniqueVoices}
        onPreviewVoice={onPreviewVoice}
        onShowToast={onShowToast}
      />
    </div>
  );
};
