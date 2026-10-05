---
title: The version stamp
type: system
pack: platform
season: all
files: [version.js, tools/stamp.js]
symbols: [LC_VERSION, stamp, FILES]
concepts: []
sessions: []
tests: [tests/test-version.js]
links: [platform/tests-and-ci, platform/wiki-lint]
updated: 2026-10-05
---

## What it does
One version number, `version.js`. `node tools/stamp.js 0.4.7` bumps it and writes `?v=0.4.7` into every local script, stylesheet and the Play link of `game.html` and `index.html`, and the visible version on the title page. Safari mixes old scripts with a new page when one tag differs; this prevents it.

## Where
| File · symbol | What |
|---|---|
| `version.js` · `LC_VERSION` | The version; `window.LC_VERSION` in the browser, `require()` in node. Loaded first by `game.html`. |
| `tools/stamp.js` · `stamp(text, v)` | Pure: returns the stamped text and the list of tags that differed. |
| `tools/stamp.js` · `FILES` | The two pages it stamps. |

## Invariants
Every local tag ends `?v=<version.js>` (`tests/test-version.js`); `--check` exits 1 listing any tag that differs.

## How to change it safely
A new script tag: add it, then run `node tools/stamp.js`. Never edit a `?v=` by hand. The creative lead makes the release tag.

## History
- P2 (`platform/version`): created; found `index.html`'s `style.css` had no `?v=`.
