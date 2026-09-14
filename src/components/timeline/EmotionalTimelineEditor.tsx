import React, { useState } from 'react';
import { Wand2, Volume2, Smile, Frown, Flame, Heart } from 'lucide-react';
import { TimelineSegment } from '../../types';
import { AdvancedVoiceModal } from '../modals/AdvancedVoiceModal';
import { EmotionalVoiceConfig } from '../voice/EmotionalVoiceEngine';
import { api } from '../../services/api';

interface EmotionalTimelineEditorProps {
  segments: TimelineSegment[];
  onUpdateSegment: (index: number, updates: Partial<TimelineSegment>) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EmotionalTimelineEditor: React.FC<EmotionalTimelineEditorProps> = ({
  segments,
  onUpdateSegment,
  onShowToast,
}) => {
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

  const handleOpenAdvancedVoice = (index: number) => {
    setSelectedSegmentIndex(index);
    setIsAdvancedModalOpen(true);
  };

  const handleGenerateEmotionalVoice = async (config: EmotionalVoiceConfig) => {
    if (selectedSegmentIndex === null) return { audioUrl: '' };

    const segment = segments[selectedSegmentIndex];
    onShowToast(`🎭 កំពុងបង្កើតសំឡេងជាមួយអារម្មណ៍ "${config.emotion}"...`, 'info');

    try {
      const response = await api.generateLine({
        text: segment.khmer_translation || segment.chinese_text || '',
        lineIndex: selectedSegmentIndex,
        voiceId: segment.voiceId,
        gender: segment.gender,
        speakerId: segment.speaker_role,
        emotion: config.emotion,
        intensity: config.intensity,
        volume: config.volume,
        speed: config.speed,
        pitch: config.pitch,
        breathiness: config.breathiness,
        raspiness: config.raspiness,
        vibrato: config.vibrato,
      });

      if (response.success) {
        onUpdateSegment(selectedSegmentIndex, {
          audioUrl: response.audioUrl,
          emotion: config.emotion,
        });
        onShowToast('✅ បានបង្កើតសំឡេងជាមួយអារម្មណ៍ជោគជ័យ!', 'success');
        return { audioUrl: response.audioUrl };
      }
    } catch (error: any) {
      onShowToast(`❌ កំហុស: ${error.message}`, 'error');
    }

    return { audioUrl: '' };
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return <Smile className="w-3.5 h-3.5 text-yellow-400" />;
      case 'sad': return <Frown className="w-3.5 h-3.5 text-blue-400" />;
      case 'angry': return <Flame className="w-3.5 h-3.5 text-red-400" />;
      case 'excited': return <Heart className="w-3.5 h-3.5 text-pink-400 animate-pulse" />;
      default: return <Volume2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {segments.map((segment, index) => (
        <div
          key={index}
          className="bg-[#0c0f1e]/90 border border-white/[0.08] rounded-lg p-4 hover:border-sky-500/30 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Segment Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400">
                  #{index + 1}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {segment.start_time.toFixed(1)}s - {segment.end_time.toFixed(1)}s
                </span>
                {segment.emotion && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {getEmotionIcon(segment.emotion)}
                    {segment.emotion}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-white leading-relaxed">
                {segment.khmer_translation || segment.chinese_text}
              </p>

              {segment.chinese_text && segment.khmer_translation && (
                <p className="text-xs text-slate-500 font-mono">
                  {segment.chinese_text}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleOpenAdvancedVoice(index)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-all shadow-lg"
                title="បង្កើតសំឡេងជាមួយអារម្មណ៍"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">អារម្មណ៍</span>
              </button>

              {segment.audioUrl && (
                <button
                  onClick={() => {
                    const audio = new Audio(segment.audioUrl);
                    audio.play();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
                  title="ស្តាប់សំឡេង"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ស្តាប់</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Advanced Voice Modal */}
      {selectedSegmentIndex !== null && (
        <AdvancedVoiceModal
          isOpen={isAdvancedModalOpen}
          onClose={() => {
            setIsAdvancedModalOpen(false);
            setSelectedSegmentIndex(null);
          }}
          text={segments[selectedSegmentIndex]?.khmer_translation || segments[selectedSegmentIndex]?.chinese_text || ''}
          voiceId={segments[selectedSegmentIndex]?.voiceId || ''}
          onGenerate={handleGenerateEmotionalVoice}
        />
      )}
    </div>
  );
};
