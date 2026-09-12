import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { DubbingStudio } from './components/studio/DubbingStudio';
import { CharacterLibrary } from './components/characters/CharacterLibrary';
import { TranslationDesk } from './components/translation/TranslationDesk';
import { AudioMixerConsole } from './components/mixer/AudioMixerConsole';
import { SubtitleStudio } from './components/subtitles/SubtitleStudio';
import { VoiceTunerLab } from './components/tuner/VoiceTunerLab';
import { ThumbnailGenerator } from './components/thumbnail/ThumbnailGenerator';
import { VideoDownloaderModal } from './components/downloader/VideoDownloaderModal';
import { ToastContainer, ToastMessage } from './components/ui/Toast';

import { AuthModal } from './components/modals/AuthModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ExportModal } from './components/modals/ExportModal';
import { QuickVoxcpmModal } from './components/modals/QuickVoxcpmModal';
import { AdminUsersModal } from './components/modals/AdminUsersModal';
import { AddVoiceModal } from './components/modals/AddVoiceModal';
import { EditVoiceModal } from './components/modals/EditVoiceModal';
import { VoiceAuditionModal } from './components/modals/VoiceAuditionModal';

import { api } from './services/api';
import { User, CharacterVoice, TimelineSegment, ProjectFile, StudioConfig, VoxcpmStatus, TabId, VideoEffects, SubtitleStyle } from './types';
import { Mic, Volume2 } from 'lucide-react';

const DEFAULT_PRESET_TIMELINE_SEGMENTS: TimelineSegment[] = [
  { line_index: 0, start_time: 1.2, end_time: 4.8, speaker_name: "Xiao Yan (តួឯកប្រុស)", gender: "male", speaker_role: "male_lead", voiceId: "voxcpm:vp_character_20_female.mp3", chinese_text: "你好，欢迎来到这里。", khmer_translation: "សួស្តី សូមស្វាគមន៍មកកាន់ទីនេះ!", status: "ready" },
  { line_index: 1, start_time: 5.5, end_time: 9.0, speaker_name: "Yun Yun (តួឯកស្រី)", gender: "female", speaker_role: "female_lead", voiceId: "voxcpm:vp_character_1_female.mp3", chinese_text: "今天的天气真好，我们走吧。", khmer_translation: "អាកាសធាតុថ្ងៃនេះពិតជាល្អណាស់ តោះពួកយើងចេញដំណើរទៅ។", status: "ready" },
  { line_index: 2, start_time: 10.2, end_time: 14.5, speaker_name: "Elder Gu (ព្រឹទ្ធាចារ្យ)", gender: "male", speaker_role: "elder", voiceId: "voxcpm:vp_character_19_male.mp3", chinese_text: "大家一定要小心前方的危险！", khmer_translation: "អ្នកទាំងអស់គ្នាត្រូវតែប្រុងប្រយ័ត្ននឹងគ្រោះថ្នាក់នៅខាងមុខ!", status: "ready" }
];

export const App: React.FC = () => {
  // Navigation & Shell
  const [activeTab, setActiveTab] = useState<TabId>('tab-dubbing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User & Auth
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Config & Status
  const [config, setConfig] = useState<StudioConfig | null>(null);
  const [voxStatus, setVoxStatus] = useState<VoxcpmStatus | null>(null);
  const [engineMode, setEngineMode] = useState('local');

  // Media & Dubbing
  const [uploadedFile, setUploadedFile] = useState<ProjectFile | null>(null);
  const [recentFiles, setRecentFiles] = useState<ProjectFile[]>([]);
  const [voiceMode, setVoiceMode] = useState('voxcpm-voice-actor');
  const [maleLeadVoice, setMaleLeadVoice] = useState('hang_phleung_char_2_male.mp3');
  const [femaleLeadVoice, setFemaleLeadVoice] = useState('hang_phleung_char_6_female.mp3');
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash');

  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbingProgress, setDubbingProgress] = useState(0);
  const [dubbingMessage, setDubbingMessage] = useState('');
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  const [outputAudio, setOutputAudio] = useState<string | null>(null);
  const [cleanBgmUrl, setCleanBgmUrl] = useState<string | null>(null);

  // Video Reference for Frame Grabbing
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailCapturedFrame, setThumbnailCapturedFrame] = useState<string | null>(null);

  // Video Effects & Subtitle Styling
  const [videoEffects, setVideoEffects] = useState<VideoEffects>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    blur: 0,
    aspectRatio: '16:9',
    lutPreset: 'none',
  });

  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 20,
    fontFamily: 'Kantumruy Pro',
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.65)',
    position: 'bottom',
    animation: 'none',
  });

  // Timeline & Segments
  const [segments, setSegments] = useState<TimelineSegment[]>(DEFAULT_PRESET_TIMELINE_SEGMENTS);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const [isScanningTimeline, setIsScanningTimeline] = useState(false);

  // Characters
  const [characters, setCharacters] = useState<CharacterVoice[]>([]);
  const [selectedCharForEdit, setSelectedCharForEdit] = useState<CharacterVoice | null>(null);
  const [selectedCharForAudition, setSelectedCharForAudition] = useState<CharacterVoice | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isVoxModalOpen, setIsVoxModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAddVoiceOpen, setIsAddVoiceOpen] = useState(false);
  const [isDownloaderOpen, setIsDownloaderOpen] = useState(false);
  const [diskStats, setDiskStats] = useState<{ formattedSize: string; count: number } | null>(null);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch
  useEffect(() => {
    // 1. Auth Check
    api
      .getMe()
      .then((res) => {
        if (res.user) setUser(res.user);
        else setIsAuthModalOpen(true);
      })
      .catch(() => setIsAuthModalOpen(true));

    // 2. Config & Status
    loadConfigAndStatus();

    // 3. Characters
    loadCharacters();

    // 4. File Library
    loadFiles();

    // 5. Disk Stats
    api.getOutputStats().then(setDiskStats).catch(() => {});
  }, []);

  const loadConfigAndStatus = async () => {
    try {
      const cfg = await api.getConfig();
      setConfig(cfg);
      setEngineMode(cfg.mode || 'local');
      if (cfg.geminiModel) setGeminiModel(cfg.geminiModel);
    } catch (_) {}

    try {
      const st = await api.getVoxcpmStatus();
      setVoxStatus(st);
    } catch (_) {}
  };

  const loadCharacters = async () => {
    try {
      const res = await api.getCharacters();
      if (res.characters) {
        setCharacters(res.characters);
      }
    } catch (_) {}
  };

  const loadFiles = async () => {
    try {
      const files = await api.getFiles();
      setRecentFiles(files);
      if (!uploadedFile && files.length > 0) {
        const video = files.find((f) => f.type === 'video');
        if (video) setUploadedFile(video);
      }
    } catch (_) {}
  };

  const handleUploadFile = async (file: File) => {
    showToast(`កំពុង Upload ឯកសារ "${file.name}"...`, 'info');
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.file) {
        setUploadedFile(res.file);
        setRecentFiles((prev) => [res.file, ...prev]);
        showToast('បាន Upload វីដេអូជោគជ័យ!', 'success');
      }
    } catch (err: any) {
      showToast(`បរាជ័យក្នុងការ Upload: ${err.message}`, 'error');
    }
  };

  const handleStartDubbing = async () => {
    if (!uploadedFile) {
      showToast('សូមបញ្ចូលវីដេអូជាមុនសិន!', 'warning');
      return;
    }

    setIsDubbing(true);
    setDubbingProgress(5);
    setDubbingMessage('កំពុងចាប់ផ្តើម AI Video Dubbing Pipeline...');

    try {
      const res = await api.startDubbing({
        filename: uploadedFile.filename,
        sourceLang: 'zh',
        targetLang: 'km',
        voiceId: voiceMode,
        maleLeadVoice,
        femaleLeadVoice,
        geminiModel,
      });

      if (res.jobId) {
        pollDubbingJob(res.jobId);
      }
    } catch (err: any) {
      setIsDubbing(false);
      showToast(`បរាជ័យក្នុងការ Dubbing: ${err.message}`, 'error');
    }
  };

  const pollDubbingJob = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const job = await api.getDubbingStatus(jobId);
        setDubbingProgress(job.progress || 0);
        setDubbingMessage(job.message || 'កំពុងដំណើរការ...');

        if (job.status === 'completed') {
          clearInterval(interval);
          setIsDubbing(false);
          setOutputVideo(job.outputVideo || null);
          setOutputAudio(job.outputAudio || null);
          if (job.dialogueSegments && job.dialogueSegments.length > 0) {
            setSegments(job.dialogueSegments);
          }
          showToast('ការបញ្ជូលសំឡេងជោគជ័យ 100%!', 'success');
          loadFiles();
        } else if (job.status === 'failed') {
          clearInterval(interval);
          setIsDubbing(false);
          showToast(`បរាជ័យ: ${job.error || 'កំហុសបច្ចេកទេស'}`, 'error');
        }
      } catch (_) {}
    }, 1500);
  };

  const handleScanTimeline = async () => {
    if (!uploadedFile) {
      showToast('សូមបញ្ចូល ឬ Upload វីដេអូក្នុង Studio ជាមុនសិន!', 'warning');
      return;
    }

    setIsScanningTimeline(true);
    showToast('AI Gemini កំពុងស្កេន និងស្រង់ឃ្លាសន្ទនារឿង...', 'info');
    try {
      // 180s scope for fast, responsive dialogue extraction without hitting Gemini backoffs
      const res = await api.scanTimeline(uploadedFile.filename, '180');
      if (res.success && res.segments && res.segments.length > 0) {
        setSegments(res.segments);
        showToast(`ស្កេនជោគជ័យ! រកឃើញ ${res.segments.length} ឃ្លាសន្ទនាក្នុងរឿង`, 'success');
      } else {
        showToast('មិនឃើញឃ្លាសន្ទនាក្នុងឈុតនេះឡើយ!', 'info');
      }
    } catch (e: any) {
      showToast(`កំហុសក្នុងការស្កេន: ${e.message}`, 'error');
    } finally {
      setIsScanningTimeline(false);
    }
  };

  const handleAssemble = async () => {
    if (!uploadedFile) {
      showToast('សូមបញ្ចូលវីដេអូជាមុនសិន!', 'warning');
      return;
    }
    showToast('កំពុងប្រមូលផ្តុំកាត់តសំឡេងខ្មែរ និងលុបសំឡេងចិនដើម...', 'info');
    try {
      const res = await api.assembleCustom({
        filename: uploadedFile.filename,
        segments,
        bgmAudio: cleanBgmUrl || undefined,
        removeOriginalVocals: true, // Auto strips original Chinese vocals!
      });
      if (res.success) {
        setOutputVideo(res.outputVideo);
        showToast('កាត់តវីដេអូសម្រេចបានជោគជ័យ គ្មានសំឡេងចិនលាយឡំ!', 'success');
      }
    } catch (e: any) {
      showToast(`កំហុស: ${e.message}`, 'error');
    }
  };

  const handleDeleteProject = async (file: ProjectFile) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបគម្រោង "${file.originalName || file.filename}" ចោលមែនទេ?`)) {
      return;
    }
    showToast(`កំពុងលុបគម្រោង "${file.filename}"...`, 'info');
    try {
      const res = await api.deleteFile(file.filename);
      if (res.success) {
        setRecentFiles((prev) => prev.filter((f) => f.filename !== file.filename));
        if (uploadedFile?.filename === file.filename) {
          setUploadedFile(null);
        }
        showToast(res.message || 'បានលុបគម្រោងដោយជោគជ័យ!', 'success');
        api.getOutputStats().then(setDiskStats).catch(() => {});
      }
    } catch (err: any) {
      showToast(`កំហុសក្នុងការលុប: ${err.message}`, 'error');
    }
  };

  const handleClearAllProjects = async () => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបគម្រោងទាំងអស់ (${recentFiles.length} គម្រោង) ចោលមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ!`)) {
      return;
    }
    showToast('កំពុងលុបគម្រោងទាំងអស់...', 'info');
    try {
      const res = await api.clearAllFiles();
      if (res.success) {
        setRecentFiles([]);
        setUploadedFile(null);
        showToast(res.message || 'បានលុបគម្រោងទាំងអស់ដោយជោគជ័យ!', 'success');
        api.getOutputStats().then(setDiskStats).catch(() => {});
      }
    } catch (err: any) {
      showToast(`កំហុសក្នុងការលុប: ${err.message}`, 'error');
    }
  };

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem('studio_auth_token');
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const handleOpenThumbnailStudio = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      try {
        const v = videoRef.current;
        const c = document.createElement('canvas');
        c.width = v.videoWidth || 1280;
        c.height = v.videoHeight || 720;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(v, 0, 0, c.width, c.height);
          const data = c.toDataURL('image/jpeg', 0.95);
          setThumbnailCapturedFrame(data);
        }
      } catch (e) {
        console.warn('Frame grab error:', e);
      }
    }
    setActiveTab('tab-thumbnail');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 font-khmer">
      {/* Header Bar */}
      <Header
        activeProjectTitle={uploadedFile?.originalName || uploadedFile?.filename || ''}
        isSaving={false}
        engineMode={engineMode}
        onSwitchEngine={async (m) => {
          setEngineMode(m);
          await api.switchMode(m).catch(() => {});
          loadConfigAndStatus();
        }}
        voxStatus={voxStatus}
        onOpenVoxModal={() => setIsVoxModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDownloader={() => setIsDownloaderOpen(true)}
        onOpenThumbnailStudio={handleOpenThumbnailStudio}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Studio Views */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#05070c]">
          {activeTab === 'tab-dashboard' && (
            <DashboardView
              files={recentFiles}
              totalVoices={characters.length}
              voxStatus={voxStatus}
              diskStats={diskStats}
              onNewProject={() => {
                setUploadedFile(null);
                setActiveTab('tab-dubbing');
              }}
              onOpenStudio={() => setActiveTab('tab-dubbing')}
              onSelectProject={(f) => {
                setUploadedFile(f);
                setActiveTab('tab-dubbing');
              }}
              onRefresh={loadFiles}
              onDeleteProject={handleDeleteProject}
              onClearAllProjects={handleClearAllProjects}
            />
          )}

          {/* Persistent Dubbing Studio so Video DOM is never destroyed when switching tabs */}
          <div className={activeTab === 'tab-dubbing' ? 'flex-1 flex flex-col h-full overflow-hidden' : 'hidden'}>
            <DubbingStudio
              uploadedFile={uploadedFile}
              onUploadFile={handleUploadFile}
              onRemoveFile={() => setUploadedFile(null)}
              voiceMode={voiceMode}
              onVoiceModeChange={setVoiceMode}
              maleLeadVoice={maleLeadVoice}
              onMaleLeadChange={setMaleLeadVoice}
              femaleLeadVoice={femaleLeadVoice}
              onFemaleLeadChange={setFemaleLeadVoice}
              geminiModel={geminiModel}
              onGeminiModelChange={setGeminiModel}
              isDubbing={isDubbing}
              dubbingProgress={dubbingProgress}
              dubbingMessage={dubbingMessage}
              dubbingOutputVideo={outputVideo}
              dubbingOutputAudio={outputAudio}
              onStartDubbing={handleStartDubbing}
              onPreviewVoice={(filename) => {
                const a = new Audio(`/media/samples/${filename}`);
                a.play().catch(() => {});
              }}
              segments={segments}
              selectedSegmentIndex={selectedSegmentIndex}
              onSelectSegment={setSelectedSegmentIndex}
              onScanTimeline={handleScanTimeline}
              isScanningTimeline={isScanningTimeline}
              onAssemble={handleAssemble}
              videoEffects={videoEffects}
              onChangeEffects={setVideoEffects}
              subtitleStyle={subtitleStyle}
              onChangeSubtitleStyle={setSubtitleStyle}
              videoRef={videoRef}
              onOpenThumbnailStudio={handleOpenThumbnailStudio}
              onShowToast={showToast}
            />
          </div>

          {activeTab === 'tab-manual' && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="bg-[#111827] border border-white/[0.08] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">បន្ទប់កាត់តសំឡេងលម្អិត (Timeline Dialogue Editor)</h3>
                  <p className="text-xs text-slate-400">ស្កេន និងប្តូរសំឡេងតួអង្គនីមួយៗក្នុងរឿង បញ្ចូលសំឡេងផ្ទាល់ ឬបង្កើតសំឡេង AI</p>
                </div>
                <button
                  onClick={handleScanTimeline}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs"
                >
                  ស្កេនឃ្លាសន្ទនាទាំងអស់
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="bg-[#111827] border border-white/[0.08] rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400">
                        #{idx + 1}
                      </span>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <select
                            value={seg.voiceId || ''}
                            onChange={(e) => {
                              const vId = e.target.value;
                              const matched = characters.find((c) => c.id === vId);
                              setSegments((prev) => {
                                const copy = [...prev];
                                copy[idx] = {
                                  ...copy[idx],
                                  voiceId: vId,
                                  speaker_name: matched ? matched.label : copy[idx].speaker_name,
                                  gender: matched ? matched.gender : copy[idx].gender,
                                };
                                return copy;
                              });
                            }}
                            className="bg-[#07090e] border border-white/[0.1] rounded px-2 py-1 text-xs text-sky-300 font-semibold"
                          >
                            <option value="">ជ្រើសរើសសំឡេងតួអង្គ...</option>
                            {characters.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label} ({c.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                              </option>
                            ))}
                          </select>
                          <span className="text-xs text-slate-400 font-mono">
                            {seg.start_time.toFixed(1)}s - {seg.end_time.toFixed(1)}s
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-white">
                          "{seg.khmer_translation || ''}"
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {seg.chinese_text}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          showToast(`កំពុងបង្កើតសំឡេងឃ្លាទី #${idx + 1}...`, 'info');
                          try {
                            const r = await api.generateLine({
                              text: seg.khmer_translation || seg.chinese_text || 'បាទ',
                              lineIndex: idx,
                              gender: seg.gender || 'male',
                              voiceId: seg.voiceId || 'voxcpm-voice-actor',
                              speakerId: seg.speaker_role,
                            });
                            if (r.success) {
                              setSegments((prev) => {
                                const copy = [...prev];
                                copy[idx] = { ...copy[idx], audioUrl: r.audioUrl, status: 'ready' };
                                return copy;
                              });
                              showToast(`សំឡេងឃ្លាទី #${idx + 1} រួចរាល់!`, 'success');
                              new Audio(r.audioUrl).play();
                            }
                          } catch (e: any) {
                            showToast(`កំហុស: ${e.message}`, 'error');
                          }
                        }}
                        className="px-3 py-1.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium flex items-center gap-1.5"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>បង្កើតសំឡេង AI</span>
                      </button>

                      {seg.audioUrl && (
                        <button
                          onClick={() => seg.audioUrl && new Audio(seg.audioUrl).play()}
                          className="p-1.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-amber-300"
                          title="ស្ដាប់សំឡេង"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tab-character' && (
            <CharacterLibrary
              characters={characters}
              onOpenAddModal={() => setIsAddVoiceOpen(true)}
              onOpenEditModal={(c) => setSelectedCharForEdit(c)}
              onOpenAuditionModal={(c) => setSelectedCharForAudition(c)}
            />
          )}

          {activeTab === 'tab-translator' && <TranslationDesk onShowToast={showToast} />}

          {activeTab === 'tab-mixer' && (
            <AudioMixerConsole
              uploadedFilename={uploadedFile?.filename}
              onShowToast={showToast}
              onBgmReady={(bgm) => {
                setCleanBgmUrl(bgm);
                showToast('បានភ្ជាប់បទភ្លេង BGM ស្អាតចូលទៅក្នុង Timeline Master!', 'success');
              }}
            />
          )}

          {activeTab === 'tab-subtitles' && (
            <SubtitleStudio
              segments={segments}
              characters={characters}
              onUpdateSegment={(idx, updated) => {
                setSegments((prev) => {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], ...updated };
                  return copy;
                });
              }}
              onOpenExportModal={() => setIsExportOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-thumbnail' && (
            <ThumbnailGenerator
              currentProject={uploadedFile}
              videoRef={videoRef}
              initialCapturedImage={thumbnailCapturedFrame}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tab-tuner' && <VoiceTunerLab onShowToast={showToast} />}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={(u) => {
          setUser(u);
          setIsAuthModalOpen(false);
          loadCharacters();
        }}
        onShowToast={showToast}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowToast={showToast}
        onRefreshConfig={loadConfigAndStatus}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onShowToast={showToast}
        defaultTitle={uploadedFile?.originalName || 'khmer_dubbed_movie'}
        videoUrl={outputVideo || uploadedFile?.url || null}
        audioUrl={outputAudio || null}
      />

      <QuickVoxcpmModal
        isOpen={isVoxModalOpen}
        currentStatus={voxStatus}
        cloudUrl={config?.cloudUrl || config?.voxcpmUrl || ''}
        onClose={() => setIsVoxModalOpen(false)}
        onSaved={loadConfigAndStatus}
        onShowToast={showToast}
      />

      <AdminUsersModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onShowToast={showToast}
      />

      <AddVoiceModal
        isOpen={isAddVoiceOpen}
        onClose={() => setIsAddVoiceOpen(false)}
        onSuccess={loadCharacters}
        onShowToast={showToast}
      />

      <EditVoiceModal
        isOpen={!!selectedCharForEdit}
        character={selectedCharForEdit}
        onClose={() => setSelectedCharForEdit(null)}
        onSuccess={loadCharacters}
        onShowToast={showToast}
      />

      <VoiceAuditionModal
        isOpen={!!selectedCharForAudition}
        character={selectedCharForAudition}
        onClose={() => setSelectedCharForAudition(null)}
        onShowToast={showToast}
      />

      {/* Video Downloader Modal (YouTube, TikTok, Facebook) */}
      <VideoDownloaderModal
        isOpen={isDownloaderOpen}
        onClose={() => setIsDownloaderOpen(false)}
        onVideoDownloaded={(file) => {
          setUploadedFile(file);
          setRecentFiles((prev) => [file, ...prev.filter((f) => f.filename !== file.filename)]);
          setActiveTab('tab-dubbing');
          showToast(`បានទាញយក និងផ្ទុកវីដេអូ ${file.originalName} ចូលស្ទូឌីយោ!`, 'success');
        }}
        onShowToast={showToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
