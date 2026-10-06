// Cutscene "only-my-name" (S5): day 21, Ashby tells how Edric stood surety. Data only (core/cutscene.js). 20 s. Played before Ashby's guarantee scene (scenes.js).
(function () {
  const DEF = { id: "only-my-name", label: "It's only my name", w: 320, h: 180,
    shots: [
      { name: "The bakery", dur: 10, mood: "town", cues: [[0.4, "page"], [3.0, "step"], [4.0, "step"], [8.0, "knock"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#3a2a22" }, { op: "rect", x: 0, y: 130, w: 320, h: 50, c: "#2a1d18" }, { op: "rect", x: 200, y: 50, w: 90, h: 80, c: "#5a2a2a" }, { op: "oval", x: 245, y: 100, rx: 26, ry: 20, c: "#f4a23a" }, { op: "oval", x: 245, y: 104, rx: 14, ry: 10, c: "#f4d35e" },
        { op: "oval", x: 70, y: 124, rx: 14, ry: 6, c: "#c98a4a" }, { op: "oval", x: 100, y: 126, rx: 14, ry: 6, c: "#d99a5a" }, { op: "rect", x: 40, y: 130, w: 100, h: 6, c: "#6b4526" },
        { op: "sprite", name: "people.ashby.down.0", x: 150, y: 76, k: 4, at: [0.5, 10], fadeIn: 1 }] },
      { name: "The signature", dur: 10, mood: "night", cues: [[1.5, "page"], [4.0, "stamp"]], layers: [
        { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#14161c" }, { op: "rect", x: 40, y: 110, w: 240, h: 20, c: "#4a2c14" }, { op: "rect", x: 100, y: 70, w: 120, h: 46, c: "#f1e3bf" },
        { op: "rect", x: 112, y: 82, w: 90, h: 1, c: "#b8a070" }, { op: "rect", x: 112, y: 92, w: 70, h: 1, c: "#b8a070" }, { op: "rect", x: 112, y: 102, w: 80, h: 2, c: "#241810", slide: { dx: 18, over: [2, 4] }, at: [2, 10] },
        { op: "text", s: "It's only my name.", x: 160, y: 40, size: 12, c: "#f1e3bf", align: "center", at: [4.5, 10], fadeIn: 1 }] },
    ],
    lines: [
      { id: "on01", shot: 0, at: 1.0, dur: 5.0, who: "Ashby", dir: "quiet, her ring in her fist", text: "He didn't say a word. He walked to the table and signed." },
      { id: "on02", shot: 0, at: 6.2, dur: 3.6, who: "Ashby", dir: "a small, tired smile", text: "“It costs nothing, Ashby.”" },
      { id: "on03", shot: 1, at: 11.0, dur: 5.5, who: "Narrator", dir: "low, plain", text: "A guarantee is a debt that waits for someone else to fail." },
    ] };
  if (typeof window !== "undefined" && window.Cutscene) window.Cutscene.register(DEF);
  if (typeof module !== "undefined" && module.exports) module.exports = DEF;
})();
