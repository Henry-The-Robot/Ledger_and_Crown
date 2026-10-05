---
title: Village scenes (days 9-28)
type: system
pack: ch1
season: spring
files: [scenes.js, game.js]
symbols: [available, pending, SC, BY, CLUES, runScene, sceneFor, sceneOk, talk]
concepts: []
sessions: []
tests: [tests/test-cast.js, tests/test-dayloop.js, tests/test-calls.js]
links: [ch1/cast, ch1/lessons-weeks3-4, ch1/court]
updated: 2026-10-05
---

## What it does
Twelve short, optional, one-time conversations. A person with a scene waiting shows a red "!". Walking up plays it.
Choices move trust, set a flag, or change a real invoice. Six scenes hold a clue about who buys the valley's debts.
Nothing here is needed to finish the season.

## Where
| File · symbol | What |
|---|---|
| `scenes.js` · `SC` (~7) | The scene list. Fields: `id`, `who`, `from`, optional `to`, `at` (map tile), `card` (clue card), `need(s)`, `hint`, `run(c)`. |
| `scenes.js` · `available(who, s)` (~115) | First scene for `who` that is not played, with `day >= from`, `day <= to` and `need(s)` true. Else `null`. |
| `scenes.js` · `pending(s)` (~119) | Count of scenes waiting now. |
| `scenes.js` · `CLUES` | 6. The number the player sees in "A clue: n of 6". |
| `game.js` · `sceneOk`, `sceneFor(who)` (~66) | Scenes wait until the story reaches chapter 5 and is not busy. |
| `game.js` · `talk(who)` (~326) | Order: `Story.onTalk` first, then `sceneFor`, then fair, then the usual chat. |
| `game.js` · `wants(who)` (~860) | Draws the red "!" when `sceneFor(who)` is set. |
| `game.js` · `runScene(sc)` (~551) | Marks the scene done first, builds the helper object `c`, runs it. Saves after. |

### The day table
| Scene id | Who | Day | Sets or does |
|---|---|---|---|
| `maud_abacus` | Maud | 9+ | Trust +1. |
| `ashby_bram` | Ashby | 11+ | Flag `ashbyPromise` (deliver, cash, ledger), `ashbyAsked`. |
| `crane_offduty` | Crane (at tile 32,10) | 13-17 | Flag `craneSeal`. Clue. Trust +2. |
| `tomas_contracts` | Tomas | 13+ | Flag `vaneBuying`. Clue. |
| `hobb_extension` | Hobb | 14+, needs an open Hobb invoice | Flag `hobbExt` (gave, refused, half). Moves the invoice due date. "Half" posts a `collect` entry. |
| `mira_rumour` | Mira | 17+ | Flag `vaneBuying`. Clue. |
| `ezra_letter` | Ezra | 18+ | Plays Edric's letter 7. Trust +2. |
| `maud_confession` | Maud | 19+ | Flag `maudConfessed`. Trust +2. |
| `ashby_guarantee` | Ashby | 21+ | Letter 6. Flag `guarantee`. Clue. Trust +3. |
| `crane_seal` | Crane (at tile 32,10) | 23+, needs `craneSeal` | Flag `craneVane`. Clue. Trust +2. |
| `vane_offer` | Duke (at tile 36,10) | 24+ | Flag `vane` (refused, asked, waiting). Clue. |
| `maud_eve` | Maud | 27+ | Flag `examReady`. |

## Data and state
`s.scenes[id] = day` marks a scene played. `s.flags` holds the flags. `s.clues` counts clues. With the story on, a clue also pins a case-board card
(`Story.pin`, kind `scene`). Money effects go through `Spring.post`, so the books tie. A reload mid-scene never replays it.

## Invariants
- Every scene belongs to someone in `Cast.WHO`, has a hint, and runs between day 9 and 28 (`test-cast.js`).
- No scene before day 9. A scene played once is not offered again (`test-cast.js`).
- Clue count equals `CLUES` (`test-cast.js`). Scenes unlock only letters that exist.
- Every day 2-28 has a choice and a surprise; scenes count as a surprise (`test-dayloop.js`).

## How to change it safely
- Add a scene to `SC` with a `hint`. Keep `CLUES` equal to the scenes that call `c.clue()`.
- A scene that moves money must use `c.S.post`. Never edit balances.
- Crane's scenes use `at`, so he stands at a tile only while one waits (`cranePos` in `game.js`).
- The court reads the flags `hobbExt`, `guarantee`, `vane`, `craneVane` and `maudConfessed` (`ch1/court`). Rename none of them.

## Known issues
- `story.js` calls `Scenes.morning(...)` each morning ("HOOK"), but `scenes.js` does not export `morning`. The call is skipped.
- `Scenes.pending` has no caller in the game's `.js` files (grep, 2026-10-05).

## History
- 2026-10-03: scenes and letters (PR #28; `ch1/LOG`).
- WS6: clue cards on the case board; Crane's scenes shifted one day for Corvin's day-12 order.
