// Study kit — study-mode switches (card MBA-ST9, plan B8, B9, B12). Everything is off unless the URL has ?study=1,
// so the full game never sees a change. Pure: the page reads the switches and passes the engine in; nothing here touches the DOM.
(function (root) {
  const flagOn = search => /(?:^|[?&])study=1(?:&|$|#)/.test(String(search || ""));
  const OFF = Object.freeze({ on: false, quiet: false, autoShip: false, hideMenus: false, hideSaves: false, noticesDecline: false });

  // route: the parsed study-route.json (reads route.engine). Returns the switches for this page load.
  function mode(search, route) {
    if (!flagOn(search)) return OFF;
    const e = (route && route.engine) || {};
    return Object.freeze({ on: true, quiet: e.quiet !== false, autoShip: true, hideMenus: true, hideSaves: true, noticesDecline: e.notices === "decline" });
  }

  // Plan B9: hold quiet true for the whole study game (no stray offers or visitors). Call after newGame and after any load.
  function holdQuiet(s, m) { if (m.on && m.quiet && s) s.quiet = true; return !!(s && s.quiet); }

  // Plan B8: a closed deal ships at once. Spring is the engine ({ deliver }); id is the order id. Returns the engine's result or null.
  function autoShip(Spring, s, id, m) {
    if (!m.on || !m.autoShip) return null;
    if (!Spring || typeof Spring.deliver !== "function") throw new Error("study auto-ship: the engine has no deliver");
    if (!(s.orders || []).some(o => o.id === id && o.status === "open")) throw new Error("study auto-ship: no open order " + id);
    return Spring.deliver(s, id);
  }
  // The route's `ship` op names a customer: the open (accepted, undelivered) order for that buyer.
  function openOrderFor(s, who) { return (s.orders || []).find(o => o.who === who && o.status === "open") || null; }

  // Plan B12: the screens the study page must not offer. The page hides the elements whose ids are listed.
  // PLACEHOLDER ids: the study page card must confirm them against game.html (no study page exists yet).
  const HIDDEN_UI = ["menu", "saves", "transcript", "codex", "settings", "journal-tab"];
  function hiddenUi(m) { return m.on && m.hideMenus ? HIDDEN_UI.slice() : []; }
  // A save write is dropped in study mode: the study keeps no state between page loads.
  function allowSave(m) { return !(m.on && m.hideSaves); }

  // Plan B9: during a fast-forward notices are declined. `decline` takes the state (s); the page wraps Spring.answerNotice.
  function declineNotices(s, m, decline) { if (m.on && m.noticesDecline && typeof decline === "function") decline(s); }

  const api = { mode, holdQuiet, autoShip, openOrderFor, hiddenUi, allowSave, declineNotices, flagOn, OFF, HIDDEN_UI };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyMode = api;
})(typeof window !== "undefined" ? window : globalThis);
