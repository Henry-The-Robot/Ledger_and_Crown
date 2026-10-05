---
title: Scene player and scene records
type: system
pack: platform
season: all
files: [core/scene.js, chapters/ch1/spring/scenes.js, game.html]
symbols: [play, need, vars, steps, fill, open]
concepts: []
sessions: []
tests: [tests/test-scene.js, tests/test-cast.js, tests/test-t3b.js]
links: [ch1/village-scenes]
updated: 2026-10-05
---

## What it does
A scene is a plain record. `core/scene.js` plays it. A chapter adds records and writes no code for a scene.
`chapters/ch1/spring/scenes.js` holds the 12 Spring village scenes as records and keeps the old `Scenes` API.
Each record gets `run(c)`, which calls `SceneKit.play(record, c)`. `core/game.js` · `runScene` is unchanged.

## Where
| File · symbol | Job |
|---|---|
| `core/scene.js` · `play(rec, c)` | Runs the record's `steps` with the helper object `c`. |
| `core/scene.js` · `need(cond, s)` | Reads `{flag}` or `{invoiceOpen}`. An unknown condition throws. |
| `core/scene.js` · `vars(rec, s)` | `bind: {invoice: who}` gives `{amt}` and `{half}` for text. |
| `chapters/ch1/spring/scenes.js` · `RECORDS` | The 12 records. `SC` is the same list with `run` added. |

## Record format
`{ id, who, from, to?, at?, card?, need?, bind?, hint, steps }`. Each step has one key:
`say`+`lines`, `ask`+`text`+`options[{label, then}]`, `maud`, `flag:[k,v]`, `trust:[who,d]`, `clue`, `letter`,
`op:"delay"` (`who`, `days`), `op:"halfNow"` (`who`, `days`, `note`). An unknown step throws.

## Story steps (P6b)
The same player runs the story's lessons: `tell`, `speak`, `quiz`, `calc`, `set`, `let`, `remember`, `if`, `pick`, `keep`, `addEx`, `pin`, `to`, `page`, `master`, `end`, `verb`. `play(rec, c, start)` answers `false` after an `end` step.
Text fills `{name}` and `{name|money}`; an unknown name throws. Full table: `chapters/README.md`. Wiki: `ch1/lessons-as-data`.

## Invariants
- `test-scene.js` checks every record's shape and every step kind, and the Hobb money steps by hand calculation.
- `test-cast.js` plays every branch of every scene and checks the books still balance.

## How to change it safely
- Add a step kind in `core/scene.js` with a test in `tests/test-scene.js`. Never put chapter code in core.
- `{half}` is rounded down. `halfNow` posts a `collect` entry through `Spring.post`.

## Known issues
- `Scenes.morning` (a hook `story.js` calls) is still not defined. P6b ports `story.js` and decides it.
