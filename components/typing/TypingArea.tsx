"use client";

import { memo, forwardRef, useRef, useCallback, useLayoutEffect, useState, useMemo } from "react";

export interface TypingAreaProps {
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

const TypingArea = memo(forwardRef<HTMLInputElement, TypingAreaProps>(
  function TypingArea({ text, input, onKeyDown, disabled, className = "" }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
      null
    );
    const chars = useMemo(() => text.split(""), [text]);
    const inputChars = input.split("");

    const words = useMemo(() => {
      let currentIndex = 0;
      return text.split(/(\s+)/).map((part) => {
        const isWhitespace = /^\s+$/.test(part);
        const startIndex = currentIndex;
        currentIndex += part.length;
        return {
          part,
          isWhitespace,
          startIndex,
          chars: part.split("").map((char, localIdx) => ({
            char,
            index: startIndex + localIdx,
          })),
        };
      });
    }, [text]);

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

      // Ensure the current character is visible (3-line limit simulation)
      const isVisible =
        spanRect.top >= containerRect.top &&
        spanRect.bottom <= containerRect.bottom;

      if (!isVisible) {
        span.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
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
        className={`relative font-mono bg-transparent px-0 py-4 ${className}`}
      >
        <div
          ref={containerRef}
          className="relative min-h-[6.75rem] max-h-[6.75rem] overflow-hidden cursor-text select-none text-2xl leading-[2.25rem] transition-all duration-300"
          onClick={() => inputRef.current?.focus()}
          role="button"
          tabIndex={-1}
          onKeyDown={() => {}}
          aria-label="Focus to start typing"
        >
          {words.map((word, partIdx) => (
            <span
              key={partIdx}
              className={word.isWhitespace ? "inline" : "inline-block mx-[0.12rem]"}
            >
              {word.chars.map(({ char, index: i }) => {
                const typed = inputChars[i];
                const isCorrect = typed !== undefined && typed === char;
                const isIncorrect = typed !== undefined && typed !== char;

                let style = "relative";
                if (isCorrect) {
                  style += " text-foreground";
                } else if (isIncorrect) {
                  style += " text-error";
                } else {
                  style += " text-sub";
                }

                return (
                  <span
                    key={i}
                    ref={(el) => {
                      spanRefs.current[i] = el;
                    }}
                    className={style}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </span>
          ))}
          {cursorPos !== null && (
            <div
              className={`absolute w-0.5 h-[1.5rem] bg-caret transition-all duration-150 ease-out animate-pulse pointer-events-none z-10`}
              style={{
                top: 0,
                left: 0,
                transform: `translate(${cursorPos.x}px, ${cursorPos.y + 6}px)`,
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
          className="fixed left-[-9999px] top-0 opacity-0 pointer-events-none"
        />
      </div>
    );
  }
));
TypingArea.displayName = "TypingArea";

export default TypingArea;
