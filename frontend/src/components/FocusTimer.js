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
import { useSettings } from "../hooks/useSettings";

const DURATION_OPTIONS = [15, 25, 35, 45];
const THEME_OPTIONS = ["light", "dark", "focus"];

/**
 * Plays a short beep using the Web Audio API.
 * @param {"start"|"end"|"tick"} type The type of sound to play.
 * @returns {void}
 */
function playBeep(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "start") {
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "end") {
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch {
    // Audio not available in this environment
  }
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
 * @param {number} secs Total seconds remaining.
 * @returns {string} Formatted time string.
 */
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Focus timer widget with configurable duration, theme, and sound settings.
 * @returns {JSX.Element}
 */
function FocusTimer() {
  const { settings, setTheme, setDuration, setSoundEnabled } = useSettings();
  const { theme, duration, soundEnabled } = settings;

  const totalSeconds = duration * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const prevDurationRef = useRef(duration);

  // Reset timer when duration setting changes (only when stopped)
  useEffect(() => {
    if (!running && prevDurationRef.current !== duration) {
      setSecondsLeft(duration * 60);
      setFinished(false);
    }
    prevDurationRef.current = duration;
  }, [duration, running]);

  // Countdown logic
  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setFinished(true);
          if (soundEnabled) playBeep("end");
          return 0;
        }
        if (soundEnabled && prev % 60 === 0) playBeep("tick");
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, soundEnabled]);

  const progress = 1 - secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  const handleStart = useCallback(() => {
    if (finished) return;
    setRunning(true);
    if (soundEnabled) playBeep("start");
  }, [finished, soundEnabled]);

  const handlePause = useCallback(() => {
    setRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setRunning(false);
    setFinished(false);
    setSecondsLeft(duration * 60);
  }, [duration]);

  return (
    <section className="focus-timer panel" aria-label="Focus timer">
      <div className="focus-timer-header">
        <h2 className="section-title">Focus Session</h2>
      </div>

      <div className="focus-timer-body">
        <svg
          className="focus-ring"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle className="focus-ring-track" cx="60" cy="60" r="54" />
          <circle
            className="focus-ring-progress"
            cx="60"
            cy="60"
            r="54"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="focus-timer-display" aria-live="off" aria-label={`Time remaining: ${formatTime(secondsLeft)}`}>
          {finished ? (
            <span className="focus-done-label">Done!</span>
          ) : (
            <span className="focus-time">{formatTime(secondsLeft)}</span>
          )}
        </div>
      </div>

      <div className="focus-timer-controls button-row">
        {!running && !finished && (
          <button className="primary-button" type="button" onClick={handleStart} aria-label="Start focus session">
            Start
          </button>
        )}
        {running && (
          <button className="secondary-button" type="button" onClick={handlePause} aria-label="Pause focus session">
            Pause
          </button>
        )}
        <button className="secondary-button" type="button" onClick={handleReset} aria-label="Reset focus timer">
          Reset
        </button>
      </div>

      <div className="focus-settings">
        <div className="focus-setting-group">
          <span className="focus-setting-label">Duration</span>
          <div className="focus-option-row" role="group" aria-label="Select session duration">
            {DURATION_OPTIONS.map((min) => (
              <button
                key={min}
                type="button"
                className={`focus-option-btn${duration === min ? " active" : ""}`}
                onClick={() => setDuration(min)}
                aria-pressed={duration === min}
                disabled={running}
              >
                {min}m
              </button>
            ))}
          </div>
        </div>

        <div className="focus-setting-group">
          <span className="focus-setting-label">Theme</span>
          <div className="focus-option-row" role="group" aria-label="Select theme">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                className={`focus-option-btn${theme === t ? " active" : ""}`}
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="focus-setting-group focus-setting-inline">
          <span className="focus-setting-label">Sound</span>
          <button
            type="button"
            className={`focus-option-btn${soundEnabled ? " active" : ""}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? "On" : "Off"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default FocusTimer;
