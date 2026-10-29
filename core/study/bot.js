// Study kit — the study bot (card MBA-ST10, plan B10). Plays study-route.json start to end without a page: it walks each lesson record
// the way a participant does (after the route's select flags), charges the plan's rates, and reports modeled minutes per step.
// It also checks that every concept S1..S10 fires a staked mechanic. Rates: projects/mba-game/STUDY-VERSION-PLAN.md section 1.
// Headless and pure: records come in as an argument ({ id: { steps } }, from Lessons.BY), so a test needs no browser.
(function (root) {
  const isNode = typeof module !== "undefined" && module.exports;
  const Sel = isNode ? require("./select.js") : root.StudySelect;

  const RATES = { wordsPerMin: 180, tapSec: 1.5, decisionSec: 15, quizSec: 60, checkSec: 15, practiceSec: 75, revealSec: 20, verbDefaultSec: 20,
    claimSec: 75, courtIntroSec: 15, courtVerdictSec: 20, wrongPresentSec: 20, wrongCheckSec: 10, transitionSec: 3, frameSec: 90 };
  // Seconds per verb (plan section 1). A verb the table lacks costs verbDefaultSec and is listed in the report.
  const VERB_SEC = { ch1Tag: 40, ch1Liab: 15, ch1Stamp: 5, haggle: 45, ch4bBet: 75, markupBet: 45, tvmTimeline: 60, loan: 15, buySeeds: 5, reveal: 20, pickLine: 45, tvmSettle: 5,
    ch1Open: 0, clearStamp: 0, parchClose: 0, logPage4: 0, nameFarm: 0, craneOffer: 0, craneOff: 0, costScene: 0, depositLesson: 20 };
  // Conditions that are true only on a path the study never takes (walk-off, game over, a repeat offer): the bot takes the else branch.
  const OFF_PATH = new Set(["over", "stuck", "walked", "again"]);
  // The mechanic that stakes each concept (plan section 4). `kind` names a step kind, `verb` a record verb, `op` a step op.
  const STAKED = { S1: { verb: ["ch1Tag", "ch1Stamp"] }, S2: { verb: ["buySeeds"] }, S3: { verb: ["haggle", "markupBet"] }, S4: { verb: ["ch4bBet"] }, S5: { kind: ["scene"] },
    S6: { kind: ["deposit"] }, S7: { verb: ["loan", "buySeeds"], needConcept: true }, S8: { op: ["practice", "claim"] }, S9: { verb: ["reveal"] }, S10: { verb: ["pickLine"] } };
  const VERB_CONCEPT = { reveal: "S9", pickLine: "S10" }; // the close record teaches S9 and S10; the route labels the step S10

  const words = t => { const s = String(t || "").replace(/<[^>]*>/g, " ").replace(/\{[^}]*\}/g, " V "); return s.split(/\s+/).filter(Boolean).length; };
  const readSec = n => n / RATES.wordsPerMin * 60;
  const btnCount = b => (Array.isArray(b) ? b.length : 0);

  // One record's steps -> { sec, events:[{verb|op}], unknown:[verbs] }. Follows the right-answer path.
  function walk(steps, policy, acc) {
    for (const s of steps) {
      if (s.if !== undefined && !s.master && !s.keep && (s.then || s.else)) {
        const c = s.if, off = typeof c === "string" ? OFF_PATH.has(c) : true; // {not: x}, {eq: ...}: x is true on the study path, so the else branch runs
        const branch = off ? s.else : s.then; if (branch) walk(branch, policy, acc);
        if (!off && branch && branch.some(x => x.end)) return; // an end on the main path ends the record
        continue;
      }
      if (s.end && !s.master) continue;
      if (s.master) { acc.sec += RATES.tapSec; continue; } // a mastery stamp is a box the player taps past (the study path earns it)
      if (s.speak !== undefined || s.tell !== undefined) {
        acc.sec += RATES.tapSec + readSec(words(s.text !== undefined ? s.text : s.tell));
        if (btnCount(s.buttons) > 1) acc.sec += RATES.decisionSec;
      } else if (s.page !== undefined) acc.sec += RATES.tapSec;
      else if (s.quiz !== undefined) { acc.sec += RATES.quizSec; if (policy === "wrong") acc.sec += RATES.wrongCheckSec; }
      else if (s.verb) {
        const a = s.args || {};
        let sec = VERB_SEC[s.verb];
        if (s.verb === "timeline") sec = a.mode === "predict" ? 90 : 30;
        if (sec === undefined) { sec = RATES.verbDefaultSec; acc.unknown.push(s.verb); }
        if (s.verb === "haggle" && a.rounds === 1) sec = 25; // one fixed round (plan section 1)
        sec += readSec(words(a.text !== undefined ? a.text : a.prompt)); // the verb's own prompt or caption is read on top of its action time
        acc.sec += sec; acc.events.push({ verb: s.verb });
        if (s.verb === "buySeeds" && a.credit) acc.events.push({ verb: "loan-credit" });
      } else if (s.check) { acc.sec += RATES.checkSec + readSec(words(s.check.text)); acc.events.push({ op: "check" }); if (policy === "wrong") acc.sec += RATES.wrongCheckSec; }
    }
  }

  // route: parsed study-route.json. records: { id: { steps } }. opts: { policy: "right" | "wrong" }.
  function play(route, records, opts) {
    const policy = (opts && opts.policy) || "right", rows = [], known = Object.keys(records || {});
    const get = id => { if (!records || !records[id]) throw new Error("study bot: unknown record '" + id + "'"); return records[id]; };
    const claims = (route.court && route.court.claims) || [];
    for (const st of route.route) {
      const acc = { sec: 0, events: [], unknown: [] }; let source = "walked";
      if (st.kind === "frame") { acc.sec = RATES.frameSec; source = "rate"; }
      else if (st.kind === "lesson") {
        let steps = Sel.select(get(st.record).steps, st.select, records);
        steps = Sel.overrideVerbs(steps, st.verbs);
        walk(steps, policy, acc);
        Object.keys(st.verbs || {}).forEach(v => { if (st.verbs[v].reveal === "now") { acc.sec += RATES.revealSec; acc.events.push({ op: "reveal-now" }); } }); // not a verb event: it must not count as S9's close-record reveal // plan: the bet's reveal comes from the forecast at once
        (st.after || []).forEach(x => { if (x.check) walk([x], policy, acc); else if (x.practice) { acc.sec += RATES.practiceSec; acc.events.push({ op: "practice", concept: x.concept }); } });
      } else if (st.kind === "deposit") {
        acc.sec = (st.minutes || 0) * 60; source = "route"; // the offer, the lesson text and the check: sized in the route (plan row S6)
        const steps = (st.steps || []).filter(x => x.check); steps.forEach(x => acc.events.push({ op: "check", concept: x.check.concept }));
        acc.events.push({ op: "accept" });
      } else if (st.kind === "scene") { acc.sec = (st.minutes || 0) * 60; source = "route"; }
      else if (st.kind === "advance") { acc.sec = (st.minutes || 0) * 60; source = "route"; }
      else if (st.kind === "court") {
        const n = claims.length, wrong = policy === "wrong" ? Math.ceil(n / 3) : 0;
        acc.sec = RATES.courtIntroSec + n * RATES.claimSec + wrong * RATES.wrongPresentSec + RATES.courtVerdictSec; source = "rate";
        claims.forEach(c => acc.events.push({ op: "claim", concept: c.concept }));
      }
      rows.push({ id: st.id, kind: st.kind, concept: st.concept || "", minutes: acc.sec / 60, source, events: acc.events, unknown: acc.unknown });
    }
    const glue = route.transitionMinutes !== undefined ? route.transitionMinutes : 0; // the route file states it: 10 transitions at 3 s (plan section 1)
    const total = rows.reduce((a, r) => a + r.minutes, 0) + glue;
    return { rows, glueMinutes: glue, totalMinutes: total, coverage: coverage(route, rows), unknown: [].concat(...rows.map(r => r.unknown)), known };
  }

  // Which of S1..S10 fire a staked mechanic on the route. A concept counts when a step labelled with it (or the verb's own concept) shows its mechanic.
  function coverage(route, rows) {
    const hit = {}, missing = [];
    rows.forEach(r => {
      r.events.forEach(e => {
        const c = e.concept || VERB_CONCEPT[e.verb] || r.concept;
        for (const id of Object.keys(STAKED)) {
          const m = STAKED[id];
          const ok = (m.verb && e.verb && m.verb.includes(e.verb) && (c === id || (e.verb === "reveal" && id === "S9") || (e.verb === "pickLine" && id === "S10") || (e.verb === "loan-credit" && id === "S7" && c === "S7")))
            || (m.op && e.op && m.op.includes(e.op) && e.concept === id) || (m.op && e.op === "practice" && e.concept === id);
          if (ok) hit[id] = (hit[id] || 0) + 1;
        }
      });
      const sk = STAKED[r.concept]; if (sk && sk.kind && sk.kind.includes(r.kind)) hit[r.concept] = (hit[r.concept] || 0) + 1;
    });
    Object.keys(STAKED).forEach(id => { if (!hit[id]) missing.push(id); });
    return { hit, missing, ok: missing.length === 0 };
  }

  const api = { play, coverage, walk, words, RATES, VERB_SEC, STAKED };
  if (isNode) module.exports = api; else root.StudyBot = api;
})(typeof window !== "undefined" ? window : globalThis);
