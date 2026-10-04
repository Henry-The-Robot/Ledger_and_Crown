# CHARTER — Chapter 1 builder: The Farm, and the platform (v1.0, 2026-10-04, creative lead)

## Mission
Build Chapter 1 of Ledger & Crown — one in-game year at Thornfield, four seasons ending at Midwinter — so that a player who
finishes it holds the MBA's foundations (59 curriculum sessions) and wants to play on. The shared core is a separate pack
(`docs/builders/platform/`); the same builder works it first (Phase P), then returns here.

## Read these, in this order (binding)
1. `docs/builders/README.md` — ownership, branches, standards, handover.
2. `docs/MASTER-PLAN.html` §0–§4, §7, §8, §11 (snapshot of the plan; the live version is the creative lead's artifact).
3. `docs/curriculum-coverage.json` — every session and its home. Your rows: `home` = `1SP`, `1SU`, `1AU`, `1WI`.
4. `docs/STORY-BIBLE.md` (cast, voices, scenes) and `docs/TASKS-season1.md` (canon decisions, creative calls 1–6).
5. `CHANGELOG.md` top entries — what the game does today.

## What Chapter 1 is (from the master plan; the creative lead owns changes)
| Season | Days | Question | Finale | Core ideas (≤ 8) |
|---|---|---|---|---|
| **Spring** (built, v0.4.6) | 28 | How does a profitable farm go broke? | The Reeve's Court | SP1 claims · SP2 profit ≠ cash · SP3 margin vs markup · SP4 fixed/variable, break-even · SP5 opportunity cost · SP6 time value · SP7 working capital + cash-cycle days · SP8 expected value & ruin |
| **Summer** | 28 | Why does every buyer suddenly want 14 days? | The Purveyor's Tender (negotiation) | SU1 finance the gap · SU2 price for terms (C16.11–12) · SU3 the hidden water bill · SU4 contribution per scarce resource · SU5 demand & elasticity · SU6 jobs, segments, positioning · SU7 focus, sunk cost, a test plot with a pass line · SU8 legal / ethical / smart, the bribe |
| **Autumn** | 42 | Someone is skimming the grain | The Harvest Inquest (deduction) | AU1 hiring, hidden information, pay · AU2 budgets · AU3 variances · AU4 controls, speaking up · AU5 the grain store (capex, NPV, critical path) · AU6 insurance · AU7 supplier power, the newsvendor · AU8 pivot and write-down |
| **Winter** | 56 | Midwinter | Vane calls every note; the Midwinter Assize | WI1 keep your own books · WI2 cost of carry, value of information · WI3 rates and inflation · WI4 ratios, red flags · WI5 safe debt · WI6 worth vs book value, claims order |

Design rules you build to (master plan §2): the idea is the mechanic · the villain's weapon is the lesson · **the forced
yes** (each season removes one easy answer an earlier season taught) · the ramp (Spring learn → Summer combine → Autumn
retain under weekly checkpoints → Winter prove it, the player keeps the books) · ≤ 8 new core ideas a season · test only
what was taught · every earlier core idea returns twice a season in play · the valley changes and every change means
something · cutscenes ≤ 25 s, skippable, replayable, each carries a clue.

## How it must be built
The architecture is in `docs/builders/platform/CHARTER.md`. For this chapter: all content lives in
`chapters/ch1/<season>/` as data (season settings, lessons, scenes, cutscenes, props, finale claims) plus its tests and
golden runs; nothing Chapter 1-specific goes into `core/`. Keep `MAP.md` current in every PR, and write the carry record
Chapter 1 hands to Chapter 2 into it (README "Chapter hand-off contract").

## Quality gate before any season ships (measured, not assumed)
Tests and CI green · a full scripted season with 0 JS errors · save/restore mid-week, mid-event, mid-finale · every day has
a choice and a surprise · no run of > 4 dialogue boxes without a choice · every teaching line checked against its session ·
bots: the careful player survives, the overtrader loses · the creative lead plays weeks 1 and the last week at iPad size ·
one fresh player's timed run, and their recall of the core ideas 3+ days later (6 of 8).

## You do not
Merge your own PRs · change canon, the cast or the season map without the creative lead · build a season before its
season design is approved by Kyle · build from a curriculum session marked "generic draft" before it is reviewed · edit
`chapters/ch2–4/` or `core/` in a Chapter 1 PR (core changes are platform PRs).
