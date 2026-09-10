const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Execute a shell command and return a Promise
 */
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Command failed: ${error.message}\n${stderr}`));
      }
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Extract audio from a video file
 */
async function extractAudio(videoPath, outputAudioPath) {
  // -vn: ignore video, -acodec libmp3lame or pcm_s16le, -ar 44100
  const cmd = `ffmpeg -y -i "${videoPath}" -vn -ar 44100 -ac 2 -b:a 192k "${outputAudioPath}"`;
  await runCommand(cmd);
  return outputAudioPath;
}

/**
 * Extract a specific snippet from audio file (for character voice reference)
 */
async function extractAudioSegment(inputPath, startTimeSec, durationSec, outputPath) {
  const cmd = `ffmpeg -y -ss ${startTimeSec} -t ${durationSec} -i "${inputPath}" -ar 44100 -ac 2 "${outputPath}"`;
  await runCommand(cmd);
  return outputPath;
}

/**
 * Mix new dubbed vocals with the original audio:
 * - Cancels center-channel original foreign speech (vocal suppression via stereotools mlev + vocal EQ notch)
 * - Preserves low bass (kick, cello, sub) and wide stereo background music (BGM) at full normal richness
 * - Deeply ducks original audio during Khmer speech (broadcast sidechain ducking ratio 16)
 * - Boosts dubbed Khmer human voice to crystal-clear studio loudness (vocalGain 2.2)
 * - Pads vocal track with apad so full movie duration is preserved 100%
 */
async function mixVocalsWithOriginal(originalAudioPath, dubbedAudioPath, outputPath, vocalGain = 2.2, bgmGain = 0.85) {
  const totalDuration = await getMediaDuration(originalAudioPath);
  const padDur = Math.max(1, Math.ceil(totalDuration));

  const advancedBgmFilter = 
    `[0:a]apad=whole_dur=${padDur},volume=${vocalGain},alimiter=limit=0.95[khmer_vox];` +
    `[1:a]asplit=2[low_b][mid_high];` +
    `[low_b]lowpass=f=260,volume=${bgmGain}[bass];` +
    `[mid_high]stereotools=mlev=0.015625:slev=1.35,highpass=f=240,equalizer=f=1100:width_type=o:w=2.2:g=-16,volume=${bgmGain}[bgm_sides];` +
    `[bass][bgm_sides]amix=inputs=2:dropout_transition=0[clean_bgm];` +
    `[clean_bgm][khmer_vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];` +
    `[khmer_vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0`;

  const cmd = `ffmpeg -nostdin -y -i "${dubbedAudioPath}" -i "${originalAudioPath}" -filter_complex "${advancedBgmFilter}" -c:a libmp3lame -b:a 192k "${outputPath}"`;

  try {
    await runCommand(cmd);
    return outputPath;
  } catch (err) {
    // If input audio is mono or stereotools fails, use center-pan / frequency ducking fallback:
    console.warn('Advanced BGM filter fallback to adaptive ducking:', err.message);
    const fallbackFilter = 
      `[0:a]apad=whole_dur=${padDur},volume=${vocalGain},alimiter=limit=0.95[khmer_vox];` +
      `[1:a]pan=stereo|c0=c0-c1|c1=c1-c0,equalizer=f=1100:width_type=o:w=2.2:g=-16,volume=${bgmGain}[bgm_clean];` +
      `[bgm_clean][khmer_vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];` +
      `[khmer_vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0`;
    const fallbackCmd = `ffmpeg -nostdin -y -i "${dubbedAudioPath}" -i "${originalAudioPath}" -filter_complex "${fallbackFilter}" -c:a libmp3lame -b:a 192k "${outputPath}"`;
    try {
      await runCommand(fallbackCmd);
      return outputPath;
    } catch (err2) {
      console.warn('Stereo-pan fallback failed, using volume ducking:', err2.message);
      const simpleFilter = 
        `[0:a]apad=whole_dur=${padDur},volume=${vocalGain},alimiter=limit=0.95[khmer_vox];` +
        `[1:a]volume=${bgmGain * 0.7}[bgm_clean];` +
        `[bgm_clean][khmer_vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];` +
        `[khmer_vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0`;
      const simpleCmd = `ffmpeg -nostdin -y -i "${dubbedAudioPath}" -i "${originalAudioPath}" -filter_complex "${simpleFilter}" -c:a libmp3lame -b:a 192k "${outputPath}"`;
      await runCommand(simpleCmd);
      return outputPath;
    }
  }
}

/**
 * Combine original video with the new dubbed audio track
 */
async function mergeVideoAudio(videoPath, audioPath, outputVideoPath) {
  // -c:v copy preserves video stream without re-encoding, extremely fast!
  // -movflags +faststart makes video streamable and playable across all browsers and devices!
  // NO -shortest: preserves the complete original video duration 100%!
  const cmd = `ffmpeg -nostdin -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -movflags +faststart "${outputVideoPath}"`;
  await runCommand(cmd);
  return outputVideoPath;
}

/**
 * Get media file duration and properties
 */
async function getMediaDuration(filePath) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const { stdout } = await runCommand(cmd);
    const duration = parseFloat(stdout.trim());
    return isNaN(duration) ? 0 : duration;
  } catch (err) {
    return 0;
  }
}

/**
 * Format seconds to SRT timestamp: 00:01:13,400
 */
function formatSrtTime(seconds) {
  const totalMs = Math.max(0, Math.round((parseFloat(seconds) || 0) * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Generate SRT text content from dialogue segments
 */
function createSrtContent(segments, options = {}) {
  const { dual = false } = options;
  let srt = '';
  let count = 1;

  for (const seg of segments) {
    const start = seg.start_time || 0;
    const end = seg.end_time || (start + 2.5);
    const khmerText = (seg.khmer || seg.khmer_text || '').trim();
    const chineseText = (seg.chinese || seg.chinese_text || '').trim();

    if (!khmerText && !chineseText) continue;

    srt += `${count}\n`;
    srt += `${formatSrtTime(start)} --> ${formatSrtTime(end)}\n`;

    if (dual && chineseText && khmerText) {
      srt += `${khmerText}\n${chineseText}\n\n`;
    } else {
      srt += `${khmerText || chineseText}\n\n`;
    }
    count++;
  }
  return srt;
}

/**
 * Burn subtitles into video with customizable styling
 */
async function burnSubtitlesToVideo(videoPath, srtPath, outputVideoPath, options = {}) {
  const {
    fontSize = 20,
    fontColor = 'yellow', // 'yellow', 'white', 'cyan'
    borderStyle = 3,      // 3 = opaque box/outline
    outline = 2
  } = options;

  let primaryColorHex = '&H0000FFFF'; // BGR: Yellow
  if (fontColor === 'white') primaryColorHex = '&H00FFFFFF';
  else if (fontColor === 'cyan') primaryColorHex = '&H00FFFF00';

  const escapedSrtPath = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  const forceStyle = `FontSize=${fontSize},PrimaryColour=${primaryColorHex},OutlineColour=&H00000000,BorderStyle=${borderStyle},Outline=${outline},MarginV=25`;

  const cmd = `ffmpeg -nostdin -y -i "${videoPath}" -vf "subtitles='${escapedSrtPath}':force_style='${forceStyle}'" -c:v libx264 -preset fast -crf 22 -c:a copy -movflags +faststart "${outputVideoPath}"`;
  await runCommand(cmd);
  return outputVideoPath;
}

/**
 * Advanced audio remixer with Normal BGM Preservation & Center Vocal Cancellation
 */
async function remixAudioWithEffects(originalAudioPath, dubbedAudioPath, outputPath, options = {}) {
  const {
    vocalGain = 2.2,
    bgmGain = 0.85,
    vocalSuppression = 'medium', // 'mild', 'medium', 'strong'
    reverbPreset = 'none'         // 'none', 'room', 'imperial', 'cave'
  } = options;

  const totalDuration = await getMediaDuration(originalAudioPath);
  const padDur = Math.max(1, Math.ceil(totalDuration));

  let mlevVal = 0.015625;
  let slevVal = 1.35;
  if (vocalSuppression === 'mild') {
    mlevVal = 0.15;
    slevVal = 1.1;
  } else if (vocalSuppression === 'strong') {
    mlevVal = 0.015625;
    slevVal = 1.5;
  }

  let reverbFilter = '';
  if (reverbPreset === 'imperial') {
    reverbFilter = ',aecho=0.8:0.88:60:0.4';
  } else if (reverbPreset === 'cave') {
    reverbFilter = ',aecho=0.8:0.9:120:0.5';
  } else if (reverbPreset === 'room') {
    reverbFilter = ',aecho=0.8:0.8:25:0.25';
  }

  const complexFilter = 
    `[0:a]apad=whole_dur=${padDur},volume=${vocalGain}${reverbFilter},alimiter=limit=0.95[vox];` +
    `[1:a]asplit=2[low_b][mid_high];` +
    `[low_b]lowpass=f=260,volume=${bgmGain}[bass];` +
    `[mid_high]stereotools=mlev=${mlevVal}:slev=${slevVal},highpass=f=240,equalizer=f=1100:width_type=o:w=2.2:g=-16,volume=${bgmGain}[bgm_sides];` +
    `[bass][bgm_sides]amix=inputs=2:dropout_transition=0[clean_bgm];` +
    `[clean_bgm][vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];` +
    `[vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0`;

  const cmd = `ffmpeg -nostdin -y -i "${dubbedAudioPath}" -i "${originalAudioPath}" -filter_complex "${complexFilter}" -c:a libmp3lame -b:a 192k "${outputPath}"`;
  
  try {
    await runCommand(cmd);
    return outputPath;
  } catch (err) {
    console.warn('Remix fallback:', err.message);
    const fallbackFilter = 
      `[0:a]apad=whole_dur=${padDur},volume=${vocalGain}${reverbFilter},alimiter=limit=0.95[vox];` +
      `[1:a]volume=${bgmGain}[bgm_clean];` +
      `[bgm_clean][vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];` +
      `[vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0`;
    const fallbackCmd = `ffmpeg -nostdin -y -i "${dubbedAudioPath}" -i "${originalAudioPath}" -filter_complex "${fallbackFilter}" -c:a libmp3lame -b:a 192k "${outputPath}"`;
    await runCommand(fallbackCmd);
    return outputPath;
  }
}

/**
 * Adjust voice pitch & speed for precise lip-sync & character tone tuning
 */
async function tuneAudioPitchAndSpeed(inputAudioPath, outputPath, speed = 1.0, pitchSemitones = 0) {
  const clampedSpeed = Math.max(0.5, Math.min(2.0, parseFloat(speed) || 1.0));
  const semitones = Math.max(-12, Math.min(12, parseInt(pitchSemitones, 10) || 0));

  let audioFilter = '';
  if (semitones !== 0) {
    const pitchFactor = Math.pow(2, semitones / 12);
    const newSampleRate = Math.round(44100 * pitchFactor);
    const tempoCompensation = clampedSpeed / pitchFactor;
    
    let tempoFilters = [];
    let remainingTempo = tempoCompensation;
    while (remainingTempo > 2.0) {
      tempoFilters.push('atempo=2.0');
      remainingTempo /= 2.0;
    }
    while (remainingTempo < 0.5) {
      tempoFilters.push('atempo=0.5');
      remainingTempo /= 0.5;
    }
    tempoFilters.push(`atempo=${remainingTempo.toFixed(3)}`);

    audioFilter = `-af "asetrate=${newSampleRate},${tempoFilters.join(',')},aresample=44100"`;
  } else {
    audioFilter = `-af "atempo=${clampedSpeed.toFixed(3)}"`;
  }

  const cmd = `ffmpeg -nostdin -y -i "${inputAudioPath}" ${audioFilter} -b:a 192k "${outputPath}"`;
  await runCommand(cmd);
  return outputPath;
}

module.exports = {
  extractAudio,
  extractAudioSegment,
  mixVocalsWithOriginal,
  mergeVideoAudio,
  getMediaDuration,
  formatSrtTime,
  createSrtContent,
  burnSubtitlesToVideo,
  remixAudioWithEffects,
  tuneAudioPitchAndSpeed
};
