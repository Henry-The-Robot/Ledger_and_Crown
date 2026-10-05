---
title: Tests and CI
type: system
pack: platform
season: all
files: [tests/run-all.js, tests/run-html.js, .github/workflows/ci.yml, tests/test-golden-bots.js, tests/golden-story.html]
symbols: [judge, runPage, serve, BAD_LINE]
concepts: []
sessions: []
tests: [tests/run-all.js, tests/test-golden-bots.js, tests/golden-story.html]
links: [platform/wiki-lint, platform/version-stamp]
updated: 2026-10-05
---

## What it does
Every pull request and every push to `master` runs the node tests and every browser test page. The check is named `tests`.

## Where
| File · symbol | What |
|---|---|
| `tests/run-all.js` | Runs every `tests/test-*.js` in node; one line each. |
| `tests/run-html.js` · `runPage`, `serve` | Serves the repo over `http://127.0.0.1` and runs a `tests/*.html` page in real-time Chromium. |
| `tests/run-html.js` · `judge`, `BAD_LINE` | Decides pass or fail from the page's text: a line ending `: false`, THROWN, EXCEPTION, FAIL, TIMEOUT, `JS errors: N`, a page error. |
| `.github/workflows/ci.yml` | Node tests, then Playwright (pinned, `--no-save`), then `node tests/run-html.js --all`, then the wiki lint. |

## Golden runs
`tests/test-golden-bots.js` plays seeds 0 and 3 with six bots and compares every morning's books and a journal hash with `tests/golden/ch1-spring/bots.json`. `tests/golden-story.html` drives `smoke-story.html?golden=1` (seed 3) and compares every dialogue box, choice and morning with `tests/golden/ch1-spring/story-seed3.json`. A restructure must leave both byte-identical. Re-record (`--record`, or `?record=1`) only when a PR says why Chapter 1's books changed and the Chapter 1 pack approves.

## How to change it safely
A new browser test page prints into `<pre id="out">` and writes one `label: true|false` line per check. `shot-*.html` pages are screenshot drivers and are skipped. Locally: `NODE_PATH=$(npm root -g) CHROMIUM_PATH=/path/to/chrome node tests/run-html.js --all`.

## History
- P1 (`platform/ci`): created; fixed `midwinter.html` and `practice-ui.html`.
- P3 (`platform/golden`): golden bot seasons and a golden story run.
