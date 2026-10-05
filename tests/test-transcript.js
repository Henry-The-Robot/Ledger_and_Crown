// Honest mastery checks for transcript.js. Run: node test-transcript.js
const T = require("../core/transcript.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
T.reset(); T.master("margin", 3);
ok(T.state("margin") === "introduced", "one right answer = introduced, not mastered");
T.use("margin", true, 3); T.use("margin", true, 3); T.use("margin", true, 3);
ok(T.state("margin") === "introduced", "doing it many times on the same day still counts once");
T.use("margin", true, 5); ok(T.state("margin") === "practiced", "right on 2 different days = practiced");
T.use("margin", true, 9); ok(T.state("margin") === "practiced", "3 days in one real sitting is not mastery (needs 2 real days)");
T.reset(); T.use("ar", true, 1); T.use("ar", true, 2); T.use("ar", true, 3);
ok(T.state("ar") !== "mastered", "3 days of use with no explanation is not mastery");
ok(T.level({ ev: [{ day: 1, kind: "answer", real: "2026-10-01" }, { day: 4, kind: "use", real: "2026-10-02" }, { day: 8, kind: "use", real: "2026-10-02" }] }) === "mastered",
  "3 game days + explained once + 2 real days = mastered");
T.reset(); T.master("gross", 1); T.use("gross", true, 4); T.use("gross", true, 8);
ok(T.state("gross") === "practiced", "3 days + explained, same real day = practiced");
console.log(fail ? `${fail} FAILED` : "ALL TRANSCRIPT TESTS PASS"); process.exitCode = fail ? 1 : 0;
