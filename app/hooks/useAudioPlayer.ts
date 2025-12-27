/**
 * Custom hook for streaming audio playback using expo-av
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  position: number; // milliseconds
  duration: number; // milliseconds
  error: string | null;
}

export interface AudioPlayerControls {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setRate: (rate: number) => Promise<void>;
}

interface UseAudioPlayerOptions {
  onPlaybackEnd?: () => void;
  autoPlay?: boolean;
}

export function useAudioPlayer(
  audioUrl: string | null,
  options: UseAudioPlayerOptions = {}
) {
  const { onPlaybackEnd, autoPlay = true } = options;
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    position: 0,
    duration: 0,
    error: null,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Load new audio when URL changes
  useEffect(() => {
    let isMounted = true;

    const loadAudio = async () => {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (!audioUrl) {
        setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });

        // Create and load the sound
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: autoPlay },
          onPlaybackStatusUpdate
        );

        if (!isMounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;

        if (status.isLoaded) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isPlaying: status.isPlaying,
            duration: status.durationMillis || 0,
          }));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Audio load error:', error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load audio',
          }));
        }
      }
    };

    loadAudio();

    return () => {
      isMounted = false;
    };
  }, [audioUrl, autoPlay]);

  // Playback status callback
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setState(prev => ({ ...prev, error: status.error ?? null }));
      }
      return;
    }

    setState(prev => ({
      ...prev,
      isPlaying: status.isPlaying,
      position: status.positionMillis,
      duration: status.durationMillis || prev.duration,
    }));

    // Check if playback finished
    if (status.didJustFinish && !status.isLooping) {
      onPlaybackEnd?.();
    }
  }, [onPlaybackEnd]);

  // Control functions
  const play = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
  }, []);

  const setRate = useCallback(async (rate: number) => {
    if (soundRef.current) {
      await soundRef.current.setRateAsync(rate, true);
    }
  }, []);

  const controls: AudioPlayerControls = {
    play,
    pause,
    stop,
    setRate,
  };

  return { state, controls };
}
