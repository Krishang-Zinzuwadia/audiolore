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
}

export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
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
