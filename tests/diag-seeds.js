const S = require("../core/engine.js"), Bot = require("../core/bot.js");
const run = (k, seed) => { const g = S.newGame({ seed }); g.events = Object.assign({}, S.R.events); let n = 0; while (!g.over && n++ < 40) { Bot[k].day(g); S.sleep(g); } return g.outcome === "insolvent" ? "insolvent" : S.crownFund(g).verdict; };
const M = S.R.marketModel;
for (const sp of [1.2, 0.8, 0.5]) { M.spread = sp; for (const k of ["careful", "overtrader"]) { const out = []; for (let s = 1; s <= 20; s++) out.push(run(k, s)); console.log(sp, k, out.join(" ")); } }
