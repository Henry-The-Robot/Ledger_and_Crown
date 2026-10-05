---
title: Spring's cutscenes (S5)
type: system
pack: ch1
season: spring
files: [chapters/ch1/spring/cutscenes/index.js, chapters/ch1/spring/cutscenes/vane-arrives.js, chapters/ch1/spring/cutscenes/only-my-name.js, chapters/ch1/spring/cutscenes/pigs-night.js, chapters/ch1/spring/cutscenes/market-open.js, chapters/ch1/spring/cutscenes/crane-seal.js, chapters/ch1/spring/cutscenes/spring-opening.js, chapters/ch1/spring/story.js, core/market.js, core/cutscene.js]
symbols: [LIST, cut, maybe, wanted]
concepts: []
sessions: []
tests: [tests/test-cutscenes-spring.js, tests/test-cutscene.js]
links: [platform/cutscene, ch1/lessons-as-data, ch1/village-scenes, ch1/market-day]
updated: 2026-10-05
---

## What it does
Eight data cutscenes (`core/cutscene.js` plays them). Each is layers, cues and lines: no draw code. All are skippable and recorded in the journal (`lc_cutscenes_v1`).
| Id | Length | Plays |
|---|---|---|
| `vane-arrives` | 18 s | Day 12 morning, after Corvin Vane arrives, before the steward's scene (`story.js` `cut`). |
| `only-my-name` | 20 s | Before Ashby's guarantee scene (`scenes.js` `cutscene`, played by `game.js` `runScene`). |
| `pigs-night` | 16 s | The morning after the pigs' night (`S.eventDay(s, "pigs") + 1`). Neutral: the Ledger note says whether the fence held. |
| `market-open-1/2/3` | 8 s each | Market Day opens, days 7, 14, 21 (`core/market.js` `open`). Tomas, Grisby, then Grisby's thin shelves. |
| `crane-seal` | 19 s | Before Crane's seal scene (day 23+). |
| `spring-opening` | 7.5 s | Re-entry from the main menu. The trigger is P14; today nothing plays it. |

## Where
| File · symbol | Job |
|---|---|
| `chapters/ch1/spring/cutscenes/*.js` | One file per cutscene (`market-open.js` holds the three weeks). |
| `chapters/ch1/spring/cutscenes/index.js` · `LIST` | The stable ids and where each plays. |
| `chapters/ch1/spring/story.js` · `cut(id)` | `Cutscene.maybe`: plays if wanted, else answers null. |
| `core/cutscene.js` · `wanted`, `maybe` | Skipped for `?fast`, `?sandbox`, `?cuts=0`. |

## Invariants
`tests/test-cutscenes-spring.js`: valid data, ids stable, at most 25 s (opening 8 s), lines at most two sentences and 21 characters a second, speakers from the story bible, Crane's "Item:" a tic, every cutscene named by the code that plays it.

## How to change it safely
- A new cutscene: copy a file, add it to `index.js` and `game.html`, name its trigger, run the test.
- The art is simple shapes. A prop-quality pass belongs with S4 (living valley).

## Known issues
- Not watched in a browser here (no Playwright): timing and look are unchecked. The sprite paths `people.ashby.down.0` and `people.crane.down.0` draw nothing if `Art` names them differently.
