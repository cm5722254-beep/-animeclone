/**
 * AI Emotion Detection System
 * វិភាគសំឡេងនិងកំណត់អារម្មណ៍ដោយស្វ័យប្រវត្តិ
 */

export type DetectedEmotion = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'scared'
  | 'whisper'
  | 'shout'
  | 'laugh'
  | 'cry';

export interface EmotionDetectionResult {
  emotion: DetectedEmotion;
  confidence: number; // 0-1
  intensity: number; // 0-100
  features: {
    volume: number; // 0-100
    pitch: number; // -12 to +12
    speed: number; // 0.5-2.0
    energy: number; // 0-100
  };
}

/**
 * Detect emotion from audio URL
 */
export async function detectEmotionFromAudio(
  audioUrl: string
): Promise<EmotionDetectionResult> {
  try {
    // Call backend API for emotion detection
    const response = await fetch('/api/audio/detect-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl }),
    });

    if (!response.ok) {
      throw new Error('Emotion detection failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Emotion detection error:', error);
    // Return neutral emotion as fallback
    return {
      emotion: 'neutral',
      confidence: 0.5,
      intensity: 50,
      features: {
        volume: 70,
        pitch: 0,
        speed: 1.0,
        energy: 50,
      },
    };
  }
}

/**
 * Detect emotion from audio features (client-side analysis)
 */
export async function detectEmotionFromFeatures(
  audioBuffer: AudioBuffer
): Promise<EmotionDetectionResult> {
  // Analyze audio features
  const features = analyzeAudioFeatures(audioBuffer);
  
  // Map features to emotion
  const emotion = mapFeaturesToEmotion(features);
  
  return {
    emotion: emotion.type,
    confidence: emotion.confidence,
    intensity: features.intensity,
    features: {
      volume: features.volume,
      pitch: features.pitch,
      speed: features.speed,
      energy: features.energy,
    },
  };
}

/**
 * Analyze audio features from AudioBuffer
 */
function analyzeAudioFeatures(audioBuffer: AudioBuffer) {
  const channelData = audioBuffer.getChannelData(0);
  
  // Calculate RMS (Root Mean Square) for volume/energy
  let sumSquares = 0;
  for (let i = 0; i < channelData.length; i++) {
    sumSquares += channelData[i] * channelData[i];
  }
  const rms = Math.sqrt(sumSquares / channelData.length);
  const volume = Math.min(100, Math.round(rms * 1000));
  const energy = volume;
  
  // Estimate pitch (simplified - detects high/low frequencies)
  const pitch = estimatePitch(channelData, audioBuffer.sampleRate);
  
  // Estimate speed (based on zero-crossing rate)
  const speed = estimateSpeed(channelData);
  
  // Estimate intensity (combination of volume and variability)
  const intensity = Math.min(100, Math.round((volume * 0.7) + (energy * 0.3)));
  
  return {
    volume,
    pitch,
    speed,
    energy,
    intensity,
  };
}

/**
 * Estimate pitch from audio data
 */
function estimatePitch(data: Float32Array, sampleRate: number): number {
  // Simplified pitch detection using zero-crossing rate
  let crossings = 0;
  for (let i = 1; i < data.length; i++) {
    if ((data[i - 1] >= 0 && data[i] < 0) || (data[i - 1] < 0 && data[i] >= 0)) {
      crossings++;
    }
  }
  
  const frequency = (crossings * sampleRate) / (2 * data.length);
  
  // Map frequency to pitch shift (-12 to +12 semitones)
  // Average voice: ~150-250 Hz
  const baseFreq = 200;
  const semitones = 12 * Math.log2(frequency / baseFreq);
  
  return Math.max(-12, Math.min(12, Math.round(semitones)));
}

/**
 * Estimate speech speed
 */
function estimateSpeed(data: Float32Array): number {
  // Simplified: higher zero-crossing rate = faster speech
  let crossings = 0;
  for (let i = 1; i < data.length; i++) {
    if ((data[i - 1] >= 0 && data[i] < 0) || (data[i - 1] < 0 && data[i] >= 0)) {
      crossings++;
    }
  }
  
  const rate = crossings / data.length;
  
  // Map to speed multiplier (0.5 - 2.0)
  if (rate < 0.01) return 0.8;
  if (rate < 0.02) return 1.0;
  if (rate < 0.03) return 1.2;
  return 1.5;
}

/**
 * Map audio features to emotion
 */
function mapFeaturesToEmotion(features: {
  volume: number;
  pitch: number;
  speed: number;
  energy: number;
  intensity: number;
}): { type: DetectedEmotion; confidence: number } {
  const { volume, pitch, speed, energy, intensity } = features;
  
  // Decision tree for emotion detection
  
  // High volume + high pitch + fast speed = Excited/Shout
  if (volume > 80 && pitch > 4 && speed > 1.3) {
    return { type: 'shout', confidence: 0.85 };
  }
  
  // High volume + variable pitch + fast speed = Angry
  if (volume > 75 && speed > 1.2 && intensity > 80) {
    return { type: 'angry', confidence: 0.8 };
  }
  
  // Low volume + breathy = Whisper
  if (volume < 35 && energy < 40) {
    return { type: 'whisper', confidence: 0.85 };
  }
  
  // High pitch + fast speed + high energy = Happy/Laugh
  if (pitch > 3 && speed > 1.1 && energy > 65) {
    return { type: 'happy', confidence: 0.75 };
  }
  
  // Very high pitch + very fast + very high energy = Laugh
  if (pitch > 5 && speed > 1.3 && energy > 75) {
    return { type: 'laugh', confidence: 0.8 };
  }
  
  // Low pitch + slow speed + low energy = Sad
  if (pitch < -2 && speed < 0.9 && energy < 55) {
    return { type: 'sad', confidence: 0.75 };
  }
  
  // Very low pitch + very slow + very low volume = Cry
  if (pitch < -3 && speed < 0.85 && volume < 60 && intensity < 50) {
    return { type: 'cry', confidence: 0.8 };
  }
  
  // High pitch + variable speed + high energy = Excited
  if (pitch > 4 && energy > 70 && intensity > 75) {
    return { type: 'excited', confidence: 0.75 };
  }
  
  // High pitch + fast speed + medium-low volume = Scared
  if (pitch > 2 && speed > 1.1 && volume < 65 && intensity > 60) {
    return { type: 'scared', confidence: 0.7 };
  }
  
  // Default to neutral
  return { type: 'neutral', confidence: 0.6 };
}

/**
 * Load audio file and get AudioBuffer
 */
export async function loadAudioBuffer(audioUrl: string): Promise<AudioBuffer> {
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  return audioBuffer;
}

/**
 * Batch detect emotions for multiple audio segments
 */
export async function batchDetectEmotions(
  audioUrls: string[]
): Promise<EmotionDetectionResult[]> {
  const promises = audioUrls.map(url => detectEmotionFromAudio(url));
  return Promise.all(promises);
}

/**
 * Get emotion description in Khmer
 */
export function getEmotionDescription(emotion: DetectedEmotion): string {
  const descriptions: Record<DetectedEmotion, string> = {
    neutral: '😐 ធម្មតា - សំឡេងនិយាយធម្មតា',
    happy: '😊 អរ រីករាយ - សំឡេងសប្បាយចិត្ត',
    sad: '😢 ក្រៀមក្រំ - សំឡេងទុក្ខព្រួយ',
    angry: '😠 ខឹង - សំឡេងខឹងសម្បា',
    excited: '🤩 រំភើប - សំឡេងរំភើបចិត្ត',
    scared: '😨 ភ័យ - សំឡេងភ័យខ្លាច',
    whisper: '🤫 និយាយស្រាល - សំឡេងស្រាលៗ',
    shout: '📢 ស្រែកខ្លាំង - សំឡេងស្រែកៗ',
    laugh: '😂 សើច - សំឡេងសើច',
    cry: '😭 យំ - សំឡេងយំ',
  };
  
  return descriptions[emotion];
}

/**
 * Suggest voice parameters based on detected emotion
 */
export function suggestVoiceParameters(
  emotion: DetectedEmotion,
  features: EmotionDetectionResult['features']
) {
  // Base parameters from emotion preset
  const baseParams = getEmotionPreset(emotion);
  
  // Adjust based on detected features
  return {
    ...baseParams,
    volume: features.volume,
    speed: features.speed,
    pitch: features.pitch,
  };
}

/**
 * Get emotion preset parameters
 */
function getEmotionPreset(emotion: DetectedEmotion) {
  const presets: Record<DetectedEmotion, any> = {
    neutral: { intensity: 50, volume: 70, speed: 1.0, pitch: 0, breathiness: 20, raspiness: 10, vibrato: 20 },
    happy: { intensity: 80, volume: 80, speed: 1.1, pitch: 2, breathiness: 15, raspiness: 5, vibrato: 30 },
    sad: { intensity: 60, volume: 50, speed: 0.85, pitch: -2, breathiness: 40, raspiness: 20, vibrato: 10 },
    angry: { intensity: 95, volume: 90, speed: 1.2, pitch: 1, breathiness: 10, raspiness: 60, vibrato: 5 },
    excited: { intensity: 90, volume: 85, speed: 1.3, pitch: 4, breathiness: 25, raspiness: 15, vibrato: 40 },
    scared: { intensity: 70, volume: 60, speed: 1.1, pitch: 3, breathiness: 50, raspiness: 30, vibrato: 60 },
    whisper: { intensity: 30, volume: 30, speed: 0.9, pitch: -1, breathiness: 80, raspiness: 5, vibrato: 5 },
    shout: { intensity: 100, volume: 100, speed: 1.0, pitch: 5, breathiness: 5, raspiness: 70, vibrato: 20 },
    laugh: { intensity: 85, volume: 75, speed: 1.2, pitch: 3, breathiness: 30, raspiness: 25, vibrato: 50 },
    cry: { intensity: 75, volume: 55, speed: 0.8, pitch: -3, breathiness: 60, raspiness: 40, vibrato: 70 },
  };
  
  return presets[emotion];
}
