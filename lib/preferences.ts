/**
 * User preferences shape: which stats/blocks to show and font size.
 */

export interface StatsVisibility {
  wpm: boolean;
  accuracy: boolean;
  time: boolean;
  smoothness: boolean;
  consistency: boolean;
}

export interface ResultBlocksVisibility {
  wpm: boolean;
  accuracy: boolean;
  chars: boolean;
  time: boolean;
}

export type FontSize = "normal" | "large";

export interface UserPreferences {
  stats: StatsVisibility;
  resultBlocks: ResultBlocksVisibility;
  fontSize: FontSize;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  stats: {
    wpm: true,
    accuracy: true,
    time: true,
    smoothness: true,
    consistency: true,
  },
  resultBlocks: {
    wpm: true,
    accuracy: true,
    chars: true,
    time: true,
  },
  fontSize: "normal",
};

const PREFERENCES_STORAGE_KEY = "slowlytype_preferences";

export function loadPreferencesFromStorage(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return mergePreferences(DEFAULT_PREFERENCES, parsed);
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferencesToStorage(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function mergePreferences(
  base: UserPreferences,
  partial: Partial<UserPreferences>
): UserPreferences {
  return {
    stats:
      partial.stats !== undefined
        ? { ...base.stats, ...partial.stats }
        : base.stats,
    resultBlocks:
      partial.resultBlocks !== undefined
        ? { ...base.resultBlocks, ...partial.resultBlocks }
        : base.resultBlocks,
    fontSize:
      partial.fontSize === "large" || partial.fontSize === "normal"
        ? partial.fontSize
        : base.fontSize,
  };
}

export function parsePreferencesFromJson(json: unknown): UserPreferences | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  const stats = o.stats;
  const resultBlocks = o.resultBlocks;
  const fontSize = o.fontSize;
  const prefs: UserPreferences = {
    stats: { ...DEFAULT_PREFERENCES.stats },
    resultBlocks: { ...DEFAULT_PREFERENCES.resultBlocks },
    fontSize: fontSize === "large" ? "large" : "normal",
  };
  if (stats && typeof stats === "object" && !Array.isArray(stats)) {
    const s = stats as Record<string, unknown>;
    if (typeof s.wpm === "boolean") prefs.stats.wpm = s.wpm;
    if (typeof s.accuracy === "boolean") prefs.stats.accuracy = s.accuracy;
    if (typeof s.time === "boolean") prefs.stats.time = s.time;
    if (typeof s.smoothness === "boolean") prefs.stats.smoothness = s.smoothness;
    if (typeof s.consistency === "boolean") prefs.stats.consistency = s.consistency;
  }
  if (resultBlocks && typeof resultBlocks === "object" && !Array.isArray(resultBlocks)) {
    const r = resultBlocks as Record<string, unknown>;
    if (typeof r.wpm === "boolean") prefs.resultBlocks.wpm = r.wpm;
    if (typeof r.accuracy === "boolean") prefs.resultBlocks.accuracy = r.accuracy;
    if (typeof r.chars === "boolean") prefs.resultBlocks.chars = r.chars;
    if (typeof r.time === "boolean") prefs.resultBlocks.time = r.time;
  }
  return prefs;
}

/** Parse partial preferences from PATCH body (may contain only some keys). */
export function parsePartialPreferencesFromJson(json: unknown): Partial<UserPreferences> | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  const out: Partial<UserPreferences> = {};
  if (o.fontSize === "large" || o.fontSize === "normal") out.fontSize = o.fontSize;
  if (o.stats && typeof o.stats === "object" && !Array.isArray(o.stats)) {
    const s = o.stats as Record<string, unknown>;
    out.stats = { ...DEFAULT_PREFERENCES.stats };
    if (typeof s.wpm === "boolean") out.stats!.wpm = s.wpm;
    if (typeof s.accuracy === "boolean") out.stats!.accuracy = s.accuracy;
    if (typeof s.time === "boolean") out.stats!.time = s.time;
    if (typeof s.smoothness === "boolean") out.stats!.smoothness = s.smoothness;
    if (typeof s.consistency === "boolean") out.stats!.consistency = s.consistency;
  }
  if (o.resultBlocks && typeof o.resultBlocks === "object" && !Array.isArray(o.resultBlocks)) {
    const r = o.resultBlocks as Record<string, unknown>;
    out.resultBlocks = { ...DEFAULT_PREFERENCES.resultBlocks };
    if (typeof r.wpm === "boolean") out.resultBlocks!.wpm = r.wpm;
    if (typeof r.accuracy === "boolean") out.resultBlocks!.accuracy = r.accuracy;
    if (typeof r.chars === "boolean") out.resultBlocks!.chars = r.chars;
    if (typeof r.time === "boolean") out.resultBlocks!.time = r.time;
  }
  if (Object.keys(out).length === 0) return null;
  return out;
}
