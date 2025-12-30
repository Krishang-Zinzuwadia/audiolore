"""Directly analyze and update book with character information"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.services.chunk_analyzer import analyze_chunks
from ai.services.library import get_book, get_database, BOOKS_COLLECTION
from ai.models import ChunkAnalysis

# Book ID
book_id = "fd10d14d-c423-4ba9-9c64-f1306fdc0534"

# Get book
book = get_book(book_id)
if not book:
    print("Book not found")
    sys.exit(1)

print(f"Analyzing: {book.title}")
print(f"   Chapters: {len(book.chapters)}")

# Extract all chunks
all_chunks = []
for chapter in book.chapters:
    # Split on double newlines
    chunks = [c.strip() for c in chapter.content.split('\n\n') if c.strip()]
    all_chunks.extend(chunks)

print(f"   Total chunks: {len(all_chunks)}")

# Analyze with Gemini
print("\nAnalyzing with Gemini (with character detection)...")
analyses = analyze_chunks(all_chunks, book.title, book.author)

print(f"\nAnalysis complete: {len(analyses)} chunks")

# Create ChunkAnalysis objects
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

# Show sample with character info
print("\nSample analyses with characters:")
for i in [0, 1, 2, -3, -2, -1]:
    a = chunk_analyses[i]
    print(f"   [{a.chunk_index:3d}] {a.character:15s} | {a.context_emotion:15s} | P:{a.pitch:.2f} T:{a.tempo:.2f} D:{a.deepness:.2f}")

# Update database
print("\nUpdating database...")
db = get_database()
books_collection = db[BOOKS_COLLECTION]

result = books_collection.update_one(
    {"book_id": book_id},
    {
        "$set": {
            "gemini_response": [analysis.model_dump() for analysis in chunk_analyses]
        }
    }
)

print(f"Database updated (matched: {result.matched_count}, modified: {result.modified_count})")
print("\nDone! Run view_analysis.py to see character-based results.")
