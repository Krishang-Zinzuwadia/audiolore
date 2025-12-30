"""
Gemini Chunk Analyzer - Analyzes emotional context and voice parameters for each chunk
"""
import os
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
import re

load_dotenv()

# Configure API Key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# --- Data Models ---

class ChunkAnalysisResponse(BaseModel):
    """Response from Gemini for a single chunk"""
    character: str = Field(description="Character name speaking or 'Narrator' for narration")
    context_emotion: str = Field(description="Emotional context: happy, sad, angry, fearful, neutral, suspenseful, etc.")
    pitch: float = Field(description="0.0 (deep/low) - 1.0 (high/squeaky)")
    tempo: float = Field(description="0.0 (very slow) - 1.0 (very fast)")
    deepness: float = Field(description="0.0 (light/airy) - 1.0 (deep/resonant)")

class ChunkAnalysisBatch(BaseModel):
    """Batch of chunk analyses"""
    analyses: List[ChunkAnalysisResponse]

# Initialize Model for JSON response
model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={
        "response_mime_type": "application/json",
        "response_schema": ChunkAnalysisBatch
    }
)

def extract_chunks_from_chapter(chapter_content: str) -> List[str]:
    """
    Extract chunks from chapter content that was formatted as [Chunk N]
    """
    chunks = []
    chunk_pattern = r'\[Chunk \d+\]\n(.*?)(?=\[Chunk \d+\]|$)'
    matches = re.finditer(chunk_pattern, chapter_content, re.DOTALL)
    
    for match in matches:
        chunk_text = match.group(1).strip()
        if chunk_text:
            chunks.append(chunk_text)
    
    return chunks

def analyze_chunks(chunks: List[str], book_title: str = "", book_author: str = "") -> List[ChunkAnalysisResponse]:
    """
    Analyzes a list of text chunks for emotional context and voice parameters.
    Returns list of ChunkAnalysisResponse objects.
    """
    if not chunks:
        return []
    
    # Prepare chunks with indices for context
    chunks_text = "\n\n".join([f"CHUNK {i}: {chunk}" for i, chunk in enumerate(chunks)])
    
    prompt = f"""
You are a professional audiobook narrator and voice director analyzing "{book_title}" by {book_author} for emotional text-to-speech narration.

CRITICAL INSTRUCTIONS:
- Carefully READ each chunk and identify WHO is speaking (character name or Narrator)
- Identify the emotional tone
- VARY the parameters based on content - avoid defaulting to neutral/0.5
- Consider the genre and author's style
- Pay attention to: word choice, sentence structure, imagery, character state, plot tension

FOR EACH CHUNK, ANALYZE:

1. **character**: Identify the speaker:
   - If DIALOGUE: Character's name (e.g., "Gorrister", "Ellen", "Benny", "AM")
   - If NARRATION: Use "Narrator"
   - If INTERNAL THOUGHT: Character name + " (thought)" (e.g., "Ted (thought)")
   - Be consistent with character names throughout

2. **context_emotion**: Be PRECISE about the dominant emotion:
   - For horror/dark: "terrifying", "desperate", "hopeless", "ominous", "unsettling", "paranoid"
   - For tension: "anxious", "tense", "urgent", "frantic", "panicked"
   - For sad: "melancholic", "sorrowful", "defeated", "resigned", "bitter"
   - For reflection: "contemplative", "reflective", "nostalgic", "philosophical"
   - For action: "intense", "determined", "aggressive", "chaotic"
   - Only use "neutral" for truly emotionless exposition

3. **pitch** (0.0-1.0): Match to emotional intensity AND character
   - 0.3-0.4: Deep, ominous, authoritative, grim narration, male characters
   - 0.45-0.55: Standard narrative voice, neutral characters
   - 0.6-0.75: Fear, tension, excitement, high emotion, female characters
   Examples: Ominous description=0.38, Panicked dialogue=0.68, Standard narrator=0.48
   Note: Adjust for character's typical voice (deep male vs higher female)

4. **tempo** (0.0-1.0): Match to pacing and urgency
   - 0.3-0.4: Slow, deliberate, heavy, ominous, reflective
   - 0.45-0.55: Standard narrative pace
   - 0.65-0.8: Fast, urgent, action, panic, excitement
   Examples: Brooding thought=0.35, Calm narration=0.5, Chase scene=0.75

5. **deepness** (0.0-1.0): Match to tone, authority, AND character's voice
   - 0.3-0.4: Light, vulnerable, fearful, weak, young/female characters
   - 0.45-0.55: Standard voice, narrator
   - 0.6-0.8: Deep, powerful, authoritative, ominous, male characters
   Examples: Frightened Ellen=0.35, Narrator=0.52, AM (machine)=0.75, Gorrister=0.65

ANALYZE THESE TEXT CHUNKS:
{chunks_text}

Return a JSON array with one analysis object per chunk, in order. Ensure emotional accuracy and parameter variation.
"""
    
    try:
        print(f"Calling Gemini API with {len(chunks)} chunks...")
        response = model.generate_content(prompt)
        print(f"Got response from Gemini")
        
        batch = ChunkAnalysisBatch.model_validate_json(response.text)
        
        print(f"Analyzed {len(batch.analyses)} chunks with Gemini")
        
        # Debug: Show first analysis
        if batch.analyses:
            first = batch.analyses[0]
            print(f"   Sample: {first.context_emotion} | P:{first.pitch} T:{first.tempo} D:{first.deepness}")
        
        return batch.analyses
        
    except Exception as e:
        print(f"Error analyzing chunks: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        # Return default neutral analysis for all chunks
        return [
            ChunkAnalysisResponse(
                character="Narrator",
                context_emotion="neutral",
                pitch=0.5,
                tempo=0.5,
                deepness=0.5
            ) for _ in chunks
        ]

def analyze_single_chunk(chunk_text: str, book_title: str = "", book_author: str = "") -> ChunkAnalysisResponse:
    """
    Analyze a single chunk (convenience function)
    """
    results = analyze_chunks([chunk_text], book_title, book_author)
    return results[0] if results else ChunkAnalysisResponse(
        character="Narrator",
        context_emotion="neutral",
        pitch=0.5,
        tempo=0.5,
        deepness=0.5
    )
