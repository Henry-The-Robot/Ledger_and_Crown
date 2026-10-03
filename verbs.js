// Ledger & Crown — WS3 verbs: things the player DOES instead of typing sums (projects/mba-game/specs/WS3-first-15-minutes.md).
//   tag      tap world objects; each correct tap writes a line on a parchment that builds a statement (the balance sheet).
//   bet      Maud's wager: name a number, stake real Cash (posted so the books tie), the answer is revealed now or on a later morning.
//   timeline a 14-day strip of cash events with a Cash line under it (show / play / predict).
// Method: generation effect and predict-then-reveal (Slamecka & Graf 1978; Kornell, Hays & Bjork 2009: errors before feedback help
// learning), productive failure (Kapur 2008) for the wages-day miss. Numbers are always functions of game state, never literals.
// Mouse and touch use the same click/pointer events; nothing is hover-only. UI styles live in verbs.css (--panel --ink --gold ... with fallbacks).
window.Verbs = (function () {
  const $ = id => document.getElementById(id), T = 16;
  let G, S, tagSt = null, craneOn = false;
  const fmt = n => (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("en-US");
  const el = (cls, html, parent) => { const e = document.createElement("div"); e.className = cls; e.innerHTML = html || ""; (parent || $("wrap")).appendChild(e); return e; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function init(g) { G = g; S = Spring; }

  // ---------- shared bits: a remark that fades, the stamp, a thud ----------
  function remark(text) { document.querySelectorAll(".vsay").forEach(e => e.remove()); const e = el("vsay", text); setTimeout(() => e.remove(), 3300); }
  function thud() { try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.type = "sine"; o.frequency.setValueAtTime(110, a.currentTime); o.frequency.exponentialRampToValueAtTime(40, a.currentTime + .25);
    g.gain.setValueAtTime(.5, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .3); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + .32); } catch (e) {} }
  async function stamp(text, sub) { const e = el("vstamp", `${text}${sub ? `<small>${sub}</small>` : ""}`); thud(); await wait(window.__fastVerbs ? 30 : 1300); return e; }

  // ---------- the parchment ----------
  const P = { assets: [], liab: [], aTot: null, lTot: null, eq: null, hint: "" };
  function parchHtml() {
    const rows = a => a.map(r => `<div class="vp-row"><span>${r.line}</span><b>${fmt(r.value)}</b></div>`).join("");
    return `<h4>Thornfield, as the Crown sees it</h4><div class="vp-sec">Assets <span style="font-weight:normal;font-size:13px">(what the farm owns)</span></div>${rows(P.assets)}${P.aTot != null ? `<div class="vp-tot"><span>Total assets</span><b>${fmt(P.aTot)}</b></div>` : ""}` +
      (P.liab.length ? `<div class="vp-sec">Liabilities <span style="font-weight:normal;font-size:13px">(what it owes)</span></div>${rows(P.liab)}${P.lTot != null ? `<div class="vp-tot"><span>Total liabilities</span><b>${fmt(P.lTot)}</b></div>` : ""}` : "") +
      (P.eq != null ? `<div class="vp-tot"><span>Owner's equity</span><b class="${P.eq < 0 ? "vp-neg" : ""}">${fmt(P.eq)}</b></div>` : "") + (P.hint ? `<div class="vp-hint">${P.hint}</div>` : "") +
      (P.where ? `<button type="button" class="vp-where">Where else?</button>` : "");
  }
  function parch(show) { let e = $("vparch"); if (!e && show !== false) e = el("vparch"); if (e) { e.innerHTML = parchHtml(); const w = e.querySelector(".vp-where"); if (w) w.onclick = () => whereElse(); } return e; }
  function parchReset() { Object.assign(P, { assets: [], liab: [], aTot: null, lTot: null, eq: null, hint: "", where: false }); const e = $("vparch"); if (e) e.remove(); }
  function parchClose() { const e = $("vparch"); if (e) e.remove(); document.querySelectorAll(".vstamp").forEach(x => x.remove()); }
  async function countTotal(key, to) { // the totals add themselves with a counting animation
    const steps = window.__fastVerbs ? 1 : 14; for (let i = 1; i <= steps; i++) { P[key] = Math.round(to * i / steps); parch(); await wait(window.__fastVerbs ? 0 : 45); } P[key] = to; parch();
  }
  const pinRow = (side, line, value) => { P[side].push({ line, value }); parch(); };

  // ---------- tag ----------
  // cfg: { targets:[{id, tiles:[[x,y]...] | ()=>tiles, line, value, side:"assets", say?}], decoys:[{tiles, says}], show:n (NPC tags the first n), hintAfter:ms }
  // Resolves when every target is tagged. The canvas tap arrives through canvasTap() (game.js calls it before it turns a tap into a walk).
  function tag(cfg) {
    return new Promise(res => {
      tagSt = { cfg, done: new Set(), res, pulse: null, pulseUntil: 0, timer: null };
      P.where = false; P.hint = "Tap what the farm owns."; parch();
      (cfg.targets.slice(0, cfg.show || 0)).forEach(t => tagged(t, true));
      tagSt.timer = setTimeout(() => { if (tagSt) { P.where = true; parch(); } }, cfg.hintAfter != null ? cfg.hintAfter : 20000);
    });
  }
  const tilesOf = o => typeof o.tiles === "function" ? o.tiles() : o.tiles;
  const hit = (o, tx, ty) => tilesOf(o).some(([x, y]) => x === tx && y === ty);
  function tagged(t, byNpc) {
    if (!tagSt || tagSt.done.has(t.id)) return;
    tagSt.done.add(t.id); pinRow(t.side || "assets", t.line, typeof t.value === "function" ? t.value() : t.value);
    if (tagSt.cfg.onTag) tagSt.cfg.onTag(t, !!byNpc);
    if (tagSt.done.size === tagSt.cfg.targets.length) {
      const st = tagSt; tagSt = null; clearTimeout(st.timer); P.where = false; P.hint = ""; parch(); st.res([...st.done]);
    }
  }
  function canvasTap(tx, ty) { // true when the tap was a tag (or a rebuke), so the game doesn't also walk there
    if (!tagSt) return false;
    const t = tagSt.cfg.targets.find(o => !tagSt.done.has(o.id) && hit(o, tx, ty));
    if (t) { tagged(t); return true; }
    const done = tagSt.cfg.targets.find(o => tagSt.done.has(o.id) && hit(o, tx, ty)); if (done) { remark("Already on the list."); return true; }
    const d = tagSt.cfg.decoys.find(o => hit(o, tx, ty)); if (d) { remark(d.says); return true; }
    return false;
  }
  function whereElse() { if (!tagSt) return; const left = tagSt.cfg.targets.filter(o => !tagSt.done.has(o.id)); if (!left.length) return;
    const pl = G.pl, px = pl.x / T, py = pl.y / T, d = o => Math.min(...tilesOf(o).map(([x, y]) => Math.hypot(x - px, y - py)));
    left.sort((a, b) => d(a) - d(b)); tagSt.pulse = left[0].id; tagSt.pulseUntil = Date.now() + 5000; }
  // test helper: tap the first untagged target through the real hit-test; returns false when nothing is left
  function tapNext() { if (!tagSt) return false; const t = tagSt.cfg.targets.find(o => !tagSt.done.has(o.id)); if (!t) return false; const [x, y] = tilesOf(t)[0]; return canvasTap(x, y); }
  function tapDecoy() { if (!tagSt) return false; const d = tagSt.cfg.decoys[0]; if (!d) return false; const [x, y] = tilesOf(d)[0]; return canvasTap(x, y); }
  // drawn by game.js at the end of its draw(): gold frames round tagged things, a pulsing frame on the hinted one
  function draw(ctx, cam, frame) {
    if (!tagSt) return;
    const frame1 = (o, col, w) => { const ts = tilesOf(o), x0 = Math.min(...ts.map(t => t[0])), y0 = Math.min(...ts.map(t => t[1])), x1 = Math.max(...ts.map(t => t[0])), y1 = Math.max(...ts.map(t => t[1]));
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.strokeRect(x0 * T - cam.x - 1, y0 * T - cam.y - 1, (x1 - x0 + 1) * T + 2, (y1 - y0 + 1) * T + 2); };
    tagSt.cfg.targets.forEach(o => { if (tagSt.done.has(o.id)) frame1(o, "#f0b429", 2); });
    if (tagSt.pulse && Date.now() < tagSt.pulseUntil) { const o = tagSt.cfg.targets.find(x => x.id === tagSt.pulse); if (o && !tagSt.done.has(o.id)) frame1(o, Math.floor(frame / 8) % 2 ? "#ffffff" : "#e0412f", 3); }
  }

  return { init, remark, stamp, thud, parch, parchReset, parchClose, pinRow, countTotal, P, tag, canvasTap, draw, tapNext, tapDecoy, wait,
    get tagging() { return !!tagSt; }, get craneOn() { return craneOn; }, set craneOn(v) { craneOn = v; }, fmt, el };
})();
