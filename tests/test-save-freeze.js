// Save freeze (P4c1): the season freezes when the closing books first show; review only sets exam fields; a reload keeps it. Run: node tests/test-save-freeze.js
const fs = require("fs"), path = require("path");
const S = require("../core/engine.js"), Bot = require("../core/bot.js"); require("../core/books.js");
const Save = require("../core/save.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
function fakeStore(init) { const m = Object.assign({}, init); return { m, getItem: k => k in m ? m[k] : null, setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
const st = fakeStore(); Save._use({ store: st, clock: () => "2026-10-05T10:00:00.000Z" });
const g = S.newGame({ story: true, seed: 3 }); let n = 0; while (!g.over && n++ < 40) { Bot.careful.day(g); S.sleep(g); }

// closeBooks' call: freeze once, no exam yet
ok(!Save.load().closed["ch1/spring"], "nothing is frozen before the books close");
Save.closeSeason("ch1/spring", g, { examPassed: false, score: 0, attempts: 0 });
let rec = Save.load().closed["ch1/spring"];
ok(rec && rec.exam.passed === false && rec.exam.attempts === 0, "the season freezes when the books close, exam not yet taken");
const closedAt = rec.closedAt, stmts = JSON.stringify(rec.statements);

// review's call: only the exam fields move
Save.markExam("ch1/spring", { passed: true, score: 3, attempts: 1 });
rec = Save.load().closed["ch1/spring"];
ok(rec.exam.passed === true && rec.exam.score === 3 && rec.exam.attempts === 1, "review sets the exam fields");
ok(rec.closedAt === closedAt && JSON.stringify(rec.statements) === stmts, "review leaves the statements and closedAt alone");
ok(Save.markExam("ch9/none", { passed: true }) === null, "review on an unfrozen season changes nothing");

// restart and reload: the frozen season stays
Save.clearSlot(); Save._use({ store: st, clock: () => "2026-10-05T11:00:00.000Z" });
ok(!!Save.load().closed["ch1/spring"] && Save.load().closed["ch1/spring"].exam.passed === true, "closed['ch1/spring'] survives restart and reload");
ok(!Save.slot(), "restart clears the open slot only");
console.log(fail ? "FAILED " + fail : "all ok"); process.exit(fail ? 1 : 0);
