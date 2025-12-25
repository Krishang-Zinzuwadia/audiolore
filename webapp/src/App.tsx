import { useState } from "react";
import { Layout } from "lucide-react";
import Library from "./components/Library";
import CastingRoom from "./components/CastingRoom";
import DirectorPlayer from "./components/DirectorPlayer";
import BrainLogs from "./components/BrainLogs";

function App() {
  const [bookId, setBookId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Clear logs when session resets
  const handleReset = () => {
    setBookId(null);
    setLogs(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Layout className="w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight">
              Audiolore{" "}
              <span className="text-slate-500 font-normal">Director</span>
            </h1>
          </div>
          {bookId && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">
                Session ID:{" "}
                <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">
                  {bookId.slice(0, 8)}...
                </code>
              </span>
              <button
                onClick={handleReset}
                className="text-red-400 hover:text-red-300 transition-colors text-xs uppercase font-medium tracking-wider"
              >
                Reset Session
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-12">
        {/* Section 1: The Library */}
        {!bookId && (
          <section className="max-w-xl mx-auto mt-20">
            <Library onUploadSuccess={setBookId} />
          </section>
        )}

        {bookId && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Section 3: Director Player (Main Stage) */}
              <div className="lg:col-span-2 space-y-8">
                <DirectorPlayer bookId={bookId} onChunkLoaded={setLogs} />
              </div>

              {/* Section 2: Casting Room (Sidebar) */}
              <div className="space-y-8">
                <CastingRoom />
              </div>
            </div>

            {/* Section 4: Logs */}
            <BrainLogs bookId={bookId} logs={logs} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
