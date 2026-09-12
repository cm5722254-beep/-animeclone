import React, { useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  X,
  Mic,
  Volume2,
  Brain,
  Sparkles,
  CheckCircle2,
  Download,
  Music,
} from 'lucide-react';
import { ProjectFile } from '../../types';

interface InspectorProps {
  uploadedFile: ProjectFile | null;
  onUploadFile: (file: File) => void;
  onRemoveFile: () => void;
  voiceMode: string;
  onVoiceModeChange: (m: string) => void;
  maleLeadVoice: string;
  onMaleLeadChange: (v: string) => void;
  femaleLeadVoice: string;
  onFemaleLeadChange: (v: string) => void;
  geminiModel: string;
  onGeminiModelChange: (m: string) => void;
  isDubbing: boolean;
  dubbingProgress: number;
  dubbingMessage: string;
  dubbingOutputVideo: string | null;
  dubbingOutputAudio: string | null;
  onStartDubbing: () => void;
  onPreviewVoice: (filename: string) => void;
}

export const ContextualInspector: React.FC<InspectorProps> = ({
  uploadedFile,
  onUploadFile,
  onRemoveFile,
  voiceMode,
  onVoiceModeChange,
  maleLeadVoice,
  onMaleLeadChange,
  femaleLeadVoice,
  onFemaleLeadChange,
  geminiModel,
  onGeminiModelChange,
  isDubbing,
  dubbingProgress,
  dubbingMessage,
  dubbingOutputVideo,
  dubbingOutputAudio,
  onStartDubbing,
  onPreviewVoice,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <aside className="w-80 bg-[#111827] border-l border-white/[0.08] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-ui flex items-center gap-1.5">
          <span>Inspector</span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase">
          Dubbing
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Upload Zone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>ឯកសារវីដេអូដើម</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUploadFile(e.target.files[0]);
              }
            }}
          />

          {!uploadedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-sky-500/30 hover:border-sky-400 rounded-lg p-5 text-center cursor-pointer bg-sky-500/[0.02] hover:bg-sky-500/[0.06] transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center mx-auto mb-2">
                <FileVideo className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-white">អូសទម្លាក់វីដេអូ ឬចុចជ្រើសរើស</div>
              <div className="text-[10px] text-slate-400 mt-0.5">MP4, MKV, MOV, WebM (Up to 10GB)</div>
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileVideo className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{uploadedFile.filename}</div>
                  <div className="text-[10px] text-slate-400">{(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB</div>
                </div>
              </div>
              <button
                onClick={onRemoveFile}
                className="text-slate-400 hover:text-white p-1 transition-colors"
                title="លុបចេញ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Voice Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            <span>របៀបសំឡេង (Voice Mode)</span>
          </label>
          <select
            value={voiceMode}
            onChange={(e) => onVoiceModeChange(e.target.value)}
            className="w-full bg-[#07090e] border border-white/[0.08] text-slate-200 text-xs rounded-lg px-2.5 py-2 cursor-pointer focus:border-sky-400 outline-none"
          >
            <option value="voxcpm-voice-actor">🎭 Auto Distinct Cast (២០+ សំឡេងតួអង្គ)</option>
            <option value="movie-live-clone">🎯 Movie Live Clone (កាត់សំឡេងពីរឿងដើម)</option>
            <option value="lead-only">👑 ប្រើតែសំឡេងតួឯកប្រុស & តួស្រី</option>
          </select>
        </div>

        {/* Male Lead Voice */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-300">👑 សំឡេងតួឯកប្រុស</span>
            <button
              onClick={() => onPreviewVoice(maleLeadVoice)}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[10.5px]"
            >
              <Volume2 className="w-3 h-3" />
              <span>ស្ដាប់</span>
            </button>
          </div>
          <select
            value={maleLeadVoice}
            onChange={(e) => onMaleLeadChange(e.target.value)}
            className="w-full bg-[#07090e] border border-white/[0.08] text-slate-200 text-xs rounded-lg px-2.5 py-2 cursor-pointer focus:border-sky-400 outline-none"
          >
            <option value="hang_phleung_char_2_male.mp3">👑 តួឯកប្រុស ទី១ (ហង្សភ្លើង - សង្ហា)</option>
            <option value="char_male_lead_star7.mp3">👑 តួប្រុស ផ្កាយ៧ (ម៉ឺងម៉ាត់)</option>
            <option value="char_male_tactics.mp3">👑 តួប្រុស យុទ្ធសាស្ត្រ (ច្បាស់)</option>
            <option value="hang_phleung_char_7_male.mp3">👑 តួឯកប្រុស ទី២ (ស៊ីងជឺ)</option>
            <option value="main_lead_male.mp3">👑 តួឯកប្រុស ទី៣ (រោងកុនច្បាស់)</option>
          </select>
        </div>

        {/* Female Lead Voice */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-300">🌸 សំឡេងតួឯកស្រី</span>
            <button
              onClick={() => onPreviewVoice(femaleLeadVoice)}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[10.5px]"
            >
              <Volume2 className="w-3 h-3" />
              <span>ស្ដាប់</span>
            </button>
          </div>
          <select
            value={femaleLeadVoice}
            onChange={(e) => onFemaleLeadChange(e.target.value)}
            className="w-full bg-[#07090e] border border-white/[0.08] text-slate-200 text-xs rounded-lg px-2.5 py-2 cursor-pointer focus:border-sky-400 outline-none"
          >
            <option value="hang_phleung_char_6_female.mp3">🌸 តួឯកស្រី ទី១ (ហង្សភ្លើង - ស្រទន់)</option>
            <option value="char_female_lead_palace.mp3">🌸 តួឯកស្រី ដំណាក់រាជវាំង</option>
            <option value="hang_phleung_char_10_female.mp3">🌸 តួឯកស្រី ទី២ (រស់រវើក)</option>
            <option value="main_lead_female.mp3">🌸 តួឯកស្រី ទី៣ (រោងកុន)</option>
          </select>
        </div>

        {/* Gemini Model */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-sky-400" />
            <span>ម៉ូឌែល AI Gemini</span>
          </label>
          <select
            value={geminiModel}
            onChange={(e) => onGeminiModelChange(e.target.value)}
            className="w-full bg-[#07090e] border border-white/[0.08] text-sky-400 font-semibold text-xs rounded-lg px-2.5 py-2 cursor-pointer focus:border-sky-400 outline-none"
          >
            <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (លឿន & ឆ្លាតវៃ)</option>
            <option value="gemini-3.1-flash-lite">🚀 Gemini 3.1 Flash-Lite (Ultra-Fast)</option>
            <option value="gemini-3.7-flash">🧠 Gemini 3.7 Flash (Reasoning)</option>
          </select>
        </div>

        {/* Start Dubbing Action Button */}
        <button
          onClick={onStartDubbing}
          disabled={isDubbing || !uploadedFile}
          className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isDubbing ? 'កំពុងដំណើរការ...' : 'ដំណើរការបញ្ជូលសំឡេង AI'}</span>
        </button>

        {/* Progress Card */}
        {isDubbing && (
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-300">ដំណើរការ Dubbing</span>
              <span className="font-mono text-white">{dubbingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${dubbingProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 truncate">{dubbingMessage || 'កំពុងដំណើរការ...'}</p>
          </div>
        )}

        {/* Result Card */}
        {dubbingOutputVideo && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>បញ្ជូលសំឡេងរួចរាល់ 100%!</span>
            </div>
            <div className="flex gap-2 mt-1">
              <a
                href={dubbingOutputVideo}
                download
                className="flex-1 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-black font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយក MP4</span>
              </a>
              {dubbingOutputAudio && (
                <a
                  href={dubbingOutputAudio}
                  download
                  className="flex-1 py-1.5 rounded bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>ទាញយក MP3</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
