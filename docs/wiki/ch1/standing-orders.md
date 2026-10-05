---
title: Standing orders (the notice-board contracts)
type: system
pack: ch1
season: spring
files: [chapters/ch1/spring/standing.js, core/game.js]
symbols: [today, facts, judge, mark, state, MIN_DAY, MAX_DAY, KINDS, BUYERS, noticeBoard, standingBoard, standingOrder, soOk]
concepts: [margin, opportunity, wc]
sessions: []
tests: [tests/test-standing.js, tests/standing-ui.html, tests/chat.html]
links: [ch1/practice, ch1/cast, ch1/market-day]
updated: 2026-10-05
---

## What it does
Each morning from day 3 to 26 the notice board posts one or two repeatable contracts from the regular buyers (Ashby, Hobb, Mira).
Some are good. Some are traps. The player may check one first (margin, the best other sale, can Cash carry the seed, when the money comes),
then take it or pass. The verdict names what was wrong. Taking a good order after the check is evidence in the transcript.

## Where
| File · symbol | What |
|---|---|
| `chapters/ch1/spring/standing.js` · `today(s)` (~14) | The day's contracts. A hash of the day picks 1 or 2 (a second one about one day in three), the buyer, the kind and the size. Orders already taken or passed are left out. |
| `chapters/ch1/spring/standing.js` · `KINDS` | `good, good, thin, slow, good`: 60% good, 20% thin, 20% slow. |
| `chapters/ch1/spring/standing.js` · `facts(s, o)` (~28) | The numbers for the check: cost, margin, trader floor, seed needed, Cash after, the week's bill, arrival day. |
| `chapters/ch1/spring/standing.js` · `judge(s, o, f)` (~34) | Verdict `{well, why[], line}`. `thin`: price at or below the road trader. `cant`: seed costs more than Cash. `slow`: terms and the money is late or the next pay-day is short. |
| `chapters/ch1/spring/standing.js` · `mark(s, sid, how)` (~42) | Records `well`, `off` or `passed` and counts. |
| `core/game.js` · `noticeBoard()` (~374) | Adds a "Standing orders (n)" button when `soOk()` and there are orders. |
| `core/game.js` · `soOk` (~385) | True when Standing is loaded, the story is at chapter 5 or later (or off), and the day is at least `MIN_DAY`. |
| `core/game.js` · `standingBoard()` (~387) | Lists the day's orders. |
| `core/game.js` · `standingOrder(o)` (~393) | Check, take or pass. Details below. |
| `core/game.js` · `chat(who)` | A buyer's menu also shows her standing deal (`ch1/cast`). |

### Order kinds
| Kind | Price | Terms | Sacks |
|---|---|---|---|
| good | going price | Cash | 6-15 |
| thin | going price - 2, never below cost + 1 | Cash | at most 12 |
| slow | going price + 1 | 14 days | 15-21 |

### What `standingOrder` does
1. Choose: Check it first, Take it as posted, Pass.
2. A check asks the player to type the margin. `checked` is true if no hint was used. Then it shows margin, trader price, seed and Cash, and arrival day.
3. A checked pass of a bad order masters `opportunity` (thin) and `wc` (other traps).
4. A take makes an ordinary offer (`S.addOffer`) and haggles. The verdict uses the final price.
5. A checked take of a good order masters `margin` and `opportunity`. A bad take: "Maud has a word."

## Data and state
`s.standing = { seen{sid: how}, well, off, log[] }`. Nothing here posts to the books. A taken order is an ordinary offer, shipped like any other.
The engine, bots and season tuning never see standing orders.

## Invariants
- Deterministic: the same day gives the same orders.
- 1-2 orders a day, a mix of good and trap orders. The verdict names the trap. Taking the good ones keeps the books whole (`test-standing.js`).
- A buyer's menu shows her deal and says when she is not buying (`chat.html`). The board check and verdict work in the UI (`standing-ui.html`).

## How to change it safely
- Change `KINDS` to change the mix. Re-run `test-standing.js`.
- A new trap needs a branch in `judge` and a word in `why`. `standingOrder` reads `why` to pick the concept to master.
- Keep orders to the three buyers in `BUYERS`, or the chat menu will not show them.
- `MIN_DAY` is read by `core/game.js` (`soOk`). Change it there and here together.

## Known issues
None recorded.

## History
- T5: practice as play and standing orders (`ch1/LOG`).
- 2026-10-04: chat shows a buyer's standing deal.
