import os
import sys
import shutil
import subprocess
from services import audio_processor

def has_demucs() -> bool:
    """Check if Demucs is installed in Python environment."""
    try:
        import demucs
        return True
    except ImportError:
        return False

def separate_with_demucs(audio_path: str, output_dir: str) -> dict:
    """
    Separate human vocals from background music using Meta Demucs AI (htdemucs).
    Outputs:
      vocals_path: clean isolated dialogue vocals
      bgm_path: clean isolated background music and sound effects
    """
    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(audio_path))[0]

    # Run Demucs CLI in two-stems mode (vocals / no_vocals)
    # Use sys.executable to ensure same Python/virtualenv is used on Windows and macOS
    cmd = f'"{sys.executable}" -m demucs.separate -n htdemucs --two-stems=vocals -o "{output_dir}" "{audio_path}"'
    print(f"Running Meta Demucs AI Vocal Separation on: {audio_path}...")
    audio_processor.run_command(cmd)

    # Demucs saves to: <output_dir>/htdemucs/<base_name>/vocals.wav and no_vocals.wav
    demucs_dir = os.path.join(output_dir, 'htdemucs', base_name)
    vocals_wav = os.path.join(demucs_dir, 'vocals.wav')
    bgm_wav = os.path.join(demucs_dir, 'no_vocals.wav')

    dest_vocals = os.path.join(output_dir, f"{base_name}_ai_vocals.wav")
    dest_bgm = os.path.join(output_dir, f"{base_name}_ai_bgm.wav")

    if os.path.exists(vocals_wav) and os.path.exists(bgm_wav):
        shutil.copyfile(vocals_wav, dest_vocals)
        shutil.copyfile(bgm_wav, dest_bgm)
        return {
            'success': True,
            'engine': 'meta-demucs-ai',
            'vocalsPath': dest_vocals,
            'bgmPath': dest_bgm
        }
    raise RuntimeError("Demucs outputs not found in expected folder")

def separate_with_ffmpeg_fallback(audio_path: str, output_dir: str) -> dict:
    """High-fidelity DSP vocal and BGM separation using FFmpeg filters."""
    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(audio_path))[0]
    dest_vocals = os.path.join(output_dir, f"{base_name}_dsp_vocals.wav")
    dest_bgm = os.path.join(output_dir, f"{base_name}_dsp_bgm.wav")

    # Pure BGM: Bass (<260Hz) + Stereo sides (>240Hz, mlev=0) + Vocal notch (-16dB)
    bgm_filter = (
        "[0:a]asplit=2[low_b][mid_high];"
        "[low_b]lowpass=f=260[bass];"
        "[mid_high]stereotools=mlev=0.015625:slev=1.35,highpass=f=240,equalizer=f=1100:width_type=o:w=2.2:g=-16[bgm_sides];"
        "[bass][bgm_sides]amix=inputs=2:dropout_transition=0"
    )
    audio_processor.run_command(f'ffmpeg -nostdin -y -i "{audio_path}" -filter_complex "{bgm_filter}" -ar 44100 -ac 2 "{dest_bgm}"')

    # Isolated center vocals: Highpass 240Hz, Lowpass 3800Hz, center stereo isolation
    vocal_filter = (
        "stereotools=slev=0.015625:mlev=1.35,highpass=f=240,lowpass=f=3800"
    )
    audio_processor.run_command(f'ffmpeg -nostdin -y -i "{audio_path}" -af "{vocal_filter}" -ar 44100 -ac 2 "{dest_vocals}"')

    return {
        'success': True,
        'engine': 'ffmpeg-dsp',
        'vocalsPath': dest_vocals,
        'bgmPath': dest_bgm
    }

def separate_vocals_and_bgm(audio_path: str, output_dir: str, prefer_ai: bool = True) -> dict:
    """
    Main vocal separation orchestrator:
    Uses Meta Demucs AI if available and prefer_ai is True; otherwise uses clean DSP.
    """
    if prefer_ai and has_demucs():
        try:
            return separate_with_demucs(audio_path, output_dir)
        except Exception as e:
            print(f"Demucs AI notice, using DSP fallback: {e}")
            return separate_with_ffmpeg_fallback(audio_path, output_dir)
    return separate_with_ffmpeg_fallback(audio_path, output_dir)
