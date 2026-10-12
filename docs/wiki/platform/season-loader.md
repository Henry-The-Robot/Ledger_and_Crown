---
title: The season loader
type: system
pack: platform
season: all
files: [core/season-loader.js, core/game.js, tools/stamp.js]
symbols: [SeasonLoader, pick, prev, next, LC_SEASON, beginNext, NEXT_LABEL]
concepts: []
sessions: []
tests: [tests/test-season-loader.js, tests/season-loader.html, tests/begin-summer.html]
links: [platform/version-stamp, platform/save]
updated: 2026-10-12
---

## What it does
`core/season-loader.js` runs once, after `engine.js` and `save.js`, before `game.js`. It picks the season, makes it active (`Spring.Season.use`) and sets `window.LC_SEASON`. `game.js` reads `LC_SEASON` as its `SEASON`.

Order of choice: `?season=` forces a registered season; else the open save slot's season; else the first season in `ORDER` with no closed record; else the last one.

A season's own scripts are tags in `game.html` shaped `<script data-season="ch1/summer" data-src="...">`. The loader writes the tags of the chosen season in place with `document.write`, so they run before `game.js`. Spring's scripts stay ordinary tags.

## Where
| File · symbol | What |
|---|---|
| `core/season-loader.js` · `pick` | Pure choice of the season id. Tested in node. |
| `core/season-loader.js` · `prev` | The season whose closing record a season starts from. |
| `core/season-loader.js` · `next` | The season after this one. `core/game.js` shows its button (`NEXT_LABEL`, "Begin Summer") beside "How it ends" when the books are closed and the farm is neither sold nor insolvent. `beginNext` clears the open slot and reloads with `?season=`. Test: `tests/begin-summer.html`. |
| `core/game.js` · `start` | Ignores a save slot of another season. A later season starts from `Save.startFrom(prev)`. |
| `tools/stamp.js` · `stamp` | Stamps `data-src` like `src`. |

## Invariants
Spring loads as before (no `?season=`, no slot: Spring). Adding a season: add its id to `ORDER`, register its `season.js`, add its `data-season` tags.

## How to change it safely
Run `node tests/test-season-loader.js` and the page `tests/season-loader.html`. Then `node tools/stamp.js`.

## History
- SM4: created. Open item: in the browser `Save.heir()` has no data (`setHeir` is never called), so a forced Summer start with no Spring record falls back to the plain start.
