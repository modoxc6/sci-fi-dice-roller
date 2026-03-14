import { useState, useRef } from "react";
import DieButton from "@/components/DieButton";
import RollLog, { RollEntry } from "@/components/RollLog";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AnimeText from "@/components/AnimeText";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DICE = [4, 6, 8, 10, 12, 20, 100];

const Index = () => {
  const [rollLog, setRollLog] = useState<RollEntry[]>([]);
  const [lastResult, setLastResult] = useState<{ sides: number; result: number } | null>(null);
  const [rollingDie, setRollingDie] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [diceCounts, setDiceCounts] = useState<Record<number, number>>(
    Object.fromEntries(DICE.map((d) => [d, 1]))
  );

  const handleStartRoll = (sides: number) => {
    setRollingDie(sides);
    setShowResult(false);
  };

  const handleRoll = (sides: number, result: number) => {
    setLastResult({ sides, result });
    setShowResult(true);
    setRollingDie(null);
    setRollLog((prev) => [
      { id: (prev[0]?.id ?? 0) + 1, sides, result, timestamp: new Date() },
      ...prev.slice(0, 49),
    ]);
  };

  const handleMultiRoll = () => {
    const count = Math.max(1, Math.min(99, diceCount));
    setRollingDie(selectedDie);
    setShowResult(false);
    setTimeout(() => {
      const results = Array.from({ length: count }, () => Math.floor(Math.random() * selectedDie) + 1);
      const total = results.reduce((a, b) => a + b, 0);
      setLastResult({ sides: selectedDie, result: total });
      setShowResult(true);
      setRollingDie(null);
      setRollLog((prev) => [
        { id: (prev[0]?.id ?? 0) + 1, sides: selectedDie, result: total, results, count, timestamp: new Date() },
        ...prev.slice(0, 49),
      ]);
    }, 600);
  };

  const dieLabel = (sides: number) => (sides === 100 ? "d%" : `d${sides}`);

  return (
    <div className="min-h-screen flex flex-col items-center bg-background scanline relative overflow-hidden">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6 gap-8">
        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-wider neon-text">
            <AnimeText text="ROLL OR DIE" className="neon-text" />
          </h1>
          <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
            Select your fate
          </p>
        </div>

        {/* Result display */}
        <div className="h-32 flex flex-col items-center justify-center">
          {rollingDie !== null && (
            <span className="font-display text-2xl neon-text-purple animate-pulse">
              Rolling {dieLabel(rollingDie)}...
            </span>
          )}
          {showResult && lastResult && (
            <div className="flex flex-col items-center animate-result-flash">
              <span className="font-display text-6xl md:text-7xl font-black neon-text">
                <AnimeText text={String(lastResult.result)} className="neon-text" />
              </span>
              <span className="font-display text-sm text-muted-foreground tracking-widest mt-1">
                {dieLabel(lastResult.sides)}
              </span>
            </div>
          )}
          {!rollingDie && !showResult && (
            <span className="font-display text-lg text-muted-foreground tracking-widest animate-pulse">
              ⬡ AWAITING INPUT ⬡
            </span>
          )}
        </div>

        {/* Quick Roll panel */}
        <div className="w-full border border-border rounded-lg bg-card neon-box overflow-hidden">
          <div className="flex items-center justify-center px-4 py-3 border-b border-border">
            <h2 className="font-display text-sm tracking-widest uppercase neon-text">
              Quick Roll
            </h2>
          </div>
          <div className="flex justify-between p-4">
            {DICE.map((sides) => (
              <DieButton
                key={sides}
                sides={sides}
                onRoll={handleRoll}
                isRolling={rollingDie === sides}
                onStartRoll={handleStartRoll}
                compact
              />
            ))}
          </div>
          <div className="flex items-center gap-3 px-4 pb-4">
            <Input
              type="number"
              min={1}
              max={99}
              value={diceCount}
              onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center font-display bg-background border-border"
            />
            <span className="font-display text-xs text-muted-foreground tracking-wider">×</span>
            <select
              value={selectedDie}
              onChange={(e) => setSelectedDie(Number(e.target.value))}
              className="font-display text-xs tracking-wider bg-background border border-border rounded-md px-2 py-2 text-foreground"
            >
              {DICE.map((s) => (
                <option key={s} value={s}>{s === 100 ? "d%" : `d${s}`}</option>
              ))}
            </select>
            <Button
              onClick={handleMultiRoll}
              disabled={rollingDie !== null}
              className="flex-1 font-display tracking-widest uppercase text-xs"
            >
              Roll
            </Button>
          </div>
        </div>

        {/* Roll log */}
        <div className="w-full">
          <RollLog entries={rollLog} onClear={() => setRollLog([])} />
        </div>
      </div>
    </div>
  );
};

export default Index;
