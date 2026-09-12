import React, { useState } from 'react';
import { Languages, Sparkles, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';

interface TranslationProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TranslationDesk: React.FC<TranslationProps> = ({ onShowToast }) => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      onShowToast('សូមបញ្ចូលអត្ថបទចិនដើម!', 'error');
      return;
    }
    setIsLoading(true);
    onShowToast('AI Gemini កំពុងបកប្រែ...', 'info');

    try {
      const res = await api.translate(sourceText, 'zh', 'km');
      if (res.translation) {
        setTargetText(res.translation);
        onShowToast('បកប្រែជាភាសាខ្មែរជោគជ័យ!', 'success');
      }
    } catch (e: any) {
      onShowToast(`កំហុសក្នុងការបកប្រែ: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!targetText) return;
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    onShowToast('បានចម្លងអត្ថបទខ្មែរ!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 select-none">
      <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4">
        <h3 className="text-base font-bold text-white font-ui">
          តុបកប្រែពាក្យពេចន៍ភាពយន្ត (AI Theatrical Translation Desk)
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          បកប្រែភាសាចិន មកជាភាសាខ្មែររស់រវើកបែបភាពយន្តបុរាណ និងសម័យ ដោយប្រើប្រាស់ Gemini Flash AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[360px]">
        {/* Source Text Area */}
        <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span>អត្ថបទចិនដើម (Source Chinese)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CHINESE (ZH)</span>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="សូមបញ្ចូល ឬ Paste អត្ថបទចិននៅទីនេះ..."
            className="flex-1 w-full bg-[#07090e] border border-white/[0.08] rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-400 outline-none resize-none font-mono"
            rows={12}
          />
        </div>

        {/* Target Translation Area */}
        <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>អត្ថបទខ្មែរដែលបានបកប្រែ (Khmer Translation)</span>
            </span>
            {targetText && (
              <button
                onClick={handleCopy}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'ចម្លងរួច' : 'ចម្លង'}</span>
              </button>
            )}
          </div>

          <textarea
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            placeholder="លទ្ធផលបកប្រែជាភាសាខ្មែរនឹងបង្ហាញនៅទីនេះ..."
            className="flex-1 w-full bg-[#07090e] border border-white/[0.08] rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-400 outline-none resize-none leading-relaxed"
            rows={12}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleTranslate}
          disabled={isLoading || !sourceText.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-black font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'កំពុងបកប្រែ...' : 'បកប្រែជាភាសាខ្មែរភ្លាមៗ'}</span>
        </button>
      </div>
    </div>
  );
};
