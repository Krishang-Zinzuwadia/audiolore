import { useRef, useEffect } from "react";
import { Terminal } from "lucide-react";

interface Props {
  bookId: string | null;
  logs?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function BrainLogs({ bookId, logs }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when logs update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-400 uppercase tracking-wider">
        <Terminal className="w-4 h-4" />
        Brain Logs
      </h2>
      <div
        ref={scrollRef}
        className="h-48 border border-slate-800 rounded-xl bg-slate-950/80 p-4 font-mono text-xs overflow-auto text-green-400"
      >
        <div className="text-slate-500 mb-2">
          // System ready. Waiting for input...
        </div>
        {bookId && (
          <div className="text-indigo-400 mb-2">
            // Session started: {bookId}
          </div>
        )}

        {logs && (
          <div className="animate-in fade-in slide-in-from-left-2 space-y-2">
            <div className="text-slate-500">// Received Transcript Chunk:</div>
            <pre className="whitespace-pre-wrap break-all text-slate-300">
              {JSON.stringify(logs, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
