import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TranscriptDisplay } from "../components/transcript-display";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { DialogueLine } from "../types";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import {
  getTranscript,
  getAudioUrl,
  TranscriptResponse,
} from "../services/audioService";

interface ListenScreenProps {
  route: any;
  navigation: any;
}

// Prefetch cache structure
interface PrefetchedChunk {
  cursor: number;
  transcript: TranscriptResponse;
  audioUrl: string;
}

export const ListenScreen: React.FC<ListenScreenProps> = ({
  route,
  navigation,
}) => {
  const { audiobook } = route.params || {};

  // Chunking state
  const [cursor, setCursor] = useState(0);
  const [nextCursor, setNextCursor] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState<DialogueLine[]>([]);
  const [isLoadingChunk, setIsLoadingChunk] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  // PREFETCHING: Store the next chunk ready to go
  const [prefetchedChunk, setPrefetchedChunk] =
    useState<PrefetchedChunk | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);

  // Prevent double-fetch
  const loadingCursorRef = useRef<number | null>(null);
  const prefetchingCursorRef = useRef<number | null>(null);

  // Audio player
  const { state: audioState, controls } = useAudioPlayer(audioUrl, {
    onPlaybackEnd: handlePlaybackEnd,
    autoPlay: true,
  });

  // Handle when audio finishes - use prefetched chunk if available
  function handlePlaybackEnd() {
    console.log("Audio ended, checking prefetched chunk...");

    if (prefetchedChunk && prefetchedChunk.cursor === nextCursor) {
      // USE PREFETCHED CHUNK - instant transition!
      console.log(`Using prefetched chunk at cursor ${nextCursor}`);

      const chunk = prefetchedChunk;
      setTranscriptLines((prev) => [
        ...prev,
        ...chunk.transcript.transcript.lines,
      ]);
      setAudioUrl(chunk.audioUrl);
      setCursor(chunk.cursor);
      setNextCursor(chunk.transcript.next_cursor);
      setPrefetchedChunk(null);

      // Start prefetching the NEXT next chunk
      prefetchChunk(chunk.transcript.next_cursor);
    } else if (nextCursor > cursor) {
      // Fallback: load normally if prefetch not ready
      console.log(`Prefetch not ready, loading cursor ${nextCursor} normally`);
      loadChunk(nextCursor);
    } else {
      console.log("End of book reached");
    }
  }

  // Prefetch the next chunk in background
  const prefetchChunk = useCallback(
    async (chunkCursor: number) => {
      if (!audiobook?.id) return;
      if (chunkCursor <= 0) return;
      if (prefetchingCursorRef.current === chunkCursor) return;
      if (prefetchedChunk?.cursor === chunkCursor) return; // Already have it

      prefetchingCursorRef.current = chunkCursor;
      setIsPrefetching(true);

      try {
        console.log(`PREFETCH: Starting prefetch for cursor ${chunkCursor}`);
        const data = await getTranscript(audiobook.id, chunkCursor);

        if (data.transcript?.lines?.length > 0) {
          const audioUrlForChunk = getAudioUrl(audiobook.id, chunkCursor);

          setPrefetchedChunk({
            cursor: chunkCursor,
            transcript: data,
            audioUrl: audioUrlForChunk,
          });

          console.log(`PREFETCH: Ready! Cursor ${chunkCursor} cached`);
        }
      } catch (err) {
        console.error("Prefetch failed (non-critical):", err);
      } finally {
        setIsPrefetching(false);
        prefetchingCursorRef.current = null;
      }
    },
    [audiobook?.id, prefetchedChunk]
  );

  // Load a transcript chunk (primary loading)
  const loadChunk = useCallback(
    async (chunkCursor: number) => {
      if (!audiobook?.id) return;
      if (loadingCursorRef.current === chunkCursor) return;

      loadingCursorRef.current = chunkCursor;
      setIsLoadingChunk(true);
      setError(null);

      try {
        console.log(`LOAD: Fetching transcript for cursor ${chunkCursor}`);
        const data: TranscriptResponse = await getTranscript(
          audiobook.id,
          chunkCursor
        );

        const hasLines = data.transcript?.lines?.length > 0;

        if (hasLines) {
          setTranscriptLines((prev) => [...prev, ...data.transcript.lines]);

          if (data.audio_url) {
            const fullUrl = getAudioUrl(audiobook.id, chunkCursor);
            console.log("Setting audio URL:", fullUrl);
            setAudioUrl(fullUrl);
          }

          setCursor(chunkCursor);
          setNextCursor(data.next_cursor);

          // START PREFETCHING NEXT CHUNK IMMEDIATELY
          if (data.next_cursor > chunkCursor) {
            prefetchChunk(data.next_cursor);
          }
        } else {
          if (data.next_cursor > chunkCursor) {
            console.log(
              `Empty chunk, auto-advancing ${chunkCursor} -> ${data.next_cursor}`
            );
            loadingCursorRef.current = null;
            loadChunk(data.next_cursor);
            return;
          } else {
            console.log("End of book reached");
          }
        }
      } catch (err) {
        console.error("Failed to load chunk:", err);
        setError(err instanceof Error ? err.message : "Failed to load chunk");
      } finally {
        setIsLoadingChunk(false);
        loadingCursorRef.current = null;
      }
    },
    [audiobook?.id, prefetchChunk]
  );

  // Initial load
  useEffect(() => {
    if (audiobook?.id) {
      setCursor(0);
      setTranscriptLines([]);
      setNextCursor(0);
      setAudioUrl(null);
      setPrefetchedChunk(null);
      loadingCursorRef.current = null;
      prefetchingCursorRef.current = null;
      loadChunk(0);
    }
  }, [audiobook?.id]);

  // Toggle play/pause
  const handlePlayPause = useCallback(() => {
    if (audioState.isPlaying) {
      controls.pause();
    } else {
      controls.play();
    }
  }, [audioState.isPlaying, controls]);

  // Skip forward (load next chunk)
  const handleSkipForward = useCallback(() => {
    if (prefetchedChunk && prefetchedChunk.cursor === nextCursor) {
      // Use prefetched chunk
      handlePlaybackEnd();
    } else if (nextCursor > cursor && !isLoadingChunk) {
      loadChunk(nextCursor);
    }
  }, [nextCursor, cursor, isLoadingChunk, prefetchedChunk]);

  if (!audiobook) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No audiobook selected</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {audiobook.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {isLoadingChunk
            ? "🎭 Generating..."
            : audioState.isLoading
            ? "🔊 Loading..."
            : audioState.isPlaying
            ? "▶️ Playing"
            : "⏸️ Paused"}
        </Text>
        <View style={styles.statusRight}>
          {isPrefetching && (
            <Text style={styles.prefetchText}>📦 Prefetching...</Text>
          )}
          {prefetchedChunk && (
            <Text style={styles.prefetchReadyText}>✅ Next ready</Text>
          )}
          <Text style={styles.cursorText}>Cursor: {cursor}</Text>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => loadChunk(cursor)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Overlay */}
      {(isLoadingChunk || audioState.isLoading) &&
        transcriptLines.length === 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {isLoadingChunk
                ? "AI is generating your audiobook..."
                : "Loading audio..."}
            </Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        )}

      {/* Transcript Display */}
      <View style={styles.transcriptContainer}>
        <TranscriptDisplay
          lines={transcriptLines}
          currentLineIndex={currentLineIndex}
        />

        {/* Loading indicator for next chunk (only if NOT prefetched) */}
        {isLoadingChunk && transcriptLines.length > 0 && !prefetchedChunk && (
          <View style={styles.chunkLoadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.chunkLoadingText}>
              Generating next scene...
            </Text>
          </View>
        )}
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="play-back" size={32} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playPauseButton,
              (audioState.isLoading || isLoadingChunk) &&
                styles.playPauseButtonDisabled,
            ]}
            onPress={handlePlayPause}
            disabled={audioState.isLoading && transcriptLines.length === 0}
            activeOpacity={0.8}
          >
            {audioState.isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons
                name={audioState.isPlaying ? "pause" : "play"}
                size={48}
                color={colors.white}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSkipForward}
            disabled={
              nextCursor <= cursor || (isLoadingChunk && !prefetchedChunk)
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name="play-forward"
              size={32}
              color={nextCursor > cursor ? colors.white : colors.gray}
            />
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          {transcriptLines.length} lines •{" "}
          {prefetchedChunk ? "Next chunk ready!" : "Loading next..."}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: "center",
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    width: 44,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.secondaryDark,
  },
  statusText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
  },
  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cursorText: {
    color: colors.gray,
    fontSize: typography.sizes.xs,
    fontFamily: "monospace",
  },
  prefetchText: {
    color: "#f39c12",
    fontSize: typography.sizes.xs,
  },
  prefetchReadyText: {
    color: "#27ae60",
    fontSize: typography.sizes.xs,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(231, 76, 60, 0.2)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  errorBannerText: {
    color: "#e74c3c",
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  retryText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  loadingSubtext: {
    color: colors.gray,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
  transcriptContainer: {
    flex: 1,
  },
  chunkLoadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.secondaryDark,
  },
  chunkLoadingText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.sm,
  },
  controlsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryDark,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  controlButton: {
    padding: spacing.md,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playPauseButtonDisabled: {
    opacity: 0.7,
  },
  infoText: {
    color: colors.gray,
    fontSize: typography.sizes.xs,
    textAlign: "center",
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.md,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
});
