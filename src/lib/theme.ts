export type Theme = "light" | "dark";

const storageKey = "sankhala-theme";
const themeEvent = "sankhala-theme-change";
let sessionChoice: Theme | null = null;

/** Run before paint in the root document; neither theme depends on hydration. */
export const THEME_INIT_SCRIPT = `(function(){var t;try{t=localStorage.getItem("${storageKey}")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t})();`;

function storedTheme(): Theme | null {
  if (sessionChoice) return sessionChoice;
  try {
    const value = localStorage.getItem(storageKey);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function setTheme(theme: Theme) {
  sessionChoice = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // The current visit still supports a theme choice when storage is unavailable.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(themeEvent));
}

export function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getServerTheme(): Theme {
  return "light";
}

export function subscribeToTheme(notify: () => void) {
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  const syncPreference = () => {
    applyTheme(storedTheme() ?? (preference.matches ? "dark" : "light"));
    notify();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      sessionChoice = null;
      syncPreference();
    }
  };
  window.addEventListener(themeEvent, notify);
  window.addEventListener("storage", onStorage);
  preference.addEventListener("change", syncPreference);
  return () => {
    window.removeEventListener(themeEvent, notify);
    window.removeEventListener("storage", onStorage);
    preference.removeEventListener("change", syncPreference);
  };
}
