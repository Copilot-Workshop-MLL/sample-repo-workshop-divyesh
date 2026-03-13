import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import FocusTimer from "./FocusTimer";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("renders the focus timer with initial state", () => {
  render(<FocusTimer />);

  expect(screen.getByLabelText(/focus session timer/i)).toBeInTheDocument();
  expect(screen.getByText("25:00")).toBeInTheDocument();
  expect(screen.getByText("Ready")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
});

test("starts the timer when Start is clicked", () => {
  render(<FocusTimer />);

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  expect(screen.getByText("Focusing")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /start/i })).not.toBeInTheDocument();
});

test("counts down when running", () => {
  render(<FocusTimer />);

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.getByText("24:57")).toBeInTheDocument();
});

test("pauses the timer", () => {
  render(<FocusTimer />);

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  act(() => {
    jest.advanceTimersByTime(5000);
  });

  fireEvent.click(screen.getByRole("button", { name: /pause/i }));

  expect(screen.getByText("24:55")).toBeInTheDocument();
  expect(screen.getByText("Ready")).toBeInTheDocument();

  // Timer should not tick after pause
  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.getByText("24:55")).toBeInTheDocument();
});

test("shows Resume button after pausing", () => {
  render(<FocusTimer />);

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  act(() => {
    jest.advanceTimersByTime(2000);
  });

  fireEvent.click(screen.getByRole("button", { name: /pause/i }));

  expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
});

test("resumes the timer from where it paused", () => {
  render(<FocusTimer />);

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  act(() => {
    jest.advanceTimersByTime(10000);
  });

  fireEvent.click(screen.getByRole("button", { name: /pause/i }));

  // At 10s elapsed → 24:50 remaining
  expect(screen.getByText("24:50")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /resume/i }));

  act(() => {
    jest.advanceTimersByTime(5000);
  });

  expect(screen.getByText("24:45")).toBeInTheDocument();
});

test("resets the timer to 25:00", () => {
  render(<FocusTimer />);

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  act(() => {
    jest.advanceTimersByTime(60000);
  });

  fireEvent.click(screen.getByRole("button", { name: /reset/i }));

  expect(screen.getByText("25:00")).toBeInTheDocument();
  expect(screen.getByText("Ready")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
});

test("shows Complete label and Reset button when timer reaches zero", () => {
  render(<FocusTimer />);

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  act(() => {
    jest.advanceTimersByTime(25 * 60 * 1000);
  });

  expect(screen.getByText("00:00")).toBeInTheDocument();
  expect(screen.getByText("Complete!")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /start/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /pause/i })).not.toBeInTheDocument();
});

describe("ring color thresholds", () => {
  /**
   * Returns the stroke colour of the progress circle in the rendered timer.
   * @param {HTMLElement} container The rendered container.
   * @returns {string} The stroke colour string.
   */
  function getProgressCircleColor(container) {
    const circle = container.querySelector(".focus-timer-progress");
    return circle ? circle.style.stroke : "";
  }

  test("progress ring is blue at full time (>66%)", () => {
    const { container } = render(<FocusTimer />);
    expect(getProgressCircleColor(container)).toBe("#4a9eff");
  });

  test("progress ring is yellow in the middle range (33–66%)", () => {
    const { container } = render(<FocusTimer />);

    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Advance to ~50% remaining: 12.5 minutes elapsed
    act(() => {
      jest.advanceTimersByTime(12.5 * 60 * 1000);
    });

    expect(getProgressCircleColor(container)).toBe("#f5c842");
  });

  test("progress ring is red in the final third (<33%)", () => {
    const { container } = render(<FocusTimer />);

    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Advance to ~20% remaining: 20 minutes elapsed
    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(getProgressCircleColor(container)).toBe("#e05252");
  });
});

test("particles are only visible during active session", () => {
  const { container } = render(<FocusTimer />);

  expect(container.querySelector(".focus-timer-particles")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /start/i }));

  expect(container.querySelector(".focus-timer-particles")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /pause/i }));

  expect(container.querySelector(".focus-timer-particles")).not.toBeInTheDocument();
});

