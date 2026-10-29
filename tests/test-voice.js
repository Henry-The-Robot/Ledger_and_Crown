// MBA-VO1: voice ids for dialogue boxes (core/scene.js boxes() + play()), the Voice switch and queue (core/voice.js), and assets/voice/LINES-study.json.
// The browser side (a real box plays and stops) is tests/voice-lines.html. Run: node tests/test-voice.js
const fs = require("fs"), path = require("path");
global.window = global; const S = require("../core/engine.js"); global.Spring = S;
const K = require("../core/scene.js"), V = require("../core/voice.js"), L = require("../chapters/ch1/spring/lessons.js");
require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };

(async () => {
  // box ids by hand: step 0 is a run of 2 lines, step 1 a choice, whose 2nd option holds one maud box; an if (else) holds one tell
  const rec = { id: "t", steps: [{ say: "hobb", lines: ["a", "b"] }, { ask: "maud", text: "q", options: [{ label: "x", then: [] }, { label: "y", then: [{ maud: "m" }] }] }, { if: "f", then: [], else: [{ tell: "e" }] }, { calc: "c" }, { speak: "tomas", text: "s" }] };
  ok(JSON.stringify(K.boxes(rec).map(b => b.id)) === JSON.stringify(["n0-0", "n0-1", "n1", "n1-o1-n0", "n2-e-n0", "n4"]), "boxes: ids n0-0, n0-1, n1, n1-o1-n0, n2-e-n0, n4 (non-box steps count in the index)");
  ok(K.boxes(rec)[0].who === "hobb" && K.boxes(rec)[3].who === "maud" && K.boxes(rec)[4].text === "e", "boxes: speaker and raw text");
  // play() marks the same ids, in the order the player meets them
  const marks = []; window.Voice = { mark: (sc, ids) => marks.push([sc, ids]) };
  const c = { s: S.newGame(), lines: async () => {}, ask: async () => 1, maud: async () => {}, tell: async () => {}, speak: async () => 0, calc: () => ({}) };
  await K.play(rec, c, { f: 0 });
  ok(JSON.stringify(marks) === JSON.stringify([["t", ["n0-0", "n0-1"]], ["t", ["n1"]], ["t", ["n1-o1-n0"]], ["t", ["n2-e-n0"]], ["t", ["n4"]], ["t", null]]), "play: marks each run and box, takes option 1 and the else branch, clears at the end");
  delete window.Voice;

  // every id play() can mark is a box id (hobb_extension, option 0: a run of 3, the ask, then a branch)
  { const rec2 = window.Scenes.BY.hobb_extension, ids = new Set(K.boxes(rec2).map(b => b.id)), m2 = [];
    window.Voice = { mark: (sc, list) => { if (list) m2.push(...[].concat(list)); } };
    const s = S.newGame(); s.day = 14; s.invoices.push({ id: 1, who: "hobb", amount: 90, due: 20 });
    await K.play(rec2, { s, S, lines: async () => {}, ask: async () => 0, maud: async () => {}, flag() {}, trust() {}, clue() {}, letter: async () => {} });
    ok(m2.length >= 4 && m2.every(id => ids.has(id)), "play: every marked id is in boxes() (" + m2.join(",") + ")"); delete window.Voice; }

  // Voice: switch, queue, start/stop (clip faked)
  { const clips = []; const mk = () => V.create({ clip: (src) => { const x = { src, played: false, stopped: false, play() { x.played = true; }, stop() { x.stopped = true; } }; clips.push(x); return x; } });
    const v = mk(); v.setFiles(["sc/n0-0.mp3", "sc/n0-1.mp3", "sc/n7.mp3"]);
    ok(v.configure("") === false && v.configure("?study=1") === true && v.configure("?vo=1") === true && v.configure("?study=1&vo=0") === false && v.configure("?vo=0") === false, "configure: off by default; on with ?study=1 or ?vo=1; ?vo=0 wins");
    v.configure("?vo=0"); v.mark("sc", "n0"); ok(v.start() === null && clips.length === 0, "?vo=0: start() makes no clip");
    v.configure("?vo=1"); v.mark("sc", ["n0-0", "n0-1"]); const a = v.start(); ok(a === "n0-0" && clips[0].src === "assets/voice/sc/n0-0.mp3" && clips[0].played, "a run: the first box plays sc/n0-0.mp3");
    v.start(); ok(clips[0].stopped && clips[1].src === "assets/voice/sc/n0-1.mp3", "the next box stops the one before and plays n0-1");
    ok(v.start() === null && clips[1].stopped && clips.length === 2, "a box nobody marked plays nothing and stops the last voice");
    v.mark("sc", "n9"); ok(v.start() === null && clips.length === 2, "a marked box that is not in the files list asks for nothing");
    v.mark("sc", "n5"); v.mark("sc", null); ok(v.start() === null, "mark with null clears the queue");
    v.mark("sc", "n7"); v.start(); v.stop(); ok(clips[2].stopped, "stop() stops the playing box (tap past)"); }

  // LINES-study.json: current, one entry per box, ids unique inside a scene, every route lesson/scene present
  { const file = path.join(__dirname, "..", "assets", "voice", "LINES-study.json"), have = JSON.parse(fs.readFileSync(file, "utf8")), want = require("../tools/voice-lines.js").build();
    ok(JSON.stringify(have) === JSON.stringify(want), "LINES-study.json is current (run node tools/voice-lines.js after a lesson text changes)");
    const keys = have.map(b => b.scene + "/" + b.id); ok(new Set(keys).size === keys.length && have.length > 40, "LINES-study.json: " + have.length + " boxes, ids unique per scene");
    ok(have.every(b => b.scene && b.id && b.who && typeof b.text === "string" && b.text.length), "every entry has scene, id, who and text");
    const steps = require("../tools/study-route-steps.json"); ok(steps.every(s => have.some(b => b.scene === (s.record || s.scene)) || s.record === "close"), "every route lesson and scene with boxes is in the list"); }
  { const have = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "assets", "voice", "FILES.json"), "utf8"));
    ok(JSON.stringify(have) === JSON.stringify(require("../tools/voice-lines.js").files()), "FILES.json lists the box voice files that exist (run node tools/voice-lines.js after adding files)"); }
  process.exit(fail ? 1 : 0);
})();
