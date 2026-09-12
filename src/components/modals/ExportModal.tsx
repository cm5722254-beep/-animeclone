import React, { useState } from 'react';
import { X, Download, Film } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProjectTitle: string;
  outputVideoUrl?: string | null;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeProjectTitle,
  outputVideoUrl,
  onShowToast,
}) => {
  const [resolution, setResolution] = useState('1080p');
  const [format, setFormat] = useState('mp4');
  const [bitrate, setBitrate] = useState('high');
  const [burnSubtitles, setBurnSubtitles] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  if (!isOpen) return null;

  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          onShowToast('Render វីដេអូបានជោគជ័យ! កំពុងទាញយក...', 'success');

          // Trigger download if available
          if (outputVideoUrl) {
            const a = document.createElement('a');
            a.href = outputVideoUrl;
            a.download = `${activeProjectTitle || 'dubbed_project'}_khmer.${format}`;
            a.click();
          }
          onClose();
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.1] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-ui">
            <Download className="w-4 h-4 text-sky-400" />
            <span>នាំចេញវីដេអូកាត់ត (Export Dubbed Studio)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 text-xs">
          {/* Project Summary */}
          <div className="bg-sky-500/[0.08] border border-sky-500/20 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white truncate max-w-sm">
                {activeProjectTitle || 'project_master.mp4'}
              </div>
              <div className="text-[11px] text-slate-400">Khmer Dubbed Master • Stereo BGM • 48kHz Hi-Fi</div>
            </div>
          </div>

          {/* Resolution Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">កម្រិតគុណភាពវីដេអូ (Resolution)</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '1080p', label: '1080p FHD' },
                { id: '4k', label: '4K Cinema' },
                { id: '720p', label: '720p HD' },
                { id: 'audio_only', label: 'Audio MP3' },
              ].map((res) => (
                <button
                  key={res.id}
                  onClick={() => setResolution(res.id)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                    resolution === res.id
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {res.label}
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
                <option value="mp4">MP4 (H.264 / AAC)</option>
                <option value="mkv">MKV (High Quality)</option>
                <option value="mov">MOV (Apple ProRes)</option>
                <option value="mp3">MP3 (Audio Only)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Bitrate គុណភាព</label>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                className="bg-[#07090e] border border-white/[0.08] text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="high">Cinema Master (ខ្ពស់)</option>
                <option value="standard">Standard Web (មធ្យម)</option>
                <option value="fast">Fast Export (រហ័ស)</option>
              </select>
            </div>
          </div>

          {/* Burn Subtitles Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 mt-1">
            <input
              type="checkbox"
              checked={burnSubtitles}
              onChange={(e) => setBurnSubtitles(e.target.checked)}
              className="accent-sky-400 w-4 h-4 rounded cursor-pointer"
            />
            <span>បង្កប់អក្សររត់ក្រោមរឿងខ្មែរ (Burn Khmer Subtitles) ចូលក្នុងវីដេអូ</span>
          </label>

          {/* Render Progress */}
          {isRendering && (
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sky-300">Rendering Video...</span>
                <span className="font-mono text-white">{renderProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-200"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#0b0f19] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs transition-colors"
          >
            បោះបង់
          </button>
          <button
            onClick={handleStartRender}
            disabled={isRendering}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white font-semibold text-xs transition-colors shadow-md shadow-sky-600/30 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isRendering ? 'កំពុង Render...' : 'ទាញយក / Export ភ្លាមៗ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
