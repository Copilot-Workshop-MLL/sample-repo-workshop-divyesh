import React, { useState, useEffect, useRef } from "react";

/** Default Pomodoro duration in seconds (25 minutes). */
const FOCUS_DURATION = 25 * 60;

/** SVG circle radius for the progress ring. */
const RING_RADIUS = 54;

/** Full circumference of the progress ring. */
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Returns the ring stroke colour based on remaining time ratio.
 * Blue above 66 %, yellow from 33–66 %, red below 33 %.
 * @param {number} ratio Remaining time as a value between 0 and 1.
 * @returns {string} A CSS colour string.
 */
function getRingColor(ratio) {
  if (ratio > 0.66) return "#4a9eff";
  if (ratio > 0.33) return "#f5c842";
  return "#e05252";
}

/**
 * Formats a total number of seconds as MM:SS.
 * @param {number} totalSeconds The number of seconds remaining.
 * @returns {string} The formatted time string.
 */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Renders a Pomodoro-style focus session timer with a circular progress ring,
 * smooth colour transitions, and optional floating-particle background effects.
 * @returns {JSX.Element} The focus timer card.
 */
function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const ratio = timeLeft / FOCUS_DURATION;
  const strokeOffset = RING_CIRCUMFERENCE * (1 - ratio);
  const ringColor = getRingColor(ratio);

  const isFinished = timeLeft === 0;
  const hasStarted = timeLeft < FOCUS_DURATION;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      if (timeLeft === 0) {
        setIsRunning(false);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  /** Starts or resumes the timer. */
  function handleStart() {
    setIsRunning(true);
  }

  /** Pauses the timer. */
  function handlePause() {
    setIsRunning(false);
  }

  /** Resets the timer to the full duration. */
  function handleReset() {
    setIsRunning(false);
    setTimeLeft(FOCUS_DURATION);
  }

  const statusLabel = isFinished ? "Complete!" : isRunning ? "Focusing" : "Ready";

  return (
    <div
      className={`focus-timer panel${isRunning ? " focus-timer--active" : ""}`}
      aria-label="Focus session timer"
    >
      {isRunning && (
        <div className="focus-timer-particles" aria-hidden="true">
          <span className="focus-particle focus-particle--1" />
          <span className="focus-particle focus-particle--2" />
          <span className="focus-particle focus-particle--3" />
          <span className="focus-particle focus-particle--4" />
          <span className="focus-particle focus-particle--5" />
          <span className="focus-particle focus-particle--6" />
        </div>
      )}

      <div className="focus-timer-title">Focus Session</div>

      <div className="focus-timer-ring-wrap">
        <svg
          className="focus-timer-ring"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle
            className="focus-timer-track"
            cx="60"
            cy="60"
            r={RING_RADIUS}
          />
          <circle
            className="focus-timer-progress"
            cx="60"
            cy="60"
            r={RING_RADIUS}
            style={{
              stroke: ringColor,
              strokeDasharray: RING_CIRCUMFERENCE,
              strokeDashoffset: strokeOffset,
            }}
          />
        </svg>

        <div className="focus-timer-display" aria-live="polite">
          <span className="focus-timer-time">{formatTime(timeLeft)}</span>
          <span className="focus-timer-label">{statusLabel}</span>
        </div>
      </div>

      <div className="focus-timer-controls button-row">
        {!isRunning && !isFinished && (
          <button className="primary-button" type="button" onClick={handleStart}>
            {hasStarted ? "Resume" : "Start"}
          </button>
        )}
        {isRunning && (
          <button
            className="secondary-button"
            type="button"
            onClick={handlePause}
          >
            Pause
          </button>
        )}
        {(hasStarted || isFinished) && (
          <button
            className="secondary-button"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default FocusTimer;
