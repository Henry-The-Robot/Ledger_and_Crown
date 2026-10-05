# HANDOVER HISTORY — mba-game (Ledger & Crown)

> Older Project Lead notes, moved out of `HANDOVER.md` on 2026-10-05 so their headings no longer read as current state.
> **Superseded by `HANDOVER.md`.** Nothing here is a live instruction.

## Creative lead: start here (2026-10-02)
Kyle made this session the game's **creative lead**: plan and decide, never build; builds go to Sonnet subagents
(`builder` agent, `model: sonnet`), max 2 at once, `get_usage` before each launch, nothing new at ≥60% of the 5-h window.
- **Shareable version for Kyle (Claude Doc):** https://claude.ai/code/artifact/4cc08ccb-91d2-40e3-a6db-924899348b15 —
  update its Build plan status dropdowns when a workstream changes state.
- **The plan:** `CREATIVE-PLAN.md` (v1.0): diagnosis of why Spring is dull / doesn't teach / covers 3 of 17 courses, five
  creative decisions, the new first 15 minutes, UI direction, workstreams WS0–WS5.
- **Specs builders work from:** `specs/WS0…WS5-*.md`. **Reviews:** `reviews/pr-review-2026-10-02.md`,
  `reviews/curriculum-coverage-2026-10-02.md`.
- **Source of truth for code:** the `thornfield-beta` repo (`C:/Users/Kylev/thornfield-beta`). Branches: `master` = live
  beta; `next` = integration; feature branches → PR into `next`; the creative lead reviews and merges, then promotes
  `next → master` per milestone with a tag + `CHANGELOG.md`. `poc/5-spring/` here is **frozen** (no more edits).
- **Workstream status:**
  | WS | What | Status |
  |---|---|---|
  | 0 | Integrate PRs #1–#10 + fixes → `next`, tag v0.1-beta, PR next→master "v0.2-beta" | **done 2026-10-02**: PR #11 merged to master (live), tag `v0.2-beta`, #1–#10 closed. Review caught a swallowed `bump()` in `rescue()` (fixed 000afcc). Open: overtrader bot still pays the Crown (moved into WS3 "Balance"); HUD overflow (in WS2). |
  | 1 | Lessons as data + verbs | **deferred** (Kyle wanted a playable iPad build within the hour, 2026-10-02 ~02:40 UTC) |
  | 2 | UI kit, HUD, juice, fast travel — iPad-first | **running** local builder, branch `ws2-ui-ipad` → PR into `next` |
  | 3 | Cold open, bets, timeline; ch 1–7 (directly in story.js + verbs.js, no WS1) | **running** local builder, branch `ws3-first-15` → PR into `next` |
  | 4 | Traveller's letters + day-loop report + playable `/v1/` copy | **sent to cloud session "MBA Game Cloud Builder"** (branch `ws4-letters`; also fallback: finish ws2/ws3 branches if no PR by 03:35 UTC). Delivery to cloud is one-way and may need Kyle's approval in that session. |
  | iPad | PR #12 (cloud agent) | **merged into `next`** 2026-10-02 (conflict on save key resolved → v3) |
- **2026-10-02 ~03:00 UTC: v0.3.1-beta LIVE** (PRs #12 iPad, #13 UI, #14 story, #15 promote, #16 cache-bust; tags `v0.3-beta`).
  Critical pass: `reviews/critical-pass-v0.3-2026-10-02.md` (overtrader still wins; 0 mastered in bot run; goal text truncates;
  two Check buttons; d-pad overlap; walk-off untuned; iOS audio unlock). Local 5-h window hit 98%, so the fix pass (items 1–8)
  + WS4 were sent to cloud session "MBA Game Cloud Builder" (one-way; may need Kyle's approval there). **Next session:** check
  GitHub for its PRs into `next`, review the diffs, run `node tests/run-all.js` + headless smoke-story, promote, bump `?v=`.
- **2026-10-03 ~06:00 UTC: v0.4 candidate = PR #32 (`integrate-s1`)**, not live. Quality gate (TASKS-season1.md) must pass
  before Kyle plays. Work order for the next builder is IN THE GAME REPO: `docs/WORK-ORDER.md` on `integrate-s1` (T4 Court, T3b,
  creative calls, T5 practice-as-play + standing orders, T6/T6b, editor pass, day-loop). Local 5-h window hit 96% → handed to
  the cloud session (one-way message; Kyle may need to paste "Do docs/WORK-ORDER.md on branch integrate-s1"). **Next local
  session (after ~10:10 UTC reset):** check PRs into `integrate-s1`, review diffs, then launch local Sonnet builders on whatever
  items remain; then the creative lead plays week 1 + week 4 at 1194×834 before release.
- **2026-10-03 later: THE WORK LIST IS `TASKS-season1.md`** (merged plan: creative lead's redesign + cloud agent's
  PRs #27 audio, #28 cast/scenes/letters + `docs/STORY-BIBLE.md`, #29 practice). Canon: villain Steward **Corvin Vane**; Crane
  is the honest clerk, not Vane's man; finale = **the Reeve's Court** (Duel format = the exam, pass 6/8, retakes) assigned
  to the cloud agent (T4, `court.js`). Next local step: when WS6 + WS7 PRs land, launch the **integrator** (T1–T3).
- **2026-10-03 (session 3): v0.3.2-beta LIVE** (cloud fix pass via PR #26). **V2 revert point: tag `v2.0` / branch `release/v2`**
  (= v0.3.1 + #17 iPad polish). New creative direction: **`SEASON-1-REDESIGN.md`** (4-week 3-act arc, villain Corvin Vale +
  Crane, Crane's buy-out offer, Market Day, Ledger Duel finale, hearts/Jory/crops/restoration, curriculum foundation fixes).
  Inputs: `research/player-critic-gaps-2026-10-03.md` (Haiku; DIRECTIONAL, quotes unverified),
  `reviews/curriculum-foundation-2026-10-03.md` (Sonnet; 3 claims verified). Running: **WS6** story spine (local builder,
  branch `ws6-story-spine`, PR base master), **WS7** Market Day (local builder, `ws7-market-day`), **WS8** Ledger Duel
  (sent to cloud session, `ws8-ledger-duel`). Next: review/merge WS6 + WS7 (expect a game.js merge), then wire WS8 into day 28,
  then WS9 (crops, restoration, hearts, Jory) and WS10 (frost bet + weekly tally + opportunity-cost floor).
- **Revert point:** tag `v1.0` + branch `release/v1` = the v0.2 beta as it was before the rebuild. To revert the live site: PR `release/v1 → master`.
  | 5 | Spiral hooks H1–H4 (C4, C0.06, C7, C12) | spec ready; after WS1 |
- **Next action for a fresh session:** launch WS1 and WS2 in parallel (builder, model sonnet, background; prompt = "Execute
  the spec at <path> exactly…", same shape as WS0) once `get_usage` shows the 5-h window < 60%. Review each PR into `next`:
  read the diff (not just the summary: WS0's summary missed its own bug), run node tests, look at the screenshots.
- Routed to the coordinator: `inbox/2026-10-02-mba-game-curriculum-priority.md` (C9, C13, C10 next; review C3/C4/C6/C7/C8/C12).

## Coordinator note (2026-10-02): frontend-design skills already exist, use them
Kyle asked for HTML-frontend-design skills for this game. We already have a library at
`agentic-foundations/skills/product/frontend/` — `single-file-html.md` (our house pattern: one
self-contained `.html`, no build step, exactly the game's POC shape), `css-architecture.md`,
`component-patterns.md`, `accessibility.md`, plus `patterns/` (loading-states, empty-states,
form-validation, keyboard-accessibility, responsive-design, optimistic-ui) and
`product/design/` (color-systems, layout-systems, typography-mastery, visual-qa). Load the
relevant ones before a new POC or a big visual pass, same as any other standing skill. Also see
`skills/output-format-escalation.md` (proposed, pending manager merge) for when a diagram or a
tiny interactive HTML beats another paragraph inside a module session.

## State in one paragraph
A Stardew-style strategy/RPG that teaches the full MBA core to anyone. The one game in focus is the
farm: **Spring at Thornfield** (`poc/5-spring/`, play via `poc/index.html` → Play). It has 9 story
chapters (Uncle Edric's mystery: profitable but died broke; the Crown's 1,000 debt due at Midwinter),
Maud mentors each concept Show → Try → Use → Keep with typed numbers, the Desk (books, forecast,
statements) vs the Road (in-person haggling with hidden walk-away prices), a guided close of the
three statements, and a save every morning. **Verified by me:** engine tests, 300-season fuzz,
statements tie out, screenshots reviewed. **Not verified:** whether a beginner actually learns it,
which is Kyle's playtest. Earlier POCs (harvest ledger, council, market, guild hall, aptitude trial)
sit under "Earlier prototypes".

## Numbers
Core coverage: Spring ≈ 8 of ~150 core sessions (~5%); Year One planned ≈ 28 (~18%); full game = all
17 core courses. Curriculum written: C0, C1, C2, C5 (+ partial C6, C10 stubs, C14); 10 of 17 unwritten.

## Beta (live since 2026-10-02, ≤5 testers)
- Play: https://henry-the-robot.github.io/thornfield-beta/ · Repo: https://github.com/Henry-The-Robot/thornfield-beta (public, branch `master`, Pages from root).
- Package folder: `C:/Users/Kylev/thornfield-beta/` (copy of `poc/5-spring/` + title page, README, vendored style.css/codex.js, tests/). No email address anywhere, by Kyle's rule; feedback goes by email via the ☰ "Copy feedback details" button.
- To update (since 2026-10-02): change only the `thornfield-beta` repo, via a feature branch → PR into `next` → creative-lead review → `next → master` PR at a milestone + tag. `poc/5-spring/` is frozen. Pages rebuilds in about a minute after master changes. Live version: `v0.2-beta`.

## Never wait on Kyle (his rule, 2026-09-29, from the coordinator directive this file replaced)
Work continues while his feedback is pending; his playtest is a course-correction, not a gate. Log
anything decided without him under "Decisions taken without Kyle" so he can reverse it in one read.

## Next 3 actions (in order) — superseded 2026-10-02 by `CREATIVE-PLAN.md` §6 (WS0–WS5)
1. Review + promote WS0 (v0.2-beta). 2. Launch WS1 + WS2 in parallel. 3. WS3 (the new first 15 minutes), then Kyle replays.
Kyle played Spring on 2026-10-02: "not super engaging… periods where it feels quite dull… doesn't teach as you go."

## Owner and cadence
Interactive session "MBA Game v1" so far. The coordinator asked the manager (2026-09-29) for a daily
`mba-game-builder` scheduled task (Sonnet, builder/critic pattern); only the manager creates it.
Engine for the full build (web: TypeScript + Phaser or PixiJS vs keeping plain JS/canvas) goes to the
manager as a build plan before any port.

## Decisions taken without Kyle
- 2026-10-02 (creative lead): all 10 PRs accepted (Crown debt 1,250; emergency loan stays); spiral curriculum (every written
  course in Year One); predict→play→reveal→explain replaces tell→compute; no more fill-the-cells boards (timeline instead);
  cold open with Bailiff Crane tagging the estate; lessons as data; thornfield-beta repo is the single source of truth.
- Spring built on `poc/5-spring/` (plain JS + canvas, no engine) rather than porting to Phaser/Pixi.
- Earlier POCs moved under "Earlier prototypes"; the farm is the only "Play" button.
- Curriculum build order requested breadth-first (`CURRICULUM-NEEDS.md`).
- Note: the replaced directive said C3 content was written. As of 2026-09-29 it isn't (no
  `modules/C3*` folder), so Act II waits on C3, C4, C8 and C9.

## Failure lesson
- What went wrong: I over-corrected twice. First a quiz-wrapped game ("a class pretending to be a
  game"), then a game with no teacher ("thrown into the deep end"); each cost a full rework.
- The rule I'd follow next time: when designing learning, put both failure modes in the spec and
  test against both; the answer is a mentor inside the story (Show → Try → Use → Keep), not more
  or less teaching.
- Proposed for: none yet (recorded in memory `feedback-learning-games-game-first.md` and
  `GAME-DESIGN.md` §1a).

## Blocked on Kyle
- Playtest Spring (2026-10-01).
- Curriculum breadth: the MBA builder is held by its pace cap; the request to lift it and build
  breadth-first (C6 → C7, C13 → C4, C8, C9 → …) is in `inbox/2026-09-29-mba-game-curriculum-request.md`
  for the coordinator (direct messages to the MBA tutor and Manager v1.3 expired unapproved).
  Kyle can speed this by telling those sessions directly.

## Decisions made and why (newest first)
- 2026-10-02: Never stuck: Explain how (always), Walk me through it (after 2 misses, no mastery), ☰ menu/Esc (resume, restart day, map, report + skip), stall detector. No "step away" mid-lesson: answers are built from that moment's numbers, so trading mid-question would recreate mismatches. Kyle: stuck lessons make the game "completely unplayable".
- 2026-10-02: Guided lookup in every Try (open the doc, find each number, do the math yourself; hints say where to look, never the formula). Fixed a ch4 bug that rejected a correct sum: the answer counted every payment due but the hint counted only Hobb's. Tests: `poc/tests/doc-button.html`, `smoke-story.html` (12 Try beats, 0 errors). Kyle: "direct you to where on your sheets you could find the numbers… but not do the calculation for you."
- 2026-10-02: Mouse-only play everywhere (keyboard only for typing numbers). Fixed the Ledger, Notebook and Transcript (no clickable close before); added Notebook/Transcript buttons on the Road; `poc/tests/mouse-close.html` checks it. Kyle: "make sure that works across the whole game."
- 2026-10-01: Desk vs Road; every transaction is an in-person negotiation — Kyle: "playing a spreadsheet for hours will get boring VERY quickly."
- 2026-10-01: Story campaign with a mentor; focus on one game (the farm) — Kyle: "doesn't actually teach you… played on intuition and rough math."
- 2026-09-29: Stardew look; real business terms, real statements, a 17-course transcript — Kyle: existing games "don't care about what you learn"; it must feel like an MBA.
- 2026-09-29: The game must cover the full course load; game scenes only from written curriculum — Kyle: "make sure the game pulls it all together into a full MBA course load."
- 2026-09-29: Build for any player, not tailored to Kyle; game-first (no study links, quizzes or pre-tests).

## Dead ends (do not repeat)
- Study links, end-of-scenario quizzes, a test before play → "a class pretending to be a game".
- Pure sandbox with hidden learning → players guess; nothing is taught.
- Haiku research on existing games overclaimed: 4 claims were wrong. Always spot-check (corrections are in the memos' `verified:` lines).
- Cross-session messages to other sessions get held for approval and expire; use `inbox/` for the coordinator instead.

## Files that matter
- `GAME-DESIGN.md`: design and rules (§1a game-first + mentored + feels like an MBA; §11a landscape)
- `STORY-year-one.md`: the story campaign, Show → Try → Use → Keep, Desk and Road, seasons
- `CURRICULUM-MAP.md`: every C0–C16 session placed in an act · `CURRICULUM-NEEDS.md`: what the game needs from the curriculum
- `SPEC-spring-season.md`: the original Spring build spec
- `research/`: curriculum extracts (C0–C1, C2–C5 + frameworks) and landscape memos (commercial, academic)
- `poc/5-spring/`: the game (`engine.js` accounting, `books.js` statements, `game.js`, `art.js`, `transcript.js`; tests `test-engine.js`, `TEST-RESULTS.md`)
- `poc/tests/smoke.html`: headless playthrough of the earlier POCs. Run Chrome with `--headless --allow-file-access-from-files --dump-dom`.
