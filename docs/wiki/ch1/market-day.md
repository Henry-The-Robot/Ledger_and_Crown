---
title: Market Day (days 7, 14, 21)
type: system
pack: ch1
season: spring
files: [core/market.js, core/market.css, core/game.js]
symbols: [newFair, playHour, decide, villagers, floorBet, beCell, beFacts, tally, Grisby, grisbyPrice, commit, commitHour, settleBet, experiment, demandFit, FAIR_DAYS, CFG, goalLine, stallAt]
concepts: [demand, competitor, segments, breakeven, opportunity]
sessions: [C4.01, C4.02, C8.02]
tests: [tests/test-market-day.js, tests/market-day.html, tests/market-t6.html]
links: [ch1/practice, ch1/spring-settings, ch1/lessons-week2]
updated: 2026-10-05
---

## What it does
Three times a spring (days 7, 14, 21) the village holds a fair. The player sets a price and brings sacks. Each afternoon has 3 hours.
In each hour 8 villagers walk by and buy, hesitate or leave. From day 14 a rival, Grisby, sells too. After the fair a tally shows the
takings, a demand chart and a break-even question. After the first fair, Maud bets on the player's real floor price.

## Where
The file has two halves. The first half is pure and runs under node. The second half needs a browser.

| Half | File · symbol | What |
|---|---|---|
| Model | `core/market.js` · `CFG`, `FAIR_DAYS` | Hours 3, 8 villagers an hour, `maxStock` 60, Grisby from day 14, `gStock` {14: 24, 21: 5}. |
| Model | `villagers(day, hour)` (~42) | The 8 villagers: 3 thrifty, 3 comfortable, 2 in a hurry. Reserve price from the going price, spread evenly, so hours differ only by the player's price. |
| Model | `decide(v, mine, g, stock)` (~52) | One villager's choice: bought, hesitated (1 over reserve), dear (2+ over), soldout. Thrifty buyers take the cheaper seller. |
| Model | `newFair(s, o)` (~61), `playHour(f, price)` (~66) | Start a fair. Play one hour at a price. Returns the hour record. |
| Model | `grisbyPrice(market, mine)` (~36) | Above the going price he undercuts by 2, never below cost + 1. At or below, he holds the going price. |
| Model | `commitHour`, `commit` | Post each hour through the engine: Cash and Revenue, then Cost of goods sold and Inventory. |
| Model | `settleBet`, `experiment`, `demandFit` | Maud's day-14 bet. A worked price experiment. The least-squares demand line. |
| Model | `flat`, `bestFlat`, `auto`, bots | Test helpers. Bots see reactions, never reserves. |
| UI | `core/market.js` · `open`, `startAfternoon`, `beginHour`, `finishHour`, `finishFair` | The overlay on the village stall: set-up, price board between hours, tally. |
| UI | `tally(p)` (~403), `chartSVG` | The takings, a price-against-sacks chart and a fitted line. |
| UI | `beFacts`, `beCell` (~306), `beWire` | The break-even question after the takings. |
| UI | `floorBet(s)` (~332) | After the first fair: the lowest price worth taking for a spare sack. |
| UI | `drawFrame`, `path`, sprites | Pixel scene. Villagers are the player sprite recoloured. |
| `core/game.js` | `Market.open`, `stallAt`, `stallTiles`, `drawStall`, `goalLine`, `isOpen`, `init` | The stall prop, the click that opens the fair, the goal-ribbon line, the init. |

## Data and state
`s.market = { fairs: [...], named, bet, floorBet }`. A fair record keeps `day`, `units`, `revenue`, `gross`, `points` (price and units per hour).
Villagers need no saving: `S.roll` makes the same game meet the same villagers.
Evidence goes to the transcript: `segments` and `demand` (a price change that raised takings), `competitor` (a price above the going price against Grisby),
`demand` again on a won bet, `breakeven` on a first-try right answer, `opportunity` on a won floor bet.

## Invariants
- The same game meets the same villagers (`test-market-day.js`).
- Cash and Revenue rise by the takings. Cost of goods sold and Inventory move by the cost of the sacks (`test-market-day.js`).
- A fair posts after every hour, so a reload cannot replay it for more takings.
- A pricing bot beats a fixed price (`test-market-day.js`).
- Day 28 is never a fair day. It belongs to the Court.

## How to change it safely
- Change the model in the first half only. Keep `villagers` a function of `(day, hour)`.
- Keep the mix 3/3/2 in every hour. The demand chart relies on it.
- Any new sale must post through `S.post` and update `s.sacks` and the week totals, as `commitHour` does.
- Test with `node tests/test-market-day.js`, then the two `.html` pages.

## Known issues
- The file header says Grisby "undercuts by 1". The code and its comment at `grisbyPrice` say 2.

## History
- 2026-10-03: Market Day (WS7, PR #30; `ch1/LOG`).
- T6/T6b: break-even cell, floor bet, Grisby's stock (24, then 5), real floor.
- Creative call 4: fair days are 7, 14, 21 only.
