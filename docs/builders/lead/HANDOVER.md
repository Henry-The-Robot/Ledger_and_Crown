# HANDOVER — mba-game (Ledger & Crown) — updated 2026-10-05 04:40 by Lead - MBA Game v1.4 (cloud)

> **This is the Project Lead's handover, and this file is the only copy** (moved here from the Agent System's
> `projects/mba-game/HANDOVER.md` on 2026-10-04, at Kyle's request). The Lead rewrites it at the end of every session and
> commits it straight to `master` (docs only; the daily reviewer does not need to review it). Paths that start with
> `projects/`, `knowledge/`, `infra/` or `inbox/` are in the Agent System repo (`Henry-The-Robot/Agent-System`).

## State in one paragraph
Spring is live as **v0.4.6** (tag `v0.4.6-beta`, PR #41): Court = 9 claims, pass 6, rotating variants (creative call 6);
playtest-2 fixes and 8 review fixes merged; node tests 25/25. Kyle approved the **master plan**
(https://claude.ai/artifact/8D8TQbmyXqkMDmkTjGQghT = `MASTER-PLAN.html`, snapshot in game `docs/`): 4 chapters FIXED,
season count and game-time span per season set by the material, play time grows by chapter; Chapter 1 = Spring/Summer/
Autumn/Winter (map directionally OK). The game repo now has a **builder system**: one builder session at a time working
from packs in `docs/builders/` (platform + chapter-1..4: CHARTER, WORK-ORDER, MAP, HANDOVER), a season-design template,
and a **code wiki** `docs/wiki/` (Karpathy pattern; 3 pages so far). **Platform work order = GO**; the cloud builder
already opened **PR #45 (P1 CI)**. Main menu (realm map), season openings, cutscene lists and the dev-mode design are in
plan §13–14 and platform tasks P13–P16 (P16 dev mode = LATER). Curriculum branch merged into Agent System main; every one
of 177 sessions is mapped to a season/chapter (`curriculum-coverage.json`). Not verified: the daily reviewer has never run.

## Roles
- **Project Lead** = this Opus session: plan, order, reviews; ≤ 3 Haiku subagents (research = Haiku only, Kyle 10-04).
- **Project Builder** = cloud session "MBA Game Cloud Builder" (Sonnet). Kyle starts it with the prompt in game repo
  `docs/builders/README.md`; it takes the first GO task in its pack's WORK-ORDER.md (platform pack first).
- **Daily PR reviewer** = scheduled task `curiosity` (Sonnet, 09:40): merges clean PRs, comments fixes, escalates
  canon/design/release PRs to `REVIEW-QUEUE.md`. Uses `review-checkout/` (gitignored clone) + scoped gh/git/node allowlist.
- `PLAN.json` (22 items, file checks against `review-checkout/`): `python infra/project_status.py mba-game`.

## Next 3 actions (Lead)
1. Read `REVIEW-QUEUE.md`; check the reviewer's first run (10-05 09:40) handled PR #45. If `curiosity` shows 0 runs on
   10-06, run it by hand (`run_scheduled_task curiosity`) and fix what stalls it.
2. Spring deep dive (PLAN item L4): Haiku research agents read the 15 Spring sessions + answers; compare with the game's
   teaching lines (`review-checkout/` story.js, scenes.js, practice.js, court.js, market.js); write
   `reviews/spring-deep-dive-2026-10-0X.md`; turn findings into Chapter 1 work-order items.
3. Game-repo half of the docs cleanup is done (PR from `claude/lead-handover-docs-porb7p`: S8 release note, `SEASON-1-REDESIGN.md`
   marked superseded, history moved to `HANDOVER-HISTORY.md`). The Agent-System half (mark `CREATIVE-PLAN.md`,
   `CURRICULUM-MAP.md` superseded) is asked of the coordinator in `docs/help/20261005-0425-lead-to-coordinator.md`; read
   its `## Answer`.

## Failure lesson
- What cost most: I drafted the master plan from the stale `main` curriculum (74 sessions) while the real one (154) sat on
  a branch; session IDs were wrong until Kyle asked. Also used the generic docs skill instead of `skills/plan-doc.md`
  (Green Light), so the kickoff was missing until Kyle asked.
- Rule: before mapping curriculum, `git fetch` and check every branch with knowledge/mba changes; before any plan, use
  `skills/plan-doc.md` (PLAN.json + readable doc + KICKOFF files + 27-item checklist).

## Blocked on Kyle
- Nothing for the MBA game. (Green Light's six decisions live in `projects/ca-dmv-game/HANDOVER.md`.)

## Decisions made and why (newest first)
- 2026-10-04: Green Light (CA DMV study game) planned and handed to its own Lead/Builder (`projects/ca-dmv-game/`,
  plan v1.2 https://docs.google.com/document/d/11hvrbiiccccUvXbt6RZo3S0h1oqlLyzcb8iyVGPfmck) — Kyle: back to the MBA game.
- 2026-10-04: daily Sonnet PR reviewer, auto-merge clean PRs (Kyle chose).
- 2026-10-04: one builder role + per-chapter packs + code wiki, not four standing agents (Kyle: runs are sequential; the
  packs stop Chapter 1 fixes from needing a full reload).
- 2026-10-04: platform before the Spring polish, so cutscenes and the living map are built once on the new core.
- 2026-10-04: Court 9 claims / pass 6 (Kyle: a short, not-hard exam).

## Dead ends (do not repeat)
- Messaging the cloud builder from a local session: it is not in `list_sessions`; Kyle pastes prompts.
- Headless browser tests locally: Playwright not installed; platform P1 puts them in CI.
- Drive `create_file` rejected a ~17 KB HTML upload with a 37-row table ("invalid argument"); a shorter table worked.

## Files that matter
- `MASTER-PLAN.html` (plan) · `PLAN.json` · `REVIEW-QUEUE.md` · `curriculum-coverage.json` + `tools/coverage.py`.
- Game repo (`Henry-The-Robot/thornfield-beta`; local worktree `C:/Users/Kylev/tb-pt2`): `docs/builders/`, `docs/wiki/`,
  `docs/MASTER-PLAN.html` (snapshot: re-copy when the plan changes), `docs/TASKS-season1.md` (canon, creative calls 1–6).
- Curriculum asks sent: `knowledge/mba/CLOUD-HANDOVER.md` (top) and `inbox/2026-10-04-mba-game-curriculum-asks.md`.
- Revert points: tags `v0.4.6-beta`, `v0.3.2-beta`, `v1.0`, `v2.0`.

Older notes (2026-09-29 → 2026-10-03): `docs/builders/lead/HANDOVER-HISTORY.md`. They are superseded by this file.
