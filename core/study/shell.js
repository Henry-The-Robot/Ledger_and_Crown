// Study kit — the study build shell (card MBA-ST3). Order: participant code -> form A -> placeholder scenes -> form B -> result code.
// No saves, no menus, no other seasons. Headless state machine: study.html draws it; tests drive it directly.
// Format: projects/studio/STUDY-LOG-SCHEMA.md. Needs log.js and forms.js (browser: loaded before this file).
(function (root) {
  const isNode = typeof module !== "undefined" && module.exports;
  const req = n => (isNode ? require("./" + n) : root[n === "log.js" ? "Study" : "StudyForms"]);
  const Study = req("log.js"), Forms = req("forms.js");

  // PLACEHOLDER scenes until MBA-ST4 builds the real slice. Each scene is one scored decision with stakes in the final build.
  const PLACEHOLDER_SCENES = [
    { id: "ph-market", concept: "margin", options: ["price-high", "price-low"], right: 0 },
    { id: "ph-loan", concept: "tvm", options: ["take-now", "wait-a-year"], right: 0 },
  ];

  // opts: { search, bank, seed, now, screenOut, scenes }
  function create(opts) {
    opts = opts || {};
    const seed = opts.seed === undefined ? 1 : opts.seed | 0, screenLine = opts.screenOut === undefined ? Forms.DEFAULT_SCREEN_OUT : opts.screenOut;
    const log = Study.create({ search: opts.search, pc: "", seed, now: opts.now });
    const scenes = opts.scenes || PLACEHOLDER_SCENES, loaded = Forms.loadBank(opts.bank);
    let phase = log.enabled && !loaded.error ? "code" : "off", form = null, run = null, built = [], answered = {}, played = {}, decided = {}, scoreA = null, screened = false;

    const open = f => { form = f; built = Forms.build(loaded.items, f, seed); run = Forms.run(log, built, f); answered = {}; };
    const done = () => { phase = "result"; run = null; built = []; log.end(); }; // nothing can change the log after the result

    const sh = {
      enabled: log.enabled,
      phase: () => phase,
      scenes: () => (phase === "off" ? [] : scenes),
      items: () => (phase === "formA" || phase === "formB" ? built : []),
      screenedOut: () => screened,
      rows: () => log.rows(),
      // A missing or bad code blocks the start: nothing else runs until it is accepted.
      submitCode(code) {
        if (phase !== "code" || !log.setCode(typeof code === "string" ? code.trim() : "")) return false;
        log.start(); log.input("code"); phase = "formA"; open("A"); return true;
      },
      show(i) { if (!run || !built[i]) return false; run.show(i); return true; },
      answer(i, choiceIndex) {
        if (!run || !built[i] || i in answered || !(choiceIndex >= 0 && choiceIndex < built[i].options.length)) return false; // an invalid index is not an answer: the item stays open
        answered[i] = true; run.answer(i, choiceIndex); return true;
      },
      // Ends the current form. Form A: at or above the screen-out line the learner is screened out (no play, still a code).
      finishForm() {
        if (!run || built.some((_, i) => !(i in answered))) return false;
        if (phase === "formA") {
          scoreA = run.result();
          if (Forms.screenedOut(scoreA.pct, screenLine)) { screened = true; done(); return "result"; }
          phase = "play"; run = null; built = []; return "play";
        }
        done(); return "result";
      },
      playScene(id) {
        const sc = scenes.find(s => s.id === id);
        if (phase !== "play" || !sc || played[id]) return false;
        played[id] = true; log.input("scene"); log.sceneStart(id, sc.concept); return true; // entering a scene is an input: thinking inside a scene is not a pause
      },
      decide(id, choice, rt) {
        const sc = scenes.find(s => s.id === id);
        if (phase !== "play" || !sc || !played[id] || decided[id]) return false;
        decided[id] = true;
        log.decision({ scene: id, concept: sc.concept, choice, ok: choice === sc.options[sc.right], rt });
        log.sceneEnd(id, sc.concept); return true;
      },
      finishPlay() {
        if (phase !== "play" || scenes.some(s => !decided[s.id])) return false;
        phase = "formB"; open("B"); return "formB";
      },
      resultCode() { return phase === "result" ? log.resultCode() : ""; },
      resultCodeAsync() { return phase === "result" ? log.resultCodeAsync() : Promise.resolve(""); },
      // Time on task = first input to end (or the last event), minus each pause over 60 seconds.
      timeOnTask() {
        const rows = log.rows(), first = rows.find(r => r.ev === "input");
        if (!first) return 0;
        const last = rows[rows.length - 1].t, pauses = rows.filter(r => r.ev === "pause").reduce((s, r) => s + (r.rt || 0), 0);
        return Math.max(0, last - first.t - pauses);
      },
    };
    return sh;
  }

  const api = { create, PLACEHOLDER_SCENES };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyShell = api;
})(typeof window !== "undefined" ? window : globalThis);
