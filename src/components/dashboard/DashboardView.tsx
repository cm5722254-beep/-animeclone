import React from 'react';
import { PlusCircle, Film, Video, Users, Zap, HardDrive, RefreshCw, Trash2 } from 'lucide-react';
import { ProjectFile, VoxcpmStatus } from '../../types';

interface DashboardProps {
  files?: ProjectFile[];
  totalVoices?: number;
  voxStatus: VoxcpmStatus | null;
  diskStats: { formattedSize: string; count: number } | null;
  onNewProject: () => void;
  onOpenStudio: () => void;
  onSelectProject: (file: ProjectFile) => void;
  onRefresh: () => void;
  onDeleteProject?: (file: ProjectFile) => void;
  onClearAllProjects?: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  files = [],
  totalVoices = 0,
  voxStatus,
  diskStats,
  onNewProject,
  onOpenStudio,
  onSelectProject,
  onRefresh,
  onDeleteProject,
  onClearAllProjects,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
      {/* Hero Banner */}
      <div className="relative rounded-xl p-6 md:p-7 bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/30 border border-sky-500/20 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 font-ui">
            ស្វាគមន៍មកកាន់ CHEATZ DABBER PRO v3
          </h2>
          <p className="text-xs md:text-sm text-slate-300">
            ប្រព័ន្ធស្ទូឌីយោបញ្ជូលសំឡេង និងក្លូនសំឡេងតួអង្គ Donghua មកជាភាសាខ្មែរភាពយន្ត 48kHz Hi-Fi
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ បង្កើតគម្រោងថ្មី</span>
          </button>
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-slate-200 font-semibold text-xs transition-all"
          >
            <Film className="w-4 h-4 text-sky-400" />
            <span>បើក Studio</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-[#111827] border border-white/[0.08] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-white font-ui">{(files || []).length} គម្រោង</div>
            <div className="text-[11px] text-slate-400">វីដេអូបានផ្ទុក</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-white/[0.08] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-white font-ui">{totalVoices || 0} សំឡេង</div>
            <div className="text-[11px] text-slate-400">តួអង្គក្នុងស្ទូឌីយោ</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-white/[0.08] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-base font-bold font-ui ${voxStatus?.online ? 'text-emerald-400' : 'text-rose-400'}`}>
              {voxStatus?.online ? 'Online' : 'Offline'}
            </div>
            <div className="text-[11px] text-slate-400">VoxCPM2 GPU Engine</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-white/[0.08] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-white font-ui">{diskStats?.formattedSize || '0 MB'}</div>
            <div className="text-[11px] text-slate-400">ទំហំឯកសារ Output</div>
          </div>
        </div>
      </div>

      {/* Recent Media Projects Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-sky-400" />
            <span>គម្រោងកាត់តថ្មីៗ (Recent Media Projects)</span>
            <span className="text-xs text-slate-400 font-mono">({(files || []).length})</span>
          </h3>
          <div className="flex items-center gap-2">
            {(files || []).length > 0 && onClearAllProjects && (
              <button
                onClick={onClearAllProjects}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-colors font-medium shadow-sm"
                title="លុបគម្រោងទាំងអស់ចោលដើម្បីសន្សំទំហំ Disk"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>លុបគម្រោងទាំងអស់ (Clear All)</span>
              </button>
            )}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ផ្ទុកឡើងវិញ</span>
            </button>
          </div>
        </div>

        {(files || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(files || []).map((file) => (
              <div
                key={file.filename}
                onClick={() => onSelectProject(file)}
                className="group bg-[#111827] border border-white/[0.08] hover:border-sky-500/40 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-sky-900/20 relative"
              >
                {/* Individual Card Delete Button */}
                {onDeleteProject && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(file);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-all shadow-md z-20 border border-white/[0.1] opacity-80 group-hover:opacity-100"
                    title="លុបគម្រោងនេះចោល"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <div className="text-slate-600 group-hover:text-sky-400 transition-colors">
                    <Film className="w-8 h-8" />
                  </div>
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-slate-100 truncate mb-1" title={file.originalName || file.filename}>
                    {file.originalName || file.filename}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>ចិន → ខ្មែរ</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-medium">
                      រួចរាល់
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#111827]/50 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] text-slate-400 flex items-center justify-center mb-3">
              <Film className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">មិនទាន់មានគម្រោង Dubbing នៅឡើយទេ</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              ចាប់ផ្តើមបញ្ចូលវីដេអូ ឬរឿង Donghua ដើម្បីឱ្យ AI វិភាគតួអង្គ បកប្រែ និងបញ្ជូលសំឡេងខ្មែរស្វ័យប្រវត្តិ។
            </p>
            <button
              onClick={onNewProject}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors"
            >
              + បញ្ចូលវីដេអូរឿងដំបូង
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
