# HANDOVER — study kit builder — updated 2026-10-22 by sonnet-game-builder

## State
MBA-ST1 to ST3, ST5 and ST6 are done and green in CI (PR 59, local/work). ST4 (the real season-one slice) waits for Kyle's anchor choice.
- ST5: `core/study/log.js` reads `?study=1&pc&arm&order&seed`. Codes are 3 to 64 characters, lowercased. Rows carry `arm`, `order`, and `edited:true` when `assign.js` disagrees. `core/study/assign.js` is a byte copy of `projects/studio/tools/entry/assign.js`; the test fails if they differ. A code in the URL skips the code screen.
- ST6: `core/study/reading.js` (state machine), `reading-fixture.js` (FIXTURE sections), shell `startReading` / `finishReading`. Done unlocks at 10 minutes of active time (pauses over 60 s removed, form A pauses excluded). The cap is 30 minutes of clock time.

## Blocked / open
- `knowledge/mba/study/clep-fa-slice/reading.md` does not exist (card MBA-STUDY-READ). Replace `reading-fixture.js` when it lands.
- No `study.html` page draws the shell or the reader yet. The page must load `assign.js` before `log.js`, and must call `show()` and `activity()` and poll `expired()` (the cap fires only through `finishReading()`).
- `edited` and the reading events are not yet in `projects/studio/STUDY-LOG-SCHEMA.md` (Lead/manager file).
- The shell does not tie the arm to the phase: a reading-arm learner can still call `playScene`. The page must route by arm.

## Next
T1 (platform drift fixes), then the Summer cards, which are paused for the study.
