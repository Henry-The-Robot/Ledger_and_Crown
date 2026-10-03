// Depreciation is per sprinkler owned: 80 cost / 16 weeks = 5 a week each. Run: node tests/test-depreciation.js
const S = require("../engine.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const s = S.newGame(); s.bal.cash = 500; S.buySprinkler(s); S.buySprinkler(s);
for (let i = 0; i < 7; i++) S.sleep(s);
ok(s.bal.depreciation === 10, "two sprinklers depreciate 10 in week 1, got " + s.bal.depreciation);
const t = S.newGame(); t.bal.cash = 500; S.buySprinkler(t);
for (let i = 0; i < 14; i++) S.sleep(t);
ok(t.bal.depreciation === 10, "one sprinkler depreciates 5 a week, got " + t.bal.depreciation);
process.exit(fail ? 1 : 0);
