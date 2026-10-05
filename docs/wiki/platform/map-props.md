---
title: Map prop layer (P8)
type: system
pack: platform
season: all
files: [core/map.js, chapters/ch1/spring/props.js, core/game.js, game.html]
symbols: [register, build, visible, validate, PROPS]
concepts: []
sessions: []
tests: [tests/test-map.js]
links: [platform/game-ui, platform/cutscene]
updated: 2026-10-05
---

## What it does
A prop is a record: `{ id, sprite, x, y }` or `{ id, sprite, at: "CRATE" }`, plus `solid`, `also`, `sort`, `when`. `core/map.js` turns a list of records into blocked tiles and draw entries. A **sprite registry** (`MapProps.register(name, fn)`) holds the drawing code for each kind.
`when: { dayFrom, dayTo, flag }` shows a prop only on those days and when `s.flags[flag]` is set. Spring's still props (9 bushes, crate, village well, chest, sacks, farm well, notice board) are data in `chapters/ch1/spring/props.js`.

## Where
| File · symbol | Job |
|---|---|
| `core/map.js` · `build(props, env)` | Adds blocked tiles and one draw entry per prop, in list order. |
| `core/map.js` · `register`, `visible`, `validate` | The registry, the `when` rule, and a data check. |
| `chapters/ch1/spring/props.js` · `PROPS` | Spring's props. `at` names a place that `core/game.js` owns. |
| `core/game.js` · `buildMap` | Registers the six sprites (`bush`, `crate`, `chest`, `sacks`, `well`, `board`) and calls `MapProps.build`. |

## Invariants
- `tests/test-map.js` pins the 15 blocked tiles, the draw rows (y + 1) and the old push order, and checks a test prop shows from day 8 only when its flag is set.
- The test also checks that the places it uses match the constants in `core/game.js`.

## How to change it safely
- A new prop: add a record; add a sprite with `MapProps.register` only for a new kind. Run `node tests/test-map.js`.
- A prop that appears later should say `solid: false`, or its tile blocks walking before it is shown.
- Trees, buildings, fair stalls and the Market Day stall are still built in `buildMap`. Move them when a season needs to change them.

## Known issues
- No pixel diff of day 1 was run here (no Playwright). The sprite functions are the old draw code, and the order is pinned in node.
