"""
ElevenLabs Cloud Voice Cloning & Synthesis Service (Python)
Zero-GPU Cloud Voice Cloning for Cambodian Khmer & Multi-character Dubbing
"""
import os
import sys
import json
import time
import hashlib
import urllib.request
import urllib.error
from typing import Optional, List, Dict
from dotenv import load_dotenv

load_dotenv(override=False)

ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"


# Curated ElevenLabs high-quality character archetypes for drama/movie dubbing
PREMADE_CHARACTER_VOICES = {
    "male_lead": {"id": "IKne3meq5aSn9XLyUdCD", "name": "Charlie (Male Lead / Confident Hero)", "gender": "male"},
    "male_fierce": {"id": "SOYHLrjzK2X1ezoPC6cr", "name": "Harry (Fierce Warrior / Villain)", "gender": "male"},
    "male_elder": {"id": "JBFqnCBsd6RMkjVDRZzb", "name": "George (Wise Elder / Storyteller)", "gender": "male"},
    "male_casual": {"id": "CwhRBWXzGAHq8TQ4Fs17", "name": "Roger (Casual Resonant / Young Man)", "gender": "male"},
    "male_general": {"id": "N2lVS1w4EtoT3dr4eOWO", "name": "Callum (Husky Commander)", "gender": "male"},
    "female_lead": {"id": "EXAVITQu4vr4xnSDxMaL", "name": "Sarah (Female Lead / Reassuring)", "gender": "female"},
    "female_educator": {"id": "Xb7hH8MSUJpSbSDYk0k2", "name": "Alice (Clear / Elegant Lady)", "gender": "female"},
    "female_child": {"id": "FGY2WhTYpPnrIDTdsKH5", "name": "Laura (Young Girl / Enthusiastic)", "gender": "female"},
    "female_calm": {"id": "SAz9YHcvj6GT2YYXdXww", "name": "River (Relaxed / Gentle Maiden)", "gender": "female"}
}

class ElevenLabsService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY", "")
        self.cache_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.cache_file = os.path.join(self.cache_dir, "elevenlabs_voice_cache.json")
        self._voice_cache = self._load_cache()

    def get_api_key(self) -> str:
        return self.api_key or os.getenv("ELEVENLABS_API_KEY", "")

    def is_configured(self) -> bool:
        k = self.get_api_key()
        return bool(k and len(k) > 15 and not k.startswith("your_"))

    def _load_cache(self) -> dict:
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_cache(self):
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self._voice_cache, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def get_user_info(self) -> dict:
        """Fetch subscription & quota details from ElevenLabs."""
        key = self.get_api_key()
        if not key:
            return {"configured": False, "error": "No API key configured"}

        url = f"{ELEVENLABS_BASE_URL}/user/subscription"
        req = urllib.request.Request(url, headers={"xi-api-key": key})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "configured": True,
                    "status": data.get("status"),
                    "tier": data.get("tier"),
                    "character_count": data.get("character_count", 0),
                    "character_limit": data.get("character_limit", 10000),
                    "remaining": max(0, data.get("character_limit", 10000) - data.get("character_count", 0)),
                    "can_extend": data.get("can_extend_character_limit", False)
                }
        except Exception as e:
            return {"configured": True, "error": str(e)}

    def list_voices(self) -> List[dict]:
        """Fetch all available voices in ElevenLabs account."""
        key = self.get_api_key()
        if not key:
            return []

        url = f"{ELEVENLABS_BASE_URL}/voices"
        req = urllib.request.Request(url, headers={"xi-api-key": key})
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data.get("voices", [])
        except Exception as e:
            print(f"⚠️ ElevenLabs list_voices notice: {e}")
            return []

    def clone_voice(self, voice_name: str, audio_path: str, description: str = "Cheatz Dabber Cloned Voice") -> Optional[str]:
        """
        Instant Voice Clone from an audio sample file using multipart/form-data.
        Returns voice_id if successful, or None on quota error.
        """
        key = self.get_api_key()
        if not key or not os.path.exists(audio_path):
            return None

        # Check local cache first
        cache_key = f"{os.path.basename(audio_path)}_{os.path.getsize(audio_path)}"
        if cache_key in self._voice_cache:
            cached_id = self._voice_cache[cache_key].get("voice_id")
            if cached_id:
                return cached_id

        # Multipart form data construction
        boundary = "----ElevenLabsBoundary" + hashlib.md5(str(time.time()).encode()).hexdigest()
        body_parts = []

        # Name
        body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\n{voice_name}\r\n".encode("utf-8"))
        # Description
        body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"description\"\r\n\r\n{description}\r\n".encode("utf-8"))
        # File
        filename = os.path.basename(audio_path)
        with open(audio_path, "rb") as f:
            file_data = f.read()

        body_parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"files\"; filename=\"{filename}\"\r\nContent-Type: audio/mpeg\r\n\r\n".encode("utf-8")
            + file_data + b"\r\n"
        )
        body_parts.append(f"--{boundary}--\r\n".encode("utf-8"))
        full_body = b"".join(body_parts)

        url = f"{ELEVENLABS_BASE_URL}/voices/add"
        req = urllib.request.Request(
            url,
            data=full_body,
            headers={
                "xi-api-key": key,
                "Content-Type": f"multipart/form-data; boundary={boundary}"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                new_voice_id = res.get("voice_id")
                if new_voice_id:
                    self._voice_cache[cache_key] = {
                        "voice_id": new_voice_id,
                        "name": voice_name,
                        "created_at": time.time()
                    }
                    self._save_cache()
                    print(f"✅ ElevenLabs Instant Voice Clone created: {voice_name} -> {new_voice_id}")
                    return new_voice_id
        except Exception as e:
            print(f"⚠️ ElevenLabs voice clone notice (using archetype voice fallback): {e}")

        return None

    def resolve_voice_for_character(self, reference_audio_path: Optional[str], gender: str = "male", role_key: str = "") -> str:
        """
        Determine the optimal voice_id:
        1. Attempt clone if reference audio given
        2. Fallback to matched high-quality archetype
        """
        if reference_audio_path and os.path.exists(reference_audio_path):
            base_name = os.path.splitext(os.path.basename(reference_audio_path))[0]
            cloned_id = self.clone_voice(f"CD_{base_name[:18]}", reference_audio_path)
            if cloned_id:
                return cloned_id

        # Archetype matching
        is_female = gender.lower() == "female" or "female" in role_key.lower() or "ស្រី" in role_key

        if "child" in role_key.lower() or "ក្មេង" in role_key:
            return PREMADE_CHARACTER_VOICES["female_child"]["id"]
        elif "elder" in role_key.lower() or "old" in role_key.lower() or "តា" in role_key:
            return PREMADE_CHARACTER_VOICES["male_elder"]["id"]
        elif "fierce" in role_key.lower() or "general" in role_key.lower() or "កាច" in role_key:
            return PREMADE_CHARACTER_VOICES["male_fierce"]["id"] if not is_female else PREMADE_CHARACTER_VOICES["female_lead"]["id"]
        elif is_female:
            return PREMADE_CHARACTER_VOICES["female_lead"]["id"]
        else:
            return PREMADE_CHARACTER_VOICES["male_lead"]["id"]

    def text_to_speech(
        self,
        voice_id: str,
        text: str,
        output_path: str,
        stability: float = 0.5,
        similarity_boost: float = 0.85,
        style: float = 0.2
    ) -> bool:
        """
        Synthesize text using Eleven Multilingual v2.
        Saves directly to output_path.
        """
        key = self.get_api_key()
        if not key or not text.strip():
            return False

        url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost,
                "style": style,
                "use_speaker_boost": True
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "xi-api-key": key,
                "Content-Type": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=40) as resp:
                audio_data = resp.read()
                os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(audio_data)
                return os.path.exists(output_path) and os.path.getsize(output_path) > 500
        except Exception as e:
            print(f"⚠️ ElevenLabs TTS API error: {e}")
            return False

# Global singleton
elevenlabs_service = ElevenLabsService()
