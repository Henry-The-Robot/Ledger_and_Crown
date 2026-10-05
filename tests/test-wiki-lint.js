// The code-wiki lint: it passes on the real wiki, and each kind of drift it exists to catch really fails (fixture wikis in a temp folder). Run: node tests/test-wiki-lint.js
const fs = require("fs"), os = require("os"), path = require("path"), { lint } = require("../tools/wiki-lint.js");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const real = lint(path.join(__dirname, ".."));
ok(real.errors.length === 0 && real.pages >= 3, `the real wiki lints clean (${real.pages} pages)` + (real.errors.length ? " :: " + real.errors.slice(0, 3).join(" | ") : ""));
// a fixture: one source file, one test, two linked pages, an index
function fixture(over) {
  over = over || {}; const root = fs.mkdtempSync(path.join(os.tmpdir(), "wikilint-")), w = path.join(root, "docs", "wiki", "ch1"); fs.mkdirSync(w, { recursive: true }); fs.mkdirSync(path.join(root, "tests"));
  fs.writeFileSync(path.join(root, "src.js"), "function foo() {}\nconst BAR = 1;\n"); fs.writeFileSync(path.join(root, "other.js"), "x\n"); fs.writeFileSync(path.join(root, "tests", "t.js"), "\n");
  const page = (extra, fm) => `---\ntitle: T\ntype: system\npack: ch1\nseason: spring\nfiles: [src.js]\nsymbols: [foo, BAR]\nconcepts: []\nsessions: []\ntests: [tests/t.js]\nlinks: [ch1/b]\nupdated: 2026-10-04\n${extra || ""}---\nbody\n`.replace(fm ? new RegExp(fm[0], "m") : /^$/m, fm ? fm[1] : "");
  fs.writeFileSync(path.join(w, "a.md"), over.a != null ? over.a : page());
  fs.writeFileSync(path.join(w, "b.md"), `---\ntitle: B\ntype: system\npack: ch1\nseason: all\nfiles: [src.js]\nsymbols: []\nconcepts: []\nsessions: []\ntests: []\nlinks: [ch1/a]\nupdated: 2026-10-04\n---\n`);
  fs.writeFileSync(path.join(root, "docs", "wiki", "INDEX.md"), over.index != null ? over.index : "- [a](ch1/a.md)\n- [b](ch1/b.md)\n");
  fs.writeFileSync(path.join(root, "docs", "wiki", "coverage.json"), JSON.stringify({ strict: !!over.strict, packs: { ch1: ["src.js", "other.js"] } })); return root;
}
const errs = r => r.errors.join("\n");
let r = lint(fixture()); ok(r.errors.length === 0, "a correct fixture passes"); ok(r.warnings.length === 1 && /other\.js/.test(r.warnings[0]), "a source file no page names is a warning while coverage is warn-only");
r = lint(fixture({ strict: true })); ok(r.errors.length === 1 && /other\.js/.test(errs(r)), "the same gap is an error when coverage is strict");
const base = fixture({}), pageText = fs.readFileSync(path.join(base, "docs", "wiki", "ch1", "a.md"), "utf8");
r = lint(fixture({ a: pageText.replace("[foo, BAR]", "[foo, gone]") })); ok(r.errors.length === 1 && /symbol "gone"/.test(errs(r)), "a page that names a missing function fails (the CI proof case)");
r = lint(fixture({ a: pageText.replace("[src.js]", "[src.js, nope.js]") })); ok(/file "nope\.js" does not exist/.test(errs(r)), "a page that names a missing file fails");
r = lint(fixture({ a: pageText.replace("tests/t.js", "tests/zzz.js") })); ok(/test "tests\/zzz\.js"/.test(errs(r)), "a page that names a missing test fails");
r = lint(fixture({ a: pageText.replace("[ch1/b]", "[ch1/nowhere]") })); ok(/link "ch1\/nowhere"/.test(errs(r)), "a broken link fails");
r = lint(fixture({ a: pageText.replace("[ch1/b]", "[]") })); ok(/at least one link/.test(errs(r)), "a page with no links fails");
r = lint(fixture({ a: pageText.replace("updated: 2026-10-04\n", "") })); ok(/lacks "updated"/.test(errs(r)), "incomplete front-matter fails");
r = lint(fixture({ a: "no front matter here\n" })); ok(/no front-matter/.test(errs(r)), "a page without front-matter fails");
r = lint(fixture({ a: pageText.replace("type: system", "type: essay") })); ok(/type "essay"/.test(errs(r)), "an unknown page type fails");
r = lint(fixture({ index: "- [a](ch1/a.md)\n" })); ok(/ch1\/b|not listed/.test(errs(r)), "a page missing from INDEX.md fails");
r = lint(fixture({ index: "- [a](ch1/a.md)\n- [b](ch1/b.md)\n- [c](ch1/c.md)\n" })); ok(/links to "ch1\/c"/.test(errs(r)), "an INDEX link to a missing page fails");
process.exit(fail ? 1 : 0);
