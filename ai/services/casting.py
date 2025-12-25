
import math
from typing import List, Optional
from ai.services.voice_pool import VoiceProfile, get_all_voices
# Import CharacterProfile from director to type hint, but be careful of circular imports
# We will just accept the pydantic object or a dict.

def calculate_distance(target, candidate: VoiceProfile) -> float:
    """
    Calculates Weighted Euclidean Distance between target CharacterProfile and candidate VoiceProfile.
    Attributes: gender, age, pitch, tempo, volume, roughness.
    """
    
    # Weights configuration
    W_GENDER = 5.0
    W_AGE = 2.0
    W_PITCH = 3.0
    W_ROUGHNESS = 2.0
    W_TEMPO = 1.0
    W_VOLUME = 1.0
    
    # Extract candidate values
    # (Assuming target is the Pydantic CharacterProfile object)
    
    # Difference squared
    d_gender = (target.gender - candidate.gender) ** 2
    d_age = (target.age - candidate.age) ** 2
    d_pitch = (target.pitch - candidate.pitch) ** 2
    d_tempo = (target.tempo - candidate.tempo) ** 2
    d_volume = (target.volume - candidate.volume) ** 2
    d_roughness = (target.roughness - candidate.roughness) ** 2
    
    # Weighted Sum
    weighted_sum = (
        (d_gender * W_GENDER) +
        (d_age * W_AGE) +
        (d_pitch * W_PITCH) +
        (d_roughness * W_ROUGHNESS) +
        (d_tempo * W_TEMPO) +
        (d_volume * W_VOLUME)
    )
    
    return math.sqrt(weighted_sum)

def find_best_voice(character_profile) -> str:
    """
    Finds the best Voice ID for a given CharacterProfile.
    """
    pool = get_all_voices()
    
    # 1. Accent Filter (Optional Strictness)
    # If the character says "British", prefer British voices.
    # Logic: If we have voices matching the accent, filter down to them.
    if character_profile.accent:
        tgt_accent = character_profile.accent.lower()
        same_accent_voices = [v for v in pool if v.accent.lower() in tgt_accent or tgt_accent in v.accent.lower()]
        
        if same_accent_voices:
            pool = same_accent_voices
    
    # 2. Weighted Distance
    best_voice = None
    min_distance = float('inf')
    
    for voice in pool:
        dist = calculate_distance(character_profile, voice)
        print(f"DEBUG: Distance {character_profile.name} <-> {voice.name}: {dist:.4f}")
        
        if dist < min_distance:
            min_distance = dist
            best_voice = voice
            
    if best_voice:
        print(f"CASTING: Assigned {best_voice.name} to {character_profile.name} (Dist: {min_distance:.4f})")
        return best_voice.id
    
    # Fallback (Should typically be impossible if pool is non-empty)
    return "TxGEqnHWrfWFTfGW9XjX" # Narrator
