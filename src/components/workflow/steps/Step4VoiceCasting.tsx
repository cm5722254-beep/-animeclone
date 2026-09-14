import React, { useState, useMemo } from 'react';
import { TimelineSegment, CharacterVoice } from '../../../types';
import { ChevronRight, Mic2, Play, Users, Settings2, CheckCircle2 } from 'lucide-react';

interface Step4VoiceCastingProps {
  segments: TimelineSegment[];
  characters: CharacterVoice[];
  onChangeSegments: (segments: TimelineSegment[]) => void;
  onPreviewVoice: (filename: string) => void;
  onNext: () => void;
  onBack: () => void;
  onShowToast: (msg: string, type: 'success'|'error'|'info') => void;
}

export const Step4VoiceCasting: React.FC<Step4VoiceCastingProps> = ({
  segments,
  characters,
  onChangeSegments,
  onPreviewVoice,
  onNext,
  onBack,
  onShowToast
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all'|'male'|'female'>('all');

  // Extract unique characters from segments
  const uniqueChars = useMemo(() => {
    const chars = new Map<string, { id: string, name: string, gender: string, currentVoiceId?: string, currentVoiceLabel?: string }>();
    segments.forEach(s => {
      const charName = s.speaker_name || s.speaker_id;
      if (charName && !chars.has(charName)) {
        chars.set(charName, {
          id: charName,
          name: charName,
          gender: s.gender || 'male',
          currentVoiceId: s.voiceId,
          currentVoiceLabel: s.voiceLabel
        });
      }
    });
    return Array.from(chars.values());
  }, [segments]);

  // Handle auto-select first character
  React.useEffect(() => {
    if (uniqueChars.length > 0 && !selectedCharId) {
      setSelectedCharId(uniqueChars[0].id);
    }
  }, [uniqueChars, selectedCharId]);

  const filteredVoices = useMemo(() => {
    if (filter === 'all') return characters;
    return characters.filter(c => c.gender === filter);
  }, [characters, filter]);

  const handleAssignVoice = (voice: CharacterVoice) => {
    if (!selectedCharId) return;
    
    const updated = segments.map(s => {
      const charName = s.speaker_name || s.speaker_id;
      if (charName === selectedCharId) {
        return {
          ...s,
          voiceId: voice.id,
          voiceFilename: voice.filename,
          voiceLabel: voice.label,
          gender: voice.gender
        };
      }
      return s;
    });
    
    onChangeSegments(updated);
    onShowToast(`បានកំណត់សំឡេងឲ្យតួអង្គ ${selectedCharId}`, 'success');
  };

  const selectedChar = uniqueChars.find(c => c.id === selectedCharId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="font-mono font-bold text-indigo-400">ជំហានទី ៤ នៃ ៦</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">ជ្រើសសំឡេង</h2>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          ស្តាប់សំឡេងគំរូ (▶) មុននឹងជ្រើសរើសសម្រាប់តួនីមួយៗ។
        </p>
      </div>

      <div className="flex-1 px-8 pb-4 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-6">
        
        {/* Left: Character List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 h-full overflow-hidden">
          <div className="flex items-center gap-2 mb-1 px-1">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">តួអង្គក្នុងរឿង ({uniqueChars.length})</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
            {uniqueChars.map(char => {
              const isSelected = char.id === selectedCharId;
              return (
                <div 
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'bg-[#0a0e1a] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white truncate pr-2">{char.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      char.gender === 'female' ? 'bg-pink-500/20 text-pink-400' : 'bg-sky-500/20 text-sky-400'
                    }`}>
                      {char.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 bg-black/20 p-2 rounded-lg border border-white/5 truncate">
                    {char.currentVoiceLabel || 'មិនទាន់ជ្រើសរើសសំឡេងទេ'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Voice Library Browser */}
        <div className="flex-1 flex flex-col h-full rounded-2xl border border-white/10 bg-[#0a0e1a] overflow-hidden">
          {/* Voice Toolbar */}
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-200">បណ្ណាល័យសំឡេង (Voice Library)</h3>
            </div>
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
              {['all', 'male', 'female'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${
                    filter === f ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 custom-scrollbar content-start">
            {filteredVoices.map(voice => {
              const isActiveForChar = selectedChar?.currentVoiceId === voice.id || selectedChar?.currentVoiceLabel === voice.label;
              return (
                <div 
                  key={voice.id}
                  className={`relative p-3 rounded-xl border transition-all ${
                    isActiveForChar 
                      ? 'bg-sky-500/10 border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                      : 'bg-[#07090e] border-white/10 hover:border-white/20'
                  }`}
                >
                  {isActiveForChar && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    </div>
                  )}
                  <div className="mb-3 pr-6">
                    <h4 className="font-bold text-sm text-slate-200 mb-1 truncate" title={voice.label}>{voice.label}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        voice.gender === 'female' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {voice.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">Natural</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    <button 
                      onClick={() => onPreviewVoice(voice.filename)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors"
                      title="ស្តាប់សំឡេងគំរូ"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button 
                      onClick={() => handleAssignVoice(voice)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        isActiveForChar 
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isActiveForChar ? 'បានជ្រើសរើស' : 'ជ្រើសរើស'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voice Settings (Mocked for UI as per requirement) */}
          <div className="p-4 border-t border-white/10 bg-[#07090e] flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 className="w-3 h-3" /> Voice Settings (សម្រាប់តួដែលបានជ្រើសរើស)
            </h4>
            <div className="flex items-center gap-6">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Speed</span>
                  <span className="text-sky-400">1.0x</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 w-1/2 rounded-full" />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Pitch</span>
                  <span className="text-amber-400">0</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-1/2 rounded-full mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-8 py-4 bg-[#04060a] border-t border-white/[0.05]">
        <div className="flex items-center justify-between max-w-5xl">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all"
          >
            ← ត្រឡប់ក្រោយ
          </button>
          
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-sky-500/25"
          >
            <span>បន្តទៅមុខ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
