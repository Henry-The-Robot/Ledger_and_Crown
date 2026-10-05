#!/usr/bin/env node
// One version stamp. version.js holds the version; this tool writes it into every cache-busting `?v=` of game.html and index.html (safari keeps an old script
// when one tag differs from the page, which caused the "fixed but not fixed" reports).
//   node tools/stamp.js 0.4.7     bump: write the new version into version.js, then stamp both pages
//   node tools/stamp.js           re-stamp from version.js (after adding a script tag)
//   node tools/stamp.js --check   change nothing; exit 1 and list every tag that differs (tests/test-version.js and CI use this)
// Stamped: every local <script src>, every local <link rel="stylesheet" href>, index.html's Play link (game.html), and the visible "vX.Y.Z" in <small id="ver">.
// Not stamped: external URLs, icons, the manifest.
const fs = require("fs"), path = require("path"), ROOT = path.resolve(__dirname, ".."), FILES = ["game.html", "index.html"];
const local = u => !/^([a-z]+:)?\/\//i.test(u) && !/^(data|mailto|tel|#)/i.test(u);
function stamp(text, v) {
  const diffs = [];
  const fix = (m, pre, url, q, post) => { if (!local(url)) return m; const want = `?v=${v}`; if (q !== want) diffs.push(`${url}${q || ""} -> ${url}${want}`); return pre + url + want + post; };
  let out = text.replace(/(<script\b[^>]*?\bsrc=")([^"?#]+)(\?[^"#]*)?(")/g, fix);
  out = out.replace(/(<link\b[^>]*?\brel="stylesheet"[^>]*?\bhref=")([^"?#]+)(\?[^"#]*)?(")/g, fix);
  out = out.replace(/(<link\b[^>]*?\bhref=")([^"?#]+)(\?[^"#]*)?("[^>]*?\brel="stylesheet")/g, fix);
  out = out.replace(/(<a\b[^>]*?\bhref=")(game\.html)(\?[^"#]*)?(")/g, fix);
  out = out.replace(/(<small id="ver">v)([^<]*)(<\/small>)/g, (m, a, old, b) => { if (old !== v) diffs.push(`visible version v${old} -> v${v}`); return a + v + b; });
  return { out, diffs };
}
function main() {
  const args = process.argv.slice(2), check = args.includes("--check"), next = args.find(a => /^\d+\.\d+\.\d+/.test(a));
  const vf = path.join(ROOT, "version.js");
  if (next) { const t = fs.readFileSync(vf, "utf8"); fs.writeFileSync(vf, t.replace(/const v = "[^"]*"/, `const v = "${next}"`)); }
  delete require.cache[require.resolve(vf)]; const v = require(vf); let bad = 0;
  for (const f of FILES) {
    const p = path.join(ROOT, f), t = fs.readFileSync(p, "utf8"), { out, diffs } = stamp(t, v);
    if (diffs.length) { bad += diffs.length; console.log(`${f}: ${diffs.length} tag${diffs.length > 1 ? "s" : ""} differ from ${v}`); diffs.slice(0, 8).forEach(d => console.log("  " + d)); }
    if (!check && out !== t) fs.writeFileSync(p, out);
  }
  if (check) { if (bad) { console.log(`\nRun: node tools/stamp.js   (stamps version ${v} everywhere)`); process.exit(1); } console.log(`every tag is stamped ${v}`); }
  else console.log(`stamped ${v}`);
}
if (require.main === module) main();
module.exports = { stamp };
