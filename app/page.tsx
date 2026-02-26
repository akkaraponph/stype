"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TypingArea from "@/components/typing/TypingArea";
import Controls from "@/components/typing/Controls";
import StatsBar from "@/components/typing/StatsBar";
import ResultsPanel from "@/components/typing/ResultsPanel";
import ThemeSwitch from "@/components/ThemeSwitch";
import HistoryPanel from "@/components/typing/HistoryPanel";
import { AuthModal } from "@/components/AuthModal";
import { useTypingHistory } from "@/hooks/useTypingHistory";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";
import {
  accuracy,
  avgKeyInterval,
  consistencyScore,
  keyIntervals,
  wpm,
} from "@/lib/typing/metrics";
import {
  useTypingTexts,
  type Duration,
  type Language,
  type TextMode,
} from "@/hooks/useTypingTexts";

type View = "typing" | "account" | "settings";

function countCorrectChars(expected: string, input: string): number {
  let n = 0;
  for (let i = 0; i < input.length && i < expected.length; i++) {
    if (input[i] === expected[i]) n++;
  }
  return n;
}

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
  const [view, setView] = useState<View>("typing");
  const [mode, setMode] = useState<TextMode>("words");
  const [duration, setDuration] = useState<Duration>(60);
  const [language, setLanguage] = useState<Language>("en");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [keyTimestamps, setKeyTimestamps] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const { data: textData, refetch } = useTypingTexts(mode, duration, language);
  const text = textData?.text ?? "";
  const { user, loading: sessionLoading, signIn, signOut, signInWithCredentials, register } = useSession();
  const { history, addEntry, clearHistory, historyLoading } = useTypingHistory(user);
  const savedRef = useRef(false);

  const endTyping = useCallback(() => {
    setFinished(true);
  }, []);

  useEffect(() => {
    if (!started || finished || startTime == null) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const sec = Math.floor((now - startTime) / 1000);
      setElapsed(sec);
      if (sec >= duration) {
        endTyping();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [started, finished, startTime, duration, endTyping]);

  useEffect(() => {
    if (finished || !text) return;
    if (input.length >= text.length) endTyping();
  }, [input, text, finished, endTyping]);

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
        language,
        wpmBuckets,
      });
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        restartSame();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [restartSame]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (finished || !text) return;

      if (e.key === "Escape" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        restartSame();
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
    [finished, text, started, restartSame]
  );

  const changeSettings = useCallback(() => {
    savedRef.current = false;
    setStarted(false);
    setFinished(false);
    setInput("");
    setStartTime(null);
    setKeyTimestamps([]);
    setElapsed(0);
  }, []);

  const switchView = (v: View) => {
    setView(v);
    if (v === "typing") restartSame();
  };

  // Show auth error from callback and clear from URL
  const [authError, setAuthError] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (err) {
      setAuthError(decodeURIComponent(err));
      const u = new URL(window.location.href);
      u.searchParams.delete("auth_error");
      window.history.replaceState({}, "", u.pathname + u.search);
    }
  }, []);

  if (!textData && text === "") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-sub">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8 md:p-12 lg:p-20 bg-background text-foreground font-sans transition-all duration-250">
      {/* Header */}
      <header className={`flex justify-between items-center mb-12 transition-opacity duration-500 ${started && !finished ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tighter font-mono flex items-center gap-2 cursor-pointer" onClick={() => switchView("typing")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-main">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            s<span className="text-main">type</span>
          </h1>
          <nav className="hidden md:flex gap-4 ml-8">
            <button onClick={() => switchView("typing")} className={`text-sm transition-colors cursor-pointer px-2 py-1 ${view === "typing" ? "text-main" : "text-sub hover:text-main"}`}>typing</button>
            <button onClick={() => switchView("account")} className={`text-sm transition-colors cursor-pointer px-2 py-1 ${view === "account" ? "text-main" : "text-sub hover:text-main"}`}>account</button>
            <button onClick={() => switchView("settings")} className={`text-sm transition-colors cursor-pointer px-2 py-1 ${view === "settings" ? "text-main" : "text-sub hover:text-main"}`}>settings</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <ThemeSwitch />
          <div className="hidden md:flex items-center gap-2 text-sm text-sub">
            {sessionLoading ? (
              <span className="animate-pulse">...</span>
            ) : user ? (
              <>
                <span className="text-foreground">{user.name ?? user.email ?? "User"}</span>
                {user.image ? (
                  <img src={user.image} alt="" className="w-8 h-8 rounded-full" width={32} height={32} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-main/30 flex items-center justify-center text-main text-xs font-bold">
                    {(user.name ?? user.email ?? "?")[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <button type="button" onClick={signOut} className="text-sub hover:text-foreground transition-colors cursor-pointer ml-1">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="text-sub hover:text-main transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab("register");
                    setAuthModalOpen(true);
                  }}
                  className="text-sub hover:text-main transition-colors cursor-pointer"
                >
                  Create account
                </button>
                <button type="button" onClick={signIn} className="text-sub hover:text-main transition-colors cursor-pointer">
                  Sign in with GitHub
                </button>
                <div className="w-8 h-8 rounded-full bg-sub opacity-20" />
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
        signInWithCredentials={signInWithCredentials}
        register={register}
      />
      {authError && (
        <div className="mb-4 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm">
          Sign-in failed: {authError}
        </div>
      )}
      <main className="flex-grow flex flex-col items-center justify-center">
        {view === "typing" && (
          <div className="w-full max-w-4xl">
            {!finished && (
              <div className={`transition-opacity duration-500 ${started ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <Controls
                  mode={mode}
                  duration={duration}
                  language={language}
                  onModeChange={(m) => {
                    setMode(m);
                    changeSettings();
                  }}
                  onDurationChange={(d) => {
                    setDuration(d);
                    changeSettings();
                  }}
                  onLanguageChange={(lang) => {
                    setLanguage(lang);
                    changeSettings();
                  }}
                  onRestart={restartSame}
                  disabled={started && !finished}
                />
              </div>
            )}

            <div id="live-stats" className={`w-full mb-8 transition-opacity duration-300 ${started && !finished ? "opacity-100" : "opacity-0"}`}>
              <StatsBar
                wpm={currentWpm}
                accuracy={currentAccuracy}
                elapsedSeconds={elapsed}
                avgKeyIntervalMs={avgInterval}
                consistency={consistency}
              />
            </div>

            {!finished ? (
              <div className="relative">
                <TypingArea
                  ref={inputRef}
                  text={text}
                  input={input}
                  onKeyDown={handleKeyDown}
                  disabled={finished}
                />
                <div className="mt-8 text-center text-sub text-sm opacity-50">
                  Press <span className="bg-sub/10 px-2 py-0.5 rounded italic">Tab</span> to reset
                </div>
              </div>
            ) : (
              <ResultsPanel
                wpm={currentWpm}
                accuracy={currentAccuracy}
                avgKeyIntervalMs={avgInterval}
                consistency={consistency}
                wpmBuckets={wpmBuckets}
                onRestartSame={restartSame}
                onChangeSettings={changeSettings}
                totalChars={input.length}
                errors={input.length - correctChars}
                timeSeconds={elapsed}
              />
            )}
          </div>
        )}

        {view === "account" && (
          <div className="w-full max-w-4xl animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-8">Account</h2>
            {!user && (
              <p className="mb-6 p-4 rounded-xl bg-sub/10 border border-sub/20 text-sub text-sm">
                Sign in with GitHub to save and sync your typing history across devices.
              </p>
            )}
            <HistoryPanel
              history={history}
              onClear={clearHistory}
              loading={historyLoading}
            />
          </div>
        )}

        {view === "settings" && (
          <div className="w-full max-w-2xl animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>
            <section className="mb-10">
              <h3 className="text-sub uppercase text-xs font-bold mb-4 tracking-widest">Appearance</h3>
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-foreground">Theme</div>
                    <div className="text-sm text-sub">Change the color palette.</div>
                  </div>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="bg-background border border-sub/30 rounded px-4 py-1 text-foreground focus:outline-none focus:border-main"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="nord">Nord</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-auto pt-12 pb-4 flex flex-wrap justify-between items-center gap-4 text-sub text-sm transition-opacity duration-500 ${started && !finished ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="flex items-center gap-6">
          <a href="https://github.com/akkaraponph/stype" target="_blank" rel="noopener noreferrer" className="text-sub hover:text-main transition-colors" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sub/80 hidden sm:inline">Minimal typing test</span>
          <span className="font-mono text-sub bg-sub/10 border border-sub/20 px-2.5 py-1 rounded-md">v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}
