"use client";

import { useSyncExternalStore } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

const storageKey = "vpetgo.theme";
const themeChangeEvent = "vpetgo-theme-change";

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  window.addEventListener(themeChangeEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.dataset.theme = "dark";
  } else {
    delete document.documentElement.dataset.theme;
  }

  window.localStorage.setItem(storageKey, theme);
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToThemeChanges, getThemeSnapshot, () => "light");
  const isDark = theme === "dark";

  function toggleTheme() {
    applyTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      aria-label={isDark ? "Use light theme" : "Use dark theme"}
      aria-pressed={isDark}
      className={styles.toggle}
      onClick={toggleTheme}
      type="button"
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb}>
          <span className={styles.sun} />
          <span className={styles.moon} />
        </span>
      </span>
    </button>
  );
}
