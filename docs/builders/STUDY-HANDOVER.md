# HANDOVER — study kit builder — updated 2026-10-23 by sonnet-game-builder

## State
MBA-ST1 to ST3, ST5 to ST8 are done and green in CI (PR 59, local/work). ST4 (the real season-one slice) waits for Kyle's anchor choice.
- ST5: `core/study/log.js` reads `?study=1&pc&arm&order&seed`. Codes are 3 to 64 characters, lowercased. Rows carry `arm`, `order`, and `edited:true` when `assign.js` disagrees. `core/study/assign.js` is a byte copy of `projects/studio/tools/entry/assign.js`; the test fails if they differ. A code in the URL skips the code screen.
- ST6: `core/study/reading.js` (state machine), `reading-fixture.js` (FIXTURE sections), shell `startReading` / `finishReading`. Done unlocks at 10 minutes of active time (pauses over 60 s removed, form A pauses excluded). The cap is 30 minutes of clock time.
- ST7: `core/study/route.js` (`load`, `create`): plays route steps in file order, passes each step's `select`, `pre`, `post`, `verbs` and seed to the page, 90 s frame, stops at 30 min (`stopMinutes`). `known` (record and scene ids) is required; a bad id, kind, `advance` without `toDay` or `court` without `config` fails the load. Shell: `startRoute(route, known)` and `finishRoute()` (to form B). Test section 6 skips in CI because `study-route.json` lives outside the repo.
- ST8: `Court.build/run` take `study` (the route's `court` block). `studyBuild` uses the listed claims in order with the config seed, throws on an unknown or non-applying claim, and `run()` checks it before the hall opens. One sitting, no retry button, pass and of from config, ends at the verdict. New study-only claim `termsVsWages` (plan B4; `studyOnly`, never drawn in the full game). Its numbers 9, 7 and 14 are defaults in `facts` (`hobbPrice`, `ashbyPrice`, `hobbTerms`): check them against the real Hobb scene.

## Blocked / open
- `knowledge/mba/study/clep-fa-slice/reading.md` does not exist (card MBA-STUDY-READ). Replace `reading-fixture.js` when it lands.
- No `study.html` page draws the shell, the reader or the route runner yet. The page must load `assign.js` before `log.js`, and `route.js` before `shell.js`. It must tick the runner on a timer and call `finishRoute()`.
- The route runner passes `select` flags and seeds to the page but does not apply them; the engine side is card ST9. `optional.opt-1` in the route file is ignored.
- The `Court.run` study path (screens, no retry, early end) has no automated browser test; `tests/court.html` covers only the full game.
- `edited` and the reading events are not yet in `projects/studio/STUDY-LOG-SCHEMA.md` (Lead/manager file).
- The shell does not tie the arm to the phase: a reading-arm learner can still call `playScene`. The page must route by arm.

## Next
MBA-ST9 (anchor-free study adjustments; a large card, 2 to 3 runs; touches the engine: select helper, bet reveal-now, auto-ship, quiet mode, hidden menus). Then ST10 (study bot). Then T1 and the Summer cards (paused for the study).
