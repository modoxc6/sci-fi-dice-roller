import { useTheme, ThemeName } from "@/contexts/ThemeContext";

const themes: { key: ThemeName; label: string }[] = [
  { key: "sci-fi", label: "Sci-Fi" },
  { key: "fantasy", label: "Fantasy" },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-4 font-mono text-sm tracking-wider">
      {themes.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          className={`uppercase transition-all duration-200 ${
            theme === t.key
              ? "text-primary neon-text font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
