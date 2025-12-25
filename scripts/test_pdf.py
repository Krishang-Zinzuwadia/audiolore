
import requests
import json
import sys
import os

BASE_URL = "http://127.0.0.1:8000"

def test_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return

    print(f"Uploading {pdf_path}...")
    
    # 1. Upload
    with open(pdf_path, "rb") as f:
        files = {"file": f}
        try:
            r = requests.post(f"{BASE_URL}/books", files=files)
            if r.status_code != 200:
                print(f"Upload failed: {r.text}")
                return
            
            data = r.json()
            book_id = data["book_id"]
            total_length = data["total_length"]
            print(f"Success! Book ID: {book_id}, Length: {total_length} chars")
        except Exception as e:
             print(f"Connection failed: {e}")
             return

    # 2. Get Transcript (Cursor 0)
    print(f"\nRequesting Transcript (Chunk 1)...")
    url_transcript = f"{BASE_URL}/books/{book_id}/transcript?cursor=0"
    
    try:
        r = requests.get(url_transcript)
        if r.status_code != 200:
             print(f"Transcript failed: {r.text}")
             return
        
        data = r.json()
        print("Transcript received!")
        # Pretty print just the first few lines
        lines = data["transcript"].get("lines", [])
        for i, line in enumerate(lines[:3]):
            print(f"  [{line.get('speaker', '?')}] {line.get('text', '')[:50]}...")
            
        audio_url = data["audio_url"]
        
    except Exception as e:
        print(f"Transcript error: {e}")
        return

    # 3. Stream Audio
    print(f"\nStreaming Audio from {audio_url}...")
    full_audio_url = f"{BASE_URL}{audio_url}"
    output_file = f"output_{book_id}.mp3"
    
    try:
        with requests.get(full_audio_url, stream=True) as r:
            if r.status_code != 200:
                 print(f"Audio failed: {r.text}")
                 return
            
            with open(output_file, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        
        print(f"Success! Audio saved to '{output_file}'")
        
    except Exception as e:
        print(f"Audio stream error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_pdf.py <path_to_pdf>")
        # Default to a mock if they just run it without args for quick check
        # But here we want to force them to provide their file or tell them how.
    else:
        test_pdf(sys.argv[1])
