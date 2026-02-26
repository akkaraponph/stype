import { useQuery } from "@tanstack/react-query";
import type { WordLevel } from "@/lib/typing/generator";

export type TextMode = "words" | "quotes" | "time";
export type Duration = 10 | 15 | 25 | 30 | 50 | 60 | 100 | 120;
export type Language = "en" | "th";
export type { WordLevel };

export interface TypingTextResponse {
  text: string;
  mode: TextMode;
  duration: number;
  lang?: Language;
}

async function fetchTypingTexts(
  mode: TextMode,
  duration: Duration,
  lang: Language,
  levels: WordLevel[]
): Promise<TypingTextResponse> {
  const params = new URLSearchParams({
    mode,
    duration: String(duration),
    lang,
  });
  if (levels.length > 0 && levels.length < 3) {
    params.set("levels", levels.join(","));
  }
  const res = await fetch(`/api/texts?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch typing text");
  return res.json();
}

export function useTypingTexts(
  mode: TextMode,
  duration: Duration,
  lang: Language,
  levels: WordLevel[] = ["easy", "medium", "hard"]
) {
  return useQuery({
    queryKey: ["typingTexts", mode, duration, lang, levels.join(",")],
    queryFn: () => fetchTypingTexts(mode, duration, lang, levels),
    enabled: true,
  });
}
