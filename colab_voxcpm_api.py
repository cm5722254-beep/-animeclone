# ==============================================================================
# 🚀 VoxCPM2 - Khmer Zero-Shot Voice Cloning API (Cloudflare Tunnel - Threaded)
# ==============================================================================

!wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
!dpkg -i cloudflared-linux-amd64.deb

import os
import sys
import time
import re
import subprocess
import threading

sys.path.insert(0, "/content/VoxCPM/src")
sys.path.insert(0, "/content/VoxCPM")

import torch
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import voxcpm

print("📥 ផ្ទុកម៉ូដែល VoxCPM2...")
# បើ model មានក្នុង memory រួចហើយ មិនបាច់ reload ទេ
if 'model' not in globals() or model is None:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device, optimize=True)
    print(f"✅ VoxCPM2 Model Ready on {device}!")
else:
    print("✅ VoxCPM2 Model is already in memory!")

app = FastAPI(title="VoxCPM2 Khmer Voice API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

os.makedirs("/content/uploads", exist_ok=True)
os.makedirs("/content/outputs", exist_ok=True)

@app.get("/")
def home():
    return {"status": "ok", "model": "VoxCPM2", "service": "Khmer Voice Cloning API"}

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
            with open(ref_path, "wb") as f:
                f.write(await reference_audio.read())

        gen_kwargs = {
            "text": text.strip(),
            "cfg_value": cfg_value,
            "inference_timesteps": timesteps,
            "normalize": True,
            "denoise": True
        }
        if ref_path:
            gen_kwargs["reference_wav_path"] = ref_path

        wav = model.generate(**gen_kwargs)
        out_file = os.path.join("/content/outputs", f"out_{torch.randint(1000, 9999, (1,)).item()}.wav")
        sf.write(out_file, wav, 48000)
        return FileResponse(out_file, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# បើក Uvicorn Server ក្នុង Thread ដាច់ដោយឡែក (គ្មានជម្លោះ event loop)
config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="warning")
server = uvicorn.Server(config)
server_thread = threading.Thread(target=server.run, daemon=True)
server_thread.start()
time.sleep(2)

# បើក Cloudflare Public Tunnel
print("🌐 កំពុងបើក Cloudflare Public Tunnel...")
cf_proc = subprocess.Popen(["cloudflared", "tunnel", "--url", "http://127.0.0.1:8000"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

public_url = None
for _ in range(60):
    line = cf_proc.stdout.readline()
    match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
    if match:
        public_url = match.group(0)
        break
    time.sleep(0.1)

print("=" * 65)
print(f"🎉 VOXCPM2 API PUBLIC URL: {public_url}")
print("👉 Copy URL នេះយកទៅដាក់ក្នុង Web Studio នៅលើកុំព្យូទ័ររបស់អ្នក!")
print("=" * 65)

# រក្សាទុក Server ឱ្យរត់រហូត
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Server stopped.")
