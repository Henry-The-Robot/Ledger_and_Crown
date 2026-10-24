# HANDOVER — Study kit builder — updated 2026-10-23 by sonnet-game-builder
## State in one paragraph
Cards MBA-ST1 to ST3, ST6 to ST8 are done. Card MBA-ST9 adds `core/study/select.js` (record selection, verb overrides, three-option checks, frame) and `core/study/mode.js` (study switches: quiet, auto-ship, hidden menus, no saves, notices). Both are pure and off without `?study=1`. Two one-line hooks sit in the game: `ch4bBet` reads `reveal: "now"` (story.js) and `haggle` reads `rounds` (game.js, default 4). Test: `tests/test-study-mode.js`.
## Live / branch state
Branch `local/work`, PR 59 (Henry-The-Robot/Ledger_and_Crown). The helpers are not wired into a page yet: no `study.html` exists.
## Next 3 actions
1. MBA-ST10: the study bot, which uses `select.js` and `route.js` to play `study-route.json` and report minutes.
2. A `study.html` page that draws `StudyShell`, calls `StudySelect.select` per lesson step and applies `StudyMode` (hide the ids in `HIDDEN_UI`, drop saves, call `holdQuiet`). Not carded; ask the Lead.
3. The runner must apply the route's `ship` op through `Mode.openOrderFor` and `Mode.autoShip`; the `check` and `practice` steps use `Sel.checkStep` and `Sel.gradeCheck`.
## Failure lesson
A hand check of `Spring.deliver` found the order status is `open`, not `accepted`; read the engine before writing a helper that names its fields. Followed.
## Blocked on the creative lead / Kyle
- Anchor choice D3 (STUDY-VERSION-PLAN.md): the S-ids and the check content are data in the route file, so the helpers do not wait on it.
## Decisions made and why
- Helpers are pure and take the engine as an argument, so node tests cover them and the full game cannot see them.
- `HIDDEN_UI` lists guessed element ids; the page card must confirm them against `game.html`.
## Dead ends (do not repeat)
- `gh pr checks` right after a push says "no checks". Use `gh run list -R Henry-The-Robot/Ledger_and_Crown` then `gh run watch <id> --exit-status`.
## Files that matter
`core/study/select.js`, `mode.js`, `route.js`, `shell.js`; `tests/test-study-mode.js`, `test-study-route.js`; `projects/mba-game/study-route.json`.
