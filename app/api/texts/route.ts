import {
  getQuote,
  getWords,
  type Language,
} from "@/lib/typing/generator";
import { NextRequest, NextResponse } from "next/server";

export type TextMode = "words" | "quotes";
export type Duration = 15 | 30 | 60;

const VALID_LANGS: Language[] = ["en", "th"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") ?? "words") as TextMode;
  const duration = Number(searchParams.get("duration") ?? 60) as Duration;
  const langParam = searchParams.get("lang") ?? "en";
  const lang = VALID_LANGS.includes(langParam as Language)
    ? (langParam as Language)
    : "en";

  const validDurations = [15, 30, 60];
  const d = validDurations.includes(duration) ? duration : 60;
  const m = mode === "quotes" ? "quotes" : "words";

  let text: string;
  if (m === "quotes") {
    text = getQuote(lang);
  } else {
    const wordCount = d;
    text = getWords(wordCount, lang);
  }

  return NextResponse.json({ text, mode: m, duration: d, lang });
}
