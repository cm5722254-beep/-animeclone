@echo off
chcp 65001 >nul
title 🌐 Cheatz Dubbing Studio - Public Online Host
color 0b

echo ====================================================================
echo 👑 AI Cinema Dubbing Studio (Khmer) - 1-Click Online Hosting
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Check if Node server is already running on port 3000
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/2] 🚀 កំពុងចាប់ផ្ដើម Web Studio Server (Port 3000)...
    start "Cheatz Dubbing Server" cmd /k "node server.js"
    timeout /t 3 >nul
) else (
    echo [1/2] ✅ Web Studio Server កំពុងដំណើរការស្រាប់លើ http://localhost:3000!
)

echo.
echo [2/2] 🌐 កំពុងបង្កើត Public HTTPS Link សម្រាប់ឱ្យអ្នកដទៃចូលប្រើពីក្រៅ...
echo ====================================================================

if exist "%~dp0cloudflared.exe" (
    echo 👉 កំពុងប្រើប្រព័ន្ធ Cloudflare High-Speed Tunnel...
    "%~dp0cloudflared.exe" tunnel --url http://localhost:3000
) else (
    echo 👉 កំពុងបង្កើត Public URL តាមរយៈ Localtunnel...
    npx -y localtunnel --port 3000
)

pause
