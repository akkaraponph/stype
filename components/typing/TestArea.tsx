"use client";

import { forwardRef, useRef, useCallback, useLayoutEffect, useState } from "react";

export interface TestAreaProps {
  text: string;
  input: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref != null) (ref as React.MutableRefObject<T | null>).current = value;
}

const TestArea = forwardRef<HTMLInputElement, TestAreaProps>(
  function TestArea({ text, input, onKeyDown, disabled, className = "" }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
      null
    );
    const chars = text.split("");
    const inputChars = input.split("");

    const measureCursor = useCallback(() => {
      const container = containerRef.current;
      if (!container || chars.length === 0) {
        setCursorPos(null);
        return;
      }
      const atEnd = input.length >= chars.length;
      const spanIndex = atEnd ? chars.length - 1 : input.length;
      const span = spanRefs.current[spanIndex];
      if (!span) {
        setCursorPos(null);
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();
      const x =
        spanRect.left -
        containerRect.left +
        (atEnd ? spanRect.width : 0);
      const y = spanRect.top - containerRect.top;
      setCursorPos({ x, y });
    }, [input.length, chars.length, text]);

    useLayoutEffect(() => {
      measureCursor();
      const container = containerRef.current;
      if (!container) return;
      const ro = new ResizeObserver(measureCursor);
      ro.observe(container);
      return () => ro.disconnect();
    }, [measureCursor]);

    const setRefs = useCallback(
      (el: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        setRef(ref, el);
      },
      [ref]
    );

    return (
      <div
        className={`relative font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/50 px-5 sm:px-6 py-5 sm:py-6 ${className}`}
      >
        <div
          ref={containerRef}
          className="relative min-h-[5rem] cursor-text select-none break-words text-lg sm:text-xl md:text-2xl leading-relaxed sm:leading-loose tracking-wide text-zinc-500 dark:text-zinc-400"
          onClick={() => inputRef.current?.focus()}
          role="button"
          tabIndex={-1}
          onKeyDown={() => {}}
          aria-label="Focus to start typing"
        >
          {chars.map((char, i) => {
            const typed = inputChars[i];
            const isCorrect = typed !== undefined && typed === char;
            const isIncorrect = typed !== undefined && typed !== char;

            let style = "text-zinc-500 dark:text-zinc-400";
            if (isCorrect) style = "text-zinc-900 dark:text-zinc-100 font-medium";
            if (isIncorrect)
              style =
                "text-red-600 dark:text-red-400 bg-red-100/60 dark:bg-red-900/30 rounded-sm";

            return (
              <span
                key={i}
                ref={(el) => {
                  spanRefs.current[i] = el;
                }}
                className={style}
              >
                {char}
              </span>
            );
          })}
          {cursorPos !== null && (
            <span
              className="absolute left-0 top-0 h-[1.15em] w-0.5 rounded-sm bg-zinc-900 dark:bg-zinc-100 animate-pulse pointer-events-none transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
              }}
              aria-hidden
            />
          )}
        </div>
        <input
          ref={setRefs}
          type="text"
          value={input}
          readOnly
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-hidden
          tabIndex={0}
          disabled={disabled}
          onKeyDown={onKeyDown}
          onPaste={(e) => e.preventDefault()}
          className="absolute inset-0 w-full opacity-0 cursor-text"
        />
      </div>
    );
  }
);

export default TestArea;
