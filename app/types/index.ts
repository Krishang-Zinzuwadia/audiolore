export interface Audiobook {
  id: string;
  title: string;
  author: string;
  duration: number;
  coverColor: string;
  coverGradient?: [string, string, ...string[]];
  progress: number;
  transcript: TranscriptSegment[];
  isUploaded?: boolean;
  // For real books from backend
  totalLength?: number;
}

export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
}

// ============ API Types ============

export interface BookMetadata {
  book_id: string;
  title: string;
  author: string;
  image_url?: string;
  total_length: number;
  chunks: number;
  chapter_count: number;
  created_at: string;
}

export interface ChunkAnalysis {
  chunk_index: number;
  context_emotion: string;
  pitch: number;  // 0-1 range
  tempo: number;  // 0-1 range
  deepness: number;  // 0-1 range
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

export interface TranscriptChunk {
  transcript: {
    lines: DialogueLine[];
    characters: CharacterProfile[];
  };
  next_cursor: number;
  audio_url: string;
}

export type RootStackParamList = {
  Home: undefined;
  Listen: { audiobook: Audiobook };
  Settings: undefined;
};

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  speed: number;
}

