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
      <span className="theme-glyph" aria-hidden="true">
        <SunIcon size={20} weight="regular" className="theme-glyph-sun" />
        <MoonIcon size={20} weight="regular" className="theme-glyph-moon" />
      </span>
    </button>
  );
}
