// Maud's daily problems: every problem's answer must be computed from the same books the player sees. Run: node tests/test-practice.js
global.window = global; const S = require("../engine.js"), B = require("../books.js"); global.Spring = S; global.Books = B; global.Transcript = require("../transcript.js");
const Bot = require("../bot.js"); require("../practice.js"); const P = window.Practice;
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const seen = new Set(), bad = [], seenT = { 1: new Set(), 2: new Set(), 3: new Set() }; let n = 0, cmps = 0;
// Independent cross-check of every tiered problem: the numbers stated in the problem's text must match the engine's state, and the answer must follow from those stated numbers.
const nums = t => [...t.matchAll(/<b>(-?[\d.]+)/g)].map(m => +m[1]), wagesNow = s => S.weekBills(s) - Math.round(-s.bal.loan * S.terms(s).rateBp / 10000);
const VERIFY = {
  breakeven(s, q, t) { const n = nums(q.text), w = n[0], p = n[1]; if (w !== wagesNow(s)) return "wages differ from the engine"; const p0 = S.marketPrice(s.day);
    if (t === 1 ? p !== p0 : (p >= p0 || +/falls from (\d+)/.exec(q.text)[1] !== p0)) return "price differs from the market";
    const g = t === 1 ? n[2] : p - +/sack (?:now )?costs (\d+)/.exec(q.text)[1]; if (t === 1 && g !== p - S.R.unitCost) return "gross profit per sack"; return q.answer * g >= w && (q.answer - 1) * g < w ? null : `answer ${q.answer} is not ceil(${w}/${g})`; },
  opportunity(s, q, t) { const n = nums(q.text); if (n[1] !== S.R.unitCost) return "cost differs"; if (n[2] !== S.traderPrice(s.day)) return "trader price differs from the engine"; const haul = t === 1 ? 0 : +/haul costs you (<b>)?(\d+)/.exec(q.text)[2];
    const want = t >= 3 ? n[2] - haul - n[0] : n[2] - haul; return q.answer === want ? null : `answer ${q.answer}, hand ${want}`; },
  tvmflip(s, q) { const base = +/off a (\d+) bill/.exec(q.text)[1], wks = /two weeks early/.test(q.text) ? 2 : 1, fee = /flat (\d+)/.test(q.text) ? +/flat (\d+)/.exec(q.text)[1] : 0, rate = nums(q.text)[0]; if (rate !== S.terms(s).rateBp / 100) return "rate differs from Ezra's";
    const disc = Math.round(base * 0.02), carry = Math.round(base * 0.98 * rate / 100 * wks) + fee; return q.answer === (disc > carry ? 0 : 1) ? null : `answer ${q.answer}, hand disc ${disc} carry ${carry}`; },
  scaling(s, q) { const n = nums(q.text), b = S.balanceSheet(s.bal), tied = b.inv + b.ar - b.ap - b.deposits;
    if (/take twice as long/.test(q.text)) return n[0] === b.inv && n[1] === b.ar && n[2] === b.ap && n[3] === b.deposits && q.answer === 2 * b.inv + 4 * b.ar - 2 * b.ap - 2 * b.deposits ? null : "tier-3 gap";
    return n[0] === tied && Math.abs(q.answer - (/rise by half/.test(q.text) ? 1.5 : 2) * tied) <= 1 ? null : `gap ${n[0]} vs engine ${tied}, answer ${q.answer}`; },
  ev(s, q) { const n = +nums(q.text)[0], cost = n * S.R.unitCost, win = +/(\d+)% of the time they sell/.exec(q.text)[1] / 100, mult = /double/.test(q.text) ? 2 : 1.5; return /cost you (\d+)/.exec(q.text)[1] == cost && q.answer === Math.round(win * (mult - 1) * cost - (1 - win) * cost) ? null : `ev ${q.answer}`; },
  ruin(s, q) { const f = S.crownFund(s), n = nums(q.text); return n[0] === f.crown && n[1] === f.net && q.answer === (f.net - n[2] >= f.crown ? 0 : 1) ? null : "ruin"; },
};
for (const bot of [Bot.careful, Bot.reckless, Bot.sprinkler, Bot.overtrader]) {
  const s = S.newGame(); s.story = false;
  for (let d = 1; d <= 28 && !s.outcome; d++) {
    const c = P.compare(s); if (c) { cmps++; if (![0, 1, 2].includes(c.answer) || /undefined|NaN/.test(c.text + c.work)) bad.push(`compare d${s.day}`); }
    try { bot.day(s); } catch (e) {}
    for (const b of P.BANK) for (const tier of [1, 2, 3]) { let q = null; try { q = b.make(s, tier); } catch (e) { bad.push(`${b.id} t${tier} d${s.day} threw ${e.message}`); } if (!q) continue; n++; seen.add(b.id); seenT[tier].add(b.id);
      if (typeof q.answer !== "number" || !isFinite(q.answer) || /undefined|NaN|\[object/.test(q.text + q.work + (q.hints || []).join()) || !q.hints.length) bad.push(`${b.id} t${tier} d${s.day}: ${q.answer} | ${q.text.slice(0, 90)}`);
      if (q.why && !(q.why.right >= 0 && q.why.right < q.why.opts.length)) bad.push(`${b.id} t${tier}: why has no right option`);
      if (VERIFY[b.id]) { let e = null; try { e = VERIFY[b.id](s, q, tier); } catch (x) { e = "verify threw " + x.message; } if (e) bad.push(`${b.id} t${tier} d${s.day}: ${e}`); } }
    S.sleep(s);
  }
}
ok(bad.length === 0, `${n} problems (tiers 1, 2 and 3) across 4 bots: every answer is a number, no undefined text, and every tiered answer matches the engine's numbers` + (bad.length ? " :: " + bad.slice(0, 4).join(" || ") : ""));
ok(["breakeven", "opportunity", "tvmflip", "scaling", "ev"].every(id => [1, 2, 3].every(t => seenT[t].has(id))), "the sweep reached tiers 1, 2 and 3 of break-even, opportunity cost, time value, scaling and expected value");
ok(P.BANK.every(b => seen.has(b.id)), "every problem type came up in play" + (P.BANK.filter(b => !seen.has(b.id)).length ? " (missing: " + P.BANK.filter(b => !seen.has(b.id)).map(b => b.id).join(",") + ")" : ""));
ok(cmps > 0, "the two-offer comparison is built when offers are on the table");
// the engine agrees with a worked example
// repay-100 against an independent hand calculation (not the code's formula). A 100 bill, 2% off = 2 coins. Repaying Ezra instead saves one week of interest on the 98 you would
// otherwise pay Tomas. Hand figures, day 22 (no early-repayment fee): 3.5% -> 3.43 > 2 repay Ezra; 2.25% -> 2.205 > 2 repay Ezra; 2.0% -> 1.96 < 2 pay Tomas; 1.0% -> 0.98 < 2 pay Tomas.
{ const mk = (e, day) => { const s = S.newGame(); s.day = day; s.bal.cash = 500; s.bal.loan = -200; s.bal.ap = -100; s.trust.ezra = e; s.bills = [{ id: 1, amount: 100, due: day + 14, discBy: day + 7, disc: 2, late: false }]; return s; }, R100 = P.BANK.find(b => b.id === "repay100"), TF = P.BANK.find(b => b.id === "tvmflip");
  const hand = [[0, 3.5, 0, "repay Ezra"], [3, 2.75, 0, ""], [4, 2.5, 0, ""], [5, 2.25, 0, "repay Ezra"], [6, 2.0, 1, "pay Tomas"], [7, 1.75, 1, ""], [10, 1.0, 1, "pay Tomas"]], wrong = [];
  for (const [e, rate, want] of hand) { const s = mk(e, 22), q = R100.make(s); if (!q || S.terms(s).rateBp / 100 !== rate || q.answer !== want) wrong.push(`${rate}%: got ${q && q.answer}, hand ${want}`); }
  ok(wrong.length === 0, "repay-100 matches the hand calculation at 7 rates, one each side of the 2% flip (3.5, 2.25 -> repay Ezra; 2.0, 1.0 -> pay Tomas)" + (wrong.length ? " :: " + wrong.join(" | ") : ""));
  const agree = []; for (const e of [0, 3, 4, 7, 10]) { const s = mk(e, 22), t = TF.make(s, 1), q = R100.make(s); if (t && q.answer !== 1 - t.answer) agree.push(`${S.terms(s).rateBp / 100}%`); else if (!t) agree.push("null@" + e); }
  ok(agree.length === 0, "repay-100 agrees with tvmflip at every rate where tvmflip has an answer (repay Ezra = skip the discount)" + (agree.length ? " :: " + agree.join(",") : ""));
  { const s = mk(0, 8), q = R100.make(s), f = S.loanFacts(s, 100); ok(f.fee === 4 && q.answer === 1 && /4 fee/.test(q.text) && /less the 4 fee/.test(q.work), "before day 21 the early-repayment fee (4 on 100 at 3.5%) turns 3.43 of interest saved into a loss: pay Tomas early"); }
  { const s = mk(0, 22), q = R100.make(s); ok(!/pay-days|every pay-day/.test(q.text + q.hints.join() + q.work) && /one week/.test(q.work + q.hints.join()), "repay-100 compares ONE week of interest with the discount, never every remaining pay-day"); }
  { const s = mk(0, 22); s.bal.loan = -50; ok(R100.make(s) === null, "no problem when Ezra is owed less than the bill (the two options would not use the same money)"); } }
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
  const p = P.pick(s, c0 => "mastered"); ok(p && p.tier === 3, "a mastered concept gets a tier-3 problem");
  // the "Why?" question and the hints fit the tier
  ok(!/price cut/.test(a.why.q) && /wages/i.test(a.why.q) && /price cut/.test(b.why.q) && b.why.q === c.why.q, "break-even: tier 1 asks why the wages set the count (no price cut there); tiers 2-3 ask about the price cut");
  const e2 = ev.make(s, 2), pc = x => x.hints[0].match(/gain on (\d+)%, loss on (\d+)%/).slice(1).join("/");
  ok(pc(e1) === "70/30" && pc(e2) === "60/40" && pc(e3) === "60/40" && /60%/.test(e3.text) && /40%/.test(e3.text), "expected value: the hint quotes the tier's own odds (70/30 at tier 1, 60/40 at tiers 2-3)");
  ok(/losing average/.test(e3.why.q) && /good average/.test(e2.why.q) && e1.answer > 0 && e2.answer > 0, "expected value: tier 3's Why? is about a losing average; tiers 1-2 (positive average) keep the ruin question"); }

process.exit(fail ? 1 : 0);
