---
title: Save and browser storage
type: system
pack: platform
season: all
files: [core/save.js, core/game.js, core/transcript.js, core/codex.js, chapters/ch1/spring/endings.js, core/fx.js, core/intro.js]
symbols: [KEY, V3, MIGRATED, MAX_CODE, load, write, saveSlot, closeSeason, clearSlot, newSeed, shuffleSeeded, carryFrom, migrate, snapshot, restoreStores, parseCode, importCode, exportCode, exportCompressed, persist, heir, restart, review, save, start]
concepts: []
sessions: []
tests: [tests/test-save.js, tests/smoke-story.html, tests/stability.html, tests/never-stuck.html]
links: [platform/game-ui, platform/transcript, platform/codex, platform/sound, platform/opening]
updated: 2026-10-05
---

## What it does
`core/save.js` keeps all player data in one versioned blob, `lc_save_v4`, in `localStorage`. There is no server.
The design is `docs/design/save-and-carry.md`; the carry record schema is `docs/design/carry-record.schema.json`.
The blob is `{v, profile, slot, closed, bugReports}`.
- `profile`: never deleted. Id, rngSeed, games, level, prestige, settings, transcript, codex, unlocks, carry.
- `slot`: the open season (`{season, s, story, calm, usePtr, fairSeen, savedAt}`), or null.
- `closed`: one frozen record per finished season, kept forever. Its `next` field is the carry record.

## Where
| Function (`core/save.js`) | Job |
|---|---|
| `load`, `write` | Read the blob (migrating v3 once); merge a patch and keep `lc_save_v4_prev` for one-step rollback. |
| `saveSlot`, `clearSlot` | The open season. `core/game.js` · `save()` calls `saveSlot`; `restart()` calls `clearSlot`. |
| `closeSeason`, `carryFrom` | Freeze a finished season into `closed[season]` and build its carry record. `review()` calls it. |
| `newSeed`, `shuffleSeeded` | Seeds from the profile (`rngSeed + games`); `?seed=N` wins. Review options shuffle by seed and question index. |
| `migrate` | v3 key `lc_spring_save_v3` and the small stores into v4. Old keys are never deleted. |
| `snapshot`, `restoreStores` | The small stores (transcript, codex, unlocks, level, prestige, switches) stay live in their own keys. These two fold them into the profile and back. |
| `exportCode`, `exportCompressed`, `parseCode`, `importCode` | `LC4U.` plain or `LC4.` deflate-raw codes. Over 1 MB or wrong version is refused with a plain reason. |
| `persist` | Asks the browser to keep storage; returns an iPad "Add to Home Screen" hint when refused. |
| `heir` | The canonical heir (`tests/golden/heir-ch1-spring.json`, made by `tools/freeze-heir.js`). |

Small stores (`lc_transcript_v2`, `lc_codex_v1`, `lc_level_v1`, `lc_prestige_v1`, `lc_unlocks_v1`, `lc_sfx`, `lc_music`, `lc_intro_seen`, `lc_bug_reports`) keep their own writers.

## Data and state
- `save()` runs only in story games, and not in `?fast` runs unless `?savetest` is set. It runs each morning, at `closeBooks`, on "Save and quit" and at story steps.
- `start()` reads `Save.slot()`. An unfinished game offers Continue or Start a new game.
- Every storage call is in try/catch, so a blocked `localStorage` leaves the game playable but unsaved.

## Invariants
- A save made by this build loads in this build (`tests/stability.html`, `tests/test-save.js`).
- A finished season is never deleted. Only the slot clears.
- The carry record validates against the schema (`tests/test-save.js`).

## How to change it safely
- Add a profile field with a default in `emptyProfile`. Bump `v` only with a migration.
- Never delete an old key in the same release that migrates it.

## Known issues
- `lc_intro_seen` is written but `Intro.wanted` ignores it.
- The small stores have no version of their own; `snapshot` copies them as they are.
