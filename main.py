# main.py
import os
import shutil
from fastapi import FastAPI, UploadFile, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from typing import Optional

# Import AI Services
from ai.services.library import save_text_from_pdf, get_text_chunk, get_total_length
from ai.services.director import get_script
from ai.services.store import save_script, get_script_from_cache
from ai.services.audio import stream_audio_for_script

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BookResponse(BaseModel):
    book_id: str
    total_length: int

class TranscriptResponse(BaseModel):
    transcript: dict # The AudioScript JSON
    next_cursor: int
    audio_url: str

@app.post("/books", response_model=BookResponse)
async def upload_book(file: UploadFile):
    """
    1. Accepts a PDF file.
    2. Extracts text and saves it.
    3. Returns book ID (filename without extension).
    """
    # Simple ID generation: filename
    book_id = os.path.splitext(file.filename)[0]
    
    # Save to temp file strictly for PdfReader, then processing
    # Or just pass file.file directly if PdfReader supports it (it does)
    try:
        save_text_from_pdf(file.file, book_id)
        length = get_total_length(book_id)
        return {"book_id": book_id, "total_length": length}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/{book_id}/transcript", response_model=TranscriptResponse)
async def get_transcript(book_id: str, cursor: int = 0):
    """
    1. Fetches text chunk from library (Cursor -> +50 sentences).
    2. Calls Gemini (Director) to get script.
    3. SAVES script to cache.
    4. Returns script + next cursor.
    """
    # 1. Get Chunk
    text_chunk, next_cursor = get_text_chunk(book_id, cursor, limit=30) # Started small
    
    if not text_chunk:
         # End of book or invalid
         return {"transcript": {"lines": []}, "next_cursor": cursor, "audio_url": ""}

    # 2. Get Script (Gemini)
    try:
        script = get_script(text_chunk)
    except Exception as e:
        # Fallback or error
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

    # 3. Save to Cache (CRITICAL)
    save_script(book_id, cursor, script)
    
    # 4. Return
    audio_url = f"/books/{book_id}/audio?cursor={cursor}"
    return {
        "transcript": script.model_dump(),
        "next_cursor": next_cursor,
        "audio_url": audio_url
    }

@app.get("/books/{book_id}/audio")
async def get_audio_stream(book_id: str, cursor: int = Query(...)):
    """
    1. Retrieves script from cache (CRITICAL: MUST EXIST).
    2. Streams audio processing it line-by-line.
    """
    # 1. Retrieve
    script = get_script_from_cache(book_id, cursor)
    
    if not script:
        # Never regenerate here. Force client to get transcript first.
        raise HTTPException(status_code=404, detail="Script not found. Call /transcript first.")
    
    # 2. Stream
    return StreamingResponse(
        stream_audio_for_script(script, book_id=book_id),
        media_type="audio/mpeg"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)