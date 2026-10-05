---
title: Lessons, story chapters 4-5 (Hobb pays later, wages day)
type: lesson
pack: ch1
season: spring
files: [story.js, transcript.js]
symbols: [ch4, ch4b, revealIfDue, ch5, costScene, mastered, keep, page, CONCEPTS]
concepts: [ar, accrual, margin, wc, breakeven]
sessions: [C1.02, C2.09, C2.01, C2.02, C0.03]
tests: [tests/lessons-s1.html, tests/smoke-story.html, tests/test-t3b.js]
links: [ch1/lessons-week1, ch1/lessons-weeks3-4, ch1/spring-settings]
updated: 2026-10-05
---

## What it does
Hobb buys on credit: Revenue today, Cash in 14 days. The player bets what the chest will hold after Hobb pays.
Then wages day: the player reads a two-week cash forecast, answers Tomas's margin bet, and meets fixed and variable cost.
The page numbers here are story chapters, not calendar weeks. Wages day plays from day 8.

## Where
| File · symbol | What |
|---|---|
| `story.js` · `ch4` (~206) | Hobb at the mill. Haggle with `floor` at cost. Stage `ship4`. |
| `story.js` · `ch4b(order)` (~217) | After the delivery to Hobb. Revenue rose, Cash did not. Receivable explained. A `V.bet` on the chest on the morning after Hobb pays. Pins `ar`. Edric's page 1. Stage `sleep5`. |
| `story.js` · `revealIfDue` (~233) | Runs each morning. On or after the reveal day it calls `LV.revealBet()`. A win masters `accrual` and `ar`. |
| `story.js` · `ch5` (~236) | Wages day, run on the first morning at or after day 8. Reads `S.forecast(G.s, 14)`. Shows the timeline. Tomas's margin bet. Then `costScene`, then Edric's page 2. Stage `tomas6`. |
| `story.js` · `costScene` (~252) | Fixed against variable cost, and break-even after a price cut (see below). |

### costScene
1. Maud names two kinds of cost. Variable: seed and grain. Fixed: wages and interest. Today's fixed bill is `S.weekBills(s)`.
2. Contribution per sack is price minus `unitCost`. Break-even is the fixed bill divided by that contribution.
3. A multiple choice: a rival cuts the going price by 2. How many sacks break even now? The three answers are rotated by day.
4. The right answer masters `breakeven`. The notebook keeps "Fixed, variable, break-even".
5. The scene returns at once if contribution or the bill is zero or less.

## Data and state
- `G.s.bet` holds the open bet (`revealDay`). The engine decides at the day-7 sleep whether a hand walks off (`G.s.walkedOff`).
- `ch5` reads `walkedOff` and `walkedWages` to word the opening line.
- Concepts: `ar` and `accrual` (on a won bet), `margin` (Tomas's bet), `breakeven` (`costScene`). The `wc` concept is earned later, in Ezra's forecast.
- Notebook ids: `ar`, `forecast`, `breakeven`. Pins: one per `keep`.
- Sessions: C1.02 (receivables), C2.09 (working capital, a loose tag for the forecast), C2.01, C2.02, C0.03 (costScene header).

## Invariants
- The reveal never fires early: `ch4b` sets the reveal day to the due day plus 1.
- A walk-through hint stops mastery (`window.__walked`).
- `costScene` numbers come from the live books and `S.R`, so they differ per game.

## How to change it safely
- Edit Hobb's terms in `S.addOffer` and `R.premium` together, or the bet answer drifts.
- Keep `ch5` before `costScene`: the scene uses the wages the player just felt.
- `revealIfDue` and the morning chain in `after("morning")` must not both open a dialog. The chain runs one scene per morning.

## Known issues
- The `C2.09` tag on `ch5` is loose. The forecast is a direct-method cash forecast. C2.09 works from yearly deltas (`docs/curriculum-foundation-2026-10-03.md` ~151).
- The comment on `ch4b` says "four typed sums" became one bet. The old sums are gone.

## History
- WS3: four typed sums became one bet with a delayed reveal.
- 2026-10-04 audit: `costScene` added for fixed and variable cost (foundation 2).
