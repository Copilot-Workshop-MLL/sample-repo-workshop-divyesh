# Issue 1: Add Focus Session Visual Feedback to the Dashboard

## Summary

Add a Pomodoro-style focus session widget to the existing employee dashboard with richer visual feedback. The current frontend has employee stats, filters, and CRUD workflows, but no timer-based focus experience.

## Problem

Users have no in-app focus aid while working inside the dashboard. If we add a focus session module, it should feel clear and alive instead of behaving like a static countdown.

## Scope

- Add a focus timer card to the React dashboard.
- Implement a circular progress bar with a smooth decreasing animation based on remaining time.
- Transition the timer color gradually from blue to yellow to red as time passes.
- Add subtle background effects during active focus time, such as particles or ripple animations.
- Respect reduced-motion preferences so the UI remains accessible.
- Keep the existing employee management flows usable while the timer is running.

## Acceptance Criteria

- Users can start, pause, resume, and reset a focus session from the dashboard.
- The circular progress indicator decreases smoothly without visible jumps.
- The progress color changes across clear thresholds or a continuous gradient from blue to yellow to red.
- Background effects are visible only during active focus time and do not block form inputs, tables, or buttons.
- Reduced-motion users see a non-animated fallback.
- Frontend tests cover timer state changes and visual state thresholds.

## Implementation Notes

- This fits naturally in the dashboard area rendered from `frontend/src/pages/DashboardPage.js`.
- The visual component can live in a new reusable component such as `frontend/src/components/FocusTimer.js`.
- Timer state can start as client-side only for the first pass.

## Out of Scope

- Time preset customization
- Theme switching
- Sound controls
- XP, achievements, and analytics