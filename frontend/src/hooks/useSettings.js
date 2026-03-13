import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "focusSettings";

const DEFAULT_SETTINGS = {
  theme: "light",
  duration: 25,
  soundEnabled: true,
};

/**
 * Loads persisted settings from localStorage.
 * @returns {{ theme: string, duration: number, soundEnabled: boolean }} The stored or default settings.
 */
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore malformed data
  }
  return DEFAULT_SETTINGS;
}

/**
 * Persists settings to localStorage.
 * @param {{ theme: string, duration: number, soundEnabled: boolean }} settings The settings to save.
 * @returns {void}
 */
function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}

const SettingsContext = createContext(null);

/**
 * Provides app-wide focus settings (theme, duration, sound) to children.
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings]);

  const setTheme = useCallback((theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setDuration = useCallback((duration) => {
    setSettings((prev) => ({ ...prev, duration }));
  }, []);

  const setSoundEnabled = useCallback((soundEnabled) => {
    setSettings((prev) => ({ ...prev, soundEnabled }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setTheme, setDuration, setSoundEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Returns the current focus settings and setter helpers.
 * @returns {{ settings: { theme: string, duration: number, soundEnabled: boolean }, setTheme: Function, setDuration: Function, setSoundEnabled: Function }}
 */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
