"""
====================================================================
🚀 VoxCPM2 - Khmer Zero-Shot Voice Cloning API Server
👑 Developed by: Telegram @BongCheatz_IT (https://t.me/BongCheatz_IT)
⚡ Powered by OpenBMB VoxCPM2 (2B Parameters, 30 Languages, 48kHz Hi-Fi)
====================================================================
"""

# 1. ដំឡើង Cloudflare Tunnel (បើសិនជាដំណើរការលើ Colab/Linux)
import os
import sys
import time
import re
import subprocess
import threading

if os.path.exists("/content") and not os.path.exists("/usr/local/bin/cloudflared"):
    os.system("wget -q -nc https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb")
    os.system("dpkg -i cloudflared-linux-amd64.deb > /dev/null 2>&1")

sys.path.insert(0, "/content/VoxCPM/src")
sys.path.insert(0, "/content/VoxCPM")

import torch
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

try:
    import voxcpm
except ImportError:
    print("⚠️ កំពុងដំឡើងកញ្ចប់ VoxCPM...")
    os.system("pip install -q -e /content/VoxCPM")
    import voxcpm

print("=" * 65)
print("👑 អ្នកបង្កើត: https://t.me/BongCheatz_IT (@BongCheatz_IT)")
print("📥 កំពុងផ្ទុកម៉ូដែល VoxCPM2 (2B Model Weights)...")
print("=" * 65)

device = "cuda" if torch.cuda.is_available() else "cpu"
if 'model' not in globals() or model is None:
    try:
        model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device, optimize=True)
        print(f"✅ VoxCPM2 Model រួចរាល់លើ {device.upper()} (GPU Memory Loaded)!")
    except Exception as e:
        print(f"⚠️ GPU optimize notice: {e}, ដំណើរការបែប Default...")
        model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device)
        print(f"✅ VoxCPM2 Model រួចរាល់លើ {device.upper()}!")
else:
    print(f"✅ VoxCPM2 Model មានស្រាប់ក្នុង GPU Memory!")

app = FastAPI(title="VoxCPM2 Khmer Voice API - By @BongCheatz_IT")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("/content/uploads", exist_ok=True)
os.makedirs("/content/outputs", exist_ok=True)

@app.get("/")
def home():
    return {
        "status": "ok",
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
            ref_path = os.path.join("/content/uploads", reference_audio.filename)
            content = await reference_audio.read()
            with open(ref_path, "wb") as f:
                f.write(content)

        gen_kwargs = {
            "text": text.strip(),
            "cfg_value": cfg_value,
            "inference_timesteps": timesteps,
            "normalize": True,
            "denoise": True
        }
        if ref_path and os.path.exists(ref_path) and os.path.getsize(ref_path) > 1000:
            gen_kwargs["reference_wav_path"] = ref_path

        wav = model.generate(**gen_kwargs)
        out_file = os.path.join("/content/outputs", f"out_{int(time.time() * 1000)}_{torch.randint(100, 999, (1,)).item()}.wav")
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

# បើក Cloudflare Public Tunnel ដោយសរសេរចូល log file (មិនជាប់គាំង ឬ Hang)
print("🌐 កំពុងបង្កើត Cloudflare Public Tunnel URL...")
log_file_path = "/content/cloudflared.log"
with open(log_file_path, "w") as log_f:
    cf_proc = subprocess.Popen(
        ["cloudflared", "tunnel", "--url", "http://127.0.0.1:8000"],
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
    print("⚠️ Cloudflare ចំណាយពេលយូរជាងធម្មតា។ សូមពិនិត្យមើល /content/cloudflared.log")
print("=" * 68 + "\n")

# Keep alive loop
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n🛑 Server ត្រូវបានបញ្ឈប់។")
