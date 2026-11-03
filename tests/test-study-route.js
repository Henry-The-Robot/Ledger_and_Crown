// Study scene runner (MBA-ST7): plays study-route.json in order, stops at 30 minutes. Run: node tests/test-study-route.js
const fs = require("fs"), path = require("path");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Route = require("../core/study/route.js");
const Shell = require("../core/study/shell.js");
const FIX = require("../core/study/fixture-items.js");

const MIN = 60 * 1000;
let t = 0; const now = () => t;
const fixture = () => ({
  stopMinutes: 30, engine: { newGame: { story: true, seed: 11 } },
  route: [
    { id: "frame", kind: "frame", seconds: 90, concept: "" },
    { id: "s1-bailiff", kind: "lesson", record: "ch1", concept: "S1", select: { skipPages: true } },
    { id: "s3-bakery", kind: "lesson", record: "ch3", concept: "S3", seed: 5, post: [{ op: "ship", who: "ashby" }] },
    { id: "s5-extension", kind: "scene", scene: "hobb_extension", concept: "S5" },
  ],
});
const known = { records: ["ch1", "ch3"], scenes: ["hobb_extension"] };

// 1. A fixture route plays in file order and carries its skip flags and seeds
t = 0;
const mkLog = () => { const rows = []; return { rows, input: c => rows.push("input:" + c), sceneStart: id => rows.push("start:" + id), sceneEnd: id => rows.push("end:" + id) }; };
let log = mkLog();
let r = Route.create({ route: fixture(), known, log, now });
ok(!r.error && r.count === 4, "the fixture route loads with 4 steps");
ok(r.start() && r.current().id === "frame", "the first step is the frame");
const order = [];
while (r.state() === "playing") { order.push(r.current().id); t += 2 * MIN; r.next(); }
ok(order.join() === "frame,s1-bailiff,s3-bakery,s5-extension", "steps play in file order: " + order.join());
ok(r.state() === "done" && r.reason() === "route", "the route ends as done when the last step finishes");
ok(r.current() === null, "no step is current after the end");
const starts = log.rows.filter(x => x.startsWith("start:")).map(x => x.slice(6));
ok(starts.join() === "s1-bailiff,s3-bakery,s5-extension", "each non-frame step logs a scene start, in order");
ok(log.rows.filter(x => x.startsWith("end:")).length === 3, "each non-frame step logs a scene end");

// 2. Skip flags, fixed seeds and ops ride on the current step
t = 0; r = Route.create({ route: fixture(), known, now }); r.start(); r.next();
ok(r.current().select.skipPages === true, "the step's select flags reach the page");
ok(r.current().seed === 11, "a step without its own seed uses the engine's fixed seed");
r.next();
ok(r.current().seed === 5 && r.current().post[0].op === "ship", "a step's own seed and post ops reach the page");

// 3. The frame lasts 90 seconds, then the runner moves on without an input
t = 0; r = Route.create({ route: fixture(), known, now }); r.start();
t = 89 * 1000; ok(r.tick() === "playing" && r.current().id === "frame", "the frame holds at 89 seconds");
t = 90 * 1000; r.tick(); ok(r.current().id === "s1-bailiff", "the frame ends at 90 seconds");

// 4. Stop at the 30-minute mark: the open step closes, nothing new opens, the shell goes to form B
t = 0; log = mkLog(); r = Route.create({ route: fixture(), known, log, now }); r.start();
t = 1 * MIN + 31 * 1000; r.next(); // into s1
t = 29 * MIN; ok(r.tick() === "playing", "at 29 minutes the route still plays");
t = 30 * MIN; ok(r.tick() === "stopped" && r.reason() === "time", "at 30 minutes the route stops");
ok(log.rows[log.rows.length - 1] === "end:s1-bailiff", "the open step is closed in the log");
ok(r.next() === "stopped" && r.current() === null, "nothing new opens after the stop");
ok(!log.rows.includes("start:s3-bakery"), "the later step never started");

// 5. Failure cases: a bad route fails to load with a clear error
const bad = (mut, re, msg) => { const f = fixture(); mut(f); const x = Route.create({ route: f, known, now }); ok(x.error && re.test(x.error), msg + ": " + x.error); };
bad(f => { f.route[2].record = "ch99"; }, /s3-bakery.*unknown record 'ch99'/, "an unknown record names the step and the record");
bad(f => { f.route[3].scene = "nope"; }, /s5-extension.*unknown scene 'nope'/, "an unknown scene names the step and the scene");
bad(f => { f.route[1].kind = "quiz"; }, /unknown kind 'quiz'/, "an unknown kind is rejected");
bad(f => { f.route[2].id = "s1-bailiff"; }, /used twice/, "a repeated id is rejected");
bad(f => { f.route = []; }, /no steps/, "an empty route is rejected");
ok(Route.create({ route: null, known, now }).error !== "", "a missing route is rejected");

bad(f => { f.route[1].record = undefined; }, /unknown record/, "a lesson with no record is rejected");
ok(/missing/.test(Route.create({ route: fixture(), now }).error), "an omitted known list fails the load");
bad(f => { f.route.push({ id: "adv", kind: "advance" }); }, /needs toDay/, "an advance step without toDay is rejected");
bad(f => { f.route.push({ id: "c", kind: "court" }); }, /needs config/, "a court step without config is rejected");

// 5b. next() after the mark closes the open step and opens nothing
t = 0; log = mkLog(); r = Route.create({ route: fixture(), known, log, now }); r.start();
t = 2 * MIN; r.next(); t = 31 * MIN;
ok(r.next() === "stopped" && r.reason() === "time" && log.rows[log.rows.length - 1] === "end:s1-bailiff" && !log.rows.includes("start:s3-bakery"), "next() after 30 minutes stops, closes the step, opens none");

// 6. The real route file loads and its order follows the file; a route edit needs no code change
// The route file lives in the Agent System (projects/mba-game), outside the game repo: CI has only the repo, so section 6 skips there.
const routeFile = path.join(__dirname, "..", "..", "study-route.json");
const real = fs.existsSync(routeFile) ? JSON.parse(fs.readFileSync(routeFile, "utf8")) : null;
if (!real) console.log("skip section 6: study-route.json is not beside the repo");
else {
const knownReal = { records: ["ch1", "ch2", "ch3", "ch4", "ch4b", "tvm", "ch7", "ch5", "close"], scenes: ["hobb_extension"] };
const rr = Route.create({ route: real, known: knownReal, now });
ok(!rr.error && rr.count === real.route.length, "study-route.json loads: " + (rr.error || rr.count + " steps"));
const swapped = JSON.parse(JSON.stringify(real)); swapped.route.reverse();
const rs = Route.create({ route: swapped, known: knownReal, now }); rs.start();
ok(rs.current().id === real.route[real.route.length - 1].id, "reordering the file reorders the play with no code change");
}

// 7. Through the shell: the route replaces the placeholder scenes; the stop leads to form B
const mk = () => Shell.create({ search: "?study=1", bank: FIX, now, seed: 11, screenOut: 80 });
const answerForm = (sh, n) => { sh.items().forEach((it, i) => { sh.show(i); t += 2000; sh.answer(i, i < n ? it.answerIndex : (it.answerIndex + 1) % it.options.length); }); };
t = 0; let sh = mk(); sh.submitCode("kv7q2m"); answerForm(sh, 1); sh.finishForm();
ok(sh.phase() === "play", "the shell reaches play");
ok(sh.startRoute({ route: [{ id: "x", kind: "lesson", record: "zz" }] }, { records: [] }).error !== undefined, "a bad route in the shell returns the error and keeps play");
const run = sh.startRoute(fixture(), known);
ok(run && run.state() === "playing", "a good route starts in the shell");
ok(sh.finishRoute() === false, "play does not end while the route runs");
t += 31 * MIN;
ok(sh.finishRoute() === "formB" && sh.phase() === "formB", "after 30 minutes the shell goes to form B");
answerForm(sh, 3); ok(sh.finishForm() === "result", "form B leads to the result");
// route completion (not time) also leads to form B
t = 0; sh = mk(); sh.submitCode("kv7q2m"); answerForm(sh, 1); sh.finishForm();
const run2 = sh.startRoute(fixture(), known); while (run2.state() === "playing") { t += MIN; run2.next(); }
ok(run2.reason() === "route" && sh.finishRoute() === "formB", "a finished route leads to form B");

console.log(fail ? "\n" + fail + " FAILED" : "\nall passed");
process.exit(fail ? 1 : 0);
