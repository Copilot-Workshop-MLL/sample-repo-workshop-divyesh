import React, { useCallback, useEffect, useRef, useState } from "react";

const DURATION_OPTIONS = [15, 25, 35, 45];
const DEFAULT_DURATION = 25;

/**
 * Returns the stroke-dashoffset for the circular progress ring.
 * @param {number} progress A value between 0 and 1.
 * @param {number} circumference The ring circumference in px.
 * @returns {number} The dash offset.
 */
function getStrokeDashoffset(progress, circumference) {
  return circumference * (1 - progress);
}

/**
 * Returns the CSS class representing the progress ring color.
 * @param {number} progress A value between 0 and 1 (1 = full time remaining).
 * @returns {string} A CSS class name.
 */
function getProgressColorClass(progress) {
  if (progress > 0.5) return "focus-ring-blue";
  if (progress > 0.2) return "focus-ring-yellow";
  return "focus-ring-red";
}

/**
 * Formats seconds as MM:SS.
 * @param {number} seconds Total seconds remaining.
 * @returns {string} Formatted time string.
 */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A Pomodoro-style focus timer that records completed sessions.
 * @param {{ token: string, onSessionComplete: function }} props
 * @returns {JSX.Element}
 */
function FocusTimer({ token, onSessionComplete }) {
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  const totalSeconds = durationMinutes * 60;
  const progress = secondsLeft / totalSeconds;
  const strokeColorClass = getProgressColorClass(progress);
  const dashOffset = getStrokeDashoffset(progress, CIRCUMFERENCE);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, stopTimer]);

  useEffect(() => {
    if (isComplete && onSessionComplete) {
      onSessionComplete(durationMinutes);
    }
  }, [isComplete, durationMinutes, onSessionComplete]);

  function handleDurationChange(minutes) {
    setDurationMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setIsRunning(false);
    setIsComplete(false);
  }

  function handleStart() {
    if (!isComplete) {
      setIsRunning(true);
    }
  }

  function handlePause() {
    stopTimer();
  }

  function handleReset() {
    stopTimer();
    setSecondsLeft(durationMinutes * 60);
    setIsComplete(false);
  }

  return (
    <section className="panel focus-timer" aria-label="Focus timer">
      <h2 className="section-title">Focus Session</h2>

      <div className="focus-duration-selector" role="group" aria-label="Select duration">
        {DURATION_OPTIONS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className={`focus-duration-btn${durationMinutes === minutes ? " active" : ""}`}
            onClick={() => handleDurationChange(minutes)}
            disabled={isRunning}
            aria-pressed={durationMinutes === minutes}
          >
            {minutes}m
          </button>
        ))}
      </div>

      <div className="focus-ring-container" aria-hidden="true">
        <svg className="focus-ring" viewBox="0 0 120 120" width="160" height="160">
          <circle
            className="focus-ring-track"
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
          />
          <circle
            className={`focus-ring-progress ${strokeColorClass}`}
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 0.8s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div className="focus-time-display" aria-live="polite" aria-atomic="true">
          {isComplete ? "Done!" : formatTime(secondsLeft)}
        </div>
      </div>

      {isComplete && (
        <p className="focus-complete-msg" role="status">
          🎉 Session complete! XP awarded.
        </p>
      )}

      <div className="button-row focus-controls">
        {!isRunning && !isComplete && (
          <button className="primary-button" type="button" onClick={handleStart}>
            Start
          </button>
        )}
        {isRunning && (
          <button className="secondary-button" type="button" onClick={handlePause}>
            Pause
          </button>
        )}
        <button className="secondary-button" type="button" onClick={handleReset}>
          Reset
        </button>
      </div>
    </section>
  );
}

export default FocusTimer;
