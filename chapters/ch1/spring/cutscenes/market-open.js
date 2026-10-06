// Cutscenes "market-open-1", "-2", "-3" (S5): Market Day opens (days 7, 14, 21), a short opening that changes by week. Data only (core/cutscene.js). 8 s each. Played by core/market.js.
(function () {
  const base = (week, tag) => [
    { op: "rect", x: 0, y: 0, w: 320, h: 180, c: "#8fc4e8" }, { op: "rect", x: 0, y: 100, w: 320, h: 80, c: "#b8a07a" }, { op: "rect", x: 20, y: 70, w: 100, h: 34, c: "#9b2335" }, { op: "rect", x: 20, y: 104, w: 100, h: 20, c: "#6b4526" },
    { op: "rect", x: 200, y: 70, w: 100, h: 34, c: tag, at: [0, 8] }, { op: "rect", x: 200, y: 104, w: 100, h: 20, c: "#6b4526" },
    { op: "text", s: "Market Day", x: 160, y: 36, size: 16, c: "#1f2a1a", align: "center", at: [0.3, 8], fadeIn: 0.8 }, { op: "text", s: "Week " + week, x: 160, y: 54, size: 10, c: "#5a3a22", align: "center", at: [1, 8], fadeIn: 0.8 }];
  const mk = (week, tag, line) => ({ id: "market-open-" + week, label: "Market Day, week " + week, w: 320, h: 180,
    shots: [{ name: "The square", dur: 8, mood: "town", cues: [[0.3, "bell"], [3.0, "coin"], [5.5, "coin"]], layers: base(week, tag) }], lines: [Object.assign({ id: "mo" + week + "1", shot: 0, at: 1.2, dur: 6 }, line)] });
  const DEFS = [
    mk(1, "#c9c2b0", { who: "Tomas", dir: "breathless, delighted", text: "Step up, step up! The best grain in the valley, and I'd say so anyway." }),
    mk(2, "#2f6f62", { who: "Grisby", dir: "smooth, a shade too friendly", text: "Fresh grain, cheaper than yours, friend." }),
    mk(3, "#2f6f62", { who: "Narrator", dir: "dry, noticing", text: "Grisby's shelves are thin today. The crowd is looking your way." }),
  ];
  if (typeof window !== "undefined" && window.Cutscene) DEFS.forEach(d => window.Cutscene.register(d));
  if (typeof module !== "undefined" && module.exports) module.exports = DEFS;
})();
