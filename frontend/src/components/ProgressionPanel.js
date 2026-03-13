import React from "react";

const BADGE_META = {
  first_session: { label: "First Session", emoji: "🎯", description: "Completed your first focus session" },
  streak_3: { label: "3-Day Streak", emoji: "🔥", description: "Completed sessions on 3 consecutive days" },
  weekly_10: { label: "Weekly 10", emoji: "⚡", description: "Completed 10 sessions in one week" },
  focus_master: { label: "Focus Master", emoji: "🏆", description: "Reached level 5" },
};

const LEVEL_THRESHOLDS = [0, 0, 50, 150, 300, 500];

/**
 * Returns the XP needed to reach the next level.
 * @param {number} level The current level.
 * @returns {number | null} The XP threshold for the next level, or null if at max.
 */
function nextLevelXp(level) {
  return LEVEL_THRESHOLDS[level + 1] ?? null;
}

/**
 * Renders a single badge pill.
 * @param {{ id: string, unlocked: boolean }} props
 * @returns {JSX.Element}
 */
function BadgePill({ id, unlocked }) {
  const meta = BADGE_META[id] || { label: id, emoji: "🎖️", description: "" };
  return (
    <div
      className={`badge-pill${unlocked ? " badge-unlocked" : " badge-locked"}`}
      title={meta.description}
      aria-label={`${meta.label}${unlocked ? " (unlocked)" : " (locked)"}`}
    >
      <span className="badge-emoji">{meta.emoji}</span>
      <span className="badge-label">{meta.label}</span>
    </div>
  );
}

/**
 * Displays XP, level, and achievement badges for the current user.
 * @param {{ progression: { xp: number, level: number, badges: Array<string> } | null }} props
 * @returns {JSX.Element}
 */
function ProgressionPanel({ progression }) {
  const xp = progression?.xp ?? 0;
  const level = progression?.level ?? 1;
  const unlockedBadges = new Set(progression?.badges ?? []);

  const allBadgeIds = Object.keys(BADGE_META);
  const nextXp = nextLevelXp(level);
  const currentLevelXp = LEVEL_THRESHOLDS[level] ?? 0;
  const progressToNext =
    nextXp !== null ? Math.min(((xp - currentLevelXp) / (nextXp - currentLevelXp)) * 100, 100) : 100;

  return (
    <section className="panel progression-panel" aria-label="Progression">
      <h2 className="section-title">Your Progress</h2>

      <div className="progression-level-row">
        <div className="progression-level-badge" aria-label={`Level ${level}`}>
          {level}
        </div>
        <div className="progression-level-info">
          <div className="progression-level-label">Level {level}</div>
          <div className="progression-xp">
            {xp} XP{nextXp !== null ? ` / ${nextXp} XP` : " (max level)"}
          </div>
        </div>
      </div>

      {nextXp !== null && (
        <div className="xp-bar-container" role="progressbar" aria-valuenow={xp} aria-valuemin={currentLevelXp} aria-valuemax={nextXp}>
          <div className="xp-bar-fill" style={{ width: `${progressToNext}%` }} />
        </div>
      )}

      <div className="badges-grid" aria-label="Achievement badges">
        {allBadgeIds.map((id) => (
          <BadgePill key={id} id={id} unlocked={unlockedBadges.has(id)} />
        ))}
      </div>
    </section>
  );
}

export default ProgressionPanel;
