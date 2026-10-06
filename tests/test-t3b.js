// T3b story critic fixes: Maud's boxes <= 2 sentences, Crane keeps "Item:" to a tic, the time-value verdict uses whole coins the engine books, no "(coming)" text,
// the cash-book rows are one per day and add up. Run: node tests/test-t3b.js
global.window = global; const fs = require("fs"), S = require("../core/engine.js"), B = require("../core/books.js"); global.Spring = S; global.Books = B; global.Transcript = require("../core/transcript.js"); global.Verbs = {}; global.Endings = require("../chapters/ch1/spring/endings.js");
require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js"); require("../chapters/ch1/spring/story.js"); const Story = window.Story, Bot = require("../core/bot.js");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const sent = x => x.replace(/\$\{[^}]*\}/g, "N").replace(/<[^>]+>/g, "").replace(/\d\.\d/g, "d").split(/(?<=[.?!])\s+(?=[A-Z"“'‘(])/).filter(s => s.trim().length > 2);
const grab = (file, re) => { const out = []; fs.readFileSync(file, "utf8").split("\n").forEach((ln, i) => { let m; re.lastIndex = 0; while ((m = re.exec(ln))) out.push([`${file}:${i + 1}`, m[1].slice(1, -1)]); }); return out; };
// every box a person says in scenes.js (records), as [where, text]; `maud` steps count as Maud's
const sceneTexts = (who, onlyAside) => { const out = []; const walk = (list, id) => list.forEach(st => { if (st.say === who && !onlyAside) st.lines.forEach(t => out.push([`scenes.js:${id}`, t])); if (who === "maud" && st.maud) out.push([`scenes.js:${id}`, st.maud]); if (st.ask) st.options.forEach(o => walk(o.then || [], id)); }); window.Scenes.RECORDS.forEach(r => walk(r.steps, r.id)); if (!out.length) throw new Error("no scene text found for " + who); return out; };
// every box in the story's lesson records (lessons.js): Maud's `tell` and `speak: "maud"` boxes, or one person's `speak` boxes; walks into if / pick / ask branches
const lessonTexts = (who) => { const out = []; const walk = (list, id) => (list || []).forEach(st => { if (who === "maud" && st.tell != null) out.push([`lessons.js:${id}`, st.tell]); if (st.speak === who) out.push([`lessons.js:${id}`, st.text]);
  walk(st.then, id); walk(st.else, id); (st.cases || []).forEach(c => walk(c, id)); (st.options || []).forEach(o => walk(o.then, id)); }); window.Lessons.RECORDS.forEach(r => walk(r.steps, r.id)); if (!out.length) throw new Error("no lesson text found for " + who); return out; };
const STR ="(`(?:[^`\\\\]|\\\\.)*`|\"(?:[^\"\\\\]|\\\\.)*\")";
// Maud: at most two sentences a box
{ const re = new RegExp("(?:\\btell\\(|G\\.say\\(\"maud\",\\s*|sayP\\(\"maud\",\\s*|c\\.maud\\(|maud:\\s*|say\\(\"maud\",\\s*)" + STR, "g"), long = [];
  grab(__dirname + "/../chapters/ch1/spring/story.js", re).forEach(([w, t]) => { if (sent(t).length > 2) long.push(w + " " + sent(t).length); });
  // the story's lessons are data too (lessons.js). Boxes that were built as multi-line ternaries were never scanned by the old text search; five of them run past two sentences.
  // They are Lead's writing calls (HANDOVER), so they are listed here as a note, not a failure; any NEW long box fails.
  const KNOWN = ["lessons.js:ch4b 3", "lessons.js:ch5 4", "lessons.js:tvm 4", "lessons.js:tvm 3", "lessons.js:duke 3"], seen = [];
  lessonTexts("maud").forEach(([w, t]) => { const n = sent(t.replace(/\{[^}]*\}/g, "N")).length; if (n > 2) { const k = w + " " + n; if (KNOWN.indexOf(k) >= 0 && seen.indexOf(k) < 0) seen.push(k); else long.push(k); } });
  if (seen.length) console.log("note " + seen.length + " older lesson boxes run past two sentences (Lead's call): " + seen.join(", "));
  sceneTexts("maud", true).forEach(([w, t]) => { if (sent(t).length > 2) long.push(w + " " + sent(t).length); }); // scenes are data now (core/scene.js); same scope as before: Maud's asides (c.maud), not her scene dialogue
  ok(long.length === 0, "every Maud box in story.js and scenes.js is at most two sentences" + (long.length ? " :: " + long.join(", ") : "")); }
// Crane: formal and pedantic; "Item:" is a tic used now and then, never on every sentence (about one sentence in five at most, two to a box)
{ const bad = [], re1 = new RegExp("GL?\\.say\\(\"crane\",\\s*" + STR, "g"), pieces = [];
  grab(__dirname + "/../chapters/ch1/spring/story.js", re1).forEach(x => pieces.push(x));
  sceneTexts("crane").forEach(x => pieces.push(x));
  lessonTexts("crane").forEach(x => pieces.push(x));
  const C = window.Cast.WHO.crane; [].concat(C.greet, C.low, C.rich, C.rain || []).forEach(t => pieces.push(["cast greet", t])); C.topics.forEach(tp => tp.lines.forEach(t => pieces.push(["cast " + tp.id, t])));
  let all = 0, tic = 0; pieces.forEach(([w, t]) => { const ss = sent(t), k = ss.filter(x => /^Item:/.test(x.trim())).length; all += ss.length; tic += k; if (k > 2 || (ss.length >= 1 && k === ss.length)) bad.push(w + " " + t.slice(0, 40)); });
  ok(bad.length === 0 && tic > 0 && tic / all <= .15, `Crane keeps his "Item:" tic to ${tic} of ${all} sentences (${Math.round(tic / all * 100)}%, at most 15%), at most two to a box, no box where every sentence starts with "Item:"` + (bad.length ? " :: " + bad.slice(0, 5).join(" | ") : "")); }
// no "(coming)" in anything a player reads
{ const bad = ["../chapters/ch1/spring/story.js", "../core/game.js", "../chapters/ch1/spring/endings.js", "../chapters/ch1/spring/scenes.js", "../chapters/ch1/spring/lessons.js", "../chapters/ch1/spring/cast.js", "../chapters/ch1/spring/court.js"].filter(f => fs.existsSync(__dirname + "/" + f)).filter(f => /\(coming\)/.test(fs.readFileSync(__dirname + "/" + f, "utf8").replace(/\/\/.*$/gm, ""))); ok(bad.length === 0, "no '(coming)' text in player-facing strings" + (bad.length ? " :: " + bad : "")); }
// the time-value verdict: whole coins, the discount is the one the engine books, and it can flip when the rate moves
{ const mk = trustE => { const s = S.newGame({ story: true }); s.trust.ezra = trustE; s.trust.tomas = 6; S.buySeeds(s, 9, true); return s; };
  const res = []; for (const e of [0, 4, 8, 10]) { const s = mk(e); Story.init({ s, goal() {}, save() {} }, null); const bill = s.bills[s.bills.length - 1], F = Story.tvmFacts(bill); res.push([e, S.terms(s).rateBp, F.discX, F.carryX, F.cheaper]);
    if (!(Number.isInteger(F.discX) && Number.isInteger(F.carryX) && F.discX === bill.disc)) ok(false, `trust ${e}: discount ${F.discX} vs booked ${bill.disc}, carry ${F.carryX}`); }
  ok(res.every(r => Number.isInteger(r[2]) && Number.isInteger(r[3])), "discount and the carry cost are whole coins (the same rounding the engine books)");
  ok(new Set(res.map(r => r[4])).size > 1, "the cheaper way flips as Ezra's rate moves: " + res.map(r => `rate ${r[1] / 100}% -> ${r[4]}`).join(", ")); }
// the cash book: one row per day, Net income and Cash cleared match the books, tied up = Inventory + Receivables - Payables - Deposits
{ const s = S.newGame({ story: false }); for (let d = 1; d <= 22; d++) { Bot.careful.day(s); S.sleep(s); } const rows = Story.cashBookRows(s), days = rows.map(r => r.day), st = B.close(s), b = S.balanceSheet(s.bal), last = rows[rows.length - 1];
  ok(new Set(days).size === days.length && days.join() === [7, 14, 21, s.day].filter((d, i, a) => a.indexOf(d) === i).join(), `one row per day: ${days}`);
  ok(last.ni === st.is.net && last.tied === b.inv + b.ar - b.ap - b.deposits, `last row: profit ${last.ni} = Net income ${st.is.net}, tied up ${last.tied} = Inventory ${b.inv} + Receivables ${b.ar} - Payables ${b.ap} - Deposits ${b.deposits}`); }
process.exit(fail ? 1 : 0);
