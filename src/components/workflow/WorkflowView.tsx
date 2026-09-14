import React, { useState } from 'react';
import { WorkflowStepper, WorkflowStep } from './WorkflowStepper';
import { Step1Import } from './steps/Step1Import';
import { Step2ContentLanguage } from './steps/Step2ContentLanguage';
import { Step3TranslationReview } from './steps/Step3TranslationReview';
import { Step4VoiceCasting } from './steps/Step4VoiceCasting';
import { Step5Generating } from './steps/Step5Generating';
import { Step6Result } from './steps/Step6Result';
import { ProjectFile, TimelineSegment, CharacterVoice } from '../../types';

interface WorkflowViewProps {
  // Global State
  uploadedFile: ProjectFile | null;
  onUploadFile: (file: File) => void;
  onRemoveFile: () => void;
  isUploadingFile: boolean;
  uploadProgress: number;
  uploadInfo?: { loadedMb: string; totalMb: string } | null;
  
  // Media / Dubbing
  voiceMode: string;
  onVoiceModeChange: (m: string) => void;
  dubbingScope: string;
  onDubbingScopeChange: (scope: string) => void;
  geminiModel: string;
  onGeminiModelChange: (m: string) => void;
  
  // Progress State
  isDubbing: boolean;
  dubbingProgress: number;
  dubbingMessage: string;
  dubbingOutputVideo: string | null;
  dubbingOutputAudio: string | null;
  onStartDubbing: () => void;
  
  // Data
  segments: TimelineSegment[];
  onChangeSegments: (segments: TimelineSegment[]) => void;
  characters: CharacterVoice[];
  onPreviewVoice: (filename: string) => void;
  
  // Actions
  onScanTimeline: () => void;
  isScanningTimeline: boolean;
  onShowToast: (msg: string, type: 'success'|'error'|'info') => void;
  onOpenExportModal?: () => void;
  onOpenStudioMode?: () => void;
  engineMode?: string;
  onSwitchEngine?: (mode: string) => void;
  voxStatus?: any;
  onOpenVoxModal?: () => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = (props) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('import');
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  
  // Local Step State
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);
  const [clipPreset, setClipPreset] = useState(30);
  
  const [contentType, setContentType] = useState('anime');
  const [sourceLanguage, setSourceLanguage] = useState('zh');
  const [targetLanguage, setTargetLanguage] = useState('km');
  const [voiceStyle, setVoiceStyle] = useState('anime');
  const [aiProvider, setAiProvider] = useState('gemini');

  // Helpers to navigate steps
  const goToStep = (step: WorkflowStep) => setCurrentStep(step);
  const completeStep = (step: WorkflowStep, nextStep: WorkflowStep) => {
    setCompletedSteps(prev => Array.from(new Set([...prev, step])));
    setCurrentStep(nextStep);
  };

  const hasScannedSegments = props.segments.length > 0;
  const hasDubbedOutput = !!props.dubbingOutputVideo;

  return (
    <div className="flex flex-col h-full bg-app">
      {/* Stepper Header */}
      <WorkflowStepper 
        currentStep={currentStep} 
        completedSteps={completedSteps} 
        onStepClick={(step) => {
          // Only allow clicking steps that are already completed
          if (completedSteps.includes(step)) {
            setCurrentStep(step);
          }
        }}
      />

      {/* Step Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {currentStep === 'import' && (
          <Step1Import
            uploadedFile={props.uploadedFile}
            isUploadingFile={props.isUploadingFile}
            uploadProgress={props.uploadProgress}
            uploadInfo={props.uploadInfo}
            onUploadFile={props.onUploadFile}
            onRemoveFile={props.onRemoveFile}
            clipStart={clipStart}
            clipEnd={clipEnd}
            clipPreset={clipPreset}
            onClipPresetChange={setClipPreset}
            onClipStartChange={setClipStart}
            onClipEndChange={setClipEnd}
            videoDuration={props.uploadedFile ? 100 : 0} // Ideally get from real metadata
            onNext={() => {
              props.onDubbingScopeChange(clipPreset.toString());
              completeStep('import', 'content-language');
            }}
          />
        )}

        {currentStep === 'content-language' && (
          <Step2ContentLanguage
            uploadedFile={props.uploadedFile}
            contentType={contentType}
            onContentTypeChange={setContentType}
            sourceLanguage={sourceLanguage}
            onSourceLanguageChange={setSourceLanguage}
            targetLanguage={targetLanguage}
            onTargetLanguageChange={setTargetLanguage}
            voiceStyle={voiceStyle}
            onVoiceStyleChange={setVoiceStyle}
            aiProvider={aiProvider}
            onAiProviderChange={setAiProvider}
            onScanTimeline={props.onScanTimeline}
            isScanningTimeline={props.isScanningTimeline}
            hasScannedSegments={hasScannedSegments}
            engineMode={props.engineMode}
            onSwitchEngine={props.onSwitchEngine}
            voxStatus={props.voxStatus}
            onOpenVoxModal={props.onOpenVoxModal}
            onBack={() => goToStep('import')}
            onNext={() => completeStep('content-language', 'translation')}
          />
        )}

        {currentStep === 'translation' && (
          <Step3TranslationReview
            segments={props.segments}
            onChangeSegments={props.onChangeSegments}
            onShowToast={props.onShowToast}
            onBack={() => goToStep('content-language')}
            onNext={() => completeStep('translation', 'voice-casting')}
          />
        )}

        {currentStep === 'voice-casting' && (
          <Step4VoiceCasting
            segments={props.segments}
            characters={props.characters}
            onChangeSegments={props.onChangeSegments}
            onPreviewVoice={props.onPreviewVoice}
            onShowToast={props.onShowToast}
            engineMode={props.engineMode}
            onSwitchEngine={props.onSwitchEngine}
            voxStatus={props.voxStatus}
            onOpenVoxModal={props.onOpenVoxModal}
            onBack={() => goToStep('translation')}
            onNext={() => completeStep('voice-casting', 'generating')}
          />
        )}

        {currentStep === 'generating' && (
          <Step5Generating
            uploadedFile={props.uploadedFile}
            segments={props.segments}
            isDubbing={props.isDubbing}
            dubbingProgress={props.dubbingProgress}
            dubbingMessage={props.dubbingMessage}
            hasDubbedOutput={hasDubbedOutput}
            onStartDubbing={props.onStartDubbing}
            onNext={() => completeStep('generating', 'result')}
          />
        )}

        {currentStep === 'result' && (
          <Step6Result
            uploadedFile={props.uploadedFile}
            outputVideo={props.dubbingOutputVideo}
            outputAudio={props.dubbingOutputAudio}
            isFullVideo={props.dubbingScope === 'full'}
            onFullVideoProcess={() => {
              props.onDubbingScopeChange('full');
              setCompletedSteps(prev => prev.filter(s => s !== 'result' && s !== 'generating'));
              setCurrentStep('generating');
              // Output will be reset in App.tsx when startDubbing is called
              setTimeout(() => {
                props.onStartDubbing();
              }, 100);
            }}
            onBackToEdit={(step) => goToStep(step === 'voice' ? 'voice-casting' : (step as any))}
            onOpenStudioMode={props.onOpenStudioMode}
            onShowToast={props.onShowToast}
            onOpenExportModal={props.onOpenExportModal}
          />
        )}
      </div>
    </div>
  );
};
