---
title: Mechanic verbs (tag, bet, timeline)
type: system
pack: platform
season: spring
files: [verbs.js, verbs.css]
symbols: [init, tag, tagged, canvasTap, whereElse, bet, finish, revealBet, timeline, rowsFor, parch, parchReset, parchClose, countTotal, pinRow, stamp, remark, thud, draw, craneOn, P]
concepts: [equation, statements, cfs, tvm]
sessions: []
tests: [tests/test-t3b.js, tests/test-calls.js, tests/test-cast.js, tests/test-editor.js, tests/smoke-story.html, tests/predict-spoiler.html]
links: [platform/game-ui, platform/engine, platform/sound]
updated: 2026-10-05
---

## What it does
`verbs.js` holds things the player does instead of typing a sum. `window.Verbs` has three main verbs and a shared parchment. The look is in `verbs.css`.

## Where
| File · symbol | What |
|---|---|
| `verbs.js` · `init(g)` | Stores `G` (the `window.G` API) and `Spring`. `game.js` calls it at game start. |
| `verbs.js` · `tag(cfg)` | The player taps map objects. Each correct tap pins a line on the parchment. Resolves when all targets are tagged. |
| `verbs.js` · `canvasTap(tx, ty)` | `game.js` calls it before it turns a tap into a walk. Returns true if the tap was a tag, a repeat or a decoy. |
| `verbs.js` · `whereElse` | The hint after 20 s. It pulses the nearest target and sets `window.__walked`, so no mastery credit. |
| `verbs.js` · `bet(cfg)` | Maud's wager. The player names a number, stakes real Cash through `Spring.wager`, and sees the answer now or on a later morning. |
| `verbs.js` · `revealBet` | Called by `story.js` on the due morning. Shows predicted versus actual and names the unplanned postings. |
| `verbs.js` · `timeline(cfg)` | A 14-day strip with a Cash line. Modes `show`, `play` (move Tomas's bill) and `predict` (name the lowest Cash and its day). |
| `verbs.js` · `parch`, `parchReset`, `parchClose`, `pinRow`, `countTotal` | The "as the Crown sees it" statement that builds as the player tags. |
| `verbs.js` · `stamp`, `remark`, `thud` | Shared effects: a stamp card, a fading remark, the stamp sound through `FX`. |
| `verbs.js` · `draw(ctx, cam, frame)` | Gold frames round tagged things. `game.js` calls it at the end of its draw. |
| `verbs.js` · `craneOn` | A flag that places Crane on the map (`game.js` and `moodNow` read it). |

## Who uses it
- `game.js`: `init`, `draw`, `canvasTap`, `craneOn`.
- `story.js`: wraps the verbs in a proxy `LV` that guards async calls; uses `tag`, `bet`, `timeline`, `parch`, `pin`, `stamp`, `remark`, `revealBet`, `parchClose`.
- `market.js` and `court.js` do not use it.

## Data and state
A pending bet lives in `G.s.bet`, so it is saved with the game. The parchment state `P` is in memory only. Numbers come from game state, never literals.

## Invariants
- A wager is a posted expense, so the books still tie.
- Nothing is hover-only; mouse and touch use the same events.
- Test hooks (`window.__fastVerbs`, `window.__want`, `window.__tl`) only speed up or expose answers for tests.

## How to change it safely
- New verb: add it here, export it, and wrap it in `story.js` only if it is async.
- Check on an iPad: the timeline uses pointer capture for drag.

## Known issues
- `setInterval` for `cardTick` runs for the page's lifetime, even with no bet.
