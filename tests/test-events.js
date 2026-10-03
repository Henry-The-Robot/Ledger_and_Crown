// Overnight events: pigs, rats, a warm day, a frost. Each posts balanced entries and keeps the statements reconciling.
// Run: node tests/test-events.js
const S = require("../engine.js"), B = require("../books.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const upTo = (s, d) => { while (s.day < d && !s.over) S.sleep(s); };
const plant = (s, n) => { s.plots.filter(p => p.tilled && !p.crop).slice(0, n).forEach(p => p.crop = { age: 1, cost: 12 }); s.bal.inv += n * 12; s.bal.cash -= n * 12; };
{ const s = S.newGame(); s.bal.cash = 400; upTo(s, 9); plant(s, 5); const n0 = s.plots.filter(p => p.crop).length, inv0 = s.bal.inv, ni0 = S.balanceSheet(s.bal).ni;
  ok(/Pell's pigs/.test(S.coach(s).text), "Maud warns about the pigs on the day");
  S.sleep(s); const n1 = s.plots.filter(p => p.crop).length, lost = n0 - n1;
  ok(lost === Math.ceil(n0 / 4), `pigs eat a quarter of the plots (${lost} of ${n0})`);
  ok(s.bal.losses === lost * 12 && s.bal.inv === inv0 - lost * 12, "loss is written off at cost: Inventory down, Crop & stock losses up");
  ok(S.balanceSheet(s.bal).ni < ni0 && B.close(s).is.losses === lost * 12, "the loss reaches net income and the income statement"); }
{ const s = S.newGame(); s.bal.cash = 400; upTo(s, 8); const u0 = s.bal.upkeep; ok(S.buyFence(s).ok && s.bal.upkeep === u0 + 20, "a fence is an operating expense (upkeep)"); upTo(s, 9); plant(s, 5); const n0 = s.plots.filter(p => p.crop).length; S.sleep(s);
  ok(s.plots.filter(p => p.crop).length === n0 && s.bal.losses === 0, "a fenced field loses nothing"); }
{ const s = S.newGame(); upTo(s, 16); const k0 = s.sacks, l0 = s.bal.losses; S.sleep(s); ok(s.sacks === k0 - Math.floor(k0 * .2) && s.bal.losses - l0 === (k0 - s.sacks) * 4, "rats spoil a fifth of the barn, written off at cost"); }
{ const s = S.newGame(); upTo(s, 19); s.bal.cash = 500; plant(s, 3); s.plots.filter(p => p.crop).forEach(p => p.crop.age = 1); S.sleep(s); ok(s.plots.filter(p => p.crop).every(p => p.crop.age === 2 || p.crop.age === 3), "warm day gives crops an extra day of growth"); }
{ const s = S.newGame(); upTo(s, 23); plant(s, 3); s.plots.filter(p => p.crop).forEach(p => { p.crop.age = 1; p.watered = true; }); S.sleep(s); ok(s.plots.filter(p => p.crop).every(p => p.crop.age === 1), "frost stops all growth for the night"); }
for (const k of ["careful", "reckless", "overtrader", "noDuke", "sprinkler"]) { const Bot = require("../bot.js"), s = S.newGame(); let g = 0; while (!s.over && g++ < 40) { Bot[k].day(s); S.sleep(s); }
  const st = B.close(s); ok(st.balanced && st.cf.reconciles, `${k}: ${s.outcome}, statements balance and reconcile (losses ${s.bal.losses})`); }
process.exit(fail ? 1 : 0);
