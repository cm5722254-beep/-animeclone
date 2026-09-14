import React, { useState } from 'react';
import { VideoPreview } from '../player/VideoPreview';
import { ContextualInspector } from '../inspector/ContextualInspector';
import { MultiTrackTimeline } from '../timeline/MultiTrackTimeline';
import { AiDubbingWorkflow } from './AiDubbingWorkflow';
import { VideoEffectsPanel } from '../effects/VideoEffectsPanel';
import { CharacterCastDrawer } from './CharacterCastDrawer';
import { PremiumBanner } from '../ui/PremiumBanner';
import { StudioSidebar } from '../navigation/StudioSidebar';
import { TopNavBar } from '../navigation/TopNavBar';
import { DialoguePanel } from '../dialogue/DialoguePanel';
import { ProjectFile, TimelineSegment, VideoEffects, SubtitleStyle, CharacterVoice } from '../../types';
import { Sliders, X, Film, Mic2, Languages, Volume2, Subtitles, Share2, Sparkles, Video, Users, Wand2, CheckCircle2, Download } from 'lucide-react';

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
  const [sidebarTab, setSidebarTab] = useState('video');

  const [videoSourceMode, setVideoSourceMode] = useState<'original' | 'dubbed'>('original');
  const [autoEmotionDetection, setAutoEmotionDetection] = useState(true); // 🎭 Auto detect emotions

  // Auto-switch to dubbed video when a new dubbing output is generated
  React.useEffect(() => {
    if (dubbingOutputVideo) {
      setVideoSourceMode('dubbed');
    } else {
      setVideoSourceMode('original');
    }
  }, [dubbingOutputVideo]);

  // When a new file is uploaded or selected, always show the original uploaded video
  React.useEffect(() => {
    setVideoSourceMode('original');
  }, [uploadedFile?.filename]);

  // Video source: prioritize original uploaded video when in original mode or before dubbing
  const activeVideoSrc =
    videoSourceMode === 'dubbed' && dubbingOutputVideo
      ? dubbingOutputVideo
      : (uploadedFile?.url || '');

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
    <div className="flex flex-col h-full overflow-hidden relative bg-[#07090e]">
      {/* Top Navigation Bar */}
      <TopNavBar
        projectName="Khmer dub"
        language="Khmer (Cambodia)"
        onSettingsClick={() => onOpenTab?.('tab-settings')}
        onTranscribeClick={onScanTimeline}
      />

      {/* Main Content Area: Sidebar + Video + Dialogue Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <StudioSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />

        {/* Center: Video Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black/40">
          <VideoPreview
            videoRef={videoRef}
            videoSrc={activeVideoSrc}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            playbackRate={playbackRate}
            onPlaybackRateChange={setPlaybackRate}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted(!isMuted)}
            showSubtitles={showSubtitles}
            currentSubtitle={currentSubtitle}
            subtitleStyle={subtitleStyle}
            videoEffects={videoEffects}
            uploadedFile={uploadedFile}
            isUploadingFile={isUploadingFile}
            uploadProgress={uploadProgress}
            uploadInfo={uploadInfo}
            onUploadFile={onUploadFile}
            onRemoveFile={onRemoveFile}
            videoSourceMode={videoSourceMode}
            onVideoSourceModeChange={setVideoSourceMode}
            dubbingOutputVideo={dubbingOutputVideo}
          />
        </div>

        {/* Right: Context Panel - changes based on sidebarTab */}
        {sidebarTab === 'audio' ? (
          <div className="w-80 bg-[#0a0e1a] border-l border-white/[0.06] p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">🎵 Audio Editor</h3>
            <p className="text-sm text-slate-400 mb-4">កែសម្រួលសំឡេង BGM និង Audio tracks</p>
            <button 
              onClick={() => onOpenTab('tab-mixer')}
              className="w-full px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-sm"
            >
              បើក Audio Mixer Console
            </button>
          </div>
        ) : sidebarTab === 'subtitle' ? (
          <div className="w-80 bg-[#0a0e1a] border-l border-white/[0.06] p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">📝 Subtitle Editor</h3>
            <p className="text-sm text-slate-400 mb-4">កែសម្រួល Subtitle styling និង timing</p>
            <button 
              onClick={() => onOpenTab('tab-subtitles')}
              className="w-full px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-sm"
            >
              បើក Subtitle Studio
            </button>
          </div>
        ) : sidebarTab === 'translate' ? (
          <div className="w-80 bg-[#0a0e1a] border-l border-white/[0.06] p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">🌐 Translation</h3>
            <p className="text-sm text-slate-400 mb-4">បកប្រែអត្ថបទដោយ Gemini AI</p>
            <button 
              onClick={() => onOpenTab('tab-translator')}
              className="w-full px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-sm"
            >
              បើក Translation Desk
            </button>
          </div>
        ) : sidebarTab === 'ai-voice' ? (
          <div className="w-80 bg-[#0a0e1a] border-l border-white/[0.06] p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">🎤 AI Voice</h3>
            <p className="text-sm text-slate-400 mb-4">ជ្រើសរើសសំឡេងតួអង្គ AI</p>
            <button 
              onClick={() => onOpenTab('tab-character')}
              className="w-full px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-sm"
            >
              បើក Character Library
            </button>
          </div>
        ) : sidebarTab === 'watermark' ? (
          <div className="w-80 bg-[#0a0e1a] border-l border-white/[0.06] p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">✨ Watermark & Effects</h3>
            <p className="text-sm text-slate-400 mb-4">កែសម្រួល Watermark និង Video effects</p>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-slate-400 mb-1 block">Watermark Text:</span>
                <input 
                  type="text" 
                  value={videoEffects.watermark.text}
                  onChange={(e) => onChangeEffects({
                    ...videoEffects,
                    watermark: { ...videoEffects.watermark, text: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-sm"
                  placeholder="Enter watermark text..."
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-400 mb-1 block">Position:</span>
                <select
                  value={videoEffects.watermark.position}
                  onChange={(e) => onChangeEffects({
                    ...videoEffects,
                    watermark: { ...videoEffects.watermark, position: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-sm"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </label>
            </div>
          </div>
        ) : sidebarTab === 'export-video' ? (
          <div className="w-80 bg-[#0a0e1a] border-l border-white/[0.06] p-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">📥 Export Video</h3>
            <p className="text-sm text-slate-400 mb-4">ទាញយកវីដេអូដែលបានដាក់សំឡេង</p>
            <button 
              onClick={onOpenExport}
              className="w-full px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm"
            >
              បើក Export Modal
            </button>
          </div>
        ) : (
          <DialoguePanel
          segments={segments}
          selectedIndex={selectedSegmentIndex}
          onSelectSegment={(idx) => {
            onSelectSegment(idx);
            const seg = segments[idx];
            if (seg) {
              setCurrentTime(seg.start_time || 0);
            }
          }}
          onPlaySegment={(idx) => {
            onSelectSegment(idx);
            const seg = segments[idx];
            if (seg) {
              setCurrentTime(seg.start_time || 0);
              setIsPlaying(true);
            }
          }}
          onVoiceChange={(idx, voiceId) => {
            if (onChangeSegments) {
              const updated = [...segments];
              const clean = voiceId.replace('voxcpm:', '');
              const matched = characters.find((c) => c.id === voiceId || c.filename === clean);
              updated[idx] = {
                ...updated[idx],
                voiceId,
                voiceFilename: clean,
                voiceLabel: matched ? matched.label : clean,
                gender: matched ? matched.gender : updated[idx].gender,
              };
              onChangeSegments(updated);
            }
          }}
          voices={characters}
        />
        )}
      </div>

      {/* Bottom: Timeline */}
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

      {/* Character Voice Casting Drawer */}
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

      {/* Video Effects Panel Drawer */}
      {showEffectsDrawer && (
        <VideoEffectsPanel
          videoEffects={videoEffects}
          onChangeEffects={onChangeEffects}
          onClose={() => setShowEffectsDrawer(false)}
        />
      )}
    </div>
  );
};
