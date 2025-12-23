
from typing import List, Optional, Dict

class VoiceProfile:
    def __init__(
        self, 
        id: str, 
        name: str, 
        gender: float, 
        age: float, 
        pitch: float, 
        tempo: float, 
        volume: float, 
        roughness: float, 
        accent: str
    ):
        self.id = id
        self.name = name
        self.gender = gender
        self.age = age
        self.pitch = pitch
        self.tempo = tempo
        self.volume = volume
        self.roughness = roughness
        self.accent = accent

# Hardcoded Pool of ElevenLabs Voices (Approximations)
# In a real app, this would come from a database or API analysis.

VOICE_POOL: List[VoiceProfile] = [
    # --- MALE ---
    VoiceProfile("TxGEqnHWrfWFTfGW9XjX", "Josh (Narrator)", 
                 gender=1.0, age=0.5, pitch=0.5, tempo=0.5, volume=0.5, roughness=0.2, accent="American"),
    
    VoiceProfile("2EiwWnXFnvU5JabPnv8n", "Clyde", 
                 gender=1.0, age=0.4, pitch=0.2, tempo=0.5, volume=0.7, roughness=0.5, accent="American"),
                 
    VoiceProfile("SOYHLrjzK2X1ezoPC6cr", "Harry (Old)", 
                 gender=1.0, age=0.9, pitch=0.3, tempo=0.3, volume=0.5, roughness=0.8, accent="American"),

    VoiceProfile("ODq5zmih8GrVes37Dizj", "Patrick (Deep)", 
                 gender=1.0, age=0.6, pitch=0.1, tempo=0.6, volume=0.8, roughness=0.3, accent="American"),

    # --- FEMALE ---
    VoiceProfile("21m00Tcm4TlvDq8ikWAM", "Rachel", 
                 gender=0.0, age=0.3, pitch=0.8, tempo=0.6, volume=0.5, roughness=0.1, accent="American"),
                 
    VoiceProfile("AZnzlk1XvdvUeBnXmlld", "Domi", 
                 gender=0.0, age=0.2, pitch=0.9, tempo=0.7, volume=0.6, roughness=0.0, accent="American"),

    VoiceProfile("EXAVITQu4vr4xnSDxMaL", "Bella", 
                 gender=0.0, age=0.4, pitch=0.6, tempo=0.5, volume=0.5, roughness=0.2, accent="American"),
                 
    # --- BRITISH ---
    VoiceProfile("ZOrPm3TLptQm7ow60n65", "Charlie (British)", 
                 gender=1.0, age=0.5, pitch=0.5, tempo=0.5, volume=0.5, roughness=0.2, accent="British"),
]

def get_all_voices():
    return VOICE_POOL
