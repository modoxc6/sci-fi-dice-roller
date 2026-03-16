import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Dice1, RotateCcw, Plus, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AnimeText from "@/components/AnimeText";

type DieSize = 4 | 6 | 8 | 10 | 12;

interface PoolEntry {
  label: string;
  die: DieSize;
}

interface StepConfig {
  key: string;
  label: string;
  mandatory: boolean;
  options: DieSize[];
  multi?: boolean;
  guidance?: string;
}

const STEPS: StepConfig[] = [
  { key: "name", label: "Name", mandatory: true, options: [6, 8, 10, 12] },
  { key: "occupation", label: "Occupation", mandatory: false, options: [6, 8, 10] },
  { key: "capability", label: "Capability", mandatory: true, options: [6, 8, 10] },
  { key: "advantage", label: "Advantage", mandatory: false, options: [6, 8, 10, 12] },
  { key: "trust", label: "Trust", mandatory: false, options: [6, 8, 10, 12], multi: true, guidance: "Spend trust to use another competitor's name die" },
  { key: "capability2", label: "Second Capability", mandatory: false, options: [6, 8, 10], guidance: "Mark fatigue to use a second capability" },
  { key: "acquisition", label: "Acquisition", mandatory: false, options: [4], multi: true },
];

const POOL1_STEPS = STEPS.slice(0, 6);
const POOL2_STEPS = STEPS.slice(6);

const dieLabel = (sides: number) => `d${sides}`;

const DeathmatchIsland = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, DieSize[]>>({});
  const [phase, setPhase] = useState<"build" | "rolling" | "results">("build");
  const [rollResults, setRollResults] = useState<{ pool1: number[]; pool2: number[]; pool1Result: number; pool2Result: number; total: number } | null>(null);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const canProceed = () => {
    if (!step.mandatory) return true;
    const sel = selections[step.key];
    return sel && sel.length > 0;
  };

  const handleSelect = (die: DieSize) => {
    setSelections((prev) => {
      const current = prev[step.key] || [];
      if (step.multi) {
        return { ...prev, [step.key]: [...current, die] };
      }
      // Toggle single selection
      if (current.length === 1 && current[0] === die) {
        return { ...prev, [step.key]: [] };
      }
      return { ...prev, [step.key]: [die] };
    });
  };

  const handleRemoveMulti = (index: number) => {
    setSelections((prev) => {
      const current = [...(prev[step.key] || [])];
      current.splice(index, 1);
      return { ...prev, [step.key]: current };
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      handleRoll();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) setCurrentStep((s) => s - 1);
  };

  const handleSkip = () => {
    if (!step.mandatory) {
      setSelections((prev) => ({ ...prev, [step.key]: [] }));
      if (isLastStep) {
        handleRoll();
      } else {
        setCurrentStep((s) => s + 1);
      }
    }
  };

  const handleRoll = () => {
    setPhase("rolling");
    setTimeout(() => {
      // Gather pool 1 dice
      const pool1Dice: DieSize[] = [];
      POOL1_STEPS.forEach((s) => {
        (selections[s.key] || []).forEach((d) => pool1Dice.push(d));
      });
      // Gather pool 2 dice
      const pool2Dice: DieSize[] = [];
      POOL2_STEPS.forEach((s) => {
        (selections[s.key] || []).forEach((d) => pool2Dice.push(d));
      });

      const pool1Rolls = pool1Dice.map((d) => Math.floor(Math.random() * d) + 1);
      const pool2Rolls = pool2Dice.map((d) => Math.floor(Math.random() * d) + 1);

      // Pool 1: top 2
      const pool1Sorted = [...pool1Rolls].sort((a, b) => b - a);
      const pool1Result = (pool1Sorted[0] || 0) + (pool1Sorted[1] || 0);

      // Pool 2: top 1
      const pool2Result = pool2Rolls.length > 0 ? Math.max(...pool2Rolls) : 0;

      setRollResults({
        pool1: pool1Rolls,
        pool2: pool2Rolls,
        pool1Result,
        pool2Result,
        total: pool1Result + pool2Result,
      });
      setPhase("results");
    }, 1200);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelections({});
    setPhase("build");
    setRollResults(null);
  };

  // Build pool summary for display
  const poolSummary = useMemo(() => {
    const pool1: { step: string; dice: DieSize[] }[] = [];
    const pool2: { step: string; dice: DieSize[] }[] = [];
    POOL1_STEPS.forEach((s) => {
      const d = selections[s.key] || [];
      if (d.length > 0) pool1.push({ step: s.label, dice: d });
    });
    POOL2_STEPS.forEach((s) => {
      const d = selections[s.key] || [];
      if (d.length > 0) pool2.push({ step: s.label, dice: d });
    });
    return { pool1, pool2 };
  }, [selections]);

  const currentPool = currentStep < 6 ? 1 : 2;

  return (
    <div className="min-h-screen flex flex-col items-center bg-background scanline relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6 gap-6">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-xs tracking-widest uppercase text-muted-foreground hover:neon-text transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <ThemeSwitcher />
        </div>

        <div className="text-center space-y-1">
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-wider neon-text">
            <AnimeText text="DEATHMATCH ISLAND" className="neon-text" />
          </h1>
          <p className="font-display text-xs tracking-widest text-muted-foreground uppercase">
            Dice Roller
          </p>
        </div>

        {phase === "build" && (
          <>
            {/* Progress */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[10px] tracking-widest uppercase text-muted-foreground">
                  Pool {currentPool} — Step {currentStep + 1} of {STEPS.length}
                </span>
                <span className="font-display text-[10px] tracking-widest uppercase text-muted-foreground">
                  {step.mandatory ? "Required" : "Optional"}
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Card */}
            <div className="w-full border border-border rounded-lg bg-card neon-box overflow-hidden">
              {/* Step Header */}
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-display text-xl font-bold tracking-wider neon-text">
                  {step.label}
                </h2>
                {step.guidance && (
                  <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded bg-muted/50 border border-border">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{step.guidance}</p>
                  </div>
                )}
              </div>

              {/* Die Options */}
              <div className="px-6 py-6">
                <p className="text-xs text-muted-foreground mb-4 font-display tracking-wider uppercase">
                  {step.multi ? "Select dice (click to add)" : "Select a die"}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {step.options.map((die) => {
                    const selected = !step.multi && (selections[step.key] || []).includes(die);
                    return (
                      <button
                        key={die}
                        onClick={() => handleSelect(die)}
                        className={`
                          relative flex items-center justify-center w-20 h-20 rounded-lg
                          border-2 transition-all duration-200 font-display text-lg font-bold
                          ${selected
                            ? "border-primary bg-primary/20 neon-text scale-110"
                            : "border-border bg-card hover:border-primary/50 hover:scale-105 text-foreground"
                          }
                        `}
                      >
                        {dieLabel(die)}
                      </button>
                    );
                  })}
                </div>

                {/* Multi-select display */}
                {step.multi && (selections[step.key] || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {(selections[step.key] || []).map((die, i) => (
                      <span
                        key={i}
                        onClick={() => handleRemoveMulti(i)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-primary/50 bg-primary/10 text-sm font-display neon-text cursor-pointer hover:bg-destructive/20 hover:border-destructive/50 transition-all"
                      >
                        {dieLabel(die)}
                        <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isFirstStep}
                  className="font-display text-xs tracking-wider uppercase gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {!step.mandatory && (
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                      className="font-display text-xs tracking-wider uppercase"
                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="font-display text-xs tracking-wider uppercase gap-1"
                  >
                    {isLastStep ? "Roll!" : "Next"}
                    {isLastStep ? <Dice1 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Pool Overview */}
            <div className="w-full grid grid-cols-2 gap-4">
              <PoolPreview title="Pool 1 — Action" entries={poolSummary.pool1} rule="Top 2 dice" />
              <PoolPreview title="Pool 2 — Acquisition" entries={poolSummary.pool2} rule="Top 1 die" />
            </div>
          </>
        )}

        {phase === "rolling" && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="font-display text-2xl neon-text-purple animate-pulse tracking-wider">
              Rolling dice...
            </div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === "results" && rollResults && (
          <ResultsSummary
            rollResults={rollResults}
            poolSummary={poolSummary}
            selections={selections}
            onReset={handleReset}
            onReroll={handleRoll}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

function PoolPreview({
  title,
  entries,
  rule,
}: {
  title: string;
  entries: { step: string; dice: DieSize[] }[];
  rule: string;
}) {
  return (
    <div className="border border-border rounded-lg bg-card neon-box p-4">
      <h3 className="font-display text-xs tracking-widest uppercase neon-text mb-2">{title}</h3>
      <p className="text-[10px] text-muted-foreground mb-2 italic">{rule}</p>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No dice yet</p>
      ) : (
        <div className="space-y-1">
          {entries.map((e) => (
            <div key={e.step} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{e.step}</span>
              <span className="font-display neon-text">{e.dice.map(dieLabel).join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsSummary({
  rollResults,
  poolSummary,
  selections,
  onReset,
  onReroll,
}: {
  rollResults: { pool1: number[]; pool2: number[]; pool1Result: number; pool2Result: number; total: number };
  poolSummary: { pool1: { step: string; dice: DieSize[] }[]; pool2: { step: string; dice: DieSize[] }[] };
  selections: Record<string, DieSize[]>;
  onReset: () => void;
  onReroll: () => void;
}) {
  const pool1Sorted = [...rollResults.pool1].sort((a, b) => b - a);
  const pool2Sorted = [...rollResults.pool2].sort((a, b) => b - a);

  return (
    <div className="w-full space-y-6 animate-result-flash">
      {/* Total */}
      <div className="text-center">
        <p className="font-display text-xs tracking-widest uppercase text-muted-foreground mb-1">Total Score</p>
        <div className="font-display text-7xl md:text-8xl font-black neon-text">
          <AnimeText text={String(rollResults.total)} className="neon-text" />
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
          <span className="font-display neon-text">{rollResults.pool1Result}</span>
          <span>+</span>
          <span className="font-display neon-text-purple">{rollResults.pool2Result}</span>
        </div>
      </div>

      {/* Pool Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pool 1 */}
        <div className="border border-border rounded-lg bg-card neon-box p-4">
          <h3 className="font-display text-xs tracking-widest uppercase neon-text mb-1">Pool 1 — Action</h3>
          <p className="text-[10px] text-muted-foreground mb-3 italic">Sum of top 2 dice</p>
          {rollResults.pool1.length === 0 ? (
            <p className="text-xs text-muted-foreground">No dice rolled</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {pool1Sorted.map((val, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 font-display font-bold text-sm
                    ${i < 2 ? "border-primary bg-primary/20 neon-text" : "border-border bg-muted text-muted-foreground line-through opacity-60"}`}
                >
                  {val}
                </span>
              ))}
            </div>
          )}
          <div className="text-right font-display text-xl font-bold neon-text">
            = {rollResults.pool1Result}
          </div>
        </div>

        {/* Pool 2 */}
        <div className="border border-border rounded-lg bg-card neon-box p-4">
          <h3 className="font-display text-xs tracking-widest uppercase neon-text-purple mb-1">Pool 2 — Acquisition</h3>
          <p className="text-[10px] text-muted-foreground mb-3 italic">Highest single die</p>
          {rollResults.pool2.length === 0 ? (
            <p className="text-xs text-muted-foreground">No dice rolled</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {pool2Sorted.map((val, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 font-display font-bold text-sm
                    ${i === 0 ? "border-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple)/0.2)] neon-text-purple" : "border-border bg-muted text-muted-foreground line-through opacity-60"}`}
                >
                  {val}
                </span>
              ))}
            </div>
          )}
          <div className="text-right font-display text-xl font-bold neon-text-purple">
            = {rollResults.pool2Result}
          </div>
        </div>
      </div>

      {/* Source breakdown */}
      <div className="border border-border rounded-lg bg-card neon-box p-4">
        <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground mb-3">Dice Sources</h3>
        <div className="space-y-1 text-xs">
          {poolSummary.pool1.map((e) => (
            <div key={e.step} className="flex justify-between">
              <span className="text-muted-foreground">{e.step}</span>
              <span className="font-display neon-text">{e.dice.map(dieLabel).join(", ")}</span>
            </div>
          ))}
          {poolSummary.pool2.map((e) => (
            <div key={e.step} className="flex justify-between">
              <span className="text-muted-foreground">{e.step}</span>
              <span className="font-display neon-text-purple">{e.dice.map(dieLabel).join(", ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onReroll} className="font-display text-xs tracking-wider uppercase gap-2">
          <RotateCcw className="w-4 h-4" />
          Re-Roll
        </Button>
        <Button onClick={onReset} className="font-display text-xs tracking-wider uppercase gap-2">
          <ArrowLeft className="w-4 h-4" />
          New Roll
        </Button>
      </div>
    </div>
  );
}

export default DeathmatchIsland;
