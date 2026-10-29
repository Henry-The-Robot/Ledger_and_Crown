---
title: Voice for dialogue boxes (core/voice.js)
type: system
pack: platform
season: spring
files: [core/voice.js, core/scene.js, core/cutscene.js, core/game.js, tools/voice-lines.js, assets/voice/LINES-study.json]
symbols: [Voice, VoiceKit, mark, start, stop, configure, boxes, clip]
concepts: []
sessions: []
tests: [tests/test-voice.js, tests/voice-lines.html]
links: [platform/opening, platform/cutscene]
updated: 2026-10-28
---

## What it does
A dialogue box in a scene can play a voice file. The file is `assets/voice/<scene id>/<box id>.mp3`. A box with no file is silent and logs no error.

## Where
| File · symbol | What |
|---|---|
| `core/scene.js` · `boxes(rec)` | Lists every box of a record with its id: `n<step>`, or `n<step>-<line>` for a run of lines. Inside a choice, if or pick the id gets a prefix `-o<i>-`, `-t-`, `-e-` or `-c<i>-`. |
| `core/scene.js` · `play` | Calls `Voice.mark(scene id, ids)` before each box and clears it at the end. |
| `core/voice.js` · `configure`, `mark`, `start`, `stop` | On with `?study=1` or `?vo=1`. `?vo=0` turns it off. `start()` runs when a box opens, `stop()` when the player taps past. |
| `core/game.js` · `dlg` | Calls `Voice.start()` on open and `Voice.stop()` on a button tap. |
| `core/cutscene.js` · `clip` | The shared WebAudio player, also used by the opening. |
| `tools/voice-lines.js` | Writes `assets/voice/LINES-study.json`. Run it after a lesson text changes. |

## Known gaps
Boxes built in code (verbs in `story.js`, the Court) have no id and no voice.
