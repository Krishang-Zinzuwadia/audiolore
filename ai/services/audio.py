
import os
from typing import Generator, Any
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from ai.services.store import get_or_assign_voice, SPEAKER_REGISTRY

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

def stream_audio_for_script(script: Any, book_id: str) -> Generator[bytes, None, None]:
    """
    Generates audio for the given script.
    Yields MP3 bytes chunks immediately as they are generated.
    """
    # script is likely the AudioScript Pydantic model
    # Convert to dict if needed, or access attributes
    
    characters = getattr(script, "characters", [])
    lines = getattr(script, "lines", [])
    
    # If script is a dict
    if isinstance(script, dict):
        characters = script.get("characters", [])
        lines = script.get("lines", [])

    print(f"DEBUG: Audio Stream requested for Book {book_id}. Lines: {len(lines)}")
    
    # 1. Pre-Cast Characters
    # Ensure every character in this chunk has an assigned voice
    for char_profile in characters:
        # If char_profile is dict, convert to object or handle in store?
        # Store expects object likely. Let's assume Pydantic for now
        # If it's a dict, we might need a little helper.
        # But get_transcript returns the Pydantic model directly to main, and save_script saves it.
        # So `script` here should be the Pydantic model from the cache.
        get_or_assign_voice(book_id, char_profile)

    # 2. Stream Lines
    for line in lines:
        speaker_name = line.speaker if not isinstance(line, dict) else line.get("speaker")
        text = line.text if not isinstance(line, dict) else line.get("text")
        
        print(f"DEBUG: Generating line for {speaker_name}: {text[:20]}...")

        # Resolve Voice ID
        voice_id = "TxGEqnHWrfWFTfGW9XjX" # Default Narrator
        
        if speaker_name.lower() == "narrator":
             voice_id = "TxGEqnHWrfWFTfGW9XjX"
        else:
            # Look up in Registry
             registry = SPEAKER_REGISTRY.get(book_id, {})
             if speaker_name in registry:
                 voice_id = registry[speaker_name]
             else:
                 print(f"WARN: Speaker '{speaker_name}' not found in registry (maybe 'narrator' implied?). Using Default.")
                 
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
            raise e
