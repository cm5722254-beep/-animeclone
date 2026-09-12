import os
import sys
import json
import base64
import time
import requests
import subprocess
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv('d:/clone/.env')

BASE_DIR = "d:/clone"
VIDEO_PATH = os.path.join(BASE_DIR, "kXEVHWPPJ8qkPtB26epwWa.mp4")
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
SCRATCH_DIR = os.path.join(BASE_DIR, "scratch")
JSON_PATH = os.path.join(BASE_DIR, "extracted_characters.json")

os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(SCRATCH_DIR, exist_ok=True)

key = os.getenv('GEMINI_API_KEY')
model = 'gemini-3.6-flash'

def analyze_scene(start_sec, dur_sec=50):
    temp_clip = os.path.join(SCRATCH_DIR, f"scan_scene_{start_sec}.mp3")
    cmd = f'ffmpeg -nostdin -y -ss {start_sec} -t {dur_sec} -i "{VIDEO_PATH}" -vn -ar 16000 -ac 1 -b:a 64k "{temp_clip}"'
    subprocess.run(cmd, shell=True, capture_output=True)
    
    if not os.path.exists(temp_clip) or os.path.getsize(temp_clip) < 5000:
        return []

    with open(temp_clip, 'rb') as f:
        audio_b64 = base64.b64encode(f.read()).decode('utf-8')

    prompt = f"""Listen to this Khmer-dubbed short drama clip (timestamp starts at {start_sec}s).
Identify every unique character who speaks in this scene.
For each distinct speaker found, extract:
- role_name: Khmer title & role (e.g. "អ្នកប្រុសធំផេ (បងធំ)", "ប្អូនស្រី (តួឯកស្រី)", "កូនចៅជំនិត (តួប្រុសកំប្លែង)", "អ្នកស្រីម្ចាស់ (ម្តាយក្មេក)", "តួប្រុសអាក្រក់", "គ្រូពេទ្យ/វេជ្ជបណ្ឌិត", "មេការ/បុគ្គលិក")
- gender: "male" or "female"
- role_key: short english key ("male_lead", "female_lead", "servant", "mother", "villain_male", "villain_female", "elder", "doctor")
- start_offset: seconds relative to this audio clip (float)
- end_offset: seconds relative to this audio clip (float, around 4 to 8s of clean dialogue)
- sample_khmer_words: Khmer dialogue words spoken

Output strictly a valid JSON array:
[
  {{
    "role_name": "...",
    "gender": "male/female",
    "role_key": "...",
    "start_offset": 2.5,
    "end_offset": 8.0,
    "sample_khmer_words": "..."
  }}
]
If no clear character speech, return []."""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": "audio/mp3", "data": audio_b64}}
            ]
        }],
        "generationConfig": {"responseMimeType": "application/json"}
    }

    for attempt in range(3):
        try:
            res = requests.post(url, json=payload, timeout=40)
            if res.status_code == 200:
                raw = res.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '[]')
                parsed = json.loads(raw)
                speakers = []
                for s in parsed:
                    s_offset = float(s.get('start_offset', 0))
                    e_offset = float(s.get('end_offset', 5))
                    abs_start = round(start_sec + s_offset, 1)
                    duration = round(max(3.5, min(9.0, e_offset - s_offset)), 1)
                    speakers.append({
                        "role_name": s.get('role_name', 'តួអង្គ'),
                        "gender": s.get('gender', 'male'),
                        "role_key": s.get('role_key', 'male_lead'),
                        "absolute_start": abs_start,
                        "duration": duration,
                        "words": s.get('sample_khmer_words', '')
                    })
                return speakers
            else:
                time.sleep(3)
        except Exception as e:
            time.sleep(2)
    return []

def main():
    print("=" * 65)
    print("🎬 STARTING CHARACTER VOICE EXTRACTION FROM kXEVHWPPJ8qkPtB26epwWa.mp4")
    print("=" * 65)

    # 1. First add the verified high-quality characters from the confirmed scenes
    # (including Big Boss Phe, Heroine Sister, Loyal Henchman, Younger Brother, and Elder Boss)
    curated_speakers = [
        {
            "role_name": "👑 អ្នកប្រុសធំ ផេ (តួឯកប្រុស - បងធំមានអំណាច/ម៉ឺងម៉ាត់)",
            "gender": "male",
            "role_key": "male_lead",
            "absolute_start": 30.5,
            "duration": 7.2,
            "words": "ប្អូនស្រី គ្រប់កន្លះម៉ោងហើយ បងអាចនិយាយជាមួយឯងបានហើយឬនៅ? ជាដំបូង បងសុំទោសឯងម្តងទៀត ដែលព្រឹកមិញបងមិនបានជឿលើពាក្យរបស់ឯងភ្លាមៗ"
        },
        {
            "role_name": "🌸 ប្អូនស្រី ស៊ាវអ៊ី (តួឯកស្រី - ឆ្លាតវៃ/ស្រស់ស្រាយ)",
            "gender": "female",
            "role_key": "female_lead",
            "absolute_start": 38.5,
            "duration": 6.8,
            "words": "ហ៊ឹម... បាន! អនុញ្ញាត! ខ្ញុំអត់ខឹងផង! អីយ៉ា... តាមពិត ខ្ញុំគ្រាន់តែចង់លេងសើចនឹងបងធំប៉ុណ្ណោះ!"
        },
        {
            "role_name": "🕶️ កូនចៅជំនិត (តួប្រុសកំប្លែង/ស្មោះត្រង់)",
            "gender": "male",
            "role_key": "henchman",
            "absolute_start": 46.2,
            "duration": 7.5,
            "words": "នែ៎! ហ៊ានប្រើសំឡេងឡូយអញ្ចឹងជាមួយបងធំផងហ្អេ? បងជាមោទនភាពមួយជីវិតរបស់ខ្ញុំ អ្នកប្រុសធំផេ មានអំណាច ម៉េចបានជាបងសុខចិត្តឱនក្បាលដាក់នាង?"
        },
        {
            "role_name": "💼 លោកប្រធានក្រុមហ៊ុន (តួប្រុសវ័យកណ្តាល - ម៉ត់ចត់/មានគុណធម៌)",
            "gender": "male",
            "role_key": "president",
            "absolute_start": 112.2,
            "duration": 7.6,
            "words": "ឯងមើលចុះ ប្អូនស្រីពិតជាល្អណាស់ យល់ពីហេតុផល ហើយមានចិត្តមេត្តាទៀតផង"
        },
        {
            "role_name": "🌸 នារីវ័យក្មេង (តួស្រី - ម៉ឺងម៉ាត់/ប្រកាន់ជំហរ)",
            "gender": "female",
            "role_key": "female_lead",
            "absolute_start": 128.5,
            "duration": 8.0,
            "words": "នេះជាការអប់រំគ្រួសារប្រធានក្រុមហ៊ុនទេ? មនុស្សយើងរស់នៅត្រូវមានសេចក្តីថ្លៃថ្នូរ មិនអាចយកលុយមកវាស់វែងគ្រប់រឿងទេ"
        },
        {
            "role_name": "🏎️ អ្នកប្រុសតូច (តួប្រុសក្មេង - ពូកែឌឺដង/រស់រវើក)",
            "gender": "male",
            "role_key": "young_master",
            "absolute_start": 146.5,
            "duration": 7.0,
            "words": "រាល់យប់តែងតែបិទទូរស័ព្ទ ឥឡូវនេះដើម្បីនាង សូម្បីតែឡាន Rolls-Royce ក៏បងហ៊ានលះបង់ដែរហ្អេ?"
        }
    ]

    # 2. Scan remaining timestamps across the rest of the film (220s, 310s, 400s, 490s, 580s, 660s)
    timestamps = [220, 310, 400, 490, 580, 660]
    all_discovered = list(curated_speakers)

    for ts in timestamps:
        print(f"Scanning scene at {ts}s ({ts//60}m {ts%60}s)...", flush=True)
        detected = analyze_scene(ts, 45)
        print(f"  -> Discovered {len(detected)} speakers at {ts}s", flush=True)
        for spk in detected:
            # Check for rough duplicates by timestamp proximity
            if not any(abs(existing['absolute_start'] - spk['absolute_start']) < 5.0 for existing in all_discovered):
                all_discovered.append(spk)
                print(f"     + [{spk['gender']}] {spk['role_name']} @ {spk['absolute_start']}s", flush=True)
        time.sleep(1.5)

    print(f"\nTotal characters ready for extraction: {len(all_discovered)}")
    print("=" * 65)

    extracted_records = []
    count = 1

    for char in all_discovered:
        gender_tag = "female" if char['gender'] == 'female' else "male"
        clean_name = f"kxev_char_{count:02d}_{gender_tag}.mp3"
        dest_sample = os.path.join(SAMPLES_DIR, clean_name)
        dest_output = os.path.join(OUTPUTS_DIR, clean_name)

        start = char['absolute_start']
        dur = char['duration']

        print(f"[{count}/{len(all_discovered)}] ✂️ កាត់សំឡេង: {char['role_name']} (start: {start}s, dur: {dur}s)...", flush=True)

        cmd = [
            "ffmpeg", "-y",
            "-ss", str(start),
            "-i", VIDEO_PATH,
            "-t", str(dur),
            "-vn",
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
            "-ar", "44100",
            "-ac", "2",
            "-b:a", "192k",
            dest_sample
        ]

        res = subprocess.run(cmd, capture_output=True)
        if os.path.exists(dest_sample) and os.path.getsize(dest_sample) > 3000:
            try:
                import shutil
                shutil.copy2(dest_sample, dest_output)
            except Exception:
                pass

            file_size = os.path.getsize(dest_sample)
            print(f"   ✅ ជោគជ័យ: {clean_name} ({file_size} bytes)", flush=True)

            extracted_records.append({
                "id": f"voxcpm:{clean_name}",
                "filename": clean_name,
                "label": char['role_name'],
                "role_key": char.get('role_key', 'male_lead'),
                "gender": char['gender'],
                "is_curated": True,
                "words": char.get('words', '')
            })
            count += 1
        else:
            print(f"   ⚠️ កំហុស: {res.stderr.decode('utf-8', errors='ignore')[:100]}", flush=True)

    # Update extracted_characters.json: Prepend the new kxev_ characters to the very top!
    existing = []
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    # Clean any old kxev_ entries to avoid duplication
    clean_existing = [c for c in existing if not c.get("filename", "").startswith("kxev_char_")]
    updated_list = extracted_records + clean_existing

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(updated_list, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 65)
    print(f"🎉 បានស្រង់ និងបញ្ចូលតួអង្គចំនួន {len(extracted_records)} តួអង្គពី kXEVHWPPJ8qkPtB26epwWa.mp4 ទៅក្នុង Tool!")
    print(f"📁 Audio Samples: {SAMPLES_DIR}")
    print(f"📜 Character Vault: {JSON_PATH} (សរុប {len(updated_list)} តួអង្គក្នុង Tool)")
    print("=" * 65)

if __name__ == "__main__":
    main()
