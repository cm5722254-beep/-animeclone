// ==========================================================================
// CHEATZ DABBER PRO v3 — Professional AI Dubbing Studio
// Main Client Workstation Controller
// ==========================================================================

// Global Authenticated Fetch Interceptor & User State
let currentUser = null;
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  const token = localStorage.getItem('studio_auth_token');
  if (token && typeof url === 'string' && url.startsWith('/api/')) {
    options.headers = options.headers || {};
    if (options.headers instanceof Headers) {
      if (!options.headers.has('Authorization')) {
        options.headers.set('Authorization', `Bearer ${token}`);
      }
    } else if (Array.isArray(options.headers)) {
      options.headers.push(['Authorization', `Bearer ${token}`]);
    } else {
      if (!options.headers['Authorization']) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return originalFetch.call(this, url, options);
};

// Application State
let currentUploadedFile = null;
let currentDubbingJobId = null;
let pollInterval = null;
let originalMediaUrl = null;
let dubbedMediaUrl = null;
let extractedMovieCharacters = [];
let currentPreviewAudio = null;
let currentEngineMode = 'local';
let timelineSegments = [];
let activeSegmentIndex = -1;

// Default Presets for Timeline
const DEFAULT_PRESET_TIMELINE_SEGMENTS = [
  { line_index: 0, start_time: 1.2, end_time: 4.8, speaker_name: "Xiao Yan (តួឯកប្រុស)", gender: "male", speaker_role: "male_lead", chinese_text: "你好，欢迎来到这里。", khmer_translation: "សួស្តី សូមស្វាគមន៍មកកាន់ទីនេះ!", status: "ready" },
  { line_index: 1, start_time: 5.5, end_time: 9.0, speaker_name: "Yun Yun (តួឯកស្រី)", gender: "female", speaker_role: "female_lead", chinese_text: "今天的天气真好，我们走吧。", khmer_translation: "អាកាសធាតុថ្ងៃនេះពិតជាល្អណាស់ តោះពួកយើងចេញដំណើរទៅ។", status: "ready" },
  { line_index: 2, start_time: 10.2, end_time: 14.5, speaker_name: "Elder Gu (ព្រឹទ្ធាចារ្យ)", gender: "male", speaker_role: "elder", chinese_text: "大家一定要小心前方的危险！", khmer_translation: "អ្នកទាំងអស់គ្នាត្រូវតែប្រុងប្រយ័ត្ននឹងគ្រោះថ្នាក់នៅខាងមុខ!", status: "ready" }
];

// Helper: 100% Pure Khmer Sanitizer
function cleanPureKhmer(text) {
  if (!text) return '';
  return text
    .replace(/[\u0E00-\u0E7F]+/g, '') // Remove Thai
    .replace(/[\u4E00-\u9FFF]+/g, '') // Remove Chinese
    .replace(/[\u3040-\u30FF\u31F0-\u31FF\uAC00-\uD7AF]+/g, '') // Remove Japanese/Korean
    .replace(/\s+/g, ' ')
    .trim();
}

// Studio Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.log(`[${type}] ${message}`);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  let icon = 'info';
  if (type === 'success') icon = 'check-circle-2';
  else if (type === 'error') icon = 'alert-circle';
  else if (type === 'warning') icon = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Timecode Formatter (Seconds to HH:MM:SS)
function formatTimecode(seconds) {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
  initAuthAndRBAC();
  initNavigation();
  initConfig();
  initUpload();
  initDubbingActions();
  initVideoPlayerAndTransport();
  initMultiTrackTimeline();
  initDashboard();
  initCharacterLab();
  initTranslator();
  initAudioMixer();
  initSubtitleStudio();
  initPitchTuner();
  initSettingsModal();
  initQuickVoxcpmModal();
  initEngineModeSwitcher();
  initCapCutExportModal();

  // Load Initial Data
  loadDashboardData();
  loadAllCharacters();
  renderTimelineTracks(DEFAULT_PRESET_TIMELINE_SEGMENTS, 30);
});

// ==========================================================================
// 1. Navigation & App Shell
// ==========================================================================
function initNavigation() {
  const navButtons = document.querySelectorAll('.sidebar-nav-btn, .nav-tab');
  const viewPanes = document.querySelectorAll('.view-pane, .tab-content');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (!targetId) return;

      navButtons.forEach(b => b.classList.remove('active'));
      viewPanes.forEach(p => p.classList.remove('active'));

      // Highlight active buttons with matching data-tab
      document.querySelectorAll(`[data-tab="${targetId}"]`).forEach(b => b.classList.add('active'));

      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      if (targetId === 'tab-dashboard') {
        loadDashboardData();
      } else if (targetId === 'tab-character') {
        loadAllCharacters();
      }

      if (window.lucide) lucide.createIcons();
    });
  });

  // Sidebar Collapse Toggle
  const toggleBtn = document.getElementById('btnToggleSidebar');
  const studioBody = document.getElementById('studioBody');
  if (toggleBtn && studioBody) {
    toggleBtn.addEventListener('click', () => {
      studioBody.classList.toggle('sidebar-collapsed');
      const isCollapsed = studioBody.classList.contains('sidebar-collapsed');
      toggleBtn.querySelector('span').textContent = isCollapsed ? 'ពង្រីក' : 'បង្រួម Sidebar';
      if (window.lucide) lucide.createIcons();
    });
  }
}

// ==========================================================================
// 2. Config & Engine Switcher
// ==========================================================================
async function initConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();

    // Check VoxCPM Status
    checkVoxcpmStatus();

    const currentModel = data.geminiModel || 'gemini-3.5-flash';
    const settingModelEl = document.getElementById('settingGeminiModel');
    if (settingModelEl) settingModelEl.value = currentModel;

    const geminiSelect = document.getElementById('geminiModelSelect');
    if (geminiSelect) geminiSelect.value = currentModel;

    if (data.voxcpmUrl) {
      const voxInput = document.getElementById('settingVoxcpmUrl');
      if (voxInput) voxInput.value = data.voxcpmUrl;
      const quickInput = document.getElementById('quickVoxcpmUrlInput');
      if (quickInput) quickInput.value = data.voxcpmUrl;
    }

    // Network LAN Share Info
    try {
      const netRes = await fetch('/api/system/network-info');
      const netData = await netRes.json();
      const settingLanUrl = document.getElementById('settingLanUrl');
      if (settingLanUrl && netData.primaryLanUrl) {
        settingLanUrl.value = netData.primaryLanUrl;
      }
      const copyLanUrlBtn = document.getElementById('copyLanUrlBtn');
      if (copyLanUrlBtn && netData.primaryLanUrl) {
        copyLanUrlBtn.onclick = () => {
          navigator.clipboard.writeText(netData.primaryLanUrl);
          showToast(`បានចម្លង Link LAN: ${netData.primaryLanUrl}`, 'success');
        };
      }
    } catch (e) {
      console.warn('Network info error:', e);
    }

  } catch (err) {
    console.error('Config load failed:', err);
  }
}

async function checkVoxcpmStatus() {
  const badge = document.getElementById('voxcpmStatusBadge');
  const dot = document.getElementById('voxcpmStatusDot');
  const text = document.getElementById('voxcpmStatusText');
  const dashState = document.getElementById('dashEngineStateText');
  const alertBanner = document.getElementById('connectionAlertBanner');

  try {
    const res = await fetch('/api/voxcpm/status');
    const data = await res.json();

    if (data.online) {
      if (badge) badge.className = 'voxcpm-beacon';
      if (text) text.textContent = '⚡ GPU Online';
      if (dashState) { dashState.textContent = 'Online (GPU)'; dashState.style.color = '#34d399'; }
      if (alertBanner) alertBanner.classList.add('hidden');
    } else {
      if (badge) badge.className = 'voxcpm-beacon offline';
      if (text) text.textContent = '⚠️ GPU Offline';
      if (dashState) { dashState.textContent = 'Offline'; dashState.style.color = '#f87171'; }
      if (currentEngineMode !== 'pure_khmer' && alertBanner) {
        alertBanner.classList.remove('hidden');
      }
    }
  } catch (e) {
    if (badge) badge.className = 'voxcpm-beacon offline';
    if (text) text.textContent = '⚠️ GPU Disconnected';
  }
}

function initEngineModeSwitcher() {
  const buttons = document.querySelectorAll('.engine-pill-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const mode = btn.getAttribute('data-mode');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEngineMode = mode;

      try {
        const res = await fetch('/api/voxcpm/switch-mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        });
        const d = await res.json();
        if (d.success) {
          showToast(`បានប្ដូរទៅកាន់: ${mode}`, 'success');
          checkVoxcpmStatus();
        }
      } catch (e) {
        showToast('កំហុសក្នុងការប្ដូរ Engine', 'error');
      }
    });
  });
}

// ==========================================================================
// 3. Media Upload & Project Initialization
// ==========================================================================
function initUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('mediaFileInput');
  const previewCard = document.getElementById('filePreviewCard');
  const previewFileName = document.getElementById('previewFileName');
  const previewFileSize = document.getElementById('previewFileSize');
  const removeFileBtn = document.getElementById('removeFileBtn');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentUploadedFile = null;
      fileInput.value = '';
      previewCard.classList.add('hidden');
      dropZone.classList.remove('hidden');
      document.getElementById('activeProjectTitleDisplay').textContent = 'គម្រោងថ្មី (Untitled Project)';
    });
  }
}

async function handleFileSelected(file) {
  const previewCard = document.getElementById('filePreviewCard');
  const previewFileName = document.getElementById('previewFileName');
  const previewFileSize = document.getElementById('previewFileSize');
  const dropZone = document.getElementById('dropZone');

  showToast(`កំពុងបញ្ចូលឯកសារ: ${file.name}...`, 'info');

  const formData = new FormData();
  formData.append('mediaFile', file);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      currentUploadedFile = data.file || data;
      originalMediaUrl = data.url;

      if (previewFileName) previewFileName.textContent = file.name;
      if (previewFileSize) previewFileSize.textContent = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      if (previewCard) previewCard.classList.remove('hidden');
      if (dropZone) dropZone.classList.add('hidden');

      // Update Project Title
      const titleDisplay = document.getElementById('activeProjectTitleDisplay');
      if (titleDisplay) titleDisplay.textContent = file.name;

      // Load Video into Central Player
      const player = document.getElementById('mainVideoPlayer');
      if (player) {
        player.src = data.url;
        player.load();
      }

      const clipName = document.getElementById('timelineVideoClipName');
      if (clipName) clipName.textContent = file.name;

      showToast('បញ្ចូលវីដេអូបានជោគជ័យ!', 'success');
      loadDashboardData();
    } else {
      showToast('កំហុសក្នុងការបញ្ចូលឯកសារ', 'error');
    }
  } catch (err) {
    console.error('Upload failed:', err);
    showToast('កំហុស Server ក្នុងការបញ្ចូលឯកសារ', 'error');
  }
}

// ==========================================================================
// 4. Video Player & Transport Controls
// ==========================================================================
function initVideoPlayerAndTransport() {
  const player = document.getElementById('mainVideoPlayer');
  const btnPlay = document.getElementById('btnTogglePlay');
  const playIcon = document.getElementById('playIcon');
  const btnStepBack = document.getElementById('btnStepBack');
  const btnStepForward = document.getElementById('btnStepForward');
  const currentTimecode = document.getElementById('currentTimecode');
  const durationTimecode = document.getElementById('durationTimecode');
  const btnMute = document.getElementById('btnToggleMute');
  const muteIcon = document.getElementById('muteIcon');
  const btnFullscreen = document.getElementById('btnToggleFullscreen');
  const playbackRateSelect = document.getElementById('playbackRateSelect');

  if (!player) return;

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    });
  }

  player.addEventListener('play', () => {
    if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
    if (window.lucide) lucide.createIcons();
  });

  player.addEventListener('pause', () => {
    if (playIcon) playIcon.setAttribute('data-lucide', 'play');
    if (window.lucide) lucide.createIcons();
  });

  if (btnStepBack) {
    btnStepBack.addEventListener('click', () => {
      player.currentTime = Math.max(0, player.currentTime - 1);
    });
  }

  if (btnStepForward) {
    btnStepForward.addEventListener('click', () => {
      player.currentTime = Math.min(player.duration || 0, player.currentTime + 1);
    });
  }

  player.addEventListener('timeupdate', () => {
    if (currentTimecode) currentTimecode.textContent = formatTimecode(player.currentTime);
    if (durationTimecode && player.duration) durationTimecode.textContent = formatTimecode(player.duration);

    // Update Timeline Playhead
    updateTimelinePlayheadPosition(player.currentTime, player.duration || 1);
  });

  player.addEventListener('loadedmetadata', () => {
    if (durationTimecode) durationTimecode.textContent = formatTimecode(player.duration);
  });

  if (btnMute) {
    btnMute.addEventListener('click', () => {
      player.muted = !player.muted;
      if (muteIcon) {
        muteIcon.setAttribute('data-lucide', player.muted ? 'volume-x' : 'volume-2');
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      const frame = document.getElementById('videoFrameContainer');
      if (!document.fullscreenElement) {
        frame?.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
  }

  if (playbackRateSelect) {
    playbackRateSelect.addEventListener('change', () => {
      player.playbackRate = parseFloat(playbackRateSelect.value) || 1.0;
    });
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      btnPlay?.click();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      btnStepBack?.click();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      btnStepForward?.click();
    } else if (e.key === 'm' || e.key === 'M') {
      btnMute?.click();
    } else if (e.key === 'f' || e.key === 'F') {
      btnFullscreen?.click();
    }
  });
}

// ==========================================================================
// 5. Multi-Track Timeline Controller
// ==========================================================================
function initMultiTrackTimeline() {
  const ruler = document.getElementById('timelineRuler');
  const canvas = document.getElementById('timelineGridCanvas');
  const player = document.getElementById('mainVideoPlayer');
  const zoomSlider = document.getElementById('timelineZoomSlider');

  if (!canvas || !player) return;

  // Timeline Ruler Scrubbing
  if (ruler) {
    ruler.addEventListener('click', (e) => {
      const rect = ruler.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const dur = player.duration || 60;
      player.currentTime = ratio * dur;
    });
  }

  // Zoom Slider
  if (zoomSlider) {
    zoomSlider.addEventListener('input', () => {
      const zoom = parseInt(zoomSlider.value, 10);
      canvas.style.minWidth = `${1200 * (zoom / 100)}px`;
    });
  }

  // Scan Timeline Action Button
  const btnScan = document.getElementById('btnScanTimeline');
  const btnManualScan = document.getElementById('btnManualScanTrigger');
  const handleScan = async () => {
    if (!currentUploadedFile) {
      showToast('សូមបញ្ចូលឯកសារវីដេអូរឿងជាមុនសិន!', 'warning');
      return;
    }
    showToast('AI Gemini កំពុងស្កេន និងស្រង់តួអង្គក្នុងរឿង...', 'info');

    try {
      const res = await fetch('/api/dubbing/scan-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: currentUploadedFile.filename, scope: 'full' })
      });
      const data = await res.json();
      if (data.success && data.segments) {
        timelineSegments = data.segments;
        renderTimelineTracks(timelineSegments, data.duration || 60);
        renderManualSegmentsList(timelineSegments);
        showToast(`ស្កេនជោគជ័យ! រកឃើញ ${timelineSegments.length} ឃ្លាសន្ទនា`, 'success');
      }
    } catch (e) {
      showToast('កំហុសក្នុងការស្កេន Timeline', 'error');
    }
  };

  if (btnScan) btnScan.addEventListener('click', handleScan);
  if (btnManualScan) btnManualScan.addEventListener('click', handleScan);
}

function updateTimelinePlayheadPosition(currentTime, duration) {
  const playhead = document.getElementById('timelinePlayhead');
  const canvas = document.getElementById('timelineGridCanvas');
  if (!playhead || !canvas || !duration) return;

  const ratio = currentTime / duration;
  const canvasWidth = canvas.offsetWidth;
  const leftPx = ratio * canvasWidth;
  playhead.style.left = `${leftPx}px`;

  // Highlight active dialogue segment
  if (timelineSegments && timelineSegments.length > 0) {
    const active = timelineSegments.find(s => currentTime >= s.start_time && currentTime <= s.end_time);
    const subOverlay = document.getElementById('videoSubtitleText');
    if (active) {
      if (subOverlay) {
        subOverlay.textContent = active.khmer_translation || active.chinese_text || '';
        subOverlay.classList.remove('hidden');
      }
    } else {
      if (subOverlay) subOverlay.classList.add('hidden');
    }
  }
}

function renderTimelineTracks(segments, totalDuration) {
  const laneVoice = document.getElementById('laneVoice');
  const laneSubtitles = document.getElementById('laneSubtitles');
  const ruler = document.getElementById('timelineRuler');

  if (!laneVoice || !segments) return;
  laneVoice.innerHTML = '';
  if (laneSubtitles) laneSubtitles.innerHTML = '';

  // Render Ruler Ticks
  if (ruler) {
    ruler.innerHTML = '';
    const numTicks = 12;
    for (let i = 0; i <= numTicks; i++) {
      const tick = document.createElement('div');
      tick.className = 'ruler-tick';
      const pct = (i / numTicks) * 100;
      tick.style.left = `${pct}%`;
      tick.textContent = formatTimecode((i / numTicks) * totalDuration);
      ruler.appendChild(tick);
    }
  }

  // Render Voice and Subtitle Clips
  segments.forEach((seg, idx) => {
    const start = seg.start_time || 0;
    const end = seg.end_time || (start + 2.5);
    const leftPct = (start / totalDuration) * 100;
    const widthPct = Math.max(3, ((end - start) / totalDuration) * 100);

    const isFemale = seg.gender === 'female' || (seg.speaker_role && seg.speaker_role.includes('female'));

    // Dialogue Voice Clip
    const clip = document.createElement('div');
    clip.className = `timeline-clip-block clip-voice ${isFemale ? 'female' : ''}`;
    clip.style.left = `${leftPct}%`;
    clip.style.width = `${widthPct}%`;
    clip.innerHTML = `<span>${seg.speaker_name || 'តួអង្គ'}: ${seg.khmer_translation || seg.chinese_text || ''}</span>`;
    
    clip.addEventListener('click', () => {
      document.querySelectorAll('.timeline-clip-block').forEach(c => c.classList.remove('selected'));
      clip.classList.add('selected');
      const player = document.getElementById('mainVideoPlayer');
      if (player) player.currentTime = start;
    });

    laneVoice.appendChild(clip);

    // Subtitle Clip
    if (laneSubtitles) {
      const subClip = document.createElement('div');
      subClip.className = 'timeline-clip-block clip-subtitle';
      subClip.style.left = `${leftPct}%`;
      subClip.style.width = `${widthPct}%`;
      subClip.innerHTML = `<span>#${idx + 1}</span>`;
      laneSubtitles.appendChild(subClip);
    }
  });
}

function renderManualSegmentsList(segments) {
  const container = document.getElementById('timelineSegmentsList');
  if (!container || !segments) return;
  container.innerHTML = '';

  segments.forEach((seg, idx) => {
    const card = document.createElement('div');
    card.style.cssText = "background: var(--bg-panel); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between;";

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); background: rgba(56, 189, 248, 0.1); padding: 2px 6px; border-radius: 4px;">#${idx + 1}</span>
        <div>
          <div style="font-size: 12.5px; font-weight: 600; color: #fff;">${seg.speaker_name || 'តួអង្គ'}: "${seg.khmer_translation || ''}"</div>
          <div style="font-size: 11px; color: var(--text-muted);">${formatTimecode(seg.start_time)} - ${formatTimecode(seg.end_time)} • ${seg.chinese_text || ''}</div>
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-sm btn-secondary" onclick="generateLineAudio(${idx})">
          <i data-lucide="sparkles"></i> បង្កើតសំឡេង AI
        </button>
      </div>
    `;

    container.appendChild(card);
  });
  if (window.lucide) lucide.createIcons();
}

async function generateLineAudio(index) {
  const seg = timelineSegments[index];
  if (!seg) return;
  showToast(`កំពុងបង្កើតសំឡេងឃ្លាទី #${index + 1}...`, 'info');

  try {
    const res = await fetch('/api/dubbing/generate-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: seg.khmer_translation || seg.chinese_text || 'បាទ',
        lineIndex: index,
        gender: seg.gender || 'male',
        voiceId: 'voxcpm-voice-actor'
      })
    });
    const d = await res.json();
    if (d.success) {
      seg.audioUrl = d.audioUrl;
      showToast(`សំឡេងឃ្លាទី #${index + 1} រួចរាល់!`, 'success');
      const audio = new Audio(d.audioUrl);
      audio.play();
    }
  } catch (e) {
    showToast('កំហុសក្នុងការបង្កើតសំឡេង', 'error');
  }
}
window.generateLineAudio = generateLineAudio;

// ==========================================================================
// 6. Dubbing Actions & Polling
// ==========================================================================
function initDubbingActions() {
  const startBtn = document.getElementById('startDubbingBtn');
  const progressCard = document.getElementById('dubbingProgressCard');
  const statusText = document.getElementById('dubbingStatusText');
  const progressBar = document.getElementById('dubbingProgressBar');
  const percentText = document.getElementById('dubbingPercentText');
  const stepMsg = document.getElementById('dubbingStepMsg');
  const resultCard = document.getElementById('dubbingResultCard');
  const downloadVideo = document.getElementById('downloadDubbedVideoBtn');
  const downloadAudio = document.getElementById('downloadDubbedAudioBtn');

  if (!startBtn) return;

  startBtn.addEventListener('click', async () => {
    if (!currentUploadedFile) {
      showToast('សូមបញ្ចូលវីដេអូរឿងជាមុនសិន!', 'warning');
      return;
    }

    startBtn.disabled = true;
    if (progressCard) progressCard.classList.remove('hidden');
    if (resultCard) resultCard.classList.add('hidden');

    const voiceChoice = document.getElementById('voiceChoice')?.value || 'voxcpm-voice-actor';
    const maleLead = document.getElementById('maleLeadVoice')?.value;
    const femaleLead = document.getElementById('femaleLeadVoice')?.value;
    const geminiModel = document.getElementById('geminiModelSelect')?.value || 'gemini-3.5-flash';

    showToast('ចាប់ផ្តើមដំណើរការបញ្ជូលសំឡេងស្វ័យប្រវត្តិ...', 'info');

    try {
      const res = await fetch('/api/dubbing/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: currentUploadedFile.filename,
          sourceLang: 'zh',
          targetLang: 'km',
          voiceId: voiceChoice,
          maleLeadVoice: maleLead,
          femaleLeadVoice: femaleLead,
          geminiModel: geminiModel
        })
      });

      const d = await res.json();
      if (d.success && d.jobId) {
        currentDubbingJobId = d.jobId;
        pollJobStatus(d.jobId);
      } else {
        showToast('កំហុសក្នុងការចាប់ផ្តើម Dubbing', 'error');
        startBtn.disabled = false;
      }
    } catch (e) {
      showToast('កំហុស Server', 'error');
      startBtn.disabled = false;
    }
  });

  function pollJobStatus(jobId) {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/dubbing/status/${jobId}`);
        const job = await res.json();

        if (statusText) statusText.textContent = job.message || 'កំពុងដំណើរការ...';
        if (stepMsg) stepMsg.textContent = `ដំណាក់កាល: ${job.status}`;
        if (progressBar) progressBar.style.width = `${job.progress || 0}%`;
        if (percentText) percentText.textContent = `${job.progress || 0}%`;

        if (job.status === 'completed') {
          clearInterval(pollInterval);
          startBtn.disabled = false;
          showToast('ការបញ្ជូលសំឡេងសម្រេចបានជោគជ័យ 100%!', 'success');

          if (resultCard) resultCard.classList.remove('hidden');
          if (downloadVideo) downloadVideo.href = job.outputVideo;
          if (downloadAudio) downloadAudio.href = job.outputAudio;

          // Play Result Video
          const player = document.getElementById('mainVideoPlayer');
          if (player && job.outputVideo) {
            player.src = job.outputVideo;
            player.load();
          }

          loadDashboardData();
        } else if (job.status === 'failed') {
          clearInterval(pollInterval);
          startBtn.disabled = false;
          showToast(`បរាជ័យ: ${job.error || 'កំហុសបច្ចេកទេស'}`, 'error');
        }
      } catch (e) {
        console.warn('Poll error:', e);
      }
    }, 1500);
  }
}

// ==========================================================================
// 7. Dashboard Data Loader
// ==========================================================================
async function loadDashboardData() {
  try {
    const res = await fetch('/api/files');
    const files = await res.json();
    const grid = document.getElementById('recentProjectsGrid');
    const countEl = document.getElementById('dashTotalProjectsCount');

    if (countEl) countEl.textContent = `${files.length} គម្រោង`;

    if (grid && files && files.length > 0) {
      grid.innerHTML = '';
      files.forEach(f => {
        const card = document.createElement('div');
        card.className = 'project-media-card';
        card.innerHTML = `
          <div class="project-thumbnail-area">
            <div class="project-thumb-placeholder">
              <i data-lucide="file-video"></i>
            </div>
            <span class="thumb-duration-pill">${(f.size / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
          <div class="project-card-meta">
            <div class="project-card-title">${f.filename}</div>
            <div class="project-card-sub">
              <span>ចិន → ខ្មែរ</span>
              <span class="project-status-badge">រួចរាល់</span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          currentUploadedFile = f;
          const player = document.getElementById('mainVideoPlayer');
          if (player) {
            player.src = f.url;
            player.load();
          }
          document.getElementById('activeProjectTitleDisplay').textContent = f.filename;
          document.getElementById('navTabDubbing')?.click();
          showToast(`បានបើកគម្រោង: ${f.filename}`, 'info');
        });

        grid.appendChild(card);
      });
      if (window.lucide) lucide.createIcons();
    }

    // Disk Stats
    const statsRes = await fetch('/api/outputs/stats');
    const stats = await statsRes.json();
    const freedEl = document.getElementById('dashDiskSpaceFreed');
    if (freedEl && stats.formattedSize) {
      freedEl.textContent = stats.formattedSize;
    }
  } catch (e) {
    console.warn('Dashboard load error:', e);
  }

  // Dashboard CTA Buttons
  document.getElementById('btnDashNewProject')?.addEventListener('click', () => {
    document.getElementById('navTabDubbing')?.click();
    document.getElementById('mediaFileInput')?.click();
  });
  document.getElementById('btnDashOpenStudio')?.addEventListener('click', () => {
    document.getElementById('navTabDubbing')?.click();
  });
  document.getElementById('btnEmptyCreateProject')?.addEventListener('click', () => {
    document.getElementById('navTabDubbing')?.click();
    document.getElementById('mediaFileInput')?.click();
  });
  document.getElementById('btnRefreshProjects')?.addEventListener('click', loadDashboardData);
}

// ==========================================================================
// 8. Character & Voice Management
// ==========================================================================
async function loadAllCharacters() {
  try {
    const res = await fetch('/api/characters/all');
    const data = await res.json();
    const grid = document.getElementById('charactersGrid');
    const countEl = document.getElementById('dashTotalVoicesCount');

    if (data.characters && countEl) {
      countEl.textContent = `${data.characters.length} សំឡេង`;
    }

    if (grid && data.characters) {
      grid.innerHTML = '';
      data.characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'voice-audition-card';

        card.innerHTML = `
          <div class="voice-card-header">
            <div>
              <div class="voice-name-title">${char.label || char.filename}</div>
              <span class="voice-role-pill">${char.role_key || 'តួអង្គ'} • ${char.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="auditionVoice('${char.id}', '${char.label}')" title="សាកល្បងនិយាយ">
              <i data-lucide="volume-2"></i>
            </button>
          </div>
          <div class="voice-quote-text">"${char.words || 'សំឡេងគំរូក្នុងស្ទូឌីយោ'}"</div>
          <div class="voice-card-actions">
            <audio src="${char.previewUrl || ''}" controls style="height: 28px; width: 140px;"></audio>
            <button class="btn btn-sm btn-secondary" onclick="editCharacterModal('${char.id}', '${char.filename}', '${char.label || ''}')">
              <i data-lucide="edit-3"></i> កែប្រែ
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
      if (window.lucide) lucide.createIcons();
    }
  } catch (e) {
    console.warn('Characters load error:', e);
  }
}

function auditionVoice(id, label) {
  const modal = document.getElementById('testVoiceSpeakModal');
  const labelEl = document.getElementById('testSpeakVoiceLabel');
  const inputId = document.getElementById('testSpeakVoiceId');
  if (modal) {
    if (labelEl) labelEl.textContent = label || id;
    if (inputId) inputId.value = id;
    modal.classList.remove('hidden');
  }
}
window.auditionVoice = auditionVoice;

function editCharacterModal(id, filename, label) {
  const modal = document.getElementById('editVoiceModal');
  document.getElementById('editVoiceId').value = id;
  document.getElementById('editVoiceFilename').value = filename;
  document.getElementById('editVoiceLabel').value = label;
  modal?.classList.remove('hidden');
}
window.editCharacterModal = editCharacterModal;

function initCharacterLab() {
  document.getElementById('openAddVoiceModalBtn')?.addEventListener('click', () => {
    document.getElementById('addVoiceModal')?.classList.remove('hidden');
  });
  document.getElementById('closeAddVoiceBtn')?.addEventListener('click', () => {
    document.getElementById('addVoiceModal')?.classList.add('hidden');
  });
  document.getElementById('cancelAddVoiceBtn')?.addEventListener('click', () => {
    document.getElementById('addVoiceModal')?.classList.add('hidden');
  });

  // Save New Voice
  document.getElementById('saveAddVoiceBtn')?.addEventListener('click', async () => {
    const label = document.getElementById('addVoiceLabel').value;
    const file = document.getElementById('addVoiceFileInput').files[0];
    const gender = document.getElementById('addVoiceGender').value;
    const role = document.getElementById('addVoiceRole').value;
    const words = document.getElementById('addVoiceWords').value;

    if (!file || !label) {
      showToast('សូមបញ្ចូលឈ្មោះសំឡេង និងជ្រើសរើសឯកសារ!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('label', label);
    formData.append('gender', gender);
    formData.append('role_key', role);
    formData.append('words', words);

    try {
      const res = await fetch('/api/characters/create', { method: 'POST', body: formData });
      const d = await res.json();
      if (d.success) {
        showToast('បានបង្កើតសំឡេងថ្មីជោគជ័យ!', 'success');
        document.getElementById('addVoiceModal')?.classList.add('hidden');
        loadAllCharacters();
      }
    } catch (e) {
      showToast('កំហុសក្នុងការបង្កើតសំឡេង', 'error');
    }
  });

  // Edit Voice Close
  document.getElementById('closeEditVoiceBtn')?.addEventListener('click', () => {
    document.getElementById('editVoiceModal')?.classList.add('hidden');
  });
  document.getElementById('cancelEditVoiceBtn')?.addEventListener('click', () => {
    document.getElementById('editVoiceModal')?.classList.add('hidden');
  });
  document.getElementById('saveEditVoiceBtn')?.addEventListener('click', async () => {
    const id = document.getElementById('editVoiceId').value;
    const filename = document.getElementById('editVoiceFilename').value;
    const label = document.getElementById('editVoiceLabel').value;
    const gender = document.getElementById('editVoiceGender').value;
    const role = document.getElementById('editVoiceRole').value;
    const words = document.getElementById('editVoiceWords').value;

    try {
      const res = await fetch('/api/characters/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, filename, label, gender, role_key: role, words })
      });
      const d = await res.json();
      if (d.success) {
        showToast('បានកែប្រែព័ត៌មានសំឡេងជោគជ័យ!', 'success');
        document.getElementById('editVoiceModal')?.classList.add('hidden');
        loadAllCharacters();
      }
    } catch (e) {
      showToast('កំហុសក្នុងការកែប្រែសំឡេង', 'error');
    }
  });

  // Test Audition Speak
  document.getElementById('closeTestSpeakBtn')?.addEventListener('click', () => {
    document.getElementById('testVoiceSpeakModal')?.classList.add('hidden');
  });
  document.getElementById('cancelTestSpeakBtn')?.addEventListener('click', () => {
    document.getElementById('testVoiceSpeakModal')?.classList.add('hidden');
  });
  document.getElementById('runTestSpeakBtn')?.addEventListener('click', async () => {
    const voiceId = document.getElementById('testSpeakVoiceId').value;
    const text = document.getElementById('testSpeakCustomText').value;
    const emotion = document.getElementById('testSpeakEmotion').value;

    showToast('កំពុងសំយោគសំឡេងសាកល្បង...', 'info');
    try {
      const res = await fetch('/api/character/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId, text: text || 'សួស្តី នេះជាសំឡេងខ្មែរសុទ្ធ ១០០%', emotion })
      });
      const d = await res.json();
      if (d.success && d.audioUrl) {
        const box = document.getElementById('testSpeakResultBox');
        const player = document.getElementById('testSpeakAudioPlayer');
        if (box) box.classList.remove('hidden');
        if (player) {
          player.src = d.audioUrl;
          player.play();
        }
        showToast('សំយោគសំឡេងជោគជ័យ!', 'success');
      }
    } catch (e) {
      showToast('កំហុសក្នុងការសំយោគ', 'error');
    }
  });
}

// ==========================================================================
// 9. Audio Mixer & Subtitles
// ==========================================================================
function initAudioMixer() {
  const faderDia = document.getElementById('faderDialogue');
  const faderBgm = document.getElementById('faderBgm');
  const btnSeparate = document.getElementById('btnSeparateAudio');
  const btnAutoMix = document.getElementById('btnAutoMix');

  if (faderDia) {
    faderDia.addEventListener('input', () => {
      document.getElementById('faderDialogueVal').textContent = `+${(faderDia.value / 60).toFixed(1)} dB`;
    });
  }
  if (faderBgm) {
    faderBgm.addEventListener('input', () => {
      document.getElementById('faderBgmVal').textContent = `${(faderBgm.value / 50 - 2.5).toFixed(1)} dB`;
    });
  }

  if (btnSeparate) {
    btnSeparate.addEventListener('click', async () => {
      if (!currentUploadedFile) {
        showToast('សូមបញ្ចូលវីដេអូជាមុនសិន!', 'warning');
        return;
      }
      showToast('AI កំពុងបំបែក Vocal និង BGM...', 'info');
      try {
        const res = await fetch('/api/audio/separate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: currentUploadedFile.filename, preferAi: true })
        });
        const d = await res.json();
        if (d.success) {
          showToast('បំបែកសំឡេងជោគជ័យ! បទភ្លេង BGM ត្រូវបានរក្សាទុក 100%', 'success');
        }
      } catch (e) {
        showToast('កំហុសក្នុងការបំបែកសំឡេង', 'error');
      }
    });
  }

  if (btnAutoMix) {
    btnAutoMix.addEventListener('click', () => {
      if (faderDia) faderDia.value = 135;
      if (faderBgm) faderBgm.value = 80;
      showToast('AI Auto-Mix បានកំណត់តុល្យភាព Dialogue & BGM ស្តង់ដាររោងភាពយន្ត', 'success');
    });
  }
}

function initSubtitleStudio() {
  const btnExportSrt = document.getElementById('btnExportSrt');
  const btnBurn = document.getElementById('btnBurnSubtitles');

  if (btnExportSrt) {
    btnExportSrt.addEventListener('click', () => {
      if (!timelineSegments || timelineSegments.length === 0) {
        showToast('មិនទាន់មានទិន្នន័យអក្សររត់ឡើយ!', 'warning');
        return;
      }
      // Generate SRT text
      let srt = '';
      timelineSegments.forEach((s, i) => {
        srt += `${i + 1}\n${formatTimecode(s.start_time)},000 --> ${formatTimecode(s.end_time)},000\n${s.khmer_translation || ''}\n\n`;
      });
      const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'subtitles_khmer.srt';
      a.click();
      showToast('បានទាញយកឯកសារ SRT ជោគជ័យ!', 'success');
    });
  }

  if (btnBurn) {
    btnBurn.addEventListener('click', () => {
      showToast('មុខងារ Burn-in ត្រូវបានបើកក្នុង Export Center!', 'info');
      document.getElementById('btnCapcutExport')?.click();
    });
  }
}

// ==========================================================================
// 10. Translation Workspace
// ==========================================================================
function initTranslator() {
  const btn = document.getElementById('runTranslateBtn');
  const src = document.getElementById('translateSourceText');
  const tgt = document.getElementById('translateTargetText');

  if (btn && src && tgt) {
    btn.addEventListener('click', async () => {
      const text = src.value.trim();
      if (!text) {
        showToast('សូមបញ្ចូលអត្ថបទចិន!', 'warning');
        return;
      }
      showToast('AI Gemini កំពុងបកប្រែ...', 'info');
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sourceLang: 'zh', targetLang: 'km' })
        });
        const d = await res.json();
        if (d.translation) {
          tgt.value = d.translation;
          showToast('បកប្រែជោគជ័យ!', 'success');
        }
      } catch (e) {
        showToast('កំហុសក្នុងការបកប្រែ', 'error');
      }
    });
  }
}

// ==========================================================================
// 11. Voice Pitch Tuner
// ==========================================================================
function initPitchTuner() {
  const speedRange = document.getElementById('tunerSpeedRange');
  const speedVal = document.getElementById('tunerSpeedVal');
  const pitchRange = document.getElementById('tunerPitchRange');
  const pitchVal = document.getElementById('tunerPitchVal');
  const runBtn = document.getElementById('runTunerBtn');

  if (speedRange && speedVal) {
    speedRange.addEventListener('input', () => {
      speedVal.textContent = `${parseFloat(speedRange.value).toFixed(2)}x`;
    });
  }

  if (pitchRange && pitchVal) {
    pitchRange.addEventListener('input', () => {
      pitchVal.textContent = `${pitchRange.value} កម្រិត`;
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', async () => {
      const text = document.getElementById('tunerTextInput')?.value;
      const voice = document.getElementById('tunerVoiceSelect')?.value;
      showToast('កំពុងសំយោគ & សារ៉េទឹកដម...', 'info');

      try {
        const res = await fetch('/api/character/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceId: voice, text: text || 'សួស្តី' })
        });
        const d = await res.json();
        if (d.success) {
          const box = document.getElementById('tunerResultBox');
          const player = document.getElementById('tunerAudioPlayer');
          if (box) box.classList.remove('hidden');
          if (player) {
            player.src = d.audioUrl;
            player.play();
          }
          showToast('សារ៉េទឹកដមរួចរាល់!', 'success');
        }
      } catch (e) {
        showToast('កំហុសក្នុងការសំយោគ', 'error');
      }
    });
  }
}

// ==========================================================================
// 12. Settings & Quick VoxCPM Modals
// ==========================================================================
function initSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const openBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const cancelBtn = document.getElementById('cancelSettingsBtn');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const clearOutputsBtn = document.getElementById('modalClearOutputsBtn');

  if (openBtn && modal) openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  if (cancelBtn && modal) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const eleven = document.getElementById('settingElevenKey').value;
      const gemini = document.getElementById('settingGeminiKey').value;
      const model = document.getElementById('settingGeminiModel').value;
      const voxcpm = document.getElementById('settingVoxcpmUrl').value;

      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elevenlabsKey: eleven || undefined,
            geminiKey: gemini || undefined,
            geminiModel: model,
            voxcpmUrl: voxcpm || undefined
          })
        });
        const d = await res.json();
        if (d.success) {
          showToast('រក្សាទុកការកំណត់ជោគជ័យ!', 'success');
          modal.classList.add('hidden');
          initConfig();
        }
      } catch (e) {
        showToast('កំហុសក្នុងការរក្សាទុកការកំណត់', 'error');
      }
    });
  }

  if (clearOutputsBtn) {
    clearOutputsBtn.addEventListener('click', async () => {
      if (!confirm('តើអ្នកពិតជាចង់សម្អាតឯកសារ Output ទាំងអស់ដើម្បីសន្សំទំហំថាសមែនទេ?')) return;
      try {
        const res = await fetch('/api/outputs/clear', { method: 'POST' });
        const d = await res.json();
        if (d.success) {
          showToast(`បានសម្អាត ${d.count} ឯកសារ (សន្សំបាន ${d.formattedFreed})!`, 'success');
          loadDashboardData();
        }
      } catch (e) {
        showToast('កំហុសក្នុងការសម្អាត', 'error');
      }
    });
  }
}

function initQuickVoxcpmModal() {
  const modal = document.getElementById('voxcpmModal');
  const badge = document.getElementById('voxcpmStatusBadge');
  const closeBtn = document.getElementById('closeVoxcpmModalBtn');
  const testBtn = document.getElementById('testQuickVoxcpmBtn');
  const saveBtn = document.getElementById('saveQuickVoxcpmBtn');
  const input = document.getElementById('quickVoxcpmUrlInput');
  const bannerBtn = document.getElementById('bannerOpenModalBtn');
  const bannerPaste = document.getElementById('bannerPasteClipboardBtn');

  if (badge && modal) badge.addEventListener('click', () => modal.classList.remove('hidden'));
  if (bannerBtn && modal) bannerBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  if (bannerPaste) {
    bannerPaste.addEventListener('click', async () => {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.includes('trycloudflare.com')) {
          await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voxcpmUrl: clipText.trim() })
          });
          showToast('បានភ្ជាប់ Link ពី Clipboard ជោគជ័យ!', 'success');
          checkVoxcpmStatus();
        } else {
          showToast('មិនឃើញមាន Link trycloudflare ក្នុង Clipboard ទេ', 'warning');
        }
      } catch (e) {
        showToast('សូមបញ្ចូល Link ផ្ទាល់', 'info');
      }
    });
  }

  if (testBtn && input) {
    testBtn.addEventListener('click', async () => {
      showToast('កំពុងតេស្តការភ្ជាប់...', 'info');
      checkVoxcpmStatus();
    });
  }

  if (saveBtn && input) {
    saveBtn.addEventListener('click', async () => {
      const url = input.value.trim();
      if (!url) return;
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voxcpmUrl: url })
        });
        showToast('បានរក្សាទុក Link ថ្មី!', 'success');
        modal.classList.add('hidden');
        checkVoxcpmStatus();
      } catch (e) {
        showToast('កំហុសក្នុងការរក្សាទុក', 'error');
      }
    });
  }
}

// ==========================================================================
// 13. CapCut / Studio Export Modal
// ==========================================================================
function initCapCutExportModal() {
  const modal = document.getElementById('capcutExportModal');
  const openBtn = document.getElementById('btnCapcutExport');
  const closeBtn = document.getElementById('closeExportModalBtn');
  const cancelBtn = document.getElementById('cancelExportModalBtn');
  const startBtn = document.getElementById('startRenderExportBtn');

  if (openBtn && modal) openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  if (cancelBtn && modal) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  // Resolution Chips
  const chips = document.querySelectorAll('#exportResolutionGroup .btn');
  chips.forEach(c => {
    c.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
  });

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const prog = document.getElementById('exportRenderProgress');
      const bar = document.getElementById('exportProgressBar');
      const txt = document.getElementById('exportProgressText');
      if (prog) prog.classList.remove('hidden');

      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        if (bar) bar.style.width = `${p}%`;
        if (txt) txt.textContent = `Rendering... ${p}%`;
        if (p >= 100) {
          clearInterval(interval);
          showToast('Render វីដេអូបានជោគជ័យ! កំពុងទាញយក...', 'success');
          modal.classList.add('hidden');
        }
      }, 300);
    });
  }
}

// ==========================================================================
// 14. Authentication & RBAC
// ==========================================================================
function initAuthAndRBAC() {
  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  const loginTab = document.getElementById('authTabLogin');
  const regTab = document.getElementById('authTabRegister');
  const submitText = document.getElementById('authSubmitBtnText');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userTierBadge = document.getElementById('userTierBadge');
  const logoutBtn = document.getElementById('btnLogout');
  const adminBtn = document.getElementById('btnAdminUsers');

  let mode = 'login';

  if (loginTab && regTab) {
    loginTab.addEventListener('click', () => {
      mode = 'login';
      loginTab.style.borderBottom = '2px solid var(--accent-cyan)';
      loginTab.style.color = '#fff';
      regTab.style.borderBottom = 'none';
      regTab.style.color = 'var(--text-muted)';
      if (submitText) submitText.textContent = 'ចូលប្រើប្រាស់';
    });

    regTab.addEventListener('click', () => {
      mode = 'register';
      regTab.style.borderBottom = '2px solid var(--accent-cyan)';
      regTab.style.color = '#fff';
      loginTab.style.borderBottom = 'none';
      loginTab.style.color = 'var(--text-muted)';
      if (submitText) submitText.textContent = 'បង្កើតគណនីថ្មី';
    });
  }

  // Check Current Session
  fetch('/api/auth/me')
    .then(r => r.json())
    .then(data => {
      if (data.user) {
        currentUser = data.user;
        if (userNameDisplay) userNameDisplay.textContent = currentUser.username;
        if (userTierBadge) {
          userTierBadge.textContent = currentUser.tier ? currentUser.tier.toUpperCase() : 'FREE';
          if (currentUser.tier === 'premium' || currentUser.role === 'admin') {
            userTierBadge.className = 'tier-tag';
          } else {
            userTierBadge.className = 'tier-tag tier-free';
          }
        }
        if (currentUser.role === 'admin' && adminBtn) {
          adminBtn.classList.remove('hidden');
        }
        authModal?.classList.add('hidden');
      } else {
        authModal?.classList.remove('hidden');
      }
    })
    .catch(() => {
      authModal?.classList.remove('hidden');
    });

  // Auth Form Submit
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('authUsernameInput').value.trim();
      const password = document.getElementById('authPasswordInput').value.trim();
      const alertMsg = document.getElementById('authAlertMsg');

      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem('studio_auth_token', data.token);
          currentUser = data.user;
          if (userNameDisplay) userNameDisplay.textContent = currentUser.username;
          if (userTierBadge) {
            userTierBadge.textContent = (currentUser.tier || 'FREE').toUpperCase();
          }
          if (currentUser.role === 'admin' && adminBtn) {
            adminBtn.classList.remove('hidden');
          }
          authModal?.classList.add('hidden');
          showToast(`ស្វាគមន៍ ${currentUser.username}!`, 'success');
          loadAllCharacters();
        } else {
          if (alertMsg) {
            alertMsg.textContent = data.detail || 'កំហុសគណនី ឬពាក្យសម្ងាត់';
            alertMsg.classList.remove('hidden');
          }
        }
      } catch (err) {
        showToast('កំហុសតភ្ជាប់ Server', 'error');
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('studio_auth_token');
      currentUser = null;
      window.location.reload();
    });
  }

  // Admin Modal
  const adminModal = document.getElementById('adminUsersModal');
  const closeAdminBtn = document.getElementById('closeAdminUsersBtn');
  const closeAdminBottomBtn = document.getElementById('closeAdminUsersBottomBtn');

  if (adminBtn && adminModal) {
    adminBtn.addEventListener('click', async () => {
      adminModal.classList.remove('hidden');
      try {
        const res = await fetch('/api/admin/users');
        const d = await res.json();
        if (d.users) {
          const tbody = document.getElementById('adminUsersTableBody');
          if (tbody) {
            tbody.innerHTML = '';
            d.users.forEach(u => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td>#${u.id}</td>
                <td>${u.username}</td>
                <td><span class="badge-version">${u.role}</span></td>
                <td><span class="tier-tag ${u.tier === 'premium' ? '' : 'tier-free'}">${u.tier}</span></td>
                <td>${u.premium_until || 'គ្មាន'}</td>
                <td style="text-align: right;">
                  <button class="btn btn-sm btn-primary" onclick="setPremiumUser(${u.id}, 30)">Set Premium</button>
                </td>
              `;
              tbody.appendChild(tr);
            });
          }
        }
      } catch (e) {
        console.warn('Admin users error:', e);
      }
    });
  }

  if (closeAdminBtn && adminModal) closeAdminBtn.addEventListener('click', () => adminModal.classList.add('hidden'));
  if (closeAdminBottomBtn && adminModal) closeAdminBottomBtn.addEventListener('click', () => adminModal.classList.add('hidden'));
}

async function setPremiumUser(userId, days) {
  try {
    const res = await fetch('/api/admin/set-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, days })
    });
    const d = await res.json();
    if (d.success) {
      showToast('បានតម្លើង Premium ជោគជ័យ!', 'success');
      document.getElementById('btnAdminUsers')?.click();
    }
  } catch (e) {
    showToast('កំហុសក្នុងការតម្លើង', 'error');
  }
}
window.setPremiumUser = setPremiumUser;
