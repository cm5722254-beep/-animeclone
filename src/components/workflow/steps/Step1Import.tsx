import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Film, Clock, Monitor, HardDrive, X, ChevronRight,
  Play, Scissors, CheckCircle2, RefreshCw
} from 'lucide-react';
import { ProjectFile } from '../../../types';

interface Step1ImportProps {
  uploadedFile: ProjectFile | null;
  isUploadingFile: boolean;
  uploadProgress: number;
  uploadInfo?: { loadedMb: string; totalMb: string } | null;
  onUploadFile: (file: File) => void;
  onRemoveFile: () => void;
  clipStart: number;
  clipEnd: number;
  clipPreset: number; // 20 | 30 | 40
  onClipPresetChange: (sec: number) => void;
  onClipStartChange: (s: number) => void;
  onClipEndChange: (e: number) => void;
  videoDuration: number;
  onNext: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const Step1Import: React.FC<Step1ImportProps> = ({
  uploadedFile,
  isUploadingFile,
  uploadProgress,
  uploadInfo,
  onUploadFile,
  onRemoveFile,
  clipStart,
  clipEnd,
  clipPreset,
  onClipPresetChange,
  onClipStartChange,
  onClipEndChange,
  videoDuration,
  onNext,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
        onUploadFile(file);
      }
    },
    [onUploadFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    e.target.value = '';
  };

  const CLIP_PRESETS = [20, 30, 40];

  const handlePresetClick = (sec: number) => {
    onClipPresetChange(sec);
    onClipStartChange(0);
    onClipEndChange(Math.min(sec, videoDuration || sec));
  };

  const canProceed = uploadedFile && !isUploadingFile;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Page Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="font-mono font-bold text-indigo-400">ជំហានទី ១ នៃ ៦</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">ដាក់ចូលវីដេអូដើមរបស់អ្នក</h2>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          ជ្រើសរើសឆាកខ្លីៗសិន <span className="text-amber-400 font-semibold">(២០–៤០ វិនាទី)</span> ដើម្បីសាកល្បងគុណភាព
          មុននឹងដំណើរការជាឯកសារពេញលេញ។
        </p>
      </div>

      <div className="flex-1 px-8 pb-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Upload Area */}
        <div className="flex-1 flex flex-col gap-4">

          {!uploadedFile ? (
            /* Drop Zone */
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${isDragging
                  ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
                  : 'border-white/10 bg-[#0a0e1a] hover:border-indigo-500/40 hover:bg-indigo-500/5'
                }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: 260 }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                {/* Upload Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging
                    ? 'bg-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.4)]'
                    : 'bg-white/5'
                }`}>
                  <Upload className={`w-7 h-7 ${isDragging ? 'text-indigo-300' : 'text-slate-400'}`} />
                </div>

                <div className="text-center">
                  <p className="text-base font-semibold text-slate-200 mb-1">
                    ចុច ឬអូសវីដេអូមកដាក់ទីនេះ
                  </p>
                  <p className="text-sm text-slate-500">MP4, MOV, MKV, AVI — អតិបរមា ២,០០០MB</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all active:scale-95"
                >
                  ជ្រើសរើសវីដេអូ
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            /* File Info Card */
            <div className="rounded-2xl border border-white/10 bg-[#0a0e1a] overflow-hidden">
              {/* Video Thumbnail Row */}
              <div className="flex items-center gap-4 p-5">
                <div className="w-24 h-16 rounded-xl bg-[#07090e] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {uploadedFile.url ? (
                    <video
                      src={uploadedFile.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        v.currentTime = 2;
                      }}
                    />
                  ) : (
                    <Film className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-sm" title={uploadedFile.originalName || uploadedFile.filename}>
                    {uploadedFile.originalName || uploadedFile.filename}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {videoDuration > 0 && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(videoDuration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <HardDrive className="w-3 h-3" />
                      {formatBytes(uploadedFile.size)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Monitor className="w-3 h-3" />
                      Video
                    </span>
                  </div>
                </div>

                <button
                  onClick={onRemoveFile}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="ជ្រើសវីដេអូមួយផ្សេងទៀត"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Progress */}
              {isUploadingFile && (
                <div className="px-5 pb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">កំពុង Upload...</span>
                    <span className="text-indigo-400 font-mono font-bold">
                      {uploadInfo ? `${uploadInfo.loadedMb} / ${uploadInfo.totalMb} MB` : `${uploadProgress}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isUploadingFile && (
                <div className="px-5 pb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">Upload បញ្ចប់</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-auto text-xs text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    ជ្រើសវីដេអូមួយផ្សេងទៀត
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,audio/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              )}
            </div>
          )}

          {/* Test Clip Selector (only shown when video is uploaded) */}
          {uploadedFile && !isUploadingFile && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Scissors className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-300">ជ្រើសរើស TEST CLIP</h3>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/25">
                  សាកល្បងជាមុន
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                ជ្រើសរើសឆាកខ្លីៗ <span className="text-amber-400">២០–៤០ វិនាទី</span> ដើម្បីសាកល្បងគុណភាពមុន។
                វិធីនេះបង្ហាញលទ្ធផលក្នុងរយៈពេលខ្លី ហើយ<strong className="text-white"> មិនបំណាយ</strong>ពេលច្រើន។
              </p>

              {/* Preset Buttons */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-500 shrink-0">ប្រវែង Clip:</span>
                <div className="flex gap-1.5">
                  {CLIP_PRESETS.map((sec) => (
                    <button
                      key={sec}
                      onClick={() => handlePresetClick(sec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        clipPreset === sec
                          ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold mb-1 block">ចាប់ផ្តើម (Start)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={videoDuration > 0 ? videoDuration - 5 : 9999}
                      value={clipStart}
                      onChange={(e) => onClipStartChange(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-xs text-white font-mono focus:border-amber-500/50 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">s</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold mb-1 block">បញ្ចប់ (End)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={clipStart + 5}
                      max={videoDuration > 0 ? videoDuration : 9999}
                      value={clipEnd}
                      onChange={(e) => onClipEndChange(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-xs text-white font-mono focus:border-amber-500/50 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">s</span>
                  </div>
                </div>
              </div>

              {/* Duration summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-amber-300 font-semibold">
                    ប្រវែង: <span className="font-mono">{formatTime(clipEnd - clipStart)}</span>
                  </span>
                </div>
                <button className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors">
                  <Play className="w-3 h-3 fill-current" />
                  Preview Clip
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Instructions / Tips */}
        <div className="lg:w-72 flex flex-col gap-4">
          <div className="rounded-2xl border border-white/8 bg-[#0a0e1a] p-5">
            <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">ការណែនាំ</h4>
            <ul className="flex flex-col gap-3">
              {[
                { num: '①', text: 'Upload វីដេអូ MP4 ឬ MOV', color: 'text-sky-400' },
                { num: '②', text: 'ជ្រើស Test Clip ២០–៤០ វិនាទីជាមុន', color: 'text-amber-400' },
                { num: '③', text: 'AI នឹងស្រង់ & បកប្រែសំឡេង', color: 'text-purple-400' },
                { num: '④', text: 'ជ្រើសសំឡេង & Generate', color: 'text-emerald-400' },
                { num: '⑤', text: 'ពិនិត្យ → ដំណើរការវីដេអូពេញ', color: 'text-rose-400' },
              ].map(({ num, text, color }) => (
                <li key={num} className="flex items-start gap-3">
                  <span className={`font-bold text-sm shrink-0 ${color}`}>{num}</span>
                  <span className="text-xs text-slate-400 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <p className="text-xs text-emerald-300 font-semibold mb-1">💡 ដំបូន្មាន</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              ជ្រើស Clip ដែលមានតួអង្គ និងសន្ទនា ដើម្បីសាកល្បងគុណភាពបកប្រែ។
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#0a0e1a] p-4">
            <p className="text-[10px] text-slate-500 font-semibold mb-2 uppercase tracking-wider">
              Format ដែលស្គាល់
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['MP4', 'MOV', 'MKV', 'AVI', 'WEBM'].map((f) => (
                <span key={f} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-[10px] text-slate-400 font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="sticky bottom-0 px-8 py-4 bg-gradient-to-t from-[#04060a] via-[#04060a]/95 to-transparent">
        <div className="flex items-center justify-between max-w-5xl">
          <p className="text-xs text-slate-500">
            {canProceed
              ? `✓ ${uploadedFile?.originalName || uploadedFile?.filename} — Clip: ${formatTime(clipStart)} → ${formatTime(clipEnd)}`
              : 'Upload វីដេអូជាមុនសិន'}
          </p>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              canProceed
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>បន្ត</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
