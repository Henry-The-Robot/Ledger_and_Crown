---
title: The transcript (concepts and mastery)
type: system
pack: platform
season: all
files: [transcript.js]
symbols: [CONCEPTS, CORE, COURSES, record, use, master, level, core, state, evidence, progress, reset, html, KEY]
concepts: [equation, accrual, margin, breakeven, opportunity, tvm, wc, ev]
sessions: [C1.01, C16.01]
tests: [tests/test-transcript.js]
links: [platform/codex, platform/save, platform/game-ui, ch1/court]
updated: 2026-10-05
---

## What it does
The transcript records what the player has done and explained, per concept. It shows as the T screen: 17 courses, with only C0 to C2 active in Spring. Evidence comes from play only.

## Where
| File · symbol | What |
|---|---|
| `transcript.js` · `COURSES` | The 17 core courses `[code, title, act]`. Act 0 is open; later acts are locked. |
| `transcript.js` · `CONCEPTS` | Concept ids per course: C0 (4), C1 (12), C2 (6), plus C4 and C8 previews from Market Day. |
| `transcript.js` · `CORE` | The eight Season 1 core ideas: equation, accrual, margin, breakeven, opportunity, tvm, wc, ev. |
| `transcript.js` · `core()` | `CORE` as `{id, name, level}` rows. The Reeve's Court reads it. |
| `transcript.js` · `record(id, kind, day)` | Adds one evidence item per concept, game day and kind. Returns the new level if it changed. |
| `transcript.js` · `use(id, well, day)` | "Did it in play". If `well` is false, it only introduces the idea. |
| `transcript.js` · `master(id, day)` | "Explained it correctly" (kind `answer`). |
| `transcript.js` · `level(c)` | The mastery rule. |
| `transcript.js` · `html()` | The T screen markup. |

## Mastery rule
- introduced: met once.
- practiced: evidence on 2 different game days.
- mastered: 3 different game days, at least one `answer`, and at least 2 different real dates.
One sitting can never master a concept.

## Data and state
Stores `lc_transcript_v2` as `{id: {ev: [{day, kind, real}]}}`. Real date is `new Date().toISOString().slice(0, 10)`. Without `localStorage` it falls back to memory. Concept ids in `CODEX_IDS` are mirrored to `Codex.mark` ("felt" on any evidence, "named" on mastery).

## Invariants
`tests/test-transcript.js` proves the thresholds. Evidence is deduped per day and kind.

## How to change it safely
- A new concept: add it to `CONCEPTS`; add it to `CORE` only if Season 1 must prove it.
- Changing the rule invalidates stored data. Bump `KEY` and say so in the PR (v1 was dropped this way).
- Callers: `game.js` (`drainUses`), `court.js` and `market.js` (`master`).

## Known issues
- Real dates use UTC, so a player near midnight may see two dates in one evening.
- The header comment mentions `poc/codex.js`, which is not in this repo.
