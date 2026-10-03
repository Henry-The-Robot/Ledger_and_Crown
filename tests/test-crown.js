// "If Midwinter were tomorrow": the Crown fund and its four verdicts. Run: node tests/test-crown.js
const S = require("../engine.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const C = S.R.crownDebt, give = (s, n) => { s.bal.cash += n; s.bal.capital -= n; };
const s = S.newGame(), f0 = S.crownFund(s);
ok(f0.net === 200 + 96 - 100 && f0.gap === f0.net - C && f0.verdict === "short", "day 1: Cash 200 + Inventory 96 - loan 100 = 196, far short of the Crown");
const t = S.newGame(); give(t, C); ok(S.crownFund(t).verdict === "paid", "enough on hand: the farm is yours");
const b = S.newGame(); give(b, C - 196 - 200); const fb = S.crownFund(b); ok(fb.verdict === "bridge" && fb.gap === -200 && fb.bridge > 0, "a gap within Ezra's bridge limit: he lends the difference (with the weekly interest shown)");
const p = S.newGame(); give(p, C - 196 - S.R.bridgeMax - 100); p.promises.push({ who: "pell", amount: 400, text: "x" });
ok(S.crownFund(p).gap === -S.R.bridgeMax - 100 && S.crownFund(p).verdict === "promise" && S.crownFund(p).hoped === 400, "short beyond the bridge, but a promise would cover it: shown apart, never counted in net");
const q = S.newGame(); give(q, 10); ok(S.crownFund(q).verdict === "short", "far short: the Crown takes the farm");
const d = S.newGame(); d.bal.cash += 100; d.bal.deposits -= 100; ok(S.crownFund(d).net === 196, "a deposit you still owe grain for isn't yours: net unchanged");
for (const k of ["careful", "reckless"]) { const Bot = require("../bot.js"), g = S.newGame(); let n = 0; while (!g.over && n++ < 40) { Bot[k].day(g); S.sleep(g); } ok(["paid", "bridge", "promise", "short"].includes(S.crownFund(g).verdict), `${k}: verdict ${S.crownFund(g).verdict}`); }
// The bots are the game's design check: careful play pays the Crown, overtrading and recklessness lose it.
const ends = {}; for (const k of ["careful", "noDuke", "sprinkler", "overtrader", "reckless"]) { const Bot = require("../bot.js"), g = S.newGame(); let n = 0; while (!g.over && n++ < 40) { Bot[k].day(g); S.sleep(g); } ends[k] = g.outcome === "insolvent" ? "insolvent" : S.crownFund(g).verdict; }
const lost = v => ["insolvent", "short", "bridge"].includes(v);
ok(ends.careful === "paid", "careful play pays the Crown: " + ends.careful);
ok(lost(ends.overtrader), "overtrading loses (insolvent, short or only bridged): " + ends.overtrader);
ok(lost(ends.reckless), "recklessness loses: " + ends.reckless);
ok(new Set(Object.values(ends)).size >= 2, "the endings differ across play styles: " + JSON.stringify(ends));
process.exit(fail ? 1 : 0);
