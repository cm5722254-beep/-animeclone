@echo off
title AI Voice Clone & Dubbing Studio (Python FastAPI)
chcp 65001 > nul
cd /d "%~dp0"

echo ====================================================
echo 🎬 កំពុងចាប់ផ្តើម AI Voice Clone & Dubbing Studio (Python)
echo ====================================================

REM 1. Check Python / Virtualenv
if not exist ".venv\Scripts\python.exe" (
    echo [INFO] កំពុងដំឡើង Virtual Environment លើកដំបូង...
    where uv >nul 2>nul
    if %errorlevel% equ 0 (
        uv venv .venv --python 3.12
        .venv\Scripts\pip install -r requirements.txt
    ) else (
        python -m venv .venv
        .venv\Scripts\pip install -r requirements.txt
    )
)

REM 2. Check FFmpeg in bin/ or system PATH
if not exist "bin\ffmpeg.exe" (
    where ffmpeg >nul 2>nul
    if %errorlevel% neq 0 (
        echo [INFO] មិនទាន់មាន FFmpeg នៅឡើយទេ កំពុងទាញយកដោយស្វ័យប្រវត្តិ...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip' -OutFile 'ffmpeg.zip'; Expand-Archive 'ffmpeg.zip' -DestinationPath 'temp_ffmpeg'; mkdir -p bin; Move-Item 'temp_ffmpeg\*\bin\ffmpeg.exe' bin\; Move-Item 'temp_ffmpeg\*\bin\ffprobe.exe' bin\; Remove-Item -Recurse -Force 'temp_ffmpeg', 'ffmpeg.zip';"
    )
)

echo [INFO] បើកដំណើរការ Server លើ http://localhost:3000 ...
start "" "Launch_Studio_App.vbs"
.venv\Scripts\python.exe server.py
