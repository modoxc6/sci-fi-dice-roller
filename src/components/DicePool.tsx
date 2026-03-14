import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DICE = [4, 6, 8, 10, 12, 20, 100];

const dieShapes: Record<number, { points: string; viewBox: string }> = {
  4: { points: "50,5 95,90 5,90", viewBox: "0 0 100 95" },
  6: { points: "10,10 90,10 90,90 10,90", viewBox: "0 0 100 100" },
  8: { points: "50,2 95,50 50,98 5,50", viewBox: "0 0 100 100" },
  10: { points: "50,2 85,30 85,70 50,98 15,70 15,30", viewBox: "0 0 100 100" },
  12: { points: "50,2 82,18 95,50 82,82 50,98 18,82 5,50 18,18", viewBox: "0 0 100 100" },
  20: { points: "50,2 90,25 90,75 50,98 10,75 10,25", viewBox: "0 0 100 100" },
  100: { points: "20,5 80,5 95,30 95,70 80,95 20,95 5,70 5,30", viewBox: "0 0 100 100" },
};

const dieLabel = (sides: number) => (sides === 100 ? "d%" : `d${sides}`);

interface DicePoolProps {
  onRollPool: (pool: number[]) => void;
  isRolling: boolean;
}

const DicePool = ({ onRollPool, isRolling }: DicePoolProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pool, setPool] = useState<number[]>([]);

  const addDie = (sides: number) => {
    if (pool.length >= 20) return;
    setPool((prev) => [...prev, sides]);
  };

  const removeDie = (index: number) => {
    setPool((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoll = () => {
    if (pool.length === 0 || isRolling) return;
    onRollPool([...pool]);
    setPool([]);
  };

  return (
    <div className="w-full border border-border rounded-lg bg-card neon-box overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full px-4 py-3 border-b border-border gap-2"
      >
        <h2 className="font-display text-sm tracking-widest uppercase neon-text">
          Build a Dice Pool
        </h2>
        <ChevronDown
          className={`h-4 w-4 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Dice selector row */}
          <div className="flex justify-between">
            {DICE.map((sides) => {
              const shape = dieShapes[sides];
              return (
                <button
                  key={sides}
                  onClick={() => addDie(sides)}
                  disabled={pool.length >= 20}
                  className="group relative flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card transition-all duration-200 hover:neon-border hover:neon-box disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                >
                  <svg
                    width={48}
                    height={48}
                    viewBox={shape.viewBox}
                    className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] transition-all group-hover:drop-shadow-[0_0_16px_hsl(var(--primary)/0.8)]"
                  >
                    <polygon
                      points={shape.points}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      className="transition-all group-hover:fill-[hsl(var(--primary)/0.1)]"
                    />
                    <text
                      x="50%"
                      y="55%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill="hsl(var(--primary))"
                      fontSize={sides === 100 ? "14" : "18"}
                      fontFamily="Orbitron, sans-serif"
                      fontWeight="bold"
                    >
                      {sides}
                    </text>
                  </svg>
                  <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase group-hover:neon-text transition-all">
                    {dieLabel(sides)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pool display + Roll button */}
          {pool.length > 0 && (
            <div className="flex items-center gap-2 border-t border-border pt-4">
              <div className="flex flex-wrap gap-1.5 flex-1 min-h-[36px]">
                {pool.map((sides, index) => {
                  const shape = dieShapes[sides];
                  return (
                    <button
                      key={index}
                      onClick={() => removeDie(index)}
                      title={`Remove ${dieLabel(sides)}`}
                      className="group relative flex items-center justify-center rounded border border-border bg-card hover:border-destructive hover:bg-destructive/10 transition-all duration-150"
                      style={{ width: 32, height: 32 }}
                    >
                      <svg
                        width={24}
                        height={24}
                        viewBox={shape.viewBox}
                      >
                        <polygon
                          points={shape.points}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2.5"
                          className="group-hover:stroke-[hsl(var(--destructive))] transition-all"
                        />
                        <text
                          x="50%"
                          y="55%"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fill="hsl(var(--primary))"
                          fontSize={sides === 100 ? "22" : "28"}
                          fontFamily="Orbitron, sans-serif"
                          fontWeight="bold"
                          className="group-hover:fill-[hsl(var(--destructive))]"
                        >
                          {sides}
                        </text>
                      </svg>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleRoll}
                disabled={isRolling}
                className="flex-shrink-0 font-display text-xs tracking-wider uppercase px-4 py-2 rounded border border-border bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Roll Pool
              </button>
            </div>
          )}

          {pool.length > 0 && (
            <p className="text-xs text-muted-foreground font-mono text-center">
              {pool.length}/20 dice
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DicePool;
