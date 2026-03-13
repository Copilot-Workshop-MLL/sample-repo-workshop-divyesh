import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

jest.mock("./services/api", () => ({
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
}));

import App from "./App";
import { SettingsProvider, useSettings } from "./hooks/useSettings";

/**
 * Clears local storage before each frontend test.
 * @returns {void}
 */
function resetBrowserState() {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
}

beforeEach(() => {
  resetBrowserState();
});

test("renders the login page by default", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /employee command center/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});

// ── Settings persistence ──────────────────────────────────────────────────

/**
 * Minimal component that exposes settings and setters for testing.
 * @returns {JSX.Element}
 */
function SettingsHarness() {
  const { settings, setTheme, setDuration, setSoundEnabled } = useSettings();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="duration">{settings.duration}</span>
      <span data-testid="sound">{String(settings.soundEnabled)}</span>
      <button onClick={() => setTheme("dark")}>set-dark</button>
      <button onClick={() => setTheme("focus")}>set-focus</button>
      <button onClick={() => setDuration(45)}>set-45</button>
      <button onClick={() => setSoundEnabled(false)}>mute</button>
    </div>
  );
}

test("defaults to light theme, 25 min duration, and sound on", () => {
  render(
    <SettingsProvider>
      <SettingsHarness />
    </SettingsProvider>
  );

  expect(screen.getByTestId("theme")).toHaveTextContent("light");
  expect(screen.getByTestId("duration")).toHaveTextContent("25");
  expect(screen.getByTestId("sound")).toHaveTextContent("true");
});

test("persists theme selection to localStorage", () => {
  render(
    <SettingsProvider>
      <SettingsHarness />
    </SettingsProvider>
  );

  fireEvent.click(screen.getByText("set-dark"));

  const stored = JSON.parse(localStorage.getItem("focusSettings"));
  expect(stored.theme).toBe("dark");
  expect(screen.getByTestId("theme")).toHaveTextContent("dark");
});

test("persists duration selection to localStorage", () => {
  render(
    <SettingsProvider>
      <SettingsHarness />
    </SettingsProvider>
  );

  fireEvent.click(screen.getByText("set-45"));

  const stored = JSON.parse(localStorage.getItem("focusSettings"));
  expect(stored.duration).toBe(45);
  expect(screen.getByTestId("duration")).toHaveTextContent("45");
});

test("persists sound toggle to localStorage", () => {
  render(
    <SettingsProvider>
      <SettingsHarness />
    </SettingsProvider>
  );

  fireEvent.click(screen.getByText("mute"));

  const stored = JSON.parse(localStorage.getItem("focusSettings"));
  expect(stored.soundEnabled).toBe(false);
  expect(screen.getByTestId("sound")).toHaveTextContent("false");
});

test("loads persisted settings on mount", () => {
  localStorage.setItem("focusSettings", JSON.stringify({ theme: "focus", duration: 35, soundEnabled: false }));

  render(
    <SettingsProvider>
      <SettingsHarness />
    </SettingsProvider>
  );

  expect(screen.getByTestId("theme")).toHaveTextContent("focus");
  expect(screen.getByTestId("duration")).toHaveTextContent("35");
  expect(screen.getByTestId("sound")).toHaveTextContent("false");
});

// ── Theme switching behavior ──────────────────────────────────────────────

test("switching theme updates data-theme attribute on document root", () => {
  render(
    <SettingsProvider>
      <SettingsHarness />
    </SettingsProvider>
  );

  fireEvent.click(screen.getByText("set-dark"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

  fireEvent.click(screen.getByText("set-focus"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("focus");
});

test("theme reverts to light on fresh mount with no stored settings", () => {
  render(
    <SettingsProvider>
      <SettingsHarness />
    </SettingsProvider>
  );

  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
});
