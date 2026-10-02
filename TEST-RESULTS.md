# Test results — thornfield-beta packaging (2026-10-02)

Source: `projects/mba-game/poc/5-spring/` in the Agent System repo, copied into this standalone
folder per `projects/mba-game/HANDOVER.md`. Not committed to the package repo (dev notes only).

## 1. Outside-folder references
Grepped the whole package for `../`, `knowledge/`, `codex.js`/`style.css` (unqualified). Found two
real outside refs and fixed both:
- `game.html` loaded `../style.css` and `../codex.js` (paths from the old `5-spring/` subfolder).
  Both files copied into the package root; paths changed to `style.css` / `codex.js`.
- `codex.js` had a dead `SOURCES` map pointing at `../../../knowledge/mba/...` (designer-only data,
  never read by Spring at runtime — confirmed by grepping `game.js`/`story.js`/`transcript.js` for
  `SOURCES`: no hits). Removed the whole map and its entry in the returned object, since one copy
  of it (`return {... SOURCES ...}`) still referenced it and threw `ReferenceError: SOURCES is not
  defined` in the browser console on first load — caught by the smoke-spring.html run below, fixed,
  re-run clean.
- `pz-map` button ("Save and go to the map") pointed at `../index.html` (the old five-POC map,
  not shipped). Changed to "Save and quit": calls `save()` then `location.href = "index.html"`
  (this package's title screen).

No email address anywhere (`grep` for an email pattern: 0 matches).

## 2. node --check (syntax)
All 8 JS files pass with no output (success): `engine.js`, `books.js`, `bot.js`, `codex.js`,
`art.js`, `story.js`, `game.js`, `transcript.js`.

## 3. Headless Chrome smoke tests
Chrome 141 (installed), `--headless --disable-gpu --allow-file-access-from-files
--virtual-time-budget=<n> --dump-dom`, run against the copied `tests/*.html` (paths fixed from
`../5-spring/index.html` to `../game.html`).

| Test | Result | JS errors |
|---|---|---|
| `smoke-story.html` (full 9-chapter story + save/continue) | chapters 1–9 reached `done`, outcome `closed`, statements reconcile, 14/14 transcript concepts mastered | **0** |
| `smoke-spring.html` (sandbox + reckless run) | season closes, reckless run goes insolvent on day 7 as expected | 2 on first run (`SOURCES is not defined`, fixed above) → **0** on re-run |
| `never-stuck.html` (Explain how / Walk me through it / Esc / Report+skip) | every escape route present and working; bug log gets 1 entry after skip | 0 |
| `mouse-close.html` (every panel closes by mouse) | 9/9 ledger/notebook/transcript × top/bottom/backdrop close correctly | 0 |
| `doc-button.html` (in-question document lookup) | forecast opens, Closing Cash hidden, question resumes, right answer accepted | 0 |

## 4. Visual check
Screenshots taken and viewed directly (not just dumped DOM):
- Title screen (`index.html`): parchment card, title, blurb, gold Play button, README link. Correct.
- First game scene (`game.html?sandbox`): farm, HUD (Spring 1 · Mon, Cash 200), hotbar (sacks/seed/
  sprinkler, Notebook/Transcript buttons), ☰ Menu button all visible and rendered correctly.
(Screenshots kept in the Agent System repo at `projects/mba-game/poc/5-spring/shots/beta-title-shot.png`
and `beta-game-shot.png` — not part of the public package.)

## 5. New feature: Copy feedback details (no email in the game)
Added to `game.js`: `feedbackText()` builds day, chapter/stage, last 5 `lc_bug_reports` entries, and
`navigator.userAgent`, ending with "Paste this into your email to Kyle." `copyFeedback()` uses
`navigator.clipboard.writeText`, falling back to a hidden `<textarea>` + `execCommand('copy')` for
older/restricted browsers. Wired to a new "Copy feedback details" button in the ☰ pause menu, and
"Report a problem" now also copies before logging+skipping. Covered indirectly by `never-stuck.html`
(the skip path runs `copyFeedback()` with 0 JS errors, confirming it doesn't throw even in headless
Chrome where the Clipboard API may be restricted — it falls back silently).

## Not tested here
- Real browser manual click-through (Kyle/testers will do this) — only headless DOM automation and
  two static screenshots were checked directly.
- Mobile browsers — out of scope (Mac/Windows desktop only, per the task).
