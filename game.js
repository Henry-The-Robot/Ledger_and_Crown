// Spring at Thornfield — the playable world. Two places (STORY-year-one.md, "The Desk and the Road"):
// the Road (walk, farm, deal face to face; the screen shows only Cash and the day) and the Desk (inside the house:
// ledger, cash-forecast board, statements, notebook, the week's plan; the full numbers live here). Every sale is a
// negotiation scene: open, counter, leverage, walk away (2-4 rounds). The story (story.js) drives chapters 1-9 on top.
// All accounting lives in engine.js/books.js. Game-feel exemplar: Stardew Valley.
(function () {
  const S = Spring, B = Books, TR = Transcript, A = Art, T = 16, MW = 50, MH = 26, VW = 320, VH = 200;
  const $ = id => document.getElementById(id), cv = $("c"), ctx = cv.getContext("2d");
  const q = new URLSearchParams(location.search), SAVE = "lc_spring_save_v2";
  let s, calm = 0, frame = 0, closing = null, atDesk = false, storyOn = !q.has("sandbox"), fairDay = {}, fairSeen = {};
  A.build();
  // ---------- the map ----------
  const ground = [], solid = new Set(), props = [], key = (x, y) => x + "," + y;
  const BUILD = [
    { id: "house", x: 3, y: 2, w: 6, h: 5, roof: "#4f6fa8", roofD: "#3d5a8c", wall: "#ecd6a8", wallD: "#cdb07e", chimney: true },
    { id: "bakery", x: 24, y: 2, w: 5, h: 5, roof: "#c9674a", roofD: "#a44f36", wall: "#f3e2c0", wallD: "#d9c19a", sign: "bread", who: "ashby", chimney: true },
    { id: "mill", x: 31, y: 1, w: 6, h: 6, roof: "#8a6a4a", roofD: "#6d5238", wall: "#e9dcc3", wallD: "#cbbb9d", sign: "sack", who: "hobb" },
    { id: "seeds", x: 39, y: 2, w: 5, h: 5, roof: "#4f8a4a", roofD: "#3b6c37", wall: "#f0dfb5", wallD: "#d3bf92", sign: "seed", who: "tomas" },
    { id: "bank", x: 27, y: 13, w: 5, h: 5, roof: "#5d4a7a", roofD: "#473862", wall: "#e2d8c8", wallD: "#c4b8a4", sign: "coin", who: "ezra" },
    { id: "hall", x: 37, y: 13, w: 6, h: 5, roof: "#9b2335", roofD: "#7a1b2a", wall: "#efe3cc", wallD: "#d2c3a8", sign: "scroll", who: "maud", chimney: true },
  ];
  BUILD.forEach(b => { b.img = A.building(b.w, b.h, Object.assign({}, b, { sign: b.sign && A.SIGNS[b.sign] })); b.door = { x: b.x + Math.floor(b.w / 2), y: b.y + b.h - 1 }; });
  const NPC = {}; BUILD.filter(b => b.who).forEach(b => NPC[b.who] = { who: b.who, x: b.door.x + 1, y: b.door.y + 1, dir: "down" });
  NPC.duke = { who: "duke", x: 36, y: 10, dir: "left" };
  // the market fair: two stalls in the lower square (other buyers, other prices: first market research)
  // Stalls sit clear of every villager's spot (Ezra stands below the bank door at 30,18; the old 31,20 stall hid him).
  const FAIR = { mira: { x: 25, y: 20, sacks: 6, walk: 6, terms: 0, color: "#d9a83a", line: "Six sacks, Cash, today. I buy cheap and I buy now." },
    abbey: { x: 43, y: 20, sacks: 9, walk: 8, terms: 7, color: "#6a8fc4", line: "The Abbey pays well, a week after delivery. Nine sacks." } };
  Object.keys(FAIR).forEach(k => NPC[k] = { who: k, x: FAIR[k].x, y: FAIR[k].y, dir: "down" });
  const CRATE = { x: 9, y: 7 }, WELL = { x: 34, y: 9 }, POND = [16, 16, 19, 19];
  (function buildMap() {
    let r = 5; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) ground[y * MW + x] = rnd() < .05 ? "flower" + Math.floor(rnd() * 3) : "grass" + Math.floor(rnd() * 4);
    const set = (x0, y0, x1, y1, k) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ground[y * MW + x] = k; };
    set(6, 7, 6, 8, "path"); set(6, 8, 23, 8, "path"); set(9, 8, 9, 9, "path"); set(22, 7, 47, 11, "cobble"); set(33, 12, 35, 17, "cobble"); set(24, 18, 45, 21, "cobble");
    set(POND[0], POND[1], POND[2], POND[3], "water");
    for (let y = POND[1]; y <= POND[3]; y++) for (let x = POND[0]; x <= POND[2]; x++) solid.add(key(x, y));
    for (let x = 4; x <= 14; x++) { if (x !== 9) fence(x, 9); fence(x, 14); } for (let y = 10; y <= 13; y++) { fence(4, y); fence(14, y); }
    function fence(x, y) { ground[y * MW + x] = "fence"; solid.add(key(x, y)); }
    BUILD.forEach(b => { for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) solid.add(key(x, y)); props.push({ y: b.y + b.h, draw: () => blit(b.img, b.x * T, b.y * T - 4) }); });
    const tree = (x, y, v) => { if (solid.has(key(x, y))) return; solid.add(key(x, y)); props.push({ y: y + 1, draw: () => blit(A.tree[v % 3], x * T - 8, y * T - 28) }); };
    for (let x = 0; x < MW; x += 2) { tree(x, 0, x); tree(x + 1, MH - 1, x + 1); } for (let y = 1; y < MH - 1; y += 2) { tree(0, y, y); tree(MW - 1, y + 1, y); }
    [[15, 3], [18, 4], [20, 2], [12, 3], [2, 12], [2, 17], [8, 19], [12, 21], [22, 16], [21, 22], [26, 23], [46, 16], [44, 23], [30, 23], [16, 11], [19, 13], [47, 6], [2, 22], [5, 23]].forEach(([x, y], i) => tree(x, y, i));
    [[10, 2], [21, 12], [23, 13], [36, 23], [40, 23], [15, 21], [45, 13], [11, 17], [29, 10]].forEach(([x, y]) => { solid.add(key(x, y)); props.push({ y: y + 1, draw: () => blit(A.bush, x * T, y * T) }); });
    solid.add(key(CRATE.x, CRATE.y)); props.push({ y: CRATE.y + 1, draw: () => blit(A.crate, CRATE.x * T, CRATE.y * T) });
    solid.add(key(WELL.x, WELL.y)); props.push({ y: WELL.y + 1, draw: drawWell });
    Object.values(FAIR).forEach(f => { solid.add(key(f.x - 1, f.y - 1)); solid.add(key(f.x, f.y - 1)); solid.add(key(f.x + 1, f.y - 1)); props.push({ y: f.y, draw: () => drawStall(f) }); });
  })();
  const plotAt = (x, y) => s.plots.find(p => p.x === x && p.y === y);
  const npcAt = (x, y) => Object.values(NPC).find(n => n.x === x && n.y === y && npcHere(n));
  const npcHere = n => n.who !== "duke" || s.offers.some(o => o.who === "duke") || s.orders.some(o => o.who === "duke" && o.status === "open");
  const buildingAt = (x, y) => BUILD.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  const blocked = (x, y) => x < 0 || y < 0 || x >= MW || y >= MH || solid.has(key(x, y)) || !!npcAt(x, y);
  // ---------- player & input ----------
  const pl = { x: 6 * T + 8, y: 8 * T + 12, dir: "down", step: 0, moving: false, target: null };
  const keys = {}; const DIRS = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
  const KEYMAP = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
  const panelOpen = () => $("panel").style.display !== "none";
  addEventListener("keydown", e => {
    // Esc: close the pause menu, or a reference panel (Ledger, notebook, transcript, plan); otherwise open the pause menu.
    // Task panels (forecast to fill, journal page, the close) aren't closed by Esc: closing them would strand the story.
    if (e.code === "Escape") { if ($("pause")) $("pause").remove(); else if (panelOpen() && panelKind && !panelKind.locked && CLOSABLE.has(panelKind.k)) hidePanel(); else pauseMenu(); e.preventDefault(); return; }
    if ($("pause")) return;
    if (panelOpen()) return;
    if (dlgOpen()) { if (e.target.tagName === "INPUT") { if (e.key === "Enter") $("dlg").querySelector("button").click(); return; }
      const n = +e.key; if (n >= 1 && n <= 9) { const b = $("dlg").querySelectorAll("button")[n - 1]; if (b && !b.disabled) b.click(); } e.preventDefault(); return; }
    if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; pl.target = null; e.preventDefault(); }
    if (e.code === "KeyE" || e.code === "Space") { interactTile(facing().x, facing().y); e.preventDefault(); }
    if (e.code === "KeyN") notebook(); if (e.code === "KeyT") transcript();
    if (e.code === "KeyL" || e.code === "KeyF") toast("Your books are on the desk at home (E at the house door).");
  });
  addEventListener("keyup", e => { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });
  cv.addEventListener("click", e => { // click / tap to walk; clicking something walks up to it and uses it
    if (dlgOpen()) return; const r = cv.getBoundingClientRect(), sc = r.width / VW;
    const wx = (e.clientX - r.left) / sc + cam.x, wy = (e.clientY - r.top) / sc + cam.y; pl.target = { tx: Math.floor(wx / T), ty: Math.floor(wy / T) };
  });
  function facing() { const [dx, dy] = DIRS[pl.dir]; return { x: Math.floor((pl.x + dx * 12) / T), y: Math.floor((pl.y - 4 + dy * 12) / T) }; }
  function hitFree(x, y) { return [[-5, -5], [4, -5], [-5, 0], [4, 0]].every(([a, b]) => !blocked(Math.floor((x + a) / T), Math.floor((y + b) / T))); }
  function move(dt) {
    let dx = 0, dy = 0;
    if (keys.left) dx--; if (keys.right) dx++; if (keys.up) dy--; if (keys.down) dy++;
    if (pl.target && !dx && !dy) {
      const t = pl.target, cx = t.tx * T + 8, cy = t.ty * T + 12, ddx = cx - pl.x, ddy = cy - pl.y, near = Math.abs(ddx) < T * 1.2 && Math.abs(ddy) < T * 1.2;
      if (blocked(t.tx, t.ty) || plotAt(t.tx, t.ty)) {
        if (near && (Math.abs(ddx) < 3 || Math.abs(ddy) < 3 || plotAt(t.tx, t.ty))) { pl.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? "right" : "left") : (ddy > 0 ? "down" : "up"); pl.target = null; interactTile(t.tx, t.ty); return; }
      } else if (Math.abs(ddx) < 2 && Math.abs(ddy) < 2) { pl.target = null; return; }
      if (Math.abs(ddx) > 1.5) dx = Math.sign(ddx); else if (Math.abs(ddy) > 1.5) dy = Math.sign(ddy);
    }
    pl.moving = !!(dx || dy); if (!pl.moving) return;
    pl.dir = dx ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    const sp = 72 * dt, nx = pl.x + dx * sp, ny = pl.y + dy * sp; let moved = false;
    if (dx && hitFree(nx, pl.y)) { pl.x = nx; moved = true; } if (dy && hitFree(pl.x, ny)) { pl.y = ny; moved = true; }
    if (!moved && pl.target) {
      const t = pl.target, ddy = t.ty * T + 12 - pl.y, ddx = t.tx * T + 8 - pl.x;
      if (dx && Math.abs(ddy) > 1 && hitFree(pl.x, pl.y + Math.sign(ddy) * sp)) pl.y += Math.sign(ddy) * sp;
      else if (dy && Math.abs(ddx) > 1 && hitFree(pl.x + Math.sign(ddx) * sp, pl.y)) pl.x += Math.sign(ddx) * sp; else pl.target = null;
    }
    pl.step += dt * 8;
  }
  // ---------- interaction ----------
  function interactTile(x, y) {
    if (s.over) return closeBooks();
    if (storyOn && Story.busy) return;
    const n = npcAt(x, y); if (n) { n.dir = ({ up: "down", down: "up", left: "right", right: "left" })[pl.dir]; return talk(n.who); }
    if (x === CRATE.x && y === CRATE.y) return crate();
    const b = buildingAt(x, y); if (b) return b.id === "house" ? desk() : talk(b.who);
    const p = plotAt(x, y);
    if (p) { const r = act(() => S.act(s, p.i));
      if (r.ok) { floatAt(x, y, { till: "Tilled", plant: "Planted", water: "Watered", harvest: "+3 sacks", sprinkler: "Sprinkler set" }[r.msg] || "", r.msg === "harvest" ? "#7a5a10" : "#2a4a7a"); story("plant"); }
      else if (r.msg) say(null, r.msg); return; }
    if (x === WELL.x && y === WELL.y) say(null, "The town well. Cold, clear water.");
  }
  function act(fn) { // run an engine action, then float the Cash change and feed the transcript
    const c0 = s.bal.cash, r = fn(); drainUses(); hud();
    if (s.bal.cash !== c0) floatHud("cash", s.bal.cash - c0);
    return r;
  }
  const story = (evt, info) => { if (storyOn) Story.after(evt, info); };
  let usePtr = 0;
  function drainUses() { while (usePtr < s.uses.length) { const u = s.uses[usePtr++], ch = TR.use(u.id, u.well); if (ch) toast(ch === "mastered" ? `Mastered: ${TR.name(u.id)} ★` : `Transcript: ${TR.name(u.id)}`); } }
  // ---------- dialogue: one box, Promise-based; choices, a number field, highlights ----------
  const dlgOpen = () => $("dlg").style.display === "flex";
  function dlg(o) { // o: {who, text, choices:[label|{label,disabled}], input, spot} -> Promise<{i, v}>
    return new Promise(res => {
      const d = $("dlg"), who = o.who, nm = who ? S.NAMES[who] || who : "", ht = who && s.trust[who] != null ? hearts(s.trust[who]) : "";
      spot(o.spot);
      d.innerHTML = `${who && A.people[who] ? "<canvas width=16 height=16></canvas>" : ""}<div style="flex:1"><div><span class="nm">${cap(nm)}</span><span class="ht">${ht}</span></div><div class="tx">${o.text}</div>` +
        (o.input ? `<div class="in"><input id="num" type="text" inputmode="decimal" placeholder="${o.input}" autocomplete="off"></div>` : "") + `<div class="ch"></div></div>`;
      if (who && A.people[who]) d.querySelector("canvas").getContext("2d").drawImage(A.people[who].down[0], 0, 0);
      (o.choices || ["Next"]).forEach((c, i) => { const b = document.createElement("button"), lab = c.label || c; b.innerHTML = `<kbd>${i + 1}</kbd>${lab}`; b.disabled = !!c.disabled;
        b.onclick = () => { const v = o.input ? parseFloat(($("num").value || "").replace(/[^0-9.\-]/g, "")) : null; d.style.display = "none"; spot(null); res({ i, v }); };
        d.querySelector(".ch").appendChild(b); });
      d.style.display = "flex"; keys.up = keys.down = keys.left = keys.right = false; if (o.input) setTimeout(() => $("num") && $("num").focus(), 30);
    });
  }
  function say(who, text, choices) { // menu form for the sandbox: choices [[label, fn, disabled]]
    const cs = choices || [["Close", null]];
    dlg({ who, text, choices: cs.map(c => ({ label: c[0], disabled: c[2] })) }).then(r => cs[r.i][1] && cs[r.i][1]());
  }
  async function sayP(who, text, choices, sp) { return (await dlg({ who, text, choices, spot: sp })).i; }
  // The Try beat: type the number; a wrong answer gets a hint, never the answer or the formula.
  // docs: [{label, open}] buttons beside Check that open the player's own documents (forecast, ledger, notebook)
  // so they can find the numbers themselves (Kyle, 2026-10-02: guide me to where the numbers are; don't do the math).
  // Never stuck (Kyle, 2026-10-02): after 2 misses a "Walk me through it" button appears; Maud shows the full working
  // with your numbers, then you enter it yourself. A walked or skipped lesson isn't marked mastered (window.__walked).
  // The pause menu's "Report a problem" can also skip a question (askSkip), for real glitches; it's logged.
  let askSkip = null;
  // how: the method, taught on a different example, so the player still works out their own number (always available).
  async function ask(who, text, answer, hints, sp, tol, docs, work, how) {
    let tries = 0, extra = "", walked = false; window.__want = answer; docs = (docs || []).slice();
    // Every question can open your books. A question that brings its own forecast (e.g. a what-if) keeps it;
    // the default hides Closing Cash so it never gives the answer away.
    if (!docs.some(d => /Ledger/.test(d.label))) docs.push({ label: "Open the Ledger", open: ledger });
    if (!docs.some(d => /forecast/i.test(d.label))) docs.push({ label: "Open the cash forecast", open: () => board({ title: "Cash forecast, next two weeks (In and Out)", n: 14, noClose: true, fill: [] }) });
    let skipped = false; askSkip = () => { skipped = true; $("dlg").style.display = "none"; spot(null); resume && resume({ i: -1 }); };
    let resume = null;
    for (;;) {
      const acts = [["check"], ...docs.map(d => ["doc", d]), ...(how ? [["how"]] : []), ...(tries >= 2 && !walked ? [["walk"]] : [])];
      const labels = acts.map(a => a[0] === "check" ? "Check" : a[0] === "doc" ? a[1].label : a[0] === "how" ? "Explain how" : "Walk me through it");
      const r = await new Promise(res => { resume = res; dlg({ who, text: text + extra, input: "type a number", choices: labels, spot: sp }).then(res); });
      if (skipped) { window.__want = undefined; window.__walked = true; askSkip = null; return answer; }
      const a = acts[r.i] || ["check"];
      if (a[0] === "how") { extra = `<br><span class="hintline"><b>How to work it out:</b> ${how}</span>`; continue; }
      if (a[0] === "walk") { walked = true; window.__walked = true; extra = `<br><span class="hintline"><b>Here's my working:</b> ${work || hints.join(" ") + ` That gives ${answer}.`}<br>Now you enter it.</span>`; continue; }
      if (a[0] === "doc") { await openDoc(a[1].open); continue; }
      if (r.v != null && !isNaN(r.v) && Math.abs(r.v - answer) <= (tol || 0)) { window.__want = undefined; askSkip = null; toast(walked ? "Right. We'll come back to this one." : "Right."); return r.v; }
      tries++; if (!walked) extra = `<br><i class="hintline">${isNaN(r.v) || r.v == null ? "Type a number." : `Not ${r.v}. `}${hints[Math.min(tries - 1, hints.length - 1)]}</i>`;
    }
  }
  // ---------- feedback: no email address in the game; copy a text block the player pastes into their own email ----------
  function feedbackText() {
    let reports = [];
    try { reports = JSON.parse(localStorage.getItem("lc_bug_reports") || "[]").slice(-5); } catch (e) {}
    const lines = [
      "Spring at Thornfield — feedback",
      `Day: ${s ? s.day : "?"}`,
      `Chapter/stage: ${storyOn && typeof Story !== "undefined" ? Story.state.stage : "sandbox"}`,
      `Recent problem reports (${reports.length}):`,
      ...(reports.length ? reports.map(r => `  - ${r.at} · day ${r.day} · ${r.stage} · "${(r.question || "").slice(0, 80)}" (expected ${r.expected})`) : ["  (none)"]),
      `Browser: ${navigator.userAgent}`,
      "",
      "Paste this into your email to Kyle.",
    ];
    return lines.join("\n");
  }
  function copyFeedback() {
    const text = feedbackText();
    const done = ok => toast(ok ? "Feedback details copied." : "Couldn't copy — select and copy the text shown.");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => done(true), () => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    try {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy"); ta.remove(); done(ok);
    } catch (e) { done(false); }
  }
  // ---------- pause menu: always reachable (☰ button or Esc), so a glitch never traps the player ----------
  function pauseMenu() {
    if ($("pause")) return $("pause").remove();
    const p = document.createElement("div"); p.id = "pause"; p.className = "overlay"; p.style.cssText = "display:flex;z-index:200";
    p.innerHTML = `<div class="modal" style="max-width:420px"><h1>Paused</h1>
      <p><button class="btn gold" id="pz-resume" style="width:100%">Resume</button></p>
      <p><button class="btn alt" id="pz-restart" style="width:100%">Restart today (from this morning's save)</button></p>
      <p><button class="btn alt" id="pz-map" style="width:100%">Save and quit</button></p>
      <p><button class="btn alt" id="pz-feedback" style="width:100%">Copy feedback details</button></p>
      ${askSkip ? `<p><button class="btn alt" id="pz-skip" style="width:100%">Report a problem and skip this question</button></p><p class="hint">Use this only if the game seems broken. The lesson won't count as mastered, and Maud will bring it up again later. Copies feedback details too, so you can paste them to Kyle.</p>` : ""}
      <p class="hint">Today's progress since the morning save is lost if you restart or leave.</p></div>`;
    document.body.appendChild(p);
    p.onclick = e => { if (e.target === p) p.remove(); };
    $("pz-resume").onclick = () => p.remove();
    $("pz-restart").onclick = () => location.reload();
    $("pz-map").onclick = () => { save(); location.href = "index.html"; };
    $("pz-feedback").onclick = () => copyFeedback();
    if ($("pz-skip")) $("pz-skip").onclick = () => {
      try { const log = JSON.parse(localStorage.getItem("lc_bug_reports") || "[]"); log.push({ at: new Date().toISOString(), day: s.day, stage: storyOn ? Story.state.stage : "sandbox", question: ($("dlg").querySelector(".tx") || {}).textContent, expected: window.__want }); localStorage.setItem("lc_bug_reports", JSON.stringify(log)); } catch (e) {}
      copyFeedback();
      p.remove(); const f = askSkip; f && f(); toast("Reported and copied. Skipped this question.");
    };
  }
  // Stall detector: the story is waiting but nothing is on screen for 4 s -> point the player to the menu.
  setInterval(() => {
    const idle = storyOn && Story.busy && !dlgOpen() && !panelOpen() && !$("pause");
    stall.t = idle ? (stall.t || 0) + 1 : 0; if (stall.t === 4) toast("Something seems stuck. Open the menu (☰, top right) to restart the day.");
  }, 1000);
  const stall = {};
  (function () { const pb = document.createElement("button"); pb.id = "menubtn"; pb.className = "btn alt"; pb.textContent = "☰ Menu";
    pb.style.cssText = "position:fixed;top:8px;right:8px;z-index:150"; pb.onclick = pauseMenu; document.body.appendChild(pb); })();
  function spot(ids) { document.querySelectorAll(".spot").forEach(e => e.classList.remove("spot")); (ids || []).forEach(id => { const e = $(id); if (e) e.classList.add("spot"); }); }
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const hearts = t => "♥".repeat(Math.round(t / 2)) + "♡".repeat(5 - Math.round(t / 2));
  // ---------- negotiation: open, counter, leverage, walk away (2-4 rounds) ----------
  // Each buyer has a hidden walk-away price; good history (hearts) raises it a little. Asking far above it sours the mood.
  async function haggle(o, cfg) {
    let theirs = cfg.open, walk = cfg.walk + (s.trust[o.who] >= 7 ? 1 : 0), used = {}, line = cfg.line, round = 0;
    const fairBest = Math.max(0, ...Object.keys(fairSeen).filter(k => k !== o.who).map(k => fairSeen[k]));
    while (round < 4) {
      const lev = [];
      if (fairBest > theirs && !used.fair) lev.push("fair"); if (s.trust[o.who] >= 6 && !used.rec) lev.push("rec");
      const labels = ["Ask my price", `Accept ${theirs} a sack`].concat(lev.map(l => l === "fair" ? `"The fair pays ${fairBest}"` : `"I always deliver on time"`), ["Walk away"]);
      const r = await dlg({ who: o.who, text: `${line}<br><b>Their offer: ${theirs} a sack</b> × ${o.sacks} sacks${o.terms ? `, paid ${o.terms} days after delivery` : ", Cash"}.`, input: "your price per sack", choices: labels });
      const pick = labels[r.i];
      if (pick === "Walk away") { toast("You walked away."); return null; }
      if (pick.startsWith("Accept")) return close(theirs);
      if (pick.startsWith('"The fair')) { used.fair = 1; walk = Math.max(walk, Math.min(fairBest, walk + 1)); theirs = Math.min(walk, Math.max(theirs, fairBest)); line = `Hm. The fair, is it. ${theirs}, then.`; continue; }
      if (pick.startsWith('"I always')) { used.rec = 1; walk += 1; line = "True enough. You've never let me down."; continue; }
      const p = r.v; round++;
      if (p == null || isNaN(p) || p <= 0) { line = "Say a number, dear."; continue; }
      if (p < 4 && storyOn) { const k = await sayP("maud", `${p} is under your floor: each sack cost you 4. Sure?`, ["Think again", "Yes, sell below cost"]); if (k === 0) continue; }
      if (p <= theirs) return close(theirs);
      if (p <= walk) { line = "Done."; return close(p); }
      if (p > walk + 2) { s.trust[o.who] = Math.max(0, s.trust[o.who] - 1); line = `${p}? That's an insult. ${theirs} is my offer.`; continue; }
      theirs = Math.min(walk, Math.ceil((theirs + p) / 2)); line = round >= 3 ? `My last word: ${theirs}.` : `Too dear. Meet me at ${theirs}.`;
    }
    const k = await sayP(o.who, `${theirs}, take it or leave it.`, [`Accept ${theirs}`, "Walk away"]); return k === 0 ? close(theirs) : null;
    function close(price) { S.setPrice(s, o.id, price); act(() => S.accept(s, o.id)); floatAt(pl.x / T, pl.y / T - 1, `Deal: ${price} a sack`, "#2a5a2a"); return { price }; }
  }
  // ---------- villagers ----------
  async function talk(who) {
    if (storyOn && Story.onTalk(who)) return;
    if (FAIR[who]) return fairDeal(who);
    if (who === "maud") return maud(); if (who === "ezra") return ezra(); if (who === "tomas") return tomas();
    const o = s.offers.find(x => x.who === who), open = S.openOrders(s).find(x => x.who === who);
    if (o) { await haggle(o, { open: o.price - 1, walk: o.price, line: who === "duke" ? "His Grace makes one offer." : who === "ashby" ? "I need grain for the ovens, dear." : "Grain for the wheel. Name your price." }); return; }
    if (open) return say(who, `Still waiting on ${open.sacks} sacks, due day ${open.due}${open.late ? " (late!)" : ""}.<br>Put them in your shipping crate on the farm.`);
    const idle = { ashby: ["Good grain makes good bread. Come by in a day or two.", "The ovens are hot and the orders keep coming."], hobb: ["The wheel turns when there's grain. I'll have work soon.", "I pay on terms, but I always pay."], duke: ["His Grace is pleased."] }[who];
    say(who, idle[s.day % idle.length]);
  }
  async function fairDeal(who) { // the market fair: a different buyer, a different price; once a day each
    const f = FAIR[who]; fairSeen[who] = f.walk;
    if (fairDay[who] === s.day) return say(who, "I've bought my fill today. Come back tomorrow.");
    const n = Math.min(f.sacks, s.sacks); if (n < 3) return say(who, `${f.line}<br>Come back with grain. (I pay up to ${f.walk} a sack.)`);
    const o = S.addOffer(s, who, n, f.walk - 1, f.terms, 0, 1);
    const deal = await haggle(o, { open: f.walk - 1, walk: f.walk, line: f.line });
    if (!deal) { S.decline(s, o.id); return; }
    fairDay[who] = s.day; act(() => S.deliver(s, o.id)); story("deliver", o);
  }
  function tomas() {
    const t = S.terms(s), owed = -s.bal.ap, b0 = s.bills[0];
    const buy = (n, acct) => () => { const r = act(() => S.buySeeds(s, n, acct)); r.ok ? tomas() : say("tomas", r.msg); };
    say("tomas", `Seed is 12 a packet; a plot gives 3 sacks. ${t.apDays ? `On account: 14 days, or 2% off within 7.` : "Cash only for you now."}${owed ? `<br>You owe me ${owed}${b0 ? `, due day ${b0.due}` : ""}.` : ""}`, [
      ["Buy 3 for Cash (36)", buy(3, false), s.bal.cash < 36], ["Buy 9 for Cash (108)", buy(9, false), s.bal.cash < 108],
      [`Buy 9 on account`, buy(9, true), !t.apDays || owed + 108 > t.apLimit],
      ["Sprinkler: 80 Cash", () => { const r = act(() => S.buySprinkler(s)); say("tomas", r.ok ? "Waters the 8 plots around it every morning. Set it on an empty tilled plot." : r.msg); }, s.bal.cash < 80],
      [`Pay what I owe${s.bills.some(b => S.discNow(s, b)) ? " (2% off now)" : ""}`, () => { const r = act(() => S.payBills(s)); say("tomas", r.ok ? "Paid. I remember who pays on time." : r.msg); }, !owed], ["Leave", null]]);
  }
  function ezra() {
    const t = S.terms(s), owed = -s.bal.loan, room = t.loanLimit - owed, inv = s.invoices.slice().sort((a, b) => b.amount - a.amount)[0];
    const go = fn => () => { const r = act(fn); r.ok ? ezra() : say("ezra", r.msg); };
    const opts = [["Borrow 50", go(() => S.borrow(s, 50)), room < 50], ["Borrow 100", go(() => S.borrow(s, 100)), room < 100], ["Repay 50", go(() => S.repay(s, 50)), !owed || s.bal.cash < Math.min(50, owed)]];
    if (inv && (!storyOn || Story.state.ch >= 8)) opts.push([`Sell ${S.NAMES[inv.who]}'s invoice (${inv.amount}) for ${Math.round(inv.amount * .85)} today`, go(() => S.factor(s, inv.id))]);
    opts.push(["Leave", null]);
    say("ezra", `Your credit: ${hearts(s.trust.ezra)}. I lend up to ${t.loanLimit} at ${t.rateBp / 100}% a week. You owe me ${owed}.`, opts);
  }
  function maud() { const c = S.coach(s); say("maud", c ? c.text : "Nothing to add. The books look sound to me."); }
  function crate() {
    const opts = S.openOrders(s).sort((a, b) => a.due - b.due).map(o => [`Ship ${o.sacks} to ${S.NAMES[o.who]} (due day ${o.due})`,
      () => { const r = act(() => S.deliver(s, o.id)); if (r.ok) { floatAt(CRATE.x, CRATE.y - 1, `Sold: ${o.value}`, "#2a5a2a"); story("deliver", o); } else say(null, r.msg); }, s.sacks < o.sacks]);
    opts.push(["Close", null]);
    say(null, `The shipping crate: the carter takes it today. Barn: ${s.sacks} sacks. Open orders need ${S.committed(s)}.${opts.length === 1 ? "<br>No orders yet: agree one in town first." : ""}`, opts);
  }
  // ---------- the Desk (inside the house) ----------
  function desk() {
    atDesk = true; hud();
    const c = S.coach(s);
    dlg({ who: null, text: `Your desk: Edric's ledger, the forecast board, Maud's notebook.${c && c.danger ? `<br><b>Maud's note:</b> ${c.text}` : ""}`,
      choices: [`Sleep (end day ${s.day})`, "Ledger", "Cash forecast", "The week's plan", "Notebook (N)", "Transcript (T)", "Back to the road"] })
      .then(r => { const f = [sleepNow, ledger, () => board({ title: "Cash forecast, next two weeks", show: 14, fill: [] }), plan, notebook, transcript, () => { atDesk = false; hud(); }][r.i]; f && f(); });
  }
  function plan() {
    const o = S.openOrders(s), need = S.committed(s) - s.sacks - S.sacksComing(s);
    showPanel("plan", `<h1>The week's plan <span class="hint">day ${s.day}</span></h1><ul>` +
      (o.map(x => `<li>Deliver ${x.sacks} sacks to ${S.NAMES[x.who]} by day ${x.due}: ${x.value}${x.terms ? `, paid ${x.terms} days later` : " Cash"}</li>`).join("") || "<li>No orders open. Visit town.</li>") +
      `<li>Sacks: ${s.sacks} in the barn, ${S.sacksComing(s)} growing. ${need > 0 ? `<b>Short ${need}: plant ${Math.ceil(need / 3)} more plots.</b>` : "Enough for every order."}</li>` +
      s.bills.map(b => `<li>Pay Tomas ${b.amount} by day ${b.due}${S.discNow(s, b) ? ` (or ${b.amount - b.disc} by day ${b.discBy})` : ""}</li>`).join("") +
      s.invoices.map(v => `<li>${S.NAMES[v.who]} pays you ${v.amount} on day ${v.due}</li>`).join("") +
      `<li>Wages and interest, day ${S.nextWeekEnd(s)}: ${S.weekBills(s)}</li></ul><button class="btn alt" id="pclose">Back</button>`);
    $("pclose").onclick = hidePanel;
  }
  // ---------- the forecast board (chapter 5 on): a two-week calendar of Cash ----------
  function board(o) { // o: {title, show (rows pre-filled), fill [row indexes the player types], maud, extra} -> Promise<{firstTry,total}>
    return new Promise(res => {
      // o.noClose: show only today's opening Cash plus the In and Out columns, so the player does the arithmetic.
      const rows = S.forecast(s, o.n || 14, o.extra), fill = new Set(o.fill || []), shown = o.noClose ? 1 : o.show == null ? 14 : o.show;
      const cell = (r, i) => o.noClose ? "" : fill.has(i) ? `<input class="fc" data-i="${i}" data-day="${r.day}" data-ans="${r.close}" data-prev="${r.open}" data-delta="${r.close - r.open}" inputmode="decimal">` : i < shown || !fill.size ? `<b class="${r.close < 0 ? "neg" : ""}">${r.close}</b>` : "";
      showPanel("board", `<h1>${o.title}</h1>${o.maud ? `<div class="maudline"><b>Maud:</b> ${o.maud}</div>` : ""}<table class="stm fcast"><tr><th>Day</th><th>Cash at start</th><th>In</th><th>Out</th><th>${o.noClose ? "" : "Closing Cash"}</th></tr>` +
        rows.map((r, i) => `<tr class="${r.cout || r.cin ? "ev" : ""}"><td>${r.day}${r.day % 7 === 0 ? " · wages" : ""}</td><td class="num">${i < shown && !fill.has(i) || i === 0 ? r.open : ""}</td><td class="num">${r.cin ? "+" + r.cin + (s.invoices.some(v => v.due === r.day) ? " " + s.invoices.filter(v => v.due === r.day).map(v => S.NAMES[v.who].split(" ")[0]).join(", ") : "") : ""}</td>` +
          `<td class="num">${r.cout ? "−" + r.cout + " " + [r.wages ? "wages+interest" : "", r.bills ? "Tomas" : "", r.fines ? "forfeit" : ""].filter(Boolean).join(", ") : ""}</td><td class="num">${cell(r, i)}</td></tr>`).join("") +
        `</table><div id="bfb" class="hint"></div><button class="btn gold" id="bok">${fill.size ? "Check" : "Done"}</button>`);
      let first = null;
      $("bok").onclick = () => {
        // Each cell is checked against the player's own previous closing Cash, so one slip is marked once, not on every later row.
        const ins = [...document.querySelectorAll("#panelBody input.fc")]; let right = 0, exact = 0, prevTyped = null, prevI = -9, firstBad = null;
        ins.forEach(x => { const i = +x.dataset.i, v = x.value === "" ? NaN : +x.value, base = prevI === i - 1 && !isNaN(prevTyped) ? prevTyped : +x.dataset.prev;
          const ok = v === base + +x.dataset.delta; x.classList.toggle("bad", !ok); x.classList.toggle("good", ok); if (ok) right++; if (v === +x.dataset.ans) exact++;
          if (!ok && !firstBad) firstBad = { day: x.dataset.day, base }; prevTyped = v; prevI = i; });
        if (first === null) first = right;
        if (exact === ins.length) { hidePanel(); res({ firstTry: first, total: ins.length }); }
        else if (firstBad) $("bfb").innerHTML = `<b>Maud:</b> Look at day ${firstBad.day}: start from ${firstBad.base}, the Cash above it, then add In and take off Out.`;
        else $("bfb").innerHTML = "<b>Maud:</b> Close. Check each day against the Cash above it.";
      };
    });
  }
  // ---------- Edric's journal pages and Maud's notebook ----------
  function page(text) { return new Promise(res => { showPanel("page", `<div class="journal"><div class="hint">A page from Uncle Edric's journal</div><p>${text}</p><p class="sig">— E.</p></div><button class="btn gold" id="pgok">Keep it</button>`); $("pgok").onclick = () => { hidePanel(); res(); }; }); }
  function notebook() {
    if (panelKind && panelKind.k === "notebook") return hidePanel(); const st = storyOn ? Story.state : { notebook: [], pages: [] };
    showPanel("notebook", `<h1>Maud's notebook <span class="hint">click Close, or press N or Esc</span></h1>` + (st.notebook.map(n => `<div class="nb"><b>${n.term}</b><div>${n.line}</div><div class="hint">Your example: ${n.example}</div></div>`).join("") || "<p class='hint'>Empty for now. Maud writes in it as you learn.</p>") +
      (st.pages.length ? `<h3>Edric's journal</h3>` + st.pages.slice().sort().map(i => `<p class="journal small">${Story.PAGES[i]}</p>`).join("") : ""));
  }
  function transcript() { if (panelKind && panelKind.k === "transcript") return hidePanel(); showPanel("transcript", TR.html() + `<p class="hint">Click Close, or press T or Esc.</p>`); }
  // ---------- the night ----------
  let fast = q.has("auto") || q.has("fast");
  function sleepNow() {
    atDesk = false; const n0 = s.log.length; act(() => S.sleep(s));
    const notes = s.log.slice(0, s.log.length - n0).reverse().map(l => l.t).slice(0, 4);
    if (s.over) return fast ? closeBooks() : night("The end of spring", notes, closeBooks);
    pl.x = 6 * T + 8; pl.y = 7 * T + 12; pl.dir = "down"; save();
    const morning = () => { morningBark(); story("morning"); };
    if (fast) return morning();
    night(`Day ${s.day} · ${S.rain(s.day) ? "Rain" : "Sunny"}`, notes, morning);
  }
  function night(title, notes, then) {
    const n = $("night"); n.innerHTML = `<h2>${title}</h2>` + notes.map(t => `<p>${t}</p>`).join(""); n.classList.add("on");
    setTimeout(() => { n.classList.remove("on"); then && then(); }, 1500 + notes.length * 500);
  }
  function morningBark() { // coaching fades: only real danger once the player is past chapter 5
    const c = S.coach(s); if (!c) { calm++; return; }
    const quiet = storyOn ? Story.state.ch >= 6 || Story.state.ch <= 4 : calm >= 4;
    if (!c.danger && quiet) return; calm = c.danger ? 0 : calm + 1;
    $("bark").innerHTML = `<b>Maud:</b> ${c.text}`; $("bark").style.display = "block"; clearTimeout(morningBark.t); morningBark.t = setTimeout(() => $("bark").style.display = "none", 9000);
  }
  // ---------- HUD: the Road shows Cash and the day; the Desk shows everything ----------
  function hud() {
    const b = S.balanceSheet(s.bal), wk = S.nextWeekEnd(s), due = S.weekBills(s) + S.billsDue(s, wk), wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(s.day - 1) % 7];
    document.body.classList.toggle("desk", atDesk);
    const box = (id, k, v, warn, deskOnly) => `<span class="wood${warn ? " warn" : ""}${deskOnly ? " deskonly" : ""}" id="h-${id}"><span class="k">${k}</span>${v}</span>`;
    $("hud").innerHTML = box("day", "Spring", `${s.day} · ${wd}${S.rain(s.day) ? " · rain" : ""}`) + box("cash", "Cash", b.cash, b.cash < due) +
      box("ni", "Net income (Ledger)", b.ni, false, 1) + box("ar", "Accounts receivable", b.ar, false, 1) + box("inv", "Inventory", b.inv, false, 1) + box("ap", "Accounts payable", b.ap, false, 1) +
      box("loan", "Loan payable", b.loan, false, 1) + box("crown", "Crown debt, Midwinter", b.crown, false, 1) + box("due", "Due by day " + wk, due, b.cash < due, 1) +
      `<div class="wood deskonly" id="coin">${coinBar(b)}</div>`;
    $("bar").innerHTML = `<div class="slot"><i>sacks</i><canvas width=16 height=16 data-i="sack"></canvas><b>${s.sacks}</b></div><div class="slot"><i>seed</i><canvas width=16 height=16 data-i="seed"></canvas><b>${s.seeds}</b></div>` +
      `<div class="slot"><i>sprinkler</i><canvas width=16 height=16 data-i="sprinkler"></canvas><b>${s.sprinklersHeld}</b></div><div class="slot keys"><button class="btn alt" style="font-size:11px;padding:2px 6px" onclick="G.notebook()">Notebook</button> <button class="btn alt" style="font-size:11px;padding:2px 6px" onclick="G.transcript()">Transcript</button><br>Desk at home: ledger, forecast</div>`;
    $("bar").querySelectorAll("canvas").forEach(c => c.getContext("2d").drawImage(c.dataset.i === "seed" ? A.crops[1] : A[c.dataset.i], 0, 0));
  }
  function coinBar(b) { // "where your coin is": Cash -> Inventory -> Accounts receivable (from poc/1-harvest-ledger.html)
    const segs = [["Cash", b.cash, "#2f6f62"], ["Inventory", b.inv, "#b8862b"], ["Accounts receivable", b.ar, "#5b7fc4"]], tot = Math.max(1, segs.reduce((a, x) => a + Math.max(0, x[1]), 0));
    return `<span class="k">Where your coin is</span><div class="coinmap">${segs.map(([n, v, c]) => `<div style="width:${Math.max(0, v) / tot * 100}%;background:${c}" title="${n}: ${v}">${v / tot > .18 ? `${n} ${v}` : ""}</div>`).join("")}</div>`;
  }
  function goal(text, ch) { $("goal").innerHTML = text ? `<span class="k">Chapter ${ch} of 9</span> ${text.replace(/^Chapter \d+ · /, "")}` : ""; $("goal").style.display = text ? "block" : "none"; }
  function floatHud(id, v) { const el = $("h-" + id); if (!el) return; const r = el.getBoundingClientRect(), w = $("wrap").getBoundingClientRect();
    flo(`${v > 0 ? "+" : "−"}${Math.abs(v)}`, r.left - w.left + 10, r.bottom - w.top + 4, v > 0 ? "#2f6f3a" : "#9b2335"); }
  function floatAt(tx, ty, text, col) { if (!text) return; const sc = cv.getBoundingClientRect().width / VW; flo(text, (tx * T - cam.x) * sc, (ty * T - cam.y) * sc, col); }
  function flo(text, x, y, col) { const d = document.createElement("div"); d.className = "fl"; d.textContent = text; d.style.left = x + "px"; d.style.top = y + "px"; d.style.color = col; $("wrap").appendChild(d); setTimeout(() => d.remove(), 1700); }
  function toast(t) { flo(t, 12, 110 + (toast.n = ((toast.n || 0) + 1) % 4) * 22, "#7a4a10"); }
  // ---------- panels: ledger, statements ----------
  let panelKind = null;
  // Mouse-only play: every panel you can leave gets a clickable Close at the top and bottom, and a click on
  // the dark backdrop closes it. Task panels (forecast with cells to fill, journal pages, the close) keep
  // their own buttons, because they finish a step of the story.
  const CLOSABLE = new Set(["plan", "ledger", "notebook", "transcript"]);
  function showPanel(k, html, locked) {
    panelKind = { k, locked };
    const x = CLOSABLE.has(k) && !locked;
    $("panelBody").innerHTML = (x ? `<button class="btn alt pclose" style="float:right;margin:0 0 6px 10px">✕ Close</button>` : "") + html +
      (x ? `<div style="text-align:right;margin-top:10px"><button class="btn gold pclose">Done</button></div>` : "");
    if (x) document.querySelectorAll("#panelBody .pclose").forEach(b => b.onclick = hidePanel);
    $("panel").onclick = e => { if (x && e.target === $("panel")) hidePanel(); };
    $("panel").style.display = "flex";
  }
  let hideWaiters = [];
  function hidePanel() { $("panel").style.display = "none"; panelKind = null; const w = hideWaiters.splice(0); if (w.length) return w.forEach(f => f()); if (atDesk) desk(); }
  // Open a document from inside a question and wait until the player closes it, then the question comes back.
  function openDoc(fn) { return new Promise(res => { hideWaiters.push(res); fn(); }); }
  let pre = "";
  const tr = (label, v, cls, line) => `<tr class="${cls || ""}" data-line="${line ? pre + ":" + line : ""}"><td>${label}</td><td class="num">${fmt(v)}</td></tr>`;
  const fmt = v => typeof v === "number" ? (v < 0 ? `(${-v})` : String(v)) : v;
  function bsTable(b, title, p) {
    pre = p || "bs1"; return `<table class="stm"><tr><th>${title}</th><th></th></tr>` + tr("Cash", b.cash, "sub", "cash") + tr("Accounts receivable", b.ar, "sub", "ar") + tr("Inventory", b.inv, "sub", "inv") +
      tr("Equipment, net", b.equipNet, "sub", "equip") + tr("Total assets", b.assets, "total", "assets") + tr("Accounts payable", b.ap, "sub", "ap") + tr("Loan payable (due within the year)", b.loan, "sub", "loan") +
      tr("Crown debt (due at Midwinter)", b.crown, "sub", "crown") + tr("Owner's equity", b.equity, "sub", "equity") + tr("Liabilities + Owner's equity", b.liab + b.equity, "total") +
      `</table><div class="ok">${b.assets === b.liab + b.equity ? "Assets = Liabilities + Owner's equity ✓" : "OUT OF BALANCE"}</div>`;
  }
  function isTable(st) {
    const i = st.is; pre = "is"; return `<table class="stm"><tr><th>Income statement</th><th></th></tr>` + tr("Revenue", i.revenue, "", "revenue") + tr("Cost of goods sold", -i.cogs, "sub", "cogs") + tr("Gross profit", i.gross, "total", "gross") +
      tr("Wages & upkeep", -i.upkeep, "sub", "opex") + (i.dep ? tr("Depreciation", -i.dep, "sub", "opex") : "") + (i.fines ? tr("Contract forfeits", -i.fines, "sub", "opex") : "") +
      tr("Operating expenses", -i.opex, "", "opex") + tr("Operating income", i.operating, "total", "operating") + tr("Interest expense", -i.interest, "sub", "interest") +
      (i.factoring ? tr("Factoring fees", -i.factoring, "sub", "interest") : "") + tr("Net income", i.net, "total", "net") + `</table>`;
  }
  function cfTable(st) {
    const c = st.cf; pre = "cf"; return `<table class="stm" id="cft"><tr><th>Cash-flow statement (indirect)</th><th></th></tr>` + tr("Net income", c.net, "", "net") + tr("+ Depreciation", c.dep, "sub", "dep") +
      tr("(Increase) decrease in Accounts receivable", -c.dAR, "sub", "ar") + tr("(Increase) decrease in Inventory", -c.dInv, "sub", "inv") + tr("Increase (decrease) in Accounts payable", c.dAP, "sub", "ap") +
      tr("Cash from operations", c.cfo, "total", "cfo") + tr("Equipment bought", c.capex, "sub", "capex") + tr("Cash from investing", c.cfi, "total", "cfi") +
      tr("Borrowed", c.borrowed, "sub", "cff") + tr("Repaid", c.repaid, "sub", "cff") + tr("Cash from financing", c.cff, "total", "cff") +
      tr("Change in Cash", c.change, "total", "change") + `</table><div class="ok">${c.reconciles ? `Cash ${c.cashStart} → ${c.cashEnd}: reconciles ✓` : "DOES NOT RECONCILE"}</div>`;
  }
  function ledger() {
    const st = B.close(s), b = st.end;
    const jr = s.journal.slice(-9).reverse().map(j => `<tr><td>${j.day}</td><td>${j.memo}<div class="hint">${Object.entries(j.lines).map(([k, v]) => `${v > 0 ? "Dr" : "Cr"} ${S.ACCTS[k][0]} ${Math.abs(v)}`).join(" · ")}</div></td></tr>`).join("");
    showPanel("ledger", `<h1>The Ledger <span class="hint">day ${s.day} · click Close or press Esc</span></h1><div class="grid g3">${bsTable(b, "Balance sheet today")}${isTable(st)}
      <div><h3>Inventory at cost</h3><div class="hint">${s.sacks} sacks × 4 + ${s.seeds} seed × 12 + ${s.plots.filter(p => p.crop).length} plots growing × 12 = ${b.inv}</div></div></div>
      <h3 style="margin-top:10px">Journal (latest postings)</h3><table class="stm">${jr}</table>`);
  }
  // ---------- closing the books: guided (chapter 9), then Ezra's loan review ----------
  async function closeBooks() {
    if (closing) return; const st = B.close(s), h = B.highlight(st, s); closing = { st, h }; atDesk = true; hud();
    ["statements", "cfs"].forEach(i => { const c = TR.use(i); if (c) toast(`Transcript: ${TR.name(i)}`); });
    const banner = s.outcome === "insolvent" ? `<div class="banner">Insolvent on day ${s.day}. ${s.why}</div>` : "";
    const guided = storyOn && Story.state.stage !== "done";
    showPanel("close", `<h1>Closing the books: Spring, year one</h1>${banner}<div class="grid g3" id="stmts"><div id="sec-is">${isTable(st)}</div><div id="sec-bs0">${bsTable(st.start, "Balance sheet, start of spring", "bs0")}</div><div id="sec-bs1">${bsTable(st.end, s.outcome === "insolvent" ? "Balance sheet, day " + s.day : "Balance sheet, end of spring")}<div class="hint">Owner's equity ${st.end.equity} = ${st.start.equity} at the start + Net income ${st.is.net}</div></div></div>
      <div class="grid g2" style="margin-top:8px"><div id="sec-cf">${cfTable(st)}</div><div><div class="maudline" id="mline"><b>Maud:</b> ${guided ? "Let's close the books together." : h.text}</div><div id="ez"></div></div></div>`, true);
    if (guided) { ["is", "bs0", "bs1", "cf"].forEach(k => $("sec-" + k).classList.add("veil")); await Story.close(st, h); $("mline").innerHTML = `<b>Maud:</b> ${h.text}`; }
    h.lines.forEach(l => document.querySelectorAll(`#panelBody tr[data-line="${l}"]`).forEach(r => r.classList.add("hl")));
    const ez = $("ez");
    if (s.outcome === "insolvent") ez.innerHTML = `<p>Ezra won't lend to an estate that couldn't pay its wages. The farm goes to auction.</p><button class="btn gold" id="again">Try spring again</button>`;
    else ez.innerHTML = `<p>Before summer, Ezra reads your books. Explain them well and he lends more, cheaper.</p><button class="btn gold" id="goEzra">Take the books to Ezra</button>`;
    wire(); save();
  }
  function reveal(k, text) { return new Promise(res => { (k === "bs" ? ["bs0", "bs1"] : [k]).forEach(x => $("sec-" + x) && $("sec-" + x).classList.remove("veil"));
    $("mline").innerHTML = `<b>Maud:</b> ${text}`; $("ez").innerHTML = `<button class="btn gold" id="rnext">Next</button>`; $("rnext").onclick = () => { $("ez").innerHTML = ""; res(); }; }); }
  function pickLine(text, target, hints) { return new Promise(res => { let tries = 0; window.__pick = target;
    $("mline").innerHTML = `<b>Maud:</b> ${text}`; const rows = document.querySelectorAll("#cft tr[data-line]");
    rows.forEach(r => { if (!r.dataset.line) return; r.classList.add("pick"); r.onclick = () => {
      if (r.dataset.line === target) { rows.forEach(x => { x.onclick = null; x.classList.remove("pick"); }); window.__pick = undefined; res(); }
      else { tries++; $("mline").innerHTML = `<b>Maud:</b> ${text}<br><i class="hintline">Not that one. ${hints[Math.min(tries - 1, hints.length - 1)]}</i>`; } }; }); }); }
  function wire() { const a = $("again"), g = $("goEzra"); if (a) a.onclick = restart; if (g) g.onclick = review; }
  function review() {
    const qs = B.review(closing.st), before = S.terms(s); let i = 0, right = 0; const ez = $("ez");
    function next() {
      document.querySelectorAll("#panelBody tr.ask").forEach(r => r.classList.remove("ask"));
      if (i >= qs.length) { const after = B.reviewResult(s, right, qs.length); localStorage.removeItem(SAVE);
        ez.innerHTML = `<div class="ezq"><b>Ezra:</b> ${right === qs.length ? "You know your own books. Good." : right ? "You know some of your books." : "You don't know your own books. That costs you."}<br>
          Summer terms: lend up to <b>${after.loanLimit}</b> at <b>${after.rateBp / 100}% a week</b> (spring: ${before.loanLimit} at ${before.rateBp / 100}%).</div>
          <button class="btn gold" id="again">Play spring again</button> <button class="btn alt" onclick="G.transcript()">Transcript</button>`; return wire(); }
      const qq = qs[i]; qq.lines.forEach(l => document.querySelectorAll(`#panelBody tr[data-line="${l}"]`).forEach(r => r.classList.add("ask")));
      ez.innerHTML = `<div class="ezq"><b>Ezra</b> <span class="hint">(${i + 1} of ${qs.length}; each answer moves your summer rate)</span><br>${qq.q} ${qq.ask}</div>` +
        qq.options.slice().sort(() => Math.random() - .5).map(o => `<button class="btn alt choice" data-o="${o}">${o}</button>`).join("");
      ez.querySelectorAll(".choice").forEach(b => b.onclick = () => { const ok = b.dataset.o === qq.answer; if (ok) { right++; [qq.id].concat(qq.also || []).forEach(id => { if (TR.master(id)) toast(`Mastered: ${TR.name(id)} ★`); }); }
        ez.innerHTML = `<div class="ezq"><b>Ezra:</b> ${ok ? "Just so." : `No. ${qq.answer}.`}</div><button class="btn gold" id="nx">Next</button>`; $("nx").onclick = () => { i++; next(); }; });
    }
    next();
  }
  function restart() { localStorage.removeItem(SAVE); location.search = ""; }
  // ---------- save (every morning and at each chapter step) ----------
  function save() { if (!storyOn || fast && !q.has("savetest")) return; try { localStorage.setItem(SAVE, JSON.stringify({ s, story: Story.state, calm, usePtr, fairSeen })); } catch (e) {} }
  // ---------- drawing ----------
  const cam = { x: 0, y: 0 };
  function blit(img, x, y) { ctx.drawImage(img, Math.round(x - cam.x), Math.round(y - cam.y)); }
  function drawWell() { const x = WELL.x * T - cam.x, y = WELL.y * T - cam.y; ctx.fillStyle = "#8d949b"; ctx.fillRect(x + 1, y + 4, 14, 11); ctx.fillStyle = "#6f757b"; ctx.fillRect(x + 1, y + 12, 14, 3);
    ctx.fillStyle = "#2d5f9a"; ctx.fillRect(x + 3, y + 5, 10, 5); ctx.fillStyle = "#6b4526"; ctx.fillRect(x + 1, y - 6, 2, 11); ctx.fillRect(x + 13, y - 6, 2, 11); ctx.fillStyle = "#9b2335"; ctx.fillRect(x - 1, y - 9, 18, 4); }
  function drawStall(f) { const x = (f.x - 1) * T - cam.x, y = (f.y - 1) * T - cam.y;
    ctx.fillStyle = "#6b4526"; ctx.fillRect(x + 2, y - 10, 2, 24); ctx.fillRect(x + 44, y - 10, 2, 24); ctx.fillStyle = "#cf9f62"; ctx.fillRect(x, y + 4, 48, 10); ctx.fillStyle = "#946b3c"; ctx.fillRect(x, y + 12, 48, 2);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#f4ead0" : f.color; ctx.fillRect(x + i * 8, y - 14, 8, 8); } ctx.fillStyle = "#3b2a1e"; ctx.fillRect(x, y - 6, 48, 1);
    ctx.drawImage(A.sack, Math.round(x + 6), Math.round(y - 4)); ctx.drawImage(A.sack, Math.round(x + 28), Math.round(y - 4)); }
  function drawGround() {
    const x0 = Math.floor(cam.x / T), y0 = Math.floor(cam.y / T), TL = A.TILES, wet = S.rain(s.day);
    for (let y = y0; y <= y0 + VH / T + 1; y++) for (let x = x0; x <= x0 + VW / T + 1; x++) {
      if (x < 0 || y < 0 || x >= MW || y >= MH) continue; const k = ground[y * MW + x]; let img;
      if (k.startsWith("grass")) img = TL.grass[+k[5]]; else if (k.startsWith("flower")) img = TL.flower[+k[6]]; else if (k === "path") img = TL.path[(x + y) % 2];
      else if (k === "cobble") img = TL.cobble[(x * 3 + y) % 2]; else if (k === "water") img = TL.water[(Math.floor(frame / 40) + x) % 2]; else img = TL.grass[0];
      blit(img, x * T, y * T); if (k === "fence") blit(TL.fence, x * T, y * T);
    }
    s.plots.forEach(p => { if (!p.tilled) return; blit(p.watered || wet || S.sprinkled(s, p) ? TL.wet : TL.soil, p.x * T, p.y * T);
      if (p.crop) blit(A.crops[S.stage(s, p)], p.x * T, p.y * T - (S.stage(s, p) === 4 ? 1 + Math.round(Math.sin(frame / 30 + p.i)) : 0)); if (p.sprinkler) blit(A.sprinkler, p.x * T, p.y * T); });
  }
  function drawPerson(who, x, y, dir, moving, stepv) { const f = A.people[who][dir], i = moving ? 1 + (Math.floor(stepv) % 2) : 0;
    ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fillRect(Math.round(x - 5 - cam.x), Math.round(y - 1 - cam.y), 10, 3); blit(f[i], x - 8, y - 16); }
  const wants = who => storyOn ? ({ tomas: ["tomas2", "tomas6"], ashby: ["ashby3"], hobb: ["hobb4"], ezra: ["ezra7"], duke: ["duke8"] }[who] || []).indexOf(Story.state.stage) >= 0 : s.offers.some(o => o.who === who);
  function draw() {
    cam.x = Math.max(0, Math.min(MW * T - VW, pl.x - VW / 2)); cam.y = Math.max(0, Math.min(MH * T - VH, pl.y - VH / 2));
    ctx.fillStyle = "#79b851"; ctx.fillRect(0, 0, VW, VH); drawGround();
    const list = props.slice();
    Object.values(NPC).filter(npcHere).forEach(n => list.push({ y: n.y + .95, draw: () => { drawPerson(n.who, n.x * T + 8, n.y * T + 14, n.dir, false, 0);
      if (wants(n.who)) { const bx = n.x * T + 5 - cam.x, by = n.y * T - 12 - cam.y + Math.sin(frame / 8) * 1.5; ctx.fillStyle = "#fff"; ctx.fillRect(bx, by, 7, 9); ctx.fillStyle = "#c43a1a"; ctx.fillRect(bx + 3, by + 1, 1, 5); ctx.fillRect(bx + 3, by + 7, 1, 1); } } }));
    list.push({ y: pl.y / T, draw: () => drawPerson("player", pl.x, pl.y, pl.dir, pl.moving, pl.step) });
    list.sort((a, b) => a.y - b.y).forEach(o => o.draw());
    const mill = BUILD[2], mx = mill.x * T + 48 - cam.x, my = mill.y * T + 20 - cam.y, ang = frame / 60;
    ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { const a = ang + k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a) * 20, my + Math.sin(a) * 20); ctx.stroke(); }
    ctx.fillStyle = "#f2efe6"; for (let k = 0; k < 4; k++) { const a = ang + k * Math.PI / 2; ctx.fillRect(Math.round(mx + Math.cos(a) * 13) - 2, Math.round(my + Math.sin(a) * 13) - 2, 5, 5); }
    [BUILD[0], BUILD[1], BUILD[5]].forEach((b, k) => { for (let j = 0; j < 3; j++) { const t = (frame / 90 + j / 3 + k * .3) % 1; ctx.fillStyle = `rgba(235,235,235,${.6 * (1 - t)})`; ctx.fillRect(Math.round((b.x + b.w) * T - 18 - cam.x + Math.sin(t * 6) * 2), Math.round(b.y * T - 4 - t * 18 - cam.y), 3 + t * 3, 3 + t * 3); } });
    if (S.rain(s.day)) { ctx.fillStyle = "rgba(40,60,110,.18)"; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = "rgba(200,220,255,.55)"; for (let k = 0; k < 70; k++) { const rx = (k * 53 + frame * 3) % VW, ry = (k * 97 + frame * 6) % VH; ctx.fillRect(rx, ry, 1, 4); } }
    const f = facing(), p = plotAt(f.x, f.y), n = npcAt(f.x, f.y), b = buildingAt(f.x, f.y);
    if (p) { ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1; ctx.strokeRect(f.x * T - cam.x + .5, f.y * T - cam.y + .5, 15, 15); }
    $("hint").textContent = dlgOpen() ? "" : n ? `E: talk to ${S.NAMES[n.who]}` : (f.x === CRATE.x && f.y === CRATE.y) ? "E: shipping crate" : b ? (b.id === "house" ? "E: sit at your desk" : `E: ${S.NAMES[b.who]}`) :
      p ? "E: " + (!p.tilled ? "till" : p.sprinkler ? "sprinkler" : !p.crop ? (s.sprinklersHeld ? "place sprinkler" : s.seeds ? "plant seed" : "no seed: buy from Tomas") : S.stage(s, p) === 4 ? "harvest" : p.watered || S.rain(s.day) ? "watered" : "water") : "";
  }
  let last = 0;
  function loop(t) { const dt = Math.min(.05, (t - last) / 1000 || 0); last = t; frame++; if (!dlgOpen() && !panelOpen()) move(dt); draw(); requestAnimationFrame(loop); }
  function fit() { const sc = Math.max(2, Math.floor(Math.min(innerWidth / VW, innerHeight / VH))); cv.style.width = VW * sc + "px"; cv.style.height = VH * sc + "px"; $("wrap").style.width = VW * sc + "px"; }
  addEventListener("resize", fit);
  // ---------- the API the story uses (and tests) ----------
  window.G = { get s() { return s; }, say: sayP, ask, haggle, board, page, reveal, pickLine, goal, toast, hud, save, act: fn => act(fn),
    interactTile, talk, crate, desk, sleepNow, ledger, notebook, transcript, closeBooks, review, closeDlg: () => { $("dlg").style.display = "none"; }, hidePanel,
    set fast(v) { fast = v; }, pl, keys, step: dt => move(dt),
    play(policy, days) { storyOn = false; for (let d = 0; d < days && !s.over; d++) { Bot[policy].day(s); drainUses(); S.sleep(s); drainUses(); } hud(); if (s.over) closeBooks(); } };
  function start() {
    const saved = (() => { try { return JSON.parse(localStorage.getItem(SAVE)); } catch (e) { return null; } })();
    const begin = (sv) => {
      if (sv) { s = sv.s; calm = sv.calm || 0; usePtr = sv.usePtr || 0; fairSeen = sv.fairSeen || {}; }
      else s = S.newGame({ story: storyOn, bonus: Math.min(100, (window.Codex ? Codex.prestige() : 0) * 10) });
      if (storyOn) Story.init(G, sv && sv.story); else goal("");
      hud(); if (storyOn) Story.start();
    };
    if (saved && storyOn && !saved.s.over && !q.has("new")) { s = saved.s; hud(); dlg({ who: "maud", text: `Welcome back. Day ${saved.s.day}, chapter ${saved.story.ch}.`, choices: ["Continue", "Start a new game"] }).then(r => begin(r.i === 0 ? saved : null)); }
    else begin(null);
  }
  fit(); start();
  if (q.has("auto")) { const a = q.get("auto"); G.play(q.get("bot") || "careful", /^\d+$/.test(a) ? +a : 99); if (a === "ezra") review(); }
  if (q.has("at")) { const [x, y] = q.get("at").split(",").map(Number); pl.x = x * T + 8; pl.y = y * T + 12; }
  if (q.has("desk")) { atDesk = true; hud(); }
  requestAnimationFrame(loop);
})();
