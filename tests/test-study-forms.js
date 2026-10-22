// Study kit test forms A, B, C (MBA-ST2). Run: node tests/test-study-forms.js
// Hand-calculated expectations only: the seeded order is pinned from a first run and checked for determinism and shape.
const path = require("path"), fs = require("fs");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Study = require("../core/study/log.js");
const Forms = require("../core/study/forms.js");
const FIX = require("../core/study/fixture-items.js");

// A bank of n items; item i has answer index i%4 on every form (4 options each).
const bank = n => Array.from({ length: n }, (_, i) => ({ id: "q" + i, concept: "c" + (i % 5), fixture: true,
  forms: ["A", "B", "C"].reduce((o, f) => (o[f] = { stem: f + i, options: ["a", "b", "c", "d"], answer: i % 4 }, o), {}) }));

// 1. Fixed seed -> fixed order; another seed -> another order; every item appears once
const b = bank(20);
const o1 = Forms.build(b, "A", 42).map(x => x.id), o2 = Forms.build(b, "A", 42).map(x => x.id), o3 = Forms.build(b, "A", 43).map(x => x.id);
ok(o1.join() === o2.join(), "a fixed seed gives a fixed order");
ok(o1.join() !== o3.join(), "a different seed gives a different order");
ok(o1.length === 20 && new Set(o1).size === 20, "20 items, each shown once");
const opt1 = Forms.build(b, "A", 42).map(x => x.options.join("")).join(), opt2 = Forms.build(b, "A", 42).map(x => x.options.join("")).join();
ok(opt1 === opt2, "option shuffle is seeded too");
const built = Forms.build(b, "A", 42);
ok(built.every(x => x.options[x.answerIndex] === ["a", "b", "c", "d"][b.find(y => y.id === x.id).forms.A.answer]), "answerIndex follows the shuffled options to the same option text");
ok(Forms.build(b, "A", 42).map(x => x.stem).every((s, i) => s === "A" + built[i].id.slice(1)), "form A shows form A wording");
ok(Forms.build(b, "B", 42)[0].stem[0] === "B" && Forms.build(b, "C", 42)[0].stem[0] === "C", "forms B and C show their own wording");
ok(Forms.build(b, "A", 42).map(x => x.id).join() === Forms.build(b, "B", 42).map(x => x.id).join(), "same seed, same item order across forms (parallel forms)");
try { Forms.build(b, "D", 1); ok(false, "form D is rejected"); } catch (e) { ok(true, "form D is rejected"); }

// 1b. Pinned across runs: a changed shuffle changes everyone's order, so it must fail here (values from a first run, then frozen)
const six = Array.from({ length: 6 }, (_, i) => ({ id: "q" + i, concept: "c" + i, forms: { A: { stem: "s", options: ["a", "b", "c", "d"], answer: 0 }, B: { stem: "s", options: ["a", "b", "c", "d"], answer: 0 }, C: { stem: "s", options: ["a", "b", "c", "d"], answer: 0 } } }));
ok(Forms.build(six, "A", 42).map(x => x.id + ":" + x.answerIndex).join() === "q2:1,q3:2,q5:2,q4:2,q0:0,q1:0", "seed 42 form A gives the pinned order and answer positions");
ok(Forms.build(six, "B", 42).map(x => x.id + ":" + x.answerIndex).join() === "q2:2,q3:3,q5:1,q4:1,q0:2,q1:2", "form B has the same item order but its own option order");
// loadBank rules
ok(Forms.loadBank({ items: [bank(1)[0], bank(1)[0]] }).error, "loadBank rejects a duplicate item id");
ok(Forms.loadBank({ items: [Object.assign({}, bank(1)[0], { concept: "" })] }).error, "loadBank rejects an item with no concept");
ok(Forms.loadBank({ items: [Object.assign({}, bank(1)[0], { forms: { A: { stem: "s", options: ["a", "b"], answer: 0 }, B: { stem: "s", options: ["a", "b", "c"], answer: 0 }, C: { stem: "s", options: ["a", "b"], answer: 0 } } })] }).error, "loadBank rejects different option counts across forms");
ok(!Forms.loadBank(FIX).error, "the fixture bank loads");

// 2. Screen-out: 80 percent on form A screens out, 79 does not (failure case)
const hundred = Forms.build(bank(100), "A", 9);
const answer = (n) => hundred.map((x, i) => (i < n ? x.answerIndex : (x.answerIndex + 1) % 4));
ok(Forms.score(hundred, answer(80)).pct === 80 && Forms.screenedOut(Forms.score(hundred, answer(80)).pct, 80) === true, "80 of 100 on form A screens out");
ok(Forms.score(hundred, answer(79)).pct === 79 && Forms.screenedOut(Forms.score(hundred, answer(79)).pct, 80) === false, "79 of 100 on form A does NOT screen out");
ok(Forms.screenedOut(60, 60) === true && Forms.screenedOut(59.9, 60) === false, "the line is a setting: 60 works the same way");
ok(Forms.DEFAULT_SCREEN_OUT === 80, "default screen-out line is 80 percent");
const s5 = Forms.build(bank(5), "A", 1);
ok(Forms.score(s5, [s5[0].answerIndex, -1, null, s5[3].answerIndex, 99]).right === 2, "skipped or invalid answers count as wrong");
ok(Forms.score([], []).pct === 0, "an empty form scores 0, not NaN");

// 3. Per-concept scores by hand: q0..q4 map to concepts c0..c4 once each in a 5-item bank
const five = Forms.build(bank(5), "B", 2);
const per = Forms.score(five, five.map((x, i) => (x.concept === "c1" || x.concept === "c3" ? x.answerIndex : (x.answerIndex + 1) % 4))).byConcept;
ok(per.c1.right === 1 && per.c3.right === 1 && per.c0.right === 0 && per.c0.total === 1, "per-concept right and total are counted");

// 4. Each answer is logged (item_shown, item_answer with form, item, choice, ok, rt); nothing without ?study=1
let t = 0; const log = Study.create({ search: "?study=1", pc: "ab12", seed: 42, now: () => t });
const run = Forms.run(log, built.slice(0, 3), "A");
const wrongOf = q => (q.answerIndex === 0 ? 1 : 0);
for (let i = 0; i < 3; i++) { run.show(i); t += 1500; run.answer(i, i === 1 ? wrongOf(built[i]) : built[i].answerIndex); } // items 0 and 2 right, item 1 wrong
run.answer(0, wrongOf(built[0])); // a second answer to the same item is ignored
const rows = log.rows(), shown = rows.filter(r => r.ev === "item_shown"), ans = rows.filter(r => r.ev === "item_answer");
ok(shown.length === 3 && ans.length === 3, "3 items shown, 3 answers logged");
ok(ans.every(r => r.form === "A" && r.item && typeof r.ok === "boolean" && r.rt === 1500), "answers carry form, item, ok and rt 1500");
ok(ans.every((r, i) => r.ok === (r.choice === built[i].options[built[i].answerIndex])), "ok matches whether the chosen option is the right one");
ok(ans.every(r => !("stem" in r) && !("options" in r)), "rows do not carry item text");
const quiet = Study.create({ search: "", pc: "ab12", seed: 42, now: () => t });
const run2 = Forms.run(quiet, built.slice(0, 3), "A"); run2.show(0); run2.answer(0, 1);
ok(quiet.rows().length === 0, "without ?study=1 the form logs nothing");
ok(ans.map(r => r.ok).join() === "true,false,true" && ans.length === 3, "2 right and 1 wrong are logged in order; the repeat answer is not logged");
ok(run.result().right === 2 && run.result().right === ans.filter(r => r.ok).length, "run.result() is 2 and agrees with the logged ok count");

// 5. Fixture items are marked as fixtures; ship nothing else
ok(Array.isArray(FIX.items) && FIX.items.length >= 3 && FIX.items.every(i => i.fixture === true), "shipped items are all marked fixture:true");
ok(FIX.items.every(i => ["A", "B", "C"].every(f => i.forms[f] && i.forms[f].options.length >= 3 && i.forms[f].answer < i.forms[f].options.length)), "every fixture item has forms A, B, C with a valid answer");
ok(FIX.items.every(i => i.forms.A.stem !== i.forms.B.stem && i.forms.B.stem !== i.forms.C.stem), "forms word the same concept differently");
ok(Forms.build(FIX.items, "A", 5).length === FIX.items.length, "fixtures build into a form");
ok(typeof Forms.loadBank === "function" && Forms.loadBank({ items: [{ id: "x" }] }).error, "loadBank rejects an item with no forms");

console.log(fail ? fail + " FAILED" : "ALL STUDY FORMS TESTS PASS"); process.exitCode = fail ? 1 : 0;
