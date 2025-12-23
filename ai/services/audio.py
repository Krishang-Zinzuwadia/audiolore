
import os
from typing import Generator, Any
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ELEVENLABS_API_KEY")
if not api_key:
    # Try explicit path (assuming running from root)
    load_dotenv(".env")
    api_key = os.getenv("ELEVENLABS_API_KEY")

if not api_key:
    print("CRITICAL ERROR: ELEVENLABS_API_KEY not found in env!")

# Initialize Client
client = ElevenLabs(api_key=api_key)

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

    print(f"DEBUG: Audio Stream requested. Lines: {len(lines)}")
    for line in lines:
        speaker_key = line.get("speaker", "narrator") if isinstance(line, dict) else line.speaker
        text = line.get("text", "") if isinstance(line, dict) else line.text
        
        print(f"DEBUG: Generating line for {speaker_key}: {text[:20]}...")

        # Determine Voice ID (Fallback to narrator)
        voice_id = VOICE_MAP.get("narrator")
        if "boy" in speaker_key.lower():
             voice_id = VOICE_MAP["santiago"]
        elif "old man" in speaker_key.lower() or "king" in speaker_key.lower():
             voice_id = VOICE_MAP["king"]
             
        try:
            # Stream from ElevenLabs
            audio_stream = client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id="eleven_turbo_v2_5"
            )
            
            for chunk in audio_stream:
                yield chunk
            print(f"DEBUG: Finished line.")
        except Exception as e:
            print(f"ERROR in streaming line: {e}")
            # We should probably re-raise or yield an error frame? 
            # For now just print to see it in logs.
            raise e
