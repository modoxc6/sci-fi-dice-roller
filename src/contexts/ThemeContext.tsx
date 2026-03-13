import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "sci-fi" | "fantasy" | "cyberpunk" | "modern" | "apocalypse" | "anime" | "steampunk";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "sci-fi",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>("sci-fi");

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme} className="min-h-screen">{children}</div>
    </ThemeContext.Provider>
  );
};
