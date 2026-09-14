import React, { useState, useEffect } from 'react';
import { VideoPreview } from '../player/VideoPreview';
import { ContextualInspector } from '../inspector/ContextualInspector';
import { MultiTrackTimeline } from '../timeline/MultiTrackTimeline';
import { VideoEffectsPanel } from '../effects/VideoEffectsPanel';
import { CharacterCastDrawer } from './CharacterCastDrawer';
import { ProjectFile, TimelineSegment, VideoEffects, SubtitleStyle, CharacterVoice } from '../../types';
import { api } from '../../services/api';

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
  onShowToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
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
  const [videoSourceMode, setVideoSourceMode] = useState<'original' | 'dubbed'>('original');

  // Auto-switch to dubbed video when a new dubbing output is generated
  useEffect(() => {
    if (dubbingOutputVideo) {
      setVideoSourceMode('dubbed');
    } else {
      setVideoSourceMode('original');
    }
  }, [dubbingOutputVideo]);

  // When a new file is uploaded or selected, show the original uploaded video
  useEffect(() => {
    setVideoSourceMode('original');
  }, [uploadedFile?.filename]);

  // Active video source
  const activeVideoSrc =
    videoSourceMode === 'dubbed' && dubbingOutputVideo
      ? dubbingOutputVideo
      : (uploadedFile?.url || '');

  // Active subtitle
  const activeSegment = segments.find(
    (s) => currentTime >= s.start_time && currentTime <= s.end_time
  );
  const currentSubtitle = activeSegment?.khmer_translation || activeSegment?.chinese_text;

  // Single line AI voice generator
  const handleGenerateLineAudio = async (idx: number) => {
    const seg = segments[idx];
    if (!seg) return;

    onShowToast(`Generating AI voice for line #${idx + 1}...`, 'info');
    try {
      const r = await api.generateLine({
        text: seg.khmer_translation || seg.chinese_text || 'បាទ',
        lineIndex: idx,
        gender: seg.gender || 'male',
        voiceId: seg.voiceId || 'voxcpm-voice-actor',
        speakerId: seg.speaker_role,
        emotion: seg.emotion || 'calm',
        speed: seg.speed || 1.0,
        pitch: seg.pitch || 0,
      });

      if (r.success) {
        if (onChangeSegments) {
          const copy = [...segments];
          copy[idx] = { ...copy[idx], audioUrl: r.audioUrl, status: 'ready' };
          onChangeSegments(copy);
        }
        onShowToast(`Voice for line #${idx + 1} ready!`, 'success');
        new Audio(r.audioUrl).play().catch(() => {});
      }
    } catch (e: any) {
      onShowToast(`Error generating line voice: ${e.message}`, 'error');
    }
  };

  // Change voice across character segments
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
    onShowToast(`Voice updated for "${charKey}"!`, 'success');
  };

  // Auto cast unique voices
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

      const pool = isFem ? femalePool : malePool;
      let chosen = pool.find((c) => !used.has(c.filename));
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
    onShowToast(`Auto-cast complete: 1 unique voice per character!`, 'success');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#06080d]">
      {/* ── Main Workstation: Center Video Workspace + Right Contextual Inspector ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center: Video Workspace (16:9 Cinematic Visual Center) */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden bg-black/50">
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
            onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
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

        {/* Right: Contextual Inspector */}
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
          onChangeSegments={onChangeSegments}
          selectedSegmentIndex={selectedSegmentIndex}
          onSelectSegment={onSelectSegment}
          characters={characters}
          onOpenCharacterCast={() => setShowCharacterCastDrawer(true)}
          videoEffects={videoEffects}
          onChangeEffects={onChangeEffects}
          subtitleStyle={subtitleStyle}
          onChangeSubtitleStyle={onChangeSubtitleStyle}
          onGenerateLineAudio={handleGenerateLineAudio}
          onShowToast={onShowToast}
        />
      </div>

      {/* ── Bottom: Professional Multi-Track Timeline ── */}
      <div className="h-60 bg-[#080a10] border-t border-white/[0.08] flex flex-col overflow-hidden flex-shrink-0 z-20">
        <MultiTrackTimeline
          duration={duration}
          currentTime={currentTime}
          segments={segments}
          onChangeSegments={onChangeSegments}
          selectedSegmentIndex={selectedSegmentIndex}
          onSelectSegment={onSelectSegment}
          onSeek={(t) => {
            setCurrentTime(t);
            if (videoRef.current) {
              videoRef.current.currentTime = t;
            }
          }}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onScan={onScanTimeline}
          isScanning={isScanningTimeline}
          onAssemble={onAssemble}
          zoom={zoom}
          onZoomChange={setZoom}
          onShowToast={onShowToast}
        />
      </div>

      {/* ── Character Voice Casting Drawer ── */}
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

      {/* ── Video Effects Panel Drawer ── */}
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
