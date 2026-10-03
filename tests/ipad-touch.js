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
  const a0 = await pos(); res.push(["no on-screen arrows or Act button by default", await p.evaluate(() => !document.getElementById("dpad") && !document.getElementById("act")), a0]);
  // 2. tap on the map to walk
  const c = await box("#c"); const sc = c.width / (await p.evaluate(() => document.getElementById("c").width));
  const before = await pos(); await p.evaluate(() => { G.closeDlg(); }); await p.touchscreen.tap(c.x + 60 * sc, c.y + 150 * sc); await p.waitForTimeout(1200); const after = await pos();
  res.push(["tapping the map walks there", Math.abs(after[0] - before[0]) + Math.abs(after[1] - before[1]) > 20, [before, after]]);
  // 3. tap the notice board (beside the road) and the crate: walk up and use them
  await p.evaluate(() => { G.pl.x = 14 * 16 + 8; G.pl.y = 8 * 16 + 12; G.pl.target = null; for (const k in G.keys) G.keys[k] = false; }); await p.waitForTimeout(150);
  const cc = await box("#c"), scale = cc.width / (await p.evaluate(() => document.getElementById("c").width)), camx = await p.evaluate(() => G.cam.x), camy = await p.evaluate(() => G.cam.y);
  const bd = await p.evaluate(() => G.world.BOARD); await p.touchscreen.tap(cc.x + (bd.x * 16 + 8 - camx) * scale, cc.y + (bd.y * 16 + 8 - camy) * scale); await p.waitForTimeout(1800);
  res.push(["tapping the notice board walks to it and opens it", await p.evaluate(() => /Village notices/.test(document.getElementById("dlg").textContent))]);
  // 4. dialog buttons are big enough to tap
  const bh = await p.evaluate(() => Math.min(...[...document.querySelectorAll("#dlg button")].map(x => x.getBoundingClientRect().height)));
  res.push(["dialog buttons are at least 44px tall", bh >= 44, bh]);
  await p.evaluate(() => G.closeDlg());
  // 5. number input: sign button + keyboard docking
  await p.evaluate(() => { window.__done = null; G.ask("maud", "Type minus twelve", -12, ["hint"], null, 0, null, "work", "how").then(v => window.__done = v); }); await p.waitForTimeout(100);
  const k = async key => { const bb = await box(`#dlg .np button[data-k="${key}"]`); await p.touchscreen.tap(bb.x + 10, bb.y + 10); await p.waitForTimeout(60); };
  await k("1"); await k("2"); await k("−");
  res.push(["the number pad types -12 with real taps", (await p.inputValue("#num")) === "-12", await p.inputValue("#num")]);
  const chk = await box("#dlg .np .ok"); await p.touchscreen.tap(chk.x + 10, chk.y + 10); await p.waitForTimeout(150);
  res.push(["-12 is accepted as the answer", await p.evaluate(() => window.__done !== null), await p.evaluate(() => window.__done)]);
  // 6. HUD number explains on tap, Menu opens without Esc
  await p.evaluate(() => { G.closeDlg(); G.hidePanel(); }); const cash = await box("#h-cash"); await p.touchscreen.tap(cash.x + 10, cash.y + 10); await p.waitForTimeout(150);
  res.push(["tapping Cash explains it", await p.evaluate(() => /Money in hand/.test(document.getElementById("panelBody").textContent))]); await p.evaluate(() => G.hidePanel());
  const mb = await box("#menubtn"); await p.touchscreen.tap(mb.x + 10, mb.y + 10); await p.waitForTimeout(150);
  res.push(["Menu button opens the pause menu", await p.evaluate(() => !!document.getElementById("pause"))]);
  for (const [n, ok, d] of res) console.log(ok ? "ok  " : "FAIL", n, d !== undefined ? JSON.stringify(d) : "");
  console.log("errors", errs); await b.close(); process.exit(res.every(r => r[1]) && !errs.length ? 0 : 1);
})();
