import { Users, Mic2 } from "lucide-react";

const MOCK_CAST = [
  { id: "narrator", name: "The Narrator", voice: "onyx", gender: "male" },
  { id: "am", name: "AM", voice: "echo", gender: "male" },
  { id: "ted", name: "Ted", voice: "alloy", gender: "male" },
  { id: "ellen", name: "Ellen", voice: "shimmer", gender: "female" },
  { id: "gorrister", name: "Gorrister", voice: "fable", gender: "male" },
  { id: "nimdok", name: "Nimdok", voice: "onyx", gender: "male" },
  { id: "benny", name: "Benny", voice: "nova", gender: "female" }, // As per story changes sometimes?
];

export default function CastingRoom() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-400">
        <Users className="w-5 h-5" />
        Casting Room
      </h2>
      <div className="space-y-2">
        {MOCK_CAST.map((char) => (
          <div
            key={char.id}
            className="p-3 border border-slate-800 rounded-lg bg-slate-900/50 flex items-center justify-between group hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                {char.name.slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">
                  {char.name}
                </div>
                <div className="text-xs text-slate-500 uppercase flex items-center gap-1">
                  {char.gender}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 font-mono">
                {char.voice}
              </span>
              <Mic2 className="w-3 h-3 text-slate-600" />
            </div>
          </div>
        ))}

        <div className="p-3 text-center text-xs text-slate-600 italic border border-dashed border-slate-800 rounded-lg">
          + Cast registry integration coming soon
        </div>
      </div>
    </div>
  );
}
