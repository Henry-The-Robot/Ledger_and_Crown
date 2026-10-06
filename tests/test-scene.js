// P6a: the scene player (core/scene.js) and the scenes as data. Run: node tests/test-scene.js
global.window = global; const S = require("../core/engine.js"); global.Spring = S; const K = require("../core/scene.js"); require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js"); const SC = window.Scenes;
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const mk = (s, pick, log) => ({ s, S, lines: async (w, a) => { log.push(["lines", w, a.length]); }, ask: async (w, t, labels) => { log.push(["ask", w, labels]); return Math.min(pick, labels.length - 1); }, maud: async t => { log.push(["maud"]); },
  flag: (k, v) => { s.flags[k] = v; log.push(["flag", k, v]); }, clue: () => { log.push(["clue"]); }, trust: (w, d) => { log.push(["trust", w, d]); }, letter: async i => { log.push(["letter", i]); } });
const newS = day => { const s = S.newGame(); s.day = day; return s; };
(async () => {
  // the format: every record has an id, a person, a start day, a hint and steps; every step is a known kind
  const KINDS = ["say", "ask", "maud", "flag", "trust", "clue", "letter", "op"], bad = [];
  const walk = (list, id) => list.forEach(st => { const ks = KINDS.filter(k => k in st); if (ks.length !== 1 && !(ks.includes("say") && ks.length === 2)) bad.push(id); if (st.ask) st.options.forEach(o => walk(o.then || [], id)); });
  SC.RECORDS.forEach(r => { if (!(r.id && r.who && r.from && r.hint && Array.isArray(r.steps))) bad.push(r.id); walk(r.steps, r.id); });
  ok(bad.length === 0 && SC.RECORDS.length === 12, "12 scene records, each with id, who, from, hint and known steps" + (bad.length ? " :: " + bad : ""));
  ok(SC.SC.every(x => typeof x.run === "function"), "each record can be played with run(c)");
  // conditions
  { const s = newS(14); ok(K.need(null, s) && !K.need({ flag: "f" }, s) && (s.flags = { f: 1 }, K.need({ flag: "f" }, s)), "need: no condition is true; a flag condition reads s.flags");
    let thrown = false; try { K.need({ nope: 1 }, s); } catch (e) { thrown = true; } ok(thrown, "need: an unknown condition throws (a typo cannot pass silently)");
    s.invoices.push({ id: 1, who: "hobb", amount: 90, due: s.day }); ok(!K.need({ invoiceOpen: "hobb" }, s), "need: an invoice due today is not open"); s.invoices[0].due = s.day + 1; ok(K.need({ invoiceOpen: "hobb" }, s), "need: an invoice due tomorrow is open"); }
  // text fill by hand calculation: invoice 91 -> half is 45 (rounded down)
  { const s = newS(14); s.invoices.push({ id: 1, who: "hobb", amount: 91, due: 20 }); const v = K.vars(SC.BY.hobb_extension, s); ok(v.amt === 91 && v.half === 45, "vars: amt 91, half 45"); const log = []; await SC.BY.hobb_extension.run(mk(s, 2, log));
    const ask = log.find(l => l[0] === "ask"); ok(ask[2][2] === "Half now, half in a week (45 today).", "the half option names the real half"); ok(log.find(l => l[0] === "lines").length === 3, "lines run");
    ok(s.invoices[0].amount === 46 && s.invoices[0].due === 27 && s.bal.cash === S.newGame().bal.cash + 45, "half now: 45 of Cash in, 46 left on the invoice, due a week later"); }
  { const s = newS(14); s.invoices.push({ id: 1, who: "hobb", amount: 90, due: 20 }); const log = []; await SC.BY.hobb_extension.run(mk(s, 0, log)); ok(s.invoices[0].due === 27 && s.invoices[0].amount === 90 && s.flags.hobbExt === "gave" && log.filter(l => l[0] === "maud").length === 1, "delay: due moves a week, amount stays"); }
  { const s = newS(14); s.invoices.push({ id: 1, who: "hobb", amount: 90, due: 20 }); const log = []; await SC.BY.hobb_extension.run(mk(s, 1, log)); ok(s.invoices[0].due === 20 && s.flags.hobbExt === "refused" && log.some(l => l[0] === "trust" && l[2] === -1), "refuse: nothing moves, trust -1"); }
  // an out-of-range pick falls to the last option; an unknown step throws
  { const log = []; await SC.BY.maud_abacus.run(mk(newS(9), 9, log)); ok(log.some(l => l[0] === "lines") && log.some(l => l[0] === "trust"), "a pick past the last option plays the last option"); }
  { let thrown = false; try { await K.play({ id: "x", steps: [{ boom: 1 }] }, mk(newS(9), 0, [])); } catch (e) { thrown = true; } ok(thrown, "an unknown step throws"); }
  // P6b story steps, by hand calculation
  { const calls = [], c = { s: newS(9), S, tell: async (t, spot) => calls.push(["tell", t, spot]), speak: async (w, t, b) => { calls.push(["speak", w, t, b]); return 1; }, calc: (n, v) => ({ sum: v.a + 5 }), remember: (k, x) => calls.push(["remember", k, x]),
      keep: k => calls.push(["keep", k]), addEx: (id, t) => calls.push(["addEx", id, t]), pin: (...a) => calls.push(["pin", a]), to: (a, b) => calls.push(["to", a, b]), page: async i => calls.push(["page", i]), master: id => calls.push(["master", id]),
      verb: async (n, a, v, lazy) => { calls.push(["verb", n, a, lazy]); return 7; }, quiz: async (q, v) => calls.push(["quiz", q.text, q.answer, q.hints, q.work]) };
    const rec = { id: "t", steps: [{ set: ["a", 3] }, { calc: "x" }, { tell: "Sum {sum}.", spot: ["h"] }, { set: ["big", 12345] }, { tell: "Sum {sum}, big {big|money}." },
      { speak: "maud", text: "Pick", buttons: ["One {a}", { label: "Two", off: "no" }], as: "c" }, { set: ["no", true] }, { speak: "maud", text: "Again", buttons: [{ label: "Off", off: "no" }] },
      { if: { eq: ["c", 1] }, then: [{ let: ["w", "picked {c}"] }, { tell: "{w}" }], else: [{ tell: "never" }] }, { if: { not: "no" }, then: [{ tell: "never2" }], else: [{ tell: "else ok" }] },
      { pick: "c", cases: [[{ tell: "case0" }], [{ tell: "case1" }]] }, { pick: "big", cases: [[{ tell: "case0" }], [{ tell: "last" }]] },
      { keep: { id: "k", term: "T {a}", line: "L", example: "E {sum}" } }, { addEx: ["k", "more {a}"] }, { pin: ["p", "t", "{a}", "f"] }, { to: [2, "s"] }, { page: 4 }, { master: "m", if: "no" }, { master: "n", if: { not: "no" } },
      { remember: ["k2", { var: "sum" }] }, { remember: ["k3", 5] }, { verb: "v", args: { x: "a{a}", n: 4, o: { y: ["z{a}"] } }, lazy: { q: "{later}" }, as: "r" }, { tell: "r is {r}" },
      { quiz: "Q {a}", answer: "sum", hints: ["h {a}"], work: "W {a}" }, { if: "no", then: [{ end: 1 }] }, { tell: "unreachable" }] };
    const done = await K.play(rec, c); const t = calls.filter(x => x[0] === "tell").map(x => x[1]);
    ok(done === false && !t.includes("unreachable"), "play: an `end` step stops the scene, and play answers false");
    ok(JSON.stringify(t) === JSON.stringify(["Sum 8.", "Sum 8, big 12,345.", "picked 1", "else ok", "case1", "last", "r is 7"]), "story steps: tell, let, if, not, pick (out of range = last), verb result: texts in order " + JSON.stringify(t));
    ok(JSON.stringify(calls.find(x => x[0] === "tell")[2]) === '["h"]', "tell passes its spot");
    const sp = calls.filter(x => x[0] === "speak"); ok(JSON.stringify(sp[0][3]) === JSON.stringify(["One 3", { label: "Two", disabled: false }]) && JSON.stringify(sp[1][3]) === JSON.stringify([{ label: "Off", disabled: true }]), "speak: buttons fill and `off` reads the variable at that moment");
    ok(JSON.stringify(calls.find(x => x[0] === "keep")[1]) === JSON.stringify({ id: "k", term: "T 3", line: "L", example: "E 8" }), "keep: every text is filled");
    ok(JSON.stringify(calls.find(x => x[0] === "addEx")) === '["addEx","k","more 3"]' && JSON.stringify(calls.find(x => x[0] === "pin")[1]) === '["p","t","3","f"]' && JSON.stringify(calls.find(x => x[0] === "to")) === '["to",2,"s"]', "addEx, pin and to");
    ok(calls.filter(x => x[0] === "master").map(x => x[1]).join() === "m", "master runs only when its `if` holds");
    ok(JSON.stringify(calls.filter(x => x[0] === "remember")) === '[["remember","k2",8],["remember","k3",5]]', "remember: a {var} reads the variable, a plain value stays");
    ok(JSON.stringify(calls.find(x => x[0] === "verb")) === '["verb","v",{"x":"a3","n":4,"o":{"y":["z3"]}},{"q":"{later}"}]', "verb: args are filled deeply, numbers stay numbers, lazy texts stay as written");
    ok(JSON.stringify(calls.find(x => x[0] === "quiz").slice(1)) === '["Q 3",8,["h 3"],"W 3"]', "quiz: text, hints and work are filled; the answer is the variable's value"); }
  { const calls = [], c = { s: newS(9), S, tell: async t => calls.push(t), calc: () => ({ n: 4 }) }; const done = await K.play({ id: "u", steps: [{ calc: "q" }, { tell: "n={n}" }] }, c); ok(done === true && calls[0] === "n=4", "play: a scene that runs to the end answers true; calc variables fill text"); }
  { let msg = ""; try { await K.play({ id: "u", steps: [{ tell: "oops {nope}" }] }, { s: newS(9), S, tell: async () => {} }); } catch (e) { msg = e.message; } ok(/unknown name \{nope\}/.test(msg), "a text with an unknown {name} throws"); }
  { const calls = []; await K.play({ id: "u", steps: [{ speak: "tomas", text: "x", buttons: ["a", { label: "b {n}", off: "no" }, { label: "c", off: "yes" }], as: "c" }] }, { s: newS(9), S, speak: async (w, t, b) => { calls.push(b); return 0; } }, { n: 2, no: false, yes: true });
    ok(JSON.stringify(calls[0]) === JSON.stringify(["a", { label: "b 2", disabled: false }, { label: "c", disabled: true }]), "speak: a button with `off` becomes { label, disabled } from the variable"); }
  { const calls = []; await K.play({ id: "u", steps: [{ verb: "v", args: { t: "a {x}" }, lazy: { l: "{later}" } }] }, { s: newS(9), S, verb: async (n, a, v, lazy) => { calls.push([a, lazy]); } }, { x: 1 }); ok(calls[0][0].t === "a 1" && calls[0][1].l === "{later}", "verb: args are filled, lazy texts stay as written"); }
  ok(K.fill("{a|money}", { a: 1234567 }) === "1,234,567", "fill: {name|money} adds thousands separators");
  process.exit(fail ? 1 : 0);
})();
