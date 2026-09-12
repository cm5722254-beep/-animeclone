import React, { useState } from 'react';
import { Download, X, Film, Youtube, Globe, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { ProjectFile } from '../../types';

interface VideoDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoDownloaded: (file: ProjectFile) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VideoDownloaderModal: React.FC<VideoDownloaderModalProps> = ({
  isOpen,
  onClose,
  onVideoDownloaded,
  onShowToast,
}) => {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState<'best' | '1080' | '720'>('best');
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadProgressText, setDownloadProgressText] = useState('');

  if (!isOpen) return null;

  const detectPlatform = (inputUrl: string) => {
    if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) return 'YouTube';
    if (inputUrl.includes('tiktok.com')) return 'TikTok';
    if (inputUrl.includes('facebook.com') || inputUrl.includes('fb.watch')) return 'Facebook';
    if (inputUrl.includes('instagram.com')) return 'Instagram';
    if (inputUrl.includes('bilibili.com')) return 'Bilibili';
    return 'Web Video';
  };

  const currentPlatform = detectPlatform(url);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('សូមបញ្ចូលតំណភ្ជាប់ URL វីដេអូ');
      return;
    }

    setErrorMsg('');
    setIsDownloading(true);
    setDownloadProgressText('កំពុងតភ្ជាប់ទៅប្រព័ន្ធទាញយក និងចាប់យកទិន្នន័យវីដេអូ...');

    try {
      const res = await api.downloadVideo(url.trim(), quality);
      if (res.success && res.filename) {
        onShowToast(res.message || 'បានទាញយកវីដេអូដោយជោគជ័យ!', 'success');
        const newProjectFile: ProjectFile = {
          filename: res.filename,
          originalName: res.originalName || res.filename,
          size: res.size || 0,
          type: 'video',
          created: Date.now(),
          url: res.url,
        };
        onVideoDownloaded(newProjectFile);
        setUrl('');
        onClose();
      } else {
        throw new Error('ការទាញយកមិនបានសម្រេច');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'បរាជ័យក្នុងការទាញយកវីដេអូ សូមពិនិត្យតំណភ្ជាប់ម្ដងទៀត');
      onShowToast(err.message || 'កំហុសក្នុងការទាញយក', 'error');
    } finally {
      setIsDownloading(false);
      setDownloadProgressText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101726] border border-white/[0.12] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-ui flex items-center gap-2">
                Video Downloader Pro
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  AI Media
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ទាញយកវីដេអូពី YouTube, TikTok, Facebook ចូល Studio ភ្លាមៗ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supported Platforms Banner */}
        <div className="px-5 py-3 bg-[#080d1a] border-b border-white/[0.05] flex items-center justify-between text-xs text-slate-300">
          <span className="text-slate-400 text-[11px]">គាំទ្រប្រភពវីដេអូ៖</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-medium">
              <Youtube className="w-3 h-3" /> YouTube
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-medium">
              <Film className="w-3 h-3" /> TikTok
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium">
              <Globe className="w-3 h-3" /> Facebook
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDownload} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              តំណភ្ជាប់វីដេអូ (Video Link / URL)
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ឬ https://www.tiktok.com/@.../video/..."
                disabled={isDownloading}
                className="w-full pl-4 pr-24 py-3 rounded-xl bg-[#080c14] border border-white/[0.1] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                autoFocus
              />
              {url && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium px-2 py-1 rounded bg-white/[0.08] text-slate-300 border border-white/[0.08]">
                  {currentPlatform}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              កម្រិតគុណភាពវីដេអូ (Video Resolution)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'best', label: 'ល្អបំផុត (Best / 1080p+)', desc: 'កម្រិតច្បាស់បំផុត' },
                { id: '1080', label: 'Full HD 1080p', desc: 'សមស្របសម្រាប់ YouTube' },
                { id: '720', label: 'HD 720p', desc: 'ទំហំល្មម ទាញយកលឿន' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setQuality(opt.id as any)}
                  disabled={isDownloading}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    quality === opt.id
                      ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-sm shadow-rose-500/20'
                      : 'bg-[#080c14] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {isDownloading && (
            <div className="p-4 rounded-xl bg-[#090d18] border border-sky-500/30 space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-sky-300 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>{downloadProgressText || 'កំពុងទាញយកវីដេអូ...'}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-400 rounded-full animate-pulse w-3/4" />
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                ប្រព័ន្ធកំពុងទាញយក និងបញ្ចូលវីដេអូជាមួយសម្លេង MP4 ដោយស្វ័យប្រវត្តិ
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-xs font-medium text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isDownloading || !url.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  កំពុងទាញយក...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  ទាញយកវីដេអូឥឡូវនេះ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
