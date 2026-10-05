# Chapter builders — one builder, four chapter packs (v1.1, 2026-10-04, creative lead)

Ledger & Crown has 4 chapters (Farm, Town, Province, Kingdom). **Four chapters is fixed; nothing else is** (Kyle,
2026-10-04): each chapter has as many seasons as its material needs, a season spans as much game time as teaches its
ideas best (weeks or months), and real play time per season grows in later chapters because the ideas get harder.
There is **one builder role**, run as one session at a time. Each chapter has a **pack**: a folder in `docs/builders/`
that holds everything a fresh session needs for that chapter and nothing else. A session works on one chapter, loads only
that pack, and leaves the pack current when it stops. Going back to edit Chapter 1 while Chapter 2 is under way means
loading the Chapter 1 pack (about four short files), not re-reading Chapter 1's code or history.
The **creative lead** (an Opus session in the Agent System) is the only agent that holds the whole game in its head. It
writes each pack's charter and work order, answers questions, and reviews every PR. Kyle approves direction.

## What a chapter pack holds
| File | What | Who keeps it current |
|---|---|---|
| `CHARTER.md` | What the chapter is and how it must be built | Creative lead |
| `WORK-ORDER.md` | Ordered tasks with "Done means" and status | Creative lead (status: the builder) |
| `MAP.md` | **The chapter's front door:** a short table of its systems, each linked to its page in the code wiki (`docs/wiki/chN/`), plus the invariants, the tests to run and the carry record it writes. | The builder, **in every PR** that moves or adds anything |

**The code wiki** (`docs/wiki/`, schema in its README; Karpathy's LLM-wiki pattern, as in the Agent System's own wiki): one
short page per system, lesson group, data family, known bug or build decision, each naming its exact files, functions,
tests and history, plus a build log per chapter. A session fixing a problem reads `MAP.md` → one or two wiki pages → the
exact lines. Every PR updates the pages it touches; `tools/wiki-lint.js` in CI fails a PR whose pages point at code that
no longer exists, so the wiki cannot drift.
| `HANDOVER.md` | Where the last session on this chapter stopped | The builder, at the end of every session on this chapter |
| `TASK-PLAN.md` | Only during a long task | The builder |
The platform (shared core) has its own pack: `docs/builders/platform/` with the same files.

## Start of every session (cloud or local)
1. Read this file.
2. Read the pack you were given: `CHARTER.md`, then `TASK-PLAN.md` if its status is `open`, then `HANDOVER.md`, then
   `MAP.md`, then `WORK-ORDER.md`. For a fix, open the wiki page(s) MAP.md links for that system, then only the code
   lines they name.
3. Take your task from the Lead's cards: `python infra/plan_cards.py next mba-game` in the Agent System (cards live in
   `projects/mba-game/PLAN.json`; the card names the WORK-ORDER row it builds, and that row's "Done means" is the bar).
   Before the platform stack (PRs #45–#52) reaches your checkout, a pack's WORK-ORDER may still show a built task as GO:
   the cards win. Finish the task to its "Done means". One task per PR.
4. Before you stop: update the wiki pages your work touched (and add a `bug` page for a non-trivial fix), add a line to
   the chapter's `docs/wiki/chN/LOG.md` per merged PR, update `MAP.md` if anything moved, and rewrite `HANDOVER.md`.
   Commit and push, even when the task is unfinished.

Start prompt Kyle (or the creative lead) gives a fresh session:
> You are the Ledger & Crown builder working on Chapter N (repo Henry-The-Robot/thornfield-beta). Read
> docs/builders/README.md, then the Chapter N pack, and follow "Start of every session".
For a fix in another chapter: "…working on Chapter 1, to fix <thing>". The session loads the Chapter 1 pack only.

## Switching chapters, and going back
- **Moving on** (Chapter N is done or paused): rewrite N's HANDOVER and MAP so a stranger could resume it; finish or park
  any branch; write the carry record N hands to N+1 into N's MAP. Then a new session opens the N+1 pack. Never carry
  Chapter N's details in your head or in N+1's files.
- **Going back to fix Chapter N:** a fresh session, the Chapter N pack, the fix, N's golden tests, N's HANDOVER updated.
  Every chapter's golden tests run in CI on every PR, so a fix in one chapter cannot silently break another.
- **A change to the core** (any chapter can need one): its own `platform/<topic>` PR, the platform pack loaded, every
  chapter's tests green, `docs/builders/platform/MAP.md` updated. Log it in `PLATFORM-REQUESTS.md`.

## What lives where (so a change touches one pack)
| Area | Paths | Pack | Rule |
|---|---|---|---|
| **Platform** (shared core) | `core/` (engine, game, verbs, books, transcript, fx, music, art, intro, bot, codex, market, and the shared CSS), `game.html`, `index.html`, `version.js`, `tools/`, `.github/`, `tests/run-*.js` | `platform/` | Only in a `platform/<topic>` PR. Nothing chapter-specific goes in core. |
| Chapter content | `chapters/chN/<season>/` (season data, lessons, scenes, cutscenes, map props, claims, tests) | `chapter-N/` | Only in a `chN/<topic>` PR. Never edit another chapter's folder in the same PR. |
| Spring today | `chapters/ch1/spring/`: `story.js`, `scenes.js`, `cast.js`, `court.js`, `practice.js`, `standing.js`, `endings.js`, `story.css`, `court.css` | `chapter-1/` | Moved by platform P3 (PR #52). `core/market.js` and `core/engine.js` still hold Spring's numbers until P5 moves them to `chapters/ch1/spring/season.js` (Lead decision 2026-10-05: Market Day is a core system every season reuses; its prices are season data). |
| Canon and plans | `docs/builders/README.md`, every `CHARTER.md`, every `WORK-ORDER.md`, `docs/MASTER-PLAN.html`, `docs/STORY-BIBLE.md`, `docs/curriculum-coverage.json` | Creative lead | Propose changes in your HANDOVER |

The split matters even with one builder: a session fixing Chapter 1 should never need to understand Chapter 2, and a
Chapter 2 feature must not need a Chapter 1 rewrite. Where a chapter needs something the core does not do, it gets built
in the core (a platform PR), never patched in from the chapter.

## Branches, PRs and releases
- Branch names: `ch1/<topic>`, `ch2/<topic>`, … and `platform/<topic>` (Chapter 1 builder only).
- One task per PR into `master`. The PR body: what changed, the task id, tests and their counts, screenshots at
  1194 × 834 for any screen you changed, anything that needs a creative call.
- **Never merge your own PR.** A daily reviewer (a Sonnet routine, 09:40) reads every open PR, runs the tests and a
  `critic` pass against your task's "Done means", then merges it or comments numbered fixes. Fix them on the same branch
  and push; the next run re-reviews. PRs that touch canon or plans (this README, any CHARTER or WORK-ORDER beyond ticking a
  status, the master plan, the story bible, the coverage map, season designs, outlines) or that need a release tag wait for
  the creative lead, and season designs for Kyle.
- A season design is written first as `chapters/chN/<season>/DESIGN-DRAFT.md`. A draft is a working file, not canon:
  the reviewer may merge it like any doc. Only `DESIGN.md` is canon; the creative lead renames the draft after Kyle
  approves it (Lead decision 2026-10-05: one local/work PR carries all local work, so a canon file in it holds up code).
- `master` is live (GitHub Pages). Unreleased chapters stay hidden behind data: a chapter the player has not reached does
  not load. Dev access only through `?dev=chN`.
- A release is a version tag the creative lead makes after the quality gate in your CHARTER.

## Standards for every builder (each has cost us before)
- **The idea is the mechanic.** If a player can win while ignoring the idea, the scene fails. No quizzes in costume.
- **Every number comes from game state** or a named formula over it. No literal numbers in player text.
- **Teach it right.** Every teaching line must agree with the curriculum session it cites (`docs/curriculum-coverage.json`
  → the session file). The curriculum lives in GitHub `Henry-The-Robot/Agent-System`, path `knowledge/mba/modules/`,
  branch `claude/cool-babbage-ww225e` until it merges into `main`. Read the session and its `answers/NN.md`. If the session
  looks wrong, say so in your HANDOVER; do not build on it.
- **Writing:** Maud ≤ 2 sentences a box; no run of more than 4 dialogue boxes without a choice; one idea per sentence; each
  character keeps the voice in `docs/STORY-BIBLE.md`.
- **Touch and mouse:** 44 px targets; iPad 1194 × 834 is the reference screen; never stuck (the menu always works).
- **Tests:** `node tests/run-all.js` and the headless browser tests pass before you open a PR. New behaviour gets a test
  that can fail. A test that re-derives the code's own formula is not a test; check against a hand calculation.
- **Version:** one bump per release, through the version tool once it exists (never by hand-editing tags).
- **Read diffs, not summaries.** Before you report a task done, read your own diff once.
- **Budget:** Kyle is on a Pro plan. Cap a session at ~60 tool calls. Do not run critic loops of more than 2 rounds.
  Normally one builder session at a time; never more than 2.

## HANDOVER.md template (rewrite it, don't append; under 60 lines)
```
# HANDOVER — Chapter N builder — updated <ISO time> by <session>
## State in one paragraph
## Live / branch state   (version on master, open PRs, branch names)
## Next 3 actions (task ids from WORK-ORDER.md)
## Failure lesson   (what cost the most this session; the rule for next time; did you follow the last one?)
## Blocked on the creative lead / Kyle   (question, date asked)
## Decisions made and why   (append-only, newest first)
## Dead ends (do not repeat)
## Files that matter
```
For a task longer than 3 phases or 30 minutes, also keep `TASK-PLAN.md` (phases as checkboxes; tick each when done; a
resumed session reads it first).

## The packs
| Pack | State (2026-10-05) | Folder |
|---|---|---|
| Lead | The Project Lead's handover (the whole game's state, roles, next actions, decisions) | `lead/` |
| Platform | **Active.** P1–P3 built (PRs #45–#52); P4 next. The local Builder (Sonnet task `game-builder`) works here | `platform/` |
| 1 · The Farm | Summer design (U0) runs now as docs only; Spring polish (S1–S8) waits for platform P8 | `chapter-1/` |
| 2 · The Town | Design tasks ready; opens when the creative lead says | `chapter-2/` |
| 3 · The Province | Dormant until Chapter 1 Autumn is designed | `chapter-3/` |
| 4 · The Kingdom | Dormant until Chapter 2 is designed | `chapter-4/` |
A design task for a later chapter (curriculum notes, outline) may run in a separate session while Chapter 1 builds, if the
5-hour budget allows. It touches only its own pack.

## Chapter hand-off contract (what one chapter passes to the next)
Each chapter ends where its outline says (Chapter 1 ends at Midwinter) and writes a closed record into the player's profile. The next chapter reads only this.
Chapter 1 → 2 (draft; the Chapter 1 builder defines it exactly in the save task, the creative lead approves):
`profile.carry.ch1 = { ending, cash, debts:[{to, amount, rate, callable}], stakes:{mill, bakery}, relations:{maud, crane, ezra, ashby, hobb, jory, tomas}, flags:{vaneFinal, guarantee, hobbExt, ashbyPromise, craneVane, …}, transcript snapshot, statements at Midwinter }`.
A player who lost Chapter 1 still gets a standard carry record (the "canonical heir"), so every chapter can start.
