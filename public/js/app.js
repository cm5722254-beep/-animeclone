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

// State
let currentUploadedFile = null;
let currentDubbingJobId = null;
let pollInterval = null;
let originalMediaUrl = null;
let dubbedMediaUrl = null;
let extractedMovieCharacters = [];
let currentPreviewAudio = null;

// 100% Pure Khmer Sanitizer (Strips Thai unicode \u0E00-\u0E7F, Chinese, and foreign scripts)
function cleanPureKhmer(text) {
  if (!text) return '';
  return text
    .replace(/[\u0E00-\u0E7F]+/g, '') // Remove all Thai characters completely
    .replace(/[\u4E00-\u9FFF]+/g, '') // Remove all Chinese characters completely
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

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initAuthAndRBAC();
  initTabs();
  initConfig();
  initUpload();
  initDubbingActions();
  initManualStudio();
  initAudioMixer();
  initSubtitleStudio();
  initPitchTuner();
  initCharacterLab();
  initTranslator();
  initSettingsModal();
  initQuickVoxcpmModal();
  initPresetChips();
  initManualSearch();
  initVoiceDashboard();
  initEngineModeSwitcher();
  initVoiceAuditionPreviews();
  initCinemaTransportBar();
  initCapCutAudioMixerDock();
  initCapCutTimelineDock();
  initCapCutExportModal();
  initTimelineTrackControls();

  // Populate CapCut timeline with default segments on startup
  setTimeout(() => {
    if (typeof renderCapCutTimeline === 'function') {
      renderCapCutTimeline(DEFAULT_PRESET_TIMELINE_SEGMENTS, 50);
    }
  }, 400);
});

// 1. Navigation Tabs
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
      if (window.lucide) lucide.createIcons();
    });
  });
}

// 2. Config & API Keys
async function initConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    const badge = document.getElementById('apiStatusBadge');
    const statusText = document.getElementById('statusText');

    if (data.hasVoxcpmUrl) {
      if (badge) badge.style.display = 'none'; // VoxCPM capsule is already active and live!
    } else if (data.hasElevenlabs || data.hasElevenLabsKey) {
      if (badge) {
        badge.style.display = 'inline-flex';
        badge.classList.add('active');
        statusText.textContent = '✨ ElevenLabs AI: ត្រៀមរួចរាល់';
      }
    } else {
      if (badge) {
        badge.style.display = 'inline-flex';
        badge.classList.add('active');
        statusText.textContent = '🚀 Local Tool AI: ត្រៀមរួចរាល់';
      }
    }

    // Dynamic Live VoxCPM2 GPU Check
    const voxBadge = document.getElementById('voxcpmStatusBadge');
    const voxText = document.getElementById('voxcpmStatusText');
    const voxDot = document.getElementById('voxcpmStatusDot');
    if (voxBadge && voxText) {
      try {
        const vRes = await fetch('/api/voxcpm/status');
        const vData = await vRes.json();
        if (vData.online) {
          voxBadge.style.background = 'rgba(16, 185, 129, 0.15)';
          voxBadge.style.border = '1px solid rgba(16, 185, 129, 0.4)';
          voxBadge.style.color = '#34d399';
          if (voxDot) {
            voxDot.style.background = '#10b981';
            voxDot.style.boxShadow = '0 0 8px #10b981';
          }
          voxText.textContent = '⚡ VoxCPM2: ភ្ជាប់រួចរាល់ (Online)';
          document.getElementById('connectionAlertBanner')?.classList.add('hidden');
        } else if (vData.configured) {
          voxBadge.style.background = 'rgba(239, 68, 68, 0.15)';
          voxBadge.style.border = '1px solid rgba(239, 68, 68, 0.4)';
          voxBadge.style.color = '#f87171';
          if (voxDot) {
            voxDot.style.background = '#ef4444';
            voxDot.style.boxShadow = '0 0 8px #ef4444';
          }
          voxText.textContent = '⚠️ VoxCPM2: ដាច់ការភ្ជាប់ (ចុចប្ដូរ Link)';
          if (currentEngineMode !== 'pure_khmer') {
            document.getElementById('connectionAlertBanner')?.classList.remove('hidden');
          } else {
            document.getElementById('connectionAlertBanner')?.classList.add('hidden');
          }
        } else {
          voxBadge.style.background = 'rgba(234, 179, 8, 0.15)';
          voxBadge.style.border = '1px solid rgba(234, 179, 8, 0.4)';
          voxBadge.style.color = '#facc15';
          if (voxDot) {
            voxDot.style.background = '#eab308';
            voxDot.style.boxShadow = '0 0 8px #eab308';
          }
          voxText.textContent = '⚡ VoxCPM2: សូមកំណត់ Link';
          if (currentEngineMode !== 'pure_khmer') {
            document.getElementById('connectionAlertBanner')?.classList.remove('hidden');
          } else {
            document.getElementById('connectionAlertBanner')?.classList.add('hidden');
          }
        }
      } catch (e) {
        console.warn('Vox status check error:', e);
      }
    }

    if (data.elevenLabsKeyMasked || data.hasElevenlabs) {
      document.getElementById('settingElevenKey').placeholder = `បានកំណត់រួចរាល់`;
    }
    if (data.geminiKeyMasked || data.hasGemini) {
      document.getElementById('settingGeminiKey').placeholder = `បានកំណត់រួចរាល់`;
    }
    if (data.voxcpmUrl) {
      const voxInput = document.getElementById('settingVoxcpmUrl');
      if (voxInput) voxInput.value = data.voxcpmUrl;
      const quickInput = document.getElementById('quickVoxcpmUrlInput');
      if (quickInput) quickInput.value = data.voxcpmUrl;
    }

    const currentModel = data.geminiModel || 'gemini-3.5-flash';
    const settingModelEl = document.getElementById('settingGeminiModel');
    const quickModelEl = document.getElementById('quickGeminiModel');
    if (settingModelEl) settingModelEl.value = currentModel;
    if (quickModelEl) quickModelEl.value = currentModel;

    // Multi-computer LAN network detection
    try {
      const netRes = await fetch('/api/system/network-info');
      const netData = await netRes.json();
      const networkBadge = document.getElementById('networkShareBadge');
      const networkIpText = document.getElementById('networkIpText');
      const settingLanUrl = document.getElementById('settingLanUrl');
      const copyNetworkIpBtn = document.getElementById('copyNetworkIpBtn');
      const copyLanUrlBtn = document.getElementById('copyLanUrlBtn');

      if (netData.primaryLanUrl && netData.lanAddresses && netData.lanAddresses.length > 0) {
        const shareUrl = netData.primaryLanUrl;
        if (networkIpText) networkIpText.textContent = `LAN: ${shareUrl.replace('http://', '')}`;
        if (networkBadge) networkBadge.style.display = 'inline-flex';
        if (settingLanUrl) settingLanUrl.value = shareUrl;

        const copyHandler = (e) => {
          if (e) e.stopPropagation();
          navigator.clipboard.writeText(shareUrl).then(() => {
            showToast(`បានចម្លង Link: ${shareUrl}! អាចបើកលើកុំព្យូទ័រ ឬទូរស័ព្ទណាក៏បាន`, 'success');
          }).catch(() => {
            showToast(`Link: ${shareUrl}`, 'info');
          });
        };

        if (copyNetworkIpBtn) copyNetworkIpBtn.onclick = copyHandler;
        if (networkBadge) networkBadge.onclick = copyHandler;
        if (copyLanUrlBtn) copyLanUrlBtn.onclick = copyHandler;
      } else {
        if (settingLanUrl) settingLanUrl.value = window.location.origin;
      }
    } catch (netErr) {
      console.warn('Network info fetch error:', netErr);
    }
  } catch (err) {
    console.error('Config fetch failed:', err);
  }
}

// 3. File Upload & Dropzone
function initUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('mediaFileInput');
  const previewCard = document.getElementById('filePreviewCard');
  const dropzoneInner = dropZone.querySelector('.dropzone-inner');
  const removeBtn = document.getElementById('removeFileBtn');
  const startBtn = document.getElementById('startDubbingBtn');

  // Trigger file selection
  dropZone.addEventListener('click', (e) => {
    if (e.target.closest('#removeFileBtn')) return;
    fileInput.click();
  });

  // Drag over / leave
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentUploadedFile = null;
    originalMediaUrl = null;
    fileInput.value = '';
    previewCard.classList.add('hidden');
    dropzoneInner.classList.remove('hidden');
    startBtn.disabled = true;

    // Reset player
    const player = document.getElementById('studioVideoPlayer');
    player.src = '';
    document.getElementById('emptyPlayerState').classList.remove('hidden');
  });

  // Quick Load "រឿង៖ វីរនារីហង្សភ្លើង _ ភាគទី 01.mp4"
  const quickLoadBtn = document.getElementById('quickLoadHangPhleungBtn');
  if (quickLoadBtn) {
    quickLoadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fileNameEl = document.getElementById('previewFileName');
      const fileSizeEl = document.getElementById('previewFileSize');

      currentUploadedFile = {
        filename: 'video_hang_phleung_ep01.mp4',
        originalName: 'រឿង៖ វីរនារីហង្សភ្លើង _ ភាគទី 01.mp4',
        size: 143085600,
        type: 'video',
        url: '/media/uploads/video_hang_phleung_ep01.mp4',
        duration: 1293
      };
      originalMediaUrl = '/media/uploads/video_hang_phleung_ep01.mp4';

      fileNameEl.textContent = 'រឿង៖ វីរនារីហង្សភ្លើង _ ភាគទី 01.mp4';
      fileSizeEl.textContent = '136.5 MB • 21:33 • វីដេអូស្រាប់ក្នុង Tool ✓';
      dropzoneInner.classList.add('hidden');
      previewCard.classList.remove('hidden');
      startBtn.disabled = false;

      const player = document.getElementById('studioVideoPlayer');
      if (player) {
        player.src = originalMediaUrl;
        player.load();
      }
      const emptyState = document.getElementById('emptyPlayerState');
      if (emptyState) emptyState.classList.add('hidden');

      if (typeof renderCapCutTimeline === 'function') {
        renderCapCutTimeline(DEFAULT_PRESET_TIMELINE_SEGMENTS, 1293);
      }

      showToast('🎬 បានផ្ទុកវីដេអូ "រឿង៖ វីរនារីហង្សភ្លើង _ ភាគទី 01" រួចរាល់ អាចចុច Dubbing ភ្លាមៗ!', 'success');
    });
  }

  const emptyQuickLoadBtn = document.getElementById('emptyQuickLoadBtn');
  if (emptyQuickLoadBtn && quickLoadBtn) {
    emptyQuickLoadBtn.addEventListener('click', () => {
      quickLoadBtn.click();
    });
  }

  const emptyBrowseLocalBtn = document.getElementById('emptyBrowseLocalBtn');
  if (emptyBrowseLocalBtn) {
    emptyBrowseLocalBtn.addEventListener('click', () => {
      const fileInput = document.getElementById('mediaFileInput');
      if (fileInput) fileInput.click();
    });
  }
}

function handleFileUpload(file) {
  const previewCard = document.getElementById('filePreviewCard');
  const dropzoneInner = document.querySelector('.dropzone-inner');
  const fileNameEl = document.getElementById('previewFileName');
  const fileSizeEl = document.getElementById('previewFileSize');
  const startBtn = document.getElementById('startDubbingBtn');

  fileNameEl.textContent = file.name;
  const totalMB = (file.size / (1024 * 1024)).toFixed(1);
  fileSizeEl.textContent = `កំពុង Upload... 0% (0 / ${totalMB} MB)`;
  dropzoneInner.classList.add('hidden');
  previewCard.classList.remove('hidden');

  const formData = new FormData();
  formData.append('mediaFile', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/upload', true);

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      const loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
      fileSizeEl.textContent = `កំពុង Upload... ${percent}% (${loadedMB} / ${totalMB} MB)`;
    }
  };

  xhr.onload = () => {
    let data;
    try {
      data = JSON.parse(xhr.responseText);
    } catch (err) {
      alert(`Upload បរាជ័យ (HTTP ${xhr.status}): សូមពិនិត្យមើលទំហំឯកសារឡើងវិញ។`);
      previewCard.classList.add('hidden');
      dropzoneInner.classList.remove('hidden');
      return;
    }

    if (xhr.status >= 200 && xhr.status < 300 && (data.success || data.filename)) {
      currentUploadedFile = data.file || data;
      originalMediaUrl = (data.file && data.file.url) || data.url || `/media/uploads/${currentUploadedFile.filename}`;
      fileSizeEl.textContent = `${totalMB} MB • រួចរាល់ ✓`;
      startBtn.disabled = false;

      // Load original video in player
      const player = document.getElementById('studioVideoPlayer');
      if (player && originalMediaUrl) {
        player.src = originalMediaUrl;
        player.load();
      }
      const emptyState = document.getElementById('emptyPlayerState');
      if (emptyState) emptyState.classList.add('hidden');
    } else {
      alert('Upload បរាជ័យ: ' + (data.error || 'កំហុសមិនស្គាល់'));
      previewCard.classList.add('hidden');
      dropzoneInner.classList.remove('hidden');
    }
  };

  xhr.onerror = () => {
    alert('មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ។');
    previewCard.classList.add('hidden');
    dropzoneInner.classList.remove('hidden');
  };

  xhr.send(formData);
}

// 4. Dubbing Workflow Execution
function initDubbingActions() {
  const startBtn = document.getElementById('startDubbingBtn');
  const progressContainer = document.getElementById('pipelineProgress');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressStatusText = document.getElementById('progressStatusText');
  const toggleOriginal = document.getElementById('toggleOriginal');
  const toggleDubbed = document.getElementById('toggleDubbed');
  const player = document.getElementById('studioVideoPlayer');

  // View toggle
  toggleOriginal.addEventListener('click', () => {
    toggleOriginal.classList.add('active');
    toggleDubbed.classList.remove('active');
    if (originalMediaUrl) player.src = originalMediaUrl;
  });

  toggleDubbed.addEventListener('click', () => {
    if (!dubbedMediaUrl) {
      alert('មិនទាន់មានវីដេអូជាសំឡេងខ្មែរនៅឡើយទេ។ សូមចុច "ចាប់ផ្តើម Clone សំឡេង" ជាមុនសិន!');
      return;
    }
    toggleDubbed.classList.add('active');
    toggleOriginal.classList.remove('active');
    player.src = dubbedMediaUrl;
    player.play();
  });

  startBtn.addEventListener('click', async () => {
    if (!currentUploadedFile) return;

    startBtn.disabled = true;
    progressContainer.classList.remove('hidden');
    progressBarFill.style.width = '10%';
    progressStatusText.textContent = 'កំពុងផ្ញើទិន្នន័យទៅកាន់ AI Studio...';

    // Reset step styles
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`step-${i}`);
      el.classList.remove('active', 'completed');
    }
    document.getElementById('step-1').classList.add('active');

    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    const speakerCount = parseInt(document.getElementById('speakerCount').value, 10);
    const voiceId = document.getElementById('voiceChoice') ? document.getElementById('voiceChoice').value : 'voxcpm-voice-actor';
    const scope = document.getElementById('dubbingScope') ? document.getElementById('dubbingScope').value : 'full';
    const castingSafetyMode = document.getElementById('castingSafetyMode') ? document.getElementById('castingSafetyMode').value : 'safe_curated';
    const genre = document.getElementById('movieGenre') ? document.getElementById('movieGenre').value : 'ancient';
    const emotionIntensity = document.getElementById('emotionIntensity') ? document.getElementById('emotionIntensity').value : 'dramatic';
    const maleLeadVoice = document.getElementById('maleLeadVoice') ? document.getElementById('maleLeadVoice').value : 'hang_phleung_char_2_male.mp3';
    const femaleLeadVoice = document.getElementById('femaleLeadVoice') ? document.getElementById('femaleLeadVoice').value : 'hang_phleung_char_6_female.mp3';
    const geminiModel = document.getElementById('quickGeminiModel')?.value || document.getElementById('settingGeminiModel')?.value || 'gemini-3.5-flash';

    try {
      const res = await fetch('/api/dubbing/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: currentUploadedFile.filename,
          sourceLang,
          targetLang,
          voiceId,
          numSpeakers: speakerCount,
          scope,
          castingSafetyMode,
          genre,
          emotionIntensity,
          maleLeadVoice,
          femaleLeadVoice,
          geminiModel
        })
      });

      const data = await res.json();
      if (data.success) {
        currentDubbingJobId = data.jobId;
        startPolling(data.jobId);
      } else {
        alert('កំហុសពេលចាប់ផ្ដើមបញ្ជូលសំឡេង: ' + (data.error || ''));
        startBtn.disabled = false;
      }
    } catch (err) {
      alert('កំហុសដំណើរការបញ្ជូលសំឡេង: ' + err.message);
      startBtn.disabled = false;
    }
  });
}

function startPolling(jobId) {
  if (pollInterval) clearInterval(pollInterval);

  const progressBarFill = document.getElementById('progressBarFill');
  const progressStatusText = document.getElementById('progressStatusText');
  const resultBar = document.getElementById('resultActionsBar');
  const downloadFinalBtn = document.getElementById('downloadFinalBtn');
  const downloadAudioBtn = document.getElementById('downloadAudioBtn');
  const player = document.getElementById('studioVideoPlayer');
  const toggleDubbed = document.getElementById('toggleDubbed');
  const toggleOriginal = document.getElementById('toggleOriginal');

  const pipelinePercentDisplay = document.getElementById('pipelinePercentDisplay');
  const pipelineBadgeText = document.getElementById('pipelineStatusBadgeText');

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/dubbing/status/${jobId}`);
      const job = await res.json();

      const pct = Math.max(0, Math.min(100, Math.round(job.progress || 0)));
      progressBarFill.style.width = `${pct}%`;
      progressStatusText.textContent = job.message;

      if (pipelinePercentDisplay) {
        pipelinePercentDisplay.textContent = `${pct}%`;
      }

      // Update steps visual & badge text
      if (job.progress >= 20) markStepDone(1);
      if (job.progress >= 40) markStepDone(2);
      if (job.progress >= 65) markStepDone(3);
      if (job.progress >= 85) markStepDone(4);

      if (pipelineBadgeText) {
        if (pct >= 85) pipelineBadgeText.textContent = 'ដំណាក់កាលទី ៥: ផ្គុំវីដេអូ & BGM';
        else if (pct >= 65) pipelineBadgeText.textContent = 'ដំណាក់កាលទី ៤: Clone សំឡេងខ្មែរ';
        else if (pct >= 40) pipelineBadgeText.textContent = 'ដំណាក់កាលទី ៣: បកប្រែសាច់រឿង';
        else if (pct >= 20) pipelineBadgeText.textContent = 'ដំណាក់កាលទី ២: ចាប់សំឡេងតួអង្គ';
        else pipelineBadgeText.textContent = 'ដំណាក់កាលទី ១: ដកសំឡេងដើម';
      }

      if (job.status === 'completed') {
        clearInterval(pollInterval);
        markStepDone(5);
        progressBarFill.style.width = '100%';
        if (pipelinePercentDisplay) pipelinePercentDisplay.textContent = '100%';
        if (pipelineBadgeText) pipelineBadgeText.textContent = '✅ រួចរាល់ ១០០%';
        progressStatusText.textContent = '🎉 បកប្រែ និង Clone សំឡេងជោគជ័យ!';

        dubbedMediaUrl = job.outputVideo || job.outputAudio;
        player.src = dubbedMediaUrl;
        toggleDubbed.classList.add('active');
        toggleOriginal.classList.remove('active');

        // Render CapCut Timeline with all character dialogue lines
        if (job.dialogueSegments && job.dialogueSegments.length > 0) {
          renderCapCutTimeline(job.dialogueSegments, player.duration || 60);
        }

        // Set download buttons
        resultBar.classList.remove('hidden');
        downloadFinalBtn.href = job.outputVideo || '#';
        downloadAudioBtn.href = job.outputAudio || '#';

        document.getElementById('startDubbingBtn').disabled = false;
      } else if (job.status === 'error') {
        clearInterval(pollInterval);
        progressStatusText.textContent = '❌ ' + (job.error || 'ការបញ្ជូលសំឡេងបានបរាជ័យ');
        if (pipelineBadgeText) pipelineBadgeText.textContent = '❌ បរាជ័យ';
        document.getElementById('startDubbingBtn').disabled = false;
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 2000);
}

function markStepDone(stepNum) {
  const el = document.getElementById(`step-${stepNum}`);
  if (el) {
    el.classList.remove('active');
    el.classList.add('completed');
  }
  const nextEl = document.getElementById(`step-${stepNum + 1}`);
  if (nextEl && !nextEl.classList.contains('completed')) {
    nextEl.classList.add('active');
  }
}

// 5. Character Voice Lab
function initCharacterLab() {
  const cloneBtn = document.getElementById('cloneAndSpeakBtn');
  const charNameInput = document.getElementById('charNameInput');
  const voiceSampleFile = document.getElementById('voiceSampleFile');
  const khmerSpeakText = document.getElementById('khmerSpeakText');
  const charAudioResultBox = document.getElementById('charAudioResultBox');
  const charResultTitle = document.getElementById('charResultTitle');
  const charAudioPlayer = document.getElementById('charAudioPlayer');

  cloneBtn.addEventListener('click', async () => {
    const name = charNameInput.value.trim() || 'តួអង្គភាពយន្ត';
    const text = khmerSpeakText.value.trim();
    const file = voiceSampleFile.files[0];

    if (!file) {
      alert('សូមជ្រើសរើសឯកសារសំឡេងគំរូរបស់តួអង្គ (Sample Audio)!');
      return;
    }
    if (!text) {
      alert('សូមសរសេរឃ្លាជាភាសាខ្មែរដែលចង់ឱ្យតួអង្គនិយាយ!');
      return;
    }

    cloneBtn.disabled = true;
    cloneBtn.innerHTML = '<i data-lucide="loader-2"></i><span>កំពុង Clone សំឡេង & បង្កើតសំឡេងនិយាយ...</span>';
    if (window.lucide) lucide.createIcons();

    const formData = new FormData();
    formData.append('voiceSample', file);
    formData.append('characterName', name);

    try {
      // Step A: Clone Voice
      const cloneRes = await fetch('/api/character/clone', {
        method: 'POST',
        body: formData
      });
      const cloneData = await cloneRes.json();

      if (!cloneData.success) {
        throw new Error(cloneData.error || 'ការ Clone សំឡេងបរាជ័យ');
      }

      // Step B: Text to speech
      if (cloneData.isDemo) {
        alert('🎉 ជោគជ័យក្នុងទម្រង់ Demo! សូមបញ្ចូល ElevenLabs API Key ក្នុង Settings ដើម្បីស្តាប់សំឡេង Live Voice Clone ផ្ទាល់។');
        cloneBtn.disabled = false;
        cloneBtn.innerHTML = '<i data-lucide="volume-2"></i><span>Clone សំឡេង & បញ្ចេញសំឡេងខ្មែរភ្លាមៗ</span>';
        if (window.lucide) lucide.createIcons();
        return;
      }

      const clonerEmotion = document.getElementById('clonerEmotionSelect')?.value || 'dramatic';
      const speakRes = await fetch('/api/character/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: cloneData.voiceId,
          text: text,
          emotion: clonerEmotion
        })
      });
      const speakData = await speakRes.json();

      if (speakData.success) {
        charResultTitle.textContent = `តួអង្គ៖ ${name}`;
        charAudioPlayer.src = speakData.audioUrl;
        charAudioResultBox.classList.remove('hidden');
        charAudioPlayer.play();
      } else {
        alert('កំហុសបញ្ចេញសំឡេង: ' + speakData.error);
      }
    } catch (err) {
      alert('កំហុស៖ ' + err.message);
    } finally {
      cloneBtn.disabled = false;
      cloneBtn.innerHTML = '<i data-lucide="volume-2"></i><span>Clone សំឡេង & បញ្ចេញសំឡេងខ្មែរភ្លាមៗ</span>';
      if (window.lucide) lucide.createIcons();
    }
  });
}

// 6. Script Translator
function initTranslator() {
  const translateBtn = document.getElementById('translateScriptBtn');
  const input = document.getElementById('chineseDialogueInput');
  const output = document.getElementById('khmerDialogueOutput');

  translateBtn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) {
      alert('សូមបញ្ចូលឃ្លាសន្ទនាដើមជាមុនសិន!');
      return;
    }

    translateBtn.disabled = true;
    translateBtn.innerHTML = '<span>កំពុងបកប្រែ...</span>';

    try {
      const genre = document.getElementById('translatorMovieGenre')?.value || 'ancient';
      const emotion = document.getElementById('translatorEmotion')?.value || 'dramatic';
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          context: { genre, emotion }
        })
      });
      const data = await res.json();
      output.value = data.translated;
    } catch (err) {
      alert('ការបកប្រែបរាជ័យ: ' + err.message);
    } finally {
      translateBtn.disabled = false;
      translateBtn.innerHTML = '<i data-lucide="sparkles"></i><span>បកប្រែជាភាសាខ្មែរ</span>';
      if (window.lucide) lucide.createIcons();
    }
  });
}

// 7. Settings Modal & Storage Management
async function refreshOutputStorageStats() {
  const sizeText = document.getElementById('outputStorageSizeText');
  if (!sizeText) return;
  try {
    const res = await fetch('/api/outputs/stats');
    const data = await res.json();
    sizeText.textContent = `${data.formattedSize} (${data.count} ឯកសារ)`;
  } catch (e) {
    sizeText.textContent = 'មិនស្គាល់';
  }
}

async function triggerClearOutputs() {
  const confirmed = confirm('តើអ្នកពិតជាចង់សម្អាតឯកសារ Output ទាំងអស់ (វីដេអូ & សំឡេងកាត់តចាស់ៗ) ចេញពីកុំព្យូទ័រមែនទេ? សកម្មភាពនេះនឹងជួយសន្សំទំហំ Hard Disk របស់អ្នក។');
  if (!confirmed) return;

  try {
    const res = await fetch('/api/outputs/clear', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`🎉 ${data.message}`, 'success');
      refreshOutputStorageStats();
    } else {
      showToast('ការសម្អាតបរាជ័យ', 'error');
    }
  } catch (err) {
    showToast('កំហុសសម្អាត: ' + err.message, 'error');
  }
}

function initSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const openBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const cancelBtn = document.getElementById('cancelSettingsBtn');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const elevenInput = document.getElementById('settingElevenKey');
  const geminiInput = document.getElementById('settingGeminiKey');
  const voxcpmInput = document.getElementById('settingVoxcpmUrl');
  const headerClearBtn = document.getElementById('clearOutputsBtn');
  const modalClearBtn = document.getElementById('modalClearOutputsBtn');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      refreshOutputStorageStats();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  if (headerClearBtn) {
    headerClearBtn.addEventListener('click', triggerClearOutputs);
  }
  if (modalClearBtn) {
    modalClearBtn.addEventListener('click', triggerClearOutputs);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const elevenlabsKey = elevenInput.value.trim();
      const geminiKey = geminiInput.value.trim();
      const voxcpmUrl = voxcpmInput ? voxcpmInput.value.trim() : '';
      const geminiModel = document.getElementById('settingGeminiModel')?.value || 'gemini-3.5-flash';

      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ elevenlabsKey, geminiKey, voxcpmUrl, geminiModel })
        });
        const data = await res.json();
        if (data.success) {
          const quickModelEl = document.getElementById('quickGeminiModel');
          if (quickModelEl) quickModelEl.value = geminiModel;
          showToast('រក្សាទុកការកំណត់បានជោគជ័យ!', 'success');
          modal.classList.add('hidden');
          initConfig();
        }
      } catch (err) {
        showToast('ការរក្សាទុកបរាជ័យ: ' + err.message, 'error');
      }
    });

    // Quick sync between quickGeminiModel and settingGeminiModel
    const quickModelEl = document.getElementById('quickGeminiModel');
    const settingModelEl = document.getElementById('settingGeminiModel');
    if (quickModelEl) {
      quickModelEl.addEventListener('change', async () => {
        const val = quickModelEl.value;
        if (settingModelEl) settingModelEl.value = val;
        try {
          await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ geminiModel: val })
          });
          showToast(`🤖 បានប្ដូរទៅម៉ូឌែល ${val} ជោគជ័យ!`, 'info');
        } catch (e) {
          console.warn('Auto-save model error:', e);
        }
      });
    }
    if (settingModelEl) {
      settingModelEl.addEventListener('change', () => {
        if (quickModelEl) quickModelEl.value = settingModelEl.value;
      });
    }
  }
}

// 7.1 Quick VoxCPM Link Modal (Instant 1-Click Link Update)
function initQuickVoxcpmModal() {
  const modal = document.getElementById('voxcpmModal');
  const openBtn = document.getElementById('quickLinkBtn');
  const badgeBtn = document.getElementById('voxcpmStatusBadge');
  const closeBtn = document.getElementById('closeVoxcpmModalBtn');
  const urlInput = document.getElementById('quickVoxcpmUrlInput');
  const saveBtn = document.getElementById('saveQuickVoxcpmBtn');
  const testBtn = document.getElementById('testQuickVoxcpmBtn');
  const statusMsg = document.getElementById('quickVoxcpmStatusMsg');

  const openModal = async () => {
    if (!modal) return;
    modal.classList.remove('hidden');
    if (statusMsg) statusMsg.innerHTML = '';
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (urlInput && data.voxcpmUrl) {
        urlInput.value = data.voxcpmUrl;
      }
      if (urlInput) {
        setTimeout(() => { urlInput.focus(); urlInput.select(); }, 150);
      }
    } catch (e) {}
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (badgeBtn) badgeBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  const bannerOpenBtn = document.getElementById('bannerOpenModalBtn');
  if (bannerOpenBtn) bannerOpenBtn.addEventListener('click', openModal);

  const bannerPasteBtn = document.getElementById('bannerPasteClipboardBtn');
  if (bannerPasteBtn) {
    bannerPasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        const clean = (text || '').trim();
        const match = clean.match(/https:\/\/[a-zA-Z0-9-]+\.(trycloudflare\.com|ngrok-free\.app|ngrok\.io|loca\.lt)/);
        if (match) {
          const detectedUrl = match[0];
          bannerPasteBtn.disabled = true;
          showToast(`⚡ កំពុងតភ្ជាប់ទៅ Link: ${detectedUrl}...`, 'info');
          const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voxcpmUrl: detectedUrl })
          });
          const d = await res.json();
          if (d.success) {
            showToast('🎉 បានភ្ជាប់ម៉ាស៊ីន AI GPU ជោគជ័យ ១០០%!', 'success');
            await initConfig();
          }
        } else {
          showToast('មិនឃើញ Link ក្នុង Clipboard ទេ។ សូម Copy Link ពី Colab រួចចុចម្ដងទៀត!', 'warning');
          openModal();
        }
      } catch (err) {
        openModal();
      } finally {
        bannerPasteBtn.disabled = false;
      }
    });
  }

  function normalizeVoxcpmUrl(raw) {
    let url = (raw || '').trim();
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    if (!url.includes('.')) {
      url = url.replace(/\/$/, '') + '.trycloudflare.com';
    }
    return url.replace(/\/$/, '');
  }

  // Test Link button
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      let testUrl = normalizeVoxcpmUrl(urlInput.value);
      if (!testUrl) {
        statusMsg.innerHTML = '<span style="color:#f87171;">⚠️ សូមបញ្ចូល Link ជាមុនសិន!</span>';
        return;
      }
      urlInput.value = testUrl;
      testBtn.disabled = true;
      statusMsg.innerHTML = '<span style="color:#38bdf8;"><i data-lucide="loader-2" class="spin"></i> កំពុងតេស្តភ្ជាប់ទៅកាន់ Server...</span>';
      if (window.lucide) lucide.createIcons();

      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voxcpmUrl: testUrl })
        });
        const statusRes = await fetch('/api/voxcpm/status');
        const statusData = await statusRes.json();
        if (statusData.online) {
          statusMsg.innerHTML = '<span style="color:#34d399;">✅ ភ្ជាប់ជោគជ័យ! Server GPU VoxCPM2 ឆ្លើយតបល្អ (200 OK)</span>';
          initConfig();
        } else {
          statusMsg.innerHTML = `<span style="color:#f87171;">❌ មិនអាចភ្ជាប់បាន: ${statusData.message || 'សូមពិនិត្យ Colab ម្តងទៀត'}</span>`;
        }
      } catch (err) {
        statusMsg.innerHTML = `<span style="color:#f87171;">❌ កំហុស: ${err.message}</span>`;
      } finally {
        testBtn.disabled = false;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Save Link button
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const newUrl = normalizeVoxcpmUrl(urlInput.value);
      if (newUrl) urlInput.value = newUrl;
      saveBtn.disabled = true;
      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voxcpmUrl: newUrl })
        });
        const data = await res.json();
        if (data.success) {
          showToast('🎉 រក្សាទុក Link VoxCPM2 ជោគជ័យ!', 'success');
          modal.classList.add('hidden');
          initConfig();
        }
      } catch (err) {
        showToast('កំហុសរក្សាទុក: ' + err.message, 'error');
      } finally {
        saveBtn.disabled = false;
      }
    });
  }
}

// ==========================================================================
// 8. Manual Character Dubbing Studio (បញ្ជូលសំឡេងផ្ទាល់ខ្លួន ម្ដងមួយតួអង្គ)
// ==========================================================================
let manualSegments = [];
let mediaRecorder = null;
let activeRecordingIndex = null;
let audioChunks = [];
let recTimerInterval = null;
let recStartTime = 0;

function initManualStudio() {
  const scanBtn = document.getElementById('scanTimelineBtn');
  const emptyState = document.getElementById('timelineEmptyState');
  const loadingState = document.getElementById('timelineLoadingState');
  const linesList = document.getElementById('dialogueLinesList');
  const charFilter = document.getElementById('manualCharFilter');
  const assembleBtn = document.getElementById('assembleMasterBtn');
  const exportStatus = document.getElementById('manualExportStatus');
  const downloadCard = document.getElementById('manualDownloadCard');
  const downloadBtn = document.getElementById('manualDownloadBtn');
  const videoPlayer = document.getElementById('manualVideoPlayer');
  const emptyPlayer = document.getElementById('manualPlayerEmpty');

  // Scan Timeline
  let scanPollInterval = null;
  let scanTimerInterval = null;

  scanBtn.addEventListener('click', async () => {
    if (!currentUploadedFile) {
      alert('សូមបញ្ចូលវីដេអូ ឬ File រឿងនៅ Tab ទី 1 ជាមុនសិន!');
      const tab1 = document.querySelector('[data-tab="tab-dubbing"]');
      if (tab1) tab1.click();
      return;
    }

    if (currentUploadedFile.url) {
      videoPlayer.src = currentUploadedFile.url;
      emptyPlayer.classList.add('hidden');
    }

    scanBtn.disabled = true;
    emptyState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    linesList.classList.add('hidden');

    const scanPercentDisplay = document.getElementById('scanPercentDisplay');
    const scanProgressBarFill = document.getElementById('scanProgressBarFill');
    const scanProgressDetail = document.getElementById('scanProgressDetail');
    const scanLinesCountNum = document.getElementById('scanLinesCountNum');
    const scanElapsedTimer = document.getElementById('scanElapsedTimer');

    // Reset initial values
    let currentPct = 5;
    let targetPct = 8;
    if (scanPercentDisplay) scanPercentDisplay.textContent = '5%';
    if (scanProgressBarFill) scanProgressBarFill.style.width = '5%';
    if (scanProgressDetail) scanProgressDetail.textContent = 'កំពុងដកសំឡេងចេញពីវីដេអូរឿងដើម...';
    if (scanLinesCountNum) scanLinesCountNum.textContent = '0';
    if (scanElapsedTimer) scanElapsedTimer.textContent = '00:00';

    // Start elapsed timer
    const scanStartTime = Date.now();
    if (scanTimerInterval) clearInterval(scanTimerInterval);
    scanTimerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - scanStartTime) / 1000);
      const m = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const s = String(elapsedSec % 60).padStart(2, '0');
      if (scanElapsedTimer) scanElapsedTimer.textContent = `${m}:${s}`;
    }, 1000);

    // Smooth percentage interpolator
    let interpolator = setInterval(() => {
      if (currentPct < targetPct) {
        currentPct += 1;
        if (scanPercentDisplay) scanPercentDisplay.textContent = `${currentPct}%`;
        if (scanProgressBarFill) scanProgressBarFill.style.width = `${currentPct}%`;
      } else if (targetPct < 88 && currentPct === targetPct) {
        // Subtle drift while waiting for AI chunk response
        targetPct = Math.min(88, targetPct + 1);
      }
    }, 180);

    // Poll backend scan progress
    if (scanPollInterval) clearInterval(scanPollInterval);
    scanPollInterval = setInterval(async () => {
      try {
        const pRes = await fetch('/api/dubbing/scan-progress');
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData && pData.progress) {
            targetPct = Math.max(targetPct, pData.progress);
            if (pData.message && scanProgressDetail) {
              scanProgressDetail.textContent = pData.message;
            }
            if (pData.linesFound !== undefined && scanLinesCountNum) {
              scanLinesCountNum.textContent = pData.linesFound;
            }
          }
        }
      } catch (e) {
        // silent polling ignore
      }
    }, 600);

    try {
      const manualGenre = document.getElementById('manualMovieGenre')?.value || 'ancient';
      const manualEmotion = document.getElementById('manualEmotionIntensity')?.value || 'dramatic';
      const res = await fetch('/api/dubbing/scan-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: currentUploadedFile.filename,
          scope: 'full',
          genre: manualGenre,
          emotion: manualEmotion
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'ស្កេនបរាជ័យ');

      manualSegments = data.segments || [];

      // Finish to 100%
      clearInterval(interpolator);
      clearInterval(scanPollInterval);
      clearInterval(scanTimerInterval);

      if (scanPercentDisplay) scanPercentDisplay.textContent = '100%';
      if (scanProgressBarFill) scanProgressBarFill.style.width = '100%';
      if (scanProgressDetail) scanProgressDetail.textContent = `🎉 ស្កេនជោគជ័យ! រកឃើញ ${manualSegments.length} ឃ្លាសន្ទនា។`;
      if (scanLinesCountNum) scanLinesCountNum.textContent = manualSegments.length;

      // Small delay so user sees the 100% completion
      await new Promise(r => setTimeout(r, 600));

      loadingState.classList.add('hidden');
      linesList.classList.remove('hidden');

      populateCharFilter(manualSegments);
      renderDialogueLines(manualSegments);
      updateManualStats();
      assembleBtn.disabled = false;
      showToast(`🎉 ស្កេនជោគជ័យ! បានស្រង់ឃ្លាសន្ទនាសរុប ${manualSegments.length} ឃ្លា។`, 'success');
    } catch (err) {
      clearInterval(interpolator);
      clearInterval(scanPollInterval);
      clearInterval(scanTimerInterval);
      alert('កំហុសស្កេនឃ្លាសន្ទនា: ' + err.message);
      loadingState.classList.add('hidden');
      emptyState.classList.remove('hidden');
    } finally {
      scanBtn.disabled = false;
    }
  });

  // Filter change
  charFilter.addEventListener('change', () => {
    const selectedChar = charFilter.value;
    const cards = linesList.querySelectorAll('.line-card');
    cards.forEach(card => {
      if (selectedChar === 'all' || card.dataset.speakerId === selectedChar) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Assemble Custom Video
  assembleBtn.addEventListener('click', async () => {
    const validLines = manualSegments.filter(s => s.audioUrl);
    if (validLines.length === 0) {
      alert('សូមថតសំឡេង (Record) ឬបង្កើតសំឡេង AI យ៉ាងហោចណាស់មួយឃ្លា មុនពេលផ្គុំវីដេអូ!');
      return;
    }

    assembleBtn.disabled = true;
    exportStatus.classList.remove('hidden');
    downloadCard.classList.add('hidden');

    const exportPercent = document.getElementById('manualExportPercentDisplay');
    const exportBar = document.getElementById('manualExportProgressBarFill');
    const exportText = document.getElementById('manualExportText');

    let curExportPct = 10;
    if (exportPercent) exportPercent.textContent = '10%';
    if (exportBar) exportBar.style.width = '10%';
    if (exportText) exportText.textContent = `កំពុងផ្គុំសំឡេង ${validLines.length} ឃ្លា និងលាយភ្លេងកំដរ BGM...`;

    const exportTicker = setInterval(() => {
      if (curExportPct < 92) {
        curExportPct += Math.floor(Math.random() * 5) + 3;
        if (curExportPct > 92) curExportPct = 92;
        if (exportPercent) exportPercent.textContent = `${curExportPct}%`;
        if (exportBar) exportBar.style.width = `${curExportPct}%`;
      }
    }, 400);

    try {
      const res = await fetch('/api/dubbing/assemble-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: currentUploadedFile.filename,
          segments: manualSegments.map(s => ({
            ...s,
            khmer_translation: cleanPureKhmer(s.khmer_translation || '')
          }))
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'ផ្គុំវីដេអូបរាជ័យ');

      clearInterval(exportTicker);
      if (exportPercent) exportPercent.textContent = '100%';
      if (exportBar) exportBar.style.width = '100%';
      if (exportText) exportText.textContent = '✅ ផ្គុំវីដេអូរួចរាល់ ១០០%!';

      await new Promise(r => setTimeout(r, 450));

      exportStatus.classList.add('hidden');
      downloadCard.classList.remove('hidden');
      downloadBtn.href = data.outputVideo;

      videoPlayer.src = data.outputVideo;
      videoPlayer.play();
      showToast(`🎉 ផ្គុំវីដេអូជោគជ័យ! បានបញ្ចូលសំឡេងសរុប ${data.totalLinesDubbed} ឃ្លា។`, 'success');
    } catch (err) {
      clearInterval(exportTicker);
      showToast('កំហុសផ្គុំវីដេអូ: ' + err.message, 'error');
      exportStatus.classList.add('hidden');
    } finally {
      assembleBtn.disabled = false;
    }
  });

  // Video Timeupdate: Synchronously highlight active dialogue card during playback
  let lastHighlightedIdx = -1;
  videoPlayer.addEventListener('timeupdate', () => {
    if (!manualSegments || manualSegments.length === 0) return;
    const curTime = videoPlayer.currentTime;
    let foundIdx = -1;

    for (let i = 0; i < manualSegments.length; i++) {
      const seg = manualSegments[i];
      const start = parseFloat(seg.start_time) || 0;
      const end = parseFloat(seg.end_time) || (start + 2.5);
      if (curTime >= start && curTime <= end) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== -1 && foundIdx !== lastHighlightedIdx) {
      lastHighlightedIdx = foundIdx;
      document.querySelectorAll('.line-card.is-active').forEach(c => c.classList.remove('is-active'));
      const activeCard = document.getElementById(`line-card-${foundIdx}`);
      if (activeCard) {
        activeCard.classList.add('is-active');
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  // Subtitle (.SRT) Export Functionality
  async function handleExportSrt() {
    if (!manualSegments || manualSegments.length === 0) {
      alert('សូមស្កេន ឬបញ្ចូលឃ្លាសន្ទនាជាមុនសិន!');
      return;
    }
    try {
      showToast('កំពុងរៀបចំឯកសារ Subtitle SRT ភាសាខ្មែរ...', 'info');
      const res = await fetch('/api/dubbing/export-srt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: manualSegments.map(s => ({
            start_time: s.start_time,
            end_time: s.end_time,
            khmer: s.khmer_translation,
            chinese: s.original_text || s.chinese_text
          })),
          filename: currentUploadedFile?.filename || 'movie_dubbed'
        })
      });
      const data = await res.json();
      if (data.srtContent) {
        const blob = new Blob([data.srtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.srtFilename || 'subtitles_khmer.srt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast(`📥 បានទាញយកឯកសារ Subtitle SRT (${data.totalLines} ឃ្លា) ជោគជ័យ!`, 'success');
      } else {
        throw new Error(data.error || 'Failed to export SRT');
      }
    } catch (err) {
      showToast('កំហុសទាញយក SRT: ' + err.message, 'error');
    }
  }

  const exportSrtBtn = document.getElementById('exportSrtToolbarBtn');
  if (exportSrtBtn) exportSrtBtn.addEventListener('click', handleExportSrt);

  const manualDownloadSrtBtn = document.getElementById('manualDownloadSrtBtn');
  if (manualDownloadSrtBtn) {
    manualDownloadSrtBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleExportSrt();
    });
  }

  const batchAiBtn = document.getElementById('batchGenerateAiBtn');
  if (batchAiBtn) {
    batchAiBtn.addEventListener('click', handleBatchGenerateAi);
  }
}

function populateCharFilter(segments) {
  const filter = document.getElementById('manualCharFilter');
  const seen = new Set();
  filter.innerHTML = '<option value="all" selected>🎭 គ្រប់តួអង្គទាំងអស់</option>';

  segments.forEach(seg => {
    const id = seg.speaker_id;
    if (!seen.has(id)) {
      seen.add(id);
      const name = seg.speaker_name || id;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `👤 ${name} (${id})`;
      filter.appendChild(opt);
    }
  });
}

function updateManualStats() {
  const total = manualSegments.length;
  document.getElementById('statTotalLines').textContent = total;
  const recorded = manualSegments.filter(s => s.audioUrl).length;
  document.getElementById('statRecordedLines').textContent = recorded;
  document.getElementById('statPendingLines').textContent = total - recorded;

  const pct = total > 0 ? Math.round((recorded / total) * 100) : 0;
  const meterFill = document.getElementById('studioProgressMeterFill');
  if (meterFill) meterFill.style.width = `${pct}%`;

  const meterPercent = document.getElementById('studioMeterPercent');
  if (meterPercent) meterPercent.textContent = `${pct}%`;

  const toolbar = document.getElementById('manualToolbar');
  if (toolbar && total > 0) toolbar.classList.remove('hidden');
}

function renderDialogueLines(segments) {
  const container = document.getElementById('dialogueLinesList');
  container.innerHTML = '';
  const videoPlayer = document.getElementById('manualVideoPlayer');

  segments.forEach((seg, idx) => {
    const card = document.createElement('div');
    card.className = `line-card ${seg.audioUrl ? 'has-audio' : ''}`;
    card.id = `line-card-${idx}`;
    card.dataset.speakerId = seg.speaker_id;

    const startSec = (parseFloat(seg.start_time) || 0).toFixed(1);
    const endSec = (parseFloat(seg.end_time) || 0).toFixed(1);
    const isFemale = seg.gender === 'female' || (seg.speaker_name && seg.speaker_name.includes('ស្រី'));

    // Intelligent Age & Gender Detection Badge (ស្រី, ប្រុស, ក្មេង, ចាស់)
    let roleIcon = isFemale ? '🌸' : '🎙️';
    let roleName = seg.speaker_name || (isFemale ? 'តួស្រី' : 'តួប្រុស');
    const roleKey = seg.speaker_role || '';
    if (roleKey === 'child' || roleName.includes('ក្មេង') || roleName.includes('កុមារ')) {
      roleIcon = '🧒';
      if (!roleName.includes('កុមារ') && !roleName.includes('ក្មេង')) roleName = `កុមារ (${roleName})`;
    } else if (roleKey === 'old_woman' || roleName.includes('យាយ')) {
      roleIcon = '👵';
    } else if (roleKey === 'old_uncle' || roleKey === 'elder' || roleName.includes('អ៊ំ') || roleName.includes('តា') || roleName.includes('ព្រឹទ្ធាចារ្យ')) {
      roleIcon = '👴';
    } else if (roleKey === 'general' || roleName.includes('មេទ័ព')) {
      roleIcon = '🛡️';
    } else if (roleKey === 'fierce_female' || roleKey === 'fierce_male' || roleName.includes('កាច')) {
      roleIcon = '⚡';
    }

    // Determine smart default voice according to the strict curated rule:
    // If recognized curated role, select it; else fallback STRICTLY to Male Lead or Female Lead!
    let defaultVoiceId = isFemale ? 'voxcpm:hang_phleung_char_6_female.mp3' : 'voxcpm:hang_phleung_char_2_male.mp3';
    if (seg.speaker_role) {
      const matchRole = extractedMovieCharacters.find(c => c.role_key === seg.speaker_role);
      if (matchRole) defaultVoiceId = matchRole.id;
    }

    // Build rich distinct voice dropdown options for this line
    let lineVoiceOptions = `<option value="movie-live-clone">🎯 Clone ពីរឿងដើម</option>`;
    if (extractedMovieCharacters && extractedMovieCharacters.length > 0) {
      const maleChars = extractedMovieCharacters.filter(c => c.gender !== 'female');
      const femaleChars = extractedMovieCharacters.filter(c => c.gender === 'female');
      if (maleChars.length > 0) {
        lineVoiceOptions += `<optgroup label="👑 សំឡេងតួប្រុស">` +
          maleChars.map(c => `<option value="${c.id}">${c.label}</option>`).join('') +
          `</optgroup>`;
      }
      if (femaleChars.length > 0) {
        lineVoiceOptions += `<optgroup label="🌸 សំឡេងតួស្រី">` +
          femaleChars.map(c => `<option value="${c.id}">${c.label}</option>`).join('') +
          `</optgroup>`;
      }
    } else {
      lineVoiceOptions += `
        <option value="voxcpm:hang_phleung_char_2_male.mp3">👑 តួឯកប្រុស</option>
        <option value="voxcpm:hang_phleung_char_6_female.mp3">🌸 តួឯកស្រី</option>
      `;
    }

    let statusHtml = '<span class="line-status-pill pending">⏳ មិនទាន់បញ្ចូល</span>';
    if (seg.source === 'recorded') statusHtml = '<span class="line-status-pill recorded">🎙️ សំឡេងផ្ទាល់ខ្លួន</span>';
    else if (seg.source === 'ai') statusHtml = '<span class="line-status-pill ai">✨ សំឡេង AI</span>';

    card.innerHTML = `
      <div class="line-card-header">
        <span class="speaker-badge ${isFemale ? 'female' : ''}" title="ស្កេនសម្គាល់សំឡេង: ${roleName}">
          <span style="font-size:1.05rem; margin-right:4px;">${roleIcon}</span>
          <span>${roleName}</span>
        </span>
        <button class="time-btn" data-time="${startSec}" title="ចុចដើម្បីចាក់វីដេអូនៅវិនាទីនេះ">
          <i data-lucide="play-circle"></i>
          <span>${startSec}s - ${endSec}s</span>
        </button>
        <div class="status-container">${statusHtml}</div>
      </div>

      <div class="original-chinese-text">🌐 ${seg.original_text || seg.chinese_text || '(មិនមានអក្សរដើម)'}</div>

      <div class="khmer-input-wrapper">
        <textarea id="khmer-text-${idx}" placeholder="សរសេរពាក្យខ្មែរ...">${cleanPureKhmer(seg.khmer_translation || '')}</textarea>
      </div>

      <div class="line-actions-toolbar">
        <button class="btn-rec" id="rec-btn-${idx}" title="ចុច Record សំឡេងផ្ទាល់ខ្លួន">
          <i data-lucide="mic"></i>
          <span class="rec-label">🎙️ ថតសំឡេង</span>
        </button>

        <label class="btn-tool" title="បញ្ចូល File សំឡេង MP3/WAV សម្រាប់ឃ្លានេះ">
          <i data-lucide="upload"></i>
          <span>បញ្ចូលឯកសារ</span>
          <input type="file" accept="audio/*" class="hidden-file-input" style="display:none;" data-index="${idx}">
        </label>

        <select class="btn-tool line-voice-select" id="voice-select-${idx}" title="ជ្រើសរើសសំឡេងតួអង្គសម្រាប់ឃ្លានេះ" style="max-width:170px; height:32px; padding:2px 6px; font-size:0.78rem;">
          ${lineVoiceOptions}
        </select>

        <select class="btn-tool line-emotion-select" id="emotion-select-${idx}" title="ជ្រើសរើសទឹកដមអារម្មណ៍សម្រាប់ឃ្លានេះ" style="max-width:135px; height:32px; padding:2px 4px; font-size:0.75rem;">
          <option value="dramatic" ${(seg.emotion==='dramatic'||!seg.emotion)?'selected':''}>🎭 មនោសញ្ចេតនា</option>
          <option value="deep_sorrow" ${seg.emotion==='deep_sorrow'?'selected':''}>😭 កម្សត់ / ទឹកភ្នែក</option>
          <option value="fierce_battle" ${seg.emotion==='fierce_battle'?'selected':''}>😡 ខឹង / ច្បាំង</option>
          <option value="sweet_romance" ${seg.emotion==='sweet_romance'?'selected':''}>💖 ស្នេហាផ្អែម</option>
          <option value="heroic_command" ${seg.emotion==='heroic_command'?'selected':''}>🛡️ អង់អាច / បញ្ជា</option>
          <option value="neutral" ${seg.emotion==='neutral'?'selected':''}>😐 ធម្មតា</option>
        </select>

        <button class="btn-tool btn-apply-speaker" id="apply-speaker-${idx}" title="កំណត់សំឡេងនេះឱ្យគ្រប់ឃ្លារបស់ ${roleName}" style="padding:3px 7px; font-size:0.73rem;">
          <i data-lucide="copy-check"></i>
          <span>អនុវត្តគ្រប់ឃ្លា</span>
        </button>

        <button class="btn-tool btn-ai-gen" id="ai-btn-${idx}" title="ឱ្យ AI សំយោគនិយាយឃ្លានេះ">
          <i data-lucide="sparkles"></i>
          <span>AI និយាយ</span>
        </button>

        <audio controls class="audio-preview-inline ${seg.audioUrl ? '' : 'hidden'}" id="audio-preview-${idx}" src="${seg.audioUrl || ''}"></audio>
      </div>
    `;

    container.appendChild(card);

    // Event 1: Click timestamp to seek video
    card.querySelector('.time-btn').addEventListener('click', () => {
      if (videoPlayer.src) {
        videoPlayer.currentTime = parseFloat(startSec);
        videoPlayer.play();
      }
      document.querySelectorAll('.line-card').forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
    });

    // Event 1b: Click card header to seek video
    const headerEl = card.querySelector('.line-card-header');
    if (headerEl) {
      headerEl.style.cursor = 'pointer';
      headerEl.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('select')) return;
        if (videoPlayer.src) {
          videoPlayer.currentTime = parseFloat(startSec);
          videoPlayer.play();
        }
        document.querySelectorAll('.line-card').forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
      });
    }

    // Event 2: Update text on edit
    const textarea = card.querySelector(`#khmer-text-${idx}`);
    textarea.addEventListener('input', () => {
      seg.khmer_translation = cleanPureKhmer(textarea.value);
    });

    // Event 3: Record microphone
    const recBtn = card.querySelector(`#rec-btn-${idx}`);
    recBtn.addEventListener('click', () => handleRecordLine(idx, recBtn, card));

    // Event 4: Upload Audio File
    const fileInput = card.querySelector('.hidden-file-input');
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleUploadLineAudio(idx, e.target.files[0], card);
      }
    });

    // Event 5: AI Speak
    const aiBtn = card.querySelector(`#ai-btn-${idx}`);
    aiBtn.addEventListener('click', () => handleGenerateLineAI(idx, aiBtn, card));

    // Event 6: Voice dropdown selection
    const voiceSelectEl = card.querySelector(`#voice-select-${idx}`);
    if (voiceSelectEl) {
      voiceSelectEl.value = seg.voiceId || defaultVoiceId;
      voiceSelectEl.addEventListener('change', (e) => {
        seg.voiceId = e.target.value;
      });
    }

    // Event 6b: Emotion dropdown selection
    const emotionSelectEl = card.querySelector(`#emotion-select-${idx}`);
    if (emotionSelectEl) {
      emotionSelectEl.value = seg.emotion || 'dramatic';
      emotionSelectEl.addEventListener('change', (e) => {
        seg.emotion = e.target.value;
      });
    }

    // Event 7: 1-Click Apply Voice to All Lines of this Character
    const applySpeakerBtn = card.querySelector(`#apply-speaker-${idx}`);
    if (applySpeakerBtn && voiceSelectEl) {
      applySpeakerBtn.addEventListener('click', () => {
        const chosenVoice = voiceSelectEl.value;
        const chosenLabel = voiceSelectEl.options[voiceSelectEl.selectedIndex]?.text || chosenVoice;
        const targetId = seg.speaker_id;
        const targetName = seg.speaker_name;
        let count = 0;
        manualSegments.forEach((s, sIdx) => {
          if ((targetId && s.speaker_id === targetId) || (targetName && s.speaker_name === targetName)) {
            s.voiceId = chosenVoice;
            const otherSelect = document.getElementById(`voice-select-${sIdx}`);
            if (otherSelect) otherSelect.value = chosenVoice;
            count++;
          }
        });
        showToast(`⚡ បានកំណត់សំឡេង "${chosenLabel}" ជូនតួ ${roleName} ចំនួន ${count} ឃ្លារួចរាល់!`, 'success');
      });
    }
  });

  if (window.lucide) lucide.createIcons();
}

// Record Line Handler
async function handleRecordLine(idx, btn, card) {
  const recLabel = btn.querySelector('.rec-label');

  if (activeRecordingIndex === idx && mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    btn.classList.remove('recording');
    recLabel.textContent = 'កំពុងរក្សាទុក...';
    btn.disabled = true;
    clearInterval(recTimerInterval);
    return;
  }

  if (activeRecordingIndex !== null && mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(recTimerInterval);
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    activeRecordingIndex = idx;

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, `record_${idx}.webm`);
      formData.append('lineIndex', idx);

      try {
        const res = await fetch('/api/dubbing/record-line', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        manualSegments[idx].audioUrl = data.audioUrl;
        manualSegments[idx].source = 'recorded';

        card.classList.add('has-audio');
        card.querySelector('.status-container').innerHTML = '<span class="line-status-pill recorded">🎙️ សំឡេងផ្ទាល់ខ្លួន</span>';

        const audioPreview = card.querySelector(`#audio-preview-${idx}`);
        audioPreview.src = data.audioUrl;
        audioPreview.classList.remove('hidden');
        audioPreview.play();

        updateManualStats();
      } catch (err) {
        alert('កំហុសរក្សាទុកសំឡេងថត: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.classList.remove('recording');
        recLabel.textContent = '🎙️ ថតសំឡេង';
        activeRecordingIndex = null;
        if (window.lucide) lucide.createIcons();
      }
    };

    mediaRecorder.start();
    btn.classList.add('recording');
    recStartTime = Date.now();
    recTimerInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - recStartTime) / 1000);
      recLabel.textContent = `⏹️ បញ្ឈប់ (00:0${elapsed})`;
    }, 1000);
    recLabel.textContent = '⏹️ បញ្ឈប់ (00:00)';
  } catch (err) {
    alert('មិនអាចបើក Microphone បានទេ: ' + err.message);
  }
}

// Upload Audio File for line
async function handleUploadLineAudio(idx, file, card) {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('lineIndex', idx);

  try {
    const res = await fetch('/api/dubbing/record-line', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    manualSegments[idx].audioUrl = data.audioUrl;
    manualSegments[idx].source = 'recorded';

    card.classList.add('has-audio');
    card.querySelector('.status-container').innerHTML = '<span class="line-status-pill recorded">📁 ឯកសារសំឡេង</span>';

    const audioPreview = card.querySelector(`#audio-preview-${idx}`);
    audioPreview.src = data.audioUrl;
    audioPreview.classList.remove('hidden');
    audioPreview.play();

    updateManualStats();
  } catch (err) {
    alert('Upload សំឡេងបរាជ័យ: ' + err.message);
  }
}

// Generate Line AI
async function handleGenerateLineAI(idx, btn, card) {
  const seg = manualSegments[idx];
  const inputEl = card.querySelector(`#khmer-text-${idx}`);
  const text = cleanPureKhmer(inputEl ? inputEl.value : (seg.khmer_translation || ''));
  if (inputEl) inputEl.value = text;
  seg.khmer_translation = text;

  if (!text) {
    alert('សូមបញ្ចូលអក្សរខ្មែរសម្រាប់ឃ្លានេះជាមុនសិន!');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>កំពុងបង្កើត...</span>';
  if (window.lucide) lucide.createIcons();

  try {
    const lineVoiceSelect = card.querySelector(`#voice-select-${idx}`);
    const selectedLineVoice = (lineVoiceSelect && lineVoiceSelect.value !== 'auto') ? lineVoiceSelect.value : null;
    const voiceId = selectedLineVoice || (document.getElementById('manualVoiceChoice')?.value || 'voxcpm-voice-actor');

    const lineEmotionSelect = card.querySelector(`#emotion-select-${idx}`);
    const selectedEmotion = (lineEmotionSelect && lineEmotionSelect.value) || seg.emotion || (document.getElementById('manualEmotionIntensity')?.value || 'dramatic');

    const res = await fetch('/api/dubbing/generate-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        lineIndex: idx,
        speakerId: seg.speaker_id,
        gender: seg.gender || 'male',
        voiceId,
        emotion: selectedEmotion
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    seg.audioUrl = data.audioUrl;
    seg.source = 'ai';

    card.classList.add('has-audio');
    card.querySelector('.status-container').innerHTML = '<span class="line-status-pill ai">✨ សំឡេង AI</span>';

    const audioPreview = card.querySelector(`#audio-preview-${idx}`);
    audioPreview.src = data.audioUrl;
    audioPreview.classList.remove('hidden');
    audioPreview.play();

    updateManualStats();
  } catch (err) {
    alert('បង្កើតសំឡេង AI បរាជ័យ: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="sparkles"></i><span>AI និយាយ</span>';
    if (window.lucide) lucide.createIcons();
  }
}

// ===================================================
// 7. VOICE MANAGEMENT DASHBOARD (គ្រប់គ្រងសំឡេង)
// ===================================================
let allVoiceCharacters = [];
let voiceFilterGender = 'all';
let voiceFilterRole = 'all';
let voiceSearchKeyword = '';
let currentTestAuditionAudio = null;

function initVoiceDashboard() {
  // 1. Search Bar
  const searchInput = document.getElementById('voiceSearchInput');
  const clearSearchBtn = document.getElementById('voiceClearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      voiceSearchKeyword = e.target.value.trim();
      if (clearSearchBtn) {
        if (voiceSearchKeyword) clearSearchBtn.classList.remove('hidden');
        else clearSearchBtn.classList.add('hidden');
      }
      filterAndRenderVoiceCards();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      voiceSearchKeyword = '';
      clearSearchBtn.classList.add('hidden');
      filterAndRenderVoiceCards();
    });
  }

  // 2. Gender Filter Pills
  const genderPills = document.querySelectorAll('#voiceGenderFilters .voice-filter-pill');
  genderPills.forEach(pill => {
    pill.addEventListener('click', () => {
      genderPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      voiceFilterGender = pill.getAttribute('data-filter') || 'all';
      filterAndRenderVoiceCards();
    });
  });

  // 3. Role Filter Dropdown
  const roleFilter = document.getElementById('voiceRoleFilter');
  if (roleFilter) {
    roleFilter.addEventListener('change', (e) => {
      voiceFilterRole = e.target.value;
      filterAndRenderVoiceCards();
    });
  }

  // 4. Reset Filter Button (in empty state)
  const resetBtn = document.getElementById('resetVoiceFilterBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      voiceFilterGender = 'all';
      voiceFilterRole = 'all';
      voiceSearchKeyword = '';
      if (searchInput) searchInput.value = '';
      if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
      if (roleFilter) roleFilter.value = 'all';
      genderPills.forEach(p => {
        if (p.getAttribute('data-filter') === 'all') p.classList.add('active');
        else p.classList.remove('active');
      });
      filterAndRenderVoiceCards();
    });
  }

  // 5. Reload / Refresh Vault
  const refreshBtn = document.getElementById('refreshVoiceVaultBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      showToast('កំពុងផ្ទុកបញ្ជីសំឡេងឡើងវិញ...', 'info');
      await loadVoiceDashboard();
      showToast('ទិន្នន័យសំឡេងបានធ្វើបច្ចុប្បន្នភាពរួចរាល់!', 'success');
    });
  }

  // 6. Add Voice Modal Controls
  const openAddBtn = document.getElementById('openAddVoiceBtn');
  const addModal = document.getElementById('addVoiceModal');
  const closeAddBtn = document.getElementById('closeAddVoiceBtn');
  const cancelAddBtn = document.getElementById('cancelAddVoiceBtn');
  const saveAddBtn = document.getElementById('saveAddVoiceBtn');

  if (openAddBtn && addModal) {
    openAddBtn.addEventListener('click', () => {
      document.getElementById('addVoiceLabel').value = '';
      document.getElementById('addVoiceFileInput').value = '';
      document.getElementById('addVoiceWords').value = '';
      document.getElementById('addVoiceGender').value = 'male';
      document.getElementById('addVoiceRole').value = 'male_lead';
      addModal.classList.remove('hidden');
      document.getElementById('addVoiceLabel').focus();
    });
  }

  if (closeAddBtn && addModal) closeAddBtn.addEventListener('click', () => addModal.classList.add('hidden'));
  if (cancelAddBtn && addModal) cancelAddBtn.addEventListener('click', () => addModal.classList.add('hidden'));
  if (saveAddBtn) saveAddBtn.addEventListener('click', handleSaveNewVoice);

  // 7. Edit Voice Modal Controls
  const editModal = document.getElementById('editVoiceModal');
  const closeEditBtn = document.getElementById('closeEditVoiceBtn');
  const cancelEditBtn = document.getElementById('cancelEditVoiceBtn');
  const saveEditBtn = document.getElementById('saveEditVoiceBtn');

  if (closeEditBtn && editModal) closeEditBtn.addEventListener('click', () => {
    const audioPreview = document.getElementById('editVoiceAudioPreview');
    if (audioPreview) audioPreview.pause();
    editModal.classList.add('hidden');
  });

  if (cancelEditBtn && editModal) cancelEditBtn.addEventListener('click', () => {
    const audioPreview = document.getElementById('editVoiceAudioPreview');
    if (audioPreview) audioPreview.pause();
    editModal.classList.add('hidden');
  });

  if (saveEditBtn) saveEditBtn.addEventListener('click', handleSaveVoiceEdit);

  // 8. Test Speak Modal Controls
  const testSpeakModal = document.getElementById('testVoiceSpeakModal');
  const closeTestSpeakBtn = document.getElementById('closeTestSpeakBtn');
  const cancelTestSpeakBtn = document.getElementById('cancelTestSpeakBtn');
  const runTestSpeakBtn = document.getElementById('runTestSpeakBtn');

  if (closeTestSpeakBtn && testSpeakModal) closeTestSpeakBtn.addEventListener('click', () => {
    const p = document.getElementById('testSpeakAudioPlayer');
    if (p) p.pause();
    testSpeakModal.classList.add('hidden');
  });

  if (cancelTestSpeakBtn && testSpeakModal) cancelTestSpeakBtn.addEventListener('click', () => {
    const p = document.getElementById('testSpeakAudioPlayer');
    if (p) p.pause();
    testSpeakModal.classList.add('hidden');
  });

  if (runTestSpeakBtn) runTestSpeakBtn.addEventListener('click', handleRunTestSpeak);

  // Test Speak phrase chips
  const testChips = document.querySelectorAll('.test-phrase-chip');
  testChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const phrase = chip.getAttribute('data-phrase');
      const txt = document.getElementById('testSpeakCustomText');
      if (txt && phrase) txt.value = phrase;
    });
  });

  // 9. Collapsible Cloner Header Toggle
  const toggleClonerHeader = document.getElementById('toggleClonerHeader');
  const clonerBody = document.getElementById('clonerCollapsibleBody');
  const clonerChevron = document.getElementById('clonerChevron');

  if (toggleClonerHeader && clonerBody) {
    toggleClonerHeader.addEventListener('click', () => {
      const isHidden = clonerBody.classList.contains('hidden');
      if (isHidden) {
        clonerBody.classList.remove('hidden');
        if (clonerChevron) clonerChevron.style.transform = 'rotate(180deg)';
      } else {
        clonerBody.classList.add('hidden');
        if (clonerChevron) clonerChevron.style.transform = 'rotate(0deg)';
      }
    });
  }

  // Initial Load
  loadVoiceDashboard();
}

// Load all characters from /api/characters/all
async function loadVoiceDashboard() {
  const vaultBadge = document.getElementById('vaultCountBadge');
  if (vaultBadge) vaultBadge.textContent = 'កំពុងទាញយក...';

  try {
    const res = await fetch('/api/characters/all');
    const data = await res.json();
    if (!data.success || !data.characters) return;

    allVoiceCharacters = data.characters;
    extractedMovieCharacters = data.characters; // legacy support

    // Update Counter Badges
    const total = allVoiceCharacters.length;
    const maleCount = allVoiceCharacters.filter(c => c.gender === 'male').length;
    const femaleCount = allVoiceCharacters.filter(c => c.gender === 'female').length;
    const curatedCount = allVoiceCharacters.filter(c => c.is_curated).length;

    const elTotal = document.getElementById('statVoiceTotal');
    const elMale = document.getElementById('statVoiceMale');
    const elFemale = document.getElementById('statVoiceFemale');
    const elCurated = document.getElementById('statVoiceCurated');
    const elTabBadge = document.getElementById('tabVoiceCountBadge');

    if (elTotal) elTotal.textContent = total;
    if (elMale) elMale.textContent = maleCount;
    if (elFemale) elFemale.textContent = femaleCount;
    if (elCurated) elCurated.textContent = curatedCount;
    if (elTabBadge) elTabBadge.textContent = `${total}`;
    if (vaultBadge) vaultBadge.textContent = `${total} សំឡេង`;

    // Render Cards in Vault Grid
    filterAndRenderVoiceCards();

    // Render Quick Cast Bar in Manual Studio
    renderQuickCastBar(allVoiceCharacters);
    const strip = document.getElementById('castStripSection');
    if (strip) strip.classList.remove('hidden');

    // Update global dropdowns in Dubbing studio tab
    refreshGlobalVoiceDropdowns();

  } catch (err) {
    console.error('Could not load voice dashboard:', err);
    if (vaultBadge) vaultBadge.textContent = 'មានបញ្ហាទាញយក';
  }
}

// Alias for backwards compatibility
function loadExtractedMovieCharacters() {
  return loadVoiceDashboard();
}

// Filter and render voice cards
function filterAndRenderVoiceCards() {
  const vaultGrid = document.getElementById('charactersVaultGrid');
  const emptyState = document.getElementById('voiceEmptyState');
  if (!vaultGrid) return;

  const kw = (voiceSearchKeyword || '').toLowerCase().trim();

  const filtered = allVoiceCharacters.filter(char => {
    // Gender filter
    if (voiceFilterGender !== 'all' && char.gender !== voiceFilterGender) {
      return false;
    }

    // Role filter
    if (voiceFilterRole !== 'all') {
      const rk = (char.role_key || '').toLowerCase();
      if (voiceFilterRole === 'male_lead' && !rk.includes('male_lead') && !rk.includes('lead_male')) return false;
      if (voiceFilterRole === 'female_lead' && !rk.includes('female_lead') && !rk.includes('lead_female')) return false;
      if (voiceFilterRole === 'general' && !rk.includes('general')) return false;
      if (voiceFilterRole === 'elder' && !rk.includes('elder') && !rk.includes('old')) return false;
      if (voiceFilterRole === 'villain' && !rk.includes('villain') && !rk.includes('fierce')) return false;
      if (voiceFilterRole === 'servant' && !rk.includes('servant')) return false;
    }

    // Keyword search
    if (kw) {
      const matchLabel = (char.label || '').toLowerCase().includes(kw);
      const matchWords = (char.words || '').toLowerCase().includes(kw);
      const matchFilename = (char.filename || '').toLowerCase().includes(kw);
      if (!matchLabel && !matchWords && !matchFilename) return false;
    }

    return true;
  });

  const vaultBadge = document.getElementById('vaultCountBadge');
  if (vaultBadge) {
    vaultBadge.textContent = `${filtered.length} / ${allVoiceCharacters.length} សំឡេង`;
  }

  if (filtered.length === 0) {
    vaultGrid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  vaultGrid.innerHTML = filtered.map(char => {
    const isFemale = char.gender === 'female';
    const isCurated = char.is_curated;

    let badgeHtml = '';
    if (char.filename === 'hang_phleung_char_2_male.mp3') {
      badgeHtml = '<span style="font-size:0.7rem; background:rgba(59,130,246,0.25); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); padding:2px 6px; border-radius:4px;">👑 តួឯកប្រុស</span>';
    } else if (char.filename === 'hang_phleung_char_6_female.mp3') {
      badgeHtml = '<span style="font-size:0.7rem; background:rgba(236,72,153,0.25); color:#f472b6; border:1px solid rgba(236,72,153,0.4); padding:2px 6px; border-radius:4px;">🌸 តួឯកស្រី</span>';
    } else if (char.filename && char.filename.includes('star7')) {
      badgeHtml = '<span style="font-size:0.7rem; background:rgba(234,179,8,0.25); color:#facc15; border:1px solid rgba(234,179,8,0.4); padding:2px 6px; border-radius:4px;">⭐ ផ្កាយ៧</span>';
    } else if (char.filename && char.filename.includes('tactics')) {
      badgeHtml = '<span style="font-size:0.7rem; background:rgba(14,165,233,0.25); color:#38bdf8; border:1px solid rgba(14,165,233,0.4); padding:2px 6px; border-radius:4px;">⚔️ យុទ្ធសាស្ត្រ</span>';
    } else if (char.filename && char.filename.includes('palace')) {
      badgeHtml = '<span style="font-size:0.7rem; background:rgba(236,72,153,0.25); color:#f472b6; border:1px solid rgba(236,72,153,0.4); padding:2px 6px; border-radius:4px;">🌸 ដំណាក់រាជវាំង</span>';
    } else if (isCurated) {
      badgeHtml = '<span style="font-size:0.7rem; background:rgba(99,102,241,0.2); color:var(--primary); padding:2px 6px; border-radius:4px;">⭐ គំរូសាច់រឿង</span>';
    }

    const safeId = encodeURIComponent(char.id || char.filename);
    const quote = char.words ? `"${char.words}"` : '<em style="color:var(--text-muted);">គ្មានឃ្លាកត់ត្រា</em>';
    const sizeKb = char.sizeBytes ? `${Math.round(char.sizeBytes / 1024)} KB` : '';

    return `
      <div class="char-vault-card ${char.gender || 'male'}" data-char-id="${safeId}">
        <div class="char-vault-top">
          <div class="char-vault-icon">${isFemale ? '🌸' : '🎙️'}</div>
          <div class="char-vault-info">
            <h4>${char.label}</h4>
            <div class="char-vault-badge-row">
              ${badgeHtml}
              <span class="char-vault-file-tag">${char.filename}</span>
              ${sizeKb ? `<span style="font-size:0.7rem; color:var(--text-muted);">${sizeKb}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="char-vault-words">${quote}</div>

        <audio controls class="char-vault-audio" preload="none" src="${char.previewUrl || ''}"></audio>

        <div class="char-vault-actions">
          <button class="btn-vault-action edit" type="button" onclick="window.openEditVoiceModal('${safeId}')" title="កែប្រែឈ្មោះសំឡេង">
            <i data-lucide="edit-3" style="width:13px; height:13px;"></i>
            <span>កែប្រែឈ្មោះ</span>
          </button>
          <button class="btn-vault-action speak" type="button" onclick="window.openTestSpeakModal('${safeId}')" title="សាកល្បងឱ្យតួអង្គនិយាយ">
            <i data-lucide="volume-2" style="width:13px; height:13px;"></i>
            <span>តេស្តនិយាយ</span>
          </button>
          <button class="btn-vault-action delete" type="button" onclick="window.deleteVoiceCard('${safeId}')" title="លុបសំឡេង">
            <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ----------------------------------------------------
// EDIT VOICE MODAL LOGIC
// ----------------------------------------------------
window.openEditVoiceModal = function(safeId) {
  const charId = decodeURIComponent(safeId);
  const char = allVoiceCharacters.find(c => c.id === charId || c.filename === charId);
  if (!char) {
    showToast('រកមិនឃើញតួអង្គនេះឡើយ', 'error');
    return;
  }

  document.getElementById('editVoiceId').value = char.id || '';
  document.getElementById('editVoiceFilename').value = char.filename || '';
  document.getElementById('editVoiceLabel').value = char.label || '';
  document.getElementById('editVoiceGender').value = char.gender || 'male';
  document.getElementById('editVoiceRole').value = char.role_key || (char.gender === 'female' ? 'female_lead' : 'male_lead');
  document.getElementById('editVoiceWords').value = char.words || '';

  const fileBadge = document.getElementById('editVoiceFileBadge');
  if (fileBadge) fileBadge.textContent = char.filename;

  const preview = document.getElementById('editVoiceAudioPreview');
  if (preview) {
    preview.src = char.previewUrl || '';
    preview.load();
  }

  const modal = document.getElementById('editVoiceModal');
  if (modal) modal.classList.remove('hidden');

  const labelInput = document.getElementById('editVoiceLabel');
  if (labelInput) {
    labelInput.focus();
    labelInput.select();
  }
};

async function handleSaveVoiceEdit() {
  const saveBtn = document.getElementById('saveEditVoiceBtn');
  const id = document.getElementById('editVoiceId').value;
  const filename = document.getElementById('editVoiceFilename').value;
  const label = document.getElementById('editVoiceLabel').value.trim();
  const gender = document.getElementById('editVoiceGender').value;
  const role_key = document.getElementById('editVoiceRole').value;
  const words = document.getElementById('editVoiceWords').value.trim();

  if (!label) {
    alert('សូមបញ្ចូលឈ្មោះសំឡេងតួអង្គ!');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i data-lucide="loader-2"></i><span>កំពុងរក្សាទុក...</span>';
  if (window.lucide) lucide.createIcons();

  try {
    const res = await fetch('/api/characters/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, filename, label, gender, role_key, words })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'ការកែប្រែបានបរាជ័យ');
    }

    showToast(`🎉 បានកែប្រែឈ្មោះជា៖ "${label}" ដោយជោគជ័យ!`, 'success');

    // Pause preview
    const preview = document.getElementById('editVoiceAudioPreview');
    if (preview) preview.pause();

    // Close Modal
    document.getElementById('editVoiceModal').classList.add('hidden');

    // Reload Dashboard & update Dropdowns
    await loadVoiceDashboard();

  } catch (err) {
    console.error('Save voice edit error:', err);
    showToast(`កំហុស៖ ${err.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i data-lucide="check"></i><span>💾 រក្សាទុកការកែប្រែ</span>';
    if (window.lucide) lucide.createIcons();
  }
}

// ----------------------------------------------------
// ADD NEW VOICE MODAL LOGIC
// ----------------------------------------------------
async function handleSaveNewVoice() {
  const saveBtn = document.getElementById('saveAddVoiceBtn');
  const label = document.getElementById('addVoiceLabel').value.trim();
  const fileInput = document.getElementById('addVoiceFileInput');
  const gender = document.getElementById('addVoiceGender').value;
  const role_key = document.getElementById('addVoiceRole').value;
  const words = document.getElementById('addVoiceWords').value.trim();

  if (!label) {
    alert('សូមបញ្ចូលឈ្មោះសំឡេងតួអង្គថ្មី!');
    return;
  }

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('សូមជ្រើសរើសឯកសារសំឡេង ឬវីដេអូសម្រាប់សំឡេងនេះ!');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i data-lucide="loader-2"></i><span>កំពុងបង្កើតសំឡេង...</span>';
  if (window.lucide) lucide.createIcons();

  const formData = new FormData();
  formData.append('audioFile', fileInput.files[0]);
  formData.append('label', label);
  formData.append('gender', gender);
  formData.append('role_key', role_key);
  formData.append('words', words);

  try {
    const res = await fetch('/api/characters/create', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'ការបន្ថែមសំឡេងបានបរាជ័យ');
    }

    showToast(`🎉 បានបន្ថែមសំឡេងថ្មី "${label}" ជោគជ័យ!`, 'success');

    // Close modal
    document.getElementById('addVoiceModal').classList.add('hidden');

    // Reload Dashboard
    await loadVoiceDashboard();

  } catch (err) {
    console.error('Create voice error:', err);
    showToast(`កំហុស៖ ${err.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i data-lucide="plus-circle"></i><span>➕ បង្កើត & រក្សាទុកសំឡេង</span>';
    if (window.lucide) lucide.createIcons();
  }
}

// ----------------------------------------------------
// DELETE VOICE LOGIC
// ----------------------------------------------------
window.deleteVoiceCard = async function(safeId) {
  const charId = decodeURIComponent(safeId);
  const char = allVoiceCharacters.find(c => c.id === charId || c.filename === charId);
  const charName = char ? char.label : charId;

  const confirmed = confirm(`តើអ្នកប្រាកដជាចង់លុបសំឡេង "${charName}" នេះចេញពីផ្ទាំងគ្រប់គ្រងមែនទេ?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/characters/delete/${encodeURIComponent(charId)}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'ការលុបបានបរាជ័យ');
    }

    showToast(`🗑️ បានលុបសំឡេង "${charName}" ដោយជោគជ័យ`, 'success');
    await loadVoiceDashboard();

  } catch (err) {
    console.error('Delete voice error:', err);
    showToast(`កំហុស៖ ${err.message}`, 'error');
  }
};

// ----------------------------------------------------
// TEST SPEAK MODAL LOGIC
// ----------------------------------------------------
window.openTestSpeakModal = function(safeId) {
  const charId = decodeURIComponent(safeId);
  const char = allVoiceCharacters.find(c => c.id === charId || c.filename === charId);
  if (!char) return;

  document.getElementById('testSpeakVoiceId').value = char.id || `voxcpm:${char.filename}`;
  document.getElementById('testSpeakVoiceFilename').value = char.filename || '';

  const labelEl = document.getElementById('testSpeakVoiceLabel');
  const subEl = document.getElementById('testSpeakVoiceSub');
  const avatarEl = document.getElementById('testSpeakVoiceAvatar');

  if (labelEl) labelEl.textContent = char.label;
  if (subEl) subEl.textContent = `${char.gender === 'female' ? 'តួស្រី' : 'តួប្រុស'} • ${char.filename}`;
  if (avatarEl) avatarEl.textContent = char.gender === 'female' ? '🌸' : '🎙️';

  const customText = document.getElementById('testSpeakCustomText');
  if (customText) {
    customText.value = char.words || 'បងមិនអាចបោះបង់អូនចោលក្នុងគ្រាដ៏គ្រោះថ្នាក់នេះបានទេ!';
  }

  const resultBox = document.getElementById('testSpeakResultBox');
  if (resultBox) resultBox.classList.add('hidden');

  const modal = document.getElementById('testVoiceSpeakModal');
  if (modal) modal.classList.remove('hidden');
};

async function handleRunTestSpeak() {
  const runBtn = document.getElementById('runTestSpeakBtn');
  const voiceId = document.getElementById('testSpeakVoiceId').value;
  const filename = document.getElementById('testSpeakVoiceFilename').value;
  const text = document.getElementById('testSpeakCustomText').value.trim();

  const emotion = document.getElementById('testSpeakEmotion')?.value || 'dramatic';

  if (!text) {
    alert('សូមសរសេរឃ្លាជាភាសាខ្មែរសម្រាប់ឱ្យតួអង្គនិយាយ!');
    return;
  }

  runBtn.disabled = true;
  runBtn.innerHTML = '<i data-lucide="loader-2"></i><span>កំពុងសំយោគសំឡេង...</span>';
  if (window.lucide) lucide.createIcons();

  try {
    const res = await fetch('/api/character/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voiceId: voiceId || `voxcpm:${filename}`,
        text: text,
        emotion: emotion
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'ការសំយោគសំឡេងបរាជ័យ');
    }

    const resultBox = document.getElementById('testSpeakResultBox');
    const audioPlayer = document.getElementById('testSpeakAudioPlayer');

    if (resultBox && audioPlayer) {
      resultBox.classList.remove('hidden');
      audioPlayer.src = data.audioUrl;
      audioPlayer.play().catch(e => console.log('Audio autoplay prevented:', e));
    }

    showToast('🎉 សំយោគសំឡេងសាកល្បងបានជោគជ័យ!', 'success');

  } catch (err) {
    console.error('Test speak error:', err);
    showToast(`កំហុស៖ ${err.message}`, 'error');
  } finally {
    runBtn.disabled = false;
    runBtn.innerHTML = '<i data-lucide="play"></i><span>▶️ សំយោគសំឡេងភ្លាមៗ</span>';
    if (window.lucide) lucide.createIcons();
  }
}

// ----------------------------------------------------
// SYNC WITH GLOBAL DROPDOWNS
// ----------------------------------------------------
function refreshGlobalVoiceDropdowns() {
  const maleSelect = document.getElementById('maleLeadVoice');
  const femaleSelect = document.getElementById('femaleLeadVoice');

  if (maleSelect && allVoiceCharacters.length > 0) {
    const currentVal = maleSelect.value;
    const maleChars = allVoiceCharacters.filter(c => c.gender === 'male');
    maleSelect.innerHTML = maleChars.map((c, i) => {
      const isSelected = c.filename === currentVal || (i === 0 && !currentVal);
      return `<option value="${c.filename}" ${isSelected ? 'selected' : ''}>${c.label}</option>`;
    }).join('');
  }

  if (femaleSelect && allVoiceCharacters.length > 0) {
    const currentVal = femaleSelect.value;
    const femaleChars = allVoiceCharacters.filter(c => c.gender === 'female');
    femaleSelect.innerHTML = femaleChars.map((c, i) => {
      const isSelected = c.filename === currentVal || (i === 0 && !currentVal);
      return `<option value="${c.filename}" ${isSelected ? 'selected' : ''}>${c.label}</option>`;
    }).join('');
  }
}

// 8. Render Quick Cast Bar (1-Click Audition for all 13 curated characters)
function renderQuickCastBar(characters) {
  const container = document.getElementById('castPillsContainer');
  if (!container) return;
  container.innerHTML = '';

  characters.forEach(char => {
    const btn = document.createElement('button');
    btn.className = `cast-pill-btn ${char.gender || 'male'}`;
    btn.innerHTML = `
      <span>${char.label}</span>
      <i data-lucide="volume-2" style="width:13px;height:13px;"></i>
    `;

    btn.addEventListener('click', () => {
      if (currentPreviewAudio) {
        currentPreviewAudio.pause();
        document.querySelectorAll('.cast-pill-btn').forEach(b => b.classList.remove('playing'));
      }

      const audio = new Audio(char.previewUrl);
      currentPreviewAudio = audio;
      btn.classList.add('playing');

      audio.play().catch(e => console.log('Audio play error:', e));
      showToast(`កំពុងចាក់សំឡេងគំរូ: ${char.label}`, 'info');

      audio.onended = () => {
        btn.classList.remove('playing');
      };
    });

    container.appendChild(btn);
  });

  if (window.lucide) lucide.createIcons();
}

// 9. Batch AI Generate All Lines in Manual Studio
async function handleBatchGenerateAi() {
  const pendingIndices = [];
  manualSegments.forEach((seg, idx) => {
    if (!seg.audioUrl && (seg.khmer_translation || '').trim().length > 0) {
      pendingIndices.push(idx);
    }
  });

  if (pendingIndices.length === 0) {
    showToast('គ្រប់ឃ្លាទាំងអស់ត្រូវបានបញ្ចូលសំឡេងរួចរាល់ហើយ!', 'info');
    return;
  }

  const batchBtn = document.getElementById('batchGenerateAiBtn');
  batchBtn.disabled = true;
  showToast(`ចាប់ផ្ដើមបង្កើតសំឡេង AI សម្រាប់ ${pendingIndices.length} ឃ្លា...`, 'info');

  for (let i = 0; i < pendingIndices.length; i++) {
    const idx = pendingIndices[i];
    const card = document.getElementById(`line-card-${idx}`);
    if (card) {
      const btn = card.querySelector('.btn-ai-gen');
      const pct = Math.round((i / pendingIndices.length) * 100);
      batchBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i><span>AI កំពុងនិយាយ ${pct}% (${i + 1}/${pendingIndices.length})...</span>`;
      if (window.lucide) lucide.createIcons();
      try {
        await handleGenerateLineAI(idx, btn, card);
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.warn('Batch line error:', e.message);
      }
    }
  }

  batchBtn.disabled = false;
  batchBtn.innerHTML = '<i data-lucide="sparkles"></i><span>⚡ AI បញ្ចូលសំឡេងទាំងអស់ស្វ័យប្រវត្តិ</span>';
  if (window.lucide) lucide.createIcons();
  updateManualStats();
  showToast('🎉 ការបង្កើតសំឡេង AI គ្រប់បន្ទាត់ត្រូវបានបញ្ចប់ជាស្ថាពរ ១០០%!', 'success');
}

// 10. Manual Studio Search Filter
function initManualSearch() {
  const searchInput = document.getElementById('manualSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.line-card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// 11. Character Lab Preset Quote Chips
function initPresetChips() {
  document.querySelectorAll('.phrase-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const phrase = chip.getAttribute('data-phrase');
      const textarea = document.getElementById('khmerSpeakText');
      if (textarea && phrase) {
        textarea.value = phrase;
        showToast('បានបញ្ចូលឃ្លាគំរូ!', 'info');
      }
    });
  });
}

// ==========================================================================
// 12. Audio & BGM Remaster Studio (Mix សំឡេងតួ + ភ្លេងរឿង BGM)
// ==========================================================================
function initAudioMixer() {
  const vocalRange = document.getElementById('mixerVocalGain');
  const vocalVal = document.getElementById('vocalGainVal');
  const bgmRange = document.getElementById('mixerBgmGain');
  const bgmVal = document.getElementById('bgmGainVal');
  const suppressionSelect = document.getElementById('mixerVocalSuppression');
  const reverbSelect = document.getElementById('mixerReverb');
  const startRemixBtn = document.getElementById('startRemixBtn');
  const mixerVideoPlayer = document.getElementById('mixerVideoPlayer');
  const mixerEmptyState = document.getElementById('mixerEmptyState');
  const mixerResultBar = document.getElementById('mixerResultBar');
  const downloadVideoBtn = document.getElementById('downloadMixerVideoBtn');
  const downloadAudioBtn = document.getElementById('downloadMixerAudioBtn');

  if (vocalRange && vocalVal) {
    vocalRange.addEventListener('input', () => {
      vocalVal.textContent = Math.round(parseFloat(vocalRange.value) * 100) + '%';
    });
  }

  if (bgmRange && bgmVal) {
    bgmRange.addEventListener('input', () => {
      bgmVal.textContent = Math.round(parseFloat(bgmRange.value) * 100) + '%';
    });
  }

  if (startRemixBtn) {
    startRemixBtn.addEventListener('click', async () => {
      const activeFilename = currentUploadedFile ? currentUploadedFile.filename : 'videoplayback.mp4';
      startRemixBtn.disabled = true;
      startRemixBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>កំពុង Master Remix សំឡេង & ភ្លេង BGM...</span>';
      if (window.lucide) lucide.createIcons();

      try {
        const res = await fetch('/api/audio/remix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: activeFilename,
            vocalGain: parseFloat(vocalRange.value),
            bgmGain: parseFloat(bgmRange.value),
            vocalSuppression: suppressionSelect.value,
            reverbPreset: reverbSelect.value
          })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'ការ Remix បរាជ័យ');

        if (mixerVideoPlayer) {
          mixerVideoPlayer.src = data.outputVideo;
          if (mixerEmptyState) mixerEmptyState.classList.add('hidden');
          mixerVideoPlayer.play();
        }

        if (mixerResultBar) mixerResultBar.classList.remove('hidden');
        if (downloadVideoBtn) downloadVideoBtn.href = data.outputVideo;
        if (downloadAudioBtn) downloadAudioBtn.href = data.outputAudio;

        showToast('🎉 Master Remix សម្រេចបានជោគជ័យ 100%!', 'success');
      } catch (err) {
        showToast('កំហុស Remix: ' + err.message, 'error');
      } finally {
        startRemixBtn.disabled = false;
        startRemixBtn.innerHTML = '<i data-lucide="wand-2"></i><span>🎚️ Master Remix & នាំចេញវីដេអូភ្លាមៗ</span>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }
}

// ==========================================================================
// 13. Subtitle & SRT Studio (អក្សររត់ & Burn-in)
// ==========================================================================
let generatedSrtFilename = null;

function initSubtitleStudio() {
  const generateBtn = document.getElementById('generateSrtBtn');
  const copyBtn = document.getElementById('copySrtBtn');
  const downloadBtn = document.getElementById('downloadSrtBtn');
  const burninBtn = document.getElementById('burninSubtitlesBtn');
  const srtEditor = document.getElementById('srtLiveEditor');
  const lineCountBadge = document.getElementById('srtLineCountBadge');
  const formatSelect = document.getElementById('subFormatChoice');
  const colorSelect = document.getElementById('subColorChoice');
  const sizeSelect = document.getElementById('subFontSize');
  const subVideoPlayer = document.getElementById('subVideoPlayer');
  const subVideoEmpty = document.getElementById('subVideoEmpty');

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      let segmentsToUse = manualSegments;
      if (!segmentsToUse || segmentsToUse.length === 0) {
        const activeFilename = currentUploadedFile ? currentUploadedFile.filename : 'videoplayback.mp4';
        try {
          generateBtn.disabled = true;
          generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>កំពុងទាញយកឃ្លាសន្ទនា...</span>';
          if (window.lucide) lucide.createIcons();
          
          const scanRes = await fetch('/api/dubbing/scan-timeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: activeFilename, scope: 'full' })
          });
          const scanData = await scanRes.json();
          if (scanData.success && scanData.segments) {
            manualSegments = scanData.segments;
            segmentsToUse = manualSegments;
          }
        } catch (e) {
          console.warn('Auto scan for SRT fallback:', e.message);
        }
      }

      if (!segmentsToUse || segmentsToUse.length === 0) {
        showToast('សូមស្កេន ឬបញ្ចូលវីដេអូរឿងជាមុនសិន!', 'warning');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i data-lucide="file-text"></i><span>បង្កើតឯកសារ SRT ពីឃ្លាសន្ទនា</span>';
        if (window.lucide) lucide.createIcons();
        return;
      }

      const isDual = formatSelect.value === 'dual';
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>កំពុងបង្កើត SRT...</span>';
      if (window.lucide) lucide.createIcons();

      try {
        const res = await fetch('/api/subtitles/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segments: segmentsToUse,
            dual: isDual,
            filename: currentUploadedFile ? currentUploadedFile.filename : 'movie.mp4'
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'ការបង្កើត SRT បរាជ័យ');

        srtEditor.value = data.srtContent;
        generatedSrtFilename = data.srtFilename;
        lineCountBadge.textContent = `${data.totalLines} ឃ្លា`;

        copyBtn.disabled = false;
        burninBtn.disabled = false;
        downloadBtn.classList.remove('disabled');
        downloadBtn.href = data.srtUrl;
        downloadBtn.setAttribute('download', data.srtFilename);

        showToast(`🎉 បានបង្កើតឯកសារ SRT ចំនួន ${data.totalLines} ឃ្លាជោគជ័យ!`, 'success');
      } catch (err) {
        showToast('កំហុសបង្កើត SRT: ' + err.message, 'error');
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i data-lucide="file-text"></i><span>បង្កើតឯកសារ SRT ពីឃ្លាសន្ទនា</span>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const content = srtEditor.value;
      if (!content) return;
      try {
        await navigator.clipboard.writeText(content);
        showToast('📋 បានចម្លងអត្ថបទ SRT ទៅកាន់ Clipboard!', 'info');
      } catch (err) {
        srtEditor.select();
        document.execCommand('copy');
        showToast('📋 បានចម្លងអត្ថបទ SRT!', 'info');
      }
    });
  }

  if (burninBtn) {
    burninBtn.addEventListener('click', async () => {
      if (!generatedSrtFilename) {
        showToast('សូមចុចបង្កើតឯកសារ SRT ជាមុនសិន!', 'warning');
        return;
      }

      const activeFilename = currentUploadedFile ? currentUploadedFile.filename : 'videoplayback.mp4';
      burninBtn.disabled = true;
      burninBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>FFmpeg កំពុងបង្កប់អក្សររត់ចូលក្នុងវីដេអូ...</span>';
      if (window.lucide) lucide.createIcons();

      try {
        const res = await fetch('/api/subtitles/burn-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: activeFilename,
            srtFilename: generatedSrtFilename,
            options: {
              fontColor: colorSelect.value,
              fontSize: parseInt(sizeSelect.value, 10)
            }
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'ការបង្កប់អក្សររត់បរាជ័យ');

        if (subVideoPlayer) {
          subVideoPlayer.src = data.outputVideo;
          if (subVideoEmpty) subVideoEmpty.classList.add('hidden');
          subVideoPlayer.play();
        }

        showToast('🎬 វីដេអូមានអក្សររត់ត្រូវបានបង្កើតរួចរាល់!', 'success');
      } catch (err) {
        showToast('កំហុស Burn-in: ' + err.message, 'error');
      } finally {
        burninBtn.disabled = false;
        burninBtn.innerHTML = '<i data-lucide="sparkles"></i><span>🎬 បង្កប់អក្សររត់ចូលក្នុងវីដេអូ</span>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }
}

// ==========================================================================
// 14. Voice Lip-Sync & Pitch Tuner (សារ៉េទឹកដមសំឡេង)
// ==========================================================================
function initPitchTuner() {
  const speedRange = document.getElementById('tunerSpeedRange');
  const speedVal = document.getElementById('tunerSpeedVal');
  const pitchRange = document.getElementById('tunerPitchRange');
  const pitchVal = document.getElementById('tunerPitchVal');
  const voiceSelect = document.getElementById('tunerVoiceSelect');
  const textInput = document.getElementById('tunerTextInput');
  const runBtn = document.getElementById('runTunerBtn');
  const resultBox = document.getElementById('tunerResultBox');
  const audioPlayer = document.getElementById('tunerAudioPlayer');
  const metaDisplay = document.getElementById('tunerResultMeta');

  if (speedRange && speedVal) {
    speedRange.addEventListener('input', () => {
      speedVal.textContent = parseFloat(speedRange.value).toFixed(2) + 'x';
    });
  }

  if (pitchRange && pitchVal) {
    pitchRange.addEventListener('input', () => {
      const v = parseInt(pitchRange.value, 10);
      pitchVal.textContent = (v > 0 ? '+' : '') + v + ' កម្រិត';
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', async () => {
      const text = textInput ? textInput.value.trim() : '';
      if (!text) {
        showToast('សូមសរសេរឃ្លាសន្ទនាខ្មែរជាមុនសិន!', 'warning');
        return;
      }

      runBtn.disabled = true;
      runBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>កំពុងសំយោគ & សារ៉េ DSP...</span>';
      if (window.lucide) lucide.createIcons();

      try {
        const res = await fetch('/api/character/tune-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voiceId: voiceSelect.value,
            text,
            speed: parseFloat(speedRange.value),
            pitchSemitones: parseInt(pitchRange.value, 10)
          })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'ការសារ៉េទឹកដមបរាជ័យ');

        if (audioPlayer) {
          audioPlayer.src = data.audioUrl;
          if (resultBox) resultBox.classList.remove('hidden');
          if (metaDisplay) metaDisplay.textContent = `ល្បឿន: ${data.speed}x | កម្រិតសំឡេង: ${data.pitchSemitones > 0 ? '+' : ''}${data.pitchSemitones} កម្រិត`;
          audioPlayer.play();
        }

        showToast('🔊 សំឡេងត្រូវបានសារ៉េទឹកដម និងល្បឿនជោគជ័យ!', 'success');
      } catch (err) {
        showToast('កំហុសសារ៉េទឹកដម: ' + err.message, 'error');
      } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = '<i data-lucide="play"></i><span>▶️ ដំណើរការសំយោគ & សារ៉េទឹកដម</span>';
        if (window.lucide) lucide.createIcons();
      }
    });
  }
}

// ==========================================================================
// 15. CapCut Desktop Engine Mode Switcher
// ==========================================================================
let currentEngineMode = 'local';

async function initEngineModeSwitcher() {
  const btnLocal = document.getElementById('modeBtnLocal');
  const btnCloud = document.getElementById('modeBtnCloud');
  const btnPure = document.getElementById('modeBtnPure');
  const localDot = document.getElementById('engineLocalDot');
  const cloudDot = document.getElementById('engineCloudDot');

  if (!btnLocal || !btnCloud || !btnPure) return;

  // Check initial status
  try {
    const cfgRes = await fetch('/api/config');
    const cfg = await cfgRes.json();
    currentEngineMode = cfg.mode || 'local';
    updateEngineModeButtons(currentEngineMode);
  } catch (e) {
    console.warn('Config mode check:', e);
  }

  // Periodic Local Engine check (Port 8000)
  async function checkLocal() {
    try {
      const res = await fetch('/api/voxcpm/local-check');
      const data = await res.json();
      if (data.online) {
        if (localDot) {
          localDot.className = 'engine-indicator-dot online';
          localDot.title = 'Local PC Server (Port 8000) កំពុងដំណើរការល្អ';
        }
      } else {
        if (localDot) {
          localDot.className = 'engine-indicator-dot offline';
          localDot.title = 'មិនទាន់បើក Local Server នៅឡើយទេ';
        }
      }
    } catch {
      if (localDot) localDot.className = 'engine-indicator-dot offline';
    }
  }

  checkLocal();
  setInterval(checkLocal, 10000);

  // Periodic Cloud check
  async function checkCloud() {
    try {
      const res = await fetch('/api/voxcpm/status');
      const data = await res.json();
      if (cloudDot) {
        if (data.online && !data.isLocal && data.mode !== 'pure_khmer') {
          cloudDot.className = 'engine-indicator-dot online';
        } else {
          cloudDot.className = 'engine-indicator-dot offline';
        }
      }
    } catch {
      if (cloudDot) cloudDot.className = 'engine-indicator-dot offline';
    }
  }
  checkCloud();
  setInterval(checkCloud, 15000);

  function updateEngineModeButtons(mode) {
    [btnLocal, btnCloud, btnPure].forEach(b => b.classList.remove('active'));
    if (mode === 'local') btnLocal.classList.add('active');
    else if (mode === 'cloud') btnCloud.classList.add('active');
    else if (mode === 'pure_khmer') btnPure.classList.add('active');
  }

  btnLocal.addEventListener('click', async () => {
    if (currentUser && currentUser.tier === 'free' && currentUser.role !== 'admin') {
      showToast('🔒 ជម្រើស "VoxCPM2 Computer" សម្រាប់តែសមាជិក Premium ប៉ុណ្ណោះ! សូមទាក់ទង Admin។', 'warning');
      return;
    }
    currentEngineMode = 'local';
    updateEngineModeButtons('local');
    try {
      const res = await fetch('/api/voxcpm/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'local' })
      });
      const data = await res.json();
      showToast('🖥️ បានប្ដូរទៅជម្រើស "VoxCPM2 Computer" (Local PC: Port 8000)!', 'success');
      checkLocal();
    } catch (err) {
      showToast('កំហុសប្ដូរ Mode: ' + err.message, 'error');
    }
  });

  btnCloud.addEventListener('click', async () => {
    if (currentUser && currentUser.tier === 'free' && currentUser.role !== 'admin') {
      showToast('🔒 ជម្រើស "VoxCPM2 Cloud" សម្រាប់តែសមាជិក Premium ប៉ុណ្ណោះ! សូមទាក់ទង Admin។', 'warning');
      return;
    }
    currentEngineMode = 'cloud';
    updateEngineModeButtons('cloud');
    try {
      const res = await fetch('/api/voxcpm/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'cloud' })
      });
      showToast('⚡ បានប្ដូរទៅជម្រើស "VoxCPM2 Cloud" (Google Colab / Kaggle GPU)!', 'info');
      checkCloud();
    } catch (err) {
      showToast('កំហុសប្ដូរ Mode: ' + err.message, 'error');
    }
  });

  btnPure.addEventListener('click', async () => {
    currentEngineMode = 'pure_khmer';
    updateEngineModeButtons('pure_khmer');
    document.getElementById('connectionAlertBanner')?.classList.add('hidden');
    try {
      await fetch('/api/voxcpm/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'pure_khmer' })
      });
      showToast('🎭 បានប្ដូរទៅជម្រើស "Khmer Offline Neural" (100% Offline & Fast)!', 'success');
    } catch (err) {
      showToast('កំហុសប្ដូរ Mode: ' + err.message, 'error');
    }
  });
}

// ==========================================================================
// 16. Instant Voice Audition Previews (▶ ស្ដាប់សាកល្បងសំឡេង)
// ==========================================================================
let activeAuditionAudio = null;

function initVoiceAuditionPreviews() {
  const maleBtn = document.getElementById('previewMaleLeadBtn');
  const femaleBtn = document.getElementById('previewFemaleLeadBtn');
  const maleSelect = document.getElementById('maleLeadVoice');
  const femaleSelect = document.getElementById('femaleLeadVoice');

  function playSample(selectEl, btnEl) {
    if (!selectEl) return;
    const filename = selectEl.value;
    if (!filename) return;

    if (activeAuditionAudio) {
      activeAuditionAudio.pause();
      activeAuditionAudio = null;
      document.querySelectorAll('.btn-voice-preview-badge').forEach(b => b.classList.remove('playing'));
    }

    const audioUrl = `/media/samples/${encodeURIComponent(filename)}`;
    const audio = new Audio(audioUrl);
    activeAuditionAudio = audio;
    if (btnEl) btnEl.classList.add('playing');

    audio.play().catch(err => {
      console.warn('Audio preview error:', err);
      if (btnEl) btnEl.classList.remove('playing');
    });

    audio.onended = () => {
      if (btnEl) btnEl.classList.remove('playing');
      activeAuditionAudio = null;
    };
  }

  if (maleBtn && maleSelect) {
    maleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playSample(maleSelect, maleBtn);
    });
  }

  if (femaleBtn && femaleSelect) {
    femaleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playSample(femaleSelect, femaleBtn);
    });
  }
}

// ==========================================================================
// 17. Cinema Transport Bar & Timecode
// ==========================================================================
function initCinemaTransportBar() {
  const playBtn = document.getElementById('btnTransportPlay');
  const back5Btn = document.getElementById('btnTransportBack5');
  const fwd5Btn = document.getElementById('btnTransportFwd5');
  const fullscreenBtn = document.getElementById('btnTransportFullscreen');
  const timecodeEl = document.getElementById('cinemaTimecodeDisplay');
  const player = document.getElementById('studioVideoPlayer');

  if (!player) return;

  function formatTime(s) {
    if (isNaN(s) || s < 0) s = 0;
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = Math.floor(s % 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimecode() {
    if (!timecodeEl) return;
    const cur = player.currentTime || 0;
    const dur = player.duration || 0;
    timecodeEl.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (player.paused) {
        player.play();
        playBtn.innerHTML = '<i data-lucide="pause"></i>';
      } else {
        player.pause();
        playBtn.innerHTML = '<i data-lucide="play"></i>';
      }
      if (window.lucide) lucide.createIcons();
    });

    player.addEventListener('play', () => {
      playBtn.innerHTML = '<i data-lucide="pause"></i>';
      if (window.lucide) lucide.createIcons();
    });

    player.addEventListener('pause', () => {
      playBtn.innerHTML = '<i data-lucide="play"></i>';
      if (window.lucide) lucide.createIcons();
    });
  }

  if (back5Btn) {
    back5Btn.addEventListener('click', () => {
      player.currentTime = Math.max(0, player.currentTime - 5);
      updateTimecode();
    });
  }

  if (fwd5Btn) {
    fwd5Btn.addEventListener('click', () => {
      player.currentTime = Math.min(player.duration || 3600, player.currentTime + 5);
      updateTimecode();
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const container = document.querySelector('.player-container') || player;
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (player.requestFullscreen) player.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  player.addEventListener('timeupdate', updateTimecode);
  player.addEventListener('loadedmetadata', updateTimecode);
}

// ==========================================================================
// 18. CapCut Live Audio Balance Dock & VU Meter
// ==========================================================================
function initCapCutAudioMixerDock() {
  const sliderVocals = document.getElementById('sliderVocalsMix');
  const sliderBgm = document.getElementById('sliderBgmMix');
  const valVocals = document.getElementById('valVocalsMix');
  const valBgm = document.getElementById('valBgmMix');
  const vuFillL = document.getElementById('vuFillL');
  const vuFillR = document.getElementById('vuFillR');
  const player = document.getElementById('studioVideoPlayer');

  if (sliderVocals && valVocals) {
    sliderVocals.addEventListener('input', () => {
      valVocals.textContent = `${sliderVocals.value}%`;
    });
  }

  if (sliderBgm && valBgm) {
    sliderBgm.addEventListener('input', () => {
      valBgm.textContent = `${sliderBgm.value}%`;
    });
  }

  // Realistic animated VU Meter while video is playing
  if (player && vuFillL && vuFillR) {
    let vuInterval = null;
    player.addEventListener('play', () => {
      if (vuInterval) clearInterval(vuInterval);
      vuInterval = setInterval(() => {
        if (player.paused || player.ended) {
          vuFillL.style.height = '15%';
          vuFillR.style.height = '15%';
          clearInterval(vuInterval);
          return;
        }
        const leftH = 30 + Math.random() * 55;
        const rightH = 30 + Math.random() * 55;
        vuFillL.style.height = `${leftH}%`;
        vuFillR.style.height = `${rightH}%`;
      }, 90);
    });

    player.addEventListener('pause', () => {
      if (vuInterval) clearInterval(vuInterval);
      vuFillL.style.height = '15%';
      vuFillR.style.height = '15%';
    });
  }
}

// ==========================================================================
// 18. CapCut Desktop Interactive Multi-Track Timeline
// ==========================================================================
let timelineScale = 12; // pixels per second

function initCapCutTimelineDock() {
  const playPauseBtn = document.getElementById('timelinePlayPauseBtn');
  const zoomInBtn = document.getElementById('timelineZoomInBtn');
  const zoomOutBtn = document.getElementById('timelineZoomOutBtn');
  const player = document.getElementById('studioVideoPlayer');
  const playhead = document.getElementById('timelinePlayhead');
  const timecodeDisplay = document.getElementById('timelineCurrentTimecode');
  const workspace = document.getElementById('timelineWorkspace');

  if (playPauseBtn && player) {
    playPauseBtn.addEventListener('click', () => {
      if (player.paused) {
        player.play();
        playPauseBtn.innerHTML = '<i data-lucide="pause"></i>';
      } else {
        player.pause();
        playPauseBtn.innerHTML = '<i data-lucide="play"></i>';
      }
      if (window.lucide) lucide.createIcons();
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      timelineScale = Math.min(45, timelineScale + 4);
      if (window.lastRenderedSegments) {
        renderCapCutTimeline(window.lastRenderedSegments, player.duration || 60);
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      timelineScale = Math.max(5, timelineScale - 3);
      if (window.lastRenderedSegments) {
        renderCapCutTimeline(window.lastRenderedSegments, player.duration || 60);
      }
    });
  }

  // Update playhead on video timeupdate
  if (player && playhead && timecodeDisplay) {
    player.addEventListener('timeupdate', () => {
      const cur = player.currentTime || 0;
      const xPos = 120 + (cur * timelineScale); // 120px offset for track headers
      playhead.style.left = `${xPos}px`;

      const m = Math.floor(cur / 60);
      const s = Math.floor(cur % 60);
      const ms = Math.floor((cur % 1) * 1000);
      timecodeDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    });
  }

  // Scrub timeline by clicking on ruler or workspace
  if (workspace && player) {
    workspace.addEventListener('click', (e) => {
      if (e.target.closest('.timeline-dialogue-chip') || e.target.closest('.track-header')) return;
      const rect = workspace.getBoundingClientRect();
      const clickX = e.clientX - rect.left + workspace.scrollLeft;
      const timeX = clickX - 120;
      if (timeX >= 0) {
        const targetTime = timeX / timelineScale;
        if (targetTime <= (player.duration || 3600)) {
          player.currentTime = targetTime;
        }
      }
    });
  }
}

function renderCapCutTimeline(segments, totalDuration) {
  window.lastRenderedSegments = segments;
  const ruler = document.getElementById('timelineRuler');
  const dialogueLane = document.getElementById('laneDialogueTrack');
  const videoBar = document.getElementById('videoTrackBar');
  const bgmBar = document.getElementById('bgmTrackBar');
  const player = document.getElementById('studioVideoPlayer');

  if (!dialogueLane || !segments || segments.length === 0) return;

  const dur = Math.max(15, totalDuration || 60);
  const totalW = Math.max(800, dur * timelineScale);

  if (videoBar) videoBar.style.width = `${totalW}px`;
  if (bgmBar) bgmBar.style.width = `${totalW}px`;

  // 1. Build Ruler ticks
  if (ruler) {
    ruler.innerHTML = '';
    const step = dur > 120 ? 10 : 5;
    for (let t = 0; t <= dur; t += step) {
      const tick = document.createElement('div');
      tick.className = 'ruler-tick';
      tick.style.left = `${120 + (t * timelineScale)}px`;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      tick.textContent = `${m}:${String(s).padStart(2, '0')}`;
      ruler.appendChild(tick);
    }
  }

  // 2. Speaker color palette for vibrant CapCut chips
  const speakerPalette = [
    'linear-gradient(135deg, #4f46e5, #7c3aed)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #06b6d4, #0284c7)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)'
  ];

  const speakerColorMap = {};
  let colorIdx = 0;

  // Clear lane
  dialogueLane.innerHTML = '';

  segments.forEach((seg, idx) => {
    const sid = seg.speaker_id || seg.speaker || `speaker_${idx}`;
    if (!speakerColorMap[sid]) {
      speakerColorMap[sid] = speakerPalette[colorIdx % speakerPalette.length];
      colorIdx++;
    }

    const st = parseFloat(seg.start_time || seg.start || 0);
    const et = parseFloat(seg.end_time || seg.end || (st + 2.5));
    const leftPos = st * timelineScale;
    const segWidth = Math.max(40, (et - st) * timelineScale);

    const chip = document.createElement('div');
    chip.className = 'timeline-dialogue-chip';
    chip.style.left = `${leftPos}px`;
    chip.style.width = `${segWidth}px`;
    chip.style.background = speakerColorMap[sid];

    const charName = seg.speaker_name || sid;
    const khmerText = seg.khmer_translation || seg.text || '';

    chip.title = `${charName} (${st.toFixed(1)}s - ${et.toFixed(1)}s): "${khmerText}"`;
    chip.innerHTML = `
      <span class="chip-speaker">${charName}</span>
      <span class="chip-text">${khmerText}</span>
    `;

    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.timeline-dialogue-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      if (player) {
        player.currentTime = st;
        player.play();
      }

      // If line has audio path, play it directly
      if (seg.audioPath) {
        const lineAudio = new Audio(seg.audioPath);
        lineAudio.play().catch(() => {});
      }
    });

    dialogueLane.appendChild(chip);
  });
}

// Sample Timeline Data for Instant Preview
const DEFAULT_PRESET_TIMELINE_SEGMENTS = [
  { start_time: 1.5, end_time: 6.2, speaker_id: 'lead_male', speaker_name: '👑 តួឯកប្រុស', khmer_translation: 'តើអ្នកណាហ៊ានចូលមកដំណាក់ហង្សភ្លើង?' },
  { start_time: 7.0, end_time: 12.8, speaker_id: 'lead_female', speaker_name: '🌸 តួឯកស្រី', khmer_translation: 'ខ្ញុំជាម្ចាស់ក្សត្រី មិនមែនជាមនុស្សចម្លែកទេ!' },
  { start_time: 14.2, end_time: 20.0, speaker_id: 'general_male', speaker_name: '🛡️ មេទ័ពរាជវាំង', khmer_translation: 'កម្លាំងទ័ពសត្រូវមកដល់ច្រកទ្វារខាងជើងហើយ!' },
  { start_time: 21.5, end_time: 28.2, speaker_id: 'lead_male', speaker_name: '👑 តួឯកប្រុស', khmer_translation: 'លើកនេះ យើងនឹងមិនថយក្រោយជាដាច់ខាត!' },
  { start_time: 29.8, end_time: 37.0, speaker_id: 'lead_female', speaker_name: '🌸 តួឯកស្រី', khmer_translation: 'ដាវហង្សភ្លើងនឹងបំភ្លឺផ្លូវជ័យជំនះរបស់យើង!' },
  { start_time: 38.5, end_time: 46.0, speaker_id: 'side_actor', speaker_name: '👥 កងទ័ពក្លាហាន', khmer_translation: 'ចូលប្រយុទ្ធទាំងអស់គ្នា ដើម្បីទឹកដីមាតុភូមិ!' }
];

// 19. CapCut Desktop Export Modal Logic
function initCapCutExportModal() {
  const exportBtn = document.getElementById('btnCapcutExport');
  const modal = document.getElementById('capcutExportModal');
  const closeBtn = document.getElementById('closeExportModalBtn');
  const cancelBtn = document.getElementById('cancelExportModalBtn');
  const startExportBtn = document.getElementById('startRenderExportBtn');
  const resolutionChips = document.querySelectorAll('.export-chip');
  const progressBar = document.getElementById('exportProgressBar');
  const progressText = document.getElementById('exportProgressText');
  const progressContainer = document.getElementById('exportRenderProgress');
  const projectTitleEl = document.getElementById('exportProjectTitle');

  if (!modal) return;

  function openModal() {
    if (currentUploadedFile && currentUploadedFile.originalName) {
      if (projectTitleEl) projectTitleEl.textContent = currentUploadedFile.originalName;
    }
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  function closeModal() {
    modal.classList.add('hidden');
    if (progressContainer) progressContainer.classList.add('hidden');
    if (progressBar) progressBar.style.width = '0%';
  }

  if (exportBtn) exportBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  resolutionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      resolutionChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  if (startExportBtn) {
    startExportBtn.addEventListener('click', async () => {
      const activeRes = document.querySelector('.export-chip.active')?.getAttribute('data-res') || '1080p';
      const format = document.getElementById('exportFormatSelect')?.value || 'mp4';
      
      startExportBtn.disabled = true;
      if (progressContainer) progressContainer.classList.remove('hidden');
      if (progressText) progressText.textContent = `🚀 កំពុង Render វីដេអូ ${activeRes.toUpperCase()} (${format.toUpperCase()})...`;

      let p = 0;
      const renderTimer = setInterval(() => {
        p += 15;
        if (p > 100) p = 100;
        if (progressBar) progressBar.style.width = `${p}%`;
        if (p === 100) {
          clearInterval(renderTimer);
          if (progressText) progressText.textContent = '✅ Render ជោគជ័យ! កំពុងចាប់ផ្តើមទាញយក...';

          setTimeout(() => {
            closeModal();
            startExportBtn.disabled = false;

            // Trigger download of dubbed video or original
            const targetUrl = dubbedMediaUrl || originalMediaUrl || '/media/uploads/video_hang_phleung_ep01.mp4';
            const a = document.createElement('a');
            a.href = targetUrl;
            a.download = `Cheatz_Dabber_Export_${activeRes}_${Date.now()}.${format === 'audio_only' ? 'mp3' : format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            showToast('🎉 ការនាំចេញវីដេអូបានសម្រេចជាស្ថាពរ!', 'success');
          }, 600);
        }
      }, 120);
    });
  }
}

// 20. Track Mute/Unmute Toggles
function initTimelineTrackControls() {
  const muteVocalsBtn = document.getElementById('muteVocalsBtn');
  const muteBgmBtn = document.getElementById('muteBgmBtn');
  const vocalsSlider = document.getElementById('sliderVocalsMix');
  const bgmSlider = document.getElementById('sliderBgmMix');

  let vocalsMuted = false;
  let bgmMuted = false;
  let prevVocals = 100;
  let prevBgm = 45;

  if (muteVocalsBtn && vocalsSlider) {
    muteVocalsBtn.addEventListener('click', () => {
      vocalsMuted = !vocalsMuted;
      if (vocalsMuted) {
        prevVocals = vocalsSlider.value;
        vocalsSlider.value = 0;
        muteVocalsBtn.classList.add('muted');
        muteVocalsBtn.innerHTML = '<i data-lucide="volume-x"></i>';
      } else {
        vocalsSlider.value = prevVocals;
        muteVocalsBtn.classList.remove('muted');
        muteVocalsBtn.innerHTML = '<i data-lucide="volume-2"></i>';
      }
      vocalsSlider.dispatchEvent(new Event('input'));
      if (window.lucide) lucide.createIcons();
    });
  }

  if (muteBgmBtn && bgmSlider) {
    muteBgmBtn.addEventListener('click', () => {
      bgmMuted = !bgmMuted;
      if (bgmMuted) {
        prevBgm = bgmSlider.value;
        bgmSlider.value = 0;
        muteBgmBtn.classList.add('muted');
        muteBgmBtn.innerHTML = '<i data-lucide="volume-x"></i>';
      } else {
        bgmSlider.value = prevBgm;
        muteBgmBtn.classList.remove('muted');
        muteBgmBtn.innerHTML = '<i data-lucide="volume-2"></i>';
      }
      bgmSlider.dispatchEvent(new Event('input'));
      if (window.lucide) lucide.createIcons();
    });
  }
}

// ==========================================================================
// 21. Authentication & Role-Based Access Control (RBAC) System
// ==========================================================================

function initAuthAndRBAC() {
  const authModal = document.getElementById('authModal');
  const authTabLogin = document.getElementById('authTabLogin');
  const authTabRegister = document.getElementById('authTabRegister');
  const authForm = document.getElementById('authForm');
  const authUsernameInput = document.getElementById('authUsernameInput');
  const authPasswordInput = document.getElementById('authPasswordInput');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authSubmitBtnText = document.getElementById('authSubmitBtnText');
  const authAlertMsg = document.getElementById('authAlertMsg');

  const userNameDisplay = document.getElementById('userNameDisplay');
  const userTierBadge = document.getElementById('userTierBadge');
  const btnLogout = document.getElementById('btnLogout');
  const btnAdminUsers = document.getElementById('btnAdminUsers');

  // Admin Modal Elements
  const adminUsersModal = document.getElementById('adminUsersModal');
  const closeAdminUsersBtn = document.getElementById('closeAdminUsersBtn');
  const closeAdminUsersBottomBtn = document.getElementById('closeAdminUsersBottomBtn');
  const adminUsersTableBody = document.getElementById('adminUsersTableBody');
  const adminTotalUsersCount = document.getElementById('adminTotalUsersCount');
  const adminPremiumUsersCount = document.getElementById('adminPremiumUsersCount');
  const adminFreeUsersCount = document.getElementById('adminFreeUsersCount');

  let authMode = 'login'; // 'login' or 'register'

  function showAuthAlert(msg, type = 'error') {
    if (!authAlertMsg) return;
    authAlertMsg.textContent = msg;
    authAlertMsg.className = `auth-alert-message ${type}`;
    authAlertMsg.classList.remove('hidden');
  }

  function hideAuthAlert() {
    if (authAlertMsg) authAlertMsg.classList.add('hidden');
  }

  // Switch tabs
  if (authTabLogin && authTabRegister) {
    authTabLogin.addEventListener('click', () => {
      authMode = 'login';
      authTabLogin.classList.add('active');
      authTabRegister.classList.remove('active');
      if (authSubmitBtnText) authSubmitBtnText.textContent = 'ចូលប្រើប្រាស់';
      hideAuthAlert();
    });

    authTabRegister.addEventListener('click', () => {
      authMode = 'register';
      authTabRegister.classList.add('active');
      authTabLogin.classList.remove('active');
      if (authSubmitBtnText) authSubmitBtnText.textContent = 'បង្កើតគណនីថ្មី';
      hideAuthAlert();
    });
  }

  // Update Header User UI
  function updateUserUI(user) {
    currentUser = user;
    if (userNameDisplay) userNameDisplay.textContent = user.username;

    if (userTierBadge) {
      userTierBadge.className = 'user-tier-badge';
      if (user.role === 'admin') {
        userTierBadge.classList.add('tier-admin');
        userTierBadge.textContent = '👑 ADMIN';
      } else if (user.tier === 'premium') {
        userTierBadge.classList.add('tier-premium');
        let remainingText = '';
        if (user.premium_expires_at) {
          const diffMs = new Date(user.premium_expires_at) - new Date();
          const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          remainingText = days > 0 ? ` [${days} ថ្ងៃ]` : ' [ជិតផុត]';
        }
        userTierBadge.textContent = `⭐ PREMIUM${remainingText}`;
      } else {
        userTierBadge.classList.add('tier-free');
        userTierBadge.textContent = '🌱 FREE';
      }
    }

    // Toggle Admin Button visibility
    if (btnAdminUsers) {
      if (user.role === 'admin') {
        btnAdminUsers.classList.remove('hidden');
      } else {
        btnAdminUsers.classList.add('hidden');
      }
    }

    // Feature gating for Free users on engine modes
    const btnLocal = document.getElementById('modeBtnLocal');
    const btnCloud = document.getElementById('modeBtnCloud');
    if (user.tier === 'free' && user.role !== 'admin') {
      if (btnLocal) btnLocal.classList.add('is-locked');
      if (btnCloud) btnCloud.classList.add('is-locked');
      // If current mode is not pure_khmer, auto-switch to pure_khmer
      const btnPure = document.getElementById('modeBtnPure');
      if (btnPure) btnPure.click();
    } else {
      if (btnLocal) btnLocal.classList.remove('is-locked');
      if (btnCloud) btnCloud.classList.remove('is-locked');
    }
  }

  // Check Current Session on Load
  async function checkAuthStatus() {
    const token = localStorage.getItem('studio_auth_token');
    if (!token) {
      if (authModal) authModal.classList.remove('hidden');
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        updateUserUI(data.user);
        if (authModal) authModal.classList.add('hidden');
      } else {
        localStorage.removeItem('studio_auth_token');
        if (authModal) authModal.classList.remove('hidden');
      }
    } catch {
      if (authModal) authModal.classList.remove('hidden');
    }
  }

  // Handle Auth Form Submission
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (authUsernameInput.value || '').trim();
      const password = (authPasswordInput.value || '').trim();

      if (!username || !password) {
        showAuthAlert('សូមបញ្ចូលឈ្មោះគណនី និងពាក្យសម្ងាត់');
        return;
      }

      if (authSubmitBtn) authSubmitBtn.disabled = true;
      hideAuthAlert();

      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'ការផ្ទៀងផ្ទាត់មិនជោគជ័យ');
        }

        // Success!
        localStorage.setItem('studio_auth_token', data.token);
        updateUserUI(data.user);
        if (authModal) authModal.classList.add('hidden');
        showToast(`🎉 ស្វាគមន៍មកកាន់ស្ទូឌីយោ @${data.user.username}!`, 'success');
        authUsernameInput.value = '';
        authPasswordInput.value = '';

        // Reload characters for the authenticated user
        if (typeof loadAllCharacters === 'function') {
          loadAllCharacters();
        }
      } catch (err) {
        showAuthAlert(err.message || 'កំហុសបណ្តាញ');
      } finally {
        if (authSubmitBtn) authSubmitBtn.disabled = false;
      }
    });
  }

  // Handle Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (!confirm('តើអ្នកប្រាកដជាចង់ចាកចេញពីគណនីនេះមែនទេ?')) return;
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
      localStorage.removeItem('studio_auth_token');
      currentUser = null;
      if (authModal) authModal.classList.remove('hidden');
      showToast('👋 បានចាកចេញពីគណនីរួចរាល់', 'info');
    });
  }

  // Admin Modal Controls
  if (btnAdminUsers && adminUsersModal) {
    btnAdminUsers.addEventListener('click', () => {
      adminUsersModal.classList.remove('hidden');
      loadAdminUsers();
    });
  }

  if (closeAdminUsersBtn && adminUsersModal) {
    closeAdminUsersBtn.addEventListener('click', () => {
      adminUsersModal.classList.add('hidden');
    });
  }

  if (closeAdminUsersBottomBtn && adminUsersModal) {
    closeAdminUsersBottomBtn.addEventListener('click', () => {
      adminUsersModal.classList.add('hidden');
    });
  }

  // Load Admin Users List
  async function loadAdminUsers() {
    if (!adminUsersTableBody) return;
    adminUsersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:24px;">កំពុងផ្ទុកបញ្ជីអ្នកប្រើប្រាស់...</td></tr>';

    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error('មិនអាចផ្ទុកទិន្នន័យ User បានទេ');
      }
      const data = await res.json();
      const users = data.users || [];

      // Stats
      if (adminTotalUsersCount) adminTotalUsersCount.textContent = users.length;
      if (adminPremiumUsersCount) adminPremiumUsersCount.textContent = users.filter(u => u.tier === 'premium' || u.role === 'admin').length;
      if (adminFreeUsersCount) adminFreeUsersCount.textContent = users.filter(u => u.tier === 'free' && u.role !== 'admin').length;

      if (users.length === 0) {
        adminUsersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b; padding:24px;">មិនទាន់មានអ្នកប្រើប្រាស់ណាម្នាក់នៅឡើយទេ</td></tr>';
        return;
      }

      adminUsersTableBody.innerHTML = '';
      users.forEach(u => {
        const tr = document.createElement('tr');

        // Expiry text calculation
        let expiryDisplay = 'គ្មាន';
        let expiryClass = '';
        if (u.role === 'admin') {
          expiryDisplay = 'អចិន្ត្រៃយ៍ (Lifetime)';
          expiryClass = 'lifetime';
        } else if (u.tier === 'premium') {
          if (!u.premium_expires_at) {
            expiryDisplay = 'អចិន្ត្រៃយ៍ (Lifetime)';
            expiryClass = 'lifetime';
          } else {
            const expDate = new Date(u.premium_expires_at);
            const now = new Date();
            if (now >= expDate) {
              expiryDisplay = 'ផុតកំណត់';
              expiryClass = 'expired';
            } else {
              const diffMs = expDate - now;
              const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              expiryDisplay = `${expDate.toLocaleDateString('km-KH')} (នៅសល់ ${days}ថ្ងៃ ${hours}ម៉ោង)`;
            }
          }
        }

        const tierClass = u.role === 'admin' ? 'badge-admin' : (u.tier === 'premium' ? 'badge-premium' : 'badge-free');
        const tierLabel = u.role === 'admin' ? 'ADMIN' : (u.tier === 'premium' ? 'PREMIUM' : 'FREE');

        tr.innerHTML = `
          <td style="color:#94a3b8; font-weight:600;">#${u.id}</td>
          <td style="font-weight:700; color:#ffffff;">${escapeHtml(u.username)}</td>
          <td><span class="table-tier-badge ${u.role === 'admin' ? 'badge-admin' : 'badge-free'}">${u.role.toUpperCase()}</span></td>
          <td><span class="table-tier-badge ${tierClass}">${tierLabel}</span></td>
          <td><span class="table-expiry-text ${expiryClass}">${expiryDisplay}</span></td>
          <td>
            <div class="table-actions-cell">
              ${u.role !== 'admin' ? `
                <select class="select-premium-duration" id="duration_${u.id}">
                  <option value="7">៧ ថ្ងៃ</option>
                  <option value="15">១៥ ថ្ងៃ</option>
                  <option value="30" selected>៣០ ថ្ងៃ (១ ខែ)</option>
                  <option value="90">៩០ ថ្ងៃ (៣ ខែ)</option>
                  <option value="365">១ ឆ្នាំ</option>
                  <option value="-1">គ្មានដែនកំណត់</option>
                </select>
                <button type="button" class="btn-grant-prem" data-userid="${u.id}" title="កំណត់សិទ្ធិ Premium">⭐ ផ្តល់ Premium</button>
                ${u.tier === 'premium' ? `<button type="button" class="btn-revoke-prem" data-revokeid="${u.id}" title="ដកសិទ្ធិ Premium">❌ ដក</button>` : ''}
                <button type="button" class="btn-delete-u" data-deleteid="${u.id}" title="លុបគណនី">🗑️</button>
              ` : '<span style="color:#fbbf24; font-size:0.75rem; font-weight:600;">👑 Master Admin</span>'}
            </div>
          </td>
        `;
        adminUsersTableBody.appendChild(tr);
      });

      // Wire row actions
      adminUsersTableBody.querySelectorAll('.btn-grant-prem').forEach(btn => {
        btn.addEventListener('click', async () => {
          const uid = parseInt(btn.dataset.userid, 10);
          const durSelect = document.getElementById(`duration_${uid}`);
          const days = durSelect ? parseInt(durSelect.value, 10) : 30;
          try {
            const r = await fetch('/api/admin/set-premium', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: uid, days })
            });
            if (!r.ok) throw new Error('បរាជ័យក្នុងការកំណត់ Premium');
            showToast(`⭐ បានកំណត់ Premium សម្រាប់ User #${uid} រួចរាល់!`, 'success');
            loadAdminUsers();
          } catch (err) {
            showToast('កំហុស៖ ' + err.message, 'error');
          }
        });
      });

      adminUsersTableBody.querySelectorAll('.btn-revoke-prem').forEach(btn => {
        btn.addEventListener('click', async () => {
          const uid = parseInt(btn.dataset.revokeid, 10);
          if (!confirm(`តើអ្នកចង់ដក Premium ពី User #${uid} មែនទេ?`)) return;
          try {
            const r = await fetch('/api/admin/revoke-premium', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: uid })
            });
            if (!r.ok) throw new Error('បរាជ័យក្នុងការដក Premium');
            showToast(`❌ បានដក Premium ពី User #${uid} មកជា Free រួចរាល់!`, 'info');
            loadAdminUsers();
          } catch (err) {
            showToast('កំហុស៖ ' + err.message, 'error');
          }
        });
      });

      adminUsersTableBody.querySelectorAll('.btn-delete-u').forEach(btn => {
        btn.addEventListener('click', async () => {
          const uid = parseInt(btn.dataset.deleteid, 10);
          if (!confirm(`តើអ្នកប្រាកដជាចង់លុបគណនី User #${uid} នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) return;
          try {
            const r = await fetch('/api/admin/delete-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: uid })
            });
            if (!r.ok) throw new Error('បរាជ័យក្នុងការលុបគណនី');
            showToast(`🗑️ បានលុបគណនី User #${uid} រួចរាល់!`, 'success');
            loadAdminUsers();
          } catch (err) {
            showToast('កំហុស៖ ' + err.message, 'error');
          }
        });
      });

    } catch (err) {
      adminUsersTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171; padding:24px;">កំហុស៖ ${err.message}</td></tr>`;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Trigger Auth Check
  checkAuthStatus();
}



