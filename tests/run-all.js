// Runs every node test in tests/ and prints one line each. Run: node tests/run-all.js
const fs = require("fs"), path = require("path"), cp = require("child_process");
let bad = 0;
for (const f of fs.readdirSync(__dirname).filter(f => /^test-.*\.js$/.test(f)).sort()) {
  const r = cp.spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: "utf8" });
  const fails = (r.stdout.match(/^FAIL.*$/gm) || []);
  console.log((r.status === 0 ? "ok   " : "FAIL ") + f + (fails.length ? "  " + fails.join(" | ").slice(0, 300) : ""));
  if (r.status !== 0) bad++;
}
process.exit(bad ? 1 : 0);
