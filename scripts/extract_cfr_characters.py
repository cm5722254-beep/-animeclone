import os
import sys
import json
import subprocess

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = "d:/clone"
VIDEO_PATH = os.path.join(BASE_DIR, "cFrJkngJ5fT8jn5ELRXLLk.mp4")
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
JSON_PATH = os.path.join(BASE_DIR, "extracted_characters.json")

os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# 12 Distinct Authentic Khmer Characters from cFrJkngJ5fT8jn5ELRXLLk.mp4
CHARACTERS = [
    {
        "filename": "cfr_char_01_president_gu_male.mp3",
        "label": "👑 លោកប្រធាន គូ (តួឯកប្រុស - ម៉ឺងម៉ាត់/មានអំណាច)",
        "role_key": "male_lead",
        "gender": "male",
        "start": 705.8,
        "duration": 6.3,
        "words": "ចាប់ពីពេលនេះតទៅ ប្រាក់ខែឯងគឺឡើងពី២ម៉ឺនទៅ៣ម៉ឺនយ័ន ថ្ងៃក្រោយឯងមិនចាំបាច់បារម្ភរឿងចិញ្ចឹមកូនទេ"
    },
    {
        "filename": "cfr_char_02_sothea_female_lead.mp3",
        "label": "🌸 សូធា (តួឯកស្រី - ជឿជាក់/រស់រវើក)",
        "role_key": "female_lead",
        "gender": "female",
        "start": 175.0,
        "duration": 6.2,
        "words": "ឯងទុកចិត្តចុះ អ្នកកំដរខាងស្រីអាជីព នេះគឺការងាររបស់ខ្ញុំ ទទួលលុយឯងប្រាំពាន់យ័នហើយ ថ្ងៃនេះដាច់ខាតមិនឱ្យឯងប៉ះស្រាមួយដំណក់ទេ"
    },
    {
        "filename": "cfr_char_03_sothea_emotional_female.mp3",
        "label": "🌸 សូធា (តួឯកស្រី - ទន់ភ្លន់/រំជួលចិត្ត)",
        "role_key": "female_lead",
        "gender": "female",
        "start": 714.0,
        "duration": 7.5,
        "words": "អរគុណលោកប្រធានគូ ខ្ញុំរំភើបចិត្តណាស់ ស៊ាវប៉ាប្រហែលជាចេញមកពីសាលាហើយ ខ្ញុំត្រូវប្រញាប់ទៅប្រាប់ដំណឹងល្អនេះដល់គេសិន"
    },
    {
        "filename": "cfr_char_04_father_middleage_male.mp3",
        "label": "👨‍👧 ឪពុកពោះម៉ាយ (តួប្រុសវ័យកណ្តាល - ទទូច/ស្រលាញ់កូន)",
        "role_key": "father",
        "gender": "male",
        "start": 48.0,
        "duration": 5.2,
        "words": "បែបហ្នឹងមិនបានទេ ខ្ញុំជាឪពុកពោះម៉ាយ ខ្ញុំនិងកូនប្រុសគឺត្រូវតែនៅជាមួយគ្នា"
    },
    {
        "filename": "cfr_char_05_little_girl_child_female.mp3",
        "label": "👧 កូនស្រីតូច (តួកុមារី - រំភើប/ស្រស់ស្រាយ)",
        "role_key": "child",
        "gender": "female",
        "start": 41.6,
        "duration": 2.5,
        "words": "ល្អណាស់ប៉ាប៉ា យប់នេះពួកយើងបាននៅទីនេះហើយ"
    },
    {
        "filename": "cfr_char_06_fierce_wife_female.mp3",
        "label": "🔥 ភរិយាខឹងសម្បារ (តួស្រីកាច - ស្រែកខ្លាំង/កំហឹង)",
        "role_key": "fierce_female",
        "gender": "female",
        "start": 53.5,
        "duration": 7.5,
        "words": "ឯងចេញទៅ! ឯងចេញទៅភ្លាមទៅ! រវាងពួកយើងនិងស្រីខាងក្រៅនោះ ឯងរើសបានតែមួយទេ! បើឯងយកនាង មិនបាច់ត្រឡប់មកវិញទេ!"
    },
    {
        "filename": "cfr_char_07_hotel_staff_male.mp3",
        "label": "💼 បុគ្គលិកសណ្ឋាគារ (តួប្រុស - ម៉ត់ចត់/គួរសម)",
        "role_key": "staff",
        "gender": "male",
        "start": 44.0,
        "duration": 3.9,
        "words": "អត់មិនបានទេ កន្លែងស្នាក់នៅនេះគឺសម្រាប់តែម្នាក់ឯងប៉ុណ្ណោះ មិនអាចនាំកូនចូលមកទេ"
    },
    {
        "filename": "cfr_char_08_mediator_polite_male.mp3",
        "label": "🤝 បុរសសម្របសម្រួល (តួប្រុស - សុភាព/ស្រទន់)",
        "role_key": "mediator",
        "gender": "male",
        "start": 66.5,
        "duration": 3.5,
        "words": "អូ សុំទោសអ្នកទាំងពីរ ត្រឡប់ទៅវិញសិនទៅណា"
    },
    {
        "filename": "cfr_char_09_bride_young_female.mp3",
        "label": "👰 កូនក្រមុំ (តួស្រីក្មេង - ស្រទន់/ឌឺដង)",
        "role_key": "bride",
        "gender": "female",
        "start": 172.5,
        "duration": 2.5,
        "words": "ពូកែណាស់ឯងថ្ងៃនេះ កម្ទេចសាច់ញាតិខ្ញុំអស់ជាច្រើននាក់"
    },
    {
        "filename": "cfr_char_10_wedding_guest_uncle_male.mp3",
        "label": "🥂 ភ្ញៀវកិត្តិយសចាស់ទុំ (តួអ៊ំប្រុស - រីករាយ/រួសរាយ)",
        "role_key": "old_uncle",
        "gender": "male",
        "start": 181.8,
        "duration": 7.7,
        "words": "មកហើយៗៗ ថ្ងៃនេះជាថ្ងៃអាពាហ៍ពិពាហ៍ក្មួយទាំងពីរ បាទ ហើយមួយនេះ ស្រាសំពះផ្ទឹមពីរកែវនេះ ពួកឯងត្រូវតែផឹកណា៎"
    },
    {
        "filename": "cfr_char_11_elder_storyteller_male.mp3",
        "label": "👴 តាចាស់ទុំរៀបរាប់ (ព្រឹទ្ធាចារ្យ/តា - សំឡេងចាស់ទុំ)",
        "role_key": "elder",
        "gender": "male",
        "start": 320.0,
        "duration": 8.5,
        "words": "ឯងភ្លេចហើយ ៥ឆ្នាំមុន អាស៊ុនទៅចូលរួមមង្គលការគេ ផឹកស្រវឹងខ្លាំង គឺឯងជាអ្នកចាត់មនុស្សទៅយកគេមកវិញ"
    },
    {
        "filename": "cfr_char_12_school_teacher_host_female.mp3",
        "label": "👩‍🏫 ពិធីការិនីសាលារៀន (តួស្រី - គួរសម/ពន្យល់ម៉ត់ចត់)",
        "role_key": "teacher",
        "gender": "female",
        "start": 798.8,
        "duration": 5.8,
        "words": "ជាន់ទីមួយនៃអាគារសកម្មភាពនេះ ពួកយើងធ្វើជាបន្ទប់អានសៀវភៅ ដើម្បីឲ្យក្មេងៗអាចក្រេបជញ្ជក់ចំណេះដឹងថ្នាក់បឋមសិក្សាបាន"
    }
]

def main():
    print("=" * 65)
    print("🎬 កំពុងស្រង់សំឡេងតួអង្គចេញពី cFrJkngJ5fT8jn5ELRXLLk.mp4 ...")
    print("=" * 65)

    if not os.path.exists(VIDEO_PATH):
        print(f"❌ រកមិនឃើញឯកសារវីដេអូ {VIDEO_PATH}")
        return

    extracted_records = []

    for idx, char in enumerate(CHARACTERS, 1):
        filename = char["filename"]
        dest_sample = os.path.join(SAMPLES_DIR, filename)
        dest_output = os.path.join(OUTPUTS_DIR, filename)

        start = char["start"]
        dur = char["duration"]

        print(f"[{idx}/{len(CHARACTERS)}] កំពុងកាត់សំឡេង: {char['label']} (at {start}s, dur {dur}s)...", flush=True)

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
            # Also copy to outputs folder for preview access
            try:
                import shutil
                shutil.copy2(dest_sample, dest_output)
            except Exception:
                pass

            file_size = os.path.getsize(dest_sample)
            print(f"  ✅ ជោគជ័យ: {filename} ({file_size} bytes)", flush=True)

            extracted_records.append({
                "id": f"voxcpm:{filename}",
                "filename": filename,
                "label": char["label"],
                "role_key": char["role_key"],
                "gender": char["gender"],
                "is_curated": True,
                "words": char["words"]
            })
        else:
            print(f"  ⚠️ កំហុសកាត់សំឡេង: {res.stderr.decode('utf-8', errors='ignore')[:120]}", flush=True)

    # Update extracted_characters.json
    existing = []
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    # Filter out any old cfr_char_ entries to prevent duplication
    clean_existing = [c for c in existing if not c.get("filename", "").startswith("cfr_char_")]

    # Prepend the new characters to the top of the list so they appear first in the tool!
    updated_list = extracted_records + clean_existing

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(updated_list, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 65)
    print(f"🎉 បានស្រង់ និងបញ្ចូលតួអង្គចំនួន {len(extracted_records)} តួអង្គទៅក្នុង Tool រួចរាល់!")
    print(f"📁 Audio Samples: {SAMPLES_DIR}")
    print(f"📜 Character Vault: {JSON_PATH} (សរុប {len(updated_list)} តួអង្គ)")
    print("=" * 65)

if __name__ == "__main__":
    main()
