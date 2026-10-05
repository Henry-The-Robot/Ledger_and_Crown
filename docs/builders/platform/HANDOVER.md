# HANDOVER — Platform pack — updated 2026-10-05 by the platform builder (session: P1, P2, W1, W2, P3)

## State in one paragraph
P1, P2, W1, W2 and P3 are built and green in CI; none is merged. Each is its own PR, stacked on the one below.
CI (`.github/workflows/ci.yml`, check `tests`) runs the node tests, the wiki lint, and every browser page in real-time Chromium.
There is one version stamp (`version.js`, `tools/stamp.js`). The code wiki has 24 pages and a lint with strict coverage.
Golden bot seasons and a golden story run (`tests/golden/ch1-spring/`) are recorded. Files now live in `core/` and `chapters/ch1/spring/`,
and the goldens are byte-identical after the move. Core still holds Spring's constants and Spring-only code (P5 and P6 move them out).

## Live / branch state
master = v0.4.6. Merge in this order, retargeting each PR to `master` as the one below it lands:
#45 `platform/ci` (P1) → #47 `platform/version` (P2) → #48 `platform/wiki-lint` (W1) → #50 `platform/wiki-seed` (W2)
→ #51 `platform/golden` (P3 baseline) → #52 `platform/restructure` (P3 move). CI is green on all six.

## Next 3 actions
0. G1 done (2026-10-05, local builder): `docs/design/save-and-carry.md` + `carry-record.schema.json` written, docs only. Lead reviews; next card P4b builds `core/save.js` from it.
0b. P4b done (2026-10-05, local builder): `core/save.js` (v4 blob, migration, export/import, seeded shuffle, heir), wired into `core/game.js`; `tests/test-save.js` 40 checks pass; wiki `platform/save.md` rewritten; game_test green. Seeds: review shuffle now seeded. Story seed uses `Save.newSeed`.
0c. P5 done (2026-10-05, local builder): `chapters/ch1/spring/season.js` holds `R`; `marketModel` spread tuned 1.2 → 0.6 so the price path never flips a bot result; `tests/test-market-seeds.js` now needs careful 20/20 survive and overtrader 20/20 lose. game_test green.
0d. T2 done: cost-scene profit line, Maud "Say the number, then the reason." beat (court.js), ch3 retag C1.01, `tvm` pv entry renamed, coverage map copied. **Golden story NOT re-recorded**: local run has no Playwright (`Cannot find module 'playwright'`). The next run with a browser must re-record `tests/golden/ch1-spring/story-seed3.json` for the two new lines + the renamed notebook title.
1. P6a — scene record format + `core/scene.js` (needs the golden story runnable first; see 0d).
3. Remove the two unseeded `Math.random` calls (`core/game.js`: the review option shuffle, the story seed) when P4 touches the save.

## Failure lesson
- A test that filters its file list with `existsSync` passes on nothing after a move (`test-editor.js` did). Rule: a test that
  names source files throws if one is missing. Grep for the pattern on any move.
- Tests that only print cannot gate a PR. Every browser page ends in `label: true|false` lines; the runner decides.
- Followed: never merge your own PR.

## Blocked on the creative lead / Kyle
- Make the `tests` check required in branch protection once #45 merges (asked 2026-10-04).
- Release note: after #52 merges, an iPad that cached `game.html` requests old script paths (404). Bump with `node tools/stamp.js 0.4.7` at the release.
- `docs/builders/README.md` ("What lives where") still lists the old root paths. It is canon, so it is yours to update.
- Found while writing the wiki (not fixed; your call): (1) `Scenes.morning` is called in `story.js` but never defined, and `Scenes.pending` has no caller.
  (2) `lc_intro_seen` is written, never read. (3) `Codex.addPrestige/setLevel/speak/due/retained` are never called.
  (4) The save is deleted when Ezra's closing review ends (P4). (5) `story.js` chapter headers disagree with function names; chapters 4–5 are not calendar weeks 2–3.
  (6) Session tags: ch7 cites C1.06 (bond interest; honest sources are C0.01, C5.01); C0.02 and C2.09 are loose.
  (7) `market.js` header says Grisby undercuts by 1; the code says 2. The engine header names a missing `test-engine.js`; a `crownFund` comment says 1,000 (it is 1,250).
  (8) Bot literals (12 per packet, 150 borrow) are not read from `R`. (9) No direct tests for art, fx, codex, verbs.

## Decisions made and why
- 2026-10-05: P3 split into two PRs (baseline, then move) so a reviewer sees the goldens before anything moves.
- 2026-10-05: `core/` = shared code; `chapters/ch1/spring/` = Spring content; the root keeps entry pages, `version.js`, tools, tests, docs.
- 2026-10-04: no build step, no framework. Playwright is installed in CI with `--no-save` (pinned 1.54.2).
- 2026-10-04: `shot-*.html` are screenshot drivers, not tests. Pages are served over http in the runner (file:// blocks `fetch`).
- 2026-10-04: no test was skipped or loosened to get green; two stale pages (`midwinter`, `practice-ui`) were fixed honestly.

## Dead ends (do not repeat)
- Local browser tests need `NODE_PATH=$(npm root -g)` and `CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- `--virtual-time-budget` runs never advance audio or animation; use `tests/run-html.js`.
- `git revert -q` is not a valid flag combination; a failed revert followed by `commit --amend` rewrote the wrong commit once.

## Files that matter
`.github/workflows/ci.yml` · `tests/run-html.js` · `tests/test-golden-bots.js` · `tests/golden-story.html` · `tests/golden/ch1-spring/` ·
`tools/stamp.js` · `tools/wiki-lint.js` · `docs/wiki/` (INDEX, `coverage.json`) · `TASK-PLAN.md` · this pack's `MAP.md`.
