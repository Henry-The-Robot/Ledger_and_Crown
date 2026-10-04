# HANDOVER — Platform pack — updated 2026-10-04 by the creative lead (seed file)

## State in one paragraph
The engine core (double-entry journal) is sound and tested. Everything around it is Spring-only: constants in the engine,
content and map in code, one unversioned save, no CI. Work order P1–P12 (+ W1, W2) fixes this. **GO** (Kyle, 2026-10-04); not started.

## Live / branch state
master = v0.4.6. No platform branches.

## Next 3 actions
1. P1 — CI.
2. P2 — one version stamp.
3. W1 — code wiki lint.

## Failure lesson
- Inherited: eight PRs went live last week without review, and lesson errors followed. Never merge your own PR.

## Blocked on the creative lead / Kyle
- Nothing. Ask the creative lead to make the CI check required once P1 lands.

## Decisions made and why
- 2026-10-04: platform before the Spring polish — cutscenes and the living map get built once, on the new core.
- 2026-10-04: no build step, no framework — GitHub Pages stays zero-cost and simple to deploy.

## Dead ends (do not repeat)
- Local headless tests: Playwright is missing; `chrome --headless --dump-dom` works as a stopgap. P1 fixes it in CI.

## Files that matter
- This pack's `CHARTER.md`, `WORK-ORDER.md`, `MAP.md` · `docs/MASTER-PLAN.html` §11.
