# WS3 test results (2026-10-02)

- `node tests/run-all.js`: 11 of 11 node tests pass (test-crown, deposits, depreciation, events, loans, market, pell, sprinkler-move, sprinkler-value, teach, transcript). `ipad-touch.js` needs playwright, not installed here, not run.
- `tests/smoke-story.html` (headless Chrome, merged with WS2 from origin/next): full story chapters 1-9 completes. Stages: intro, harvest2, ashby3, ship3, tomas2, plant2, hobb4, ship4, sleep5, tomas6, ezra7, sleep8, duke8, run9, done. Outcome closed day 28, close reconciles, 0 JS errors, 2 tag taps through the real hit-test, 4 timeline panels, typed Try beats 5 (was 13 in chapters 1-9 on v0.2).
- Books tie with 3 ripe plots at the start and with the wager posting (engine posts balance to zero; test-engine/fuzz style checks in the node tests still pass).
- Screenshots (1194x834, touch layout): `_build-shots/v0.3-story/` tag.png, stamp.png, bet.png, timeline-play.png.

## Not done
- Item 7 balance: overtrader still ends "paid" (gap +722, careful +59, reckless -583). Needs a model change, not a constant. No assertion added (it would fail).
- Wages-day tuning: the walk-off fires when Cash < wages + interest on the first wages day; not yet proved with `bot.js` policies (9+ packets and a sprinkler by day 7). The careful path in the smoke test is paid, no walk-off.
- Timestamped playthrough targets (first action < 60 s etc.) not measured.
- `tests/verbs.html` (headless tests per verb) not written; verbs are exercised through smoke-story.html only. Bet reveal on the morning after Hobb pays, play-mode payNow and the Ezra predict were run in the smoke path, not individually asserted.
- Ch1 hint button "Where else?" appears after 20 s; not visually checked.
