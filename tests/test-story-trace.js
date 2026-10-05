// P6b: the story's lesson scenes, traced in Node with a mock game. Every dialogue box, choice, verb call and state change is logged for each scene
// under three player policies, then compared with tests/golden/ch1-spring/story-trace.json (recorded from the code BEFORE the scenes became data).
// Run: node tests/test-story-trace.js        Re-record (only for an agreed text change): node tests/test-story-trace.js --record
global.window = global; const fs = require("fs"), path = require("path");
const S = require("../core/engine.js"); global.Spring = S; global.Books = require("../core/books.js"); global.Transcript = require("../core/transcript.js"); global.Endings = require("../chapters/ch1/spring/endings.js");
const FILE = path.join(__dirname, "golden/ch1-spring/story-trace.json");
let LOG = [], POLICY = 0, N = 0;
const safe = x => JSON.parse(JSON.stringify(x, (k, v) => { if (typeof v === "function") { try { return "fn:" + JSON.stringify(v()); } catch (e) { return "fn"; } } return v; }));
const rec = (...a) => LOG.push(safe(a));
const pick = n => POLICY === 0 ? 0 : POLICY === 1 ? n - 1 : (N++ % n); // all first / all last / alternate
const labelOf = c => typeof c === "string" ? c : c.label;
// ---- a fake DOM, enough for nameFarm, weekCard and the cash-book panel ----
const stubs = {}, el = (tag) => { const e = { tag, style: {}, className: "", remove() {}, setAttribute() {}, addEventListener() {}, select() {}, appendChild(x) { if (x && x.id === "namefarm") setImmediate(() => x.querySelector("#nfdef").onclick()); },
  querySelector: sel => stubs[sel] || (stubs[sel] = { onclick: null, value: "Thornfield", select() {}, addEventListener() {}, remove() {} }), set innerHTML(v) {}, get innerHTML() { return ""; } }; return e; };
global.document = { querySelectorAll: () => [], createElement: el, getElementById: id => id === "wrap" ? el("wrap") : (stubs["#" + id] || (stubs["#" + id] = { onclick: null })) };
global.matchMedia = () => ({ matches: true }); global.window.matchMedia = global.matchMedia;
const world = { CHEST: { x: 5, y: 7 }, SACKS: { x: 10, y: 7 }, FWELL: { x: 13, y: 7 }, CRATE: { x: 11, y: 8 }, BOARD: { x: 20, y: 5 } };
global.Verbs = new Proxy({ P: {}, fmt: n => (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("en-US"), craneOn: false,
  rows: o => { rec("V.rows", o); return [{ tied: 100 }, { tied: 100 + (o.extra || 0) + (o.order ? o.order.sacks * o.order.price : 0) }]; },
  tag: async o => { rec("V.tag", o); }, wait: async () => {}, countTotal: async (k, n) => { rec("V.countTotal", k, n); }, stamp: async (a, b) => { rec("V.stamp", a, b); },
  bet: async o => { rec("V.bet", o); return { guess: 9, stake: pick(2) * 2, win: POLICY !== 1 }; }, revealBet: async () => { rec("V.revealBet"); return { win: POLICY !== 1 }; },
  timeline: async o => { rec("V.timeline", o); return { day: o.bill ? (POLICY === 1 ? o.bill.discBy + 3 : o.bill.discBy) : 9, paidNow: false, okLow: POLICY !== 1, okDay: POLICY === 0, low: 40, lowDay: 9 }; } },
  { get: (t, k) => k in t ? t[k] : (...a) => { rec("V." + k, ...a); } });
let S0, G;
function mkG() {
  const s = S.newGame({ story: true });
  const base = { s, world, act: fn => { rec("act"); return fn(); }, toast: t => rec("toast", t), goal: (...a) => rec("goal", ...a), save: () => {}, hud: () => {}, closeDlg() {}, hidePanel() {}, openDoc: f => f(), ledger: () => rec("G.ledger"), notebook: () => rec("G.notebook"), board: o => rec("G.board", o),
    showPanel: (k, html) => { rec("panel", k, html.replace(/\s+/g, " ")); setImmediate(() => stubs["#pgok"] && stubs["#pgok"].onclick && stubs["#pgok"].onclick()); },
    say: async (who, t, choices, spot) => { rec("say", who, t, choices && choices.map(labelOf), spot); if (!choices) return 0; const ok = choices.map((c, i) => [c, i]).filter(([c]) => !(c && c.disabled)).map(x => x[1]); return ok[pick(ok.length)]; },
    ask: async (who, t, answer, hints, spot, tol, docs, work, how) => { rec("ask", who, t, answer, hints, spot, tol, docs, work, how); },
    haggle: async (o, cfg) => { rec("haggle", o.who, cfg); return POLICY === 1 ? null : { price: cfg.open + 1 }; },
    page: async (a, b) => { rec("G.page", a, b); }, reveal: async (k, t) => { rec("reveal", k, t); }, pickLine: async (t, target, hints) => { rec("pickLine", t, target, hints); return POLICY === 0 ? 0 : 1; } };
  return base;
}
const idle = async () => { for (let i = 0; i < 200 && (Story.busy || i < 3); i++) await new Promise(r => setImmediate(r)); };
let Story;
function snap() { const st = Story.state, s = G.s; return safe({ ch: st.ch, stage: st.stage, notebook: st.notebook, pages: st.pages, pageDays: st.pageDays, clues: st.clues, farm: st.farm, extra: { pv: st.pv, tvmRate: st.tvmRate, tied1: st.tied1, book: st.book, mercy: st.mercy, planted0: st.planted0 },
  game: { day: s.day, cash: s.bal.cash, bal: s.bal, flags: s.flags, trust: s.trust, over: s.over, outcome: s.outcome, offers: s.offers.map(o => [o.who, o.sacks, o.price, o.due]), bills: s.bills, invoices: s.invoices.map(v => [v.who, v.amount, v.due]), payPlan: s.payPlan, rateAdj: s.rateAdj, seeds: s.seeds, quiet: s.quiet } }); }
const mastery = () => safe(Transcript.core());
// scenarios: [name, setup(G, st), act()]
const SC = [
  ["ch1 bailiff", (g, st) => { st.stage = "intro"; }, () => Story.start()],
  ["ch2 first seed", (g, st) => { st.ch = 2; st.stage = "tomas2"; g.s.bal.cash += 300; }, () => Story.onTalk("tomas")],
  ["ch3 bakery", (g, st) => { st.ch = 2; st.stage = "ashby3"; }, () => Story.onTalk("ashby")],
  ["ch4 hobb", (g, st) => { st.ch = 3; st.stage = "hobb4"; }, () => Story.onTalk("hobb")],
  ["ch4b hobb paid later", (g, st) => { st.ch = 4; st.stage = "ship4"; g.s.invoices.push({ id: 1, who: "hobb", amount: 81, due: g.s.day + 14 }); g.s.bal.ar = 81; g.s.bal.cash += 0; }, () => Story.after("deliver", { who: "hobb", value: 81, sacks: 9 })],
  ["after plant", (g, st) => { st.ch = 3; st.stage = "plant2"; st.planted0 = 0; g.s.seeds = 0; }, () => Story.after("plant")],
  ["after deliver ashby", (g, st) => { st.ch = 2; st.stage = "ship3"; }, () => Story.after("deliver", { who: "ashby", value: 42, sacks: 6 })],
  ["ch5 wages day", (g, st) => { st.ch = 5; st.stage = "sleep5"; g.s.day = 8; g.s.walkedOff = POLICY === 1; g.s.walkedWages = 20; }, () => Story.after("morning")],
  ["ch6 tomas terms", (g, st) => { st.ch = 6; st.stage = "tomas6"; g.s.trust.ezra = POLICY * 4; g.s.trust.tomas = 6; g.s.bal.cash += 200; }, () => Story.onTalk("tomas")],
  ["ch6 tomas none left", (g, st) => { st.ch = 6; st.stage = "tomas6"; g.s.bal.ap = -2000; }, () => Story.onTalk("tomas")],
  ["ch9t tomas again", (g, st) => { st.ch = 9; st.stage = "tomas9"; st.tvmRate = 3; g.s.day = 16; g.s.trust.ezra = 8; g.s.trust.tomas = 6; g.s.bal.cash += 200; }, () => Story.onTalk("tomas")],
  ["ch7 ezra", (g, st) => { st.ch = 7; st.stage = "ezra7"; g.s.day = 9; }, () => Story.onTalk("ezra")],
  ["ch7 ezra full", (g, st) => { st.ch = 7; st.stage = "ezra7"; g.s.day = 9; g.s.bal.loan = -280; }, () => Story.onTalk("ezra")],
  ["steward arrives", (g, st) => { st.ch = 8; st.stage = "sleep8"; g.s.day = 12; }, () => Story.after("morning")],
  ["duke 1", (g, st) => { g.s.day = 12; st.ch = 8; st.stage = "duke8"; g.s.offers.push({ id: 90, who: "duke", sacks: 24, price: 12, terms: 14, due: 24, paid: 0 }); }, () => Story.onTalk("duke")],
  ["duke 2", (g, st) => { g.s.day = 15; st.ch = 8; st.stage = "duke9"; st.tied1 = 300; g.s.offers.push({ id: 91, who: "duke", sacks: 48, price: 12, terms: 14, due: 27, paid: 0 }); }, () => Story.onTalk("duke")],
  ["duke gone", (g, st) => { g.s.day = 15; st.ch = 8; st.stage = "duke9"; }, () => Story.onTalk("duke")],
  ["edric page", (g, st) => { g.s.day = 13; st.ch = 8; st.stage = "page8"; }, () => Story.after("morning")],
  ["squeeze arrives", (g, st) => { g.s.day = 15; st.ch = 8; st.stage = "sleep9"; }, () => Story.after("morning")],
  ["week 3 mercy", (g, st) => { g.s.day = 17; st.ch = 9; st.stage = "run9"; st.pv = true; g.s.bal.cash = 3; }, () => Story.after("morning")],
  ["week 3 present value", (g, st) => { g.s.day = 17; st.ch = 9; st.stage = "run9"; g.s.invoices.push({ id: 7, who: "hobb", amount: 90, due: 30 }); g.s.bal.ar = 90; }, () => Story.after("morning")],
  ["week 4 cash book", (g, st) => { g.s.day = 22; st.ch = 9; st.stage = "run9"; st.pv = true; }, () => Story.after("morning")],
  ["cost scene", (g, st) => { g.s.day = 7; }, () => Story.testScene("cost")],
  ["pv scene", (g, st) => { g.s.day = 10; }, () => Story.testScene("pv")],
  ["crane offer first", (g, st) => {}, () => Story.testScene("offer")],
  ["close the books", (g, st) => { st.ch = 9; st.stage = "run9"; }, async () => { await Story.close({ is: { net: 55 }, cf: { change: -12 } }, { lines: ["cf:cfo"], text: "Cash fell: the invoices." }); }],
  ["keep floor", (g, st) => { g.s.day = 9; }, () => Story.keepFloor(8, 7)],
  ["note deposit", (g, st) => { g.s.day = 9; }, () => Story.noteDeposit({ who: "ashby", paid: 20, sacks: 8, due: 20 })],
  ["maud hint", (g, st) => { st.ch = 3; st.stage = "plant2"; }, () => Story.onTalk("maud")],
  ["maud week 4", (g, st) => { g.s.day = 23; st.ch = 9; st.stage = "run9"; }, () => Story.onTalk("maud")],
];
async function runAll() {
  const out = {};
  for (let pol = 0; pol < 3; pol++) for (const [name, setup, act] of SC) {
    POLICY = pol; N = 0; LOG = []; Object.keys(stubs).forEach(k => delete stubs[k]); Transcript.state && Transcript.reset && Transcript.reset();
    G = mkG(); window.__walked = false; Story.unstick(); Story.init(G, null); setup(G, Story.state); LOG.length = 0;
    try { await act(); await idle(); } catch (e) { LOG.push(["THROW", String(e && e.message || e)]); }
    out[name + " / policy " + pol] = { log: LOG, end: snap(), mastery: mastery() };
  }
  return out;
}
(async () => {
  Math.random = () => 0.5; // seeded: nothing in the story may depend on chance
  require("../chapters/ch1/spring/cast.js"); if (fs.existsSync(path.join(__dirname, "../core/scene.js"))) require("../core/scene.js");
  if (fs.existsSync(path.join(__dirname, "../chapters/ch1/spring/lessons.js"))) require("../chapters/ch1/spring/lessons.js");
  require("../chapters/ch1/spring/story.js"); Story = window.Story;
  { // every formula and verb a lesson record names exists, so a typo in the data cannot reach a player
    const miss = [], walk = (list, id) => (list || []).forEach(st => { if (st.calc && !Story.tables.CALC[st.calc]) miss.push(id + ":calc " + st.calc); if (st.verb && !Story.tables.VERB[st.verb]) miss.push(id + ":verb " + st.verb);
      walk(st.then, id); walk(st.else, id); (st.cases || []).forEach(c => walk(c, id)); (st.options || []).forEach(o => walk(o.then, id)); });
    window.Lessons.RECORDS.forEach(r => walk(r.steps, r.id)); console.log(miss.length ? "FAIL names missing: " + miss.join(", ") : "ok   every calc and verb named in lessons.js exists in story.js"); if (miss.length) process.exit(1); }
  const got = await runAll(), text = JSON.stringify(got, null, 1);
  if (process.argv.includes("--record")) { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, text); console.log("recorded " + Object.keys(got).length + " traces, " + text.length + " bytes"); process.exit(0); }
  const want = JSON.parse(fs.readFileSync(FILE, "utf8")); let fail = 0;
  for (const k of Object.keys(want)) {
    const a = JSON.stringify(want[k]), b = JSON.stringify(got[k]);
    if (a === b) console.log("ok   " + k); else { fail++; const wl = want[k].log, gl = (got[k] || { log: [] }).log, i = wl.findIndex((x, j) => JSON.stringify(x) !== JSON.stringify(gl[j])); console.log("FAIL " + k + (i >= 0 ? ` at step ${i}:\n   want ${JSON.stringify(wl[i]).slice(0, 400)}\n   got  ${JSON.stringify(gl[i]).slice(0, 400)}` : " (state differs after the log)" + (JSON.stringify(want[k].end) !== JSON.stringify(got[k].end) ? " :: end" : " :: mastery"))); }
  }
  console.log(fail ? `${fail} of ${Object.keys(want).length} traces differ` : `all ${Object.keys(want).length} story traces match`); process.exit(fail ? 1 : 0);
})();
