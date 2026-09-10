const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

class ElevenLabsService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  getHeaders(extra = {}) {
    return {
      'xi-api-key': this.apiKey,
      ...extra
    };
  }

  /**
   * Create an automated Dubbing project (Video/Audio)
   * Converts Chinese speech directly to Khmer with cloned voices!
   */
  async createDubbingJob(filePath, sourceLang = 'zh', targetLang = 'km', numSpeakers = 0) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API Key is required. Please set it in Settings.');
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('target_lang', targetLang);
    form.append('source_lang', sourceLang);
    form.append('mode', 'automatic');
    if (numSpeakers > 0) {
      form.append('num_speakers', numSpeakers.toString());
    }

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/dubbing`, form, {
      headers: {
        ...this.getHeaders(),
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return response.data; // { dubbing_id: "..." }
  }

  /**
   * Check status of a dubbing job
   */
  async getDubbingStatus(dubbingId) {
    if (!this.apiKey) throw new Error('API Key missing');

    const response = await axios.get(`${ELEVENLABS_BASE_URL}/dubbing/${dubbingId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  /**
   * Download dubbed media (audio/video) for a specific target language
   */
  async downloadDubbedFile(dubbingId, targetLang, outputPath) {
    if (!this.apiKey) throw new Error('API Key missing');

    const response = await axios.get(
      `${ELEVENLABS_BASE_URL}/dubbing/${dubbingId}/audio/${targetLang}`,
      {
        headers: this.getHeaders(),
        responseType: 'stream'
      }
    );

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }

  /**
   * Clone a character voice instantly from an audio clip
   */
  async cloneVoice(voiceName, sampleAudioPath, description = 'Cloned character voice') {
    if (!this.apiKey) throw new Error('API Key missing');

    const form = new FormData();
    form.append('name', voiceName);
    form.append('description', description);
    form.append('files', fs.createReadStream(sampleAudioPath));

    const response = await axios.post(`${ELEVENLABS_BASE_URL}/voices/add`, form, {
      headers: {
        ...this.getHeaders(),
        ...form.getHeaders()
      }
    });

    return response.data; // { voice_id: "..." }
  }

  /**
   * Speak Khmer text using a cloned character voice (Eleven Multilingual v2)
   */
  async textToSpeech(voiceId, khmerText, outputPath) {
    if (!this.apiKey) throw new Error('API Key missing');

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text: khmerText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          style: 0.2,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }
}

module.exports = ElevenLabsService;
