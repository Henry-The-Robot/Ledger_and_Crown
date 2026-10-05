# HANDOVER — Platform pack — updated 2026-10-04 by the platform builder (P1 session)

## State in one paragraph
W1 (wiki lint) is built on `platform/wiki-lint` (stacked on `platform/version`): `tools/wiki-lint.js`, `docs/wiki/coverage.json`, `tests/test-wiki-lint.js`, a CI step, and three platform wiki pages (P1, P2, W1 themselves). Coverage is warn-only (23 files unnamed) until W2. P2 (one version stamp) is built on `platform/version`, stacked on `platform/ci`: `version.js` holds the version, `tools/stamp.js` stamps every `?v=` (bump: `node tools/stamp.js 0.4.7`), `tests/test-version.js` fails on any differing tag. It also found `index.html`'s `style.css` had no `?v=`. Read the master plan (`docs/MASTER-PLAN.html`) this session: platform phase first (P1 to P12, W1, W2), then Spring final.

P1 (CI) is built on branch `platform/ci`: a GitHub Actions workflow (`.github/workflows/ci.yml`, job `tests`) runs
`node tests/run-all.js` and then every browser test page in real-time Chromium through `tests/run-html.js --all`.
The runner now judges pages itself (a `: false` line, THROWN, a page error and so on fail it), because the pages only print
text. On master two pages were already failing and are fixed here: `midwinter.html` (it printed the intended `false` for a
reckless farm; it now says "hidden: true") and `practice-ui.html` (it assumed a number problem; decision problems now
exist, so it hides them). Not started: P2 onward.

## Live / branch state
master = v0.4.6. PR #45 `platform/ci` (P1) open; `platform/version` (P2) stacked on it: merge #45 first, then retarget the P2 PR to master. To prove CI fails on a broken test, a throwaway commit breaks one test, the
run goes red, and the next commit reverts it (both stay in the PR history).

## Next 3 actions
1. W2 — seed the code wiki (one page per row of both MAP.md files); then set `strict: true` in `docs/wiki/coverage.json`.
2. P3 — golden runs, then the restructure.
3. P4 — saves.

## Failure lesson
- The browser test pages passed or failed by eye. A runner that only prints cannot gate a PR. Rule: every test page ends in
  `label: true|false` lines, and the runner decides. Followed the previous lesson (never merge your own PR).

## Blocked on the creative lead / Kyle
- Make the `tests` check required in branch protection once the PR merges (asked in the PR, 2026-10-04).

## Decisions made and why
- 2026-10-04: Playwright is installed in CI with `npm install --no-save` (no package.json, no lockfile): the repo stays
  build-free. Pinned to 1.54.2 so a Playwright release cannot turn CI red by itself.
- 2026-10-04: `shot-*.html` are screenshot drivers, not tests, so `--all` skips them.
- 2026-10-04: a fixed test fails honestly; no test was skipped or loosened to get green.

## Dead ends (do not repeat)
- Local headless tests need `NODE_PATH=$(npm root -g)` and `CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- `--virtual-time-budget` runs never advance audio or animation; use `run-html.js`.

## Files that matter
- `.github/workflows/ci.yml` · `tests/run-html.js` · this pack's `MAP.md` (Tests row) · `tests/run-all.js`.
