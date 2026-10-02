// The going price moves, offers vary, and haggling has room. Run: node tests/test-market.js
const S = require("../engine.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
ok(new Set(S.R.market).size >= 4, "market price takes at least 4 different values over the season");
ok(S.R.market.length === S.R.days && S.R.market.every(p => p >= 6 && p <= 11), "one price per day, all 6-11 (above the 4 floor)");
const s = S.newGame(), seen = [];
while (!s.over) { s.offers.forEach(o => { if (!seen.includes(o)) seen.push(o); }); S.sleep(s); }
const non = seen.filter(o => o.who !== "duke");
ok(new Set(non.map(o => o.terms)).size >= 3, "buyers use at least 3 different payment terms");
ok(new Set(non.map(o => o.price)).size >= 4, "offers span at least 4 different prices");
ok(non.every(o => o.reserve > o.price), "every ordinary buyer will go above the first price when haggled");
ok(non.every(o => o.price >= S.R.unitCost + 1), "no first offer is at or below cost");
const a = S.newGame(), b = S.newGame(); for (let i = 0; i < 12; i++) { S.sleep(a); S.sleep(b); }
ok(JSON.stringify(a.offers) === JSON.stringify(b.offers), "offers are deterministic (nothing extra to save)");
const st = S.newGame({ story: true }); S.addOffer(st, "ashby", 6, 7, 0, 4, 4);
ok(st.offers[0].reserve == null && st.offers[0].price === 7, "scripted story offers keep their fixed numbers");
process.exit(fail ? 1 : 0);
