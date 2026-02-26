"use client";

import { forwardRef } from "react";

export interface TestAreaProps {
  text: string;
  input: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

const TestArea = forwardRef<HTMLInputElement, TestAreaProps>(
  function TestArea({ text, input, onKeyDown, disabled, className = "" }, ref) {
    const chars = text.split("");
    const inputChars = input.split("");

    return (
      <div
        className={`relative font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/50 px-5 sm:px-6 py-5 sm:py-6 ${className}`}
      >
        <div
          className="min-h-[5rem] cursor-text select-none break-words text-lg sm:text-xl md:text-2xl leading-relaxed sm:leading-loose tracking-wide text-zinc-500 dark:text-zinc-400"
          onClick={() => (ref as React.RefObject<HTMLInputElement>)?.current?.focus()}
          role="button"
          tabIndex={-1}
          onKeyDown={() => {}}
          aria-label="Focus to start typing"
        >
          {chars.map((char, i) => {
            const typed = inputChars[i];
            const isCurrent = i === input.length;
            const isCorrect = typed !== undefined && typed === char;
            const isIncorrect = typed !== undefined && typed !== char;

            let style = "text-zinc-500 dark:text-zinc-400";
            if (isCorrect) style = "text-zinc-900 dark:text-zinc-100 font-medium";
            if (isIncorrect)
              style =
                "text-red-600 dark:text-red-400 bg-red-100/60 dark:bg-red-900/30 rounded-sm";
            if (isCurrent)
              style += " relative after:content-[''] after:absolute after:left-0 after:top-0 after:h-[1.15em] after:w-0.5 after:bg-zinc-900 dark:after:bg-zinc-100 after:animate-pulse after:rounded-sm";

            return (
              <span key={i} className={style}>
                {char}
              </span>
            );
          })}
        </div>
        <input
          ref={ref}
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-hidden
          tabIndex={0}
          disabled={disabled}
          onKeyDown={onKeyDown}
          className="absolute inset-0 w-full opacity-0 cursor-text"
        />
      </div>
    );
  }
);

export default TestArea;
