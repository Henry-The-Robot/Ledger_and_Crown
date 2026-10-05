// One version stamp: every local script, stylesheet and the Play link in game.html and index.html carries ?v=<version.js>, the visible version matches, and the
// tool that fixes a mismatch really does. A hand-edited tag (the old cause of "fixed but not fixed" on iPad) fails here. Run: node tests/test-version.js
const fs = require("fs"), path = require("path"), cp = require("child_process"), ROOT = path.join(__dirname, "..");
const version = require("../version.js"), { stamp } = require("../tools/stamp.js");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
ok(/^\d+\.\d+\.\d+/.test(version), `version.js holds a version (${version})`);
// 1. the real pages are stamped (an independent scan of the tags, not the tool's own code path)
for (const f of ["game.html", "index.html"]) {
  const t = read(f), tags = [...t.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]).concat([...t.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m => m[1]), [...t.matchAll(/<a\b[^>]*href="(game\.html[^"]*)"/g)].map(m => m[1])).filter(u => !/^(https?:)?\/\//.test(u));
  const wrong = tags.filter(u => !u.endsWith("?v=" + version));
  ok(tags.length > 0 && wrong.length === 0, `${f}: all ${tags.length} local tags end in ?v=${version}` + (wrong.length ? " :: " + wrong.join(", ") : ""));
  const missing = tags.map(u => u.split("?")[0]).filter(u => !fs.existsSync(path.join(ROOT, u)));
  ok(missing.length === 0, `${f}: every tagged file exists` + (missing.length ? " :: " + missing.join(", ") : ""));
}
ok(read("game.html").indexOf("version.js") > 0 && read("game.html").indexOf("version.js") < read("game.html").indexOf("engine.js"), "game.html loads version.js before the game scripts");
ok(new RegExp(`<small id="ver">v${version.replace(/\./g, "\\.")}</small>`).test(read("index.html")), "the title page shows the same version");
// 2. the checker can fail: one stale tag, one new unstamped tag, a stale visible version are all found, and --check fails the process
const g = read("game.html");
let r = stamp(g.replace(`engine.js?v=${version}`, "engine.js?v=0.0.1"), version); ok(r.diffs.length === 1 && /engine\.js/.test(r.diffs[0]), "a stale tag is reported");
r = stamp(g.replace(`game.js?v=${version}`, "game.js"), version); ok(r.diffs.length === 1 && r.out.includes(`game.js?v=${version}`), "a tag with no ?v= is reported and fixed");
r = stamp(read("index.html").replace(`v${version}</small>`, "v0.0.1</small>"), version); ok(r.diffs.length === 1 && r.out.includes(`v${version}</small>`), "a stale visible version is reported and fixed");
// 3. a bump stamps every tag (in memory: the real files are not touched)
r = stamp(g, "9.9.9"); const left = [...r.out.matchAll(/(?:src|href)="[^"]+\?v=([^"]+)"/g)].map(m => m[1]).filter(v => v !== "9.9.9");
ok(left.length === 0 && r.diffs.length >= 20, `bumping to 9.9.9 changes all ${r.diffs.length} tags and leaves none behind`);
// 4. the command line: --check passes on the repo as it is
const c = cp.spawnSync(process.execPath, [path.join(ROOT, "tools", "stamp.js"), "--check"], { encoding: "utf8" }); ok(c.status === 0, "node tools/stamp.js --check exits 0 on the repo");
process.exit(fail ? 1 : 0);
