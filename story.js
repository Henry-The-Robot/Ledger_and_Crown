// Spring at Thornfield — the story: "The Uncle's Ledger", chapters 1-9 (projects/mba-game/STORY-year-one.md).
// Every concept runs Show -> Try -> Use -> Keep: Maud does it once with the player's real numbers (UI highlighted),
// the player types the next number and Maud checks it (a hint when wrong, never the answer), a later situation uses
// it unprompted, and it lands in Maud's notebook (N). Coaching fades: from chapter 6 Maud shows less; in chapter 8
// she only asks. Method: worked examples that fade into problems (Atkinson, Renkl & Merrill 2003; Renkl 2014).
// Curriculum: C1.01, C1.04, C0.02, C1.02, C2.09, C1.06, C5.01, C1.08. Runs on the game's G API (game.js).
window.Story = (function () {
  const S = Spring, B = Books, TR = Transcript;
  let G, st = fresh();
  const TITLES = ["", "The bailiff", "Harvest and the bakery", "First seed", "Hobb pays later", "Wages day", "Tomas's terms", "Ezra", "The Duke's steward", "Closing the books"];
  const PAGES = [
    "Spring. Best harvest in ten years. Sold every sack. So why is the chest always empty?",
    "Hobb's my best customer. Pays like clockwork, fourteen days after. I'll be fine till then.",
    "Maud keeps drawing me calendars of coin. I keep telling her: the Ledger shows a profit.",
    "The Duke wants grain, more than I've ever grown. Ezra will lend me the seed money. It's the making of us.",
    "Profit every year. Never once enough coin on wages day. If someone reads this: watch the chest, not the Ledger.",
  ];
  function fresh() { return { ch: 1, stage: "intro", notebook: [], pages: [] }; }
  function init(g, saved) { G = g; st = saved || fresh(); goal(); }
  const goalText = () => ({
    "intro": "Chapter 1 · The bailiff: walk with Crane and tap what the farm owns",
    "harvest2": "Chapter 2 · Harvest: the three ripe plots are in the field (E, or tap Act)",
    "tomas2": "Chapter 3 · First seed: buy seed from Tomas (east along the path, the green roof)",
    "plant2": "Chapter 3 · First seed: plant your seed (E on tilled soil, then E again to water)",
    "ashby3": "Chapter 2 · The bakery: agree a price with Widow Ashby (red roof)",
    "ship3": "Chapter 2 · The bakery: ship Ashby's sacks from your shipping crate (by the house)",
    "hobb4": "Chapter 4 · Hobb pays later: see Hobb at the mill",
    "ship4": "Chapter 4 · Hobb pays later: ship Hobb's sacks from the crate",
    "sleep5": "Chapter 5 · Wages day: sleep, and Maud will meet you in the morning",
    "tomas6": "Chapter 6 · Tomas's terms: buy your next seed from Tomas on account",
    "ezra7": "Chapter 7 · Ezra: ask the moneylender about a loan (purple roof)",
    "sleep8": "Chapter 8 · The Duke's steward: sleep; he arrives tomorrow",
    "duke8": "Chapter 8 · The Duke's steward: he's waiting by the well",
    "run9": "Chapter 9 · Run the farm to the end of spring (day 28), then close the books",
    "done": "Spring is closed. Your notebook (N) has everything you learned.",
  })[st.stage] || "";
  function goal() { G.goal(goalText(), st.ch); }
  function to(ch, stage) { st.ch = ch; st.stage = stage; G.s.quiet = ch <= 4; goal(); G.save(); }
  async function page(i) { if (st.pages.indexOf(i) < 0) st.pages.push(i); await G.page(PAGES[i]); }
  function addEx(id, more) { const n = st.notebook.find(x => x.id === id); if (n) n.example += " " + more; }
  function keep(id, term, line, example) { if (!st.notebook.some(n => n.id === id)) st.notebook.push({ id, term, line, example }); G.toast(`Maud's notebook: ${term} (N)`); }
  const tell = (t, spot) => G.say("maud", t, null, spot);
  const ask = (t, answer, hints, spot, tol, docs, work, how) => G.ask("maud", t, answer, hints, spot, tol, docs, work, how);
  // Only answers the player got on their own count as evidence: a walk-through or a reported skip adds nothing.
  const mastered = id => { if (!window.__walked) TR.master(id, G.s.day); }; // evidence of skill, not instant mastery (transcript.js)
  // Document buttons for Try beats: the player finds the numbers in their own books (hints say where, never the sum).
  const DOC = {
    ledger: { label: "Open the Ledger", open: () => G.ledger() },
    notebook: { label: "Open Maud's notebook", open: () => G.notebook() },
    forecast: (n, title) => ({ label: "Open the cash forecast", open: () => G.board({ title, n, noClose: true, fill: [] }) }),
  };

  // ---------- chapter 1: the bailiff (C1.01) — WS3 cold open: the `tag` verb builds the balance sheet, then one More/Less choice ----------
  // Replaces the two typed sums (liabilities, equity). Every number comes from the opening balances (Spring.balanceSheet), never a literal.
  async function ch1() {
    const V = Verbs, W = G.world, b = S.balanceSheet(G.s.bal), s0 = G.s, cost = S.R.unitCost;
    V.parchReset(); V.craneOn = true;
    await G.say("crane", "Edric's heir. The Crown sent me to list what's yours before Midwinter. Walk with me.", ["Walk with you"]);
    const sackVal = s0.sacks * cost, cropPlots = () => s0.plots.filter(p => p.crop), cropVal = cropPlots().reduce((a, p) => a + p.crop.cost, 0);
    G.toast("Crane taps the chest: Cash.");
    const tagging = V.tag({
      show: 1, hintAfter: window.__hintAfter,
      targets: [
        { id: "chest", tiles: [[W.CHEST.x, W.CHEST.y]], line: "Cash (the chest)", value: b.cash },
        { id: "sacks", tiles: [[W.SACKS.x, W.SACKS.y], [W.CRATE.x, W.CRATE.y]], line: `Sacks: ${s0.sacks} at ${cost}`, value: sackVal },
        { id: "crops", tiles: () => cropPlots().map(p => [p.x, p.y]), line: `Crops in the ground (${cropPlots().length} plots, at cost)`, value: cropVal },
      ],
      decoys: [
        { tiles: [[W.FWELL.x, W.FWELL.y]], says: "That's the village's well. Not yours." },
        { tiles: [[12, 3], [12, 2], [15, 3], [15, 2], [18, 4], [18, 3]], says: "The trees are the Duke's." },
        { tiles: [[W.BOARD.x, W.BOARD.y], [W.BOARD.x, W.BOARD.y - 1]], says: "The notice board belongs to the village." },
      ],
    });
    V.remark(`Cash, ${b.cash}.`); await V.wait(window.__fastVerbs ? 0 : 1600);
    V.remark("Find the rest. Everything this farm owns.");
    await tagging;
    await V.countTotal("aTot", s0.bal.cash + sackVal + cropVal);
    await G.say("crane", "Good. Now what it owes. I brought the papers myself.", ["Show me"]);
    V.pinRow("liab", "Ezra's note (the loan)", b.loan); await V.wait(window.__fastVerbs ? 0 : 700);
    V.pinRow("liab", "The Crown's writ, due at Midwinter", b.crown); await V.wait(window.__fastVerbs ? 0 : 500);
    await V.countTotal("lTot", b.liab);
    const c = await G.say("crane", "Before I stamp it, heir: is this farm worth more than nothing, or less?", ["More", "Less"]);
    V.P.eq = b.equity; V.parch();
    await V.stamp(`Owner's equity ${V.fmt(b.equity)}`, `${b.assets.toLocaleString("en-US")} owned − ${b.liab.toLocaleString("en-US")} owed`);
    const right = (c === 1) === (b.equity < 0);
    await G.say("crane", right ? "You've a head for it. Pity." : "Less. Much less.", ["Next"]);
    V.craneOn = false; document.querySelectorAll(".vstamp").forEach(x => x.remove());
    await tell(`Don't mind Crane. What you own minus what you owe is yours, and yours is ${b.equity < 0 ? "below zero" : "thin"}. That's why we work.`);
    await tell("The far field's ripe. Harvest it (walk up, press E or tap Act) and Ashby the baker will buy.");
    if (right) mastered("equation");
    keep("equation", "Assets = Liabilities + Owner's equity", "What you own, minus what you owe, is yours. It can be below zero.", `Day 1: ${b.assets} = ${b.liab} + (${b.equity}).${right ? "" : " You guessed more; the page says less."}`);
    V.parchClose(); to(1, "harvest2");
  }
  // ---------- chapter 3: first seed (C1.04: cost becomes inventory, not an expense yet) — WS3: no typed question; Maud says one line ----------
  async function ch2() {
    const sc = S.R.seedCost, per = S.R.sacksPerPlot;
    await G.say("tomas", `Seed is ${sc} a packet. One packet plants one plot; a plot gives ${per} sacks of wheat.`);
    await tell("Let me buy the first three, so you can see where the coin goes.");
    G.act(() => S.buySeeds(G.s, 3, false));
    await tell(`Cash went down ${3 * sc}. Inventory went up ${3 * sc}. Changed shape, not spent.<br>Seed only becomes a cost when the grain is sold.`, ["h-cash", "h-inv"]);
    const inv0 = G.s.bal.inv;
    await G.say("tomas", "Six more?", [`Buy 6 packets for Cash (${6 * sc})`]);
    G.act(() => S.buySeeds(G.s, 6, false));
    keep("inventory", "Inventory", "Buying seed isn't spending: Cash becomes Inventory, at cost, until it's sold.", `Day ${G.s.day}: 6 packets, Cash −${6 * sc}, Inventory +${6 * sc} (${inv0} → ${G.s.bal.inv}).`);
    st.planted0 = G.s.plots.filter(p => p.crop).length; to(3, "plant2");
  }
  // ---------- chapter 2: the bakery (C1.04, C0.02: revenue, COGS, gross profit, margin) — WS3: the typed floor becomes the walk-away line ----------
  async function ch3() {
    const cost = S.R.unitCost, pct = p => Math.round((p - cost) / p * 100);
    const o = G.s.offers.find(x => x.who === "ashby") || S.addOffer(G.s, "ashby", 6, 7, 0, 4, 4); S.setPrice(G.s, o.id, 7);
    await G.say("ashby", "So you're Edric's heir. I need 6 sacks for the ovens. I'll give you 7 a sack, Cash.");
    await tell(`Each sack cost you ${cost}: ${S.R.seedCost} of seed for ${S.R.sacksPerPlot} sacks. At 7 you keep ${7 - cost} a sack. That's gross profit.<br>${7 - cost} out of every 7 is ${pct(7)}%: your margin.`, ["h-inv"]);
    // The worked example goes in the notebook as it's shown, so the Try that follows can point to it.
    keep("margin", "Gross profit & margin", "Price minus cost per sack is gross profit. Divide by the price: margin. Never go below your floor (your cost per sack).", `Maud at 7: 7 − ${cost} = ${7 - cost} profit a sack; ${7 - cost} ÷ 7 = ${pct(7)}% margin.`);
    // The floor is asked first, and it is used: it becomes the red walk-away line on the price track in the haggle.
    await ask("Before you name a price: what's your floor? The lowest you'd take for a sack before it loses money.", cost, ["What did each sack cost you? Seed for a plot, divided by the sacks it gives."], null, 0, null, `A packet of seed is ${S.R.seedCost} and gives ${S.R.sacksPerPlot} sacks, so each sack cost ${cost}. Sell below ${cost} and you lose money.`, `Your floor is what one item cost you. If 10 of seed grows 5 sacks, each sack cost 10 ÷ 5 = 2. Below 2, you lose money.`);
    await G.say("ashby", "Times are hard, dear. Would you take 6?");
    await ask("Work it out before you answer. Your margin at 6, in %?", pct(6), ["Look at how I worked it at 7 in my notebook, then do the same at 6.", "Margin compares the profit on one sack with the price the buyer pays."], null, 1, [DOC.notebook], `At 6 you keep 6 − ${cost} = ${6 - cost} a sack. ${6 - cost} ÷ 6 = 0.33, so ${pct(6)}%.`, "Margin = profit on one item ÷ the price you sell it for, × 100. Sell for 10 what cost 6: profit 4, and 4 ÷ 10 × 100 = 40%.");
    mastered("gross"); mastered("margin");
    await tell(`Your floor, ${cost}, is drawn on the price track in red. Sell below it and the sack costs you more than it earns. Name your price; she'll counter. You can always walk away.`);
    const deal = await G.haggle(o, { open: 6, walk: 7, floor: cost, line: "Well, dear? 6 sacks. What do you want for them?" });
    if (!deal) { await G.say("ashby", "Come back when you've thought it over."); return; }
    const price = deal.price;
    await G.say("ashby", `${price} it is. Ship them from your crate and I'll pay on the spot.`);
    addEx("margin", `Your deal: Ashby, 6 sacks at ${price}: ${price - cost} a sack, ${pct(price)}% margin.`);
    to(2, "ship3");
  }
  // ---------- chapter 4: Hobb pays later (C1.02: accounts receivable, accrual vs cash) ----------
  async function ch4() {
    const o = G.s.offers.find(x => x.who === "hobb") || S.addOffer(G.s, "hobb", 9, 9, 14, 5, 4); S.setPrice(G.s, o.id, 9);
    await tell("Before you go in: know your floor price. And listen for when he pays.");
    await G.say("hobb", `Edric's heir! Nine sacks. I pay 14 days after delivery, same as always.`);
    await tell("Your uncle loved Hobb. Hobb always paid. Eventually.");
    const deal = await G.haggle(o, { open: 8, walk: 9, floor: S.R.unitCost, line: "Nine sacks. Name your price; I'm not a charity." });
    if (!deal) { await G.say("hobb", "Suit yourself. The offer stands till tomorrow."); return; }
    to(4, "ship4");
  }
  // WS3: the four typed sums become one bet with a delayed reveal. The player predicts the chest from the timeline (cards, no Cash line),
  // stakes real coin, and is told the answer on the morning after Hobb pays: predicted vs actual, each difference named (Verbs.revealBet).
  async function ch4b(order) {
    const V = Verbs, v = order.value, inv = G.s.invoices.find(x => x.who === "hobb");
    await tell(`The Ledger says you earned ${v} today: Revenue. Look at the chest: it didn't move.`, ["h-ni", "h-cash"]);
    const arNow = S.balanceSheet(G.s.bal).ar;
    await tell(arNow > v
      ? `Hobb's ${v} joins your Accounts receivable: everything people owe you, ${arNow} in all. Hobb's part is due day ${inv.due}. Two books, and Edric only read one.`
      : `The ${v} is your Accounts receivable now: Hobb owes it, due day ${inv.due}. Two books, and Edric only read one.`, ["h-ar", "coin"]);
    const n = inv.due - G.s.day + 1, last = () => { const r = S.forecast(G.s, n); return r[r.length - 1]; };
    const tl = { label: "Open the timeline", open: () => V.timeline({ mode: "show", n, hideLine: true, title: `Cash events, today to day ${inv.due}`, maud: "Every coin coming in and going out. I've hidden the Cash line: that's your job." }) };
    const r = await V.bet({ prompt: `Five coin says you can't tell me what's in the chest the morning after Hobb pays (day ${inv.due + 1}), if you buy nothing more.`, docs: [tl, DOC.ledger],
      how: "Cash now, plus every coin that comes in, minus every coin that goes out, up to that day. The timeline shows each one.", stake: { min: 0, max: 5 }, tol: 0, answer: () => last().close, reveal: { day: inv.due + 1 }, kind: "hobb",
      explain: () => "Revenue counted the day you delivered; the coin came today. Two books." });
    keep("ar", "Accounts receivable", "Revenue counts when you deliver; the Cash comes when they pay. In between, it's a receivable.", `Hobb: ${v} of Revenue on day ${G.s.day}, Cash on day ${inv.due}. You said ${r.guess}${r.stake ? ` and staked ${r.stake}` : ""}.`);
    await page(1); to(5, "sleep5");
  }
  // the bet's morning: runs whenever the story is free on or after the reveal day
  async function revealIfDue() { if (!G.s.bet || G.s.day < G.s.bet.revealDay) return; const r = await Verbs.revealBet(); if (r && r.win) { mastered("accrual"); mastered("ar"); } }
  // ---------- chapter 5: wages day (C2.09: working capital, the cash forecast) ----------
  // WS3: no warning beforehand (Kapur: struggle first). The engine decides at the day-7 sleep: if Cash can't cover wages a farmhand walks off.
  async function ch5() {
    const V = Verbs, walked = !!G.s.walkedOff;
    await tell(walked ? `Jory walked off last night: ${G.s.walkedWages} in wages and the chest couldn't find them. The crops went unwatered. The Ledger said profit. The chest said no.`
      : "Wages went out last night. Closer than the Ledger makes it look.", ["h-cash"]);
    const f = S.forecast(G.s, 14), low = f.reduce((a, x) => x.close < a.close ? x : a);
    await V.timeline({ mode: "show", n: 14, title: "Your next two weeks", maud: `Every coin coming and going, with Cash under it. The low point is day ${low.day}, Cash ${low.close}. ${low.close < 60 ? "That's where Edric lived." : "Watch that dip."}` });
    if (!walked) mastered("wc");
    await G.say("tomas", "I only mark up my seed 50%. Honest trade.");
    const m = Math.round(50 / 150 * 100);
    const r = await V.bet({ prompt: "Two coin says you can't tell me Tomas's margin on his seed. He marks it up 50%.", docs: [DOC.notebook], how: "Markup divides the profit by what the seed cost him. Margin divides the same profit by the price he sells at. If it cost him 100 and he sells at 150, the profit is 50.", stake: { min: 0, max: 2 }, tol: 1, answer: () => m, reveal: "now", kind: "markup",
      explain: () => "Markup is profit ÷ cost, 50%. Margin is profit ÷ price, 50 ÷ 150 = 33%. Same sale, two numbers." });
    if (r.win) mastered("margin");
    keep("forecast", "Cash forecast", "Cash at the start + cash in − cash out, day by day. Profit doesn't pay wages; Cash does.", `Day ${G.s.day}: lowest Cash in two weeks ${low.close}, on day ${low.day}.${walked ? " Jory walked off on wages day." : ""} Markup 50% = margin ${m}%.`);
    await page(2); to(6, "tomas6");
  }
  // ---------- chapter 6: Tomas's terms (C1.06: accounts payable, the cost of trade credit) ----------
  async function ch6() {
    await G.say("tomas", "On account: the full bill in 14 days, or 2% off if you pay within 7.");
    await tell("On a bill of 100, 2% is 2. Pay a week early and you keep 2; wait, and you keep the Cash a week longer.", ["h-ap"]);
    const c = await G.say("tomas", "How many on account?", ["6 packets (72)", "9 packets (108)"]);
    const r = G.act(() => S.buySeeds(G.s, c ? 9 : 6, true));
    if (!r.ok) { await G.say("tomas", r.msg); return; }
    const bill = G.s.bills[G.s.bills.length - 1];
    const V = Verbs, r2 = await V.timeline({ mode: "play", bill, n: Math.max(14, bill.due - G.s.day + 1), title: "When do you pay Tomas?", maud: `Your Tomas bill is ${bill.amount}. Move it: pay by day ${bill.discBy} and you save ${bill.disc}; pay later and you keep the coin. But the Cash has to be there on day ${bill.due}.` });
    mastered("ap");
    const pay = r2.paidNow ? 0 : 1; if (r2.paidNow) G.act(() => S.payBills(G.s)); else if (r2.day < bill.due) G.s.payPlan = { day: r2.day };
    keep("ap", "Accounts payable & trade credit", "What you owe a supplier. Free credit until the due day; paying early can buy a discount.", `Day ${G.s.day}: seed bill ${bill.amount}, 2% off by day ${bill.discBy} = ${bill.disc}; you ${pay === 0 ? "paid early" : r2.day < bill.due ? `planned to pay on day ${r2.day}` : "kept the Cash"}.`);
    to(7, "ezra7");
  }
  // ---------- chapter 7: Ezra (C1.06, C5.01: debt, interest, what lenders read) ----------
  async function ch7() {
    const t0 = S.terms(G.s);
    await G.say("ezra", `You want coin. Everyone does. My rate is ${t0.rateBp / 100}% a week. Show me your forecast first, and I'll see.`);
    const r = await Verbs.timeline({ mode: "predict", n: 14, tol: 5, title: "Your forecast, for Ezra", maud: "Ezra: tell me your lowest coin in the next two weeks, and the day. Get both right (the coin within 5) and I will shave my rate." });
    G.s.rateAdj = Math.min(100, 50 * ((r.okLow ? 1 : 0) + (r.okDay ? 1 : 0))); const t = S.terms(G.s);
    mastered("tvm");
    const c = await G.say("ezra", `The line says ${r.low} on day ${r.lowDay}. ${r.okLow && r.okDay ? "You know your coin." : r.okLow || r.okDay ? "Half right." : "Sloppy."} Your rate: ${t.rateBp / 100}% a week (was ${t0.rateBp / 100}%). How much?`,
      ["Borrow 100", "Borrow 200", "Nothing today"]);
    if (c < 2) G.act(() => S.borrow(G.s, c ? 200 : 100));
    keep("tvm", "Interest", "The price of Cash now: the rate times the loan, every week. A forecast a lender can trust buys a lower rate.", `Ezra's rate went from ${t0.rateBp / 100}% to ${t.rateBp / 100}% a week after your forecast.${c < 2 ? ` You borrowed ${c ? 200 : 100}: ${Math.round((c ? 200 : 100) * t.rateBp / 10000)} interest a week.` : ""}`);
    to(8, "sleep8");
  }
  // ---------- chapter 8: the Duke's steward (C2.09 overtrading; case W.T. Grant). Maud asks; she doesn't show. ----------
  function ch8arrive() { if (!G.s.offers.some(o => o.who === "duke")) S.addOffer(G.s, "duke", 90, 10, 21, 12, 4); to(8, "duke8"); }
  async function ch8() {
    const o = G.s.offers.find(x => x.who === "duke"); if (!o) { to(9, "run9"); return; }
    await G.say("duke", "His Grace orders 90 sacks at 10: 900 of Revenue. Due in 12 days; he pays 21 days after delivery.");
    await page(3);
    await tell("This is the order that killed your uncle. I won't tell you what to do. I'll ask.");
    const need = Math.max(0, Math.ceil((90 + S.committed(G.s) - G.s.sacks - S.sacksComing(G.s)) / 3) - G.s.seeds), extra = need * 12;
    const f = S.forecast(G.s, 14, extra), low = f.reduce((a, x) => x.close < a.close ? x : a);
    await G.board({ title: `What if: you take it and buy ${need} packets of seed today (${extra})`, show: 14, fill: [], extra, maud: "Read your own board. Then answer me." });
    await ask("If you take it and buy the seed today, what's the lowest Cash in the next two weeks?", low.close, ["Look down the closing Cash column for the smallest number.", "A minus sign means the chest is empty before then."], null, 0, [{ label: "Open the what-if forecast", open: () => G.board({ title: `What if: you take it and buy ${need} packets of seed today (${extra})`, show: 14, fill: [], extra }) }], `Going down the closing Cash column, the smallest number is ${low.close}, on day ${low.day}.`, "Open the forecast and read down the Closing Cash column. The smallest number is your lowest point; a minus number is smaller than any plus.");
    const c = await G.say("duke", "Well? His Grace doesn't wait.", ["Take all 90", "Offer 45 (half)", "Decline"]);
    if (c === 1) { S.addOffer(G.s, "duke", 45, 10, 21, 12, 4); S.decline(G.s, o.id); G.act(() => S.accept(G.s, G.s.offers.find(x => x.who === "duke").id)); }
    else if (c === 0) G.act(() => S.accept(G.s, o.id)); else S.decline(G.s, o.id);
    const wise = low.close >= 0 ? true : c > 0;
    if (wise) mastered("overtrading");
    await tell(c === 0 && low.close < 0 ? `Your own board says Cash goes to ${low.close}. Edric did the same. Borrow, or sell his invoice to Ezra for 85% (factoring), or it ends the same way.`
      : c === 0 ? "Your board says you can carry it. Then carry it." : "Growth you can't fund isn't growth. Edric never learned that.");
    keep("overtrading", "Overtrading", "Taking more orders than your Cash can carry: profit on paper, broke in fact. Forecast before you say yes.", `The Duke's 90 sacks: lowest Cash ${low.close} on day ${low.day} if taken. You chose: ${["all 90", "half", "to decline"][c]}.`);
    to(9, "run9");
  }
  // ---------- chapter 9: closing the books (C1.08), guided ----------
  async function close(stm, h) { // the game shows the statements one at a time; the player finds where the cash went
    await G.reveal("is", `Your income statement: Revenue, minus the cost of what you sold, minus running costs. Net income ${stm.is.net}. Edric's always looked like this.`);
    await G.reveal("bs", `Your balance sheet, start and end: what you own and what you owe. Owner's equity moved by exactly your net income.`);
    await G.reveal("cf", `And the cash-flow statement: net income, then every place the Cash actually went. It ends at the change in Cash: ${stm.cf.change}.`);
    const target = (h.lines.find(l => l.startsWith("cf:")) || "cf:cfo");
    await G.pickLine("Net income " + stm.is.net + ", Cash " + (stm.cf.change >= 0 ? "+" : "") + stm.cf.change + ". Click the line in the cash-flow statement where most of the difference went.", target,
      ["Look at the brackets: they're Cash that left, or never came.", "The biggest bracketed number between Net income and Cash from operations."]);
    mastered("cfs"); mastered("statements");
    await G.reveal("none", `${h.text}<br>That's what killed Edric: profit in the Ledger, the coin in other people's purses.`);
    if (st.pages.indexOf(4) < 0) st.pages.push(4);
    await G.reveal("none", `<span class="journal small">Edric's last page: “${PAGES[4]}”</span>`);
    keep("statements", "The three statements", "Income statement: did you make a profit? Balance sheet: what you own and owe. Cash-flow statement: where the Cash went.", `Spring: net income ${stm.is.net}, Cash ${stm.cf.change >= 0 ? "up" : "down"} ${Math.abs(stm.cf.change)}. ${h.text.split(": ").pop()}`);
    to(9, "done");
  }

  // ---------- hooks from the game ----------
  let busy = false;
  async function run(fn, ...a) { if (busy) return; busy = true; window.__walked = false; try { await fn(...a); } finally { busy = false; G.hud(); } }
  function start() { if (st.stage === "intro") run(ch1); }
  function onTalk(who) { // returns true when the story takes the conversation
    if (busy) return true;
    const m = { tomas: { tomas2: ch2, tomas6: ch6 }, ashby: { ashby3: ch3 }, hobb: { hobb4: ch4 }, ezra: { ezra7: ch7 }, duke: { duke8: ch8 } }[who];
    if (m && m[st.stage]) { run(m[st.stage]); return true; }
    if (who === "maud" && st.ch < 9 && st.stage !== "done") { run(() => tell(`Next: ${goalText().split(": ").slice(1).join(": ")}`)); return true; }
    return false;
  }
  function after(evt, info) {
    if (evt === "morning" && G.s.payPlan && G.s.day >= G.s.payPlan.day) { G.s.payPlan = null; G.act(() => S.payBills(G.s)); G.toast("You paid Tomas, as planned."); }
    if (busy) return;
    if (evt === "plant" && st.stage === "plant2" && (G.s.seeds === 0 || G.s.plots.filter(p => p.crop).length - (st.planted0 || 0) >= 6))
      run(async () => { await tell("Good. Water them every day; four nights and it's grain. Now: Hobb at the mill wants grain too."); to(4, "hobb4"); });
    if (evt === "harvest" && st.stage === "harvest2" && !G.s.plots.some(p => p.crop && S.stage(G.s, p) === 4))
      run(async () => { await tell(`${G.s.sacks} sacks in the barn now. Ashby at the bakery (red roof) is waiting.`); await page(0); to(2, "ashby3"); });
    if (evt === "deliver" && st.stage === "ship3" && info.who === "ashby")
      run(async () => { const cg = info.sacks * S.R.unitCost; await tell(`Revenue ${info.value}, Cost of goods sold ${cg}: gross profit ${info.value - cg}. And it came in as Cash, today.<br>Now seed: Tomas has the next packets (east along the path, green roof).`, ["h-cash", "h-ni"]); to(3, "tomas2"); });
    if (evt === "deliver" && st.stage === "ship4" && info.who === "hobb") run(ch4b, info);
    if (evt === "morning" && st.stage === "sleep5" && G.s.day >= 8) run(async () => { await ch5(); await revealIfDue(); });
    else if (evt === "morning" && G.s.bet && G.s.day >= G.s.bet.revealDay) run(revealIfDue);
    if (evt === "morning" && st.stage === "sleep8") run(async () => { ch8arrive(); await tell("The Duke's steward is in the square. He's asking for you by name."); });
  }
  const quietOffers = () => st && st.ch <= 4; // no stray orders while the first lessons run
  return { init, start, onTalk, after, close, quietOffers, goalTexts: goalText, get state() { return st; }, get busy() { return busy; }, TITLES, PAGES, fresh };
})();
