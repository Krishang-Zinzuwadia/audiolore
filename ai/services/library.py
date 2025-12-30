
import os
import re
from pypdf import PdfReader
from typing import Tuple, Optional, List
from ai.database import get_database, BOOKS_COLLECTION
from ai.models import Book, Chapter
from datetime import datetime

# Ensure library directory exists (for backward compatibility)
LIBRARY_DIR = "library"
os.makedirs(LIBRARY_DIR, exist_ok=True)

def save_text_from_pdf(pdf_file, book_id: str, title: str = None, author: str = None, image_url: str = None) -> Book:
    """
    Extracts text from uploaded PDF, splits into chapters, and saves to MongoDB.
    Returns the Book object.
    """
    reader = PdfReader(pdf_file)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"
    
    # Simple chapter detection (you can improve this logic)
    # For now, treat the entire book as one chapter
    chapters = []
    chapter_content = full_text.strip()
    
    if chapter_content:
        chapter = Chapter(
            chapter_number=1,
            title="Chapter 1",
            content=chapter_content,
            word_count=len(chapter_content.split())
        )
        chapters.append(chapter)
    
    # Create book document
    book = Book(
        book_id=book_id,
        title=title or book_id,
        author=author or "Unknown Author",
        image_url=image_url,
        total_length=len(full_text),
        chunks=len(chapters),
        chapters=chapters,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Save to MongoDB
    db = get_database()
    books_collection = db[BOOKS_COLLECTION]
    
    # Upsert book (replace if exists)
    books_collection.replace_one(
        {"book_id": book_id},
        book.dict(by_alias=True),
        upsert=True
    )
    
    print(f"Saved book '{book_id}' to MongoDB with {len(chapters)} chapter(s)")
    
    return book

def get_book(book_id: str) -> Optional[Book]:
    """Get book from MongoDB"""
    db = get_database()
    books_collection = db[BOOKS_COLLECTION]
    
    book_data = books_collection.find_one({"book_id": book_id})
    if book_data:
        return Book(**book_data)
    return None

def get_all_books() -> List[Book]:
    """Get all books from MongoDB"""
    db = get_database()
    books_collection = db[BOOKS_COLLECTION]
    
    books = []
    for book_data in books_collection.find():
        books.append(Book(**book_data))
    return books

def get_total_length(book_id: str) -> int:
    """Get total length of book from MongoDB"""
    book = get_book(book_id)
    if book:
        return book.total_length
    return 0

def get_text_chunk(book_id: str, offset: int, limit: int = 50) -> Tuple[str, int]:
    """
    Returns a chunk of text starting from `offset`.
    It attempts to grab `limit` sentences from MongoDB chapters.
    
    Returns: (chunk_text, next_offset)
    """
    book = get_book(book_id)
    if not book or not book.chapters:
        return "", offset
    
    # Combine all chapters into one text
    full_text = "\n\n".join([chapter.content for chapter in book.chapters])
    
    if offset >= len(full_text):
        return "", offset
    
    # Get remaining text from offset
    remaining_text = full_text[offset:offset + 20000]
    
    if not remaining_text:
        return "", offset

    # Sentence splitting logic
    sentence_endings = [m.end() for m in re.finditer(r'[\.\?\!\n]+', remaining_text)]
    
    if len(sentence_endings) < limit:
        # Take everything if we have fewer sentences than limit
        cut_point = len(remaining_text)
    else:
        # Cut at the limit-th sentence
        cut_point = sentence_endings[limit - 1]

    chunk = remaining_text[:cut_point]
    
    # Calculate next absolute offset
    next_offset = offset + len(chunk)
    
    return chunk, next_offset
