import { useTheme } from "@/contexts/ThemeContext";

const ANIME_COLORS = [
  "hsl(4 90% 55%)",    // red
  "hsl(45 95% 50%)",   // yellow
  "hsl(220 85% 55%)",  // blue
  "hsl(145 80% 40%)",  // green
];

interface AnimeTextProps {
  text: string;
  className?: string;
}

const AnimeText = ({ text, className = "" }: AnimeTextProps) => {
  const { theme } = useTheme();

  if (theme !== "anime") {
    return <span className={className}>{text}</span>;
  }

  let colorIndex = 0;
  return (
    <span className={className} style={{ WebkitTextStroke: "none" }}>
      {text.split("").map((char, i) => {
        if (char === " ") return <span key={i}> </span>;
        const color = ANIME_COLORS[colorIndex % ANIME_COLORS.length];
        colorIndex++;
        return (
          <span
            key={i}
            style={{
              color,
              WebkitTextStroke: "2px hsl(220 60% 15%)",
              paintOrder: "stroke fill",
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

export default AnimeText;
