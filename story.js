// Spring at Thornfield — the story: "The Uncle's Ledger" as a FOUR-WEEK season (WS6; projects/mba-game/SEASON-1-REDESIGN.md §2, §4, §7).
// Structure: Blake Snyder's beat sheet (Save the Cat, 2005) across four weeks, the detective-fiction "fair play" rule (every clue is
// planted before the reveal: the case board pins one per lesson), and kishotenketsu inside each week. Calendar weeks drive the
// title cards and the goal ribbon (day 1/8/15/22); the lesson stages below are the existing chapters, mapped into the weeks:
//   Week 1 "The writ"        (days 1-7)   Crane's stamp, Crane's offer, harvest, Ashby, Tomas, Hobb
//   Week 2 "Promises"        (days 8-14)  wages day, Tomas's terms (time value), Ezra's forecast, MIDPOINT day 12: Corvin Vale's first order, Edric's page
//   Week 3 "The squeeze"     (days 15-21) Corvin's double order, events, Tomas offers again (the answer can flip), Crane's "mercy" visits
//   Week 4 "The reckoning"   (days 22-28) Edric's cash book, close the books, the verdict + ending (the Audit duel is WS8)
// Every concept runs Show -> Try -> Use -> Keep: Maud does it once with the player's real numbers (UI highlighted),
// the player types the next number and Maud checks it (a hint when wrong, never the answer), a later situation uses
// it unprompted, and it lands in Maud's notebook (N) AND on the case board. Coaching fades on a schedule the player can see:
// week 1 Maud shows, week 2 she asks, week 3 she bets, week 4 she is silent but for danger. Method: worked examples that fade
// into problems (Atkinson, Renkl & Merrill 2003; Renkl 2014).
// Curriculum: C1.01, C1.04, C0.02, C1.02, C2.09, C0.01/C5.01 (time value, ch6), C1.01/C1.03 (unearned revenue), C1.08. Runs on the game's G API (game.js).
window.Story = (function () {
  const S = Spring, B = Books, TR = Transcript;
  let G, st = fresh();
  const TITLES = ["", "The bailiff", "Harvest and the bakery", "First seed", "Hobb pays later", "Wages day", "Tomas's terms", "Ezra", "The Duke's steward", "Closing the books"];
  const WEEKS = [null,
    { title: "The writ", line: "Rain, a gate, and a stranger with a ledger.", maud: "This week I'll show you. Watch the numbers." },
    { title: "Promises", line: "Wages fall due, and the Duke's steward is coming.", maud: "This week I'll ask, not tell." },
    { title: "The squeeze", line: "Everyone you promised now wants something.", maud: "This week I'll bet with you, not coach you." },
    { title: "The reckoning", line: "Edric's last book, and the Crown's collector.", maud: "This week I'm silent unless the farm is in danger." },
  ];
  const weekOf = d => Math.min(4, Math.max(1, Math.ceil(d / 7)));
  const farmName = () => (st && st.farm) || "Thornfield";
  const PAGES = [
    "Spring. Best harvest in ten years. Sold every sack. So why is the chest always empty?",
    "Hobb's my best customer. Pays like clockwork, fourteen days after. I'll be fine till then.",
    "Maud keeps drawing me calendars of coin. I keep telling her: the Ledger shows a profit.",
    "The Duke wants grain, more than I've ever grown. Ezra will lend me the seed money. It's the making of us.",
    "Profit every year. Never once enough coin on wages day. If someone reads this: watch the chest, not the Ledger.",
    // WS6: the midpoint page, found the night Corvin Vale brings his order. Numbers are the game's own constants (S.R.duke).
    `Corvin Vale was here again with the Duke's order: ${S.R.duke.sacks} sacks at ${S.R.duke.price}, paid ${S.R.duke.terms} days after delivery. The same order as last spring. The same as the spring before. I sign, I borrow for seed, and by Midwinter I'm begging Ezra. I begin to think he counts on it.`,
  ];
  function fresh() { return { ch: 1, stage: "intro", notebook: [], pages: [], clues: [], weeks: [], farm: "Thornfield" }; }
  function init(g, saved) { G = g; st = Object.assign(fresh(), saved || {}); goal(); }
  // Objective text per stage ("Title: what to do"); the ribbon adds "Week N · <title>" in front (see goal()).
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
    "sleep8": "The steward: run the farm and sleep; Corvin Vale comes to the well on day 12",
    "duke8": "The steward: Corvin Vale is waiting by the well",
    "page8": "The page: sleep, and Maud will show you what she found",
    "sleep9": "The squeeze: run the farm and sleep; Corvin Vale returns on day 15",
    "duke9": "The squeeze: Corvin Vale is back at the well",
    "tomas9": "Tomas offers again: Ezra's rate has moved; see Tomas on account",
    "run9": "Run the farm to the end of spring (day 28), then close the books",
    "done": "Spring is closed. Your notebook (N) and case board have everything you learned.",
  };
  const goalText = () => GOALS[st.stage] || "";
  function goal() { const w = weekOf(G.s.day); G.goal(goalText(), st.ch, `${w === 0 ? "" : "Week " + w} · ${WEEKS[w].title}`); }
  function to(ch, stage) { if (window.Verbs) Verbs.parchClose(); /* a lesson page never outlives its stage */ st.ch = ch; st.stage = stage; G.s.quiet = ch <= 4; goal(); G.save(); }
  // ---------- the case board (item 5): every lesson and journal page pins a clue; WS8's Ledger Duel reads Story.state.clues ----------
  // clue = { id, term, num (the player's own number, as text), from (where it came from), day, kind: "lesson" | "page" | "book" }
  function pin(id, term, num, from, kind) {
    if (st.clues.some(c => c.id === id)) return;
    st.clues.push({ id, term, num, from: from || `Day ${G.s.day}`, day: G.s.day, kind: kind || "lesson" });
    G.toast(`Pinned to the case board: ${term}`);
  }
  async function page(i) { if (st.pages.indexOf(i) < 0) st.pages.push(i); await G.page(PAGES[i]); pin("page" + i, `Edric's page ${i + 1}`, `“${PAGES[i].split(/[.?]/)[0]}…”`, `Day ${G.s.day} · Edric's journal`, "page"); }
  // ---------- week title cards: one line, tap to dismiss (never blocks the story; fades by itself) ----------
  function weekCard(w, hold) {
    document.querySelectorAll(".wkcard").forEach(e => e.remove());
    const e = document.createElement("div"); e.className = "wkcard"; e.setAttribute("role", "status");
    e.innerHTML = `<div class="wk-farm">${farmName()}</div><div class="wk-n">Week ${w} of 4</div><div class="wk-t">${WEEKS[w].title}</div><div class="wk-l">${WEEKS[w].line}</div><div class="wk-m"><b>Maud:</b> ${WEEKS[w].maud}</div><div class="wk-tap">Tap to dismiss</div>`;
    e.onclick = () => e.remove(); document.getElementById("wrap").appendChild(e);
    if (!hold) setTimeout(() => e.remove(), 7000);
    return e;
  }
  const dueCard = () => { const d = G.s.day, w = weekOf(d); if (d === 1 + 7 * (w - 1) && st.weeks.indexOf(w) < 0) { st.weeks.push(w); return w; } return 0; };
  function addEx(id, more) { const n = st.notebook.find(x => x.id === id); if (n) n.example += " " + more; }
  // keep: the notebook entry, plus (WS6) a clue card on the case board: num = the player's own number as text, from = where it came from.
  function keep(id, term, line, example, num, from) {
    if (!st.notebook.some(n => n.id === id)) st.notebook.push({ id, term, line, example }); G.toast(`Maud's notebook: ${term} (N)`);
    pin(id, term, num || example.split(".")[0], from);
  }
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
    document.querySelectorAll(".vstamp").forEach(x => x.remove());
    // WS6: the writ needs a name (item 10), and Crane makes his standing offer (M3, item 3), both while he's still standing in the yard
    await G.say("crane", "The writ needs a name for the land, heir. What do I write?", ["Give it a name"]);
    await nameFarm(); V.P.title = farmName(); V.parch();
    await G.say("crane", `${farmName()}. A fine name for an estate I'll be selling by Midwinter.`, ["Next"]);
    await craneOffer({ first: true });
    if (G.s.over) return; // sold on day 1: the ending has been shown
    V.craneOn = false;
    await tell(`Don't mind Crane. What you own minus what you owe is yours, and yours is ${b.equity < 0 ? "below zero" : "thin"}. That's why we work.`);
    await tell("Profit is an opinion. Cash is a fact."); // WS6: the theme, stated once, early
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
    // (the timeline above is something to read, not an answer, so it earns no mastery; the forecast Ezra asks for in chapter 7 does)
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
    if (r2.saved > 0 && r2.low >= 0) mastered("ap"); // right = took the discount and the plan never empties the chest
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
    if (r.okLow && r.okDay) { mastered("tvm"); mastered("wc"); } // right = the lowest coin (within 5) and the day
    const c = await G.say("ezra", `The line says ${r.low} on day ${r.lowDay}. ${r.okLow && r.okDay ? "You know your coin." : r.okLow || r.okDay ? "Half right." : "Sloppy."} Your rate: ${t.rateBp / 100}% a week (was ${t0.rateBp / 100}%). How much?`,
      ["Borrow 100", "Borrow 200", "Nothing today"]);
    if (c < 2) G.act(() => S.borrow(G.s, c ? 200 : 100));
    keep("tvm", "Interest", "The price of Cash now: the rate times the loan, every week. A forecast a lender can trust buys a lower rate.", `Ezra's rate went from ${t0.rateBp / 100}% to ${t.rateBp / 100}% a week after your forecast.${c < 2 ? ` You borrowed ${c ? 200 : 100}: ${Math.round((c ? 200 : 100) * t.rateBp / 10000)} interest a week.` : ""}`);
    to(8, "sleep8");
  }
  // ---------- chapter 8: the Duke's steward (C2.09 overtrading; case W.T. Grant). Maud asks; she doesn't show. ----------
  function ch8arrive() { if (!G.s.offers.some(o => o.who === "duke")) S.addOffer(G.s, "duke", S.R.duke.sacks, S.R.duke.price, S.R.duke.terms, S.R.duke.dueIn, 4); to(8, "duke8"); }
  async function ch8() {
    const o = G.s.offers.find(x => x.who === "duke"); if (!o) { to(9, "run9"); return; }
    const D = S.R.duke, half = Math.round(D.sacks / 6) * 3;
    await G.say("duke", `His Grace orders ${D.sacks} sacks at ${D.price}: ${(D.sacks * D.price).toLocaleString("en-US")} of Revenue. Due in ${D.dueIn} days; he pays ${D.terms} days after delivery.`);
    await page(3);
    await tell("This is the order that killed your uncle. I won't tell you what to do. I'll ask.");
    const need = Math.max(0, Math.ceil((D.sacks + S.committed(G.s) - G.s.sacks - S.sacksComing(G.s)) / 3) - G.s.seeds), extra = need * 12;
    const f = S.forecast(G.s, 14, extra), low = f.reduce((a, x) => x.close < a.close ? x : a);
    await G.board({ title: `What if: you take it and buy ${need} packets of seed today (${extra})`, show: 14, fill: [], extra, maud: "Read your own board. Then answer me." });
    await ask("If you take it and buy the seed today, what's the lowest Cash in the next two weeks?", low.close, ["Look down the closing Cash column for the smallest number.", "A minus sign means the chest is empty before then."], null, 0, [{ label: "Open the what-if forecast", open: () => G.board({ title: `What if: you take it and buy ${need} packets of seed today (${extra})`, show: 14, fill: [], extra }) }], `Going down the closing Cash column, the smallest number is ${low.close}, on day ${low.day}.`, "Open the forecast and read down the Closing Cash column. The smallest number is your lowest point; a minus number is smaller than any plus.");
    const c = await G.say("duke", "Well? His Grace doesn't wait.", [`Take all ${D.sacks}`, `Offer ${half} (half)`, "Decline"]);
    if (c === 1) { S.addOffer(G.s, "duke", half, D.price, D.terms, D.dueIn, 4); S.decline(G.s, o.id); G.act(() => S.accept(G.s, G.s.offers.find(x => x.who === "duke").id)); }
    else if (c === 0) G.act(() => S.accept(G.s, o.id)); else S.decline(G.s, o.id);
    const wise = low.close >= 0 ? true : c > 0;
    if (wise) mastered("overtrading");
    await tell(c === 0 && low.close < 0 ? `Your own board says Cash goes to ${low.close}. Edric did the same. Borrow, or sell his invoice to Ezra for 85% (factoring), or it ends the same way.`
      : c === 0 ? "Your board says you can carry it. Then carry it." : "Growth you can't fund isn't growth. Edric never learned that.");
    keep("overtrading", "Overtrading", "Taking more orders than your Cash can carry: profit on paper, broke in fact. Forecast before you say yes.", `The Duke's ${D.sacks} sacks: lowest Cash ${low.close} on day ${low.day} if taken. You chose: ${[`all ${D.sacks}`, "half", "to decline"][c]}.`);
    to(9, "run9");
  }
  // ---------- chapter 9: closing the books (C1.08), guided ----------
  async function close(stm, h) { // the game shows the statements one at a time; the player finds where the cash went
    await G.reveal("is", `Your income statement: Revenue, minus the cost of what you sold, minus running costs. Net income ${stm.is.net}. Edric's always looked like this.`);
    await G.reveal("bs", `Your balance sheet, start and end: what you own and what you owe. Owner's equity moved by exactly your net income.`);
    await G.reveal("cf", `And the cash-flow statement: net income, then every place the Cash actually went. It ends at the change in Cash: ${stm.cf.change}.`);
    const target = (h.lines.find(l => l.startsWith("cf:")) || "cf:cfo");
    const misses = await G.pickLine("Net income " + stm.is.net + ", Cash " + (stm.cf.change >= 0 ? "+" : "") + stm.cf.change + ". Click the line in the cash-flow statement where most of the difference went.", target,
      ["Look at the brackets: they're Cash that left, or never came.", "The biggest bracketed number between Net income and Cash from operations."]);
    if (misses === 0) { mastered("cfs"); mastered("statements"); } // right on the first tap
    await G.reveal("none", `${h.text}<br>That's what killed Edric: profit in the Ledger, the coin in other people's purses.`);
    if (st.pages.indexOf(4) < 0) st.pages.push(4);
    await G.reveal("none", `<span class="journal small">Edric's last page: “${PAGES[4]}”</span>`);
    keep("statements", "The three statements", "Income statement: did you make a profit? Balance sheet: what you own and owe. Cash-flow statement: where the Cash went.", `Spring: net income ${stm.is.net}, Cash ${stm.cf.change >= 0 ? "up" : "down"} ${Math.abs(stm.cf.change)}. ${h.text.split(": ").pop()}`);
    to(9, "done");
  }

  // ---------- name your farm (item 10): the name appears on the writ, the week cards and the epilogue ----------
  function nameFarm() {
    return new Promise(res => {
      document.querySelectorAll("#namefarm").forEach(e => e.remove());
      const ov = document.createElement("div"); ov.className = "s6ov"; ov.id = "namefarm";
      ov.innerHTML = `<div class="s6card"><div class="s6sub">The writ</div><h2>Name your farm</h2><p>Crane's pen is waiting. What does the writ call this land?</p>` +
        `<input type="text" id="nfin" maxlength="18" value="Thornfield" aria-label="Farm name" autocomplete="off"><br><button class="gold" id="nfok">Write it down</button><button id="nfdef">Keep “Thornfield”</button></div>`;
      document.getElementById("wrap").appendChild(ov);
      const done = keepDefault => { const v = keepDefault ? "" : ov.querySelector("#nfin").value.replace(/[<>&"'`]/g, "").trim().slice(0, 18); st.farm = v || "Thornfield"; ov.remove(); G.save(); res(st.farm); };
      ov.querySelector("#nfok").onclick = () => done(false); ov.querySelector("#nfdef").onclick = () => done(true);
      ov.querySelector("#nfin").addEventListener("keydown", e => { if (e.key === "Enter") done(false); e.stopPropagation(); }); // typing never walks the player
      if (!window.matchMedia("(pointer: coarse)").matches) setTimeout(() => { const i = ov.querySelector("#nfin"); i && i.select(); }, 30);
    });
  }
  // ---------- the case board (item 5): a corkboard of pinned clues, opened from the Books strip or the Desk ----------
  function caseBoard() {
    const prev = Endings.unlocked();
    const cards = st.clues.map(c => `<div class="clue ${c.kind}"><div class="ct">${c.term}</div><div class="cn">${c.num}</div><div class="cf">${c.from}</div></div>`).join("");
    return G.openDoc(() => G.showPanel("casebd", `<h1>The case board <span class="hint">${farmName()} · ${st.clues.length} clue${st.clues.length === 1 ? "" : "s"} · day ${G.s.day}</span></h1>` +
      `<p class="hint">Edric made a profit every year and still lost the farm. Who gains when a profitable farm runs out of coin? Every lesson pins a clue.</p>` +
      `<div class="corkboard">${cards || `<div class="cbempty">Nothing pinned yet. Every lesson pins a clue here.</div>`}</div>` +
      (prev.length ? `<h3 style="margin-top:10px">From earlier seasons</h3>${prev.map(u => `<div class="clue ${u.kind === "page" ? "page" : "book"}" style="margin:8px 0;transform:none"><div class="ct">${u.term}</div><div class="cn" style="font-family:var(--serif)">“${u.text}”</div></div>`).join("")}` : "")));
  }
  function deskItems() { // extra Desk-menu entries (game.js desk() adds them before "Back to the road")
    if (!G || G.s.over || busy) return [];
    const o = Endings.offer(G.s);
    return [{ label: `Crane's offer: ${money(o.price)}${o.mercy ? " (mercy)" : ""}`, fn: () => run(() => craneOffer()) }, { label: `Case board (${st.clues.length})`, fn: () => caseBoard() }];
  }
  function deskNote() { // the offer as a card on the Desk
    if (!G || G.s.over || st.stage === "intro") return "";
    const o = Endings.offer(G.s);
    return `<div class="offercard">Crane's standing offer for ${farmName()}: <b>${money(o.price)}</b> today${o.mercy ? ` (the mercy price: Cash ${money(o.cash)} is below ${money(o.wages)} of wages)` : ""}. Accepting ends the season.</div>`;
  }
  // ---------- Crane's offer (M3): a standing buy-out. Price formula and its tests: endings.js, tests/test-offer.js ----------
  const money = v => Number(v).toLocaleString("en-US");
  async function craneOffer(opts) { // opts.first: the day-1 scene; opts.mercy: Crane's visit when you are short for wages
    opts = opts || {}; const E = Endings, o = E.offer(G.s), farm = farmName();
    const intro = opts.first ? `The Duke will take ${farm} off your hands today. ${money(o.price)}, in coin, on the table. Or you carry the Crown's ${money(S.R.crownDebt)} to Midwinter alone.`
      : o.mercy ? `Master Vale sends his regards, heir. Cash ${money(o.cash)}, and ${money(o.wages)} of wages due. I can be merciful: ${money(o.price)} for ${farm}, today.`
      : `The Duke's offer for ${farm} stands: ${money(o.price)}.`;
    const c = await G.say("crane", intro, ["No. The farm stays.", `Sell ${farm} for ${money(o.price)}`]);
    if (c === 0) { pin("offer", "Crane's offer", `${money(o.price)} now`, `Day ${G.s.day} · Crane's offer (money now vs the farm later)`); return false; }
    const sure = await G.say("maud", `That is ${money(o.price)} now, and the season ends here. Is it a fair price for ${farm}, or is it the price of being frightened?`, ["Keep the farm", "Sell. It's done."]);
    if (sure === 0) return false;
    await sell(o); return true;
  }
  async function sell(o) {
    const s = G.s; s.sold = { price: o.price, day: s.day, mercy: o.mercy }; s.sold.so = Endings.soldOut(s, o.price);
    TR.use("tvm", false, s.day); TR.use("equation", false, s.day); // introduced, not credited: selling is not evidence of skill
    pin("offer", "Crane's offer", `took ${money(o.price)} on day ${s.day}`, `Day ${s.day} · you sold ${farmName()}`);
    s.over = true; s.outcome = "sold"; G.save(); G.hud(); await showEnding("sold");
  }
  // ---------- endings (item 4): an epilogue card with 3-4 lines and what it unlocks for the next game ----------
  function showEnding(kind) {
    return new Promise(res => {
      document.querySelectorAll(".s6ov").forEach(e => e.remove());
      const s = G.s, ep = Endings.epilogue(kind, { s, farm: farmName(), sold: s.sold && s.sold.so }), u = Endings.unlock(kind);
      const ov = document.createElement("div"); ov.className = "s6ov"; ov.id = "ending";
      ov.innerHTML = `<div class="s6card s6end-${kind}"><div class="s6sub">${farmName()} · Spring · the ending</div><h2>${ep.title}</h2>${ep.lines.map(l => `<p>${l}</p>`).join("")}` +
        (kind === "sold" ? `<div class="s6cmp"><div>You took<b>${money(s.sold.price)}</b></div>${s.sold.so && s.sold.so.worth != null ? `<div>Carefully run, day 28<b>${money(s.sold.so.worth)}</b></div>` : ""}</div><p class="hint">C0.01 time value · C1.01 equity</p>` : "") +
        `<div class="s6unlock">${u && u.fresh ? "Unlocked" : "Unlocked earlier"}: <b>${ep.unlock.term}</b><br>“${ep.unlock.text}”</div>` +
        `<button class="gold" id="endagain">Play again</button><button id="endcase">Case board</button>${kind === "sold" ? "" : `<button id="endback">Back to the books</button>`}</div>`;
      document.getElementById("wrap").appendChild(ov);
      ov.querySelector("#endagain").onclick = () => G.restart();
      ov.querySelector("#endcase").onclick = () => { ov.style.display = "none"; caseBoard().then(() => { ov.style.display = "flex"; }); };
      const bk = ov.querySelector("#endback"); if (bk) bk.onclick = () => { ov.remove(); res(); };
    });
  }
  // test hook (?ending=sold|seized|bridged|free): show that ending's epilogue on the current game, whatever its state
  async function testEnding(kind) {
    const s = G.s; if (kind === "sold") { const o = Endings.offer(s); s.sold = { price: o.price, day: s.day, so: Endings.soldOut(s, o.price) }; }
    if (kind === "seized") { s.over = true; s.outcome = "insolvent"; s.why = s.why || "Cash 12 can't cover 48 of wages and interest. The hands walk off."; }
    if (kind === "free") { s.bal.cash += 1500; s.bal.capital -= 1500; }
    if (kind === "bridged") { const need = S.R.crownDebt - S.crownFund(s).net - 150; s.bal.cash += need; s.bal.capital -= need; }
    return showEnding(kind);
  }

  // ---------- hooks from the game ----------
  let busy = false;
  async function run(fn, ...a) { if (busy) return; busy = true; window.__walked = false; try { await fn(...a); } finally { busy = false; G.hud(); } }
  function start() { goal(); if (st.stage === "intro") { const w = dueCard(); if (w) weekCard(w); run(ch1); } }
  function onTalk(who) { // returns true when the story takes the conversation
    if (busy) return true;
    const m = { tomas: { tomas2: ch2, tomas6: ch6 }, ashby: { ashby3: ch3 }, hobb: { hobb4: ch4 }, ezra: { ezra7: ch7 }, duke: { duke8: ch8 } }[who];
    if (m && m[st.stage]) { run(m[st.stage]); return true; }
    if (who === "maud" && st.ch < 9 && st.stage !== "done") { run(() => tell(`Next: ${goalText().split(": ").slice(1).join(": ")}`)); return true; }
    return false;
  }
  function after(evt, info) {
    if (evt === "morning" && G.s.payPlan && G.s.day >= G.s.payPlan.day) { G.s.payPlan = null; G.act(() => S.payBills(G.s)); G.toast("You paid Tomas, as planned."); }
    if (evt === "morning") { const w = dueCard(); if (w) weekCard(w); goal(); } // WS6: a new week's title card on day 8, 15, 22; the ribbon follows the calendar
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
  return { init, start, onTalk, after, close, quietOffers, goalTexts: () => GOALS, get state() { return st; }, get busy() { return busy; }, TITLES, WEEKS, PAGES, fresh, weekCard, weekOf, pin, farmName,
    craneOffer, caseBoard, deskItems, deskNote, showEnding, testEnding, nameFarm }; // WS6 hooks used by game.js and the tests
})();
