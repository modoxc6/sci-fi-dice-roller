export interface RollEntry {
  id: number;
  sides: number;
  result: number;
  results?: number[];
  count?: number;
  poolLabel?: string;
  timestamp: Date;
}

interface RollLogProps {
  entries: RollEntry[];
  onClear: () => void;
}

const RollLog = ({ entries, onClear }: RollLogProps) => {
  const dieLabel = (sides: number) => (sides === 100 ? "d%" : `d${sides}`);

  return (
    <div className="w-full border border-border rounded-lg bg-card neon-box overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display text-sm tracking-widest uppercase neon-text">
          Roll Log
        </h2>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="font-display text-xs tracking-wider uppercase text-muted-foreground hover:neon-text-pink transition-all"
          >
            Clear
          </button>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto scanline">
        {entries.length === 0 ? (
          <p className="px-4 py-6 text-center text-muted-foreground text-sm">
            No rolls yet. Select a die to begin.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry, i) => (
              <li
                key={entry.id}
                className="flex items-center justify-between px-4 py-2 animate-log-slide"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                    <span className="font-display text-xs text-muted-foreground w-14">
                    {entry.count && entry.count > 1 ? `${entry.count}${dieLabel(entry.sides)}` : dieLabel(entry.sides)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {entry.results && entry.results.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      [{entry.results.join(", ")}]
                    </span>
                    <span className="font-display text-lg font-bold neon-text">
                      = {entry.result}
                    </span>
                  </div>
                ) : (
                  <span className="font-display text-lg font-bold neon-text">
                    {entry.result}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RollLog;
