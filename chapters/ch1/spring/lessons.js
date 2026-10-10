// Spring at Thornfield — the lessons as DATA (P6b). Every chapter of the story is a record of steps; core/scene.js plays it, story.js holds the hooks and the formulas.
// Format: core/scene.js (header) and chapters/README.md. A record names its formulas ({ calc }) and game actions ({ verb }); the words a player reads live here.
// Variables come from { calc } formulas in story.js (CALC) and from earlier steps. {name} fills a variable, {name|money} adds thousands separators.
// Story design and week structure: see the header of story.js. Curriculum: C1.01, C1.04, C0.02, C1.02, C2.09, C0.01/C5.01, C1.03, C1.08.
(function () {
  const TITLES = ["", "The bailiff", "Harvest and the bakery", "First seed", "Hobb pays later", "Wages day", "Tomas's terms", "Ezra", "The Duke's steward", "Closing the books"];
  // Edric's letters (#28): his voice is warm, rueful and a little funny; each one answers a question the player has just started to ask, and the last turns it into a mystery.
  // Index 9 is WS6's midpoint page (found the night Corvin Vane brings his order); the scenes call letter(6), letter(7), letter(8) by index, so #28's order is kept.
  const LETTERS = ["The first page", "Hobb's best customer", "Maud's calendars", "The Duke's grain", "The last page", "On the bailiff", "Bram's oven", "On patience", "The thing I signed", "The same kind of order"];
  const WEEKS = [null,
    { title: "The writ", line: "Rain, a gate, and a stranger with a ledger.", maud: "This week I'll show you. Watch the numbers." },
    { title: "Promises", line: "Wages fall due, and the Duke's steward is coming.", maud: "This week I'll ask, not tell." },
    { title: "The squeeze", line: "Everyone you promised now wants something.", maud: "This week I'll bet with you, not coach you." },
    { title: "The reckoning", line: "Edric's last book, and the Crown's collector.", maud: "This week I'm silent unless the farm is in danger." },
  ];
  // The journal pages. Page 9 holds the Duke's order, filled from the season's own constants ({dukeSacks}, {dukePrice}, {dukeTerms}).
  const PAGES = [
    "Spring. Best harvest in ten years. Sold every sack. So why is the chest always empty?",
    "Hobb's my best customer. Pays like clockwork, fourteen days after. I'll be fine till then.",
    "Maud keeps drawing me calendars of coin. I keep telling her: the Ledger shows a profit. She keeps looking at me the way you look at a man standing on a frozen pond, saying the ice is fine.",
    "The Duke wants grain, more than I've ever grown. Ezra will lend me the seed money. It's the making of us. The steward says growth is the only safe harbour. He smiles a great deal. I should have counted his teeth.",
    "Profit every year. Never once enough coin on wages day. If someone reads this: watch the chest, not the Ledger.",
    "If you are reading this, Crane has found you first. Be civil. He is the only man in the Duke's employ who counts everything twice, and that is a rarer virtue than honesty. He will frighten you. He is frightened of nearly everything, which is why he is so careful.",
    "Ashby would not take my money. Not a coin. So I gave her my name instead. A name is cheaper than money, I thought. I have since learned what it costs.",
    "Ezra never lied to me. That was the trouble. His rate was always exactly what I deserved. Ask him about patience, and then ask yourself who you were being patient with.",
    "I signed a paper I ought to have shown Maud. It is in the drawer with the seal I could not read. Ask Crane to read it. Ask Ezra whose name stands beneath mine. And please, whatever you do, do not let Ashby thank you for it.",
    "Corvin Vane was here again with the Duke's order: {dukeSacks} sacks at {dukePrice}, paid {dukeTerms} days after delivery. The same kind of order as last spring, and as the spring before. I sign, I borrow for seed, and by Midwinter I'm begging Ezra. I begin to think he counts on it.",
  ];
  // Objective text per stage ("Title: what to do"); the ribbon adds "Week N · <title>" in front.
  const GOALS = {
    "intro": "The bailiff: walk with Crane and tap what the farm owns",
    "harvest2": "Harvest: the three ripe plots are in the field (E, or tap Act)",
    "tomas2": "First seed: buy seed from Tomas (east along the path, the green roof)",
    "plant2": "First seed: plant your seed (E on tilled soil, then E again to water)",
    "ashby3": "The bakery: agree a price with Widow Ashby (red roof)",
    "ship3": "The bakery: ship Ashby's sacks from your shipping crate (by the house)",
    "hobb4": "Hobb pays later: see Hobb at the mill",
    "ship4": "Hobb pays later: ship Hobb's sacks from the crate",
    "sleep5": "Wages day: sleep, and Maud will meet you in the morning",
    "tomas6": "Tomas's terms: buy your next seed from Tomas on account",
    "ezra7": "Ezra: ask the moneylender about a loan (purple roof)",
    "sleep8": "The steward: run the farm and sleep; Corvin Vane comes to the well on day 12",
    "duke8": "The steward: Corvin Vane is waiting by the well",
    "page8": "The page: sleep, and Maud will show you what she found",
    "sleep9": "The squeeze: run the farm and sleep; Corvin Vane returns on day 15",
    "duke9": "The squeeze: Corvin Vane is back at the well",
    "tomas9": "Tomas offers again: Ezra's rate has moved; see Tomas on account",
    "run9": "Run the farm to the end of spring (day 28), close the books, then face the Reeve's Court",
    "done": "Spring is closed. Your notebook (N) and case board have everything you learned.",
    "sleep8now": "The steward: sleep; Corvin Vane comes to the well in the morning",
    "sleep9now": "The squeeze: sleep; Corvin Vane returns to the well in the morning",
  };
  const R = {};
  // ---------- chapter 1: the bailiff (C1.01) — WS3 cold open: the `tag` verb builds the balance sheet, then one More/Less choice ----------
  R.ch1 = { id: "ch1", steps: [
    { verb: "ch1Open" },
    { speak: "crane", text: "Edric's heir. Bailiff Crane, of the Crown. Item: forty-one things to list before Midwinter, and I shall be thorough about every one. Walk with me.", buttons: ["Walk with you"] },
    { calc: "ch1Facts" },
    { verb: "ch1Tag", args: { toast: "Crane taps the chest: Cash.", chest: "Cash (the chest)", sacks: "Sacks: {sacks} at {cost}", crops: "Crops in the ground ({plots} plots, at cost)", remarkCash: "Cash, {cash}.", remarkRest: "Find the rest. Everything this farm owns.",
      decoyWell: "That's the village's well. Not yours.", decoyTrees: "The trees are the Duke's.", decoyBoard: "The notice board belongs to the village." } },
    { speak: "crane", text: "Now the other column, the one people prefer not to read. I brought the papers myself.", buttons: ["Show me"] },
    { verb: "ch1Liab", args: { loan: "Ezra's note (the loan)", crown: "The Crown's writ, due at Midwinter" } },
    { speak: "crane", text: "Before I stamp it, heir: do you own more than you owe, or less?", buttons: ["More", "Less"], as: "c" },
    { calc: "ch1Right" },
    { verb: "ch1Stamp", args: { title: "Owner's equity {eqFmt}", sub: "{assets|money} owned − {liab|money} owed" } },
    { if: "right",
      then: [{ speak: "crane", text: "You have a head for it. That is not a compliment, heir; it is a diagnosis.", buttons: ["Next"] }],
      else: [{ speak: "crane", text: "Less. Much less, and I am required to say it plainly.", buttons: ["Next"] }] },
    { verb: "clearStamp" },
    // WS6: the writ needs a name (item 10), and Crane makes his standing offer (M3, item 3), both while he's still standing in the yard
    { speak: "crane", text: "The writ requires a name for the land. Item: what shall I write?", buttons: ["Give it a name"] },
    { verb: "nameFarm" },
    { calc: "farm" },
    { speak: "crane", text: "Item: {farm}. Entered on the writ, and not to be changed without a form.", buttons: ["Next"] },
    { verb: "craneOffer", args: { first: true } },
    { calc: "over" }, { if: "over", then: [{ end: 1 }] }, // sold on day 1: the ending has been shown
    { verb: "craneOff" },
    { tell: "That was Crane. Don't mind him: he counts everything twice because he's frightened of nearly everything." },
    { tell: "What you own minus what you owe is yours, and yours is {eqWord}. That's why we work." },
    { tell: "Profit is an opinion. Cash is a fact." }, // WS6: the theme, stated once, early
    { page: 5 }, // #28: Edric's letter "On the bailiff"
    { tell: "The far field's ripe. Harvest it (walk up, press E or tap Act) and Ashby the baker will buy." },
    { master: "equation", if: "right" },
    { keep: { id: "equation", term: "Assets = Liabilities + Owner's equity", line: "What you own, minus what you owe, is yours. It can be below zero.", example: "Day 1: {assets} = {liab} + ({equity}).{guessNote}" } },
    { verb: "parchClose" }, { to: [1, "harvest2"] },
  ] };
  // ---------- chapter 2: first seed (C1.04: cost becomes inventory, not an expense yet) — WS3: no typed question; Maud says one line ----------
  R.ch2 = { id: "ch2", steps: [
    { calc: "ch2Facts" },
    { speak: "tomas", text: "My friend! Edric's heir! Sit, sit, no, don't sit, buy! Seed is {sc} a packet. One packet plants one plot; a plot gives {per} sacks of wheat. I wouldn't say that if it weren't true, and I would say it if it were, which is a rare quality in a salesman." },
    { tell: "Let me buy the first three, so you can see where the coin goes." },
    { verb: "buySeeds", args: { n: 3, credit: false } },
    { tell: "Cash went down {three} and Inventory went up {three}: changed shape, not spent.<br>Seed only becomes a cost when the grain is sold.", spot: ["h-cash", "h-inv"] },
    { calc: "inv0" },
    { speak: "tomas", text: "Six more?", buttons: ["Buy 6 packets for Cash ({six})"] },
    { verb: "buySeeds", args: { n: 6, credit: false } },
    { calc: "ch2After" },
    { keep: { id: "inventory", term: "Inventory", line: "Buying seed isn't spending: Cash becomes Inventory, at cost, until it's sold.", example: "Day {day}: 6 packets, Cash −{six}, Inventory +{six} ({inv0} → {inv1})." } },
    { remember: ["planted0", { var: "planted" }] }, { to: [3, "plant2"] },
  ] };
  // ---------- chapter 3: the bakery (C1.01, C0.02: revenue, COGS, gross profit, margin) — WS3: the typed floor becomes the walk-away line ----------
  R.ch3 = { id: "ch3", steps: [
    { calc: "ch3Setup" },
    { speak: "ashby", text: "So you're Edric's heir. You've his chin and none of his luck, dear. I need six sacks for the ovens. Seven a sack, Cash on the nail." },
    { tell: "Each sack cost you {cost}: {seedCost} of seed for {per} sacks, so at 7 you keep {m7} a sack. That's gross profit: {m7} out of every 7 is {p7}%, your margin.", spot: ["h-inv"] },
    // The worked example goes in the notebook as it's shown, so the Try that follows can point to it.
    { keep: { id: "margin", term: "Gross profit & margin", line: "Price minus cost per sack is gross profit. Divide by the price: margin. Your cost floor is your cost per sack: below it you lose money (a sale you give up can raise the real floor later).", example: "Maud at 7: 7 − {cost} = {m7} profit a sack; {m7} ÷ 7 = {p7}% margin." } },
    // The floor is asked first, and it is used: it becomes the red walk-away line on the price track in the haggle.
    { quiz: "Before you name a price: what's your cost floor? The lowest you'd take for a sack before it loses money.", answer: "cost", hints: ["What did each sack cost you? Seed for a plot, divided by the sacks it gives."], spot: null, tol: 0, docs: null,
      work: "A packet of seed is {seedCost} and gives {per} sacks, so each sack cost {cost}. Sell below {cost} and you lose money.", how: "Your cost floor is what one item cost you. If 10 of seed grows 5 sacks, each sack cost 10 ÷ 5 = 2. Below 2, you lose money." },
    { speak: "ashby", text: "Times are hard, dear. Would you take 6?" },
    { quiz: "Work it out before you answer. Your margin at 6, in %?", answer: "p6", hints: ["Look at how I worked it at 7 in my notebook, then do the same at 6.", "Margin compares the profit on one sack with the price the buyer pays."], spot: null, tol: 1, docs: ["notebook"],
      work: "At 6 you keep 6 − {cost} = {m6} a sack. {m6} ÷ 6 = {r6}, so {p6}%.", how: "Margin = profit on one item ÷ the price you sell it for, × 100. Sell for 10 what cost 6: profit 4, and 4 ÷ 10 × 100 = 40%." },
    { master: "gross" }, { master: "margin" },
    { tell: "Your cost floor, {cost}, is the red line on the price track: sell below it and the sack costs you more than it earns. Name your price and she'll counter; you can always walk away." },
    { tell: "That red line is your walk-away point: your best alternative, less what it costs to take it. Today it is your cost; a better buyer would raise it." }, // S2 naming pass (C16.12: reservation point)
    { verb: "haggle", args: { open: 6, walk: 7, line: "Well, dear? 6 sacks. What do you want for them?" }, as: "deal" },
    { if: { not: "deal" }, then: [{ speak: "ashby", text: "Come back when you've thought it over." }, { end: 1 }] },
    { calc: "ch3Deal" },
    { speak: "ashby", text: "{price} it is. Ship them from your crate and I'll pay on the spot." },
    { addEx: ["margin", "Your deal: Ashby, 6 sacks at {price}: {pm} a sack, {pp}% margin."] },
    { to: [2, "ship3"] },
  ] };
  // ---------- chapter 4: Hobb pays later (C1.02: accounts receivable, accrual vs cash) ----------
  R.ch4 = { id: "ch4", steps: [
    { calc: "ch4Setup" },
    { tell: "Before you go in: know your cost floor. And listen for when he pays." },
    { speak: "hobb", text: "...Edric's heir. Hm. Nine sacks. I pay... fourteen days after delivery. Same as always. Same as your uncle." },
    { tell: "Your uncle loved Hobb, and Hobb always paid. Eventually." },
    { verb: "haggle", args: { open: 8, walk: 9, line: "Nine sacks. Name your price; I'm not a charity." }, as: "deal" },
    { if: { not: "deal" }, then: [{ speak: "hobb", text: "Suit yourself. The offer stands till tomorrow." }, { end: 1 }] },
    { to: [4, "ship4"] },
  ] };
  // WS3: the four typed sums become one bet with a delayed reveal. The player predicts the chest from the timeline (cards, no Cash line),
  // stakes real coin, and is told the answer on the morning after Hobb pays: predicted vs actual, each difference named (Verbs.revealBet).
  R.ch4b = { id: "ch4b", steps: [
    { calc: "ch4bFacts" },
    { tell: "The Ledger says you earned {v} today: Revenue. Look at the chest: it didn't move.", spot: ["h-ni", "h-cash"] },
    { if: "arBig",
      then: [{ tell: "Hobb's {v} joins your Accounts receivable: everything people owe you, {arNow} in all. Hobb's part is due day {due}. Two books, and Edric only read one.", spot: ["h-ar", "coin"] }],
      else: [{ tell: "The {v} is your Accounts receivable now: Hobb owes it, due day {due}. Two books, and Edric only read one.", spot: ["h-ar", "coin"] }] },
    { verb: "ch4bBet", args: { prompt: "Five coin says you can't tell me what's in the chest the morning after Hobb pays (day {revealDay}), if you buy nothing more.", how: "Cash now, plus every coin that comes in, minus every coin that goes out, up to that day. The timeline shows each one.",
      explain: "Revenue counted the day you delivered; the coin came today. Two books.", tlLabel: "Open the timeline", tlTitle: "Cash events, today to day {due}", tlMaud: "Every coin coming in and going out. I've hidden the Cash line: that's your job." }, as: "r" },
    { calc: "betFacts" },
    { keep: { id: "ar", term: "Accounts receivable", line: "Revenue counts when you deliver; the Cash comes when they pay. In between, it's a receivable.", example: "Hobb: {v} of Revenue on day {day}, Cash on day {due}. You said {guess}{stakeTxt}." } },
    { page: 1 }, { to: [5, "sleep5"] },
  ] };
  // ---------- chapter 5: wages day (C2.09: working capital, the cash forecast) ----------
  // WS3: no warning beforehand (Kapur: struggle first). The engine decides at the day-7 sleep: if Cash can't cover wages a farmhand walks off.
  R.ch5 = { id: "ch5", steps: [
    { calc: "ch5Setup" },
    { if: "walked",
      then: [{ tell: "Jory walked off last night: {walkedWages} in wages and the chest couldn't find them. The crops went unwatered. The Ledger said profit. The chest said no.", spot: ["h-cash"] }],
      else: [{ tell: "Wages went out last night. Closer than the Ledger makes it look.", spot: ["h-cash"] }] },
    { verb: "timeline", args: { mode: "show", n: 14, title: "Your next two weeks", maud: "Every coin coming and going, with Cash under it. The low point is day {lowDay}, Cash {lowClose}. {lowNote}" } },
    // (the timeline above is something to read, not an answer, so it earns no mastery; the forecast Ezra asks for in chapter 7 does)
    { speak: "tomas", text: "I only mark up my seed 50%. Honest trade." },
    { calc: "markupMargin" },
    { verb: "markupBet", args: { prompt: "Two coin says you can't tell me Tomas's margin on his seed. He marks it up 50%.", how: "Markup divides the profit by what the seed cost him. Margin divides the same profit by the price he sells at. If it cost him 100 and he sells at 150, the profit is 50.",
      explain: "Markup is profit ÷ cost, 50%. Margin is profit ÷ price, 50 ÷ 150 = 33%. Same sale, two numbers." }, as: "r" },
    { calc: "betFacts" },
    { master: "margin", if: "win" },
    { keep: { id: "forecast", term: "Cash forecast", line: "Cash at the start + cash in − cash out, day by day. Profit doesn't pay wages; Cash does.", example: "Day {day}: lowest Cash in two weeks {lowClose}, on day {lowDay}.{walkNote} Markup 50% = margin {m}%." } },
    { verb: "costScene" }, { page: 2 }, { to: [6, "tomas6"] },
  ] };
  // ---------- fixed vs variable cost, break-even (C2.01, C2.02, C0.03): the first wages day names the two kinds of cost, then a price cut shows break-even jumping (audit 2026-10-04, foundation 2) ----------
  R.cost = { id: "cost", steps: [
    { calc: "costFacts" },
    { if: "skip", then: [{ end: 1 }] },
    { tell: "Two kinds of cost: <b>variable</b> (seed and grain, rising with every sack) and <b>fixed</b> (wages and interest, due every week whatever you sold). This week's fixed bill is <b>{F}</b>." },
    { tell: "A sack at {p} leaves {m} after its {cost} of grain: its <b>contribution</b>. Break-even is the sacks whose contribution covers the fixed bill: {F} ÷ {m} = <b>{n0} sacks a week</b>." },
    { tell: "Put together: profit = contribution × sacks − fixed bill. At {n0} sacks it is {m} × {n0} − {F} = {zero}, about nothing." },
    // the three answers rotate by `k` so the right one is not always last; the right one is the third in the list below
    { pick: "k", cases: [
      [{ speak: "maud", text: "Suppose a rival like Grisby sets up and undercuts you: the going price falls to <b>{p1}</b>, a cut of {cutPct}%. How many sacks a week do you need to break even now?", buttons: ["About {n0} (a small cut changes little)", "About {n0b}", "About {n1}"], as: "c" }],
      [{ speak: "maud", text: "Suppose a rival like Grisby sets up and undercuts you: the going price falls to <b>{p1}</b>, a cut of {cutPct}%. How many sacks a week do you need to break even now?", buttons: ["About {n0b}", "About {n1}", "About {n0} (a small cut changes little)"], as: "c" }],
      [{ speak: "maud", text: "Suppose a rival like Grisby sets up and undercuts you: the going price falls to <b>{p1}</b>, a cut of {cutPct}%. How many sacks a week do you need to break even now?", buttons: ["About {n1}", "About {n0} (a small cut changes little)", "About {n0b}"], as: "c" }]] },
    { calc: "costRight" },
    { master: "breakeven", if: "right" },
    { tell: "{verdict} The contribution fell from {m} to {m1}, down {dropPct}%, but the fixed bill did not move." },
    { tell: "So break-even rose from {n0} to <b>{n1} sacks</b>, up {up}%. A small price cut is a big cut in contribution, which is why a rival's undercut hurts more than it looks." },
    { keep: { id: "breakeven", term: "Fixed, variable, break-even", line: "Variable costs rise with each sack. Fixed costs come every week whatever you sell. Break-even = fixed bill ÷ contribution per sack. A small price cut can double it.", example: "Day {day}: fixed bill {F}, contribution {m} at {p}: {n0} sacks. At {p1}: {n1} sacks." } },
  ] };
  // ---------- the price of waiting (C0.01, C5.01): a promise due later is worth less today. Ezra's factoring price against his loan rate, on a real invoice (audit 2026-10-04, foundation 1) ----------
  R.pv = { id: "pv", steps: [
    { calc: "pvFacts" },
    { remember: ["pv", true] },
    { if: "real",
      then: [{ tell: "{who} owes you <b>{amount}</b>, due day {due}, {days} days away. A promise due later is worth less than coin in hand, and Ezra has two prices for how much less." }],
      else: [{ tell: "Suppose a neighbour owed you <b>{amount}</b>, due {days} days from now. A promise due later is worth less than coin in hand, and Ezra has two prices for how much less." }] },
    { if: "flip",
      then: [{ speak: "maud", text: "Suppose you need {got} in Cash today for wages. Which costs you less?", buttons: ["Borrow {got} from Ezra and repay it when {who} pays", "Sell the invoice to Ezra: {got} today, {fee} fee"], as: "c" }],
      else: [{ speak: "maud", text: "Suppose you need {got} in Cash today for wages. Which costs you less?", buttons: ["Sell the invoice to Ezra: {got} today, {fee} fee", "Borrow {got} from Ezra and repay it when {who} pays"], as: "c" }] },
    { calc: "pvRight" },
    { master: "tvm", if: "right" },
    { tell: "{verdict} Selling gives up <b>{fee}</b> to get the Cash {days} days early, about <b>{implied}% a week</b>." },
    { tell: "Borrowing the same {got} at {ratePct}% a week costs about <b>{interest}</b> over {days} days. Same Cash, same wait, a much lower price of waiting." },
    { tell: "At Ezra's loan rate, {amount} due in {days} days is worth about <b>{worth}</b> today. That is its <b>present value</b>: what the promise is worth in Cash now." },
    { keep: { id: "tvm", term: "Present value of a promise", line: "A promise due later is worth less today. The rate is the price of waiting. Present value = amount ÷ (1 + rate) for each week of waiting. A higher rate makes the promise worth less.", example: "Day {day}: {whoLow}'s {amount}, due in {days} days, is worth about {worth} at {ratePct}% a week. Selling it to Ezra costs {implied}% a week." } },
  ] };
  // ---------- chapter 6: Tomas's terms (week 2). Time value (C0.01, C5.01) beside payables (C1.01) — SEASON-1-REDESIGN.md §7 item 1 ----------
  // Tomas: "2% off if you pay within 7 days". A discount for paying early is an interest rate: paying a week early costs the Cash you would
  // otherwise hold for that week, and Ezra's weekly rate prices that Cash. Early is cheaper iff 2% > 98% x rate, i.e. rate < 204 bp.
  // The rate comes from terms() THAT WEEK. Ezra's forecast scene lowers it, so in week 3 Tomas offers again and the answer can flip.
  // `tvm` mastery is earned only here, and only when the player's choice matched the cheaper option.
  R.tvm = { id: "tvm", steps: [ // starts with { again: false } (week 2) or { again: true } (week 3)
    { calc: "tvmSetup" },
    { if: "stuck", then: [{ speak: "tomas", text: "I can't put more on your account while you owe me this much. Pay what I'm owed first.", buttons: ["Next"] }, { end: 1 }] },
    { if: "again",
      then: [{ speak: "tomas", text: "Seed again? Same terms: the full bill in {apDays} days, or {disc}% off if you pay within {discDays}.", buttons: ["Next"] }],
      else: [{ speak: "tomas", text: "On account: the full bill in {apDays} days, or {disc}% off if you pay within {discDays}.", buttons: ["Next"] }] },
    { if: "again",
      then: [{ tell: "Ezra's rate was {tvmRate}% a week when you last bought. Today it is {rate}%. Same discount, different Cash. I won't say whether that changes the answer.", spot: ["h-ap"] }],
      else: [{ tell: "A discount for paying early is an interest rate in disguise. Ezra charges {rate}% a week for Cash. I won't say which is cheaper: buy, then move the bill and see.", spot: ["h-ap"] }] },
    { calc: "tvmSizes" },
    { speak: "tomas", text: "How many on account?", buttons: ["{small} packets ({smallCost})", { label: "{big} packets ({bigCost})", off: "bigOff" }], as: "c" },
    { calc: "tvmPick" },
    { verb: "buySeeds", args: { credit: true }, as: "r" },
    { calc: "buyResult" },
    { if: { not: "ok" }, then: [{ speak: "tomas", text: "{msg}" }, { end: 1 }] },
    { calc: "tvmBill" },
    { verb: "tvmTimeline", args: { title: "When do you pay Tomas?", maud: "Pay your Tomas bill ({billAmt}) by day {discBy} and he takes {disc}% off, a week early; Ezra sells a week of Cash for {rate}%. Which is cheaper, given the Cash has to be there on day {due} either way?" },
      lazy: { early: "Paying by day {discBy}: Tomas takes <b>{disc}% off</b> ({billDisc}) for the Cash you hand over {daysEarly} days early. <b>Ezra's rate: {rate}% a week.</b>", late: "Paying on day {payDay}: no discount, and the Cash stays with you. <b>Ezra's rate: {rate}% a week.</b>" }, as: "r2" },
    { calc: "tvmAfter" },
    { verb: "tvmSettle" },
    { tell: "{tookPhrase} A week of that Cash from Ezra at {rate}% would cost {carryX}, so {cheaperPhrase}.", spot: ["h-ap"] },
    { if: { not: "again" }, then: [{ tell: "The rate is not fixed. Watch what it does." }] },
    { master: "tvm", if: "right" }, // earned only here, only when the choice matched the cheaper option
    { let: ["ex", "Day {day0}: Tomas's {disc}% ({discX}) vs Ezra's {rate}% a week ({carryX}): {cheaperWord} was cheaper. You {tookWord}."] },
    { if: "again",
      then: [{ addEx: ["tvm", "{ex}"] }, { pin: ["tvm2", "Tomas offers again", "{disc}% vs {rate}% a week", "Day {day0} · it {flipWord}"] }],
      else: [
        { keep: { id: "ap", term: "Accounts payable & trade credit", line: "What you owe a supplier. Free credit until the due day; paying early can buy a discount.", example: "Day {day0}: seed bill {billAmt}, {disc}% off by day {discBy} = {billDisc}; you {tookKept}.", num: "owed {billAmt}, due day {due}" } },
        { keep: { id: "tvm", term: "Money now vs money later (time value)", line: "A discount for paying early is an interest rate. Compare it with what the Cash would cost you, Ezra's weekly rate. Whichever is cheaper this week wins, and the answer can flip when the rate moves.", example: "{ex}", num: "{disc}% vs {rate}% a week", from: "Day {day0} · Tomas's terms" } },
        { remember: ["tvmRate", { var: "rate" }] }] },
  ] };
  R.ch6 = { id: "ch6", steps: [{ verb: "tvm", args: { again: false }, as: "ok" }, { if: "ok", then: [{ to: [7, "ezra7"] }] }] };
  R.ch9t = { id: "ch9t", steps: [{ verb: "tvm", args: { again: true } }, { to: [9, "run9"] }] }; // week 3: Tomas offers again; Ezra's rate has moved, and the answer can flip
  // ---------- chapter 7: Ezra (week 2; C0.01, C5.01: debt, interest, what lenders read) — the forecast scene is tagged `interest` ----------
  R.ch7 = { id: "ch7", steps: [
    { calc: "ezraSetup" },
    { speak: "ezra", text: "Come in. Sit. You want coin; everyone does, eventually. My rate is {rate0}% a week. It is not a judgement, only a price. Show me your forecast first, and I shall see how much I believe it." },
    { verb: "timeline", args: { mode: "predict", n: 14, tol: 5, title: "Your forecast, for Ezra", maud: "Ezra: tell me your lowest coin in the next two weeks, and the day. Get both right (the coin within 5) and I will shave my rate." }, as: "r" },
    { calc: "ezraRate" },
    { master: "interest", if: "both" }, { master: "wc", if: "both" }, // right = the lowest coin (within 5) and the day (time value is earned in Tomas's scene, not here)
    { let: ["intro", "The line says {low} on day {lowDay}. {verdict} Your rate: {rate}% a week (was {rate0}%). How much?"] },
    // The loan must actually arrive: Ezra's limit counts what you already owe, so only offer what he will lend, and if the engine refuses, say why and ask again (it used to fail silently).
    { verb: "loan", args: { buttons: ["Borrow 100", "Borrow 200", "Nothing today"] }, lazy: { short: "{intro} I will lend you up to {roomShown} more: you owe me {owed}.", retry: "{msg} How much, then?" }, as: "borrowed" },
    { calc: "ezraKeep" },
    { if: "borrowed", then: [{ let: ["borrowTxt", " You borrowed {borrowed}: {borrowInt} interest a week."] }], else: [{ let: ["borrowTxt", ""] }] },
    { keep: { id: "interest", term: "Interest", line: "The price of Cash now: the rate times the loan, every week. A forecast a lender can trust buys a lower rate.", example: "Ezra's rate went from {rate0}% to {rate}% a week after your forecast.{borrowTxt}", num: "{rate0}% → {rate}% a week", from: "Day {day} · Ezra's forecast" } },
    { to: [8, "sleep8"] },
  ] };
  // ---------- chapters 8 and 8b: Corvin Vane, the Duke's steward (week 2 midpoint, week 3 squeeze). C2.09 overtrading; case W.T. Grant. Maud asks, then bets; she doesn't show. ----------
  // Escalation (SEASON-1-REDESIGN.md §7 item 3): day 12 a first order (half of R.duke.sacks), day 15 a double order (R.duke.sacks). The timeline's second line
  // (tied up in sacks and invoices) shows what each order does to the working capital. Mastery only if the choice matched the player's OWN board.
  R.duke = { id: "duke", steps: [ // starts with { n: 1 } (day 12) or { n: 2 } (day 15)
    { calc: "dukeSetup" },
    { if: "noOffer", then: [{ if: { eq: ["n", 1] }, then: [{ to: [8, "page8"] }], else: [{ to: [8, "tomas9"] }] }, { end: 1 }] },
    { if: { eq: ["n", 1] },
      then: [{ speak: "duke", text: "You must be the heir! Corvin Vane, steward to His Grace, at the Duke's service, and yours. I bring the kind of opportunity that does not knock twice. His Grace wants {sacks} sacks at {price}: {value|money} of Revenue, delivered by day {due}. He pays {terms} days after delivery. Think what it could do for Thornfield." }],
      else: [{ if: "tookFirst",
        then: [{ speak: "duke", text: "Corvin Vane again, heir. His Grace was delighted with the first. Now {sacks} sacks, double: {value|money}, delivered by day {due}, paid {terms} days after." }],
        else: [{ speak: "duke", text: "Corvin Vane again, heir. His Grace remembers the first, and that it went unanswered. Now {sacks} sacks, double: {value|money}, delivered by day {due}, paid {terms} days after." }] }] },
    { if: { eq: ["n", 1] }, then: [
      { page: 3 },
      { tell: "This is the order that killed your uncle; the steward calls it an opportunity. I call it a loan you make him, at no interest, in your own seed." },
      { tell: "I won't tell you what to do. I'll ask." }] },
    { calc: "dukeBoard" },
    { if: "need",
      then: [{ let: ["title", "What if: you take it and buy {need} packet{plural} of seed today ({extra})"] }, { let: ["clause", " and buy the seed today"] }],
      else: [{ let: ["title", "What if: you take it. You already hold the seed, so nothing extra is bought today"] }, { let: ["clause", ""] }] },
    { if: { eq: ["n", 1] },
      then: [{ let: ["maud", "Read your own board: Cash on top, and under it what is tied up in sacks and invoices."] }],
      else: [{ let: ["maud", "Last time {tied1|money} was tied up by this order. This time: {delta|money}."] }] },
    { verb: "timelineDuke", args: { title: "{title}", maud: "{maud}" } },
    { if: { eq: ["n", 1] },
      then: [{ quiz: "If you take it and buy the seed today, what's the lowest Cash in the next two weeks?", answer: "lowClose", hints: ["Look down the Cash line for the smallest number.", "A minus sign means the chest is empty before then."], spot: null, tol: 0, docs: ["whatif"],
        work: "Reading the Cash line, the smallest number is {lowClose}, on day {lowDay}.", how: "Open the timeline and read the Cash number under each day. The smallest is your lowest point; a minus number is smaller than any plus." }],
      else: [{ verb: "dukeBet", args: { prompt: "Three coin says you can't tell me your lowest Cash in the next two weeks if you take all {sacks}{clause}.", how: "Read the Cash number under each day of the what-if timeline. The smallest is the lowest point; a minus is below zero.",
        explain: "Cash bottoms at {lowClose} on day {lowDay}. The order ties up {delta|money} in sacks and invoices.", docLabel: "Open the what-if timeline" } }] },
    { if: { eq: ["n", 1] },
      then: [{ speak: "duke", text: "Well? Opportunities are like bread, heir. Best taken warm.", buttons: ["Take all {sacks}", "Offer {half} (half)", "Decline"], as: "c" }],
      else: [{ speak: "duke", text: "Well? His Grace doesn't wait.", buttons: ["Take all {sacks}", "Offer {half} (half)", "Decline"], as: "c" }] },
    { verb: "dukeAct" },
    { calc: "dukeWise" },
    { master: "overtrading", if: "wise" },
    { if: { eq: ["n", 1] }, then: [{ remember: ["tied1", { var: "delta" }] }] },
    { pick: "tellIdx", cases: [
      [{ tell: "Your own board says Cash goes to {lowClose}. Edric did the same. Borrow, or sell the invoice to Ezra for {factorPct}% (factoring), or it ends the same way." }],
      [{ tell: "Your board says you can carry it. Then carry it." }],
      [{ tell: "Half: {half} sacks, and about {halfTied|money} less tied up. Growth you can't fund isn't growth." }],
      [{ tell: "Growth you can't fund isn't growth. Edric never learned that." }]] },
    { calc: "dukeChoice" },
    { if: { eq: ["n", 1] },
      then: [{ keep: { id: "overtrading", term: "Overtrading", line: "Taking more orders than your Cash can carry: profit on paper, broke in fact. The gap grows with sales and only comes back when growth stops. Forecast before you say yes.", example: "Corvin's first order, {sacks} sacks: lowest Cash {lowClose} on day {lowDay} if taken, {delta|money} tied up. You chose: {choice}.", num: "Cash low {lowClose}, {delta|money} tied up", from: "Day {day} · Corvin's first order" } }, { to: [8, "page8"] }],
      else: [{ addEx: ["overtrading", "The double order, {sacks} sacks: lowest Cash {lowClose}, {delta|money} tied up (the first tied up {tied1|money}). You chose: {choice}."] },
        { pin: ["duke2", "Corvin's double order", "{delta|money} tied up (was {tied1|money})", "Day {day} · second order"] }, { to: [8, "tomas9"] }] },
  ] };
  // ---------- the cash conversion cycle (S2; C2.09): receivable, inventory and payable days from the player's own books, a day after the present-value lesson in week 3 ----------
  R.cycle = { id: "cycle", steps: [
    { calc: "cycleFacts" },
    { if: "skip", then: [{ end: 1 }] },
    { remember: ["cycle", true] },
    { tell: "Your books can say it in days. Over {days} days you sold {revenue} and the grain you sold cost {cogs}." },
    { tell: "Receivables {ar} ÷ Revenue {revenue} × {days} days = {dso} days: how long customers take to pay.", spot: ["h-ar"] },
    { tell: "Inventory {inv} ÷ cost of goods sold {cogs} × {days} days = {dio} days: how long grain sits before it sells." },
    { tell: "Payables {ap} ÷ {cogs} × {days} days = {dpo} days: how long Tomas lets you wait. That one is free credit.", spot: ["h-ap"] },
    { quiz: "The cash conversion cycle is DSO + DIO − DPO. How many days is yours?", answer: "ccc", hints: ["Add the two lines that tie your coin up, then take away the days Tomas finances."], spot: null, tol: 0, docs: null,
      work: "{dso} + {dio} − {dpo} = {ccc} days.", how: "Receivable days plus inventory days, minus payable days. Days that tie coin up count up; days a supplier finances count down." },
    { tell: "{ccc} days pass between paying for seed and getting the coin back. Double your sales and the coin tied up in that gap doubles too, unless the days shrink." },
    { keep: { id: "ccc", term: "Cash conversion cycle", line: "DSO + DIO − DPO: the days between paying for grain and getting the coin back. Receivables and inventory add days; a supplier's credit takes days away.", example: "Day {days}: receivables {dso} + inventory {dio} − payables {dpo} = {ccc} days.", num: "{ccc} days to cash", from: "Day {days} · your books" } },
  ] };
  // ---------- who is paid first (S2; the liquidation waterfall): a sale pays debts first and the owner last, with the farm's own numbers, in week 4 ----------
  R.waterfall = { id: "waterfall", steps: [
    { calc: "waterfallFacts" },
    { speak: "ezra", text: "A sale is the same book read in order. Suppose Crane's offer of {price|money} were taken today.", buttons: ["Go on"] },
    { speak: "ezra", text: "The farm owes {debts|money}: my loan, Tomas, and the Crown's writ. Debts are paid first, out of the sale.", buttons: ["Next"] },
    { if: "short",
      then: [{ speak: "ezra", text: "{price|money} does not cover {debts|money}. You would still owe {short|money}, and you, the owner, would be paid nothing.", buttons: ["Next"] }],
      else: [{ speak: "ezra", text: "That leaves {left|money} for you, the owner, who is paid last.", buttons: ["Next"] }] },
    { pick: "k", cases: [
      [{ speak: "ezra", text: "When the sale money is shared out, who is paid first?", buttons: ["The owner, then the debts", "The debts, then the owner", "Whoever asks loudest"], as: "c" }],
      [{ speak: "ezra", text: "When the sale money is shared out, who is paid first?", buttons: ["Whoever asks loudest", "The owner, then the debts", "The debts, then the owner"], as: "c" }],
      [{ speak: "ezra", text: "When the sale money is shared out, who is paid first?", buttons: ["The debts, then the owner", "Whoever asks loudest", "The owner, then the debts"], as: "c" }]] },
    { calc: "waterfallRight" },
    { if: "right", then: [{ flag: ["debtsFirst", true] }], else: [{ flag: ["debtsFirst", false] }] },
    { speak: "ezra", text: "{verdict} Debt is paid before equity. A sale price is not what the owner takes home.", buttons: ["Next"] },
    { remember: ["waterfall", true] },
    { keep: { id: "waterfall", term: "Debts are paid first", line: "In a sale, the money pays debt first and the owner last. A sale price is not what the owner takes home.", example: "Day {day}: a sale at {price|money} against {debts|money} of debts leaves {left|money}.", num: "{price|money} sale, {debts|money} owed", from: "Day {day} · Ezra's order" } },
  ] };
  // That night: Maud finds Edric's page (the midpoint turn): the same order every spring.
  R.page = { id: "page", steps: [
    { tell: "I couldn't sleep. I went through Edric's desk, and there was a page under the lining." },
    { page: 9 },
    { tell: "The same kind of order, every spring, from the same man. Edric didn't miscount: someone made sure the coin ran out." },
    { to: [8, "sleep9"] },
  ] };
  // ---------- week 4 (item 6): Maud's last scene. Edric's cash book, the second ledger he kept and never read beside the first. ----------
  R.cashbook = { id: "cashbook", steps: [
    { calc: "cashFacts" },
    { tell: "Edric kept a second book, a cash book of what the chest held week by week, and I never gave it to you until you could read it. He never read it beside the Ledger." },
    { verb: "cashBookPanel" },
    { pin: ["cashbook", "Edric's cash book", "profit {niFmt}, Cash {cashFmt}", "Day {day} · second ledger", "book"] },
    { remember: ["book", true] },
    { tell: "From here I'm quiet; if the farm is in danger, you'll hear it from me. Otherwise it's your books and your argument." },
  ] };
  // ---------- chapter 9: closing the books (C1.08), guided: the game shows the statements one at a time; the player finds where the cash went ----------
  R.close = { id: "close", steps: [ // starts with { stm, h }
    { calc: "closeFacts" },
    { verb: "reveal", args: { kind: "is", text: "Your income statement: Revenue, minus the cost of what you sold, minus running costs. Net income {net}. Edric's always looked like this." } },
    { verb: "reveal", args: { kind: "bs", text: "Your balance sheet, start and end: what you own and what you owe. Owner's equity moved by exactly your net income." } },
    { verb: "reveal", args: { kind: "cf", text: "And the cash-flow statement: net income, then every place the Cash actually went. It ends at the change in Cash: {change}." } },
    { verb: "pickLine", args: { text: "Net income {net}, Cash {changeTxt}. Click the line in the cash-flow statement where most of the difference went.", hints: ["Look at the brackets: they're Cash that left, or never came.", "The biggest bracketed number between Net income and Cash from operations."] }, as: "misses" },
    { calc: "firstTap" },
    { master: "cfs", if: "firstTap" }, { master: "statements", if: "firstTap" }, // right on the first tap
    { verb: "reveal", args: { kind: "none", text: "{hText}<br>That's what killed Edric: profit in the Ledger, the coin in other people's purses." } },
    { verb: "logPage4" },
    { verb: "reveal", args: { kind: "none", text: "<span class=\"journal small\">Edric's last page: “{page4}”</span>" } },
    { keep: { id: "statements", term: "The three statements", line: "Income statement: did you make a profit? Balance sheet: what you own and owe. Cash-flow statement: where the Cash went.", example: "Spring: net income {net}, Cash {upDown} {absChange}. {hTail}" } },
    { to: [9, "done"] },
  ] };
  // ---------- Crane's offer (M3): a standing buy-out. Price formula and its tests: endings.js, tests/test-offer.js ----------
  // Crane's voice: he is formal and pedantic, uses "Item:" only now and then as a list marker, and he delivers Corvin Vane's offer reluctantly, as an instructed messenger.
  R.offer = { id: "offer", steps: [ // starts with {} ; `first`: the day-1 scene
    { calc: "offerFacts" },
    { pick: "intro", cases: [
      [{ speak: "crane", text: "I am instructed to convey an offer from Corvin Vane for {farm}. Item: {price|money}, in coin, today. I do not recommend it.", buttons: ["No. The farm stays.", "Sell {farm} for {price|money}"], as: "c" }],
      [{ speak: "crane", text: "Cash is {cash|money}, and {wages|money} of wages fall due. I am instructed to repeat the offer for {farm} at a reduced {price|money}, and I still do not recommend it.", buttons: ["No. The farm stays.", "Sell {farm} for {price|money}"], as: "c" }],
      [{ speak: "crane", text: "Item: Corvin Vane's offer for {farm} stands at {price|money}. I am obliged to say so.", buttons: ["No. The farm stays.", "Sell {farm} for {price|money}"], as: "c" }]] },
    { if: { eq: ["c", 0] }, then: [{ pin: ["offer", "Crane's offer", "{price|money} now", "Day {day} · money now, farm later"] }, { end: 1 }] },
    { speak: "maud", text: "That is {price|money} now, and the season ends here. Is it a fair price for {farm}, or is it the price of being frightened?", buttons: ["Keep the farm", "Sell. It's done."], as: "sure" },
    { if: { eq: ["sure", 0] }, then: [{ end: 1 }] },
    { verb: "sell" },
  ] };
  const RECORDS = Object.values(R);
  const api = { RECORDS, BY: R, TITLES, LETTERS, WEEKS, PAGES, GOALS };
  if (typeof window !== "undefined") window.Lessons = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
