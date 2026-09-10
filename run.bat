@echo off
title AI Voice Clone & Dubbing Studio (Python FastAPI)
chcp 65001 > nul
cd /d "%~dp0"

echo ====================================================
echo 🎬 កំពុងចាប់ផ្តើម AI Voice Clone & Dubbing Studio (Python)
echo ====================================================

if not exist ".venv\Scripts\python.exe" (
    echo [INFO] កំពុងដំឡើង Virtual Environment លើកដំបូង...
    uv venv .venv --python 3.12
    .venv\Scripts\pip install -r requirements.txt
)

echo [INFO] បើកដំណើរការ Server លើ http://localhost:3000 ...
.venv\Scripts\python.exe server.py
pause
