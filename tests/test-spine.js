// WS6: the story's balance with Corvin's escalating orders (day 12: half of R.duke.sacks, day 15: the full R.duke.sacks, both on R.duke.terms),
// bots through a STORY-shaped game (offers on, the story's own Duke orders injected the way story.js does), the timeline's "tied up" line,
// and (item 9) the seeded events. Run: node tests/test-spine.js
const S = require("../engine.js"), Bot = require("../bot.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const D = S.R.duke, C = S.R.corvin, first = C[0].sacks, second = C[1].sacks;
// A story-shaped game: no sandbox Duke on day 10 (engine skips it for story games); Corvin's two orders arrive like story.js's arrive(1)/arrive(2).
function storyGame(seed) { const s = S.newGame({ story: true, seed }); s.quiet = false; return s; }
function run(botName, seed) {
  const s = storyGame(seed), bot = Bot[botName]; let n = 0;
  while (!s.over && n++ < 40) {
    if (s.day === C[0].day) S.addOffer(s, "duke", first, D.price, D.terms, C[0].dueIn, 4);
    if (s.day === C[1].day) S.addOffer(s, "duke", second, D.price, D.terms, C[1].dueIn, 4);
    bot.day(s); S.sleep(s);
  }
  return { s, end: s.outcome === "insolvent" ? "insolvent" : S.crownFund(s).verdict };
}
const lost = v => ["insolvent", "short", "bridge"].includes(v);
const res = {}; for (const k of ["careful", "overtrader", "reckless"]) res[k] = run(k).end;
ok(first * 2 === D.sacks && second === D.sacks && C[0].day === 12 && C[1].day === 15, `Corvin's orders: day ${C[0].day} ${first} sacks (half of ${D.sacks}), day ${C[1].day} ${second} sacks (double the first)`);
ok(res.careful === "paid", "careful still ends paid with the escalating orders: " + res.careful);
ok(lost(res.overtrader), "overtrader still loses with the escalating orders: " + res.overtrader);
ok(lost(res.reckless), "reckless still loses: " + res.reckless);
console.log(JSON.stringify(res));
process.exit(fail ? 1 : 0);
