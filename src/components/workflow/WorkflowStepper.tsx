import React from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

export type WorkflowStep = 
  | 'import' 
  | 'content-language' 
  | 'translation' 
  | 'voice-casting' 
  | 'generating' 
  | 'result';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick?: (step: WorkflowStep) => void;
}

const STEPS: { id: WorkflowStep; label: string; number: number }[] = [
  { id: 'import', label: 'ដាក់ចូលវីដេអូ', number: 1 },
  { id: 'content-language', label: 'ប្រភេទ & ភាសា', number: 2 },
  { id: 'translation', label: 'ពិនិត្យការបកប្រែ', number: 3 },
  { id: 'voice-casting', label: 'ជ្រើសសំឡេង', number: 4 },
  { id: 'generating', label: 'កំពុងបង្កើត', number: 5 },
  { id: 'result', label: 'ទាញយកលទ្ធផល', number: 6 },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  const getStepState = (stepId: WorkflowStep) => {
    if (completedSteps.includes(stepId) && stepId !== currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'locked';
  };

  return (
    <div className="w-full bg-[#0a0e1a] border-b border-white/[0.05] py-5 px-8 select-none z-20 shadow-md">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Connection Lines Background */}
          <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-white/[0.03] -z-10" />
          
          {/* Connection Line Progress */}
          <div 
            className="absolute top-[18px] left-[5%] h-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 -z-10 transition-all duration-700 ease-in-out"
            style={{
              width: `${(Math.max(0, STEPS.findIndex(s => s.id === currentStep)) / (STEPS.length - 1)) * 90}%`,
            }}
          />

          {STEPS.map((step) => {
            const state = getStepState(step.id);
            const isClickable = completedSteps.includes(step.id) && onStepClick;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2.5 relative ${
                  isClickable ? 'cursor-pointer group' : ''
                }`}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                {/* Step Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-[2px] transition-all duration-500 ${
                    state === 'completed'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : state === 'current'
                      ? 'bg-[#0a0e1a] border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'bg-[#0a0e1a] border-white/10 text-white/20'
                  } ${isClickable ? 'group-hover:scale-110' : ''}`}
                >
                  {state === 'completed' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : state === 'current' ? (
                    step.id === 'generating' ? (
                      <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                    )
                  ) : (
                    <span className="text-[11px] font-bold">{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    ជំហានទី {step.number}
                  </span>
                  <span
                    className={`text-[11px] font-bold transition-colors ${
                      state === 'completed'
                        ? 'text-emerald-400'
                        : state === 'current'
                        ? 'text-sky-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
