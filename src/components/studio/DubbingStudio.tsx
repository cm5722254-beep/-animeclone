import React, { useState } from 'react';
import { VideoPreview } from '../player/VideoPreview';
import { ContextualInspector } from '../inspector/ContextualInspector';
import { MultiTrackTimeline } from '../timeline/MultiTrackTimeline';
import { VideoEffectsPanel } from '../effects/VideoEffectsPanel';
import { ProjectFile, TimelineSegment, VideoEffects, SubtitleStyle } from '../../types';
import { Sliders, Sparkles, X } from 'lucide-react';

interface DubbingStudioProps {
  uploadedFile: ProjectFile | null;
  onUploadFile: (file: File) => void;
  onRemoveFile: () => void;
  voiceMode: string;
  onVoiceModeChange: (m: string) => void;
  maleLeadVoice: string;
  onMaleLeadChange: (v: string) => void;
  femaleLeadVoice: string;
  onFemaleLeadChange: (v: string) => void;
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
  onUploadFile,
  onRemoveFile,
  voiceMode,
  onVoiceModeChange,
  maleLeadVoice,
  onMaleLeadChange,
  femaleLeadVoice,
  onFemaleLeadChange,
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
          />

          {/* Floating Button to Toggle Video Effects & Subtitle styling */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setShowEffectsDrawer(!showEffectsDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0f19]/90 backdrop-blur-md border border-white/[0.12] text-xs font-semibold text-slate-200 hover:text-white shadow-xl hover:bg-white/[0.08] transition-all"
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
          onUploadFile={onUploadFile}
          onRemoveFile={onRemoveFile}
          voiceMode={voiceMode}
          onVoiceModeChange={onVoiceModeChange}
          maleLeadVoice={maleLeadVoice}
          onMaleLeadChange={onMaleLeadChange}
          femaleLeadVoice={femaleLeadVoice}
          onFemaleLeadChange={onFemaleLeadChange}
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
        selectedSegmentIndex={selectedSegmentIndex}
        onSelectSegment={onSelectSegment}
        onSeek={setCurrentTime}
        onScan={onScanTimeline}
        isScanning={isScanningTimeline}
        onAssemble={onAssemble}
        zoom={zoom}
        onZoomChange={setZoom}
      />
    </div>
  );
};
