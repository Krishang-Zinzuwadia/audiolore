
import os
from typing import Generator, Any
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

# Initialize Client
client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# Voice Mapping (Hardcoded for now, could be dynamic)
VOICE_MAP = {
    "narrator": "TxGEqnHWrfWFTfGW9XjX",  # Standard narrator (Josh)
    "santiago": "2EiwWnXFnvU5JabPnv8n",  # Boy (Clyde)
    "king": "SOYHLrjzK2X1ezoPC6cr"       # Old Man
}

def stream_audio_for_script(script: Any) -> Generator[bytes, None, None]:
    """
    Generates audio for the given script.
    Yields MP3 bytes chunks immediately as they are generated.
    """
    # Assuming script is a Pydantic model or Dict. Let's support Dict for flexibility/JSON compat
    lines = script.get("lines", []) if isinstance(script, dict) else script.lines

    for line in lines:
        speaker_key = line.get("speaker", "narrator") if isinstance(line, dict) else line.speaker
        text = line.get("text", "") if isinstance(line, dict) else line.text
        
        # Determine Voice ID (Fallback to narrator)
        # Simple fuzzy matching or direct key lookup?
        # Let's clean the speaker string just in case: "the old man" -> "king" mapping logic might belong in Brain?
        # For now, let's assume the Brain returns keys like "the old man" and we map loosely,
        # OR we just use narrator for unknown.
        
        voice_id = VOICE_MAP.get("narrator")
        if "boy" in speaker_key.lower():
             voice_id = VOICE_MAP["santiago"]
        elif "old man" in speaker_key.lower() or "king" in speaker_key.lower():
             voice_id = VOICE_MAP["king"]
             
        # Stream from ElevenLabs
        # model_id="eleven_turbo_v2_5" is fast and cheap
        audio_stream = client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_turbo_v2_5"
        )
        
        for chunk in audio_stream:
            yield chunk
