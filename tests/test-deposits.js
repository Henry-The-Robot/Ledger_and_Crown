// Customer deposits: Cash now, a liability until the grain ships. Run: node tests/test-deposits.js
const S = require("../engine.js"), B = require("../books.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const upTo = (s, d) => { while (s.day < d && !s.over) S.sleep(s); };
const open = (s, who) => s.offers.find(o => o.who === who && o.deposit);
{ const s = S.newGame(); upTo(s, 11); const o = open(s, "ashby"); ok(o && o.deposit === 0.5 && o.sacks === 27, "day 11: Ashby's wedding order offers with a 50% deposit");
  const c0 = s.bal.cash, rev0 = s.bal.revenue; S.accept(s, o.id);
  ok(o.paid === Math.round(27 * 9 * .5) && s.bal.cash === c0 + o.paid && s.bal.deposits === -o.paid && s.bal.revenue === rev0, "accepting: Cash up, liability up, Revenue unchanged");
  const b = S.balanceSheet(s.bal); ok(b.deposits === o.paid && b.currentLiab >= o.paid, "balance sheet shows the deposit as a current liability");
  const st = B.close(s); ok(st.balanced && st.cf.reconciles && st.cf.dDep === o.paid, "books balance; cash flow shows the deposit in operations and reconciles");
  s.sacks = 40; const c1 = s.bal.cash; S.deliver(s, o.id);
  ok(s.bal.deposits === 0 && s.bal.cash === c1 + (243 - o.paid) && s.bal.revenue === -243, "delivering: the rest in Cash, deposit cleared, full 243 recognised as Revenue");
  const st2 = B.close(s); ok(st2.balanced && st2.cf.reconciles, "balanced and reconciled after delivery"); }
{ const s = S.newGame(); S.borrow(s, 150); upTo(s, 11); const o = open(s, "ashby"); S.accept(s, o.id); const paid = o.paid; const c0 = s.bal.cash; s.sacks = 0;
  while (o.status === "open" && !s.over) S.sleep(s);
  ok(o.status === "cancelled" && s.bal.deposits === 0 && s.bal.fines === Math.round(243 * S.R.breachPct), "undelivered: deposit refunded (liability cleared) and the forfeit paid");
  const st = B.close(s); ok(st.balanced && st.cf.reconciles, "balanced and reconciled after a refund"); }
{ const s = S.newGame(); upTo(s, 18); ok(open(s, "hobb") && open(s, "hobb").deposit === 0.3, "day 18: Hobb's deposit order appears"); }
{ const s = S.newGame({ story: true }); s.quiet = true; upTo(s, 12); ok(!open(s, "ashby"), "no deposit offers while the story's quiet stretch runs"); }
for (const k of ["careful", "reckless", "overtrader", "noDuke", "sprinkler"]) { const Bot = require("../bot.js"), s = S.newGame(); let g = 0; while (!s.over && g++ < 40) { Bot[k].day(s); S.sleep(s); } const st = B.close(s); ok(st.balanced && st.cf.reconciles, `${k}: ${s.outcome}, balanced and reconciled`); }
process.exit(fail ? 1 : 0);
