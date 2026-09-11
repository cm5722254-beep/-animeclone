#!/bin/bash
# ====================================================================
# 🍏 Cheatz Dabber - Local VoxCPM2 Engine for macOS
# 👉 Double-click this file in macOS Finder to start Local Engine!
# ====================================================================

# Navigate to script directory
cd "$(cd "$(dirname "$0")" && pwd)"

# Ensure Homebrew and standard paths are in PATH
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "===================================================================="
echo "🚀 ចាប់ផ្តើម Local VoxCPM2 Engine លើ macOS (Port 8000)"
echo "⚡ គាំទ្រ Apple Silicon GPU (Metal / MPS) ឬ Multi-Core CPU"
echo "===================================================================="

if [ -f ".venv/bin/python" ]; then
    .venv/bin/python local_voxcpm_server.py
else
    python3 local_voxcpm_server.py
fi
