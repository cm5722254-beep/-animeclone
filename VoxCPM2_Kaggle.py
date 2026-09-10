"""
====================================================================
🚀 VoxCPM2 - Khmer Zero-Shot Voice Cloning on Kaggle GPU
👑 Developed by: Telegram @BongCheatz_IT (https://t.me/BongCheatz_IT)
⚡ Powered by OpenBMB VoxCPM2 (2B Parameters, 48kHz Hi-Fi)
====================================================
ចំណាំសំខាន់លើ Kaggle (នៅផ្ទាំងខាងស្ដាំដៃ):
1. Accelerator: ជ្រើសរើស GPU T4 x2 (ឬ P100)
2. Internet: បើកទៅជា ON (ចាំបាច់បំផុត)
====================================================
"""

import os
import sys
import time
import re
import subprocess
import threading

# 1. ទាញយក cloudflared binary ផ្ទាល់លើ Kaggle
os.chdir("/kaggle/working")
if not os.path.exists("/kaggle/working/cloudflared"):
    print("📥 កំពុងដំឡើង Cloudflare Tunnel...")
    os.system("wget -q -nc https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /kaggle/working/cloudflared")
    os.system("chmod +x /kaggle/working/cloudflared")

# 2. Clone និងដំឡើង VoxCPM2
if not os.path.exists("/kaggle/working/VoxCPM"):
    print("📥 កំពុង Clone និងដំឡើង VoxCPM2...")
    os.system("git clone https://github.com/OpenBMB/VoxCPM.git /kaggle/working/VoxCPM")
    os.system("pip install -q fastapi uvicorn python-multipart soundfile numpy nest_asyncio")
    os.system("pip install -q einops addict wetext modelscope funasr argbind torchcodec")
    os.system("pip install -q -e /kaggle/working/VoxCPM")

sys.path.insert(0, "/kaggle/working/VoxCPM/src")
sys.path.insert(0, "/kaggle/working/VoxCPM")

import torch
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import voxcpm

print("=" * 68)
print("👑 អ្នកបង្កើត: https://t.me/BongCheatz_IT (@BongCheatz_IT)")
print("📥 កំពុងផ្ទុកម៉ូដែល VoxCPM2 ចូលទៅក្នុង GPU (16GB VRAM)...")
print("=" * 68)

device = "cuda" if torch.cuda.is_available() else "cpu"
try:
    model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device, optimize=True)
    print(f"✅ VoxCPM2 Model រួចរាល់លើ {device.upper()} (GPU Memory Loaded)!")
except Exception as e:
    print(f"⚠️ GPU optimize notice: {e}, ដំណើរការបែប Default...")
    model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device)
    print(f"✅ VoxCPM2 Model រួចរាល់លើ {device.upper()}!")

app = FastAPI(title="VoxCPM2 Khmer Voice API - Kaggle Edition")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("/kaggle/working/uploads", exist_ok=True)
os.makedirs("/kaggle/working/outputs", exist_ok=True)

@app.get("/")
def home():
    return {
        "status": "ok",
        "platform": "Kaggle GPU",
        "model": "VoxCPM2",
        "developer": "https://t.me/BongCheatz_IT",
        "service": "Khmer Zero-Shot Voice Cloning API",
        "device": device
    }

@app.post("/api/clone-and-speak")
async def clone_and_speak(
    text: str = Form(...),
    reference_audio: UploadFile = File(None),
    timesteps: int = Form(10),
    cfg_value: float = Form(2.0)
):
    try:
        ref_path = None
        if reference_audio and reference_audio.filename:
            ref_path = os.path.join("/kaggle/working/uploads", reference_audio.filename)
            content = await reference_audio.read()
            with open(ref_path, "wb") as f:
                f.write(content)

        # Filter all Thai characters completely
        clean_text = re.sub(r'[\u0E00-\u0E7F]+', '', text).strip()
        if not clean_text:
            clean_text = "បាទ"

        gen_kwargs = {
            "text": clean_text,
            "cfg_value": cfg_value,
            "inference_timesteps": timesteps,
            "normalize": True,
            "denoise": True
        }
        if ref_path and os.path.exists(ref_path) and os.path.getsize(ref_path) > 1000:
            gen_kwargs["reference_wav_path"] = ref_path

        wav = model.generate(**gen_kwargs)
        out_file = os.path.join("/kaggle/working/outputs", f"out_{int(time.time() * 1000)}_{torch.randint(100, 999, (1,)).item()}.wav")
        sf.write(out_file, wav, 48000)
        return FileResponse(out_file, media_type="audio/wav")
    except Exception as e:
        print(f"❌ Error generating voice: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ដំណើរការ FastAPI Server ក្នុង Background
def run_api_server():
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="warning")
    server = uvicorn.Server(config)
    server.run()

server_thread = threading.Thread(target=run_api_server, daemon=True)
server_thread.start()
time.sleep(3)

# បើក Cloudflare Public Tunnel
print("🌐 កំពុងបង្កើត Cloudflare Public Tunnel URL...")
log_file_path = "/kaggle/working/cloudflared.log"
with open(log_file_path, "w") as log_f:
    cf_proc = subprocess.Popen(
        ["/kaggle/working/cloudflared", "tunnel", "--url", "http://127.0.0.1:8000"],
        stdout=log_f,
        stderr=log_f,
        text=True
    )

public_url = None
for attempt in range(60):
    time.sleep(0.5)
    if os.path.exists(log_file_path):
        with open(log_file_path, "r", encoding="utf-8", errors="ignore") as f:
            logs = f.read()
            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", logs)
            if match:
                public_url = match.group(0)
                break

print("\n" + "=" * 68)
print("👑 AI Voice Clone Studio (Khmer) - Telegram: @BongCheatz_IT")
print("=" * 68)
if public_url:
    print(f"🎉 VOXCPM2 API PUBLIC URL: {public_url}")
    print("\n👉 សូមចម្លង (Copy) Link ខាងលើនេះ ទៅដាក់ក្នុង:")
    print("   Web Studio ➔ ចុចប៊ូតុង 'ការកំណត់' (Settings) ➔ ប្រអប់ 'VoxCPM2 Server URL'")
else:
    print("⚠️ Cloudflare កំពុងដំណើរការ... សូមពិនិត្យមើល /kaggle/working/cloudflared.log")
print("=" * 68 + "\n")

# រក្សា Server ឱ្យរត់រហូត
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n🛑 Server ត្រូវបានបញ្ឈប់។")
