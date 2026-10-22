// Study kit — reading page state machine for the control arm (card MBA-ST6). Rules: STUDY-DESIGNS.md F1 and F3.
// Headless: a page draws it and calls show(id) when a section comes into view and activity() on scroll, click or key.
// Active time = time since start minus every gap over 60 s between activity (the log writes those gaps as pause rows).
// Done unlocks at 10 minutes of active time. Hard stop at 30 minutes of clock time since start.
(function (root) {
  const UNLOCK_MS = 10 * 60 * 1000, CAP_MS = 30 * 60 * 1000;

  // opts: { log (a Study log, already enabled), sections: [{id}], now }
  function create(opts) {
    const log = opts.log, sections = opts.sections || [], now = opts.now || (() => Date.now());
    const ids = new Set(sections.map(s => s.id));
    let started = null, ended = false, seen = {};

    const active = () => {
      if (started === null) return 0;
      const end = ended ? ended : now();
      const rows = log.rows(), pauses = rows.filter(r => r.ev === "pause").reduce((s, r) => s + (r.rt || 0), 0);
      let open = 0; // a pause not yet written: the current gap, once it is over 60 s
      if (!ended) { const gap = end - lastSeen; if (gap > 60000) open = gap; }
      return Math.max(0, end - started - pauses - open);
    };
    let lastSeen = 0;

    const rd = {
      sections: () => sections,
      start() { if (started !== null) return false; started = lastSeen = now(); log.readStart(); return true; },
      activity() { if (started === null || ended) return false; log.activity(); lastSeen = now(); return true; }, // writes the pause row first, then resets the clock
      show(id) { // each section is logged once, when it first comes into view
        if (started === null || ended || !ids.has(id) || seen[id]) return false;
        rd.activity(); seen[id] = true; log.readSection(id); return true;
      },
      activeMs: active,
      sectionsSeen: () => Object.keys(seen).length,
      canFinish: () => started !== null && !ended && active() >= UNLOCK_MS,
      expired: () => started !== null && !ended && now() - started >= CAP_MS,
      // The done button. False before 10 minutes of active time; the cap ends the reading by itself.
      finish() {
        if (started === null || ended) return false;
        if (!rd.canFinish() && !rd.expired()) return false;
        ended = now(); log.readEnd(); return true;
      },
      ended: () => ended !== false,
    };
    return rd;
  }

  const api = { create, UNLOCK_MS, CAP_MS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyReading = api;
})(typeof window !== "undefined" ? window : globalThis);
