import os
import sys
import time
import json
import shutil
import asyncio

# Force UTF-8 encoding on Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from services import audio_processor
from services.khmer_dubber import KhmerDubber

app = FastAPI(title="AI Voice Clone & Dubbing Studio (ZH -> KM)")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BIN_DIR = os.path.join(BASE_DIR, 'bin')
if os.path.exists(BIN_DIR) and BIN_DIR not in os.environ.get('PATH', ''):
    os.environ['PATH'] = BIN_DIR + os.pathsep + os.environ.get('PATH', '')

UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
OUTPUTS_DIR = os.path.join(BASE_DIR, 'outputs')
SAMPLES_DIR = os.path.join(BASE_DIR, 'samples')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(SAMPLES_DIR, exist_ok=True)

khmer_dubber = KhmerDubber()
active_jobs = {}

# --- Pydantic Request Models ---
class ConfigUpdate(BaseModel):
    elevenlabsKey: Optional[str] = None
    geminiKey: Optional[str] = None
    voxcpmUrl: Optional[str] = None

class DubbingStartRequest(BaseModel):
    filename: str
    sourceLang: Optional[str] = 'zh'
    targetLang: Optional[str] = 'km'
    voiceId: Optional[str] = 'voxcpm-voice-actor'
    scope: Optional[str] = 'full'
    castingSafetyMode: Optional[str] = 'safe_curated'
    characterVoiceMap: Optional[dict] = {}

class ScanTimelineRequest(BaseModel):
    filename: str
    scope: Optional[str] = 'full'

class GenerateLineRequest(BaseModel):
    text: str
    lineIndex: Optional[int] = 0
    gender: Optional[str] = 'male'
    voiceId: Optional[str] = 'voxcpm-voice-actor'
    speakerId: Optional[str] = None
    emotion: Optional[str] = 'dramatic'

class AssembleCustomRequest(BaseModel):
    filename: str
    segments: List[dict]

class CharacterSpeakRequest(BaseModel):
    voiceId: str
    text: str
    gender: Optional[str] = 'male'
    referenceAudio: Optional[str] = None
    emotion: Optional[str] = 'dramatic'

# --- API Endpoints ---

@app.get('/api/config')
def get_config():
    eleven_key = os.getenv('ELEVENLABS_API_KEY', '')
    gemini_key = os.getenv('GEMINI_API_KEY', '')
    voxcpm_url = os.getenv('VOXCPM_API_URL', '')
    return {
        'hasElevenlabs': bool(eleven_key and not eleven_key.startswith('your_')),
        'hasGemini': bool(gemini_key and not gemini_key.startswith('your_')),
        'hasVoxcpmUrl': bool(voxcpm_url),
        'voxcpmUrl': voxcpm_url,
        'port': int(os.getenv('PORT', 3000))
    }

@app.post('/api/config')
def update_config(body: ConfigUpdate):
    env_path = os.path.join(BASE_DIR, '.env')
    if body.elevenlabsKey is not None:
        os.environ['ELEVENLABS_API_KEY'] = body.elevenlabsKey.strip()
    if body.geminiKey is not None:
        os.environ['GEMINI_API_KEY'] = body.geminiKey.strip()
    if body.voxcpmUrl is not None:
        os.environ['VOXCPM_API_URL'] = body.voxcpmUrl.strip()

    port = os.getenv('PORT', '3000')
    env_content = (
        f"PORT={port}\n"
        f"ELEVENLABS_API_KEY={os.getenv('ELEVENLABS_API_KEY', '')}\n"
        f"GEMINI_API_KEY={os.getenv('GEMINI_API_KEY', '')}\n"
        f"VOXCPM_API_URL={os.getenv('VOXCPM_API_URL', '')}\n"
    )
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)

    return {'success': True, 'message': 'API keys & configurations saved'}

@app.post('/api/upload')
async def upload_file(mediaFile: UploadFile = File(...)):
    dest_filename = f"mediaFile-{int(time.time() * 1000)}-{mediaFile.filename}"
    dest_path = os.path.join(UPLOADS_DIR, dest_filename)

    with open(dest_path, 'wb') as f:
        shutil.copyfileobj(mediaFile.file, f)

    file_size = os.path.getsize(dest_path)
    file_type = 'video' if any(dest_filename.lower().endswith(ext) for ext in ['.mp4', '.mkv', '.avi', '.mov', '.webm']) else 'audio'

    return {
        'success': True,
        'filename': dest_filename,
        'originalName': mediaFile.filename,
        'size': file_size,
        'type': file_type,
        'url': f"/media/uploads/{dest_filename}"
    }

@app.get('/api/files')
def get_files():
    results = []
    if os.path.exists(UPLOADS_DIR):
        for f in os.listdir(UPLOADS_DIR):
            p = os.path.join(UPLOADS_DIR, f)
            if os.path.isfile(p):
                stat = os.stat(p)
                results.append({
                    'filename': f,
                    'size': stat.st_size,
                    'type': 'video' if any(f.lower().endswith(ext) for ext in ['.mp4', '.mkv', '.avi', '.mov', '.webm']) else 'audio',
                    'created': stat.st_mtime,
                    'url': f"/media/uploads/{f}"
                })
    results.sort(key=lambda x: x['created'], reverse=True)
    return results

def format_bytes(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

@app.get('/api/outputs/stats')
def get_outputs_stats():
    count = 0
    total_bytes = 0
    if os.path.exists(OUTPUTS_DIR):
        for f in os.listdir(OUTPUTS_DIR):
            if f == '.gitkeep': continue
            p = os.path.join(OUTPUTS_DIR, f)
            if os.path.isfile(p):
                count += 1
                total_bytes += os.path.getsize(p)
    return {
        'count': count,
        'totalBytes': total_bytes,
        'formattedSize': format_bytes(total_bytes)
    }

@app.post('/api/outputs/clear')
def clear_outputs():
    deleted_count = 0
    freed_bytes = 0
    if os.path.exists(OUTPUTS_DIR):
        for f in os.listdir(OUTPUTS_DIR):
            if f == '.gitkeep': continue
            p = os.path.join(OUTPUTS_DIR, f)
            try:
                if os.path.isfile(p):
                    sz = os.path.getsize(p)
                    os.unlink(p)
                    deleted_count += 1
                    freed_bytes += sz
                elif os.path.isdir(p):
                    shutil.rmtree(p, ignore_errors=True)
            except Exception as e:
                print(f"Error clearing output {f}: {e}")
    return {
        'success': True,
        'count': deleted_count,
        'freedBytes': freed_bytes,
        'formattedFreed': format_bytes(freed_bytes),
        'message': f"បានលុបឯកសារ Output សរុប {deleted_count} ឯកសារ (សន្សំទំហំបាន {format_bytes(freed_bytes)})"
    }

class SeparateRequest(BaseModel):
    filename: str
    preferAi: Optional[bool] = True

@app.post('/api/audio/separate')
async def separate_audio_track(body: SeparateRequest):
    input_path = os.path.join(UPLOADS_DIR, body.filename)
    if not os.path.exists(input_path):
        root_path = os.path.join(BASE_DIR, body.filename)
        if os.path.exists(root_path): input_path = root_path
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="File not found")

    audio_ext = os.path.splitext(body.filename)[0] + '.mp3'
    extracted_audio = os.path.join(OUTPUTS_DIR, f"audio_{audio_ext}")
    if not os.path.exists(extracted_audio):
        audio_processor.extract_audio(input_path, extracted_audio)

    from services import vocal_separator
    result = vocal_separator.separate_vocals_and_bgm(extracted_audio, OUTPUTS_DIR, body.preferAi)
    return {
        'success': True,
        'engine': result['engine'],
        'vocalsUrl': f"/media/outputs/{os.path.basename(result['vocalsPath'])}",
        'bgmUrl': f"/media/outputs/{os.path.basename(result['bgmPath'])}"
    }

@app.post('/api/dubbing/start')
async def start_dubbing(body: DubbingStartRequest, background_tasks: BackgroundTasks):
    input_path = os.path.join(UPLOADS_DIR, body.filename)
    if not os.path.exists(input_path):
        root_path = os.path.join(BASE_DIR, body.filename)
        if os.path.exists(root_path): input_path = root_path
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="Uploaded file not found")

    job_id = f"job_{int(time.time() * 1000)}"
    job = {
        'id': job_id,
        'filename': body.filename,
        'status': 'extracting',
        'progress': 10,
        'message': 'កំពុងទាញយកសម្លេងពីវីដេអូដើម...',
        'sourceLang': body.sourceLang,
        'targetLang': body.targetLang,
        'scope': body.scope,
        'created': time.time()
    }
    active_jobs[job_id] = job

    async def run_pipeline():
        try:
            audio_ext = os.path.splitext(body.filename)[0] + '.mp3'
            extracted_audio_path = os.path.join(OUTPUTS_DIR, f"audio_{audio_ext}")
            job['progress'] = 10
            job['status'] = 'extracting'
            audio_processor.extract_audio(input_path, extracted_audio_path)

            if body.targetLang == 'km':
                job['progress'] = 15
                job['status'] = 'dubbing_khmer'
                job['message'] = 'AI Gemini កំពុងវិភាគ និងស្រង់តួអង្គគ្រប់តួក្នុងសាច់រឿង...'

                def on_prog(p, msg):
                    job['progress'] = p
                    job['message'] = msg

                result = await khmer_dubber.process_khmer_dubbing(
                    input_path,
                    extracted_audio_path,
                    OUTPUTS_DIR,
                    {
                        'sourceLang': body.sourceLang,
                        'voiceId': body.voiceId,
                        'scope': body.scope,
                        'castingSafetyMode': body.castingSafetyMode,
                        'characterVoiceMap': body.characterVoiceMap
                    },
                    on_progress=on_prog
                )

                job['status'] = 'completed'
                job['progress'] = 100
                job['message'] = 'ការ Dubbing គ្រប់តួអង្គក្នុងសាច់រឿងទទួលបានជោគជ័យ 100%!'
                job['outputVideo'] = f"/media/outputs/{result['outputVideoFilename']}"
                job['outputAudio'] = f"/media/outputs/{os.path.basename(result['dubbedAudioPath'])}"
                job['khmerScript'] = result['khmerScript']
                job['dialogueSegments'] = result['dialogueSegments']
            else:
                job['status'] = 'completed'
                job['progress'] = 100
                job['message'] = 'Dubbing complete'
        except Exception as e:
            job['status'] = 'failed'
            job['error'] = str(e)
            job['message'] = f"កំហុសក្នុងការ dubbing: {str(e)}"

    background_tasks.add_task(run_pipeline)
    return {'success': True, 'jobId': job_id}

@app.get('/api/dubbing/status/{job_id}')
def get_dubbing_status(job_id: str):
    if job_id not in active_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return active_jobs[job_id]

@app.post('/api/dubbing/scan-timeline')
async def scan_timeline(body: ScanTimelineRequest):
    input_path = os.path.join(UPLOADS_DIR, body.filename)
    if not os.path.exists(input_path):
        root_path = os.path.join(BASE_DIR, body.filename)
        if os.path.exists(root_path): input_path = root_path
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="File not found")

    audio_ext = os.path.splitext(body.filename)[0] + '.mp3'
    extracted_audio_path = os.path.join(OUTPUTS_DIR, f"audio_{audio_ext}")
    if not os.path.exists(extracted_audio_path):
        audio_processor.extract_audio(input_path, extracted_audio_path)

    duration = audio_processor.get_media_duration(input_path)
    segments = await khmer_dubber.extract_dialogue_timeline(extracted_audio_path, duration, body.scope)

    movie_voice_map = {}
    try:
        movie_voice_map = await khmer_dubber.extract_character_voice_samples(extracted_audio_path, segments, OUTPUTS_DIR)
    except Exception as ve:
        print(f"Movie voice sample extraction notice: {ve}")

    formatted = []
    for idx, s in enumerate(segments):
        formatted.append({
            **s,
            'line_index': idx,
            'movieVoiceSample': f"/media/outputs/{os.path.basename(movie_voice_map[s['speaker_id']])}" if s.get('speaker_id') in movie_voice_map else None,
            'audioUrl': None,
            'source': 'pending'
        })

    return {'success': True, 'duration': duration, 'segments': formatted}

@app.post('/api/dubbing/record-line')
async def record_line(audio: UploadFile = File(...), lineIndex: int = Form(0)):
    out_name = f"user_recorded_line_{lineIndex}_{int(time.time() * 1000)}.wav"
    out_path = os.path.join(OUTPUTS_DIR, out_name)
    temp_upload = os.path.join(OUTPUTS_DIR, f"temp_{audio.filename}")

    with open(temp_upload, 'wb') as f:
        shutil.copyfileobj(audio.file, f)

    audio_processor.run_command(f'ffmpeg -nostdin -y -i "{temp_upload}" -ar 44100 -ac 2 -b:a 192k "{out_path}"')
    try:
        if os.path.exists(temp_upload): os.unlink(temp_upload)
    except Exception:
        pass

    return {
        'success': True,
        'lineIndex': lineIndex,
        'audioUrl': f"/media/outputs/{out_name}",
        'filename': out_name
    }

@app.post('/api/dubbing/generate-line')
async def generate_line(body: GenerateLineRequest):
    out_name = f"ai_line_{body.lineIndex}_{int(time.time() * 1000)}.wav"
    out_path = os.path.join(OUTPUTS_DIR, out_name)

    is_female = body.gender == 'female'
    studio_ref = None

    if body.voiceId == 'movie-live-clone' and body.speakerId:
        cand = os.path.join(OUTPUTS_DIR, f"ref_voice_{body.speakerId}.mp3")
        if os.path.exists(cand):
            studio_ref = cand

    if not studio_ref and body.voiceId and body.voiceId.startswith('voxcpm:'):
        sample_name = body.voiceId.replace('voxcpm:', '')
        cand_d = os.path.join(SAMPLES_DIR, sample_name)
        cand_m = os.path.join(SAMPLES_DIR, f"{sample_name}.mp3")
        if os.path.exists(cand_d): studio_ref = cand_d
        elif os.path.exists(cand_m): studio_ref = cand_m

    if not studio_ref:
        studio_ref = os.path.join(SAMPLES_DIR, 'main_lead_female.mp3' if is_female else 'main_lead_male.mp3')

    await khmer_dubber.synthesize_realistic_speech(
        body.text,
        out_path,
        body.voiceId,
        studio_ref if os.path.exists(studio_ref) else None,
        {'gender': body.gender, 'emotion': body.emotion}
    )

    return {
        'success': True,
        'lineIndex': body.lineIndex,
        'audioUrl': f"/media/outputs/{out_name}",
        'filename': out_name
    }

@app.post('/api/dubbing/assemble-custom')
async def assemble_custom(body: AssembleCustomRequest):
    input_path = os.path.join(UPLOADS_DIR, body.filename)
    if not os.path.exists(input_path):
        root_path = os.path.join(BASE_DIR, body.filename)
        if os.path.exists(root_path): input_path = root_path
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="Video file not found")

    duration = audio_processor.get_media_duration(input_path)
    audio_ext = os.path.splitext(body.filename)[0] + '.mp3'
    extracted_audio_path = os.path.join(OUTPUTS_DIR, f"audio_{audio_ext}")
    if not os.path.exists(extracted_audio_path):
        audio_processor.extract_audio(input_path, extracted_audio_path)

    mapped_segments = []
    for i, seg in enumerate(body.segments):
        audio_path = None
        if seg.get('audioUrl'):
            base = os.path.basename(seg['audioUrl'])
            p = os.path.join(OUTPUTS_DIR, base)
            if os.path.exists(p): audio_path = p

        # Auto-synthesize any missing line so ZERO lines are dropped!
        if not audio_path and (seg.get('khmer_translation') or seg.get('chinese_text')):
            text_to_speak = (seg.get('khmer_translation') or seg.get('chinese_text') or '').strip()
            if text_to_speak:
                auto_path = os.path.join(OUTPUTS_DIR, f"auto_studio_line_py_{i}_{int(time.time() * 1000)}.wav")
                try:
                    is_female = seg.get('gender') == 'female' or ('ស្រី' in (seg.get('speaker_name') or ''))
                    fb_voice = 'km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural'
                    await khmer_dubber.synthesize_khmer_speech(text_to_speak, auto_path, fb_voice)
                    if os.path.exists(auto_path) and os.path.getsize(auto_path) > 1000:
                        audio_path = auto_path
                except Exception as ex:
                    print(f"Auto-synthesize line {i} notice: {ex}")

        if audio_path:
            mapped_segments.append({
                **seg,
                'audioPath': audio_path,
                'start_time': float(seg.get('start_time', 0)),
                'end_time': float(seg.get('end_time', float(seg.get('start_time', 0)) + 2.5))
            })

    if not mapped_segments:
        raise HTTPException(status_code=400, detail="មិនមានឃ្លាសន្ទនាសម្រាប់ដំណើរការ dubbing ឡើយ!")

    ts = int(time.time() * 1000)
    master_dialogue_path = os.path.join(OUTPUTS_DIR, f"custom_master_dialogue_py_{ts}.wav")
    await khmer_dubber.assemble_timeline_audio(mapped_segments, duration, master_dialogue_path)

    dubbed_audio_path = os.path.join(OUTPUTS_DIR, f"custom_dubbed_master_py_{ts}.mp3")
    audio_processor.mix_vocals_with_original(extracted_audio_path, master_dialogue_path, dubbed_audio_path, 2.2, 0.85)

    video_ext = os.path.splitext(input_path)[1]
    out_video_filename = f"custom_dubbed_khmer_py_{ts}{video_ext}"
    out_video_path = os.path.join(OUTPUTS_DIR, out_video_filename)
    audio_processor.merge_video_audio(input_path, dubbed_audio_path, out_video_path)

    return {
        'success': True,
        'outputVideo': f"/media/outputs/{out_video_filename}",
        'outputAudio': f"/media/outputs/{os.path.basename(dubbed_audio_path)}",
        'totalLinesDubbed': len(mapped_segments)
    }

@app.post('/api/character/clone')
async def character_clone(voiceSample: UploadFile = File(...), characterName: Optional[str] = Form(None), description: Optional[str] = Form(None)):
    filename = f"clone_{int(time.time() * 1000)}_{voiceSample.filename}"
    save_path = os.path.join(UPLOADS_DIR, filename)
    with open(save_path, 'wb') as f:
        shutil.copyfileobj(voiceSample.file, f)

    if os.getenv('VOXCPM_API_URL'):
        return {
            'success': True,
            'voiceId': f"voxcpm-ref:{filename}",
            'name': characterName or 'Movie Character',
            'engine': 'voxcpm2'
        }

    return {
        'success': True,
        'voiceId': f"local-clone:{filename}",
        'name': characterName or 'Movie Character',
        'engine': 'edge-tts'
    }

@app.get('/api/character/samples')
def get_character_samples():
    chars_file = os.path.join(BASE_DIR, 'extracted_characters.json')
    if os.path.exists(chars_file):
        with open(chars_file, 'r', encoding='utf-8') as f:
            chars = json.load(f)
        augmented = []
        for c in chars:
            augmented.append({
                **c,
                'previewUrl': f"/media/samples/{c['filename']}"
            })
        return {'success': True, 'count': len(augmented), 'characters': augmented}
    return {'success': True, 'count': 0, 'characters': []}

@app.post('/api/character/speak')
async def character_speak(body: CharacterSpeakRequest):
    out_name = f"speak_test_py_{int(time.time() * 1000)}.wav"
    out_path = os.path.join(OUTPUTS_DIR, out_name)

    ref_audio = None
    if body.referenceAudio:
        base = os.path.basename(body.referenceAudio)
        c1 = os.path.join(SAMPLES_DIR, base)
        c2 = os.path.join(UPLOADS_DIR, base)
        c3 = os.path.join(OUTPUTS_DIR, base)
        if os.path.exists(c1): ref_audio = c1
        elif os.path.exists(c2): ref_audio = c2
        elif os.path.exists(c3): ref_audio = c3

    await khmer_dubber.synthesize_realistic_speech(
        body.text,
        out_path,
        body.voiceId,
        ref_audio,
        {'gender': body.gender, 'emotion': body.emotion}
    )

    return {
        'success': True,
        'audioUrl': f"/media/outputs/{out_name}",
        'filename': out_name
    }

def get_lan_addresses(port: int):
    import socket
    addresses = []
    try:
        host_name = socket.gethostname()
        for ip in socket.gethostbyname_ex(host_name)[2]:
            if not ip.startswith('127.'):
                addresses.append({'interface': 'LAN', 'ip': ip, 'url': f'http://{ip}:{port}'})
    except Exception:
        pass
    return addresses

@app.get('/api/characters/extracted')
def get_extracted_characters():
    json_path = os.path.join(BASE_DIR, 'extracted_characters.json')
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                chars = json.load(f)
            augmented = [{**c, 'previewUrl': f"/media/samples/{c.get('filename', '')}"} for c in chars]
            return {'success': True, 'count': len(augmented), 'characters': augmented}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {'success': True, 'count': 0, 'characters': []}

@app.get('/api/system/network-info')
def get_network_info():
    port = int(os.getenv('PORT', 3000))
    lan_addrs = get_lan_addresses(port)
    return {
        'port': port,
        'localUrl': f"http://localhost:{port}",
        'lanAddresses': lan_addrs,
        'primaryLanUrl': lan_addrs[0]['url'] if lan_addrs else f"http://localhost:{port}"
    }

# --- Static File Mounts ---
app.mount('/media/outputs', StaticFiles(directory=OUTPUTS_DIR), name='outputs')
app.mount('/media/samples', StaticFiles(directory=SAMPLES_DIR), name='samples')
app.mount('/media/uploads', StaticFiles(directory=UPLOADS_DIR), name='uploads')
app.mount('/', StaticFiles(directory=PUBLIC_DIR, html=True), name='public')

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 3000))
    print("====================================================")
    print("🎬 AI Voice Clone & Dubbing Studio (Python FastAPI)")
    print(f"💻 Local Machine:    http://localhost:{port}")
    print("====================================================")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
