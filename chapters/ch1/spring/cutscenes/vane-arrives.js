// Cutscene "vane-arrives" (S5): day 12, Corvin Vane comes to the well. Data only (core/cutscene.js). 18 s. Played before the steward's scene (story.js).
(function () {
  const DEF = { id: "vane-arrives", label: "Corvin Vane arrives", w: 320, h: 180,
    shots: [
      { name: "The well at noon", dur: 9, mood: "farm", cues: [[0.3, "bell"], [3.5, "step"], [4.4, "step"], [5.3, "step"], [7.5, "whoosh"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 110, c: "#8fc4e8" }, { op: "oval", x: 250, y: 30, rx: 12, ry: 12, c: "#fbe8b0" }, { op: "rect", x: 0, y: 110, w: 320, h: 70, c: "#5a8a4a" }, { op: "rect", x: 0, y: 150, w: 320, h: 16, c: "#a68a5a" },
        { op: "rect", x: 130, y: 98, w: 40, h: 34, c: "#8d949b" }, { op: "rect", x: 130, y: 122, w: 40, h: 10, c: "#6f757b" }, { op: "rect", x: 126, y: 82, w: 4, h: 20, c: "#5a3a22" }, { op: "rect", x: 170, y: 82, w: 4, h: 20, c: "#5a3a22" }, { op: "rect", x: 122, y: 78, w: 56, h: 6, c: "#6b4526" },
        { op: "rect", x: 360, y: 82, w: 26, h: 60, c: "#5a5a66", slide: { dx: -170, over: [2.5, 6.5] } }, { op: "oval", x: 373, y: 76, rx: 8, ry: 9, c: "#3a3040", slide: { dx: -170, over: [2.5, 6.5] } },
        { op: "text", s: "Day 12", x: 160, y: 24, size: 14, c: "#1f2a1a", align: "center", at: [0.5, 9], fadeIn: 0.8 }] },
      { name: "The smile", dur: 9, mood: "crane", cues: [[1.0, "chime"], [5.0, "stamp"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#14161c" }, { op: "oval", x: 160, y: 90, rx: 44, ry: 52, c: "#d8c2a8", at: [0, 9], fadeIn: 1.2 }, { op: "rect", x: 130, y: 36, w: 60, h: 24, c: "#5a5a66" },
        { op: "rect", x: 140, y: 84, w: 8, h: 4, c: "#241a14", at: [1, 9] }, { op: "rect", x: 172, y: 84, w: 8, h: 4, c: "#241a14", at: [1, 9] },
        { op: "rect", x: 138, y: 112, w: 44, h: 3, c: "#f4ead0", at: [2, 9], fadeIn: 0.6 }, { op: "rect", x: 132, y: 108, w: 6, h: 3, c: "#f4ead0", at: [2, 9], fadeIn: 0.6 }, { op: "rect", x: 182, y: 108, w: 6, h: 3, c: "#f4ead0", at: [2, 9], fadeIn: 0.6 },
        { op: "rect", x: 60, y: 140, w: 28, h: 18, c: "#1c1c22", at: [3, 9], fadeIn: 0.5 }, { op: "rect", x: 232, y: 140, w: 28, h: 18, c: "#1c1c22", at: [3, 9], fadeIn: 0.5 }] },
    ],
    lines: [
      { id: "va01", shot: 0, at: 1.0, dur: 5.5, who: "Narrator", dir: "dry, a little wary", text: "Day twelve. A stranger waits at the well, gloves on a warm day." },
      { id: "va02", shot: 1, at: 10.0, dur: 4.5, who: "Corvin Vane", dir: "velvet, patient, faintly amused", text: "Opportunity, heir. It does not knock twice." },
      { id: "va03", shot: 1, at: 15.0, dur: 3.0, who: "Maud", dir: "dry, exact", text: "Smile all you like. I count numbers." },
    ] };
  if (typeof window !== "undefined" && window.Cutscene) window.Cutscene.register(DEF);
  if (typeof module !== "undefined" && module.exports) module.exports = DEF;
})();
