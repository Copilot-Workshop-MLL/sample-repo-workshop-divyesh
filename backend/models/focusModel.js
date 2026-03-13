const { randomUUID } = require("crypto");
const { getMemoryState } = require("../data/memoryStore");
const { isDatabaseEnabled, query } = require("../config/db");

const XP_PER_SESSION = 10;

/**
 * XP thresholds required to reach each level.
 * Index 0 is unused; index N is the minimum XP for level N.
 */
const LEVEL_THRESHOLDS = [0, 0, 50, 150, 300, 500];

/**
 * Calculates the level for a given XP total.
 * @param {number} xp The total XP.
 * @returns {number} The corresponding level (1–5+).
 */
function calculateLevel(xp) {
  let level = 1;
  for (let i = 2; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
    }
  }
  return level;
}

/**
 * Returns the set of badge IDs that the user has earned based on their session history.
 * @param {Array<{ completedAt: string }>} sessions All completed sessions for the user (newest first).
 * @param {number} level The user's current level.
 * @returns {Array<string>} Newly unlocked badge IDs.
 */
function computeEarnedBadges(sessions, level) {
  const badges = new Set();

  if (sessions.length >= 1) {
    badges.add("first_session");
  }

  if (sessions.length >= 10) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessionsThisWeek = sessions.filter((s) => new Date(s.completedAt) >= weekAgo);
    if (sessionsThisWeek.length >= 10) {
      badges.add("weekly_10");
    }
  }

  if (sessions.length >= 3) {
    const uniqueDays = [
      ...new Set(sessions.map((s) => new Date(s.completedAt).toISOString().slice(0, 10))),
    ].sort();

    let streak = 1;
    for (let i = uniqueDays.length - 1; i >= 1; i--) {
      const current = new Date(uniqueDays[i]);
      const previous = new Date(uniqueDays[i - 1]);
      const diffDays = (current - previous) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
        if (streak >= 3) {
          badges.add("streak_3");
          break;
        }
      } else {
        streak = 1;
      }
    }
  }

  if (level >= 5) {
    badges.add("focus_master");
  }

  return [...badges];
}

/**
 * Groups sessions by ISO week (YYYY-WNN) and returns weekly counts.
 * @param {Array<{ completedAt: string }>} sessions The sessions to aggregate.
 * @returns {Array<{ week: string, count: number }>} Aggregated weekly counts, oldest first.
 */
function aggregateWeekly(sessions) {
  const counts = {};
  for (const session of sessions) {
    const d = new Date(session.completedAt);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const key = `${d.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Groups sessions by month (YYYY-MM) and returns monthly counts.
 * @param {Array<{ completedAt: string }>} sessions The sessions to aggregate.
 * @returns {Array<{ month: string, count: number }>} Aggregated monthly counts, oldest first.
 */
function aggregateMonthly(sessions) {
  const counts = {};
  for (const session of sessions) {
    const d = new Date(session.completedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Records a completed focus session and updates XP, level, and badges.
 * @param {string} userId The authenticated user's ID.
 * @param {number} durationMinutes The session duration in minutes.
 * @returns {Promise<{ session: object, progression: object }>} The saved session and updated progression.
 */
async function recordSession(userId, durationMinutes) {
  const sessionId = randomUUID();
  const completedAt = new Date().toISOString();

  if (isDatabaseEnabled()) {
    await query(
      "INSERT INTO focus_sessions (id, user_id, duration_minutes, completed_at) VALUES ($1, $2, $3, $4)",
      [sessionId, userId, durationMinutes, completedAt]
    );

    await query(
      `INSERT INTO user_progression (user_id, xp, level, badges)
       VALUES ($1, $2, 1, '{}')
       ON CONFLICT (user_id) DO UPDATE
         SET xp = user_progression.xp + $2`,
      [userId, XP_PER_SESSION]
    );

    const allSessionsResult = await query(
      "SELECT completed_at AS \"completedAt\" FROM focus_sessions WHERE user_id = $1 ORDER BY completed_at DESC",
      [userId]
    );

    const progressionResult = await query(
      "SELECT xp, level, badges FROM user_progression WHERE user_id = $1",
      [userId]
    );

    const progression = progressionResult.rows[0];
    const newLevel = calculateLevel(progression.xp);
    const earnedBadges = computeEarnedBadges(allSessionsResult.rows, newLevel);

    await query(
      "UPDATE user_progression SET level = $2, badges = $3 WHERE user_id = $1",
      [userId, newLevel, earnedBadges]
    );

    return {
      session: { id: sessionId, userId, durationMinutes, completedAt },
      progression: { xp: progression.xp, level: newLevel, badges: earnedBadges },
    };
  }

  const state = getMemoryState();
  const newSession = { id: sessionId, userId, durationMinutes, completedAt };
  state.focusSessions.push(newSession);

  let prog = state.userProgression.find((p) => p.userId === userId);
  if (!prog) {
    prog = { userId, xp: 0, level: 1, badges: [] };
    state.userProgression.push(prog);
  }

  prog.xp += XP_PER_SESSION;
  const userSessions = state.focusSessions
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  prog.level = calculateLevel(prog.xp);
  prog.badges = computeEarnedBadges(userSessions, prog.level);

  return {
    session: { ...newSession },
    progression: { xp: prog.xp, level: prog.level, badges: [...prog.badges] },
  };
}

/**
 * Returns the focus session history for a user.
 * @param {string} userId The authenticated user's ID.
 * @returns {Promise<Array<object>>} Sessions ordered newest first.
 */
async function getSessionHistory(userId) {
  if (isDatabaseEnabled()) {
    const result = await query(
      `SELECT id, user_id AS "userId", duration_minutes AS "durationMinutes", completed_at AS "completedAt"
       FROM focus_sessions WHERE user_id = $1 ORDER BY completed_at DESC`,
      [userId]
    );
    return result.rows;
  }

  return getMemoryState()
    .focusSessions.filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .map((s) => ({ ...s }));
}

/**
 * Returns the progression record (XP, level, badges) for a user.
 * @param {string} userId The authenticated user's ID.
 * @returns {Promise<{ xp: number, level: number, badges: Array<string> }>} The progression data.
 */
async function getProgression(userId) {
  if (isDatabaseEnabled()) {
    const result = await query(
      "SELECT xp, level, badges FROM user_progression WHERE user_id = $1",
      [userId]
    );
    if (result.rows[0]) {
      return {
        xp: result.rows[0].xp,
        level: result.rows[0].level,
        badges: result.rows[0].badges || [],
      };
    }
    return { xp: 0, level: 1, badges: [] };
  }

  const prog = getMemoryState().userProgression.find((p) => p.userId === userId);
  if (!prog) {
    return { xp: 0, level: 1, badges: [] };
  }
  return { xp: prog.xp, level: prog.level, badges: [...prog.badges] };
}

/**
 * Returns aggregated weekly and monthly session statistics for a user.
 * @param {string} userId The authenticated user's ID.
 * @returns {Promise<{ weekly: Array<object>, monthly: Array<object>, totalSessions: number }>} The aggregated stats.
 */
async function getStats(userId) {
  const sessions = await getSessionHistory(userId);

  return {
    totalSessions: sessions.length,
    weekly: aggregateWeekly(sessions),
    monthly: aggregateMonthly(sessions),
  };
}

module.exports = {
  recordSession,
  getSessionHistory,
  getProgression,
  getStats,
  calculateLevel,
  computeEarnedBadges,
  XP_PER_SESSION,
  LEVEL_THRESHOLDS,
};
