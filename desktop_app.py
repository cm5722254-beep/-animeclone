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
BIN_DIR = os.path.join(BASE_DIR, 'bin')
if os.path.exists(BIN_DIR) and BIN_DIR not in os.environ.get('PATH', ''):
    os.environ['PATH'] = BIN_DIR + os.pathsep + os.environ.get('PATH', '')

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

    # 2. Launch Native Windows WebView Desktop Window
    window = webview.create_window(
        title='🎬 AI Voice Clone & Dubbing Studio (Khmer)',
        url='http://127.0.0.1:3000',
        width=1366,
        height=850,
        min_size=(1024, 680),
        text_select=True,
        zoomable=True
    )
    webview.start(gui='edgechromium', debug=False)

if __name__ == '__main__':
    main()
