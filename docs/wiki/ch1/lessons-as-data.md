---
title: The story's lessons as data (P6b)
type: system
pack: ch1
season: spring
files: [chapters/ch1/spring/lessons.js, chapters/ch1/spring/story.js, core/scene.js]
symbols: [RECORDS, CALC, VERB, ctx, play, tvmFacts, cashBookRows]
concepts: []
sessions: []
tests: [tests/test-story-trace.js, tests/test-scene.js, tests/test-t3b.js, tests/test-s2.js]
links: [platform/scene-player, ch1/lessons-week1, ch1/lessons-week2, ch1/lessons-weeks3-4, ch1/endings]
updated: 2026-10-05
---

## What it does
Every lesson chapter of Spring is a record in `lessons.js`: ch1 to ch9, the cost scene, the present-value scene, Tomas's terms, Ezra, Corvin Vane (two orders), Edric's page and cash book, closing the books, and Crane's offer.
`core/scene.js` plays them. `story.js` keeps the hooks (`onTalk`, `after`), the UI (week cards, case board, ending card, farm name) and two tables.
`CALC` holds formulas: they read the game and return variables. `VERB` holds game actions and verbs (haggle, bet, timeline, tag, loan loop).
`lessons.js` also holds `TITLES`, `LETTERS`, `WEEKS`, `GOALS` and `PAGES` (page 9 is filled with `S.R.duke`).

## Where
| File · symbol | Job |
|---|---|
| `chapters/ch1/spring/lessons.js` · `RECORDS`, `BY` | The 22 records. Words only. `cycle` (S2, week 3: receivable, inventory and payable days from the player's own books, C2.09) and `waterfall` (S2, week 4: Ezra's order of a sale, debts first and the owner last; sets flag `debtsFirst`). |
| `chapters/ch1/spring/story.js` · `ctx` | What a scene calls: `tell`, `speak`, `quiz`, `keep`, `pin`, `to`, `page`, `master`, `calc`, `verb`. |
| `chapters/ch1/spring/story.js` · `CALC`, `VERB` | Formulas and game actions. A record names them. |
| `chapters/ch1/spring/story.js` · `craneOffer`, `tvmScene`, `costScene`, `pvScene`, `dukeScene` | One-line wrappers: `play(id, start variables)`. They keep the old API. |

## Invariants
- `test-story-trace.js` plays 30 scenes under 3 player policies and compares every box, choice, verb call and state change with `tests/golden/ch1-spring/story-trace.json`. The golden was recorded from the code before the port.
- Every `calc` and `verb` a record names exists (same test).
- `play` answers `false` when a scene stopped at an `end` step. `tvmScene` and `craneOffer` callers rely on it.

## How to change it safely
- A text change: edit `lessons.js`, re-record with `node tests/test-story-trace.js --record`, and read the golden diff.
- A new formula goes in `CALC`; never write a sentence in a formula, except a short phrase (a verdict word).

## S2 naming passes (each checked against its session)
Walk-away point = best alternative less what it costs to take it (`ch3`, C16.12). Sunk cost: the seed already bought never decides the next sale (`keepFloor`, C7.07). Legal, ethical and smart are three questions (`vane_offer` aside in `scenes.js`, C12.02). **Anchoring is not named**: C7.07 says it is not in its text (TODO for the Lead). The cycle uses whole days: Receivables ÷ Revenue × days so far, Inventory ÷ COGS × days, Payables ÷ COGS × days (C2.09).

## Known issues
- `V.craneOn = true` writes to the `LV` proxy, not to `Verbs` (the old code did the same). It has no effect. Kept so the port stays identical.
- Five older Maud boxes run past two sentences (ch4b, ch5, tvm x2, duke). `test-t3b.js` lists them as a note.
- The browser golden story run (`tests/golden/ch1-spring/story-seed3.json`) was not re-run here: no Playwright locally.
