# The code wiki — how the game is built, page by page (schema v1.0, 2026-10-04, creative lead)

Pattern: Andrej Karpathy's "LLM wiki" — the agents keep a linked set of short markdown pages *about* the code, so the next
agent reads two pages instead of the code base. The Agent System's own wiki uses the same pattern (`wiki/SCHEMA.md` there).

## Why
A session fixing one problem in one chapter must find where it sits and how to fix it **without reading the chapter's code**.
It reads: the pack's `MAP.md` (the chapter's index) → one or two pages here → the exact lines the page names.

## Layout
```
docs/wiki/
  README.md          this schema
  INDEX.md           every page, one line each, grouped by pack
  platform/          one page per core system (engine, save, scene player, cutscenes, map, market, transcript, tests/CI)
  ch1/ … ch4/        one page per chapter system, scene group, mechanic or known bug
  chN/LOG.md         how the chapter was built: one line per merged PR, newest last (append-only)
```

## Page types
| Type | One page per | Example |
|---|---|---|
| `system` | a part of the game with its own code | `ch1/court.md` (the Reeve's Court) |
| `lesson` | a lesson or scene group that teaches core ideas | `ch1/lesson-time-value.md` |
| `data` | a season's settings or a data family | `ch1/spring-settings.md` |
| `bug` | a problem found, with symptom → cause → fix → test | `ch1/bug-stuck-scene.md` |
| `decision` | a choice that shaped the build and why | `ch1/decision-court-nine-claims.md` |

## Front-matter (every page; the lint checks it)
```
---
title: The Reeve's Court
type: system            # system | lesson | data | bug | decision
pack: ch1               # platform | ch1 | ch2 | ch3 | ch4
season: spring          # or "all"
files: [chapters/ch1/spring/court.js, chapters/ch1/spring/court.css]                # paths that exist
symbols: [BUILDERS, POOLS, build, hearing]  # names that grep in those files
concepts: [cfs, margin, breakeven]          # transcript concept ids, if any
sessions: [C1.08, C16.01]                   # curriculum sessions taught or tested, if any
tests: [tests/test-court.js, tests/court.html]
links: [ch1/lesson-time-value, platform/transcript]
updated: 2026-10-04
---
```

## Body (keep under ~80 lines; one idea per page)
1. **What it does** — two or three sentences a player would recognise.
2. **Where** — file → function → what it does, as a short table. Line numbers only as hints ("~94").
3. **Data and state** — what it reads and writes (save fields, flags, transcript).
4. **Invariants** — what must stay true, and which test proves it.
5. **How to change it safely** — the usual edits and their traps.
6. **Known issues** — open bugs (link `bug` pages).
7. **History** — the PRs that built or changed it, one line each, newest last.

## Rules (every PR)
- **Ingest.** A PR that adds, moves or changes a system updates its page (or creates one) and adds a line to the pack's
  `LOG.md`. A fix for a non-trivial bug adds a `bug` page. The PR body lists the wiki pages touched.
- **Search first.** Update an existing page; a duplicate page is a defect.
- **Link both ways.** Each page lists ≥ 1 link, and is linked from `INDEX.md` and from its pack's `MAP.md`.
- **Lint.** `node tools/wiki-lint.js` must pass in CI: front-matter complete; every `files` path exists; every `symbols`
  name greps in those files; every link resolves; every source file in a pack's folder is named by at least one page.
  A rename that breaks a page fails the PR, so the wiki cannot drift silently.
- **Facts only.** Plans live in work orders, not here. Write what the code does today.
