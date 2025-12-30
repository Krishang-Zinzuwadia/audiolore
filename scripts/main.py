# main.py
import os
import sys
import shutil
import uuid

# Add parent directory to path to allow imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from fastapi import FastAPI, UploadFile, HTTPException, Query, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from typing import Optional, List

# Import AI Services
from ai.services.library import save_text_from_pdf, get_text_chunk, get_total_length, get_book, get_all_books
from ai.services.director import get_script
from ai.services.store import save_script, get_script_from_cache
from ai.services.audio import stream_audio_for_script
from ai.services.chunk_analyzer import analyze_chunks, extract_chunks_from_chapter
from ai.database import connect_to_mongo, close_mongo_connection, get_database, BOOKS_COLLECTION
from ai.models import BookMetadata, ChunkAnalysis

app = FastAPI(title="Audio Lore API", version="1.0.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to connect to MongoDB
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

# Shutdown event to close MongoDB connection
@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

class BookResponse(BaseModel):
    book_id: str
    total_length: int
    title: str
    author: str

class TranscriptResponse(BaseModel):
    transcript: dict # The AudioScript JSON
    next_cursor: int
    audio_url: str

@app.get("/books", response_model=List[BookMetadata])
async def list_books():
    """
    Get all books from the library
    """
    try:
        books = get_all_books()
        return [
            BookMetadata(
                book_id=book.book_id,
                title=book.title,
                author=book.author,
                image_url=book.image_url,
                total_length=book.total_length,
                chunks=book.chunks,
                chapter_count=len(book.chapters),
                created_at=book.created_at
            )
            for book in books
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/books", response_model=BookResponse)
async def upload_book(
    file: UploadFile,
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None)
):
    """
    1. Accepts a PDF file with optional metadata.
    2. Extracts text, splits into chapters, and saves to MongoDB.
    3. Returns book info.
    """
    # Generate UUID for book_id
    book_id = str(uuid.uuid4())
    
    try:
        book = save_text_from_pdf(
            file.file, 
            book_id,
            title=title or file.filename,
            author=author,
            image_url=image_url
        )
        return {
            "book_id": book.book_id,
            "total_length": book.total_length,
            "title": book.title,
            "author": book.author
        }
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
    # 1. Get Chunk (10-15 sentences is a good balance for flow without too much wait)
    text_chunk, next_cursor = get_text_chunk(book_id, cursor, limit=2)
    
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

@app.post("/books/{book_id}/analyze")
async def analyze_book_chunks(book_id: str):
    """
    Analyze all chunks in a book with Gemini for emotional context and voice parameters.
    Stores results in gemini_response array.
    """
    # Get book from MongoDB
    book = get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Extract chunks from chapters
    all_chunks = []
    for chapter in book.chapters:
        chunks = extract_chunks_from_chapter(chapter.content)
        all_chunks.extend(chunks)
    
    if not all_chunks:
        raise HTTPException(status_code=400, detail="No chunks found in book")
    
    print(f"Analyzing {len(all_chunks)} chunks for '{book.title}'...")
    
    # Analyze chunks with Gemini
    try:
        analyses = analyze_chunks(all_chunks, book.title, book.author)
        
        # Create ChunkAnalysis objects with indices
        chunk_analyses = [
            ChunkAnalysis(
                chunk_index=i,
                character=analysis.character,
                context_emotion=analysis.context_emotion,
                pitch=analysis.pitch,
                tempo=analysis.tempo,
                deepness=analysis.deepness
            )
            for i, analysis in enumerate(analyses)
        ]
        
        # Update book in database
        db = get_database()
        books_collection = db[BOOKS_COLLECTION]
        
        books_collection.update_one(
            {"book_id": book_id},
            {
                "$set": {
                    "gemini_response": [analysis.model_dump() for analysis in chunk_analyses]
                }
            }
        )
        
        return {
            "book_id": book_id,
            "title": book.title,
            "chunks_analyzed": len(chunk_analyses),
            "analyses": chunk_analyses
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

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