# 🎬 Cheatz Dabber - AI Multi-Character Khmer Dubbing Studio
### គាំទ្រទាំង Windows និង macOS (Apple Silicon M1/M2/M3/M4 & Intel)

ប្រព័ន្ធស្ទូឌីយោបញ្ជូលសំឡេង និងក្លូនសំឡេងតួអង្គភាពយន្ត/Donghua មកជាភាសាខ្មែរស្វ័យប្រវត្តិកម្រិតខ្ពស់ (Zero-Shot AI Voice Cloning & Dubbing Studio)។

---

## 💻 របៀបបើកដំណើរការលើ Windows (Windows 10 / 11)

1. **បើកដំណើរការកម្មវិធីស្ទូឌីយោ (Studio):**
   - គ្រាន់តែ **Double-Click** លើឯកសារ `run.bat` ឬ `Launch_Studio_App.vbs`
   - កម្មវិធីនឹងរៀបចំ Python Virtualenv និង FFmpeg ដោយស្វ័យប្រវត្តិ រួចបើកផ្ទាំង Studio លើ Browser `http://localhost:3000`

2. **បើក Local VoxCPM2 Engine លើកុំព្យូទ័រ (Port 8000 - Optional):**
   - **Double-Click** លើ `START_LOCAL_VOXCPM.bat`

---

## 🍏 របៀបបើកដំណើរការលើ macOS (MacBook, iMac, Mac mini)

គាំទ្រទាំង **Apple Silicon (M1/M2/M3/M4)** ដោយប្រើ Metal/MPS GPU Acceleration និង **Intel Mac**។

### ជំហានទី ១ (ដំឡើងដំបូង - តែម្ដងគត់):
បើក Terminal ក្នុង Folder នេះ រួចវាយ៖
```bash
chmod +x install_mac.sh START_STUDIO_MAC.command START_LOCAL_VOXCPM_MAC.command
bash install_mac.sh
```
*(ស្គ្រីបនេះនឹងរៀបចំ FFmpeg តាម Homebrew និងដំឡើង Python packages ទាំងអស់ដោយស្វ័យប្រវត្តិ)*

### ជំហានទី ២ (បើកដំណើរការជាប្រចាំ):
- **បើកស្ទូឌីយោ (Studio):**
  - គ្រាន់តែ **Double-Click** លើឯកសារ `START_STUDIO_MAC.command` ក្នុង Finder!
  - វានឹងបើក Web Browser ទៅកាន់ `http://localhost:3000` ដោយស្វ័យប្រវត្តិ។
- **បើក Local VoxCPM2 Engine (Port 8000):**
  - **Double-Click** លើឯកសារ `START_LOCAL_VOXCPM_MAC.command`

---

## ✨ លក្ខណៈពិសេសចម្បង (Core Features)

- 🎭 **Auto-Diarization & Multi-Character Recognition:** កំណត់អត្តសញ្ញាណតួអង្គ និងបែងចែកសំឡេងតាមតួនាទី (តួឯកប្រុស, តួឯកស្រី, តួកាច, ចាស់ទុំ, មេទ័ព...)
- 🎙️ **Zero-Shot Voice Cloning:** Clone សំឡេងចេញពីរឿងផ្ទាល់ ឬជ្រើសរើសសំឡេងតួអង្គខ្មែរដែលរៀបចំទុកស្រាប់
- 🎵 **Vocal Suppression & BGM Preservation:** លុបសំឡេងនិយាយដើមស្អាត ដោយរក្សាភ្លេងកំដរ (BGM) និង Sound Effects ១០០%
- 🧠 **Google Gemini 2.5 / 3.5 Flash Integration:** ស្ដាប់សំឡេងដើមផ្ទាល់ និងបកប្រែមកជាភាសាខ្មែរភាពយន្តបែបបុរាណរស់រវើក
- 🖥️ **Cross-Platform:** ដំណើរការយ៉ាងរលូនលើទាំង **Windows** (NVIDIA CUDA / CPU) និង **macOS** (Apple Silicon Metal MPS / CPU)

---

## ⚙️ ការកំណត់ API Keys ក្នុង `.env`

បើកឯកសារ `.env` រួចកំណត់៖
```env
GEMINI_API_KEY=your_gemini_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
GEMINI_MODEL=gemini-3.5-flash
PORT=3000
```
