# Issue 3: Add Focus Gamification, Achievements, and Weekly or Monthly Analytics

## Summary

Extend the focus session feature with progression and reporting so the system rewards consistency and exposes trends over time. The current backend already supports authenticated dashboard data, but it does not store focus-session history or progression metrics.

## Problem

Without persistence and progression, focus sessions have no long-term value. Users need a reason to keep using the feature and a way to review how consistently they complete sessions.

## Scope

- Add an experience point system that awards XP for completed Pomodoros.
- Add level progression based on total XP.
- Add achievement badges such as `3 consecutive days` and `10 completions this week`.
- Add weekly and monthly statistics views with more detailed charts.
- Persist completed focus sessions and progression data in the backend for authenticated users.
- Expose new API endpoints for focus history, XP, level, badges, and aggregated stats.

## Acceptance Criteria

- Completing a focus session records a completion event tied to the authenticated user.
- Users receive XP automatically when a session completes.
- Levels update automatically when XP thresholds are crossed.
- Achievement badges unlock automatically when qualifying conditions are met.
- The dashboard displays at least weekly and monthly completion trends.
- The dashboard displays current XP, current level, and unlocked badges.
- Backend tests cover XP calculation, streak detection, badge rules, and stats aggregation.
- Frontend tests cover rendering of progression and analytics states.

## Implementation Notes

- Reuse the existing auth model so progression is tied to the signed-in user.
- This likely needs new backend models, routes, and controller logic rather than a frontend-only implementation.
- A charting library can be added if the team wants richer weekly and monthly graphs.
- This issue depends on a working focus timer flow that can emit completed-session events.

## Out of Scope

- Leaderboards between employees
- Social sharing
- Rewards outside the application