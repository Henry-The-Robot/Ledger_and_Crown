# HANDOVER — Chapter 1 builder — updated 2026-10-04 22:50 by game-builder (Sonnet)

## State in one paragraph
Spring is live as v0.4.6. Summer design is docs-only (Lead, 2026-10-05). Card U0a is done: `chapters/ch1/summer/CURRICULUM-NOTES.md` covers the 16 sessions with home 1SU, lists 8 core ideas and the previews, and flags errors in C4.01-03, C7.01, C8.01-03. Card U0b (the Summer design draft) is next and is ready.

## Live / branch state
master = v0.4.6. Local work is on `local/work`; `infra/git_sync_game.py` pushes it. No open PR from this builder.

## Next 3 actions
1. U0b: write `chapters/ch1/summer/DESIGN-DRAFT.md` from `docs/builders/SEASON-DESIGN-TEMPLATE.md` and master plan §4 and §13 (opening animation, cutscene list). Use the 8 core ideas in the notes. Read the notes' error table first.
2. Platform cards G1, P4b, P5 (see `python infra/plan_cards.py next mba-game`).
3. T1 small drift fix in `tests/run-html.js`.

## Failure lesson
Reading 16 sessions with their answers cost about 100k tokens in one session. Next time: read the answers file only for sessions that have a formula, and stop at U0a before starting a design card.

## Blocked on the creative lead / Kyle
- C12.11 (contract law) is NOT WRITTEN. Summer's Vane and guarantee scenes wait for it (PLAN item C1).
- Curriculum fixes needed before the elasticity and scale scenes: see the error table in CURRICULUM-NOTES.md. Not yet filed as a help request.

## Decisions made and why
- 2026-10-04: idea 8 (legal, ethical, smart) is core because S2 already names it. It is the first to demote if Summer runs long.
- 2026-10-04: Kyle's venture names (V1, V10, HVAC client) in session text must not reach player text.

## Dead ends (do not repeat)
- `tests/run-html.js` needs Playwright, not installed locally.
- Printing session files with python `print` fails on Windows (cp1252). Use the Read tool.

## Files that matter
- `chapters/ch1/summer/CURRICULUM-NOTES.md` — U0a output.
- `docs/builders/chapter-1/WORK-ORDER.md` row U0, `docs/curriculum-coverage.json`.
