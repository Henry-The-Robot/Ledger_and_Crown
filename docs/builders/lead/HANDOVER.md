# HANDOVER — mba-game (Ledger & Crown) — updated 2026-10-27 PT by the local Lead (Opus, `lead:mba-game`)

> The Project Lead's only handover. The Lead is a persistent local Opus session in `C:\Users\Kylev\Agent System`; it edits
> the game in `projects/mba-game/repo` (branch `local/work`). `infra/git_sync_game.py` commits, pushes and keeps one PR
> open (every 30 min). Never git commit or push by hand. On 10-27 the auto-mode classifier denied a manual
> `git_sync_game.py` run; wait for the scheduled sync.

## START HERE (every session)
0. A fresh Lead session starts from the "MBA game Lead" block in `infra/RESTART-MESSAGES.md`.
1. `python infra/help.py list --to lead:mba-game --open` first, and again before you stop.
2. `python infra/plan_cards.py show mba-game` and `gh pr list -R Henry-The-Robot/Ledger_and_Crown --state open`.
3. Kyle's rule (10-06): no cron. Act when Kyle writes or a blocking ask waits.

## State in one paragraph
**Live: v0.4.11** (https://henry-the-robot.github.io/Ledger_and_Crown/), Spring complete. Full builds are paused (Kyle
10-17); Summer's 24 cards are parked. Season one becomes a 20-30 minute **study slice** with a reading control arm.
**Decided 10-27 (Kyle):** anchor = **CLEP Financial Accounting**; keep the accounting spine + a 90-second story frame;
experts review after the slice is built, before any participant. Study kit MBA-ST1-3, ST5-10 is built (in PR #59).
**PR #59** (local/work, CI green) is NOT mergeable: reviewer items 2-7 are open (card MBA-FX1). Item 1 (unapproved
study kit) is cleared by the D3 decision. **Voice:** only the narrator's 11 opening lines exist (ElevenLabs voice
"Daniel"). On 10-27 the Lead made it default-on (`core/game.js:143-144`, `?vo=0` = off) — in local/work, so the live
site gets it when #59 merges. Kyle: we pay for ElevenLabs and do not use it → voice the study-slice cast.

## Next 3 actions
1. When the Builder pushes MBA-FX1, read the diff. Confirm CI is green. The Lead edited `tests/voice-opening.html`;
   CI has not run it yet. The reviewer's next pass must list no CRITICAL or MAJOR. Then merge #59.
2. Review MBA-ST4 (study scenes, CLEP concept list in `STUDY-SLICE-2026-10.md` section 4). Then review MBA-VO1.
   Then cast with Kyle: 3 takes each for Maud and Crane; Kyle picks. Generate every line in
   `assets/voice/LINES-study.json`. Estimate credits first (about 60-100 a line).
3. After the slice: line up one accounting instructor + one learning-science reviewer (Kyle sends the outreach;
   draft it via the coordinator). Card MBA-IP1 (Kyle's sketches) gates any release beyond beta.

## Card order (Builder)
MBA-FX1 → MBA-ST4 → MBA-VO1. T1, S7 are accepted; MBA-IP1 is interactive (Kyle).

## Session 10-27
- Answered all 14 open help requests.
- S7 ruling: accepted and reviewed. CI runs `tests/ipad-fill.html` on every push. QC reopened it 7 times for
  screenshots. The coordinator is asked to make the audit skip Lead-reviewed cards.
- Screen-out line set: 60 percent (STUDY-SLICE section 5).
- PLAN.json: MBA-ST4 ready; new MBA-FX1, MBA-IP1, MBA-VO1. AUTHORSHIP.md: two Kyle entries.

## Blockers
- None on Kyle now. Merge waits on MBA-FX1.
- No local browser test runner (Playwright missing; the browser pane cannot serve the game's iframes from file://).
  CI's Chromium is the proof; Kyle's iPad is the final check for sound.

## Failure lesson (10-10 → 10-27)
- What cost most: no Lead session for 17 days. 14 asks aged, one decision (D3) blocked a PR for 5 review rounds,
  and QC reopened S7 seven times with nobody to rule. Rule: when a PR's blocker is a decision, the Lead asks Kyle the
  same day; when a card loops in QC twice, the Lead rules on it.
- 10-10 Next action "ask Kyle whether the voice goes game-wide" was never done, so the paid voice sat unused. Rule:
  a question for Kyle goes in AskUserQuestion that session, not into "next actions".

## Decisions made and why (newest first)
- 10-27 Kyle: voice the study-slice cast (narrator, Maud, Crane), not all of Spring; narrator default-on.
- 10-27 Kyle: anchor CLEP Financial Accounting (fits the Court and spine; public outline and items; credit-bearing).
- 10-27 Lead: screen-out 60 percent; S7 accepted on CI evidence.
- 10-17 Kyle: full builds paused; season one is the first controlled study.
- 10-10 Kyle: narrator voice yes, ElevenLabs sfx no.
- Older: `docs/builders/lead/HANDOVER-HISTORY.md`.

## Dead ends (do not repeat)
- `send_message` across sessions does not wake the other agent. Use `infra/help.py`.
- `git_sync_game.py` skips the rebase when the tree is dirty: run it twice to pull master in.
- `gh pr checks <branch>` fails; use the PR number.
- ElevenLabs sfx `duration` is not settable from the prompt; signed download links expire in 2 h.
- `new Audio()` started by a timer on iPad Safari: silent. Use decoded WebAudio buffers via `FX.ctx()`.

## Files that matter
- Agent System: `projects/mba-game/PLAN.json` · `STUDY-SLICE-2026-10.md` · `STUDY-VERSION-PLAN.md` · `AUTHORSHIP.md` ·
  `REVIEW-QUEUE.md` · `NEXT.md` · `KICKOFF-BUILDER.md` · `tools/check.py`.
- Game repo: `core/study/*` · `core/game.js` (opening voice) · `core/cutscene.js` (voice playback) · `assets/voice/intro/`.
- ElevenLabs: connector `94648465…` (creative_* tools), flow XOFEZioDAK1mj34PHBB4 (all takes).
