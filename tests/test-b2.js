// B2: two teaching literals now come from game state: the margin ratio ({r6}) and the factoring rate ({factorPct}); the coverage scope_ref values name their repo.
// Hand calculations: unit cost 4 -> (6 - 4) / 6 = 0.33; unit cost 3 -> 3 / 6 = 0.50; factor rate 0.85 -> 85; 0.9 -> 90.
// Run: node tests/test-b2.js
global.window = global; const S = require("../core/engine.js"); global.Spring = S; global.Books = require("../core/books.js"); global.Transcript = require("../core/transcript.js"); global.Endings = require("../chapters/ch1/spring/endings.js");
global.Verbs = {}; require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js"); require("../chapters/ch1/spring/story.js"); const Story = window.Story, CALC = Story.tables.CALC, fs = require("fs"), path = require("path");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const mk = () => { const s = S.newGame({ story: true }); Story.init({ s, goal() {}, save() {} }, null); return s; };
const lessons = fs.readFileSync(path.join(__dirname, "../chapters/ch1/spring/lessons.js"), "utf8");
ok(!/= 0\.33, so/.test(lessons) && lessons.includes("{m6} ÷ 6 = {r6}, so"), "the margin lesson reads {r6}, not the literal 0.33");
ok(!/for 85%/.test(lessons) && lessons.includes("for {factorPct}% (factoring)"), "the factoring line reads {factorPct}, not the literal 85%");
{ mk(); const R = S.R, unit = R.unitCost, rate = R.factorRate;
  ok(CALC.ch3Setup().r6 === "0.33", "unit cost 4: r6 = 2 / 6 = 0.33");
  R.unitCost = 3; ok(CALC.ch3Setup().r6 === "0.50", "unit cost 3: r6 = 3 / 6 = 0.50 (the text follows the numbers)"); R.unitCost = unit;
  S.addOffer(mk(), "duke", 7, 6, 5, 4, 4);
  ok(CALC.dukeSetup().factorPct === 85, "factor rate 0.85: factorPct = 85");
  R.factorRate = 0.9; ok(CALC.dukeSetup().factorPct === 90, "factor rate 0.9: factorPct = 90"); R.factorRate = rate; }
const cov = JSON.parse(fs.readFileSync(path.join(__dirname, "../docs/curriculum-coverage.json"), "utf8")); let n = 0, bad = 0;
(function walk(o) { if (o && typeof o === "object") for (const k in o) { if (k === "scope_ref") { n++; if (!/^Agent-System: /.test(o[k])) bad++; } else walk(o[k]); } })(cov);
ok(n > 0 && bad === 0, `all ${n} scope_ref values start with "Agent-System: "`);
process.exit(fail ? 1 : 0);
