// S5: Spring's cutscenes (chapters/ch1/spring/cutscenes/): ids, lengths, data validity, writing rules, and where each one is played. Run: node tests/test-cutscenes-spring.js
global.window = global; const fs = require("fs"), path = require("path"), C = require("../core/cutscene.js");
const DIR = path.join(__dirname, "../chapters/ch1/spring/cutscenes"), LIST = require(DIR + "/index.js");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const defs = []; for (const f of fs.readdirSync(DIR).filter(f => f !== "index.js" && f.endsWith(".js"))) { const d = require(path.join(DIR, f)); (Array.isArray(d) ? d : [d]).forEach(x => defs.push([f, x])); }
ok(defs.length === 8 && LIST.length === 8 && LIST.every(x => defs.some(([f, d]) => d.id === x.id && f === x.file)), "8 cutscenes (the five, three Market Day weeks counted as one, and the short opening), each listed in index.js with its file: " + defs.map(x => x[1].id).join(", "));
ok(new Set(defs.map(x => x[1].id)).size === defs.length && defs.every(([, d]) => /^[a-z]+(-[a-z0-9]+)+$/.test(d.id)), "ids are unique and stable (lower-case words joined by hyphens)");
for (const [f, d] of defs) { const bad = C.validate(d); ok(bad.length === 0, `${d.id}: valid data${bad.length ? " :: " + bad.join("; ") : ""}`); }
{ const long = defs.filter(([, d]) => C.timeline(d).total > (d.id === "spring-opening" ? 8 : 25)).map(x => x[1].id); ok(long.length === 0, "each cutscene is at most 25 s, the short opening at most 8 s" + (long.length ? " :: " + long : "")); }
{ const lens = defs.map(([, d]) => d.id + " " + C.timeline(d).total); console.log("     lengths (s): " + lens.join(", ")); }
{ const sent = x => x.split(/(?<=[.?!”])\s+(?=[A-Z"“'])/).filter(Boolean).length, bad = []; defs.forEach(([, d]) => d.lines.forEach(l => { if (sent(l.text) > 2 || l.text.length > 110 || l.text.length / l.dur > 21 || !l.dir) bad.push(l.id); }));
  ok(bad.length === 0, "every line is at most two sentences and 110 characters, reads at 21 characters a second or less, and has a delivery note" + (bad.length ? " :: " + bad : "")); }
{ const voices = new Set(defs.flatMap(([, d]) => d.lines.map(l => l.who))), allowed = ["Narrator", "Maud", "Crane", "Ashby", "Tomas", "Grisby", "Corvin Vane"]; ok([...voices].every(v => allowed.indexOf(v) >= 0), "every speaker is a story-bible character: " + [...voices].join(", ")); }
{ const crane = defs.flatMap(([, d]) => d.lines.filter(l => l.who === "Crane")), items = crane.filter(l => /^Item:/.test(l.text)).length; ok(crane.length >= 2 && items <= 1, `Crane keeps "Item:" to a tic (${items} of ${crane.length} lines)`); }
ok(defs.every(([, d]) => d.shots.every(s => s.layers && !s.draw && s.cues.length >= 1)), "every shot is layers (data), with at least one sound cue; no draw code");
// every cutscene is reachable: named in the code that plays it
const read = f => fs.readFileSync(path.join(__dirname, "..", f), "utf8");
{ const story = read("chapters/ch1/spring/story.js"), scenes = read("chapters/ch1/spring/scenes.js"), market = read("core/market.js"), game = read("core/game.js");
  ok(story.includes('cut("vane-arrives")') && story.includes('cut("pigs-night")') && /eventDay\(G\.s, "pigs"\) \+ 1/.test(story), "story.js plays vane-arrives after Corvin arrives and pigs-night on the morning after the pigs' event");
  ok(/ashby_guarantee[^\n]*cutscene: "only-my-name"/.test(scenes) && /crane_seal[^\n]*cutscene: "crane-seal"/.test(scenes) && game.includes("Story.cut(sc.cutscene)"), "the Ashby guarantee and Crane seal scenes name their cutscene, and runScene plays it first");
  ok(market.includes('Cutscene.maybe("market-open-" + Math.min(3, Math.ceil(s.day / 7))') , "Market Day opens with market-open-1, -2 or -3 by week (days 7, 14, 21)");
  ok(read("game.html").split("cutscenes/").length - 1 === 7, "game.html loads the seven cutscene files"); }
// the Market Day variants really differ by week, and the speaker for week 2 is the rival
{ const m = defs.filter(([, d]) => /^market-open-/.test(d.id)).map(x => x[1]); ok(m.length === 3 && new Set(m.map(d => d.lines[0].text)).size === 3 && m[1].lines[0].who === "Grisby", "the three Market Day openings say three different things; week 2 is Grisby"); }
// playing by id: unknown ids and unwanted runs never block
{ ok(C.maybe("vane-arrives") === null, "Cutscene.maybe answers null when no document exists (a test run), so a caller carries on at once"); const q = s => new URLSearchParams(s); ok(!C.wanted(q("?fast=1")) && !C.wanted(q("?sandbox")) && !C.wanted(q("?cuts=0")) && !C.wanted(q("?savetest=1")) && !C.wanted(q("?intro=0")) && C.wanted(q("")) && C.wanted(q("?new=1")), "story cutscenes are skipped for ?fast, ?sandbox, ?savetest, ?intro=0 and ?cuts=0 and wanted otherwise"); }
process.exit(fail ? 1 : 0);
