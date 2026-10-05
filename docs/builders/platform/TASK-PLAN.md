# TASK-PLAN — P3 golden runs, then the restructure (status: open)

- [x] Phase 1 — Golden bot seasons: `tests/test-golden-bots.js` (seeds 0 and 3 × careful, overtrader, reckless, noDuke, sprinkler, spender; every morning's books and a journal hash) → `tests/golden/ch1-spring/bots.json`.
- [x] Phase 2 — Golden story run: `tests/golden-story.html` drives `smoke-story.html?golden=1` (seed 3, seeded `Math.random`): every dialogue box, choice, panel and morning's books → `tests/golden/ch1-spring/story-seed3.json`. Recorded twice; identical.
- [ ] Phase 3 — PR `platform/golden` (this baseline, on the current layout) reviewed.
- [ ] Phase 4 — `platform/restructure`: move files into `core/` and `chapters/ch1/spring/` (one `git mv` commit, then fix every path), then run the goldens: they must match.
- [ ] Phase 5 — update `game.html`, tests' requires, `tools/stamp.js`, `coverage.json`, `ci.yml`, every wiki page's `files`, both MAP files (the lint proves the wiki).
