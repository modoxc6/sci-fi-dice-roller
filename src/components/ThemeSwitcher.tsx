import { useState, useRef, useEffect } from "react";
import { useTheme, ThemeName } from "@/contexts/ThemeContext";
import { ChevronDown } from "lucide-react";

const themes: { key: ThemeName; label: string }[] = [
  { key: "sci-fi", label: "Sci-Fi" },
  { key: "fantasy", label: "Fantasy" },
  { key: "cyberpunk", label: "Cyberpunk" },
  { key: "modern", label: "Modern" },
  { key: "apocalypse", label: "Apocalypse" },
  { key: "anime", label: "Anime" },
  { key: "steampunk", label: "Steampunk" },
  { key: "vaporwave", label: "Vaporwave" },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = themes.find((t) => t.key === theme)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-mono text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all"
      >
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 min-w-[140px] border border-border rounded-md bg-card neon-box py-1">
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTheme(t.key); setOpen(false); }}
              className={`block w-full text-left px-4 py-1.5 font-mono text-xs tracking-wider uppercase transition-all ${
                theme === t.key
                  ? "text-primary neon-text font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
