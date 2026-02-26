import { useQuery } from "@tanstack/react-query";

export type TextMode = "words" | "quotes";
export type Duration = 15 | 30 | 60;
export type Language = "en" | "th";

export interface TestTextResponse {
  text: string;
  mode: TextMode;
  duration: number;
  lang?: Language;
}

async function fetchTestTexts(
  mode: TextMode,
  duration: Duration,
  lang: Language
): Promise<TestTextResponse> {
  const params = new URLSearchParams({
    mode,
    duration: String(duration),
    lang,
  });
  const res = await fetch(`/api/texts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch test text");
  return res.json();
}

export function useTestTexts(
  mode: TextMode,
  duration: Duration,
  lang: Language
) {
  return useQuery({
    queryKey: ["testTexts", mode, duration, lang],
    queryFn: () => fetchTestTexts(mode, duration, lang),
    enabled: true,
  });
}
