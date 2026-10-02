// Scripted players for tests, screenshots (?auto=N) and the headless smoke run. Pure JS; browser and node.
(function (root) {
  const S = root.Spring || require("./engine.js");
  function farm(s) { // one day's field work: harvest ripe plots, till up to 8, plant what seed we hold, water
    let tilled = 0;
    s.plots.forEach(p => { if (p.crop && S.stage(s, p) === 4) S.act(s, p.i); });
    s.plots.forEach(p => { if (!p.tilled && tilled < 8) { S.act(s, p.i); tilled++; } });
    s.plots.forEach(p => { if (p.tilled && !p.crop && !p.sprinkler && s.seeds > 0) S.act(s, p.i); });
    s.plots.forEach(p => { if (p.crop && !p.watered && !S.rain(s.day) && !S.sprinkled(s, p)) S.act(s, p.i); });
  }
  const deliverAll = s => S.openOrders(s).sort((a, b) => a.due - b.due).forEach(o => S.deliver(s, o.id));
  const freePlots = s => s.plots.filter(p => p.tilled && !p.crop && !p.sprinkler).length;
  const need = s => S.committed(s) - s.sacks - S.sacksComing(s) - s.seeds * 3;

  const careful = { name: "careful (reserves, borrows for the Duke)", day(s) {
    const room = () => S.terms(s).loanLimit + s.bal.loan;
    const duke = S.openOrders(s).find(o => o.who === "duke"); // while the Duke's order is open, take only Ashby's small Cash orders
    s.offers.slice().forEach(o => (o.who === "duke" ? room() >= 150 : !duke || o.who === "ashby") ? S.accept(s, o.id) : S.decline(s, o.id));
    farm(s); if (duke) S.deliver(s, duke.id); deliverAll(s);
    const reserve = S.weekBills(s) + S.billsDue(s, S.nextWeekEnd(s)) + 20;
    let packs = Math.min(Math.ceil(Math.max(0, need(s)) / 3), freePlots(s) - s.seeds);
    if (packs > 0 && s.bal.cash - packs * 12 < reserve && room() > 0) S.borrow(s, Math.min(room(), Math.ceil((reserve + packs * 12 - s.bal.cash) / 50) * 50));
    const cashPacks = Math.max(0, Math.min(packs, Math.floor((s.bal.cash - reserve) / 12))); if (cashPacks > 0) S.buySeeds(s, cashPacks, false);
    const t = S.terms(s), billDay = s.day + t.apDays; // on account only if Cash + collections by the due day cover it
    const inflow = s.invoices.filter(v => v.due < billDay).reduce((a, v) => a + v.amount, 0);
    const apPacks = Math.min(packs - cashPacks, Math.floor((t.apLimit + s.bal.ap) / 12), Math.floor((s.bal.cash + inflow - reserve - S.billsDue(s, billDay) - (billDay > S.nextWeekEnd(s) ? S.weekBills(s) : 0)) / 12));
    if (t.apDays && apPacks > 0) S.buySeeds(s, apPacks, true);
    farm(s);
    if (s.day === 28 && s.bal.cash > reserve + 100) S.repay(s, Math.floor((s.bal.cash - reserve) / 50) * 50);
  } };
  const reckless = { name: "reckless (all orders, all Cash into seed)", day(s) {
    s.offers.slice().forEach(o => S.accept(s, o.id)); farm(s); deliverAll(s);
    const packs = Math.min(freePlots(s) - s.seeds, Math.floor(s.bal.cash / 12)); if (packs > 0) S.buySeeds(s, packs, false);
    const more = freePlots(s) - s.seeds; if (more > 0) S.buySeeds(s, Math.min(more, Math.floor((S.terms(s).apLimit + s.bal.ap) / 12)), true);
    farm(s);
  } };
  const overtrader = { name: "overtrader (careful, then takes every order)", day(s) { // sensible until the Duke arrives, then says yes to everything
    if (s.day < 10) return careful.day(s);
    s.offers.slice().forEach(o => S.accept(s, o.id)); farm(s); deliverAll(s);
    const reserve = 0, packs = Math.min(Math.ceil(Math.max(0, need(s)) / 3), freePlots(s) - s.seeds);
    const cashPacks = Math.max(0, Math.min(packs, Math.floor((s.bal.cash - reserve) / 12))); if (cashPacks > 0) S.buySeeds(s, cashPacks, false);
    const rest = Math.min(packs - cashPacks, Math.floor((S.terms(s).apLimit + s.bal.ap) / 12)); if (rest > 0) S.buySeeds(s, rest, true);
    farm(s);
  } };
  const noDuke = { name: "careful, declines the Duke", day(s) { s.offers.filter(o => o.who === "duke").forEach(o => S.decline(s, o.id)); careful.day(s); } };
  const sprinkler = { name: "careful + sprinkler", day(s) { if (s.day === 3) { S.buySprinkler(s); S.act(s, 13); } careful.day(s); } };
  root.Bot = { farm, deliverAll, careful, reckless, overtrader, noDuke, sprinkler };
  if (typeof module !== "undefined") module.exports = root.Bot;
})(typeof window !== "undefined" ? window : globalThis);
