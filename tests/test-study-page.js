// Study page files (MBA-ST11). Run: node tests/test-study-page.js
// The browser test (tests/study-page.html) plays the arms. This one checks the files: every script study.html loads exists, the route copy
// beside study.html is the Lead's route file, and the shipping pages do not link the study page.
const fs = require("fs"), path = require("path");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const repo = path.join(__dirname, ".."), read = f => fs.readFileSync(path.join(repo, f), "utf8");

const page = read("study.html");
const srcs = [...page.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
ok(srcs.length >= 8, "study.html loads the study kit scripts (" + srcs.length + ")");
ok(srcs.every(s => fs.existsSync(path.join(repo, s))), "every script study.html names exists" + srcs.filter(s => !fs.existsSync(path.join(repo, s))).map(s => " :: " + s).join(""));
ok(!/core\/(game|engine|verbs|story)\.js/.test(page.replace(/<script>[\s\S]*<\/script>/, "")), "study.html's own script tags load no game file (the game arm loads them on demand)");
ok(/robots[^>]*noindex/.test(page), "study.html asks search engines to skip it");
ok(!/study\.html/.test(read("game.html")) && !/study\.html/.test(read("index.html")), "game.html and index.html do not link study.html");

const outer = path.join(repo, "..", "study-route.json");
if (!fs.existsSync(outer)) console.log("SKIP route copy check: study-route.json is not beside the repo (CI has the repo only)");
else ok(fs.readFileSync(outer, "utf8") === read("study-route.json"), "repo/study-route.json is the same file as projects/mba-game/study-route.json (copy it after the Lead edits the route)");
const route = JSON.parse(read("study-route.json"));
ok(Array.isArray(route.route) && route.route.length > 5, "the route copy parses and has steps");

console.log(fail ? "\n" + fail + " FAILED" : "\nall passed");
process.exit(fail ? 1 : 0);
