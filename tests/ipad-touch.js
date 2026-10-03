// Real touch events on an emulated iPad Pro 11 (Playwright). Optional: needs `npm i playwright` and a Chromium; set CHROMIUM_PATH if it is not at the default.
// Run: node tests/ipad-touch.js
const { chromium, devices } = require("playwright"), path = require("path");
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const ctx = await b.newContext({ ...devices["iPad Pro 11 landscape"] }); const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("file://" + path.resolve(__dirname, "../game.html") + "?sandbox&new=1"); await p.waitForTimeout(500); await p.evaluate(() => G.closeDlg());
  const res = [];
  const pos = () => p.evaluate(() => [Math.round(G.pl.x), Math.round(G.pl.y)]);
  const box = sel => p.locator(sel).boundingBox();
  // 1. hold the right arrow with a real touch
  let a = await pos(); const r = await box('#dpad [data-d="right"]');
  await p.touchscreen.tap(r.x + 5, r.y + 5); // a tap is too short to move much; check the hold with dispatched pointer events below
  await p.evaluate(() => { const b = document.querySelector('#dpad [data-d="right"]'); b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 7 })); });
  await p.waitForTimeout(600); const mid = await pos();
  await p.evaluate(() => { const b = document.querySelector('#dpad [data-d="right"]'); b.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 7 })); });
  await p.waitForTimeout(200); const end = await pos(); await p.waitForTimeout(300); const still = await pos();
  res.push(["hold right walks, release stops", mid[0] > a[0] + 10 && end[0] >= mid[0] && still[0] === end[0], [a, mid, end, still]]);
  // 2. tap on the map to walk
  const c = await box("#c"); const sc = c.width / 320, cam = await p.evaluate(() => 0);
  const before = await pos(); await p.touchscreen.tap(c.x + 60 * sc, c.y + 150 * sc); await p.waitForTimeout(1200); const after = await pos();
  res.push(["tapping the map walks there", Math.abs(after[0] - before[0]) + Math.abs(after[1] - before[1]) > 20, [before, after]]);
  // 3. Act button talks / acts: walk next to the crate, tap Act
  await p.evaluate(() => { G.pl.x = 9 * 16 + 8; G.pl.y = 8 * 16 + 12; G.pl.dir = "up"; G.pl.target = null; for (const k in G.keys) G.keys[k] = false; }); await p.waitForTimeout(150);
  const lab = await p.locator("#act").textContent(); const act = await box("#act"); await p.touchscreen.tap(act.x + 20, act.y + 20); await p.waitForTimeout(150);
  res.push(["Act opens the shipping crate", await p.evaluate(() => document.getElementById("dlg").style.display === "flex" && /shipping crate/.test(document.getElementById("dlg").textContent)), lab]);
  res.push(["pad and Act hide while a dialog is open", await p.evaluate(() => getComputedStyle(document.getElementById("tc")).display === "none")]);
  // 4. dialog buttons are big enough to tap
  const bh = await p.evaluate(() => Math.min(...[...document.querySelectorAll("#dlg button")].map(x => x.getBoundingClientRect().height)));
  res.push(["dialog buttons are at least 44px tall", bh >= 44, bh]);
  await p.evaluate(() => G.closeDlg());
  // 5. number input: sign button + keyboard docking
  await p.evaluate(() => { window.__done = null; G.ask("maud", "Type minus twelve", -12, ["hint"], null, 0, null, "work", "how").then(v => window.__done = v); }); await p.waitForTimeout(100);
  const inp = await box("#num"); await p.touchscreen.tap(inp.x + 10, inp.y + 10); await p.waitForTimeout(100);
  await p.keyboard.type("12"); const sg = await box("#dlg .sgn"); await p.touchscreen.tap(sg.x + 10, sg.y + 10); await p.waitForTimeout(80);
  res.push(["± makes the number negative", (await p.inputValue("#num")) === "-12", await p.inputValue("#num")]);
  res.push(["dialog docks to the top while typing", await p.evaluate(() => document.getElementById("dlg").classList.contains("kb"))]);
  const chk = await p.locator("#dlg button", { hasText: "Check" }).boundingBox(); await p.touchscreen.tap(chk.x + 10, chk.y + 10); await p.waitForTimeout(150);
  res.push(["-12 is accepted as the answer", await p.evaluate(() => window.__done !== null), await p.evaluate(() => window.__done)]);
  // 6. HUD number explains on tap, Menu opens without Esc
  await p.evaluate(() => { G.closeDlg(); G.hidePanel(); }); const cash = await box("#h-cash"); await p.touchscreen.tap(cash.x + 10, cash.y + 10); await p.waitForTimeout(150);
  res.push(["tapping Cash explains it", await p.evaluate(() => /Money in hand/.test(document.getElementById("panelBody").textContent))]); await p.evaluate(() => G.hidePanel());
  const mb = await box("#menubtn"); await p.touchscreen.tap(mb.x + 10, mb.y + 10); await p.waitForTimeout(150);
  res.push(["Menu button opens the pause menu", await p.evaluate(() => !!document.getElementById("pause"))]);
  for (const [n, ok, d] of res) console.log(ok ? "ok  " : "FAIL", n, d !== undefined ? JSON.stringify(d) : "");
  console.log("errors", errs); await b.close(); process.exit(res.every(r => r[1]) && !errs.length ? 0 : 1);
})();
