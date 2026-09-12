import React, { useState } from 'react';
import { X, Zap, RefreshCw, Check } from 'lucide-react';
import { api } from '../../services/api';

interface QuickVoxcpmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onRefreshStatus: () => void;
}

export const QuickVoxcpmModal: React.FC<QuickVoxcpmModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRefreshStatus,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    try {
      await api.updateConfig({ voxcpmUrl: url.trim() });
      onShowToast('បានរក្សាទុក Link ថ្មី!', 'success');
      onRefreshStatus();
      onClose();
    } catch (e: any) {
      onShowToast(`កំហុស: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-ui">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>ភ្ជាប់ម៉ាស៊ីន AI GPU (VoxCPM2)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-3.5 text-xs">
          <p className="text-slate-400 leading-relaxed">
            ពេលអ្នក Run Google Colab / Kaggle ឡើងវិញ សូម Paste Public URL ចូលខាងក្រោម៖
          </p>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xxxx.trycloudflare.com"
            className="bg-[#07090e] border border-white/[0.08] rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-400 font-mono text-xs"
          />
        </div>

        <div className="p-4 px-6 border-t border-white/[0.08] bg-[#0b0f19] flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              onRefreshStatus();
              onShowToast('កំពុងតេស្តការភ្ជាប់...', 'info');
            }}
            className="px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>តេស្ត</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !url.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black font-semibold text-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{isLoading ? 'កំពុងរក្សា...' : 'រក្សាទុក Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
