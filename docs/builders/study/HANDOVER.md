# HANDOVER — Study kit builder — updated 2026-10-22 by sonnet-game-builder
## State in one paragraph
Cards MBA-ST1, ST2 and ST3 are done and CI is green. The study kit lives in `core/study/`: `log.js` (event log, result code), `forms.js` (forms A, B, C, scoring, screen-out), `fixture-items.js` (fixtures only), `shell.js` (headless shell: code, form A, scenes, form B, result). Tests: `tests/test-study-log.js`, `test-study-forms.js`, `test-study-shell.js`. `tests/decode_result.py` is a copy of `projects/studio/tools/decode_result.py`; re-copy if the shared one changes.
## Live / branch state
Branch `local/work`, PR 59 (Henry-The-Robot/Ledger_and_Crown). Nothing is wired into `game.html` yet.
## Next 3 actions
1. MBA-ST4 waits for Kyle's anchor choice and the Lead's confirmation of the slice draft (`projects/mba-game/STUDY-SLICE-2026-10.md`).
2. A `study.html` page that draws `StudyShell` (code box, form screens, scenes, result code, copy button). Not carded yet; ask the Lead.
3. Replace `PLACEHOLDER_SCENES` in `shell.js` with the real slice; load the real item bank from the curriculum builder.
## Failure lesson
CI has only the game repo, so a test that reads a file from the Agent System checkout fails there. Keep test inputs inside the repo. Followed.
## Blocked on the creative lead / Kyle
- Screen-out line: card ST2 says 80 percent (`Forms.DEFAULT_SCREEN_OUT`); STUDY-LOG-SCHEMA says Ledger & Crown is proposed at 60 percent. Pass `screenOut` to the shell once `STUDY-DESIGNS.md` sets it.
## Decisions made and why
- Participant code must match `^[a-z0-9]{3,12}$`; a one-word real name still passes. Tell testers to use the random code given.
- A scored decision does not count as a pause: its `rt` already holds the thinking time.
## Dead ends (do not repeat)
- `gh pr checks 59 -R .../thornfield-beta --watch` often says "no checks" right after a push. Use `gh run list -R Henry-The-Robot/Ledger_and_Crown` then `gh run watch <id> --exit-status`.
## Files that matter
`core/study/*.js`, `tests/test-study-*.js`, `projects/studio/STUDY-LOG-SCHEMA.md`.
