import React, { useState } from 'react';
import { X, Download, Film, Sparkles, Subtitles, Shield, CheckCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import { VideoEffects, TimelineSegment } from '../../types';
import { api } from '../../services/api';
import { generateVideoOverlayImage } from '../../services/videoOverlayRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProjectTitle: string;
  outputVideoUrl?: string | null;
  filename?: string;
  videoEffects?: VideoEffects;
  segments?: TimelineSegment[];
  onShowToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeProjectTitle,
  outputVideoUrl,
  filename,
  videoEffects,
  segments,
  onShowToast,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p' | 'original'>('1080p');
  const [format, setFormat] = useState('mp4');
  const [bitrate, setBitrate] = useState('high');

  // Overlays to burn permanently into video
  const hasStyleText = Boolean(videoEffects?.styleText?.title && videoEffects.styleText.title.trim().length > 0);
  const [burnTitleOverlay, setBurnTitleOverlay] = useState<boolean>(true);
  const [burnSubtitles, setBurnSubtitles] = useState<boolean>(Boolean(segments && segments.length > 0));
  const [burnWatermark, setBurnWatermark] = useState<boolean>(Boolean(videoEffects?.watermark?.enabled));

  // Rendering States
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStepText, setRenderStepText] = useState('');
  const [renderedDownloadUrl, setRenderedDownloadUrl] = useState<string | null>(null);
  const [renderedFilename, setRenderedFilename] = useState<string>('');

  if (!isOpen) return null;

  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderProgress(15);
    setRenderStepText('កំពុងរៀបចំ Overlay អក្សរ 3D & Subtitles...');
    setRenderedDownloadUrl(null);

    try {
      // 1. Generate Transparent Overlay PNG if title or watermark or borders are requested
      let titleOverlayBase64: string | undefined = undefined;

      const effectiveEffects: VideoEffects = {
        ...(videoEffects || {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          sepia: 0,
          blur: 0,
          aspectRatio: '16:9',
          lutPreset: 'standard',
        }),
        styleText: burnTitleOverlay && videoEffects?.styleText ? { ...videoEffects.styleText, enabled: true } : undefined,
        watermark: burnWatermark && videoEffects?.watermark ? { ...videoEffects.watermark, enabled: true } : undefined,
      };

      if (burnTitleOverlay || burnWatermark || effectiveEffects.letterbox || effectiveEffects.vignette) {
        const videoEl = document.querySelector('video') as HTMLVideoElement | null;
        const srcW = videoEl?.videoWidth || 1920;
        const srcH = videoEl?.videoHeight || 1080;
        const isPortrait = srcH > srcW;

        let targetW = srcW;
        let targetH = srcH;
        if (resolution === '1080p') {
          targetW = isPortrait ? 1080 : 1920;
          targetH = isPortrait ? 1920 : 1080;
        } else if (resolution === '720p') {
          targetW = isPortrait ? 720 : 1280;
          targetH = isPortrait ? 1280 : 720;
        } else if (resolution === '4k') {
          targetW = isPortrait ? 2160 : 3840;
          targetH = isPortrait ? 3840 : 2160;
        }

        const overlayData = generateVideoOverlayImage({
          width: targetW,
          height: targetH,
          videoEffects: effectiveEffects,
        });
        if (overlayData) {
          titleOverlayBase64 = overlayData;
        }
      }

      setRenderProgress(40);
      setRenderStepText('FFmpeg កំពុង Encode និងបង្កប់អក្សរជាប់ជាមួយវីដេអូ...');

      // 2. Call backend server to execute FFmpeg permanently
      const targetFilename = filename || (outputVideoUrl ? outputVideoUrl.split('/').pop() || '' : 'project.mp4');
      const response = await api.renderExportVideo({
        filename: targetFilename,
        inputVideo: outputVideoUrl || undefined,
        titleOverlayBase64,
        burnSubtitles: burnSubtitles && Boolean(segments && segments.length > 0),
        subtitles: burnSubtitles ? segments : undefined,
        resolution,
        format,
        bitrate,
      });

      if (response && response.success && response.outputVideo) {
        setRenderProgress(100);
        setRenderStepText('Render វីដេអូបានជោគជ័យ 100%!');
        setRenderedDownloadUrl(response.outputVideo);
        setRenderedFilename(response.filename || `dubbed_${activeProjectTitle}.${format}`);

        // Trigger instant browser download
        const a = document.createElement('a');
        a.href = response.outputVideo;
        a.download = response.filename || `${activeProjectTitle || 'dubbed_project'}_khmer.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        onShowToast('🎉 Render វីដេអូបានជោគជ័យ 100%! អក្សរ 3D បានបង្កប់ជាប់សាច់វីដេអូរហូត', 'success');
      } else {
        throw new Error('Server មិនបានបញ្ជូនឯកសារវីដេអូមកវិញឡើយ');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      // Fallback: If server FFmpeg export fails, allow direct download of available video
      if (outputVideoUrl) {
        const a = document.createElement('a');
        a.href = outputVideoUrl;
        a.download = `${activeProjectTitle || 'dubbed_project'}_khmer.${format}`;
        a.click();
        onShowToast(`⚠️ បានទាញយកវីដេអូដើម (Export Render បរាជ័យ: ${err.message})`, 'warning');
      } else {
        onShowToast(`បរាជ័យក្នុងការ Render: ${err.message}`, 'error');
      }
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.12] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2.5 font-ui">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <span>នាំចេញវីដេអូកាត់ត (Export Studio Master)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 text-xs max-h-[78vh] overflow-y-auto">
          {/* Project Summary Card */}
          <div className="bg-sky-500/[0.08] border border-sky-500/25 rounded-xl p-3.5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {activeProjectTitle || 'project_master.mp4'}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-2">
                <span className="text-emerald-400 font-medium">● វីដេអូបញ្ចូលសំឡេងខ្មែរ Master</span>
                <span className="text-slate-500">•</span>
                <span>Stereo BGM 48kHz</span>
              </div>
            </div>
          </div>

          {/* PERMANENT BURN-IN OPTIONS (THE KEY FEATURE USER ASKED FOR) */}
          <div className="bg-[#070b14] border border-amber-500/30 rounded-xl p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">ការបង្កប់អក្សរ & Overlays ចូលក្នុងវីដេអូ (Permanent Burn-in)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ជាប់រហូត 100%
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              អក្សរ និង Effects ទាំងអស់នឹងត្រូវ FFmpeg Render ចូលក្នុងសាច់វីដេអូផ្ទាល់។ ទោះបីបើកមើលលើទូរស័ព្ទ, YouTube, Facebook, TikTok ឬ TV ក៏នៅតែជាប់ស្អាតជានិច្ច!
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Burn 3D Style Title Overlay Toggle */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={burnTitleOverlay}
                  onChange={(e) => setBurnTitleOverlay(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="text-amber-400">🔥 បង្កប់អក្សរ 3D / ចំណងជើងរឿង (3D Thumbnail Title)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {hasStyleText ? (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="text-slate-300">ចំណងជើង៖</span>
                        <span className="font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                          {videoEffects?.styleText?.title}
                        </span>
                        {videoEffects?.styleText?.badge && (
                          <span className="text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-rose-500/30">
                            {videoEffects.styleText.badge}
                          </span>
                        )}
                        <span className="text-[10.5px] text-slate-400">({videoEffects?.styleText?.stylePreset || 'gold3d'})</span>
                      </div>
                    ) : (
                      <span>យកចំណងជើងរឿង និងអក្សរមាស 3D ពីផ្ទាំង Thumbnail ឬ Effects មកបង្កប់</span>
                    )}
                  </div>
                </div>
              </label>

              {/* Burn Subtitles Toggle */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={burnSubtitles}
                  onChange={(e) => setBurnSubtitles(e.target.checked)}
                  className="accent-purple-500 w-4 h-4 rounded cursor-pointer mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Subtitles className="w-3.5 h-3.5 text-purple-400" />
                    <span>បង្កប់អក្សររត់ក្រោមរឿងខ្មែរ (Burn Khmer Subtitles)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {segments && segments.length > 0 ? (
                      <span className="text-purple-300">មាន {segments.length} ឃ្លាសន្ទនាត្រូវបានរៀបចំរួចរាល់សម្រាប់ Render</span>
                    ) : (
                      <span>ស្កេន និងបង្កប់អក្សរខ្មែររត់តាមឈុតរឿង</span>
                    )}
                  </div>
                </div>
              </label>

              {/* Burn Watermark Toggle */}
              {videoEffects?.watermark?.text && (
                <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={burnWatermark}
                    onChange={(e) => setBurnWatermark(e.target.checked)}
                    className="accent-sky-500 w-4 h-4 rounded cursor-pointer mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-sky-400" />
                      <span>បង្កប់ Watermark / ឈ្មោះឆានែល ({videoEffects.watermark.text})</span>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Resolution Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300 flex items-center justify-between">
              <span>កម្រិតគុណភាពវីដេអូ (Resolution)</span>
              <span className="text-[11px] text-slate-400 font-normal">ជ្រើសរើសទំហំដែលចង់បាន</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '1080p', label: '1080p FHD', badge: 'ពេញនិយម' },
                { id: '4k', label: '4K Cinema', badge: 'ច្បាស់បំផុត' },
                { id: '720p', label: '720p HD', badge: 'ទំហំតូច' },
                { id: 'original', label: 'Original', badge: 'លឿនរហ័ស' },
              ].map((res) => (
                <button
                  key={res.id}
                  onClick={() => setResolution(res.id as any)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${
                    resolution === res.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-md shadow-sky-500/20 font-bold'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <span>{res.label}</span>
                  <span className="text-[9px] opacity-70 font-normal">{res.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Format & Bitrate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">ទម្រង់ឯកសារ (Format)</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="bg-[#07090e] border border-white/[0.08] text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="mp4">MP4 (H.264 / AAC — គាំទ្រគ្រប់ឧបករណ៍)</option>
                <option value="mkv">MKV (Cinema Master)</option>
                <option value="mov">MOV (Apple QuickTime)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Bitrate គុណភាពរូប</label>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                className="bg-[#07090e] border border-white/[0.08] text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="high">Cinema Master (CRF 19 - ខ្ពស់បំផុត)</option>
                <option value="standard">Standard Web (CRF 22 - មធ្យម)</option>
                <option value="fast">Fast Export (CRF 26 - រហ័ស)</option>
              </select>
            </div>
          </div>

          {/* Render Progress Card */}
          {isRendering && (
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sky-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>{renderStepText || 'កំពុងដំណើរការ FFmpeg...'}</span>
                </span>
                <span className="font-mono text-white text-sm">{renderProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 italic">
                ⏳ FFmpeg កំពុងធ្វើការ Encode បង្កប់អក្សរជាប់វីដេអូ... សូមរង់ចាំមួយភ្លែត
              </div>
            </div>
          )}

          {/* Download Ready Card */}
          {renderedDownloadUrl && !isRendering && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">វីដេអូបាន Render រួចរាល់!</div>
                  <div className="text-[11px] text-emerald-300/80 font-mono truncate max-w-xs">{renderedFilename}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={renderedDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  <span>បើកមើល</span>
                </a>
                <a
                  href={renderedDownloadUrl}
                  download={renderedFilename}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ទាញយក</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#0b0f19] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {burnTitleOverlay ? '🔥 បង្កប់អក្សរ 3D: បាទ/ចាស' : '⚪ មិនបង្កប់អក្សរ 3D ទេ'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isRendering}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              បិទផ្ទាំង
            </button>
            <button
              onClick={handleStartRender}
              disabled={isRendering}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isRendering ? 'កំពុង Render បង្កប់អក្សរ...' : 'ចាប់ផ្តើម Render បង្កប់អក្សរ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
