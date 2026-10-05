---
title: The game shell (game.js)
type: system
pack: platform
season: all
files: [game.js]
symbols: [dlg, sayP, ask, haggle, numberPad, pinPage, addSignButtons, initTouch, fit, desk, sleepNow, doSleep, morningBark, night, closeBooks, review, pauseMenu, stall, hud, moodNow, drainUses, showPanel, hidePanel, act]
concepts: []
sessions: []
tests: [tests/ipad-touch.js, tests/day-loop.js, tests/ipad.html, tests/ipad-polish.html, tests/never-stuck.html, tests/smoke-story.html, tests/stability.html]
links: [platform/save, platform/engine, platform/books, platform/verbs, ch1/court]
updated: 2026-10-05
---

## What it does
`game.js` is the playable world: map, walking, dialogue, menus, the Desk, the day loop and the close of the books. It is one IIFE of about 950 lines and exposes `window.G`, the API that `story.js`, `verbs.js`, `market.js` and the tests use. Engine and books logic stays in `engine.js` and `books.js`.

## Where
| File · symbol | What |
|---|---|
| `game.js` · `dlg(o)` | The one dialogue box. Takes `{who, text, choices, input, spot}`, returns a Promise `{i, v}`. Types text with `FX.type`. |
| `game.js` · `sayP`, `say` | `sayP` is the Promise form used by the story. `say` is the menu form (choices as `[label, fn]`) for the sandbox. |
| `game.js` · `ask(who, text, answer, hints, ...)` | A typed-number question. Hints, "walk me through", skip. Sets `window.__walked` and `window.__want`. |
| `game.js` · `haggle(o, cfg)` | The sale negotiation scene. |
| `game.js` · `numberPad(d)` | On-screen pad: digits, minus, backspace, Check. On touch the input is read-only. |
| `game.js` · `pinPage` | On touch, scrolls the page back to the top when iOS moves it. Skipped while another real input has focus. |
| `game.js` · `addSignButtons(root)` | Minus-sign buttons for forecast cells, since the iPad pad has none. |
| `game.js` · `initTouch`, `fit` | Touch setup (tap to walk; `?pad=1` adds a d-pad) and view sizing. |
| `game.js` · `desk()` | The Desk menu: sleep, ledger, forecast, plan, notebook, transcript, letters, plus `Story.deskItems()`. |
| `game.js` · `sleepNow`, `doSleep` | `doSleep` calls `Spring.sleep` via `act`, builds the day-end card, resets the player, calls `save()`, then runs `morning`. |
| `game.js` · `night(title, notes, then, info)` | The overnight card; tap to dismiss. |
| `game.js` · `morningBark` | Maud's morning line; hides after 9 seconds. |
| `game.js` · `closeBooks()` | See below. |
| `game.js` · `review()` | Ezra's closing questions; deletes the save at the end. |
| `game.js` · `pauseMenu()` | Resume, restart today, save and quit, watch the opening, music and sound switches, copy feedback, report and skip. |
| `game.js` · `stall` (a `setInterval`) | The stall valve; see below. |
| `game.js` · `hud`, `moodNow` | HUD paint; `moodNow` picks the music mood each 900 ms. |
| `game.js` · `drainUses` | Feeds `s.uses` (engine concept uses) into `Transcript.use`. |

## The day loop
Morning: `doSleep` finishes the night, `save()` writes, `morningBark` and `story("morning")` run. Day: walk, farm (`Spring.act`), talk, trade. Night: `sleepNow` then `doSleep`. When `s.over`, `doSleep` calls `closeBooks`.

## closeBooks
Runs `Books.close` and `Books.highlight`, marks `statements` and `cfs` used, shows the three statements and the cash flow, and (story games) walks Maud's guided close through `Story.close`. It then shows `midwinter()` and Ezra's button, calls `save()`, and in story games runs `Court.run`. Insolvent seasons show the post-mortem and "Try spring again".

## Stall valve
Every second, if the story is busy but no dialogue, panel, pause menu, ending card, week card, Court, market or intro is on screen, a counter rises. At 4 seconds it shows a toast. At 7 seconds it calls `Story.unstick()`.

## Invariants
- Engine actions go through `act`, so Cash changes float on the HUD and the transcript is fed.
- On touch, no focused input may shift the page; `tests/ipad-touch.js` checks this.
- `tests/never-stuck.html` proves "Report and skip" resolves a question and writes a bug report.

## How to change it safely
- A new Desk item: add the label and the matching function in the same position in `desk()`'s two arrays.
- A new `window.G` member is part of the story API; add it once, keep the name.
- Never read `localStorage` directly for new stores; see [save](save.md).

## Known issues
- `game.js` mixes drawing, dialogue and flow in one closure. P-series tasks plan to split it.
- Many test hooks live on `window` (`__walked`, `__want`, `__tries`, `__pick`).
