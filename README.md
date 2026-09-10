# -animeclone

🎬 **AI Video & Anime Multi-Character Khmer Dubbing Studio** (ចិន ➔ ខ្មែរ)

ប្រព័ន្ធស្ទូឌីយោបញ្ជូលសំឡេង និងក្លូនសំឡេងតួអង្គភាពយន្តចិន/Donghua មកជាភាសាខ្មែរស្វ័យប្រវត្តិកម្រិតខ្ពស់ (Zero-Shot AI Voice Cloning & Dubbing Studio)។

## ✨ លក្ខណៈពិសេសចម្បង (Key Features)
- 🎭 **Auto-Diarization & Role Recognition:** កំណត់អត្តសញ្ញាណតួអង្គ និងចាត់តាំងសំឡេងតាមតួនាទី (តួឯកប្រុស, តួឯកស្រី, តួកាច, មេទ័ព, ចាហ្វាយខេត្ត, យាយចាស់...)។
- 🎙️ **Zero-Shot Voice Cloning:** Clone សំឡេងចេញពីរឿងដើមផ្ទាល់ ឬប្រើប្រាស់គំរូសំឡេង ១៣ តួអង្គ។
- 🎵 **BGM Preservation & Center Channel Vocal Suppression:** លុបសំឡេងនិយាយចិនដើមស្អាត ដោយរក្សាភ្លេងកំដរ (BGM) និង Sound Effects ពេញលេញធម្មតា។
- 🌐 **Multi-Computer LAN Access:** ដំណើរការលើបណ្តាញមូលដ្ឋាន (Wi-Fi / LAN) អាចបើកប្រើប្រាស់បានគ្រប់កុំព្យូទ័រ និងទូរស័ព្ទ។
- 🗣️ **Theatrical & Emotional Dubbing:** បញ្ចូលមនោសញ្ចេតនា ទឹកដមសំឡេងឡើងចុះ និងពាក្យពេចន៍ភាពយន្តក្បាច់គុណបុរាណ។

## 🚀 ការដំឡើង និងដំណើរការ (Quick Start)

1. **Clone repository:**
   ```bash
   git clone https://github.com/cm5722254-beep/-animeclone.git
   cd -animeclone
   ```

2. **ដំឡើង Dependencies:**
   ```bash
   npm install
   ```

3. **កំណត់ API Keys ក្នុងឯកសារ `.env`:**
   ចម្លង `.env.example` ទៅ `.env`៖
   ```bash
   cp .env.example .env
   ```
   បញ្ចូល `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, និង `VOXCPM_API_URL` (ប្រសិនបើមាន)។

4. **ដំណើរការ Server:**
   ```bash
   npm start
   ```
   បើក Browser: `http://localhost:3000` ឬតាម LAN IP របស់កុំព្យូទ័រ។
