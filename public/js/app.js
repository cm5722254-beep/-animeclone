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
  loadExtractedMovieCharacters();
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
          document.getElementById('connectionAlertBanner')?.classList.remove('hidden');
        } else {
          voxBadge.style.background = 'rgba(234, 179, 8, 0.15)';
          voxBadge.style.border = '1px solid rgba(234, 179, 8, 0.4)';
          voxBadge.style.color = '#facc15';
          if (voxDot) {
            voxDot.style.background = '#eab308';
            voxDot.style.boxShadow = '0 0 8px #eab308';
          }
          voxText.textContent = '⚡ VoxCPM2: សូមកំណត់ Link';
          document.getElementById('connectionAlertBanner')?.classList.remove('hidden');
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

      showToast('🎬 បានផ្ទុកវីដេអូ "រឿង៖ វីរនារីហង្សភ្លើង _ ភាគទី 01" រួចរាល់ អាចចុច Dubbing ភ្លាមៗ!', 'success');
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
          castingSafetyMode
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

      const speakRes = await fetch('/api/character/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: cloneData.voiceId,
          text: text
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
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
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

      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ elevenlabsKey, geminiKey, voxcpmUrl })
        });
        const data = await res.json();
        if (data.success) {
          showToast('រក្សាទុកការកំណត់បានជោគជ័យ!', 'success');
          modal.classList.add('hidden');
          initConfig();
        }
      } catch (err) {
        showToast('ការរក្សាទុកបរាជ័យ: ' + err.message, 'error');
      }
    });
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

  // Test Link button
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const testUrl = urlInput.value.trim();
      if (!testUrl) {
        statusMsg.innerHTML = '<span style="color:#f87171;">⚠️ សូមបញ្ចូល Link ជាមុនសិន!</span>';
        return;
      }
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
      const newUrl = urlInput.value.trim();
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
      const res = await fetch('/api/dubbing/scan-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: currentUploadedFile.filename, scope: 'full' })
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

        <select class="btn-tool line-voice-select" id="voice-select-${idx}" title="ជ្រើសរើសសំឡេងតួអង្គសម្រាប់ឃ្លានេះ" style="max-width:200px; height:32px; padding:2px 6px; font-size:0.78rem;">
          ${lineVoiceOptions}
        </select>

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

    const res = await fetch('/api/dubbing/generate-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        lineIndex: idx,
        speakerId: seg.speaker_id,
        gender: seg.gender || 'male',
        voiceId
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

// 7. Load Extracted Movie Characters (13 Curated Characters from videoplayback.mp4)
async function loadExtractedMovieCharacters() {
  try {
    const res = await fetch('/api/characters/extracted');
    const data = await res.json();
    if (!data.success || !data.characters || data.characters.length === 0) return;

    extractedMovieCharacters = data.characters;

    // 1. Update Vault Grid in Character Lab
    const vaultGrid = document.getElementById('charactersVaultGrid');
    const vaultBadge = document.getElementById('vaultCountBadge');
    if (vaultBadge) vaultBadge.textContent = `${extractedMovieCharacters.length} តួអង្គ`;

    if (vaultGrid) {
      vaultGrid.innerHTML = extractedMovieCharacters.map(char => {
        const isMaleLead = char.filename === 'hang_phleung_char_2_male.mp3';
        const isFemaleLead = char.filename === 'hang_phleung_char_6_female.mp3';
        const isFromHangPhleung = char.filename && char.filename.startsWith('hang_phleung_');

        let badgeHtml = '';
        if (isMaleLead) {
          badgeHtml = '<span style="font-size:0.7rem; background:rgba(59,130,246,0.25); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); padding:2px 6px; border-radius:4px; margin-left:4px;">👑 តួឯកប្រុស (សំឡេងពិត)</span>';
        } else if (isFemaleLead) {
          badgeHtml = '<span style="font-size:0.7rem; background:rgba(236,72,153,0.25); color:#f472b6; border:1px solid rgba(236,72,153,0.4); padding:2px 6px; border-radius:4px; margin-left:4px;">🌸 តួឯកស្រី (សំឡេងពិត)</span>';
        } else if (isFromHangPhleung) {
          badgeHtml = '<span style="font-size:0.7rem; background:rgba(234,179,8,0.25); color:#facc15; border:1px solid rgba(234,179,8,0.4); padding:2px 6px; border-radius:4px; margin-left:4px;">🔥 ដកស្រង់ពីរឿងពិត</span>';
        } else if (char.is_curated) {
          badgeHtml = '<span style="font-size:0.7rem; background:rgba(99,102,241,0.2); color:var(--primary); padding:2px 6px; border-radius:4px; margin-left:4px;">⭐ គំរូសាច់រឿង</span>';
        }

        return `
        <div class="char-vault-card ${char.gender}">
          <div class="char-vault-top">
            <div class="char-vault-icon">${char.gender === 'female' ? '🌸' : '🎙️'}</div>
            <div class="char-vault-info">
              <h4>${char.label} ${badgeHtml}</h4>
              <span>${char.gender === 'female' ? 'តួស្រី' : 'តួប្រុស'} • ${char.filename}</span>
            </div>
          </div>
          <div class="char-vault-words">"${char.words || 'សំឡេងសម្ដែងដើមក្នុងរឿង'}"</div>
          <audio controls class="char-vault-audio" preload="none" src="${char.previewUrl}"></audio>
        </div>
      `;
      }).join('');
    }

    // 2. Render Quick Cast Bar in Manual Studio
    renderQuickCastBar(extractedMovieCharacters);
    const strip = document.getElementById('castStripSection');
    if (strip) strip.classList.remove('hidden');
  } catch (err) {
    console.warn('Could not load extracted characters:', err.message);
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


