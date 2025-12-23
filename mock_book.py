
import os
os.makedirs("library", exist_ok=True)
with open("library/test_book.txt", "w", encoding="utf-8") as f:
    f.write("Sentence one. Sentence two? Sentence three!\nSentence four. " + "Buffer " * 50) # enough text
