// The wages-day walk-off: a spender triggers it, a careful player does not. Run: node tests/test-walkoff.js
const S = require("../core/engine.js"), Bot = require("../core/bot.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const play = (k, opt, days) => { const s = S.newGame(opt); if (opt && opt.story) s.quiet = false; for (let d = 1; d <= days && !s.over; d++) { Bot[k].day(s); S.sleep(s); } return s; };
{ const s = S.newGame({ story: true }); s.quiet = false; let cashBefore = null; for (let d = 1; d <= 7; d++) { Bot.spender.day(s); if (d === 7) cashBefore = s.bal.cash; S.sleep(s); }
  const w = S.R.upkeep - S.R.sprinklerSaving * s.plots.filter(p => p.sprinkler).length;
  ok(cashBefore < w, `spender reaches the first pay-day with Cash ${cashBefore}, less than the ${w} of wages`);
  ok(s.walkedOff === 7 && s.walkedWages > 0, "so a farmhand walks off on day 7 (story game)");
  ok(!s.rescued && !s.over, "Ezra does not rescue, and the game goes on");
  ok(s.log.some(l => /walked off/.test(l.t)), "the walk-off is in the day's notes"); }
{ const s = play("careful", { story: true }, 8); ok(!s.walkedOff, "careful play never triggers it"); }
{ const s = play("spender", {}, 8); ok(!s.walkedOff, "outside the story the same spender is not walked out on (it is rescued or carried instead)"); }
{ const s = play("noDuke", { story: true }, 8), t = play("sprinkler", { story: true }, 8); ok(!s.walkedOff && !t.walkedOff, "the other sensible bots don't trigger it either"); }
process.exit(fail ? 1 : 0);
