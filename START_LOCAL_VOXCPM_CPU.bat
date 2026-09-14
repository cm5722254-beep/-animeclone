@echo off
title Cheatz Dabber - Local VoxCPM2 Engine (CPU Mode)
chcp 65001 > nul
cd /d "%~dp0"

echo ====================================================================
echo 🚀 ចាប់ផ្តើម Local VoxCPM2 Engine ដោយប្រើ CPU កុំព្យូទ័រ (Port 8000)
echo 💻 CPU Mode: Active (Multi-threaded processing)
echo ====================================================================
echo.

set FORCE_CPU=1

if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe local_voxcpm_server.py --cpu
) else (
    python local_voxcpm_server.py --cpu
)

pause
