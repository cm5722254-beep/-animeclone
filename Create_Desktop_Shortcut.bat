@echo off
title Create Desktop Shortcut
chcp 65001 > nul
cd /d "%~dp0"

echo ====================================================
echo 🎬 កំពុងបង្កើត Shortcut លើ Desktop របស់អ្នក...
echo ====================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_shortcut.ps1"

echo.
echo ✅ បានបង្កើត Shortcut លើ Desktop ទទួលបានជោគជ័យ!
echo ឥឡូវនេះលោកអ្នកអាចបើក App ពី Desktop បានគ្រប់ពេល។
echo ====================================================
timeout /t 3 > nul
