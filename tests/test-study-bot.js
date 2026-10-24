// Study bot (MBA-ST10): plays study-route.json start to end, reports modeled minutes per step, checks concept coverage.
// Run: node tests/test-study-bot.js
const fs = require("fs"), path = require("path");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Bot = require("../core/study/bot.js");
const Lessons = require("../chapters/ch1/spring/lessons.js");

// Hand calculation of the rates on a tiny fixture (plan section 1: 180 words a minute, 1.5 s a tap).
// "one two three four five six" = 6 words = 2 s; plus one tap 1.5 s = 3.5 s. A quiz adds 60 s. A page is one tap.
const recs = { r: { steps: [{ speak: "x", text: "one two three four five six" }, { quiz: "q" }, { page: 0 }, { verb: "reveal" }] } };
const mini = { route: [{ id: "a", kind: "lesson", record: "r", concept: "S9" }] };
const m = Bot.play(mini, recs);
const want = (3.5 + 60 + 1.5 + 20) / 60;
ok(Math.abs(m.rows[0].minutes - want) < 1e-9, "fixture step costs " + want.toFixed(4) + " min by hand: " + m.rows[0].minutes.toFixed(4));
ok(Bot.play(mini, recs, { policy: "wrong" }).rows[0].minutes > m.rows[0].minutes, "a wrong answer costs more time than a right one");
let threw = false; try { Bot.play({ route: [{ id: "a", kind: "lesson", record: "nope" }] }, recs); } catch (e) { threw = /unknown record 'nope'/.test(e.message); }
ok(threw, "an unknown record throws with its name");

// The real route file lives beside the repo (outside it); CI has only the repo, so this section skips there.
const routeFile = path.join(__dirname, "..", "..", "study-route.json");
if (!fs.existsSync(routeFile)) console.log("skip real route: study-route.json is not beside the repo");
else {
  const route = JSON.parse(fs.readFileSync(routeFile, "utf8"));
  const res = Bot.play(route, Lessons.BY);
  console.log("per step (min): " + res.rows.map(r => r.id + "=" + r.minutes.toFixed(2)).join(" "));
  console.log("total " + res.totalMinutes.toFixed(2) + " (plan " + route.modeledMinutes + "); unknown verbs: " + (res.unknown.join(",") || "none"));
  ok(res.rows.length === route.route.length, "the bot finishes every route step: " + res.rows.length);
  ok(Math.abs(res.totalMinutes - route.modeledMinutes) <= 2, "total " + res.totalMinutes.toFixed(1) + " is within 2 minutes of the plan's " + route.modeledMinutes);
  ok(res.coverage.ok, "every concept S1..S10 fires a staked mechanic" + (res.coverage.ok ? "" : " (missing " + res.coverage.missing.join(",") + ")"));
  ok(res.rows.every(r => r.minutes >= 0 && isFinite(r.minutes)), "every step reports finite minutes");

  // Failure case: remove a concept's steps and the coverage check fails.
  const cut = (drop) => { const r2 = JSON.parse(JSON.stringify(route)); r2.route = r2.route.filter(s => !drop.includes(s.id)); return Bot.play(r2, Lessons.BY); };
  const noS6 = cut(["s6-deposit"]);
  ok(!noS6.coverage.ok && noS6.coverage.missing.includes("S6"), "route without the deposit step fails coverage for S6: " + noS6.coverage.missing.join(","));
  const noS5 = cut(["s5-extension"]);
  ok(!noS5.coverage.ok && noS5.coverage.missing.includes("S5"), "route without the extension scene fails coverage for S5: " + noS5.coverage.missing.join(","));
}

console.log(fail ? "\n" + fail + " FAILED" : "\nall passed");
process.exit(fail ? 1 : 0);
