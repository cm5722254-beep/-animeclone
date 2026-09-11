# ==============================================================================
# 🎬 AI Video & Anime Khmer Dubbing Studio - All-in-One Colab Launcher
# 👑 ដំណើរការទាំង Web Studio Website + AI GPU Model (VoxCPM2) រួមគ្នា 100% ឥតគិតថ្លៃ!
# ==============================================================================
# ⚠️ របៀបប្រើក្នុង Google Colab (Untitled0.ipynb):
# 1. ចូល Runtime -> Change runtime type -> ជ្រើសរើស T4 GPU -> រួច Save
# 2. បង្កើត Cell មួយ រួច Paste កូដខាងក្រោម ហើយចុច Run:
#
#    !git clone https://github.com/cm5722254-beep/-animeclone.git /content/animeclone 2>/dev/null || (cd /content/animeclone && git pull)
#    %cd /content/animeclone
#    !python colab_all_in_one_studio.py
# ==============================================================================

import os
import sys
import time
import re
import subprocess
import threading

print("=" * 75)
print("👑 AI Cinema Dubbing Studio (Khmer) - All-In-One Web Host")
print("⚡ កំពុងរៀបចំប្រព័ន្ធ & ដំឡើង Packages...")
print("=" * 75)

# 1. Install Cloudflared if not present
if not os.path.exists("/usr/local/bin/cloudflared") and not os.path.exists("/usr/bin/cloudflared"):
    os.system("wget -q -nc https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb")
    os.system("dpkg -i cloudflared-linux-amd64.deb > /dev/null 2>&1")

# 2. Clone VoxCPM if not present
if not os.path.exists("/content/VoxCPM"):
    os.system("git clone https://github.com/OpenBMB/VoxCPM.git /content/VoxCPM")

sys.path.insert(0, "/content/VoxCPM/src")
sys.path.insert(0, "/content/VoxCPM")
sys.path.insert(0, "/content/animeclone")

# 3. Pip dependencies
os.system("pip install -q fastapi uvicorn python-multipart soundfile numpy nest_asyncio einops addict wetext modelscope funasr argbind torchcodec pydub edge-tts google-generativeai requests python-dotenv")
os.system("pip install -q -e /content/VoxCPM")
os.system("apt-get install -y ffmpeg > /dev/null 2>&1")

import torch
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
import uvicorn
import voxcpm

print("\n" + "=" * 75)
print("📥 កំពុងផ្ទុកម៉ូដែល VoxCPM2 ចូលទៅក្នុង GPU (16GB VRAM)...")
print("=" * 75)

device = "cuda" if torch.cuda.is_available() else "cpu"
try:
    model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device, optimize=True)
except Exception:
    model = voxcpm.VoxCPM.from_pretrained("openbmb/VoxCPM2", device=device)

print(f"✅ VoxCPM2 GPU Model រួចរាល់លើ {device.upper()} (GPU Acceleration Active)!\n")

# 4. Start Internal VoxCPM2 API on Port 8000
vox_app = FastAPI(title="VoxCPM2 Internal API")
vox_app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
os.makedirs("/content/uploads", exist_ok=True)
os.makedirs("/content/outputs", exist_ok=True)

@vox_app.get("/")
def v_home():
    return {"status": "ok", "model": "VoxCPM2"}

@vox_app.post("/api/clone-and-speak")
async def v_clone(
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

        kwargs = {
            "text": text.strip(),
            "cfg_value": cfg_value,
            "inference_timesteps": timesteps,
            "normalize": True,
            "denoise": True
        }
        if ref_path:
            kwargs["reference_wav_path"] = ref_path

        wav = await run_in_threadpool(model.generate, **kwargs)
        out_file = os.path.join("/content/outputs", f"out_{torch.randint(1000, 9999, (1,)).item()}.wav")
        sf.write(out_file, wav, 48000)
        return FileResponse(out_file, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

vox_server = uvicorn.Server(uvicorn.Config(vox_app, host="127.0.0.1", port=8000, log_level="warning"))
threading.Thread(target=vox_server.run, daemon=True).start()
time.sleep(2)

# 5. Open Cloudflare Public Website Tunnel for Web Studio (Port 3000)
print("🌐 កំពុងបើក Cloudflare Public Website Tunnel...")
tunnel_cmd = "cloudflared tunnel --url http://localhost:3000"
proc = subprocess.Popen(tunnel_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

def read_tunnel():
    for line in iter(proc.stdout.readline, ""):
        m = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
        if m:
            pub_url = m.group(0)
            print("\n" + "=" * 75)
            print("🎉 ផ្ទាំង WEBSITE STUDIO ONLINE រួចរាល់ ១០០% ហើយ!")
            print("=" * 75)
            print(f"\n👉 ចុចបើក WEBSITE នេះដើម្បីប្រើប្រាស់ផ្ទាល់: {pub_url}\n")
            print("💡 ចំណាំ៖")
            print("   - បើកលើ Browser ណាក៏បាន (ទូរស័ព្ទ, iPad, កុំព្យូទ័រ)")
            print("   - មិនបាច់ Copy/Paste Link អ្វីទាំងអស់ ប្រព័ន្ធតភ្ជាប់ GPU ដោយស្វ័យប្រវត្តិ!")
            print("=" * 75 + "\n")
            break

threading.Thread(target=read_tunnel, daemon=True).start()

# 6. Run Web Studio Backend on Port 3000 (connected to internal port 8000)
os.environ["PORT"] = "3000"
os.environ["VOXCPM_API_URL"] = "http://127.0.0.1:8000"

print("🚀 Web Studio Backend កំពុងដំណើរការ...")
os.system("cd /content/animeclone && python server.py")
