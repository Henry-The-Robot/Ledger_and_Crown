// Study kit — record selection (card MBA-ST9, plan B2/B5/B7). Pure helpers on a lesson record's steps; lessons.js is never edited.
// Every function returns new arrays and objects. With no options the steps come back equal to the input (the full game is unchanged).
// Options are documented in projects/mba-game/study-route.json "selectOptions".
(function (root) {
  const matches = (step, m) => !!m && Object.keys(m).length > 0 && Object.keys(m).every(k => step && step[k] === m[k]); // an empty matcher matches nothing
  const findFrom = (steps, m, from) => { for (let i = from; i < steps.length; i++) if (matches(steps[i], m)) return i; return -1; };

  // { from: {k:v}, to: {k:v} } -> [first, last] indexes, inclusive; null when either end is missing.
  function windowOf(steps, w) {
    const a = findFrom(steps, w && w.from, 0); if (a < 0) return null;
    const b = findFrom(steps, w.to, a); return b < 0 ? null : [a, b];
  }

  // records: { id: { steps } }, only needed for insertAfter. A bad option names itself in the error.
  function select(steps, opts, records) {
    if (!Array.isArray(steps)) throw new Error("study select: the record has no steps");
    let out = steps.map(s => Object.assign({}, s));
    opts = opts || {};
    const skipV = new Set(opts.skipVerbs || []), skipQ = new Set(opts.skipQuizzes || []);
    if (opts.window) { const w = windowOf(out, opts.window); if (!w) throw new Error("study select: window not found"); out = out.slice(w[0], w[1] + 1); }
    if (opts.skipWindow) { const w = windowOf(out, opts.skipWindow); if (!w) throw new Error("study select: skipWindow not found"); out = out.slice(0, w[0]).concat(out.slice(w[1] + 1)); }
    if (opts.untilVerb) { const i = out.findIndex(s => s.verb === opts.untilVerb); if (i < 0) throw new Error("study select: untilVerb '" + opts.untilVerb + "' not found"); out = out.slice(0, i); }
    if (opts.skipFirstSpeak) { const i = out.findIndex(s => s.speak !== undefined); if (i >= 0) out.splice(i, 1); }
    if (opts.insertAfter) {
      const ins = opts.insertAfter, src = records && records[ins.from && ins.from.record];
      if (!src) throw new Error("study select: insertAfter record '" + (ins.from && ins.from.record) + "' is not known");
      const w = ins.from.window ? windowOf(src.steps, ins.from.window) : [0, src.steps.length - 1];
      if (!w) throw new Error("study select: insertAfter window not found in '" + ins.from.record + "'");
      const at = findFrom(out, ins.match, 0); if (at < 0) throw new Error("study select: insertAfter match not found");
      out.splice(at + 1, 0, ...src.steps.slice(w[0], w[1] + 1).map(s => Object.assign({}, s)));
    }
    out = out.filter(s => !(s.verb && skipV.has(s.verb)) && !(s.quiz !== undefined && skipQ.has(s.answer)) && !(opts.skipPages && s.page !== undefined && !s.verb));
    if (opts.haggle && opts.haggle.rounds > 0) out = out.map(s => (s.verb === "haggle" ? Object.assign({}, s, { args: Object.assign({}, s.args, { rounds: opts.haggle.rounds }) }) : s));
    return out;
  }

  // Route "verbs": { verbName: { argName: value } } merged into the args of every step with that verb (plan B5: ch4bBet reveal "now").
  function overrideVerbs(steps, verbs) {
    if (!verbs) return steps.map(s => Object.assign({}, s));
    return steps.map(s => (s.verb && verbs[s.verb] ? Object.assign({}, s, { args: Object.assign({}, s.args, verbs[s.verb]) }) : Object.assign({}, s)));
  }

  // A three-option check (plan B7) as a data step. The runner shows `text` and the options; the pick logs an outcome with ok and rt.
  function checkStep(cfg) {
    const c = cfg && cfg.check ? cfg.check : cfg;
    if (!c || typeof c.text !== "string" || !c.text) throw new Error("study check: no text");
    if (!Array.isArray(c.options) || c.options.length !== 3) throw new Error("study check: a check has exactly three options");
    if (!(c.right >= 0 && c.right < 3) || c.right !== (c.right | 0)) throw new Error("study check: right must be 0, 1 or 2");
    return { check: { text: c.text, options: c.options.slice(), right: c.right, concept: c.concept || "" } };
  }
  function gradeCheck(step, pick) {
    const c = step.check; return { ok: pick === c.right, concept: c.concept, pick };
  }

  // Plan B11: the frame keeps Crane's walk, Maud's two lines and one line of Edric's first page, and it fixes the farm name.
  function frameSteps(frame, farmName) {
    const steps = (frame.steps || []).map(s => Object.assign({}, s));
    return { farmName: farmName || "Thornfield", seconds: frame.seconds || 90, steps: steps.map(s => (s.page !== undefined ? Object.assign({}, s, { lines: 1 }) : s)) };
  }

  // MBA-VO2: the boxes the study kit adds around a step, with the voice ids frame.js marks. Scene = the step id (the Court: "court").
  // deps: { deposits: R.deposits rows, introLines(study, of, pass), practiceText(id) -> string }. A practice problem takes its numbers from the player's books: dynamic true.
  const CHECK_YES = "Yes.", CHECK_NO = "Not quite. Keep it in mind.";
  function extraBoxes(step, route, deps) {
    const out = [], add = (id, who, text, more) => out.push(Object.assign({ scene: step.id, id, who, text }, more || {}));
    if (step.kind === "deposit") {
      const op = (step.pre || []).find(o => o.op === "placeOffer"), m = op && /^R\.deposits\[(\d+)\]$/.exec(op.from || ""), row = m && deps.deposits[+m[1]];
      if (!row) throw new Error("study voice: step " + step.id + " has no deposit row");
      add("deposit", row[0], row[6] || "I can pay part now, the rest when you deliver.");
    }
    (step.kind === "deposit" ? step.steps : step.after || []).forEach((x, i) => {
      if (x.check) { add("check" + i, "maud", x.check.text); add("check" + i + "-yes", "maud", CHECK_YES); add("check" + i + "-no", "maud", CHECK_NO); }
      else if (x.practice) add("practice" + i, "maud", deps.practiceText(x.practice), { dynamic: true });
    });
    if (step.kind === "court") { const c = route.court || {}, of = c.of || (c.claims || []).length; deps.introLines(c, of, c.pass || of).forEach((x, i) => add("intro-" + i, "maud", x)); }
    return out;
  }

  const api = { select, overrideVerbs, checkStep, gradeCheck, frameSteps, windowOf, extraBoxes, CHECK_YES, CHECK_NO };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudySelect = api;
})(typeof window !== "undefined" ? window : globalThis);
