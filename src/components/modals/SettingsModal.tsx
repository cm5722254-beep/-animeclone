import React, { useState, useEffect } from 'react';
import { X, Sliders, ExternalLink, Save, Copy, HardDrive, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onRefreshConfig: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRefreshConfig,
}) => {
  const [elevenKey, setElevenKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash');
  const [voxcpmUrl, setVoxcpmUrl] = useState('');
  const [lanUrl, setLanUrl] = useState('');
  const [diskStats, setDiskStats] = useState<{ formattedSize: string; count: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getConfig().then((cfg) => {
        if (cfg.geminiModel) setGeminiModel(cfg.geminiModel);
        if (cfg.voxcpmUrl) setVoxcpmUrl(cfg.voxcpmUrl);
      });
      api.getNetworkInfo().then((net) => {
        if (net.primaryLanUrl) setLanUrl(net.primaryLanUrl);
      });
      api.getOutputStats().then((stats) => {
        setDiskStats(stats);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateConfig({
        elevenlabsKey: elevenKey || undefined,
        geminiKey: geminiKey || undefined,
        geminiModel,
        voxcpmUrl: voxcpmUrl || undefined,
      });
      onShowToast('រក្សាទុកការកំណត់ជោគជ័យ!', 'success');
      onRefreshConfig();
      onClose();
    } catch (e: any) {
      onShowToast(`កំហុស: ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearOutputs = async () => {
    if (!confirm('តើអ្នកពិតជាចង់សម្អាតឯកសារ Output ទាំងអស់ដើម្បីសន្សំទំហំថាសមែនទេ?')) return;
    try {
      const res = await api.clearOutputs();
      if (res.success) {
        onShowToast(`បានសម្អាត ${res.count} ឯកសារ (សន្សំបាន ${res.formattedFreed})!`, 'success');
        api.getOutputStats().then(setDiskStats);
      }
    } catch (e: any) {
      onShowToast(`កំហុសក្នុងការសម្អាត: ${e.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.1] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-7 h-7 rounded-lg border border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.4)] object-cover"
            />
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-ui">
              <span>ការកំណត់ API & ប្រព័ន្ធ (System & AI Config)</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* ElevenLabs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">គន្លឹះ ElevenLabs API (Voice Cloning)</span>
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>យក Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={elevenKey}
              onChange={(e) => setElevenKey(e.target.value)}
              placeholder="sk_... (ទុកទំនេរប្រសិនបើបានកំណត់រួច)"
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* Gemini API */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">គន្លឹះ Google Gemini API (Translation & Diarization)</span>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>យក Key ឥតគិតថ្លៃ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AQ.Ab... (ទុកទំនេរប្រសិនបើបានកំណត់រួច)"
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* Gemini Model */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">🤖 ម៉ូឌែល AI Gemini សម្រាប់ដំណើរការ</label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="bg-[#07090e] border border-white/[0.08] text-sky-400 font-semibold rounded-lg px-3 py-2 outline-none focus:border-sky-400"
            >
              <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (លឿន & ឆ្លាតវៃ - Recommended)</option>
              <option value="gemini-3.1-flash-lite">🚀 Gemini 3.1 Flash-Lite (លឿនបំផុត Ultra-Fast)</option>
              <option value="gemini-3.7-flash">🧠 Gemini 3.7 Flash (Advanced Reasoning)</option>
              <option value="gemini-flash-latest">🔄 Gemini Flash Latest (Google Default)</option>
            </select>
          </div>

          {/* VoxCPM URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">🚀 VoxCPM2 Kaggle / Colab Public URL</label>
            <input
              type="text"
              value={voxcpmUrl}
              onChange={(e) => setVoxcpmUrl(e.target.value)}
              placeholder="https://xxxx.trycloudflare.com"
              className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* LAN Share Link */}
          <div className="bg-sky-500/[0.06] border border-sky-500/20 rounded-lg p-3.5 flex flex-col gap-2">
            <label className="font-semibold text-sky-300">🌐 ប្រើប្រាស់រួមគ្នាលើបណ្ដាញ Wi-Fi / LAN</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={lanUrl || 'កំពុងស្វែងរក...'}
                className="flex-1 bg-[#07090e] border border-white/[0.08] rounded px-3 py-1.5 text-sky-400 font-mono text-xs outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lanUrl);
                  onShowToast('បានចម្លង Link LAN!', 'success');
                }}
                className="px-3 py-1.5 rounded bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>ចម្លង</span>
              </button>
            </div>
          </div>

          {/* Storage Cleanup */}
          <div className="bg-rose-500/[0.06] border border-rose-500/20 rounded-lg p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>ទំហំឯកសារ Output & សម្អាតទំហំថាស</span>
              </span>
              <span className="font-mono text-rose-400 font-semibold">{diskStats?.formattedSize || '...'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              លុបឯកសារ Output ចាស់ៗក្នុងថត outputs/ ដើម្បីសន្សំទំហំថាសកុំព្យូទ័រ។
            </p>
            <button
              onClick={handleClearOutputs}
              className="self-start px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>សម្អាតឯកសារ Output ទាំងអស់</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#0b0f19] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs transition-colors"
          >
            បោះបង់
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors shadow-md shadow-sky-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកំណត់'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
