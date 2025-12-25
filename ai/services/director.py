
import os
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

# Configure API Key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# --- Data Models ---

class CharacterProfile(BaseModel):
    name: str = Field(description="Standardized name of the character")
    gender: float = Field(description="0.0 (High Fem) - 0.5 (Androgynous) - 1.0 (Deep Masc)")
    age: float = Field(description="0.0 (Child) - 1.0 (Elder)")
    pitch: float = Field(description="0.0 (Deep/Bass) - 1.0 (High/Squeaky)")
    tempo: float = Field(description="0.0 (Slow/Lethargic) - 1.0 (Fast/Manic)")
    volume: float = Field(description="0.0 (Soft/Whisper) - 1.0 (Loud/Booming)")
    roughness: float = Field(description="0.0 (Smooth/Silk) - 1.0 (Rough/Gravelly)")
    accent: Optional[str] = Field(description="e.g., 'British', 'American', 'Southern', 'French'. Null if neutral.")

class DialogueLine(BaseModel):
    speaker: str = Field(description="Name of the speaker. 'narrator' for description.")
    text: str

class AudioScript(BaseModel):
    characters: List[CharacterProfile] = Field(description="List of all characters appearing in this text chunk (excluding narrator)")
    lines: List[DialogueLine]

# Initialize Model
model = genai.GenerativeModel("gemini-flash-latest", 
    generation_config={"response_mime_type": "application/json", "response_schema": AudioScript}
)

def get_script(text: str) -> AudioScript:
    """
    Takes raw book text and converts it into a structured AudioScript.
    """
    prompt = f"""
    You are an Audiobook Casting Director. 
    
    1. **Analyze Characters**: Identify every speaking character. Create a detailed voice profile for them.
       - **Gender Scale**: 0.0 (High Fem) <--> 0.5 (Androgynous) <--> 1.0 (Deep Masc)
       - **Roughness**: 0.0 (Pure/Clear) <--> 1.0 (Raspy/Gravelly)
       - **Consistency**: Use the EXACT SAME standardized name for a character across chunks. 
       - If you see "The boy", and you know it's "Santiago", use "Santiago".
       
    2. **Create Script**: Split the text into dialogue lines.
       - Speaker: Use the standardized name. 'narrator' for non-dialogue.
       - Text: KEEP EXACTLY AS WRITTEN. Do not change a single word.
    
    Text:
    {text}
    """
    
    response = model.generate_content(prompt)
    
    return AudioScript.model_validate_json(response.text)
