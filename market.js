// Spring at Thornfield — Market Day (WS7). A weekly fair where the player prices their own sacks and watches villagers react.
// Pure core (no DOM, runs under node: tests/test-market-day.js) + the scene UI at the bottom (browser only).
//
// Sources the numbers come from (knowledge/mba/modules): C4.01 demand, supply and elasticity (a demand curve is the price a buyer
// will pay, summed over buyers; revenue = price x units, so a price rise helps only if units fall by less); C4.02 pricing against a
// competitor; C8.02 segmentation (buyers differ in what they will pay, so one price is never right for everyone).
// Game exemplars: Recettear and Moonlighter (price a shop item, see each customer's face react).
//
// The model. Each afternoon is 3 hours of 8 villagers (24). Each villager has a segment and a hidden reserve price (the most
// they'll pay), fixed by roll(day, villager, salt), so the same game always meets the same villagers:
//   thrifty      42%  reserve = going price - 1, +-2    buys 1 (2 if it is a bargain, 2+ under their reserve)
//   comfortable  38%  reserve = going price + 2, +-1    buys 2 (1 if the price is right at their limit)
//   in a hurry   20%  buys at almost any price          buys 1
// A buyer who can't pay shows 'hesitated' when the price is 1 over their reserve (a coin less would have won them) and
// 'too dear' when it is 2+ over. Grisby (the rival, from day 14) sets his price after seeing yours at the start of each hour:
// he undercuts by 1 when you are above the going price, otherwise holds at it. Thrifty villagers who see both buy the
// cheaper (ties stay with you); comfortable and hurried villagers don't comparison-shop.
// Sales post to the books through the engine's own journal (Cash, Revenue, Cost of goods sold), so the statements tie out.
(function (root) {
  const S = root.Spring || require("./engine.js");
  const CFG = {
    hours: 3, perHour: 8, maxStock: 60, grisbyFrom: 14, maxPrice: 30, finale: 28,
    seg: { thrifty: { share: .42, base: -1, spread: 5 }, comfortable: { share: .38, base: 2, spread: 3 }, hurry: { share: .20 } },
  };
  const FAIR_DAYS = [7, 14, 21, 28];
  const SEG_NAMES = { thrifty: "Thrifty", comfortable: "Comfortable", hurry: "In a hurry" };
  const roll = S.roll; // the engine's own stateless roll (same game, same villagers; nothing to save)

  // the fair is on days 7, 14, 21, and 28 only if the story has not already given the season its finale (WS6 sets s.finaleDone)
  const isDay = (day, s) => day === 7 || day === 14 || day === 21 || (day === CFG.finale && !(s && s.finaleDone));
  const grisbyIn = day => day >= CFG.grisbyFrom;
  const grisbyPrice = (market, mine) => mine > market ? mine - 1 : market; // undercut by 1 above the going price, otherwise hold

  // the 8 villagers who walk by in an hour (same game, same villagers)
  function villagers(day, hour) {
    const market = S.marketPrice(day), out = [];
    for (let k = 0; k < CFG.perHour; k++) {
      const id = "mk" + hour + "." + k, r = roll(day, id, 1), seg = r < CFG.seg.thrifty.share ? "thrifty" : r < CFG.seg.thrifty.share + CFG.seg.comfortable.share ? "comfortable" : "hurry";
      const c = CFG.seg[seg], off = seg === "hurry" ? 0 : Math.floor(roll(day, id, 2) * c.spread) - Math.floor(c.spread / 2);
      out.push({ id, k, hour, seg, reserve: seg === "hurry" ? market + 4 : market + c.base + off, t: (k + roll(day, id, 3) * .7) / CFG.perHour, look: Math.floor(roll(day, id, 4) * 6) });
    }
    return out;
  }
  // what one villager does when you ask `mine` and Grisby (or null) asks `g`; stock is what you have left
  function decide(v, mine, g, stock) {
    const want = (p) => v.seg === "thrifty" ? 1 + (p <= v.reserve - 2 ? 1 : 0) : v.seg === "comfortable" ? 1 + (p <= v.reserve - 1 ? 1 : 0) : 1;
    const toGrisby = g != null && v.seg === "thrifty" && g < mine, p = toGrisby ? g : mine;
    if (!toGrisby && stock <= 0) return { to: "me", react: "soldout", qty: 0, price: mine };
    if (p <= v.reserve) return { to: toGrisby ? "grisby" : "me", react: "bought", qty: toGrisby ? want(p) : Math.min(want(p), stock), price: p };
    return { to: toGrisby ? "grisby" : "me", react: p - v.reserve === 1 ? "hesitated" : "dear", qty: 0, price: p };
  }

  // ---------- a fair ----------
  function newFair(s, o) {
    o = o || {}; const day = s.day, stock = Math.max(0, Math.min(o.stock != null ? o.stock : s.sacks, s.sacks, CFG.maxStock));
    return { day, market: S.marketPrice(day), grisby: grisbyIn(day), stock0: stock, stock, hour: 0, hours: [], cost: S.R.unitCost };
  }
  function playHour(f, price) { // price: your price this hour; returns the hour record (events in arrival order)
    price = Math.max(1, Math.min(CFG.maxPrice, Math.round(price)));
    const g = f.grisby ? grisbyPrice(f.market, price) : null, stock0 = f.stock, ev = [], segSeen = {}, segBought = {};
    villagers(f.day, f.hour).forEach(v => {
      const d = decide(v, price, g, f.stock); if (d.to === "me") f.stock -= d.qty;
      segSeen[v.seg] = (segSeen[v.seg] || 0) + 1; if (d.react === "bought") segBought[v.seg] = (segBought[v.seg] || 0) + 1;
      ev.push(Object.assign({}, v, d));
    });
    const units = ev.reduce((a, e) => a + (e.to === "me" ? e.qty : 0), 0), lost = ev.filter(e => e.to === "grisby" && e.react === "bought").reduce((a, e) => a + e.qty, 0);
    const rec = { hour: f.hour, price, grisbyPrice: g, stockStart: stock0, units, revenue: units * price, gross: units * (price - f.cost), soldOutAt: ev.find(e => e.react === "soldout") ? ev.findIndex(e => e.react === "soldout") : -1,
      toGrisby: lost, segSeen, segBought, events: ev, counts: ev.reduce((c, e) => (c[e.react] = (c[e.react] || 0) + 1, c), {}) };
    f.hours.push(rec); f.hour++; return rec;
  }
  const totals = f => ({ units: f.hours.reduce((a, h) => a + h.units, 0), revenue: f.hours.reduce((a, h) => a + h.revenue, 0), gross: f.hours.reduce((a, h) => a + h.gross, 0), unsold: f.stock, toGrisby: f.hours.reduce((a, h) => a + h.toGrisby, 0) });
  // What the afternoon would earn if you kept ONE price all afternoon (the model's own answer: used for Maud's bet and for the oracle in the tests)
  function flat(s, price, stock) { const f = newFair(s, { stock }); for (let h = 0; h < CFG.hours; h++) playHour(f, price); return totals(f); }
  function bestFlat(s, stock) { let best = null; for (let p = 1; p <= 20; p++) { const t = flat(s, p, stock); if (!best || t.gross > best.t.gross) best = { price: p, t }; } return best; }

  // ---------- posting to the books: one Cash sale + one Cost of goods sold per hour, through the engine's journal ----------
  function commitHour(s, f, h) {
    if (!h.units) return;
    const v = h.revenue, c = h.units * S.R.unitCost;
    S.post(s, "sale", `Market Day, hour ${h.hour + 1}: sold ${h.units} sacks at ${h.price} for Cash`, { cash: v, revenue: -v });
    S.post(s, "cogs", `Cost of the ${h.units} sacks sold at the fair`, { cogs: c, inv: -c });
    s.sacks -= h.units; s.week.revenue += v; s.week.cogs += c; s.week.sacksSold += h.units;
  }
  function commit(s, f) { // post every unposted hour, remember the fair (for the demand curve), and credit the transcript
    f.hours.forEach(h => { if (!h.posted) { commitHour(s, f, h); h.posted = true; } });
    const m = s.market || (s.market = { fairs: [], named: false, bets: 0, wins: 0 });
    const t = totals(f); const rec = { day: f.day, market: f.market, grisby: f.grisby, stock0: f.stock0, units: t.units, revenue: t.revenue, gross: t.gross, toGrisby: t.toGrisby,
      points: f.hours.map(h => ({ price: h.price, units: h.units, short: h.soldOutAt >= 0 })) };
    if (!m.fairs.some(x => x.day === f.day)) m.fairs.push(rec);
    return t;
  }
  const history = s => (s.market && s.market.fairs) || [];

  // ---------- Maud's bet (day 14): will raising your price by 1 raise or lower your takings? ----------
  function betAnswer(s, price, stock) { const a = flat(s, price, stock).revenue, b = flat(s, price + 1, stock).revenue; return { answer: b > a ? "up" : b < a ? "down" : "same", now: a, then: b }; }

  // ---------- the least-squares demand line through the player's hour-by-hour points (sold-out hours are cut off by stock, so they don't count) ----------
  function demandFit(points) {
    const p = points.filter(x => !x.short); if (new Set(p.map(x => x.price)).size < 2) return null;
    const n = p.length, mx = p.reduce((a, x) => a + x.price, 0) / n, my = p.reduce((a, x) => a + x.units, 0) / n;
    const sxx = p.reduce((a, x) => a + (x.price - mx) ** 2, 0), sxy = p.reduce((a, x) => a + (x.price - mx) * (x.units - my), 0);
    return sxx ? { slope: sxy / sxx, icpt: my - sxy / sxx * mx } : null;
  }

  // ---------- bots (tests): they see only what a player sees (the reactions), never the reserves ----------
  const bots = {
    fixed: price => ({ name: `fixed at ${price}`, pick: () => price }),
    // a price-setter who reads the faces: start a coin above the going price; if the hour ran faster than the stock allows, charge more; if the stock won't last the day... charge less
    smart: () => ({ name: "smart pricer", pick(f) {
      if (!f.hours.length) return f.market + 1;
      const last = f.hours[f.hours.length - 1], left = CFG.hours - f.hour, target = f.stock / left;
      if (last.soldOutAt >= 0 || last.units > target * 1.25) return last.price + 1;
      if (last.units < target * .75 && f.stock > 0) return Math.max(f.cost + 1, last.price - 1);
      return last.price; } }),
  };
  function auto(s, bot, stock) { const f = newFair(s, { stock }); while (f.hour < CFG.hours) playHour(f, bot.pick(f)); commit(s, f); return f; }

  root.Market = { CFG, FAIR_DAYS, SEG_NAMES, isDay, grisbyIn, grisbyPrice, villagers, decide, newFair, playHour, totals, flat, bestFlat, commit, commitHour, history, betAnswer, demandFit, bots, auto, roll };
  if (typeof module !== "undefined") module.exports = root.Market;
})(typeof window !== "undefined" ? window : globalThis);
