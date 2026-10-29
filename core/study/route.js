// Study kit — the scene runner (card MBA-ST7). Plays the steps of projects/mba-game/study-route.json in file order.
// A change to the route file needs no change here. Headless state machine: the page draws each step; tests drive it directly.
// Rules: projects/studio/STUDY-DESIGNS.md section F. Log format: projects/studio/STUDY-LOG-SCHEMA.md.
(function (root) {
  const KINDS = { frame: 1, lesson: 1, scene: 1, deposit: 1, advance: 1, court: 1 };
  const FRAME_MS = 90 * 1000;

  // known: { records: [ids], scenes: [ids] } from the game. A lesson names a record; a scene names a scene.
  // Returns { steps } or { error } with the step id and the missing name. Nothing is partly loaded.
  function load(route, known) {
    if (!route || !Array.isArray(route.route) || !route.route.length) return { error: "study route: no steps in the route file" };
    if (!known || typeof known !== "object") return { error: "study route: the list of known records and scenes is missing" };
    const seen = {}, steps = [];
    for (let i = 0; i < route.route.length; i++) {
      const s = route.route[i], at = "study route step " + (i + 1) + (s && s.id ? " (" + s.id + ")" : "");
      if (!s || typeof s.id !== "string" || !s.id) return { error: at + ": the step has no id" };
      if (seen[s.id]) return { error: at + ": the id is used twice" };
      seen[s.id] = true;
      if (!KINDS[s.kind]) return { error: at + ": unknown kind '" + s.kind + "'" };
      if (s.kind === "lesson" && !(known.records || []).includes(s.record)) return { error: at + ": unknown record '" + s.record + "'" };
      if (s.kind === "scene" && !(known.scenes || []).includes(s.scene)) return { error: at + ": unknown scene '" + s.scene + "'" };
      if (s.kind === "advance" && !(s.toDay > 0)) return { error: at + ": an advance step needs toDay" };
      if (s.kind === "court" && !s.config) return { error: at + ": a court step needs config" };
      steps.push(s);
    }
    return { steps };
  }

  // opts: { route, known, log, now, stopMs }. stopMs defaults to route.stopMinutes (30) in minutes.
  function create(opts) {
    const loaded = load(opts.route, opts.known);
    if (loaded.error) return { error: loaded.error };
    const steps = loaded.steps, now = opts.now || Date.now, log = opts.log;
    const stopMs = opts.stopMs || (opts.route.stopMinutes || 30) * 60 * 1000;
    const engineSeed = opts.route.engine && opts.route.engine.newGame ? opts.route.engine.newGame.seed : undefined;
    let i = -1, t0 = null, tStep = null, state = "ready", reason = "";

    const stop = why => { // time ran out: close the open step, then the shell goes to the right-after form
      if (i >= 0 && state === "playing") close();
      state = "stopped"; reason = why;
    };
    const close = () => { const s = steps[i]; if (s.kind !== "frame" && log) log.sceneEnd(s.id, s.concept || ""); };
    const open = () => {
      const s = steps[i]; tStep = now();
      if (log) log.input("step"); // entering a step is an input: thinking inside it is not a pause
      if (s.kind !== "frame" && log) log.sceneStart(s.id, s.concept || "");
    };

    const run = {
      error: "",
      count: steps.length,
      state: () => state,
      reason: () => reason,
      elapsedMs: () => (t0 === null ? 0 : now() - t0),
      // The step the page should draw. Skip flags and the fixed seed ride on it; the page passes them to the engine.
      current() {
        if (state !== "playing") return null;
        const s = steps[i];
        return { id: s.id, kind: s.kind, index: i, concept: s.concept || "", day: s.day, seed: s.seed !== undefined ? s.seed : engineSeed, select: s.select || null, pre: s.pre || [], post: s.post || [], verbs: s.verbs || {}, step: s };
      },
      start() {
        if (state !== "ready") return false;
        t0 = now(); state = "playing"; i = 0; open(); return true;
      },
      // The page calls this on a timer and after every input. Returns the state.
      tick() {
        if (state !== "playing") return state;
        if (now() - t0 >= stopMs) { stop("time"); return state; }
        const s = steps[i];
        if (s.kind === "frame" && now() - tStep >= (s.seconds ? s.seconds * 1000 : FRAME_MS)) return run.next();
        return state;
      },
      // The current step is finished: close it and open the next. After the last step the state is "done".
      next() {
        if (state !== "playing") return state;
        if (now() - t0 >= stopMs) { stop("time"); return state; } // a step that ends after the mark still counts, but nothing new opens
        close();
        if (i + 1 >= steps.length) { state = "done"; reason = "route"; return state; }
        i++; open(); return state;
      },
    };
    return run;
  }

  const api = { load, create, FRAME_MS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyRoute = api;
})(typeof window !== "undefined" ? window : globalThis);
