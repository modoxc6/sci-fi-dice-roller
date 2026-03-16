import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimeText from "@/components/AnimeText";

type DieSize = 4 | 6 | 8 | 10 | 12;

interface StepConfig {
  key: string;
  label: string;
  mandatory: boolean;
  options: DieSize[];
  multi?: boolean;
  guidance?: string;
  pool: 1 | 2;
}

const STEPS: StepConfig[] = [
  { key: "name", label: "Name", mandatory: true, options: [6, 8, 10, 12], pool: 1 },
  { key: "occupation", label: "Occupation", mandatory: false, options: [6, 8, 10], pool: 1 },
  { key: "capability", label: "Capability", mandatory: true, options: [6, 8, 10], pool: 1 },
  { key: "advantage", label: "Advantage", mandatory: false, options: [6, 8, 10, 12], pool: 1 },
  { key: "trust", label: "Trust", mandatory: false, options: [6, 8, 10, 12], multi: true, guidance: "Spend trust to use another competitor's name die", pool: 1 },
  { key: "capability2", label: "Second Capability", mandatory: false, options: [6, 8, 10], guidance: "Mark fatigue to use a second capability", pool: 1 },
  { key: "acquisition", label: "Acquisition", mandatory: false, options: [4], multi: true, pool: 2 },
];

const dieLabel = (sides: number) => `d${sides}`;

const DeathmatchIsland = () => {
  const [selections, setSelections] = useState<Record<string, DieSize[]>>({});
  const [phase, setPhase] = useState<"build" | "rolling" | "results">("build");
  const [rollResults, setRollResults] = useState<{
    pool1: number[]; pool2: number[];
    pool1Result: number; pool2Result: number; total: number;
  } | null>(null);

  const handleSelect = (stepKey: string, die: DieSize, multi?: boolean) => {
    setSelections((prev) => {
      const current = prev[stepKey] || [];
      if (multi) {
        return { ...prev, [stepKey]: [...current, die] };
      }
      if (current.length === 1 && current[0] === die) {
        return { ...prev, [stepKey]: [] };
      }
      return { ...prev, [stepKey]: [die] };
    });
  };

  const handleRemoveMulti = (stepKey: string, index: number) => {
    setSelections((prev) => {
      const current = [...(prev[stepKey] || [])];
      current.splice(index, 1);
      return { ...prev, [stepKey]: current };
    });
  };

  const canRoll = () => {
    return STEPS.filter((s) => s.mandatory).every((s) => (selections[s.key] || []).length > 0);
  };

  const handleRoll = () => {
    setPhase("rolling");
    setTimeout(() => {
      const pool1Dice: DieSize[] = [];
      const pool2Dice: DieSize[] = [];
      STEPS.forEach((s) => {
        (selections[s.key] || []).forEach((d) => {
          if (s.pool === 1) pool1Dice.push(d);
          else pool2Dice.push(d);
        });
      });

      const pool1Rolls = pool1Dice.map((d) => Math.floor(Math.random() * d) + 1);
      const pool2Rolls = pool2Dice.map((d) => Math.floor(Math.random() * d) + 1);

      const pool1Sorted = [...pool1Rolls].sort((a, b) => b - a);
      const pool1Result = (pool1Sorted[0] || 0) + (pool1Sorted[1] || 0);
      const pool2Result = pool2Rolls.length > 0 ? Math.max(...pool2Rolls) : 0;

      setRollResults({ pool1: pool1Rolls, pool2: pool2Rolls, pool1Result, pool2Result, total: pool1Result + pool2Result });
      setPhase("results");
    }, 1200);
  };

  const handleReset = () => {
    setSelections({});
    setPhase("build");
    setRollResults(null);
  };

  return (
    <div className="min-h-screen dmi-theme">
      {/* Top bar */}
      <div className="w-full border-b border-border px-6 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors font-display"
        >
          <ArrowLeft className="w-4 h-4" />
          Roll or Die
        </Link>
        <span className="font-display text-xs tracking-widest uppercase text-muted-foreground">
          Deathmatch Island
        </span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {phase === "build" && (
          <div className="flex flex-col items-center">
            {/* Title box — dashed border like reference */}
            <div className="w-full border-2 border-dashed border-primary/40 rounded-lg px-6 py-4 text-center">
              <h1 className="font-display text-2xl md:text-3xl font-black tracking-wider text-primary">
                Deathmatch Island
              </h1>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Roll Builder</p>
            </div>

            <VerticalArrow />

            {/* Pool 1 container */}
            <div className="w-full border-2 border-foreground/20 rounded-lg overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/10">
                <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Pool One</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Action — Sum of top 2 dice</p>
              </div>
              <div className="px-4 py-4 space-y-0">
                {STEPS.filter((s) => s.pool === 1).map((step, i, arr) => (
                  <div key={step.key}>
                    <StepRow
                      step={step}
                      selected={selections[step.key] || []}
                      onSelect={(die) => handleSelect(step.key, die, step.multi)}
                      onRemove={(idx) => handleRemoveMulti(step.key, idx)}
                    />
                    {i < arr.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-px h-4 bg-foreground/15" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <VerticalArrow label="Between Pools" />

            {/* Pool 2 container */}
            <div className="w-full border-2 border-foreground/20 rounded-lg overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/10">
                <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Pool Two</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Acquisition — Highest single die</p>
              </div>
              <div className="px-4 py-4">
                {STEPS.filter((s) => s.pool === 2).map((step) => (
                  <StepRow
                    key={step.key}
                    step={step}
                    selected={selections[step.key] || []}
                    onSelect={(die) => handleSelect(step.key, die, step.multi)}
                    onRemove={(idx) => handleRemoveMulti(step.key, idx)}
                  />
                ))}
              </div>
            </div>

            <VerticalArrow />

            {/* Roll button */}
            <button
              onClick={handleRoll}
              disabled={!canRoll()}
              className={`
                w-full py-4 rounded-lg font-display text-lg font-bold tracking-widest uppercase transition-all
                ${canRoll()
                  ? "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              Roll Dice
            </button>

            {!canRoll() && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Select dice for all required steps (Name, Capability)
              </p>
            )}
          </div>
        )}

        {phase === "rolling" && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="font-display text-2xl text-primary animate-pulse tracking-wider">
              Rolling dice...
            </div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === "results" && rollResults && (
          <ResultsSummary rollResults={rollResults} selections={selections} onReset={handleReset} onReroll={handleRoll} />
        )}
      </div>
    </div>
  );
};

/* ─── Vertical Arrow Connector ─── */
function VerticalArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-px h-6 bg-foreground/20" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground/20" />
      {label && (
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{label}</span>
      )}
    </div>
  );
}

/* ─── Step Row ─── */
function StepRow({
  step,
  selected,
  onSelect,
  onRemove,
}: {
  step: StepConfig;
  selected: DieSize[];
  onSelect: (die: DieSize) => void;
  onRemove: (idx: number) => void;
}) {
  const hasSelection = selected.length > 0;

  return (
    <div
      className={`rounded-lg border-2 transition-all px-4 py-3 ${
        step.mandatory
          ? hasSelection
            ? "border-primary bg-primary/10"
            : "border-primary/40 bg-card"
          : hasSelection
            ? "border-foreground/20 bg-primary/10"
            : "border-dashed border-foreground/15 bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className={`font-display text-sm font-bold tracking-wider ${hasSelection ? "text-primary" : "text-foreground"}`}>
            {step.label}
          </h3>
          {step.mandatory ? (
            <span className="text-[9px] uppercase tracking-widest bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-display font-bold">
              Required
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-display">
              Optional
            </span>
          )}
        </div>
        {hasSelection && !step.multi && (
          <span className="font-display text-sm font-bold text-primary">{dieLabel(selected[0])}</span>
        )}
      </div>

      {step.guidance && (
        <div className="flex items-start gap-1.5 mb-2">
          <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground italic">{step.guidance}</p>
        </div>
      )}

      {/* Die options */}
      <div className="flex flex-wrap gap-2">
        {step.options.map((die) => {
          const isSelected = !step.multi && selected.includes(die);
          return (
            <button
              key={die}
              onClick={() => onSelect(die)}
              className={`
                px-3 py-1.5 rounded text-xs font-display font-bold tracking-wider transition-all
                ${isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 border border-foreground/10 text-foreground hover:border-primary/50 hover:bg-primary/5"
                }
              `}
            >
              {dieLabel(die)}
            </button>
          );
        })}
      </div>

      {/* Multi-select chips */}
      {step.multi && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((die, i) => (
            <span
              key={i}
              onClick={() => onRemove(i)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-display cursor-pointer hover:opacity-80 transition-opacity"
            >
              {dieLabel(die)}
              <X className="w-3 h-3" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Results ─── */
function ResultsSummary({
  rollResults,
  selections,
  onReset,
  onReroll,
}: {
  rollResults: { pool1: number[]; pool2: number[]; pool1Result: number; pool2Result: number; total: number };
  selections: Record<string, DieSize[]>;
  onReset: () => void;
  onReroll: () => void;
}) {
  const pool1Sorted = [...rollResults.pool1].sort((a, b) => b - a);
  const pool2Sorted = [...rollResults.pool2].sort((a, b) => b - a);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Total — big dashed box */}
      <div className="w-full border-2 border-dashed border-primary/40 rounded-lg px-6 py-6 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Score</p>
        <div className="font-display text-7xl md:text-8xl font-black text-primary">
          {rollResults.total}
        </div>
        <div className="flex items-center justify-center gap-3 mt-2 text-sm text-muted-foreground font-display">
          <span className="text-primary font-bold">{rollResults.pool1Result}</span>
          <span>+</span>
          <span className="text-foreground font-bold">{rollResults.pool2Result}</span>
        </div>
      </div>

      <VerticalArrow />

      {/* Pool 1 result */}
      <div className="w-full border-2 border-foreground/20 rounded-lg overflow-hidden">
        <div className="px-6 py-3 border-b border-foreground/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Pool One</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Sum of top 2 dice</p>
          </div>
          <span className="font-display text-2xl font-black text-primary">= {rollResults.pool1Result}</span>
        </div>
        <div className="px-6 py-4 flex flex-wrap gap-2">
          {pool1Sorted.map((val, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-display font-bold text-sm transition-all
                ${i < 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground line-through opacity-50"
                }`}
            >
              {val}
            </span>
          ))}
        </div>
      </div>

      {rollResults.pool2.length > 0 && (
        <>
          <VerticalArrow />

          {/* Pool 2 result */}
          <div className="w-full border-2 border-foreground/20 rounded-lg overflow-hidden">
            <div className="px-6 py-3 border-b border-foreground/10 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Pool Two</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Highest single die</p>
              </div>
              <span className="font-display text-2xl font-black text-primary">= {rollResults.pool2Result}</span>
            </div>
            <div className="px-6 py-4 flex flex-wrap gap-2">
              {pool2Sorted.map((val, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-display font-bold text-sm
                    ${i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground line-through opacity-50"
                    }`}
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <VerticalArrow />

      {/* Actions */}
      <div className="flex gap-4 w-full">
        <button
          onClick={onReroll}
          className="flex-1 py-3 rounded-lg border-2 border-dashed border-foreground/20 font-display text-sm font-bold tracking-widest uppercase text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Re-Roll
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          New Roll
        </button>
      </div>
    </div>
  );
}

export default DeathmatchIsland;
