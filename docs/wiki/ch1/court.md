---
title: The Reeve's Court (Spring finale and exam)
type: system
pack: ch1
season: spring
files: [court.js, court.css, game.js]
symbols: [BUILDERS, POOLS, build, hearing, letterPage, endScene, teaser, closeBooks]
concepts: [equation, cfs, ar, inventory, margin, breakeven, opportunity, tvm, wc, ev, accrual, overtrading]
sessions: [C1.01, C1.02, C1.08, C16.01, C0.08, C2.02, C5.01, C0.06, C2.09]
tests: [tests/test-court.js, tests/court.html]
links: [ch1/bug-stuck-scene, ch1/LOG]
updated: 2026-10-04
---

## What it does
Day 28. Vane's advocate makes 9 claims built from the player's own statements. The player PRESSes a claim for detail
(sometimes it reveals evidence) or PRESENTs a statement line, a clue card or a found card to refute it. Refute 6 to pass;
a failed hearing offers another sitting, never a game over. Then the certificate, Edric's last letter, Crane reads the
seal, Vane's offer comes due, and the Summer teaser.

## Where
| File · symbol | What |
|---|---|
| `court.js` · `BUILDERS` (~37) | One builder per claim. Each returns `null` when its premise doesn't fit these books. Fields: `text`, `press`, `reveal`, `hint`, `right(card)`, `rightLabel`, `maud`, `crane`. |
| `court.js` · `POOLS` (~132) | One pool per Season 1 core idea (8); a sitting draws one claim per pool, plus `guarantee` (or `callable`). |
| `court.js` · `build(o)` (~134) | Picks the 9 claims for a sitting. `attempt` rotates pool variants and the numbers in hypothetical claims. |
| `court.js` · `hearing(o, attempt)` (~168) | The play loop: press, present, patience, Crane's and Ezra's testimony. |
| `court.js` · `letterPage`, `endScene`, `teaser`, `run` (~216–251) | After a pass: the letter, the seal, `vaneFinal`, the Summer teaser. |
| `game.js` · `closeBooks` (~789) | Calls `Court.run({statements, clues, flags, trust, seed, farm, facts, letter})` (~806). |
| standalone | `game.html?court=1` runs a careful-bot season straight into the Court. |

## Data and state
Reads the closing statements, case-board clues, story flags, trust (Crane ≥ 3 testifies once; Ezra ≥ 3 confirms his rate),
`facts.bill` (the real weekly fixed bill from `S.weekBills`), `facts.ratePct`, `facts.market`. Writes `vaneFinal` to the
story flags; transcript evidence only for an unhinted, unwitnessed right present.

## Invariants
Every claim's right answer derives from the statements (`test-court.js`) · 9 claims, pass 6, every core idea once per
sitting · two sittings on the same books differ · no literal numbers in claim text.

## How to change it safely
- New claim: add a builder, put its id in the right `POOLS` entry, give it a `right()` that accepts every honest card, and
  extend `test-court.js`. Keep Crane's line in his voice.
- Changing a number: take it from `facts` or the statements, never a constant (the old break-even claim used `R.upkeep`
  and was wrong for sprinkler players).

## Known issues
- The letter overlay once hid the "Fold it away" button (fixed in v0.4.4: the hall hides while the letter is open).

## History
- T4 (PR #32 era): first Court, 8 claims, pass 6.
- v0.4.5: 10 claims, pass 7, four core-idea claims added.
- v0.4.6 (PR #41): 9 claims, pass 6, rotating pools (creative call 6); real weekly bill in the break-even claim.
