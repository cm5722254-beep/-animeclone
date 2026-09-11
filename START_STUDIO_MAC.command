#!/bin/bash
# ====================================================================
# 🍏 Cheatz Dabber AI Voice Clone & Dubbing Studio - macOS Launcher
# 👉 Double-click this file in macOS Finder to start the Studio!
# ====================================================================

# Navigate to script directory
cd "$(cd "$(dirname "$0")" && pwd)"

# Ensure Homebrew and standard paths are in PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "===================================================================="
echo "🎬 ចាប់ផ្តើម AI Voice Clone & Dubbing Studio (macOS)"
echo "===================================================================="

# Check if environment is prepared
if [ ! -f ".venv/bin/python" ]; then
    echo "⚙️ រកមិនឃើញ .venv, កំពុងដំណើរការការដំឡើងស្វ័យប្រវត្តិ..."
    bash install_mac.sh
fi

# Check if FFmpeg is available
if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "⚠️ FFmpeg មិនទាន់មានក្នុង PATH ទេ។"
    if command -v brew >/dev/null 2>&1; then
        echo "📥 កំពុងដំឡើង FFmpeg តាម Homebrew..."
        brew install ffmpeg
    fi
fi

# Open Browser window in background after 1.5s
(
    sleep 1.5
    # Try Chrome standalone app mode if Chrome is installed
    if [ -d "/Applications/Google Chrome.app" ]; then
        open -na "Google Chrome" --args --app=http://localhost:3000 --window-size=1366,850
    else
        open "http://localhost:3000"
    fi
) &

echo "🚀 កំពុងដំណើរការ Web Server លើ http://localhost:3000 ..."
echo "💡 ចុច Ctrl+C ដើម្បីបិទ Server"
echo "===================================================================="

.venv/bin/python server.py
