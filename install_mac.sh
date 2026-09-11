#!/bin/bash
# ====================================================================
# 🍏 Cheatz Dabber AI Voice Clone & Dubbing Studio - macOS Installer
# ====================================================================

set -e

# Change directory to project root
cd "$(cd "$(dirname "$0")" && pwd)"

echo "===================================================================="
echo "🎬 កំពុងដំឡើង AI Voice Clone & Dubbing Studio សម្រាប់ macOS..."
echo "===================================================================="

# 1. Ensure Homebrew and standard paths are in PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# 2. Check Python 3
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo "❌ មិនមាន Python 3 នៅលើម៉ាស៊ីន macOS នេះទេ។"
    echo "💡 សូមដំឡើង Python 3 តាមរយៈ https://www.python.org/ ឬប្រើពាក្យបញ្ជា: brew install python"
    exit 1
fi

echo "✅ រកឃើញ Python: $($PYTHON_CMD --version)"

# 3. Check FFmpeg (Homebrew or system)
if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "⚠️ មិនទាន់រកឃើញ FFmpeg នៅលើ macOS ទេ។"
    if command -v brew >/dev/null 2>&1; then
        echo "📥 កំពុងដំឡើង FFmpeg ដោយស្វ័យប្រវត្តិតាមរយៈ Homebrew..."
        brew install ffmpeg
    else
        echo "💡 សូមដំឡើង Homebrew (https://brew.sh) រួចដំណើរការ: brew install ffmpeg"
    fi
else
    echo "✅ រកឃើញ FFmpeg: $(which ffmpeg)"
fi

# 4. Create Virtual Environment (.venv)
if [ ! -f ".venv/bin/python" ]; then
    echo "📦 កំពុងបង្កើត Virtual Environment (.venv)..."
    $PYTHON_CMD -m venv .venv
fi

# 5. Install Dependencies
echo "📥 កំពុងដំឡើង / ធ្វើបច្ចុប្បន្នភាព Python Packages (requirements.txt)..."
.venv/bin/python -m pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

# 6. Make launcher scripts executable
chmod +x START_STUDIO_MAC.command 2>/dev/null || true
chmod +x START_LOCAL_VOXCPM_MAC.command 2>/dev/null || true
chmod +x run_mac.sh 2>/dev/null || true

echo "===================================================================="
echo "🎉 ការដំឡើងបានជោគជ័យ ១០០%! (Installation Complete)"
echo "👉 អ្នកអាចចុច Double-Click លើ START_STUDIO_MAC.command ដើម្បីបើកកម្មវិធី"
echo "===================================================================="
