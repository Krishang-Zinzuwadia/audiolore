"""
MongoDB Models for Audio Lore
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator, _handler):
        return {"type": "string"}


class Chapter(BaseModel):
    """Chapter model with text content"""
    chapter_number: int = Field(..., description="Chapter number")
    title: str = Field(..., description="Chapter title")
    content: str = Field(..., description="Full chapter text content")
    word_count: int = Field(default=0, description="Number of words in chapter")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}


class ChunkAnalysis(BaseModel):
    """Gemini analysis for a single chunk"""
    chunk_index: int = Field(..., description="Index of the chunk (0-based)")
    character: str = Field(default="Narrator", description="Character/speaker name or 'Narrator' for narration")
    context_emotion: str = Field(..., description="Emotional context of the chunk")
    pitch: float = Field(..., description="Pitch level 0.0 (low) - 1.0 (high)")
    tempo: float = Field(..., description="Speaking speed 0.0 (slow) - 1.0 (fast)")
    deepness: float = Field(..., description="Voice deepness 0.0 (light) - 1.0 (deep)")

    class Config:
        json_encoders = {ObjectId: str}


class Book(BaseModel):
    """Book model for MongoDB"""
    book_id: str = Field(..., description="Unique book identifier (UUID)")
    title: str = Field(..., description="Book title")
    author: str = Field(..., description="Book author")
    image_url: Optional[str] = Field(None, description="Cover image URL or base64")
    description: Optional[str] = Field(None, description="Book description")
    total_length: int = Field(default=0, description="Total character count")
    chunks: int = Field(default=0, description="Number of chunks (2-3 sentences each)")
    chapters: List[Chapter] = Field(default_factory=list, description="Book chapters")
    gemini_response: List[ChunkAnalysis] = Field(default_factory=list, description="Gemini analysis for each chunk")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class BookMetadata(BaseModel):
    """Lightweight book metadata for listing"""
    book_id: str
    title: str
    author: str
    image_url: Optional[str] = None
    total_length: int
    chunks: int
    chapter_count: int
    created_at: datetime
    
    class Config:
        json_encoders = {ObjectId: str}
