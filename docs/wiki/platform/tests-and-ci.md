---
title: Tests and CI
type: system
pack: platform
season: all
files: [tests/run-all.js, tests/run-html.js, .github/workflows/ci.yml]
symbols: [judge, runPage, serve, BAD_LINE]
concepts: []
sessions: []
tests: [tests/run-all.js]
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

## How to change it safely
A new browser test page prints into `<pre id="out">` and writes one `label: true|false` line per check. `shot-*.html` pages are screenshot drivers and are skipped. Locally: `NODE_PATH=$(npm root -g) CHROMIUM_PATH=/path/to/chrome node tests/run-html.js --all`.

## History
- P1 (`platform/ci`): created; fixed `midwinter.html` and `practice-ui.html`.
