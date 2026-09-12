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
from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables with override
env_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(dotenv_path=env_file_path, override=True)

from services import audio_processor, auth_db
from services.khmer_dubber import KhmerDubber, clean_pure_khmer, ROLE_THEATRICAL_PROFILES
from services.elevenlabs_service import elevenlabs_service

app = FastAPI(title="AI Voice Clone & Dubbing Studio (ZH -> KM)")


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXTRA_PATHS = [
    os.path.join(BASE_DIR, 'bin'),
    '/opt/homebrew/bin',      # Apple Silicon Mac (M1/M2/M3/M4) Homebrew
    '/usr/local/bin',          # Intel Mac Homebrew & standard UNIX tools
    '/opt/local/bin',          # MacPorts
]
for p in EXTRA_PATHS:
    if os.path.exists(p) and p not in os.environ.get('PATH', ''):
        os.environ['PATH'] = p + os.pathsep + os.environ.get('PATH', '')

UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
OUTPUTS_DIR = os.path.join(BASE_DIR, 'outputs')
SAMPLES_DIR = os.path.join(BASE_DIR, 'samples')
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(SAMPLES_DIR, exist_ok=True)

khmer_dubber = KhmerDubber()
active_jobs = {}

# --- Authentication Helpers ---
def get_request_user(request: Request) -> Optional[dict]:
    """Retrieve validated user from Authorization Bearer token or headers."""
    auth_header = request.headers.get('Authorization', '')
    token = ''
    if auth_header.startswith('Bearer '):
        token = auth_header[7:].strip()
    if not token:
        token = request.headers.get('x-auth-token', '')
    if not token:
        token = request.query_params.get('token', '')
    return auth_db.get_user_by_token(token) if token else None

def require_admin(request: Request) -> dict:
    """Ensure current user is authenticated and has admin role."""
    user = get_request_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="សូមចូលប្រើប្រាស់គណនី Admin ជាមុនសិន")
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="អ្នកមិនមានសិទ្ធិជា Administrator ទេ")
    return user

# --- Pydantic Request Models ---
class AuthRegisterRequest(BaseModel):
    username: str
    password: str

class AuthLoginRequest(BaseModel):
    username: str
    password: str

class SetPremiumRequest(BaseModel):
    userId: int
    days: int

class RevokePremiumRequest(BaseModel):
    userId: int

class DeleteUserRequest(BaseModel):
    userId: int

class ConfigUpdate(BaseModel):
    elevenlabsKey: Optional[str] = None
    geminiKey: Optional[str] = None
    voxcpmUrl: Optional[str] = None
    geminiModel: Optional[str] = None

class DubbingStartRequest(BaseModel):
    filename: str
    sourceLang: Optional[str] = 'zh'
    targetLang: Optional[str] = 'km'
    voiceId: Optional[str] = 'voxcpm-voice-actor'
    scope: Optional[str] = 'full'
    castingSafetyMode: Optional[str] = 'safe_curated'
    characterVoiceMap: Optional[dict] = {}
    maleLeadVoice: Optional[str] = 'hang_phleung_char_2_male.mp3'
    femaleLeadVoice: Optional[str] = 'hang_phleung_char_6_female.mp3'
    geminiModel: Optional[str] = 'gemini-3.5-flash'

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

class DownloadVideoRequest(BaseModel):
    url: str
    quality: Optional[str] = 'best'

class AssembleCustomRequest(BaseModel):
    filename: str
    segments: List[dict]
    bgmAudio: Optional[str] = None
    removeOriginalVocals: Optional[bool] = False
    vocalGain: Optional[float] = 2.2
    bgmGain: Optional[float] = 0.85

class CharacterSpeakRequest(BaseModel):
    voiceId: str
    text: str
    gender: Optional[str] = 'male'
    referenceAudio: Optional[str] = None
    emotion: Optional[str] = 'dramatic'

class CharacterUpdateRequest(BaseModel):
    id: Optional[str] = None
    filename: Optional[str] = None
    label: Optional[str] = None
    role_key: Optional[str] = None
    gender: Optional[str] = None
    words: Optional[str] = None

class SwitchModeRequest(BaseModel):
    mode: str
    cloudUrl: Optional[str] = None

# --- Authentication & Admin Endpoints ---

@app.post('/api/auth/register')
def auth_register(body: AuthRegisterRequest):
    try:
        res = auth_db.register_user(body.username, body.password)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/auth/login')
def auth_login(body: AuthLoginRequest):
    try:
        res = auth_db.login_user(body.username, body.password)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/auth/logout')
def auth_logout(request: Request):
    auth_header = request.headers.get('Authorization', '')
    token = ''
    if auth_header.startswith('Bearer '):
        token = auth_header[7:].strip()
    if not token:
        token = request.headers.get('x-auth-token', '')
    if token:
        auth_db.logout_user(token)
    return {'success': True}

@app.get('/api/auth/me')
def auth_me(request: Request):
    user = get_request_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthenticated")
    return {'user': user}

@app.get('/api/admin/users')
def admin_list_users(request: Request):
    require_admin(request)
    users = auth_db.list_all_users()
    return {'users': users}

@app.post('/api/admin/set-premium')
def admin_set_premium(body: SetPremiumRequest, request: Request):
    require_admin(request)
    try:
        res = auth_db.set_user_premium(body.userId, body.days)
        return {'success': True, 'data': res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post('/api/admin/revoke-premium')
def admin_revoke_premium(body: RevokePremiumRequest, request: Request):
    require_admin(request)
    try:
        res = auth_db.revoke_user_premium(body.userId)
        return {'success': True, 'data': res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post('/api/admin/delete-user')
def admin_delete_user(body: DeleteUserRequest, request: Request):
    admin = require_admin(request)
    if body.userId == admin['id']:
        raise HTTPException(status_code=400, detail="មិនអាចលុបគណនី Admin ផ្ទាល់ខ្លួនបានទេ")
    auth_db.delete_user(body.userId)
    return {'success': True}

# --- API Endpoints ---

@app.get('/api/config')
def get_config():
    load_dotenv(dotenv_path=env_file_path, override=True)
    eleven_key = os.getenv('ELEVENLABS_API_KEY', '')
    gemini_key = os.getenv('GEMINI_API_KEY', '')
    voxcpm_url = os.getenv('VOXCPM_API_URL', '')
    mode = os.getenv('VOXCPM_MODE', 'local' if voxcpm_url.startswith('http://127.0.0.1') or not voxcpm_url else 'cloud')
    return {
        'hasElevenlabs': bool(eleven_key and not eleven_key.startswith('your_')),
        'hasGemini': bool(gemini_key and not gemini_key.startswith('your_')),
        'geminiModel': os.getenv('GEMINI_MODEL', 'gemini-3.5-flash'),
        'hasVoxcpmUrl': bool(voxcpm_url),
        'voxcpmUrl': voxcpm_url,
        'cloudUrl': os.getenv('VOXCPM_CLOUD_URL', voxcpm_url if not voxcpm_url.startswith('http://127.0.0.1') else ''),
        'mode': mode,
        'port': int(os.getenv('PORT', 3000))
    }

@app.get('/api/voxcpm/local-check')
def check_local_voxcpm():
    import requests
    local_url = "http://127.0.0.1:8000"
    try:
        r = requests.get(f"{local_url}/", timeout=1.5)
        if r.status_code == 200:
            data = r.json()
            return {
                'online': True,
                'url': local_url,
                'device': data.get('device', 'cpu'),
                'gpuName': data.get('gpuName', 'Local PC'),
                'modelReady': data.get('modelLoaded', False) or data.get('status') == 'ok',
                'message': 'ម៉ាស៊ីន Local PC (Port 8000) កំពុងដំណើរការល្អ'
            }
    except Exception:
        pass
    return {
        'online': False,
        'url': local_url,
        'message': 'មិនទាន់បើក Local VoxCPM2 Server នៅឡើយទេ (ចុចបើក START_LOCAL_VOXCPM.bat)'
    }

def set_env_vars(updates: dict):
    env_path = os.path.join(BASE_DIR, '.env')
    lines = []
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

    for k, v in updates.items():
        if v is not None:
            os.environ[k] = str(v)
            found = False
            for i, line in enumerate(lines):
                if line.strip().startswith(f"{k}="):
                    lines[i] = f"{k}={v}\n"
                    found = True
                    break
            if not found:
                lines.append(f"{k}={v}\n")

    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

@app.post('/api/voxcpm/switch-mode')
def switch_voxcpm_mode(body: SwitchModeRequest, request: Request):
    user = get_request_user(request)
    if body.mode in ['cloud', 'local']:
        if not user or (user.get('tier') != 'premium' and user.get('role') != 'admin'):
            raise HTTPException(
                status_code=403,
                detail="មុខងារ VoxCPM2 Cloud និង Computer សម្រាប់តែសមាជិក Premium ប៉ុណ្ណោះ។ គណនី Free អាចប្រើប្រាស់បានតែ Offline Neural Mode។"
            )

    current_cloud = os.getenv('VOXCPM_CLOUD_URL') or ''
    if os.getenv('VOXCPM_API_URL') and not os.getenv('VOXCPM_API_URL').startswith('http://127.0.0.1') and not os.getenv('VOXCPM_API_URL').startswith('http://localhost'):
        current_cloud = os.getenv('VOXCPM_API_URL')
    if body.cloudUrl:
        current_cloud = body.cloudUrl.strip()

    updates = {
        'VOXCPM_CLOUD_URL': current_cloud,
        'VOXCPM_MODE': body.mode
    }
    if body.mode == 'local':
        updates['VOXCPM_API_URL'] = "http://127.0.0.1:8000"
    elif body.mode == 'cloud':
        updates['VOXCPM_API_URL'] = current_cloud
    elif body.mode == 'pure_khmer':
        updates['VOXCPM_API_URL'] = ''
    elif body.mode == 'elevenlabs':
        updates['VOXCPM_API_URL'] = ''

    set_env_vars(updates)

    return {
        'success': True,
        'mode': os.getenv('VOXCPM_MODE'),
        'activeUrl': os.getenv('VOXCPM_API_URL', ''),
        'cloudUrl': current_cloud
    }

@app.get('/api/voxcpm/status')
def get_voxcpm_status():
    url = os.getenv('VOXCPM_API_URL', '')
    mode = os.getenv('VOXCPM_MODE', 'local' if url.startswith('http://127.0.0.1') or not url else 'cloud')

    if mode == 'elevenlabs':
        info = elevenlabs_service.get_user_info()
        configured = elevenlabs_service.is_configured()
        return {
            'online': configured and not bool(info.get('error')),
            'configured': configured,
            'mode': 'elevenlabs',
            'isLocal': False,
            'device': 'ElevenLabs Cloud AI',
            'gpuName': 'Zero-GPU Cloud Voice Clone',
            'quota': info,
            'message': f"ElevenLabs Cloud AI (Tier: {info.get('tier', 'Free')}, {info.get('remaining', 0)} chars remaining)"
        }

    if mode == 'pure_khmer' or not url or not url.strip():
        return {
            'online': True,
            'configured': True,
            'mode': 'pure_khmer',
            'isLocal': True,
            'message': '100% Pure Khmer Neural Engine (Offline & Fast)'
        }


    clean_url = url.strip()
    if clean_url.startswith('http') and '.' not in clean_url and not clean_url.startswith('http://127.0.0.1') and not clean_url.startswith('http://localhost'):
        clean_url = clean_url.rstrip('/') + '.trycloudflare.com'

    import requests
    try:
        timeout = 1.5 if clean_url.startswith('http://127.0.0.1') or clean_url.startswith('http://localhost') else 4.0
        r = requests.get(clean_url, timeout=timeout)
        if r.status_code == 200:
            is_local = clean_url.startswith('http://127.0.0.1') or clean_url.startswith('http://localhost')
            return {
                'online': True,
                'configured': True,
                'url': clean_url,
                'isLocal': is_local,
                'mode': 'local' if is_local else 'cloud',
                'message': 'Local PC Server កំពុងដំណើរការ (200 OK)' if is_local else 'GPU Cloud Server កំពុងដំណើរការល្អ (200 OK)'
            }
        return {'online': False, 'configured': True, 'url': clean_url, 'mode': mode, 'message': f'ឆ្លើយតបកូដ HTTP {r.status_code}'}
    except Exception as e:
        is_local = clean_url.startswith('http://127.0.0.1') or clean_url.startswith('http://localhost')
        msg = 'មិនទាន់បើក START_LOCAL_VOXCPM.bat លើកុំព្យូទ័រ' if is_local else str(e)
        return {'online': False, 'configured': True, 'url': clean_url, 'isLocal': is_local, 'mode': mode, 'message': msg}

@app.post('/api/config')
def update_config(body: ConfigUpdate):
    updates = {}
    if body.elevenlabsKey is not None:
        val = body.elevenlabsKey.strip()
        if val:
            updates['ELEVENLABS_API_KEY'] = val
        elif body.elevenlabsKey == '__CLEAR__':
            updates['ELEVENLABS_API_KEY'] = ''

    if body.geminiKey is not None:
        val = body.geminiKey.strip()
        if val:
            updates['GEMINI_API_KEY'] = val
        elif body.geminiKey == '__CLEAR__':
            updates['GEMINI_API_KEY'] = ''

    if body.geminiModel is not None:
        val = body.geminiModel.strip()
        if val:
            updates['GEMINI_MODEL'] = val

    if body.voxcpmUrl is not None:
        val = body.voxcpmUrl.strip()
        if val.startswith('http') and '.' not in val and not val.startswith('http://127.0.0.1') and not val.startswith('http://localhost'):
            val = val.rstrip('/') + '.trycloudflare.com'
        updates['VOXCPM_API_URL'] = val

    set_env_vars(updates)
    return {'success': True, 'message': 'API keys & configurations saved'}

@app.get('/api/elevenlabs/status')
def get_elevenlabs_status():
    return {
        'configured': elevenlabs_service.is_configured(),
        'info': elevenlabs_service.get_user_info()
    }

@app.get('/api/elevenlabs/voices')
def get_elevenlabs_voices():
    voices = elevenlabs_service.list_voices()
    return {
        'success': True,
        'count': len(voices),
        'voices': voices
    }

class ElevenCloneRequest(BaseModel):
    voiceName: str
    sampleFilename: str

@app.post('/api/elevenlabs/clone')
def clone_eleven_voice(body: ElevenCloneRequest):
    if not elevenlabs_service.is_configured():
        raise HTTPException(status_code=400, detail="សូមកំណត់ ELEVENLABS_API_KEY ក្នុង Settings ជាមុនសិន")

    cand = os.path.join(SAMPLES_DIR, os.path.basename(body.sampleFilename))
    if not os.path.exists(cand):
        cand = os.path.join(UPLOADS_DIR, os.path.basename(body.sampleFilename))
    if not os.path.exists(cand):
        raise HTTPException(status_code=404, detail="រកមិនឃើញឯកសារគំរូសំឡេងឡើយ")

    voice_id = elevenlabs_service.clone_voice(body.voiceName, cand)
    if not voice_id:
        raise HTTPException(status_code=500, detail="បរាជ័យក្នុងការ Clone សំឡេងជាមួយ ElevenLabs (អាចអស់ Quota ឬបញ្ហា Network)")
    return {'success': True, 'voiceId': voice_id, 'voiceName': body.voiceName}

@app.post('/api/upload')

async def upload_file(mediaFile: UploadFile = File(...)):
    dest_filename = f"mediaFile-{int(time.time() * 1000)}-{mediaFile.filename}"
    dest_path = os.path.join(UPLOADS_DIR, dest_filename)

    with open(dest_path, 'wb') as f:
        shutil.copyfileobj(mediaFile.file, f, length=1024 * 1024)

    file_size = os.path.getsize(dest_path)
    file_type = 'video' if any(dest_filename.lower().endswith(ext) for ext in ['.mp4', '.mkv', '.avi', '.mov', '.webm']) else 'audio'
    file_url = f"/media/uploads/{dest_filename}"

    file_info = {
        'filename': dest_filename,
        'originalName': mediaFile.filename,
        'size': file_size,
        'type': file_type,
        'url': file_url
    }

    return {
        'success': True,
        'file': file_info,
        'filename': dest_filename,
        'originalName': mediaFile.filename,
        'size': file_size,
        'type': file_type,
        'url': file_url
    }

@app.post('/api/video/download')
async def download_online_video(body: DownloadVideoRequest):
    if not body.url or not body.url.strip():
        raise HTTPException(status_code=400, detail="សូមបញ្ចូល URL វីដេអូ YouTube, Facebook ឬ TikTok")

    url = body.url.strip()
    try:
        import yt_dlp
    except ImportError:
        raise HTTPException(status_code=500, detail="ម៉ូឌុល yt-dlp មិនទាន់ត្រូវបានតំឡើងនៅលើប្រព័ន្ធទេ")

    ts = int(time.time() * 1000)
    out_template = os.path.join(UPLOADS_DIR, f"yt_dlp_{ts}_%(title).40s.%(ext)s")

    ydl_opts = {
        'outtmpl': out_template,
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'merge_output_format': 'mp4',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }

    try:
        loop = asyncio.get_event_loop()
        def _exec_download():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                target = ydl.prepare_filename(info)
                base, _ = os.path.splitext(target)
                mp4_target = base + '.mp4'
                if os.path.exists(mp4_target):
                    target = mp4_target
                return info, target

        info, downloaded_file = await loop.run_in_executor(None, _exec_download)

        if not os.path.exists(downloaded_file):
            raise HTTPException(status_code=500, detail="ទាញយកវីដេអូមិនបានសម្រេច (File not created)")

        filename = os.path.basename(downloaded_file)
        file_size = os.path.getsize(downloaded_file)
        title = info.get('title') or filename
        duration = info.get('duration') or 0
        thumbnail = info.get('thumbnail') or None

        return {
            'success': True,
            'filename': filename,
            'originalName': title,
            'size': file_size,
            'type': 'video',
            'url': f"/media/uploads/{filename}",
            'duration': duration,
            'thumbnail': thumbnail,
            'message': f"បានទាញយកវីដេអូ '{title}' ដោយជោគជ័យ!"
        }
    except Exception as e:
        err_msg = str(e)
        if "is not a valid URL" in err_msg:
            err_msg = "URL វីដេអូមិនត្រឹមត្រូវ សូមពិនិត្យមើលម្ដងទៀត"
        raise HTTPException(status_code=400, detail=f"កំហុសក្នុងការទាញយក: {err_msg}")

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

@app.delete('/api/files/{filename:path}')
def delete_file(filename: str):
    p = os.path.join(UPLOADS_DIR, os.path.basename(filename))
    if not os.path.exists(p):
        # check without basename if it was a direct match
        cand = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(cand):
            p = cand
        else:
            raise HTTPException(status_code=404, detail="រកមិនឃើញឯកសារគម្រោងឡើយ")
    try:
        os.unlink(p)
        return {'success': True, 'message': f"បានលុបគម្រោង '{filename}' ដោយជោគជ័យ"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"បរាជ័យក្នុងការលុបឯកសារ: {str(e)}")

@app.post('/api/files/clear')
def clear_all_files():
    deleted_count = 0
    freed_bytes = 0
    if os.path.exists(UPLOADS_DIR):
        for f in os.listdir(UPLOADS_DIR):
            if f == '.gitkeep': continue
            p = os.path.join(UPLOADS_DIR, f)
            try:
                if os.path.isfile(p):
                    sz = os.path.getsize(p)
                    os.unlink(p)
                    deleted_count += 1
                    freed_bytes += sz
                elif os.path.isdir(p):
                    shutil.rmtree(p, ignore_errors=True)
            except Exception as e:
                print(f"Error clearing upload file {f}: {e}")
    return {
        'success': True,
        'count': deleted_count,
        'freedBytes': freed_bytes,
        'formattedFreed': format_bytes(freed_bytes),
        'message': f"បានលុបគម្រោងចោលសរុប {deleted_count} គម្រោង (សន្សំទំហំបាន {format_bytes(freed_bytes)})"
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
async def start_dubbing(body: DubbingStartRequest, background_tasks: BackgroundTasks, request: Request):
    user = get_request_user(request)
    is_free = not user or (user.get('tier') != 'premium' and user.get('role') != 'admin')
    if is_free:
        # Free account: strictly locked to offline pure_khmer and default voice
        body.voiceId = 'voxcpm-voice-actor'
        os.environ['VOXCPM_MODE'] = 'pure_khmer'
        os.environ['VOXCPM_API_URL'] = ''

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
                        'characterVoiceMap': body.characterVoiceMap,
                        'maleLeadVoice': body.maleLeadVoice,
                        'femaleLeadVoice': body.femaleLeadVoice,
                        'geminiModel': body.geminiModel
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
            import traceback
            traceback.print_exc()
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
        # Auto-fallback to available uploads if previous file was deleted
        cand_files = [f for f in os.listdir(UPLOADS_DIR) if f != '.gitkeep' and not f.startswith('.')]
        if cand_files:
            input_path = os.path.join(UPLOADS_DIR, cand_files[0])
        else:
            raise HTTPException(status_code=404, detail="រកមិនឃើញឯកសារវីដេអូឡើយ (អាចត្រូវបានលុបចោល)។ សូម Upload វីដេអូជាមុនសិន")

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

    clean_text = clean_pure_khmer(body.text)
    if not clean_text:
        clean_text = "បាទ"

    await khmer_dubber.synthesize_realistic_speech(
        clean_text,
        out_path,
        body.voiceId,
        studio_ref if os.path.exists(studio_ref) else None,
        {'gender': body.gender, 'emotion': body.emotion, 'role': body.speakerId}
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
            text_to_speak = clean_pure_khmer(seg.get('khmer_translation') or seg.get('chinese_text') or '')
            if text_to_speak:
                auto_path = os.path.join(OUTPUTS_DIR, f"auto_studio_line_py_{i}_{int(time.time() * 1000)}.wav")
                try:
                    is_female = seg.get('gender') == 'female' or ('ស្រី' in (seg.get('speaker_name') or ''))
                    role = seg.get('speaker_role') or ('female_lead' if is_female else 'male_lead')
                    theatrical = ROLE_THEATRICAL_PROFILES.get(role, {})
                    fb_voice = theatrical.get('voice', 'km-KH-SreymomNeural' if is_female else 'km-KH-PisethNeural')
                    pitch = theatrical.get('pitch', '+0Hz')
                    rate = theatrical.get('rate', '+0%')
                    await khmer_dubber.synthesize_khmer_speech(text_to_speak, auto_path, fb_voice, pitch=pitch, rate=rate)
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

    # Clean BGM selection: Strip Chinese vocals if requested
    bgm_source_path = extracted_audio_path
    if body.bgmAudio:
        bgm_cand = os.path.join(OUTPUTS_DIR, os.path.basename(body.bgmAudio))
        if os.path.exists(bgm_cand):
            bgm_source_path = bgm_cand
    elif body.removeOriginalVocals:
        ai_bgm_cand = os.path.join(OUTPUTS_DIR, f"{os.path.splitext(os.path.basename(extracted_audio_path))[0]}_ai_bgm.wav")
        dsp_bgm_cand = os.path.join(OUTPUTS_DIR, f"{os.path.splitext(os.path.basename(extracted_audio_path))[0]}_dsp_bgm.wav")
        if os.path.exists(ai_bgm_cand):
            bgm_source_path = ai_bgm_cand
        elif os.path.exists(dsp_bgm_cand):
            bgm_source_path = dsp_bgm_cand
        else:
            from services import vocal_separator
            sep_res = vocal_separator.separate_vocals_and_bgm(extracted_audio_path, OUTPUTS_DIR, True)
            if sep_res.get('bgmPath') and os.path.exists(sep_res['bgmPath']):
                bgm_source_path = sep_res['bgmPath']

    v_gain = body.vocalGain or 2.2
    b_gain = body.bgmGain or 0.85
    audio_processor.mix_vocals_with_original(bgm_source_path, master_dialogue_path, dubbed_audio_path, v_gain, b_gain)

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

    clean_text = clean_pure_khmer(body.text)
    if not clean_text:
        clean_text = "សួស្តីបងប្អូនទាំងអស់គ្នា នេះជាសំឡេងនិយាយខ្មែរសុទ្ធ ១០០%"

    await khmer_dubber.synthesize_realistic_speech(
        clean_text,
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

@app.get('/api/characters/all')
def get_all_characters(request: Request):
    user = get_request_user(request)
    is_free = not user or (user.get('tier') != 'premium' and user.get('role') != 'admin')

    # If Free user, return ONLY the Default Natural voice
    if is_free:
        default_voice = {
            'id': 'default_neural_piseth',
            'filename': 'default_neural.mp3',
            'label': '🎙️ Default Neural (PisethNatural - Free)',
            'role_key': 'male_lead',
            'gender': 'male',
            'is_curated': True,
            'is_free_only': True,
            'words': 'សំឡេងធម្មជាតិស្តង់ដារ PisethNeural សម្រាប់គណនី Free',
            'exists': True,
            'previewUrl': None,
            'sizeBytes': 0
        }
        return {'success': True, 'count': 1, 'characters': [default_voice], 'isFree': True}

    json_path = os.path.join(BASE_DIR, 'extracted_characters.json')
    characters = []
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                characters = json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Auto-discover unlisted audio samples in samples directory
    if os.path.exists(SAMPLES_DIR):
        existing_filenames = set(c.get('filename') for c in characters)
        for f in os.listdir(SAMPLES_DIR):
            if (f.endswith('.mp3') or f.endswith('.wav')) and f not in existing_filenames:
                base_name = os.path.splitext(f)[0]
                is_wav_pair = f.endswith('.wav') and any(os.path.splitext(c.get('filename', ''))[0] == base_name for c in characters)
                if not is_wav_pair:
                    is_female = 'female' in f.lower()
                    characters.append({
                        'id': f"voxcpm:{f}",
                        'filename': f,
                        'label': os.path.splitext(f)[0].replace('_', ' '),
                        'role_key': 'female_lead' if is_female else 'male_lead',
                        'gender': 'female' if is_female else 'male',
                        'is_curated': False,
                        'words': 'សំឡេងគំរូក្នុងស្ទូឌីយោ'
                    })

    enriched = []
    for c in characters:
        fp = os.path.join(SAMPLES_DIR, c.get('filename', ''))
        exists = os.path.exists(fp)
        size = os.path.getsize(fp) if exists else 0
        enriched.append({
            **c,
            'exists': exists,
            'previewUrl': f"/media/samples/{c.get('filename', '')}" if exists else None,
            'sizeBytes': size
        })

    return {'success': True, 'count': len(enriched), 'characters': enriched, 'isFree': False}

@app.put('/api/characters/update')
def update_character(body: CharacterUpdateRequest):
    json_path = os.path.join(BASE_DIR, 'extracted_characters.json')
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail='Characters database not found')

    with open(json_path, 'r', encoding='utf-8') as f:
        characters = json.load(f)

    target_idx = -1
    for i, c in enumerate(characters):
        if (body.id and c.get('id') == body.id) or (body.filename and c.get('filename') == body.filename):
            target_idx = i
            break

    if target_idx == -1:
        new_entry = {
            'id': body.id or f"voxcpm:{body.filename}",
            'filename': body.filename or 'custom_voice.mp3',
            'label': body.label.strip() if body.label else 'សំឡេងថ្មី',
            'role_key': body.role_key or ('female_lead' if body.gender == 'female' else 'male_lead'),
            'gender': body.gender or 'male',
            'is_curated': True,
            'words': body.words.strip() if body.words else ''
        }
        characters.insert(0, new_entry)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(characters, f, ensure_ascii=False, indent=2)
        return {'success': True, 'character': new_entry}

    if body.label is not None and body.label.strip():
        characters[target_idx]['label'] = body.label.strip()
    if body.role_key is not None:
        characters[target_idx]['role_key'] = body.role_key
    if body.gender is not None:
        characters[target_idx]['gender'] = body.gender
    if body.words is not None:
        characters[target_idx]['words'] = body.words.strip()

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    return {'success': True, 'character': characters[target_idx]}

@app.post('/api/characters/create')
async def create_character(
    audioFile: UploadFile = File(...),
    label: str = Form(...),
    gender: str = Form('male'),
    role_key: str = Form('male_lead'),
    words: Optional[str] = Form('')
):
    json_path = os.path.join(BASE_DIR, 'extracted_characters.json')
    ext = os.path.splitext(audioFile.filename)[1].lower() or '.mp3'
    safe_base = f"custom_voice_{int(time.time() * 1000)}"
    target_filename = f"{safe_base}{ext}"
    dest_path = os.path.join(SAMPLES_DIR, target_filename)

    with open(dest_path, 'wb') as buffer:
        shutil.copyfileobj(audioFile.file, buffer)

    if ext != '.mp3':
        mp3_name = f"{safe_base}.mp3"
        mp3_path = os.path.join(SAMPLES_DIR, mp3_name)
        try:
            import subprocess
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', dest_path, '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', mp3_path], check=True)
            target_filename = mp3_name
        except Exception as e:
            print(f"Could not transcode voice to mp3: {e}")

    characters = []
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            characters = json.load(f)

    new_char = {
        'id': f"voxcpm:{target_filename}",
        'filename': target_filename,
        'label': label.strip() if label else 'សំឡេងថ្មី',
        'role_key': role_key,
        'gender': gender,
        'is_curated': True,
        'words': words.strip() if words else 'សំឡេងគំរូថ្មី'
    }

    characters.insert(0, new_char)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    return {
        'success': True,
        'character': {
            **new_char,
            'exists': True,
            'previewUrl': f"/media/samples/{target_filename}"
        }
    }

@app.delete('/api/characters/delete/{char_id:path}')
def delete_character(char_id: str):
    import urllib.parse
    char_id = urllib.parse.unquote(char_id)
    json_path = os.path.join(BASE_DIR, 'extracted_characters.json')
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail='Characters database not found')

    with open(json_path, 'r', encoding='utf-8') as f:
        characters = json.load(f)

    initial_len = len(characters)
    characters = [c for c in characters if c.get('id') != char_id and c.get('filename') != char_id]

    if len(characters) == initial_len:
        raise HTTPException(status_code=404, detail='Character not found')

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    return {'success': True, 'message': 'Character removed successfully'}

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

@app.get('/mobile')
@app.get('/android')
def serve_mobile_app():
    mobile_file = os.path.join(PUBLIC_DIR, 'mobile.html')
    if os.path.exists(mobile_file):
        return FileResponse(mobile_file)
    raise HTTPException(status_code=404, detail="Mobile app not found")

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
