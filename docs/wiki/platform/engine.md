---
title: The engine (double-entry journal)
type: system
pack: platform
season: all
files: [engine.js]
symbols: [R, post, ACCTS, balanceSheet, forecast, terms, eventsFor, newGame, sleep, preview, coach, crownFund, OFFERS, roll, makeOffers]
concepts: [equation, accrual, ar, ap, inventory, depreciation, tvm, wc, overtrading, insolvency]
sessions: [C1.01, C1.02, C2.09]
tests: [tests/test-crown.js, tests/test-events.js, tests/test-deposits.js, tests/test-frost.js, tests/test-loans.js, tests/test-depreciation.js, tests/test-walkoff.js, tests/test-spine.js]
links: [platform/books, platform/bots, platform/tests-and-ci, ch1/court]
updated: 2026-10-05
---

## What it does
`engine.js` is the whole season as pure JS with no DOM. It runs in the browser (`window.Spring`) and in node. Every action posts a balanced entry to a journal. Every view is derived from the postings.

## Where
| File · symbol | What |
|---|---|
| `engine.js` · `R` (top) | Spring's constants: 28 days, seed and sack costs, wages, Duke and Corvin orders, Crown debt 1250, prices by day, event windows. |
| `engine.js` · `post(s, type, memo, lines)` | The one write path. Lines are integers and must sum to zero, else it throws. |
| `engine.js` · `ACCTS` | 18 accounts, each `[name, class]`. |
| `engine.js` · `newGame(opt)` | Builds state `s` and posts the opening balances. Options: `story`, `seed`, `bonus`, `ezraTrust`. |
| `engine.js` · `balanceSheet(b)` | Derives assets, liabilities, equity and net income from a balance map. |
| `engine.js` · `terms(s)` | Ezra's loan limit and rate, and Tomas's credit, from trust. |
| `engine.js` · `forecast(s, n)` | Cash rows for the next days. Same night order as `sleep`. |
| `engine.js` · `sleep(s)` | Ends the day: growth, events, collections, pay-day, bills, late orders, new offers. |
| `engine.js` · `eventsFor(seed)` | Event days per game, using mulberry32. Seed 0 gives the canonical calendar `R.events`. |
| `engine.js` · `roll(d, who, salt)` | Stateless 0..1 hash roll. Same game gives the same offers. |
| `engine.js` · `makeOffers`, `OFFERS` | The daily buyer offers; sizes and prices vary by trust and `roll`. |
| `engine.js` · `preview(s, fn)` | Runs an action on a copy and returns the entries it would post. |
| `engine.js` · `coach(s)` | Maud's one line of advice. `crownFund(s)` gives the "if Midwinter were tomorrow" verdict. |

## Public API
`root.Spring` exports: `R, roll, eventsFor, eventDay, pellDays, pedlarDays, marketPrice, spotPrice, traderPrice, ACCTS, NAMES, OFFERS, newGame, post, balanceSheet, terms, rain, stage, sprinkled, committed, sacksComing, openOrders, weekBills, billsDue, nextWeekEnd, forecast, discNow, addOffer, setPrice, factor, act, accept, decline, deliver, sellSpot, buySeeds, payBills, payOneBill, buySprinkler, wager, wagerWin, sprinklerFacts, buyFence, crownFund, frostFacts, NOTICE_DAYS, preview, notice, answerNotice, marketOutlook, rescue, refusePell, buyPoison, ratLoss, warning, borrow, repay, loanFacts, sleep, coach`.

## Data and state
State `s` holds `bal` (one balance per account), `journal`, `log`, `uses` (concept uses read by game.js), `trust`, `plots`, `offers`, `orders`, `invoices`, `bills`, `seed`, `events`. Saves from before WS6 have no `s.events` and use the canonical calendar.

## Spring-specific versus core
- Spring-specific: the whole `R` block, `OFFERS`, `NAMES`, `NOTICE_DAYS`, event kinds (pigs, rats, warm, frost), Pell, Barnaby, the Duke and Corvin orders.
- Core and reusable: `post`, `ACCTS`, `balanceSheet`, `forecast`, `preview`, `roll`, `eventsFor`, the invoice and bill subledgers.
- Today core and Spring share one file. The restructure (P3) splits them.

## Invariants
- Every posting sums to zero, so Assets = Liabilities + Equity after every action.
- Subledgers (invoices, bills, sacks) tie to the ledger accounts; `tests/test-crown.js` and `tests/test-events.js` run the bots through full seasons.
- Same seed gives the same game.

## How to change it safely
- A new account: add it to `ACCTS`, then to `balanceSheet` and to `Books.close`. The balance sheet sums accounts by name.
- A new event: add its kind to `R.events` and `R.windows`, handle it in `overnight`, and run `tests/test-events.js` under three seeds.
- A new number: put it in `R`, never in a lesson string.

## Known issues
- A comment in `crownFund` still says the Crown's debt is 1,000. `R.crownDebt` is 1250.
- The file header names `test-engine.js`. That file does not exist.
