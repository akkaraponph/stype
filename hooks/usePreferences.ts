"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  loadPreferencesFromStorage,
  savePreferencesToStorage,
  mergePreferences,
  type UserPreferences,
  type StatsVisibility,
  type ResultBlocksVisibility,
  type FontSize,
} from "@/lib/preferences";

export type { UserPreferences, StatsVisibility, ResultBlocksVisibility, FontSize };

export function usePreferences(user: { id: string } | null) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    typeof window !== "undefined" ? loadPreferencesFromStorage() : DEFAULT_PREFERENCES
  );
  const [loading, setLoading] = useState(!!user);

  useEffect(() => {
    if (!user) {
      setPreferencesState(loadPreferencesFromStorage());
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/preferences", { credentials: "include" })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.preferences && typeof data.preferences === "object") {
          setPreferencesState(
            mergePreferences(DEFAULT_PREFERENCES, data.preferences as Partial<UserPreferences>)
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const updatePreferences = useCallback(
    (partial: Partial<UserPreferences>) => {
      const next = mergePreferences(preferences, partial);
      setPreferencesState(next);
      if (!user) {
        savePreferencesToStorage(next);
      } else {
        fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(partial),
        })
          .then((res) => res.ok && res.json())
          .then((data) => {
            if (data?.preferences) {
              setPreferencesState(
                mergePreferences(DEFAULT_PREFERENCES, data.preferences as Partial<UserPreferences>)
              );
            }
          })
          .catch(() => {});
      }
    },
    [preferences, user]
  );

  return { preferences, loading, updatePreferences };
}
