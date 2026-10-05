---
title: Lessons, story chapters 1-3 (the writ, first seed, the bakery)
type: lesson
pack: ch1
season: spring
files: [story.js, transcript.js]
symbols: [ch1, ch2, ch3, nameFarm, keep, mastered, page, pin, TITLES, WEEKS, weekCard, after, onTalk, GOALS, CONCEPTS]
concepts: [equation, inventory, gross, margin]
sessions: [C1.01, C1.04, C0.02]
tests: [tests/lessons-s1.html, tests/smoke-story.html, tests/test-editor.js]
links: [ch1/lessons-week2, ch1/lessons-weeks3-4, ch1/spring-settings]
updated: 2026-10-05
---

## What it does
The first three lessons of the story. Crane walks the player round the farm and the player tags what it owns (chapter 1).
Tomas sells the first seed (chapter 3 in `TITLES`). Ashby buys a first sale and the player haggles (chapter 2 in `TITLES`).
Each lesson runs Show, Try, Use, Keep: Maud shows, the player does, the notebook keeps it.

## Where
Function names follow the order the code runs, not the numbers in the comments. See Known issues.

| File · symbol | What |
|---|---|
| `story.js` · `ch1` (~122) | The bailiff. `V.tag` builds the balance sheet. One More/Less choice. Names the farm (`nameFarm`). First `craneOffer({first:true})`. Ends at stage `harvest2`. |
| `story.js` · `after("harvest")` | When the last ripe plot is in, Maud sends the player to Ashby and Edric's first page (`page(0)`). Stage `ashby3`. |
| `story.js` · `ch3` (~185) | The bakery. Margin worked at 7, the player types margin at 6, the cost floor becomes the red walk-away line in `GL.haggle`. Stage `ship3`. |
| `story.js` · `after("deliver")` | Ashby's sale: Revenue, Cost of goods sold, gross profit, all in Cash. Points to Tomas. |
| `story.js` · `ch2` (~172) | First seed. Tomas sells 3 packets, then 6. Cash becomes Inventory. Stage `plant2`. |
| `story.js` · `onTalk(who)` | Maps stage to scene: `tomas2: ch2`, `ashby3: ch3`. |
| `story.js` · `keep`, `mastered`, `pin` | `keep` writes the notebook and pins a clue. `mastered` sends evidence to the transcript, unless a hint walked the player. |
| `transcript.js` · `CONCEPTS` | Concept ids and names, by course. |

## Data and state
- Story state `st` (`Story.state`): `ch`, `stage`, `notebook`, `pages`, `clues`, `farm`. Saved with the game.
- Flow of stages: `intro` > `harvest2` > `ashby3` > `ship3` > `tomas2` > `plant2` > `hobb4`.
- Concepts: `equation` (mastered if the player says "less" right), `inventory`, `gross` and `margin` (mastered on the typed margin).
- Case-board clues: one card per `keep`, each at most 12 words.
- Sessions in the file header: C1.01 (equation), C1.04 (cost becomes inventory), C0.02 (margin).

## Invariants
- House rule (no test): scene text takes its numbers from `S.R` or the opening balance sheet.
- Maud speaks 2 sentences a box. No scene runs more than 4 boxes without a choice (`tests/test-editor.js`, `smoke-story.html`).
- Sales and purchases post through the engine, so Assets = Liabilities + Equity holds (`tests/test-spine.js`, run through the engine).

## How to change it safely
- Change a stage name in four places: `GOALS`, `to(...)`, `onTalk` and `after`. A missed one strands the story.
- Keep Maud to 2 sentences a box. Keep Crane's "Item:" rare.
- Writes through `G.act(...)`, never straight to the books.

## Known issues
- The comment labels and the function names disagree. `ch2` is headed "chapter 3: first seed". `ch3` is headed "chapter 2: the bakery". `TITLES` lists the bakery as 2 and first seed as 3. The player meets the bakery first.
- `C0.02` is a loose tag. It does not teach markup (curriculum audit, `docs/curriculum-foundation-2026-10-03.md` line ~145).

## History
- 2026-10-01: nine-chapter story (`ch1/LOG`).
- WS3: typed sums replaced by the `tag` verb and one bet per lesson.
- WS6: farm naming and Crane's day-1 offer added to `ch1`.
