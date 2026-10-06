// Desk question (S1b): never more than one unprompted question a day. Run: node tests/test-desk-question.js
const DQ = require("../core/desk-question.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };

// priority, hand-checked: standing > maud > night
let s = { day: 1 };
ok(DQ.pick(s, { standing: true, maud: true, night: true }) === "standing", "all three ready: the standing order wins");
s = { day: 1 }; ok(DQ.pick(s, { standing: false, maud: true, night: true }) === "maud", "no standing order: Maud's problem wins over the night question");
s = { day: 1 }; ok(DQ.pick(s, { night: true }) === "night", "only the night question is ready: it is the pick");
s = { day: 1 }; ok(DQ.pick(s, {}) === null && !DQ.allowed(s, "maud") && !DQ.allowed(s, "night"), "nothing ready: no pick and no source may ask");
ok(DQ.skippable("night") && !DQ.skippable("standing") && !DQ.skippable("maud"), "only the night question is skippable");

// one pick per day, fixed by the first call
s = { day: 5 }; DQ.pick(s, { maud: true });
ok(DQ.pick(s, { standing: true, maud: true }) === "maud", "a later call the same day does not change the pick");
ok(DQ.allowed(s, "maud") && !DQ.allowed(s, "standing") && !DQ.allowed(s, "night"), "only today's pick may ask");
ok(DQ.done(s, "maud") === true && !DQ.allowed(s, "maud"), "after it asks, nobody asks again today");
ok(DQ.done(s, "standing") === false, "a source that is not today's pick cannot mark itself done");
s.day = 6; ok(DQ.pick(s, { standing: true }) === "standing" && DQ.allowed(s, "standing"), "the next day picks again");

// 28 days, every source tries to ask every day (worst case), availability from a fixed pattern: count unprompted questions per day
const asked = []; s = { day: 1 };
for (let d = 1; d <= 28; d++) {
  s.day = d; const avail = { standing: d % 3 === 0, maud: d % 4 !== 0, night: d % 2 === 0 }; DQ.pick(s, avail);
  let n = 0; for (const k of ["night", "maud", "standing", "maud", "night", "standing"]) if (avail[k] && DQ.allowed(s, k)) { n++; DQ.done(s, k); }
  asked.push(n);
}
ok(asked.length === 28 && Math.max(...asked) === 1, "over 28 days no day has more than one unprompted question (max " + Math.max(...asked) + ")");
ok(asked.filter(n => n === 0).length === 0, "and no day with something ready goes unasked (days with 0: " + asked.filter(n => n === 0).length + ")");
// a day with nothing ready asks nothing
s = { day: 30 }; DQ.pick(s, {}); ok(["standing", "maud", "night"].every(k => !DQ.allowed(s, k)), "a quiet day asks nothing");
console.log(fail ? "FAILED " + fail : "all ok"); process.exit(fail ? 1 : 0);
