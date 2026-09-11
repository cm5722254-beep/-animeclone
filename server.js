require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');

const audioProcessor = require('./services/audioProcessor');
const ElevenLabsService = require('./services/elevenlabsService');
const TranslationService = require('./services/translationService');
const KhmerDubbingService = require('./services/khmerDubbingService');

const app = express();
const PORT = process.env.PORT || 3000;

// Multi-computer network IP detection
function getLocalNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address,
          url: `http://${iface.address}:${PORT}`
        });
      }
    }
  }

  // Sort LAN interfaces so physical Wi-Fi/Ethernet LAN (192.168.x.x, 10.x.x.x) is prioritized
  addresses.sort((a, b) => {
    const isStandardLan = ip => ip.startsWith('192.168.') || ip.startsWith('10.');
    if (isStandardLan(a.address) && !isStandardLan(b.address)) return -1;
    if (!isStandardLan(a.address) && isStandardLan(b.address)) return 1;
    if (a.address.startsWith('169.254.') && !b.address.startsWith('169.254.')) return 1;
    if (!a.address.startsWith('169.254.') && b.address.startsWith('169.254.')) return -1;
    return 0;
  });

  return addresses;
}

// Ensure directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const SAMPLES_DIR = path.join(__dirname, 'samples');

[UPLOADS_DIR, OUTPUTS_DIR, SAMPLES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Services
const elevenlabs = new ElevenLabsService();
const translator = new TranslationService();
const khmerDubber = new KhmerDubbingService();

// In-memory job store
const activeJobs = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media/uploads', express.static(UPLOADS_DIR));
app.use('/media/outputs', express.static(OUTPUTS_DIR));
app.use('/media/samples', express.static(SAMPLES_DIR));

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB for large 4K videos and movies
});

// --- API Endpoints ---

// Get current config status
app.get('/api/config', (req, res) => {
  res.json({
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasVoxcpmUrl: !!process.env.VOXCPM_API_URL,
    voxcpmUrl: process.env.VOXCPM_API_URL || '',
    elevenLabsKeyMasked: process.env.ELEVENLABS_API_KEY
      ? `${process.env.ELEVENLABS_API_KEY.substring(0, 4)}...${process.env.ELEVENLABS_API_KEY.slice(-4)}`
      : '',
    geminiKeyMasked: process.env.GEMINI_API_KEY
      ? `${process.env.GEMINI_API_KEY.substring(0, 4)}...${process.env.GEMINI_API_KEY.slice(-4)}`
      : ''
  });
});

// Check VoxCPM2 Live Server Status (Cloudflare Tunnel Ping)
app.get('/api/voxcpm/status', async (req, res) => {
  const url = process.env.VOXCPM_API_URL;
  if (!url || !url.trim()) {
    return res.json({ online: false, configured: false, message: 'មិនទាន់កំណត់ Link VoxCPM2' });
  }
  try {
    const checkRes = await axios.get(url.trim(), { timeout: 20000 });
    if (checkRes.status === 200) {
      return res.json({ online: true, configured: true, url: url.trim(), message: 'GPU Server កំពុងដំណើរការល្អ (200 OK)' });
    }
    res.json({ online: false, configured: true, url: url.trim(), message: `ឆ្លើយតបកូដ HTTP ${checkRes.status}` });
  } catch (err) {
    res.json({ online: false, configured: true, url: url.trim(), message: err.message });
  }
});

// Update config keys
app.post('/api/config', (req, res) => {
  const { elevenlabsKey, geminiKey, voxcpmUrl } = req.body;
  if (elevenlabsKey && !elevenlabsKey.includes('...') && elevenlabsKey.trim().length > 10) {
    const cleanKey = elevenlabsKey.trim();
    process.env.ELEVENLABS_API_KEY = cleanKey;
    elevenlabs.setApiKey(cleanKey);
  }
  if (geminiKey && !geminiKey.includes('...') && geminiKey.trim().length > 10) {
    const cleanKey = geminiKey.trim();
    process.env.GEMINI_API_KEY = cleanKey;
    translator.setApiKey(cleanKey);
  }
  if (voxcpmUrl !== undefined && voxcpmUrl.trim().length > 5) {
    process.env.VOXCPM_API_URL = voxcpmUrl.trim();
  }

  // Update .env file safely
  try {
    const envContent = `PORT=${PORT}\nELEVENLABS_API_KEY=${process.env.ELEVENLABS_API_KEY || ''}\nGEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}\nVOXCPM_API_URL=${process.env.VOXCPM_API_URL || ''}\n`;
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  } catch (err) {
    console.error('Failed to write .env:', err);
  }

  res.json({ success: true, message: 'Settings saved successfully' });
});

// Upload Video/Audio
app.post('/api/upload', upload.single('mediaFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file uploaded' });
    }

    const filePath = req.file.path;
    const isVideo = req.file.mimetype.startsWith('video') || /\.(mp4|mkv|mov|avi|webm)$/i.test(req.file.originalname);
    const duration = await audioProcessor.getMediaDuration(filePath);

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        isVideo,
        duration,
        url: `/media/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    console.error('Upload handling error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper for formatted bytes
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Get output storage statistics
app.get('/api/outputs/stats', (req, res) => {
  try {
    let count = 0;
    let totalBytes = 0;
    if (fs.existsSync(OUTPUTS_DIR)) {
      const files = fs.readdirSync(OUTPUTS_DIR);
      for (const f of files) {
        if (f === '.gitkeep') continue;
        const p = path.join(OUTPUTS_DIR, f);
        try {
          const stat = fs.statSync(p);
          if (stat.isFile()) {
            count++;
            totalBytes += stat.size;
          }
        } catch (e) {}
      }
    }
    res.json({ count, totalBytes, formattedSize: formatBytes(totalBytes) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear outputs directory
app.post('/api/outputs/clear', (req, res) => {
  try {
    let count = 0;
    let freedBytes = 0;
    if (fs.existsSync(OUTPUTS_DIR)) {
      const files = fs.readdirSync(OUTPUTS_DIR);
      for (const f of files) {
        if (f === '.gitkeep') continue;
        const p = path.join(OUTPUTS_DIR, f);
        try {
          const stat = fs.statSync(p);
          if (stat.isFile()) {
            const sz = stat.size;
            fs.unlinkSync(p);
            count++;
            freedBytes += sz;
          } else if (stat.isDirectory()) {
            fs.rmSync(p, { recursive: true, force: true });
          }
        } catch (e) {}
      }
    }
    res.json({
      success: true,
      count,
      freedBytes,
      formattedFreed: formatBytes(freedBytes),
      message: `បានលុបឯកសារ Output សរុប ${count} ឯកសារ (សន្សំទំហំបាន ${formatBytes(freedBytes)})`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Dubbing & Voice Cloning Workflow
app.post('/api/dubbing/start', async (req, res) => {
  const {
    filename,
    sourceLang = 'auto',
    targetLang = 'km',
    voiceId = 'voxcpm-voice-actor',
    scope = 'full',
    castingSafetyMode = 'safe_curated',
    characterVoiceMap = {},
    genre = 'ancient',
    emotionIntensity = 'dramatic',
    maleLeadVoice = 'hang_phleung_char_2_male.mp3',
    femaleLeadVoice = 'hang_phleung_char_6_female.mp3'
  } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  let inputPath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(inputPath)) {
    inputPath = path.join(OUTPUTS_DIR, filename);
  }
  if (!fs.existsSync(inputPath)) {
    return res.status(404).json({ error: 'Uploaded file not found' });
  }

  const jobId = 'job_' + Date.now();
  const job = {
    id: jobId,
    filename,
    status: 'extracting',
    progress: 10,
    message: 'Extracting audio & vocals...',
    sourceLang,
    targetLang,
    scope,
    genre,
    emotionIntensity,
    maleLeadVoice,
    femaleLeadVoice,
    created: new Date()
  };
  activeJobs.set(jobId, job);

  res.json({ success: true, jobId });

  // Run pipeline asynchronously
  (async () => {
    try {
      const audioExt = path.parse(filename).name + '.mp3';
      const extractedAudioPath = path.join(OUTPUTS_DIR, `audio_${audioExt}`);

      // Step 1: Extract Audio
      job.progress = 10;
      job.status = 'extracting';
      job.message = 'កំពុងទាញយកសម្លេងពីវីដេអូដើម...';
      await audioProcessor.extractAudio(inputPath, extractedAudioPath);

      // Step 2: Route to appropriate Dubbing Engine
      if (targetLang === 'km') {
        // Multi-Character Khmer Real Human Voice Dubbing (Gemini 3.6 Flash + VoxCPM2 Zero-Shot + Timeline Assembly)
        job.progress = 15;
        job.status = 'dubbing_khmer';
        job.message = `AI Gemini កំពុងវិភាគ និងស្រង់តួអង្គគ្រប់តួ (${genre === 'modern' ? 'រឿងសម័យ' : 'រឿងបុរាណ'})...`;

        const result = await khmerDubber.processKhmerDubbing(
          inputPath,
          extractedAudioPath,
          OUTPUTS_DIR,
          { sourceLang, voiceId, scope, castingSafetyMode, characterVoiceMap, genre, emotionIntensity, maleLeadVoice, femaleLeadVoice },
          (progress, message) => {
            job.progress = progress;
            job.message = message;
          }
        );

        job.status = 'completed';
        job.progress = 100;
        job.message = 'ការ Dubbing គ្រប់តួអង្គក្នុងសាច់រឿងទទួលបានជោគជ័យ 100%!';
        job.outputVideo = `/media/outputs/${result.outputVideoFilename}`;
        job.outputAudio = `/media/outputs/${path.basename(result.dubbedAudioPath)}`;
        job.khmerScript = result.khmerScript;
        job.dialogueSegments = result.dialogueSegments;
      } else if (process.env.ELEVENLABS_API_KEY) {
        // ElevenLabs Dubbing (for supported languages: en, es, ja, etc.)
        job.progress = 40;
        job.status = 'cloning';
        job.message = 'Submitting to ElevenLabs AI Dubbing Engine...';

        const dubbingRes = await elevenlabs.createDubbingJob(
          extractedAudioPath,
          sourceLang,
          targetLang,
          numSpeakers
        );
        job.dubbingId = dubbingRes.dubbing_id;
        job.progress = 60;
        job.message = 'Voice cloning & synthesis in progress...';

        // Poll for completion
        let isDone = false;
        let attempts = 0;
        while (!isDone && attempts < 60) {
          await new Promise(r => setTimeout(r, 4000));
          attempts++;
          const statusRes = await elevenlabs.getDubbingStatus(job.dubbingId);

          if (statusRes.status === 'dubbed') {
            isDone = true;
            job.progress = 85;
            job.message = 'Downloading dubbed audio track...';

            const dubbedAudioPath = path.join(OUTPUTS_DIR, `dubbed_${audioExt}`);
            await elevenlabs.downloadDubbedFile(job.dubbingId, targetLang, dubbedAudioPath);

            // Step 3: Merge back into video
            job.progress = 95;
            job.message = 'Remixing video with character voices & BGM...';
            const outputVideoFilename = `final_${filename}`;
            const outputVideoPath = path.join(OUTPUTS_DIR, outputVideoFilename);

            await audioProcessor.mergeVideoAudio(inputPath, dubbedAudioPath, outputVideoPath);

            job.status = 'completed';
            job.progress = 100;
            job.message = 'Dubbing and Voice Cloning Complete!';
            job.outputVideo = `/media/outputs/${outputVideoFilename}`;
            job.outputAudio = `/media/outputs/dubbed_${audioExt}`;
            break;
          } else if (statusRes.status === 'failed') {
            throw new Error(`Dubbing failed: ${statusRes.error || 'Unknown error'}`);
          }
        }
      } else {
        // Simulation / Demo Mode
        job.progress = 50;
        job.status = 'demo_mode';
        job.message = 'Demo Mode: Simulating speaker detection & voice cloning...';
        await new Promise(r => setTimeout(r, 2500));

        job.progress = 80;
        job.message = 'Synthesizing character voices...';
        await new Promise(r => setTimeout(r, 2000));

        const outputVideoFilename = `demo_${filename}`;
        const outputVideoPath = path.join(OUTPUTS_DIR, outputVideoFilename);
        await audioProcessor.mergeVideoAudio(inputPath, extractedAudioPath, outputVideoPath);

        job.status = 'completed';
        job.progress = 100;
        job.message = 'Dubbing Process Complete!';
        job.outputVideo = `/media/outputs/${outputVideoFilename}`;
        job.outputAudio = `/media/outputs/audio_${audioExt}`;
        job.isDemo = true;
      }
    } catch (err) {
      console.error('Job execution error:', err.response?.data || err.message);
      const errMsg = err.response?.data?.detail?.message || err.message;
      job.status = 'error';
      job.error = errMsg;
      job.message = `បរាជ័យ: ${errMsg}`;
    }
  })();
});

// Check Job Status
app.get('/api/dubbing/status/:id', (req, res) => {
  const job = activeJobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// --- Manual Character Dubbing Studio Endpoints ---

let activeScanProgress = {
  active: false,
  progress: 0,
  message: '',
  linesFound: 0,
  startedAt: null
};

app.get('/api/dubbing/scan-progress', (req, res) => {
  res.json(activeScanProgress);
});

// 1. Scan & Extract Dialogue Timeline for Manual Studio
app.post('/api/dubbing/scan-timeline', async (req, res) => {
  try {
    const { filename, scope = 'full', genre = 'ancient', emotion = 'dramatic' } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    let inputPath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(inputPath)) {
      const rootPath = path.join(__dirname, filename);
      if (fs.existsSync(rootPath)) inputPath = rootPath;
    }
    if (!fs.existsSync(inputPath)) return res.status(404).json({ error: 'Video file not found' });

    activeScanProgress = {
      active: true,
      progress: 5,
      message: `កំពុងដកសំឡេងចេញពីវីដេអូរឿងដើម (${genre === 'modern' ? 'រឿងសម័យ' : 'រឿងបុរាណ'})...`,
      linesFound: 0,
      startedAt: Date.now()
    };

    const audioExt = path.parse(filename).name + '.mp3';
    const extractedAudioPath = path.join(OUTPUTS_DIR, `audio_${audioExt}`);
    if (!fs.existsSync(extractedAudioPath)) {
      activeScanProgress.progress = 8;
      activeScanProgress.message = 'កំពុងបំប្លែងសំឡេងវីដេអូសម្រាប់វិភាគ...';
      await audioProcessor.extractAudio(inputPath, extractedAudioPath);
    }

    activeScanProgress.progress = 12;
    activeScanProgress.message = 'កំពុងគណនារយៈពេលរឿង និងរៀបចំបញ្ជីឃ្លាសន្ទនា...';
    const duration = await audioProcessor.getMediaDuration(inputPath);

    const segments = await khmerDubber.extractDialogueTimeline(
      extractedAudioPath,
      duration,
      scope,
      (progress, message, linesCount) => {
        activeScanProgress.progress = progress;
        activeScanProgress.message = message;
        if (typeof linesCount === 'number') activeScanProgress.linesFound = linesCount;
      },
      'auto',
      false, // isFullPipeline = false
      genre,
      emotion
    );
    
    activeScanProgress.progress = 90;
    activeScanProgress.message = 'កំពុងកាត់សំឡេងគំរូតួអង្គនីមួយៗចេញពីរឿង...';

    // Extract real movie voice clips for each speaker in the video
    let movieVoiceMap = {};
    try {
      movieVoiceMap = await khmerDubber.extractCharacterVoiceSamples(extractedAudioPath, segments, OUTPUTS_DIR);
    } catch (ve) {
      console.warn('Movie voice samples extraction notice:', ve.message);
    }

    activeScanProgress.progress = 100;
    activeScanProgress.message = `✅ ស្កេនជោគជ័យ! រកឃើញ ${segments.length} ឃ្លាសន្ទនា`;
    activeScanProgress.linesFound = segments.length;
    activeScanProgress.active = false;

    const formatted = segments.map((s, idx) => ({
      ...s,
      line_index: idx,
      movieVoiceSample: movieVoiceMap[s.speaker_id] ? `/media/outputs/${path.basename(movieVoiceMap[s.speaker_id])}` : null,
      audioUrl: null,
      source: 'pending'
    }));

    res.json({ success: true, duration, segments: formatted });
  } catch (err) {
    activeScanProgress.active = false;
    activeScanProgress.message = '❌ កំហុស៖ ' + err.message;
    console.error('Scan timeline error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Record User's Voice for a Specific Dialogue Line
app.post('/api/dubbing/record-line', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file is required' });
    const { lineIndex = 0 } = req.body;
    const outputFilename = `user_recorded_line_${lineIndex}_${Date.now()}.wav`;
    const outputPath = path.join(OUTPUTS_DIR, outputFilename);

    const { execSync } = require('child_process');
    execSync(`ffmpeg -nostdin -y -i "${req.file.path}" -ar 44100 -ac 2 -b:a 192k "${outputPath}"`);

    res.json({
      success: true,
      lineIndex: parseInt(lineIndex, 10),
      audioUrl: `/media/outputs/${outputFilename}`,
      filename: outputFilename
    });
  } catch (err) {
    console.error('Record line error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Generate Single Line with AI Voice
app.post('/api/dubbing/generate-line', async (req, res) => {
  try {
    const { text, lineIndex = 0, gender = 'male', voiceId = 'voxcpm-voice-actor', speakerId = null, emotion = 'dramatic' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const outputFilename = `ai_line_${lineIndex}_${Date.now()}.wav`;
    const outputPath = path.join(OUTPUTS_DIR, outputFilename);

    const isFemale = gender === 'female';
    let studioRef = null;

    // Check if user wants direct live movie vocal clone
    if (voiceId === 'movie-live-clone' && speakerId) {
      const candidateMovieRef = path.join(OUTPUTS_DIR, `ref_voice_${speakerId}.mp3`);
      if (fs.existsSync(candidateMovieRef)) {
        studioRef = candidateMovieRef;
        console.log(`Using live extracted movie voice for ${speakerId}: ${candidateMovieRef}`);
      }
    }

    if (!studioRef && voiceId && voiceId.startsWith('voxcpm:')) {
      const sampleName = voiceId.replace('voxcpm:', '');
      const candidateDirect = path.join(SAMPLES_DIR, sampleName);
      const candidateMp3 = path.join(SAMPLES_DIR, `${sampleName}.mp3`);
      if (fs.existsSync(candidateDirect)) {
        studioRef = candidateDirect;
      } else if (fs.existsSync(candidateMp3)) {
        studioRef = candidateMp3;
      }
    }
    if (!studioRef) {
      studioRef = isFemale
        ? path.join(SAMPLES_DIR, 'main_lead_female.mp3')
        : path.join(SAMPLES_DIR, 'main_lead_male.mp3');
    }

    await khmerDubber.synthesizeRealisticSpeech(text, outputPath, voiceId, fs.existsSync(studioRef) ? studioRef : null, { gender, emotion });

    res.json({
      success: true,
      lineIndex: parseInt(lineIndex, 10),
      audioUrl: `/media/outputs/${outputFilename}`,
      filename: outputFilename
    });
  } catch (err) {
    console.error('Generate line error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3.1 Get extracted movie characters from samples
app.get('/api/characters/extracted', (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'extracted_characters.json');
    const samplesDir = path.join(__dirname, 'samples');
    if (fs.existsSync(jsonPath)) {
      const characters = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const augmented = characters
        .filter(c => fs.existsSync(path.join(samplesDir, c.filename)))
        .map(c => ({
          ...c,
          previewUrl: `/media/samples/${c.filename}`
        }));
      return res.json({ success: true, count: augmented.length, characters: augmented });
    }
    res.json({ success: true, count: 0, characters: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Assemble Custom Timeline Video (User Recordings + AI Voices Mixed into Video)
app.post('/api/dubbing/assemble-custom', async (req, res) => {
  try {
    const { filename, segments } = req.body;
    if (!filename || !segments || !Array.isArray(segments)) {
      return res.status(400).json({ error: 'Filename and segments array are required' });
    }

    let inputVideoPath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(inputVideoPath)) {
      const rootPath = path.join(__dirname, filename);
      if (fs.existsSync(rootPath)) inputVideoPath = rootPath;
    }
    if (!fs.existsSync(inputVideoPath)) return res.status(404).json({ error: 'Video file not found' });

    const duration = await audioProcessor.getMediaDuration(inputVideoPath);
    const audioExt = path.parse(filename).name + '.mp3';
    const extractedAudioPath = path.join(OUTPUTS_DIR, `audio_${audioExt}`);
    if (!fs.existsSync(extractedAudioPath)) {
      await audioProcessor.extractAudio(inputVideoPath, extractedAudioPath);
    }

    const mappedSegments = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      let audioPath = null;
      if (seg.audioUrl) {
        const basename = path.basename(seg.audioUrl);
        const p = path.join(OUTPUTS_DIR, basename);
        if (fs.existsSync(p)) audioPath = p;
      }

      // If user hasn't manually recorded or generated this line, auto-synthesize it in Khmer so ZERO lines are dropped!
      if (!audioPath && (seg.khmer_translation || seg.chinese_text)) {
        const textToSpeak = (seg.khmer_translation || seg.chinese_text || '').trim();
        if (textToSpeak) {
          const autoLinePath = path.join(OUTPUTS_DIR, `auto_studio_line_${i}_${Date.now()}.wav`);
          try {
            const isFemale = seg.gender === 'female' || (seg.speaker_name && seg.speaker_name.includes('ស្រី'));
            const fallbackVoice = isFemale ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural';
            await khmerDubber.synthesizeKhmerSpeech(textToSpeak, autoLinePath, fallbackVoice);
            if (fs.existsSync(autoLinePath) && fs.statSync(autoLinePath).size > 1000) {
              audioPath = autoLinePath;
            }
          } catch (autoErr) {
            console.warn(`Auto-synthesize line ${i} notice:`, autoErr.message);
          }
        }
      }

      if (audioPath) {
        mappedSegments.push({
          ...seg,
          audioPath,
          start_time: parseFloat(seg.start_time) || 0,
          end_time: parseFloat(seg.end_time) || ((parseFloat(seg.start_time) || 0) + 2.5)
        });
      }
    }

    if (mappedSegments.length === 0) {
      return res.status(400).json({ error: 'មិនមានឃ្លាសន្ទនាសម្រាប់ដំណើរការ dubbing ឡើយ!' });
    }

    // Assemble timeline audio
    const masterDialoguePath = path.join(OUTPUTS_DIR, `custom_master_dialogue_${Date.now()}.wav`);
    await khmerDubber.assembleTimelineAudio(mappedSegments, duration, masterDialoguePath);

    // Mix with original (center vocal cancellation & sidechain ducking, preserving rich normal BGM)
    const dubbedAudioPath = path.join(OUTPUTS_DIR, `custom_dubbed_master_${Date.now()}.mp3`);
    await audioProcessor.mixVocalsWithOriginal(extractedAudioPath, masterDialoguePath, dubbedAudioPath, 2.4, 0.95);

    // Merge with video
    const videoExt = path.extname(inputVideoPath);
    const outputVideoFilename = `custom_dubbed_khmer_${Date.now()}${videoExt}`;
    const outputVideoPath = path.join(OUTPUTS_DIR, outputVideoFilename);

    await audioProcessor.mergeVideoAudio(inputVideoPath, dubbedAudioPath, outputVideoPath);

    res.json({
      success: true,
      outputVideo: `/media/outputs/${outputVideoFilename}`,
      outputAudio: `/media/outputs/${path.basename(dubbedAudioPath)}`,
      totalLinesDubbed: mappedSegments.length
    });
  } catch (err) {
    console.error('Assemble custom error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Instant Character Voice Clone API
app.post('/api/character/clone', upload.single('voiceSample'), async (req, res) => {
  try {
    const { characterName, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Voice sample audio is required' });
    }

    // 1. If VoxCPM2 Colab is available, use it for zero-shot cloning
    if (process.env.VOXCPM_API_URL) {
      return res.json({
        success: true,
        voiceId: `voxcpm-ref:${req.file.filename}`,
        name: characterName || 'Movie Character',
        engine: 'voxcpm2'
      });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      // Mock result for demo
      return res.json({
        success: true,
        isDemo: true,
        voiceId: 'demo-voice-' + Date.now(),
        name: characterName || 'Chinese Hero Character',
        message: 'Voice cloned successfully in Demo mode! Enter ElevenLabs API Key for live AI sync.'
      });
    }

    const cloneResult = await elevenlabs.cloneVoice(
      characterName || 'Movie Character',
      req.file.path,
      description || 'Chinese movie character voice'
    );

    res.json({
      success: true,
      voiceId: cloneResult.voice_id,
      name: characterName
    });
  } catch (err) {
    console.error('Clone voice error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Translate dialogue snippet (Universal Multi-Language -> Khmer)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', context } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const translated = await translator.translateToKhmer(text, sourceLang, context);
    res.json({ success: true, original: text, translated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Character Speak in Khmer (Text to Speech with cloned voice or Neural Khmer Voice)
app.post('/api/character/speak', async (req, res) => {
  try {
    const { voiceId, text } = req.body;
    if (!voiceId || !text) {
      return res.status(400).json({ error: 'voiceId and text are required' });
    }

    const outputName = `tts_${Date.now()}.mp3`;
    const outputPath = path.join(OUTPUTS_DIR, outputName);

    // If cloned via VoxCPM2
    if (voiceId.startsWith('voxcpm-ref:')) {
      const sampleFilename = voiceId.replace('voxcpm-ref:', '');
      const samplePath = path.join(UPLOADS_DIR, sampleFilename);
      await khmerDubber.synthesizeRealisticSpeech(text, outputPath, 'voxcpm-voice-actor', samplePath);
      return res.json({
        success: true,
        audioUrl: `/media/outputs/${outputName}`
      });
    }

    // If voiceId is Khmer Neural Voice, use khmerDubber
    if (voiceId.startsWith('km-') || voiceId.includes('khmer') || voiceId.includes('demo')) {
      const voice = voiceId.includes('sreymom') || voiceId.includes('female') ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural';
      await khmerDubber.synthesizeKhmerSpeech(text, outputPath, voice);
      return res.json({
        success: true,
        audioUrl: `/media/outputs/${outputName}`
      });
    }

    try {
      if (process.env.ELEVENLABS_API_KEY) {
        await elevenlabs.textToSpeech(voiceId, text, outputPath);
        return res.json({
          success: true,
          audioUrl: `/media/outputs/${outputName}`
        });
      }
    } catch (elevenErr) {
      console.warn('Elevenlabs TTS failed, falling back to Khmer Neural Voice:', elevenErr.message);
    }

    // Fallback to high quality Khmer voice
    await khmerDubber.synthesizeKhmerSpeech(text, outputPath, 'km-KH-PisethNeural');
    res.json({
      success: true,
      audioUrl: `/media/outputs/${outputName}`
    });
  } catch (err) {
    console.error('Character speech synthesis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- NEW TOOL 1: Subtitle & SRT Studio Endpoints ---
app.post(['/api/subtitles/generate', '/api/dubbing/export-srt'], async (req, res) => {
  try {
    const { segments, dual = false, filename = 'movie' } = req.body;
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({ error: 'Segments array is required' });
    }

    const srtContent = audioProcessor.createSrtContent(segments, { dual });
    const srtFilename = `subtitle_${path.parse(filename).name}_${Date.now()}.srt`;
    const srtPath = path.join(OUTPUTS_DIR, srtFilename);
    fs.writeFileSync(srtPath, srtContent, 'utf8');

    res.json({
      success: true,
      srtContent,
      srtFilename,
      srtUrl: `/media/outputs/${srtFilename}`,
      totalLines: segments.length
    });
  } catch (err) {
    console.error('Generate SRT error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subtitles/burn-in', async (req, res) => {
  try {
    const { filename, srtFilename, options = {} } = req.body;
    if (!filename || !srtFilename) {
      return res.status(400).json({ error: 'Both video filename and srtFilename are required' });
    }

    let inputVideoPath = path.join(OUTPUTS_DIR, filename);
    if (!fs.existsSync(inputVideoPath)) inputVideoPath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(inputVideoPath)) inputVideoPath = path.join(__dirname, filename);
    if (!fs.existsSync(inputVideoPath)) return res.status(404).json({ error: 'Video file not found' });

    let srtPath = path.join(OUTPUTS_DIR, srtFilename);
    if (!fs.existsSync(srtPath)) return res.status(404).json({ error: 'SRT file not found' });

    const outFilename = `subtitled_${Date.now()}_${path.basename(inputVideoPath)}`;
    const outVideoPath = path.join(OUTPUTS_DIR, outFilename);

    await audioProcessor.burnSubtitlesToVideo(inputVideoPath, srtPath, outVideoPath, options);

    res.json({
      success: true,
      outputVideo: `/media/outputs/${outFilename}`,
      filename: outFilename
    });
  } catch (err) {
    console.error('Burn-in subtitles error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- NEW TOOL 2: Multi-Track Audio Mixer & BGM Mastering Endpoint ---
app.post('/api/audio/remix', async (req, res) => {
  try {
    const {
      filename,
      vocalGain = 2.4,
      bgmGain = 0.95,
      vocalSuppression = 'strong',
      reverbPreset = 'none'
    } = req.body;

    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    let inputVideoPath = path.join(OUTPUTS_DIR, filename);
    if (!fs.existsSync(inputVideoPath)) inputVideoPath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(inputVideoPath)) inputVideoPath = path.join(__dirname, filename);
    if (!fs.existsSync(inputVideoPath)) return res.status(404).json({ error: 'Video file not found' });

    // Look for dubbed dialogue and original audio
    const audioExt = path.parse(filename).name + '.mp3';
    let originalAudioPath = path.join(OUTPUTS_DIR, `audio_${audioExt}`);
    if (!fs.existsSync(originalAudioPath)) {
      originalAudioPath = path.join(OUTPUTS_DIR, `extracted_audio_${Date.now()}.mp3`);
      await audioProcessor.extractAudio(inputVideoPath, originalAudioPath);
    }

    // Find master dialogue track
    const files = fs.readdirSync(OUTPUTS_DIR);
    const dialogueCandidate = files.find(f => f.startsWith('custom_master_dialogue_') || f.startsWith('dubbed_dialogue_'));
    let dubbedDialoguePath = dialogueCandidate ? path.join(OUTPUTS_DIR, dialogueCandidate) : originalAudioPath;

    const remixedAudioFilename = `remixed_soundtrack_${Date.now()}.mp3`;
    const remixedAudioPath = path.join(OUTPUTS_DIR, remixedAudioFilename);

    await audioProcessor.remixAudioWithEffects(originalAudioPath, dubbedDialoguePath, remixedAudioPath, {
      vocalGain: parseFloat(vocalGain) || 1.6,
      bgmGain: parseFloat(bgmGain) || 0.25,
      vocalSuppression,
      reverbPreset
    });

    // Merge into video
    const remixedVideoFilename = `remixed_movie_${Date.now()}${path.extname(inputVideoPath)}`;
    const remixedVideoPath = path.join(OUTPUTS_DIR, remixedVideoFilename);
    await audioProcessor.mergeVideoAudio(inputVideoPath, remixedAudioPath, remixedVideoPath);

    res.json({
      success: true,
      outputAudio: `/media/outputs/${remixedAudioFilename}`,
      outputVideo: `/media/outputs/${remixedVideoFilename}`
    });
  } catch (err) {
    console.error('Remix audio error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- NEW TOOL 3: Voice Pitch & Lip-Sync Speed Tuner Endpoint ---
app.post('/api/character/tune-voice', async (req, res) => {
  try {
    const { voiceId, text, speed = 1.0, pitchSemitones = 0 } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    // 1. Generate base speech
    const tempRawPath = path.join(OUTPUTS_DIR, `raw_tune_${Date.now()}.wav`);
    const isFemale = voiceId && (voiceId.includes('female') || voiceId.includes('sreymom') || voiceId.includes('14') || voiceId.includes('21'));
    let studioRef = null;

    if (voiceId && voiceId.startsWith('voxcpm:')) {
      const sampleName = voiceId.replace('voxcpm:', '');
      const candidateDirect = path.join(SAMPLES_DIR, sampleName);
      const candidateMp3 = path.join(SAMPLES_DIR, `${sampleName}.mp3`);
      if (fs.existsSync(candidateDirect)) studioRef = candidateDirect;
      else if (fs.existsSync(candidateMp3)) studioRef = candidateMp3;
    }
    if (!studioRef) {
      studioRef = isFemale
        ? path.join(SAMPLES_DIR, 'main_lead_female.mp3')
        : path.join(SAMPLES_DIR, 'main_lead_male.mp3');
    }

    await khmerDubber.synthesizeRealisticSpeech(text, tempRawPath, voiceId || 'voxcpm-voice-actor', fs.existsSync(studioRef) ? studioRef : null, {
      gender: isFemale ? 'female' : 'male',
      emotion: 'dramatic'
    });

    // 2. Tune pitch and speed
    const tunedFilename = `tuned_voice_${Date.now()}.wav`;
    const tunedPath = path.join(OUTPUTS_DIR, tunedFilename);

    await audioProcessor.tuneAudioPitchAndSpeed(tempRawPath, tunedPath, speed, pitchSemitones);

    // Clean up temp
    try { if (fs.existsSync(tempRawPath)) fs.unlinkSync(tempRawPath); } catch (e) {}

    res.json({
      success: true,
      audioUrl: `/media/outputs/${tunedFilename}`,
      speed: parseFloat(speed),
      pitchSemitones: parseInt(pitchSemitones, 10)
    });
  } catch (err) {
    console.error('Tune voice error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Multi-computer network info API endpoint
app.get('/api/system/network-info', (req, res) => {
  const lanAddresses = getLocalNetworkAddresses();
  res.json({
    port: PORT,
    localUrl: `http://localhost:${PORT}`,
    lanAddresses,
    primaryLanUrl: lanAddresses.length > 0 ? lanAddresses[0].url : `http://localhost:${PORT}`
  });
});

// Global Error Handler (handle Multer errors in JSON instead of HTML)
app.use((err, req, res, next) => {
  console.error('Server error handler:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'ឯកសារវីដេអូធំពេកលើសពី 10GB! សូមជ្រើសរើសឯកសារតូចជាងនេះ។' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  const lanAddresses = getLocalNetworkAddresses();
  console.log(`====================================================`);
  console.log(`🎬 Cheatz Dabber.PRO - AI Voice Clone & Dubbing Studio`);
  console.log(`💻 Local Machine:    http://localhost:${PORT}`);
  lanAddresses.forEach(net => {
    console.log(`🌐 ប្រើបានគ្រប់កុំព្យូទ័រ (${net.interface}): ${net.url}`);
  });
  console.log(`====================================================`);
});
