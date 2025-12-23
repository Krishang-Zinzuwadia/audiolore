import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import stream

load_dotenv()

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# 1. Pick your Voice IDs (Get these from ElevenLabs "Voice Lab")
VOICE_MAP = {
    "narrator": "TxGEqnHWrfWFTfGW9XjX",  # Standard narrator (e.g., Josh)
    "santiago": "2EiwWnXFnvU5JabPnv8n",  # Young male (e.g., Clyde)
    "king": "SOYHLrjzK2X1ezoPC6cr"       # Old male
}

# 2. Mock Data (The output from Step 1)
script = [
    {"speaker": "king", "text": "Why do you tend sheep?"},
    {"speaker": "narrator", "text": "asked the old man."},
    {"speaker": "santiago", "text": "Because I like to travel."}
]

# 3. The Loop (Generates audio one by one)
def generate_audio_stream():
    for line in script:
        speaker_key = line["speaker"]
        # Fallback to narrator if Gemini invents a new character
        voice_id = VOICE_MAP.get(speaker_key, VOICE_MAP["narrator"])
        
        print(f"Generating audio for: {speaker_key}...")
        
        audio_stream = client.text_to_speech.convert(
            text=line["text"],
            voice_id=voice_id,
            model_id="eleven_turbo_v2_5"
        )
        
        # Save to file instead of playing (requires mpv)
        filename = f"output_{speaker_key}.mp3"
        with open(filename, "wb") as f:
            for chunk in audio_stream:
                f.write(chunk)
        print(f"Saved audio to {filename}")

if __name__ == "__main__":
    generate_audio_stream()