# test_brain.py
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel
from typing import List

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# 1. Define the Output Schema (Strict JSON)
class DialogueLine(BaseModel):
    speaker: str  # e.g., "narrator", "santiago", "king"
    text: str

class AudioScript(BaseModel):
    lines: List[DialogueLine]

# 2. Initialize the Model
model = genai.GenerativeModel("gemini-3-flash", 
    generation_config={"response_mime_type": "application/json", "response_schema": AudioScript}
)

# 3. The "Director" Prompt
PROMPT = """
You are an Audiobook Director. 
Split the following text into a script. 
Identify the speaker. If it's descriptive text, speaker is 'narrator'.
Keep the text EXACTLY as written.

Text:
"Why do you tend sheep?" asked the old man.
"Because I like to travel," the boy said.
"""

response = model.generate_content(PROMPT)
print(response.text)