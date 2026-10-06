// Ledger & Crown — the scene player. A scene is a plain record (data); this file plays it. A chapter lists records and never writes code for a scene.
// Record: { id, who, from, to?, at?, card?, need?, bind?, hint, steps: [step, ...] }.  Format guide: chapters/README.md.
// Steps (each is one key of the object):
//   { say: who, lines: [text, ...] }             a run of dialogue boxes
//   { ask: who, text, options: [{ label, then: [step, ...] }, ...] }   a choice; the picked option's `then` steps run next
//   { maud: text }  { flag: [key, value] }  { trust: [who, delta] }  { clue: 1 }  { letter: index }
//   { op: "delay", who, days }                   push that person's open invoice due date out by `days`
//   { op: "halfNow", who, days, note }           that person pays half the invoice now (a `collect` entry), the rest is due `days` later
// Story steps (P6b; the lesson chapters of a season). They talk to the chapter through `c`, so the player knows no season:
//   { tell: text, spot? }                        Maud says one box (spot: the books she points at)
//   { speak: who, text, buttons?, as? }          one box with buttons; the index picked goes to variable `as`. A button is a string or { label, off: variable }
//   { quiz: text, answer: variable, hints, tol?, docs?, work?, how?, spot? }   the player types a number; Maud checks it
//   { calc: name }                               the chapter's named formula runs on the variables and returns new ones (code stays in the chapter)
//   { set: [name, value] }  { let: [name, text] }  { remember: [key, value|{var}] }   put a value (or filled text) in a variable / in the chapter's story state
//   { if: cond, then: [..], else?: [..] }        cond: variable name | { not: cond } | { eq: [variable, value] }
//   { pick: variable, cases: [[..], [..]] }      run the case at that index (out of range: the last)
//   { keep: { id, term, line, example, num?, from? } }   { addEx: [id, text] }   { pin: [id, term, num, from, kind?] }
//   { to: [chapter, stage] }   { page: index }   { master: id, if?: cond }   { end: 1 }   stop the scene; play() then answers false
//   { verb: name, args?, lazy?, as? }            a game action or verb the chapter owns; args are filled as text; `lazy` texts stay unfilled for the verb to fill later; the result goes to `as`
// Text may hold {name} (any variable) and {name|money} (thousands). {amt} and {half} are the open invoice (set by `bind: { invoice: who }`) and half of it, rounded down.
// An unknown {name} throws, so a typo cannot reach a player.
// `need` (a condition on state s): { flag: key } | { invoiceOpen: who }  (an open invoice of theirs, due after today).
(function () {
  const open = (s, who) => (s.invoices || []).find(v => v.who === who && v.due > s.day) || (s.invoices || []).find(v => v.who === who) || null;
  function need(cond, s) {
    if (!cond) return true;
    if (cond.flag) return !!(s.flags && s.flags[cond.flag]);
    if (cond.invoiceOpen) return (s.invoices || []).some(v => v.who === cond.invoiceOpen && v.due > s.day);
    throw new Error("scene: unknown condition " + JSON.stringify(cond));
  }
  function vars(rec, s) {
    if (!rec.bind || !rec.bind.invoice) return {};
    const inv = open(s, rec.bind.invoice), amt = inv ? inv.amount : 0;
    return { amt, half: Math.floor(amt / 2) };
  }
  const FMT = { money: n => Number(n).toLocaleString("en-US") };
  const fill = (t, v) => String(t).replace(/\{(\w+)(?:\|(\w+))?\}/g, (m, k, f) => {
    if (!(k in v)) throw new Error("scene: unknown name {" + k + "} in " + JSON.stringify(String(t).slice(0, 60)));
    if (f && !FMT[f]) throw new Error("scene: unknown format " + f);
    return f ? FMT[f](v[k]) : v[k];
  });
  const deep = (a, v) => typeof a === "string" ? fill(a, v) : Array.isArray(a) ? a.map(x => deep(x, v)) : a && typeof a === "object" ? Object.fromEntries(Object.entries(a).map(([k, x]) => [k, deep(x, v)])) : a;
  function test(cond, v) {
    if (typeof cond === "string") return !!v[cond];
    if (cond && cond.not !== undefined) return !test(cond.not, v);
    if (cond && cond.eq) return v[cond.eq[0]] === cond.eq[1];
    throw new Error("scene: unknown test " + JSON.stringify(cond));
  }
  const btn = (b, v) => typeof b === "string" ? fill(b, v) : Object.assign({ label: fill(b.label, v) }, b.off ? { disabled: !!v[b.off] } : {});
  // returns true when a step ended the scene (`end`), so every caller stops too
  async function steps(list, rec, c, v) {
    for (const st of list) {
      if (st.say != null) await c.lines(st.say, st.lines.map(t => fill(t, v)));
      else if (st.ask != null) {
        const k = await c.ask(st.ask, fill(st.text, v), st.options.map(o => fill(o.label, v)));
        if (await steps((st.options[k] || st.options[st.options.length - 1]).then || [], rec, c, v)) return true;
      }
      else if (st.maud != null) await c.maud(fill(st.maud, v));
      else if (st.flag) c.flag(st.flag[0], st.flag[1]);
      else if (st.trust) c.trust(st.trust[0], st.trust[1]);
      else if (st.clue) c.clue();
      else if (st.letter != null) await c.letter(st.letter);
      else if (st.op === "delay") { const inv = open(c.s, st.who); if (inv) inv.due += st.days; }
      else if (st.op === "halfNow") {
        const inv = open(c.s, st.who), half = inv ? Math.floor(inv.amount / 2) : 0;
        if (inv) { c.S.post(c.s, "collect", st.note, { cash: half, ar: -half }); inv.amount -= half; inv.due += st.days; }
      }
      else if (st.tell != null) await c.tell(fill(st.tell, v), st.spot);
      else if (st.speak != null) { const r = await c.speak(st.speak, fill(st.text, v), st.buttons && st.buttons.map(b => btn(b, v))); if (st.as) v[st.as] = r; }
      else if (st.quiz != null) await c.quiz(Object.assign({}, st, { text: fill(st.quiz, v), hints: (st.hints || []).map(t => fill(t, v)), answer: v[st.answer], work: st.work && fill(st.work, v), how: st.how && fill(st.how, v) }), v);
      else if (st.calc) Object.assign(v, c.calc(st.calc, v));
      else if (st.set) v[st.set[0]] = st.set[1];
      else if (st.let) v[st.let[0]] = fill(st.let[1], v);
      else if (st.remember) c.remember(st.remember[0], st.remember[1] && st.remember[1].var ? v[st.remember[1].var] : st.remember[1]);
      else if (st.if !== undefined && !st.keep && !st.master) { if (await steps(test(st.if, v) ? st.then || [] : st.else || [], rec, c, v)) return true; }
      else if (st.pick) { if (await steps(st.cases[v[st.pick]] || st.cases[st.cases.length - 1], rec, c, v)) return true; }
      else if (st.keep) c.keep(deep(st.keep, v));
      else if (st.addEx) c.addEx(st.addEx[0], fill(st.addEx[1], v));
      else if (st.pin) c.pin(...st.pin.map(x => typeof x === "string" ? fill(x, v) : x));
      else if (st.to) c.to(st.to[0], st.to[1]);
      else if (st.page != null) await c.page(st.page);
      else if (st.master) { if (st.if === undefined || test(st.if, v)) c.master(st.master); }
      else if (st.end) return true;
      else if (st.verb) { const r = await c.verb(st.verb, deep(st.args || {}, v), v, st.lazy); if (st.as) v[st.as] = r; }
      else throw new Error("scene " + rec.id + ": unknown step " + JSON.stringify(st));
    }
    return false;
  }
  async function play(rec, c, init) { return !(await steps(rec.steps, rec, c, Object.assign(vars(rec, c.s), init || {}))); }
  const api = { play, need, vars, fill };
  if (typeof window !== "undefined") window.SceneKit = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
