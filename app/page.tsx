"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TestArea from "@/components/typing/TestArea";
import Controls from "@/components/typing/Controls";
import StatsBar from "@/components/typing/StatsBar";
import ResultsPanel from "@/components/typing/ResultsPanel";
import ThemeSwitch from "@/components/ThemeSwitch";
import HistoryPanel from "@/components/typing/HistoryPanel";
import { useTypingHistory } from "@/hooks/useTypingHistory";
import {
  accuracy,
  avgKeyInterval,
  consistencyScore,
  keyIntervals,
  wpm,
} from "@/lib/typing/metrics";
import {
  useTestTexts,
  type Duration,
  type TextMode,
} from "@/hooks/useTestTexts";

function countCorrectChars(expected: string, input: string): number {
  let n = 0;
  for (let i = 0; i < input.length && i < expected.length; i++) {
    if (input[i] === expected[i]) n++;
  }
  return n;
}

/** Bucket key timestamps into 5s windows and return cumulative WPM per bucket. */
function wpmBucketsFromTimestamps(
  timestamps: number[],
  expected: string,
  input: string,
  durationSec: number
): number[] {
  if (timestamps.length === 0) return [];
  const bucketSec = 5;
  const buckets: number[] = [];
  const start = timestamps[0]!;
  for (let t = bucketSec; t <= durationSec; t += bucketSec) {
    const end = start + t * 1000;
    let lastIdx = -1;
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i]! <= end) lastIdx = i;
    }
    if (lastIdx < 0) {
      buckets.push(0);
      continue;
    }
    const len = lastIdx + 1;
    const inputSlice = input.slice(0, len);
    const expectedSlice = expected.slice(0, len);
    const correct = countCorrectChars(expectedSlice, inputSlice);
    buckets.push(wpm(correct, t / 60));
  }
  if (buckets.length === 0) {
    const correct = countCorrectChars(expected, input);
    buckets.push(wpm(correct, Math.max(durationSec, 1) / 60));
  }
  return buckets;
}

export default function Home() {
  const [mode, setMode] = useState<TextMode>("words");
  const [duration, setDuration] = useState<Duration>(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [keyTimestamps, setKeyTimestamps] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: textData, refetch } = useTestTexts(mode, duration);
  const text = textData?.text ?? "";
  const { history, addEntry, clearHistory } = useTypingHistory();
  const savedRef = useRef(false);

  const endTest = useCallback(() => {
    setFinished(true);
  }, []);

  useEffect(() => {
    if (!started || finished || startTime == null) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const sec = Math.floor((now - startTime) / 1000);
      setElapsed(sec);
      if (sec >= duration) {
        endTest();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [started, finished, startTime, duration, endTest]);

  useEffect(() => {
    if (finished || !text) return;
    if (input.length >= text.length) endTest();
  }, [input, text, finished, endTest]);

  const correctChars = countCorrectChars(text, input);
  const minutes = elapsed / 60 || 0.001;
  const currentWpm = wpm(correctChars, minutes);
  const currentAccuracy = accuracy(correctChars, input.length);
  const avgInterval = avgKeyInterval(keyTimestamps);
  const intervals = keyIntervals(keyTimestamps);
  const consistency = intervals.length >= 2 ? consistencyScore(intervals) : undefined;

  const wpmBuckets =
    finished && startTime != null
      ? wpmBucketsFromTimestamps(keyTimestamps, text, input, duration)
      : [];

  // Save result to history when test finishes
  useEffect(() => {
    if (finished && !savedRef.current) {
      savedRef.current = true;
      addEntry({
        wpm: currentWpm,
        accuracy: currentAccuracy,
        avgIntervalMs: avgInterval,
        consistency,
        mode,
        duration,
        wpmBuckets,
      });
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (finished || !text) return;

      if (e.key === "Escape" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        savedRef.current = false;
        setStarted(false);
        setFinished(false);
        setInput("");
        setStartTime(null);
        setKeyTimestamps([]);
        setElapsed(0);
        refetch();
        return;
      }

      if (e.repeat) return;
      if (e.nativeEvent.isComposing) return;

      if (!started) {
        setStarted(true);
        setStartTime(Date.now());
        setKeyTimestamps([Date.now()]);
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setInput((prev) => prev.slice(0, -1));
        setKeyTimestamps((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setInput((prev) => {
          if (prev.length >= text.length) return prev;
          setKeyTimestamps((ts) => [...ts, Date.now()]);
          return prev + e.key;
        });
      }
    },
    [finished, text, started, refetch]
  );

  const restartSame = useCallback(() => {
    savedRef.current = false;
    setStarted(false);
    setFinished(false);
    setInput("");
    setStartTime(null);
    setKeyTimestamps([]);
    setElapsed(0);
    refetch();
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [refetch]);

  const changeSettings = useCallback(() => {
    savedRef.current = false;
    setStarted(false);
    setFinished(false);
    setInput("");
    setStartTime(null);
    setKeyTimestamps([]);
    setElapsed(0);
  }, []);

  if (!textData && text === "") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="py-4 sm:py-6 flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-2 w-full">
          <h1 className="text-lg sm:text-xl font-medium text-zinc-700 dark:text-zinc-300">
            slowlytype
          </h1>
          <ThemeSwitch />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Esc or Ctrl+R to restart
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <Controls
          mode={mode}
          duration={duration}
          onModeChange={(m) => {
            savedRef.current = false;
            setMode(m);
            setInput("");
            setStarted(false);
            setFinished(false);
            setStartTime(null);
            setKeyTimestamps([]);
            setElapsed(0);
          }}
          onDurationChange={(d) => {
            savedRef.current = false;
            setDuration(d);
            setInput("");
            setStarted(false);
            setFinished(false);
            setStartTime(null);
            setKeyTimestamps([]);
            setElapsed(0);
          }}
          onRestart={restartSame}
          disabled={started && !finished}
        />

        <div className="mt-8 w-full max-w-3xl">
          <TestArea
            ref={inputRef}
            text={text}
            input={input}
            onKeyDown={handleKeyDown}
            disabled={finished}
          />
        </div>

        <StatsBar
          className="mt-8"
          wpm={currentWpm}
          accuracy={currentAccuracy}
          elapsedSeconds={elapsed}
          avgKeyIntervalMs={avgInterval}
          consistency={consistency}
        />

        {finished && (
          <div className="mt-8 w-full max-w-md">
            <ResultsPanel
              wpm={currentWpm}
              accuracy={currentAccuracy}
              avgKeyIntervalMs={avgInterval}
              consistency={consistency}
              wpmBuckets={wpmBuckets}
              onRestartSame={restartSame}
              onChangeSettings={changeSettings}
            />
          </div>
        )}

        <HistoryPanel
          history={history}
          onClear={clearHistory}
          className="mt-8"
        />
      </main>
    </div>
  );
}
