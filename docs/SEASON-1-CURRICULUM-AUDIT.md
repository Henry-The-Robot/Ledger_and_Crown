# Season 1 curriculum audit: is Spring a foundation for the MBA? (2026-10-04)

Goal set by Kyle: Season 1 is a perfect foundation. It must stick fast. Summer must be able to build harder ideas on it.

Method: I read what the code teaches (`story.js`, `practice.js`, `market.js`, `court.js`, `transcript.js`, `engine.js`), the curriculum map (`Agent-System/knowledge/mba`), the 2026-10-03 foundations review, and Kyle's playtest feedback. I did not play a fresh run. Tags: [Certain] read in a file. [Likely] inferred. [Guessing] judgment.

This file builds on `SEASON-1-AUDIT-AND-ROADMAP.md`. It goes deeper on three questions: what is taught, what is missing, what is too much.

## 1. Weakest assumption

I assume Summer needs the foundations the curriculum names (time value, cost behaviour, working capital, expected value, claims). That comes from the curriculum's prerequisite graph [Certain]. But Summer's scenes are not designed yet, so "needed by Summer" is [Likely], not tested. What would change my mind: a Summer scene list that uses none of the ideas in section 4.

## 2. What Season 1 teaches today

The game tracks 25 named concepts in the transcript [Certain: `CONCEPTS` in `transcript.js`]. Other ideas appear in the story with no concept entry: guarantee, contingent liability, callable debt, covenant, factoring. That is about 30 ideas in 28 game days.

| Idea | How it is taught | Tested again later? | Verdict |
|---|---|---|---|
| Accounting equation, negative equity | Chapter 1, Crane's list | Court claim; no practice problem now | Strong. Keep. |
| Accrual vs cash, receivables | Chapters 4 and 5, Hobb extension, cash book | Court; practice "payday", "deposit" | Strong. Keep. |
| Unearned revenue (deposits) | Deposit scene | Practice "deposit" | Good. It fixes Kyle's "accounts owed" slip. |
| Inventory at cost, gross margin, markup | Chapters 2 and 3, haggle | Practice "gross", "markup"; Court | Strong. Keep. |
| Opportunity cost (the real floor) | Chapter 3 follow-up, Grisby, Market Day | Practice "opportunity" | Good. |
| Time value of money | Chapter 6 and the week-3 repeat: Tomas's 2% against Ezra's rate. The answer flips with the rate. | Practice "tvmflip", "fund9", "repay100" | Half. It teaches the cost of waiting. It never discounts a future amount. |
| Interest | Chapter 7 | Practice "interest" | Good. |
| Working capital, overtrading | Chapter 5 forecast, Corvin's two orders, "tied up" row | Practice "scaling", "payday" | Half. No days measure. The Court does not test the scaling idea. |
| Expected value and ruin | Frost almanac bet | Practice "ev", "ruin" | Good. |
| Break-even | Market Day and one practice problem | Practice "breakeven" | Weak. Fixed and variable cost are never named. |
| Three statements, indirect cash flow | Chapter 9, the Court | Court | Strong. This is the capstone. |
| Depreciation | Sprinkler purchase, one practice problem | Practice "depreciation" | Thin. Not a scene. Low risk. |
| Current ratio | One question in the books | Practice "ratio" | Thin. See section 5. |
| Demand, segments, rival pricing | Market Day | None | Preview of C4 and C8. Not tested. |
| Guarantee, callable debt, covenant | Story scenes (Ashby, Vane) | Court claim on the guarantee | Strong as story. Named, not drilled. |
| Factoring | Rescue option, income-statement line | None | Preview only. |

## 3. What the data says about "sticking"

Four findings, each from the code.

1. **Mastery cannot happen in one sitting.** A concept reaches "mastered" only with evidence on 3 game days, one correct explanation, and two different real calendar dates [Certain: `level()` in `transcript.js`, `real >= 2`]. A player who finishes the season in one evening ends with every idea at "practiced" or lower. Summer cannot use "mastered" as a gate.
2. **The final exam does not test four foundations.** The Court's eight claims cover profit vs cash, receivables, assets, gross margin, timing, the guarantee, the rate, and margin vs markup [Certain: `court.js`]. It does not test time value, expected value, break-even, or opportunity cost. The player can pass and still hold none of them.
3. **Spaced retrieval is good but arithmetic-heavy.** The daily practice bank now holds decisions, not sums (v0.4.4). Equity and receivables lost their practice problems when I removed the lookups. They now appear only in story scenes and the Court.
4. **Too many ideas per hour.** About 30 ideas in a 3 to 4 hour season is roughly 7 or 8 per hour. [Guessing] A learner holds a handful of new ideas well in one sitting. Kyle's own complaints (repeated drills, nightly prompts) point the same way.

## 4. What is missing, ranked by what Summer needs

Summer's courses are C4, C8, C9, C3, C6 [Likely]. Their prerequisites are in the curriculum map [Certain]. The table links each missing idea to the Summer course that needs it.

| # | Missing idea | Summer needs it for | Fix inside the story |
|---|---|---|---|
| 1 | **Present value (discounting a future sum).** Source: C0.01, C5.01. | C6 (capital structure, cost of capital), C5 recap | Crane's day-1 buy-out. The player compares 300 now with the farm's cash at Midwinter. They set the discount rate. The answer flips. |
| 2 | **Fixed vs variable cost and contribution per unit.** Source: C2.01 to C2.03. | C4.03 (scale), C9 (capacity), C2 recap | Wages day. Maud: "Wages do not care how many sacks you sold." One decision: how many sacks cover this week's wages at the going margin. |
| 3 | **Cash-cycle days (receivable, inventory, payable days).** Source: C2.09. | C9 (inventory), C14 | After the Duke scene. Show the three day counts on the player's own books. |
| 4 | **Claims and priority (who gets paid first).** Source: `three-statements-one-story`, C6.04. | C6 (waterfall, EV vs equity) | The Court's guarantee claim already starts this. Add one decision: Ezra, Crane and the Crown each want paying. Who first, and why. |
| 5 | **Decision biases named in the scenes** (sunk cost, anchoring). Source: C7.01. | C7, C3 | Name them in lines that already exist: Tomas's "limited stock", Corvin's framing. |
| 6 | **A BATNA line** on the Crane and Vane offers. C13 has no sessions yet. | C13 later | One line only. Do not build a scene. |

Ideas 1 and 2 are the two foundations the curriculum calls central [Certain: foundations review §3]. They are also the two I could not find in the code [Certain: no "present value", "fixed cost", "variable" or "contribution" in user-facing text].

## 5. What is too much (trim or demote)

I would not delete any of these. I would stop testing them in Season 1.

- **Market Day concepts (demand, segments, rival pricing).** Keep the play. Do not count them as Season 1 outcomes. They are previews of C4 and C8, and Summer will teach them properly. Today they sit in the 25-concept list and dilute it.
- **Factoring, current ratio, depreciation as drills.** Keep them as story events and as lines on the statements. Remove them from the daily practice rotation until Summer. They crowd out the foundations in section 4.
- **Standing orders, the nightly question, the daily problem.** Three daily prompts compete for one attention. Merge them into one "Maud's desk question" per day, skippable. v0.4.4 already throttles the nightly one.
- **Unbuilt mechanics in the redesign** (flax crops, restoration board, hearts, Jory's arc). The redesign lists them [Certain], and the code has no flax or restoration board. Do not build them for the teaching. Build them only if the story needs them.

## 6. Recommendation

One plan: **define a Season 1 core of 8 ideas, and make the season prove each one.**

The core:
1. Claims: assets, liabilities, equity (including the guarantee as an off-book claim).
2. Profit is not cash: accrual, receivables, unearned revenue.
3. Margin vs markup.
4. Fixed vs variable cost and break-even. **(add)**
5. Opportunity cost.
6. Time value: the cost of waiting and present value. **(finish)**
7. Working capital: overtrading, and the cash cycle in days. **(finish)**
8. Expected value and ruin.

Plus one capstone: the three statements. Everything else in section 2 is a preview.

To make the season prove it:
- Make the Court test all 8 (add claims on time value, break-even, opportunity cost, and expected value; swap out the weakest of the existing eight).
- Show the player a "what I used" screen at the end: which core idea they used well, which they walked through. Do not wait for real-date mastery.
- Tag every core idea in the transcript as `core` and every preview as `preview`. Summer reads those tags.

### Why this order and not another
Ideas 1 to 3 are done and strong. Ideas 4 and 6 are the ones Summer's C4, C6 and C9 depend on most, and both fit scenes that exist (wages day, Crane's offer). Idea 7 needs the days bar, a smaller build. Doing 4 and 6 first gives the most Summer value for the least new code.

## 7. How Summer builds on it

| Season 1 idea | Summer idea it carries |
|---|---|
| Fixed vs variable, break-even | Scale and capacity: the mill as a bottleneck (C4.03, C9) |
| Opportunity cost, the real floor | Pricing and price discrimination (C4) |
| Time value, present value | Capital structure and the cost of debt (C6) |
| Claims and the guarantee | The waterfall and EV vs equity value (C6.04) |
| Overtrading, cash cycle | Inventory and demand forecasting (C9) |
| Expected value and ruin | Decision trees and the value of information (C3) |
| Market Day previews | Demand, segments, positioning (C4, C8) |

## 8. Open questions for the curriculum owner

1. Is `real >= 2` (two real dates) meant to gate "mastered" for a game played in one sitting? I would drop it for in-game credit and keep it for the transcript.
2. C13 has no sessions. The game has a haggle with no curriculum under it. Which session should it map to?
3. C3, C4, C6, C7, C8, C12 are unreviewed drafts [Certain]. Summer should not use their numbers until they have the strict-professor pass.

## 9. Status (v0.4.5)

Built from this audit: the fixed-vs-variable lesson (wages day), the present-value lesson (week 3), four new Court claims, the core tag, and the close screen. Not built yet: the cash-cycle days bar, the claims-priority decision, the naming passes (sunk cost, anchoring, BATNA, legal/ethical/smart), and dropping `real >= 2` from in-game mastery.
