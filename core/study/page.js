// Study kit — the study page driver (card MBA-ST11). Draws the shell (shell.js) into one element: code -> form A -> play -> form B -> result.
// Arm "reading": the reading page (reading.js). Arm "game": a host (opts.gameHost) plays study-route.json; the page only starts and ends it.
// No saves, no menus. Needs log.js, forms.js, reading.js, route.js and shell.js loaded before this file.
(function (root) {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const armOf = search => { const m = /(?:^|[?&])arm=(game|reading)(?:&|$|#)/.exec(String(search || "")); return m ? m[1] : "game"; };

  // opts: { search, bank, sections, route, known, gameHost, seed, now, screenOut, tickMs }
  // gameHost: { play({ shell, runner, el, log }) -> Promise } resolves when the route is done or stopped; the page then moves to form B.
  function mount(el, opts) {
    opts = opts || {};
    const search = opts.search !== undefined ? opts.search : (root.location && root.location.search) || "";
    const arm = armOf(search), tickMs = opts.tickMs || 1000;
    const shell = root.StudyShell.create({ search, bank: opts.bank, seed: opts.seed, now: opts.now, screenOut: opts.screenOut });
    let idx = 0, reader = null, timer = null, playing = false, route = null, notice = "";

    const draw = html => { el.innerHTML = html; };
    const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };

    function render() {
      stopTimer();
      const ph = shell.phase();
      if (ph === "off") return draw(`<main class="sp" data-phase="off"><h1>This page needs a study link</h1><p>Open the link you were given. If you did that and still see this, tell the researcher.</p></main>`);
      if (ph === "code") return drawCode();
      if (ph === "formA" || ph === "formB") return drawItem();
      if (ph === "play") return arm === "reading" ? drawReading() : drawGame();
      return drawResult();
    }

    function drawCode() {
      draw(`<main class="sp" data-phase="code"><h1>Before you start</h1><p>Type the participant code you were given. It has 4 to 64 letters, numbers, - or _.</p>
        <form id="sp-code"><label for="sp-pc">Participant code</label><input id="sp-pc" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="submit" id="sp-go">Start</button></form>
        <p id="sp-err" role="alert">${esc(notice)}</p></main>`);
      el.querySelector("#sp-code").addEventListener("submit", e => {
        e.preventDefault();
        if (shell.submitCode(el.querySelector("#sp-pc").value)) { notice = ""; idx = 0; render(); }
        else { notice = "That code is not accepted. Check it and try again."; el.querySelector("#sp-err").textContent = notice; }
      });
    }

    function drawItem() {
      const items = shell.items(), q = items[idx], form = shell.phase() === "formA" ? "A" : "B";
      if (!q) return;
      shell.show(idx);
      draw(`<main class="sp" data-phase="${shell.phase()}"><p class="sp-count">Question ${idx + 1} of ${items.length}</p><h1 id="sp-stem">${esc(q.stem)}</h1>
        <div class="sp-opts" role="group" aria-labelledby="sp-stem">${q.options.map((o, i) => `<button type="button" class="sp-opt" data-i="${i}">${esc(o)}</button>`).join("")}</div></main>`);
      el.querySelectorAll(".sp-opt").forEach(b => b.addEventListener("click", () => {
        if (!shell.answer(idx, +b.dataset.i)) return;
        if (idx + 1 < items.length) { idx++; return render(); }
        const next = shell.finishForm(); idx = 0;
        if (next === "play" && arm === "reading") reader = null;
        render();
      }));
    }

    function drawReading() {
      if (!reader) reader = shell.startReading(opts.sections || []);
      const secs = reader.sections();
      draw(`<main class="sp sp-read" data-phase="play" data-arm="reading"><h1>Reading</h1><p>Read this at your own pace. The button at the bottom unlocks after about 10 minutes of reading.</p>
        ${secs.map(s => `<section data-id="${esc(s.id)}"><h2>${esc(s.title || s.id)}</h2><p>${esc(s.text || "")}</p></section>`).join("")}
        <button type="button" id="sp-done" disabled>I have finished reading</button><p id="sp-left"></p></main>`);
      const seen = new Set(), show = id => { if (!seen.has(id)) { seen.add(id); reader.show(id); } };
      if (typeof root.IntersectionObserver === "function") {
        const io = new root.IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(e.target.dataset.id); }), { threshold: 0.3 });
        el.querySelectorAll("section").forEach(s => io.observe(s));
      } else secs.forEach(s => show(s.id));
      ["scroll", "pointerdown", "keydown"].forEach(t => root.addEventListener(t, () => { if (shell.phase() === "play") reader.activity(); }, { passive: true }));
      const done = el.querySelector("#sp-done"), left = el.querySelector("#sp-left");
      const refresh = () => {
        const can = reader.canFinish() || reader.expired();
        done.disabled = !can;
        const mins = Math.max(0, Math.ceil((10 * 60000 - reader.activeMs()) / 60000));
        left.textContent = can ? "" : "About " + mins + " more minute" + (mins === 1 ? "" : "s") + " of reading.";
        if (reader.expired()) finishReading();
      };
      const finishReading = () => { stopTimer(); if (shell.finishReading()) { idx = 0; render(); } };
      done.addEventListener("click", finishReading);
      timer = setInterval(refresh, tickMs); refresh();
    }

    function drawGame() {
      draw(`<main class="sp" data-phase="play" data-arm="game"><div id="sp-game"></div></main>`);
      if (playing) return;
      playing = true;
      const r = shell.startRoute(opts.route, opts.known);
      if (!r || r.error) { playing = false; draw(`<main class="sp" data-phase="play"><h1>The game could not start</h1><p>${esc(r ? r.error : "no route")}</p></main>`); return; }
      route = r;
      const host = opts.gameHost;
      const end = () => { playing = false; stopTimer(); if (shell.finishRoute()) { idx = 0; render(); } };
      if (!host) { end(); return; }
      timer = setInterval(() => { const st = route.tick(); if (st === "stopped") { host.stop && host.stop(); end(); } }, tickMs);
      Promise.resolve(host.play({ shell, runner: route, el: el.querySelector("#sp-game"), log: shell })).then(end, e => { playing = false; stopTimer(); draw(`<main class="sp"><h1>Something went wrong</h1><p>${esc(e && e.message || e)}</p></main>`); });
    }

    function drawResult() {
      const out = shell.screenedOut() ? "Thank you. That is all for this study." : "Thank you. You have finished.";
      draw(`<main class="sp" data-phase="result"><h1>${out}</h1><p>Copy the code below and paste it where the study page told you to.</p>
        <textarea id="sp-result" readonly rows="6" aria-label="Your result code"></textarea><button type="button" id="sp-copy">Copy the code</button></main>`);
      const box = el.querySelector("#sp-result");
      const put = c => { box.value = c; box.dataset.ready = c ? "1" : "0"; };
      put(shell.resultCode());
      shell.resultCodeAsync().then(c => { if (c) put(c); }, () => {});
      el.querySelector("#sp-copy").addEventListener("click", () => {
        box.select();
        try { if (root.navigator && root.navigator.clipboard) root.navigator.clipboard.writeText(box.value); else document.execCommand("copy"); } catch (e) { /* the box is selected: the learner can copy it by hand */ }
      });
    }

    render();
    return { shell, arm, render, get runner() { return route; } };
  }

  const api = { mount, armOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyPage = api;
})(typeof window !== "undefined" ? window : globalThis);
