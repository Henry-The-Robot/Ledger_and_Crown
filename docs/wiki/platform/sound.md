---
title: Sound (music and effects)
type: system
pack: platform
season: all
files: [music.js, fx.js]
symbols: [Music, FX, MOODS, scheduleBar, render, setMood, start, stop, SFX, VOICE, unlock, make, setSfx, setMusic, blip, ctx, type, fade, cash, shake]
concepts: []
sessions: []
tests: [tests/audio.html, tests/audio-unlock.html]
links: [platform/save, platform/opening, platform/game-ui]
updated: 2026-10-05
---

## What it does
All sound is made with WebAudio in code. There are no audio files, so it works offline. `fx.js` owns the shared audio context, the sound effects and the screen juice. `music.js` plays a generative score through the same context.

## Where
| File · symbol | What |
|---|---|
| `fx.js` · `make`, `ctx` | Create the one shared `AudioContext` with a master gain, a compressor, `sfxBus` and `musBus`. |
| `fx.js` · `unlock` | The iOS unlock. The first pointer, touch, click or key creates and resumes the context and plays a silent buffer. It also asks for a "playback" audio session and starts the music. |
| `fx.js` · `SFX` | The effect table. Names: tap, pad, open, close, page, step, till, plant, water, harvest, sprinkler, ship, coin, loss, good, chime, error, knock, bell, sleep, morning, stamp, whoosh, win. |
| `fx.js` · `FX.sfx(name)` | Plays one effect; unknown names are ignored. `FX.names` lists them. |
| `fx.js` · `VOICE`, `blip` | A pitch and timbre per speaker for the typewriter. |
| `fx.js` · `setSfx`, `setMusic` | The two switches. They save to `localStorage` and set bus gains. |
| `fx.js` · `type`, `fade`, `cash`, `shake`, `rain` | Typewriter reveal, scene fade, coin burst, screen shake, rain bed. They respect reduced motion. |
| `music.js` · `MOODS` | Six moods: farm, town, rain, night, tense, crane. Each has a tempo, scale, chord loop and instruments. |
| `music.js` · `scheduleBar(ac, bus, name, bar, t0)` | Schedules one bar. Notes come from a seeded generator (mood and bar number), so a bar always sounds the same. |
| `music.js` · `render(ac, bus, name, seconds)` | Renders into any context. Tests use an `OfflineAudioContext`. |
| `music.js` · `setMood`, `start`, `stop` | The live player, a 120 ms lookahead timer. `setMood` dips the bus, then switches at a bar edge. |

## Data and state
Keys: `lc_sfx`, `lc_music` ("1" or "0"). The old `lc_sound` key is read only. Both switches default to on. Music stops when the page hides.

## Callers
`game.js` plays effects and `moodNow()` picks the mood every 900 ms. `intro.js` sets a mood and cues effects per shot. `verbs.js` plays "stamp".

## Invariants
- One audio context for the whole page.
- Every `localStorage` call is in try/catch.
- A given mood and bar always schedule the same notes.

## How to change it safely
- New effect: add a function to `SFX`; use `tone` and `puff`. Keep it under 0.5 s.
- New mood: add it to `MOODS`, then to `moodNow` in `game.js`.
- Test on a real iPad. Silent-switch and suspended-context bugs do not show in desktop Chromium.

## Known issues
- `FX.sfx` swallows all errors, so a typo in an effect name fails silently.
