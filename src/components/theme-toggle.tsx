"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import {
  getServerTheme,
  getThemeSnapshot,
  setTheme,
  subscribeToTheme,
} from "@/lib/theme";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerTheme,
  );
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} theme`;

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        <SunIcon size={20} weight="regular" aria-hidden="true" />
      ) : (
        <MoonIcon size={20} weight="regular" aria-hidden="true" />
      )}
    </button>
  );
}
