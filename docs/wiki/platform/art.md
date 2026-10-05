---
title: Pixel art (core/art.js)
type: system
pack: platform
season: all
files: [core/art.js]
symbols: [Art, ART, P, sprite, person, PEOPLE, CHEST, CROPS, CRATE, SPRINKLER, SACK, tile, TILES, tree, bush, building, SIGNS, build]
concepts: []
sessions: []
tests: []
links: [platform/game-ui, platform/opening]
updated: 2026-10-05
---

## What it does
`core/art.js` draws all the game's pixel art in code. There are no image files. Tiles are 16 by 16. `window.Art` needs a DOM (it makes canvases). Warm palette after Stardew Valley.

## Where
| File · symbol | What |
|---|---|
| `core/art.js` · `P` | The base palette, one letter per colour. |
| `core/art.js` · `sprite(rows, pal, flip)` | Turns an array of strings into a canvas. `.` is transparent; `pal` overrides colours. |
| `core/art.js` · `person(pal)` | One template (head, body, legs) per direction and walk frame: `{down, up, left, right}`. |
| `core/art.js` · `PEOPLE` | Palettes for 12 characters: player, maud, ezra, ashby, hobb, tomas, corvin, mira, abbey, pell, pedlar, crane. `duke` aliases `corvin`. |
| `core/art.js` · `CROPS`, `CHEST`, `CRATE`, `SPRINKLER`, `SACK` | Text sprites: five wheat stages, the cash chest, the shipping crate, the sprinkler, a sack. |
| `core/art.js` · `tile`, `TILES` | Procedural ground with a seeded dither: grass, flower, path, cobble, soil, wet soil, water, fence. |
| `core/art.js` · `tree`, `bush` | Procedural, seeded, so they never flicker. |
| `core/art.js` · `building(w, h, o)`, `SIGNS` | Procedural house: roof, planks, windows, door, a sign icon (bread, sack, seed, coin, scroll). |
| `core/art.js` · `build()` | Fills `Art.people`, `Art.chest`, `Art.crops`, `Art.crate`, `Art.sprinkler`, `Art.sack`, `Art.tree`, `Art.bush` and `TILES`. Crane and Corvin get extra pixels. |

## Who calls it
- `core/game.js`: calls `A.build()` at load, then reads `A.people`, `A.TILES`, `A.crops`, `A.building`, `A.SIGNS` and the prop sprites.
- `core/intro.js`: reads `Art.people` and `Art.chest`.
- `core/market.js`: reads `Art.people`, `A.TILES`, `A.tree`, `A.sack`.

## Data and state
No saved state. The seeded `rnd` makes every run draw the same tiles.

## Invariants
- `build()` must run before any other file reads `Art.people` or `Art.TILES`.
- The art is deterministic.

## How to change it safely
- New character: add a palette to `PEOPLE`; `build()` makes the sprites. Add its name to `Spring.NAMES` if it speaks.
- Sprite rows must be the same width, or the canvas takes the widest row.
- No test covers the art directly. Look at it in a browser after any change.

## Known issues
- No unit test. A broken sprite shows only on screen.
