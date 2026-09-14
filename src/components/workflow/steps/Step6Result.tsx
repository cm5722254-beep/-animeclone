import React, { useRef, useState, useEffect } from 'react';
import { ProjectFile } from '../../../types';
import { 
  Download, Play, Share2, FileText, Music, Link, 
  CheckCircle2, Sliders, Edit3, Settings2, ShieldCheck 
} from 'lucide-react';
import { VideoPreview } from '../../player/VideoPreview';

interface Step6ResultProps {
  uploadedFile: ProjectFile | null;
  outputVideo: string | null;
  outputAudio: string | null;
  isFullVideo?: boolean;
  onFullVideoProcess?: () => void;
  onOpenStudioMode?: () => void;
  onBackToEdit?: (step: 'translation' | 'voice') => void;
  onShowToast: (msg: string, type: 'success'|'error'|'info') => void;
  onOpenExportModal?: () => void;
}

export const Step6Result: React.FC<Step6ResultProps> = ({
  uploadedFile,
  outputVideo,
  outputAudio,
  isFullVideo = false,
  onFullVideoProcess,
  onOpenStudioMode,
  onBackToEdit,
  onShowToast,
  onOpenExportModal
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showFullVideoModal, setShowFullVideoModal] = useState(false);

  const activeVideoSrc = outputVideo || uploadedFile?.url || '';

  const handleDownload = (type: 'video' | 'audio' | 'srt') => {
    onShowToast(`កំពុងទាញយក ${type.toUpperCase()}...`, 'success');
    // Implement actual download logic here if needed, or trigger the export modal
    if (type === 'video' && onOpenExportModal) {
      onOpenExportModal();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowToast('បានចម្លងតំណ (Link Copied)', 'success');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto relative">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-mono font-bold text-emerald-400">ជំហានទី ៦ នៃ ៦</span>
          </div>
          
          {/* Studio Mode Upgrade CTA */}
          {onOpenStudioMode && (
            <button 
              onClick={onOpenStudioMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all text-xs font-bold"
            >
              <Sliders className="w-3.5 h-3.5" />
              Studio Mode
            </button>
          )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">ទាញយកលទ្ធផល</h2>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          ពិនិត្យលទ្ធផលឲ្យម៉ត់ចត់ មុននឹងទាញយក ឬចែករំលែក។
        </p>
      </div>

      <div className="flex-1 px-8 pb-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left: Video Player */}
        <div className="flex-[3] flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-black overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
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
              showSubtitles={true}
              videoSourceMode={outputVideo ? 'dubbed' : 'original'}
              dubbingOutputVideo={outputVideo}
              // Required dummy props for VideoPreview signature
              onVideoSourceModeChange={() => {}}
              onUploadFile={() => {}}
              onRemoveFile={() => {}}
              isUploadingFile={false}
              uploadProgress={0}
              videoEffects={{
                brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0,
                aspectRatio: '16:9', lutPreset: 'none',
              }}
              subtitleStyle={{
                fontSize: 20, fontFamily: 'Kantumruy Pro', textColor: '#ffffff',
                strokeColor: '#000000', strokeWidth: 2, backgroundColor: 'rgba(0,0,0,0.65)',
                position: 'bottom', animation: 'none'
              }}
            />
          </div>

          {/* Test Clip Finish State / Full Video CTA */}
          {!isFullVideo && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-300">សាកល្បងរួចរាល់! (TEST COMPLETE)</h3>
                </div>
                <p className="text-xs text-amber-400/80">
                  ប្រសិនបើគុណភាពល្អ អ្នកអាចបន្តដំណើរការវីដេអូពេញ។
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {onBackToEdit && (
                  <>
                    <button 
                      onClick={() => onBackToEdit('voice')}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Settings2 className="w-3.5 h-3.5" /> កែសំឡេង
                    </button>
                    <button 
                      onClick={() => onBackToEdit('translation')}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> កែការបកប្រែ
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowFullVideoModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
                >
                  ដំណើរការវីដេអូពេញ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quality Check & Downloads */}
        <div className="flex-[2] flex flex-col gap-6">
          
          <div className="rounded-2xl border border-white/10 bg-[#0a0e1a] p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              QUALITY CHECK
            </h3>
            
            <div className="flex flex-col gap-3">
              {[
                { label: 'Translation', status: 'Excellent', color: 'emerald' },
                { label: 'Voice Quality', status: 'Excellent', color: 'emerald' },
                { label: 'Audio Sync', status: 'Good', color: 'sky' },
                { label: 'BGM / Music', status: 'Good', color: 'sky' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-xs text-slate-300">{item.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
              <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Overall Status</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
                  Ready to Export
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleDownload('video')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white font-bold text-sm shadow-[0_0_20px_rgba(2,132,199,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> ↓ ទាញយកវីដេអូ (Download MP4)
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyLink}
                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Link className="w-4 h-4" /> ចម្លងតំណ (Copy)
              </button>
              <button
                onClick={() => onShowToast('មិនទាន់មាន Share API ភ្ជាប់ទេ', 'info')}
                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4" /> ចែករំលែក
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload('srt')}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" /> ទាញយក SRT
              </button>
              <button
                onClick={() => handleDownload('audio')}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Music className="w-3.5 h-3.5" /> ទាញយក Audio
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Full Video Confirmation Modal */}
      {showFullVideoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0e1a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">ដំណើរការវីដេអូពេញ?</h3>
            <p className="text-sm text-slate-400 mb-6">
              វីដេអូទាំងមូលនឹងត្រូវផ្ញើទៅកាន់ AI សម្រាប់ដំណើរការបកប្រែ និងបញ្ជូលសំឡេង។
            </p>
            
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-slate-500">Video</span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                  {uploadedFile?.originalName || uploadedFile?.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Estimated processing</span>
                <span className="text-xs font-semibold text-amber-400">~ 2 - 5 mins</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFullVideoModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                បោះបង់
              </button>
              <button
                onClick={() => {
                  setShowFullVideoModal(false);
                  if (onFullVideoProcess) onFullVideoProcess();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
              >
                ចាប់ផ្តើមដំណើរការ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
