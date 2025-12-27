
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

# Hardcoded Pool of ElevenLabs Premade Voices
# Updated with verified voice IDs from ElevenLabs (Dec 2024)

VOICE_POOL: List[VoiceProfile] = [
    # --- MALE ---
    # Adam - Deep male narrator
    VoiceProfile("pNInz6obpgDQGcFmaJgB", "Adam (Narrator)", 
                 gender=1.0, age=0.5, pitch=0.3, tempo=0.5, volume=0.6, roughness=0.2, accent="American"),
    
    # Brian - Deep male narrator  
    VoiceProfile("nPczCjzI2devNBz1zQrb", "Brian (Deep)", 
                 gender=1.0, age=0.5, pitch=0.2, tempo=0.5, volume=0.7, roughness=0.3, accent="American"),
    
    # Clyde - War veteran character
    VoiceProfile("2EiwWnXFnvU5JabPnv8n", "Clyde (Gruff)", 
                 gender=1.0, age=0.6, pitch=0.2, tempo=0.4, volume=0.7, roughness=0.6, accent="American"),
    
    # Bill - Strong documentary voice
    VoiceProfile("pqHfZKP75CvOlQylNhV4", "Bill (Strong)", 
                 gender=1.0, age=0.6, pitch=0.3, tempo=0.5, volume=0.8, roughness=0.4, accent="American"),
                 
    # Antoni - Young well-rounded male
    VoiceProfile("ErXwobaYiN019PkySvjV", "Antoni (Young)", 
                 gender=0.8, age=0.3, pitch=0.5, tempo=0.6, volume=0.5, roughness=0.1, accent="American"),

    # --- FEMALE ---
    # Rachel - Standard female
    VoiceProfile("21m00Tcm4TlvDq8ikWAM", "Rachel (Female)", 
                 gender=0.0, age=0.3, pitch=0.7, tempo=0.5, volume=0.5, roughness=0.1, accent="American"),
                 
    # Bella - Soft female
    VoiceProfile("EXAVITQu4vr4xnSDxMaL", "Bella (Soft)", 
                 gender=0.0, age=0.4, pitch=0.6, tempo=0.5, volume=0.4, roughness=0.1, accent="American"),
    
    # Charlotte - Seductive/confident
    VoiceProfile("XB0fDUnXU5powFXDhCwa", "Charlotte (Confident)", 
                 gender=0.1, age=0.4, pitch=0.5, tempo=0.5, volume=0.6, roughness=0.2, accent="British"),
                 
    # --- BRITISH ---
    # Daniel - British news presenter
    VoiceProfile("onwK4e9ZLuTAKqWW03F9", "Daniel (British)", 
                 gender=1.0, age=0.5, pitch=0.4, tempo=0.5, volume=0.6, roughness=0.2, accent="British"),
    
    # Alice - British confident female
    VoiceProfile("Xb7hH8MSUJpSbSDYk0k2", "Alice (British)", 
                 gender=0.0, age=0.4, pitch=0.6, tempo=0.5, volume=0.6, roughness=0.1, accent="British"),
]

def get_all_voices():
    return VOICE_POOL
