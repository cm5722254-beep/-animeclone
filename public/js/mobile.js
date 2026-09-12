// ==========================================================================
// Cheatz Dabber - Android Mobile Logic (Pure Khmer Neural Edition)
// ==========================================================================

let uploadedVideoFile = null;
let uploadedVideoFilename = null;
let videoDuration = 0;
let dialogueSegments = [];
let outputVideoUrl = null;
let deferredInstallPrompt = null;

// PWA Install Event Listener
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const installBtn = document.getElementById('btnInstallPwa');
  if (installBtn) installBtn.style.display = 'inline-flex';
});

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const splashView = document.getElementById('splashView');
  const workspaceView = document.getElementById('workspaceView');
  const btnStartApp = document.getElementById('btnStartApp');
  const fileInput = document.getElementById('mobileFileInput');
  const btnLoadVideo = document.getElementById('btnLoadVideo');
  const videoPlayer = document.getElementById('mVideoPlayer');
  const playerCard = document.getElementById('mPlayerCard');
  const videoMetaRow = document.getElementById('mVideoMetaRow');
  const btnChangeVideo = document.getElementById('btnChangeVideo');
  const linesList = document.getElementById('linesList');
  const btnAddLine = document.getElementById('btnAddLine');
  const btnGenerate = document.getElementById('btnGenerateMain');
  const btnExport = document.getElementById('btnExportMain');
  const progressBox = document.getElementById('mProgressBox');
  const progressFill = document.getElementById('mProgressFill');
  const progressText = document.getElementById('mProgressText');
  const progressPercent = document.getElementById('mProgressPercent');
  const btnInstallPwa = document.getElementById('btnInstallPwa');

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(console.warn);
  }

  // Install PWA button
  if (btnInstallPwa) {
    btnInstallPwa.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('🎉 បានដំឡើង App លើទូរស័ព្ទ Android ដោយជោគជ័យ!', 'success');
        }
        deferredInstallPrompt = null;
        btnInstallPwa.style.display = 'none';
      } else {
        showToast('👉 ចុច Menu ជ្រុងខាងលើ (⋮) ក្នុង Chrome រួចជ្រើសយក "Add to Home Screen / Install App"', 'info');
      }
    });
  }

  // 1. Start App -> Open Workspace
  btnStartApp.addEventListener('click', () => {
    splashView.style.display = 'none';
    workspaceView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 2. Load Video
  btnLoadVideo.addEventListener('click', () => fileInput.click());
  btnChangeVideo.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadedVideoFile = file;
    showToast(`កំពុង Upload វីដេអូ: ${file.name}...`, 'info');

    // Local Video Preview Immediately
    const localUrl = URL.createObjectURL(file);
    videoPlayer.src = localUrl;
    playerCard.style.display = 'block';
    btnLoadVideo.style.display = 'none';
    videoMetaRow.style.display = 'flex';
    document.getElementById('mFileName').textContent = file.name;

    videoPlayer.onloadedmetadata = () => {
      videoDuration = videoPlayer.duration || 0;
      const mins = Math.floor(videoDuration / 60);
      const secs = Math.floor(videoDuration % 60);
      document.getElementById('mFileSize').textContent = `${(file.size / (1024 * 1024)).toFixed(1)} MB • ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Upload to server
    const formData = new FormData();
    formData.append('mediaFile', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        uploadedVideoFilename = data.filename || (data.file && data.file.filename);
        showToast('✅ វីដេអូបានផ្ទុកចូលរួចរាល់! កំពុងស្កេនការសន្ទនា...', 'success');
        btnGenerate.disabled = false;
        // Auto scan timeline
        await autoScanDialogue(uploadedVideoFilename);
      } else {
        showToast('កំហុស Upload: ' + (data.error || 'សូមព្យាយាមម្ដងទៀត'), 'error');
      }
    } catch (err) {
      showToast('កំហុសបណ្ដាញ: ' + err.message, 'error');
    }
  });

  // 3. Scan Dialogue Timeline
  async function autoScanDialogue(filename) {
    try {
      const res = await fetch('/api/dubbing/scan-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, scope: 'full' })
      });
      const data = await res.json();
      if (data.success && data.segments && data.segments.length > 0) {
        dialogueSegments = data.segments.map((s, idx) => ({
          id: idx + 1,
          start: s.start_time || (idx * 3),
          end: s.end_time || ((idx + 1) * 3),
          gender: s.gender || (idx % 2 === 0 ? 'male' : 'female'),
          text: s.khmer_translation || s.chinese_text || 'សួស្តី! នេះជាសំឡេងបកប្រែខ្មែរ។',
          audioUrl: null
        }));
      } else {
        // Create initial clean starter lines
        createDefaultLines();
      }
      renderDialogueList();
    } catch (e) {
      console.warn('Scan notice:', e);
      createDefaultLines();
      renderDialogueList();
    }
  }

  function createDefaultLines() {
    dialogueSegments = [
      { id: 1, start: 0.0, end: 3.0, gender: 'male', text: 'សួស្តីបងប្អូនទាំងអស់គ្នា! ស្វាគមន៍មកកាន់ខ្សែភាពយន្តនេះ។', audioUrl: null },
      { id: 2, start: 3.5, end: 6.5, gender: 'female', text: 'ពិតជាអស្ចារ្យណាស់ ថ្ងៃនេះយើងនឹងទទួលបានបទពិសោធន៍ថ្មី។', audioUrl: null },
      { id: 3, start: 7.0, end: 10.0, gender: 'male', text: 'តោះចាប់ផ្ដើមទស្សនាទាំងអស់គ្នា!', audioUrl: null }
    ];
  }

  // 4. Render Editable Dialogue Lines
  function renderDialogueList() {
    linesList.innerHTML = '';
    dialogueSegments.forEach((seg, index) => {
      const item = document.createElement('div');
      item.className = 'm-line-item';
      item.innerHTML = `
        <div class="m-line-top-bar">
          <div class="m-speaker-toggle ${seg.gender}" data-index="${index}" title="ចុចដើម្បីប្ដូរសំឡេង ប្រុស/ស្រី">
            <span>${seg.gender === 'female' ? '🌸 [F] ស្រី (Sreymom)' : '👑 [M] ប្រុស (Piseth)'}</span>
          </div>
          <span class="m-line-time">${formatTime(seg.start)} - ${formatTime(seg.end)}</span>
          <div class="m-line-actions">
            <button type="button" class="btn-line-tool play" data-index="${index}" title="ស្ដាប់សំឡេង">▶</button>
            <button type="button" class="btn-line-tool del" data-index="${index}" title="លុបប្រយោគនេះ">✕</button>
          </div>
        </div>
        <textarea class="m-line-textarea" data-index="${index}" placeholder="វាយពាក្យពេចន៍ខ្មែរដែលត្រូវនិយាយ...">${seg.text}</textarea>
      `;
      linesList.appendChild(item);
    });

    // Attach listeners
    document.querySelectorAll('.m-speaker-toggle').forEach(el => {
      el.addEventListener('click', (e) => {
        const idx = parseInt(el.dataset.index);
        dialogueSegments[idx].gender = dialogueSegments[idx].gender === 'male' ? 'female' : 'male';
        renderDialogueList();
      });
    });

    document.querySelectorAll('.m-line-textarea').forEach(el => {
      el.addEventListener('input', (e) => {
        const idx = parseInt(el.dataset.index);
        dialogueSegments[idx].text = el.value;
      });
    });

    document.querySelectorAll('.btn-line-tool.play').forEach(el => {
      el.addEventListener('click', async () => {
        const idx = parseInt(el.dataset.index);
        const seg = dialogueSegments[idx];
        if (!seg.text.trim()) return showToast('សូមវាយពាក្យខ្មែរសិន!', 'warning');

        el.textContent = '⏳';
        try {
          const res = await fetch('/api/dubbing/generate-line', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lineIndex: idx,
              text: seg.text,
              gender: seg.gender,
              voiceId: 'pure_khmer',
              emotion: 'natural'
            })
          });
          const data = await res.json();
          if (data.success && data.audioUrl) {
            seg.audioUrl = data.audioUrl;
            const a = new Audio(data.audioUrl + '?t=' + Date.now());
            a.play();
            showToast('▶ កំពុងចាក់សំឡេងសាកល្បង...', 'success');
          }
        } catch (err) {
          showToast('កំហុសចាក់សំឡេង: ' + err.message, 'error');
        } finally {
          el.textContent = '▶';
        }
      });
    });

    document.querySelectorAll('.btn-line-tool.del').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index);
        dialogueSegments.splice(idx, 1);
        renderDialogueList();
      });
    });
  }

  // 5. Add Line Button
  btnAddLine.addEventListener('click', () => {
    const lastSeg = dialogueSegments[dialogueSegments.length - 1];
    const newStart = lastSeg ? lastSeg.end + 0.5 : 0;
    const newEnd = newStart + 3.0;
    dialogueSegments.push({
      id: dialogueSegments.length + 1,
      start: newStart,
      end: newEnd,
      gender: dialogueSegments.length % 2 === 0 ? 'male' : 'female',
      text: '',
      audioUrl: null
    });
    renderDialogueList();
    // Focus last textarea
    const textareas = document.querySelectorAll('.m-line-textarea');
    if (textareas.length > 0) textareas[textareas.length - 1].focus();
  });

  // 6. Generate Khmer Neural Video
  btnGenerate.addEventListener('click', async () => {
    if (!uploadedVideoFilename) {
      showToast('⚠️ សូមបញ្ចូលវីដេអូជាមុនសិន!', 'warning');
      return;
    }
    if (dialogueSegments.length === 0) {
      showToast('⚠️ មិនទាន់មានប្រយោគសន្ទនាឡើយ!', 'warning');
      return;
    }

    btnGenerate.disabled = true;
    btnExport.style.display = 'none';
    progressBox.style.display = 'flex';
    updateProgress(15, 'កំពុងសំយោគសំឡេងខ្មែរ Neural គ្រប់តួអង្គ...');

    try {
      // Map segments for assemble-custom
      const payloadSegments = dialogueSegments.map((s, idx) => ({
        line_index: idx,
        start_time: s.start,
        end_time: s.end,
        gender: s.gender,
        khmer_translation: s.text,
        chinese_text: s.text,
        speaker_role: s.gender === 'female' ? 'female_lead' : 'male_lead',
        audioUrl: s.audioUrl
      }));

      updateProgress(40, 'កំពុងបញ្ចូលសំឡេងខ្មែរជាមួយតន្ត្រីដើម...');

      const res = await fetch('/api/dubbing/assemble-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadedVideoFilename,
          segments: payloadSegments
        })
      });

      updateProgress(80, 'កំពុងRenderវីដេអូចុងក្រោយ...');
      const data = await res.json();

      if (data.success && data.videoUrl) {
        outputVideoUrl = data.videoUrl;
        updateProgress(100, '🎉 បញ្ចូលសំឡេងជោគជ័យ ១០០%!');
        
        // Update player to dubbed video
        videoPlayer.src = outputVideoUrl + '?t=' + Date.now();
        videoPlayer.play().catch(() => {});

        // Show Export button
        btnExport.style.display = 'flex';
        btnGenerate.textContent = '🔄 បង្កើតម្ដងទៀត';
        btnGenerate.disabled = false;
        showToast('🎬 វីដេអូបញ្ចូលសំឡេងខ្មែររួចរាល់ហើយ! ចុចទាញយកខាងក្រោម។', 'success');
      } else {
        throw new Error(data.error || 'ដំណើរការបរាជ័យ');
      }
    } catch (err) {
      showToast('កំហុស Generate: ' + err.message, 'error');
      btnGenerate.disabled = false;
      progressBox.style.display = 'none';
    }
  });

  // 7. Export / Download Video
  btnExport.addEventListener('click', () => {
    if (!outputVideoUrl) return;
    const a = document.createElement('a');
    a.href = outputVideoUrl;
    a.download = `CheatzDabber_Khmer_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥 កំពុងទាញយកវីដេអូទៅកាន់ទូរស័ព្ទ...', 'success');
  });

  function updateProgress(percent, msg) {
    progressFill.style.width = percent + '%';
    progressPercent.textContent = percent + '%';
    progressText.textContent = msg;
  }

  function formatTime(secs) {
    const s = Math.max(0, secs || 0);
    const m = Math.floor(s / 60);
    const rem = Math.floor(s % 60);
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  }
});

// Toast Helper
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `m-toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}
