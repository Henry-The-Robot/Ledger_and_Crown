# HANDOVER — Platform pack — updated 2026-10-04 by the platform builder (P1 session)

## State in one paragraph
P1 (CI) is built on branch `platform/ci`: a GitHub Actions workflow (`.github/workflows/ci.yml`, job `tests`) runs
`node tests/run-all.js` and then every browser test page in real-time Chromium through `tests/run-html.js --all`.
The runner now judges pages itself (a `: false` line, THROWN, a page error and so on fail it), because the pages only print
text. On master two pages were already failing and are fixed here: `midwinter.html` (it printed the intended `false` for a
reckless farm; it now says "hidden: true") and `practice-ui.html` (it assumed a number problem; decision problems now
exist, so it hides them). Not started: P2 onward.

## Live / branch state
master = v0.4.6. Branch `platform/ci` (one PR). To prove CI fails on a broken test, a throwaway commit breaks one test, the
run goes red, and the next commit reverts it (both stay in the PR history).

## Next 3 actions
1. P2 — one version stamp (`version.js`, `tools/stamp.js`, a test).
2. W1 — `tools/wiki-lint.js`, run in CI (add a step to `ci.yml`).
3. W2 — seed the code wiki.

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
