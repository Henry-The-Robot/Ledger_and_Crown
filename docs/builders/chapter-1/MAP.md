# MAP — Chapter 1 (seed, 2026-10-04, v0.4.6; platform P3 moves these into `chapters/ch1/spring/` and rewrites this map)

Read this instead of the code. Open a file only at the place named here.
**Wiki pages so far:** [court](../../wiki/ch1/court.md) · [bug: stuck scene](../../wiki/ch1/bug-stuck-scene.md) ·
[build log](../../wiki/ch1/LOG.md). Platform task W2 adds a page for every row below and links it here.

## Spring — where each part lives
| Part | File · entry points | Notes |
|---|---|---|
| Season settings | `engine.js` 8–47 (`R`) | 28 days, unit cost 4, wages 45/week, Tomas 2/7 net 14, factor 85%, Duke 132 @ 10 / 28 days, Corvin orders days 12 and 15, Crown 1,250 at Midwinter, prices by day, events and their windows, frost odds. |
| Chapter lessons (weeks 1–4) | `story.js` | Scene functions incl. `costScene` (fixed vs variable, wages day), `pvScene` (present value, week 3), `craneOffer` (buy-out), `caseBoard`, letters; the morning trigger near the end (`run9` stage, day 16–21 pv). Maud ≤ 2 sentences a box. |
| Village scenes (days 9–28) | `scenes.js` · `available()`, `pending()` | One-time, red "!" on the speaker; set flags `vane`, `hobbExt`, `ashbyPromise`, `guarantee`, `maudConfessed`, `craneVane`. |
| Cast, voices, greetings, topics | `cast.js` | Voices in `docs/STORY-BIBLE.md`; Crane's "Item:" ≤ 15% of sentences. |
| Market Day (days 7, 14, 21) | `market.js` · `newFair`, `playHour`, `decide` (villager types), `floorBet`, `beCell` (break-even), `tally`, Grisby | Sales post through the books. |
| Practice (desk / Maud / Ezra) | `practice.js` · problem list (tiers 1–3, "why" questions), `pick`, `record` | Tiers by concept level; Ezra takes over in week 4. |
| Standing orders | `standing.js` · `today`, `facts`, `judge` | Thin / slow / can't-carry traps. |
| The Reeve's Court (day 28) | `court.js` · `BUILDERS` (claims), `POOLS` (one per core idea), `build`, `hearing`, `letterPage`, `endScene`, `teaser` | 9 claims, pass 6, retake rotates variants and numbers. Saves `vaneFinal`. |
| Endings and epilogues | `endings.js` · `offer`, `soldOut`, `ending`, `epilogue`, `unlock` | Sold out / Seized / Bridged / Free. |
| Transcript concepts | `transcript.js` · `CONCEPTS`, `CORE` | The 8 core ideas are tagged `CORE`. |

## Core ideas → where they are taught and tested
SP1 claims: ch1 Crane's list, Court `ownsNothing`/`equityBank` · SP2 profit ≠ cash: ch4–5, Hobb, deposits, Court `profitCash`/`arCash`/`inventoryCash` · SP3 margin vs markup: ch3, Court `margin` · SP4 fixed/variable: `costScene`, Market Day `beCell`, Court `breakeven` · SP5 opportunity cost: `floorBet`, Court `floorOffer` · SP6 time value: Tomas vs Ezra flip, `pvScene`, Court `waitingFree` · SP7 working capital: Corvin's orders, cash book, Court `dukeGenerous` (days count not built: S2) · SP8 EV and ruin: frost almanac, practice, Court `caravanEv`.

## Invariants (tests enforce them)
Assets = Liabilities + Equity after every posting · subledgers match the ledger daily · careful bot pays the Crown, overtrader and reckless lose (`test-crown.js`, `test-spine.js`) · every day 2–28 has a choice and a surprise (`test-dayloop.js`) · ≤ 4 dialogue boxes without a choice (`test-editor.js`) · Court answers derive from the statements (`test-court.js`).

## Tests to run for any Chapter 1 change
`node tests/run-all.js` · headless: `smoke-story`, `court`, `lessons-s1`, `week4`, `market-day`, `ezra-loan`, `chat`, `ipad`, `stale-scene`.

## Carry record Chapter 1 hands to Chapter 2
Not defined yet (platform P4). Flags available today: `vane`, `vaneFinal`, `hobbExt`, `ashbyPromise`, `guarantee`, `maudConfessed`, `craneVane`; trust per character; the ending.

## Summer, Autumn, Winter
Not built. Plan: `docs/MASTER-PLAN.html` §4. Each gets `chapters/ch1/<season>/DESIGN.md` before any code.
