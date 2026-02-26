"use client";

import type { Duration, Language, TextMode, WordLevel } from "@/hooks/useTypingTexts";

const LEVELS: WordLevel[] = ["easy", "medium", "hard"];

export interface ControlsProps {
  mode: TextMode;
  duration: Duration;
  language: Language;
  levels: WordLevel[];
  onModeChange: (mode: TextMode) => void;
  onDurationChange: (duration: Duration) => void;
  onLanguageChange: (language: Language) => void;
  onLevelsChange: (levels: WordLevel[]) => void;
  onRestart: () => void;
  disabled?: boolean;
  className?: string;
}

const DURATIONS: Duration[] = [15, 30, 60, 120];

function toggleLevel(current: WordLevel[], level: WordLevel): WordLevel[] {
  const has = current.includes(level);
  if (has) {
    const next = current.filter((l) => l !== level);
    return next.length ? next : LEVELS;
  }
  const next = [...current, level].sort(
    (a, b) => LEVELS.indexOf(a) - LEVELS.indexOf(b)
  );
  return next;
}

export default function Controls({
  mode,
  duration,
  language,
  levels,
  onModeChange,
  onDurationChange,
  onLanguageChange,
  onLevelsChange,
  onRestart,
  disabled,
  className = "",
}: ControlsProps) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-6 mb-12 bg-sub/5 p-4 rounded-xl transition-all duration-500 ${className}`}
      role="group"
      aria-label="Typing settings"
    >
      <div className="flex items-center gap-2 border-r border-sub/20 pr-6">
        <button
          onClick={() => onModeChange("time" as any)}
          className={`text-sm transition-colors px-2 py-1 ${mode === ("time" as any) ? "text-main" : "text-sub hover:text-main"}`}
          disabled={disabled}
        >
          time
        </button>
        <button
          onClick={() => onModeChange("words")}
          className={`text-sm transition-colors px-2 py-1 ${mode === "words" ? "text-main" : "text-sub hover:text-main"}`}
          disabled={disabled}
        >
          words
        </button>
        <button
          onClick={() => onModeChange("quotes")}
          className={`text-sm transition-colors px-2 py-1 ${mode === "quotes" ? "text-main" : "text-sub hover:text-main"}`}
          disabled={disabled}
        >
          quote
        </button>
      </div>

      <div className="flex items-center gap-2">
        {mode === "words" ? (
          [10, 25, 50, 100].map((val) => (
            <button
              key={val}
              onClick={() => onDurationChange(val as any)}
              className={`text-sm transition-colors px-2 py-1 ${duration === val ? "text-main" : "text-sub hover:text-main"}`}
              disabled={disabled}
            >
              {val}
            </button>
          ))
        ) : (
          DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`text-sm transition-colors px-2 py-1 ${duration === d ? "text-main" : "text-sub hover:text-main"}`}
              disabled={disabled}
            >
              {d}
            </button>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 border-l border-sub/20 pl-6">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onLevelsChange(toggleLevel(levels, level))}
            className={`text-sm transition-colors px-2 py-1 capitalize ${levels.includes(level) ? "text-main" : "text-sub hover:text-main"}`}
            disabled={disabled}
            title={`Word level: ${level}`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-l border-sub/20 pl-6">
        <button
          onClick={() => onLanguageChange("en")}
          className={`text-sm transition-colors px-2 py-1 ${language === "en" ? "text-main" : "text-sub hover:text-main"}`}
          disabled={disabled}
        >
          english
        </button>
        <button
          onClick={() => onLanguageChange("th")}
          className={`text-sm transition-colors px-2 py-1 ${language === "th" ? "text-main" : "text-sub hover:text-main"}`}
          disabled={disabled}
        >
          thai
        </button>
      </div>

      <button
        aria-label="Restart"
        onClick={onRestart}
        className="hidden"
      />
    </div>
  );
}
