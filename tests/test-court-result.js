// The exam is the Court's result (P4c2): closeSeason reads s.flags.courtPassed/courtScore/courtAttempts, never Ezra's review. Run: node tests/test-court-result.js
const fs = require("fs"), path = require("path");
const S = require("../core/engine.js"), Bot = require("../core/bot.js"); require("../core/books.js");
const Save = require("../core/save.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
function fakeStore() { const m = {}; return { getItem: k => k in m ? m[k] : null, setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
function game() { const g = S.newGame({ story: true, seed: 3 }); let n = 0; while (!g.over && n++ < 40) { Bot.careful.day(g); S.sleep(g); } g.flags = g.flags || {}; return g; }
function close(g, ctx) { Save._use({ store: fakeStore(), clock: () => "2026-10-05T10:00:00.000Z" }); return Save.closeSeason("ch1/spring", g, ctx); }

// the Court failed; a review result that says "passed" must not win
let g = game(); Object.assign(g.flags, { courtPassed: false, courtScore: 4, courtAttempts: 2 });
let rec = close(g, { examPassed: true, score: 3, attempts: 1 });
ok(rec.exam.passed === false && rec.exam.score === 4 && rec.exam.attempts === 2, "a failed Court stays failed even if the review result says passed");
ok(rec.next.flags.examPassed === false, "the carry record's examPassed follows the Court");

// the Court passed; a review result that says "failed" must not win
g = game(); Object.assign(g.flags, { courtPassed: true, courtScore: 7, courtAttempts: 1 });
rec = close(g, { examPassed: false, score: 0, attempts: 0 });
ok(rec.exam.passed === true && rec.exam.score === 7 && rec.exam.attempts === 1, "a passed Court stays passed even if the review result says failed");
ok(rec.next.flags.examPassed === true, "the carry record's examPassed is true after a Court pass");

// the books close before the Court sits: freeze with no result, then the Court's end updates the same record
g = game(); delete g.flags.courtPassed;
rec = close(g, { examPassed: false, score: 0, attempts: 0 });
ok(rec.exam.passed === false, "before the Court sits the season is frozen as not passed");
Save.markExam("ch1/spring", { passed: true, score: 6, attempts: 1 });
const after = Save.load().closed["ch1/spring"];
ok(after.exam.passed === true && after.next.flags.examPassed === true, "markExam from the Court's end updates the exam and the carry flag");

// source checks: the Court sets the flags; the game's review no longer writes the exam
const court = fs.readFileSync(path.join(__dirname, "..", "chapters", "ch1", "spring", "court.js"), "utf8");
ok(/courtPassed/.test(court) && /courtScore/.test(court) && /courtAttempts/.test(court), "court.js sets courtPassed, courtScore, courtAttempts");
const game_ = fs.readFileSync(path.join(__dirname, "..", "core", "game.js"), "utf8");
const rv = game_.slice(game_.indexOf("function review()"), game_.indexOf("function restart()"));
ok(!/markExam|closeSeason/.test(rv), "game.js review() never writes the exam or closes the season");
console.log(fail ? "FAILED " + fail : "all ok"); process.exit(fail ? 1 : 0);
