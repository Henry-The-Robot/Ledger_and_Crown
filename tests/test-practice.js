// Maud's daily problems: every problem's answer must be computed from the same books the player sees. Run: node tests/test-practice.js
global.window = global; const S = require("../engine.js"), B = require("../books.js"); global.Spring = S; global.Books = B; global.Transcript = require("../transcript.js");
const Bot = require("../bot.js"); require("../practice.js"); const P = window.Practice;
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const seen = new Set(), bad = []; let n = 0, cmps = 0;
for (const bot of [Bot.careful, Bot.reckless, Bot.sprinkler, Bot.overtrader]) {
  const s = S.newGame(); s.story = false;
  for (let d = 1; d <= 28 && !s.outcome; d++) {
    const c = P.compare(s); if (c) { cmps++; if (![0, 1, 2].includes(c.answer) || /undefined|NaN/.test(c.text + c.work)) bad.push(`compare d${s.day}`); }
    try { bot.day(s); } catch (e) {}
    for (const b of P.BANK) { let q = null; try { q = b.make(s); } catch (e) { bad.push(`${b.id} d${s.day} threw ${e.message}`); } if (!q) continue; n++; seen.add(b.id);
      if (typeof q.answer !== "number" || !isFinite(q.answer) || /undefined|NaN|\[object/.test(q.text + q.work) || !q.hints.length) bad.push(`${b.id} d${s.day}: ${q.answer} | ${q.text.slice(0, 90)}`); }
    S.sleep(s);
  }
}
ok(bad.length === 0, `${n} problems across 4 bots: every answer is a number, no undefined text` + (bad.length ? " :: " + bad.slice(0, 4).join(" || ") : ""));
ok(P.BANK.every(b => seen.has(b.id)), "every problem type came up in play" + (P.BANK.filter(b => !seen.has(b.id)).length ? " (missing: " + P.BANK.filter(b => !seen.has(b.id)).map(b => b.id).join(",") + ")" : ""));
ok(cmps > 0, "the two-offer comparison is built when offers are on the table");
// the engine agrees with a worked example
{ const s = S.newGame(); s.day = 8; s.bal.cash = 500; s.bal.loan = -200; s.bal.ap = 0; s.bills = []; S.buySeeds(s, 3, true); const q = P.BANK.find(b => b.id === "repay100").make(s), f = S.loanFacts(s, 100);
  ok(q && q.choices.length === 2 && q.answer === (f.net > 2 ? 0 : 1), "repay-100 decision answer matches loanFacts vs the 2% discount"); }
{ const s = S.newGame(); s.day = 8; const q = P.BANK.find(b => b.id === "fund9").make(s); ok(q === null || (q.answer === 0 && /on account/.test(q.choices[0])), "fund-9 is null without credit or says account is cheaper"); }
ok(!P.ids.some(i => ["equation", "operating", "fund", "inventory", "ar"].includes(i)), "pure-arithmetic problems are gone from the bank");
// variety, determinism, one a day, streaks
{ const s = S.newGame(); const days = []; for (let d = 4; d <= 14; d++) { s.day = d; const p = P.pick(s, () => "introduced"); if (p) { days.push(p.id); P.record(s, p, true, false); } }
  ok(new Set(days).size >= 5 && days.every((x, i) => !i || x !== days[i - 1]), "different problems on different days, never the same one twice running: " + days.join(" "));
  ok(s.practice.streak >= 8 && s.practice.favour === days.length, "right answers on consecutive days build a streak and earn favours");
  s.day = 20; ok(P.available(s, () => "introduced"), "a new day has a new problem"); const p2 = P.pick(s, () => "introduced"); P.record(s, p2, true, true); ok(P.available(s, () => "introduced") === null, "one problem a day");
  ok(s.practice.favour === days.length, "a walked-through answer earns no favour"); }
// the four foundation problem types: each answer is derived from the engine
{ const s = S.newGame({ story: false }); for (let d = 1; d <= 16; d++) { Bot.careful.day(s); S.sleep(s); } const get = id => P.BANK.find(b => b.id === id).make(s), c = S.R.unitCost;
  const o = get("opportunity"); ok(o && o.answer === S.traderPrice(s.day) && /road trader pays/.test(o.text), `opportunity cost: the floor is the best alternative sale (${o && o.answer}), not the ${c} it cost`);
  const e = get("ev"); const n = +/carry <b>(\d+)<\/b>/.exec(e.text)[1]; ok(e.answer === Math.round(.4 * n * c), `expected value of the caravan: 0.7 x ${n * c} - 0.3 x ${n * c} = ${e.answer}`);
  const sc = get("scaling"), b = S.balanceSheet(s.bal); ok(sc && sc.answer === 2 * (b.inv + b.ar - b.ap - b.deposits), `scaling gap: double the sales, double the tied-up Cash (${sc && sc.answer})`);
  const r = get("ruin"), f = S.crownFund(s), cost = +/lose all <b>(\d+)<\/b>/.exec(r.text)[1]; ok(r.answer === (f.net - cost >= f.crown ? 0 : 1) && r.choices.length === 2, `ruin: ${f.net} - ${cost} against the Crown's ${f.crown} -> ${r.choices[r.answer]}`);
  const flips = new Set(); for (const e2 of [0, 4, 8, 10]) { const g = S.newGame({ story: false }); g.trust.ezra = e2; const t = P.BANK.find(x => x.id === "tvmflip").make(g); if (t) flips.add(t.answer); } ok(flips.size === 2, "the time-value answer flips as Ezra's rate moves (take the discount at a low rate, skip it at a high one)"); }
// difficulty ramps with mastery: the same problem is harder (and different) at tier 2 and 3
{ const s = S.newGame(); s.day = 10; const be = P.BANK.find(b => b.id === "breakeven"), a = be.make(s, 1), b = be.make(s, 2), c = be.make(s, 3); ok(a && b && c && a.text !== b.text && c.answer >= b.answer && b.answer >= a.answer, "break-even: tier 2 adds a price cut and tier 3 a dearer seed, so the answer rises");
  const ev = P.BANK.find(b => b.id === "ev"), e1 = ev.make(s, 1), e3 = ev.make(s, 3); ok(e1.answer > 0 && e3.answer < 0, "expected value: tier 3 is a bet whose average is a loss (the player must compute, not assume)");
  const p = P.pick(s, c0 => "mastered"); ok(p && p.tier === 3, "a mastered concept gets a tier-3 problem"); }

process.exit(fail ? 1 : 0);
