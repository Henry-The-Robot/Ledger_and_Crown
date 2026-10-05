---
title: The opening (core/intro.js)
type: system
pack: platform
season: spring
files: [core/intro.js, core/intro.css, tools/intro-script.js]
symbols: [Intro, SCRIPT, SHOTS, STARTS, TOTAL, DRAW, setVoice, manifest, play, end, wanted, frame, say, step, lineAt, shotAt]
concepts: []
sessions: []
tests: [tests/test-intro.js, tests/intro.html]
links: [platform/sound, platform/save, platform/art]
updated: 2026-10-05
---

## What it does
A 75-second animated prologue on a 320 by 180 canvas. It uses the game's own sprites, music and effects. Every spoken line shows as a subtitle. A new story game plays it first.

## Where
| File · symbol | What |
|---|---|
| `core/intro.js` · `SCRIPT` | Data. 11 lines `{id, shot, at, dur, who, dir, text}`. Ids are `i01` to `i11`. |
| `core/intro.js` · `SHOTS` | Data. 6 shots with a name, a length, a music mood and sound cues `[seconds, name]`. |
| `core/intro.js` · `STARTS`, `TOTAL` | Derived start times and the total length. |
| `core/intro.js` · `DRAW` | Six functions, one per shot. Each draws a whole frame from the time in the shot. |
| `core/intro.js` · `play(opts)` | Builds the overlay, starts on "Begin", returns a Promise. Options: `speed`, `hold`, `autostart`. |
| `core/intro.js` · `step`, `frame` | The animation loop. It draws, fires cues, sets the mood, shows the line. |
| `core/intro.js` · `say(l)` | Shows the subtitle and plays `<voiceBase>/<id>.mp3` if a voice is set. |
| `core/intro.js` · `end(how)` | Closes with `done` or `skipped`, writes `lc_intro_seen`, resolves the Promise. |
| `core/intro.js` · `setVoice(base, ext)`, `manifest()` | A future voice-over: a folder of files named by line id. |
| `core/intro.js` · `wanted(q)` | True for a new story game. False for `?intro=0`, `fast`, `sandbox` or `new`. `?intro=1` forces it. |
| `tools/intro-script.js` | `node tools/intro-script.js [json|csv|txt]` prints the manifest for a voice service. |
| `core/intro.css` | The overlay, gate button, subtitle bar and skip button. |

## Data and state
Writes `lc_intro_seen`; nothing reads it. Escape or Skip ends it. While it runs, the document swallows key events so the game below hears none. `core/game.js` starts it in `start()`, and the pause menu replays it.

## Invariants
`tests/test-intro.js` proves: unique ids; lines of at most two sentences; no overlap; each line inside its shot; at most 21 characters per second; the total is 60 to 90 seconds; every cue is inside its shot.

## Why it matters (task P7)
The script, shots and cues are data; only `DRAW` is code. This is the model for the future cutscene engine: scenes as data (lines, timings, mood, cues), one small player, and a test that checks the data.

## How to change it safely
- Edit words in `SCRIPT`, then run `node tests/test-intro.js`. Keep `at` and `dur` inside the shot.
- A new shot needs a new `DRAW` entry, a `SHOTS` entry and a re-timed script.

## Known issues
- `DRAW` mixes drawing with fixed pixel numbers; a new shot needs hand-tuning.
- `lc_intro_seen` is unused, so returning players cannot skip by default.
