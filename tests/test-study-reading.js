// Study reading page for the control arm (MBA-ST6). Run: node tests/test-study-reading.js
// Expected values are hand-computed from the rules: unlock at 10 min = 600,000 ms of active time; pause = gap over 60 s; cap 30 min.
const path = require("path"), cp = require("child_process");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Shell = require("../core/study/shell.js"), Fx = require("../core/study/reading-fixture.js"), Items = require("../core/study/fixture-items.js");
const MIN = 60000;
const decode = code => { const r = cp.spawnSync(process.platform === "win32" ? "python" : "python3", ["-I", path.join(__dirname, "decode_result.py"), code], { encoding: "utf8" }); return r.status === 0 ? JSON.parse(r.stdout) : null; };

// Reader is active: an activity every 50 s up to time `to` (a gap of 60 s or less is not a pause).
const tick = (c, rd, to) => { while (c.t + 50000 < to) { c.t += 50000; rd.activity(); } c.t = to; rd.activity(); };

// Drive a shell to the reading phase on a manual clock.
function toReading(extra) {
  const c = { t: 0 };
  const sh = Shell.create(Object.assign({ search: "?study=1", bank: Items, now: () => c.t, seed: 5, screenOut: 101 }, extra || {}));
  sh.submitCode("rd11aa");
  sh.items().forEach((it, i) => { c.t += 1000; sh.show(i); c.t += 1000; sh.answer(i, 0); });
  sh.finishForm();
  return { c, sh };
}

// 1. A scripted read: every section once, done locked before 10 minutes, open at 10
{
  const { c, sh } = toReading();
  ok(sh.phase() === "play", "form A leads to the reading phase");
  const rd = sh.startReading(Fx.SECTIONS);
  ok(!!rd && sh.startReading(Fx.SECTIONS) === null, "reading starts once");
  const t0 = c.t;
  Fx.SECTIONS.forEach((s, i) => { tick(c, rd, t0 + (i + 1) * 2 * MIN); rd.show(s.id); rd.show(s.id); }); // each shown twice: logged once. Last at 8 min.
  ok(rd.sectionsSeen() === 4, "4 sections seen");
  ok(rd.show("nope") === false, "an unknown section is refused");
  tick(c, rd, t0 + 9 * MIN + 59000);
  ok(rd.canFinish() === false && sh.finishReading() === false && sh.phase() === "play", "done is locked at 9:59 (active " + rd.activeMs() + " ms)");
  tick(c, rd, t0 + 10 * MIN);
  ok(rd.activeMs() === 10 * MIN && rd.canFinish(), "done unlocks at exactly 10:00 of active time");
  ok(sh.finishReading() === "formB" && sh.phase() === "formB", "done opens form B");
  const rows = sh.rows();
  const secs = rows.filter(r => r.ev === "read_section").map(r => r.scene);
  ok(secs.join() === "fx-1,fx-2,fx-3,fx-4", "each section is logged once, in order");
  ok(rows.filter(r => r.ev === "read_start").length === 1 && rows.filter(r => r.ev === "read_end").length === 1, "one read_start and one read_end");
  ok(rows.filter(r => r.ev === "pause").length === 0, "no pause rows when the learner is active stays active");
}

// 2. Failure case: a pause over 60 s is logged and removed from active time
{
  const { c, sh } = toReading();
  const rd = sh.startReading(Fx.SECTIONS), t0 = c.t;
  c.t = t0 + 30000; rd.show("fx-1");
  c.t = t0 + 30000 + 5 * MIN; rd.activity(); // a 5-minute gap: one pause row of 300,000 ms
  tick(c, rd, t0 + 10 * MIN + 30000);
  const pauses = sh.rows().filter(r => r.ev === "pause");
  ok(pauses.length === 1 && pauses[0].rt === 5 * MIN, "a 5-minute gap is one pause row with rt 300,000");
  ok(rd.activeMs() === 5 * MIN + 30000, "pause removed: 10:30 on the clock is " + rd.activeMs() + " ms active (expected 330,000)");
  ok(rd.canFinish() === false && sh.finishReading() === false, "10 minutes on the clock with a 5-minute pause cannot finish");
  tick(c, rd, t0 + 15 * MIN + 30000);
  ok(rd.activeMs() === 10 * MIN + 30000 && sh.finishReading() === "formB", "finishes once 10 minutes of active time are done (clock 15:30, active 10:30)");
}

// 3. A gap of exactly 60 s is not a pause; 60.001 s is
{
  const { c, sh } = toReading();
  const rd = sh.startReading(Fx.SECTIONS), t0 = c.t;
  c.t = t0 + 60000; rd.activity();
  ok(sh.rows().filter(r => r.ev === "pause").length === 0, "a gap of exactly 60 s is not a pause");
  c.t += 60001; rd.activity();
  ok(sh.rows().filter(r => r.ev === "pause").length === 1, "a gap of 60.001 s is a pause");
}

// 4. A gap that is still open counts as pause in the active time (a page left idle does not earn reading time)
{
  const { c, sh } = toReading();
  const rd = sh.startReading(Fx.SECTIONS), t0 = c.t;
  c.t = t0 + 20 * MIN; // no activity at all for 20 minutes
  ok(rd.activeMs() === 0 && rd.canFinish() === false, "20 idle minutes give 0 active ms (open gap removed)");
}

// 5. The 30-minute cap ends the reading even with no active time
{
  const { c, sh } = toReading();
  const rd = sh.startReading(Fx.SECTIONS), t0 = c.t;
  c.t = t0 + 30 * MIN - 1; ok(rd.expired() === false && sh.finishReading() === false, "not expired at 29:59.999");
  c.t = t0 + 30 * MIN; ok(rd.expired() === true && sh.finishReading() === "formB", "the cap at 30:00 ends the reading and opens form B");
  ok(sh.rows().filter(r => r.ev === "pause").length === 1, "the idle time before the cap is logged as a pause");
}

// 5b. Critic fixes: a form A pause is not reading time; the cap pause is written once; the page cannot end the reading itself
{
  const c = { t: 0 };
  const sh = Shell.create({ search: "?study=1", bank: Items, now: () => c.t, seed: 5, screenOut: 101 });
  sh.submitCode("rd33cc");
  sh.items().forEach((it, i) => { c.t += 1000; sh.show(i); c.t += 90000; sh.answer(i, 0); }); // 90 s per item: pauses in form A
  sh.finishForm();
  ok(sh.rows().filter(r => r.ev === "pause").length >= 1, "form A has pause rows (setup)");
  const rd = sh.startReading(Fx.SECTIONS), t0 = c.t;
  tick(c, rd, t0 + 10 * MIN);
  ok(rd.activeMs() === 10 * MIN && sh.finishReading() === "formB", "form A pauses do not shorten reading: 10:00 active unlocks done");
  ok(rd.finish === undefined, "the page's reader has no finish()");
}
{
  const { c, sh } = toReading();
  const rd = sh.startReading(Fx.SECTIONS), t0 = c.t;
  c.t = t0 + 30 * MIN; sh.finishReading();
  sh.items().forEach((it, i) => { c.t += 1000; sh.show(i); c.t += 1000; sh.answer(i, 0); });
  ok(sh.rows().filter(r => r.ev === "pause" && r.rt === 30 * MIN).length === 1, "the idle gap before the cap is one pause row, not two");
}

// 6. Order and guards
{
  const { sh } = toReading();
  ok(sh.finishReading() === false, "finishReading before startReading is refused");
  const off = Shell.create({ search: "", bank: Items, now: () => 0, seed: 1 });
  ok(off.startReading(Fx.SECTIONS) === null, "without ?study=1 reading does not start");
  const early = Shell.create({ search: "?study=1", bank: Items, now: () => 0, seed: 1 });
  ok(early.startReading(Fx.SECTIONS) === null, "reading cannot start before form A");
}

// 7. The full run reaches a result code the shared decoder reads, with the reading events in it
{
  const { c, sh } = toReading({ search: "?study=1&pc=rd22bb&arm=reading&order=BC&seed=5" });
  ok(sh.phase() === "play", "URL contract: code from the URL, form A, then reading");
  const rd = sh.startReading(Fx.SECTIONS), t0 = c.t;
  Fx.SECTIONS.forEach((s, i) => { tick(c, rd, t0 + (i + 1) * 3 * MIN); rd.show(s.id); });
  tick(c, rd, t0 + 12 * MIN); sh.finishReading();
  sh.items().forEach((it, i) => { c.t += 1000; sh.show(i); c.t += 1000; sh.answer(i, 0); });
  sh.finishForm();
  const rows = decode(sh.resultCode());
  ok(!!rows && rows.some(r => r.ev === "read_start") && rows.filter(r => r.ev === "read_section").length === 4 && rows.some(r => r.ev === "read_end"), "decoded result holds read_start, 4 read_section and read_end");
  ok(rows.every(r => r.arm === "reading"), "arm reading is on every row");
  ok(rows.map(r => r.ev).lastIndexOf("read_end") < rows.findIndex(r => r.ev === "item_shown" && r.form === "B"), "form B starts after read_end");
}

console.log(fail ? fail + " FAILED" : "ALL STUDY READING TESTS PASS"); process.exitCode = fail ? 1 : 0;
