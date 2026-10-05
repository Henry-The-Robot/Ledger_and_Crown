---
title: Save and browser storage
type: system
pack: platform
season: all
files: [game.js, transcript.js, codex.js, endings.js, fx.js, intro.js]
symbols: [SAVE, save, restart, review, start, KEY, LEVEL_KEY, PKEY, store]
concepts: []
sessions: []
tests: [tests/smoke-story.html, tests/stability.html, tests/never-stuck.html]
links: [platform/game-ui, platform/transcript, platform/codex, platform/sound, platform/opening]
updated: 2026-10-05
---

## What it does
The game keeps all player data in `localStorage`. There is no server. The season save is one JSON blob; every other store is a small separate key.

## Where
| Key | Written by | Holds |
|---|---|---|
| `lc_spring_save_v3` | `game.js` · `save()` | `{s, story, calm, usePtr, fairSeen}`: the whole engine state, story state and a few UI counters. |
| `lc_transcript_v2` | `transcript.js` · `store` | Concept evidence per id: `{ev: [{day, kind, real}]}`. |
| `lc_codex_v1` | `codex.js` | Concept state (felt, named), hits and next-due time. |
| `lc_level_v1` | `codex.js` · `setLevel` | Guide level; default "apprentice". |
| `lc_prestige_v1` | `codex.js` · `addPrestige` | A number; read at new game as a Cash bonus. |
| `lc_unlocks_v1` | `endings.js` · `unlock` | Ending unlocks, kept across games. |
| `lc_sfx`, `lc_music` | `fx.js` · `save` | "1" or "0" switches. `lc_sound` is the old one-switch key, read only. |
| `lc_intro_seen` | `intro.js` · `end` | "1" once the opening ends or is skipped. |
| `lc_bug_reports` | `game.js` (`pauseMenu`) | Array of `{at, day, stage, question, expected}`; `feedbackText` reads the last five. |

## Data and state
- `save()` runs only in story games, and not in `?fast` runs unless `?savetest` is set. It is called at each morning (`doSleep`), at `closeBooks`, on "Save and quit", and at story steps through `G.save`.
- `start()` reads the save. An unfinished game offers Continue or Start a new game. A finished season returns to the books and the ending.
- Every store is wrapped in try/catch, so a blocked `localStorage` leaves the game playable but unsaved.

## Where the save is deleted
- `review()` removes it when Ezra's questions end.
- `restart()` removes it, then reloads without a query string.
- "Restart today" in the pause menu only reloads, so it returns to this morning's save.

## Invariants
- A save made by this build must load in this build (`tests/stability.html`).
- The key name is the only version marker.

## How to change it safely
- Add a field to the blob only with a default in `start()`'s `begin` (`sv.calm || 0` is the pattern).
- Never rename a key without a migration; old players lose progress.

## Known issues (task P4 fixes these)
- The save is unversioned. The key says `v3`, but the blob has no version field and no migration.
- The save is deleted when the season ends, so the finished season is lost after the review.
- No other store has a version, except the suffix in its key.
- `lc_intro_seen` is written but no game code reads it; `Intro.wanted` ignores it.
