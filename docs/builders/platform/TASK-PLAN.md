# TASK-PLAN — P3 golden runs, then the restructure (status: done; PRs #51 and #52 await review)

- [x] Phase 1 — Golden bot seasons: `tests/test-golden-bots.js` (seeds 0 and 3 × careful, overtrader, reckless, noDuke, sprinkler, spender; every morning's books and a journal hash) → `tests/golden/ch1-spring/bots.json`.
- [x] Phase 2 — Golden story run: `tests/golden-story.html` drives `smoke-story.html?golden=1` (seed 3, seeded `Math.random`): every dialogue box, choice, panel and morning's books → `tests/golden/ch1-spring/story-seed3.json`. Recorded twice; identical.
- [x] Phase 3 — PR `platform/golden` (#51), the baseline on the old layout.
- [x] Phase 4 — `platform/restructure`: files moved with `git mv` (history kept), goldens match byte for byte, 34 of 34 browser pages and all node tests pass.
- [x] Phase 5 — updated `game.html`, tests' requires, `tools/stamp.js`, `coverage.json`, `ci.yml`, every wiki page's `files`, both MAP files (the lint proves the wiki).
