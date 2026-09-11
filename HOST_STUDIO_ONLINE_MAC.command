#!/bin/bash
# ====================================================================
# 🍏 Cheatz Dabber Studio - Public Online Host for macOS
# 👉 Creates a secure public HTTPS link for friends & clients to access!
# ====================================================================

cd "$(cd "$(dirname "$0")" && pwd)"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "===================================================================="
echo "🌐 កំពុងបើកដំណើរការ Public Online Host សម្រាប់ macOS..."
echo "===================================================================="

# Check if studio is running
if ! lsof -i:3000 >/dev/null 2>&1; then
    echo "🚀 កំពុងចាប់ផ្តើម Server លើ Port 3000..."
    .venv/bin/python server.py &
    sleep 2
fi

echo "✅ Server កំពុងដំណើរការស្រាប់លើ Port 3000!"
echo "🌐 កំពុងបង្កើត Link HTTPS ដោយឥតគិតថ្លៃតាម Cloudflare..."
echo "===================================================================="

if command -v cloudflared >/dev/null 2>&1; then
    cloudflared tunnel --url http://localhost:3000
else
    echo "💡 កំពុងទាញយក cloudflared តាម Homebrew ឬប្រើ localtunnel..."
    if command -v brew >/dev/null 2>&1; then
        brew install cloudflared
        cloudflared tunnel --url http://localhost:3000
    else
        npx -y localtunnel --port 3000
    fi
fi
