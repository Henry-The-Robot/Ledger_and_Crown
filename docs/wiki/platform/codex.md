---
title: The codex store
type: system
pack: platform
season: all
files: [codex.js, transcript.js, game.js]
symbols: [Codex, KEY, LEVEL_KEY, PKEY, mark, known, retained, due, prestige, addPrestige, level, setLevel, speak, CODEX_IDS]
concepts: [accrual, ar, ap, inventory, gross, operating, wc, overtrading, insolvency, breakeven, margin, tvm, statements]
sessions: []
tests: []
links: [platform/transcript, platform/save]
updated: 2026-10-05
---

## What it does
`codex.js` is a small shared store from an older design. It tracks a concept as "felt" (lived) then "named" (recalled), with spaced recall due dates. It also holds the guide level and the prestige number.

## Where
| File · symbol | What |
|---|---|
| `codex.js` · `mark(id, state)` | States `felt`, `named`, `miss`. A "named" sets the next due date at 1, 3, 7 or 21 days. A miss resets to 10 minutes. |
| `codex.js` · `known`, `retained`, `due`, `all` | Readers: named, 3+ hits, due now, everything. |
| `codex.js` · `level`, `setLevel` | Guide level (`lc_level_v1`, default "apprentice"). |
| `codex.js` · `prestige`, `addPrestige` | A number (`lc_prestige_v1`). |
| `codex.js` · `speak(container, qs, onDone)` | A multiple-choice "Speak the Word" round. |
| `transcript.js` · `CODEX_IDS` | The 13 concept ids that Transcript mirrors into the codex. |
| `game.js` · `start` | The only game call: `Codex.prestige()` times 10 becomes the new game's bonus Cash (max 100). |

## Data and state
Keys: `lc_codex_v1` (`{id: {state, at, hits, due}}`), `lc_level_v1`, `lc_prestige_v1`. All reads and writes use try/catch.

## Callers today
- `transcript.js` calls `Codex.mark` on every record and on mastery.
- `game.js` reads `Codex.prestige` once.
- Nothing in this repo calls `speak`, `setLevel`, `addPrestige`, `due` or `retained`.

## Invariants
A failed storage call never throws.

## How to change it safely
Treat it as shared with the hub (other pages read the same keys). Do not rename keys.

## Known issues
- Most of the API is unused here. `prestige` can never rise, because nothing calls `addPrestige`.
- No version inside any value; see [save](save.md).
