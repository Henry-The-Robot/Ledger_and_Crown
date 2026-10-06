// A 10-second sample cutscene, all data (no draw code): the model a chapter copies. Played by tests/test-cutscene.js; not loaded by the game.
(function () {
  const SAMPLE = { id: "sample", label: "Sample cutscene", w: 320, h: 180,
    shots: [
      { name: "Dusk over the gate", dur: 5, mood: "night", cues: [[0.3, "bell"], [3.0, "whoosh"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 110, c: "#2c3a66" }, { op: "rect", x: 0, y: 110, w: 320, h: 70, c: "#1c2a24" },
        { op: "oval", x: 40, y: 50, rx: 9, ry: 9, c: "#f4ead0", slide: { dx: 200, dy: -20, over: [0.5, 4.5] } },
        { op: "text", s: "Day 12", x: 160, y: 150, size: 14, c: "#f4d35e", align: "center", at: [1, 5], fadeIn: 0.8 }] },
      { name: "The stranger", dur: 5, mood: "crane", cues: [[0.5, "step"], [1.5, "step"], [3.5, "chime"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#14161c" }, { op: "rect", x: 150, y: 70, w: 20, h: 60, c: "#5a5a66", slide: { dx: -60, over: [0, 3] } },
        { op: "text", s: "Corvin Vane", x: 160, y: 40, size: 12, c: "#f1e3bf", align: "center", at: [2, 5], fadeIn: 0.6 }] },
    ],
    lines: [
      { id: "s01", shot: 0, at: 1.0, dur: 3.6, who: "Narrator", dir: "plain", text: "Day twelve. The gate stands open." },
      { id: "s02", shot: 1, at: 6.0, dur: 3.6, who: "Maud", dir: "dry", text: "That is Vane. Count everything he says." },
    ] };
  if (typeof window !== "undefined" && window.Cutscene) window.Cutscene.register(SAMPLE);
  if (typeof module !== "undefined" && module.exports) module.exports = SAMPLE;
})();
