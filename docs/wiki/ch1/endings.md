---
title: Endings, Crane's offer and epilogues
type: system
pack: ch1
season: spring
files: [endings.js, story.js, game.js]
symbols: [offer, soldOut, ending, epilogue, unlock, unlocked, opCash, daysInGap, UNLOCKS, MIN_PRICE, MERCY_FLOOR, MERCY_SHARE, showEnding, sell, craneOffer, testEnding, closeBooks]
concepts: [tvm, equation]
sessions: [C0.01, C1.01]
tests: [tests/test-offer.js, tests/smoke-story.html]
links: [ch1/lessons-weeks3-4, ch1/court, ch1/spring-settings]
updated: 2026-10-05
---

## What it does
Crane carries Corvin Vane's standing offer to buy the farm. The price rises with Cash the farm has cleared and falls with every
day the chest is forecast empty. When Cash is short for wages Crane returns with a lower "mercy" price. A game ends in one of four ways:
Sold out, Seized, Bridged or Free. Each ending shows an epilogue card and unlocks a letter or page for the next game.

## Where
| File · symbol | What |
|---|---|
| `endings.js` · `offer(s)` (~26) | `{price, base, mercy, daysInGap, equity, earned, cash, wages}`. |
| `endings.js` · `opCash(s)`, `daysInGap(s)` | Cash cleared by operations. Days in the next 14 where the forecast Cash is below zero. |
| `endings.js` · `soldOut(s, price)` (~34) | The numbers for the sold epilogue: what the farm earns (Cash, else profit), equity, and how many springs the price equals. |
| `endings.js` · `ending(s)` (~39) | `sold`, `seized`, `bridged` or `free`. |
| `endings.js` · `epilogue(kind, ctx)` (~45) | 3-4 lines from game state, a title, and the unlock. |
| `endings.js` · `UNLOCKS`, `unlock(kind)`, `unlocked()` | One letter or page per ending. Saved across games in `localStorage` (`lc_unlocks_v1`). |
| `story.js` · `craneOffer(opts)` (~466) | The scene. Three variants: first (day 1), mercy, standing. Two confirms (Crane, then Maud). |
| `story.js` · `sell(o)` (~478) | Records `s.sold`, sets `s.over` and `outcome = "sold"`, then `showEnding("sold")`. Gives `tvm` and `equation` as introduced only, never as evidence. |
| `story.js` · `showEnding(kind, opts)` (~486) | The card: epilogue lines, the offer against earnings (sold), the unlock, and buttons (Play again, Case board, Close). |
| `story.js` · `testEnding(kind)` | The `?ending=` test hook. Works on a copy. Saves nothing. |
| `game.js` · `closeBooks()` (~789) | The "How it ends" button calls `Story.showEnding(Endings.ending(s))`. |

### The offer price
`price = max(150, round(300 + max(0, opCash)/2 - 10 * daysInGap))`.
Mercy: if Cash is below the coming wages bill, `price = max(100, round(base * 0.6))`.
The offer ignores book equity on purpose: equity is what the books say, not what the farm earns.

### The four endings
| Ending | When |
|---|---|
| `sold` | The player took Crane's offer. |
| `seized` | Insolvent, or the Crown verdict is "short". |
| `bridged` | The Crown verdict is neither paid nor short. Ezra writes the gap into a note. |
| `free` | The Crown verdict is "paid". |

## Data and state
`s.sold = {price, day, mercy, so}`, `s.over`, `s.outcome`. The unlock store is outside the save. `epilogue` and `offer` do not change the game.

## Invariants
- The formula, the 150 floor, mercy and the rise-with-Cash rule (`test-offer.js`).
- The sold epilogue reads the game and does not change it. It has 3-4 lines. It never says the offer was "always lower" (`test-offer.js`).
- Every ending's epilogue is reachable through `?ending=` (`smoke-story.html`).
- Selling is not credited as skill in the transcript.

## How to change it safely
- Change the formula in `endings.js` and its comment block together. Update `formula` in `test-offer.js`.
- `ending()` order matters: `sold` first, then insolvent, then the Crown verdict.
- Epilogue numbers come from `crownFund` and `R`. Never write a literal.
- Add an ending: a `T` entry in `epilogue`, an `UNLOCKS` entry, and a branch in `ending`.

## Known issues
- The `tags` on `soldOut` are `C0.01` and `C1.01`. The offer is a time-value choice, but no curriculum session names it directly.

## History
- WS6: the offer, mercy, four endings and unlocks (SEASON-1-REDESIGN.md section 2 and M3; `ch1/LOG`).
- 2026-10-04: the sold-out epilogue compares the price with what the farm earns, not with a bot.
