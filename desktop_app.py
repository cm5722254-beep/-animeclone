import os
import sys
import time
import threading
import uvicorn
import webview

# Ensure UTF-8 output encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXTRA_PATHS = [
    os.path.join(BASE_DIR, 'bin'),
    '/opt/homebrew/bin',      # Apple Silicon Mac Homebrew
    '/usr/local/bin',          # Intel Mac Homebrew & standard UNIX tools
    '/opt/local/bin',          # MacPorts
]
for p in EXTRA_PATHS:
    if os.path.exists(p) and p not in os.environ.get('PATH', ''):
        os.environ['PATH'] = p + os.pathsep + os.environ.get('PATH', '')

from server import app

def start_server():
    """Run FastAPI server in a background thread."""
    uvicorn.run(app, host="127.0.0.1", port=3000, log_level="warning")

def main():
    # 1. Start FastAPI server thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to bind
    time.sleep(1.2)

    # 2. Launch Native Desktop Window (Windows Edge WebView2 or macOS Cocoa WebKit)
    window = webview.create_window(
        title='🎬 AI Voice Clone & Dubbing Studio (Khmer)',
        url='http://127.0.0.1:3000',
        width=1366,
        height=850,
        min_size=(1024, 680),
        text_select=True,
        zoomable=True
    )
    if sys.platform == 'win32':
        webview.start(gui='edgechromium', debug=False)
    else:
        webview.start(debug=False)

if __name__ == '__main__':
    main()
