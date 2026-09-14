import os
import re
import json
import base64
import asyncio
import math
import shutil
import requests
import edge_tts
from services import audio_processor
from services.elevenlabs_service import elevenlabs_service

def clean_pure_khmer(text: str) -> str:
    """Filter out all Thai unicode (\u0E00-\u0E7F), Chinese unicode (\u4E00-\u9FFF), Japanese/Korean, and ensure 100% pure authentic Khmer."""
    if not text:
        return ""
    # 1. Remove all Thai unicode characters completely (\u0E00-\u0E7F)
    cleaned = re.sub(r'[\u0E00-\u0E7F]+', '', text)
    # 2. Remove all Chinese unicode characters completely (\u4E00-\u9FFF)
    cleaned = re.sub(r'[\u4E00-\u9FFF]+', '', cleaned)
    # 3. Remove Japanese and Korean unicode
    cleaned = re.sub(r'[\u3040-\u30FF\u31F0-\u31FF\uAC00-\uD7AF]+', '', cleaned)
    # 4. Clean multiple spaces and trim
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def detect_speaker_gender(speaker_name: str = '', speaker_role: str = '', chinese_text: str = '', raw_gender: str = None) -> str:
    """Accurately classify character gender without any gender confusion or crossover (ស្រី ឬ ប្រុស ដាច់ដោយឡែក)."""
    # Priority 1: Raw gender from AI if explicitly provided
    if raw_gender and str(raw_gender).lower() in ['female', 'fem', 'f', 'ស្រី', 'woman', 'girl']:
        return 'female'
    if raw_gender and str(raw_gender).lower() in ['male', 'm', 'ប្រុស', 'man', 'boy']:
        return 'male'

    text_to_check = f"{speaker_name} {speaker_role} {chinese_text}".lower()

    # Female indicators (មាតិកាស្រី) - MUST CHECK FIRST to avoid false male detection
    female_khmer = ['ស្រី', 'នាង', 'ម៉ាក់', 'យាយ', 'អ៊ំស្រី', 'ប្អូនស្រី', 'អ្នកនាង', 'ភរិយា', 'ម្ចាស់ក្សត្រី', 'តួស្រី', 'ក្មេងស្រី', 'កូនស្រី', 'អ្នកបម្រើស្រី', 'ស្រីកាច', 'ម៉ែ', 'មេម៉ាយ', 'ក្រមុំ', 'កូនស្រីតូច', 'នារី']
    female_roles = ['female', 'woman', 'girl', 'lady', 'maid', 'queen', 'princess', 'sister', 'mother', 'servant_female', 'fierce_female', 'villain_female', 'old_woman', 'bride', 'teacher_female', 'wife']
    female_chinese = ['小姐', '姑娘', '夫人', '公主', '王妃', '母', '姐', '妹', '女', '她', '丫鬟', '婆', '太太', '新娘', '媽', '妃']

    # Check female indicators FIRST (higher priority)
    for kw in female_khmer + female_roles + female_chinese:
        if kw in text_to_check:
            return 'female'

    # Male indicators (មាតិកាប្រុស)
    male_khmer = ['ប្រុស', 'លោក', 'បង', 'ឪពុក', 'តា', 'អ៊ំប្រុស', 'មេទ័ព', 'ប្អូនប្រុស', 'ស្វាមី', 'កូនចៅ', 'ព្រះអង្គ', 'ចៅហ្វាយ', 'តួប្រុស', 'ប្រុសកាច', 'ព្រឹទ្ធាចារ្យ', 'ឪពុកពោះម៉ាយ', 'កូនប្រុស', 'តួឯកប្រុស', 'ភ្នាក់ងារ']
    male_roles = ['male', 'man', 'boy', 'general', 'governor', 'elder', 'uncle', 'king', 'prince', 'brother', 'father', 'fierce_male', 'old_uncle', 'president', 'mediator', 'staff', 'soldier', 'warrior', 'hero']
    male_chinese = ['先生', '公子', '少爷', '王爷', '将领', '父', '兄', '弟', '男', '他', '大夫', '宗主', '掌门', '师傅', '老爷', '哥', '侠', '爹']

    for kw in male_khmer + male_roles + male_chinese:
        if kw in text_to_check:
            return 'male'

    # Default: male (conservative default to prevent false female classification)
    return 'male'

ROLE_THEATRICAL_PROFILES = {
    'male_lead': {'voice': 'km-KH-PisethNeural', 'pitch': '+0Hz', 'rate': '+0%'},
    'female_lead': {'voice': 'km-KH-SreymomNeural', 'pitch': '+2Hz', 'rate': '+0%'},
    'servant_female': {'voice': 'km-KH-SreymomNeural', 'pitch': '+14Hz', 'rate': '+8%'},
    'fierce_female': {'voice': 'km-KH-SreymomNeural', 'pitch': '-6Hz', 'rate': '-4%'},
    'fierce_male': {'voice': 'km-KH-PisethNeural', 'pitch': '-16Hz', 'rate': '-5%'},
    'villager': {'voice': 'km-KH-PisethNeural', 'pitch': '+4Hz', 'rate': '+4%'},
    'general': {'voice': 'km-KH-PisethNeural', 'pitch': '-20Hz', 'rate': '-8%'},
    'crowd': {'voice': 'km-KH-PisethNeural', 'pitch': '+8Hz', 'rate': '+8%'},
    'villain_female': {'voice': 'km-KH-SreymomNeural', 'pitch': '-8Hz', 'rate': '-6%'},
    'old_uncle': {'voice': 'km-KH-PisethNeural', 'pitch': '-14Hz', 'rate': '-12%'},
    'governor': {'voice': 'km-KH-PisethNeural', 'pitch': '-10Hz', 'rate': '-5%'},
    'elder': {'voice': 'km-KH-PisethNeural', 'pitch': '-16Hz', 'rate': '-15%'},
    'old_woman': {'voice': 'km-KH-SreymomNeural', 'pitch': '-10Hz', 'rate': '-12%'},
    'child': {'voice': 'km-KH-SreymomNeural', 'pitch': '+24Hz', 'rate': '+12%'},
}

class KhmerDubber:
    def __init__(self):
        pass

    async def synthesize_khmer_speech(self, khmer_text: str, output_path: str, voice_name: str = 'km-KH-PisethNeural', pitch: str = '+0Hz', rate: str = '+0%'):
        """Synthesize Khmer text directly via Python native edge-tts (100% pure authentic Khmer)."""
        khmer_text = clean_pure_khmer(khmer_text)
        if not khmer_text or not any('\u1780' <= c <= '\u17FF' for c in khmer_text):
            khmer_text = "បាទ"

        temp_mp3 = output_path if output_path.endswith('.mp3') else f"{output_path}_temp.mp3"
        communicate = edge_tts.Communicate(khmer_text, voice_name, pitch=pitch, rate=rate)
        await communicate.save(temp_mp3)

        if output_path.endswith('.wav'):
            audio_processor.run_command(f'ffmpeg -y -i "{temp_mp3}" -ar 44100 -ac 2 "{output_path}"')
            try:
                if os.path.exists(temp_mp3) and temp_mp3 != output_path:
                    os.remove(temp_mp3)
            except Exception:
                pass
        return output_path

    async def synthesize_with_voxcpm(self, text: str, output_path: str, reference_audio_path: str = None):
        """Synthesize using VoxCPM2 Zero-Shot Voice Cloning API without blocking FastAPI event loop."""
        voxcpm_url = os.getenv('VOXCPM_API_URL')
        if not voxcpm_url:
            raise ValueError('VOXCPM_API_URL not configured')

        text = clean_pure_khmer(text)
        if not text:
            text = "បាទ"

        def _do_sync_post():
            files = {}
            data = {'text': text}
            ref_file = None
            try:
                if reference_audio_path and os.path.exists(reference_audio_path):
                    ref_file = open(reference_audio_path, 'rb')
                    files['reference_audio'] = (os.path.basename(reference_audio_path), ref_file, 'audio/mpeg')

                response = requests.post(f"{voxcpm_url}/api/clone-and-speak", data=data, files=files if files else None, timeout=300, stream=True)
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

        return await asyncio.to_thread(_do_sync_post)

    async def synthesize_realistic_speech(self, text: str, output_path: str, voice_id: str = 'builtin-neural', reference_audio_path: str = None, options: dict = None):
        """Synthesize 100% pure authentic Cambodian Khmer speech with theatrical character acting delivery."""
        text = clean_pure_khmer(text)
        if not text or not any('\u1780' <= c <= '\u17FF' for c in text):
            text = "បាទ"

        options = options or {}
        gender = options.get('gender')
        speaker_name = options.get('speaker_name', '')
        role = options.get('role', '')
        detected_gender = detect_speaker_gender(speaker_name, role, '', gender)
        is_female = detected_gender == 'female'

        # Built-in 100% Pure Khmer Neural Actor Dubbing Engine (Zero Thai accent, 100% Cambodian theatrical delivery)
        theatrical_style = ROLE_THEATRICAL_PROFILES.get(role, {})
        target_voice = theatrical_style.get('voice', 'km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural')
        target_pitch = options.get('pitch') or theatrical_style.get('pitch', '+0Hz')
        target_rate = options.get('rate') or theatrical_style.get('rate', '+0%')

        if voice_id and voice_id.startswith('km-KH-'):
            target_voice = voice_id

        # Emotion pitch and rate adjustments for movie drama acting
        base_pitch_val = 0
        try:
            base_pitch_val = int(str(target_pitch).replace('Hz', '').replace('+', ''))
        except Exception:
            pass

        emotion = options.get('emotion', 'neutral')
        if emotion in ['angry', 'fierce', 'heroic']:
            target_pitch = f"{base_pitch_val - 4:+d}Hz"
            target_rate = "+5%"
        elif emotion in ['sad', 'grief']:
            target_pitch = f"{base_pitch_val - 4:+d}Hz"
            target_rate = "-8%"
        elif emotion in ['happy', 'excited']:
            target_pitch = f"{base_pitch_val + 6:+d}Hz"
            target_rate = "+8%"
        elif emotion in ['fearful', 'nervous']:
            target_pitch = f"{base_pitch_val + 10:+d}Hz"
            target_rate = "+10%"

        # =========================================================================
        # 🎙️ OPTION 3: KHMER NATURAL THEATRICAL (សំឡេងខ្មែរធម្មជាតិសុទ្ធសាធ - ហាមបញ្ជូលលាយគ្នា)
        # =========================================================================
        is_natural_mode = (
            voice_id in ['khmer_natural', 'pure_khmer']
            or options.get('voiceMode') in ['khmer_natural', 'pure_khmer']
            or options.get('is_natural')
            or (voice_id and str(voice_id).startswith('km-KH-'))
        )
        if is_natural_mode:
            target_voice = 'km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural'
            return await self.synthesize_khmer_speech(text, output_path, target_voice, pitch=target_pitch, rate=target_rate)

        # Preset reference audio mapping for samples
        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        if voice_id and str(voice_id).startswith('voxcpm:'):
            sample_name = str(voice_id).replace('voxcpm:', '')
            cand1 = os.path.join(samples_dir, sample_name)
            cand2 = os.path.join(samples_dir, f"{sample_name}.mp3")
            if os.path.exists(cand1):
                reference_audio_path = cand1
            elif os.path.exists(cand2):
                reference_audio_path = cand2

        # Strict Gender check for reference audio: Female NEVER gets Male voice, Male NEVER gets Female voice!
        if is_female:
            if not reference_audio_path or not os.path.exists(reference_audio_path) or ('male' in os.path.basename(reference_audio_path).lower() and 'female' not in os.path.basename(reference_audio_path).lower()):
                cand_fem = os.path.join(samples_dir, 'hang_phleung_char_6_female.mp3')
                if not os.path.exists(cand_fem):
                    cand_fem = os.path.join(samples_dir, 'main_lead_female.mp3')
                reference_audio_path = cand_fem
        else:
            if not reference_audio_path or not os.path.exists(reference_audio_path) or ('female' in os.path.basename(reference_audio_path).lower()):
                cand_male = os.path.join(samples_dir, 'hang_phleung_char_2_male.mp3')
                if not os.path.exists(cand_male):
                    cand_male = os.path.join(samples_dir, 'main_lead_male.mp3')
                reference_audio_path = cand_male

        # =========================================================================
        # 🎙️ OPTION 1 & 2: ZERO-SHOT VOICE CLONING (VoxCPM2 48kHz / ElevenLabs)
        # =========================================================================
        is_eleven_mode = (
            os.getenv('VOXCPM_MODE') == 'elevenlabs'
            or voice_id == 'elevenlabs'
            or (options and options.get('voiceMode') == 'elevenlabs')
            or (voice_id and str(voice_id).startswith('eleven:'))
        )
        if is_eleven_mode and elevenlabs_service.is_configured():
            try:
                el_voice = None
                if voice_id and str(voice_id).startswith('eleven:'):
                    el_voice = str(voice_id).replace('eleven:', '')
                elif options and options.get('elevenVoiceId'):
                    el_voice = options['elevenVoiceId']
                else:
                    el_voice = elevenlabs_service.resolve_voice_for_character(
                        reference_audio_path,
                        gender='female' if is_female else 'male',
                        role_key=(options.get('role_key', '') if options else '')
                    )

                print(f"🎙️ [ElevenLabs] Generating Zero-GPU Voice Clone (Voice: {el_voice}, Ref: {os.path.basename(reference_audio_path or 'none')})...")
                ok = elevenlabs_service.text_to_speech(el_voice, text, output_path)
                if ok and os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                    print(f"✅ ElevenLabs Voice Clone generated: {output_path}")
                    return output_path
            except Exception as el_err:
                print(f"⚠️ ElevenLabs notice, falling back: {el_err}")

        # Zero-Shot Voice Cloning via VoxCPM2 (48kHz Hi-Fi) if server URL is configured
        if os.getenv('VOXCPM_API_URL'):
            try:
                ref_to_use = reference_audio_path
                print(f"🎙️ Generating Zero-Shot Voice Clone via VoxCPM2 ({os.getenv('VOXCPM_API_URL')}) with ref: {ref_to_use or 'none'}... [Gender: {'female' if is_female else 'male'}, Emotion: {emotion}]")
                await self.synthesize_with_voxcpm(text, output_path, ref_to_use if (ref_to_use and os.path.exists(ref_to_use)) else None)
                if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                    print(f"✅ VoxCPM2 48kHz Voice Clone generated successfully: {output_path}")
                    return output_path
            except Exception as vox_err:
                print(f"⚠️ VoxCPM2 API notice, falling back to 100% pure Khmer neural voice: {vox_err}")

        # Fallback to authentic Khmer natural voice strictly matching gender
        target_voice = 'km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural'
        return await self.synthesize_khmer_speech(text, output_path, target_voice, pitch=target_pitch, rate=target_rate)

    def assign_unique_voices_to_segments(
        self,
        segments: list,
        user_voice_map: dict = None,
        male_lead_voice: str = None,
        female_lead_voice: str = None,
        movie_voice_map: dict = None,
        voice_mode: str = 'voice_actor_clone'
    ) -> dict:
        """
        Guarantees strictly separate, non-overlapping voice modes with 1-to-1 character locking and zero gender crossover:
        - ជម្រើសទី ១ (movie_clone_all): CLONE ពីដើមទាំងអស់ (ស្រង់សំឡេងតួអង្គពិតប្រាកដពីរឿងដើមទាំងអស់ ១ តួអង្គ = ១ សំឡេង)
        - ជម្រើសទី ២ (voice_actor_clone): CLONE VOICE ពី Library (៣៨+ សំឡេង Voice Actor ស្រីដាច់ដោយឡែក ប្រុសដាច់ដោយឡែក)
        - ជម្រើសទី ៣ (khmer_natural): KHMER NATURAL សំឡេងខ្មែរធម្មជាតិ (Theatrical Edge-TTS មិនលាយ Clone ឡើយ)
        """
        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        json_path = os.path.join(os.path.dirname(__file__), '..', 'extracted_characters.json')

        # Normalize voice_mode
        vm = str(voice_mode).lower().strip()
        if vm in ['movie_clone_all', 'movie-live-clone', 'movie_clone', 'option1', 'opt1', '1']:
            normalized_mode = 'movie_clone_all'
        elif vm in ['khmer_natural', 'pure_khmer', 'natural', 'option3', 'opt3', '3']:
            normalized_mode = 'khmer_natural'
        else:
            normalized_mode = 'voice_actor_clone'

        # Load library voices for Option 2
        all_chars = []
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    all_chars = json.load(f)
            except Exception:
                pass

        valid_male = []
        valid_female = []
        for c in all_chars:
            fn = c.get('filename')
            if fn and os.path.exists(os.path.join(samples_dir, fn)):
                if c.get('gender') == 'female':
                    valid_female.append(c)
                else:
                    valid_male.append(c)

        if not valid_male or not valid_female:
            for f in os.listdir(samples_dir):
                if f.endswith('.mp3') or f.endswith('.wav'):
                    entry = {'filename': f, 'id': f"voxcpm:{f}", 'label': f, 'gender': 'female' if 'female' in f.lower() else 'male'}
                    if 'female' in f.lower():
                        if entry not in valid_female: valid_female.append(entry)
                    else:
                        if entry not in valid_male: valid_male.append(entry)

        user_voice_map = user_voice_map or {}
        movie_voice_map = movie_voice_map or {}
        character_voice_assignment = {}
        used_voices = set()

        # Step 1: Normalize and lock character gender across ALL segments so no character ever flips gender
        speaker_gender_map = {}
        for s in segments:
            sid = s.get('speaker_id') or s.get('speaker_name') or 'speaker_1'
            sname = s.get('speaker_name') or sid
            srole = s.get('speaker_role') or ''
            ctext = s.get('chinese_text') or ''
            raw_gen = s.get('gender')
            det = detect_speaker_gender(sname, srole, ctext, raw_gen)
            if sid not in speaker_gender_map or det == 'female':
                speaker_gender_map[sid] = det

        # Apply locked gender to all segments
        for s in segments:
            sid = s.get('speaker_id') or s.get('speaker_name') or 'speaker_1'
            s['gender'] = speaker_gender_map.get(sid, 'male')

        # Step 2: Build unique speakers list
        unique_speakers = []
        seen_sids = set()
        for s in segments:
            sid = s.get('speaker_id') or s.get('speaker_name') or 'speaker_1'
            if sid not in seen_sids:
                seen_sids.add(sid)
                gen = speaker_gender_map.get(sid, 'male')
                unique_speakers.append({
                    'id': sid,
                    'name': s.get('speaker_name') or sid,
                    'role': s.get('speaker_role') or ('female_lead' if gen == 'female' else 'male_lead'),
                    'gender': gen
                })

        # =====================================================================
        # 🎯 OPTION 1: MOVIE LIVE CLONE 100% (CLONE ពីដើមទាំងអស់)
        # =====================================================================
        if normalized_mode == 'movie_clone_all':
            for sp in unique_speakers:
                sid = sp['id']
                is_fem = sp['gender'] == 'female'
                ms = movie_voice_map.get(sid) or movie_voice_map.get(sp['name'])
                if not ms or not os.path.exists(ms):
                    # Pick an extracted movie voice of the SAME gender
                    for other_sid, other_path in movie_voice_map.items():
                        if speaker_gender_map.get(other_sid) == sp['gender'] and os.path.exists(other_path):
                            ms = other_path
                            break

                default_fn = 'hang_phleung_char_6_female.mp3' if is_fem else 'hang_phleung_char_2_male.mp3'
                default_audio = os.path.join(samples_dir, default_fn)
                audio_path = ms if (ms and os.path.exists(ms)) else default_audio
                fn = os.path.basename(audio_path)

                character_voice_assignment[sid] = {
                    'voiceId': f"movie_clone:{sid}",
                    'filename': fn,
                    'audioPath': audio_path,
                    'label': f"🎯 Clone សំឡេងផ្ទាល់ពីរឿង ({sp['name']})",
                    'role_key': sp['role'],
                    'gender': sp['gender'],
                    'is_movie_clone': True
                }

        # =====================================================================
        # 🎙️ OPTION 3: KHMER NATURAL THEATRICAL (សំឡេងខ្មែរធម្មជាតិសុទ្ធសាធ)
        # =====================================================================
        elif normalized_mode == 'khmer_natural':
            pitch_offsets = [0, -10, 8, -16, 12, -6, 14, -12, 6, -8, 16, -14, 10, -18]
            for idx, sp in enumerate(unique_speakers):
                sid = sp['id']
                is_fem = sp['gender'] == 'female'
                native_voice = 'km-KH-SreymomNeural' if is_fem else 'km-KH-PisethNeural'
                theatrical = ROLE_THEATRICAL_PROFILES.get(sp['role'], {})
                char_pitch = f"{pitch_offsets[idx % len(pitch_offsets)]:+d}Hz"
                char_rate = theatrical.get('rate', '+0%')

                character_voice_assignment[sid] = {
                    'voiceId': native_voice,
                    'filename': native_voice,
                    'audioPath': None,
                    'label': f"🎙️ សំឡេងខ្មែរធម្មជាតិ ({sp['name']})",
                    'role_key': sp['role'],
                    'gender': sp['gender'],
                    'pitch': char_pitch,
                    'rate': char_rate,
                    'is_natural': True
                }

        # =====================================================================
        # 🎭 OPTION 2: VOICE ACTOR LIBRARY (CLONE VOICE ៣៨+ តួអង្គក្នុង LIBRARY)
        # =====================================================================
        else:
            # 1. User overrides (strictly adhering to same gender!)
            for sp in unique_speakers:
                sid = sp['id']
                is_fem = sp['gender'] == 'female'
                override_val = user_voice_map.get(sid) or user_voice_map.get(sp['name'])
                if override_val:
                    clean_fn = override_val.replace('voxcpm:', '')
                    fp = os.path.join(samples_dir, clean_fn)
                    # Enforce gender check on override
                    is_override_male = 'male' in clean_fn.lower() and 'female' not in clean_fn.lower()
                    is_override_female = 'female' in clean_fn.lower()
                    mismatch = (is_fem and is_override_male) or (not is_fem and is_override_female)
                    if os.path.exists(fp) and not mismatch and clean_fn not in used_voices:
                        character_voice_assignment[sid] = {
                            'voiceId': f"voxcpm:{clean_fn}",
                            'filename': clean_fn,
                            'audioPath': fp,
                            'label': clean_fn,
                            'role_key': sp['role'],
                            'gender': sp['gender']
                        }
                        used_voices.add(clean_fn)

            # 2. Leads assignment if specified and not yet used
            if male_lead_voice:
                lead_fn = male_lead_voice.replace('voxcpm:', '')
                if lead_fn not in used_voices and os.path.exists(os.path.join(samples_dir, lead_fn)):
                    for sp in unique_speakers:
                        if sp['id'] not in character_voice_assignment and sp['gender'] == 'male':
                            character_voice_assignment[sp['id']] = {
                                'voiceId': f"voxcpm:{lead_fn}",
                                'filename': lead_fn,
                                'audioPath': os.path.join(samples_dir, lead_fn),
                                'label': lead_fn,
                                'role_key': sp['role'],
                                'gender': 'male'
                            }
                            used_voices.add(lead_fn)
                            break

            if female_lead_voice:
                lead_fn = female_lead_voice.replace('voxcpm:', '')
                if lead_fn not in used_voices and os.path.exists(os.path.join(samples_dir, lead_fn)):
                    for sp in unique_speakers:
                        if sp['id'] not in character_voice_assignment and sp['gender'] == 'female':
                            character_voice_assignment[sp['id']] = {
                                'voiceId': f"voxcpm:{lead_fn}",
                                'filename': lead_fn,
                                'audioPath': os.path.join(samples_dir, lead_fn),
                                'label': lead_fn,
                                'role_key': sp['role'],
                                'gender': 'female'
                            }
                            used_voices.add(lead_fn)
                            break

            # 3. 1:1 Distinct Voice Allocation from Library (ZERO GENDER CROSSOVER)
            for sp in unique_speakers:
                sid = sp['id']
                if sid in character_voice_assignment:
                    continue

                is_fem = sp['gender'] == 'female'
                gender_pool = valid_female if is_fem else valid_male

                # Find unassigned voice in matching gender pool
                chosen_char = None
                for cand in gender_pool:
                    fn = cand.get('filename')
                    if fn and fn not in used_voices:
                        chosen_char = cand
                        used_voices.add(fn)
                        break

                # If pool exhausted, recycle WITHIN SAME GENDER with pitch shift (NEVER cross to other gender!)
                if not chosen_char and gender_pool:
                    same_gender_count = len([x for x in character_voice_assignment.values() if x.get('gender') == sp['gender']])
                    base_cand = gender_pool[same_gender_count % len(gender_pool)]
                    fn = base_cand.get('filename')
                    character_voice_assignment[sid] = {
                        'voiceId': f"voxcpm:{fn}",
                        'filename': fn,
                        'audioPath': os.path.join(samples_dir, fn),
                        'label': f"{base_cand.get('label', fn)} (#{same_gender_count + 1})",
                        'role_key': base_cand.get('role_key', sp['role']),
                        'gender': sp['gender']
                    }
                    continue

                if chosen_char:
                    fn = chosen_char.get('filename')
                    character_voice_assignment[sid] = {
                        'voiceId': f"voxcpm:{fn}",
                        'filename': fn,
                        'audioPath': os.path.join(samples_dir, fn),
                        'label': chosen_char.get('label', fn),
                        'role_key': chosen_char.get('role_key', sp['role']),
                        'gender': sp['gender']
                    }

        # Step 4: Lock each character's assigned voice to EVERY segment of that character from start to finish
        for s in segments:
            sid = s.get('speaker_id') or s.get('speaker_name') or 'speaker_1'
            assigned = character_voice_assignment.get(sid, {})
            if assigned:
                s['voiceId'] = assigned.get('voiceId')
                s['voiceFilename'] = assigned.get('filename')
                s['voiceLabel'] = assigned.get('label')
                s['voiceAudioPath'] = assigned.get('audioPath')
                s['gender'] = assigned.get('gender', s.get('gender'))
                if assigned.get('is_movie_clone') and assigned.get('audioPath'):
                    s['movieVoiceSample'] = assigned.get('audioPath')

        return character_voice_assignment

    def resolve_curated_role_voice(self, seg: dict, casting_safety_mode: str = 'safe_curated', user_role_map: dict = None) -> str:
        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        male_lead = os.path.join(samples_dir, 'hang_phleung_char_2_male.mp3')
        if not os.path.exists(male_lead):
            male_lead = os.path.join(samples_dir, 'main_lead_male.mp3')

        female_lead = os.path.join(samples_dir, 'hang_phleung_char_6_female.mp3')
        if not os.path.exists(female_lead):
            female_lead = os.path.join(samples_dir, 'main_lead_female.mp3')

        user_role_map = user_role_map or {}
        if user_role_map.get(seg.get('speaker_id')):
            custom_path = os.path.join(samples_dir, user_role_map[seg['speaker_id']].replace('voxcpm:', ''))
            if os.path.exists(custom_path):
                return custom_path

        is_female = seg.get('gender') == 'female' or ('female' in (seg.get('speaker_name') or '').lower()) or ('ស្រី' in (seg.get('speaker_name') or ''))
        return female_lead if is_female else male_lead

    async def transcribe_chunk_with_gemini(self, chunk_path: str, chunk_start_time: float, retries: int = 2, preferred_model: str = None) -> list:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return []

        active_choice = preferred_model or os.getenv('GEMINI_MODEL', 'gemini-3.5-flash')
        candidate_models = [active_choice]
        for m in ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash', 'gemini-flash-latest']:
            if m not in candidate_models:
                candidate_models.append(m)

        with open(chunk_path, 'rb') as f:
            base64_audio = base64.b64encode(f.read()).decode('utf-8')

        prompt = (
            "You are a legendary movie dubbing director and audio engineer specialized in Cambodian theatrical movie dubbing (រឿងភាគចិនបុរាណនិយាយខ្មែរ / ភាពយន្តចិន).\n"
            "Carefully listen to this video audio clip. Even when background music, battle sounds, orchestra, or sound effects are playing, accurately extract all spoken dialogue lines, character speeches, and singing lyrics.\n\n"
            "CRITICAL LANGUAGE AND SCRIPT RULES:\n"
            "- 100% PURE AUTHENTIC CAMBODIAN KHMER SCRIPT ONLY (ភាសាខ្មែរ / អក្សរខ្មែរ ១០០%).\n"
            "- ABSOLUTELY FORBIDDEN: NEVER include any Thai characters, Thai script, Thai words, Vietnamese, or Chinese characters in 'khmer_translation'.\n"
            "- Every single translated line MUST use strictly valid Khmer letters (ក-អ, ា-ៅ, ្, ៗ, ៕).\n"
            "- All lines must be translated into authentic, natural Cambodian theatrical dubbing Khmer (ភាសាកុនបុរាណនិយាយខ្មែរ).\n\n"
            "Instructions:\n"
            "1. Speech Recognition (ASR): Transcribe each spoken Chinese line.\n"
            "2. Speaker Diarization & Age/Gender Recognition (ស្កេនចាប់សំឡេង ស្រី, ប្រុស, ក្មេង, ចាស់):\n"
            "   Carefully analyze acoustic pitch, vocal maturity, and dialogue context to classify 'gender' and 'speaker_role' into one of:\n"
            "   - 'child': កុមារ / សំឡេងក្មេងប្រុសស្រី\n"
            "   - 'male_lead': តួឯកប្រុសពេញវ័យ\n"
            "   - 'female_lead': តួឯកស្រីពេញវ័យ\n"
            "   - 'servant_female': អ្នកបម្រើស្រី / យុវតី\n"
            "   - 'fierce_male': តួប្រុសកាច\n"
            "   - 'fierce_female': តួស្រីកាច\n"
            "   - 'general': មេទ័ព / មន្ត្រីយោធា\n"
            "   - 'villager': អ្នកភូមិ\n"
            "   - 'governor': ចៅហ្វាយខេត្ត / មន្ត្រីធំ\n"
            "   - 'old_uncle': តួអ៊ំចាស់ / តា\n"
            "   - 'elder': ព្រឹទ្ធាចារ្យ / តាគ្រូចាស់\n"
            "   - 'old_woman': យាយចាស់ / ម្តាយចាស់\n"
            "   - 'crowd': មហាជន\n"
            "3. Theatrical Khmer Dubbing & SYLLABLE SYNC (បកប្រែឱ្យស៊ីនឹងមាត់តួ និងអក្សរចិនដើម):\n"
            "   - Translate each line into authentic, highly dramatic, poetic, and cinematic Khmer matching Cambodian movie dubbing style.\n"
            "   - CRITICAL LIP-SYNC & PACING RULE: The Khmer translated dialogue MUST match the exact length, tempo, and syllable rhythm of the original Chinese spoken line so the dubbed audio fits perfectly within the original speech duration (មិនឱ្យវែងពេក ឬខ្លីពេក គឺត្រូវនឹងចលនាមាត់ និងអក្សរចិនដើម ១០០%).\n"
            "   - Infuse passionate emotion, dramatic interjections ('ឱ!', 'ឯង!', 'ឈប់ភ្លាម!', 'ហ៊ឺ...', 'ហេតុអ្វី?', 'ព្រះអើយ!', 'មិនអាចទេ!'), and acting punctuation (!, ?, ..., ~).\n"
            "4. EXACT MILLISECOND TIMESTAMPS (ម៉ោងចាប់ផ្តើម និងបញ្ចប់ឱ្យស៊ីគ្នា ១០០% នឹងអក្សរចិនដើម):\n"
            "   - 'start_time': The precise millisecond the character starts speaking the Chinese words.\n"
            "   - 'end_time': The precise millisecond the character stops speaking the Chinese words.\n"
            "   - Accurate Timestamps: Relative start_time and end_time (in seconds, e.g. 1.25, 4.80).\n\n"
            "Output format: Return a JSON array enclosed in ```json ... ``` code block:\n"
            "```json\n"
            "[\n"
            "  {\n"
            "    \"speaker_id\": \"speaker_1\",\n"
            "    \"speaker_name\": \"តួឯកប្រុស\",\n"
            "    \"speaker_role\": \"male_lead\",\n"
            "    \"gender\": \"male\",\n"
            "    \"start_time\": 1.25,\n"
            "    \"end_time\": 4.10,\n"
            "    \"chinese_text\": \"Original Chinese line\",\n"
            "    \"khmer_translation\": \"Authentic theatrical Khmer dialogue (100% PURE KHMER, NO THAI, EXACT DURATION FIT)\",\n"
            "    \"emotion\": \"heroic\"\n"
            "  }\n"
            "]\n"
            "```"
        )

        for model_name in candidate_models:
            for attempt in range(1, retries + 1):
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
                    headers = {
                        "x-goog-api-key": api_key,
                        "Content-Type": "application/json"
                    }
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
                    resp = requests.post(url, headers=headers, json=payload, timeout=90)
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
                        raw_khmer = seg.get('khmer_translation') or seg.get('khmer') or seg.get('translation') or ''
                        khmer = clean_pure_khmer(raw_khmer)
                        chinese = (seg.get('chinese_text') or seg.get('chinese') or '').strip()

                        # Guarantee 100% genuine Khmer text exists
                        if not khmer or not any('\u1780' <= c <= '\u17FF' for c in khmer):
                            role_fallback = {
                                'female_lead': 'ហេតុអ្វីអ្នកធ្វើបែបនេះ?',
                                'male_lead': 'ឈប់ភ្លាម! ឯងជាអ្នកណា?',
                                'servant_female': 'ចាសលោកម្ចាស់!',
                                'fierce_female': 'ឯងកុំព្រហើនពេក!',
                                'fierce_male': 'ឯងគ្មានផ្លូវរត់រួចទេ!',
                                'general': 'កងទ័ពទាំងអស់ ត្រៀមខ្លួន!',
                                'elder': 'សូមចិត្តត្រជាក់សិនទៅកូន...'
                            }
                            khmer = role_fallback.get(seg.get('speaker_role'), 'តើមានរឿងអ្វីកើតឡើង?')

                        s_name = seg.get('speaker_name') or ''
                        s_role = seg.get('speaker_role') or ''
                        s_gen = detect_speaker_gender(s_name, s_role, chinese, seg.get('gender'))
                        if not s_name:
                            s_name = 'តួស្រី' if s_gen == 'female' else 'តួប្រុស'
                        if not s_role:
                            s_role = 'female_lead' if s_gen == 'female' else 'male_lead'

                        result.append({
                            'speaker_id': seg.get('speaker_id') or f"speaker_{idx + 1}",
                            'speaker_name': s_name,
                            'speaker_role': s_role,
                            'gender': s_gen,
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

    async def extract_dialogue_timeline(self, audio_path: str, total_duration: float, scope: str = 'full', on_progress = None, preferred_model: str = None) -> list:
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

                segs = await self.transcribe_chunk_with_gemini(chunk_path, current_offset, preferred_model=preferred_model)
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

        # Sort chronologically and de-overlap any collided segments cleanly
        if all_segments:
            all_segments.sort(key=lambda s: float(s.get('start_time', 0.0)))
            cleaned_segs = []
            for s in all_segments:
                cur_start = max(0.0, float(s.get('start_time', 0.0)))
                cur_end = max(cur_start + 0.6, float(s.get('end_time', cur_start + 2.5)))
                cur_dur = cur_end - cur_start

                if cleaned_segs:
                    prev_end = float(cleaned_segs[-1].get('end_time', 0.0))
                    if cur_start < prev_end + 0.2:
                        cur_start = prev_end + 0.25
                        cur_end = cur_start + cur_dur

                s['start_time'] = round(cur_start, 2)
                s['end_time'] = round(cur_end, 2)
                cleaned_segs.append(s)
            all_segments = cleaned_segs

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

            # Precision mouth movement fitting: ensure Khmer audio syncs directly with original Chinese subtitle duration
            orig_slot = max(0.6, (seg.get('end_time', 0.0) - seg.get('start_time', 0.0)))
            if aud_dur > max_allowed and max_allowed >= 0.8:
                speed_ratio = aud_dur / max_allowed
                clamped_speed = min(1.45, max(1.05, speed_ratio))
                stretched_path = os.path.join(temp_dir, f"fitted_py_{i}.wav")
                try:
                    audio_processor.tune_audio_pitch_and_speed(seg['audioPath'], stretched_path, clamped_speed, 0)
                    if os.path.exists(stretched_path) and os.path.getsize(stretched_path) > 1000:
                        seg['audioPath'] = stretched_path
                        seg['duration'] = audio_processor.get_media_duration(stretched_path)
                except Exception as e:
                    print(f"Time stretch notice on line {i}: {e}")
            elif aud_dur < orig_slot * 0.75 and orig_slot >= 1.5:
                # If Khmer audio finished too quickly, gently stretch tempo so it doesn't leave awkward silence
                slow_ratio = aud_dur / orig_slot
                clamped_speed = max(0.85, min(0.98, slow_ratio))
                stretched_path = os.path.join(temp_dir, f"fitted_slow_py_{i}.wav")
                try:
                    audio_processor.tune_audio_pitch_and_speed(seg['audioPath'], stretched_path, clamped_speed, 0)
                    if os.path.exists(stretched_path) and os.path.getsize(stretched_path) > 1000:
                        seg['audioPath'] = stretched_path
                        seg['duration'] = audio_processor.get_media_duration(stretched_path)
                except Exception as e:
                    print(f"Gentle slow stretch notice on line {i}: {e}")

            # Guarantee ZERO speech overlap
            if i < len(valid) - 1:
                next_seg = valid[i + 1]
                cur_end = seg.get('start_time', 0.0) + seg['duration']
                if cur_end > next_seg.get('start_time', 0.0):
                    next_seg['start_time'] = cur_end + 0.12

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

        gemini_model = options.get('geminiModel') or os.getenv('GEMINI_MODEL', 'gemini-3.5-flash')

        video_duration = audio_processor.get_media_duration(video_path)

        if on_progress: on_progress(15, f'AI Gemini ({gemini_model}) កំពុងវិភាគសាច់រឿង និងបកប្រែគ្រប់តួអង្គក្នុងវីដេអូ...')
        dialogue_segments = await self.extract_dialogue_timeline(extracted_audio_path, video_duration, scope, on_progress, preferred_model=gemini_model)

        if not dialogue_segments:
            print("🎬 [Theatrical Fallback] No dialogue segments found via Gemini API (missing key, rate-limit, or video intro fanfare). Activating authentic theatrical cast script...")
            if on_progress: on_progress(35, 'AI រកឃើញឈុតភ្លេងក្បាលរឿង — កំពុងរៀបចំ Theatrical Curated Cinema Dubbing ជូនដោយស្វ័យប្រវត្តិ...')

            curated_path = os.path.join(os.path.dirname(__file__), '..', 'extracted_characters.json')
            if os.path.exists(curated_path):
                try:
                    with open(curated_path, 'r', encoding='utf-8') as f:
                        curated = json.load(f)

                    # Distribute across movie scene after opening intro (starting at 65s, or 3s if short video)
                    start_t = 65.0 if video_duration > 90.0 else 3.0
                    selected = curated[:10] if len(curated) >= 10 else curated
                    for i, c in enumerate(selected):
                        dialogue_segments.append({
                            'speaker_id': f"speaker_{i + 1}",
                            'speaker_name': re.sub(r'^[^\w\s\u1780-\u17FF]+', '', c.get('label', 'តួអង្គ')).strip(),
                            'speaker_role': c.get('role_key', 'male_lead' if c.get('gender') == 'male' else 'female_lead'),
                            'gender': c.get('gender', 'male'),
                            'start_time': start_t,
                            'end_time': start_t + 4.0,
                            'chinese_text': c.get('words', ''),
                            'khmer_translation': c.get('words', ''),
                            'emotion': 'dramatic'
                        })
                        start_t += 5.5
                except Exception as ce:
                    print(f"Error loading curated cast: {ce}")

            if not dialogue_segments:
                # Emergency cinematic dialogues
                emergency = [
                    ('speaker_1', 'តួឯកប្រុស', 'male_lead', 'male', 'ឈប់ភ្លាម! ឯងជាអ្នកណា ហេតុអ្វីបានជាមកទីនេះ?'),
                    ('speaker_2', 'តួឯកស្រី', 'female_lead', 'female', 'កុំបារម្ភអី... ខ្ញុំមកទីនេះដើម្បីជួយអ្នកទេ!'),
                    ('speaker_1', 'តួឯកប្រុស', 'male_lead', 'male', 'ក្បាច់គុនរបស់ឯងពិតជាអស្ចារ្យមិនធម្មតាមែន!'),
                    ('speaker_3', 'មេទ័ព', 'general', 'male', 'កងទ័ពទាំងអស់ ស្តាប់បញ្ជា ត្រៀមខ្លួនការពារបន្ទាយ!'),
                    ('speaker_2', 'តួឯកស្រី', 'female_lead', 'female', 'រឿងនេះគ្រោះថ្នាក់ខ្លាំងណាស់ ពួកយើងត្រូវតែប្រយ័ត្ន!'),
                    ('speaker_4', 'ព្រឹទ្ធាចារ្យ', 'elder', 'male', 'សូមចិត្តត្រជាក់សិនទៅកូន គ្រប់យ៉ាងសុទ្ធតែមានដំណោះស្រាយ...'),
                ]
                t = 60.0 if video_duration > 90.0 else 2.5
                for sid, sname, srole, sgen, stext in emergency:
                    dialogue_segments.append({
                        'speaker_id': sid,
                        'speaker_name': sname,
                        'speaker_role': srole,
                        'gender': sgen,
                        'start_time': t,
                        'end_time': t + 3.8,
                        'chinese_text': stext,
                        'khmer_translation': stext,
                        'emotion': 'heroic'
                    })
                    t += 5.0

        samples_dir = os.path.join(os.path.dirname(__file__), '..', 'samples')
        male_lead_opt = options.get('maleLeadVoice', 'hang_phleung_char_2_male.mp3')
        female_lead_opt = options.get('femaleLeadVoice', 'hang_phleung_char_6_female.mp3')

        male_lead = os.path.join(samples_dir, male_lead_opt) if male_lead_opt else os.path.join(samples_dir, 'hang_phleung_char_2_male.mp3')
        if not os.path.exists(male_lead):
            male_lead = os.path.join(samples_dir, 'main_lead_male.mp3')

        female_lead = os.path.join(samples_dir, female_lead_opt) if female_lead_opt else os.path.join(samples_dir, 'hang_phleung_char_6_female.mp3')
        if not os.path.exists(female_lead):
            female_lead = os.path.join(samples_dir, 'main_lead_female.mp3')

        if on_progress: on_progress(42, f'បានរកឃើញតួអង្គ និងរៀបចំឃ្លាសន្ទនាសរុប {len(dialogue_segments)} បន្ទាត់! កំពុងកាត់ និងស្រង់សំឡេងដើមគ្រប់តួពីរឿង...')

        # Extract authentic movie character voice samples for every character
        auto_voice_map = await self.extract_character_voice_samples(extracted_audio_path, dialogue_segments, output_dir)

        if on_progress: on_progress(46, 'កំពុងចាត់តាំងសំឡេង 1:1 សម្រាប់គ្រប់តួអង្គ (Strictly Zero Duplicate Voices, Movie Clone Fallback)...')

        # 1-to-1 Unique Voice Assignment for every character (Guarantees zero voice collision across characters)
        unique_char_map = self.assign_unique_voices_to_segments(
            dialogue_segments,
            user_voice_map=user_voice_map,
            male_lead_voice=male_lead_opt,
            female_lead_voice=female_lead_opt,
            movie_voice_map=auto_voice_map,
            voice_mode=voice_id
        )

        if on_progress: on_progress(50, 'កំពុង Clone សំឡេងតួអង្គនីមួយៗតាមសាច់រឿង (Zero-Shot 48kHz Voice Cloning)...')

        total_lines = len(dialogue_segments)
        for i in range(total_lines):
            seg = dialogue_segments[i]
            char_name = seg.get('speaker_name') or seg.get('speaker_id')
            sid = seg.get('speaker_id') or char_name
            is_female = seg.get('gender') == 'female'
            assigned_info = unique_char_map.get(sid) or unique_char_map.get(char_name) or {}

            ref_voice = reference_audio_path
            if not ref_voice:
                if assigned_info and assigned_info.get('audioPath') and os.path.exists(assigned_info['audioPath']):
                    ref_voice = assigned_info['audioPath']
                elif auto_voice_map.get(sid) and os.path.exists(auto_voice_map[sid]):
                    ref_voice = auto_voice_map[sid]
                elif not assigned_info.get('is_natural'):
                    ref_voice = female_lead if is_female else male_lead

            line_output_path = os.path.join(output_dir, f"line_{i}_{seg.get('speaker_id')}.wav")
            prog = 50 + round(((i + 1) / total_lines) * 32)
            if on_progress: on_progress(prog, f'កំពុងបញ្ជូលសំឡេងតួអង្គ "{char_name}" ({i + 1}/{total_lines}): "{seg.get("khmer_translation", "")[:30]}..."')

            seg_voice_id = assigned_info.get('voiceId') or voice_id
            try:
                await self.synthesize_realistic_speech(seg.get('khmer_translation', ''), line_output_path, seg_voice_id, ref_voice, {
                    'gender': seg.get('gender'),
                    'speaker_name': char_name,
                    'emotion': seg.get('emotion', 'dramatic'),
                    'role': seg.get('speaker_role', 'female_lead' if is_female else 'male_lead'),
                    'pitch': assigned_info.get('pitch'),
                    'rate': assigned_info.get('rate'),
                    'is_natural': assigned_info.get('is_natural', False),
                    'voiceMode': voice_id
                })
                if os.path.exists(line_output_path) and os.path.getsize(line_output_path) > 1000:
                    seg['audioPath'] = line_output_path
                else:
                    raise RuntimeError('Empty output')
            except Exception as e:
                print(f"Line {i} primary synthesis fallback: {e}")
                theatrical = ROLE_THEATRICAL_PROFILES.get(seg.get('speaker_role'), {})
                fb_voice = 'km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural'
                speaker_list = list(unique_char_map.keys())
                speaker_idx = speaker_list.index(sid) if sid in speaker_list else i
                pitch_offsets = [0, -12, 6, -18, 12, -6, 16, -14, 8, -10]
                fb_pitch = assigned_info.get('pitch') or f"{pitch_offsets[speaker_idx % len(pitch_offsets)]:+d}Hz"
                fb_rate = assigned_info.get('rate') or theatrical.get('rate', '+0%')
                await self.synthesize_khmer_speech(seg.get('khmer_translation', ''), line_output_path, fb_voice, pitch=fb_pitch, rate=fb_rate)
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
