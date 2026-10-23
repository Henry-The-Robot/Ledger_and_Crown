// Mini-Court study mode (MBA-ST8): fixed claims from config, one sitting, pass rule from config. Run: node tests/test-study-court.js
global.window = global; global.location = { search: "" }; global.document = { readyState: "complete", addEventListener() {} };
const S = require("../core/engine.js"), B = require("../core/books.js"); global.Spring = S; global.Books = B; const Bot = require("../core/bot.js"); require("../chapters/ch1/spring/court.js"); const C = window.Court;
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };

// the config as study-route.json writes it (court block)
const CFG = { claims: [{ id: "ownsNothing", concept: "S1" }, { id: "margin", concept: "S3" }, { id: "termsVsWages", concept: "S8" }, { id: "profitCash", concept: "S10" }], order: "fixed", seed: 11, pass: 3, of: 4, retake: false };
const season = bot => { const s = S.newGame({ story: false }); for (let d = 1; d <= 28 && !s.outcome; d++) { bot.day(s); S.sleep(s); } return s; };
const s0 = season(Bot.careful), st = B.close(s0), facts = { ratePct: 3.5, market: 8, bill: S.weekBills(s0), invoices: [{ who: "Hobb", due: 15 }] };
const sit = (study, extra) => C.build(Object.assign({ statements: st, clues: [], flags: {}, trust: {}, seed: 1, facts }, extra || {}, { study }));

// 1. The same config gives the same four claims, in the config's order, with the same text
const a = sit(CFG), b = sit(CFG);
ok(a.claims.map(c => c.id).join() === "ownsNothing,margin,termsVsWages,profitCash", "the four claims come in the config's order: " + a.claims.map(c => c.id));
ok(a.claims.map(c => c.text).join("|") === b.claims.map(c => c.text).join("|"), "the same config twice gives identical claim text");
ok(a.pass === 3 && a.of === 4, "the pass rule comes from the config (3 of 4)");
ok(sit(CFG, { seed: 99, attempt: 4 }).claims.map(c => c.text).join("|") === a.claims.map(c => c.text).join("|"), "the caller's seed and attempt do not change a study sitting: the config's seed rules");
ok(a.claims.every((c, i) => c.n === i + 1), "claims are numbered 1 to 4");
const other = sit(Object.assign({}, CFG, { seed: 12 })), margin = x => x.claims.find(c => c.id === "margin").text, pc = x => x.claims.find(c => c.id === "profitCash").text;
ok(other.claims.map(c => c.id).join() === a.claims.map(c => c.id).join() && (margin(other) !== margin(a) || pc(other) !== pc(a)), "a different config seed keeps the claims and may change the variant wording");

// 2. Every study claim can be refuted by a card, and is not refuted by every card
const bad = [];
for (const bot of [Bot.careful, Bot.reckless, Bot.overtrader]) {
  const s = season(bot), books = B.close(s), r = C.build({ statements: books, clues: [], flags: {}, trust: {}, seed: 1, facts: { ratePct: 3.5, market: 8, bill: S.weekBills(s), invoices: [{ who: "Hobb", due: 15 }] }, study: CFG });
  for (const c of r.claims) { const pool = r.cards.concat(c.reveal ? [c.reveal] : []), right = pool.filter(k => c.right(k)); if (!right.length) bad.push(bot.name + "/" + c.id + " unreachable"); if (right.length === pool.length) bad.push(bot.name + "/" + c.id + " everything refutes"); if (/undefined|NaN|\[object|\$\{/.test(c.text + c.maud + c.crane)) bad.push(bot.name + "/" + c.id + " bad text"); }
}
ok(bad.length === 0, "3 bot seasons: each study claim has a right card, a wrong card and clean text" + (bad.length ? " :: " + bad.join(" | ") : ""));
const tw = a.claims.find(c => c.id === "termsVsWages");
ok(tw.reveal.src.includes("14 days") && tw.right(tw.reveal) && !tw.right(a.cards.find(k => k.id === "is:gm")), "termsVsWages: the 14-day terms card refutes it, the gross margin card does not");

// 3. Failure cases: a wrong config fails with a clear error
const err = (cfg, re, msg, o) => { let e = ""; try { sit(cfg, o); } catch (x) { e = x.message; } ok(re.test(e), msg + (e ? ": " + e : ": no error")); };
err(Object.assign({}, CFG, { claims: ["ownsNothing", "nope", "margin", "profitCash"] }), /unknown claim 'nope'/, "an unknown claim id fails");
err(Object.assign({}, CFG, { claims: [] , of: 0 }), /names no claims/, "an empty list fails");
err(Object.assign({}, CFG, { of: 6 }), /lists 4 claims but 'of' is 6/, "a count that does not match 'of' fails");
err(Object.assign({}, CFG, { pass: 5 }), /pass 5 is more than 4/, "a pass mark above the count fails");
err(Object.assign({}, CFG, { claims: ["margin", "margin", "ownsNothing", "profitCash"] }), /named twice/, "a repeated claim fails");
{ const empty = { is: { revenue: 0, cogs: 0, gross: 0, opex: 0, operating: 0, interest: 0, net: 0 }, end: { cash: 0, ar: 0, inv: 0, equipNet: 0, assets: 0, ap: 0, loan: 0, crown: 0, deposits: 0, liab: 0, equity: 0 }, cf: { net: 0, dAR: 0, dInv: 0, dAP: 0, cfo: 0, capex: 0, cff: 0, change: 0, cashStart: 0, cashEnd: 0 } };
  let e = ""; try { C.build({ statements: empty, clues: [], flags: {}, trust: {}, seed: 1, facts, study: CFG }); } catch (x) { e = x.message; }
  ok(/claim 'ownsNothing' does not apply/.test(e), "a claim that does not apply to the books fails: " + e); }

// 4. The full game's Court is unchanged: nine claims, pass 6, no study-only claim, a retake differs
const full = x => C.build({ statements: st, clues: [], flags: {}, trust: {}, seed: 1, attempt: x, facts });
ok(C.PASS === 6 && C.TOTAL === 9 && full(0).claims.length === 9 && full(0).pass === 6 && full(0).of === 9, "the full Court still has nine claims and pass 6");
const ids = [0, 1, 2, 3, 4, 5].map(n => full(n).claims.map(c => c.id).join());
ok(!ids.some(i => i.includes("termsVsWages")), "the study-only claim never appears in the full game, even as a spare");
ok(full(0).claims.map(c => c.text).join() !== full(1).claims.map(c => c.text).join(), "a full-game retake (new attempt) still draws a different sitting");
ok(full(0).claims.map(c => c.id).join() === C.build({ statements: st, clues: [], flags: {}, trust: {}, seed: 1, attempt: 0, facts, study: undefined }).claims.map(c => c.id).join(), "study: undefined behaves as the full game");

console.log(fail ? "\n" + fail + " FAILED" : "\nall passed");
process.exit(fail ? 1 : 0);
