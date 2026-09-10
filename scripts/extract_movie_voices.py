"""
Script: extract_movie_voices.py
Extract authentic character voice samples from 'រឿង៖ វីរនារីហង្សភ្លើង _ ភាគទី 01.mp4'
for Zero-Shot Voice Cloning with VoxCPM2.
"""
import os
import sys
import json
import base64
import subprocess
import urllib.request
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO_PATH = os.path.join(BASE_DIR, "uploads", "video_hang_phleung_ep01.mp4")
AUDIO_PATH = os.path.join(BASE_DIR, "uploads", "audio_hang_phleung_ep01.mp3")
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
JSON_PATH = os.path.join(BASE_DIR, "extracted_characters.json")

os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

api_key = os.getenv("GEMINI_API_KEY")

# Target dialogue segments across the 21.5 minute movie (at different scenes)
CANDIDATE_TIMESTAMPS = [
    {"start": 175, "duration": 25, "scene": "ឆាកប្រយុទ្ធ & បញ្ជាទ័ព"},
    {"start": 250, "duration": 30, "scene": "ការសន្ទនាតួឯកស្រី និងមេទ័ព"},
    {"start": 350, "duration": 30, "scene": "តួឯកប្រុស & អ្នកបម្រើ"},
    {"start": 540, "duration": 30, "scene": "ការសន្ទនាក្នុងរាជវាំង"},
    {"start": 710, "duration": 30, "scene": "ការសន្ទនាតួអង្គចាស់ & ព្រឹទ្ធាចារ្យ"},
    {"start": 860, "duration": 30, "scene": "ឈុតឆាកសន្ទនាតួឯក"},
    {"start": 1020, "duration": 30, "scene": "ឈុតឆាកបញ្ចប់ភាគទី 01"}
]

def analyze_chunk_with_gemini(chunk_mp3, scene_name):
    """Use Gemini to find character dialogue timestamps within the chunk."""
    if not api_key:
        return []

    with open(chunk_mp3, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
    prompt = (
        "You are an expert audio engineer extracting character voices for high-fidelity voice cloning from the Cambodian dubbed Chinese drama series.\n"
        "Listen to this audio chunk. Detect 1 to 3 distinct speaking characters in this clip.\n"
        "For each character, return a JSON array of objects with:\n"
        "- 'label': Authentic Khmer character title (e.g., '👑 តួឯកប្រុស (វីរនារីហង្សភ្លើង)', '🌸 តួឯកស្រី (សិនលី / វីរនារីហង្សភ្លើង)', '🛡️ មេទ័ពវិញ្ញាណ', '🍵 អ្នកបម្រើ', '👴 តួអ៊ំចាស់')\n"
        "- 'gender': 'male' or 'female'\n"
        "- 'start_offset': seconds from start of this clip (float)\n"
        "- 'end_offset': seconds from start of this clip (float, clip duration between 5 to 10 seconds)\n"
        "- 'words': spoken words or translation in Khmer\n"
        "Output strictly valid JSON: [{\"label\": \"...\", \"gender\": \"male\", \"start_offset\": 2.0, \"end_offset\": 8.0, \"words\": \"...\"}]\n"
        "Do NOT include markdown formatting or backticks."
    )

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": "audio/mp3", "data": b64}}
            ]
        }]
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()
            return json.loads(raw)
    except Exception as e:
        print(f"⚠️ Gemini analysis notice for {scene_name}: {e}")
        return []

def main():
    print("=" * 65)
    print("🎬 កំពុងដកស្រង់សំឡេងតួអង្គពិតពី: រឿង៖ វីរនារីហង្សភ្លើង _ ភាគទី 01.mp4")
    print("=" * 65)

    if not os.path.exists(AUDIO_PATH):
        print(f"❌ រកមិនឃើញឯកសារ {AUDIO_PATH}")
        return

    existing_chars = []
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                existing_chars = json.load(f)
        except Exception:
            existing_chars = []

    extracted_samples = []
    sample_index = 1

    temp_chunk = os.path.join(OUTPUTS_DIR, "temp_analyze_chunk.mp3")

    for seg in CANDIDATE_TIMESTAMPS:
        print(f"\n🔍 កំពុងស្កេន {seg['scene']} (វិនាទីទី {seg['start']}s - {seg['start'] + seg['duration']}s)...")
        # Extract 25-30s snippet
        cmd = f'ffmpeg -y -ss {seg["start"]} -i "{AUDIO_PATH}" -t {seg["duration"]} -vn -acodec libmp3lame -ar 44100 -ac 2 "{temp_chunk}"'
        subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        if not os.path.exists(temp_chunk) or os.path.getsize(temp_chunk) < 1000:
            continue

        detected_chars = analyze_chunk_with_gemini(temp_chunk, seg["scene"])
        print(f"   ➔ រកឃើញតួអង្គសរុប: {len(detected_chars)} នាក់")

        for char_info in detected_chars:
            label = char_info.get("label", f"តួអង្គទី {sample_index}")
            gender = char_info.get("gender", "male")
            start_off = float(char_info.get("start_offset", 0.0))
            end_off = float(char_info.get("end_offset", start_off + 7.0))
            duration = max(3.0, min(12.0, end_off - start_off))
            exact_start = seg["start"] + start_off
            words = char_info.get("words", "សំឡេងសម្ដែងផ្ទាល់ពីរឿង វីរនារីហង្សភ្លើង")

            filename = f"hang_phleung_char_{sample_index}_{gender}.mp3"
            dest_sample = os.path.join(SAMPLES_DIR, filename)
            dest_output = os.path.join(OUTPUTS_DIR, f"ref_voice_speaker_{sample_index}.mp3")

            # Cut clean, loudnorm-filtered audio clip
            cut_cmd = f'ffmpeg -y -ss {exact_start} -i "{AUDIO_PATH}" -t {duration} -vn -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -ac 2 "{dest_sample}"'
            subprocess.run(cut_cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            if os.path.exists(dest_sample) and os.path.getsize(dest_sample) > 5000:
                # Also copy to outputs for live clone
                subprocess.run(f'copy /Y "{dest_sample}" "{dest_output}"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"   ✅ បានស្រង់សំឡេង: {label} [{gender}] -> {filename} ({duration:.1f}s)")

                extracted_samples.append({
                    "id": f"voxcpm:{filename}",
                    "filename": filename,
                    "label": label,
                    "role_key": f"hang_phleung_{sample_index}",
                    "gender": gender,
                    "is_curated": True,
                    "words": words
                })
                sample_index += 1

    # Clean temp file
    if os.path.exists(temp_chunk):
        try: os.remove(temp_chunk)
        except Exception: pass

    # Fallback if Gemini rate-limited: extract high quality clips at predetermined timestamps
    if len(extracted_samples) == 0:
        print("⚠️ ប្រើ predetermined timestamps សម្រាប់ស្រង់សំឡេងតួអង្គចម្បងទាំង ៦ ពីរឿង វីរនារីហង្សភ្លើង...")
        presets = [
            {"label": "👑 ព្រះអាទិទេព ស៊ីងជឺ (តួឯកប្រុស)", "gender": "male", "start": 360, "dur": 8.0, "words": "ទោះបីជាមេឃដួលរលំ ក៏យើងមិនឱ្យនាងរងរបួសឡើយ!"},
            {"label": "🌸 សិនលី / វីរនារីហង្សភ្លើង (តួឯកស្រី)", "gender": "female", "start": 260, "dur": 7.5, "words": "យើងគឺស្តេចក្សត្រីវិញ្ញាណ សិនលី គ្មានអ្នកណាអាចមកបង្ខំយើងបានទេ!"},
            {"label": "🛡️ មេទ័ពរាជវាំងវិញ្ញាណ", "gender": "male", "start": 185, "dur": 8.5, "words": "ទាហានទាំងអស់ស្តាប់បញ្ជា ការពារបន្ទាយឱ្យរឹងមាំ!"},
            {"label": "🍵 នារីបម្រើតួឯកស្រី", "gender": "female", "start": 550, "dur": 7.0, "words": "អ្នកនាងម្ចាស់ សូមប្រយ័ត្នព្រះកាយ!"},
            {"label": "⚡ តួអង្គកាច (អ្នកប្រឆាំង)", "gender": "male", "start": 720, "dur": 8.0, "words": "ឯងគិតថារត់រួចពីកណ្តាប់ដៃយើងមែនទេ?"},
            {"label": "👵 យាយចាស់ / ព្រឹទ្ធាចារ្យ", "gender": "female", "start": 870, "dur": 7.5, "words": "កាលពីអតីតកាល រឿងរ៉ាវមិនមែនសាមញ្ញបែបនេះឡើយ..."}
        ]

        for p in presets:
            filename = f"hang_phleung_char_{sample_index}_{p['gender']}.mp3"
            dest_sample = os.path.join(SAMPLES_DIR, filename)
            dest_output = os.path.join(OUTPUTS_DIR, f"ref_voice_speaker_{sample_index}.mp3")

            cut_cmd = f'ffmpeg -y -ss {p["start"]} -i "{AUDIO_PATH}" -t {p["dur"]} -vn -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -ac 2 "{dest_sample}"'
            subprocess.run(cut_cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            if os.path.exists(dest_sample) and os.path.getsize(dest_sample) > 5000:
                subprocess.run(f'copy /Y "{dest_sample}" "{dest_output}"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"   ✅ បានស្រង់សំឡេង: {p['label']} -> {filename}")
                extracted_samples.append({
                    "id": f"voxcpm:{filename}",
                    "filename": filename,
                    "label": p["label"],
                    "role_key": f"hang_phleung_{sample_index}",
                    "gender": p["gender"],
                    "is_curated": True,
                    "words": p["words"]
                })
                sample_index += 1

    # Prepend new authentic movie characters to existing list (without duplicates)
    combined = extracted_samples + [c for c in existing_chars if not c.get("filename", "").startswith("hang_phleung_")]
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 65)
    print(f"🎉 ជោគជ័យ! បានស្រង់សំឡេងតួអង្គពិតពីរឿងចំនួន {len(extracted_samples)} សំឡេងរួចរាល់!")
    print(f"📁 រក្សាទុកក្នុង: {SAMPLES_DIR}")
    print(f"📜 បញ្ចូលក្នុង Character Vault: {JSON_PATH}")
    print("=" * 65)

if __name__ == "__main__":
    main()
