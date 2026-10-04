# MAP — Platform (seed, 2026-10-04; the restructure P3 rewrites it)

Today there is no `core/` folder: core and Spring content are mixed in the root. Where things are now:

| What | Where | Notes |
|---|---|---|
| Double-entry engine | `engine.js` | Pure JS, no DOM; runs in node. Lines 8–47 are **Spring's constants** (`R`): days, costs, Duke/Corvin orders, Crown debt, prices by day, events. Seeded events via mulberry32 (`eventsFor`). |
| Books, statements, review | `books.js` | Ezra's closing review questions. |
| UI, map drawing, save | `game.js` (117 KB) | Save key `lc_spring_save_v3` (line 10); `save()` ~836; deleted at ~822 (after the closing review) and ~834 (restart). Map props drawn in code from ~840. iPad scroll pin `pinPage` ~166. Stall valve ~283. |
| Mechanic verbs | `verbs.js`, `verbs.css` | tag, bet, timeline, … |
| Transcript | `transcript.js` | Key `lc_transcript_v2`; `CONCEPTS`, `CORE`; mastery needs 3 game days and 2 real dates. |
| Other stores | `codex.js` (`lc_codex_v1`, `lc_level_v1`, `lc_prestige_v1`), `endings.js` (`lc_unlocks_v1`), `fx.js` (sound prefs), `intro.js` (`lc_intro_seen`), bug reports `lc_bug_reports` (game.js ~278) | All localStorage, no versions. |
| Sound | `music.js`, `fx.js` | WebAudio; no audio files. |
| Opening | `intro.js`, `intro.css` | `Intro.SCRIPT` is already data: the model for the cutscene engine. |
| Tests | `tests/run-all.js` (node, 25 files), `tests/run-html.js` (needs Playwright, not installed locally), `tests/*.html` (~40) | No CI. |
| Version stamp | `?v=` typed into every tag of `game.html` and `index.html` | P2 replaces this. |
