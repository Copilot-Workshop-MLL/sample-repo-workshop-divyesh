import React, { useCallback, useEffect, useRef, useState } from "react";
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
