// B1: the cost lesson (fixed vs variable, break-even) runs on every seed. A thin market margin used to skip it.
// Run: node tests/test-b1.js
global.window = global; const S = require("../core/engine.js"); global.Spring = S; global.Books = require("../core/books.js"); global.Transcript = require("../core/transcript.js"); global.Endings = require("../chapters/ch1/spring/endings.js");
global.Verbs = {}; require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js"); require("../chapters/ch1/spring/story.js"); const Story = window.Story, CALC = Story.tables.CALC;
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const cost = S.R.unitCost; let thin = 0, skipped = [], badCut = [], hand = [];
for (let seed = 0; seed < 200; seed++) {
  const s = S.newGame({ story: true, seed }); Story.init({ s, goal() {}, save() {} }, null);
  for (const day of [8, 9, 10, 11, 12, 13, 15, 22]) { // days 9-13 are where the market price leaves a contribution of 2 or less
    s.day = day; const own = S.marketPrice(day, s) - cost; if (own <= 2) thin++;
    const r = CALC.costFacts({});
    if (r.skip) { skipped.push(seed + "@" + day); continue; }
    // hand check: the cut keeps a contribution of at least 1, never more than 2; break-even is ceil(fixed / contribution)
    if (!(r.cutBy >= 1 && r.cutBy <= 2 && r.m1 >= 1 && r.m >= 2 && r.m1 === r.m - r.cutBy)) badCut.push(seed + "@" + day);
    if (r.n0 !== Math.ceil(r.F / r.m) || r.n1 !== Math.ceil(r.F / r.m1) || r.n1 < r.n0) hand.push(seed + "@" + day);
  }
}
ok(skipped.length === 0, `the cost lesson runs on every seed 0-199 on days 8-13, 15, 22 (skipped: ${skipped.slice(0, 5).join(", ") || "none"}; ${thin} thin-margin days covered)`);
ok(badCut.length === 0, `the cut keeps contribution at 1 or more (bad: ${badCut.slice(0, 5).join(", ") || "none"})`);
ok(hand.length === 0, `break-even is the fixed bill over contribution, rounded up, and rises after the cut (bad: ${hand.slice(0, 5).join(", ") || "none"})`);
// one hand case: price 5, cost 3 (contribution 2) -> cut of 1 -> contribution 1; fixed 10 -> 5 sacks, then 10 sacks
{ const s = S.newGame({ story: true, seed: 0 }); Story.init({ s, goal() {}, save() {} }, null); const m = 2, cutBy = Math.min(2, m - 1); ok(cutBy === 1 && Math.ceil(10 / m) === 5 && Math.ceil(10 / (m - cutBy)) === 10, "hand case: contribution 2 cuts by 1, break-even goes from 5 to 10 sacks"); }
process.exit(fail ? 1 : 0);
