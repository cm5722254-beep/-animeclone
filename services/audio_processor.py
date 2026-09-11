import os
import subprocess
import math

# Automatically ensure FFmpeg paths are in PATH (cross-platform Windows & macOS)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRA_PATHS = [
    os.path.join(BASE_DIR, 'bin'),
    '/opt/homebrew/bin',      # Apple Silicon Mac (M1/M2/M3/M4) Homebrew
    '/usr/local/bin',          # Intel Mac Homebrew & standard UNIX tools
    '/opt/local/bin',          # MacPorts
]
for p in EXTRA_PATHS:
    if os.path.exists(p) and p not in os.environ.get('PATH', ''):
        os.environ['PATH'] = p + os.pathsep + os.environ.get('PATH', '')


def run_command(cmd: str):
    """Run shell command synchronously using subprocess."""
    process = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if process.returncode != 0:
        raise RuntimeError(f"Command failed: {cmd}\nError: {process.stderr}")
    return process.stdout.strip()

def get_media_duration(file_path: str) -> float:
    """Get media file duration in seconds using ffprobe."""
    try:
        cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{file_path}"'
        out = run_command(cmd)
        duration = float(out)
        return 0.0 if math.isnan(duration) else duration
    except Exception:
        return 0.0

def extract_audio(video_path: str, output_audio_path: str):
    """Extract audio track from video as high quality MP3."""
    cmd = f'ffmpeg -nostdin -y -i "{video_path}" -vn -ar 44100 -ac 2 -b:a 192k "{output_audio_path}"'
    run_command(cmd)
    return output_audio_path

def mix_vocals_with_original(original_audio_path: str, dubbed_audio_path: str, output_path: str, vocal_gain: float = 2.2, bgm_gain: float = 0.85):
    """
    Mix new dubbed vocals with the original audio:
    - Cancels center-channel original foreign speech (vocal suppression via stereotools mlev + vocal EQ notch)
    - Preserves low bass (kick, cello, sub) and wide stereo background music (BGM) at full normal richness
    - Deeply ducks original audio during Khmer speech (broadcast sidechain ducking ratio 16)
    - Boosts dubbed Khmer human voice to crystal-clear studio loudness (vocal_gain 2.2)
    - Pads vocal track with apad so full movie duration is preserved 100%
    """
    total_duration = get_media_duration(original_audio_path)
    pad_dur = max(1, math.ceil(total_duration))

    advanced_bgm_filter = (
        f"[0:a]apad=whole_dur={pad_dur},volume={vocal_gain},alimiter=limit=0.95[khmer_vox];"
        f"[1:a]asplit=2[low_b][mid_high];"
        f"[low_b]lowpass=f=260,volume={bgm_gain}[bass];"
        f"[mid_high]stereotools=mlev=0.015625:slev=1.35,highpass=f=240,equalizer=f=1100:width_type=o:w=2.2:g=-16,volume={bgm_gain}[bgm_sides];"
        f"[bass][bgm_sides]amix=inputs=2:dropout_transition=0[clean_bgm];"
        f"[clean_bgm][khmer_vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];"
        f"[khmer_vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0"
    )

    cmd = f'ffmpeg -nostdin -y -i "{dubbed_audio_path}" -i "{original_audio_path}" -filter_complex "{advanced_bgm_filter}" -c:a libmp3lame -b:a 192k "{output_path}"'

    try:
        run_command(cmd)
        return output_path
    except Exception as err:
        fallback_filter = (
            f"[0:a]apad=whole_dur={pad_dur},volume={vocal_gain},alimiter=limit=0.95[khmer_vox];"
            f"[1:a]pan=stereo|c0=c0-c1|c1=c1-c0,equalizer=f=1100:width_type=o:w=2.2:g=-16,volume={bgm_gain}[bgm_clean];"
            f"[bgm_clean][khmer_vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];"
            f"[khmer_vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0"
        )
        fallback_cmd = f'ffmpeg -nostdin -y -i "{dubbed_audio_path}" -i "{original_audio_path}" -filter_complex "{fallback_filter}" -c:a libmp3lame -b:a 192k "{output_path}"'
        try:
            run_command(fallback_cmd)
            return output_path
        except Exception:
            simple_filter = (
                f"[0:a]apad=whole_dur={pad_dur},volume={vocal_gain},alimiter=limit=0.95[khmer_vox];"
                f"[1:a]volume={bgm_gain * 0.7}[bgm_clean];"
                f"[bgm_clean][khmer_vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];"
                f"[khmer_vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0"
            )
            simple_cmd = f'ffmpeg -nostdin -y -i "{dubbed_audio_path}" -i "{original_audio_path}" -filter_complex "{simple_filter}" -c:a libmp3lame -b:a 192k "{output_path}"'
            run_command(simple_cmd)
            return output_path

def merge_video_audio(video_path: str, audio_path: str, output_video_path: str):
    """
    Combine original video with the new dubbed audio track.
    Fast stream copy without re-encoding, preserving 100% video length.
    """
    cmd = f'ffmpeg -nostdin -y -i "{video_path}" -i "{audio_path}" -c:v copy -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -movflags +faststart "{output_video_path}"'
    run_command(cmd)
    return output_video_path

def remix_audio_with_effects(original_audio_path: str, dubbed_audio_path: str, output_path: str, options: dict = None):
    """Advanced audio remixer with Normal BGM Preservation & Center Vocal Cancellation."""
    options = options or {}
    vocal_gain = options.get('vocalGain', 2.2)
    bgm_gain = options.get('bgmGain', 0.85)
    vocal_suppression = options.get('vocalSuppression', 'medium')
    reverb_preset = options.get('reverbPreset', 'none')

    total_duration = get_media_duration(original_audio_path)
    pad_dur = max(1, math.ceil(total_duration))

    mlev_val = 0.015625
    slev_val = 1.35
    if vocal_suppression == 'mild':
        mlev_val = 0.15
        slev_val = 1.1
    elif vocal_suppression == 'strong':
        mlev_val = 0.015625
        slev_val = 1.5

    reverb_filter = ''
    if reverb_preset == 'imperial':
        reverb_filter = ',aecho=0.8:0.88:60:0.4'
    elif reverb_preset == 'cave':
        reverb_filter = ',aecho=0.8:0.9:120:0.5'
    elif reverb_preset == 'room':
        reverb_filter = ',aecho=0.8:0.8:25:0.25'

    complex_filter = (
        f"[0:a]apad=whole_dur={pad_dur},volume={vocal_gain}{reverb_filter},alimiter=limit=0.95[vox];"
        f"[1:a]asplit=2[low_b][mid_high];"
        f"[low_b]lowpass=f=260,volume={bgm_gain}[bass];"
        f"[mid_high]stereotools=mlev={mlev_val}:slev={slev_val},highpass=f=240,equalizer=f=1100:width_type=o:w=2.2:g=-16,volume={bgm_gain}[bgm_sides];"
        f"[bass][bgm_sides]amix=inputs=2:dropout_transition=0[clean_bgm];"
        f"[clean_bgm][vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];"
        f"[vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0"
    )

    cmd = f'ffmpeg -nostdin -y -i "{dubbed_audio_path}" -i "{original_audio_path}" -filter_complex "{complex_filter}" -c:a libmp3lame -b:a 192k "{output_path}"'
    try:
        run_command(cmd)
        return output_path
    except Exception:
        fallback_filter = (
            f"[0:a]apad=whole_dur={pad_dur},volume={vocal_gain}{reverb_filter},alimiter=limit=0.95[vox];"
            f"[1:a]volume={bgm_gain}[bgm_clean];"
            f"[bgm_clean][vox]sidechaincompress=threshold=0.015:ratio=16:attack=10:release=250[ducked_bgm];"
            f"[vox][ducked_bgm]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0"
        )
        fallback_cmd = f'ffmpeg -nostdin -y -i "{dubbed_audio_path}" -i "{original_audio_path}" -filter_complex "{fallback_filter}" -c:a libmp3lame -b:a 192k "{output_path}"'
        run_command(fallback_cmd)
        return output_path

def tune_audio_pitch_and_speed(input_audio_path: str, output_path: str, speed: float = 1.0, pitch_semitones: int = 0):
    """Adjust voice pitch & speed for precise lip-sync & character tone tuning."""
    clamped_speed = max(0.5, min(2.0, float(speed) if speed else 1.0))
    semitones = max(-12, min(12, int(pitch_semitones) if pitch_semitones else 0))

    audio_filter = ""
    if semitones != 0:
        pitch_factor = 2 ** (semitones / 12.0)
        new_sample_rate = round(44100 * pitch_factor)
        tempo_comp = clamped_speed / pitch_factor

        tempo_filters = []
        rem = tempo_comp
        while rem > 2.0:
            tempo_filters.append("atempo=2.0")
            rem /= 2.0
        while rem < 0.5:
            tempo_filters.append("atempo=0.5")
            rem /= 0.5
        tempo_filters.append(f"atempo={rem:.3f}")
        audio_filter = f'-af "asetrate={new_sample_rate},{",".join(tempo_filters)},aresample=44100"'
    else:
        tempo_filters = []
        rem = clamped_speed
        while rem > 2.0:
            tempo_filters.append("atempo=2.0")
            rem /= 2.0
        while rem < 0.5:
            tempo_filters.append("atempo=0.5")
            rem /= 0.5
        tempo_filters.append(f"atempo={rem:.3f}")
        audio_filter = f'-af "{",".join(tempo_filters)}"'

    cmd = f'ffmpeg -nostdin -y -i "{input_audio_path}" {audio_filter} -ar 44100 -ac 2 "{output_path}"'
    run_command(cmd)
    return output_path

def format_srt_time(seconds: float) -> str:
    total_ms = max(0, round((float(seconds) if seconds else 0.0) * 1000))
    hrs = total_ms // 3600000
    mins = (total_ms % 3600000) // 60000
    secs = (total_ms % 60000) // 1000
    ms = total_ms % 1000
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{ms:03d}"

def create_srt_content(segments: list, options: dict = None) -> str:
    options = options or {}
    dual = options.get('dual', False)
    srt = ""
    count = 1
    for seg in segments:
        start = seg.get('start_time', 0)
        end = seg.get('end_time', start + 2.5)
        khmer_text = (seg.get('khmer') or seg.get('khmer_text') or seg.get('khmer_translation') or '').strip()
        chinese_text = (seg.get('chinese') or seg.get('chinese_text') or '').strip()
        if not khmer_text and not chinese_text:
            continue
        srt += f"{count}\n"
        srt += f"{format_srt_time(start)} --> {format_srt_time(end)}\n"
        if dual and chinese_text and khmer_text:
            srt += f"{khmer_text}\n{chinese_text}\n\n"
        else:
            srt += f"{khmer_text or chinese_text}\n\n"
        count += 1
    return srt

def burn_subtitles_to_video(video_path: str, srt_path: str, output_video_path: str, options: dict = None):
    options = options or {}
    font_size = options.get('fontSize', 20)
    font_color = options.get('fontColor', 'yellow')
    border_style = options.get('borderStyle', 3)
    outline = options.get('outline', 2)

    primary_color_hex = '&H0000FFFF'
    if font_color == 'white':
        primary_color_hex = '&H00FFFFFF'
    elif font_color == 'cyan':
        primary_color_hex = '&H00FFFF00'

    escaped_srt = srt_path.replace('\\', '/').replace(':', '\\:')
    force_style = f"FontSize={font_size},PrimaryColour={primary_color_hex},OutlineColour=&H00000000,BorderStyle={border_style},Outline={outline},MarginV=25"
    cmd = f'ffmpeg -nostdin -y -i "{video_path}" -vf "subtitles=\'{escaped_srt}\':force_style=\'{force_style}\'" -c:v libx264 -preset fast -crf 22 -c:a copy -movflags +faststart "{output_video_path}"'
    run_command(cmd)
    return output_video_path
