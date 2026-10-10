---
title: Chapter 1 build log
type: decision
pack: ch1
season: all
files: [CHANGELOG.md]
symbols: []
concepts: []
sessions: []
tests: []
links: [ch1/court, ch1/bug-stuck-scene]
updated: 2026-10-04
---

How Chapter 1 was built, one line per merged PR or release, newest last. Append-only. Detail lives in `CHANGELOG.md`.

- 2026-10-01: Story campaign "The Uncle's Ledger": 9 chapters, Show → Try → Use → Keep, Maud as mentor.
- 2026-10-02: iPad support, never-stuck menu, guided lookup (PR #17, #26; tag v0.3.2-beta).
- 2026-10-03: v0.4 integration (PR #32): sound and music (#27), cast, scenes and letters (#28), practice (#29), Market Day (#30), the four-week spine with Vane, Crane's offer, endings and case board (#31).
- 2026-10-03/04: Reeve's Court (T4), story critic fixes (T3b), creative calls 1–5, practice as play and standing orders (T5), frost bet, real floor, Grisby (T6/T6b), editor pass and day loop, the 74-second opening (PRs #33–#39; went live without a creative review; v0.4.2).
- 2026-10-04: Playtest-2 fixes, fixed-vs-variable and present-value lessons, practice tiers, review fixes; Court 9 claims / pass 6 (PR #41, v0.4.6-beta).
- P6b (local/work): the story's nine chapters and its lesson scenes became records in `chapters/ch1/spring/lessons.js`; `story.js` keeps hooks, formulas and verbs. 90 scene traces match the code before the port. No player-visible change.
- P3 (`platform/restructure`): files moved into `core/` and `chapters/ch1/spring/`; the golden bot seasons and the golden story run match byte for byte. No player-visible change.
- B1 (local/work): the cost lesson no longer skips when the market margin is 2 or less. `cutBy = min(2, m - 1)`; with a margin under 2 the lesson uses the next day with margin 2 or more. `tests/test-b1.js` covers seeds 0-199; seed=3 unpinned in lessons-s1.html and stale-scene.html.
