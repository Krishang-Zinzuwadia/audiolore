
import os
import re
from pypdf import PdfReader
from typing import Tuple

# Ensure library directory exists
LIBRARY_DIR = "library"
os.makedirs(LIBRARY_DIR, exist_ok=True)

def save_text_from_pdf(pdf_file, book_id: str) -> str:
    """
    Extracts text from uploaded PDF and saves it to library/{book_id}.txt.
    Returns the path to the text file.
    """
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    file_path = os.path.join(LIBRARY_DIR, f"{book_id}.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    
    return file_path

def get_total_length(book_id: str) -> int:
    file_path = os.path.join(LIBRARY_DIR, f"{book_id}.txt")
    if not os.path.exists(file_path):
        return 0
    with open(file_path, "r", encoding="utf-8") as f:
        return len(f.read())

def get_text_chunk(book_id: str, offset: int, limit: int = 50) -> Tuple[str, int]:
    """
    Returns a chunk of text starting from `offset`.
    It attempts to grab `limit` sentences, but ensures it doesn't split a sentence in half.
    
    Returns: (chunk_text, next_offset)
    """
    file_path = os.path.join(LIBRARY_DIR, f"{book_id}.txt")
    if not os.path.exists(file_path):
        return "", offset

    with open(file_path, "r", encoding="utf-8") as f:
        f.seek(offset)
        # Read a large enough buffer to likely contain 50 sentences (avg sentence 100-200 chars -> 10k chars needed)
        # Reading 20k chars safely covers most cases.
        remaining_text = f.read(20000) 
    
    if not remaining_text:
        return "", offset

    # Sentence splitting logic:
    # We want to find the Nth occurrence of a sentence terminator (. ? ! \n)
    # Regex for sentence delimiters.
    # Note: simple split might be fooling on "Mr." or "Dr.", but good enough for mvp.
    
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
    
    # Trim leading/trailing whitespace from chunk, but keep offsets accurate?
    # Actually, simpler to just return the raw text chunk and update offset.
    # The client might care about clean text, but the Brain needs context.
    
    return chunk, next_offset
