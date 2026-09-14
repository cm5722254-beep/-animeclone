# ✅ FEATURE TEST CHECKLIST - បញ្ជីពិនិត្យមុខងារទាំងអស់

## 📋 របៀបសាកល្បង (How to Test)

ចូលទៅកាន់: **http://localhost:3000**

---

## 🎯 1. DASHBOARD (Tab ទី១)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ Dashboard screen
- [ ] បង្ហាញ Recent Projects (គម្រោងថ្មីៗ)
- [ ] បង្ហាញ Stats Cards (Total Voices, Disk Usage)
- [ ] ចុច "+ New Project" button → បង្កើតគម្រោងថ្មី
- [ ] ចុចលើគម្រោងចាស់ → ផ្ទុកគម្រោងនោះ
- [ ] ចុច Delete project icon → លុបគម្រោង
- [ ] ចុច "Clear All Projects" → លុបទាំងអស់

### 🔗 Related Files:
- `src/components/dashboard/DashboardView.tsx`

---

## 🚀 2. DUBBING STUDIO (6-STEP WORKFLOW) (Tab ទី២)

### ✅ STEP 1 - Import Video
- [ ] មើលឃើញ Drop zone ដើម្បី upload video
- [ ] អូសវីដេអូមកដាក់ (Drag & Drop)
- [ ] ចុច "ជ្រើសរើសវីដេអូ" button
- [ ] បង្ហាញ Upload progress (%)
- [ ] បង្ហាញ MB progress (loaded/total)
- [ ] បង្ហាញ Video thumbnail បន្ទាប់ពី upload រួច
- [ ] ជ្រើស Test Clip preset (20s, 30s, 40s)
- [ ] កែ Start/End time manually
- [ ] ចុច "បន្ត" (Next) → ទៅ Step 2

### ✅ STEP 2 - Content & Language
- [ ] ជ្រើស Content Type (Anime, Donghua, Movie, Drama)
- [ ] បង្ហាញ Source Language: Chinese (zh)
- [ ] បង្ហាញ Target Language: Khmer (km)
- [ ] ជ្រើស Voice Style (Anime, Natural, Dramatic)
- [ ] ជ្រើស AI Provider (Gemini, OpenAI)
- [ ] ចុច "ស្កេនឃ្លាសន្ទនា" (Scan Timeline)
- [ ] រង់ចាំ AI scanning... (10-30 វិនាទី)
- [ ] បង្ហាញ "រកឃើញ X ឃ្លាសន្ទនា" (Found X segments)
- [ ] ចុច "បន្ត" → ទៅ Step 3

### ✅ STEP 3 - Translation Review
- [ ] បង្ហាញ Segment cards (Chinese + Khmer pairs)
- [ ] បង្ហាញ Timeline timestamps (start-end)
- [ ] បង្ហាញ Speaker labels (Speaker 1, Speaker 2...)
- [ ] ចុចលើ Chinese text field → កែបាន
- [ ] ចុចលើ Khmer translation field → កែបាន
- [ ] ចុច "រក្សាទុក" (Save) → រក្សាការកែប្រែ
- [ ] ចុច "ត្រឡប់" (Back) → ត្រឡប់ទៅ Step 2
- [ ] ចុច "បន្ត" → ទៅ Step 4

### ✅ STEP 4 - Voice Casting
- [ ] បង្ហាញ Segment list with voice dropdowns
- [ ] ចុចលើ "ជ្រើសរើសសំឡេង..." dropdown
- [ ] បង្ហាញ Character voices (100+ voices)
- [ ] Filter by gender (Male/Female)
- [ ] ជ្រើសសំឡេងតួអង្គ → បង្ហាញ voice label
- [ ] ចុច "ស្តាប់សំឡេង" (Preview) → ឮសំឡេង sample
- [ ] ចុច "ត្រឡប់" → ត្រឡប់ទៅ Step 3
- [ ] ចុច "បន្ត" → ទៅ Step 5

### ✅ STEP 5 - Generating
- [ ] មើលឃើញ "ចាប់ផ្តើម AI Dubbing" button
- [ ] ចុច "ចាប់ផ្តើម AI Dubbing"
- [ ] បង្ហាញ Progress bar (0% → 100%)
- [ ] បង្ហាញ Status messages:
  - "កំពុងស្រង់សំឡេង..."
  - "កំពុងបកប្រែ..."
  - "កំពុងបង្កើតសំឡេង AI..."
  - "កំពុងដាក់សំឡេងចូលវីដេអូ..."
  - "រួចរាល់!"
- [ ] រង់ចាំរហូតដល់ 100%
- [ ] Auto-advance → ទៅ Step 6

### ✅ STEP 6 - Result
- [ ] មើលឃើញ Video preview player
- [ ] ចុច Play button → មើលវីដេអូដែលបានដាក់សំឡេងខ្មែរ
- [ ] ស្តាប់សំឡេងខ្មែរក្នុងវីដេអូ
- [ ] ចុច "ទាញយក Video (MP4)" → Download
- [ ] ចុច "ដំណើរការវីដេអូពេញលេញ" → Process full video
- [ ] ចុច "ត្រឡប់ទៅកែការបកប្រែ" → ត្រឡប់ទៅ Step 3
- [ ] ចុច "ត្រឡប់ទៅកែសំឡេង" → ត្រឡប់ទៅ Step 4
- [ ] ចុច "Switch to Pro Studio" → ទៅ Studio Mode

### 🔗 Related Files:
- `src/components/workflow/WorkflowView.tsx`
- `src/components/workflow/WorkflowStepper.tsx`
- `src/components/workflow/steps/Step1Import.tsx`
- `src/components/workflow/steps/Step2ContentLanguage.tsx`
- `src/components/workflow/steps/Step3TranslationReview.tsx`
- `src/components/workflow/steps/Step4VoiceCasting.tsx`
- `src/components/workflow/steps/Step5Generating.tsx`
- `src/components/workflow/steps/Step6Result.tsx`

---

## 🎬 3. STUDIO MODE (ADVANCED) (Tab ទី៣)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ Professional Studio layout:
  - TopNavBar (header)
  - StudioSidebar (left)
  - Video Player (center)
  - DialoguePanel (right)
  - Timeline (bottom)
- [ ] ចុច Play/Pause video
- [ ] Zoom timeline in/out
- [ ] Click on dialogue segment → Select segment
- [ ] បង្ហាញ Speaker colors (8 colors)
- [ ] Edit segment text inline
- [ ] ចុច "Open Thumbnail Studio" → Capture frame
- [ ] ចុច "Start Dubbing" → Generate dubbed video
- [ ] មើលឃើញ Video effects controls:
  - Brightness, Contrast, Saturation
  - LUT presets
  - Watermark settings

### 🔗 Related Files:
- `src/components/studio/DubbingStudio.tsx`
- `src/components/navigation/TopNavBar.tsx`
- `src/components/navigation/StudioSidebar.tsx`
- `src/components/dialogue/DialoguePanel.tsx`
- `src/components/timeline/Timeline.tsx`
- `src/components/player/VideoPreview.tsx`

---

## ✏️ 4. MANUAL TIMELINE EDITOR (Tab ទី៤)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ "ស្កេនឃ្លាសន្ទនាទាំងអស់" button
- [ ] ចុច Scan button → AI extracts dialogue
- [ ] បង្ហាញ Segment list with:
  - Line number (#1, #2, #3...)
  - Speaker voice dropdown
  - Timestamp (start-end)
  - Chinese text
  - Khmer translation
- [ ] ជ្រើសសំឡេងតួអង្គពី dropdown
- [ ] ចុច "បង្កើតសំឡេង AI" → Generate audio for that line
- [ ] ចុច Volume2 icon → Preview audio
- [ ] កែ Khmer text inline

### 🔗 Related Files:
- App.tsx (lines 901-1012)

---

## 🎤 5. CHARACTER LIBRARY (Tab ទី៥)

### ✅ ត្រូវពិនិត្យ:
- [ ] បង្ហាញ Character voice cards (100+ voices)
- [ ] បង្ហាញ Voice metadata:
  - Character name
  - Gender (Male/Female)
  - Role tags (Lead, Support, Elder, Child...)
  - Sample audio
- [ ] ចុច "+ Add Voice" → Open Add Voice modal
- [ ] ចុច Edit icon → Open Edit Voice modal
- [ ] ចុច Play icon → Preview voice sample
- [ ] ចុច Delete icon → Confirm delete
- [ ] Filter by gender
- [ ] Filter by role
- [ ] Search by name

### 🔗 Related Files:
- `src/components/characters/CharacterLibrary.tsx`
- `src/components/modals/AddVoiceModal.tsx`
- `src/components/modals/EditVoiceModal.tsx`
- `src/components/modals/VoiceAuditionModal.tsx`

---

## 🌐 6. TRANSLATION DESK (Tab ទី៦)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ Translation interface
- [ ] បង្ហាញ Source language selector
- [ ] បង្ហាញ Target language selector
- [ ] វាយអត្ថបទចិនក្នុង input box
- [ ] ចុច "Translate" button
- [ ] បង្ហាញ Khmer translation output
- [ ] ចុច "Copy" → Copy to clipboard
- [ ] ចុច "Export SRT" → Download subtitle file
- [ ] Batch translate multiple segments

### 🔗 Related Files:
- `src/components/translation/TranslationDesk.tsx`

---

## 🎚️ 7. AUDIO MIXER CONSOLE (Tab ទី៧)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ Audio mixer interface
- [ ] Upload BGM file (background music)
- [ ] ចុច "Remove Vocals" → MDX-Net vocal removal
- [ ] បង្ហាញ Progress bar
- [ ] Download clean BGM (vocals removed)
- [ ] Adjust volume sliders:
  - Voice volume
  - BGM volume
  - Mix ratio
- [ ] ចុច "Mix Audio" → Combine voice + BGM
- [ ] Preview mixed audio
- [ ] Download mixed audio

### 🔗 Related Files:
- `src/components/mixer/AudioMixerConsole.tsx`

---

## 📝 8. SUBTITLE STUDIO (Tab ទី៨)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ Subtitle editor
- [ ] បង្ហាញ Segment list
- [ ] កែ Subtitle text
- [ ] កែ Timestamp (start/end)
- [ ] Subtitle styling controls:
  - Font family (Kantumruy Pro, Koulen...)
  - Font size (slider)
  - Text color (color picker)
  - Stroke color
  - Stroke width
  - Background color + opacity
  - Position (top, center, bottom)
  - Animation (fade, slide...)
- [ ] Preview subtitle style
- [ ] ចុច "Export SRT" → Download .srt file
- [ ] ចុច "Export ASS" → Download .ass file
- [ ] ចុច "Export VTT" → Download .vtt file

### 🔗 Related Files:
- `src/components/subtitles/SubtitleStudio.tsx`

---

## 🎨 9. THUMBNAIL GENERATOR (Tab ទី៩)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ Thumbnail canvas
- [ ] បង្ហាញ Video frame capture
- [ ] កែ Title text (ចំណងជើង)
- [ ] កែ Subtitle text
- [ ] កែ Badge text
- [ ] ជ្រើស Font family dropdown
- [ ] Adjust font size slider
- [ ] ជ្រើស Text color
- [ ] ជ្រើស Style preset:
  - Gold 3D
  - Neon Glow
  - Fire
  - Ice
  - Classic
- [ ] ជ្រើស Banner style (gradient, solid, none)
- [ ] Drag text to reposition
- [ ] Rotate text (angle slider)
- [ ] ចុច "Capture New Frame" → Grab from video
- [ ] ចុច "Download Thumbnail" → Save as PNG
- [ ] ចុច "Apply to Video Watermark" → Add to video

### 🔗 Related Files:
- `src/components/thumbnail/ThumbnailGenerator.tsx`

---

## 🎛️ 10. VOICE TUNER LAB (Tab ទី១០)

### ✅ ត្រូវពិនិត្យ:
- [ ] មើលឃើញ Voice tuner interface
- [ ] Upload audio file
- [ ] Adjust pitch slider (-12 to +12)
- [ ] Adjust speed slider (0.5x to 2.0x)
- [ ] ជ្រើស Emotion preset:
  - Happy
  - Sad
  - Angry
  - Excited
  - Calm
- [ ] Adjust emotion intensity slider
- [ ] ចុច "Preview" → Listen to tuned voice
- [ ] ចុច "Apply" → Save changes
- [ ] ចុច "Download" → Save tuned audio

### 🔗 Related Files:
- `src/components/tuner/VoiceTunerLab.tsx`

---

## 🎬 MODALS & DIALOGS (ផ្ទាំងបន្ថែម)

### ✅ 1. Export Modal
**របៀបបើក:** ចុច "Export" button នៅ Sidebar ឬ Header
- [ ] មើលឃើញ Export dialog
- [ ] ជ្រើស Export format:
  - MP4 (Video + Audio)
  - MP3 (Audio only)
  - SRT (Subtitles)
  - ASS (Advanced subtitles)
- [ ] ជ្រើស Resolution:
  - 720p (HD)
  - 1080p (Full HD)
  - 1440p (2K)
  - 2160p (4K)
- [ ] ជ្រើស Quality preset (Fast, Medium, Best)
- [ ] Watermark settings:
  - Enable/Disable
  - Text
  - Position
  - Opacity
- [ ] Video effects:
  - LUT preset
  - Brightness/Contrast
  - Filters
- [ ] ចុច "Start Export" → Begin rendering
- [ ] បង្ហាញ Progress bar
- [ ] Download link appears when done

### ✅ 2. Settings Modal
**របៀបបើក:** ចុច Settings icon នៅ Sidebar
- [ ] មើលឃើញ Settings tabs:
  - General
  - API Keys (Gemini, OpenAI)
  - VoxCPM Server
  - Storage
  - Account
- [ ] កែ API keys
- [ ] ជ្រើស Default AI provider
- [ ] ជ្រើស Default voice mode
- [ ] ជ្រើស Gemini model
- [ ] ជ្រើស Language (Khmer/English)
- [ ] ចុច "Save Settings" → Save changes

### ✅ 3. Video Downloader Modal
**របៀបបើក:** Header → Download Video icon
- [ ] មើលឃើញ Video downloader
- [ ] Paste YouTube URL
- [ ] Paste TikTok URL
- [ ] Paste Facebook URL
- [ ] ចុច "Download" → Fetch video
- [ ] បង្ហាញ Download progress
- [ ] Video automatically loads into studio

### ✅ 4. System Status Modal
**របៀបបើក:** ចុច "System Status" នៅ Sidebar bottom
- [ ] មើលឃើញ System info:
  - VoxCPM status (Online/Offline)
  - API status (Gemini, OpenAI)
  - Disk usage stats
  - Memory usage
  - Active jobs
- [ ] បង្ហាញ Green/Yellow/Red indicators
- [ ] Refresh button → Update status

### ✅ 5. Admin Users Modal
**របៀបបើក:** Header → Admin icon (for admin users only)
- [ ] មើលឃើញ User list
- [ ] បង្ហាញ User metadata:
  - Username
  - Email
  - Role (admin/user)
  - Subscription plan
  - Expiry date
- [ ] ចុច "Add User" → Create new user
- [ ] ចុច Edit icon → Update user
- [ ] ចុច Delete icon → Remove user
- [ ] ចុច "Extend Subscription" → Update expiry

### 🔗 Related Files:
- `src/components/modals/ExportModal.tsx`
- `src/components/modals/SettingsModal.tsx`
- `src/components/modals/VideoDownloaderModal.tsx`
- `src/components/layout/SystemStatusModal.tsx`
- `src/components/modals/AdminUsersModal.tsx`

---

## 🔧 BACKEND API TESTING

### ✅ Authentication
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected: 200 OK + token
```

### ✅ File Upload
```bash
# Test video upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test_video.mp4"

# Expected: 200 OK + file metadata
```

### ✅ Character Library
```bash
# Get all voices
curl http://localhost:3000/api/characters/all

# Expected: 200 OK + JSON array of voices
```

### ✅ AI Dubbing
```bash
# Start dubbing job
curl -X POST http://localhost:3000/api/dubbing/start \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test_video.mp4",
    "sourceLang": "zh",
    "targetLang": "km",
    "voiceId": "voice_actor_clone",
    "scope": "30"
  }'

# Expected: 200 OK + jobId
```

---

## 📊 BUILD & SERVER STATUS

### ✅ Build Test
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Output files generated in `public/`
- [ ] File sizes reasonable (<1MB JS)

### ✅ Development Server
```bash
npm run dev
```
- [ ] Server starts on port 3000
- [ ] Python FastAPI backend running
- [ ] Vite dev server running
- [ ] No console errors
- [ ] Hot reload working

### ✅ Production Check
- [ ] All routes accessible
- [ ] Static assets loading
- [ ] API endpoints responding
- [ ] Video streaming working
- [ ] No 404 errors
- [ ] No 500 errors

---

## ✅ FINAL VERIFICATION

### 🎯 Critical Path Test (Full Workflow)
1. [ ] Open http://localhost:3000
2. [ ] Login
3. [ ] ចុច "+ New Project"
4. [ ] Upload test video (30 វិនាទី)
5. [ ] ជ្រើស 30s test clip
6. [ ] ចុច "បន្ត"
7. [ ] ចុច "ស្កេនឃ្លាសន្ទនា"
8. [ ] រង់ចាំ AI scanning
9. [ ] ពិនិត្យការបកប្រែ
10. [ ] ជ្រើសសំឡេងតួអង្គ
11. [ ] ចុច "ចាប់ផ្តើម AI Dubbing"
12. [ ] រង់ចាំ 100%
13. [ ] មើលវីដេអូដែលបានដាក់សំឡេង
14. [ ] ទាញយក MP4

### 🎯 All Features Working?
- [ ] **6-Step Workflow** ✓
- [ ] **Dashboard** ✓
- [ ] **Studio Mode** ✓
- [ ] **Timeline Editor** ✓
- [ ] **Character Library** ✓
- [ ] **Translation Desk** ✓
- [ ] **Audio Mixer** ✓
- [ ] **Subtitle Studio** ✓
- [ ] **Thumbnail Generator** ✓
- [ ] **Voice Tuner** ✓
- [ ] **All Modals** ✓
- [ ] **All APIs** ✓

---

## 🎉 SUCCESS CRITERIA

✅ **100% មុខងារដំណើរការ** = ALL checkboxes checked!

---

**ថ្ងៃបង្កើត:** 2024-01-14  
**Version:** v3.0.0  
**ស្ថានភាព:** ✅ រួចរាល់សម្រាប់សាកល្បង
