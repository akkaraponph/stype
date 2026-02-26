import {
  getQuote,
  getWords,
  type Language,
} from "@/lib/typing/generator";
import { NextRequest, NextResponse } from "next/server";

export type TextMode = "words" | "quotes";
export type Duration = 10 | 15 | 25 | 30 | 50 | 60 | 100 | 120;

const VALID_LANGS: Language[] = ["en", "th"];
const VALID_DURATIONS: Duration[] = [10, 15, 25, 30, 50, 60, 100, 120];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") ?? "words") as TextMode;
  const duration = Number(searchParams.get("duration") ?? 60) as number;
  const langParam = searchParams.get("lang") ?? "en";
  const lang = VALID_LANGS.includes(langParam as Language)
    ? (langParam as Language)
    : "en";

  const d = VALID_DURATIONS.includes(duration as Duration) ? (duration as Duration) : 60;
  const m = mode === "quotes" ? "quotes" : "words";

  let text: string;
  if (m === "quotes") {
    text = getQuote(lang);
  } else {
    const wordCountMap: Record<number, number> = {
      10: 80,
      15: 120,
      25: 200,
      30: 250,
      50: 400,
      60: 500,
      100: 800,
      120: 1000,
    };
    const wordCount = wordCountMap[d] ?? Math.max(d * 8, 80);
    text = getWords(wordCount, lang);
  }

  return NextResponse.json({ text, mode: m, duration: d, lang });
}
