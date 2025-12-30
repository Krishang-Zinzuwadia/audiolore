#!/usr/bin/env python3
"""
View Gemini analysis results from MongoDB
"""
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from ai.database import get_database, BOOKS_COLLECTION

load_dotenv()

def view_analysis(book_id: str, show_all: bool = False):
    """View Gemini analysis for a book"""
    db = get_database()
    books_collection = db[BOOKS_COLLECTION]
    
    book = books_collection.find_one({"book_id": book_id})
    
    if not book:
        print(f"Book not found: {book_id}")
        return
    
    print("="*70)
    print(f"{book['title']} by {book['author']}")
    print("=" * 70)
    print(f"Book ID: {book_id}")
    print(f"Total Chunks: {book.get('chunks', 0)}")
    print(f"Chapters: {len(book.get('chapters', []))}")
    print()
    
    gemini_response = book.get('gemini_response', [])
    
    if not gemini_response:
        print("⚠️  No Gemini analysis found. Run analysis first:")
        print(f"   python scripts/test_gemini_analysis.py")
        return
    
    print(f"✅ Gemini Analysis: {len(gemini_response)} chunks analyzed")
    print()
    
    # Show statistics
    emotions = {}
    total_pitch = 0
    total_tempo = 0
    total_deepness = 0
    
    for analysis in gemini_response:
        emotion = analysis.get('context_emotion', 'unknown')
        emotions[emotion] = emotions.get(emotion, 0) + 1
        total_pitch += analysis.get('pitch', 0.5)
        total_tempo += analysis.get('tempo', 0.5)
        total_deepness += analysis.get('deepness', 0.5)
    
    count = len(gemini_response)
    
    print("📊 Statistics:")
    print(f"   Average Pitch: {total_pitch/count:.2f}")
    print(f"   Average Tempo: {total_tempo/count:.2f}")
    print(f"   Average Deepness: {total_deepness/count:.2f}")
    print()
    
    print("🎭 Emotions Distribution:")
    sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
    for emotion, count in sorted_emotions[:10]:  # Top 10 emotions
        bar_length = int((count / len(gemini_response)) * 40)
        bar = "█" * bar_length
        print(f"   {emotion:20s} {bar} {count:3d} ({count/len(gemini_response)*100:.1f}%)")
    print()
    
    # Show sample chunks
    if show_all:
        print("📝 All Chunk Analyses:")
        print()
        for i, analysis in enumerate(gemini_response):
            show_chunk_analysis(i, analysis, book['chapters'][0]['content'])
    else:
        print("📝 Sample Analyses (first 5, last 5):")
        print()
        # First 5
        for i in range(min(5, len(gemini_response))):
            show_chunk_analysis(i, gemini_response[i], book['chapters'][0]['content'])
        
        if len(gemini_response) > 10:
            print("   ... (middle chunks omitted) ...\n")
        
        # Last 5
        for i in range(max(5, len(gemini_response) - 5), len(gemini_response)):
            show_chunk_analysis(i, gemini_response[i], book['chapters'][0]['content'])
    
    print()
    print("💡 Tip: Use --all flag to see all chunk analyses")

def show_chunk_analysis(index, analysis, chapter_content):
    """Display a single chunk analysis with its text"""
    # Extract chunk text
    chunk_marker = f"[Chunk {index}]"
    next_marker = f"[Chunk {index + 1}]"
    
    start = chapter_content.find(chunk_marker)
    if start == -1:
        chunk_text = "(chunk text not found)"
    else:
        start += len(chunk_marker)
        end = chapter_content.find(next_marker, start)
        if end == -1:
            chunk_text = chapter_content[start:start+100].strip()
        else:
            chunk_text = chapter_content[start:end].strip()
        
        # Truncate if too long
        if len(chunk_text) > 150:
            chunk_text = chunk_text[:150] + "..."
    
    character = analysis.get('character', 'Unknown')
    print(f"   [{index:3d}] {character:12s} | {analysis['context_emotion']:15s} | "
          f"P:{analysis['pitch']:.2f} T:{analysis['tempo']:.2f} D:{analysis['deepness']:.2f}")
    print(f"         \"{chunk_text}\"")
    print()

def list_all_books():
    """List all books in the database"""
    db = get_database()
    books_collection = db[BOOKS_COLLECTION]
    
    books = list(books_collection.find({}, {
        'book_id': 1, 
        'title': 1, 
        'author': 1, 
        'chunks': 1,
        'gemini_response': 1
    }))
    
    if not books:
        print("❌ No books found in database")
        return
    
    print("=" * 70)
    print("📚 Books in Database")
    print("=" * 70)
    print()
    
    for book in books:
        analyzed = "✅" if book.get('gemini_response') else "⏳"
        print(f"{analyzed} {book['title']}")
        print(f"   by {book['author']}")
        print(f"   ID: {book['book_id']}")
        print(f"   Chunks: {book.get('chunks', 0)}")
        if book.get('gemini_response'):
            print(f"   Analyzed: {len(book['gemini_response'])} chunks")
        print()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='View Gemini analysis results')
    parser.add_argument('--book-id', help='Book ID to view analysis for')
    parser.add_argument('--all', action='store_true', help='Show all chunks (not just samples)')
    parser.add_argument('--list', action='store_true', help='List all books')
    
    args = parser.parse_args()
    
    if args.list:
        list_all_books()
    elif args.book_id:
        view_analysis(args.book_id, show_all=args.all)
    else:
        # Default: show the uploaded book
        view_analysis("fd10d14d-c423-4ba9-9c64-f1306fdc0534", show_all=args.all)
