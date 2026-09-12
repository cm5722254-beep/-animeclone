import React from 'react';
import { Check, Loader2, Circle, Sparkles, Film, Users, Languages, Mic2, Wand2, RefreshCw, Volume2, ShieldCheck, Share2 } from 'lucide-react';

interface AiWorkflowProps {
  hasVideo: boolean;
  characterCount: number;
  hasTranslation: boolean;
  hasVoiceCasting: boolean;
  isDubbing: boolean;
  dubbingProgress: number;
  hasDubbedOutput: boolean;
  onStartDubbing?: () => void;
  onScanTimeline?: () => void;
}

export const AiDubbingWorkflow: React.FC<AiWorkflowProps> = ({
  hasVideo,
  characterCount,
  hasTranslation,
  hasVoiceCasting,
  isDubbing,
  dubbingProgress,
  hasDubbedOutput,
  onStartDubbing,
  onScanTimeline,
}) => {
  const steps = [
    {
      id: 1,
      title: 'Analyze',
      desc: hasVideo ? 'Video analyzed' : 'Waiting for video...',
      status: hasVideo ? 'done' : 'current',
      icon: <Film className="w-3.5 h-3.5" />,
    },
    {
      id: 2,
      title: 'Detect Characters',
      desc: characterCount > 0 ? `${characterCount} characters found` : 'Scanning speakers...',
      status: characterCount > 0 ? 'done' : hasVideo ? 'current' : 'pending',
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      id: 3,
      title: 'Translate',
      desc: hasTranslation ? 'Translation completed' : 'Ready to translate',
      status: hasTranslation ? 'done' : characterCount > 0 ? 'current' : 'pending',
      icon: <Languages className="w-3.5 h-3.5" />,
    },
    {
      id: 4,
      title: 'Cast Voices',
      desc: hasVoiceCasting ? 'Voice casting done' : 'Assigning voices...',
      status: hasVoiceCasting ? 'done' : hasTranslation ? 'current' : 'pending',
      icon: <Mic2 className="w-3.5 h-3.5" />,
    },
    {
      id: 5,
      title: 'Generate Voice',
      desc: isDubbing
        ? `Generating audio (${dubbingProgress}%)...`
        : hasDubbedOutput
        ? 'Voice generation ready'
        : 'Ready to generate',
      status: isDubbing ? 'active' : hasDubbedOutput ? 'done' : hasVoiceCasting ? 'current' : 'pending',
      icon: <Wand2 className="w-3.5 h-3.5" />,
    },
    {
      id: 6,
      title: 'Sync',
      desc: hasDubbedOutput ? 'Synced to playhead' : 'Waiting...',
      status: hasDubbedOutput ? 'done' : 'pending',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    {
      id: 7,
      title: 'Mix',
      desc: hasDubbedOutput ? '48kHz Hi-Fi mix' : 'Waiting...',
      status: hasDubbedOutput ? 'done' : 'pending',
      icon: <Volume2 className="w-3.5 h-3.5" />,
    },
    {
      id: 8,
      title: 'Review',
      desc: hasDubbedOutput ? 'Ready to review' : 'Waiting...',
      status: hasDubbedOutput ? 'done' : 'pending',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 9,
      title: 'Export',
      desc: hasDubbedOutput ? 'Ready for export' : 'Waiting...',
      status: hasDubbedOutput ? 'done' : 'pending',
      icon: <Share2 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="w-56 bg-[#0a0e17] border-l border-white/[0.08] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="p-3.5 px-4 border-b border-white/[0.08] flex items-center justify-between">
        <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-ui">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>AI Dubbing Workflow</span>
        </h4>
      </div>

      {/* Stepper List */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
        {steps.map((step, idx) => {
          const isDone = step.status === 'done';
          const isActive = step.status === 'active';
          const isCurrent = step.status === 'current';

          return (
            <div key={step.id} className="relative flex items-start gap-3 group">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-[13px] top-7 bottom-[-12px] w-[2px] ${
                    isDone ? 'bg-emerald-500/40' : isActive ? 'bg-sky-500/40' : 'bg-white/[0.06]'
                  }`}
                />
              )}

              {/* Status Circle */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)] animate-pulse'
                    : isCurrent
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                    : 'bg-white/[0.03] text-slate-500 border border-white/[0.08]'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step info */}
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-semibold leading-tight truncate ${
                    isDone
                      ? 'text-slate-100'
                      : isActive
                      ? 'text-sky-300 font-bold'
                      : isCurrent
                      ? 'text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`text-[10px] leading-tight truncate ${
                    isActive ? 'text-sky-400' : isDone ? 'text-emerald-400/80' : 'text-slate-400'
                  }`}
                >
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action in Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-[#070a12]">
        <button
          onClick={onStartDubbing}
          disabled={isDubbing || !hasVideo}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/25 active:scale-95 transition-all"
        >
          {isDubbing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasDubbedOutput ? 'Re-Dub Video' : 'Start Dubbing'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
