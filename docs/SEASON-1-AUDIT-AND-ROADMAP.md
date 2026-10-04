# Season 1 audit and roadmap (2026-10-04)

Inputs: the live game at v0.4.4 (code, CHANGELOG, STORY-BIBLE, SEASON-1-REDESIGN); the curriculum in `Agent-System/knowledge/mba` (CORE-COURSE, module READMEs, session lists, LEARNER.md, GAPS.md) and `projects/mba-game` (CURRICULUM-NEEDS, the 2026-10-02 coverage survey, the 2026-10-03 foundations review); Kyle's two iPad playtests.

Tags: [Certain] = read in a file or in the code; [Likely] = inferred; [Guessing] = judgment I can't check from here.

## 0. Weakest assumption

I audited by reading the code and the curriculum, not by playing a fresh season start to finish, and the only player data is one person on one iPad. So "what is boring" below is [Likely], built from Kyle's complaints (nightly Cash question, add/subtract drills, scenes that hang) plus the structure on the page. The curriculum is also still moving: C9 and C10 now have three sessions each, C13 to C16 have none [Certain], so anything I place against an unwritten module is a plan, not a lesson.

What would change my mind: a fresh player's first full run with a timer and a note of where they stop reading. If they sail through the lessons I call too thin, I am over-teaching.

## 1. Verdict

Season 1 now covers the curriculum's accounting spine well, and since the 2026-10-03 foundations review it has gained most of what that review found missing (time value in the Tomas/Ezra comparison, the opportunity-cost floor, expected value and ruin through the frost almanac and Crown caravan problems, overtrading as a gap that scales, deposits) [Certain from `CHANGELOG.md`, `practice.js`, `transcript.js`]. The remaining weakness is not breadth. It is that too many lessons are still "compute the number Maud names", and Kyle said so. The fix this release made (v0.4.4) removes the pure-arithmetic drills and adds decision problems; the audit below says which foundations still need a decision of their own.

## 2. Curriculum audit: foundations against the game

The curriculum's own order of weight is C0 (time value, percentages, break-even algebra, expected value) then C1 (accrual, statements) then C2, C5 and C4 [Certain: prerequisite graph, foundations review §2B].

| Foundation | In Season 1 now | Gap | Priority |
|---|---|---|---|
| Accrual vs cash, three statements as one story | Strong: chapters 4, 5, 9, the Reeve's Court, the cash book | None for Season 1 | none |
| Working capital and overtrading | Corvin's two orders with a "tied up in sacks and invoices" row, the standing orders, Duke case | No days measures (DSO, DIO, DPO, cash cycle). Kyle's recorded gap is overtrading, so use his own cycle in days after the idea lands | medium |
| Time value of money | Tomas discount vs Ezra's rate (flips with the rate), new "nine packets on account vs borrow" and "repay Ezra vs pay Tomas early" problems | No present-value discounting of a future amount [Likely: no "present value" in `story.js`, `practice.js`, `scenes.js`, `game.js`]. C0.01's derivation (100 now or 120 in three years) has no scene | **high** |
| Opportunity cost / the real floor | Present: the floor beyond cost, Grisby, the haggle | Fine for Season 1 | none |
| Expected value and ruin | Frost almanac bet, caravan and ruin problems | Fine; the order bet in Summer reuses it | none |
| Fixed vs variable cost, break-even | A break-even problem and the weekly wage and interest bills | The two cost types are never named, so "contribution per sack" has no label to stick to | **high** |
| Incentives (C7.02, C2.08) | Jory exists in the code | Only partly a lesson; wait for C7 review | low |
| Decision biases (C7.01: sunk cost, anchoring, overconfidence) | Not taught by name, but the story keeps staging them: Tomas's "limited stock", Corvin's framing, Edric's repeated order | Cheap to name inside scenes that already exist | medium |
| Negotiation (C13 is unwritten) | The haggle: open, counter, leverage, walk away | Add BATNA language to the Crane buy-out and Vane's offer; no new scene | medium |
| Ethics (C12.02: legal, ethical and smart as separate axes) | Vane's offer is exactly this | A free fit: one question after the Vane choice, "legal, ethical, smart: pick any two" | medium |
| Statistics and base rates (C3.01) | Rumours from Mira and Barnaby | A rumour-weighing choice (how much do you update on "a grey cloak offered triple") is optional for Season 1 | low |

### Foundations to add to Season 1, in order

1. **Present value from Crane's buy-out.** Crane's day-1 offer is already a "money now vs money later" choice. Turn the epilogue into the lesson: 300 now, against the farm's cash by Midwinter, discounted at Ezra's rate. The player picks the discount rate (what else would 300 earn?) and sees it flip the answer. Source: C0.01, C5.01. This is the one missing idea the curriculum calls "every finance module is this formula in a different coat".
2. **Name fixed and variable cost at wages day.** The first wages day is the moment the fixed bill bites. Maud's line: "wages don't care how many sacks you sold". Then one break-even decision: how many sacks this week cover the fixed bill at the going margin. Source: C2.01, C2.02.
3. **A cash-cycle days bar after the Duke scene.** Show receivable days, inventory days and payable days on the player's own books, only after the "tied up" row has landed. Source: C2.09.
4. **Two naming passes, no new scenes:** sunk cost and anchoring on the existing Tomas and Corvin lines (C7.01); BATNA on Crane's buy-out and Vane's offer (C13 stub, so keep it to a line); and the legal / ethical / smart question after Vane (C12.02).

### Not for Season 1

C9 operations (the mill bottleneck is Summer), C10 strategy, C11 macro, C14 unit economics, C15 AI, C16 capstone. C13 has no sessions. C3, C4, C6, C7, C8 and C12 are drafts that the 2026-10-02 survey says are unreviewed [Certain: C7 and C8 READMEs say "not yet reviewed"]; the game should not lean on their numbers until the strict-professor pass is done.

### Mismatches to settle

- The canon docs say "Corvin Vale" in one place and "Vane" in the game [Certain: `SEASON-1-REDESIGN.md` vs `STORY-BIBLE.md`]. Pick one.
- `CURRICULUM-MAP.md` and `CURRICULUM-NEEDS.md` are stale; the game team should keep its own table current from this file.
- LEARNER.md's recorded gaps (overtrading label, margin vs markup, investing vs financing) are the right test of whether Season 1 worked. The game never checks them in a way a person can see. See the roadmap.

## 3. Lesson design rule from the playtests

Kyle's complaints share one cause: a question whose answer is on screen carries no decision. The rule from now on:

> A lesson question must have two or more defensible answers that cost different amounts, and the numbers must come from the player's own books. If one subtraction answers it, it is a lookup, not a lesson; fold it into a decision or cut it.

Applied in v0.4.4: equity, inventory, receivables, operating income and Crown-fund drills were removed. "Buy nine packets on account or borrow from Ezra" and "repay Ezra or pay Tomas early" were added. The nightly "what will Cash be?" prompt now asks at most every third day and stops after two right answers or two skips.

Still to apply: the closing-statements questions (chapter 9) and some cash-forecast fills are still arithmetic; each should end in a choice ("so which of these three would you cut?").

## 4. Story review

**What works [Certain it exists, Likely it lands]:** one clear question ("a profitable farm, an empty chest"), nine letters in Edric's voice that each answer something just asked, a fair-play mystery (six clues, then the examination), a named villain with a method (callable debt, the Duke's order as the gap he needs), and flags that carry into Summer. The Reeve's Court gives the season a showdown instead of a quiet spreadsheet.

**What risks boring the player [Likely]:**
- **Too much talk per day.** A day can hold a lesson, a visit, a standing order, a practice problem and a bedtime question. The nightly prompt was the worst; the rest still stack.
- **The villain is mostly spoken of.** Vane appears on day 12, day 15, day 24 and in the ending. In between the pressure is in dialogue, not on the map.
- **Lessons and story alternate rather than fuse.** Where the lesson is the plot (the Hobb extension, the Vane choice, the Duke order) it works. Where Maud sets a problem, it stops.
- **Scenes that hang cost more trust than any dull lesson.** The day-22 freeze and the "Fold it away" hang were both silent. v0.4.4 adds a safety valve, but I did not reproduce the day-22 cause [Certain].

**Ideas to keep it exciting, cheapest first:**
1. **Make Vane visible.** A "Vane's ledger" card on the desk lists the notes he has bought (Ashby's guarantee, Hobb's loan, Tomas's contracts), with a count that rises as the days pass. The player sees the net tightening. Cost: one panel and the existing flags.
2. **Callbacks that pay.** Where the player was kind or exact earlier, a character returns the favour at the Court (Hobb pays early, Ashby stands up, Crane brings the second ledger). The flags exist; add three payoffs.
3. **One night scene.** A single stakeout or midnight visit (Crane at the well with the second ledger) breaks the daytime rhythm.
4. **A reversal the player earns.** At the midpoint, if the player forecast the Duke order correctly, Corvin is visibly rattled; if not, the scene turns to dread. Today both players see roughly the same beat.
5. **Cut a modal per day.** Merge the standing order and the practice problem into one Maud "desk question" a day, and let the player skip it without penalty.
6. **A rival with a face.** Grisby already undercuts at Market Day; give him one line of dialogue per week and a tie to Vane's agents.

## 5. Roadmap

### v0.4.x: now (this release and the next)
- Merge the playtest fixes (PR for `claude/playtest-2`), then a fresh iPad playtest of days 20 to 28 specifically.
- Add one automated test that drives the saved game to day 22 and 23 and clicks the map, so the freeze cannot come back unnoticed.
- Convert the remaining arithmetic questions (chapter 9 closing, forecast fills) into choices.

### v0.5: Season 1 foundations
- Foundations 1 to 4 from section 2 (present value from Crane's offer, fixed vs variable at wages day, days bar, three naming passes).
- Vane's ledger card, three callbacks, one night scene.
- A visible "what I learned" screen at the Court's close that lists concepts the player used in play, tied to the transcript, so Kyle can check the LEARNER.md gaps.

### Summer (Act II, The Trading House) [Guessing on the exact scenes; Likely on the courses]
- **Curriculum:** C4 (demand, price, cost and scale), C8 (jobs to be done, segments, positioning), C9 (process map, capacity and queueing, demand forecast: the mill as the bottleneck), C3 (conditional probability, sampling), C6 (leverage, debt capacity).
- **Story:** Vane moves from threat to counterparty. The player has a trading house, not a farm, and Vane's note on Ashby's guarantee comes due in a way the Summer choices can soften or worsen.
- **Mechanics:** a mill with a visible queue; price experiments at Market Day with a sample size that matters; a leverage choice with a covenant the player has read.
- **Gate:** build only from modules that carry a "reviewed" line.

### Autumn and Midwinter [Guessing]
- Autumn: valuation and financing (C5, C6: what the farm is worth to Vane and to the Crown, equity vs enterprise value, the waterfall). Midwinter: strategy and the world (C10, C11, C12), the callable note comes due, and the Grand Audit (C16) replays the Duke order at the scale of the whole valley.

### Process
- **Curriculum asks (in order):** (1) a review pass on C3, C4, C6, C7, C8; (2) C13 negotiation sessions (the game has a haggle with no curriculum behind it); (3) C9 sessions 4 to 10 before Summer is built.
- **Playtest loop:** every release gets one timed fresh-player run and one note of where they stopped reading.
- **Measure:** the transcript already records evidence per concept per day. Report, per release, how many of LEARNER.md's recorded gaps (overtrading, margin vs markup, investing vs financing, deferred revenue) reach "practiced" in a normal run.
