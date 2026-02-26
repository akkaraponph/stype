"use client";

import type { Duration, Language, TextMode } from "@/hooks/useTestTexts";

export interface ControlsProps {
  mode: TextMode;
  duration: Duration;
  language: Language;
  onModeChange: (mode: TextMode) => void;
  onDurationChange: (duration: Duration) => void;
  onLanguageChange: (language: Language) => void;
  onRestart: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Controls({
  mode,
  duration,
  language,
  onModeChange,
  onDurationChange,
  onLanguageChange,
  onRestart,
  disabled,
  className = "",
}: ControlsProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm ${className}`}
      role="group"
      aria-label="Test settings"
    >
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 dark:text-zinc-400">Language</span>
        <button
          type="button"
          onClick={() => onLanguageChange("en")}
          disabled={disabled}
          className={`rounded px-3 py-2 min-h-[2.5rem] transition-colors touch-manipulation ${
            language === "en"
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange("th")}
          disabled={disabled}
          className={`rounded px-3 py-2 min-h-[2.5rem] transition-colors touch-manipulation ${
            language === "th"
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          ไทย
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 dark:text-zinc-400">Mode</span>
        <button
          type="button"
          onClick={() => onModeChange("words")}
          disabled={disabled}
          className={`rounded px-3 py-2 min-h-[2.5rem] transition-colors touch-manipulation ${
            mode === "words"
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          Words
        </button>
        <button
          type="button"
          onClick={() => onModeChange("quotes")}
          disabled={disabled}
          className={`rounded px-3 py-2 min-h-[2.5rem] transition-colors touch-manipulation ${
            mode === "quotes"
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          Quote
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 dark:text-zinc-400">Duration</span>
        <button
          type="button"
          onClick={() => onDurationChange(15)}
          disabled={disabled}
          className={`rounded px-3 py-2 min-h-[2.5rem] transition-colors touch-manipulation ${
            duration === 15
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          15s
        </button>
        <button
          type="button"
          onClick={() => onDurationChange(30)}
          disabled={disabled}
          className={`rounded px-3 py-2 min-h-[2.5rem] transition-colors touch-manipulation ${
            duration === 30
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          30s
        </button>
        <button
          type="button"
          onClick={() => onDurationChange(60)}
          disabled={disabled}
          className={`rounded px-3 py-2 min-h-[2.5rem] transition-colors touch-manipulation ${
            duration === 60
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          60s
        </button>
      </div>
      <button
        type="button"
        onClick={onRestart}
        disabled={disabled}
        className="rounded px-3 py-2 min-h-[2.5rem] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation"
      >
        Restart
      </button>
    </div>
  );
}
