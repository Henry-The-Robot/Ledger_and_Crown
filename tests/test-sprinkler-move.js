// Sprinklers can be picked up and re-placed for free. Run: node tests/test-sprinkler-move.js
const S = require("../core/engine.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const s = S.newGame(); s.bal.cash = 500; // enough to buy one
const cash0 = s.bal.cash, equip0 = s.bal.equip;
S.buySprinkler(s);
const [a, b] = s.plots.filter(p => p.tilled && !p.crop);
const cashAfterBuy = s.bal.cash;
ok(S.act(s, a.i).msg === "sprinkler" && a.sprinkler && s.sprinklersHeld === 0, "places on an empty tilled plot");
const r = S.act(s, a.i);
ok(r.ok && r.msg === "pickup" && !a.sprinkler && s.sprinklersHeld === 1, "acting on it picks it back up");
ok(S.act(s, b.i).msg === "sprinkler" && b.sprinkler && !a.sprinkler, "can place it on a different plot");
ok(s.bal.cash === cashAfterBuy && s.bal.equip === equip0 + S.R.sprinklerCost, "moving is free: no Cash or Equipment change");
process.exit(fail ? 1 : 0);
