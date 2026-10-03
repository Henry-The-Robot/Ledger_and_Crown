// A sprinkler pays: it saves wages while placed and gives seed a day's head start. Run: node tests/test-sprinkler-value.js
const S = require("../engine.js"), B = require("../books.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const s = S.newGame(); s.bal.cash = 400; const w0 = S.weekBills(s);
S.buySprinkler(s); ok(S.weekBills(s) === w0, "a sprinkler in the bag saves nothing");
const p = s.plots.find(p => p.tilled && !p.crop); S.act(s, p.i);
ok(S.weekBills(s) === w0 - S.R.sprinklerSaving, `placed, it saves ${S.R.sprinklerSaving} a week in the bill and the forecast`);
ok(S.forecast(s, 8).find(r => r.day === 7).wages === S.weekBills(s), "forecast week-end bill (wages + interest) matches weekBills");
const near = s.plots.find(q => q !== p && q.tilled && !q.crop && Math.abs(q.x - p.x) <= 1 && Math.abs(q.y - p.y) <= 1), far = s.plots.find(q => q.tilled && !q.crop && Math.abs(q.x - p.x) > 1);
s.seeds = 2; S.act(s, near.i); S.act(s, far.i);
ok(near.crop.age === S.R.sprinklerHead && far.crop.age === 0, "seed beside the sprinkler starts a day ahead; seed elsewhere doesn't");
const t = S.newGame(); t.bal.cash = 400; S.buySprinkler(t); S.act(t, t.plots.find(p => p.tilled && !p.crop).i); for (let i = 0; i < 7; i++) S.sleep(t);
ok(t.bal.upkeep === S.R.upkeep - S.R.sprinklerSaving && t.bal.depreciation === 5, "week 1 books: wages down by the saving, Depreciation 5");
const f = S.sprinklerFacts(S.newGame()), g = S.newGame(); g.day = 22; const l = S.sprinklerFacts(g);
ok(f.weeks === 4 && f.profit === 4 * 20 - 4 * 5 && f.cash === 4 * 20 - 80, "day 1: 4 pay-days, profit +60, Cash back to even by season end");
ok(l.weeks === 1 && l.profit > 0 && l.cash < 0, "day 22: still adds profit, but Cash is short: profit and Cash disagree");
for (const k of ["careful", "sprinkler"]) { const Bot = require("../bot.js"), q = S.newGame(); let n = 0; while (!q.over && n++ < 40) { Bot[k].day(q); S.sleep(q); } const st = B.close(q); ok(st.balanced && st.cf.reconciles, `${k}: ${q.outcome}, balanced and reconciled`); }
process.exit(fail ? 1 : 0);
