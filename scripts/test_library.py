from ai.services.library import get_text_chunk
import os

print("Testing Library Service...")
# Ensure mock file exists
if not os.path.exists("library/test_book.txt"):
    print("Run mock_book.py first")
    exit(1)

# Test Limit 2
chunk, next_offset = get_text_chunk("test_book", 0, limit=2)
print(f"Chunk (Limit 2): '{chunk}'")
print(f"Next Offset: {next_offset}")

# Test Limit 1 (Should get next sentence)
chunk2, next_offset2 = get_text_chunk("test_book", next_offset, limit=1)
print(f"Chunk 2 (Limit 1): '{chunk2}'")
