import { describe, it, expect } from "vitest";
import {
  accuracy,
  avgKeyInterval,
  consistencyScore,
  keyIntervals,
  wpm,
} from "@/lib/typing/metrics";

describe("wpm", () => {
  it("returns (correctChars/5)/minutes", () => {
    expect(wpm(100, 1)).toBe(20);
    expect(wpm(50, 1)).toBe(10);
    expect(wpm(300, 1)).toBe(60);
  });

  it("returns 0 when minutes <= 0", () => {
    expect(wpm(100, 0)).toBe(0);
    expect(wpm(100, -1)).toBe(0);
  });
});

describe("accuracy", () => {
  it("returns correct/total as percentage", () => {
    expect(accuracy(90, 100)).toBe(90);
    expect(accuracy(50, 100)).toBe(50);
    expect(accuracy(100, 100)).toBe(100);
  });

  it("returns 100 when total is 0", () => {
    expect(accuracy(0, 0)).toBe(100);
  });

  it("caps at 100", () => {
    expect(accuracy(100, 90)).toBe(100);
  });
});

describe("avgKeyInterval", () => {
  it("returns mean of consecutive deltas", () => {
    expect(avgKeyInterval([0, 100, 200])).toBe(100);
    expect(avgKeyInterval([0, 200, 400])).toBe(200);
  });

  it("returns 0 for fewer than 2 timestamps", () => {
    expect(avgKeyInterval([])).toBe(0);
    expect(avgKeyInterval([100])).toBe(0);
  });
});

describe("keyIntervals", () => {
  it("returns deltas between consecutive timestamps", () => {
    expect(keyIntervals([0, 100, 250])).toEqual([100, 150]);
    expect(keyIntervals([10, 20])).toEqual([10]);
  });

  it("returns empty for fewer than 2 timestamps", () => {
    expect(keyIntervals([])).toEqual([]);
    expect(keyIntervals([1])).toEqual([]);
  });
});

describe("consistencyScore", () => {
  it("returns 100 for single or zero intervals", () => {
    expect(consistencyScore([])).toBe(100);
    expect(consistencyScore([100])).toBe(100);
  });

  it("returns higher score for lower variance", () => {
    const uniform = [100, 100, 100, 100];
    const varied = [50, 100, 150, 200];
    expect(consistencyScore(uniform)).toBeGreaterThanOrEqual(
      consistencyScore(varied)
    );
  });

  it("returns a number between 0 and 100", () => {
    const score = consistencyScore([10, 20, 30, 40, 50]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
