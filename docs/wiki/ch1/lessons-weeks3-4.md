---
title: Lessons, story chapters 6-9 (Tomas's terms to the close)
type: lesson
pack: ch1
season: spring
files: [story.js, transcript.js]
symbols: [tvmScene, tvmFacts, ch6, ch7, dukeScene, arrive, ch9t, chPage, pvScene, cashBook, cashBookRows, close, craneOffer, sell, caseBoard, page, keep, pin, LETTERS, PAGES, letterOrder, keepFloor, noteDeposit, TITLES]
concepts: [tvm, ap, interest, wc, overtrading, opportunity, unearned, statements, cfs]
sessions: [C0.01, C5.01, C1.01, C1.06, C2.09, C1.03, C1.08]
tests: [tests/lessons-s1.html, tests/ezra-loan.html, tests/week4.html, tests/test-t3b.js, tests/test-offer.js, tests/test-spine.js]
links: [ch1/lessons-week2, ch1/endings, ch1/court, ch1/spring-settings]
updated: 2026-10-05
---

## What it does
The middle and end of the story. Tomas's terms teach time value. Ezra lends against a forecast. Corvin Vane brings two big
orders (overtrading). Week 3 adds present value. Week 4 adds Edric's cash book, closing the books, Crane's standing offer,
the case board and Edric's letters. Chapter numbers are the story's, not calendar weeks.

## Where
| File · symbol | What |
|---|---|
| `story.js` · `tvmFacts(bill)`, `tvmScene(again)` (~289) | Tomas's 2/7 net 14 against Ezra's weekly rate. The player buys on account, then picks the day to pay on a timeline. The right choice masters `tvm`. `again` is the week-3 replay: the rate has moved and the answer can flip. |
| `story.js` · `ch6` (~317) | Plays `tvmScene(false)`, then stage `ezra7`. |
| `story.js` · `ch7` (~319) | Ezra. The player forecasts the lowest Cash and its day. Both right (within 5): rate cut 100 bp, masters `interest` and `wc`. Then a borrow loop (100 or 200). Stage `sleep8`. |
| `story.js` · `arrive(n)`, `dukeScene(n)` (~340, ~345) | Corvin's order n (`S.R.corvin`). Day 12, then day 15. A what-if timeline shows Cash and what is tied up. A typed answer (order 1) or a bet (order 2). The choice is all, half or decline. Masters `overtrading` if the choice matches the player's own board. |
| `story.js` · `chPage` (~380) | That night: Edric's page 9, the same order every spring. Stage `sleep9`. |
| `story.js` · `ch9t` (~377) | Week 3: `tvmScene(true)`, then stage `run9`. |
| `story.js` · `pvScene` (~265) | Present value on a real invoice. Sell it to Ezra at 85%, or borrow? Plays once, on days 16-21 (`st.pv`). |
| `story.js` · `cashBookRows`, `cashBook` (~390, ~397) | Day 22 on. Rows for days 7, 14, 21 and today: profit, Cash cleared, Cash tied up. Pins the cash book. Maud then goes quiet. |
| `story.js` · `close(stm, h)` (~411) | The guided close. Shows the three statements. The player taps the cash-flow line where the profit went. First-tap right masters `cfs` and `statements`. Edric's page 4. |
| `story.js` · `craneOffer(opts)`, `sell(o)` (~466, ~478) | Crane's buy-out. `first` is the day-1 scene. `mercy` is his visit when Cash is short for wages. `sell` ends the game and shows the ending. See `ch1/endings`. |
| `story.js` · `caseBoard` (~446) | The corkboard of clues. Opened from the Books strip or the Desk. |
| `story.js` · `page`, `keep`, `pin`, `LETTERS`, `PAGES`, `letterOrder` | Letter helpers (below). |
| `story.js` · `keepFloor`, `noteDeposit` | Notebook entries called from `market.js` (real floor) and `game.js` (deposits, `unearned`). |

### Letters, pins and the notebook
- `LETTERS` and `PAGES` are parallel arrays: 10 titles and 10 texts. Index 9 is the midpoint page and uses `S.R.duke`.
- `page(i)` records the page and its day, pins a clue (kind `page`), and opens the page overlay.
- `keep(id, ...)` writes one notebook entry per concept id, then calls `pin`.
- `pin(...)` adds a clue card: a title (6 words), the player's number (5), a source (4), 12 words in all.
- `letterOrder()` sorts letters by day found. "The thing I signed" is always last (shown after the Court).

## Data and state
Story state `st`: `stage`, `pv`, `book`, `mercy`, `tvmRate`, `tied1`, `pages`, `pageDays`, `clues`, `notebook`. Game state: `G.s.payPlan`,
`G.s.rateAdj`, `G.s.sold`. Crane's mercy visit fires once in week 3 when Cash is below the weekly bill.

## Invariants
- `tvm` is earned only in `tvmScene`, only when the choice was the cheaper one (`lessons-s1.html`).
- The Ezra loan always arrives or is explained (`ezra-loan.html`).
- Cash-book rows are one per day and add up (`test-t3b.js`).
- Offer price formula and the sell flow (`test-offer.js`). Careful, overtrader and reckless outcomes (`test-spine.js`).
- Letters list in the order found, last one last (`week4.html`).

## How to change it safely
- The Corvin sizes live in `R.corvin`. Never put a size in the scene text.
- A new lesson needs: a stage in `GOALS`, an entry in `onTalk` or the morning chain, a `keep`, and a transcript concept id.
- `tvmScene` rounds in whole coins to match the engine. Keep `tvmFacts` the single source.

## Known issues
- Tag drift (`docs/curriculum-foundation-2026-10-03.md` ~122): the chapter-7 header cites C1.06, which is bond interest and leases. The honest sources are C0.01 and C5.01.
- The Duke's invoice (1,320) is above Ezra's loan limit, so `pvScene` picks the largest invoice he can fund, or an illustrative one.
- `Scenes.morning` is called in the morning chain, but `scenes.js` does not define it (see `ch1/village-scenes`).

## History
- WS6: Corvin's two orders, the Ezra loop, Crane's offer, the case board, farm name.
- 2026-10-04 audit: `pvScene` (present value) added in week 3.
- Creative call 1: week 4 is silent; the cash book is Maud's last scene.
