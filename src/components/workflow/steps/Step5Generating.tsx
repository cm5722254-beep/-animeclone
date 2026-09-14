import React, { useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Wand2, Volume2, Film, AlignLeft, UserCircle2 } from 'lucide-react';
import { ProjectFile, TimelineSegment } from '../../../types';

interface Step5GeneratingProps {
  uploadedFile: ProjectFile | null;
  segments: TimelineSegment[];
  isDubbing: boolean;
  dubbingProgress: number;
  dubbingMessage: string;
  hasDubbedOutput: boolean;
  onStartDubbing: () => void;
  onNext: () => void;
}

export const Step5Generating: React.FC<Step5GeneratingProps> = ({
  uploadedFile,
  segments,
  isDubbing,
  dubbingProgress,
  dubbingMessage,
  hasDubbedOutput,
  onStartDubbing,
  onNext
}) => {
  // Automatically start dubbing if we haven't started yet and don't have output
  useEffect(() => {
    if (!isDubbing && !hasDubbedOutput) {
      onStartDubbing();
    }
  }, []); // Only run once when component mounts

  // Automatically go to next step if dubbing is complete
  useEffect(() => {
    if (!isDubbing && hasDubbedOutput) {
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDubbing, hasDubbedOutput, onNext]);

  const uniqueCharsCount = new Set(segments.map(s => s.speaker_name || s.speaker_id)).size;

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl flex flex-col gap-8 relative z-10">
        
        {/* DO NOT CLOSE WARNING */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-300 mb-1">សូមរង់ចាំរហូតដល់ដំណើរការបញ្ចប់</h4>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              កុំបិទទំព័រនេះ ឬបិទកម្មវិធីកណ្តាលដំណើរការ ព្រោះអាចធ្វើឲ្យបាត់បង់ទិន្នន័យកំពុង Generate។ ដំណើរការនេះអាចចំណាយពេលមួយសន្ទុះអាស្រ័យលើប្រវែងវីដេអូ។
            </p>
          </div>
        </div>

        {/* Main Processing Dashboard */}
        <div className="rounded-3xl border border-white/10 bg-[#070a12] p-8 shadow-2xl shadow-black/50">
          
          {/* Header Status */}
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <div className="relative mb-6">
              {hasDubbedOutput ? (
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/30">
                  <Wand2 className={`w-8 h-8 text-sky-400 ${isDubbing ? 'animate-pulse' : ''}`} />
                  {isDubbing && (
                    <svg className="absolute inset-0 w-full h-full animate-spin text-sky-500/50" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="150 150" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {hasDubbedOutput ? 'បង្កើតរួចរាល់' : 'កំពុងបង្កើត'}
            </h2>
            <p className="text-sm text-slate-400 font-mono">
              {hasDubbedOutput ? 'Processing complete. Redirecting to results...' : dubbingMessage || 'ប្រព័ន្ធកំពុងបង្កើតជាភាសាខ្មែរ...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-sky-300">Total Progress</span>
              <span className="text-sky-400 font-mono">{hasDubbedOutput ? 100 : dubbingProgress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/10 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${hasDubbedOutput ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-600 via-indigo-500 to-sky-400'}`}
                style={{ width: `${hasDubbedOutput ? 100 : dubbingProgress}%` }}
              />
            </div>
          </div>

          {/* Processing Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5">
              <Film className="w-5 h-5 text-slate-400 mb-2" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Video</span>
              <span className="text-xs text-slate-200 font-semibold truncate w-full px-2" title={uploadedFile?.filename}>
                {uploadedFile?.originalName || uploadedFile?.filename || 'Unknown'}
              </span>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5">
              <UserCircle2 className="w-5 h-5 text-indigo-400 mb-2" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Characters</span>
              <span className="text-xs text-slate-200 font-semibold">{uniqueCharsCount}</span>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5">
              <AlignLeft className="w-5 h-5 text-emerald-400 mb-2" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Dialogue</span>
              <span className="text-xs text-slate-200 font-semibold">{segments.length} lines</span>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5">
              <Volume2 className="w-5 h-5 text-amber-400 mb-2" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Audio</span>
              <span className="text-xs text-slate-200 font-semibold">Khmer AI Mix</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
