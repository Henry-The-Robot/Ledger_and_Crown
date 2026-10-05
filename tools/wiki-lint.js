#!/usr/bin/env node
// Code-wiki lint (schema: docs/wiki/README.md). A page that points at code that no longer exists fails the PR, so the wiki cannot drift.
//   node tools/wiki-lint.js            lint docs/wiki; exit 1 on any error (CI runs this)
//   node tools/wiki-lint.js --strict   also make "a source file no page names" an error (docs/wiki/coverage.json "strict" does the same, once W2 is done)
// Errors: front-matter missing or incomplete; bad type or pack; a `files`/`tests` path that does not exist; a `symbols` name that does not appear in any of the page's `files`;
// a `links` entry that does not resolve to a page; a page with no links; a page missing from INDEX.md; an INDEX link to a missing page.
// Warnings (errors when strict): a source file listed in coverage.json that no page names in `files`.
const fs = require("fs"), path = require("path");
const REQUIRED = ["title", "type", "pack", "season", "files", "symbols", "concepts", "sessions", "tests", "links", "updated"], TYPES = ["system", "lesson", "data", "bug", "decision"], PACKS = ["platform", "ch1", "ch2", "ch3", "ch4"];
const NOT_PAGES = ["README.md", "INDEX.md"];
function parse(text) { // the tiny YAML subset the schema uses: `key: value` and `key: [a, b]`, with trailing `# comments`
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/); if (!m) return null; const fm = {};
  for (const line of m[1].split(/\r?\n/)) { const k = line.match(/^([A-Za-z_]+):\s*(.*?)\s*$/); if (!k) continue; let v = k[2].replace(/\s+#.*$/, "");
    if (v.startsWith("[")) v = v.replace(/^\[|\]$/g, "").split(",").map(s => s.trim()).filter(Boolean); fm[k[1]] = v; }
  return fm;
}
function walk(dir) { return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]) : []; }
function lint(root, opts) {
  opts = opts || {}; const wiki = path.join(root, "docs", "wiki"), errors = [], warnings = [], err = (p, m) => errors.push(`${path.relative(root, p)}: ${m}`);
  const cfgPath = path.join(wiki, "coverage.json"), cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : { strict: false, packs: {} }, strict = !!(opts.strict || cfg.strict);
  const pages = walk(wiki).filter(f => f.endsWith(".md") && !NOT_PAGES.includes(path.basename(f)) || path.basename(f) === "LOG.md"), ids = new Set(pages.map(f => path.relative(wiki, f).replace(/\.md$/, "").split(path.sep).join("/")));
  const named = {}; // pack -> Set of files some page names
  const index = fs.existsSync(path.join(wiki, "INDEX.md")) ? fs.readFileSync(path.join(wiki, "INDEX.md"), "utf8") : "", indexLinks = [...index.matchAll(/\]\(([^)]+?)\.md\)/g)].map(m => m[1]);
  for (const f of pages) {
    const id = path.relative(wiki, f).replace(/\.md$/, "").split(path.sep).join("/"), fm = parse(fs.readFileSync(f, "utf8"));
    if (!fm) { err(f, "no front-matter"); continue; }
    for (const k of REQUIRED) if (!(k in fm)) err(f, `front-matter lacks "${k}"`);
    if (fm.type && !TYPES.includes(fm.type)) err(f, `type "${fm.type}" is not one of ${TYPES.join("|")}`);
    if (fm.pack && !PACKS.includes(fm.pack)) err(f, `pack "${fm.pack}" is not one of ${PACKS.join("|")}`);
    const files = Array.isArray(fm.files) ? fm.files : [], texts = [];
    for (const rel of files) { const p = path.join(root, rel); if (!fs.existsSync(p)) err(f, `file "${rel}" does not exist`); else if (fs.statSync(p).isFile()) texts.push(fs.readFileSync(p, "utf8")); }
    for (const s of (Array.isArray(fm.symbols) ? fm.symbols : [])) { const re = new RegExp("(^|[^A-Za-z0-9_$])" + s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^A-Za-z0-9_$]|$)"); if (!texts.some(t => re.test(t))) err(f, `symbol "${s}" is not found in ${files.join(", ") || "(no files)"}`); }
    for (const t of (Array.isArray(fm.tests) ? fm.tests : [])) if (!fs.existsSync(path.join(root, t))) err(f, `test "${t}" does not exist`);
    const links = Array.isArray(fm.links) ? fm.links : []; if (!links.length) err(f, "a page needs at least one link");
    for (const l of links) if (!ids.has(l)) err(f, `link "${l}" does not resolve to a page`);
    if (!indexLinks.includes(id)) err(f, "not listed in INDEX.md");
    (named[fm.pack] = named[fm.pack] || new Set()); files.forEach(x => named[fm.pack].add(x));
  }
  for (const l of indexLinks) if (!ids.has(l)) err(path.join(wiki, "INDEX.md"), `links to "${l}", which is not a page`);
  for (const [pack, list] of Object.entries(cfg.packs || {})) for (const rel of list) { if (!fs.existsSync(path.join(root, rel))) { err(cfgPath, `coverage.json names "${rel}", which does not exist`); continue; }
    if (!(named[pack] && named[pack].has(rel))) (strict ? errors : warnings).push(`${pack}: no wiki page names ${rel}`); }
  return { errors, warnings, pages: pages.length, strict };
}
if (require.main === module) {
  const r = lint(path.resolve(__dirname, ".."), { strict: process.argv.includes("--strict") });
  r.warnings.forEach(w => console.log("warn  " + w)); r.errors.forEach(e => console.log("ERROR " + e));
  console.log(`\nwiki lint: ${r.pages} pages, ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}, ${r.warnings.length} warning${r.warnings.length === 1 ? "" : "s"}${r.strict ? " (coverage is strict)" : " (coverage is warn-only until W2)"}`);
  process.exit(r.errors.length ? 1 : 0);
}
module.exports = { lint, parse };
