// "If Midwinter were tomorrow": the Crown fund. Run: node tests/test-crown.js
const S = require("../engine.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const s = S.newGame(), f0 = S.crownFund(s);
ok(f0.net === 200 + 96 - 100 && f0.gap === f0.net - 1000 && f0.verdict === "short", "day 1: Cash 200 + Inventory 96 - loan 100 = 196, far short of 1000");
const t = S.newGame(); t.bal.cash += 2000; t.bal.capital -= 2000; ok(S.crownFund(t).verdict === "paid", "enough on hand: the farm is yours");
const p = S.newGame(); p.bal.cash += 900; p.bal.capital -= 900; p.promises.push({ who: "pell", amount: 80, text: "x" });
ok(S.crownFund(p).net === 1096 && S.crownFund(p).hoped === 80 && S.crownFund(p).verdict === "paid", "promises are listed apart and never counted in net");
const q = S.newGame(); q.bal.cash += 800; q.bal.capital -= 800; q.promises.push({ who: "pell", amount: 80, text: "x" });
ok(S.crownFund(q).gap === -4 && S.crownFund(q).verdict === "promise", "short by less than the promise: only the promise saves you");
const d = S.newGame(); d.bal.cash += 100; d.bal.deposits -= 100; ok(S.crownFund(d).net === 196, "a deposit you still owe grain for isn't yours: net unchanged");
for (const k of ["careful", "reckless"]) { const Bot = require("../bot.js"), g = S.newGame(); let n = 0; while (!g.over && n++ < 40) { Bot[k].day(g); S.sleep(g); } ok(["paid", "promise", "short"].includes(S.crownFund(g).verdict), `${k}: verdict ${S.crownFund(g).verdict}`); }
process.exit(fail ? 1 : 0);
