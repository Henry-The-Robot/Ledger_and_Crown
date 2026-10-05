---
title: Scripted bot players
type: system
pack: platform
season: spring
files: [core/bot.js]
symbols: [Bot, farm, deliverAll, freePlots, need, careful, reckless, overtrader, noDuke, sprinkler, spender]
concepts: [overtrading, insolvency, wc]
sessions: [C2.09]
tests: [tests/test-crown.js, tests/test-spine.js, tests/test-court.js, tests/test-walkoff.js, tests/test-events.js, tests/test-deposits.js]
links: [platform/engine, platform/tests-and-ci, ch1/court]
updated: 2026-10-05
---

## What it does
`core/bot.js` has scripted players. Each has a `day(s)` method that plays one day on a game state, using only the public engine API. They tune the season's difficulty and prove the ending paths. Pure JS; works in browser and node.

## Where
| File · symbol | What |
|---|---|
| `core/bot.js` · `farm(s)` | One day of field work: harvest ripe plots, till up to 8, plant held seed, water. |
| `core/bot.js` · `deliverAll(s)` | Delivers open orders, earliest due first. |
| `core/bot.js` · `careful` | Keeps a cash reserve for the next pay-day. Takes the Duke's order only when it can borrow. Buys seed on account only if collections cover the bill. Repays on day 28. Ends close to paying the Crown. |
| `core/bot.js` · `reckless` | Accepts every order and puts all Cash into seed. Goes insolvent. |
| `core/bot.js` · `overtrader` | Careful until day 10, then accepts every order with no reserve. Is sued for the forfeit. |
| `core/bot.js` · `noDuke` | Careful, but declines the Duke. |
| `core/bot.js` · `sprinkler` | Careful, plus a sprinkler on day 3 placed on plot 13. |
| `core/bot.js` · `spender` | Spends before day 7 so the first pay-day triggers the walk-off (story games). |

## How tests use them
The usual loop is `while (!s.over) { Bot.careful.day(s); Spring.sleep(s); }`.
- `tests/test-crown.js`: all five bots end as designed (careful pays the Crown).
- `tests/test-spine.js`: the same on story games, under several seeds.
- `tests/test-court.js`: every bot's books feed the Court builders.
- `tests/test-walkoff.js`: `spender` triggers the walk-off; `careful` does not.
- `core/game.js` · `G.play(policy, days)` and `?auto=N&bot=name` run a bot in the browser.

## Invariants
- Careful pays the Crown; overtrader is sued; reckless is insolvent (tuned with `R.duke` and `R.corvin`).
- Bots use only public engine calls, so an API change breaks them first.

## How to change it safely
- Changing any number in `R` can flip a bot's ending. Run `tests/test-crown.js` and `tests/test-spine.js` first.
- A new bot: add it here, then add it to the loops in `tests/test-crown.js` and `tests/test-events.js`.

## Known issues
- Bot constants (12 per seed packet, the 150 borrow threshold) are literals, not read from `R`.
