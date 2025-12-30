"""
Upload a text file to MongoDB as a book
"""
import sys
import os
import re
import uuid
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.database import get_database, BOOKS_COLLECTION
from ai.models import Book, Chapter

def chunk_text_into_sentences(text: str, sentences_per_chunk: int = 3) -> list:
    """
    Split text into chunks of N sentences each.
    """
    # Clean up text - remove extra whitespace but preserve paragraph breaks
    text = re.sub(r'\n\s*\n', '\n\n', text)  # Normalize paragraph breaks
    text = re.sub(r'[ \t]+', ' ', text)  # Normalize spaces
    
    # Split into sentences using regex
    # Matches: . ! ? followed by space and capital letter, or end of string
    sentence_pattern = r'(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$'
    sentences = re.split(sentence_pattern, text)
    
    # Filter out empty sentences
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Group into chunks
    chunks = []
    for i in range(0, len(sentences), sentences_per_chunk):
        chunk = ' '.join(sentences[i:i + sentences_per_chunk])
        if chunk:
            chunks.append(chunk)
    
    return chunks

def upload_text_file(file_path: str, title: str = None, author: str = None, image_url: str = None):
    """
    Upload a text file to MongoDB
    """
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    # Generate UUID for book_id
    book_id = str(uuid.uuid4())
    
    # Extract filename for reference
    filename = os.path.basename(file_path)
    
    # Read file content
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False
    
    # Extract title and author from filename if not provided
    # Format: timestamp-Author-Title.txt
    if not title or not author:
        parts = filename.replace(".txt", "").split("-", 2)
        if len(parts) >= 3:
            if not author:
                author = parts[1].replace("_", " ")
            if not title:
                title = parts[2].replace("_", " ")
    
    # Default values
    if not title:
        title = book_id.replace("-", " ").replace("_", " ").title()
    if not author:
        author = "Unknown Author"
    
    # Chunk the content into 2-3 sentence segments
    print("📦 Chunking text into 2-3 sentence segments...")
    chunks = chunk_text_into_sentences(content, sentences_per_chunk=3)
    print(f"   Created {len(chunks)} chunks")
    
    # Create chapters with chunked content
    # For now, put all chunks in one chapter
    # You can later split into multiple chapters if needed
    chunked_content = "\n\n".join([f"[Chunk {i+1}]\n{chunk}" for i, chunk in enumerate(chunks)])
    
    chapter = Chapter(
        chapter_number=1,
        title="Full Text (Chunked)",
        content=chunked_content,
        word_count=len(content.split()),
        created_at=datetime.utcnow()
    )
    
    # Create book document
    book = Book(
        book_id=book_id,
        title=title,
        author=author,
        image_url=image_url,
        description=None,
        total_length=len(content),
        chunks=len(chunks),
        chapters=[chapter],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Save to MongoDB
    db = get_database()
    books_collection = db[BOOKS_COLLECTION]
    
    try:
        # Check if already exists
        existing = books_collection.find_one({"book_id": book_id})
        if existing:
            print(f"⚠️  Book with ID '{book_id}' already exists. Replacing...")
            books_collection.replace_one(
                {"book_id": book_id},
                book.dict(by_alias=True),
            )
        else:
            books_collection.insert_one(book.dict(by_alias=True))
        
        print(f"✅ Successfully uploaded to MongoDB!")
        print(f"   Book ID: {book_id}")
        print(f"   Title: {title}")
        print(f"   Author: {author}")
        print(f"   Length: {len(content):,} characters")
        print(f"   Words: {len(content.split()):,}")
        print(f"   Chunks: {len(chunks)} (3 sentences each)")
        return True
        
    except Exception as e:
        print(f"❌ Error uploading to MongoDB: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python upload_book.py <file_path> [title] [author] [image_url]")
        print("\nExample:")
        print('  python upload_book.py library/mybook.txt "My Book" "Author Name"')
        sys.exit(1)
    
    file_path = sys.argv[1]
    title = sys.argv[2] if len(sys.argv) > 2 else None
    author = sys.argv[3] if len(sys.argv) > 3 else None
    image_url = sys.argv[4] if len(sys.argv) > 4 else None
    
    print("=" * 60)
    print("Audio Lore - Book Upload to MongoDB")
    print("=" * 60)
    print()
    
    success = upload_text_file(file_path, title, author, image_url)
    
    if success:
        print()
        print("✨ Book is now available in your MongoDB database!")
        print("   Database: audiolore")
        print("   Collection: books")
    else:
        sys.exit(1)
