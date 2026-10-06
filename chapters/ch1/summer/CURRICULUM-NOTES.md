# Summer curriculum notes (card U0a, 2026-10-04, game-builder)

Scope: the 16 sessions with `home` = `1SU` in `docs/curriculum-coverage.json`.
Source: `knowledge/mba/modules/<module>/sessions/NN-*.md` and `answers/NN.md`. Every formula below was checked by hand or by script.
Status words: **reviewed** = a REVIEW-LOG covers it. **grounded** = tied to named lecture lines. **generic** = textbook prose with no line-level source. **not written** = file missing.
The "Do" column is the player action that teaches the idea. The idea is the mechanic: a player who ignores the idea must lose something.

## Read this first: errors that block a build
These errors are in the session files. Do not build on them until the curriculum teacher fixes them.

| Session | Error | Correct value |
|---|---|---|
| C4.01 | "Real decision" box: E = -0.5 and a 101% price rise cut volume by 5%. | E = -0.5 gives about -50% volume, not -5%. E = -2 gives -202%, which is impossible, so a linear estimate fails for a 101% rise. |
| C4.01 | The coffee case calls E = -0.53 "the elasticity" and then raises price to $3. | E changes along the line. At $3, E = 160 x 3 / 440 = -1.09 (elastic). Revenue peaks at $2.875 (about $1,322). |
| C4.01 | Calls the percent-from-base method "arc" elasticity. | Arc elasticity uses the midpoint. Name it "simple percent change". |
| C4.02 answers | Worked exercise keeps a 60% margin at the new $65 price. | Variable cost stays $20, so margin at $65 is 45/65 = 69%. Profit is higher than the answer shows. |
| C4.03 | Expansion break-even "61,800 units" (50,000 + 200,000/17). | The $8 cost applies to every unit. Expansion matches today's profit of $250,000 when 17V - 700,000 = 250,000, so V = **55,882**. |
| C4.03 answers | Year-3 total "profit $1,000,000 - $510,000 = $490,000". | At $210 year 3 is exactly break-even. Three-year result = **-$510,000**. |
| C4.03 answers | Equipment payback 3.3 years (net of depreciation). | Payback = 1,000,000 / 400,000 = **2.5 years**. Depreciation is not a cash cost. |
| C4.03 quiz 3 | Coffee break-even needs a price the question never gives. | Answer assumes $5. Add the price to the question. |
| C1.06 | Straight-line discount amortization. | Fine for a first lesson. GAAP uses the effective-interest method (straight-line only if immaterial). Say so in one line. |
| C2.03 | Source link points at a margin-of-safety page, not the constrained-resource page. | Fix the URL. The maths is right. |
| C7.01 | Interview-order example is called "anchoring". | It is a contrast effect. Anchoring needs a number. Also quiz 3 has no clear arithmetic. |
| C8.01-03 | Dated claims: "Slack in 2011", "Jobs segmented Apple in 1997". | Slack launched 2013-14. The Apple segmentation table is the writer's own story. Needs a source or removal. |
| C8.02, C12.02, C12.09, C14.06, C16.11, C16.12 | Kyle's own ventures ("V1", "V10", HVAC client) are in the text. | Never copy into player text. Re-skin to the valley. |

Checked and correct: C0.07 Costco numbers; C1.06 ($54,000 expense, $964,000 carrying value; premium case $26,000 and $516,000); C2.03 ($100 vs $150 per hour; movers $100 vs $75); C3.09 (6.8% vs 15.1%, 25 vs 55 days, 0.16%, 1.6%, 1.64x, Brier 0.18/0.15/0.14); C14.06 table and two-stage rule (7.4%, 77.1%, 98.3%, 12.1%); C16.11 ($1,100 range, $630 + $620 = $1,250); C16.12 (5.95/6.65/7.25 and 6.80/6.40/7.35; floor $1,300); C12.09 ($15,000; $450 > $390; $1.1 billion).

## Session table

| Id | Objective (one line) | Formula, checked once | Common mistake | Do in a scene | Status |
|---|---|---|---|---|---|
| C0.07 | Prepare a case in 90 minutes with a repeatable process. | Fee revenue $2,853M, +8% (base needed). Six steps: skim 5, read 20, exhibits 25-35, position 10, steelman 10, sheet 5-10. | A position with no number. | Fill a one-page prep card (decision, call, top 2 numbers, counter, what changes my mind) before a Court scene. | reviewed |
| C1.06 | Interest expense differs from cash coupon; leases sit on the balance sheet. | Expense = coupon + discount/years = 50,000 + 4,000 = 54,000. Carrying value 960,000 -> 964,000. Premium: 30,000 - 4,000 = 26,000. | Expense always equals coupon. | Borrow against a discount note to buy a cart; the books show cost above the cash paid. | reviewed |
| C2.03 | Rank jobs by margin per scarce unit. | Tune-up 100/1h = 100; install 1,200/8h = 150. Movers: 500/5 = 100 vs 1,350/18 = 75. | Ranking by margin percent. | Full calendar; pick which orders to fill. The percent-best order must lose in one week and win in another. | reviewed |
| C3.09 | Spot anchoring, base-rate neglect, overconfidence, planning fallacy. | Small sample: P(>60% boys) 15.1% vs 6.8%. 10 hits of 90% interval: P(<=5) = 0.16%. Overrun 55.5/33.9 = 1.64. Brier mean of (p-o)^2. | Narrow "90%" ranges. | Write 90% ranges for a delivery; score the hits at season end. | grounded (arithmetic checked; study figures tagged [Likely], not opened) |
| C4.01 | Demand slope and price elasticity. | Q = 920 - 160P from (2, 600), (2.5, 520). E = %dQ/%dP. | Slope is not elasticity. | Set a stall price over several days; read the sales. | generic (errors above) |
| C4.02 | Use elasticity to choose a price; test before betting. | Test A: -10%/+12.5% = -0.8. Test B: +12%/-12.5% = -0.96. | Estimating from one noisy week. | Run a split price test on two stalls; decide with a margin of doubt. | generic (error above) |
| C4.03 | Unit cost falls with volume (fixed-cost spreading). | (500,000 + 10 x 50,000)/50,000 = $20. After: (700,000 + 8 x 100,000)/100,000 = $15. | Treating all cost as variable. | Buy a bigger mill wing; unit cost falls only if sales follow. | generic (errors above) |
| C7.01 | Name five biases: attribution, anchoring, overconfidence, sunk cost, groupthink. | None. Cost examples are invented. | Awareness equals immunity. | Replace a failing hand with a new one; the sunk-cost "we paid already" choice must tempt. | generic (trust G, no line source; error above) |
| C8.01 | A job is the progress a customer wants. | None. | Selling the feature, not the job. | Ask a villager "why" to find the real job before stocking goods. | generic |
| C8.02 | Pick one segment that is large, distinct, reachable. | None. | Targeting everyone. | Choose which villagers to serve first; a wrong pick wastes stock. | generic |
| C8.03 | One distinctive claim in the customer's mind. | None. | A claim you cannot defend. | Pick one sign for the stall; the choice must change who comes. | generic |
| C12.02 | Legal, ethical and smart are three tests. | None. Equifax: stock fell about 14%. | "Legal" ends the talk. | Vane offers a legal, unfair deal; the player sorts it on three scales and pays for the choice. | reviewed |
| C12.09 | Insider trading, bribery, gift policy. | 30% x 50,000 = 15,000, returned = 0. 3 x 150 = 450 > 390. 200 + 400 + 500 = 1,100 (million). | Judging one gift, not the yearly total. | Write the stall's gift rule; a later gift tests it. | reviewed |
| C14.06 | Test the riskiest assumption cheaply; set pass line first. | P(>=5 of 200) = 5.2% at 1%, 56.2% at 2.5%, 90.5% at 4%. | Setting the line after the data. | Pre-order one batch before building; the player writes the pass line first. | grounded (author's own test design; flagged in file) |
| C16.11 | Reservation points, bargaining range, expand the pie. | Range 2,000 - 900 = 1,100. Trade: 630 + 620 = 1,250 (+150). 15,960 x 30/365 = 1,312. | Splitting the price only. | Trade price for term with Ashby or Hobb; both sides gain only if the player finds the swap. | grounded |
| C16.12 | Prepare your walk-away number before you name a price. | Weighted scores 5.95/6.65/7.25. Floor = 1,500 - 200 = 1,300. | Floor equals the alternative's gross value. | Fill a prep sheet; a hidden second offer sets the floor. | grounded |

## Not written: C12.11 (contract law)
The file `knowledge/mba/modules/C12-ethics/sessions/11-*.md` does not exist (C12 stops at session 10). Status: **NOT WRITTEN**. PLAN item C1 already tracks this.
Summer needs from it, at minimum:
1. What makes a promise binding: offer, acceptance, something exchanged.
2. Written against spoken terms, and who proves what.
3. Breach: what the other side may claim, and when a guarantee is called.
4. How a seal or signature changes risk.
Summer cannot teach the Vane thread or the guarantee flag from C12.02 alone. Build those scenes only after C12.11 exists.

## The core ideas for Summer (at most 8), and the previews

Core (each one is a mechanic, not a lesson):
1. **Price and elasticity** (C4.01-02). Reason: the market grows in Summer and the player sets prices for the first time.
2. **Margin per scarce unit** (C2.03). Reason: a full calendar forces a real choice between jobs.
3. **Unit cost and scale** (C4.03). Reason: Summer is the season to expand the mill.
4. **The true cost of borrowing** (C1.06). Reason: the player borrows to expand and must see cost against cash.
5. **Jobs and segments** (C8.01-02). Reason: the new families arrive and the player must choose whom to serve.
6. **Negotiation: walk-away number and trades** (C16.11-12). Reason: S2 names the walk-away option, and every Summer deal gives something to trade.
7. **Biases: anchoring, sunk cost, planning** (C3.09, C7.01). Reason: S2 names anchoring and sunk cost, and a first price offer anchors each deal.
8. **Legal, ethical, smart** (C12.02). Reason: S2 names it, and Vane's offers need three separate answers.

Previews (named once, no transcript credit):
- Positioning (C8.03): follows from segments; teach it fully in Autumn.
- Case prep card (C0.07): fits a one-off Court preparation.
- Test before you build (C14.06): a small pre-order scene only; the statistics wait for the Province.
- Calibration and Brier score (C3.09, part): too heavy for a farm; keep the 90% range idea only.
- Gift and bribery rule (C12.09): one scene; the full policy belongs in Chapter 2.
- Insider trading: no stock market exists in the valley; skip.

Open points for the Lead:
- C4.01 to C4.03 need fixes (table above) before the elasticity and scale scenes. C4 is the most error-dense set in Summer.
- Eight ideas plus eight previews is the S1 ceiling. Summer may need to move idea 8 to a preview if the build runs long.
