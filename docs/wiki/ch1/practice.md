---
title: Practice (the daily problem)
type: system
pack: ch1
season: spring
files: [practice.js, game.js, transcript.js]
symbols: [BANK, pick, compare, record, available, tierOf, problem, wagerStake, drainUses, teacher, wk4]
concepts: [gross, margin, tvm, wc, ap, depreciation, breakeven, ratios, accrual, opportunity, overtrading, ev]
sessions: []
tests: [tests/test-practice.js, tests/practice-ui.html, tests/standing-ui.html]
links: [ch1/standing-orders, ch1/market-day, ch1/lessons-weeks3-4]
updated: 2026-10-05
---

## What it does
Once a day the teacher sets one small problem on the player's own books. Maud teaches in weeks 1-3. Ezra takes over in week 4.
Problems get harder as a concept moves from introduced to practiced to mastered. A right answer without help is evidence in the
transcript, a favour and a streak day. On days divisible by 3, with two or more offers, the problem is a comparison: which offer puts more Cash in the chest by day 28.

## Where
| File · symbol | What |
|---|---|
| `practice.js` · `BANK` (~12) | 16 problems. Each has `id`, `concept` and `make(s, tier)`. `make` returns a problem or `null` when it does not apply today. |
| `practice.js` · `pick(s, level, allow)` (~61) | Chooses today's problem. Weights by level: unseen 0, introduced 1.6, practiced 1.1, mastered .35, plus a small hash of the day. Skips the last 3 ids. Same day, same pick. |
| `practice.js` · `tierOf` (inside `pick`) | Tier 1 by default. Tier 2 when the concept is practiced. Tier 3 when it is mastered. |
| `practice.js` · `compare(s)` (~69) | Two offers side by side. Answer A, B or the same. Cash counts only if it arrives by day 28. |
| `practice.js` · `available(s, level, allow)` (~78) | `null` if today's problem is already done. Else `pick`. |
| `practice.js` · `record(s, prob, right, walked)` (~80) | Marks the day done, logs it, updates streak and favours. |
| `game.js` · `problem()` (~522) | The play loop (below). |
| `game.js` · `wagerStake`, `teacher()`, `wk4()` (~517, ~512) | The optional stake. Who teaches. |

### The bank, by concept
`gross`, `markup` (margin), `interest` (tvm), `payday` (wc), `discount` (ap), `depreciation`, `breakeven`, `ratio` (ratios), `deposit` (accrual),
`opportunity`, `tvmflip` (tvm), `scaling` (overtrading), `ev`, `ruin` (ev), `fund9` (tvm), `repay100` (tvm). Plus `compare` (wc).
Tier 2 and 3 change the numbers or add a twist: a rival's price cut, a haul cost, two weeks of interest, a larger sales jump.
`breakeven`, `opportunity`, `tvmflip` and `ev` carry a `why` question.

### What `problem()` does
1. If today is done, the teacher says so and stops.
2. Choose `Practice.compare(s)` on a comparison day, else `Practice.available(s, TR.state)`.
3. Offer a stake of up to 3 Cash (`wagerStake`). A first-try right answer pays the stake back doubled. Else Maud keeps it.
4. A problem with `choices` or a comparison is a menu. Others use `ask` with hints and a worked answer (`work`).
5. After a first-try right answer, a problem with `why` asks one "why" choice. The right reason calls `TR.master`.
6. `Practice.record`. A right answer calls `TR.master` and may raise trust. A wrong answer says "We'll come back to this one."
7. `drainUses`, `hud`, `save`.

## Data and state
`s.practice = { streak, best, favour, recent[], done{day: 1|2}, log[] }`. Nothing here posts to the books, except the stake (`S.wager`, `S.wagerWin`),
which posts real Cash. A walk-through or a hint is not evidence.

## Invariants
- Every answer is computed from the same engine the player sees (`test-practice.js` re-derives each one).
- The same day always picks the same problem.
- A problem returns `null` when its premise is missing (no loan, no bill).
- Week 4: no problem from Maud. The day's problem comes from Ezra (`week4.html`).

## How to change it safely
- Add a problem to `BANK` with `make(s, tier)`. Return `null` when it does not apply. Add a checker to `test-practice.js`.
- Take every number from `S.R` or the live books. A literal breaks when `R` changes.
- Keep `hints` as two steps. Keep `work` as the full answer.
- A new concept id must exist in `transcript.js` `CONCEPTS`.

## Known issues
None recorded.

## History
- 2026-10-03: practice (PR #29; `ch1/LOG`).
- T5: practice as play. The stake, the streak, the comparison.
- Creative call 1: Ezra teaches in week 4.
- Later: tiers 2-3, `why` questions, and the `fund9` and `repay100` decisions.
