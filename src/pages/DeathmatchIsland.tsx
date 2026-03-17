import { useState, useMemo, useRef, useEffect } from "react";
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
  const [isRolling, setIsRolling] = useState(false);
  const [rollResults, setRollResults] = useState<{
    pool1: number[]; pool2: number[];
    pool1Result: number; pool2Result: number; total: number;
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    setIsRolling(true);
    setRollResults(null);
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
      setIsRolling(false);
    }, 1200);
  };

  const handleReset = () => {
    setSelections({});
    setRollResults(null);
  };

  // Scroll to results when they appear
  useEffect(() => {
    if (rollResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [rollResults]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <div className="w-full border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors font-display"
        >
          <ArrowLeft className="w-4 h-4" />
          Roll or Die
        </Link>
        <span className="font-display text-xs tracking-widest uppercase text-gray-500">
          Deathmatch Island
        </span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4">
        {/* Build phase — always visible */}
        <div className="flex flex-col items-center">
          {/* Title box */}
          <div className="w-full border-2 border-dashed border-dmi-accent/40 rounded-lg px-6 py-3 text-center">
            <h1 className="font-display text-2xl md:text-3xl font-black tracking-wider text-dmi-accent">
              Deathmatch Island
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Roll Builder</p>
          </div>

          <VerticalArrow />

          {/* Pool 1 container */}
          <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100">
              <h2 className="font-display text-base font-bold tracking-wider text-gray-900">Pool One</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Action — Sum of top 2 dice</p>
            </div>
            <div className="px-3 py-2 space-y-0">
              {STEPS.filter((s) => s.pool === 1).map((step, i, arr) => (
                <div key={step.key}>
                  <StepRow
                    step={step}
                    selected={selections[step.key] || []}
                    onSelect={(die) => handleSelect(step.key, die, step.multi)}
                    onRemove={(idx) => handleRemoveMulti(step.key, idx)}
                  />
                  {i < arr.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-px h-2 bg-gray-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <VerticalArrow />

          {/* Pool 2 container */}
          <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100">
              <h2 className="font-display text-base font-bold tracking-wider text-gray-900">Pool Two</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Acquisition — Highest single die</p>
            </div>
            <div className="px-3 py-2">
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
            disabled={!canRoll() || isRolling}
            className={`
              w-full py-3 rounded-lg font-display text-base font-bold tracking-widest uppercase transition-all
              ${canRoll() && !isRolling
                ? "bg-dmi-accent text-dmi-accent-foreground hover:opacity-90 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {isRolling ? "Rolling..." : rollResults ? "Re-Roll" : "Roll Dice"}
          </button>

          {!canRoll() && !rollResults && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Select dice for all required steps (Name, Capability)
            </p>
          )}
        </div>

        {/* Rolling animation */}
        {isRolling && (
          <div className="flex flex-col items-center justify-center h-32 gap-4 mt-6">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm bg-dmi-accent animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results — inline below builder */}
        {rollResults && !isRolling && (
          <div ref={resultsRef} className="mt-8 pt-6 border-t-2 border-dashed border-dmi-accent/30">
            <ResultsSummary rollResults={rollResults} selections={selections} onReset={handleReset} onReroll={handleRoll} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Vertical Arrow Connector ─── */
function VerticalArrow() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-4 bg-gray-300" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-300" />
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
            ? "border-dmi-accent bg-dmi-accent/10"
            : "border-dmi-accent/40 bg-gray-50"
          : hasSelection
            ? "border-gray-200 bg-dmi-accent/10"
            : "border-dashed border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className={`font-display text-sm font-bold tracking-wider ${hasSelection ? "text-dmi-accent" : "text-gray-900"}`}>
            {step.label}
          </h3>
          {step.mandatory ? (
            <span className="text-[9px] uppercase tracking-widest bg-dmi-accent text-dmi-accent-foreground px-1.5 py-0.5 rounded font-display font-bold">
              Required
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-display">
              Optional
            </span>
          )}
        </div>
        {hasSelection && !step.multi && (
          <span className="font-display text-sm font-bold text-dmi-accent">{dieLabel(selected[0])}</span>
        )}
      </div>

      {step.guidance && (
        <div className="flex items-start gap-1.5 mb-2">
          <Info className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 italic">{step.guidance}</p>
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
                  ? "bg-dmi-accent text-dmi-accent-foreground"
                  : "bg-gray-100 border border-gray-200 text-gray-900 hover:border-dmi-accent/50 hover:bg-dmi-accent/5"
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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-dmi-accent text-dmi-accent-foreground text-xs font-display cursor-pointer hover:opacity-80 transition-opacity"
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
      <div className="w-full border-2 border-dashed border-dmi-accent/40 rounded-lg px-6 py-6 text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Score</p>
        <div className="font-display text-7xl md:text-8xl font-black text-dmi-accent">
          {rollResults.total}
        </div>
        <div className="flex items-center justify-center gap-3 mt-2 text-sm text-gray-500 font-display">
          <span className="text-dmi-accent font-bold">{rollResults.pool1Result}</span>
          <span>+</span>
          <span className="text-gray-900 font-bold">{rollResults.pool2Result}</span>
        </div>
      </div>

      <VerticalArrow />

      {/* Pool 1 result */}
      <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider text-gray-900">Pool One</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Sum of top 2 dice</p>
          </div>
          <span className="font-display text-2xl font-black text-dmi-accent">= {rollResults.pool1Result}</span>
        </div>
        <div className="px-6 py-4 flex flex-wrap gap-2">
          {pool1Sorted.map((val, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-display font-bold text-sm transition-all
                ${i < 2
                  ? "bg-dmi-accent text-dmi-accent-foreground"
                  : "bg-gray-200 text-gray-400 line-through opacity-50"
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
          <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold tracking-wider text-gray-900">Pool Two</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Highest single die</p>
              </div>
              <span className="font-display text-2xl font-black text-dmi-accent">= {rollResults.pool2Result}</span>
            </div>
            <div className="px-6 py-4 flex flex-wrap gap-2">
              {pool2Sorted.map((val, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-display font-bold text-sm
                    ${i === 0
                      ? "bg-dmi-accent text-dmi-accent-foreground"
                      : "bg-gray-200 text-gray-400 line-through opacity-50"
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
          className="flex-1 py-3 rounded-lg border-2 border-dashed border-gray-300 font-display text-sm font-bold tracking-widest uppercase text-gray-900 hover:border-dmi-accent/40 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Re-Roll
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-lg bg-dmi-accent text-dmi-accent-foreground font-display text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          New Roll
        </button>
      </div>
    </div>
  );
}

export default DeathmatchIsland;