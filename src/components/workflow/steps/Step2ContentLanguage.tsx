import React, { useState } from 'react';
import { 
  Languages, Film, Settings2, ShieldCheck, 
  ChevronRight, Brain, ScanSearch, CheckCircle2,
  Loader2, Globe2, Mic
} from 'lucide-react';
import { ProjectFile } from '../../../types';

interface Step2ContentLanguageProps {
  uploadedFile: ProjectFile | null;
  onNext: () => void;
  onBack: () => void;
  
  contentType: string;
  onContentTypeChange: (t: string) => void;
  sourceLanguage: string;
  onSourceLanguageChange: (l: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (l: string) => void;
  voiceStyle: string;
  onVoiceStyleChange: (s: string) => void;
  aiProvider: string;
  onAiProviderChange: (p: string) => void;
  
  onScanTimeline: () => void;
  isScanningTimeline: boolean;
  hasScannedSegments: boolean;
}

export const Step2ContentLanguage: React.FC<Step2ContentLanguageProps> = ({
  uploadedFile,
  onNext,
  onBack,
  contentType,
  onContentTypeChange,
  sourceLanguage,
  onSourceLanguageChange,
  targetLanguage,
  onTargetLanguageChange,
  voiceStyle,
  onVoiceStyleChange,
  aiProvider,
  onAiProviderChange,
  onScanTimeline,
  isScanningTimeline,
  hasScannedSegments
}) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const CONTENT_TYPES = [
    { id: 'anime', label: 'Anime / Donghua', icon: <Film className="w-4 h-4" /> },
    { id: 'movie', label: 'Movie (ភាពយន្ត)', icon: <Film className="w-4 h-4" /> },
    { id: 'series', label: 'Series (ភាគ)', icon: <Film className="w-4 h-4" /> },
    { id: 'other', label: 'Other (ផ្សេងៗ)', icon: <Film className="w-4 h-4" /> }
  ];

  const SOURCE_LANGS = [
    { id: 'zh', label: 'Chinese (中文)' },
    { id: 'en', label: 'English' },
    { id: 'ja', label: 'Japanese' },
    { id: 'ko', label: 'Korean' }
  ];

  const VOICE_STYLES = [
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'anime', label: 'Anime / Expressive' },
    { id: 'natural', label: 'Natural' },
    { id: 'narrator', label: 'Narrator / Studio' }
  ];

  const AI_PROVIDERS = [
    { id: 'gemini', label: 'Gemini + ElevenLabs' },
    { id: 'offline', label: 'Offline Neural (VoxCPM2)' }
  ];

  const handleStartAnalysis = () => {
    // Fake progress bar for visual feedback while backend works
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(p => {
        if (p >= 95) {
          clearInterval(interval);
          return 95;
        }
        return p + Math.random() * 15;
      });
    }, 500);

    // Call real backend
    onScanTimeline();
  };

  // When backend finishes, force 100%
  React.useEffect(() => {
    if (hasScannedSegments && !isScanningTimeline) {
      setAnalysisProgress(100);
    }
  }, [hasScannedSegments, isScanningTimeline]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="font-mono font-bold text-sky-400">ជំហានទី ២ នៃ ៦</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">ប្រភេទ & ភាសា</h2>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          កំណត់ប្រភេទខ្លឹមសារ និងភាសាដើម ដើម្បីឱ្យ AI អាចដំណើរការបានត្រឹមត្រូវ។
        </p>
      </div>

      <div className="flex-1 px-8 pb-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Configuration Form */}
        <div className="flex-[3] flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content Type */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-sky-400" /> Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => onContentTypeChange(type.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                      contentType === type.id 
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className={contentType === type.id ? 'text-sky-400' : 'text-slate-500'}>
                      {type.icon}
                    </div>
                    <span className="text-[11px] font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> Language
              </label>
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold">Source Language (ភាសាដើម)</span>
                  <select 
                    value={sourceLanguage}
                    onChange={(e) => onSourceLanguageChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-xs text-white focus:border-emerald-500/50 outline-none"
                  >
                    {SOURCE_LANGS.map(l => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">Target Language (បកប្រែទៅជា)</span>
                  <select 
                    value={targetLanguage}
                    onChange={(e) => onTargetLanguageChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090e]/50 border border-emerald-500/20 text-xs text-emerald-300 font-bold outline-none cursor-not-allowed"
                    disabled
                  >
                    <option value="km">Khmer (ភាសាខ្មែរ)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Voice Style */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-amber-400" /> Voice Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VOICE_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => onVoiceStyleChange(style.id)}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                      voiceStyle === style.id 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[11px] font-semibold">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Provider */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-purple-400" /> AI Provider
              </label>
              <div className="flex flex-col gap-2">
                {AI_PROVIDERS.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => onAiProviderChange(provider.id)}
                    className={`px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
                      aiProvider === provider.id 
                        ? 'bg-purple-500/10 border-purple-500/40' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold ${aiProvider === provider.id ? 'text-purple-300' : 'text-slate-400'}`}>
                      {provider.label}
                    </span>
                    {aiProvider === provider.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Analysis Panel */}
        <div className="flex-[2] flex flex-col gap-4">
          <div className="rounded-2xl border border-sky-500/20 bg-[#0a0e1a] overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-white/5 bg-sky-500/5 flex items-center gap-3">
              <ScanSearch className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-sky-300">AI Video Analysis</h3>
                <p className="text-[10px] text-slate-400">ស្កេនវីដេអូដើម្បីបំបែកសម្លេង និងតួអង្គ</p>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-center">
              {!isScanningTimeline && !hasScannedSegments && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-sky-400 opacity-80" />
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed px-4">
                    ប្រព័ន្ធនឹងធ្វើការវិភាគវីដេអូ ដើម្បីស្វែងរកការសន្ទនា តួអង្គ និងបកប្រែជាភាសាខ្មែរ ដោយស្វ័យប្រវត្តិ។
                  </p>
                  <button
                    onClick={handleStartAnalysis}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(2,132,199,0.3)] hover:scale-105 active:scale-95"
                  >
                    ចាប់ផ្តើមវិភាគ (Analyze Video)
                  </button>
                </div>
              )}

              {isScanningTimeline && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
                    <p className="text-sm font-bold text-sky-300 animate-pulse">កំពុងវិភាគវីដេអូ...</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-300">Detecting speech & scenes...</span>
                        <span className="text-sky-400 font-mono">{Math.round(analysisProgress)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-600 to-indigo-400 transition-all duration-300"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <ul className="text-xs space-y-2 text-slate-400 pl-2">
                      <li className={`flex items-center gap-2 transition-all ${analysisProgress > 20 ? 'text-emerald-400' : 'opacity-50'}`}>
                        {analysisProgress > 20 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Video analyzed
                      </li>
                      <li className={`flex items-center gap-2 transition-all ${analysisProgress > 50 ? 'text-emerald-400' : 'opacity-50'}`}>
                        {analysisProgress > 50 ? <CheckCircle2 className="w-3.5 h-3.5" /> : analysisProgress > 20 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                        Characters detected
                      </li>
                      <li className={`flex items-center gap-2 transition-all ${analysisProgress > 80 ? 'text-emerald-400' : 'opacity-50'}`}>
                        {analysisProgress > 80 ? <CheckCircle2 className="w-3.5 h-3.5" /> : analysisProgress > 50 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                        Speech translated
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {!isScanningTimeline && hasScannedSegments && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 relative z-10" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-400 mb-1">វិភាគរួចរាល់!</h4>
                  <p className="text-xs text-slate-400 mb-6 px-4">
                    វីដេអូត្រូវបានស្កេន និងបកប្រែជាភាសាខ្មែរដោយជោគជ័យ។ ឥឡូវអ្នកអាចពិនិត្យការបកប្រែ។
                  </p>
                  
                  <ul className="text-xs space-y-2 text-slate-300 inline-block text-left bg-white/5 p-3 rounded-xl border border-white/10 mb-6">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Video analyzed
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Characters detected
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Speech detected & translated
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="sticky bottom-0 px-8 py-4 bg-[#04060a] border-t border-white/[0.05]">
        <div className="flex items-center justify-between max-w-5xl">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all"
          >
            ← ត្រឡប់ក្រោយ
          </button>
          <button
            onClick={onNext}
            disabled={!hasScannedSegments || isScanningTimeline}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              hasScannedSegments && !isScanningTimeline
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-sky-500/25'
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
