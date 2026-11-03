// Study-mode adjustments (MBA-ST9): select helper, reveal-now, auto-ship, quiet, hidden menus, 90-second frame, checks.
// Run: node tests/test-study-mode.js
const fs = require("fs"), path = require("path");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const throws = (f, re, m) => { try { f(); ok(false, m + " (no error)"); } catch (e) { ok(re.test(e.message), m + ": " + e.message); } };
const Sel = require("../core/study/select.js"), Mode = require("../core/study/mode.js"), Route = require("../core/study/route.js");

const steps = () => [
  { speak: "crane", text: "first" }, { verb: "ch1Open" }, { page: 0 }, { verb: "nameFarm" }, { quiz: "cost?", answer: "cost" }, { quiz: "p6?", answer: "p6" },
  { speak: "tomas", text: "markup" }, { verb: "markupBet" }, { master: "margin" }, { verb: "haggle", args: { open: 6, walk: 7 } }, { verb: "tvmTimeline" }, { tell: "end" },
];
const verbs = ss => ss.map(s => s.verb || (s.quiz ? "q:" + s.answer : s.page !== undefined ? "page" : s.speak ? "say:" + s.speak : s.master ? "m:" + s.master : "tell")).join();

// 1. No options: the steps come back equal and the input is not changed (the full game's path)
const base = steps(), before = JSON.stringify(base);
ok(JSON.stringify(Sel.select(base, {})) === before && JSON.stringify(Sel.select(base)) === before, "no options returns equal steps");
ok(JSON.stringify(base) === before, "the input is never mutated");
ok(JSON.stringify(Sel.overrideVerbs(base, null)) === before, "no verb overrides returns equal steps");

// 2. Each select option
ok(!verbs(Sel.select(steps(), { skipVerbs: ["nameFarm", "ch1Open"] })).includes("nameFarm"), "skipVerbs drops the named verbs");
ok(verbs(Sel.select(steps(), { skipQuizzes: ["cost"] })).split(",").filter(x => x.startsWith("q:")).join() === "q:p6", "skipQuizzes drops one quiz by answer variable");
ok(!verbs(Sel.select(steps(), { skipPages: true })).includes("page"), "skipPages drops page steps");
ok(verbs(Sel.select(steps(), { skipFirstSpeak: true })).startsWith("ch1Open"), "skipFirstSpeak drops the first speak only");
ok(verbs(Sel.select(steps(), { skipFirstSpeak: true })).includes("say:tomas"), "skipFirstSpeak keeps later speaks");
ok(verbs(Sel.select(steps(), { untilVerb: "tvmTimeline" })).endsWith("haggle"), "untilVerb stops before that verb");
ok(verbs(Sel.select(steps(), { window: { from: { speak: "tomas" }, to: { master: "margin" } } })) === "say:tomas,markupBet,m:margin", "window keeps the inclusive run");
ok(!verbs(Sel.select(steps(), { skipWindow: { from: { speak: "tomas" }, to: { master: "margin" } } })).includes("markupBet"), "skipWindow drops the run");
const hag = Sel.select(steps(), { haggle: { rounds: 1 } }).find(s => s.verb === "haggle");
ok(hag.args.rounds === 1 && hag.args.open === 6 && !("rounds" in base.find(s => s.verb === "haggle").args), "haggle rounds is set on a copy and keeps the other args");
const recs = { ch5: { steps: steps() } };
const ins = Sel.select([{ verb: "a" }, { master: "margin" }, { verb: "z" }], { insertAfter: { match: { master: "margin" }, from: { record: "ch5", window: { from: { speak: "tomas" }, to: { master: "margin" } } } } }, recs);
ok(verbs(ins) === "a,m:margin,say:tomas,markupBet,m:margin,z", "insertAfter puts another record's window after the first match");

// 3. Failure cases name the problem
throws(() => Sel.select(steps(), { untilVerb: "nope" }), /untilVerb 'nope'/, "an unknown untilVerb is an error");
throws(() => Sel.select(steps(), { window: { from: { speak: "zz" }, to: { master: "margin" } } }), /window not found/, "a missing window is an error");
throws(() => Sel.select(steps(), { insertAfter: { match: { master: "margin" }, from: { record: "ch99" } } }, recs), /'ch99'/, "an unknown insert record is an error");
throws(() => Sel.select(null, {}), /no steps/, "a record without steps is an error");

// 4. Bet reveal now (B5): the override reaches the verb's args; other verbs are untouched
const ov = Sel.overrideVerbs([{ verb: "ch4bBet", args: { prompt: "p" } }, { verb: "haggle", args: {} }], { ch4bBet: { reveal: "now" } });
ok(ov[0].args.reveal === "now" && ov[0].args.prompt === "p" && !("reveal" in ov[1].args), "ch4bBet gets reveal now; haggle does not");
// the verb reads a.reveal === "now" and falls back to the delayed day (story.js)
const storyJs = fs.readFileSync(path.join(__dirname, "..", "chapters", "ch1", "spring", "story.js"), "utf8");
ok(/reveal: a\.reveal === "now" \? "now" : \{ day: v\.revealDay \}/.test(storyJs), "story.js reads reveal now and keeps the delayed reveal as the default");
ok(/rounds: a\.rounds/.test(storyJs) && /cfg\.rounds \|\| 4/.test(fs.readFileSync(path.join(__dirname, "..", "core", "game.js"), "utf8")), "the haggle round limit is wired and defaults to 4");

// 5. Three-option checks (B7)
const chk = Sel.checkStep({ check: { text: "Revenue earned?", options: ["122", "0", "243"], right: 1, concept: "S6" } });
ok(chk.check.options.length === 3 && Sel.gradeCheck(chk, 1).ok && !Sel.gradeCheck(chk, 0).ok && Sel.gradeCheck(chk, 0).concept === "S6", "a check grades the right option only and carries its concept");
throws(() => Sel.checkStep({ text: "x", options: ["a", "b"], right: 0 }), /three options/, "two options is an error");
throws(() => Sel.checkStep({ text: "x", options: ["a", "b", "c"], right: 3 }), /right must be/, "a right index out of range is an error");
throws(() => Sel.checkStep({ text: "", options: ["a", "b", "c"], right: 0 }), /no text/, "a check with no text is an error");

// 6. Study switches: off without ?study=1 (failure case: any change visible in the full game)
const rt = { engine: { quiet: true, notices: "decline" } };
for (const q of ["", "?", "?study=0", "?studyx=1", "?x=study=1"]) { const m = Mode.mode(q, rt); ok(!m.on && !m.quiet && !m.autoShip && !m.hideMenus && !m.hideSaves && !m.noticesDecline, "mode is off for '" + q + "'"); }
const on = Mode.mode("?study=1&pc=kv7q2m", rt);
ok(on.on && on.quiet && on.autoShip && on.hideMenus && on.hideSaves && on.noticesDecline, "mode is on for ?study=1");
ok(Mode.mode("?study=1", { engine: { quiet: false } }).quiet === false, "quiet follows the route file");
const gameS = { quiet: false };
ok(Mode.holdQuiet(gameS, Mode.OFF) === false && gameS.quiet === false, "quiet is not forced in the full game");
ok(Mode.holdQuiet(gameS, on) === true && gameS.quiet === true, "quiet is held true in study mode");
let shipped = []; const Spring = { deliver: (s, id) => { shipped.push(id); return { ok: true }; } };
ok(Mode.autoShip(Spring, {}, 7, Mode.OFF) === null && shipped.length === 0, "no auto-ship in the full game");
ok(Mode.autoShip(Spring, { orders: [{ id: 7, status: "open" }] }, 7, on).ok && shipped.join() === "7", "a closed deal ships at once in study mode");
const orders = { orders: [{ id: 1, who: "ashby", status: "delivered" }, { id: 2, who: "ashby", status: "open" }, { id: 3, who: "hobb", status: "open" }] };
ok(Mode.openOrderFor(orders, "ashby").id === 2 && Mode.openOrderFor(orders, "tomas") === null, "the ship op finds the buyer's open order");
ok(Mode.hiddenUi(Mode.OFF).length === 0 && Mode.hiddenUi(on).includes("menu") && Mode.hiddenUi(on).includes("saves"), "menus and saves are hidden in study mode only");
ok(Mode.allowSave(Mode.OFF) === true && Mode.allowSave(on) === false, "saves are dropped in study mode only");
let declined = 0; Mode.declineNotices({}, Mode.OFF, () => declined++); ok(declined === 0, "notices are not declined in the full game");
Mode.declineNotices({}, on, () => declined++); ok(declined === 1, "notices are declined in study mode");

// 6b. The real engine: the ship op finds a real open order and ships it; a bad id fails loudly
{
  const S = require("../core/engine.js"); const s = S.newGame({ story: true, seed: 11 }); s.quiet = true;
  while (s.day < 11 && !s.over) S.sleep(s);
  const off = s.offers.find(o => o.who === "ashby" && o.deposit) || null; // quiet holds offers back, so make one by hand
  const o = { id: "t1", who: "ashby", status: "open", sacks: 1, price: 7, terms: 0, due: 99 };
  s.orders.push(o); s.sacks = Math.max(s.sacks, 5);
  ok(off === null && Mode.openOrderFor(s, "ashby") === o, "the ship op finds the real open order");
  const cash0 = s.bal.cash; Mode.autoShip(S, s, "t1", on);
  ok(o.status === "delivered" && s.bal.cash === cash0 + 7 && s.sacks >= 4, "auto-ship delivers through the real engine");
  throws(() => Mode.autoShip(S, s, "t1", on), /no open order/, "shipping the same order twice is an error");
  throws(() => Mode.autoShip(S, s, "nope", on), /no open order/, "an unknown order id is an error");
}
// 6c. Select edge cases
throws(() => Sel.select([{ verb: "a" }], { insertAfter: { match: {}, from: { record: "r" } } }, { r: { steps: [{ verb: "x" }] } }), /match not found/, "an empty matcher matches nothing");
const un = Sel.select([{ verb: "haggle", args: { open: 6 } }, { verb: "other", args: { a: 1 } }], { haggle: { rounds: 2 } });
ok(un[1].args.rounds === undefined && un[0].args.rounds === 2, "haggle rounds touches haggle steps only");
// 7. The 90-second frame (B11)
const routeFile = path.join(__dirname, "..", "..", "study-route.json");
const frameIn = { seconds: 90, steps: [{ verb: "ch1Open" }, { speak: "crane", text: "x" }, { tell: "a" }, { tell: "b" }, { page: 0, lines: 3 }] };
const fr = Sel.frameSteps(frameIn);
ok(fr.seconds === 90 && fr.farmName === "Thornfield" && fr.steps.find(s => s.page !== undefined).lines === 1 && frameIn.steps[4].lines === 3, "the frame is 90 s, names the farm Thornfield, shows one page line, and leaves the input alone");
ok(Route.FRAME_MS === 90000, "the runner's frame length is 90 seconds");
let t = 0; const r = Route.create({ route: { route: [{ id: "frame", kind: "frame" }, { id: "x", kind: "lesson", record: "ch1" }] }, known: { records: ["ch1"] }, now: () => t }); r.start();
t = 89999; ok(r.tick() === "playing" && r.current().id === "frame", "the frame holds at 89.999 s");
t = 90000; r.tick(); ok(r.current().id === "x", "the frame ends at 90 s with no input");
if (fs.existsSync(routeFile)) {
  const real = JSON.parse(fs.readFileSync(routeFile, "utf8")), f = real.route.find(s => s.kind === "frame");
  ok(f.seconds === 90 && Sel.frameSteps(f, real.engine.farmName).farmName === "Thornfield", "study-route.json frame is 90 s with the fixed farm name");
  const bet = real.route.find(s => s.id === "s4-bet");
  ok(Sel.overrideVerbs([{ verb: "ch4bBet", args: {} }], bet.verbs)[0].args.reveal === "now", "the route's s4-bet override sets reveal now");
} else console.log("skip route-file checks: study-route.json is not beside the repo");

console.log(fail ? "\n" + fail + " FAILED" : "\nall passed");
process.exit(fail ? 1 : 0);
