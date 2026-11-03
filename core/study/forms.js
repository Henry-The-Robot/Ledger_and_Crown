// Study kit — test forms A, B, C (card MBA-ST2). Format: projects/studio/STUDY-LOG-SCHEMA.md.
// A bank is { items: [{ id, concept, fixture?, forms: { A|B|C: { stem, options:[..], answer:<index> } } }] }.
// The MBA curriculum builder writes the real items; only fixture items ship here (fixture-items.js).
// Item order and option order come from the seed, so one seed gives one order for everyone; forms A, B, C keep the same order.
(function (root) {
  const FORMS = ["A", "B", "C"], DEFAULT_SCREEN_OUT = 80; // the line is a setting (config), not code: pass your own to screenedOut()

  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const shuffled = (arr, rand) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function loadBank(bank) {
    const items = bank && bank.items;
    if (!Array.isArray(items) || !items.length) return { error: "bank has no items" };
    const seen = {};
    for (const it of items) {
      if (!it.id || !it.forms) return { error: "item " + (it.id || "?") + " has no forms" };
      if (seen[it.id]) return { error: "duplicate item id " + it.id };
      seen[it.id] = 1;
      if (!it.concept) return { error: "item " + it.id + " has no concept" };
      if (new Set(FORMS.map(f => it.forms[f] && it.forms[f].options && it.forms[f].options.length)).size > 1) return { error: "item " + it.id + " has a different option count on some form" };
      for (const f of FORMS) {
        const x = it.forms[f];
        if (!x || !x.stem || !Array.isArray(x.options) || x.options.length < 2 || !(x.answer >= 0 && x.answer < x.options.length)) return { error: "item " + it.id + " form " + f + " is not valid" };
      }
    }
    return { items };
  }

  // Returns [{ id, concept, stem, options (shuffled), answerIndex }] for one form.
  function build(items, form, seed) {
    if (FORMS.indexOf(form) < 0) throw new Error("form must be A, B or C");
    const order = shuffled(items, rng(seed ^ 0x9E3779B1));
    return order.map(it => {
      const x = it.forms[form], idx = shuffled(x.options.map((_, i) => i), rng(seed ^ hash(it.id + form))); // the form is in the seed: the right answer does not sit in one screen position on A, B and C
      return { id: it.id, concept: it.concept, stem: x.stem, options: idx.map(i => x.options[i]), answerIndex: idx.indexOf(x.answer) };
    });
  }

  // answers[i] = chosen option index for built[i]; anything else (null, -1, out of range) is wrong.
  function score(built, answers) {
    let right = 0; const byConcept = {};
    built.forEach((q, i) => {
      const good = answers[i] === q.answerIndex, c = byConcept[q.concept] || (byConcept[q.concept] = { right: 0, total: 0 });
      c.total++; if (good) { c.right++; right++; }
    });
    return { right, total: built.length, pct: built.length ? (100 * right) / built.length : 0, byConcept };
  }
  const screenedOut = (pct, line) => pct >= (line === undefined ? DEFAULT_SCREEN_OUT : line);

  // Wires a built form to a study log: show(i) logs item_shown and starts the timer; answer(i, choiceIndex) logs item_answer.
  function run(log, built, form) {
    const shownAt = {}, given = [];
    return {
      show(i) { shownAt[i] = log.clock(); log.itemShown({ item: built[i].id, concept: built[i].concept, form }); },
      answer(i, choiceIndex) {
        const q = built[i], ok = choiceIndex === q.answerIndex;
        if (i in given || !(choiceIndex >= 0 && choiceIndex < q.options.length)) return false; // one answer per item; an invalid index is ignored (scores wrong)
        given[i] = choiceIndex;
        log.itemAnswer({ item: q.id, concept: q.concept, form, choice: q.options[choiceIndex], ok, rt: shownAt[i] === undefined ? undefined : log.clock() - shownAt[i] });
        return ok;
      },
      result() { return score(built, given); },
    };
  }

  const api = { FORMS, DEFAULT_SCREEN_OUT, loadBank, build, score, screenedOut, run };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyForms = api;
})(typeof window !== "undefined" ? window : globalThis);
