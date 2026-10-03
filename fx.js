// Ledger & Crown — juice (WS2). Coin burst, WebAudio clink/thud (generated tones, no audio files), screen shake,
// typewriter reveal, scene fade. Muted by default; the choice is remembered in localStorage (try/catch: Safari private mode).
// Pattern source: Stardew Valley's "every action is answered" feedback loop; Vlambeer's "Art of Screenshake" for the shake size (small, 150 ms).
(function () {
  const KEY = "lc_sound", reduce = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
  let on = false, ac = null;
  try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}
  function ctx() { if (!on) return null; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); } catch (e) { ac = null; } return ac; }
  function tone(freq, t0, dur, type, vol, slideTo) { const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0; o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .02); }
  const FX = {
    get muted() { return !on; },
    setSound(v) { on = !!v; try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} if (on) FX.clink(); },
    clink() { tone(1568, 0, .16, "sine", .12); tone(2093, .07, .22, "sine", .09); },
    thud() { tone(140, 0, .22, "triangle", .2, 50); },
    // a handful of coins fly up from the element and fall; a thud-and-shake on a loss
    cash(delta, el, wrap) {
      if (!delta) return; if (delta > 0) FX.clink(); else FX.thud();
      if (!el || !wrap || reduce()) return;
      const r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect(), n = Math.min(10, 3 + Math.floor(Math.abs(delta) / 10));
      for (let i = 0; i < n; i++) { const c = document.createElement("i"); c.className = "coin " + (delta < 0 ? "lose" : "gain");
        c.style.left = (r.left - w.left + r.width / 2) + "px"; c.style.top = (r.top - w.top + r.height / 2) + "px";
        const dx = (Math.random() - .5) * 120, dy = delta > 0 ? -(30 + Math.random() * 50) : (20 + Math.random() * 40);
        wrap.appendChild(c);
        if (c.animate) c.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: 0 }], { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.4,1)" }).onfinish = () => c.remove();
        setTimeout(() => c.remove(), 1200); }
    },
    shake(el) { if (!el || reduce() || !el.animate) return; el.animate([{ transform: "translate(0,0)" }, { transform: "translate(-4px,2px)" }, { transform: "translate(4px,-2px)" }, { transform: "translate(-2px,1px)" }, { transform: "translate(0,0)" }], { duration: 150 }); },
    // typewriter: every letter becomes a hidden span (textContent stays complete, so tests and screen readers see all the text); reveal runs per frame; el._finish() completes it
    type(el, cps) {
      if (reduce()) return; const nodes = [], wk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (wk.nextNode()) nodes.push(wk.currentNode);
      const spans = []; nodes.forEach(n => { const f = document.createDocumentFragment(); for (const ch of n.nodeValue) { if (/\s/.test(ch)) f.appendChild(document.createTextNode(ch)); else { const s = document.createElement("span"); s.className = "tw"; s.textContent = ch; spans.push(s); f.appendChild(s); } } n.replaceWith(f); });
      let i = 0, per = Math.max(1, Math.round((cps || 200) / 60)); el.classList.add("typing");
      const finish = () => { clearInterval(el._tw); el._tw = null; spans.forEach(s => s.classList.add("on")); el.classList.remove("typing"); el._finish = null; };
      el._finish = finish; el._tw = setInterval(() => { for (let k = 0; k < per && i < spans.length; k++) spans[i++].classList.add("on"); if (i >= spans.length) finish(); }, 1000 / 60);
    },
    fade(wrap, mid) { // 0.5 s fade out/in; mid() runs when the screen is black
      let f = document.getElementById("fade"); if (!f) { f = document.createElement("div"); f.id = "fade"; wrap.appendChild(f); }
      f.classList.add("on"); setTimeout(() => { mid && mid(); setTimeout(() => f.classList.remove("on"), 60); }, 260);
    },
  };
  window.FX = FX;
})();
