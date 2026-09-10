require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function testRealMovieDialogue() {
  const KhmerDubbingService = require('./services/khmerDubbingService');
  const service = new KhmerDubbingService();
  console.log('Testing transcribeChunkWithGemini on real movie scene at 60s...');
  const res = await service.transcribeChunkWithGemini('d:/clone/scratch_dialogue_60s.mp3', 60);
  console.log('Dialogue lines detected:', res.length);
  res.forEach(r => console.log(`[${r.start_time.toFixed(1)}s - ${r.end_time.toFixed(1)}s] ${r.speaker_name} (${r.speaker_id}): ${r.chinese_text} -> ${r.khmer_translation}`));
}

testRealMovieDialogue().catch(e => console.error('Error:', e));
