/**
 * Audio Service - Backend communication for audiobook processing
 */

import { API_BASE_URL, apiFetch } from './api';

// ============ Response Types ============

export interface BookUploadResponse {
  book_id: string;
  total_length: number;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface CharacterProfile {
  name: string;
  gender: number;
  age: number;
  pitch: number;
  tempo: number;
  volume: number;
  roughness: number;
  accent: string | null;
}

export interface TranscriptData {
  characters: CharacterProfile[];
  lines: DialogueLine[];
}

export interface TranscriptResponse {
  transcript: TranscriptData;
  next_cursor: number;
  audio_url: string;
}

// ============ API Functions ============

/**
 * Upload a PDF book to the backend
 */
export async function uploadBook(
  file: { uri: string; name: string; type: string }
): Promise<BookUploadResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type || 'application/pdf',
  } as any);

  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail);
  }

  return response.json();
}

/**
 * Get transcript chunk for a book at given cursor position
 * This calls Gemini AI to generate the script if not cached
 */
export async function getTranscript(
  bookId: string, 
  cursor: number = 0
): Promise<TranscriptResponse> {
  return apiFetch<TranscriptResponse>(
    `/books/${bookId}/transcript?cursor=${cursor}`
  );
}

/**
 * Get the full audio URL for streaming
 */
export function getAudioUrl(bookId: string, cursor: number): string {
  return `${API_BASE_URL}/books/${bookId}/audio?cursor=${cursor}`;
}
