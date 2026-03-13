import { useState } from "react";

interface DieIconProps {
  sides: number;
  label: string;
}

const dieShapes: Record<number, { points: string; viewBox: string }> = {
  4: { points: "50,5 95,90 5,90", viewBox: "0 0 100 95" },
  6: { points: "10,10 90,10 90,90 10,90", viewBox: "0 0 100 100" },
  8: { points: "50,2 95,50 50,98 5,50", viewBox: "0 0 100 100" },
  12: { points: "50,2 82,18 95,50 82,82 50,98 18,82 5,50 18,18", viewBox: "0 0 100 100" },
  20: { points: "50,2 90,25 90,75 50,98 10,75 10,25", viewBox: "0 0 100 100" },
  100: { points: "20,5 80,5 95,30 95,70 80,95 20,95 5,70 5,30", viewBox: "0 0 100 100" },
};

interface DieButtonProps {
  sides: number;
  onRoll: (sides: number, result: number) => void;
  isRolling: boolean;
  onStartRoll: (sides: number) => void;
}

const DieButton = ({ sides, onRoll, isRolling, onStartRoll }: DieButtonProps) => {
  const shape = dieShapes[sides];
  const label = sides === 100 ? "d%" : `d${sides}`;

  const handleClick = () => {
    if (isRolling) return;
    onStartRoll(sides);
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      onRoll(sides, result);
    }, 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRolling}
      className={`
        group relative flex flex-col items-center gap-2 p-4 rounded-lg
        border border-border bg-card transition-all duration-200
        hover:neon-border hover:neon-box
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isRolling ? "animate-dice-roll" : "hover:scale-110"}
      `}
    >
      <svg
        width="64"
        height="64"
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
          fontSize={sides === 100 ? "18" : "22"}
          fontFamily="Orbitron, sans-serif"
          fontWeight="bold"
        >
          {sides}
        </text>
      </svg>
      <span className="font-display text-xs tracking-widest text-muted-foreground uppercase group-hover:neon-text transition-all">
        {label}
      </span>
    </button>
  );
};

export default DieButton;
