# HANDOVER — Chapter 1 builder — updated 2026-10-04 by the creative lead (seed file; the builder rewrites it each session)

## State in one paragraph
Spring is built and live as **v0.4.6** (tag `v0.4.6-beta`, PR #41): four weeks, the Reeve's Court (9 claims, pass 6,
rotating variants: creative call 6), Market Day on days 7/14/21, the 74-second opening, practice tiers, fixed-vs-variable
and present-value lessons, Kyle's iPad playtest-2 fixes. Node tests 25/25. The master plan (4 chapters × 4 seasons) and
this builder system are new. Kyle approved the plan on 2026-10-04: four chapters fixed, season count and span set by the
material, play time growing by chapter. The platform pack goes first; Phase S follows once cutscenes and map props exist.

## Live / branch state
master = v0.4.6 (live on GitHub Pages). Open PRs: none from this builder. Stale PRs #27–#29 closed; #40 merged inside #41.

## Next 3 actions
1. Work the platform pack (P1, P2, W1, W2, P3 …) — see `docs/builders/platform/HANDOVER.md`.
2. Then S1 — cut the load.
3. Then S2 — what Summer needs.

## Failure lesson
- From the last week: eight PRs (#33–#39) went live before any review, and the review then found lesson errors (a Court
  retake that repeated itself, a wrong break-even figure, time value taught backwards).
- Rule: never merge your own PR; every PR waits for the critic and the creative lead.

## Blocked on the creative lead / Kyle
- Nothing for Spring. Summer's build waits on the curriculum asks (contract-law session; reviews of C7.01, C8.01–03).

## Decisions made and why
- 2026-10-04: platform before Spring polish — so cutscenes and the living map are built once, on the new engine.
- 2026-10-04: Court = 9 claims, pass 6, one per core idea plus the guarantee — Kyle asked for a short, not-hard exam.

## Dead ends (do not repeat)
- `tests/run-html.js` needs Playwright, which is not installed locally; the last builder used `chrome --headless --dump-dom`.
  P1 fixes this properly in CI.

## Files that matter
- `docs/builders/chapter-1/CHARTER.md`, `WORK-ORDER.md` — what and how.
- `docs/MASTER-PLAN.html`, `docs/curriculum-coverage.json` — the plan and the session map.
- `engine.js` (journal + Spring constants), `game.js` (UI, save at line ~836), `story.js` (lessons), `court.js` (finale).
