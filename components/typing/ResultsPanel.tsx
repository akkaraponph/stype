"use client";

import { useState } from "react";

export interface ResultsPanelProps {
  wpm: number;
  accuracy: number;
  avgKeyIntervalMs: number;
  consistency?: number;
  wpmBuckets: number[];
  onRestartSame: () => void;
  onChangeSettings: () => void;
  totalChars: number;
  errors: number;
  timeSeconds: number;
  className?: string;
}

export default function ResultsPanel({
  wpm,
  accuracy,
  onRestartSame,
  totalChars,
  errors,
  timeSeconds,
  className = "",
}: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  const shareResult = () => {
    const text = `I just typed ${wpm.toFixed(2)} WPM with ${accuracy.toFixed(2)}% accuracy on Stype! 🚀`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center py-10 w-full ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12 w-full">
        <div className="flex flex-col items-start px-4">
          <span className="text-4xl text-main font-bold">{wpm.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-start px-4">
          <span className="text-4xl text-main font-bold">{accuracy.toFixed(2)}%</span>
        </div>
        <div className="flex flex-col items-start px-4">
          <span className="text-xs text-sub uppercase font-bold tracking-widest mb-1">characters</span>
          <span className="text-4xl text-main font-bold text-xl">{totalChars - errors}/{errors}/0/0</span>
          <span className="text-[0.6rem] text-sub uppercase mt-1">correct/wrong/extra/missed</span>
        </div>
        <div className="flex flex-col items-start px-4">
          <span className="text-xs text-sub uppercase font-bold tracking-widest mb-1">time</span>
          <span className="text-4xl text-main font-bold">{Math.round(timeSeconds)}s</span>
        </div>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={onRestartSame} 
          className="bg-main text-background px-8 py-2 rounded-md font-semibold hover:opacity-90 transition-all cursor-pointer"
        >
          Try Again
        </button>
        <button 
          onClick={shareResult} 
          className="border border-sub text-foreground px-8 py-2 rounded-md hover:bg-foreground/5 transition-all cursor-pointer"
        >
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </div>
  );
}
