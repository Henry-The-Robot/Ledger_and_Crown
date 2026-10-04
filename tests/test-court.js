// The Reeve's Court: every claim is built from the player's own statements, and a right card always exists. Run: node tests/test-court.js
global.window = global; global.location = { search: "" }; global.document = { readyState: "complete", addEventListener() {} };
const S = require("../engine.js"), B = require("../books.js"); global.Spring = S; global.Books = B; const Bot = require("../bot.js"); require("../court.js"); const C = window.Court;
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const flags = { guarantee: true, hobbExt: true, vane: "asked", craneVane: true }, clues = [{ id: "g", term: "Guarantee for Ashby's bakery", number: null, source: "Ashby" }, { id: "d", term: "Mortgage payable on demand", number: null, source: "Vane" }];
let books = 0, bad = [], unreachable = [], fresh = 0;
for (const bot of [Bot.careful, Bot.reckless, Bot.sprinkler, Bot.overtrader, Bot.noDuke]) {
  const s = S.newGame({ story: false }); for (let d = 1; d <= 28 && !s.outcome; d++) { bot.day(s); S.sleep(s); } const st = B.close(s); books++;
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const r = C.build({ statements: st, clues, flags, trust: { crane: 4 }, seed, attempt: seed % 3, facts: { ratePct: 3.5, market: 8, bill: S.weekBills(s) } });
    if (r.claims.length !== 9) bad.push(`${bot.name} seed ${seed}: ${r.claims.length} claims`);
    const ids = r.claims.map(c => c.id); if (new Set(ids).size !== ids.length) bad.push("duplicate claim");
    for (const c of r.claims) {
      if (/undefined|NaN|\[object|\$\{/.test(c.text + c.maud + c.crane + c.press.map(p => p.t).join())) bad.push(`${c.id}: bad text`);
      const pool = r.cards.concat(c.reveal ? [c.reveal] : []).concat([{ id: "found:rate", tab: "found", label: "Ezra's rate" }]), right = pool.filter(k => c.right(k));
      if (!right.length) unreachable.push(`${bot.name}/${c.id}`);
      // a wrong answer exists too (the claim isn't refuted by everything)
      if (right.length === pool.length) bad.push(`${c.id}: every card refutes it`);
    }
    // the numbers quoted in the claim come from the books
    const q = r.claims.find(c => c.id === "profitCash"); if (q && !q.text.includes(String(st.is.net))) bad.push(`${bot.name} seed ${seed}: the profit claim doesn't quote the player's own net income ${st.is.net}`);
    if (seed === 1) { const o = C.build({ statements: st, clues, flags, trust: {}, seed: 99 }); fresh += o.claims.map(c => c.id).join() !== r.claims.map(c => c.id).join() ? 1 : 0; }
  }
}
ok(bad.length === 0, "5 bot seasons x 6 seeds: 9 distinct claims each, no undefined text, no card that refutes everything" + (bad.length ? " :: " + bad.slice(0, 4).join(" | ") : ""));
ok(unreachable.length === 0, "every claim has at least one card that refutes it (from the statements, clues, a press reveal or Ezra)" + (unreachable.length ? " :: " + unreachable.slice(0, 4).join(", ") : ""));
ok(fresh > 0, "a retake (different seed) brings a different set or order of claims");
{ const s = S.newGame({ story: false }); for (let d = 1; d <= 28 && !s.outcome; d++) { Bot.careful.day(s); S.sleep(s); } const st = B.close(s);
  const none = C.build({ statements: st, clues: [], flags: {}, trust: {}, seed: 1 }); ok(none.claims.length === 9 && none.claims.some(c => c.id === "callable"), "with no clues and no flags there are still 9 claims (Vane's 'on demand' claim stands in for the guarantee)");
  const mg = none.claims.find(c => c.id === "margin"); if (mg) { const gm = Math.round(st.is.gross / st.is.revenue * 100); ok(mg.right(none.cards.find(k => k.id === "is:gm")) && !mg.right(none.cards.find(k => k.id === "is:net")) && none.cards.find(k => k.id === "is:gm").raw === gm, `margin claim: the right card is Gross margin (${gm}%), computed from the Income statement`); }
  const pc = none.claims.find(c => c.id === "profitCash"); if (pc) ok(pc.right(none.cards.find(k => k.id === "cf:change")) && !pc.right(none.cards.find(k => k.id === "is:net")), "profit-is-not-cash: the Cash-flow lines refute it, the Income-statement line doesn't"); }
// Creative call 6: a sitting is nine claims (one per Season 1 core idea plus the guarantee), pass is six, and a retake on the same books is not a repeat
{ ok(C.PASS === 6 && C.TOTAL === 9, "a sitting has 9 claims and the pass mark is 6");
  const s = S.newGame({ story: false }); for (let d = 1; d <= 28 && !s.outcome; d++) { Bot.careful.day(s); S.sleep(s); } const st = B.close(s), facts = { ratePct: 3.5, market: 8, bill: S.weekBills(s) };
  const CORE = ["equation", "cash", "margin", "breakeven", "opportunity", "tvm", "wc", "ev"], HYP = ["breakeven", "floorOffer", "waitingFree", "caravanEv"], badCore = [], repeats = [], hypSame = [];
  const sitting = (fl, seed, attempt) => C.build({ statements: st, clues, flags: fl, trust: {}, seed, attempt, facts });
  for (const seed of [1, 2, 3, 7, 11, 40]) for (const fl of [flags, {}]) {
    const sit = [0, 1, 2, 3, 4].map(a => sitting(fl, seed, a));
    sit.forEach((r, a) => { const cores = r.claims.map(c => c.core), tag = `seed ${seed} sitting ${a}`;
      for (const k of CORE) if (cores.filter(z => z === k).length !== 1) badCore.push(`${tag}: ${k} x${cores.filter(z => z === k).length}`);
      if (cores.filter(z => z === "guarantee").length !== 1 || cores.length !== 9) badCore.push(`${tag}: guarantee slot / total ${cores.length}`);
      if (r.claims.find(c => c.core === "guarantee").id !== (fl.guarantee ? "guarantee" : "callable")) badCore.push(`${tag}: wrong guarantee-slot claim`); });
    for (let a = 0; a < 4; a++) { const A = sit[a].claims, Bc = sit[a + 1].claims, ids = x => x.map(c => c.id).sort().join(), txt = (x, id) => x.find(c => c.id === id).text;
      if (ids(A) === ids(Bc) && HYP.every(h => txt(A, h) === txt(Bc, h))) repeats.push(`seed ${seed} ${a}->${a + 1}`);
      for (const h of HYP) if (txt(A, h) === txt(Bc, h)) hypSame.push(`seed ${seed} ${a}->${a + 1} ${h}`); } }
  ok(badCore.length === 0, "every sitting has exactly one claim per core idea (equation, profit vs cash, margin, break-even, opportunity cost, time value, working capital, expected value) plus one guarantee-slot claim" + (badCore.length ? " :: " + badCore.slice(0, 4).join(" | ") : ""));
  ok(repeats.length === 0, "two consecutive sittings on the same books differ (a claim id or a hypothetical's numbers)" + (repeats.length ? " :: " + repeats.slice(0, 4).join(" | ") : ""));
  ok(hypSame.length === 0, "the four hypothetical claims (break-even, floor offer, waiting, caravan) change their numbers from one sitting to the next" + (hypSame.length ? " :: " + hypSame.slice(0, 4).join(" | ") : ""));
  { const ids = n => sitting(flags, 1, n).claims.map(c => c.id); ok(ids(0).filter(i => ["ownsNothing", "equityBank"].includes(i)).join() !== ids(1).filter(i => ["ownsNothing", "equityBank"].includes(i)).join() && ids(0).find(i => ["profitCash", "arCash", "inventoryCash"].includes(i)) !== ids(1).find(i => ["profitCash", "arCash", "inventoryCash"].includes(i)), "a retake draws a different variant from the equation pool and from the profit-is-not-cash pool"); }
  // the caravan keeps its ruin point and its positive average at every draw; waiting is worth less than the amount
  const cv = [0, 1, 2, 3, 4, 5].map(a => sitting(flags, 1, a).claims.find(c => c.id === "caravanEv")), gain = c => +c.reveal.src.match(/average gain is (\d+) on (\d+)/)[1], stake = c => +c.reveal.src.match(/average gain is (\d+) on (\d+)/)[2];
  ok(cv.every(c => gain(c) > 0 && gain(c) < stake(c) && stake(c) >= 60 && /Crown still wants/.test(c.reveal.src)) && new Set(cv.map(c => c.text)).size === 6, "caravan: six sittings, six different bets, each with a positive average smaller than the stake, a stake of at least 60, and the Crown's debt named as what the loss meets"); }
// the break-even claim uses the player's real weekly bill (wages after sprinklers + interest), not the sticker wage
{ const a = S.newGame(), b = S.newGame(); b.bal.cash = 400; S.buySprinkler(b); S.act(b, b.plots.find(p => p.tilled && !p.crop).i);
  const w0 = S.weekBills(a), w1 = S.weekBills(b), st = B.close(a), be = bill => C.build({ statements: st, clues, flags, trust: {}, seed: 1, facts: { ratePct: 3.5, market: 8, bill } }).claims.find(c => c.id === "breakeven"), n = c => +c.reveal.src.match(/(\d+) sacks a week/)[1];
  const c0 = be(w0), c1 = be(w1); ok(w1 < w0 && c0.reveal.value === w0 && c1.reveal.value === w1 && n(c1) < n(c0) && /Your weekly wages and interest/.test(c1.reveal.src), `break-even claim: a sprinkler season shows the lower weekly bill (${w1} vs ${w0}) and fewer sacks (${n(c1)} vs ${n(c0)})`);
  const fb = C.build({ statements: st, clues, flags, trust: {}, seed: 1, facts: { ratePct: 3.5, market: 8 } }).claims.find(c => c.id === "breakeven"); ok(fb.reveal.value === S.R.upkeep, "without a bill in the facts it falls back to the sticker wage"); }
// Maud speaks in at most two sentences a box; Crane in formal prose with at most two "Item:" markers
{ const sent = x => x.replace(/<[^>]+>/g, "").split(/(?<=[.?!])\s+/).filter(Boolean).length, long = [], nocr = [];
  for (const bot of [Bot.careful, Bot.reckless]) { const s = S.newGame({ story: false }); for (let d = 1; d <= 28 && !s.outcome; d++) { bot.day(s); S.sleep(s); } const st = B.close(s);
    for (let seed = 1; seed <= 4; seed++) for (const c of C.build({ statements: st, clues, flags, trust: {}, seed }).claims) { if (sent(c.maud) > 2) long.push(c.id + ":maud(" + sent(c.maud) + ")"); c.press.filter(p => p.w === "maud").forEach(p => { if (sent(p.t) > 2) long.push(c.id + ":press"); }); if ((c.crane.match(/Item:/g) || []).length > 2 || !/Your Honour/.test(c.crane)) nocr.push(c.id); } }
  ok(long.length === 0, "every Maud box is at most two sentences" + (long.length ? " :: " + [...new Set(long)].join(", ") : "")); ok(nocr.length === 0, "Crane's testimony is formal (addresses the court, at most two 'Item:' markers)" + (nocr.length ? " :: " + [...new Set(nocr)].join(", ") : "")); }
process.exit(fail ? 1 : 0);
