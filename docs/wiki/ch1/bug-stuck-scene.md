---
title: Bug — a scene waits on nothing and the map freezes (days 22–23)
type: bug
pack: ch1
season: spring
files: [core/game.js, chapters/ch1/spring/story.js]
symbols: [unstick]
concepts: []
sessions: []
tests: [tests/stale-scene.html, tests/never-stuck.html]
links: [ch1/court, ch1/LOG]
updated: 2026-10-04
---

## Symptom
Kyle's iPad playtest 2: on day 22 or 23 the map stopped responding; only "save and reset" freed it. A related hang:
"Fold it away" could not be reached at the Court (that one is fixed; see `ch1/court`).

## Cause
**Not reproduced.** A scene chain was waiting on a promise with nothing visible on screen, so `busy` stayed set.

## Fix (a safety valve, not a root-cause fix)
- v0.4.4: if a scene waits ~7 s with nothing visible, `core/game.js` (~286) calls `Story.unstick()` (`chapters/ch1/spring/story.js` ~513), which clears `busy` and frees the map.
- v0.4.6: an epoch guard in `chapters/ch1/spring/story.js`: `unstick()` bumps the epoch, and a scene chain started under an old epoch exits at
  its next await, so it cannot resume later and race a new scene. `#mkt` and the intro overlay count as "on screen".

## Test
`tests/stale-scene.html` (a stale scene does not run after `unstick()`), `tests/never-stuck.html`.

## Still open
The root cause. Next lead: drive a saved game to days 22–23 and click the map (planned as an automated test).
