import React, { useState } from 'react';
import { VideoPreview } from '../player/VideoPreview';
import { ContextualInspector } from '../inspector/ContextualInspector';
import { MultiTrackTimeline } from '../timeline/MultiTrackTimeline';
import { VideoEffectsPanel } from '../effects/VideoEffectsPanel';
import { ProjectFile, TimelineSegment, VideoEffects, SubtitleStyle } from '../../types';
import { Sliders, Sparkles, X } from 'lucide-react';

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
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [zoom, setZoom] = useState(100);
  const [showEffectsDrawer, setShowEffectsDrawer] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Video source: prioritize dubbed result, then uploaded media
  const activeVideoSrc = dubbingOutputVideo || uploadedFile?.url || '';

  // Current subtitle
  const activeSegment = segments.find(
    (s) => currentTime >= s.start_time && currentTime <= s.end_time
  );
  const currentSubtitle = activeSegment?.khmer_translation || activeSegment?.chinese_text;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Upper Half: Video Stage (Left) + Contextual Inspector (Right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden border-b border-white/[0.08] relative">
        <div className="flex-1 flex flex-col relative overflow-hidden">
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

          {/* Button to Toggle Video Effects & Subtitle styling (top-right controls bar offset) */}
          <div className="absolute top-3 right-3 z-30">
            <button
              onClick={() => setShowEffectsDrawer(!showEffectsDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-semibold shadow-xl transition-all ${
                showEffectsDrawer
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-400/30'
                  : 'bg-[#0b0f19]/90 border-white/[0.15] text-slate-200 hover:text-white hover:bg-white/[0.1]'
              }`}
              title="កំណត់ Watermark, 3D Effect, Color Grade & អក្សររត់"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Video Effects & Subtitles</span>
            </button>
          </div>

          {/* Slide-over Effects Panel */}
          {showEffectsDrawer && (
            <div className="absolute top-14 right-4 z-30 w-96 max-h-[80%] overflow-y-auto rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="relative">
                <button
                  onClick={() => setShowEffectsDrawer(false)}
                  className="absolute top-4 right-4 z-40 p-1 rounded-lg text-slate-400 hover:text-white bg-black/40 hover:bg-black/60"
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
    </div>
  );
};
