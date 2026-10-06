// Spring at Thornfield: the season's settings, as data (platform P5). core/engine.js reads this object and holds no Spring numbers.
// A later season is a sibling file with the same shape. Wiki: docs/wiki/platform/season-settings.md.
(function (root) {
  const R = {
    days: 28, seedCost: 12, sacksPerPlot: 3, unitCost: 4, growDays: 4, // a plot: 12 of seed -> 3 sacks at 4 each
    upkeep: 45,                 // weekly farmhand wages + upkeep (Operating expense), paid in Cash
    sprinklerSaving: 20, wageFloor: 20, // each placed sprinkler saves the hands 20 a week of hauling water (wages never fall below the floor)
    spotDelta: -2, traderDelta: -1, // the market cart buys surplus for Cash at the going price - 2, the road trader at the going price - 1 (never below cost)
    sprinklerHead: 1,           // a crop planted in sprinkled soil starts this many days along (a shorter cycle, so more harvests)
    sprinklerCost: 80, depPerWeek: 5, // Equipment: 16-week life, straight-line, no salvage (C1.05)
    lateGrace: 3, breachPct: 0.1, // an order more than 3 days late is cancelled, with a forfeit of 10% of its value
    apDefault: 5,               // a bill 5 days overdue: Tomas takes you to the reeve's court
    apDays: 14, discDays: 7, discPct: 0.02, // Tomas's terms: "2/7, net 14" (2% off if paid within 7 days)
    prepayBefore: 21,           // Ezra charges one week's interest on any amount repaid before day 21: the interest he was counting on
    factorRate: 0.85,           // Ezra buys an invoice for 85% of its value today
    // The Duke's one big order (sandbox and story use the same numbers). 132 sacks is more than a careful player can grow and carry unless they borrow and
    // decline other orders; a player who says yes to everything runs out of Cash on a pay-day and is finished. Tuned with the bots in tests/test-crown.js.
    duke: { sacks: 132, price: 10, terms: 28, dueIn: 12 },
    // WS6: the story's Corvin Vane escalates (SEASON-1-REDESIGN.md §7 item 3): day 12 a first order of half of duke.sacks, day 15 the whole duke.sacks.
    // The second order is due 9 days out (day 24, the same day as the first) so a player who says yes to everything has both fall due at once.
    // Tuned with the bots in tests/test-spine.js: careful still pays the Crown, the overtrader is sued for the forfeit, reckless goes insolvent.
    corvin: [{ day: 12, sacks: 66, dueIn: 12 }, { day: 15, sacks: 132, dueIn: 9 }],
    crownDebt: 1250,            // owed to the Crown at Midwinter (the story's goal); a careful season ends close to it, so the last weeks matter
    bridgeMax: 250, rescueRateBp: 200, // Ezra will bridge a small gap at Midwinter; his one emergency loan costs 2 points a week more
    rain: [5, 12, 13, 20, 26],
    // the going price per sack by day (index = day - 1) for seed 0, the canonical season: steady at first, then a glut around days 10-13, a Duke-fuelled rise by day 17, a dip, a late rally
    market: [8, 8, 8, 8, 8, 8, 8, 8, 7, 7, 6, 6, 7, 8, 9, 9, 10, 10, 9, 9, 8, 8, 9, 10, 10, 9, 9, 8],
    // P5 demand model: another seed's price path is the canonical path plus a demand shock that drifts (shock[d] = round(carry * shock[d-1] + noise),
    // noise drawn per game from the seed, uniform in [-spread, spread]). The path stays inside [floor, ceil] (above the unit cost, below a price the bots cannot absorb).
    marketModel: { carry: 0.5, spread: 0.6, floor: 6, ceil: 11 },
    premium: { ashby: 0, hobb: 1 }, // what each buyer pays over the going price on a standard offer (the Duke's order is a fixed 10, see OFFERS)
    // overnight events (the night after the day): pigs eat a quarter of the crop in the ground unless the field is fenced, rats
    // take a fifth of the barn, a warm day speeds the crop, a frost stops it. Warned a day ahead (see warning()).
    // customers who pay part up front: [day offered, buyer, sacks, price, days to deliver, deposit share, what they say]
    deposits: [[11, "ashby", 27, 9, 8, 0.5, "My niece is marrying at the end of the week. A feast's worth of bread: 27 sacks. Half now to hold your place, the rest on delivery."],
      [18, "hobb", 24, 10, 8, 0.3, "I'm adding a second wheel. 24 sacks, and a third paid today so you can buy seed. I'll want them on time."]],
    pellDays: [5, 8], pedlarDays: [13, 16], poisonCost: 35, pellSacks: 12, pellShare: 80, // the pig farmer, the rat-poison pedlar, and what Pell's pig sale would give you
    // WS6 item 9: the event days are drawn per game from a seed saved with the game (same seed = same game), inside these windows.
    // Seed 0 (the default, and every sandbox/bot/test game) is the canonical calendar in `events`; any other seed draws from the windows.
    events: { 9: "pigs", 16: "rats", 19: "warm", 23: "frost" }, windows: { pigs: [7, 11], rats: [14, 18], warm: [17, 21], frost: [21, 25] }, fenceCost: 20, pigShare: 0.25, ratShare: 0.2,
    // T6 frost almanac (expected value vs ruin): the evening before the frost the notice board gives the odds of a HARD frost (1 in 3) and the price of straw (5 a plot).
    // Covering costs 5 a plot for certain; risking it loses a crop's 12 of seed with probability 1/3 (4 a plot on average: cheaper than the straw), unless losing the lot would sink the Crown fund.
    // Only a player who answers the notice is exposed to the hard frost, so unattended play (the bots, the sandbox tuning) is unchanged.
    frostCover: 5, frostOdds: 1 / 3,
    field: { x0: 5, y0: 10, w: 9, h: 4 },
    // what the bots (core/bot.js) assume about money: one borrow step, and the cash a bot wants before it takes the Duke's order
    bot: { borrowStep: 50, dukeRoom: 150 },
  };
  R.pigDay = +Object.keys(R.events).find(d => R.events[d] === "pigs"); // the canonical pig night (a game's own is eventDay(s, "pigs"))
  root.SpringSeason = R;
  if (typeof module !== "undefined") module.exports = R;
})(typeof window !== "undefined" ? window : globalThis);
