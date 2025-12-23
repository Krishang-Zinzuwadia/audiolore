
from typing import Dict, Any, Optional
from ai.services.casting import find_best_voice

# Simple in-memory storage
# Key: f"{book_id}_{cursor}"
# Value: Dict (The JSON Script)
SCRIPT_CACHE: Dict[str, Any] = {}

# Speaker Registry
# Key: book_id -> { speaker_name: voice_id }
SPEAKER_REGISTRY: Dict[str, Dict[str, str]] = {}

def save_script(book_id: str, cursor: int, script: Any):
    """Saves the generated script to memory."""
    key = f"{book_id}_{cursor}"
    SCRIPT_CACHE[key] = script
    # TODO: Add TTL or Max Size logic if needed in production

def get_script_from_cache(book_id: str, cursor: int) -> Optional[Any]:
    """Retrieves script from memory. Returns None if not found."""
    return SCRIPT_CACHE.get(f"{book_id}_{cursor}")

def get_or_assign_voice(book_id: str, character_profile) -> str:
    """
    Checks if a character (by name) already has a voice assigned for this book.
    If not, uses the Casting Director (Weighted Euclidean) to find the best match
    and persists the reference.
    """
    if book_id not in SPEAKER_REGISTRY:
        SPEAKER_REGISTRY[book_id] = {}
        
    registry = SPEAKER_REGISTRY[book_id]
    name = character_profile.name
    
    # 1. Check existing assignment
    if name in registry:
        return registry[name]
    
    # 2. Cast new character
    print(f"CASTING: New character '{name}' in book '{book_id}'...")
    voice_id = find_best_voice(character_profile)
    
    # 3. Persist
    registry[name] = voice_id
    return voice_id
