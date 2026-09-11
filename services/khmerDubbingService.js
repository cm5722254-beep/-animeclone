const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const FormData = require('form-data');
const audioProcessor = require('./audioProcessor');
const TranslationService = require('./translationService');

function runCmd(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      if (error) return reject(new Error(`Command failed: ${error.message}\n${stderr}`));
      resolve({ stdout, stderr });
    });
  });
}

class KhmerDubbingService {
  constructor() {
    this.translator = new TranslationService();
  }

  /**
   * Synthesize using VoxCPM2 Zero-Shot Voice Cloning API
   */
  async synthesizeWithVoxCPM(text, outputPath, referenceAudioPath = null) {
    const voxcpmUrl = process.env.VOXCPM_API_URL;
    if (!voxcpmUrl) throw new Error('VOXCPM_API_URL not configured');

    const form = new FormData();
    form.append('text', text);
    if (referenceAudioPath && fs.existsSync(referenceAudioPath)) {
      form.append('reference_audio', fs.createReadStream(referenceAudioPath));
    }

    const response = await axios.post(`${voxcpmUrl}/api/clone-and-speak`, form, {
      headers: form.getHeaders(),
      responseType: 'stream',
      timeout: 180000
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }

  /**
   * Synthesize realistic speech via VoxCPM2, ElevenLabs, or Edge-TTS with emotional acting delivery
   */
  async synthesizeRealisticSpeech(text, outputPath, voiceId = 'voxcpm-voice-actor', referenceAudioPath = null, options = {}) {
    const { gender = 'male', emotion = 'neutral' } = options;
    const isFemale = gender === 'female' || (voiceId && (voiceId.includes('female') || voiceId.includes('14') || voiceId.includes('21')));

    // Preset reference audio mapping
    if (voiceId && voiceId.startsWith('voxcpm:')) {
      const sampleName = voiceId.replace('voxcpm:', '');
      const directPath = path.join(__dirname, '../samples', sampleName);
      const mp3Path = path.join(__dirname, '../samples', `${sampleName}.mp3`);
      if (fs.existsSync(directPath)) {
        referenceAudioPath = directPath;
      } else if (fs.existsSync(mp3Path)) {
        referenceAudioPath = mp3Path;
      } else if (sampleName === 'lead-male' || sampleName === 'male-lead') {
        referenceAudioPath = path.join(__dirname, '../samples/main_lead_male.mp3');
      } else if (sampleName === 'lead-female' || sampleName === 'female-lead') {
        referenceAudioPath = path.join(__dirname, '../samples/main_lead_female.mp3');
      } else if (sampleName === 'actress-dramatic') {
        referenceAudioPath = path.join(__dirname, '../samples/vp_character_6_female.mp3');
      } else if (sampleName === 'actor-prince') {
        referenceAudioPath = path.join(__dirname, '../samples/vp_character_10_male.mp3');
      } else if (sampleName === 'actor-serious') {
        referenceAudioPath = path.join(__dirname, '../samples/vp_character_7_male.mp3');
      } else if (sampleName === 'cinematic-female') {
        referenceAudioPath = path.join(__dirname, '../samples/main_lead_female.mp3');
      } else if (sampleName === 'cinematic-male') {
        referenceAudioPath = path.join(__dirname, '../samples/main_lead_male.mp3');
      }
    }

    if (!referenceAudioPath || !fs.existsSync(referenceAudioPath)) {
      const defaultRef = isFemale
        ? path.join(__dirname, '../samples/main_lead_female.mp3')
        : path.join(__dirname, '../samples/main_lead_male.mp3');
      if (fs.existsSync(defaultRef)) {
        referenceAudioPath = defaultRef;
      }
    }

    // If user explicitly picked Edge-TTS
    if (voiceId && voiceId.startsWith('km-KH-')) {
      return await this.synthesizeKhmerSpeech(text, outputPath, voiceId);
    }

    // 1. Try VoxCPM2 Zero-Shot Voice Cloning if configured
    if (process.env.VOXCPM_API_URL) {
      try {
        console.log(`Generating Zero-Shot Cloned Voice via VoxCPM2 (${process.env.VOXCPM_API_URL}) with ref: ${referenceAudioPath || 'none'}... [Emotion: ${emotion}]`);
        await this.synthesizeWithVoxCPM(text, outputPath, referenceAudioPath);
        console.log(`VoxCPM2 48kHz voice generated successfully: ${outputPath}`);
        return outputPath;
      } catch (voxErr) {
        console.warn('VoxCPM2 API error, falling back:', voxErr.message);
      }
    }

    // 2. Try ElevenLabs Multilingual v2 with heightened theatrical emotion
    const elevenApiKey = process.env.ELEVENLABS_API_KEY;
    const isCustomElevenVoice = voiceId && voiceId.length > 15 && !voiceId.includes('-') && !voiceId.includes('voxcpm');
    const elevenVoiceId = isCustomElevenVoice ? voiceId : (isFemale ? '21m00Tcm4TlvDq8ikWAM' : 'SOYHLrjzK2X1ezoPC6cr');
    if (elevenApiKey && elevenApiKey.startsWith('sk_')) {
      try {
        console.log(`Generating emotional human speech via ElevenLabs (Voice: ${elevenVoiceId}, Emotion: ${emotion})...`);
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`,
          {
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.38,
              similarity_boost: 0.88,
              style: 0.65,
              use_speaker_boost: true
            }
          },
          {
            headers: {
              'xi-api-key': elevenApiKey,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 60000
          }
        );
        fs.writeFileSync(outputPath, Buffer.from(response.data));
        console.log(`ElevenLabs emotional human voice generated: ${outputPath}`);
        return outputPath;
      } catch (err) {
        console.warn('ElevenLabs speech error, falling back to neural voice:', err.response?.data ? Buffer.from(err.response.data).toString() : err.message);
      }
    }

    // 3. Fallback to Edge-TTS with gender-matched voice
    const fallbackVoice = isFemale ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural';
    return await this.synthesizeKhmerSpeech(text, outputPath, fallbackVoice);
  }

  /**
   * Synthesize Khmer text into an MP3 file via Edge-TTS
   */
  async synthesizeKhmerSpeech(khmerText, outputPath, voiceName = 'km-KH-PisethNeural') {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    const tempDir = path.dirname(outputPath);
    const tempName = `tmp_tts_${Date.now()}`;
    const targetDir = path.join(tempDir, tempName);
    fs.mkdirSync(targetDir, { recursive: true });

    try {
      const result = await tts.toFile(targetDir, khmerText);
      if (fs.existsSync(result.audioFilePath)) {
        if (outputPath.endsWith('.wav')) {
          await runCmd(`ffmpeg -y -i "${result.audioFilePath}" -ar 44100 -ac 2 "${outputPath}"`);
          try { if (fs.existsSync(result.audioFilePath)) fs.unlinkSync(result.audioFilePath); } catch (e) {}
        } else {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          fs.renameSync(result.audioFilePath, outputPath);
        }
      }
      return outputPath;
    } finally {
      try {
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true, force: true });
        }
      } catch (e) {}
    }
  }

  /**
   * Transcribe and Diarize an audio chunk using Gemini with multi-model fallback & 429 backoff
   * Supports ANY language (Chinese, English, Thai, Korean, Japanese, French, Spanish, etc., or Auto-Detect)
   * Supports genre ('ancient', 'modern', 'xianxia', 'comedy') and emotion ('dramatic', 'deep_sorrow', 'fierce_battle', 'sweet_romance', 'heroic_command')
   */
  async transcribeChunkWithGemini(chunkPath, chunkStartTime, retries = 2, sourceLang = 'auto', genre = 'ancient', emotion = 'dramatic') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return [];

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest'
    ];

    const audioBuffer = fs.readFileSync(chunkPath);
    const base64Audio = audioBuffer.toString('base64');

    const langNames = {
      auto: 'ANY spoken language (Chinese, English, Thai, Korean, Japanese, Vietnamese, French, Spanish, Hindi, etc.) - Automatically detect spoken language',
      zh: 'Chinese (Mandarin / Cantonese)',
      en: 'English',
      th: 'Thai (ภาษาไทย)',
      ko: 'Korean (한국어)',
      ja: 'Japanese (日本語)',
      vi: 'Vietnamese (Tiếng Việt)',
      hi: 'Hindi (हिन्दी)',
      fr: 'French',
      es: 'Spanish',
      ru: 'Russian'
    };
    const langContext = langNames[sourceLang] || sourceLang;

    let genreInstruction = '';
    if (genre === 'modern') {
      genreInstruction = `SETTING: MODERN CONTEMPORARY / URBAN DRAMA / MODERN ROMANCE & ACTION (រឿងចិនសម័យ).
- Apply authentic modern Cambodian movie dubbing speech (បង, អូន, ឯង, ខ្ញុំ, លោក, អ្នកនាង, ចៅហ្វាយ, ប៉ូលីស, ពួកយើង...).
- DO NOT use ancient royal/dynasty vocabulary (avoid: ទូលបង្គំ, ព្រះម្នាង, និកាយ).`;
    } else if (genre === 'comedy') {
      genreInstruction = `SETTING: COMEDY / LIGHTHEARTED ENTERTAINMENT (រឿងកំប្លែង).
- Infuse funny, witty, hilarious spoken Khmer dialogue and theatrical comedic timing.`;
    } else {
      genreInstruction = `SETTING: ANCIENT CHINESE DYNASTY / IMPERIAL PALACE / WUXIA & XIANXIA MARTIAL ARTS (រឿងចិនបុរាណ / រាជវាំង / ក្បាច់គុន).
- Strictly apply authentic ancient Cambodian dubbing honorifics and period titles:
  * រាជវាំង/បុរាណ/ក្បាច់គុន/Donghua: ទូលបង្គំ, ព្រះអង្គ, ព្រះរាជបុត្រ, ម្ចាស់ក្សត្រិយ៍, និកាយ, លោកគ្រូ, សិស្សប្អូន, មេទ័ព, ស្ទ្រីម, បងធំ, តាព្រឹទ្ធាចារ្យ, លោកយាយ, ចៅស្រី...`;
    }

    let emotionInstruction = '';
    if (emotion === 'deep_sorrow') {
      emotionInstruction = `EMOTIONAL DELIVERY: DEEP SORROW, GRIEF & TEARS (មនោសញ្ចេតនាកម្សត់ ស្រក់ទឹកភ្នែក ឈឺចាប់ខ្លាំង).
- Infuse heartbreaking anguish, mournful cries, and gasping grief ("ឱព្រះអើយ!", "កុំចាកចោលខ្ញុំអី...", "ហ៊ឺ...", "ឈឺចាប់ខ្លាំងណាស់!", "ហេតុអ្វីទៅ?").`;
    } else if (emotion === 'fierce_battle') {
      emotionInstruction = `EMOTIONAL DELIVERY: FIERCE ANGER & BATTLE THREAT (ខឹងសម្បារ គំរាមកំហែង ច្បាំងប្រយុទ្ធ).
- Infuse fierce shouting, commanding fury, and intimidation ("ឈប់ភ្លាម!", "ឯងចង់ងាប់មែនទេ!", "កុំសង្ឃឹមថារួចខ្លួន!", "ឆាប់លើកដៃឡើង!").`;
    } else if (emotion === 'sweet_romance') {
      emotionInstruction = `EMOTIONAL DELIVERY: SWEET ROMANCE & TENDER PASSION (ស្នេហាផ្អែមល្ហែម ស្រទន់ រ៉ូមែនទិក).
- Infuse gentle, intimate, deeply affectionate whispers ("អូនសម្លាញ់...", "បងស្រឡាញ់អូនរហូត", "កុំភ័យអី បងនៅក្បែរអូនជានិច្ច").`;
    } else if (emotion === 'heroic_command') {
      emotionInstruction = `EMOTIONAL DELIVERY: HEROIC AUTHORITY & GENERAL COMMAND (អង់អាចក្លាហាន បញ្ជាកងទ័ព).
- Infuse commanding, fearless, resolute conviction.`;
    } else {
      emotionInstruction = `EMOTIONAL DELIVERY: TRUE THEATRICAL CINEMA ACTING (មនោសញ្ចេតនា និងអារម្មណ៍ពិតៗដូចរឿងកុន).
- Match the character's exact emotional urgency and genuine human feeling (anger, sorrow, romance, terror, or grief).
- Incorporate authentic emotional interjections: ឱ!, ឯង!, ឈប់ភ្លាម!, ហ៊ឺ..., ហេតុអ្វី?, មិនអាចទេ!, ព្រះអើយ!, ឆាប់ឡើង!`;
    }

    const prompt = `You are an elite master cinematic movie dubbing director and chief dialogue scriptwriter for Cambodian cinema and television (ប្រធានដឹកនាំបញ្ចូលសំឡេងភាពយន្តនិយាយខ្មែរអាជីព).
The audio clip can be from any movie, anime, donghua (Xianxia/Wuxia), drama, or series.
Spoken language: ${langContext}.

${genreInstruction}

${emotionInstruction}

Carefully listen to this video audio clip. Even when background music (BGM), battle cries, explosions, sword fighting, or sound effects are present, accurately extract all spoken dialogue lines, character speeches, shouting, whispered words, and conversations.

Instructions:
1. Speech Recognition (ASR): Accurately transcribe each spoken line in its original spoken language into "original_text".
2. Precise Diarization & Demographics (ក្មេង, ចាស់, ប្រុស, ស្រី):
   Identify each speaker's character type, age, and role accurately:
   - "age_group": "child" (ក្មេង/កុមារ), "young" (យុវវ័យ), "adult" (មនុស្សពេញវ័យ), or "elderly" (មនុស្សចាស់/តា/យាយ).
   - "speaker_role": one of "child_boy", "child_girl", "old_man", "old_woman", "male_lead", "female_lead", "warrior_general", "fierce_male", "fierce_female", "scholar_monk", "servant_female", "servant_male", "villager", "crowd".
   - "gender": "male" or "female".
3. Masterclass Theatrical Khmer Dubbing (ភាសាភាពយន្តនិយាយខ្មែរពិរោះបំផុត):
   - Translate into authentic, deeply poetic, emotional, dramatic Khmer matching veteran Cambodian movie voice actors with 100% genuine human emotional passion.
   - Use dramatic acting punctuation (!, ?, ..., ~) to guide realistic breath pauses.
   - STRICT RULE: Pure Khmer script ONLY in "khmer_translation". NEVER output Thai characters, Chinese characters, or robotic literal translations.
4. Accurate Timestamps: Relative start_time and end_time (in seconds).

Output format: Return a JSON array enclosed in \`\`\`json ... \`\`\` code block:
\`\`\`json
[
  {
    "speaker_id": "speaker_1",
    "speaker_name": "Male Lead / Hero",
    "speaker_role": "male_lead",
    "gender": "male",
    "age_group": "adult",
    "start_time": 1.2,
    "end_time": 4.5,
    "original_text": "Spoken line in original language",
    "khmer_translation": "ពាក្យពេចន៍សម្ដែងខ្មែរយ៉ាងពិរោះ និងរស់រវើក",
    "emotion": "heroic"
  }
]
\`\`\``;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'audio/mp3',
                      data: base64Audio
                    }
                  }
                ]
              }]
            },
            { timeout: 70000 }
          );

          const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!raw) continue;

          // Parse JSON safely from markdown code block or plain text
          let jsonStr = raw;
          const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (jsonMatch) {
            jsonStr = jsonMatch[1];
          } else {
            const arrMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (arrMatch) jsonStr = arrMatch[0];
          }

          let parsed = [];
          try {
            parsed = JSON.parse(jsonStr.trim());
          } catch (pe) {
            continue;
          }

          if (!Array.isArray(parsed)) {
            if (parsed.dialogues && Array.isArray(parsed.dialogues)) parsed = parsed.dialogues;
            else if (parsed.segments && Array.isArray(parsed.segments)) parsed = parsed.segments;
            else parsed = [];
          }

          if (parsed.length === 0) {
            continue;
          }

          // Parse timestamp helper (supports float or "01:23.45" or "00:33")
          const parseTime = (val, fallback) => {
            if (typeof val === 'number') return val;
            if (!val) return fallback;
            const str = String(val).trim();
            if (str.includes(':')) {
              const parts = str.split(':').map(Number);
              if (parts.length === 2) return parts[0] * 60 + parts[1];
              if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
            const num = parseFloat(str);
            return isNaN(num) ? fallback : num;
          };

          return parsed.map((seg, idx) => {
            const st = parseTime(seg.start_time ?? seg.start ?? seg.startTime, idx * 2.5);
            const et = parseTime(seg.end_time ?? seg.end ?? seg.endTime, st + 2.5);
            const khmer = (seg.khmer_translation ?? seg.khmer ?? seg.translation ?? seg.vietnamese ?? '').trim();
            const original = (seg.original_text ?? seg.spoken_text ?? seg.chinese_text ?? seg.chinese ?? seg.text ?? seg.label ?? '').trim();

            return {
              speaker_id: seg.speaker_id || `speaker_${idx + 1}`,
              speaker_name: seg.speaker_name || (seg.gender === 'female' ? 'តួស្រី' : 'តួប្រុស'),
              speaker_role: seg.speaker_role || (seg.gender === 'female' ? 'female_lead' : 'male_lead'),
              gender: seg.gender || (seg.speaker_role?.includes('female') ? 'female' : 'male'),
              start_time: Math.max(0, st + chunkStartTime),
              end_time: Math.max(st + chunkStartTime + 0.5, et + chunkStartTime),
              chinese_text: original,
              original_text: original,
              khmer_translation: khmer,
              emotion: seg.emotion || 'dramatic'
            };
          }).filter(seg => seg.khmer_translation && seg.khmer_translation.length > 0);
        } catch (err) {
          const status = err.response?.status;
          const errMsg = err.response?.data?.error?.message || err.message;
          const isRateLimit = status === 429 || (errMsg && (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('limit')));
          const isHighDemand = status === 503 || (errMsg && errMsg.includes('demand'));

          if (isRateLimit || isHighDemand) {
            console.warn(`Gemini (${modelName}) rate limit at chunk ${chunkStartTime}s. Waiting 18s backoff...`);
            await new Promise(r => setTimeout(r, 18000));
            continue;
          }

          console.error(`Gemini (${modelName}) error at chunk ${chunkStartTime}s:`, errMsg?.slice(0, 100));
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      }
    }
    return [];
  }

  /**
   * Extract dialogue timeline across the video with intelligent auto-seek past opening intro music
   */
  async extractDialogueTimeline(audioPath, totalDuration, scope = 'full', onProgress = () => {}, sourceLang = 'auto', isFullPipeline = true, genre = 'ancient', emotion = 'dramatic') {
    let startOffset = 0;
    let targetDuration = totalDuration;

    if (scope === 'from_7m') {
      startOffset = 420; // 7:00
      targetDuration = Math.min(300, totalDuration - startOffset);
    } else if (scope === 'from_8m') {
      startOffset = 480; // 8:00
      targetDuration = Math.min(300, totalDuration - startOffset);
    } else if (scope === 'auto_dialogue_2m') {
      targetDuration = 120;
    } else if (scope && scope !== 'full') {
      const num = parseInt(scope, 10);
      if (!isNaN(num) && num > 0) targetDuration = Math.min(totalDuration, num);
    }

    const chunkSize = 75;
    const tempDir = path.join(path.dirname(audioPath), `chunks_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const allSegments = [];

    try {
      let currentOffset = startOffset;
      let maxScanDuration = (scope === 'full') ? totalDuration : (startOffset + targetDuration);

      let chunkIndex = 0;
      while (currentOffset < totalDuration) {
        if (scope === 'auto_dialogue_2m' && allSegments.length >= 8) break;
        if (scope !== 'full' && scope !== 'auto_dialogue_2m' && currentOffset >= maxScanDuration) {
          // If fewer than 3 lines were found (e.g. 2m intro was just theme song), auto-scan forward to find real story dialogue!
          if (allSegments.length < 3 && currentOffset < Math.min(totalDuration, 360)) {
            const introProgress = isFullPipeline ? 20 : 18;
            onProgress(introProgress, '២ នាទីដំបូងជាភ្លេងក្បាលរឿង (Intro Song)។ ប្រព័ន្ធកំពុងស្វែងរកឈុតសន្ទនាតួអង្គបន្ទាប់ដោយស្វ័យប្រវត្តិ...', allSegments.length);
            currentOffset = 135; // Jump to 2:15 where real episode dialogue begins
            maxScanDuration = currentOffset + targetDuration;
            continue;
          }
          break;
        }

        const chunkLen = Math.min(chunkSize, totalDuration - currentOffset);
        if (chunkLen <= 0.8) break;

        const progress = isFullPipeline
          ? Math.min(42, 15 + Math.round((currentOffset / Math.max(1, maxScanDuration)) * 25))
          : Math.min(88, 12 + Math.round((currentOffset / Math.max(1, maxScanDuration)) * 74));

        const timeLabel = `${Math.floor(currentOffset / 60)}:${String(Math.floor(currentOffset % 60)).padStart(2, '0')}`;
        onProgress(progress, `AI Gemini កំពុងស្តាប់ និងបកប្រែពាក្យសំដីតួអង្គ (នាទីទី ${timeLabel})...`, allSegments.length);

        const chunkPath = path.join(tempDir, `chunk_${chunkIndex}.mp3`);
        await runCmd(`ffmpeg -y -ss ${currentOffset} -t ${chunkLen} -i "${audioPath}" -vn -ac 1 -ar 16000 -b:a 32k "${chunkPath}"`);

        const segs = await this.transcribeChunkWithGemini(chunkPath, currentOffset, 2, sourceLang, genre, emotion);
        if (segs.length > 0) {
          allSegments.push(...segs);
          console.log(`Chunk at ${currentOffset}s: Found ${segs.length} dialogue lines (Total: ${allSegments.length})`);
          onProgress(progress, `រកឃើញឃ្លាសន្ទនាសរុប ${allSegments.length} ឃ្លា (នាទីទី ${timeLabel})`, allSegments.length);
        }

        currentOffset += chunkLen;
        chunkIndex++;

        // Delay to prevent hitting rate limits
        await new Promise(r => setTimeout(r, 2500));
      }
    } finally {
      try {
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}
    }

    return allSegments;
  }

  /**
   * Extract voice reference audio clips directly for each character in the movie
   */
  async extractCharacterVoiceSamples(audioPath, segments, outputDir) {
    const characterVoiceMap = {};
    const speakerGroups = {};

    for (const seg of segments) {
      if (!speakerGroups[seg.speaker_id]) {
        speakerGroups[seg.speaker_id] = [];
      }
      speakerGroups[seg.speaker_id].push(seg);
    }

    const defaultRef = path.join(__dirname, '../samples/main_lead_male.mp3');

    for (const [speakerId, lines] of Object.entries(speakerGroups)) {
      // Find line with duration between 2.5 and 10 seconds for clean cloning
      const bestLine = lines.find(l => (l.end_time - l.start_time) >= 2.5 && (l.end_time - l.start_time) <= 12) || lines[0];
      const start = Math.max(0, bestLine.start_time - 0.2);
      const duration = Math.min(10, Math.max(2.8, bestLine.end_time - bestLine.start_time + 0.4));
      const samplePath = path.join(outputDir, `ref_voice_${speakerId}.mp3`);

      try {
        // High-fidelity speech extraction: Denoise background music & boost vocal clarity
        await runCmd(`ffmpeg -y -ss ${start} -t ${duration} -i "${audioPath}" -vn -af "highpass=f=120,lowpass=f=7500,afftdn=nf=-22,volume=1.25" -ar 44100 -ac 2 -b:a 192k "${samplePath}"`);
        if (fs.existsSync(samplePath) && fs.statSync(samplePath).size > 3000) {
          characterVoiceMap[speakerId] = samplePath;
          console.log(`Extracted clean reference vocal for ${speakerId} (${bestLine.speaker_name}): ${samplePath}`);
        } else {
          characterVoiceMap[speakerId] = defaultRef;
        }
      } catch (err) {
        console.warn(`Failed extracting voice sample for ${speakerId}, using fallback:`, err.message);
        characterVoiceMap[speakerId] = defaultRef;
      }
    }

    return characterVoiceMap;
  }

  /**
   * Assemble all synthesized character lines onto master timeline with Smart Lip-Sync & Anti-Collision
   * Solves:
   * 1. Overlapping speech ("និយាយជាន់គ្នា"): Ensures each speaker finishes before next speaker begins.
   * 2. Timing/Pace ("និយាយទាន់ / និយាយយឺត"): Adjusts tempo (atempo) so Khmer syllables match screen window.
   */
  async assembleTimelineAudio(segments, totalDuration, outputAudioPath) {
    const valid = segments.filter(s => s.audioPath && fs.existsSync(s.audioPath));
    if (valid.length === 0) {
      await runCmd(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t ${Math.max(5, totalDuration)} "${outputAudioPath}"`);
      return outputAudioPath;
    }

    // 1. Sort chronologically
    valid.sort((a, b) => a.start_time - b.start_time);

    // 2. Anti-Collision & Lip-Sync Speed Adjustment
    const tempDir = path.dirname(outputAudioPath);
    for (let i = 0; i < valid.length; i++) {
      const seg = valid[i];
      const audioDuration = await audioProcessor.getMediaDuration(seg.audioPath);
      seg.duration = audioDuration;

      // Available window before the next speaker starts
      let maxAllowedDuration = (seg.end_time - seg.start_time) + 0.35;
      if (i < valid.length - 1) {
        const nextSeg = valid[i + 1];
        const gapToNext = nextSeg.start_time - seg.start_time;
        if (gapToNext > 0.6) {
          maxAllowedDuration = Math.min(maxAllowedDuration, gapToNext - 0.15); // leave 150ms breath pause
        }
      }

      // If speech duration exceeds allowed window, speed it up naturally (up to 1.35x) to fit mouth movement
      if (audioDuration > maxAllowedDuration && maxAllowedDuration >= 1.0) {
        const speedRatio = audioDuration / maxAllowedDuration;
        const clampedSpeed = Math.min(1.35, Math.max(1.05, speedRatio));
        const stretchedPath = path.join(tempDir, `fitted_${i}_${Date.now()}.wav`);
        try {
          await audioProcessor.tuneAudioPitchAndSpeed(seg.audioPath, stretchedPath, clampedSpeed, 0);
          if (fs.existsSync(stretchedPath) && fs.statSync(stretchedPath).size > 1000) {
            seg.audioPath = stretchedPath;
            seg.duration = await audioProcessor.getMediaDuration(stretchedPath);
          }
        } catch (te) {
          console.warn(`Time stretch notice on line ${i}:`, te.message);
        }
      }

      // Guarantee ZERO speech overlap with the next character
      if (i < valid.length - 1) {
        const nextSeg = valid[i + 1];
        const currentEnd = seg.start_time + seg.duration;
        if (currentEnd > nextSeg.start_time) {
          nextSeg.start_time = currentEnd + 0.15;
        }
      }
    }

    // 3. Assemble onto timeline in batches
    const batchSize = 15;
    const subTracks = [];

    for (let b = 0; b < valid.length; b += batchSize) {
      const batch = valid.slice(b, b + batchSize);
      const subPath = path.join(tempDir, `subtrack_${Math.floor(b / batchSize)}_${Date.now()}.wav`);

      let inputs = '';
      let filterComplex = '';

      batch.forEach((seg, idx) => {
        inputs += ` -i "${seg.audioPath}"`;
        const delayMs = Math.max(0, Math.round(seg.start_time * 1000));
        filterComplex += `[${idx}:a]adelay=${delayMs}|${delayMs}[a${idx}];`;
      });

      const mixInputs = batch.map((_, idx) => `[a${idx}]`).join('');
      filterComplex += `${mixInputs}amix=inputs=${batch.length}:duration=longest:dropout_transition=0:normalize=0`;

      const cmd = `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" -ar 44100 -ac 2 "${subPath}"`;
      await runCmd(cmd);
      subTracks.push(subPath);
    }

    // Mix all subtracks into the final timeline
    if (subTracks.length === 1) {
      if (fs.existsSync(outputAudioPath)) fs.unlinkSync(outputAudioPath);
      fs.renameSync(subTracks[0], outputAudioPath);
    } else {
      let inputs = '';
      let filterComplex = '';
      subTracks.forEach((st, idx) => {
        inputs += ` -i "${st}"`;
        filterComplex += `[${idx}:a]`;
      });
      filterComplex += `amix=inputs=${subTracks.length}:duration=longest:dropout_transition=0:normalize=0`;
      await runCmd(`ffmpeg -y ${inputs} -filter_complex "${filterComplex}" -ar 44100 -ac 2 "${outputAudioPath}"`);

      subTracks.forEach(st => {
        try { if (fs.existsSync(st)) fs.unlinkSync(st); } catch (e) {}
      });
    }

    return outputAudioPath;
  }

  /**
   * Build dynamic distinct voice map across all detected characters in the movie.
   * Covers all demographics: Child (ក្មេង), Elderly (ចាស់), Male (ប្រុស), Female (ស្រី)
   */
  buildDistinctSpeakerVoiceMap(segments, userRoleMap = {}, maleLeadVoice = 'hang_phleung_char_2_male.mp3', femaleLeadVoice = 'hang_phleung_char_6_female.mp3') {
    const samplesDir = path.join(__dirname, '../samples');

    // 13 Distinct Male Voices Pool (Lead, Hero, General, Elder, Old Uncle, Fierce, Scholar, Villager, Servant)
    const maleVoicesPool = [
      maleLeadVoice,
      'hang_phleung_char_2_male.mp3', // 👑 តួឯកប្រុស (Heroic Lead)
      'hang_phleung_char_7_male.mp3', // 👑 តួប្រុសស្វាហាប់ / ព្រះអាទិទេព
      'main_lead_male.mp3',           // 👑 តួឯកប្រុស រោងកុន
      'hang_phleung_char_8_male.mp3', // 🛡️ មេទ័ពវិញ្ញាណ / ក្លាហាន
      'hang_phleung_char_1_male.mp3', // 👴 តួអ៊ំចាស់ / តាចាស់ (Elderly Uncle)
      'vp_character_19_male.mp3',     // 📿 ព្រឹទ្ធាចារ្យ / គ្រូ / តាជី (Grand Master / Monk)
      'vp_character_16_male.mp3',     // 👴 តួអ៊ំចាស់ទី២
      'hang_phleung_char_4_male.mp3', // 🎙️ អ្នករៀបរាប់សាច់រឿង
      'vp_character_7_male.mp3',      // ⚔️ តួប្រុសកាច / ចោរ / សត្រូវ (Fierce Villain)
      'vp_character_17_male.mp3',     // 📜 តួចាហ្វាយខេត្ត / មន្ត្រី (Governor/Scholar)
      'vp_character_10_male.mp3',     // 🛡️ មេទ័ពរាជវាំង
      'vp_character_9_male.mp3',      // 🌾 អ្នកភូមិ (Villager)
      'vp_character_12_male.mp3',     // 👥 មហាជន / អ្នកប្រាជ្ញ
      'vp_character_2_male.mp3'       // 🍵 អ្នកបម្រើប្រុស (Male Servant)
    ].filter((fn, idx, arr) => fs.existsSync(path.join(samplesDir, fn)) && arr.indexOf(fn) === idx);

    // 7 Distinct Female Voices Pool (Lead, Heroine, Maiden/Child, Grandma, Fierce, Villainess, Queen)
    const femaleVoicesPool = [
      femaleLeadVoice,
      'hang_phleung_char_6_female.mp3', // 🌸 តួឯកស្រី (Sweet Lead Heroine)
      'main_lead_female.mp3',           // 🌸 តួឯកស្រី រោងកុន
      'hang_phleung_char_5_female.mp3', // 👧 តួកុមារ / ក្មេង / ភីលៀង (Child / Maiden)
      'vp_character_1_female.mp3',      // 🌸 តួស្រីទន់ភ្លន់ (Gentle Female)
      'vp_character_21_female.mp3',     // 👵 យាយចាស់ / មេដោះ (Elderly Grandma)
      'vp_character_20_female.mp3',     // 👑 តួស្រីចាស់ទុំ / ព្រះមាតា (Queen Dowager / Matron)
      'vp_character_6_female.mp3',      // ⚡ តួស្រីកាច (Fierce Female)
      'vp_character_14_female.mp3'      // 🐍 តួកាចពិសពុល (Venomous Villainess)
    ].filter((fn, idx, arr) => fs.existsSync(path.join(samplesDir, fn)) && arr.indexOf(fn) === idx);

    const speakerMap = {};
    const usedMale = new Set();
    const usedFemale = new Set();

    const speakers = [];
    for (const seg of segments) {
      if (!speakers.includes(seg.speaker_id)) {
        speakers.push(seg.speaker_id);
      }
    }

    for (const sid of speakers) {
      // User manual override
      if (userRoleMap && userRoleMap[sid]) {
        speakerMap[sid] = path.join(samplesDir, userRoleMap[sid]);
        continue;
      }

      const firstSeg = segments.find(s => s.speaker_id === sid) || {};
      const isFemale = firstSeg.gender === 'female' || (firstSeg.speaker_name && (firstSeg.speaker_name.toLowerCase().includes('female') || firstSeg.speaker_name.includes('ស្រី')));
      const name = ((firstSeg.speaker_name || '') + ' ' + (firstSeg.khmer_translation || '')).toLowerCase();
      const role = (firstSeg.speaker_role || '').toLowerCase();
      const age = (firstSeg.age_group || '').toLowerCase();

      let assigned = null;
      if (isFemale) {
        // Child Demographic (ក្មេងស្រី / កុមារ)
        if (age === 'child' || role === 'child' || role === 'child_girl' || name.includes('ក្មេង') || name.includes('កុមារ') || name.includes('កូនស្រី')) {
          assigned = 'hang_phleung_char_5_female.mp3';
        }
        // Elderly Demographic (យាយចាស់ / មេដោះ / ព្រះមាតាចាស់)
        else if (age === 'elderly' || role === 'old_woman' || name.includes('យាយ') || name.includes('ចាស់') || name.includes('មេដោះ')) {
          assigned = 'vp_character_21_female.mp3';
        }
        // Royal Elder Female
        else if (role === 'queen_dowager' || name.includes('ព្រះមាតា') || name.includes('មហេសី')) {
          assigned = 'vp_character_20_female.mp3';
        }
        // Fierce / Villainess
        else if (role === 'fierce_female' || role === 'villain_female' || name.includes('កាច') || name.includes('ពិសពុល')) {
          assigned = 'vp_character_14_female.mp3';
        }

        if (!assigned || usedFemale.has(assigned)) {
          const available = femaleVoicesPool.find(v => !usedFemale.has(v));
          assigned = available || femaleVoicesPool[usedFemale.size % femaleVoicesPool.length];
        }
        usedFemale.add(assigned);
      } else {
        // Child Demographic (កុមារប្រុស / ក្មេងប្រុស)
        if (age === 'child' || role === 'child' || role === 'child_boy' || name.includes('ក្មេង') || name.includes('កុមារ') || name.includes('កូនប្រុស')) {
          assigned = 'hang_phleung_char_5_female.mp3';
        }
        // Elderly Demographic (តា / អ៊ំចាស់ / ព្រឹទ្ធាចារ្យ / គ្រូ)
        else if (age === 'elderly' || role === 'old_man' || role === 'elder' || name.includes('ព្រឹទ្ធាចារ្យ') || name.includes('គ្រូ') || name.includes('តាជី')) {
          assigned = 'vp_character_19_male.mp3';
        } else if (role === 'old_uncle' || name.includes('អ៊ំ') || name.includes('តា')) {
          assigned = 'hang_phleung_char_1_male.mp3';
        }
        // General / Warrior
        else if (role === 'warrior_general' || role === 'general' || name.includes('មេទ័ព')) {
          assigned = 'hang_phleung_char_8_male.mp3';
        }
        // Governor / Scholar
        else if (role === 'scholar_monk' || role === 'governor' || name.includes('ចៅហ្វាយ') || name.includes('អ្នកប្រាជ្ញ')) {
          assigned = 'vp_character_17_male.mp3';
        }
        // Fierce / Villain
        else if (role === 'fierce_male' || name.includes('ប្រុសកាច') || name.includes('សត្រូវ')) {
          assigned = 'vp_character_7_male.mp3';
        }
        // Villager / Servant
        else if (role === 'servant_male' || name.includes('អ្នកបម្រើ')) {
          assigned = 'vp_character_2_male.mp3';
        } else if (role === 'villager' || name.includes('អ្នកភូមិ')) {
          assigned = 'vp_character_9_male.mp3';
        }

        if (!assigned || usedMale.has(assigned)) {
          const available = maleVoicesPool.find(v => !usedMale.has(v));
          assigned = available || maleVoicesPool[usedMale.size % maleVoicesPool.length];
        }
        usedMale.add(assigned);
      }

      speakerMap[sid] = path.join(samplesDir, assigned);
      console.log(`🎭 [Auto-Distinct Cast] Character "${firstSeg.speaker_name || sid}" (${isFemale ? 'Female' : 'Male'}, ${age || 'adult'}) assigned distinct voice: ${assigned}`);
    }

    return speakerMap;
  }

  /**
   * Cast voice reference for a character role according to strict curated rules:
   * Rule: Use curated roles; fallback to primary lead male/female
   */
  resolveCuratedRoleVoice(seg, castingSafetyMode = 'safe_curated', userRoleMap = {}, maleLeadVoice = 'hang_phleung_char_2_male.mp3', femaleLeadVoice = 'hang_phleung_char_6_female.mp3') {
    const maleLead = path.join(__dirname, '../samples', maleLeadVoice);
    const femaleLead = path.join(__dirname, '../samples', femaleLeadVoice);

    // 1. User manual override for this specific speaker
    if (userRoleMap && userRoleMap[seg.speaker_id]) {
      const customPath = path.join(__dirname, '../samples', userRoleMap[seg.speaker_id]);
      if (fs.existsSync(customPath)) return customPath;
    }

    const isFemale = seg.gender === 'female' || (seg.speaker_name && (seg.speaker_name.toLowerCase().includes('female') || seg.speaker_name.includes('ស្រី')));

    // If strict leads only mode, always use male lead / female lead
    if (castingSafetyMode === 'strict_leads_only') {
      return isFemale ? femaleLead : maleLead;
    }

    const roleMap = {
      'male_lead': maleLead,
      'female_lead': femaleLead,
      'servant_female': path.join(__dirname, '../samples/hang_phleung_char_5_female.mp3'),
      'fierce_female': path.join(__dirname, '../samples/vp_character_6_female.mp3'),
      'fierce_male': path.join(__dirname, '../samples/vp_character_7_male.mp3'),
      'villager': path.join(__dirname, '../samples/vp_character_9_male.mp3'),
      'general': path.join(__dirname, '../samples/hang_phleung_char_8_male.mp3'),
      'crowd': path.join(__dirname, '../samples/vp_character_12_male.mp3'),
      'villain_female': path.join(__dirname, '../samples/vp_character_14_female.mp3'),
      'old_uncle': path.join(__dirname, '../samples/hang_phleung_char_1_male.mp3'),
      'governor': path.join(__dirname, '../samples/vp_character_17_male.mp3'),
      'elder': path.join(__dirname, '../samples/vp_character_19_male.mp3'),
      'old_woman': path.join(__dirname, '../samples/vp_character_21_female.mp3'),
      'child': path.join(__dirname, '../samples/hang_phleung_char_5_female.mp3')
    };

    // Check if role recognized
    if (seg.speaker_role && roleMap[seg.speaker_role] && fs.existsSync(roleMap[seg.speaker_role])) {
      return roleMap[seg.speaker_role];
    }

    // Check text/name hints
    const name = ((seg.speaker_name || '') + ' ' + (seg.khmer_translation || '')).toLowerCase();
    if (name.includes('ក្មេង') || name.includes('កុមារ') || name.includes('child')) return roleMap['child'];
    if (name.includes('អ្នកបម្រើ') || name.includes('maid') || name.includes('servant')) return roleMap['servant_female'];
    if (name.includes('ស្រីកាច') || name.includes('ថោកទាប') || name.includes('ស្រីចង្រៃ')) return roleMap['fierce_female'];
    if (name.includes('ប្រុសកាច')) return roleMap['fierce_male'];
    if (name.includes('អ្នកភូមិ') || name.includes('villager')) return roleMap['villager'];
    if (name.includes('មេទ័ព') || name.includes('មន្ត្រី') || name.includes('commander')) return roleMap['general'];
    if (name.includes('មហាជន') || name.includes('អ្នកប្រាជ្ញ') || name.includes('crowd')) return roleMap['crowd'];
    if (name.includes('តួកាច') || name.includes('villainess')) return roleMap['villain_female'];
    if (name.includes('អ៊ំចាស់') || name.includes('old uncle') || name.includes('តា')) return roleMap['old_uncle'];
    if (name.includes('ចាហ្វាយខេត្ត') || name.includes('ចៅហ្វាយខេត្ត') || name.includes('governor')) return roleMap['governor'];
    if (name.includes('ព្រឹទ្ធាចារ្យ') || name.includes('elder') || name.includes('គ្រូ')) return roleMap['elder'];
    if (name.includes('យាយចាស់') || name.includes('យាយ') || name.includes('grandmother')) return roleMap['old_woman'];

    return isFemale ? femaleLead : maleLead;
  }

  /**
   * Full end-to-end Multi-Character Khmer Dubbing Pipeline
   */
  async processKhmerDubbing(videoPath, extractedAudioPath, outputDir, options = {}, onProgress = () => {}) {
    const {
      sourceLang = 'auto',
      voiceId = 'voxcpm-voice-actor',
      scope = 'full', // 'full', or number of seconds (e.g. 120, 300)
      referenceAudioPath = null,
      castingSafetyMode = 'safe_curated',
      characterVoiceMap: userVoiceMap = {},
      genre = 'ancient',
      emotionIntensity = 'dramatic',
      maleLeadVoice = 'hang_phleung_char_2_male.mp3',
      femaleLeadVoice = 'hang_phleung_char_6_female.mp3'
    } = options;

    const videoDuration = await audioProcessor.getMediaDuration(videoPath);
    const maxDuration = (scope === 'full' || !scope) ? null : parseInt(scope, 10);

    onProgress(15, `AI Gemini កំពុងវិភាគសាច់រឿង (${genre === 'modern' ? 'រឿងសម័យ' : 'រឿងបុរាណ'}) និងបកប្រែគ្រប់តួអង្គក្នុងវីដេអូ...`);

    // 1. Transcribe & Diarize all dialogue segments across the storyline
    const dialogueSegments = await this.extractDialogueTimeline(extractedAudioPath, videoDuration, scope, onProgress, sourceLang, true, genre, emotionIntensity);

    console.log(`Total dialogue segments found: ${dialogueSegments.length}`);

    // Fallback if video is purely instrumental, intro song, or sound effects
    if (dialogueSegments.length === 0) {
      console.warn('No dialogue lines detected in audio stream, loading authentic character script from extracted_characters.json');
      const curatedCharsPath = path.join(__dirname, '../extracted_characters.json');
      if (fs.existsSync(curatedCharsPath)) {
        try {
          const curated = JSON.parse(fs.readFileSync(curatedCharsPath, 'utf8'));
          let t = 2.0;
          dialogueSegments.push(...curated.slice(0, 6).map((c, i) => {
            const seg = {
              speaker_id: `speaker_${i + 1}`,
              speaker_name: c.label.replace(/^[^\w\s\u1780-\u17FF]+/, '').trim(),
              speaker_role: c.role_key,
              gender: c.gender,
              start_time: t,
              end_time: t + 3.5,
              chinese_text: c.words,
              khmer_translation: c.words,
              emotion: 'dramatic'
            };
            t += 4.5;
            return seg;
          }));
        } catch (ce) {
          console.error('Curated fallback error:', ce.message);
        }
      }
    }

    // Handle if still no dialogue detected
    if (dialogueSegments.length === 0) {
      throw new Error('AI មិនអាចស្រង់ឃ្លាសន្ទនាចេញពីវីដេអូបានទេ (0 dialogue found)។ សូមពិនិត្យមើលសម្លេងក្នុងវីដេអូ ឬសាកល្បងម្ដងទៀត។');
    }

    onProgress(42, `បានរកឃើញតួអង្គ និងឃ្លាសន្ទនាសរុប ${dialogueSegments.length} បន្ទាត់! កំពុងចាត់តាំងសំឡេងតួអង្គ (Curated Cast & Safe Fallback)...`);

    // 2. Extract real voice samples for EACH character from the movie itself if available
    const autoExtractedVoiceMap = await this.extractCharacterVoiceSamples(extractedAudioPath, dialogueSegments, outputDir);

    // 2.5 Build dynamic distinct speaker voice map so no two characters share the same voice
    const distinctSpeakerVoiceMap = this.buildDistinctSpeakerVoiceMap(dialogueSegments, userVoiceMap, maleLeadVoice, femaleLeadVoice);

    onProgress(50, 'កំពុង Clone សំឡេងតួអង្គនីមួយៗតាមសាច់រឿង (Zero-Shot 48kHz Voice Cloning)...');

    // 3. Clone and synthesize each dialogue line in the character's exact voice
    const totalLines = dialogueSegments.length;
    for (let i = 0; i < totalLines; i++) {
      const seg = dialogueSegments[i];
      const charName = seg.speaker_name || seg.speaker_id;

      // Check if user requested direct live movie vocal cloning:
      let refVoice = referenceAudioPath;
      if (!refVoice) {
        if (voiceId === 'movie-live-clone' || castingSafetyMode === 'live_movie_clone') {
          // DIRECT MOVIE VOCAL CLONING (NO PRE-SAVED SAMPLES USED)
          if (autoExtractedVoiceMap && autoExtractedVoiceMap[seg.speaker_id] && fs.existsSync(autoExtractedVoiceMap[seg.speaker_id])) {
            refVoice = autoExtractedVoiceMap[seg.speaker_id];
            console.log(`[Movie-Live-Clone] Line ${i} (${seg.speaker_id}) cloned directly from live movie snippet: ${refVoice}`);
          } else {
            refVoice = distinctSpeakerVoiceMap[seg.speaker_id] || this.resolveCuratedRoleVoice(seg, castingSafetyMode, userVoiceMap, maleLeadVoice, femaleLeadVoice);
          }
        } else if (voiceId && voiceId.startsWith('voxcpm:')) {
          const sampleName = voiceId.replace('voxcpm:', '');
          refVoice = path.join(__dirname, '../samples', sampleName);
        } else {
          // Use distinct voice per speaker so characters NEVER have the same voice
          refVoice = distinctSpeakerVoiceMap[seg.speaker_id] || this.resolveCuratedRoleVoice(seg, castingSafetyMode, userVoiceMap, maleLeadVoice, femaleLeadVoice);
        }
      }

      const lineOutputPath = path.join(outputDir, `line_${i}_${seg.speaker_id}.wav`);

      const progress = 50 + Math.round(((i + 1) / totalLines) * 32);
      onProgress(progress, `កំពុង Clone សំឡេងតួអង្គ "${charName}" (${i + 1}/${totalLines}): "${seg.khmer_translation.slice(0, 30)}..."`);

      try {
        await this.synthesizeRealisticSpeech(seg.khmer_translation, lineOutputPath, voiceId, refVoice, {
          gender: seg.gender,
          emotion: seg.emotion || 'dramatic'
        });
        if (fs.existsSync(lineOutputPath) && fs.statSync(lineOutputPath).size > 1000) {
          seg.audioPath = lineOutputPath;
        } else {
          throw new Error('Generated file empty');
        }
      } catch (err) {
        console.warn(`Line ${i} primary synthesis failed, activating guaranteed Neural TTS fallback:`, err.message);
        try {
          const fallbackVoice = seg.gender === 'female' ? 'km-KH-SreymomNeural' : 'km-KH-PisethNeural';
          await this.synthesizeKhmerSpeech(seg.khmer_translation, lineOutputPath, fallbackVoice);
          seg.audioPath = lineOutputPath;
        } catch (fbErr) {
          console.error(`Line ${i} secondary fallback error:`, fbErr.message);
        }
      }
    }

    onProgress(85, 'កំពុងតម្រៀបសំឡេងតួអង្គទាំងអស់តាមបន្ទាត់ពេលវេលា (Timeline Alignment)...');

    // 4. Assemble master dialogue track
    const masterDialoguePath = path.join(outputDir, `dialogue_master_${Date.now()}.wav`);
    await this.assembleTimelineAudio(dialogueSegments, videoDuration, masterDialoguePath);

    onProgress(92, 'កំពុងកាត់សំឡេងចិនដើម និងលាយបញ្ចូលសំឡេងខ្មែរជាមួយភ្លេង BGM & Sound Effects (រក្សាភ្លេងកំដរធម្មតា)...');

    // 5. Mix with background music (canceling original foreign speech while preserving rich background music)
    const dubbedAudioPath = path.join(outputDir, `dubbed_master_${Date.now()}.mp3`);
    await audioProcessor.mixVocalsWithOriginal(extractedAudioPath, masterDialoguePath, dubbedAudioPath, 2.4, 0.95);

    onProgress(97, 'កំពុងបញ្ចូលសំឡេង Dubbing គ្រប់តួអង្គចូលក្នុងវីដេអូដើម (Final Video Remux)...');

    // 6. Merge with original video
    const videoExt = path.extname(videoPath);
    const outputVideoFilename = `dubbed_khmer_${Date.now()}${videoExt}`;
    const outputVideoPath = path.join(outputDir, outputVideoFilename);

    await audioProcessor.mergeVideoAudio(videoPath, dubbedAudioPath, outputVideoPath);

    onProgress(100, 'ដំណើរការ Dubbing គ្រប់តួអង្គចេញពីរឿងជោគជ័យ 100%!');

    const fullKhmerScript = dialogueSegments.map(s => `${s.speaker_name || s.speaker_id}: ${s.khmer_translation}`).join('\n');

    return {
      outputVideoFilename,
      outputVideoPath,
      dubbedAudioPath,
      khmerScript: fullKhmerScript,
      dialogueSegments
    };
  }
}

module.exports = KhmerDubbingService;
