---
name: Focus Session Customizability
about: Add configurable focus durations, themes, and sound controls.
title: "[Focus] Add Configurable Focus Settings, Themes, And Sound Controls"
labels: enhancement, frontend, settings
assignees: ""
---

## Summary

Make the new focus session experience configurable so users can adapt it to different work styles. The current app has a single visual theme and no timer-specific preferences.

## Problem

Fixed defaults are too rigid for a focus feature. Users should be able to select their session length, visual mode, and sound behavior without editing code or environment settings.

## Scope

- Add selectable focus durations: 15, 25, 35, and 45 minutes.
- Add theme switching with Light, Dark, and Focus modes.
- Add sound controls with an on or off toggle for start, end, and tick sounds.
- Persist user selections locally so they survive page refreshes.
- Ensure the focus mode presents a more minimal UI treatment than the regular dashboard theme.

## Acceptance Criteria

- [ ] Users can choose 15, 25, 35, or 45 minutes before starting a session.
- [ ] Changing the selected duration affects the next new focus session immediately.
- [ ] Users can switch between Light, Dark, and Focus modes without reloading the page.
- [ ] Focus mode reduces visual distractions while preserving access to key actions.
- [ ] Users can disable all timer sounds from the UI.
- [ ] When sound is disabled, no start, end, or tick audio is played.
- [ ] Preferences persist after a browser refresh.
- [ ] Frontend tests cover settings persistence and theme switching behavior.

## Implementation Notes

- Theme state can be managed at the app level and exposed through context.
- Persist settings in `localStorage` first; move to user-level backend persistence later if needed.
- Audio assets should be lightweight and optional.

## Out Of Scope

- XP or leveling rules
- Achievement logic
- Weekly and monthly analytics graphs