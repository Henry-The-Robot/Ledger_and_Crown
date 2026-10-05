---
title: Books (statements and closing review)
type: system
pack: platform
season: spring
files: [books.js]
symbols: [close, highlight, review, reviewResult, postmortem, sumType, three]
concepts: [statements, cfs, ratios, gross, margin, wc, pct, accrual]
sessions: [C1.01, C1.02, C1.08, C1.09, C2.09]
tests: [tests/test-teach.js, tests/test-editor.js, tests/test-loans.js, tests/test-court.js]
links: [platform/engine, platform/game-ui, ch1/court]
updated: 2026-10-05
---

## What it does
`books.js` turns the season's journal into the three statements. It also writes Maud's highlight, Ezra's closing review and the insolvency post-mortem. It is pure JS, no DOM (`window.Books`).

## Where
| File · symbol | What |
|---|---|
| `books.js` · `close(s)` | Returns `{is, start, end, cf, day, outcome, balanced}`: income statement, balance sheets at start and end, indirect cash-flow statement. |
| `books.js` · `highlight(st, s)` | Maud's single line that explains the season, plus the row ids to light up (`is:`, `bs0:`, `bs1:`, `cf:` prefixes). |
| `books.js` · `review(st)` | Two or three questions on the player's own lines: current ratio (or working capital), cash gap, gross margin. |
| `books.js` · `reviewResult(s, correct, asked)` | Moves `s.trust.ezra` by `correct * 2 - asked`, then returns `Spring.terms(s)`. |
| `books.js` · `postmortem(s)` | For an insolvent ending: names what the last week's Cash went on. |
| `books.js` · `three(c)` | Dedupes options; the first option is the answer. |

## Data and state
Reads `s.bal`, `s.opening`, `s.journal` and `s.outcome`. Writes only `s.trust.ezra` (in `reviewResult`). The cash-flow check compares the indirect `cfo` with a direct sum of cash lines; `reconciles` must be true.

## Invariants
- `balanced` is true at start and end: assets = liabilities + equity.
- `cf.reconciles`: change in Cash = `cfo + cfi + cff`, and `cfo` equals the direct figure.
- Review answers come from the player's own statement lines, so they change with the play.

## How to change it safely
- A new account in the engine: add it to `close`, or the statements will not balance.
- A new journal `type` that moves Cash outside operations: add it to the exclusion list in `cfoDirect`.
- Game.js calls `Books.close` in `closeBooks` and `Books.review` in `review`. See [game-ui](game-ui.md).

## Known issues
- `highlight` sorts its `drains` array in place; harmless today, since the array is local.
