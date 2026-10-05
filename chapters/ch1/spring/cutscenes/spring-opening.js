// Cutscene "spring-opening" (S5): Spring's short opening for re-entry from the main menu (the 74-second prologue stays first-launch only). Data only. 7.5 s. P14 wires the trigger.
(function () {
  const DEF = { id: "spring-opening", label: "Spring, again", w: 320, h: 180,
    shots: [{ name: "Dawn over Thornfield", dur: 7.5, mood: "farm", cues: [[0.3, "morning"], [4.5, "chime"]], layers: [
      { op: "rect", x: 0, y: 0, w: 320, h: 110, c: "#e8a058" }, { op: "rect", x: 0, y: 0, w: 320, h: 60, c: "#6aa0d8" }, { op: "oval", x: 80, y: 120, rx: 14, ry: 14, c: "#fbe8b0", slide: { dx: 120, dy: -70, over: [0.3, 6.5] } },
      { op: "rect", x: 0, y: 108, w: 320, h: 72, c: "#4a7a4a" }, { op: "rect", x: 0, y: 140, w: 320, h: 16, c: "#a68a5a" }, { op: "rect", x: 210, y: 96, w: 40, h: 26, c: "#3a2a22" }, { op: "rect", x: 206, y: 84, w: 48, h: 14, c: "#5a2a2a" },
      { op: "text", s: "Spring at Thornfield", x: 160, y: 48, size: 14, c: "#f1e3bf", align: "center", at: [1.5, 7.5], fadeIn: 1.2 }] }],
    lines: [{ id: "so01", shot: 0, at: 0.8, dur: 5.5, who: "Narrator", dir: "warm, unhurried", text: "Spring again. Read the chest, not the ledger." }] };
  if (typeof window !== "undefined" && window.Cutscene) window.Cutscene.register(DEF);
  if (typeof module !== "undefined" && module.exports) module.exports = DEF;
})();
