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

