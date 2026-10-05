// P5: the seeded market model. Seed 0 is the canonical price list; other seeds drift, stay sane, and the bots still sort as designed.
const S = require("../core/engine.js"), Bot = require("../core/bot.js"); let fail = 0;
const ok = (c, m) => { console.log(m + ": " + !!c); if (!c) fail++; };
const R = S.R, M = R.marketModel;

// seed 0 = today's list, day by day
ok(R.market.every((p, i) => S.marketPrice(i + 1) === p && S.marketPrice(i + 1, { seed: 0 }) === p), "seed 0 equals the canonical price list");

// same seed, same path; a different seed, a different path (hand check: 20 seeds give at least 15 distinct paths)
const path = seed => R.market.map((_, i) => S.marketPrice(i + 1, { seed }));
ok(JSON.stringify(path(7)) === JSON.stringify(path(7)), "same seed gives the same path");
const distinct = new Set(Array.from({ length: 20 }, (_, i) => JSON.stringify(path(i + 1))));
ok(distinct.size >= 15, `20 seeds give ${distinct.size} distinct paths`);

// sane: every price inside the model's floor and ceiling, never above the cost of a sack sold at a loss
let sane = true, far = 0;
for (let seed = 1; seed <= 20; seed++) path(seed).forEach((p, i) => { if (p < M.floor || p > M.ceil || p <= R.unitCost) sane = false; far = Math.max(far, Math.abs(p - R.market[i])); });
ok(sane, "every seeded price is within floor/ceiling and above unit cost");
ok(far > 0 && far <= M.ceil - M.floor, "seeded paths do move away from the canonical one (max gap " + far + ")");

// bots over 20 seeds: careful survives, overtrader loses
// the seed also moves the night events (WS6); here they are pinned to the canonical calendar so only the PRICE path varies
const run = (k, seed) => { const g = S.newGame({ seed }); g.events = Object.assign({}, R.events); let n = 0; while (!g.over && n++ < 40) { Bot[k].day(g); S.sleep(g); } return g.outcome === "insolvent" ? "insolvent" : S.crownFund(g).verdict; };
// Bar (card P5): careful survives every seed, overtrader loses every seed, and the price path never changes who wins (checked against a flat market, spread 0).
const lose = v => v === "insolvent" || v === "short";
let carefulOk = 0, overLoses = 0, same = 0;
const withVerdicts = () => Array.from({ length: 20 }, (_, i) => run("overtrader", i + 1));
const moving = withVerdicts(); for (let seed = 1; seed <= 20; seed++) { if (!lose(run("careful", seed))) carefulOk++; }
// a second copy of the engine and bots (the price paths are cached per seed) with the shocks switched off
["../core/engine.js", "../core/bot.js"].forEach(f => delete require.cache[require.resolve(f)]);
const S2 = require("../core/engine.js"), Bot2 = require("../core/bot.js"); S2.R.marketModel.spread = 0;
const flat = Array.from({ length: 20 }, (_, i) => { const g = S2.newGame({ seed: i + 1 }); g.events = Object.assign({}, S2.R.events); let n = 0; while (!g.over && n++ < 40) { Bot2.overtrader.day(g); S2.sleep(g); } return g.outcome === "insolvent" ? "insolvent" : S2.crownFund(g).verdict; });
ok(JSON.stringify(Array.from({ length: 28 }, (_, d) => S2.marketPrice(d + 1, { seed: 3 }))) === JSON.stringify(R.market), "with spread 0 the control path is the canonical list");
if (process.env.DIAG) console.log("moving", moving.join(" "), "\nflat  ", flat.join(" "));
moving.forEach((v, i) => { if (lose(v)) overLoses++; if (lose(v) === lose(flat[i])) same++; });
ok(carefulOk === 20, `careful survives ${carefulOk}/20 seeds`);
ok(overLoses === 20,`overtrader loses ${overLoses}/20 seeds`);
ok(same === 20, `the price path never flips the overtrader's result (${same}/20 match a flat market)`);
process.exit(fail ? 1 : 0);
