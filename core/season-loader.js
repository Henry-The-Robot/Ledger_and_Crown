// SM4: the season loader. It runs once, after engine.js and save.js and before game.js, and decides which season this page plays.
// Order of choice: ?season= forces one; ?sandbox or ?fast (test runs) stay on the first season; else the open save slot's season; else the first season in ORDER with no closed record; else the last season.
// It then makes that season active (Spring.Season.use), sets window.LC_SEASON, and writes the season's own script tags in place (document.write, so they run before game.js).
// A season's own scripts are tags in game.html shaped <script data-season="ch1/summer" data-src="chapters/ch1/summer/x.js?v=...">. tools/stamp.js stamps data-src like src.
// Spring's scripts stay ordinary tags: Spring loads exactly as before. Pure part: SeasonLoader.pick (tests/test-season-loader.js).
(function (root) {
  const ORDER = ["ch1/spring", "ch1/summer"]; // play order; a new season is added here when its season.js registers
  function pick(o) { // o = { search, slot, closed, known }
    const known = o.known || ORDER, q = new URLSearchParams(o.search || ""), forced = q.get("season");
    if (forced && known.indexOf(forced) >= 0) return forced;
    if (q.has("sandbox") || q.has("fast")) return ORDER[0]; // sandbox and test runs share one profile: a closed Spring there must not move them on to Summer
    if (o.slot && o.slot.season && known.indexOf(o.slot.season) >= 0) return o.slot.season;
    const closed = o.closed || {};
    for (let i = 0; i < ORDER.length; i++) if (known.indexOf(ORDER[i]) >= 0 && !closed[ORDER[i]]) return ORDER[i];
    return ORDER[ORDER.length - 1];
  }
  const prev = id => { const i = ORDER.indexOf(id); return i > 0 ? ORDER[i - 1] : null; }; // the season whose closing record this one starts from
  const next = id => { const i = ORDER.indexOf(id); return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null; }; // the season after this one (SM5: "Begin Summer")
  const api = { ORDER, pick, prev, next };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document && root.Spring && root.Save) {
    let slot = null, closed = {};
    try { const b = root.Save.load(); slot = b.slot; closed = b.closed || {}; } catch (e) {}
    const id = pick({ search: root.location.search, slot, closed, known: root.Spring.Season.list() });
    root.Spring.Season.use(id); root.LC_SEASON = id;
    document.querySelectorAll("script[data-season]").forEach(t => { if (t.getAttribute("data-season") === id) document.write('<script src="' + t.getAttribute("data-src") + '"><\/script>'); });
  }
  if (root) root.SeasonLoader = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
