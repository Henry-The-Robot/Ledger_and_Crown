// Golden bot seasons (platform P3). A seeded season played by each bot must come out byte for byte the same after the restructure: every morning's books (a full
// balance sheet and a hash of the whole journal), the notes the player was shown, and the ending. The recorded file is tests/golden/ch1-spring/bots.json.
//   node tests/test-golden-bots.js            compare with the recorded file
//   node tests/test-golden-bots.js --record   rewrite it (only when a PR says why Chapter 1's books changed and the Chapter 1 pack approves)
const fs = require("fs"), path = require("path");
const S = require("../engine.js"), Bot = require("../bot.js"), FILE = path.join(__dirname, "golden", "ch1-spring", "bots.json");
const SEEDS = [0, 3], BOTS = ["careful", "overtrader", "reckless", "noDuke", "sprinkler", "spender"];
const hash = str => { let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0; return h.toString(16); };
function season(botName, seed) {
  const g = S.newGame({ story: true, seed }), days = []; let n = 0;
  while (!g.over && n++ < 40) {
    Bot[botName].day(g); S.sleep(g); const b = S.balanceSheet(g.bal);
    days.push([g.day, g.bal.cash, b.ar, b.inv, b.ap, b.loan, b.deposits, b.assets, b.liab, b.equity, g.sacks, g.seeds, g.journal.length, hash(JSON.stringify(g.journal)), hash(JSON.stringify((g.log || []).map(l => l.t)))]);
  }
  return { outcome: g.outcome || null, why: g.why || null, cash: g.bal.cash, days };
}
const now = {}; for (const seed of SEEDS) for (const b of BOTS) now[`${b}@seed${seed}`] = season(b, seed);
const text = JSON.stringify(now);
if (process.argv.includes("--record")) { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(now, null, 0).replace(/\},"/g, "},\n\"") + "\n"); console.log(`recorded ${Object.keys(now).length} seasons to ${path.relative(process.cwd(), FILE)}`); process.exit(0); }
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const gold = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null;
ok(!!gold, "the golden file exists (tests/golden/ch1-spring/bots.json)");
if (gold) for (const key of Object.keys(now)) {
  const a = now[key], b = gold[key]; if (!b) { ok(false, `${key}: no golden record`); continue; }
  const same = JSON.stringify(a) === JSON.stringify(b); let where = "";
  if (!same) { const i = a.days.findIndex((d, k) => JSON.stringify(d) !== JSON.stringify(b.days[k])); where = i >= 0 ? ` :: first difference on morning ${i + 1} (day ${(a.days[i] || [])[0]})` : ` :: outcome ${a.outcome}/${a.cash} vs ${b.outcome}/${b.cash}`; }
  ok(same, `${key}: ${a.days.length} mornings, ${a.outcome}, byte for byte` + where);
}
ok(Object.keys(gold || {}).length === Object.keys(now).length, `no golden record is unused (${Object.keys(now).length} runs)`);
ok(["careful@seed0", "careful@seed3"].every(k => now[k].outcome === "closed") && now["reckless@seed0"].outcome === "insolvent", "sanity: careful play sees the season out, reckless goes insolvent (the golden file records real seasons)");
process.exit(fail ? 1 : 0);
