// Cutscene "pigs-night" (S5): the night the pigs got in. Neutral about the outcome: the Ledger's note says whether the fence held. Data only (core/cutscene.js). 16 s.
(function () {
  const rows = [], pigs = [];
  for (let i = 0; i < 6; i++) rows.push({ op: "rect", x: 40, y: 104 + i * 9, w: 240, h: 5, c: "#2f6f3a" });
  for (let i = 0; i < 3; i++) pigs.push({ op: "oval", x: -20 - i * 30, y: 112 + i * 16, rx: 9, ry: 6, c: "#e8a0a8", slide: { dx: 200 + i * 40, over: [1 + i * 0.5, 7] } });
  const DEF = { id: "pigs-night", label: "The night the pigs got in", w: 320, h: 180,
    shots: [
      { name: "Loose in the dark", dur: 8, mood: "tense", cues: [[0.4, "knock"], [2.0, "step"], [3.0, "step"], [4.0, "thud"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#141c3a" }, { op: "oval", x: 260, y: 30, rx: 10, ry: 10, c: "#f4ead0" }, { op: "rect", x: 0, y: 96, w: 320, h: 84, c: "#1c2a24" }, { op: "rect", x: 30, y: 92, w: 260, h: 3, c: "#4a2c14" }].concat(rows, pigs) },
      { name: "Morning in the field", dur: 8, mood: "farm", cues: [[0.5, "morning"], [5.0, "chime"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#8fc4e8" }, { op: "rect", x: 0, y: 96, w: 320, h: 84, c: "#5a8a4a" }, { op: "rect", x: 30, y: 92, w: 260, h: 3, c: "#6b4526" }].concat(rows.map((r, i) => Object.assign({}, r, { c: "#4a7a3a", at: [0, 8] })),
        [{ op: "text", s: "Count the rows.", x: 160, y: 40, size: 12, c: "#1f2a1a", align: "center", at: [2, 8], fadeIn: 1 }]) },
    ],
    lines: [
      { id: "pn01", shot: 0, at: 1.0, dur: 5.5, who: "Narrator", dir: "low, quickening", text: "Pell's pigs got loose in the dark, heading for the field." },
      { id: "pn02", shot: 1, at: 9.0, dur: 6.5, who: "Narrator", dir: "plain, a beat of silence first", text: "By morning the field told you whether the fence was worth it." },
    ] };
  if (typeof window !== "undefined" && window.Cutscene) window.Cutscene.register(DEF);
  if (typeof module !== "undefined" && module.exports) module.exports = DEF;
})();
