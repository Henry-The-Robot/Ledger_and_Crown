// Spring at Thornfield — the story: "The Uncle's Ledger" as a FOUR-WEEK season (WS6; projects/mba-game/SEASON-1-REDESIGN.md §2, §4, §7).
// Structure: Blake Snyder's beat sheet (Save the Cat, 2005) across four weeks, the detective-fiction "fair play" rule (every clue is
// planted before the reveal: the case board pins one per lesson), and kishotenketsu inside each week. Calendar weeks drive the
// title cards and the goal ribbon (day 1/8/15/22); the lesson stages below are the existing chapters, mapped into the weeks:
//   Week 1 "The writ"        (days 1-7)   Crane's stamp, Crane's offer, harvest, Ashby, Tomas, Hobb
//   Week 2 "Promises"        (days 8-14)  wages day, Tomas's terms (time value), Ezra's forecast, MIDPOINT day 12: Corvin Vane's first order, Edric's page
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
  const L = window.Lessons || require("./lessons.js"), K = window.SceneKit || require("../../../core/scene.js");
  const TITLES = L.TITLES, LETTERS = L.LETTERS, WEEKS = L.WEEKS, GOALS = L.GOALS; // the words of the story live in lessons.js (data)
  const weekOf = d => Math.min(4, Math.max(1, Math.ceil(d / 7)));
  const farmName = () => (st && st.farm) || "Thornfield";
  const PAGES = L.PAGES.map(t => K.fill(t, { dukeSacks: S.R.duke.sacks, dukePrice: S.R.duke.price, dukeTerms: S.R.duke.terms })); // the journal pages; page 9 names the Duke's order from the season's own constants
  function fresh() { return { ch: 1, stage: "intro", notebook: [], pages: [], pageDays: {}, clues: [], weeks: [], farm: "Thornfield" }; }
  function init(g, saved) { G = g; st = Object.assign(fresh(), saved || {}); goal(); }
  const goalText = () => { const d = G && G.s ? G.s.day : 1; return (st.stage === "sleep8" && d >= 12 ? GOALS.sleep8now : st.stage === "sleep9" && d >= 15 ? GOALS.sleep9now : GOALS[st.stage]) || ""; };
  function goal() { const w = weekOf(G.s.day); G.goal(goalText(), st.ch, `${w === 0 ? "" : "Week " + w} · ${WEEKS[w].title}`); }
  function to(ch, stage) { if (window.Verbs) Verbs.parchClose(); /* a lesson page never outlives its stage */ st.ch = ch; st.stage = stage; G.s.quiet = ch <= 4; goal(); G.save(); }
  // ---------- the case board (item 5): every lesson and journal page pins a clue; WS8's Ledger Duel reads Story.state.clues ----------
  // clue = { id, term, num (the player's own number, as text), from (where it came from), day, kind: "lesson" | "page" | "book" }
  // Creative call 3: a clue card is a short title + the player's number + where it was found, 12 words at most in all (title <= 6, number <= 5, source <= 4, then trimmed to fit).
  const toks = x => String(x == null ? "" : x).trim().split(/\s+/).filter(Boolean), words = x => toks(x).filter(w => /[A-Za-z0-9]/.test(w)), clip = (x, n) => { const all = toks(x), out = []; let k = 0; for (const w of all) { if (/[A-Za-z0-9]/.test(w)) { if (k === n) return out.join(" ").replace(/[,;:.\-–·\s]+$/, "") + "…"; k++; } out.push(w); } return out.join(" "); };
  function tidyClue(term, num, from) {
    let t = clip(String(term).replace(/\s*\([^)]*\)/g, ""), 6), n = clip(num, 5), f = clip(from, 4);
    while (words(t).length + words(n).length + words(f).length > 12) { if (words(n).length > 3) n = clip(n, words(n).length - 1); else if (words(f).length > 2) f = clip(f, words(f).length - 1); else t = clip(t, words(t).length - 1); }
    return { term: t, num: n, from: f };
  }
  function pin(id, term, num, from, kind) {
    if (st.clues.some(c => c.id === id)) return;
    const c = tidyClue(term, num, from || `Day ${G.s.day}`); term = c.term; num = c.num; from = c.from;
    st.clues.push({ id, term, num, from, day: G.s.day, kind: kind || "lesson" });
    G.toast(`Pinned to the case board: ${term}`);
  }
  async function page(i) { if (st.pages.indexOf(i) < 0) { st.pages.push(i); (st.pageDays = st.pageDays || {})[i] = G.s.day; } await GL.page(PAGES[i], LETTERS[i]); pin("page" + i, LETTERS[i], "Edric's letter", `Day ${G.s.day} · journal`, "page"); }
  // ---------- week title cards: one line, tap to dismiss (never blocks the story; fades by itself) ----------
  function weekCard(w, hold) {
    document.querySelectorAll(".wkcard").forEach(e => e.remove());
    const e = document.createElement("div"); e.className = "wkcard"; e.setAttribute("role", "status");
    e.innerHTML = `<div class="wk-farm">${farmName()}</div><div class="wk-n">Week ${w} of 4</div><div class="wk-t">${WEEKS[w].title}</div><div class="wk-l">${WEEKS[w].line}</div><div class="wk-m"><b>Maud:</b> ${WEEKS[w].maud}</div><div class="wk-tap">Tap to dismiss</div>`;
    e.onclick = () => e.remove(); document.getElementById("wrap").appendChild(e);
    if (!hold) setTimeout(() => e.remove(), 7000); else e.style.animation = "none"; // hold = screenshots: no entrance animation to catch half-faded
    return e;
  }
  const dueCard = () => { const d = G.s.day, w = weekOf(d); if (d === 1 + 7 * (w - 1) && st.weeks.indexOf(w) < 0) { st.weeks.push(w); return w; } return 0; };
  function addEx(id, more) { const n = st.notebook.find(x => x.id === id); if (n) n.example += " " + more; }
  // keep: the notebook entry, plus (WS6) a clue card on the case board: num = the player's own number as text, from = where it came from.
  function keep(id, term, line, example, num, from) {
    if (!st.notebook.some(n => n.id === id)) st.notebook.push({ id, term, line, example }); G.toast(`Maud's notebook: ${term} (N)`);
    pin(id, term, num || example.split(".")[0], from);
  }
  // Epoch guard for the stuck-scene valve (unstick). Every dialog a scene waits on remembers the epoch it was asked in; unstick() bumps the epoch, so a scene that was dropped
  // throws STALE at its next await instead of resuming and racing a new scene. run() swallows STALE and leaves `busy` alone for a stale chain.
  let epoch = 0; const STALE = { stale: true }, guarded = p => { const e = epoch; return Promise.resolve(p).then(v => { if (e !== epoch) throw STALE; return v; }); };
  const GASYNC = new Set(["say", "ask", "page", "haggle", "reveal", "pickLine"]), VASYNC = new Set(["bet", "timeline", "wait", "countTotal", "stamp", "revealBet", "parchClose"]);
  const GL = new Proxy({}, { get: (_, k) => GASYNC.has(k) && typeof G[k] === "function" ? (...a) => guarded(G[k](...a)) : G[k] });
  const LV = new Proxy({}, { get: (_, k) => VASYNC.has(k) && typeof Verbs[k] === "function" ? (...a) => guarded(Verbs[k](...a)) : Verbs[k] });
  const tell = (t, spot) => GL.say("maud", t, null, spot);
  const ask = (t, answer, hints, spot, tol, docs, work, how) => GL.ask("maud", t, answer, hints, spot, tol, docs, work, how);
  // Only answers the player got on their own count as evidence: a walk-through or a reported skip adds nothing.
  const mastered = id => { if (!window.__walked) TR.master(id, G.s.day); }; // evidence of skill, not instant mastery (transcript.js)
  // Document buttons for Try beats: the player finds the numbers in their own books (hints say where, never the sum).
  const DOC = {
    ledger: { label: "Open the Ledger", open: () => G.ledger() },
    notebook: { label: "Open Maud's notebook", open: () => G.notebook() },
    forecast: (n, title) => ({ label: "Open the cash forecast", open: () => G.board({ title, n, noClose: true, fill: [] }) }),
  };

  // ---------- the lessons are DATA (lessons.js); core/scene.js plays them (P6b). Below: the context a scene talks to (ctx), its formulas (CALC) and its game actions (VERB). ----------
  // A formula takes the scene's variables and returns new ones; it may read or change the game, but it never writes a word a player reads except a short phrase (a verdict, a unit).
  const play = (id, init) => K.play(L.BY[id], ctx, init);
  const DOCS = { notebook: () => DOC.notebook, ledger: () => DOC.ledger, whatif: v => ({ label: "Open the what-if timeline", open: () => LV.timeline({ mode: "show", n: 14, extra: v.extra, tied: true, order: v.ord, title: v.title }) }) };
  const ctx = {
    get s() { return G.s; }, S, tell, speak: (w, t, b) => GL.say(w, t, b),
    quiz: (q, v) => ask(q.text, q.answer, q.hints, q.spot, q.tol, q.docs ? q.docs.map(d => DOCS[d](v)) : q.docs, q.work, q.how),
    flag: (k, x) => { G.s.flags = G.s.flags || {}; G.s.flags[k] = x; }, calc: (name, v) => CALC[name](v), verb: (name, args, v, lazy) => VERB[name](args, v, lazy), remember: (k, x) => { st[k] = x; },
    keep: k => keep(k.id, k.term, k.line, k.example, k.num, k.from), addEx, pin, to, page, master: id => mastered(id),
  };
  const cut = id => window.Cutscene ? Cutscene.maybe(id) : Promise.resolve(null); // S5: a data cutscene (chapters/ch1/spring/cutscenes/), skipped in tests; never blocks the story
  const lowOf = f => f.reduce((a, x) => x.close < a.close ? x : a);
  const CALC = {
    // chapter 1
    ch1Facts: () => { const s0 = G.s, b = S.balanceSheet(s0.bal), cost = S.R.unitCost, plots = s0.plots.filter(p => p.crop);
      return { b, cost, cash: b.cash, sacks: s0.sacks, sackVal: s0.sacks * cost, plots: plots.length, cropVal: plots.reduce((a, p) => a + p.crop.cost, 0), assets: b.assets, liab: b.liab, equity: b.equity, eqFmt: LV.fmt(b.equity), eqWord: b.equity < 0 ? "below zero" : "thin" }; },
    ch1Right: v => { const right = (v.c === 1) === (v.b.equity < 0); return { right, guessNote: right ? "" : " You guessed more; the page says less." }; },
    farm: () => ({ farm: farmName() }), over: () => ({ over: !!G.s.over }),
    // chapter 2
    ch2Facts: () => ({ sc: S.R.seedCost, per: S.R.sacksPerPlot, three: 3 * S.R.seedCost, six: 6 * S.R.seedCost }), inv0: () => ({ inv0: G.s.bal.inv }),
    ch2After: () => ({ day: G.s.day, inv1: G.s.bal.inv, planted: G.s.plots.filter(p => p.crop).length }),
    // chapters 3 and 4
    ch3Setup: () => { const cost = S.R.unitCost, pc = p => Math.round((p - cost) / p * 100), o = G.s.offers.find(x => x.who === "ashby") || S.addOffer(G.s, "ashby", 6, 7, 0, 4, 4); S.setPrice(G.s, o.id, 7);
      return { cost, pc, o, seedCost: S.R.seedCost, per: S.R.sacksPerPlot, m7: 7 - cost, p7: pc(7), m6: 6 - cost, p6: pc(6) }; },
    ch3Deal: v => { const price = v.deal.price; return { price, pm: price - v.cost, pp: v.pc(price) }; },
    ch4Setup: () => { const o = G.s.offers.find(x => x.who === "hobb") || S.addOffer(G.s, "hobb", 9, 9, 14, 5, 4); S.setPrice(G.s, o.id, 9); return { o, cost: S.R.unitCost }; },
    ch4bFacts: v => { const val = v.order.value, inv = G.s.invoices.find(x => x.who === "hobb"), arNow = S.balanceSheet(G.s.bal).ar; return { v: val, inv, arNow, arBig: arNow > val, due: inv.due, n: inv.due - G.s.day + 1, revealDay: inv.due + 1 }; },
    betFacts: v => ({ win: !!v.r.win, guess: v.r.guess, stake: v.r.stake, stakeTxt: v.r.stake ? ` and staked ${v.r.stake}` : "", day: G.s.day }),
    // chapter 5 and the cost scene
    ch5Setup: () => { const walked = !!G.s.walkedOff, low = lowOf(S.forecast(G.s, 14)); return { walked, walkedWages: G.s.walkedWages, lowDay: low.day, lowClose: low.close, lowNote: low.close < 60 ? "That's where Edric lived." : "Watch that dip.", walkNote: walked ? " Jory walked off on wages day." : "", day: G.s.day }; },
    markupMargin: () => ({ m: Math.round(50 / 150 * 100) }),
    costFacts: () => { const s = G.s, p = S.marketPrice(s.day, s), cost = S.R.unitCost, F = S.weekBills(s), m = p - cost, p1 = p - 2, m1 = p1 - cost; if (m <= 0 || m1 <= 0 || F <= 0) return { skip: true };
      const need = x => Math.ceil(F / x), n0 = need(m), n1 = need(m1);
      return { skip: false, p, cost, F, m, p1, m1, n0, n1, n0b: Math.round(n0 * 1.25), up: Math.round((n1 / n0 - 1) * 100), zero: m * n0 - F, cutPct: Math.round(2 / p * 100), dropPct: Math.round((1 - m1 / m) * 100), k: (s.day + F) % 3, day: s.day }; },
    costRight: v => { const right = (v.c + v.k) % 3 === 2; return { right, verdict: right ? "Yes." : "Not quite." }; },
    // the price of waiting
    pvFacts: () => { const s = G.s, t = S.terms(s), room = t.loanLimit + s.bal.loan, real = s.invoices.filter(v => v.due - s.day >= 7 && v.amount >= 60 && Math.round(v.amount * S.R.factorRate) <= room).sort((a, b) => b.amount - a.amount)[0], inv = real || { who: null, amount: 100, due: s.day + 14 };
      const got = Math.round(inv.amount * S.R.factorRate), days = inv.due - s.day, wk = days / 7, weekly = Math.round(got * t.rateBp / 10000), r = t.rateBp / 10000, who = real ? S.NAMES[inv.who].split(" ")[0] : "the neighbour";
      return { real: !!real, amount: inv.amount, due: inv.due, days, got, fee: inv.amount - got, interest: Math.round(weekly * wk), implied: Math.round((Math.pow(inv.amount / got, 1 / wk) - 1) * 1000) / 10, worth: Math.round(inv.amount / Math.pow(1 + r, wk)), who, whoLow: real ? who : "a neighbour", ratePct: t.rateBp / 100, flip: (s.day + inv.amount) % 2 === 1, day: s.day }; },
    pvRight: v => { const right = v.flip ? v.c === 0 : v.c === 1; return { right, verdict: right ? "Yes." : "No." }; },
    // Tomas's terms (week 2) and again (week 3)
    tvmSetup: () => { const t = S.terms(G.s), sc = S.R.seedCost, left = Math.floor((t.apLimit + G.s.bal.ap) / sc); return { t, sc, rate: t.rateBp / 100, left, disc: Math.round(S.R.discPct * 100), apDays: S.R.apDays, discDays: S.R.discDays, tvmRate: st.tvmRate, stuck: !t.apDays || left < 3 }; },
    tvmSizes: v => { const small = Math.min(6, v.left), big = Math.min(9, v.left); return { small, big, smallCost: small * v.sc, bigCost: big * v.sc, bigOff: big <= small }; },
    tvmPick: v => ({ n: v.c ? v.big : v.small }),
    buyResult: v => ({ ok: !!v.r.ok, msg: v.r.msg }),
    tvmBill: () => { const bill = G.s.bills[G.s.bills.length - 1]; return { bill, day0: G.s.day, billAmt: bill.amount, discBy: bill.discBy, billDisc: bill.disc, due: bill.due }; },
    tvmAfter: v => { const F = tvmFacts(v.bill), took = v.r2.day <= v.bill.discBy;
      return { F, took, right: F.cheaper === "even" || took === (F.cheaper === "early"), discX: F.discX, carryX: F.carryX, tookPhrase: took ? `You took ${F.discX} off.` : "You kept the Cash.",
        cheaperPhrase: F.cheaper === "early" ? "paying early was cheaper" : F.cheaper === "wait" ? "waiting was cheaper" : "it was a dead heat", cheaperWord: F.cheaper === "early" ? "paying early" : F.cheaper === "wait" ? "waiting" : "neither",
        tookWord: took ? "paid early" : "waited", tookKept: took ? "paid early" : "kept the Cash", flipWord: st.tvmRate !== v.rate ? "flipped" : "held" }; },
    // Ezra
    ezraSetup: () => { const t0 = S.terms(G.s); return { t0, rate0: t0.rateBp / 100 }; },
    ezraRate: v => { const r = v.r; G.s.rateAdj = Math.min(100, 50 * ((r.okLow ? 1 : 0) + (r.okDay ? 1 : 0))); const t = S.terms(G.s), both = !!(r.okLow && r.okDay);
      return { t, rate: t.rateBp / 100, both, verdict: both ? "You know your coin." : r.okLow || r.okDay ? "Half right." : "Sloppy.", low: r.low, lowDay: r.lowDay }; },
    ezraKeep: v => ({ borrowInt: Math.round(v.borrowed * v.t.rateBp / 10000), day: G.s.day }),
    // Corvin Vane
    dukeSetup: () => { const o = G.s.offers.find(x => x.who === "duke"); if (!o) return { noOffer: true }; const D = S.R.duke, sacks = o.sacks;
      return { noOffer: false, o, D, sacks, half: Math.round(sacks / 6) * 3, value: sacks * o.price, price: o.price, due: o.due, terms: D.terms, tookFirst: G.s.orders.some(x => x.who === "duke"), tied1: st.tied1 || 0 }; },
    dukeBoard: v => { const V = LV, o = v.o, sacks = v.sacks, need = Math.max(0, Math.ceil((sacks + S.committed(G.s) - G.s.sacks - S.sacksComing(G.s)) / S.R.sacksPerPlot) - G.s.seeds), extra = need * S.R.seedCost, low = lowOf(S.forecast(G.s, 14, extra)), ord = { sacks, price: o.price, due: o.due };
      const base = V.rows({ n: 14, tied: true }), withO = V.rows({ n: 14, tied: true, extra, order: ord }), delta = withO[withO.length - 1].tied - base[base.length - 1].tied; // what this order ties up by the end of the window
      return { need, extra, low, ord, delta, lowClose: low.close, lowDay: low.day, plural: need > 1 ? "s" : "", day: G.s.day }; },
    dukeWise: v => ({ wise: v.low.close >= 0 ? v.c === 0 : v.c > 0, tellIdx: v.c === 0 && v.low.close < 0 ? 0 : v.c === 0 ? 1 : v.c === 1 ? 2 : 3, halfTied: Math.round(v.delta / 2), day: G.s.day }), // wise: matched the player's own board (Cash stays >= 0: taking it is right; below 0: half or decline)
    dukeChoice: v => ({ choice: [`all ${v.sacks}`, "half", "to decline"][v.c] }),
    // Edric's cash book, the three statements, Crane's offer
    cashFacts: () => { const s = G.s, rows = cashBookRows(s), last = rows[rows.length - 1]; return { rows, niFmt: LV.fmt(last.ni), cashFmt: LV.fmt(last.cash), day: s.day }; },
    closeFacts: v => { const stm = v.stm, h = v.h, ch = stm.cf.change; return { net: stm.is.net, change: ch, changeTxt: (ch >= 0 ? "+" : "") + ch, target: h.lines.find(l => l.startsWith("cf:")) || "cf:cfo", hText: h.text, hTail: h.text.split(": ").pop(), upDown: ch >= 0 ? "up" : "down", absChange: Math.abs(ch), page4: PAGES[4] }; },
    // S2: the cash conversion cycle from the player's own books (C2.09): receivable days = Receivables / Revenue x days, inventory days = Inventory / COGS x days, payable days = Payables / COGS x days, in whole days
    cycleFacts: () => { const s = G.s, is = B.close(s).is, b = S.balanceSheet(s.bal), days = s.day; if (!(is.revenue > 0 && is.cogs > 0)) return { skip: true };
      const dso = Math.round(b.ar / is.revenue * days), dio = Math.round(b.inv / is.cogs * days), dpo = Math.round(b.ap / is.cogs * days);
      return { skip: false, days, revenue: is.revenue, cogs: is.cogs, ar: b.ar, inv: b.inv, ap: b.ap, dso, dio, dpo, ccc: dso + dio - dpo }; },
    // S2: who is paid first (the liquidation waterfall): Crane's offer against what the farm owes; debts come first, the owner last
    waterfallFacts: () => { const o = Endings.offer(G.s), debts = S.balanceSheet(G.s.bal).liab; return { price: o.price, debts, left: Math.max(0, o.price - debts), short: Math.max(0, debts - o.price), k: (G.s.day + o.price) % 3, day: G.s.day }; },
    waterfallRight: v => { const right = v.c === (v.k + 1) % 3; return { right, verdict: right ? "Yes." : "No." }; },
    firstTap: v => ({ firstTap: v.misses === 0 }),
    offerFacts: v => { const o = Endings.offer(G.s); return { o, farm: farmName(), price: o.price, cash: o.cash, wages: o.wages, intro: v.first ? 0 : o.mercy ? 1 : 2, day: G.s.day }; },
  };
  const VERB = {
    ch1Open: () => { LV.parchReset(); LV.craneOn = true; },
    ch1Tag: async (a, v) => { const V = LV, W = G.world, s0 = G.s, cropPlots = () => s0.plots.filter(p => p.crop); G.toast(a.toast);
      const tagging = V.tag({
        show: 1, hintAfter: window.__hintAfter,
        targets: [
          { id: "chest", tiles: [[W.CHEST.x, W.CHEST.y]], line: a.chest, value: v.b.cash },
          { id: "sacks", tiles: [[W.SACKS.x, W.SACKS.y], [W.CRATE.x, W.CRATE.y]], line: a.sacks, value: v.sackVal },
          { id: "crops", tiles: () => cropPlots().map(p => [p.x, p.y]), line: a.crops, value: v.cropVal },
        ],
        decoys: [
          { tiles: [[W.FWELL.x, W.FWELL.y]], says: a.decoyWell },
          { tiles: [[12, 3], [12, 2], [15, 3], [15, 2], [18, 4], [18, 3]], says: a.decoyTrees },
          { tiles: [[W.BOARD.x, W.BOARD.y], [W.BOARD.x, W.BOARD.y - 1]], says: a.decoyBoard },
        ],
      });
      V.remark(a.remarkCash); await V.wait(window.__fastVerbs ? 0 : 1600);
      V.remark(a.remarkRest);
      await tagging;
      await V.countTotal("aTot", s0.bal.cash + v.sackVal + v.cropVal); },
    ch1Liab: async (a, v) => { const V = LV, b = v.b; V.pinRow("liab", a.loan, b.loan); await V.wait(window.__fastVerbs ? 0 : 700); V.pinRow("liab", a.crown, b.crown); await V.wait(window.__fastVerbs ? 0 : 500); await V.countTotal("lTot", b.liab); },
    ch1Stamp: async (a, v) => { const V = LV; V.P.eq = v.b.equity; V.parch(); await V.stamp(a.title, a.sub); },
    clearStamp: () => { document.querySelectorAll(".vstamp").forEach(x => x.remove()); },
    nameFarm: async () => { await nameFarm(); LV.P.title = farmName(); LV.parch(); },
    craneOffer: (a) => craneOffer(a), craneOff: () => { LV.craneOn = false; }, parchClose: () => { LV.parchClose(); },
    buySeeds: (a, v) => G.act(() => S.buySeeds(G.s, Number(a.n != null ? a.n : v.n), a.credit)),
    haggle: (a, v) => GL.haggle(v.o, { open: a.open, walk: a.walk, floor: v.cost, line: a.line }),
    timeline: a => LV.timeline(a),
    // WS3: the Hobb bet. The player predicts the chest from the timeline (cards, no Cash line), stakes real coin, and is told the answer on the morning after Hobb pays.
    ch4bBet: (a, v) => { const V = LV, n = v.n, last = () => { const r = S.forecast(G.s, n); return r[r.length - 1]; };
      const tl = { label: a.tlLabel, open: () => V.timeline({ mode: "show", n, hideLine: true, title: a.tlTitle, maud: a.tlMaud }) };
      return V.bet({ prompt: a.prompt, docs: [tl, DOC.ledger], how: a.how, stake: { min: 0, max: 5 }, tol: 0, answer: () => last().close, reveal: { day: v.revealDay }, kind: "hobb", explain: () => a.explain }); },
    markupBet: (a, v) => LV.bet({ prompt: a.prompt, docs: [DOC.notebook], how: a.how, stake: { min: 0, max: 2 }, tol: 1, answer: () => v.m, reveal: "now", kind: "markup", explain: () => a.explain }),
    costScene: () => costScene(),
    tvm: a => tvmScene(a.again),
    tvmTimeline: (a, v, lazy) => { const bill = v.bill, note = day => day <= bill.discBy ? K.fill(lazy.early, Object.assign({}, v, { daysEarly: bill.due - day })) : K.fill(lazy.late, Object.assign({}, v, { payDay: day }));
      return LV.timeline({ mode: "play", bill, n: Math.max(14, bill.due - G.s.day + 1), title: a.title, footNote: note, maud: a.maud }); },
    tvmSettle: (a, v) => { if (v.r2.paidNow) G.act(() => S.payBills(G.s)); else if (v.r2.day < v.bill.due) G.s.payPlan = { day: v.r2.day }; },
    // The loan must actually arrive: Ezra's limit counts what you already owe, so only offer what he will lend, and if the engine refuses, say why and ask again (it used to fail silently).
    loan: async (a, v, lazy) => { let borrowed = 0, intro = v.intro;
      for (;;) {
        const room = S.terms(G.s).loanLimit + G.s.bal.loan;
        const c = await GL.say("ezra", room < 200 ? K.fill(lazy.short, Object.assign({}, v, { intro, roomShown: Math.max(0, room), owed: -G.s.bal.loan })) : intro, [{ label: a.buttons[0], disabled: room < 100 }, { label: a.buttons[1], disabled: room < 200 }, a.buttons[2]]);
        if (c === 2) break; const amt = c ? 200 : 100, got = G.act(() => S.borrow(G.s, amt));
        if (got.ok) { borrowed = amt; break; }
        intro = K.fill(lazy.retry, { msg: got.msg });
      }
      return borrowed; },
    timelineDuke: (a, v) => LV.timeline({ mode: "show", n: 14, extra: v.extra, tied: true, order: v.ord, title: a.title, maud: a.maud }),
    dukeBet: (a, v) => LV.bet({ prompt: a.prompt, docs: [{ label: a.docLabel, open: () => LV.timeline({ mode: "show", n: 14, extra: v.extra, tied: true, order: v.ord, title: v.title }) }], how: a.how, stake: { min: 0, max: 3 }, tol: 0, answer: () => v.low.close, reveal: "now", kind: "duke2", explain: () => a.explain }),
    dukeAct: (a, v) => { const o = v.o, D = v.D, c = v.c;
      if (c === 1) { S.addOffer(G.s, "duke", v.half, o.price, D.terms, D.dueIn, 4); S.decline(G.s, o.id); G.act(() => S.accept(G.s, G.s.offers.find(x => x.who === "duke").id)); }
      else if (c === 0) G.act(() => S.accept(G.s, o.id)); else S.decline(G.s, o.id); },
    cashBookPanel: (a, v) => new Promise(res => {
      G.showPanel("page", `<div class="journal"><div class="hint">Edric's cash book, the second ledger</div><table class="stm" style="font-style:normal"><tr><th>End of</th><th>Ledger: profit</th><th>Chest: Cash cleared</th><th>Tied up in grain and unpaid invoices</th></tr>` +
        v.rows.map(r => `<tr><td>day ${r.day}</td><td class="num">${LV.fmt(r.ni)}</td><td class="num">${LV.fmt(r.cash)}</td><td class="num">${LV.fmt(r.tied)}</td></tr>`).join("") +
        `</table><p>Every spring the Ledger climbs and the chest does not. The difference sits in sacks and invoices nobody has paid for yet: Inventory plus Receivables, less what you still owe.</p><p class="sig">— E.</p></div><button class="btn gold" id="pgok">Keep it</button>`);
      document.getElementById("pgok").onclick = () => { G.hidePanel(); res(); };
    }),
    reveal: a => GL.reveal(a.kind, a.text), pickLine: (a, v) => GL.pickLine(a.text, v.target, a.hints),
    logPage4: () => { if (st.pages.indexOf(4) < 0) { st.pages.push(4); (st.pageDays = st.pageDays || {})[4] = G.s.day; } },
    sell: (a, v) => sell(v.o),
  };
  const ch1 = () => play("ch1"), ch2 = () => play("ch2"), ch3 = () => play("ch3"), ch4 = () => play("ch4"), ch4b = order => play("ch4b", { order }), ch5 = () => play("ch5"), ch6 = () => play("ch6"), ch7 = () => play("ch7"), ch9t = () => play("ch9t");
  const costScene = () => play("cost"), pvScene = () => play("pv"), tvmScene = again => play("tvm", { again: !!again }), dukeScene = n => play("duke", { n }), chPage = () => play("page"), cashBook = () => play("cashbook");
  const craneOffer = opts => play("offer", { first: !!(opts && opts.first) }); // true when the player sold the farm
  // the bet's morning: runs whenever the story is free on or after the reveal day
  async function revealIfDue() { if (!G.s.bet || G.s.day < G.s.bet.revealDay) return; const r = await LV.revealBet(); if (r && r.win) { mastered("accrual"); mastered("ar"); } }
  // one set of whole coins, the same the engine books: the discount Tomas actually gives (bill.disc) and a week of Ezra's interest on the Cash you'd keep
  const tvmFacts = bill => { const rate = S.terms(G.s).rateBp, discX = bill.disc, carryX = Math.round(bill.amount * (1 - S.R.discPct) * rate / 10000);
    return { rate, discX, carryX, cheaper: discX > carryX ? "early" : discX < carryX ? "wait" : "even" }; };
  // Rows are rebuilt from the player's own journal at the end of each week (days 7, 14, 21 and today, once each): cumulative Net income (the Ledger), the Cash the farm's
  // operations cleared (the chest: not the opening chest, equipment or loans), and what is tied up in grain and unpaid invoices (Inventory + Receivables - Payables - Deposits).
  function cashBookRows(s) {
    const PL = ["revenue", "cogs", "upkeep", "depreciation", "fines", "losses", "interest", "factoring"], OFF = ["open", "equip", "borrow", "repay"], rows = [], seen = new Set();
    for (const day of [7, 14, 21, s.day]) { if (day > s.day || seen.has(day)) continue; seen.add(day); let cash = 0, ni = 0; const b = { inv: 0, ar: 0, ap: 0, deposits: 0 };
      s.journal.filter(j => j.day <= day).forEach(j => { if (OFF.indexOf(j.type) < 0) cash += j.lines.cash || 0; PL.forEach(k => { ni -= j.lines[k] || 0; }); for (const k in b) b[k] += j.lines[k] || 0; });
      rows.push({ day, cash, ni, tied: b.inv + b.ar + b.ap + b.deposits }); }
    return rows;
  }
  // the three statements, guided (closing the books): see the `close` record
  const close = (stm, h) => play("close", { stm, h });
  const ch8 = () => dukeScene(1), ch8b = () => dukeScene(2);
  // (Canon: Crane is NOT Vane's man. He carries Vane's offer as an instructed messenger, reluctantly; see the `offer` record.)
  function arrive(n) { // Corvin's order n comes to the well (sizes and due dates: S.R.corvin)
    const c = S.R.corvin[n - 1];
    if (!G.s.offers.some(o => o.who === "duke")) S.addOffer(G.s, "duke", c.sacks, S.R.duke.price, S.R.duke.terms, c.dueIn, 4);
    to(8, n === 1 ? "duke8" : "duke9");
  }
  // after the first Market Day's floor bet (market.js): the notebook splits the cost from the real floor (curriculum foundation 5.3)
  function keepFloor(alt, offer) { if (!G || !st) return; const cost = S.R.unitCost; keep("opportunity", "The real floor", "Your cost is the floor only until a better sale exists. Then the floor is the best sale you give up. The seed is already bought, so its cost is sunk: it never decides the next sale.", `Day ${G.s.day}: Ashby offered ${offer} and the fair had paid ${alt}, so the floor is ${alt}, not ${cost}.`, `floor ${alt}, not ${cost}`, `Day ${G.s.day} · the fair`); }

  // Deposits are named unearned revenue (C1.01/C1.03) in the scene (game.js depositLesson) and in the notebook.
  function noteDeposit(o) {
    keep("unearned", "Unearned revenue (customer deposits)", "Cash received for work not yet done. It's a liability, not Revenue, until you deliver; fail to deliver and you refund it.",
      `Day ${G.s.day}: ${S.NAMES[o.who]} paid ${o.paid} up front for ${o.sacks} sacks. Cash +${o.paid}, Revenue +0, Customer deposits +${o.paid}; grain due day ${o.due}.`, `${o.paid} received, ${o.sacks} sacks owed`, `Day ${G.s.day} · ${S.NAMES[o.who].split(" ").slice(-1)[0]}'s deposit`);
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
  async function sell(o) {
    const s = G.s; s.sold = { price: o.price, day: s.day, mercy: o.mercy }; s.sold.so = Endings.soldOut(s, o.price);
    TR.use("tvm", false, s.day); TR.use("equation", false, s.day); // introduced, not credited: selling is not evidence of skill
    pin("offer", "Crane's offer", `took ${money(o.price)} on day ${s.day}`, `Day ${s.day} · you sold`);
    s.over = true; s.outcome = "sold"; G.save(); G.hud(); await showEnding("sold");
  }
  // ---------- endings (item 4): an epilogue card with 3-4 lines and what it unlocks for the next game ----------
  // opts.preview (the ?ending= test hook): show the epilogue for the game in opts.s without saving an unlock
  function showEnding(kind, opts) {
    opts = opts || {};
    return new Promise(res => {
      document.querySelectorAll(".s6ov").forEach(e => e.remove());
      const s = opts.s || G.s, ep = Endings.epilogue(kind, { s, farm: farmName(), sold: s.sold && s.sold.so }), u = opts.preview ? { u: ep.unlock, fresh: false, preview: true } : Endings.unlock(kind);
      const ov = document.createElement("div"); ov.className = "s6ov"; ov.id = "ending";
      ov.innerHTML = `<div class="s6card s6end-${kind}"><div class="s6sub">${farmName()} · Spring · the ending</div><h2>${ep.title}</h2>${ep.lines.map(l => `<p>${l}</p>`).join("")}` +
        (kind === "sold" ? `<div class="s6cmp"><div>You took<b>${money(s.sold.price)}</b></div>${s.sold.so && s.sold.so.earned > 0 ? `<div>${s.sold.so.basis === "cash" ? "Cash cleared this spring" : "Earned this spring"}<b>${money(s.sold.so.earned)}</b></div>` : ""}${s.sold.so ? `<div>Book equity<b>${money(s.sold.so.equity)}</b></div>` : ""}</div><p class="hint">C0.01 time value · C1.01 equity</p>` : "") +
        `<div class="s6unlock">${u && u.preview ? "Preview (not saved)" : u && u.fresh ? "Unlocked" : "Unlocked earlier"}: <b>${ep.unlock.term}</b><br>“${ep.unlock.text}”</div>` +
        `<button class="gold" id="endagain">Play again</button><button id="endcase">Case board</button><button id="endback">${kind === "sold" ? "Close" : "Back to the books"}</button></div>`;
      document.getElementById("wrap").appendChild(ov);
      ov.querySelector("#endagain").onclick = () => G.restart();
      ov.querySelector("#endcase").onclick = () => { ov.style.display = "none"; caseBoard().then(() => { ov.style.display = "flex"; }); };
      const bk = ov.querySelector("#endback"); if (bk) bk.onclick = () => { ov.remove(); res(); };
    });
  }
  // test hook (?ending=sold|seized|bridged|free): show that ending's epilogue on the current game, whatever its state
  async function testEnding(kind) {
    const s = JSON.parse(JSON.stringify(G.s)); // a copy: the preview never touches the real game or the saved unlocks
    if (kind === "sold") { const o = Endings.offer(s); s.sold = { price: o.price, day: s.day, so: Endings.soldOut(s, o.price) }; }
    if (kind === "seized") { s.over = true; s.outcome = "insolvent"; s.why = s.why || "Cash 12 can't cover 48 of wages and interest. The hands walk off."; }
    if (kind === "free") { s.bal.cash += 1500; s.bal.capital -= 1500; }
    if (kind === "bridged") { const need = S.R.crownDebt - S.crownFund(s).net - 150; s.bal.cash += need; s.bal.capital -= need; }
    return showEnding(kind, { s, preview: true });
  }

  // Safety valve (playtest day 22/23: nothing responded until the day was saved and reset): if a scene is waiting on nothing visible, drop it so the map takes clicks again. The day's own prompts come back at the next morning or talk.
  function unstick() { if (!busy) return false; busy = false; epoch++; document.querySelectorAll(".s6ov,.wkcard").forEach(e => e.remove()); G.closeDlg(); G.hidePanel(); G.hud(); return true; }
  // screenshots and tests only (_build-shots/ws6-shots.html): force-start one scene on the current game, whatever the story was doing
  function testScene(kind) {
    busy = false; epoch++; document.querySelectorAll(".s6ov,.wkcard").forEach(e => e.remove()); G.closeDlg(); G.hidePanel(); const s = G.s;
    if (kind === "corvin" || kind === "tied") { s.day = Math.max(s.day, 12); st.ch = 8; arrive(1); G.hud(); run(() => dukeScene(1)); }
    else if (kind === "page") { st.ch = 8; run(() => page(9)); }
    else if (kind === "cashbook") { s.day = Math.max(s.day, 22); to(9, "run9"); run(cashBook); }
    else if (kind === "cost") run(costScene); else if (kind === "pv") run(pvScene); else if (kind === "offer") run(() => craneOffer({ first: true }));
    else if (kind === "tvm") { st.ch = 6; st.stage = "tomas6"; run(() => tvmScene(false)); }
  }
  // ---------- hooks from the game ----------
  let busy = false;
  async function run(fn, ...a) { if (busy) return; busy = true; const my = epoch; window.__walked = false; try { await fn(...a); } catch (e) { if (e !== STALE) throw e; } finally { if (my === epoch) { busy = false; G.hud(); } } } // a chain dropped by unstick() leaves `busy` to the scene that replaced it
  function start() { goal(); if (st.stage === "intro") { const w = dueCard(); if (w) weekCard(w); run(ch1); } }
  function onTalk(who) { // returns true when the story takes the conversation
    if (busy) return true;
    const m = { tomas: { tomas2: ch2, tomas6: ch6, tomas9: ch9t }, ashby: { ashby3: ch3 }, hobb: { hobb4: ch4 }, ezra: { ezra7: ch7 }, duke: { duke8: ch8, duke9: ch8b } }[who];
    if (m && m[st.stage]) { run(m[st.stage]); return true; }
    // Integration: from chapter 5 on, a waiting village scene (#28) or the day's practice problem (#29) must reach the player, so Maud's hint/silence lines below stand aside and game.js shows her menu
    if (who === "maud" && st.ch >= 5 && ((window.Scenes && Scenes.available("maud", G.s)) || (weekOf(G.s.day) !== 4 && window.Practice && Practice.available(G.s, TR.state)))) return false; // (week 4: no problem from Maud, see game.js)
    if (who === "maud" && weekOf(G.s.day) === 4) { run(async () => { const c = S.coach(G.s); await tell(c && c.danger ? c.text : "Maud only nods toward the door. This week she speaks only when the farm is in danger."); }); return true; } // week 4: silent but for danger
    if (who === "maud" && st.ch < 9 && st.stage !== "done") { run(() => tell(`Next: ${goalText().split(": ").slice(1).join(": ")}`)); return true; }
    return false;
  }
  function after(evt, info) {
    if (evt === "morning" && G.s.payPlan && G.s.day >= G.s.payPlan.day) { G.s.payPlan = null; G.act(() => S.payBills(G.s)); G.toast("You paid Tomas, as planned."); }
    if (evt === "morning") { const w = dueCard(); if (w) weekCard(w); goal(); } // WS6: a new week's title card on day 8, 15, 22; the ribbon follows the calendar
    if (busy) return;
    if (evt === "plant" && st.stage === "plant2" && (G.s.seeds === 0 || G.s.plots.filter(p => p.crop).length - (st.planted0 || 0) >= 6))
      run(async () => { await tell("Good: water them every day and in four nights it's grain. Now, Hobb at the mill wants grain too."); to(4, "hobb4"); });
    if (evt === "harvest" && st.stage === "harvest2" && !G.s.plots.some(p => p.crop && S.stage(G.s, p) === 4))
      run(async () => { await tell(`${G.s.sacks} sacks in the barn now. Ashby at the bakery (red roof) is waiting.`); await page(0); to(2, "ashby3"); });
    if (evt === "deliver" && st.stage === "ship3" && info.who === "ashby")
      run(async () => { const cg = info.sacks * S.R.unitCost; await tell(`Revenue ${info.value}, Cost of goods sold ${cg}: gross profit ${info.value - cg}, and it came in as Cash today.<br>Now seed: Tomas has the next packets (east along the path, green roof).`, ["h-cash", "h-ni"]); to(3, "tomas2"); });
    if (evt === "deliver" && st.stage === "ship4" && info.who === "hobb") run(ch4b, info);
    if (evt === "morning") run(async () => { // one ordered chain per morning, so two scenes never race for the same dialog
      const d = G.s.day, e0 = epoch;
      if (window.Scenes && Scenes.morning) await Scenes.morning({ G, st, S, day: d }); // HOOK: village scenes from another PR (cast.js / scenes.js); nothing is built here
      if (e0 !== epoch) throw STALE; // the valve fired while a village scene waited
      if (d === S.eventDay(G.s, "pigs") + 1) await cut("pigs-night"); // S5: the morning after the pigs' night
      if (st.stage === "sleep5" && d >= 8) await ch5();
      const revealed = !!(G.s.bet && d >= G.s.bet.revealDay); // the bet's reveal is already a run of four boxes: the present-value lesson waits for the next morning
      if (revealed) await revealIfDue();
      if (st.stage === "sleep8" && d >= 12) { arrive(1); await cut("vane-arrives"); await tell("Corvin Vane is in the square, in a grey cloak and gloves on a warm day, asking for you by name. Mind his smile: it is paid for by someone."); } // the midpoint: day 12 (#28's description of Vane)
      else if (st.stage === "page8") await chPage();
      else if (st.stage === "sleep9" && d >= 15) { arrive(2); await tell("The steward is back at the well, with a thicker roll of paper."); }
      else if (weekOf(d) === 3 && st.ch >= 8 && st.mercy !== 3 && G.s.bal.cash < S.weekBills(G.s)) { st.mercy = 3; await craneOffer({ mercy: true }); } // Crane visits when Cash can't cover the pay-day
      else if (st.stage === "run9" && d >= 16 && d < 22 && !st.pv && !revealed && await pvScene()) { /* played once, in week 3 */ }
      else if (st.stage === "run9" && d >= 16 && d < 22 && st.pv && !st.cycle && !revealed) await play("cycle"); // S2: the cash conversion cycle, the morning after the present-value lesson
      else if (st.stage === "run9" && d >= 22 && !st.book) await cashBook(); // week 4: the cash book, Maud's last word
      else if (st.stage === "run9" && d >= 23 && st.book && !st.waterfall) await play("waterfall"); // S2: who is paid first, Ezra's order of a sale
    });
  }
  const quietOffers = () => st && st.ch <= 4; // no stray orders while the first lessons run
  // Edric's letters in the order you found them (earliest day first); "The thing I signed" is always last, after the Court
  const letterOrder = () => { const d = (st && st.pageDays) || {}, last = LETTERS.indexOf("The thing I signed"); return (st ? st.pages : []).slice().sort((a, b) => (a === last) - (b === last) || (d[a] == null ? 99 : d[a]) - (d[b] == null ? 99 : d[b]) || a - b); };
  return { init, start, onTalk, letterOrder, after, close, quietOffers, letter: page, LETTERS, goalTexts: () => GOALS, get state() { return st; }, get busy() { return busy; }, unstick, TITLES, WEEKS, PAGES, fresh, weekCard, weekOf, pin, farmName,
    testScene, noteDeposit, keepFloor, tidyClue, craneOffer, caseBoard, deskItems, deskNote, showEnding, testEnding, nameFarm, tvmFacts, cashBookRows, costScene, pvScene, tables: { CALC, VERB }, cut }; // WS6 hooks used by game.js and the tests; letter/LETTERS are #28's
})();
