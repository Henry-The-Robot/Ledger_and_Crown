# Changelog

All notable changes to Spring at Thornfield. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [v0.2-beta]

Integrates PRs #1-#10 (via `claude/integrated-all` for #1-#9, then `claude/teach-and-thrill` for #10) plus review fixes.
Saves from v0.1-beta are not carried over (new save key): everyone starts a fresh game.

### Added
- #1 Sprinklers can be picked up and moved (hint text "pick up sprinkler").
- #3 A moving market price (6-10 a sack, shown in the HUD with arrows), buyers who differ day to day (rush orders, bigger orders on longer terms), and real room to haggle (each ordinary buyer has a reserve price above the first offer).
- #4 Overnight events: pigs (day 9), rats (16), a warm day (19), a frost (23), each warned a day ahead; write-offs post to a new "Crop & stock losses" account; a fence from Tomas.
- #5 Early loan repayment costs one week's interest before day 21, with "Should I repay early?" advice in the player's own numbers.
- #6 Placed sprinklers save 20 a week in wages (down to a floor of 20) and start seeds a day ahead; "Is a sprinkler worth it?" advice at Tomas.
- #7 Pell the pig farmer and Barnaby the rat-poison pedlar, with a "Promised, not booked" block in the Ledger.
- #8 Customer deposits (days 11 and 18): Cash now, a liability until the grain ships; refund plus forfeit if undelivered.
- #9 A "Toward the Crown" meter in the HUD and an "If Midwinter were tomorrow" settlement on the season-close screen.
- #10 Stakes and teaching layer: Crown debt 1,250, a fourth verdict ("Ezra will bridge the gap"), a one-time emergency loan in place of instant insolvency, an insolvency post-mortem, a village notice board (price outlook plus small decisions on days 2, 6, 12), a books preview before purchases, a Ledger tour, a predict-then-reveal Cash prompt before sleeping, click-any-HUD-number explanations, frost pile-up coaching.
- `CHANGELOG.md`; `_build-shots/shots.html`, a screenshot driver for headless Chrome.

### Changed
- #2 Depreciation is 5 a week per sprinkler owned (it was 5 total however many you had).
- Save key is now `lc_spring_save_v3` (old saves lack the new accounts and fields and would show NaN balances).
- The fence is offered up to the night the pigs come, read from the events table (no literal 9).
- Pell's opening line and options agree: 14 days for the haggle option, 21 days (plus a quarter of the pig money) for the share option.
- When one buyer has two live orders (Ashby on day 11) the player picks which to discuss; neither is hidden.
- Ezra's emergency-loan rate penalty lives in its own field (`rescueAdj`), so the story's forecast discount cannot erase it.
- The books preview never fires while a story chapter is running.
- The road trader pays the going price - 1, the market cart the going price - 2 (never below the cost of 4).
- The sandbox Duke order is 90 sacks at the story's 10 a sack (the moving market had dropped it to 9). The `OFFERS` price column is now used only for the Duke.

## [v0.1-beta]

Spring beta as first shared with testers (git tag `v0.1-beta`, the `master` commit before this release): the nine-chapter
story (keys, first seed, the bakery, Hobb pays later, wages day, Tomas's terms, Ezra, the Duke's steward, closing the
books), the sandbox, the Ledger with income statement, balance sheet and cash-flow statement, Ezra's review, and the
Transcript of accounting concepts.
