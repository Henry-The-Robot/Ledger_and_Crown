# CHARTER — Platform pack: the shared core (v1.0, 2026-10-04, creative lead)

## Mission
One core that all four chapters run on, so a chapter is **data plus tests**, not engine code. A session in this pack
changes only `core/`, `tools/`, `.github/` and the test runners, and keeps every chapter's golden tests green.

## Read these (binding)
`docs/builders/README.md` · `docs/MASTER-PLAN.html` §11 (the technical foundation, T1–T10) · this pack's `MAP.md`,
`HANDOVER.md`, `WORK-ORDER.md` · `docs/builders/PLATFORM-REQUESTS.md` (what chapters have asked for).

## How it must be built (the creative lead approves any change)
- **No build step, no framework.** Plain scripts served by GitHub Pages. One global namespace `LC`.
- **Layout:** `core/` = the engine (double-entry journal: every action posts balanced lines; statements are views of the
  postings), `save.js`, `scene.js` (scene player), `cutscene.js`, `map.js` (prop layer), `market.js` (demand model),
  `transcript.js`, `ui/`. `chapters/chN/<season>/` = `season.js` (settings), `lessons/`, `scenes/`, `cutscenes/`,
  `props.js`, `claims.js`, `tests/`.
- **Nothing season-specific in core.** Days, debts, orders, events, prices, characters' lines: all chapter data.
- **Lessons and scenes are data records:** speaker, line, choices, numbers as functions of the books, curriculum session id,
  concept id, flags set. **Cutscenes** are shot lists with lines. **Map props** are `{id, sprite, x, y, fromDay, untilDay,
  whenFlag}`; drawing code sits in a sprite registry.
- **Saves:** versioned with a migration chain; a lasting `profile` (transcript, flags, relations, closed-season records,
  carry records) apart from the `season` slot; closed records are never deleted; export/import; persistent storage.
- **The core never breaks a chapter.** Every chapter has golden runs (seeded bot seasons and a scripted story run: every
  line, choice and morning's books). A platform change must leave them byte-identical unless the PR says why a chapter's
  golden file changed and that chapter's pack approves it.
- **Write it down:** every new interface goes into `MAP.md` with a one-screen example a chapter session can copy.
- **Dev-mode readiness (keep these now; dev mode itself is built later, master plan §14):** (1) no unseeded randomness —
  every random draw comes from the game's seed (today `game.js` has two `Math.random` calls); (2) everything about a moment
  lives in the save, so any moment can be written and read back; (3) every story beat, scene and cutscene has a stable id;
  (4) the chapter hand-off record has a schema and preset records for testing.
- **Season openings:** each season has an opening animation (≤ 8 s, data on the cutscene engine) that plays on season
  start and on entering a season from the main menu, never on pause/resume.

## You do not
Put chapter content in core · change canon · merge your own PRs.
