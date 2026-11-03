// Kyle 11-03: buying seed for Cash now gets Tomas's 2% ("2/7, net 14"), so on account is no longer always the better deal.
// Cash 9 packets = 106; on account = a 108 bill (106 if paid within 7 days); the first-seed lesson (opt.list) still pays 108 in Cash.
const S = require("../core/engine.js"), B = require("../core/books.js");
let fails = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fails++; };

{ const s = S.newGame(), c0 = s.bal.cash, i0 = s.bal.inv; S.buySeeds(s, 9, false);
  ok(c0 - s.bal.cash === 106, `9 packets for Cash cost 106 (paid ${c0 - s.bal.cash})`);
  ok(s.bal.inv - i0 === 108, "Inventory still rises by the standard 108");
  ok(S.seedCash(9) === 106 && S.seedCash(3) === 35, "seedCash: 9 -> 106, 3 -> 35"); }
{ const s = S.newGame(), c0 = s.bal.cash; S.buySeeds(s, 9, true);
  ok(s.bal.cash === c0 && s.bills[0].amount === 108 && s.bills[0].disc === 2, "on account: no Cash today, a 108 bill with 2 off inside 7 days"); }
{ const s = S.newGame(), c0 = s.bal.cash; S.buySeeds(s, 3, false, { list: true });
  ok(c0 - s.bal.cash === 36, "the first-seed lesson pays the list price: Cash down 36"); }
{ const s = S.newGame(), sum = () => Object.values(s.bal).reduce((a, b) => a + b, 0), before = sum(); S.buySeeds(s, 9, false);
  ok(Math.abs(sum() - before) < 1e-9, "debits equal credits after a discounted purchase (the ledger sums to the same total)"); }
{ const s = S.newGame(); s.bal.cash = 106; ok(S.buySeeds(s, 9, false).ok, "106 in Cash is enough for 9 packets");
  const t = S.newGame(); t.bal.cash = 105; ok(!S.buySeeds(t, 9, false).ok, "105 is not (failure case)"); }
process.exit(fails ? 1 : 0);
