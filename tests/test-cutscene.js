// P7: the cutscene engine and the opening as data. The opening's timings and sound cues are pinned to the values it had before the engine moved to core/cutscene.js.
// Run: node tests/test-cutscene.js
global.window = global; const C = require("../core/cutscene.js"); require("../core/intro.js"); const I = window.Intro; const SAMPLE = require("../core/cutscene-sample.js");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const near = (a, b) => Math.abs(a - b) < 1e-9;
// the opening: shot starts and total, hand-added from the shot lengths 12.6 + 13.6 + 13.0 + 12.2 + 14.4 + 8.6 (the old file's values)
{ const tl = C.timeline(I.DEF), want = [0, 12.6, 26.2, 39.2, 51.4, 65.8];
  ok(want.every((w, i) => near(tl.starts[i], w)) && near(tl.total, 74.4) && near(I.TOTAL, 74.4), "opening: shot starts " + tl.starts.map(x => +x.toFixed(1)).join(", ") + " and total 74.4 s are unchanged"); }
{ const fired = C.cuesUpTo(I.DEF, 74.4).map(x => x[1]).join(","), want = "bell,whoosh,knock," + "page,page,coin,coin,coin,coin,coin,thud," + "knock,step,step,step,page,stamp,stamp," + "whoosh,step,step,stamp,stamp,stamp,chime," + "morning,step,step,step,step,step,chime," + "win,coin";
  ok(fired === want, "opening: all 34 sound cues fire in the old order"); }
{ const at = t => C.cuesUpTo(I.DEF, t).length; ok(at(0.19) === 0 && at(0.21) === 1 && at(9.1) === 3 && at(13.01) === 4 && at(26.1) === 11, "opening: cue counts at 0.19 s (0), 0.21 s (1), 9.1 s (3), 13.01 s (4) and 26.1 s (11, the end of shot 2)"); }
ok(C.validate(I.DEF).length === 0, "opening passes validate: " + C.validate(I.DEF).join("; "));
ok(C.manifest(I.DEF).length === 11 && I.manifest().length === 11 && I.manifest()[0].file === "i01.mp3", "opening: the voice manifest still lists 11 lines");
// the sample: 10 seconds, data only
{ const tl = C.timeline(SAMPLE); ok(near(tl.total, 10) && SAMPLE.shots.every(s => !s.draw && s.layers.length), "sample: 10 seconds, every shot is layers (data), no draw code"); ok(C.validate(SAMPLE).length === 0, "sample passes validate: " + C.validate(SAMPLE).join("; "));
  ok(C.cuesUpTo(SAMPLE, 5.4).map(x => x[1]).join() === "bell,whoosh" && C.cuesUpTo(SAMPLE, 5.6).map(x => x[1]).join() === "bell,whoosh,step" && C.cuesUpTo(SAMPLE, 10).length === 5, "sample: cues fire by hand count (2 by 5.4 s, 3 by 5.6 s, 5 in all)"); ok(C.get("sample") === SAMPLE, "a cutscene registers itself by id"); }
// validate catches broken data
{ const bad = JSON.parse(JSON.stringify({ id: "b", w: 1, h: 1, shots: [{ name: "x", dur: 2, mood: "m", cues: [[3, "bell"]], layers: [{ op: "nope" }] }], lines: [{ id: "a", shot: 0, at: 0, dur: 1, who: "w", text: "t" }, { id: "a", shot: 4, at: 0, dur: 1, who: "w", text: "t" }] }));
  const v = C.validate(bad).join("|"); ok(/cue bell outside/.test(v) && /unknown op nope/.test(v) && /duplicate line id a/.test(v) && /no such shot/.test(v), "validate: a cue outside its shot, an unknown op, a duplicate line id and a missing shot are all found"); }
// a fake canvas: a data layer draws at the right time with the right fade and slide
{ const log = []; const g = { fillRect: (...a) => log.push(["rect", g.fillStyle, g.globalAlpha, ...a]), beginPath() {}, ellipse: (...a) => log.push(["oval", ...a.slice(0, 2)]), fill() {}, save() {}, restore() {}, fillText: (s, x, y) => log.push(["text", s, g.globalAlpha, x, y]), set imageSmoothingEnabled(v) {} };
  global.document = { createElement: () => ({ setAttribute() {}, classList: { add() {}, remove() {} }, remove() {}, querySelector: s => s === "#in-cv" ? { getContext: () => g } : s === "#in-go" ? null : { classList: { add() {}, remove() {} }, style: {}, onclick: null, remove() {} }, appendChild() {} }), body: { appendChild() {}, classList: { add() {}, remove() {} } }, addEventListener() {}, removeEventListener() {}, getElementById: () => null };
  global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {}; global.performance = { now: () => 0 }; global.setTimeout = f => 0;
  C.play(SAMPLE, { hold: true }); log.length = 0; C.frame(SAMPLE, 3.0); // shot 0 at 3.0 s: the moon has slid, "Day 12" is fully faded in (1 to 1.8 s)
  const moon = log.find(l => l[0] === "oval"), txt = log.find(l => l[0] === "text"); const k = (t => t * t * (3 - 2 * t))((3.0 - 0.5) / 4), mx = 40 + 200 * k;
  ok(near(moon[1], mx) && txt[1] === "Day 12" && txt[2] === 1, `data layers: the moon is at x ${mx.toFixed(2)} (eased slide) and the text is fully faded in`);
  log.length = 0; C.frame(SAMPLE, 0.5); ok(!log.some(l => l[0] === "text"), "data layers: a text with an `at` window is hidden before its time");
  log.length = 0; C.frame(SAMPLE, 1.4); const half = log.find(l => l[0] === "text"); ok(half && half[2] > 0 && half[2] < 1, "data layers: fadeIn gives a partial alpha mid-fade (" + (half && half[2].toFixed(2)) + ")");
  ok(C.state && C.state.t === 0 && C.active, "play: the cutscene is active and holds at t=0 when asked"); C.end("skipped"); ok(!C.active && C.state === null, "end: skipping stops the cutscene"); }
process.exit(fail ? 1 : 0);
