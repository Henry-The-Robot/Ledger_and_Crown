// Early repayment: interest saved vs the early-repayment fee vs Cash left. Run: node tests/test-loans.js
const S = require("../core/engine.js"), B = require("../core/books.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const s = S.newGame(); s.bal.cash = 300; const rate = S.terms(s).rateBp, wk = Math.round(100 * rate / 10000);
const f = S.loanFacts(s, 100);
ok(f.weekly === wk && f.paydays === 4 && f.fee === wk && f.saved === 4 * wk && f.net === 3 * wk, `day 1: ${f.paydays} pay-days, fee ${f.fee}, net ${f.net}`);
const c0 = s.bal.cash; ok(S.repay(s, 100).ok && s.bal.loan === 0 && s.bal.cash === c0 - 100 - wk && s.bal.interest === wk, "early repayment pays the principal plus one week's interest as a fee");
const t = S.newGame(); t.bal.cash = 300; while (t.day < 22) S.sleep(t); const ti = t.bal.interest, tc = t.bal.cash, g = S.loanFacts(t, 100);
ok(g.fee === 0 && g.paydays === 1, "after day 21 there is no fee, and one pay-day left"); S.repay(t, 100); ok(t.bal.interest === ti && t.bal.cash === tc - 100, "late repayment is free");
const p = S.newGame(); p.bal.cash = 101; ok(!S.repay(p, 100).ok && p.bal.loan === -100, "can't repay early without the fee in Cash, and nothing posts");
const u = S.newGame(); S.borrow(u, 50); S.repay(u, 100); const st = B.close(u); ok(st.balanced && st.cf.reconciles && st.is.interest === wk, "statements balance, reconcile, and show the fee as interest expense");
const l = S.newGame(); l.bal.cash = 60; const lf = S.loanFacts(l, 50); ok(lf.low === Math.min(...S.forecast(l, 14, 50 + lf.fee).map(r => r.close)), "low-point warning comes from the cash forecast");
process.exit(fail ? 1 : 0);
