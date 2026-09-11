@echo off
title Cheatz Dabber - Local VoxCPM2 Engine (Port 8000)
chcp 65001 > nul
cd /d "%~dp0"

echo ====================================================================
echo 🚀 ចាប់ផ្តើម Local VoxCPM2 Engine លើកុំព្យូទ័រផ្ទាល់ (Port 8000)
echo ====================================================================
echo.

if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe local_voxcpm_server.py
) else (
    python local_voxcpm_server.py
)

pause
