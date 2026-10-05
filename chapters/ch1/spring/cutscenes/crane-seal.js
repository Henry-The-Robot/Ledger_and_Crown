// Cutscene "crane-seal" (S5): Crane reads the second seal (day 23). Data only (core/cutscene.js). 19 s. Played before Crane's seal scene (scenes.js).
(function () {
  const DEF = { id: "crane-seal", label: "Crane reads the seal", w: 320, h: 180,
    shots: [
      { name: "The study", dur: 9, mood: "crane", cues: [[0.5, "page"], [3.5, "page"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#14161c" }, { op: "rect", x: 0, y: 124, w: 320, h: 56, c: "#1a1612" }, { op: "oval", x: 230, y: 70, rx: 50, ry: 50, c: "#3a2a12", at: [0, 9] }, { op: "oval", x: 230, y: 74, rx: 6, ry: 9, c: "#f4d35e" },
        { op: "rect", x: 60, y: 112, w: 150, h: 14, c: "#4a2c14" }, { op: "rect", x: 90, y: 96, w: 70, h: 18, c: "#f1e3bf", at: [0.5, 9], fadeIn: 1 },
        { op: "sprite", name: "people.crane.down.0", x: 150, y: 56, k: 4, at: [0.3, 9], fadeIn: 0.8 }] },
      { name: "The second seal", dur: 10, mood: "tense", cues: [[1.0, "stamp"], [5.5, "chime"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#1a1612" }, { op: "oval", x: 130, y: 90, rx: 40, ry: 40, c: "#9b2335" }, { op: "oval", x: 130, y: 90, rx: 28, ry: 28, c: "#c43a4a" }, { op: "text", s: "C", x: 130, y: 100, size: 26, c: "#f1e3bf", align: "center" },
        { op: "oval", x: 200, y: 112, rx: 12, ry: 12, c: "#7a1a2a", at: [1.5, 10], fadeIn: 0.8 }, { op: "rect", x: 192, y: 110, w: 16, h: 2, c: "#241018", at: [1.5, 10] }, { op: "rect", x: 199, y: 103, w: 2, h: 16, c: "#241018", at: [1.5, 10] },
        { op: "text", s: "V", x: 200, y: 118, size: 14, c: "#f4d35e", align: "center", at: [5.5, 10], fadeIn: 0.8 }] },
    ],
    lines: [
      { id: "cs01", shot: 0, at: 1.0, dur: 6.5, who: "Crane", dir: "formal, uneasy, pen-less", text: "I made a copy I should not have made. The second seal is small." },
      { id: "cs02", shot: 1, at: 10.0, dur: 6.0, who: "Crane", dir: "precise, quiet", text: "Item: a note-buyer's mark. It is Corvin Vane's." },
      { id: "cs03", shot: 1, at: 16.5, dur: 2.4, who: "Maud", dir: "flat, then angry underneath", text: "So the Crown sold us." },
    ] };
  if (typeof window !== "undefined" && window.Cutscene) window.Cutscene.register(DEF);
  if (typeof module !== "undefined" && module.exports) module.exports = DEF;
})();
