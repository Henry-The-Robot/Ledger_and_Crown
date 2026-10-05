// Runs tests/*.html pages in a REAL-TIME headless Chromium (Playwright) and prints each page's RESULTS. Real time is needed for pages that render audio or animate
// (the --virtual-time-budget runs never advance an OfflineAudioContext or requestAnimationFrame).
//   node tests/run-html.js tests/audio.html [timeoutMs]      one page, prints its RESULTS (the old behaviour; exit 1 if it failed)
//   node tests/run-html.js --all [timeoutMs] [filter]        every tests/*.html, one line each, exit 1 if any failed (what CI runs)
// A page passes when it leaves "running", prints no line that ends ": false", no THROWN/EXCEPTION/FAIL line, no "errors: [...non-empty...]" / "JS errors: N>0", and logs no page error.
// Pages are served over http://127.0.0.1 from the repo root (like GitHub Pages), so fetch() of ../game.html works; file:// blocks it in newer Chromium builds.
// Needs `playwright` (npm i playwright; in CI: npx playwright install chromium). CHROMIUM_PATH points at an existing Chromium when the download is not available.
const path = require("path"), fs = require("fs"), http = require("http");
const { chromium } = require("playwright");
const BAD_LINE = /(:\s*false\b)|THROWN|EXCEPTION|^FAIL|\bTIMEOUT\b|JS errors: [1-9]|errors: \[[^\]\s]/m;
function judge(text, errs) { const bad = text.split("\n").filter(l => BAD_LINE.test(l)); if (errs.length) bad.push("page errors: " + errs.slice(0, 3).join(" | ")); return bad; }
const ROOT = path.resolve(__dirname, ".."), MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };
function serve() { return new Promise(res => { const s = http.createServer((q, r) => { if (q.url === "/favicon.ico") { r.writeHead(204); return r.end(); } const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end("not found"); } r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); }); s.listen(0, "127.0.0.1", () => res(s)); }); }
const urlOf = (srv, file) => `http://127.0.0.1:${srv.address().port}/` + path.relative(ROOT, file).split(path.sep).join("/");
async function runPage(browser, file, wait, srv) {
  const p = await browser.newPage(), errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
  let text = "running"; const t0 = Date.now();
  try { await p.goto(urlOf(srv, file)); while (Date.now() - t0 < wait) { text = await p.evaluate(() => (document.getElementById("out") || {}).textContent || "running"); if (text !== "running") break; await p.waitForTimeout(400); } if (text === "running") text = "TIMEOUT: the page never left 'running'"; }
  catch (e) { text = "EXCEPTION " + e.message; } finally { await p.close(); }
  return { text, errs, bad: judge(text, errs), ms: Date.now() - t0 };
}
(async () => {
  const args = process.argv.slice(2), all = args[0] === "--all", exe = process.env.CHROMIUM_PATH || undefined;
  const b = await chromium.launch({ executablePath: exe, args: ["--no-sandbox", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"] });
  const srv = await serve(); let failed = 0;
  if (!all) {
    const r = await runPage(b, path.resolve(args[0]), +(args[1] || 60000), srv); console.log(r.text); if (r.errs.length) console.log("page errors:", r.errs.slice(0, 5)); failed = r.bad.length ? 1 : 0;
  } else {
    const wait = +(args[1] || 90000), filter = args[2] ? new RegExp(args[2]) : null, dir = __dirname;
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".html") && !f.startsWith("shot-") && (!filter || filter.test(f))).sort(); // shot-*.html are screenshot drivers, not tests
    for (const f of files) { const r = await runPage(b, path.join(dir, f), wait, srv); const ok = !r.bad.length; if (!ok) failed++;
      console.log((ok ? "ok   " : "FAIL ") + f + ` (${(r.ms / 1000).toFixed(1)}s)` + (ok ? "" : "\n       " + r.bad.slice(0, 4).map(l => l.slice(0, 220)).join("\n       "))); }
    console.log(`\n${files.length - failed} of ${files.length} pages passed`);
  }
  srv.close(); await b.close(); process.exit(failed ? 1 : 0);
})();
