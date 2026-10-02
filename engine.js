// Spring at Thornfield — season engine. Pure JS, no DOM: runs in the browser and under node (test-engine.js).
// Built from poc/harvest-engine.js (every action posts; every view derives from the postings), re-parameterized
// to days and upgraded to a true general journal: each posting is a set of debit (+) / credit (-) lines that must
// sum to zero, so Assets = Liabilities + Owner's equity holds after every transaction (curriculum C1.01; the
// double-entry method as in OpenStax *Principles of Accounting* Vol. 1, ch. 3). Subledgers (open invoices, open
// bills, sacks/seed/crops at cost) are kept separately and tested against the ledger accounts every day.
(function (root) {
  const R = {
    days: 28, seedCost: 12, sacksPerPlot: 3, unitCost: 4, growDays: 4, // a plot: 12 of seed -> 3 sacks at 4 each
    upkeep: 45,                 // weekly farmhand wages + upkeep (Operating expense), paid in Cash
    spotPrice: 5,               // the market cart buys any surplus for Cash
    sprinklerCost: 80, depPerWeek: 5, // Equipment: 16-week life, straight-line, no salvage (C1.05)
    lateGrace: 3, breachPct: 0.1, // an order more than 3 days late is cancelled, with a forfeit of 10% of its value
    apDefault: 5,               // a bill 5 days overdue: Tomas takes you to the reeve's court
    apDays: 14, discDays: 7, discPct: 0.02, // Tomas's terms: "2/7, net 14" (2% off if paid within 7 days)
    factorRate: 0.85,           // Ezra buys an invoice for 85% of its value today
    crownDebt: 1000,            // owed to the Crown at Midwinter (the story's goal)
    rain: [5, 12, 13, 20, 26],
    field: { x0: 5, y0: 10, w: 9, h: 4 },
  };
  const ACCTS = {
    cash: ["Cash", "A"], ar: ["Accounts receivable", "A"], inv: ["Inventory", "A"], equip: ["Equipment", "A"],
    accdep: ["Accumulated depreciation", "A"], ap: ["Accounts payable", "L"], loan: ["Loan payable", "L"], crown: ["Crown debt", "L"],
    capital: ["Owner's equity", "E"], revenue: ["Revenue", "R"], cogs: ["Cost of goods sold", "X"],
    upkeep: ["Wages & upkeep", "X"], depreciation: ["Depreciation", "X"], fines: ["Contract forfeits", "X"], interest: ["Interest expense", "X"],
    factoring: ["Factoring fees", "X"],
  };
  const NAMES = { maud: "Maud the reeve", ezra: "Ezra the moneylender", ashby: "Widow Ashby", hobb: "Hobb the Miller", tomas: "Tomas the seed merchant", duke: "the Duke's steward",
    mira: "Mira, a travelling baker", abbey: "Brother Anselm of the Abbey" };
  // [day offered, buyer, sacks, price per sack, days to pay after delivery, days to deliver]
  const OFFERS = [
    [1, "ashby", 6, 8, 0, 4], [2, "hobb", 18, 9, 14, 6], [4, "ashby", 9, 8, 0, 4], [6, "hobb", 24, 9, 14, 6],
    [8, "ashby", 9, 8, 0, 4], [10, "duke", 90, 10, 21, 12], [11, "ashby", 12, 8, 0, 4], [13, "hobb", 27, 9, 14, 6],
    [15, "ashby", 12, 8, 0, 4], [18, "hobb", 30, 9, 14, 6], [19, "ashby", 12, 8, 0, 4], [22, "ashby", 12, 8, 0, 4],
    [23, "hobb", 24, 9, 14, 5], [25, "ashby", 9, 8, 0, 3],
  ];

  function newGame(opt) {
    opt = opt || {};
    const s = { day: 1, over: false, outcome: null, nextId: 1, journal: [], bal: {}, log: [], uses: [], story: !!opt.story, rateAdj: 0,
      trust: { maud: 2, ezra: opt.ezraTrust != null ? opt.ezraTrust : 4, ashby: 4, hobb: 4, tomas: 4, duke: 4, mira: 4, abbey: 4 }, quiet: !!opt.story,
      sacks: 15, seeds: 0, sprinklersHeld: 0, plots: [], offers: [], orders: [], invoices: [], bills: [], week: newWeek() };
    Object.keys(ACCTS).forEach(k => s.bal[k] = 0);
    const f = R.field;
    for (let i = 0; i < f.w * f.h; i++) s.plots.push({ i, x: f.x0 + i % f.w, y: f.y0 + Math.floor(i / f.w), tilled: i < f.w, watered: false, crop: null, sprinkler: false });
    [0, 1, 2].forEach(i => s.plots[i].crop = { age: 2, cost: R.seedCost });
    const cash = 200 + (opt.bonus || 0), inv = s.sacks * R.unitCost + 3 * R.seedCost, loan = 100;
    const crown = R.crownDebt;
    post(s, "open", "Opening balances: the estate as Uncle Edric left it", { cash, inv, loan: -loan, crown: -crown, capital: -(cash + inv - loan - crown) });
    s.opening = Object.assign({}, s.bal);
    makeOffers(s);
    note(s, "Spring, day 1. Cash " + cash + ", 15 sacks in the barn, Edric's 100 loan from Ezra, and 1,000 owed to the Crown at Midwinter.");
    return s;
  }
  function newWeek() { return { revenue: 0, cogs: 0, sacksSold: 0 }; }

  // ---------- the journal ----------
  function post(s, type, memo, lines) {
    let sum = 0; for (const k in lines) { if (!(k in ACCTS)) throw new Error("no account " + k); if (lines[k] !== Math.round(lines[k])) throw new Error("non-integer posting"); sum += lines[k]; }
    if (sum !== 0) throw new Error("unbalanced posting: " + memo);
    for (const k in lines) s.bal[k] += lines[k];
    s.journal.push({ n: s.journal.length + 1, day: s.day, type, memo, lines });
  }
  const note = (s, t) => s.log.unshift({ day: s.day, t });
  const use = (s, id, well) => s.uses.push({ id, day: s.day, well: well !== false });
  const sum = a => a.reduce((x, y) => x + y, 0);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const bump = (s, who, d) => { s.trust[who] = clamp(s.trust[who] + d, 0, 10); };
  const ok = m => ({ ok: true, msg: m }), err = m => ({ ok: false, msg: m });

  // ---------- derived views ----------
  function balanceSheet(b) { // b = a balance map (s.bal or s.opening)
    const ni = -(b.revenue) - b.cogs - b.upkeep - b.depreciation - b.fines - b.interest - b.factoring;
    const assets = b.cash + b.ar + b.inv + b.equip + b.accdep, liab = -b.ap - b.loan - b.crown, equity = -b.capital + ni;
    return { cash: b.cash, ar: b.ar, inv: b.inv, equipNet: b.equip + b.accdep, assets, ap: -b.ap, loan: -b.loan, crown: -b.crown, liab, equity, ni,
      currentAssets: b.cash + b.ar + b.inv, currentLiab: -b.ap - b.loan - b.crown };
  }
  function terms(s) { // what Ezra and Tomas offer, from their trust (and, for Ezra, from the forecast you showed him)
    const e = s.trust.ezra, t = s.trust.tomas;
    return { loanLimit: 100 + 50 * e, rateBp: Math.max(50, 350 - 25 * e - (s.rateAdj || 0)), apDays: t >= 3 ? R.apDays : 0, apLimit: 60 + 30 * t };
  }
  // Cash forecast: the same night order as sleep() (collections, then week-end wages + interest, then bills due),
  // assuming you do nothing else. extraOut: cash you plan to spend today (e.g. seed for a big order).
  function forecast(s, n, extraOut) {
    const t = terms(s), rows = []; let cash = s.bal.cash - (extraOut || 0);
    for (let d = s.day; d < s.day + n && d <= R.days; d++) {
      const open = cash, cin = sum(s.invoices.filter(v => v.due === d || (d === s.day && v.due < d)).map(v => v.amount));
      const wk = d % 7 === 0 ? R.upkeep + Math.round(-s.bal.loan * t.rateBp / 10000) : 0, bills = sum(s.bills.filter(b => b.due === d || (d === s.day && b.due < d)).map(b => b.amount));
      const fines = sum(openOrders(s).filter(o => Math.max(s.day, o.due + R.lateGrace + 1) === d).map(o => Math.round(o.value * R.breachPct))); // undelivered orders forfeit
      cash = open + cin - wk - bills - fines; rows.push({ day: d, open, cin, wages: wk, bills, fines, cout: wk + bills + fines, close: cash });
    }
    return rows;
  }
  const rain = d => R.rain.indexOf(d) >= 0;
  const inGround = s => s.plots.filter(p => p.crop);
  const sacksComing = s => inGround(s).length * R.sacksPerPlot;
  const openOrders = s => s.orders.filter(o => o.status === "open");
  const committed = s => sum(openOrders(s).map(o => o.sacks));
  const billsDue = (s, byDay) => sum(s.bills.filter(b => b.due <= byDay).map(b => b.amount));
  function weekBills(s) { const t = terms(s); return R.upkeep + Math.round(-s.bal.loan * t.rateBp / 10000); }
  const nextWeekEnd = s => Math.ceil(s.day / 7) * 7;
  function neighbours(s, p) { return s.plots.filter(q => q !== p && Math.abs(q.x - p.x) <= 1 && Math.abs(q.y - p.y) <= 1); }
  const sprinkled = (s, p) => neighbours(s, p).some(q => q.sprinkler);
  function stage(s, p) { if (!p.crop) return -1; return p.crop.age >= R.growDays ? 4 : p.crop.age; }

  // ---------- farm actions ----------
  function act(s, i) { // the E key on a field tile: till -> plant -> water -> harvest
    const p = s.plots[i]; if (!p || s.over) return err("");
    if (p.sprinkler) return err("The sprinkler waters the 8 plots around it each morning.");
    if (!p.tilled) { p.tilled = true; return ok("till"); }
    if (!p.crop) {
      if (s.sprinklersHeld > 0) return placeSprinkler(s, i);
      if (s.seeds <= 0) return err("No seed. Tomas sells it in town.");
      s.seeds--; p.crop = { age: 0, cost: R.seedCost }; p.watered = rain(s.day) || p.watered; return ok("plant");
    }
    if (stage(s, p) === 4) { s.sacks += R.sacksPerPlot; p.crop = null; p.watered = false; use(s, "inventory"); return ok("harvest"); }
    if (!p.watered && !rain(s.day)) { p.watered = true; return ok("water"); }
    return err(rain(s.day) ? "The rain is watering it." : "Watered. It grows overnight.");
  }
  function placeSprinkler(s, i) { const p = s.plots[i]; if (p.crop || p.sprinkler || s.sprinklersHeld <= 0) return err("Can't place it there."); p.sprinkler = true; s.sprinklersHeld--; return ok("sprinkler"); }

  // ---------- town actions ----------
  function accept(s, id) {
    const k = s.offers.findIndex(o => o.id === id); if (k < 0) return err("That offer is gone.");
    const o = s.offers.splice(k, 1)[0]; s.orders.push(Object.assign(o, { status: "open", late: false }));
    if (o.who === "duke") { use(s, "wc", false); use(s, "overtrading", false); } // felt: growth that must be funded now and paid later
    note(s, `Agreed: ${o.sacks} sacks to ${NAMES[o.who]} at ${o.price}, due day ${o.due}, ${o.terms ? "paid " + o.terms + " days after delivery" : "Cash on delivery"}.`);
    return ok();
  }
  function decline(s, id) { s.offers = s.offers.filter(o => o.id !== id); return ok(); }
  function addOffer(s, who, sacks, price, tdays, dueIn, expiresIn) { // the story places its own offers
    const o = { id: s.nextId++, who, sacks, price, terms: tdays, due: Math.min(R.days, s.day + dueIn), expires: s.day + (expiresIn || 2), value: sacks * price };
    s.offers.push(o); return o;
  }
  function setPrice(s, id, price) { const o = s.offers.find(x => x.id === id); if (!o) return err("That offer is gone."); o.price = price; o.value = o.sacks * price; return ok(); }
  function factor(s, id) { // sell an invoice to Ezra: 85% in Cash today, the rest is a Factoring fee
    const v = s.invoices.find(x => x.id === id); if (!v) return err("No such invoice.");
    const got = Math.round(v.amount * R.factorRate), fee = v.amount - got;
    post(s, "factor", `Sold ${NAMES[v.who]}'s invoice of ${v.amount} to Ezra for ${got}`, { cash: got, factoring: fee, ar: -v.amount });
    s.invoices = s.invoices.filter(x => x !== v); note(s, `Factored ${NAMES[v.who]}'s invoice: ${got} today, ${fee} fee.`); return ok();
  }
  function deliver(s, id) {
    const o = s.orders.find(x => x.id === id && x.status === "open"); if (!o) return err("No such order.");
    if (s.sacks < o.sacks) return err(`Need ${o.sacks} sacks; the barn has ${s.sacks}.`);
    const v = o.sacks * o.price, c = o.sacks * R.unitCost;
    s.sacks -= o.sacks; o.status = "delivered"; o.deliveredDay = s.day;
    if (o.terms) { const inv = { id: s.nextId++, who: o.who, amount: v, due: s.day + o.terms }; s.invoices.push(inv);
      post(s, "sale", `Sold ${o.sacks} sacks to ${NAMES[o.who]} on ${o.terms}-day terms (invoice due day ${inv.due})`, { ar: v, revenue: -v }); use(s, "accrual"); }
    else post(s, "sale", `Sold ${o.sacks} sacks to ${NAMES[o.who]} for Cash`, { cash: v, revenue: -v });
    post(s, "cogs", `Cost of the ${o.sacks} sacks sold`, { cogs: c, inv: -c });
    s.week.revenue += v; s.week.cogs += c; s.week.sacksSold += o.sacks;
    const onTime = s.day <= o.due;
    bump(s, o.who, onTime ? 1 : 0); use(s, "gross"); use(s, "margin");
    note(s, `Delivered ${o.sacks} sacks to ${NAMES[o.who]}${onTime ? "" : " (late)"}: Revenue ${v}, Cost of goods sold ${c}.`);
    return ok();
  }
  function sellSpot(s, n) {
    n = Math.min(n, s.sacks); if (n <= 0) return err("Nothing to sell.");
    const v = n * R.spotPrice, c = n * R.unitCost; s.sacks -= n;
    post(s, "sale", `Sold ${n} surplus sacks to the market cart for Cash`, { cash: v, revenue: -v });
    post(s, "cogs", `Cost of the ${n} sacks sold`, { cogs: c, inv: -c });
    s.week.revenue += v; s.week.cogs += c; s.week.sacksSold += n; return ok();
  }
  function buySeeds(s, n, onAccount) {
    const cost = n * R.seedCost, t = terms(s);
    if (onAccount) {
      if (!t.apDays) return err("Tomas wants Cash now: you've paid him late.");
      const owed = -s.bal.ap; if (owed + cost > t.apLimit) return err(`Tomas's limit is ${t.apLimit}; you owe him ${owed}.`);
      const b = { id: s.nextId++, amount: cost, due: s.day + t.apDays, discBy: s.day + R.discDays, disc: Math.round(cost * R.discPct), late: false }; s.bills.push(b);
      post(s, "seed", `Bought ${n} seed packets from Tomas on account (bill due day ${b.due}; 2% off if paid by day ${b.discBy})`, { inv: cost, ap: -cost }); use(s, "equation");
    } else {
      if (s.bal.cash < cost) return err(`That's ${cost}; Cash is ${s.bal.cash}.`);
      post(s, "seed", `Bought ${n} seed packets from Tomas for Cash`, { inv: cost, cash: -cost });
    }
    s.seeds += n; return ok();
  }
  const discNow = (s, b) => (!b.late && b.discBy != null && s.day <= b.discBy) ? b.disc : 0;
  function payBills(s) { // paying Tomas yourself: inside the 7-day window you get the 2% discount
    const open = s.bills.slice(); if (!open.length) return err("You owe Tomas nothing.");
    const amt = sum(open.map(b => b.amount - discNow(s, b))); if (s.bal.cash < amt) return err(`You owe ${amt}; Cash is ${s.bal.cash}.`);
    open.forEach(b => payBill(s, b, true)); return ok();
  }
  function payBill(s, b, early) {
    const d = early ? discNow(s, b) : 0; // a purchase discount: booked against Cost of goods sold (inventory stays at standard cost)
    if (d) post(s, "payap", `Paid Tomas's bill of ${b.amount} early: ${d} discount`, { ap: b.amount, cash: -(b.amount - d), cogs: -d });
    else post(s, "payap", `Paid Tomas's bill of ${b.amount}`, { ap: b.amount, cash: -b.amount });
    s.bills = s.bills.filter(x => x !== b);
    if (!b.late) { bump(s, "tomas", 1); use(s, "ap"); }
  }
  function buySprinkler(s) {
    if (s.bal.cash < R.sprinklerCost) return err(`A sprinkler costs ${R.sprinklerCost}; Cash is ${s.bal.cash}.`);
    post(s, "equip", "Bought a sprinkler (Equipment, 16-week life)", { equip: R.sprinklerCost, cash: -R.sprinklerCost });
    s.sprinklersHeld++; note(s, "Bought a sprinkler. Place it on an empty tilled plot."); return ok();
  }
  function borrow(s, amt) {
    const t = terms(s), room = t.loanLimit + s.bal.loan; // bal.loan is negative
    if (amt > room) return err(`Ezra's limit is ${t.loanLimit}; you owe ${-s.bal.loan}.`);
    post(s, "borrow", `Borrowed ${amt} from Ezra at ${t.rateBp / 100}% a week`, { cash: amt, loan: -amt }); use(s, "equation"); return ok();
  }
  function repay(s, amt) {
    amt = Math.min(amt, -s.bal.loan); if (amt <= 0) return err("You owe Ezra nothing.");
    if (s.bal.cash < amt) return err(`Cash is ${s.bal.cash}.`);
    post(s, "repay", `Repaid ${amt} of the loan to Ezra`, { loan: amt, cash: -amt }); return ok();
  }

  // ---------- the night: sleeping ends the day ----------
  function sleep(s) {
    if (s.over) return err("The season is closed.");
    const d = s.day;
    s.plots.forEach(p => { if (p.crop && (p.watered || rain(d) || sprinkled(s, p)) && p.crop.age < R.growDays) p.crop.age++; p.watered = false; });
    s.invoices.filter(v => v.due <= d).forEach(v => { post(s, "collect", `${NAMES[v.who]} paid invoice of ${v.amount}`, { cash: v.amount, ar: -v.amount }); use(s, "ar"); note(s, `${NAMES[v.who]} paid ${v.amount}.`); });
    s.invoices = s.invoices.filter(v => v.due > d);
    if (d % 7 === 0) {
      const t = terms(s), interest = Math.round(-s.bal.loan * t.rateBp / 10000);
      if (s.bal.cash < R.upkeep + interest) return insolvent(s, `Cash ${s.bal.cash} can't cover ${R.upkeep + interest} of wages and interest. The hands walk off.`);
      post(s, "upkeep", `Week ${d / 7} wages & upkeep`, { upkeep: R.upkeep, cash: -R.upkeep });
      if (interest) { post(s, "interest", `Week ${d / 7} interest on Ezra's loan`, { interest, cash: -interest }); use(s, "tvm"); }
      if (s.bal.equip + s.bal.accdep > 0) { const dep = Math.min(R.depPerWeek * Math.round(s.bal.equip / R.sprinklerCost), s.bal.equip + s.bal.accdep); // 5 a week per sprinkler owned post(s, "dep", "Depreciation on the sprinkler", { depreciation: dep, accdep: -dep }); use(s, "depreciation"); }
      const gp = s.week.revenue - s.week.cogs;
      if (gp >= R.upkeep) use(s, "breakeven"); if (gp - R.upkeep - interest > 0) use(s, "operating");
      if (s.bal.ar > 0) use(s, "wc");
      if (s.bal.ar > s.bal.cash) use(s, "overtrading"); // used well: got through a pay-day with more tied up in receivables than in Cash
      s.week = newWeek();
    }
    for (const b of s.bills.filter(b => b.due <= d)) {
      if (s.bal.cash >= b.amount) payBill(s, b);
      else {
        if (!b.late) { b.late = true; bump(s, "tomas", -2); bump(s, "ezra", -1); note(s, `Couldn't pay Tomas's bill of ${b.amount}. He's telling people.`); }
        if (d - b.due >= R.apDefault) return insolvent(s, `Tomas's bill of ${b.amount} is ${d - b.due} days overdue. He takes you to the reeve's court.`);
      }
    }
    for (const o of openOrders(s)) {
      if (d > o.due + R.lateGrace) { // breach of contract: cancelled, trust lost, a forfeit of 10% of the order (C2.09's overtrading trap)
        o.status = "cancelled"; bump(s, o.who, -2); if (o.who === "duke") bump(s, "ezra", -1);
        const fine = Math.round(o.value * R.breachPct);
        if (s.bal.cash < fine) return insolvent(s, `${NAMES[o.who]} sues for the ${fine} forfeit on the broken order, and Cash is ${s.bal.cash}.`);
        post(s, "fine", `Forfeit to ${NAMES[o.who]}: order cancelled, ${o.sacks} sacks never came`, { fines: fine, cash: -fine });
        note(s, `${NAMES[o.who]} cancelled the order and took a ${fine} forfeit.`);
      } else if (d >= o.due && !o.late) { o.late = true; bump(s, o.who, -1); note(s, `${NAMES[o.who]}'s order is due today and not delivered: late from tomorrow.`); }
    }
    s.offers = s.offers.filter(o => o.expires > d);
    if (d >= R.days) { s.over = true; s.outcome = "closed"; note(s, "The last night of spring. Time to close the books."); return ok(); }
    s.day++; makeOffers(s);
    return ok();
  }
  function insolvent(s, why) { s.over = true; s.outcome = "insolvent"; s.why = why; use(s, "insolvency", false); use(s, "overtrading", false); note(s, why); return ok(); }
  function makeOffers(s) {
    if (s.quiet) return; // the story's first lessons run without stray orders
    OFFERS.filter(o => o[0] === s.day && !(s.story && o[1] === "duke")).forEach(([d, who, base, price, tdays, dueIn]) => {
      const sacks = who === "duke" ? base : Math.max(3, Math.round(base * (0.6 + s.trust[who] / 10) / 3) * 3);
      s.offers.push({ id: s.nextId++, who, sacks, price, terms: tdays, due: Math.min(R.days, d + dueIn), expires: d + 2, value: sacks * price });
    });
  }

  // ---------- Maud: one line, real terms; quiet after calm stretches unless there's real danger ----------
  function coach(s) {
    const cash = s.bal.cash, wk = nextWeekEnd(s), due = weekBills(s) + billsDue(s, wk);
    const collect = sum(s.invoices.filter(v => v.due <= wk).map(v => v.amount));
    const short = committed(s) - s.sacks - sacksComing(s);
    if (cash + collect < due) return { danger: true, text: `Cash ${cash}, and ${due} of wages, interest and Accounts payable fall due by day ${wk}. Ezra lends; the market cart buys surplus.` };
    const late = s.bills.find(b => b.late); if (late) return { danger: true, text: `Tomas's bill of ${late.amount} is overdue. Five days and he goes to the court.` };
    if (short > 0) return { danger: short > 20, text: `Open orders need ${committed(s)} sacks; Inventory plus the field makes ${s.sacks + sacksComing(s)}. Plant ${Math.ceil(short / 3)} more plots.` };
    if (s.offers.some(o => o.who === "duke")) return { danger: false, text: `The Duke pays 21 days after delivery. Seed and wages are paid now: can Cash wait that long?` };
    if (s.bal.ar > 2 * cash && cash < 150) return { danger: false, text: `Accounts receivable ${s.bal.ar}, Cash ${cash}. Revenue isn't Cash until the invoice is paid.` };
    if (s.day === 1) return { danger: false, text: `E to till, plant and water. Ashby pays Cash on delivery; Hobb pays 14 days after.` };
    return null;
  }

  root.Spring = { R, ACCTS, NAMES, OFFERS, newGame, post, balanceSheet, terms, rain, stage, sprinkled, committed, sacksComing, openOrders,
    weekBills, billsDue, nextWeekEnd, forecast, discNow, addOffer, setPrice, factor, act, accept, decline, deliver, sellSpot, buySeeds, payBills, buySprinkler, borrow, repay, sleep, coach };
  if (typeof module !== "undefined") module.exports = root.Spring;
})(typeof window !== "undefined" ? window : globalThis);
