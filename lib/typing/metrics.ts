/**
 * Pure typing metrics: WPM, accuracy, key intervals, consistency.
 */

/** WPM = (correct characters / 5) / minutes */
export function wpm(correctChars: number, minutes: number): number {
  if (minutes <= 0) return 0;
  return (correctChars / 5) / minutes;
}

/** Accuracy = correct characters / total typed (0–100) */
export function accuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped <= 0) return 100;
  return Math.min(100, (correctChars / totalTyped) * 100);
}

/** Average keypress interval in ms (mean of consecutive deltas). */
export function avgKeyInterval(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < timestamps.length; i++) {
    sum += timestamps[i]! - timestamps[i - 1]!;
  }
  return sum / (timestamps.length - 1);
}

/** Intervals between consecutive keypresses (ms). */
export function keyIntervals(timestamps: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    out.push(timestamps[i]! - timestamps[i - 1]!);
  }
  return out;
}

/** Lower variance = more consistent. Returns 0–100-ish (higher = more consistent). */
export function consistencyScore(intervals: number[]): number {
  if (intervals.length < 2) return 100;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance =
    intervals.reduce((acc, x) => acc + (x - mean) ** 2, 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  if (mean <= 0) return 100;
  const cv = stdDev / mean;
  return Math.max(0, Math.min(100, 100 - cv * 50));
}
