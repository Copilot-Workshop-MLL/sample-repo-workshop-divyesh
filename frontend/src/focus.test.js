import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("./services/api", () => ({
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  fetchFocusProgression: jest.fn().mockResolvedValue({ xp: 0, level: 1, badges: [] }),
  fetchFocusStats: jest.fn().mockResolvedValue({ totalSessions: 0, weekly: [], monthly: [] }),
  recordFocusSession: jest.fn().mockResolvedValue({
    session: { id: "s1", durationMinutes: 25, completedAt: new Date().toISOString() },
    progression: { xp: 10, level: 1, badges: ["first_session"] },
  }),
}));

import FocusTimer from "./components/FocusTimer";
import ProgressionPanel from "./components/ProgressionPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";

describe("FocusTimer", () => {
  test("renders timer with default duration", () => {
    render(<FocusTimer token="test-token" onSessionComplete={jest.fn()} />);
    expect(screen.getByText("Focus Session")).toBeInTheDocument();
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  test("renders duration selector buttons", () => {
    render(<FocusTimer token="test-token" onSessionComplete={jest.fn()} />);
    expect(screen.getByRole("button", { name: "15m" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "25m" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "35m" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "45m" })).toBeInTheDocument();
  });

  test("changes duration when a duration button is clicked", () => {
    render(<FocusTimer token="test-token" onSessionComplete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "15m" }));
    expect(screen.getByText("15:00")).toBeInTheDocument();
  });

  test("renders Start and Reset buttons when stopped", () => {
    render(<FocusTimer token="test-token" onSessionComplete={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });
});

describe("ProgressionPanel", () => {
  test("renders level and XP with no progression data", () => {
    render(<ProgressionPanel progression={null} />);
    expect(screen.getByText("Your Progress")).toBeInTheDocument();
    expect(screen.getByText("Level 1")).toBeInTheDocument();
  });

  test("renders XP and level from progression data", () => {
    render(<ProgressionPanel progression={{ xp: 50, level: 2, badges: ["first_session"] }} />);
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getByText(/50 XP/)).toBeInTheDocument();
  });

  test("renders unlocked badges correctly", () => {
    render(<ProgressionPanel progression={{ xp: 10, level: 1, badges: ["first_session"] }} />);
    const unlockedBadge = screen.getByLabelText("First Session (unlocked)");
    expect(unlockedBadge).toBeInTheDocument();
  });

  test("renders locked badges for unearned achievements", () => {
    render(<ProgressionPanel progression={{ xp: 0, level: 1, badges: [] }} />);
    expect(screen.getByLabelText("3-Day Streak (locked)")).toBeInTheDocument();
    expect(screen.getByLabelText("Weekly 10 (locked)")).toBeInTheDocument();
    expect(screen.getByLabelText("Focus Master (locked)")).toBeInTheDocument();
  });
});

describe("AnalyticsPanel", () => {
  test("renders analytics section with no data", () => {
    render(<AnalyticsPanel focusStats={null} />);
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
  });

  test("renders Weekly and Monthly tab buttons", () => {
    render(<AnalyticsPanel focusStats={null} />);
    expect(screen.getByRole("tab", { name: "Weekly" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Monthly" })).toBeInTheDocument();
  });

  test("switches to Monthly view when Monthly tab is clicked", () => {
    render(<AnalyticsPanel focusStats={{ totalSessions: 2, weekly: [], monthly: [] }} />);
    const monthlyTab = screen.getByRole("tab", { name: "Monthly" });
    fireEvent.click(monthlyTab);
    expect(monthlyTab).toHaveAttribute("aria-selected", "true");
  });

  test("renders bar chart when data is present", () => {
    const stats = {
      totalSessions: 3,
      weekly: [
        { week: "2025-W01", count: 2 },
        { week: "2025-W02", count: 1 },
      ],
      monthly: [],
    };
    render(<AnalyticsPanel focusStats={stats} />);
    expect(screen.getByLabelText("Session frequency chart")).toBeInTheDocument();
    expect(screen.getByLabelText("2025-W01: 2 sessions")).toBeInTheDocument();
  });

  test("displays total sessions count", () => {
    const stats = {
      totalSessions: 7,
      weekly: [],
      monthly: [],
    };
    render(<AnalyticsPanel focusStats={stats} />);
    expect(screen.getByText(/7 sessions total/)).toBeInTheDocument();
  });
});
