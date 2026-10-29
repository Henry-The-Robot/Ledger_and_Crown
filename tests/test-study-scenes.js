// Study scenes (MBA-ST4): the season-one slice for CLEP Financial Accounting. A bot plays study-route.json start to end in 20-30 minutes,
// and every concept S1..S10 meets a staked mechanic. Run: node tests/test-study-scenes.js
const fs = require("fs"), path = require("path");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Bot = require("../core/study/bot.js");
const Lessons = require("../chapters/ch1/spring/lessons.js");
const spring = f => fs.readFileSync(path.join(__dirname, "..", "chapters", "ch1", "spring", f), "utf8");
const SCENES = spring("scenes.js"), COURT = spring("court.js");
const CONCEPTS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"];

// Every problem with a route, as a list of plain sentences. An empty list means the slice is sound.
function problems(route) {
  const out = [], ids = {};
  (route.route || []).forEach(s => {
    if (ids[s.id]) out.push("step id used twice: " + s.id); ids[s.id] = true;
    if (s.kind === "lesson" && !Lessons.BY[s.record]) out.push(s.id + ": the game has no record '" + s.record + "'");
    if (s.kind === "scene" && !new RegExp("id:\\s*[\"']" + s.scene + "[\"']").test(SCENES) && !SCENES.includes(s.scene)) out.push(s.id + ": the game has no scene '" + s.scene + "'");
    if (["lesson", "scene", "deposit"].includes(s.kind) && !s.stakes) out.push(s.id + ": no stakes are named");
    if (s.concept === "opt-1") out.push(s.id + ": the optional guarantee scene is on the route");
  });
  ((route.court || {}).claims || []).forEach(c => { if (!COURT.includes('"' + c.id + '"') && !COURT.includes("id: \"" + c.id + "\"")) out.push("court claim '" + c.id + "' is not in court.js"); });
  if ((route.stopMinutes || 0) > 30) out.push("the stop mark is over 30 minutes");
  if (out.length && out.some(x => /has no record/.test(x))) return out; // the bot cannot play a route with a missing record
  const res = Bot.play(route, Lessons.BY);
  if (!res.coverage.ok) out.push("concepts with no staked mechanic: " + res.coverage.missing.join(","));
  if (res.totalMinutes < 20 || res.totalMinutes > 30) out.push("modeled time " + res.totalMinutes.toFixed(1) + " is outside 20-30 minutes");
  if (res.unknown.length) out.push("verbs with no rate: " + res.unknown.join(","));
  return out;
}

const dmgIds = (route, drop) => { const r = JSON.parse(JSON.stringify(route)); r.route = r.route.filter(s => !drop.includes(s.id)); return Bot.play(r, Lessons.BY).coverage.missing.join(); };
const routeFile =path.join(__dirname, "..", "..", "study-route.json");
if (!fs.existsSync(routeFile)) console.log("SKIP real route: study-route.json is not beside the repo (CI has the repo only)");
else {
  const route = JSON.parse(fs.readFileSync(routeFile, "utf8"));
  const p = problems(route);
  ok(p.length === 0, "the real slice has no problems" + (p.length ? ": " + p.join(" | ") : ""));

  const right = Bot.play(route, Lessons.BY), wrong = Bot.play(route, Lessons.BY, { policy: "wrong" });
  console.log("bot: right " + right.totalMinutes.toFixed(1) + " min, wrong " + wrong.totalMinutes.toFixed(1) + " min");
  ok(right.totalMinutes >= 20 && right.totalMinutes <= 30, "a bot that answers right plays it in 20-30 minutes: " + right.totalMinutes.toFixed(1));
  ok(wrong.totalMinutes <= route.stopMinutes + 2, "a bot that answers wrong still ends near the 30-minute mark: " + wrong.totalMinutes.toFixed(1));
  ok(CONCEPTS.every(c => right.coverage.hit[c] > 0), "each of S1..S10 is played with stakes at least once: " + CONCEPTS.map(c => c + "=" + (right.coverage.hit[c] || 0)).join(" "));
  ok(Math.abs(right.totalMinutes - route.modeledMinutes) <= 2, "the bot total is within 2 minutes of the route's modeledMinutes " + route.modeledMinutes);
  const hops = route.route.filter(s => s.kind !== "advance").length - 1;
  ok(Math.abs(route.transitionMinutes - hops * 3 / 60) <= 0.25, "transitionMinutes " + route.transitionMinutes + " matches " + hops + " scene changes at 3 s");
  ok(dmgIds(route, ["s5-extension"]).includes("S5") && dmgIds(route, ["s9-s10-close"]).includes("S10"), "dropping the S5 step or the close step fails that concept (S8 also has a court claim)");
  ok(route.route[0].kind === "frame" && route.route[0].seconds <= 90, "the story frame is one step of 90 seconds or less");
  ok(route.route[route.route.length - 1].kind === "court", "the slice ends at the mini-Court");
  ok(!(route.optional["opt-1"] || {}).on, "opt-1 (the guarantee) is off in study 1");
  ok(route.court.pass === 3 && route.court.of === 4 && route.court.retake === false, "the mini-Court is 4 claims, pass 3, no retake");

  // Failure cases: each damage to the slice must be caught.
  const dmg = f => { const r = JSON.parse(JSON.stringify(route)); f(r); return problems(r); };
  ok(dmg(r => { r.route = r.route.filter(s => s.id !== "s6-deposit"); }).some(x => /S6/.test(x)), "dropping the deposit step is caught for S6");
  ok(dmg(r => { r.route.find(s => s.id === "s3-bakery").record = "zz"; }).some(x => /no record 'zz'/.test(x)), "an unknown record is caught");
  ok(dmg(r => { r.route.find(s => s.id === "s5-extension").scene = "no_such_scene"; }).some(x => /no scene/.test(x)), "an unknown scene is caught");
  ok(dmg(r => { r.route.find(s => s.id === "s1-bailiff").stakes = ""; }).some(x => /no stakes/.test(x)), "a scene with no stakes is caught");
  ok(dmg(r => { r.route = r.route.concat(r.route.slice(1, 7).map((s, i) => Object.assign({}, s, { id: "again" + i }))); }).some(x => /outside 20-30/.test(x)), "a slice that runs past 30 minutes is caught");
  ok(dmg(r => { r.court.claims[0].id = "noSuchClaim"; }).some(x => /noSuchClaim/.test(x)), "a court claim missing from court.js is caught");
}

console.log(fail ? "\n" + fail + " FAILED" : "\nall passed");
process.exit(fail ? 1 : 0);
