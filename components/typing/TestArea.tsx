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
        className={`relative font-mono text-xl leading-relaxed tracking-wide text-zinc-600 dark:text-zinc-400 ${className}`}
      >
      <div
        className="min-h-[4rem] cursor-text select-none break-words text-base sm:text-xl"
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

            let style = "text-zinc-400 dark:text-zinc-500";
            if (isCorrect) style = "text-zinc-800 dark:text-zinc-200";
            if (isIncorrect)
              style =
                "text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20";
            if (isCurrent)
              style += " relative after:content-['|'] after:animate-pulse after:ml-[-2px] after:text-zinc-900 dark:after:text-zinc-100";

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
