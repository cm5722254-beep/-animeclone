import os
import re
import json
import base64
import asyncio
import requests
import edge_tts
from services import audio_processor

class KhmerDubber:
    def __init__(self):
        pass

    async def synthesize_khmer_speech(self, khmer_text: str, output_path: str, voice_name: str = 'km-KH-PisethNeural'):
        """Synthesize Khmer text directly via Python native edge-tts."""
        communicate = edge_tts.Communicate(khmer_text, voice_name)
        await communicate.save(output_path)
        return output_path

    async def synthesize_with_voxcpm(self, text: str, output_path: str, reference_audio_path: str = None):
        """Synthesize using VoxCPM2 Zero-Shot Voice Cloning API."""
        voxcpm_url = os.getenv('VOXCPM_API_URL')
        if not voxcpm_url:
            raise ValueError('VOXCPM_API_URL not configured')

        files = {}
        data = {'text': text}
        ref_file = None
        try:
            if reference_audio_path and os.path.exists(reference_audio_path):
                ref_file = open(reference_audio_path, 'rb')
                files['reference_audio'] = (os.path.basename(reference_audio_path), ref_file, 'audio/mpeg')

            response = requests.post(f"{voxcpm_url}/api/clone-and-speak", data=data, files=files if files else None, timeout=180, stream=True)
            if response.status_code != 200:
                raise RuntimeError(f"VoxCPM2 HTTP Error: {response.status_code} - {response.text[:100]}")

            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            return output_path
        finally:
            if ref_file:
                ref_file.close()

    async def synthesize_realistic_speech(self, text: str, output_path: str, voice_id: str = 'voxcpm-voice-actor', reference_audio_path: str = None, options: dict = None):
        """Synthesize realistic speech via VoxCPM2, ElevenLabs, or Edge-TTS with emotional acting delivery."""
        options = options or {}
        gender = options.get('gender', 'male')
        emotion = options.get('emotion', 'neutral')
        is_female = gender == 'female' or (voice_id and any(k in voice_id for k in ['female', '14', '21']))

        # Preset reference audio mapping
        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        if voice_id and voice_id.startswith('voxcpm:'):
            sample_name = voice_id.replace('voxcpm:', '')
            cand1 = os.path.join(samples_dir, sample_name)
            cand2 = os.path.join(samples_dir, f"{sample_name}.mp3")
            if os.path.exists(cand1):
                reference_audio_path = cand1
            elif os.path.exists(cand2):
                reference_audio_path = cand2

        if not reference_audio_path or not os.path.exists(reference_audio_path):
            def_ref = os.path.join(samples_dir, 'main_lead_female.mp3' if is_female else 'main_lead_male.mp3')
            if os.path.exists(def_ref):
                reference_audio_path = def_ref

        # Built-in Tool Neural Voices (100% inside tool, NO Google Colab needed, ultra fast)
        if voice_id in ['builtin-neural', 'builtin', 'local-neural', 'edge-auto', 'edge-tts'] or (voice_id and voice_id.startswith('km-KH-')):
            chosen_voice = voice_id if (voice_id and voice_id.startswith('km-KH-')) else ('km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural')
            return await self.synthesize_khmer_speech(text, output_path, chosen_voice)

        # 1. Try VoxCPM2 Zero-Shot Voice Cloning if configured
        if os.getenv('VOXCPM_API_URL'):
            try:
                print(f"Generating Zero-Shot Cloned Voice via VoxCPM2 ({os.getenv('VOXCPM_API_URL')}) with ref: {reference_audio_path or 'none'}... [Emotion: {emotion}]")
                await self.synthesize_with_voxcpm(text, output_path, reference_audio_path)
                print(f"VoxCPM2 48kHz voice generated successfully: {output_path}")
                return output_path
            except Exception as vox_err:
                print(f"VoxCPM2 API notice, falling back to neural voice: {vox_err}")

        # 2. Try ElevenLabs Multilingual v2
        api_key = os.getenv('ELEVENLABS_API_KEY')
        eleven_voice_id = voice_id if (voice_id and voice_id != 'voxcpm-voice-actor') else ('21m00Tcm4TlvDq8ikWAM' if is_female else 'SOYHLrjzK2X1ezoPC6cr')
        if api_key and api_key.startswith('sk_'):
            try:
                resp = requests.post(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{eleven_voice_id}",
                    headers={'xi-api-key': api_key, 'Content-Type': 'application/json'},
                    json={
                        'text': text,
                        'model_id': 'eleven_multilingual_v2',
                        'voice_settings': {'stability': 0.38, 'similarity_boost': 0.88, 'style': 0.65, 'use_speaker_boost': True}
                    },
                    timeout=60
                )
                if resp.status_code == 200:
                    with open(output_path, 'wb') as f:
                        f.write(resp.content)
                    return output_path
            except Exception as e_err:
                print(f"ElevenLabs notice: {e_err}")

        # 3. Guaranteed Neural TTS Fallback
        fallback_voice = 'km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural'
        return await self.synthesize_khmer_speech(text, output_path, fallback_voice)

    def resolve_curated_role_voice(self, seg: dict, casting_safety_mode: str = 'safe_curated', user_role_map: dict = None) -> str:
        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        male_lead = os.path.join(samples_dir, 'vp_character_20_female.mp3')
        female_lead = os.path.join(samples_dir, 'vp_character_1_female.mp3')

        user_role_map = user_role_map or {}
        if user_role_map.get(seg.get('speaker_id')):
            custom_path = os.path.join(samples_dir, user_role_map[seg['speaker_id']])
            if os.path.exists(custom_path):
                return custom_path

        is_female = seg.get('gender') == 'female' or ('female' in (seg.get('speaker_name') or '').lower()) or ('ស្រី' in (seg.get('speaker_name') or ''))
        if casting_safety_mode == 'strict_leads_only':
            return female_lead if is_female else male_lead

        role_map = {
            'male_lead': male_lead,
            'female_lead': female_lead,
            'servant_female': os.path.join(samples_dir, 'vp_character_2_male.mp3'),
            'fierce_female': os.path.join(samples_dir, 'vp_character_6_female.mp3'),
            'fierce_male': os.path.join(samples_dir, 'vp_character_7_male.mp3'),
            'villager': os.path.join(samples_dir, 'vp_character_9_male.mp3'),
            'general': os.path.join(samples_dir, 'vp_character_10_male.mp3'),
            'crowd': os.path.join(samples_dir, 'vp_character_12_male.mp3'),
            'villain_female': os.path.join(samples_dir, 'vp_character_14_female.mp3'),
            'old_uncle': os.path.join(samples_dir, 'vp_character_16_male.mp3'),
            'governor': os.path.join(samples_dir, 'vp_character_17_male.mp3'),
            'elder': os.path.join(samples_dir, 'vp_character_19_male.mp3'),
            'old_woman': os.path.join(samples_dir, 'vp_character_21_female.mp3')
        }

        role = seg.get('speaker_role')
        if role and role in role_map and os.path.exists(role_map[role]):
            return role_map[role]

        name = ((seg.get('speaker_name') or '') + ' ' + (seg.get('khmer_translation') or '')).lower()
        if 'អ្នកបម្រើ' in name or 'maid' in name or 'servant' in name: return role_map['servant_female']
        if 'ស្រីកាច' in name or 'ថោកទាប' in name or 'ស្រីចង្រៃ' in name: return role_map['fierce_female']
        if 'ប្រុសកាច' in name: return role_map['fierce_male']
        if 'អ្នកភូមិ' in name: return role_map['villager']
        if 'មេទ័ព' in name or 'មន្ត្រី' in name: return role_map['general']
        if 'មហាជន' in name: return role_map['crowd']
        if 'តួកាច' in name: return role_map['villain_female']
        if 'អ៊ំចាស់' in name: return role_map['old_uncle']
        if 'ចៅហ្វាយខេត្ត' in name: return role_map['governor']
        if 'ព្រឹទ្ធាចារ្យ' in name or 'គ្រូ' in name: return role_map['elder']
        if 'យាយ' in name: return role_map['old_woman']

        return female_lead if is_female else male_lead

    async def transcribe_chunk_with_gemini(self, chunk_path: str, chunk_start_time: float, retries: int = 2) -> list:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return []

        candidate_models = [
            'gemini-2.5-flash',
            'gemini-3.5-flash-lite',
            'gemini-2.5-flash-lite',
            'gemini-3.6-flash',
            'gemini-flash-latest'
        ]

        with open(chunk_path, 'rb') as f:
            base64_audio = base64.b64encode(f.read()).decode('utf-8')

        prompt = (
            "You are a legendary movie dubbing director and audio engineer specialized in Chinese historical drama & donghua (រឿងភាគចិនបុរាណនិយាយខ្មែរ / ភាពយន្តចិន).\n"
            "Carefully listen to this video audio clip. Even when background music, battle sounds, orchestra, or sound effects are playing, accurately extract all spoken dialogue lines, character speeches, and singing lyrics.\n\n"
            "Instructions:\n"
            "1. Speech Recognition (ASR): Transcribe each spoken Chinese line.\n"
            "2. Diarization: Identify speakers and classify 'speaker_role' into one of:\n"
            "   'male_lead', 'female_lead', 'servant_female', 'fierce_female', 'fierce_male', 'villager', 'general', 'crowd', 'villain_female', 'old_uncle', 'governor', 'elder', 'old_woman'.\n"
            "3. Theatrical Khmer Dubbing: Translate each line into authentic, highly dramatic, poetic, and cinematic Khmer matching Cambodian movie dubbing style. Infuse passionate emotion, dramatic interjections ('ឱ!', 'ឯង!', 'ឈប់ភ្លាម!', 'ហ៊ឺ...', 'ហេតុអ្វី?', 'ព្រះអើយ!', 'មិនអាចទេ!'), and acting punctuation (!, ?, ..., ~).\n"
            "4. Accurate Timestamps: Relative start_time and end_time (in seconds, float or mm:ss).\n\n"
            "Output format: Return a JSON array enclosed in ```json ... ``` code block:\n"
            "```json\n"
            "[\n"
            "  {\n"
            "    \"speaker_id\": \"speaker_1\",\n"
            "    \"speaker_name\": \"Male Lead / Hero\",\n"
            "    \"speaker_role\": \"male_lead\",\n"
            "    \"gender\": \"male\",\n"
            "    \"start_time\": 1.2,\n"
            "    \"end_time\": 4.5,\n"
            "    \"chinese_text\": \"Original Chinese line\",\n"
            "    \"khmer_translation\": \"Authentic theatrical Khmer dialogue\",\n"
            "    \"emotion\": \"heroic\"\n"
            "  }\n"
            "]\n"
            "```"
        )

        for model_name in candidate_models:
            for attempt in range(1, retries + 1):
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                    payload = {
                        "contents": [{
                            "parts": [
                                {"text": prompt},
                                {
                                    "inlineData": {
                                        "mimeType": "audio/mp3",
                                        "data": base64_audio
                                    }
                                }
                            ]
                        }]
                    }
                    resp = requests.post(url, json=payload, timeout=90)
                    if resp.status_code == 429:
                        print(f"Gemini ({model_name}) rate limit at chunk {chunk_start_time}s. Waiting 18s backoff...")
                        await asyncio.sleep(18)
                        continue

                    if resp.status_code != 200:
                        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:100]}")

                    data = resp.json()
                    raw = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                    if not raw:
                        continue

                    json_str = raw
                    match = re.search(r'```json\s*([\s\S]*?)\s*```', raw)
                    if match:
                        json_str = match.group(1)
                    else:
                        match2 = re.search(r'\[\s*\{[\s\S]*\}\s*\]', raw)
                        if match2:
                            json_str = match2.group(0)

                    parsed = json.loads(json_str)
                    if not isinstance(parsed, list):
                        continue

                    def parse_time(val, default):
                        if val is None: return default
                        if isinstance(val, (int, float)): return float(val)
                        if isinstance(val, str) and ':' in val:
                            parts = [float(p) for p in val.split(':')]
                            if len(parts) == 2: return parts[0] * 60 + parts[1]
                            if len(parts) == 3: return parts[0] * 3600 + parts[1] * 60 + parts[2]
                        try:
                            return float(val)
                        except Exception:
                            return default

                    result = []
                    for idx, seg in enumerate(parsed):
                        st = parse_time(seg.get('start_time') or seg.get('start'), idx * 2.5)
                        et = parse_time(seg.get('end_time') or seg.get('end'), st + 2.5)
                        khmer = (seg.get('khmer_translation') or seg.get('khmer') or seg.get('translation') or '').strip()
                        chinese = (seg.get('chinese_text') or seg.get('chinese') or '').strip()
                        if khmer:
                            result.append({
                                'speaker_id': seg.get('speaker_id') or f"speaker_{idx + 1}",
                                'speaker_name': seg.get('speaker_name') or ('តួស្រី' if seg.get('gender') == 'female' else 'តួប្រុស'),
                                'speaker_role': seg.get('speaker_role') or ('female_lead' if seg.get('gender') == 'female' else 'male_lead'),
                                'gender': seg.get('gender') or ('female' if 'female' in (seg.get('speaker_role') or '') else 'male'),
                                'start_time': max(0.0, st + chunk_start_time),
                                'end_time': max(st + chunk_start_time + 0.5, et + chunk_start_time),
                                'chinese_text': chinese,
                                'khmer_translation': khmer,
                                'emotion': seg.get('emotion') or 'dramatic'
                            })
                    return result
                except Exception as err:
                    print(f"Gemini ({model_name}) error at chunk {chunk_start_time}s: {str(err)[:80]}")
                    if attempt < retries:
                        await asyncio.sleep(3)
        return []

    async def extract_dialogue_timeline(self, audio_path: str, total_duration: float, scope: str = 'full', on_progress = None) -> list:
        start_offset = 0.0
        target_duration = total_duration

        if scope == 'from_7m':
            start_offset = 420.0
            target_duration = min(300.0, total_duration - start_offset)
        elif scope == 'from_8m':
            start_offset = 480.0
            target_duration = min(300.0, total_duration - start_offset)
        elif scope == 'auto_dialogue_2m':
            target_duration = 120.0
        elif scope and scope != 'full':
            try:
                num = float(scope)
                if num > 0: target_duration = min(total_duration, num)
            except Exception:
                pass

        chunk_size = 75.0
        temp_dir = os.path.join(os.path.dirname(audio_path), f"chunks_py_{int(asyncio.get_event_loop().time() * 1000)}")
        os.makedirs(temp_dir, exist_ok=True)
        all_segments = []

        try:
            current_offset = start_offset
            max_scan_duration = total_duration if (scope == 'full' or not scope) else (start_offset + target_duration)
            chunk_index = 0

            while current_offset < total_duration:
                if scope == 'auto_dialogue_2m' and len(all_segments) >= 8:
                    break
                if scope != 'full' and scope != 'auto_dialogue_2m' and current_offset >= max_scan_duration:
                    if len(all_segments) == 0 and current_offset < min(total_duration, 600.0):
                        if on_progress: on_progress(20, '២ នាទីដំបូងជាភ្លេងក្បាលរឿង (Intro)។ ប្រព័ន្ធកំពុងស្វែងរកឈុតសន្ទនាបន្ទាប់ដោយស្វ័យប្រវត្តិ...')
                        current_offset = max(current_offset, 420.0)
                        continue
                    break

                chunk_len = min(chunk_size, total_duration - current_offset)
                if chunk_len <= 5.0:
                    break

                prog = min(42, 15 + round((current_offset / max(1.0, max_scan_duration)) * 25))
                mins = int(current_offset // 60)
                secs = int(current_offset % 60)
                if on_progress: on_progress(prog, f"AI Gemini កំពុងស្តាប់ និងបកប្រែពាក្យសំដីតួអង្គ ({mins}:{secs:02d})...")

                chunk_path = os.path.join(temp_dir, f"chunk_{chunk_index}.mp3")
                audio_processor.run_command(f'ffmpeg -y -ss {current_offset} -t {chunk_len} -i "{audio_path}" -vn -ac 1 -ar 16000 -b:a 32k "{chunk_path}"')

                segs = await self.transcribe_chunk_with_gemini(chunk_path, current_offset)
                if segs:
                    all_segments.extend(segs)
                    print(f"Chunk at {current_offset}s: Found {len(segs)} dialogue lines")

                current_offset += chunk_len
                chunk_index += 1
                await asyncio.sleep(2.5)
        finally:
            import shutil
            try:
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

        return all_segments

    async def extract_character_voice_samples(self, audio_path: str, segments: list, output_dir: str) -> dict:
        character_voice_map = {}
        speaker_groups = {}
        for seg in segments:
            sid = seg.get('speaker_id')
            if sid not in speaker_groups:
                speaker_groups[sid] = []
            speaker_groups[sid].push(seg) if hasattr(speaker_groups[sid], 'push') else speaker_groups[sid].append(seg)

        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        for speaker_id, lines in speaker_groups.items():
            first_line = lines[0]
            is_female = first_line.get('gender') == 'female'
            default_ref = os.path.join(samples_dir, 'main_lead_female.mp3' if is_female else 'main_lead_male.mp3')

            best_line = next((l for l in lines if 2.5 <= (l.get('end_time', 0) - l.get('start_time', 0)) <= 12.0), lines[0])
            st = max(0.0, best_line.get('start_time', 0.0) - 0.2)
            dur = min(10.0, max(3.0, best_line.get('end_time', 0.0) - best_line.get('start_time', 0.0) + 0.4))
            sample_path = os.path.join(output_dir, f"ref_voice_{speaker_id}.mp3")

            try:
                audio_processor.run_command(f'ffmpeg -y -ss {st} -t {dur} -i "{audio_path}" -vn -ar 44100 -ac 2 -b:a 192k "{sample_path}"')
                if os.path.exists(sample_path) and os.path.getsize(sample_path) > 5000:
                    character_voice_map[speaker_id] = sample_path
                    print(f"Extracted real movie voice sample for {speaker_id}: {sample_path}")
                else:
                    character_voice_map[speaker_id] = default_ref
            except Exception:
                character_voice_map[speaker_id] = default_ref

        return character_voice_map

    async def assemble_timeline_audio(self, segments: list, total_duration: float, output_audio_path: str) -> str:
        """Assemble all synthesized character lines onto master timeline with Smart Lip-Sync & Anti-Collision."""
        valid = [s for s in segments if s.get('audioPath') and os.path.exists(s['audioPath'])]
        if not valid:
            audio_processor.run_command(f'ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t {max(5.0, total_duration)} "{output_audio_path}"')
            return output_audio_path

        valid.sort(key=lambda s: s.get('start_time', 0.0))
        temp_dir = os.path.dirname(output_audio_path)

        for i in range(len(valid)):
            seg = valid[i]
            aud_dur = audio_processor.get_media_duration(seg['audioPath'])
            seg['duration'] = aud_dur

            max_allowed = (seg.get('end_time', 0.0) - seg.get('start_time', 0.0)) + 0.35
            if i < len(valid) - 1:
                next_seg = valid[i + 1]
                gap = next_seg.get('start_time', 0.0) - seg.get('start_time', 0.0)
                if gap > 0.6:
                    max_allowed = min(max_allowed, gap - 0.15)

            # Fit mouth movement
            if aud_dur > max_allowed and max_allowed >= 1.0:
                speed_ratio = aud_dur / max_allowed
                clamped_speed = min(1.35, max(1.05, speed_ratio))
                stretched_path = os.path.join(temp_dir, f"fitted_py_{i}.wav")
                try:
                    audio_processor.tune_audio_pitch_and_speed(seg['audioPath'], stretched_path, clamped_speed, 0)
                    if os.path.exists(stretched_path) and os.path.getsize(stretched_path) > 1000:
                        seg['audioPath'] = stretched_path
                        seg['duration'] = audio_processor.get_media_duration(stretched_path)
                except Exception as e:
                    print(f"Time stretch notice on line {i}: {e}")

            # Guarantee ZERO speech overlap
            if i < len(valid) - 1:
                next_seg = valid[i + 1]
                cur_end = seg.get('start_time', 0.0) + seg['duration']
                if cur_end > next_seg.get('start_time', 0.0):
                    next_seg['start_time'] = cur_end + 0.15

        batch_size = 15
        sub_tracks = []
        for b in range(0, len(valid), batch_size):
            batch = valid[b:b + batch_size]
            sub_path = os.path.join(temp_dir, f"subtrack_py_{b}.wav")
            inputs = " ".join([f'-i "{s["audioPath"]}"' for s in batch])
            filter_parts = ";".join([f'[{idx}:a]adelay={round(max(0.0, s.get("start_time", 0.0)) * 1000)}|{round(max(0.0, s.get("start_time", 0.0)) * 1000)}[a{idx}]' for idx, s in enumerate(batch)])
            amix_inputs = "".join([f'[a{idx}]' for idx in range(len(batch))])
            complex_filter = f"{filter_parts};{amix_inputs}amix=inputs={len(batch)}:dropout_transition=0:normalize=0[out]"
            audio_processor.run_command(f'ffmpeg -y {inputs} -filter_complex "{complex_filter}" -map "[out]" "{sub_path}"')
            sub_tracks.append(sub_path)

        raw_mix_path = os.path.join(temp_dir, f"raw_mix_py_{int(asyncio.get_event_loop().time() * 1000)}.wav")
        if len(sub_tracks) == 1:
            if os.path.exists(raw_mix_path): os.unlink(raw_mix_path)
            os.rename(sub_tracks[0], raw_mix_path)
        else:
            inputs = " ".join([f'-i "{p}"' for p in sub_tracks])
            amix_inputs = "".join([f'[{idx}:a]' for idx in range(len(sub_tracks))])
            complex_filter = f"{amix_inputs}amix=inputs={len(sub_tracks)}:dropout_transition=0:normalize=0[out]"
            audio_processor.run_command(f'ffmpeg -y {inputs} -filter_complex "{complex_filter}" -map "[out]" "{raw_mix_path}"')
            for p in sub_tracks:
                try:
                    if os.path.exists(p): os.unlink(p)
                except Exception:
                    pass

        # Pad dialogue track to exact full video duration
        pad_dur = max(1, math.ceil(total_duration)) if 'math' in globals() else max(1, int(total_duration) + 1)
        audio_processor.run_command(f'ffmpeg -y -i "{raw_mix_path}" -af "apad=whole_dur={pad_dur}" -t {pad_dur} -ar 44100 -ac 2 "{output_audio_path}"')
        try:
            if os.path.exists(raw_mix_path): os.unlink(raw_mix_path)
        except Exception:
            pass

        return output_audio_path

    async def process_khmer_dubbing(self, video_path: str, extracted_audio_path: str, output_dir: str, options: dict = None, on_progress = None) -> dict:
        options = options or {}
        voice_id = options.get('voiceId', 'voxcpm-voice-actor')
        scope = options.get('scope', 'full')
        reference_audio_path = options.get('referenceAudioPath')
        casting_safety_mode = options.get('castingSafetyMode', 'safe_curated')
        user_voice_map = options.get('characterVoiceMap', {})

        video_duration = audio_processor.get_media_duration(video_path)

        if on_progress: on_progress(15, 'AI Gemini កំពុងវិភាគសាច់រឿង និងបកប្រែគ្រប់តួអង្គក្នុងវីដេអូ...')
        dialogue_segments = await self.extract_dialogue_timeline(extracted_audio_path, video_duration, scope, on_progress)

        if not dialogue_segments:
            raise RuntimeError('AI មិនអាចស្រង់ឃ្លាសន្ទនាចេញពីវីដេអូបានទេ (0 dialogue found)។ សូមពិនិត្យមើលសម្លេងក្នុងវីដេអូ ឬសាកល្បងម្ដងទៀត។')

        if on_progress: on_progress(42, f'បានរកឃើញតួអង្គ និងឃ្លាសន្ទនាសរុប {len(dialogue_segments)} បន្ទាត់! កំពុងចាត់តាំងសំឡេងតួអង្គ...')

        auto_voice_map = await self.extract_character_voice_samples(extracted_audio_path, dialogue_segments, output_dir)

        if on_progress: on_progress(50, 'កំពុង Clone សំឡេងតួអង្គនីមួយៗតាមសាច់រឿង (Zero-Shot 48kHz Voice Cloning)...')

        total_lines = len(dialogue_segments)
        for i in range(total_lines):
            seg = dialogue_segments[i]
            char_name = seg.get('speaker_name') or seg.get('speaker_id')

            ref_voice = reference_audio_path
            if not ref_voice:
                if (voice_id == 'movie-live-clone' or casting_safety_mode == 'live_movie_clone') and auto_voice_map.get(seg.get('speaker_id')):
                    ref_voice = auto_voice_map[seg['speaker_id']]
                else:
                    ref_voice = self.resolve_curated_role_voice(seg, casting_safety_mode, user_voice_map)

            line_output_path = os.path.join(output_dir, f"line_{i}_{seg.get('speaker_id')}.wav")
            prog = 50 + round(((i + 1) / total_lines) * 32)
            if on_progress: on_progress(prog, f'កំពុង Clone សំឡេងតួអង្គ "{char_name}" ({i + 1}/{total_lines}): "{seg.get("khmer_translation", "")[:30]}..."')

            try:
                await self.synthesize_realistic_speech(seg.get('khmer_translation', ''), line_output_path, voice_id, ref_voice, {
                    'gender': seg.get('gender'),
                    'emotion': seg.get('emotion', 'dramatic')
                })
                if os.path.exists(line_output_path) and os.path.getsize(line_output_path) > 1000:
                    seg['audioPath'] = line_output_path
                else:
                    raise RuntimeError('Empty output')
            except Exception as e:
                print(f"Line {i} primary synthesis fallback: {e}")
                fb_voice = 'km-KH-SreymomNeural' if seg.get('gender') == 'female' else 'km-KH-PisethNeural'
                await self.synthesize_khmer_speech(seg.get('khmer_translation', ''), line_output_path, fb_voice)
                seg['audioPath'] = line_output_path

        if on_progress: on_progress(85, 'កំពុងតម្រៀបសំឡេងតួអង្គទាំងអស់តាមបន្ទាត់ពេលវេលា (Timeline Alignment)...')
        ts = int(asyncio.get_event_loop().time() * 1000)
        master_dialogue_path = os.path.join(output_dir, f"dialogue_master_{ts}.wav")
        await self.assemble_timeline_audio(dialogue_segments, video_duration, master_dialogue_path)

        if on_progress: on_progress(92, 'កំពុងកាត់សំឡេងចិនដើម និងលាយបញ្ចូលសំឡេងខ្មែរជាមួយភ្លេង BGM & Sound Effects (រក្សាភ្លេងកំដរធម្មតា)...')
        dubbed_audio_path = os.path.join(output_dir, f"dubbed_master_{ts}.mp3")
        audio_processor.mix_vocals_with_original(extracted_audio_path, master_dialogue_path, dubbed_audio_path, 2.2, 0.85)

        if on_progress: on_progress(97, 'កំពុងបញ្ចូលសំឡេង Dubbing គ្រប់តួអង្គចូលក្នុងវីដេអូដើម (Final Video Remux)...')
        video_ext = os.path.splitext(video_path)[1]
        output_video_filename = f"dubbed_khmer_{ts}{video_ext}"
        output_video_path = os.path.join(output_dir, output_video_filename)
        audio_processor.merge_video_audio(video_path, dubbed_audio_path, output_video_path)

        if on_progress: on_progress(100, 'ដំណើរការ Dubbing គ្រប់តួអង្គចេញពីរឿងជោគជ័យ 100%!')

        khmer_script = "\n".join([f"{s.get('speaker_name') or s.get('speaker_id')}: {s.get('khmer_translation')}" for s in dialogue_segments])
        return {
            'outputVideoFilename': output_video_filename,
            'outputVideoPath': output_video_path,
            'dubbedAudioPath': dubbed_audio_path,
            'khmerScript': khmer_script,
            'dialogueSegments': dialogue_segments
        }
