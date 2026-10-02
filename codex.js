// Ledger & Crown — the Codex (concept states) and the "Speak the Word" round, shared by all POCs.
// Concept states: felt (you lived the mechanism) -> named (you bound the right word to it).
window.Codex = (function () {
  const KEY = "lc_codex_v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  // Spacing: each correct recall pushes the next ask out (1 → 3 → 7 → 21 days); a miss brings it back in 10 minutes.
  const DAY = 864e5, GAPS = [DAY, 3 * DAY, 7 * DAY, 21 * DAY];
  // state: "felt" (lived it; never lowers progress) · "named" (recalled correctly) · "miss" (recall failed: reset spacing)
  function mark(id, state) { const d = load(); const order = { felt: 1, miss: 1, named: 2 }; const now = Date.now();
    if (!d[id]) d[id] = { state: "felt", at: now, hits: 0, due: now + 10 * 6e4 };
    if (order[state] > order[d[id].state]) d[id].state = state;
    if (state === "named") { d[id].hits = (d[id].hits || 0) + 1; d[id].due = now + GAPS[Math.min(d[id].hits - 1, 3)]; }
    else if (state === "miss") { d[id].hits = 0; d[id].due = now + 10 * 6e4; }
    d[id].at = now; save(d); }
  const retained = id => ((load()[id] || {}).hits || 0) >= 3;
  const due = () => { const d = load(), now = Date.now(); return Object.keys(d).filter(k => (d[k].due || 0) <= now); };
  const known = id => (load()[id] || {}).state === "named";
  const all = load;
  function reset() { save({}); }
  // Label that upgrades once the term is named: plain words first, the real term after.
  // Real terms are the in-world names of the things you use, from the first minute (like "mana" in any RPG):
  // you learn the word by using the object, not by being taught it.
  const L = (plain, id, term) => `${plain} <span class="tag">${term}</span>`;

  // Speak the Word. qs: [{id, term, prompt, options:[...], answer, why}]
  function speak(container, qs, onDone, o) {
    o = Object.assign({ right: "Bound.", wrong: a => `Not yet: it's “${a}”.`, end: (s, n) => `<h3>Words bound: ${s} of ${n}</h3><p class="hint">Missed words come back later, asked a different way.</p>`, label: "Speak the Word" }, o || {});
    let i = 0, score = 0;
    function show() {
      if (i >= qs.length) { container.innerHTML = o.end(score, qs.length); onDone && onDone(score); return; }
      const q = qs[i], opts = shuffle(q.options.slice());
      container.innerHTML = `<p class="hint">${o.label} · ${i + 1} of ${qs.length}</p><p><b>${q.prompt}</b></p>` +
        opts.map(x => `<button class="btn alt choice" data-o="${esc(x)}">${x}</button>`).join("") + `<div class="fb"></div>`;
      container.querySelectorAll(".choice").forEach(b => b.onclick = () => {
        const right = b.dataset.o === q.answer; container.querySelectorAll(".choice").forEach(x => x.disabled = true);
        if (right) { score++; mark(q.id, "named"); } else mark(q.id, "miss");
        o.onAnswer && o.onAnswer(right, score);
        container.querySelector(".fb").innerHTML = `<div class="codex"><span class="${right ? "pill-good" : "pill-bad"}">${right ? o.right : o.wrong(q.answer)}</span> ${q.why}</div>
          <button class="btn gold">Next</button>`;
        container.querySelector(".fb .btn").onclick = () => { i++; show(); };
      });
    }
    show();
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function esc(s) { return String(s).replace(/"/g, "&quot;"); }
  // Player guide level, chosen on the map: apprentice (coached), journeyman (forecasts shown), master (no aids).
  const LEVEL_KEY = "lc_level_v1";
  const level = () => { try { return localStorage.getItem(LEVEL_KEY) || "apprentice"; } catch (e) { return "apprentice"; } };
  const setLevel = v => { try { localStorage.setItem(LEVEL_KEY, v); } catch (e) {} };
  // SOURCES (which curriculum session each mechanic is built from) lived here in the full repo for designers only —
  // players never saw it. Dropped from this standalone beta package: it pointed outside this folder
  // (knowledge/mba/, not shipped) and Spring at Thornfield never reads it at runtime.
  // Prestige: earned by answering the Traveller's letters well; carried into every new game as a head start.
  const PKEY = "lc_prestige_v1";
  const prestige = () => { try { return +localStorage.getItem(PKEY) || 0; } catch (e) { return 0; } };
  const addPrestige = n => { try { localStorage.setItem(PKEY, Math.max(0, prestige() + n)); } catch (e) {} };
  return { mark, known, all, reset, L, speak, level, setLevel, retained, due, prestige, addPrestige };
})();
