import React, { useState } from 'react';
import { X, Play, Download, Wand2, RefreshCw } from 'lucide-react';
import { EmotionalVoiceEngine, EmotionalVoiceConfig, VoiceEmotion } from '../voice/EmotionalVoiceEngine';

interface AdvancedVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  voiceId: string;
  onGenerate: (config: EmotionalVoiceConfig) => Promise<{ audioUrl: string }>;
}

export const AdvancedVoiceModal: React.FC<AdvancedVoiceModalProps> = ({
  isOpen,
  onClose,
  text,
  voiceId,
  onGenerate,
}) => {
  const [config, setConfig] = useState<EmotionalVoiceConfig>({
    emotion: 'neutral',
    intensity: 50,
    volume: 70,
    speed: 1.0,
    pitch: 0,
    breathiness: 20,
    raspiness: 10,
    vibrato: 20,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate(config);
      setGeneratedAudioUrl(result.audioUrl);
      
      // Auto-play preview
      const audio = new Audio(result.audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error('Voice generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPreview = () => {
    if (generatedAudioUrl) {
      const audio = new Audio(generatedAudioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="bg-gradient-to-br from-[#0c1022] to-[#070b17] border border-sky-500/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-sky-400" />
              បង្កើតសំឡេងជាមួយអារម្មណ៍ (Emotional Voice Generator)
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              កែសម្រួលអារម្មណ៍ និងលក្ខណៈសំឡេងដើម្បីឱ្យដូចមនុស្សពិតប្រាកដ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Text Preview */}
          <div className="mb-6 p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg">
            <label className="text-xs font-semibold text-slate-400 mb-2 block">
              អត្ថបទដែលនឹងនិយាយ:
            </label>
            <p className="text-sm text-white font-semibold leading-relaxed">
              {text || 'គ្មានអត្ថបទ'}
            </p>
          </div>

          {/* Emotional Voice Engine */}
          <EmotionalVoiceEngine
            onConfigChange={setConfig}
            currentEmotion={config.emotion}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-white/[0.08] bg-[#05070c]/50">
          <div className="flex items-center gap-2">
            {generatedAudioUrl && (
              <>
                <button
                  onClick={handlePlayPreview}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  ស្តាប់សាកល្បង
                </button>
                <a
                  href={generatedAudioUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  ទាញយក
                </a>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all"
            >
              បោះបង់
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  កំពុងបង្កើត...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  បង្កើតសំឡេង
                </>
              )}
            </button>
          </div>
        </div>

        {/* Emotion Guide */}
        <div className="px-6 pb-6">
          <details className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-4">
            <summary className="text-xs font-semibold text-sky-300 cursor-pointer hover:text-sky-200 transition-colors">
              📖 មគ្គុទេសន៍ប្រើប្រាស់អារម្មណ៍សំឡេង
            </summary>
            <div className="mt-3 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>• <strong>😊 អរ រីករាយ:</strong> ល្អសម្រាប់ឈុតសប្បាយ ឬអបអរសាទរ</p>
              <p>• <strong>😢 ក្រៀមក្រំ:</strong> ល្អសម្រាប់ឈុតកំសត់ ឬអំពីការបាត់បង់</p>
              <p>• <strong>😠 ខឹង:</strong> ល្អសម្រាប់ឈុតប្រយុទ្ធ ឬជជែកវែកញែក</p>
              <p>• <strong>🤩 រំភើប:</strong> ល្អសម្រាប់ឈុតភ្ញាក់ផ្អើល ឬមានដំណឹងល្អ</p>
              <p>• <strong>😨 ភ័យ:</strong> ល្អសម្រាប់ឈុតគួរឱ្យខ្លាច ឬចាប់អារម្មណ៍</p>
              <p>• <strong>🤫 និយាយស្រាល:</strong> ល្អសម្រាប់ឈុតសម្ងាត់ ឬខ្លោច</p>
              <p>• <strong>📢 ស្រែកខ្លាំង:</strong> ល្អសម្រាប់ឈុតប្រកាស ឬព្រមានគ្រោះថ្នាក់</p>
              <p>• <strong>😂 សើច:</strong> ល្អសម្រាប់ឈុតកំប្លែង ឬសប្បាយរីករាយ</p>
              <p>• <strong>😭 យំ:</strong> ល្អសម្រាប់ឈុតសោកសៅ ឬទុក្ខព្រួយ</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
