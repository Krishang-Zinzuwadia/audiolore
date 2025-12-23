
from typing import Dict, Any, Optional

# Simple in-memory storage
# Key: f"{book_id}_{cursor}"
# Value: Dict (The JSON Script)
SCRIPT_CACHE: Dict[str, Any] = {}

def save_script(book_id: str, cursor: int, script: Any):
    """Saves the generated script to memory."""
    key = f"{book_id}_{cursor}"
    SCRIPT_CACHE[key] = script
    # TODO: Add TTL or Max Size logic if needed in production

def get_script_from_cache(book_id: str, cursor: int) -> Optional[Any]:
    """Retrieves script from memory. Returns None if not found."""
    return SCRIPT_CACHE.get(f"{book_id}_{cursor}")
