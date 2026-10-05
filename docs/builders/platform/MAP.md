# MAP — Platform (seed, 2026-10-04; the restructure P3 rewrites it)

**Wiki pages (one per row below):** [engine](../../wiki/platform/engine.md) · [books](../../wiki/platform/books.md) · [game-ui](../../wiki/platform/game-ui.md) · [save](../../wiki/platform/save.md) · [transcript](../../wiki/platform/transcript.md) · [codex](../../wiki/platform/codex.md) · [verbs](../../wiki/platform/verbs.md) · [sound](../../wiki/platform/sound.md) · [opening](../../wiki/platform/opening.md) · [bots](../../wiki/platform/bots.md) · [art](../../wiki/platform/art.md) · [tests-and-ci](../../wiki/platform/tests-and-ci.md) · [version-stamp](../../wiki/platform/version-stamp.md) · [wiki-lint](../../wiki/platform/wiki-lint.md).

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
| Tests | `tests/run-all.js` (node), `tests/run-html.js` (Playwright, real-time Chromium), `tests/*.html` | **CI:** `.github/workflows/ci.yml`, job `tests`, runs `node tests/run-all.js` then `node tests/run-html.js --all`. `--all` runs every `tests/*.html` except `shot-*.html` (screenshot drivers) and fails the run on a line ending `: false`, `THROWN`, `EXCEPTION`, `FAIL`, `TIMEOUT`, `JS errors: N`, a non-empty `errors: [..]`, or any page error. A new test page must print its results into `<pre id="out">` and write one `label: true|false` line per check. Locally: `NODE_PATH=$(npm root -g) CHROMIUM_PATH=/path/to/chrome node tests/run-html.js --all`. |
| Version stamp | `version.js` (the one version; `window.LC_VERSION`) · `tools/stamp.js` (bump: `node tools/stamp.js 0.4.7`; check: `--check`) · `tests/test-version.js` | Stamps every local `<script src>`, stylesheet `<link>`, the Play link and the visible version in `game.html` and `index.html`. A new script tag: add it, run `node tools/stamp.js`. |
| Code wiki lint | `tools/wiki-lint.js` · `docs/wiki/coverage.json` · `tests/test-wiki-lint.js` | `node tools/wiki-lint.js` runs in CI. Wiki pages: [tests-and-ci](../../wiki/platform/tests-and-ci.md), [version-stamp](../../wiki/platform/version-stamp.md), [wiki-lint](../../wiki/platform/wiki-lint.md). Coverage of source files is warn-only until W2. |
