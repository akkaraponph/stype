"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "nord";

const STORAGE_KEY = "slowlytype-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark" || v === "nord") return v as Theme;
  return null;
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  // Also toggle 'dark' class for tailwind if needed, though we use data-theme now
  if (theme === "dark" || theme === "nord") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = getStoredTheme();
    const resolved = stored ?? getSystemTheme();
    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return [theme, setTheme];
}
