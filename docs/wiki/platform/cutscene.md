---
title: Cutscene engine (P7)
type: system
pack: platform
season: all
files: [core/cutscene.js, core/cutscene-sample.js, core/intro.js, game.html]
symbols: [timeline, cuesUpTo, validate, play, frame, journal, register, layer]
concepts: []
sessions: []
tests: [tests/test-cutscene.js, tests/test-intro.js]
links: [platform/opening, platform/scene-player]
updated: 2026-10-05
---

## What it does
A cutscene is data: `{ id, w, h, shots, lines, gate?, seenKey? }`. A shot has `name`, `dur`, `mood` (the score), `cues` (`[t, sfx]`) and either `draw(t, d)` (hand-drawn code, the opening) or `layers` (plain data).
`core/cutscene.js` plays it: timeline, subtitles, music mood, sound cues, skip (Escape or the button), an optional voice file per line (`setVoice`), and a **journal** of seen ids in `lc_cutscenes_v1`.
`Cutscene.replay(id)` plays any registered cutscene again. `core/intro.js` keeps the opening's art and script, registers it as `opening`, and keeps the old `Intro` API.

## Where
| File · symbol | Job |
|---|---|
| `core/cutscene.js` · `timeline`, `cuesUpTo`, `validate`, `manifest` | Pure functions over the data. Run in node. |
| `core/cutscene.js` · `layer`, `frame` | Draw one frame. Layers: `rect`, `oval`, `text`, `sprite`, with `at`, `fadeIn`, `slide`. |
| `core/cutscene.js` · `play`, `end`, `journal` | The overlay player and the seen list. |
| `core/cutscene-sample.js` | A 10-second sample, all layers. The model to copy. Not loaded by the game. |
| `core/intro.js` · `DEF` | The opening as a cutscene definition. |

## Invariants
- The opening's shot starts (0, 12.6, 26.2, 39.2, 51.4, 65.8), total 74.4 s and its 34 sound cues are pinned in `tests/test-cutscene.js`.
- `validate` finds a cue outside its shot, an unknown layer op, a duplicate line id, a line outside its shot.
- The overlay uses the ids and classes of `intro.css` (`#intro`, `#in-cv`, `.in-sub`).

## How to change it safely
- A new cutscene: copy `cutscene-sample.js`, call `Cutscene.register`, run `node tests/test-cutscene.js`. Keep each line to two sentences.
- A new layer op: add it in `layer` with a test using the fake canvas in `test-cutscene.js`.

## Known issues
- No browser frame-by-frame diff of the opening was run here (no Playwright). The draw functions are unchanged and only the engine around them moved.
- A cutscene is not yet recorded in the save file; the journal is in localStorage only.
