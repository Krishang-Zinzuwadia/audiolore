import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface Props {
  bookId: string;
  onChunkLoaded?: (chunk: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface TranscriptLine {
  speaker: string;
  text: string;
  voice_id?: string;
}

export default function DirectorPlayer({ bookId, onChunkLoaded }: Props) {
  const [cursor, setCursor] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextCursor, setNextCursor] = useState(0);

  // Ref to track if we are currently loading a specific cursor to prevent double-fetch in StrictMode
  const loadingCursorRef = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper to generate color from string (Voice ID)
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  const loadChunk = useCallback(
    async (currentCursor: number) => {
      // Prevent double fetch for same cursor
      if (loadingCursorRef.current === currentCursor) return;
      loadingCursorRef.current = currentCursor;

      setIsLoading(true);
      try {
        console.log(`Fetching transcript for cursor ${currentCursor}`);
        const res = await api.get(`/books/${bookId}/transcript`, {
          params: { cursor: currentCursor },
        });

        const data = res.data;
        // Data format: { transcript: { lines: [...] }, next_cursor: int, audio_url: string }

        const hasLines =
          data.transcript &&
          data.transcript.lines &&
          data.transcript.lines.length > 0;

        if (hasLines) {
          setTranscript((prev) => [...prev, ...data.transcript.lines]);
          if (onChunkLoaded) onChunkLoaded(data.transcript);

          if (data.audio_url) {
            const fullAudioUrl = `http://localhost:8000${data.audio_url}`;
            console.log("Setting audio URL:", fullAudioUrl);
            setAudioUrl(fullAudioUrl);
          } else {
            setAudioUrl(null);
          }

          setNextCursor(data.next_cursor);
        } else {
          console.log("Received empty transcript chunk.");
          setAudioUrl(null); // Ensure we don't play empty audio

          if (data.next_cursor > currentCursor) {
            console.log(
              `Auto-advancing empty chunk: ${currentCursor} -> ${data.next_cursor}`
            );
            // Update cursor and fetch immediately
            setCursor(data.next_cursor);
            // We must clear ref locally or rely on finally block?
            // If we recursively call, the ref logic might overlap, but since we are "done" with this cursor essentially...
            // Let's release the lock for CURRENT cursor before starting NEXT one, strictly speaking.
            loadingCursorRef.current = null;
            loadChunk(data.next_cursor);
            return; // Clean exit, skip finally block handling for THIS call's lock (we manually cleared it) or let it run
          } else {
            console.log("End of book (empty chunk + no progress).");
            setNextCursor(data.next_cursor);
          }
        }
      } catch (err) {
        console.error("Failed to load chunk", err);
      } finally {
        setIsLoading(false);
        loadingCursorRef.current = null;
      }
    },
    [bookId, onChunkLoaded]
  );

  // Initial load
  useEffect(() => {
    // Reset state on new book
    setCursor(0);
    setTranscript([]);
    setNextCursor(0);
    setAudioUrl(null);
    loadingCursorRef.current = null;

    // Fetch first chunk
    loadChunk(0);

    // Cleanup: cancel any ongoing stuff if we switch books (simplified)
    return () => {
      setTranscript([]);
    };
  }, [bookId]); // Depend ONLY on bookId for the reset. loadChunk is stable via useCallback.

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleAudioEnded = () => {
    if (nextCursor > cursor) {
      console.log(`Audio ended. Advancing to cursor ${nextCursor}`);
      setCursor(nextCursor);
      loadChunk(nextCursor);
    } else {
      console.log("End of script reached or no progress.");
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-400">
          <Play className="w-5 h-5" />
          The Director
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-mono">
            Cursor: {cursor}
          </span>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          )}
        </div>
      </div>

      {/* Transcript View */}
      <div
        ref={scrollRef}
        className="h-[500px] border border-slate-800 rounded-xl bg-slate-950 p-6 overflow-y-auto space-y-4 shadow-inner"
      >
        {transcript.length === 0 && !isLoading && (
          <div className="text-center text-slate-600 italic mt-20">
            Waiting for script...
          </div>
        )}

        {transcript.map((line, idx) => {
          const isNarrator =
            line.speaker === "Narrator" || line.speaker === "narrator";
          const charColor = isNarrator
            ? "#94a3b8"
            : stringToColor(line.speaker || "Unknown");

          return (
            <div
              key={idx}
              className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div
                className="w-24 shrink-0 text-right text-xs font-bold uppercase tracking-wider py-1"
                style={{ color: charColor }}
              >
                {line.speaker}
              </div>
              <div className="flex-1 text-slate-300 leading-relaxed font-serif text-lg border-l border-slate-800 pl-4 py-1">
                {line.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-center p-4">
            <span className="text-xs text-indigo-400 animate-pulse">
              Generating next scene...
            </span>
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 pl-0.5" />
          )}
        </button>

        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500/30 w-full animate-pulse"></div>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          autoPlay
          controls // Added controls for debugging
          onEnded={handleAudioEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => console.error("Audio Error", e)}
          className="block h-8 w-64" // Made visible for now
        />

        <button className="text-slate-500 hover:text-slate-300">
          <SkipForward className="w-5 h-5" onClick={handleAudioEnded} />
        </button>
      </div>
    </div>
  );
}
