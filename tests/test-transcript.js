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
// core / preview tag (S1a): every concept carries a kind; the core is the 8 in CORE and nothing else
const all = Object.values(T.CONCEPTS).flat(), coreIds = all.filter(c => c[2] === "core").map(c => c[0]);
ok(all.every(c => c[2] === "core" || c[2] === "preview"), "every concept is tagged core or preview");
ok(coreIds.length === 8 && T.CORE.length === 8 && T.CORE.every(id => coreIds.includes(id)), "exactly the 8 CORE ideas are tagged core: " + coreIds.join(","));
ok(all.length - coreIds.length === all.filter(c => c[2] === "preview").length && all.filter(c => c[2] === "preview").length > 0, "everything else is a preview (hand count: " + all.length + " concepts, 8 core)");
ok(T.kind("margin") === "core" && T.kind("demand") === "preview" && T.kind("segments") === "preview" && T.kind("nope") === null, "kind(id): margin core, Market Day ideas preview, unknown null");
T.reset(); const page = T.html();
ok((page.match(/<small class="tag core">core<\/small>/g) || []).length === 8, "the Transcript panel shows 8 core tags");
const shown = T.COURSES.filter(([code, , act]) => !(act > 0)).flatMap(([code]) => T.CONCEPTS[code] || []);
ok((page.match(/<small class="tag preview">preview<\/small>/g) || []).length === shown.filter(c => c[2] === "preview").length && shown.some(c => c[2] === "preview"), "the Transcript panel shows a preview tag on every other concept of an open course (" + shown.length + " rows)");
console.log(fail ? `${fail} FAILED` : "ALL TRANSCRIPT TESTS PASS"); process.exitCode = fail ? 1 : 0;
