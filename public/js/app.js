// State
let currentUploadedFile = null;
let currentDubbingJobId = null;
let pollInterval = null;
let originalMediaUrl = null;
let dubbedMediaUrl = null;
let extractedMovieCharacters = [];
let currentPreviewAudio = null;

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

    if (data.hasElevenLabsKey) {
      badge.classList.add('active');
      statusText.textContent = 'ប្រព័ន្ធសំឡេង AI: ត្រៀមរួចរាល់';
    } else {
      badge.classList.remove('active');
      statusText.textContent = 'ទម្រង់សាកល្បង Demo (ត្រូវការ API Key)';
    }

    if (data.elevenLabsKeyMasked) {
      document.getElementById('settingElevenKey').placeholder = `បានកំណត់រួចរាល់ (${data.elevenLabsKeyMasked})`;
    }
    if (data.geminiKeyMasked) {
      document.getElementById('settingGeminiKey').placeholder = `បានកំណត់រួចរាល់ (${data.geminiKeyMasked})`;
    }
    if (data.voxcpmUrl) {
      const voxInput = document.getElementById('settingVoxcpmUrl');
      if (voxInput) voxInput.value = data.voxcpmUrl;
    }
    if (data.hasVoxcpmUrl) {
      statusText.textContent = 'ប្រព័ន្ធសំឡេង AI: VoxCPM2 GPU ត្រៀមរួចរាល់';
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

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/dubbing/status/${jobId}`);
      const job = await res.json();

      progressBarFill.style.width = `${job.progress}%`;
      progressStatusText.textContent = job.message;

      // Update steps visual
      if (job.progress >= 20) markStepDone(1);
      if (job.progress >= 40) markStepDone(2);
      if (job.progress >= 65) markStepDone(3);
      if (job.progress >= 85) markStepDone(4);

      if (job.status === 'completed') {
        clearInterval(pollInterval);
        markStepDone(5);
        progressBarFill.style.width = '100%';
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
      alert('សូមបញ្ចូលឃ្លាសន្ទនាចិនជាមុនសិន!');
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

    try {
      const res = await fetch('/api/dubbing/scan-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: currentUploadedFile.filename, scope: 'full' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'ស្កេនបរាជ័យ');

      manualSegments = data.segments || [];
      loadingState.classList.add('hidden');
      linesList.classList.remove('hidden');

      populateCharFilter(manualSegments);
      renderDialogueLines(manualSegments);
      updateManualStats();
      assembleBtn.disabled = false;
    } catch (err) {
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

    try {
      const res = await fetch('/api/dubbing/assemble-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: currentUploadedFile.filename,
          segments: manualSegments
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'ផ្គុំវីដេអូបរាជ័យ');

      exportStatus.classList.add('hidden');
      downloadCard.classList.remove('hidden');
      downloadBtn.href = data.outputVideo;

      videoPlayer.src = data.outputVideo;
      videoPlayer.play();
      showToast(`🎉 ផ្គុំវីដេអូជោគជ័យ! បានបញ្ចូលសំឡេងសរុប ${data.totalLinesDubbed} ឃ្លា។`, 'success');
    } catch (err) {
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

    // Determine smart default voice according to the strict curated rule:
    // If recognized curated role, select it; else fallback STRICTLY to Male Lead or Female Lead!
    let defaultVoiceId = 'auto';
    if (seg.speaker_role) {
      const matchRole = extractedMovieCharacters.find(c => c.role_key === seg.speaker_role);
      if (matchRole) defaultVoiceId = matchRole.id;
    }
    if (defaultVoiceId === 'auto') {
      defaultVoiceId = isFemale ? 'voxcpm:vp_character_1_female.mp3' : 'voxcpm:vp_character_20_female.mp3';
    }

    let statusHtml = '<span class="line-status-pill pending">⏳ មិនទាន់បញ្ចូល</span>';
    if (seg.source === 'recorded') statusHtml = '<span class="line-status-pill recorded">🎙️ សំឡេងផ្ទាល់ខ្លួន</span>';
    else if (seg.source === 'ai') statusHtml = '<span class="line-status-pill ai">✨ សំឡេង AI</span>';

    card.innerHTML = `
      <div class="line-card-header">
        <span class="speaker-badge ${isFemale ? 'female' : ''}">
          <i data-lucide="${isFemale ? 'user-check' : 'user'}"></i>
          <span>${seg.speaker_name || seg.speaker_id}</span>
        </span>
        <button class="time-btn" data-time="${startSec}" title="ចុចដើម្បីចាក់វីដេអូនៅវិនាទីនេះ">
          <i data-lucide="play-circle"></i>
          <span>${startSec}s - ${endSec}s</span>
        </button>
        <div class="status-container">${statusHtml}</div>
      </div>

      <div class="original-chinese-text">🇨🇳 ${seg.chinese_text || '(មិនមានអក្សរចិន)'}</div>

      <div class="khmer-input-wrapper">
        <textarea id="khmer-text-${idx}" placeholder="សរសេរពាក្យខ្មែរ...">${seg.khmer_translation || ''}</textarea>
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

        <select class="btn-tool line-voice-select" id="voice-select-${idx}" title="ជ្រើសរើសសំឡេងតួអង្គសម្រាប់ឃ្លានេះ" style="max-width:180px; height:32px; padding:2px 6px; font-size:0.78rem;">
          <option value="auto">🎭 ផ្គូផ្គងស្វ័យប្រវត្តិ</option>
          <optgroup label="🎬 តួអង្គចម្បងទាំង ១៣">
            ${extractedMovieCharacters.filter(c => c.is_curated).map(c => `
              <option value="${c.id}" ${c.id === defaultVoiceId ? 'selected' : ''}>${c.label}</option>
            `).join('')}
          </optgroup>
          ${extractedMovieCharacters.some(c => !c.is_curated) ? `
            <optgroup label="✨ តួអង្គផ្សេងទៀត">
              ${extractedMovieCharacters.filter(c => !c.is_curated).map(c => `
                <option value="${c.id}" ${c.id === defaultVoiceId ? 'selected' : ''}>${c.gender === 'female' ? '🌸' : '🎙️'} ${c.label}</option>
              `).join('')}
            </optgroup>
          ` : ''}
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
      seg.khmer_translation = textarea.value;
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
  const text = seg.khmer_translation || card.querySelector(`#khmer-text-${idx}`).value.trim();
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

    // Render Quick Cast Bar at the top of the Studio
    renderQuickCastBar(extractedMovieCharacters);

    // 1. Update Vault Grid in Character Lab
    const vaultGrid = document.getElementById('charactersVaultGrid');
    const vaultBadge = document.getElementById('vaultCountBadge');
    if (vaultBadge) vaultBadge.textContent = `${extractedMovieCharacters.length} តួអង្គ`;

    if (vaultGrid) {
      vaultGrid.innerHTML = extractedMovieCharacters.map(char => `
        <div class="char-vault-card ${char.gender}">
          <div class="char-vault-top">
            <div class="char-vault-icon">${char.gender === 'female' ? '🌸' : '🎙️'}</div>
            <div class="char-vault-info">
              <h4>${char.label} ${char.is_curated ? '<span style="font-size:0.7rem; background:rgba(99,102,241,0.2); color:var(--primary); padding:2px 6px; border-radius:4px; margin-left:4px;">⭐ តួចម្បង</span>' : ''}</h4>
              <span>${char.gender === 'female' ? 'តួស្រី' : 'តួប្រុស'} • ${char.filename}</span>
            </div>
          </div>
          <div class="char-vault-words">"${char.words || 'សំឡេងសម្ដែងដើមក្នុងរឿង'}"</div>
          <audio controls class="char-vault-audio" preload="none" src="${char.previewUrl}"></audio>
        </div>
      `).join('');
    }

    // 2. Populate Dropdowns in Auto Dubbing & Manual Studio
    const targets = ['voiceChoice', 'manualVoiceChoice'];
    targets.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (!select) return;

      const existingGroup = select.querySelector('optgroup[data-type="extracted-characters"]');
      if (existingGroup) existingGroup.remove();

      const nonCurated = extractedMovieCharacters.filter(c => !c.is_curated);
      if (nonCurated.length > 0) {
        const group = document.createElement('optgroup');
        group.label = `👥 តួអង្គបន្ទាប់បន្សំផ្សេងទៀត (${nonCurated.length} តួអង្គ)`;
        group.setAttribute('data-type', 'extracted-characters');

        nonCurated.forEach(char => {
          const opt = document.createElement('option');
          opt.value = char.id;
          const icon = char.gender === 'female' ? '🌸' : '🎙️';
          opt.textContent = `${icon} ${char.label} (${char.filename})`;
          group.appendChild(opt);
        });

        select.appendChild(group);
      }
    });
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
      batchBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i><span>AI កំពុងនិយាយ (${i + 1}/${pendingIndices.length})...</span>`;
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
  showToast('🎉 ការបង្កើតសំឡេង AI គ្រប់បន្ទាត់ត្រូវបានបញ្ចប់ជាស្ថាពរ!', 'success');
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


