// Spring at Thornfield — closing the books. Pure JS, no DOM. Produces the three statements from the season's
// journal, Maud's one-line highlight, and Ezra's loan review (questions on the player's own statement lines).
// Formats follow curriculum C1.01 (A = L + E), C1.02 (accrual vs cash), C1.08 (indirect cash-flow statement:
// "an increase in an asset subtracts from cash flow; an increase in a liability adds to it"), C1.09 (current
// ratio, gross margin) and C2.09 (the profit/cash gap: investigate receivables and working-capital build first).
(function (root) {
  const S = root.Spring || (typeof require !== "undefined" ? require("./engine.js") : null);
  const sumType = (s, type, acct) => s.journal.filter(j => j.type === type).reduce((a, j) => a + (j.lines[acct] || 0), 0);

  function close(s) {
    const b = s.bal, o = s.opening;
    const revenue = -b.revenue, cogs = b.cogs, gross = revenue - cogs, upkeep = b.upkeep, dep = b.depreciation;
    const fines = b.fines, opex = upkeep + dep + fines, operating = gross - opex, interest = b.interest, factoring = b.factoring, net = operating - interest - factoring;
    const is = { revenue, cogs, gross, upkeep, dep, fines, opex, operating, interest, factoring, net };
    const start = S.balanceSheet(o), end = S.balanceSheet(b);
    const dAR = end.ar - start.ar, dInv = end.inv - start.inv, dAP = end.ap - start.ap;
    const cfo = net + dep - dAR - dInv + dAP;
    const capex = sumType(s, "equip", "cash"); // negative
    const borrowed = sumType(s, "borrow", "cash"), repaid = sumType(s, "repay", "cash");
    const cfi = capex, cff = borrowed + repaid, change = cfo + cfi + cff;
    // direct check: every cash line outside investing/financing is operating cash flow
    const cfoDirect = s.journal.filter(j => ["open", "equip", "borrow", "repay"].indexOf(j.type) < 0).reduce((a, j) => a + (j.lines.cash || 0), 0);
    const cf = { net, dep, dAR, dInv, dAP, cfo, cfoDirect, capex, cfi, borrowed, repaid, cff, change, cashStart: start.cash, cashEnd: end.cash,
      reconciles: change === end.cash - start.cash && cfo === cfoDirect };
    return { is, start, end, cf, day: s.day, outcome: s.outcome, balanced: start.assets === start.liab + start.equity && end.assets === end.liab + end.equity };
  }

  // Maud names the single line that explains this player's season (C2.09: receivables and working capital first).
  // Line ids are "<table>:<line>": is (income statement), bs0 / bs1 (balance sheet start / end), cf (cash flow).
  function highlight(st, s) {
    const { is, cf } = st, dCash = cf.change;
    if (s && s.outcome === "insolvent") return { lines: ["bs1:cash", "cf:change"], text: `Net income ${is.net}, but Cash was ${cf.cashEnd} when the bills came. Profit doesn't pay wages; Cash does.` };
    if (is.net < 0) return { lines: ["is:opex", "is:net"], text: `Net loss ${-is.net}: Operating expenses and interest of ${is.opex + is.interest} ate a Gross profit of ${is.gross}.` };
    const drains = [["ar", cf.dAR, "went into Accounts receivable", ["bs1:ar", "cf:ar"]], ["inv", cf.dInv, "went into Inventory", ["bs1:inv", "cf:inv"]], ["ap", -cf.dAP, "went to paying down Accounts payable", ["bs1:ap", "cf:ap"]],
      ["capex", -cf.capex, "went into the sprinkler (Equipment)", ["bs1:equip", "cf:capex"]], ["cff", -cf.cff, "went to repaying the loan", ["bs1:loan", "cf:cff"]]];
    const top = drains.sort((a, b) => b[1] - a[1])[0];
    if (dCash < is.net && top[1] > 0) return { lines: top[3], text: `Net income ${is.net}, Cash ${dCash >= 0 ? "up only " + dCash : "down " + -dCash}: ${top[1]} of the gap ${top[2]}.` };
    return { lines: ["cf:cfo"], text: `Net income ${is.net} and Cash up ${dCash}: operations paid their own way.` };
  }

  // Ezra's review: 2-3 questions on the player's own lines. Right answers lower next season's rate and raise the limit.
  function review(st) {
    const { is, end, cf } = st, qs = [];
    const f1 = x => (Math.round(x * 10) / 10).toFixed(1), pct = x => Math.round(x * 100) + "%";
    if (end.currentLiab > 0) {
      const r = end.currentAssets / end.currentLiab;
      qs.push({ id: "ratios", also: ["pct"], lines: ["bs1:cash", "bs1:ar", "bs1:inv", "bs1:ap", "bs1:loan"],
        q: `Current assets ${end.currentAssets}; current liabilities ${end.currentLiab} (Accounts payable ${end.ap} + Loan payable ${end.loan} + Crown debt ${end.crown}).`,
        ask: "What's your current ratio (current assets ÷ current liabilities)?", options: three([f1(r), 1 / r >= .1 ? f1(1 / r) : f1(r / 2), String(end.currentAssets - end.currentLiab), f1(r + 1)]), answer: f1(r) });
    } else qs.push({ id: "wc", also: ["pct"], lines: ["bs1:cash", "bs1:ar", "bs1:inv"], q: `No debts at all. Current assets ${end.currentAssets}.`, ask: "So what's your working capital?",
      options: three([String(end.currentAssets), String(end.cash), "0", String(end.ar)]), answer: String(end.currentAssets) });
    const moves = [["Accounts receivable rose " + cf.dAR, cf.dAR, "ar"], ["Inventory rose " + cf.dInv, cf.dInv, "inv"], ["Accounts payable fell " + -cf.dAP, -cf.dAP, "ap"],
      ["the sprinkler cost " + -cf.capex, -cf.capex, "capex"], ["net loan repayments of " + -cf.cff, -cf.cff, "cff"]].filter(m => m[1] > 0).sort((a, b) => b[1] - a[1]);
    if (cf.change < is.net && moves.length) {
      const opts = moves.slice(0, 3).map(m => m[0]); if (opts.length < 3) opts.push("Net income was overstated");
      if (opts.length < 3) opts.push("Revenue fell");
      qs.push({ id: "cfs", also: ["accrual", moves[0][2] === "ar" ? "ar" : moves[0][2] === "inv" ? "inventory" : "wc"], lines: ["is:net", "cf:net", "cf:change", "cf:" + moves[0][2]],
        q: `Net income ${is.net}, yet Cash moved only ${cf.change}.`, ask: "Where did most of the difference go?", options: opts, answer: moves[0][0] });
    } else {
      const src = [["borrowing " + cf.borrowed, cf.borrowed], ["Accounts payable rose " + cf.dAP, cf.dAP], ["Inventory fell " + -cf.dInv, -cf.dInv], ["Accounts receivable fell " + -cf.dAR, -cf.dAR], ["depreciation " + cf.dep, cf.dep]].sort((a, b) => b[1] - a[1]);
      if (cf.change > is.net && src[0][1] > 0) qs.push({ id: "cfs", also: ["accrual"], lines: ["is:net", "cf:cfo", "cf:cff", "cf:change"], q: `Cash rose ${cf.change}, more than your net income of ${is.net}.`, ask: "What added the most Cash beyond profit?",
        options: [src[0][0], src[1][0], "Revenue was higher than recorded"], answer: src[0][0] });
    }
    if (is.revenue > 0) {
      const gm = is.gross / is.revenue, mu = is.cogs ? is.gross / is.cogs : 0, nm = is.net / is.revenue;
      qs.push({ id: "gross", also: ["margin"], lines: ["is:revenue", "is:cogs", "is:gross"], q: `Revenue ${is.revenue}, Gross profit ${is.gross}.`, ask: "What's your gross margin?",
        options: three([pct(gm), pct(mu), pct(nm), pct(gm / 2), pct(gm + .2)]), answer: pct(gm) });
    }
    return qs;
  }
  function three(c) { return [...new Set(c)].slice(0, 3); } // first is the answer; distractors deduped
  function reviewResult(s, correct, asked) { // sets next season's terms from how well the player explained their books
    s.trust.ezra = Math.max(0, Math.min(10, s.trust.ezra + correct * 2 - asked));
    return S.terms(s);
  }
  root.Books = { close, highlight, review, reviewResult };
  if (typeof module !== "undefined") module.exports = root.Books;
})(typeof window !== "undefined" ? window : globalThis);
