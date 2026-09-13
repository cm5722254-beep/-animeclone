import React from 'react';
import {
  PlusCircle, Film, Video, Users, Zap, HardDrive, RefreshCw, Trash2,
  Sparkles, ArrowRight, TrendingUp, Activity, Clock, Subtitles, Wand2, Download,
} from 'lucide-react';
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

interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  subLabel?: string;
  accent: 'sky' | 'indigo' | 'emerald' | 'amber';
  glowColor?: string;
  animDelay?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon, value, label, subLabel, accent, glowColor, animDelay = '0ms',
}) => {
  const accentMap = {
    sky:     { bg: 'rgba(56,189,248,0.1)',  text: '#7dd3fc', border: 'rgba(56,189,248,0.18)', glow: '0 0 20px rgba(56,189,248,0.12)' },
    indigo:  { bg: 'rgba(99,102,241,0.1)',  text: '#a5b4fc', border: 'rgba(99,102,241,0.18)', glow: '0 0 20px rgba(99,102,241,0.12)' },
    emerald: { bg: 'rgba(52,211,153,0.1)',  text: '#6ee7b7', border: 'rgba(52,211,153,0.18)', glow: '0 0 20px rgba(52,211,153,0.12)' },
    amber:   { bg: 'rgba(251,191,36,0.1)',  text: '#fcd34d', border: 'rgba(251,191,36,0.18)', glow: '0 0 20px rgba(251,191,36,0.12)' },
  };
  const a = accentMap[accent];

  return (
    <div
      className="metric-card p-4 flex items-center gap-3.5 animate-fade-up"
      style={{ animationDelay: animDelay }}
    >
      {/* Accent corner */}
      <div
        className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at top right, ${a.text}20 0%, transparent 70%)`,
        }}
      />

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative"
        style={{ background: a.bg, border: `1px solid ${a.border}`, boxShadow: a.glow }}
      >
        <div style={{ color: a.text }}>{icon}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-lg font-bold text-white leading-tight font-mono">{value}</div>
        <div className="text-[11px] text-slate-400 font-medium">{label}</div>
        {subLabel && (
          <div className="text-[10px] mt-0.5" style={{ color: a.text }}>{subLabel}</div>
        )}
      </div>
    </div>
  );
};

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
    <div className="flex-1 overflow-y-auto p-5 md:p-7 flex flex-col gap-5 bg-[#04060a]">

      {/* ── Hero Banner ── */}
      <div className="hero-banner p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-fade-up">
        {/* BG grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

        {/* Left: Branding */}
        <div className="flex items-center gap-4 md:gap-5 relative z-10">
          <div className="relative group shrink-0">
            <div
              className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 55%, #a855f7 100%)',
                boxShadow: '0 0 30px rgba(56,189,248,0.5), 0 0 60px rgba(99,102,241,0.25)',
                border: '1.5px solid rgba(56,189,248,0.45)',
              }}
            >
              <img
                src="/logo.png"
                alt="DABBER PRO"
                className="w-full h-full object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-300"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <Sparkles className="w-8 h-8 text-white absolute opacity-60" />
            </div>
            {/* Online indicator */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#04060a] flex items-center justify-center"
              style={{ background: '#34d399', boxShadow: '0 0 10px #34d399' }}
            />
          </div>

          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                អាទិទេព DABBER PRO
              </h2>
              <span
                className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-black"
                style={{
                  background: 'linear-gradient(135deg, #fcd34d, #f59e0b, #f97316)',
                  boxShadow: '0 2px 12px rgba(245,158,11,0.4)',
                }}
              >
                v3 PRO CINEMA
              </span>
            </div>
            <p className="text-xs md:text-[13px] text-slate-300 leading-relaxed">
              ស្ទូឌីយោបញ្ជូលសំឡេង AI ភាសាខ្មែរ 48kHz Hi-Fi
              <span className="mx-1 text-sky-500">·</span>
              VoxCPM2 + ElevenLabs
              <span className="mx-1 text-sky-500">·</span>
              3D Text Effects
            </p>
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-2.5 relative z-10 shrink-0 flex-wrap">
          <button
            onClick={onNewProject}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs"
          >
            <PlusCircle className="w-4 h-4 relative z-10" />
            <span className="relative z-10">+ បង្កើតគម្រោងថ្មី</span>
          </button>
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all group"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.3)';
              (e.currentTarget as HTMLElement).style.color = '#7dd3fc';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLElement).style.color = '#cbd5e1';
            }}
          >
            <Film className="w-4 h-4 text-sky-400" />
            <span>ចូលស្ទូឌីយោ</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        <MetricCard
          icon={<Video className="w-5 h-5" />}
          value={`${(files || []).length}`}
          label="វីដេអូបានផ្ទុក"
          subLabel="គម្រោង"
          accent="sky"
          animDelay="0ms"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          value={`${totalVoices || 0}`}
          label="តួអង្គក្នុងស្ទូឌីយោ"
          subLabel="AI Voices"
          accent="indigo"
          animDelay="55ms"
        />
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          value={voxStatus?.online ? 'Online' : 'Offline'}
          label="VoxCPM2 GPU Engine"
          subLabel={voxStatus?.online ? '✓ Connected' : '✗ Disconnected'}
          accent={voxStatus?.online ? 'emerald' : 'amber'}
          animDelay="110ms"
        />
        <MetricCard
          icon={<HardDrive className="w-5 h-5" />}
          value={diskStats?.formattedSize || '0 MB'}
          label="ទំហំឯកសារ Output"
          subLabel={diskStats ? `${diskStats.count} files` : '—'}
          accent="amber"
          animDelay="165ms"
        />
      </div>

      {/* ── Quick-Start Cinema Workflow (ងាយស្រួល ៣ ជំហាន) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fade-up" style={{ animationDelay: '190ms' }}>
        {/* Step 1 */}
        <div
          onClick={onOpenStudio}
          className="glass-card p-4 rounded-2xl flex flex-col justify-between gap-3 group cursor-pointer hover:border-sky-500/40 hover:shadow-[0_4px_24px_rgba(56,189,248,0.15)] transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              ជំហាន ១
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
              ស្កេនវីដេអូ & Subtitle AI
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              ទាញយកសំឡេងសន្ទនា និងបកប្រែជាភាសាខ្មែរនិយាយរលូនដោយស្វ័យប្រវត្តិ
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-sky-400 pt-1">
            <span>ចូលស្កេនវីដេអូ</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Step 2 */}
        <div
          onClick={onOpenStudio}
          className="glass-card p-4 rounded-2xl flex flex-col justify-between gap-3 group cursor-pointer hover:border-indigo-500/40 hover:shadow-[0_4px_24px_rgba(99,102,241,0.15)] transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ជំហាន ២
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              ចាត់ចែងសំឡេងតួអង្គខ្មែរ
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              បែងចែកតួប្រុស [M] និងតួស្រី [F] ដោយស្វ័យប្រវត្តិ ១ តួ = ១ សំឡេង គ្មានជាន់គ្នា
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-indigo-400 pt-1">
            <span>រៀបចំតួអង្គ</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Step 3 */}
        <div
          onClick={onOpenStudio}
          className="glass-card p-4 rounded-2xl flex flex-col justify-between gap-3 group cursor-pointer hover:border-amber-500/40 hover:shadow-[0_4px_24px_rgba(245,158,11,0.15)] transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Wand2 className="w-5 h-5" />
            </div>
            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ជំហាន ៣
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              បញ្ចូលសំឡេង & នាំចេញ
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              បញ្ចូលសំឡេង 48kHz Hi-Fi ស្វ័យប្រវត្តិ និងទាញយកវីដេអូ ឬឯកសារ SRT ភ្លាមៗ
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-amber-400 pt-1">
            <span>ចាប់ផ្តើម Dubbing</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>


      {/* ── Recent Projects ── */}
      <div className="animate-fade-up" style={{ animationDelay: '220ms' }}>
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{
                background: 'rgba(56,189,248,0.12)',
                border: '1px solid rgba(56,189,248,0.25)',
              }}
            >
              <Film className="w-3 h-3 text-sky-400" />
            </div>
            <span>គម្រោងកាត់តថ្មីៗ</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
              style={{
                background: 'rgba(56,189,248,0.1)',
                color: '#7dd3fc',
                border: '1px solid rgba(56,189,248,0.2)',
              }}
            >
              {(files || []).length}
            </span>
          </h3>

          <div className="flex items-center gap-2">
            {(files || []).length > 0 && onClearAllProjects && (
              <button
                onClick={onClearAllProjects}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-danger"
                title="លុបគម្រោងទាំងអស់"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs btn-ghost"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ផ្ទុកឡើងវិញ</span>
            </button>
          </div>
        </div>

        {/* Project grid */}
        {(files || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 stagger-children">
            {(files || []).map((file, i) => (
              <div
                key={file.filename}
                onClick={() => onSelectProject(file)}
                className="glass-card rounded-xl overflow-hidden cursor-pointer group relative animate-fade-up"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                {/* Delete */}
                {onDeleteProject && (
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteProject(file); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-rose-600"
                    style={{
                      background: 'rgba(0,0,0,0.75)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94a3b8',
                    }}
                    title="លុបគម្រោង"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#080b14] flex items-center justify-center overflow-hidden">
                  {/* Decorative gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, transparent 100%)',
                    }}
                  />
                  <Film
                    className="w-9 h-9 transition-all group-hover:scale-110"
                    style={{ color: 'rgba(56,189,248,0.3)' }}
                  />
                  <span
                    className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md font-mono text-[10px] text-white"
                    style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  {/* "Ready" badge top-left */}
                  <span
                    className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                    style={{
                      background: 'rgba(52,211,153,0.15)',
                      border: '1px solid rgba(52,211,153,0.25)',
                      color: '#6ee7b7',
                    }}
                  >
                    ✓ READY
                  </span>
                </div>

                {/* Card info */}
                <div className="p-3 flex flex-col gap-1">
                  <div className="text-xs font-semibold text-slate-100 truncate" title={file.originalName || file.filename}>
                    {file.originalName || file.filename}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        background: 'rgba(56,189,248,0.08)',
                        color: '#7dd3fc',
                        border: '1px solid rgba(56,189,248,0.15)',
                      }}
                    >
                      ចិន → ខ្មែរ
                    </span>
                    <Activity className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div
            className="rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-dashed animate-scale-in"
            style={{
              background: 'rgba(10,14,26,0.55)',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
              style={{
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.14)',
              }}
            >
              <Film className="w-8 h-8" style={{ color: 'rgba(56,189,248,0.5)' }} />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">
              មិនទាន់មានគម្រោង Dubbing
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
              ចាប់ផ្តើមបញ្ចូលវីដេអូ ឬរឿង Donghua ដើម្បីឱ្យ AI វិភាគតួអង្គ បកប្រែ
              និងបញ្ជូលសំឡេងខ្មែរស្វ័យប្រវត្តិ។
            </p>
            <button
              onClick={onNewProject}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs"
            >
              <PlusCircle className="w-4 h-4 relative z-10" />
              <span className="relative z-10">+ បញ្ចូលវីដេអូរឿងដំបូង</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
