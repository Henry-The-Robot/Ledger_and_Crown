// S2: what Summer needs, built into Spring: the cash conversion cycle (C2.09), who is paid first (liquidation waterfall) and the naming passes. Hand calculations only.
// Run: node tests/test-s2.js
global.window = global; const S = require("../core/engine.js"); global.Spring = S; global.Books = require("../core/books.js"); global.Transcript = require("../core/transcript.js"); global.Endings = require("../chapters/ch1/spring/endings.js");
global.Verbs = {}; require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js"); require("../chapters/ch1/spring/story.js"); const Story = window.Story, L = window.Lessons, CALC = Story.tables.CALC, fs = require("fs");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const mk = () => { const s = S.newGame({ story: true }); Story.init({ s, goal() {}, save() {} }, null); return s; };
// the cash conversion cycle: revenue 700 and cost of goods 400 over 14 days; receivables 150, inventory 120, payables 90
{ const s = mk(); s.day = 14; s.bal.revenue = -700; s.bal.cogs = 400; s.bal.ar = 150; s.bal.inv = 120; s.bal.ap = -90;
  const r = CALC.cycleFacts({});
  // by hand: 150 / 700 x 14 = 3.0 days; 120 / 400 x 14 = 4.2 days (4); 90 / 400 x 14 = 3.15 days (3); 3 + 4 - 3 = 4
  ok(r.revenue === 700 && r.cogs === 400 && r.dso === 3 && r.dio === 4 && r.dpo === 3 && r.ccc === 4, `cycle: receivable days 3, inventory days 4, payable days 3, cycle 4 (got ${r.dso}, ${r.dio}, ${r.dpo}, ${r.ccc}; Revenue ${r.revenue}, cost ${r.cogs}, ar ${r.ar}, inv ${r.inv}, ap ${r.ap})`);
  s.day = 28; const r2 = CALC.cycleFacts({}); ok(r2.dso === 6 && r2.dio === 8 && r2.dpo === 6 && r2.ccc === 8, "same books at day 28 (twice the days, so twice the cycle): 6, 8, 6, 8 — by hand 150/700x28 = 6.0, 120/400x28 = 8.4, 90/400x28 = 6.3");
  const none = mk(); ok(CALC.cycleFacts({}).skip === true && none.day === 1, "a game with no sales yet skips the lesson (no division by zero)"); }
// who is paid first: Crane's offer against the debts
{ const s = mk(), o = Endings.offer(s), debts = S.balanceSheet(s.bal).liab, v = CALC.waterfallFacts({});
  ok(v.price === o.price && v.debts === debts && v.left === Math.max(0, o.price - debts) && v.short === Math.max(0, debts - o.price), `waterfall: sale ${v.price} against debts ${v.debts}: left ${v.left}, still owed ${v.short}`);
  ok(debts >= 1250, "day 1 debts include the Crown's writ (1,250 of the " + debts + ")");
  const real = Endings.offer; Endings.offer = () => ({ price: 2000 }); const v2 = CALC.waterfallFacts({}); Endings.offer = real; // by hand: 2,000 - 1,350 = 650 left, nothing owed
  ok(v2.debts === 1350 && v2.left === 650 && v2.short === 0, `a sale at 2,000 covers the 1,350 of debts: ${v2.left} left for the owner, ${v2.short} still owed`);
  const rot = [0, 1, 2].map(k => { const pick = (k + 1) % 3; return CALC.waterfallRight({ c: pick, k }).right && !CALC.waterfallRight({ c: (pick + 1) % 3, k }).right && !CALC.waterfallRight({ c: (pick + 2) % 3, k }).right; });
  ok(rot.every(Boolean), "for each of the three rotations exactly one button is right (the second, third, then first)"); }
// the lesson records: every button list holds the right answer exactly where the formula says
{ const w = L.BY.waterfall, pick = w.steps.find(x => x.pick), at = pick.cases.map(c => c[0].buttons.indexOf("The debts, then the owner")); ok(at.join() === "1,2,0", "the 'debts, then the owner' button is at index 1, 2, 0 in the three rotations (the formula's (k+1) % 3): " + at); }
// the hooks and the naming passes
{ const story = fs.readFileSync(__dirname + "/../chapters/ch1/spring/story.js", "utf8"), scenes = fs.readFileSync(__dirname + "/../chapters/ch1/spring/scenes.js", "utf8");
  ok(/!st\.cycle && !revealed\) await play\("cycle"\)/.test(story) && /st\.book && !st\.waterfall\) await play\("waterfall"\)/.test(story), "story.js plays the cycle in week 3 after the present-value lesson, and the waterfall in week 4 after the cash book, each once");
  const ch3 = L.BY.ch3.steps.map(x => x.tell || "").join(" "); ok(/walk-away point: your best alternative, less what it costs to take it/.test(ch3), "ch3 names the walk-away point as best alternative less its cost (C16.12)");
  ok(/sunk/.test(story) && /is it legal, is it ethical, is it smart/.test(scenes), "the sunk-cost line (C7.07) and the legal / ethical / smart line (C12.02) are in");
  ok(!/anchoring/i.test(story + scenes + JSON.stringify(L.RECORDS)), "anchoring is NOT named: C7.07 says it is not in its text (TODO for the Lead, see the HANDOVER)"); }
process.exit(fail ? 1 : 0);
