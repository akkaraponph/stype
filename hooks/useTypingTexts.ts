import { useQuery } from "@tanstack/react-query";

export type TextMode = "words" | "quotes" | "time";
export type Duration = 10 | 15 | 25 | 30 | 50 | 60 | 100 | 120;
export type Language = "en" | "th";

export interface TypingTextResponse {
  text: string;
  mode: TextMode;
  duration: number;
  lang?: Language;
}

async function fetchTypingTexts(
  mode: TextMode,
  duration: Duration,
  lang: Language
): Promise<TypingTextResponse> {
  const params = new URLSearchParams({
    mode,
    duration: String(duration),
    lang,
  });
  const res = await fetch(`/api/texts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch typing text");
  return res.json();
}

export function useTypingTexts(
  mode: TextMode,
  duration: Duration,
  lang: Language
) {
  return useQuery({
    queryKey: ["typingTexts", mode, duration, lang],
    queryFn: () => fetchTypingTexts(mode, duration, lang),
    enabled: true,
  });
}
