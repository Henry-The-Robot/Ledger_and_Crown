// Study build shell (MBA-ST3): code -> form A -> placeholder scenes -> form B -> result code. Run: node tests/test-study-shell.js
const path = require("path"), cp = require("child_process");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Shell = require("../core/study/shell.js");
const FIX = require("../core/study/fixture-items.js");
const DECODER = path.join(__dirname, "decode_result.py");
const decode = code => { const r = cp.spawnSync(process.platform === "win32" ? "python" : "python3", ["-I", DECODER, code], { encoding: "utf8" }); return r.status === 0 ? JSON.parse(r.stdout) : null; };

let t = 0; const now = () => t;
const mk = (extra) => Shell.create(Object.assign({ search: "?study=1", bank: FIX, now, seed: 11, screenOut: 80 }, extra || {}));
// answer every item of the current form: right for the first nRight, wrong after
const answerForm = (sh, nRight) => { const q = sh.items(); q.forEach((it, i) => { sh.show(i); t += 2000; sh.answer(i, i < nRight ? it.answerIndex : (it.answerIndex + 1) % it.options.length); }); };

// 1. Happy path: code, form A (low score, plays on), two placeholder scenes, form B, result code
const sh = mk();
ok(sh.phase() === "code", "the shell opens on the participant code screen");
ok(sh.submitCode("kv7q2m") === true && sh.phase() === "formA", "a valid code moves to form A");
answerForm(sh, 1); // 1 of 3 right = 33 percent, below the screen-out line
ok(sh.finishForm() === "play", "a form A score below the line goes on to play");
ok(sh.scenes().length === 2, "the placeholder list has two scenes");
sh.scenes().forEach((sc, i) => { t += 3000; sh.playScene(sc.id); t += 4000; sh.decide(sc.id, sc.options[sc.right], 4000); });
ok(sh.phase() === "play", "scenes keep the shell in play until finished");
ok(sh.finishPlay() === "formB", "after both scenes the shell moves to form B");
answerForm(sh, 3);
ok(sh.finishForm() === "result", "form B leads to the result screen");
const code = sh.resultCode();
ok(code.length > 20 && code.length < 4000, "a result code is shown (" + code.length + " chars)");
const rows = decode(code) || [];
ok(rows.length > 0, "the shared decoder reads the code");
ok(rows.filter(r => r.ev === "item_answer" && r.form === "A").length === 3 && rows.filter(r => r.ev === "item_answer" && r.form === "B").length === 3, "3 form A and 3 form B answers are in the log");
ok(rows.filter(r => r.ev === "scene_start").length === 2 && rows.filter(r => r.ev === "outcome").length === 2, "2 scenes and 2 scored decisions are in the log");
ok(rows.every(r => r.pc === "kv7q2m" && r.seed === 11 && r.game === "ledger-crown"), "every row carries code, seed and game");
const at = f => rows.findIndex(f), lastAt = f => rows.map(f).lastIndexOf(true);
ok(at(r => r.ev === "item_answer" && r.form === "A") < at(r => r.ev === "scene_start") && lastAt(r => r.ev === "scene_end") < at(r => r.ev === "item_answer" && r.form === "B"), "log runs form A, then the scenes, then form B");
ok(lastAt(r => r.ev === "item_answer" && r.form === "A") < at(r => r.ev === "scene_start"), "all form A answers come before the first scene");
ok(rows[0].ev === "start" && rows[rows.length - 1].ev === "end", "log starts with start and ends with end");

// 2. Failure case: a missing or bad participant code blocks the start
for (const bad of ["", "   ", "ab", "kyle@x.com", "Kyle Skinner", null, undefined]) {
  const b = mk();
  ok(b.submitCode(bad) === false && b.phase() === "code" && b.items().length === 0, "participant code " + JSON.stringify(bad) + " is refused; the shell stays on the code screen");
}
const blocked = mk();
ok(blocked.show(0) === false && blocked.playScene("x") === false && blocked.resultCode() === "", "nothing runs and no code exists before a valid code");

// 3. Not study mode: the shell does not open
const off = Shell.create({ search: "", bank: FIX, now, seed: 1 });
ok(off.enabled === false && off.submitCode("kv7q2m") === false && off.phase() === "off", "without ?study=1 the shell stays off");

// 4. Screen-out on form A: 3 of 3 = 100 percent is at or above the line -> screened out, no play, still a result code
const so = mk(); so.submitCode("so11aa"); answerForm(so, 3);
ok(so.finishForm() === "result" && so.screenedOut() === true, "100 percent on form A screens out and goes to the result");
ok(decode(so.resultCode()).some(r => r.ev === "end"), "a screened-out learner still gets a result code");
const low = mk(); low.submitCode("lo22bb"); answerForm(low, 2);
ok(low.finishForm() === "play" && low.screenedOut() === false, "2 of 3 (67 percent) is below the 80 line and plays on");

// 5. Order is enforced: scenes cannot start before form A is finished; form B cannot start before the scenes
const ord = mk(); ord.submitCode("or33cc");
ok(ord.playScene(ord.scenes()[0].id) === false, "a scene cannot start during form A");
ok(ord.finishPlay() === false, "play cannot be finished from form A");

// 6. Time on task: first input to end, minus each pause over 60 seconds
let t2 = 0; const tt = Shell.create({ search: "?study=1", bank: FIX, now: () => t2, seed: 3, screenOut: 101 });
t2 = 1000; tt.submitCode("tt44dd");
t2 = 2000; tt.show(0); t2 = 4000; tt.answer(0, 0);
t2 = 4000 + 90000; tt.show(1); t2 += 1000; tt.answer(1, 0); // a 90 s gap is a pause
tt.show(2); t2 += 1000; tt.answer(2, 0); tt.finishForm();
const tr = tt.timeOnTask();
ok(tt.rows().filter(r => r.ev === "pause").length === 1, "the 90 second gap is logged as one pause");
// By hand: first input at 1,000; last event at 96,000; the pause is 95,000 - 4,000 = 91,000. 96,000 - 1,000 - 91,000 = 4,000.
ok(tr === 4000, "time on task is 4,000 ms: first input to last event minus the 91 s pause (got " + tr + ")");

// 7. Guards (critic round): invalid answer keeps the item open; nothing changes after the result; scenes need playScene first
const g = mk(); g.submitCode("gd55ee");
ok(g.answer(0, 99) === false && g.answer(0, -1) === false, "an out-of-range choice is not an answer");
ok(g.finishForm() === false, "the form cannot finish while an item is open");
answerForm(g, 3); g.finishForm();
const n0 = g.rows().length, c0 = g.resultCode();
ok(g.phase() === "result" && g.finishForm() === false && g.show(0) === false && g.answer(0, 0) === false, "after the result, finish, show and answer are refused");
ok(g.rows().length === n0 && g.resultCode() === c0, "the log and the result code do not change after the result");
const p = mk(); p.submitCode("pl66ff"); answerForm(p, 0); p.finishForm();
ok(p.decide("ph-market", "price-high", 1) === false, "a decision before its scene starts is refused");
p.playScene("ph-market"); p.decide("ph-market", "price-high", 1);
ok(p.decide("ph-market", "price-low", 1) === false && p.rows().filter(r => r.ev === "outcome").length === 1, "a scene takes one decision only");
ok(p.finishPlay() === false, "play cannot finish with a scene left");
// time spent inside a scene (no input for 70 s, then the decision) must not be logged as a pause
let t7 = 0; const sc = Shell.create({ search: "?study=1", bank: FIX, now: () => t7, seed: 3, screenOut: 101 });
sc.submitCode("sc77gg"); sc.items().forEach((it, i) => { sc.show(i); t7 += 100; sc.answer(i, 0); }); sc.finishForm();
t7 += 500; sc.playScene("ph-market"); t7 += 70000; sc.decide("ph-market", "price-high", 70000);
ok(sc.rows().filter(r => r.ev === "pause").length === 0, "70 s of play inside a scene is not a pause");

console.log(fail ? fail + " FAILED" : "ALL STUDY SHELL TESTS PASS"); process.exitCode = fail ? 1 : 0;
