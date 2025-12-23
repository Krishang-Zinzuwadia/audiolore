
import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"
BOOK_ID = "test_book"

# 1. Ensure test book exists (bypass PDF upload for testing)
# We manually place the file like the Library service would
os.makedirs("library", exist_ok=True)
with open(f"library/{BOOK_ID}.txt", "w", encoding="utf-8") as f:
    text = """
"I am the King of Salem," the old man said.
"Why would a king talk to a shepherd?" the boy asked, awed and embarrassed.
"Because you like to travel."
    """
    f.write(text.strip())
print(f"Bypassed Upload: Created library/{BOOK_ID}.txt")

# 2. Get Transcript (Chunk 0)
print(f"\n[1] Requesting Transcript for '{BOOK_ID}' (Cursor 0)...")
url_transcript = f"{BASE_URL}/books/{BOOK_ID}/transcript?cursor=0"
try:
    r = requests.get(url_transcript)
    if r.status_code != 200:
        print(f"Error: {r.text}")
        exit(1)
    
    data = r.json()
    print("Transcript Received:")
    print(json.dumps(data["transcript"], indent=2))
    print(f"Next Cursor: {data['next_cursor']}")
    audio_url = data['audio_url']
    print(f"Audio URL: {audio_url}")

except Exception as e:
    print(f"Failed to connect: {e}")
    exit(1)

# 3. Stream Audio
print(f"\n[2] Streaming Audio from {audio_url}...")
# Note: In the app, this URL is relative, so append Base URL
full_audio_url = f"{BASE_URL}{audio_url}"

try:
    with requests.get(full_audio_url, stream=True) as r:
        if r.status_code != 200:
            print(f"Error: {r.text}")
            exit(1)
            
        # Save to file to verify
        filename = "test_stream_output.mp3"
        with open(filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192): 
                f.write(chunk)
                
    print(f"Success! Audio saved to '{filename}'. Check if it plays.")

except Exception as e:
    print(f"Failed to stream: {e}")
