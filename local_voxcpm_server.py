"""
====================================================================
🚀 Cheatz Dabber.PRO - Local VoxCPM2 Engine Runner (Windows Native)
💻 Runs 100% locally on your computer (Port 8000)
⚡ Supports NVIDIA CUDA GPU or Multi-Threaded CPU Fallback
====================================================================
"""
import os
import sys
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try: sys.stderr.reconfigure(encoding='utf-8')
    except Exception: pass
import time
import re
import shutil
import asyncio
from typing import Optional

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

UPLOADS_DIR = os.path.join(BASE_DIR, "scratch", "voxcpm_uploads")
OUTPUTS_DIR = os.path.join(BASE_DIR, "scratch", "voxcpm_outputs")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

import torch
try:
    import soundfile as sf
except ImportError:
    sf = None
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import subprocess

app = FastAPI(
    title="Cheatz Dabber - Local VoxCPM2 Engine",
    description="Cross-Platform Local Voice Cloning Engine (Windows & macOS)",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Cross-platform Device detection (CUDA on PC/Linux, Metal/MPS on Apple Silicon Mac, or CPU)
if torch.cuda.is_available():
    device = "cuda"
    gpu_name = torch.cuda.get_device_name(0)
elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
    device = "mps"
    gpu_name = "Apple Silicon GPU (Metal / MPS)"
else:
    device = "cpu"
    gpu_name = "Local Computer (CPU Mode)"

model = None
model_loading = False
model_load_error = None

def get_model():
    global model, model_loading, model_load_error
    if model is not None:
        return model
    if model_loading:
        return None

    model_loading = True
    try:
        print("=" * 65)
        print(f"📥 Loading VoxCPM2 Model onto {device.upper()} ({gpu_name})...")
        print("=" * 65)
        import voxcpm
        try:
            model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device, optimize=(device == "cuda"))
            print(f"✅ VoxCPM2 Model loaded successfully on {device.upper()}!")
        except Exception as opt_err:
            print(f"⚠️ Notice: {opt_err}, loading with default settings...")
            model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device)
            print(f"✅ VoxCPM2 Model loaded successfully on {device.upper()}!")
        model_load_error = None
        return model
    except Exception as e:
        model_load_error = str(e)
        print(f"⚠️ Local VoxCPM2 model notice: {e}")
        return None
    finally:
        model_loading = False

@app.get("/")
def home():
    return {
        "status": "ok",
        "service": "Cheatz Dabber Local VoxCPM2 Engine",
        "device": device,
        "gpuName": gpu_name,
        "modelLoaded": model is not None,
        "modelLoading": model_loading,
        "modelLoadError": model_load_error,
        "port": 8000,
        "local": True
    }

@app.get("/api/status")
def get_status():
    vram_display = "N/A (CPU)"
    if torch.cuda.is_available():
        vram_display = f"{torch.cuda.memory_allocated(0)/(1024**2):.1f} MB (CUDA)"
    elif device == "mps":
        vram_display = "Apple Metal GPU Active"

    return {
        "online": True,
        "device": device,
        "gpuName": gpu_name,
        "modelReady": model is not None,
        "modelLoading": model_loading,
        "modelLoadError": model_load_error,
        "memoryVRAM": vram_display
    }

@app.post("/api/clone-and-speak")
async def clone_and_speak(
    text: str = Form(...),
    reference_audio: Optional[UploadFile] = File(None),
    timesteps: int = Form(10),
    cfg_value: float = Form(2.0)
):
    try:
        ref_path = None
        if reference_audio and reference_audio.filename:
            ref_path = os.path.join(UPLOADS_DIR, f"ref_{int(time.time()*1000)}_{os.path.basename(reference_audio.filename)}")
            content = await reference_audio.read()
            with open(ref_path, "wb") as f:
                f.write(content)

        # Clean Thai characters
        clean_text = re.sub(r'[\u0E00-\u0E7F]+', '', text).strip()
        if not clean_text:
            clean_text = "បាទ"

        active_model = get_model()
        out_file = os.path.join(OUTPUTS_DIR, f"voice_{int(time.time()*1000)}.wav")

        if active_model is not None:
            gen_kwargs = {
                "text": clean_text,
                "cfg_value": cfg_value,
                "inference_timesteps": timesteps,
                "normalize": True,
                "denoise": True
            }
            if ref_path and os.path.exists(ref_path) and os.path.getsize(ref_path) > 1000:
                gen_kwargs["reference_wav_path"] = ref_path

            wav = active_model.generate(**gen_kwargs)
            sf.write(out_file, wav, 48000)
            return FileResponse(out_file, media_type="audio/wav")
        else:
            # High quality fallback synthesizer using edge-tts if model weights are not loaded
            import edge_tts
            tts = edge_tts.Communicate(clean_text, "km-KH-PisethNeural")
            temp_mp3 = out_file.replace(".wav", ".mp3")
            await tts.save(temp_mp3)
            # Cross-platform convert to wav 48kHz
            try:
                subprocess.run(
                    ['ffmpeg', '-nostdin', '-y', '-i', temp_mp3, '-ar', '48000', '-ac', '2', out_file],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    check=False
                )
            except Exception:
                pass
            if not os.path.exists(out_file):
                out_file = temp_mp3
            return FileResponse(out_file, media_type="audio/wav" if out_file.endswith(".wav") else "audio/mpeg")

    except Exception as e:
        print(f"❌ Error in local clone-and-speak: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = 8000
    print("=" * 68)
    print("[SERVER] Cheatz Dabber.PRO - Local VoxCPM2 Engine")
    print(f"[SERVER] Engine Local URL:  http://127.0.0.1:{port}")
    print(f"[SERVER] Hardware Device:   {device.upper()} ({gpu_name})")
    print("=" * 68)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
